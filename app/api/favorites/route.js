// app/api/favorites/publishers/route.js
import { NextResponse } from 'next/server';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

// GET - Fetch user's favorite publishers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    ('🔍 GET Request received with userId:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Debug: Log the exact path being queried
    const publishersPath = `readers/${userId}/favoritePublishers`;
    ('📍 Querying Firestore path:', publishersPath);

    // Get user's favorite publishers from the readers collection subcollection
    const publishersRef = collection(db, 'readers', userId, 'favoritePublishers');
    ('📁 Publishers collection reference created');
    
    const publishersSnapshot = await getDocs(publishersRef);
    ('📊 Query executed, snapshot size:', publishersSnapshot.size);
    
    const publishers = [];
    publishersSnapshot.forEach((doc) => {
      ('📄 Found publisher document:', doc.id, doc.data());
      publishers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort by date added (newest first)
    publishers.sort((a, b) => {
      const dateA = a.addedAt?.toDate ? a.addedAt.toDate() : new Date(0);
      const dateB = b.addedAt?.toDate ? b.addedAt.toDate() : new Date(0);
      return dateB - dateA;
    });

    ('✅ Final result - Found', publishers.length, 'favorite publishers for user');

    return NextResponse.json({
      success: true,
      publishers,
      count: publishers.length,
      debug: {
        userId,
        queryPath: publishersPath,
        snapshotSize: publishersSnapshot.size
      }
    });

  } catch (error) {
    console.error('❌ Error fetching favorite publishers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorite publishers', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add publisher to favorites
export async function POST(request) {
  try {
    const { userId, publisher } = await request.json();

    ('📝 POST Request received:');
    ('  - userId:', userId);
    ('  - publisher:', JSON.stringify(publisher, null, 2));

    if (!userId || !publisher) {
      return NextResponse.json(
        { success: false, error: 'User ID and publisher are required' },
        { status: 400 }
      );
    }

    // Debug: Log the exact paths being used
    const userPath = `readers/${userId}`;
    const publisherPath = `readers/${userId}/favoritePublishers/${publisher.id || `publisher_${Date.now()}`}`;
    ('📍 User document path:', userPath);
    ('📍 Publisher document path:', publisherPath);

    // First, verify that the user exists in the readers collection
    const userDocRef = doc(db, 'readers', userId);
    ('🔍 Checking if user exists at:', userDocRef.path);
    
    const userDocSnap = await getDoc(userDocRef);
    ('👤 User document exists:', userDocSnap.exists());
    
    if (userDocSnap.exists()) {
      ('👤 User document data:', userDocSnap.data());
    }

    if (!userDocSnap.exists()) {
      console.error('❌ User not found in readers collection:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found in readers collection', userId },
        { status: 404 }
      );
    }

    // Prepare publisher favorite data
    const publisherData = {
      id: publisher.id || `publisher_${Date.now()}`,
      name: publisher.name || publisher.companyName || 'Unknown Publisher',
      companyName: publisher.companyName || publisher.name || '',
      industry: publisher.industry || '',
      publicationType: publisher.publicationType || '',
      logo: publisher.logo || publisher.companyLogo || null,
      website: publisher.website || publisher.companyWebsite || '',
      description: publisher.description || publisher.companyDescription || '',
      addedAt: serverTimestamp(),
      userId: userId,
      // Preserve any additional fields from the original publisher
      ...publisher
    };

    ('📋 Publisher data prepared:', JSON.stringify(publisherData, null, 2));

    // Check if already favorited
    const publisherRef = doc(db, 'readers', userId, 'favoritePublishers', publisherData.id);
    ('🔍 Checking if publisher already exists at:', publisherRef.path);
    
    const existingPublisher = await getDoc(publisherRef);
    ('🔍 Publisher already exists:', existingPublisher.exists());

    if (existingPublisher.exists()) {
      return NextResponse.json(
        { success: false, error: 'Publisher already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorite publishers subcollection under the specific reader
    ('💾 Saving publisher to:', publisherRef.path);
    await setDoc(publisherRef, publisherData);
    ('✅ Publisher saved successfully');

    // Verify the save
    const verifyDoc = await getDoc(publisherRef);
    ('✅ Verification - Document exists after save:', verifyDoc.exists());
    if (verifyDoc.exists()) {
      ('✅ Verification - Saved data:', verifyDoc.data());
    }

    return NextResponse.json({
      success: true,
      message: 'Publisher added to favorites',
      publisher: publisherData,
      debug: {
        userId,
        publisherPath,
        userExists: userDocSnap.exists(),
        savedSuccessfully: verifyDoc.exists()
      }
    });

  } catch (error) {
    console.error('❌ Error adding publisher to favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add publisher to favorites', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove publisher from favorites
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const publisherId = searchParams.get('publisherId');

    ('🗑️ DELETE Request received:');
    ('  - userId:', userId);
    ('  - publisherId:', publisherId);

    if (!userId || !publisherId) {
      return NextResponse.json(
        { success: false, error: 'User ID and publisher ID are required' },
        { status: 400 }
      );
    }

    // Debug: Log the exact path being deleted
    const publisherPath = `readers/${userId}/favoritePublishers/${publisherId}`;
    ('📍 Deleting from path:', publisherPath);

    // Remove from favorite publishers subcollection under the specific reader
    const publisherRef = doc(db, 'readers', userId, 'favoritePublishers', publisherId);
    ('🗑️ Deleting document at:', publisherRef.path);
    
    // Check if document exists before deleting
    const existingDoc = await getDoc(publisherRef);
    ('🔍 Document exists before deletion:', existingDoc.exists());
    
    await deleteDoc(publisherRef);
    ('✅ Delete operation completed');

    // Verify deletion
    const verifyDoc = await getDoc(publisherRef);
    ('✅ Verification - Document exists after deletion:', verifyDoc.exists());

    return NextResponse.json({
      success: true,
      message: 'Publisher removed from favorites',
      debug: {
        userId,
        publisherId,
        publisherPath,
        existedBefore: existingDoc.exists(),
        deletedSuccessfully: !verifyDoc.exists()
      }
    });

  } catch (error) {
    console.error('❌ Error removing publisher from favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove publisher from favorites', details: error.message },
      { status: 500 }
    );
  }
}