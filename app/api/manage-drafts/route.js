// app/api/manage-drafts/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// POST handler - Publish a draft (move from drafts to articles collection)
export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    const draftId = searchParams.get('draftId');
    const action = searchParams.get('action');

    if (!publisherId || !draftId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID and Draft ID are required' },
        { status: 400 }
      );
    }

    if (action !== 'publish') {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Only "publish" is supported.' },
        { status: 400 }
      );
    }

    ('📤 Publishing draft:', draftId, 'for publisher:', publisherId);

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);
    
    // Get the current draft from drafts collection
    const draftRef = publisherRef.collection('drafts').doc(draftId);
    const draftDoc = await draftRef.get();
    
    if (!draftDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    const draftData = draftDoc.data();

    // Prepare published article data
    const publishedArticleData = {
      ...draftData,
      status: 'published',
      publishNow: true,
      isDraft: false,
      publishedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Initialize engagement metrics for published article
      views: 0,
      likes: 0,
      comments: 0,
    };

    // Create the article in the articles collection
    const articleRef = publisherRef.collection('articles').doc(draftId); // Use same ID
    await articleRef.set(publishedArticleData);

    // Delete the draft from drafts collection
    await draftRef.delete();

    ('✅ Draft published successfully and moved to articles collection');

    return NextResponse.json({
      success: true,
      message: 'Draft published successfully',
      articleId: draftId,
      status: 'published'
    });

  } catch (error) {
    console.error('💥 Error in manage-drafts POST:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a draft from drafts collection
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    const draftId = searchParams.get('draftId');

    if (!publisherId || !draftId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID and Draft ID are required' },
        { status: 400 }
      );
    }

    ('🗑️ Deleting draft:', draftId, 'for publisher:', publisherId);

    const db = getFirestoreDb();
    const draftRef = db
      .collection('publishers')
      .doc(publisherId)
      .collection('drafts')
      .doc(draftId);

    // Verify the draft exists
    const draftDoc = await draftRef.get();
    
    if (!draftDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Draft not found' },
        { status: 404 }
      );
    }

    // Delete the draft
    await draftRef.delete();

    ('✅ Draft deleted successfully from drafts collection');

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    });

  } catch (error) {
    console.error('💥 Error in manage-drafts DELETE:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET handler - Get draft details from drafts collection
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    const draftId = searchParams.get('draftId');

    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);
    
    if (draftId) {
      // Get specific draft from drafts collection
      const draftDoc = await publisherRef
        .collection('drafts')
        .doc(draftId)
        .get();

      if (!draftDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Draft not found' },
          { status: 404 }
        );
      }

      const draftData = {
        id: draftDoc.id,
        ...draftDoc.data(),
        status: 'draft', // Ensure status is correct
        createdAt: draftDoc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: draftDoc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        publishedAt: null, // Drafts don't have published date
      };

      return NextResponse.json({
        success: true,
        draft: draftData
      });
    } else {
      // Get all drafts for publisher from drafts collection
      const draftsSnapshot = await publisherRef
        .collection('drafts')
        .orderBy('updatedAt', 'desc')
        .get();

      const drafts = draftsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'draft', // Ensure status is correct
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        publishedAt: null, // Drafts don't have published date
      }));

      return NextResponse.json({
        success: true,
        drafts,
        total: drafts.length
      });
    }

  } catch (error) {
    console.error('💥 Error in manage-drafts GET:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}