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
  increment,
  query,
  where
} from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

// Helper function to normalize reader ID
const normalizeReaderId = (userId) => {
  if (!userId) return null;
  if (userId.startsWith('reader_')) return userId;
  return `reader_${userId}`;
};

// GET - Fetch subscriber data for a publisher
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherId = searchParams.get('publisherId');
    const includeDetails = searchParams.get('includeDetails') === 'true';
    
    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    console.log('📊 Fetching subscriber data for publisher:', publisherId);

    // Get all subscribers from subcollection
    const subscribersRef = collection(db, 'publishers', publisherId, 'subscribers');
    const subscribersSnapshot = await getDocs(subscribersRef);

    const allSubscribers = [];
    subscribersSnapshot.forEach((doc) => {
      const data = doc.data();
      allSubscribers.push({
        id: doc.id,
        ...data,
        subscribedAt: data.subscribedAt?.toDate?.() || null,
        unsubscribedAt: data.unsubscribedAt?.toDate?.() || null
      });
    });

    // Filter active subscribers
    const activeSubscribers = allSubscribers.filter(sub => sub.active === true);
    const churned = allSubscribers.filter(sub => sub.active === false);

    // Calculate metrics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // New subscribers this month
    const newThisMonth = activeSubscribers.filter(sub => 
      sub.subscribedAt && sub.subscribedAt >= startOfMonth
    ).length;

    // Calculate churn rate (monthly)
    const activeStartOfMonth = allSubscribers.filter(sub => {
      if (!sub.subscribedAt) return false;
      if (sub.subscribedAt < startOfMonth) {
        // Was subscribed before this month
        if (sub.active) return true;
        // Churned this month
        if (sub.unsubscribedAt && sub.unsubscribedAt >= startOfMonth) return true;
      }
      return false;
    }).length;

    const churnedThisMonth = allSubscribers.filter(sub => 
      sub.unsubscribedAt && 
      sub.unsubscribedAt >= startOfMonth &&
      sub.active === false
    ).length;

    const churnRate = activeStartOfMonth > 0 
      ? ((churnedThisMonth / activeStartOfMonth) * 100).toFixed(2)
      : 0;

    // Growth data for graphs
    const growthData = {
      weekly: [],
      monthly: []
    };

    // Weekly data (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySubscribers = activeSubscribers.filter(sub => 
        sub.subscribedAt && 
        sub.subscribedAt >= date && 
        sub.subscribedAt < nextDate
      ).length;

      const dayChurned = churned.filter(sub => 
        sub.unsubscribedAt && 
        sub.unsubscribedAt >= date && 
        sub.unsubscribedAt < nextDate
      ).length;

      growthData.weekly.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        subscribed: daySubscribers,
        churned: dayChurned,
        net: daySubscribers - dayChurned
      });
    }

    // Monthly data (last 30 days)
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySubscribers = activeSubscribers.filter(sub => 
        sub.subscribedAt && 
        sub.subscribedAt >= date && 
        sub.subscribedAt < nextDate
      ).length;

      const dayChurned = churned.filter(sub => 
        sub.unsubscribedAt && 
        sub.unsubscribedAt >= date && 
        sub.unsubscribedAt < nextDate
      ).length;

      growthData.monthly.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        subscribed: daySubscribers,
        churned: dayChurned,
        net: daySubscribers - dayChurned
      });
    }

    console.log('✅ Subscriber analytics calculated:', {
      total: activeSubscribers.length,
      newThisMonth,
      churned: churned.length,
      churnRate: `${churnRate}%`
    });

    const response = {
      success: true,
      subscriberCount: activeSubscribers.length,
      totalChurned: churned.length,
      newThisMonth,
      churnRate: parseFloat(churnRate),
      growthData,
      publisherId
    };

    if (includeDetails) {
      response.subscribers = activeSubscribers;
      response.churnedSubscribers = churned;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching subscriber data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriber data' },
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
      // Check if subscriber already exists
      const existingSubscriber = await getDoc(subscriberRef);
      
      if (existingSubscriber.exists() && existingSubscriber.data().active) {
        console.log('⚠️ User already subscribed');
        return NextResponse.json({
          success: true,
          message: 'Already subscribed',
          action: 'subscribe'
        });
      }

      // Add or reactivate subscriber document
      await setDoc(subscriberRef, {
        readerId: readerId,
        subscribedAt: serverTimestamp(),
        active: true,
        unsubscribedAt: null
      }, { merge: true });

      // Increment subscriber count only if it was a new subscription or reactivation
      if (!existingSubscriber.exists() || !existingSubscriber.data().active) {
        await setDoc(publisherRef, {
          subscriberCount: increment(1),
          lastSubscriberUpdate: serverTimestamp()
        }, { merge: true });
      }

      console.log('✅ Subscribed successfully');

      return NextResponse.json({
        success: true,
        message: 'Subscribed successfully',
        action: 'subscribe'
      });

    } else if (action === 'unsubscribe') {
      // Soft delete: mark as inactive instead of deleting
      const existingSubscriber = await getDoc(subscriberRef);
      
      if (!existingSubscriber.exists()) {
        console.log('⚠️ Subscriber not found');
        return NextResponse.json({
          success: true,
          message: 'Not subscribed',
          action: 'unsubscribe'
        });
      }

      // Mark as inactive and set unsubscribe date
      await setDoc(subscriberRef, {
        active: false,
        unsubscribedAt: serverTimestamp()
      }, { merge: true });

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