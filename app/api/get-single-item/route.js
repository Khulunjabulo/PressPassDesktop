// app/api/get-single-item/route.js - Updated to work with separate collections
import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherId = searchParams.get('publisherId');
    const itemId = searchParams.get('itemId');
    const collection = searchParams.get('collection'); // 'articles' or 'drafts'
     
    if (!publisherId || !itemId || !collection) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Publisher ID, Item ID, and collection are required'
        },
        { status: 400 }
      );
    }

    ('🔍 Fetching single item:', { publisherId, itemId, collection });

    // Validate collection name
    if (!['articles', 'drafts'].includes(collection)) {
      return NextResponse.json(
        { success: false, error: 'Invalid collection. Must be "articles" or "drafts"' },
        { status: 400 }
      );
    }

    // Get the document from the specified collection
    const docRef = doc(db, 'publishers', publisherId, collection, itemId);
    const docSnapshot = await getDoc(docRef);
     
    if (!docSnapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    const itemData = docSnapshot.data();
     
    // Convert Firestore timestamps to JavaScript dates and ensure proper status
    const processedItem = {
      id: docSnapshot.id,
      ...itemData,
      status: collection === 'articles' ? 'published' : 'draft', // Ensure correct status
      createdAt: itemData.createdAt?.toDate?.() || null,
      updatedAt: itemData.updatedAt?.toDate?.() || null,
      publishedAt: itemData.publishedAt?.toDate?.() || null,
      collection: collection // Add collection info for reference
    };

    ('✅ Single item retrieved successfully from', collection, 'collection');

    return NextResponse.json({
      success: true,
      item: processedItem,
      collection,
      publisherId
    });
   
  } catch (error) {
    console.error('💥 Error fetching single item:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch item',
        details: error.message
      },
      { status: 500 }
    );
  }
}