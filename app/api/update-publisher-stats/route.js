// app/api/update-publisher-stats/route.js
import { NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

export async function POST(request) {
  try {
    const { publisherId, lastPosted } = await request.json();

    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    // Count articles for this publisher
    const articlesRef = collection(db, 'articles');
    const articlesQuery = query(articlesRef, where('publisherId', '==', publisherId));
    const articlesSnapshot = await getDocs(articlesQuery);
    const articleCount = articlesSnapshot.size;

    // Update publisher document
    const publisherRef = doc(db, 'publishers', publisherId);
    await updateDoc(publisherRef, {
      articleCount,
      lastPosted: lastPosted || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Publisher stats updated successfully',
      articleCount
    });

  } catch (error) {
    console.error('Error updating publisher stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update publisher stats' 
      },
      { status: 500 }
    );
  }
}