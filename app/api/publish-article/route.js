// app/api/publish-article/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';

// GET handler - Retrieve articles and drafts from separate collections
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    const type = searchParams.get('type') || 'both';
    const articleId = searchParams.get('articleId');

    console.log('📖 GET request params:', { publisherId, type, articleId });

    if (!publisherId) {
      console.log('❌ Missing publisherId');
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Fetching content for publisherId:', publisherId, 'type:', type);

    // Test Firebase connection first
    let db;
    try {
      db = getFirestoreDb();
      console.log('✅ Firebase connection established');
    } catch (firebaseError) {
      console.error('❌ Firebase connection failed:', firebaseError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed', details: firebaseError.message },
        { status: 500 }
      );
    }

    const publisherRef = db.collection('publishers').doc(publisherId);

    // If requesting a specific article
    if (articleId) {
      try {
        // First try to find in articles collection
        let articleDoc = await publisherRef
          .collection('articles')
          .doc(articleId)
          .get();

        let collectionType = 'articles';
        
        // If not found in articles, try drafts collection
        if (!articleDoc.exists) {
          articleDoc = await publisherRef
            .collection('drafts')
            .doc(articleId)
            .get();
          collectionType = 'drafts';
        }

        if (!articleDoc.exists) {
          console.log('❌ Article/Draft not found:', articleId);
          return NextResponse.json(
            { success: false, error: 'Article not found' },
            { status: 404 }
          );
        }

        const data = articleDoc.data();
        const articleData = {
          id: articleDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
          collection: collectionType,
          // Ensure image URLs are properly included
          imageUrl: data.featuredImageUrl || data.imageUrl || data.image || null,
          featuredImageUrl: data.featuredImageUrl || null
        };

        console.log('✅ Single article retrieved:', articleData.title, 'from', collectionType);
        console.log('🖼️ Article image URLs:', {
          imageUrl: articleData.imageUrl,
          featuredImageUrl: articleData.featuredImageUrl
        });
        
        return NextResponse.json({
          success: true,
          article: articleData
        });
      } catch (error) {
        console.error('❌ Error fetching single article:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch article', details: error.message },
          { status: 500 }
        );
      }
    }

    // Fetch articles and/or drafts from separate collections
    let articles = [];
    let drafts = [];

    try {
      // Get published articles from 'articles' collection
      if (type === 'articles' || type === 'both') {
        console.log('🔍 Fetching published articles...');
        
        const articlesSnapshot = await publisherRef
          .collection('articles')
          .orderBy('updatedAt', 'desc')
          .get();

        articles = articlesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            status: 'published',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0,
            // Ensure image URLs are properly mapped
            imageUrl: data.featuredImageUrl || data.imageUrl || data.image || null,
            featuredImageUrl: data.featuredImageUrl || null
          };
        });

        console.log('📰 Published articles found:', articles.length);
        console.log('🖼️ Articles with images:', articles.filter(a => a.imageUrl || a.featuredImageUrl).length);
      }

      // Get drafts from 'drafts' collection
      if (type === 'drafts' || type === 'both') {
        console.log('🔍 Fetching drafts...');
        
        const draftsSnapshot = await publisherRef
          .collection('drafts')
          .orderBy('updatedAt', 'desc')
          .get();

        drafts = draftsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            status: 'draft',
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            publishedAt: null,
            views: 0,
            likes: 0,
            comments: 0,
            // Ensure image URLs are properly mapped
            imageUrl: data.featuredImageUrl || data.imageUrl || data.image || null,
            featuredImageUrl: data.featuredImageUrl || null
          };
        });

        console.log('✏️ Drafts found:', drafts.length);
        console.log('🖼️ Drafts with images:', drafts.filter(d => d.imageUrl || d.featuredImageUrl).length);
      }

    } catch (queryError) {
      console.error('❌ Error executing Firestore query:', queryError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch content',
        details: queryError.message
      }, { status: 500 });
    }

    const responseData = {
      success: true,
      articles,
      drafts,
      total: articles.length + drafts.length,
      publisherId
    };

    console.log('✅ Content retrieved successfully:', { 
      articles: articles.length, 
      drafts: drafts.length,
      total: responseData.total
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('💥 Unexpected error in publish-article GET:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST handler - Create/Update articles and drafts with proper image handling
export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let data = {};
    let publisherId = null;

    console.log('📝 POST request received, content-type:', contentType);

    // Handle FormData from ManualArticleForm
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      
      // Convert FormData to plain object
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      publisherId = data.publisherId || null;
    } else {
      // Handle JSON fallback
      const body = await req.json();
      data = body;
      publisherId = body.publisherId || null;
    }

    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Saving article for publisherId:', publisherId);
    console.log('🖼️ Image data received:', {
      featuredImageUrl: data.featuredImageUrl ? 'Present' : 'Missing',
      imageUrl: data.imageUrl ? 'Present' : 'Missing',
      featuredImage: data.featuredImage ? 'File present' : 'No file'
    });

    const isDraft = data.isDraft === 'true' || data.isDraft === true;
    const status = isDraft ? 'draft' : 'published';

    // Prepare article document with proper image handling
    const articleData = {
  title: data.title || '',
  subtitle: data.subtitle || '',
  author: data.author || '',
  authorTitle: data.authorTitle || '',
  category: data.category || '',
  tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim())) : [],
  style: data.style || 'modern',
  content: data.content || '',
  metaDescription: data.metaDescription || '',
  publishNow: !isDraft,
  allowComments: data.allowComments === 'true' || data.allowComments === true,
  sendNewsletter: data.sendNewsletter === 'true' || data.sendNewsletter === true,
  isDraft: isDraft,
  wordCount: parseInt(data.wordCount || '0', 10),
  readingTime: parseInt(data.readingTime || '0', 10),
  publisherId,
  publisherName: data.publisherName || '',
  updatedAt: Timestamp.now(),
  status: status,
  views: isDraft ? 0 : (data.views || 0),
  likes: isDraft ? 0 : (data.likes || 0),
  comments: isDraft ? 0 : (data.comments || 0),
  
  // ENHANCED: Properly handle all image fields
  featuredImageUrl: data.featuredImageUrl || null,
  imageUrl: data.featuredImageUrl || data.imageUrl || null,
  image: data.featuredImageUrl || data.imageUrl || null,
  
  // ADD THESE NEW FIELDS:
  imageCredit: data.imageCredit || null,        // NEW: Who took the photo
  imageCaption: data.imageCaption || null,      // NEW: Image description
};

console.log('💾 Final article data with image fields:', {
  featuredImageUrl: articleData.featuredImageUrl,
  imageUrl: articleData.imageUrl,
  image: articleData.image,
  imageCredit: articleData.imageCredit,         // NEW LOG
  imageCaption: articleData.imageCaption        // NEW LOG
});

    // Set createdAt for new articles/drafts
    if (!data.articleId) {
      articleData.createdAt = Timestamp.now();
    }
    
    // Set publishedAt only for published articles
    if (status === 'published') {
      articleData.publishedAt = data.articleId ? (data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : Timestamp.now()) : Timestamp.now();
    }

    console.log('💾 Final article data image fields:', {
      featuredImageUrl: articleData.featuredImageUrl,
      imageUrl: articleData.imageUrl,
      image: articleData.image
    });

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);
    
    let docRef;
    let message;

    // Determine which collection to use
    const collectionName = isDraft ? 'drafts' : 'articles';

    if (data.articleId) {
      // Update existing article/draft
      const currentDraftDoc = await publisherRef.collection('drafts').doc(data.articleId).get();
      const currentArticleDoc = await publisherRef.collection('articles').doc(data.articleId).get();
      
      let currentCollection = null;
      if (currentDraftDoc.exists) currentCollection = 'drafts';
      else if (currentArticleDoc.exists) currentCollection = 'articles';
      
      if (currentCollection && currentCollection !== collectionName) {
        // Move between collections
        console.log(`🔄 Moving item from ${currentCollection} to ${collectionName}`);
        
        await publisherRef.collection(currentCollection).doc(data.articleId).delete();
        docRef = publisherRef.collection(collectionName).doc(data.articleId);
        await docRef.set(articleData);
        
        message = `Article moved from ${currentCollection} to ${collectionName} successfully`;
      } else if (currentCollection) {
        // Update in same collection
        docRef = publisherRef.collection(collectionName).doc(data.articleId);
        await docRef.update(articleData);
        message = `${isDraft ? 'Draft' : 'Article'} updated successfully`;
      } else {
        return NextResponse.json(
          { success: false, error: 'Article/Draft not found for update' },
          { status: 404 }
        );
      }
    } else {
      // Create new article/draft
      docRef = await publisherRef.collection(collectionName).add(articleData);
      message = `${isDraft ? 'Draft' : 'Article'} created successfully`;
    }

    console.log(`✅ ${message} in collection: ${collectionName}`);
    console.log('🖼️ Saved with image URLs:', {
      featuredImageUrl: articleData.featuredImageUrl,
      imageUrl: articleData.imageUrl
    });

    return NextResponse.json({
      success: true,
      message,
      articleId: typeof docRef === 'string' ? docRef : docRef.id,
      status: articleData.status,
      collection: collectionName,
      savedImageUrl: articleData.featuredImageUrl || articleData.imageUrl
    });

  } catch (error) {
    console.error('💥 Error in publish-article POST:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete articles or drafts from appropriate collections
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    const articleId = searchParams.get('articleId');
    const collection = searchParams.get('collection');

    if (!publisherId || !articleId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID and Article ID are required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting item:', articleId, 'from collection:', collection, 'for publisher:', publisherId);

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);

    if (collection && ['articles', 'drafts'].includes(collection)) {
      const docRef = publisherRef.collection(collection).doc(articleId);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return NextResponse.json(
          { success: false, error: `${collection.slice(0, -1)} not found` },
          { status: 404 }
        );
      }
      
      await docRef.delete();
      console.log(`✅ ${collection.slice(0, -1)} deleted successfully from ${collection} collection`);
    } else {
      let deleted = false;
      
      const articleDoc = await publisherRef.collection('articles').doc(articleId).get();
      if (articleDoc.exists) {
        await publisherRef.collection('articles').doc(articleId).delete();
        deleted = true;
        console.log('✅ Article deleted successfully from articles collection');
      } else {
        const draftDoc = await publisherRef.collection('drafts').doc(articleId).get();
        if (draftDoc.exists) {
          await publisherRef.collection('drafts').doc(articleId).delete();
          deleted = true;
          console.log('✅ Draft deleted successfully from drafts collection');
        }
      }
      
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Article/Draft not found in any collection' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('💥 Error in publish-article DELETE:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}