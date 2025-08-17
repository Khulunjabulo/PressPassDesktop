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

// Helper function to ensure userId has proper format
const normalizeReaderId = (userId) => {
  if (!userId) return null;
  
  // If it already starts with "reader_", use as is
  if (userId.startsWith('reader_')) {
    console.log('✅ Reader ID already properly formatted:', userId);
    return userId;
  }
  
  // If it's just the Firebase UID, add "reader_" prefix
  const readerId = `reader_${userId}`;
  console.log('🔧 Normalized reader ID from', userId, 'to', readerId);
  return readerId;
};

// GET - Fetch user's favorite publishers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('🔍 GET Request - Raw userId from request:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Normalize the reader ID
    const readerId = normalizeReaderId(userId);
    console.log('🔍 GET Request - Using normalized readerId:', readerId);

    // Get user's favorite publishers from the readers collection subcollection
    const publishersRef = collection(db, 'readers', readerId, 'favoritePublishers');
    console.log('📍 Querying path:', `readers/${readerId}/favoritePublishers`);
    
    const publishersSnapshot = await getDocs(publishersRef);
    console.log('📊 Found documents:', publishersSnapshot.size);
    
    const publishers = [];
    publishersSnapshot.forEach((doc) => {
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

    console.log('✅ Returning', publishers.length, 'favorite publishers');

    return NextResponse.json({
      success: true,
      publishers,
      count: publishers.length,
      debug: {
        originalUserId: userId,
        normalizedReaderId: readerId,
        queryPath: `readers/${readerId}/favoritePublishers`
      }
    });

  } catch (error) {
    console.error('❌ Error fetching favorite publishers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorite publishers' },
      { status: 500 }
    );
  }
}

// POST - Add publisher to favorites
export async function POST(request) {
  try {
    const { userId, publisher } = await request.json();

    console.log('📝 POST Request received:');
    console.log('  - Raw userId:', userId);
    console.log('  - Publisher name:', publisher?.name || publisher?.companyName);

    if (!userId || !publisher) {
      return NextResponse.json(
        { success: false, error: 'User ID and publisher are required' },
        { status: 400 }
      );
    }

    // Normalize the reader ID
    const readerId = normalizeReaderId(userId);
    console.log('📝 POST Request - Using normalized readerId:', readerId);

    // Check if the user document exists in the readers collection
    const userDocRef = doc(db, 'readers', readerId);
    console.log('👤 Checking reader document at:', userDocRef.path);
    
    const userDocSnap = await getDoc(userDocRef);
    console.log('👤 Reader document exists:', userDocSnap.exists());

    // If user doesn't exist, we have a problem - they should exist
    if (!userDocSnap.exists()) {
      console.error('❌ Reader document not found at:', userDocRef.path);
      console.error('❌ This reader should exist. Available readers in your database might be:');
      
      // Let's try to find similar reader documents
      const readersRef = collection(db, 'readers');
      const readersSnapshot = await getDocs(readersRef);
      const existingReaders = [];
      readersSnapshot.forEach((doc) => {
        existingReaders.push(doc.id);
      });
      console.log('📋 Existing readers in database:', existingReaders);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reader document not found',
          debug: {
            requestedReaderId: readerId,
            existingReaders: existingReaders.slice(0, 10), // First 10 for debugging
            suggestion: `Make sure the reader ${readerId} exists in the database`
          }
        },
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
      userId: readerId, // Store the normalized reader ID
      // Preserve any additional fields from the original publisher
      ...publisher
    };

    // Check if already favorited
    const publisherRef = doc(db, 'readers', readerId, 'favoritePublishers', publisherData.id);
    console.log('🔍 Checking if publisher already exists at:', publisherRef.path);
    
    const existingPublisher = await getDoc(publisherRef);

    if (existingPublisher.exists()) {
      console.log('⚠️ Publisher already in favorites');
      return NextResponse.json(
        { success: false, error: 'Publisher already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorite publishers subcollection under the specific reader
    console.log('💾 Saving publisher to:', publisherRef.path);
    await setDoc(publisherRef, publisherData);

    console.log('✅ Successfully added publisher to favorites');

    return NextResponse.json({
      success: true,
      message: 'Publisher added to favorites',
      publisher: publisherData,
      debug: {
        originalUserId: userId,
        normalizedReaderId: readerId,
        savedToPath: publisherRef.path
      }
    });

  } catch (error) {
    console.error('❌ Error adding publisher to favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add publisher to favorites' },
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

    console.log('🗑️ DELETE Request:');
    console.log('  - Raw userId:', userId);
    console.log('  - PublisherId:', publisherId);

    if (!userId || !publisherId) {
      return NextResponse.json(
        { success: false, error: 'User ID and publisher ID are required' },
        { status: 400 }
      );
    }

    // Normalize the reader ID
    const readerId = normalizeReaderId(userId);
    console.log('🗑️ DELETE Request - Using normalized readerId:', readerId);

    // Remove from favorite publishers subcollection under the specific reader
    const publisherRef = doc(db, 'readers', readerId, 'favoritePublishers', publisherId);
    console.log('🗑️ Deleting from path:', publisherRef.path);
    
    await deleteDoc(publisherRef);

    console.log('✅ Successfully removed publisher from favorites');

    return NextResponse.json({
      success: true,
      message: 'Publisher removed from favorites',
      debug: {
        originalUserId: userId,
        normalizedReaderId: readerId,
        deletedFromPath: publisherRef.path
      }
    });

  } catch (error) {
    console.error('❌ Error removing publisher from favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove publisher from favorites' },
      { status: 500 }
    );
  }
}