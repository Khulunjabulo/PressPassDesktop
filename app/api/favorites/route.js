
import { NextResponse } from 'next/server';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

// GET - Fetch user's favorites
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's favorites
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const favoritesSnapshot = await getDocs(favoritesRef);
    
    const favorites = [];
    favoritesSnapshot.forEach((doc) => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort favorites by date added (newest first)
    favorites.sort((a, b) => {
      const dateA = a.addedAt?.toDate ? a.addedAt.toDate() : new Date(0);
      const dateB = b.addedAt?.toDate ? b.addedAt.toDate() : new Date(0);
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      favorites,
      count: favorites.length
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST - Add to favorites
export async function POST(request) {
  try {
    const { userId, item } = await request.json();

    if (!userId || !item) {
      return NextResponse.json(
        { success: false, error: 'User ID and item are required' },
        { status: 400 }
      );
    }

    // Determine the type of publication
    const determineItemType = (item) => {
      const source = item.source || item.publicationName || '';
      const magazines = ['Drum', 'You', 'Fairlady', 'GQ', 'Sarie', 'Huis Genoot'];
      const newspapers = ['Isolezwe', 'The Star', 'City Press', 'Mail & Guardian'];

      if (magazines.some(mag => source.toLowerCase().includes(mag.toLowerCase()))) {
        return 'magazine';
      } else if (newspapers.some(news => source.toLowerCase().includes(news.toLowerCase()))) {
        return 'newspaper';
      }
      return 'story';
    };

    // Prepare favorite item data
    const favoriteData = {
      id: item.id || `item_${Date.now()}`,
      title: item.title || 'Untitled',
      description: item.description || item.content || item.summary || '',
      image: item.image || item.imageUrl || item.urlToImage || null,
      link: item.link || item.url || '',
      source: item.source || item.publicationName || 'Unknown Source',
      publicationName: item.source || item.publicationName || 'Unknown',
      publicationLogo: item.publicationLogo || item.logo || null,
      category: item.category || 'general',
      pubDate: item.pubDate || item.publishedAt || item.createdAt || new Date().toISOString(),
      type: determineItemType(item),
      addedAt: serverTimestamp(),
      userId: userId,
      // Preserve any additional fields from the original item
      ...item
    };

    // Check if already favorited
    const favoriteRef = doc(db, 'users', userId, 'favorites', favoriteData.id);
    const existingFavorite = await getDoc(favoriteRef);

    if (existingFavorite.exists()) {
      return NextResponse.json(
        { success: false, error: 'Item already in favorites' },
        { status: 409 }
      );
    }

    // Add to favorites
    await setDoc(favoriteRef, favoriteData);

    return NextResponse.json({
      success: true,
      message: 'Added to favorites',
      favorite: favoriteData
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from favorites
export async function DELETE(request) {
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

    // Remove from favorites
    const favoriteRef = doc(db, 'users', userId, 'favorites', itemId);
    await deleteDoc(favoriteRef);

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}