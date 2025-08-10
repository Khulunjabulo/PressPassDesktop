
import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const itemId = searchParams.get('itemId');

    if (!userId || !itemId) {
      return NextResponse.json(
        { success: false, error: 'User ID and item ID are required' },
        { status: 400 }
      );
    }

    // Check if item exists in user's favorites
    const favoriteRef = doc(db, 'users', userId, 'favorites', itemId);
    const favoriteSnap = await getDoc(favoriteRef);

    return NextResponse.json({
      success: true,
      isFavorite: favoriteSnap.exists(),
      itemId
    });

  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}