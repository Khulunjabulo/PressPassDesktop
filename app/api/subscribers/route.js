// app/api/subscribers/route.js
import { NextResponse } from 'next/server';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc,
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

// Helper function to normalize reader ID
const normalizeReaderId = (userId) => {
  if (!userId) return null;
  if (userId.startsWith('reader_')) return userId;
  return `reader_${userId}`;
};

// GET - Fetch subscriber count for a publisher
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherId = searchParams.get('publisherId');
    
    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    console.log('📊 Fetching subscriber count for publisher:', publisherId);

    // Get publisher document to read subscriber count
    const publisherRef = doc(db, 'publishers', publisherId);
    const publisherDoc = await getDoc(publisherRef);

    if (!publisherDoc.exists()) {
      // Initialize publisher document with 0 subscribers
      console.log('📝 Publisher document not found, initializing...');
      await setDoc(publisherRef, {
        subscriberCount: 0,
        lastSubscriberUpdate: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true });

      console.log('✅ Publisher initialized with 0 subscribers');

      return NextResponse.json({
        success: true,
        subscriberCount: 0,
        publisherId,
        initialized: true
      });
    }

    const publisherData = publisherDoc.data();
    const subscriberCount = publisherData.subscriberCount || 0;

    console.log('✅ Subscriber count:', subscriberCount);

    return NextResponse.json({
      success: true,
      subscriberCount,
      publisherId
    });

  } catch (error) {
    console.error('❌ Error fetching subscriber count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriber count' },
      { status: 500 }
    );
  }
}

// POST - Subscribe/Unsubscribe (called when favoriting/unfavoriting)
export async function POST(request) {
  try {
    const { userId, publisherId, action } = await request.json();

    if (!userId || !publisherId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID, Publisher ID, and action are required' },
        { status: 400 }
      );
    }

    const readerId = normalizeReaderId(userId);
    console.log('📝 Subscription action:', action, 'for reader:', readerId, 'publisher:', publisherId);

    const publisherRef = doc(db, 'publishers', publisherId);
    const subscriberRef = doc(db, 'publishers', publisherId, 'subscribers', readerId);

    // Ensure publisher document exists before updating
    const publisherDoc = await getDoc(publisherRef);
    if (!publisherDoc.exists()) {
      await setDoc(publisherRef, {
        subscriberCount: 0,
        lastSubscriberUpdate: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      console.log('📝 Initialized publisher document');
    }

    if (action === 'subscribe') {
      // Add subscriber document
      await setDoc(subscriberRef, {
        readerId: readerId,
        subscribedAt: serverTimestamp(),
        active: true
      });

      // Increment subscriber count
      await setDoc(publisherRef, {
        subscriberCount: increment(1),
        lastSubscriberUpdate: serverTimestamp()
      }, { merge: true });

      console.log('✅ Subscribed successfully');

      return NextResponse.json({
        success: true,
        message: 'Subscribed successfully',
        action: 'subscribe'
      });

    } else if (action === 'unsubscribe') {
      // Remove subscriber document
      await deleteDoc(subscriberRef);

      // Decrement subscriber count (prevent negative values)
      const currentDoc = await getDoc(publisherRef);
      const currentCount = currentDoc.data()?.subscriberCount || 0;
      
      await setDoc(publisherRef, {
        subscriberCount: Math.max(0, currentCount - 1),
        lastSubscriberUpdate: serverTimestamp()
      }, { merge: true });

      console.log('✅ Unsubscribed successfully');

      return NextResponse.json({
        success: true,
        message: 'Unsubscribed successfully',
        action: 'unsubscribe'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "subscribe" or "unsubscribe"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Error updating subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}