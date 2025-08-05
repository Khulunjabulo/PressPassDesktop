// app/api/favorites/route.js
import { NextResponse } from 'next/server';
const { getFirestoreDb } = require('../../../lib/firebase-admin');

function logApiCall(method, info) {
  console.log(`================ API DEBUG: /api/favorites [${method}] ================`);
  console.log('Info:', info);
  console.log('===============================================================');
}

// ✅ GET Favorites
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  logApiCall('GET', { userId });

  if (!userId) {
    console.warn('⚠️ Missing userId in GET request');
    return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
  }

  try {
    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired for GET');

    const favoritesRef = db.collection('favorites').doc(userId);
    const favoritesDoc = await favoritesRef.get();

    if (!favoritesDoc.exists) {
      console.log('📝 No favorites found, returning empty array');
      return NextResponse.json({ success: true, favorites: [] }, { status: 200 });
    }

    const data = favoritesDoc.data();
    console.log('✅ Favorites found:', data?.items?.length || 0, 'items');

    return NextResponse.json({
      success: true,
      favorites: data?.items || []
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

    logApiCall('POST', { userId, itemPreview: item?.title || item?.id });

    if (!userId || !item) {
      console.warn('⚠️ Missing userId or item in POST');
      return NextResponse.json({ success: false, error: 'User ID and item are required' }, { status: 400 });
    }

    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired for POST');

    const favoritesRef = db.collection('favorites').doc(userId);
    const favoritesDoc = await favoritesRef.get();

    const favoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
      id: item.id || `article_${Date.now()}`
    };

    if (!favoritesDoc.exists) {
      console.log('🆕 Creating new favorites document for user:', userId);
      await favoritesRef.set({
        userId,
        items: [favoriteItem],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      const existingItems = favoritesDoc.data()?.items || [];
      const exists = existingItems.some(i => i.id === favoriteItem.id);

      if (exists) {
        console.warn('⚠️ Item already exists in favorites');
        return NextResponse.json({ success: false, error: 'Item already in favorites' }, { status: 400 });
      }

      console.log('➕ Adding item to existing favorites');
      await favoritesRef.update({
        items: [...existingItems, favoriteItem],
        updatedAt: new Date().toISOString()
      });
    }

    console.log('✅ Favorite successfully added:', favoriteItem.id);

    return NextResponse.json({ success: true, item: favoriteItem }, { status: 200 });

  } catch (error) {
    console.error('❌ POST /favorites error:', error.message);
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

    logApiCall('DELETE', { userId, itemId });

    if (!userId || !itemId) {
      console.warn('⚠️ Missing userId or itemId in DELETE');
      return NextResponse.json({ success: false, error: 'User ID and item ID are required' }, { status: 400 });
    }

    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired for DELETE');

    const favoritesRef = db.collection('favorites').doc(userId);
    const favoritesDoc = await favoritesRef.get();

    if (!favoritesDoc.exists) {
      console.warn('⚠️ No favorites found for this user');
      return NextResponse.json({ success: false, error: 'No favorites found' }, { status: 404 });
    }

    const existingItems = favoritesDoc.data()?.items || [];
    const filteredItems = existingItems.filter(i => i.id !== itemId);

    if (filteredItems.length === existingItems.length) {
      console.warn('⚠️ Item not found in favorites');
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    await favoritesRef.update({
      items: filteredItems,
      updatedAt: new Date().toISOString()
    });

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
