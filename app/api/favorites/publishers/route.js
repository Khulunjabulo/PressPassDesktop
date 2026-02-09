// app/api/favorites/publishers/route.js
// UPDATED VERSION WITH SUBSCRIPTION TRACKING
import { NextResponse } from 'next/server';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

// Helper function to ensure userId has proper format
const normalizeReaderId = (userId) => {
  if (!userId) return null;
  if (userId.startsWith('reader_')) {
    ('✅ Reader ID already properly formatted:', userId);
    return userId;
  }
  const readerId = `reader_${userId}`;
  ('🔧 Normalized reader ID from', userId, 'to', readerId);
  return readerId;
};

// GET - Fetch user's favorite publishers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    ('🔍 GET Request - Raw userId from request:', userId);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const readerId = normalizeReaderId(userId);
    ('🔍 GET Request - Using normalized readerId:', readerId);

    const publishersRef = collection(db, 'readers', readerId, 'favoritePublishers');
    ('📍 Querying path:', `readers/${readerId}/favoritePublishers`);
    
    const publishersSnapshot = await getDocs(publishersRef);
    ('📊 Found documents:', publishersSnapshot.size);
    
    const publishers = [];
    publishersSnapshot.forEach((doc) => {
      publishers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    publishers.sort((a, b) => {
      const dateA = a.addedAt?.toDate ? a.addedAt.toDate() : new Date(0);
      const dateB = b.addedAt?.toDate ? b.addedAt.toDate() : new Date(0);
      return dateB - dateA;
    });

    ('✅ Returning', publishers.length, 'favorite publishers');

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

// POST - Add publisher to favorites AND subscribe
export async function POST(request) {
  try {
    const { userId, publisher } = await request.json();

    ('📝 POST Request received:');
    ('  - Raw userId:', userId);
    ('  - Publisher name:', publisher?.name || publisher?.companyName);

    if (!userId || !publisher) {
      return NextResponse.json(
        { success: false, error: 'User ID and publisher are required' },
        { status: 400 }
      );
    }

    const readerId = normalizeReaderId(userId);
    ('📝 POST Request - Using normalized readerId:', readerId);

    const userDocRef = doc(db, 'readers', readerId);
    ('👤 Checking reader document at:', userDocRef.path);
    
    const userDocSnap = await getDoc(userDocRef);
    ('👤 Reader document exists:', userDocSnap.exists());

    if (!userDocSnap.exists()) {
      console.error('❌ Reader document not found at:', userDocRef.path);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reader document not found',
          debug: {
            requestedReaderId: readerId,
            suggestion: `Make sure the reader ${readerId} exists in the database`
          }
        },
        { status: 404 }
      );
    }

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
      userId: readerId,
      ...publisher
    };

    const publisherRef = doc(db, 'readers', readerId, 'favoritePublishers', publisherData.id);
    ('🔍 Checking if publisher already exists at:', publisherRef.path);
    
    const existingPublisher = await getDoc(publisherRef);

    if (existingPublisher.exists()) {
      ('⚠️ Publisher already in favorites');
      return NextResponse.json(
        { success: false, error: 'Publisher already in favorites' },
        { status: 409 }
      );
    }

    // Save to favorites
    ('💾 Saving publisher to favorites:', publisherRef.path);
    await setDoc(publisherRef, publisherData);

    // 🆕 ADD SUBSCRIPTION TRACKING
    ('📊 Adding subscriber tracking...');
    const publisherMainRef = doc(db, 'publishers', publisherData.id);
    const subscriberRef = doc(db, 'publishers', publisherData.id, 'subscribers', readerId);

    // Add subscriber document
    await setDoc(subscriberRef, {
      readerId: readerId,
      subscribedAt: serverTimestamp(),
      active: true
    });

    // Increment subscriber count
    await setDoc(publisherMainRef, {
      subscriberCount: increment(1),
      lastSubscriberUpdate: serverTimestamp()
    }, { merge: true });

    ('✅ Successfully added publisher to favorites and subscribed');

    return NextResponse.json({
      success: true,
      message: 'Publisher added to favorites and subscribed',
      publisher: publisherData,
      debug: {
        originalUserId: userId,
        normalizedReaderId: readerId,
        savedToPath: publisherRef.path,
        subscribedToPublisher: publisherData.id
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

// DELETE - Remove publisher from favorites AND unsubscribe
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const publisherId = searchParams.get('publisherId');

    ('🗑️ DELETE Request:');
    ('  - Raw userId:', userId);
    ('  - PublisherId:', publisherId);

    if (!userId || !publisherId) {
      return NextResponse.json(
        { success: false, error: 'User ID and publisher ID are required' },
        { status: 400 }
      );
    }

    const readerId = normalizeReaderId(userId);
    ('🗑️ DELETE Request - Using normalized readerId:', readerId);

    // Remove from favorites
    const publisherRef = doc(db, 'readers', readerId, 'favoritePublishers', publisherId);
    ('🗑️ Deleting from path:', publisherRef.path);
    await deleteDoc(publisherRef);

    // 🆕 REMOVE SUBSCRIPTION TRACKING
    ('📊 Removing subscriber tracking...');
    const subscriberRef = doc(db, 'publishers', publisherId, 'subscribers', readerId);
    await deleteDoc(subscriberRef);

    // Decrement subscriber count
    const publisherMainRef = doc(db, 'publishers', publisherId);
    await setDoc(publisherMainRef, {
      subscriberCount: increment(-1),
      lastSubscriberUpdate: serverTimestamp()
    }, { merge: true });

    ('✅ Successfully removed publisher from favorites and unsubscribed');

    return NextResponse.json({
      success: true,
      message: 'Publisher removed from favorites and unsubscribed',
      debug: {
        originalUserId: userId,
        normalizedReaderId: readerId,
        deletedFromPath: publisherRef.path,
        unsubscribedFromPublisher: publisherId
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