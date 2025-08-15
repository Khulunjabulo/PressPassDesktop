// app/api/favorites/publishers/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '@/lib/firebase-admin';

// Get instances
const auth = getAuth();
const db = getFirestoreDb();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // Get user's favorite publishers
    const favPublishersRef = db.collection('users').doc(userId).collection('favoritePublishers');
    const snapshot = await favPublishersRef.orderBy('favoritedAt', 'desc').get();

    const publishers = [];
    snapshot.forEach(doc => {
      publishers.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      publishers,
      count: publishers.length
    });

  } catch (error) {
    console.error('Error fetching favorite publishers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch favorite publishers'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, publisher } = await request.json();

    if (!userId || !publisher) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and publisher data required' 
      }, { status: 400 });
    }

    if (!publisher.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Publisher ID required' 
      }, { status: 400 });
    }

    // Check if publisher is already favorited
    const favPublisherRef = db.collection('users').doc(userId).collection('favoritePublishers').doc(publisher.id);
    const existingDoc = await favPublisherRef.get();

    if (existingDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Publisher already in favorites'
      }, { status: 409 });
    }

    // Add publisher to favorites
    const publisherData = {
      ...publisher,
      favoritedAt: new Date(),
      userId
    };

    await favPublisherRef.set(publisherData);

    return NextResponse.json({
      success: true,
      publisher: publisherData,
      message: 'Publisher added to favorites'
    });

  } catch (error) {
    console.error('Error adding publisher to favorites:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add publisher to favorites'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const publisherId = searchParams.get('publisherId');

    if (!userId || !publisherId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and publisher ID required' 
      }, { status: 400 });
    }

    // Remove publisher from favorites
    const favPublisherRef = db.collection('users').doc(userId).collection('favoritePublishers').doc(publisherId);
    const doc = await favPublisherRef.get();

    if (!doc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Publisher not found in favorites'
      }, { status: 404 });
    }

    await favPublisherRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Publisher removed from favorites'
    });

  } catch (error) {
    console.error('Error removing publisher from favorites:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove publisher from favorites'
    }, { status: 500 });
  }
}