// app/api/favorites/route.js
import { NextResponse } from 'next/server';
const { getFirestoreDb } = require('../../../lib/firebase-admin');

function logApiCall(method, info) {
  console.log(`================ API DEBUG: /api/favorites [${method}] ================`);
  console.log('Info:', JSON.stringify(info, null, 2));
  console.log('===============================================================');
}

function validateUserId(userId) {
  if (!userId) {
    return { valid: false, error: 'User ID is required' };
  }
  if (typeof userId !== 'string') {
    return { valid: false, error: 'User ID must be a string' };
  }
  if (userId.trim() === '') {
    return { valid: false, error: 'User ID cannot be empty' };
  }
  if (userId.includes('/')) {
    return { valid: false, error: 'User ID cannot contain forward slashes' };
  }
  return { valid: true };
}

// ✅ GET Favorites
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  logApiCall('GET', { 
    userId, 
    userIdType: typeof userId,
    userIdLength: userId?.length,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  const userValidation = validateUserId(userId);
  if (!userValidation.valid) {
    console.warn('⚠️ Invalid userId in GET request:', userValidation.error);
    return NextResponse.json({ success: false, error: userValidation.error }, { status: 400 });
  }

  try {
    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired for GET');

    // Construct path safely
    const readerPath = `readers/${userId}`;
    const favoritesPath = `${readerPath}/favorites`;
    console.log('🔍 Using Firestore path:', favoritesPath);

    // Access favorites as subcollection under readers/userId/favorites
    const favoritesRef = db.collection('readers').doc(userId).collection('favorites');
    const favoritesSnapshot = await favoritesRef.orderBy('addedAt', 'desc').get();

    if (favoritesSnapshot.empty) {
      console.log('📝 No favorites found, returning empty array');
      return NextResponse.json({ success: true, favorites: [] }, { status: 200 });
    }

    // Convert subcollection documents to array
    const favorites = [];
    favoritesSnapshot.forEach(doc => {
      favorites.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('✅ Favorites found:', favorites.length, 'items');

    return NextResponse.json({
      success: true,
      favorites: favorites
    }, { status: 200 });

  } catch (error) {
    console.error('❌ GET /favorites error:', error.message);
    console.error('❌ Full error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}

// ✅ POST Add to Favorites
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, item } = body;

    logApiCall('POST', { 
      userId, 
      userIdType: typeof userId,
      userIdLength: userId?.length,
      itemPreview: {
        id: item?.id,
        title: item?.title?.substring(0, 50) + '...',
        url: item?.url
      },
      bodyKeys: Object.keys(body || {})
    });

    // Validate userId
    const userValidation = validateUserId(userId);
    if (!userValidation.valid) {
      console.warn('⚠️ Invalid userId in POST request:', userValidation.error);
      return NextResponse.json({ success: false, error: userValidation.error }, { status: 400 });
    }

    if (!item) {
      console.warn('⚠️ Missing item in POST');
      return NextResponse.json({ success: false, error: 'Item is required' }, { status: 400 });
    }

    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired for POST');

    // Create unique ID for the favorite item - create safe document ID
    let favoriteId;
    if (item.url || item.link) {
      // Use URL/link to create a consistent ID, but make it Firestore-safe
      const urlToUse = item.url || item.link;
      // Create a hash-like ID from the URL to ensure uniqueness and avoid duplicates
      favoriteId = 'url_' + Buffer.from(urlToUse).toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove non-alphanumeric characters
        .substring(0, 50) + '_' + Date.now();
    } else if (item.id && typeof item.id === 'string') {
      // Clean existing ID to make it Firestore-safe
      favoriteId = item.id.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
    } else {
      favoriteId = `story_${Date.now()}`;
    }
    
    console.log('🆔 Generated safe document ID:', favoriteId);

    const favoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
      id: favoriteId
    };

    // Construct path safely
    const readerPath = `readers/${userId}`;
    const favoritePath = `${readerPath}/favorites/${favoriteId}`;
    console.log('🔍 Using Firestore path:', favoritePath);

    // Access favorites as subcollection under readers/userId/favorites
    const favoriteRef = db.collection('readers').doc(userId).collection('favorites').doc(favoriteId);
    
    // Check if item already exists (by URL if available, otherwise by ID)
    if (item.url || item.link) {
      const urlToCheck = item.url || item.link;
      console.log('🔍 Checking for existing favorite with URL:', urlToCheck);
      
      const existingQuery = db.collection('readers').doc(userId).collection('favorites')
        .where('url', '==', urlToCheck)
        .limit(1);
      
      const existingSnapshot = await existingQuery.get();
      if (!existingSnapshot.empty) {
        console.warn('⚠️ Item with this URL already exists in favorites');
        return NextResponse.json({ success: false, error: 'Item already in favorites' }, { status: 400 });
      }
      
      // Also check 'link' field if different
      if (item.link && item.link !== urlToCheck) {
        const linkQuery = db.collection('readers').doc(userId).collection('favorites')
          .where('link', '==', item.link)
          .limit(1);
        
        const linkSnapshot = await linkQuery.get();
        if (!linkSnapshot.empty) {
          console.warn('⚠️ Item with this link already exists in favorites');
          return NextResponse.json({ success: false, error: 'Item already in favorites' }, { status: 400 });
        }
      }
    } else {
      const existingDoc = await favoriteRef.get();
      if (existingDoc.exists) {
        console.warn('⚠️ Item already exists in favorites');
        return NextResponse.json({ success: false, error: 'Item already in favorites' }, { status: 400 });
      }
    }

    // Add to favorites subcollection
    await favoriteRef.set(favoriteItem);

    console.log('✅ Favorite successfully added:', favoriteId);

    return NextResponse.json({ success: true, item: favoriteItem }, { status: 200 });

  } catch (error) {
    console.error('❌ POST /favorites error:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Full error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add to favorites',
      details: error.message
    }, { status: 500 });
  }
}

// ✅ DELETE Remove from Favorites
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { userId, itemId } = body;

    logApiCall('DELETE', { 
      userId, 
      userIdType: typeof userId,
      userIdLength: userId?.length,
      itemId,
      bodyKeys: Object.keys(body || {})
    });

    // Validate userId
    const userValidation = validateUserId(userId);
    if (!userValidation.valid) {
      console.warn('⚠️ Invalid userId in DELETE request:', userValidation.error);
      return NextResponse.json({ success: false, error: userValidation.error }, { status: 400 });
    }

    if (!itemId) {
      console.warn('⚠️ Missing itemId in DELETE');
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired for DELETE');

    // Construct path safely
    const readerPath = `readers/${userId}`;
    const favoritePath = `${readerPath}/favorites/${itemId}`;
    console.log('🔍 Using Firestore path:', favoritePath);

    // Access specific favorite document in subcollection
    const favoriteRef = db.collection('readers').doc(userId).collection('favorites').doc(itemId);
    const favoriteDoc = await favoriteRef.get();

    if (!favoriteDoc.exists) {
      console.warn('⚠️ Item not found in favorites');
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Delete the favorite document
    await favoriteRef.delete();

    console.log('✅ Removed item from favorites:', itemId);

    return NextResponse.json({ success: true, message: 'Removed from favorites' }, { status: 200 });

  } catch (error) {
    console.error('❌ DELETE /favorites error:', error.message);
    console.error('❌ Full error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove from favorites',
      details: error.message
    }, { status: 500 });
  }
}