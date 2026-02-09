// app/api/migrate-articles/route.js
// One-time migration script to fix article/draft organization
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const { publisherId } = await req.json();
    
    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    ('🔄 Starting migration for publisher:', publisherId);

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);

    // Get all documents from the articles collection
    const articlesSnapshot = await publisherRef.collection('articles').get();
    
    let migratedCount = 0;
    let draftsMoved = 0;
    let articlesAlreadyCorrect = 0;

    ('📊 Found', articlesSnapshot.size, 'documents in articles collection');

    // Process each document
    for (const doc of articlesSnapshot.docs) {
      const data = doc.data();
      const docId = doc.id;
      
      ('📄 Processing:', {
        id: docId,
        title: data.title,
        status: data.status,
        isDraft: data.isDraft
      });

      // Check if this document should be a draft
      const shouldBeDraft = data.status === 'draft' || data.isDraft === true;
      
      if (shouldBeDraft) {
        ('🔄 Moving to drafts collection:', data.title);
        
        // Prepare draft data (remove published-specific fields)
        const draftData = {
          ...data,
          status: 'draft',
          isDraft: true,
          publishNow: false,
          publishedAt: null, // Remove published date
          views: 0, // Reset views for drafts
          likes: 0,
          comments: 0,
          updatedAt: Timestamp.now()
        };

        // Add to drafts collection with same ID
        await publisherRef.collection('drafts').doc(docId).set(draftData);
        
        // Remove from articles collection
        await publisherRef.collection('articles').doc(docId).delete();
        
        draftsMoved++;
        migratedCount++;
        
        ('✅ Moved to drafts:', data.title);
      } else {
        // This should stay as an article, but ensure correct status
        const shouldBePublished = data.status === 'published' || data.isDraft === false;
        
        if (shouldBePublished) {
          // Update to ensure correct published article structure
          const publishedData = {
            ...data,
            status: 'published',
            isDraft: false,
            publishNow: true,
            publishedAt: data.publishedAt || Timestamp.now(), // Ensure publishedAt exists
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0,
            updatedAt: Timestamp.now()
          };

          await publisherRef.collection('articles').doc(docId).update(publishedData);
          articlesAlreadyCorrect++;
          
          ('✅ Updated published article:', data.title);
        } else {
          ('⚠️ Unclear status for:', data.title, 'status:', data.status, 'isDraft:', data.isDraft);
        }
      }
    }

    // Also check if there are any existing documents in drafts collection
    const existingDraftsSnapshot = await publisherRef.collection('drafts').get();
    let existingDraftsCount = existingDraftsSnapshot.size;

    ('📊 Existing drafts in drafts collection:', existingDraftsCount);

    // Ensure all existing drafts have correct structure
    if (existingDraftsCount > 0) {
      for (const doc of existingDraftsSnapshot.docs) {
        const data = doc.data();
        const updatedDraftData = {
          ...data,
          status: 'draft',
          isDraft: true,
          publishNow: false,
          publishedAt: null,
          views: 0,
          likes: 0,
          comments: 0,
          updatedAt: Timestamp.now()
        };

        await doc.ref.update(updatedDraftData);
        ('✅ Updated existing draft structure:', data.title);
      }
    }

    const summary = {
      success: true,
      message: 'Migration completed successfully',
      publisherId,
      statistics: {
        totalDocumentsProcessed: articlesSnapshot.size,
        draftsMovedToDraftsCollection: draftsMoved,
        articlesKeptInArticlesCollection: articlesAlreadyCorrect,
        existingDraftsUpdated: existingDraftsCount,
        totalMigrated: migratedCount
      },
      timestamp: new Date().toISOString()
    };

    ('🎉 Migration completed:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('💥 Error during migration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET handler to check current state before migration
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    
    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);

    // Check current state
    const articlesSnapshot = await publisherRef.collection('articles').get();
    const draftsSnapshot = await publisherRef.collection('drafts').get();

    const articlesAnalysis = {
      total: articlesSnapshot.size,
      published: 0,
      drafts: 0,
      unclear: 0
    };

    const draftsAnalysis = {
      total: draftsSnapshot.size,
      properDrafts: 0,
      improperlyMarked: 0
    };

    // Analyze articles collection
    articlesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'published' || data.isDraft === false) {
        articlesAnalysis.published++;
      } else if (data.status === 'draft' || data.isDraft === true) {
        articlesAnalysis.drafts++;
      } else {
        articlesAnalysis.unclear++;
      }
    });

    // Analyze drafts collection
    draftsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'draft' || data.isDraft === true) {
        draftsAnalysis.properDrafts++;
      } else {
        draftsAnalysis.improperlyMarked++;
      }
    });

    return NextResponse.json({
      success: true,
      publisherId,
      currentState: {
        articlesCollection: articlesAnalysis,
        draftsCollection: draftsAnalysis
      },
      needsMigration: articlesAnalysis.drafts > 0 || draftsAnalysis.improperlyMarked > 0,
      recommendations: {
        shouldMigrateDrafts: articlesAnalysis.drafts,
        shouldFixDraftStructure: draftsAnalysis.improperlyMarked
      }
    });

  } catch (error) {
    console.error('💥 Error analyzing collections:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}