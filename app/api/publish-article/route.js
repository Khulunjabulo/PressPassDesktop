// app/api/publish-article/route.js - COMPLETE WITH PDF SUPPORT
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';

// GET handler - Retrieve articles and drafts with PDF support
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    const type = searchParams.get('type') || 'both';
    const articleId = searchParams.get('articleId');

    ('📖 GET request params:', { publisherId, type, articleId });

    if (!publisherId) {
      ('❌ Missing publisherId');
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    ('🔄 Fetching content for publisherId:', publisherId, 'type:', type);

    let db;
    try {
      db = getFirestoreDb();
      ('✅ Firebase connection established');
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
        let articleDoc = await publisherRef
          .collection('articles')
          .doc(articleId)
          .get();

        let collectionType = 'articles';
        
        if (!articleDoc.exists) {
          articleDoc = await publisherRef
            .collection('drafts')
            .doc(articleId)
            .get();
          collectionType = 'drafts';
        }

        if (!articleDoc.exists) {
          ('❌ Article/Draft not found:', articleId);
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
          
          // Image URLs
          imageUrl: data.featuredImageUrl || data.imageUrl || data.image || null,
          featuredImageUrl: data.featuredImageUrl || null,
          
          // PDF fields
          isPdfArticle: data.isPdfArticle || false,
          pdfUrl: data.pdfUrl || null,
          pdfFileName: data.pdfFileName || null,
          pdfSize: data.pdfSize || null,
          pdfType: data.pdfType || null,
          
          // Image credits
          imageCredit: data.imageCredit || null,
          imageCaption: data.imageCaption || null
        };

        ('✅ Single article retrieved:', articleData.title, 'from', collectionType);
        
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
        ('🔍 Fetching published articles...');
        
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
            
            // Image URLs
            imageUrl: data.featuredImageUrl || data.imageUrl || data.image || null,
            featuredImageUrl: data.featuredImageUrl || null,
            
            // PDF fields
            isPdfArticle: data.isPdfArticle || false,
            pdfUrl: data.pdfUrl || null,
            pdfFileName: data.pdfFileName || null,
            pdfSize: data.pdfSize || null,
            pdfType: data.pdfType || null,
            
            // Image credits
            imageCredit: data.imageCredit || null,
            imageCaption: data.imageCaption || null
          };
        });

        ('📰 Published articles found:', articles.length);
      }

      // Get drafts from 'drafts' collection
      if (type === 'drafts' || type === 'both') {
        ('🔍 Fetching drafts...');
        
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
            
            // Image URLs
            imageUrl: data.featuredImageUrl || data.imageUrl || data.image || null,
            featuredImageUrl: data.featuredImageUrl || null,
            
            // PDF fields
            isPdfArticle: data.isPdfArticle || false,
            pdfUrl: data.pdfUrl || null,
            pdfFileName: data.pdfFileName || null,
            pdfSize: data.pdfSize || null,
            pdfType: data.pdfType || null,
            
            // Image credits
            imageCredit: data.imageCredit || null,
            imageCaption: data.imageCaption || null
          };
        });

        ('✏️ Drafts found:', drafts.length);
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

    ('✅ Content retrieved successfully:', { 
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

// POST handler - Create/Update articles and drafts with PDF support
export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let data = {};
    let publisherId = null;

    ('📝 POST request received, content-type:', contentType);

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      publisherId = data.publisherId || null;
    } else {
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

    ('📝 Saving article for publisherId:', publisherId);

    const isDraft = data.isDraft === 'true' || data.isDraft === true;
    const status = isDraft ? 'draft' : 'published';

    // Prepare article document with PDF support
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
      description: data.description || '',
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
      
      // Image fields
      featuredImageUrl: data.featuredImageUrl || null,
      imageUrl: data.featuredImageUrl || data.imageUrl || null,
      image: data.featuredImageUrl || data.imageUrl || null,
      imageCredit: data.imageCredit || null,
      imageCaption: data.imageCaption || null,
      
      // PDF fields
      isPdfArticle: data.isPdfArticle || false,
      pdfUrl: data.pdfUrl || null,
      pdfFileName: data.pdfFileName || null,
      pdfSize: data.pdfSize ? parseInt(data.pdfSize) : null,
      pdfType: data.pdfType || null,
      
      // Template fields
      templateId: data.templateId ? parseInt(data.templateId) : 3,
      templateCredit: data.templateCredit || null
    };

    // Set createdAt for new articles/drafts
    if (!data.articleId) {
      articleData.createdAt = Timestamp.now();
    }
    
    // Set publishedAt only for published articles
    if (status === 'published') {
      articleData.publishedAt = data.articleId ? (data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : Timestamp.now()) : Timestamp.now();
    }

    ('💾 Article data prepared:', {
      isPdfArticle: articleData.isPdfArticle,
      hasImage: !!articleData.featuredImageUrl,
      hasPdfUrl: !!articleData.pdfUrl
    });

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);
    
    let docRef;
    let message;

    const collectionName = isDraft ? 'drafts' : 'articles';

    if (data.articleId) {
      const currentDraftDoc = await publisherRef.collection('drafts').doc(data.articleId).get();
      const currentArticleDoc = await publisherRef.collection('articles').doc(data.articleId).get();
      
      let currentCollection = null;
      if (currentDraftDoc.exists) currentCollection = 'drafts';
      else if (currentArticleDoc.exists) currentCollection = 'articles';
      
      if (currentCollection && currentCollection !== collectionName) {
        (`🔄 Moving item from ${currentCollection} to ${collectionName}`);
        
        await publisherRef.collection(currentCollection).doc(data.articleId).delete();
        docRef = publisherRef.collection(collectionName).doc(data.articleId);
        await docRef.set(articleData);
        
        message = `Article moved from ${currentCollection} to ${collectionName} successfully`;
      } else if (currentCollection) {
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
      docRef = await publisherRef.collection(collectionName).add(articleData);
      message = `${isDraft ? 'Draft' : 'Article'} created successfully`;
    }

    (`✅ ${message} in collection: ${collectionName}`);

    return NextResponse.json({
      success: true,
      message,
      articleId: typeof docRef === 'string' ? docRef : docRef.id,
      status: articleData.status,
      collection: collectionName,
      isPdfArticle: articleData.isPdfArticle
    });

  } catch (error) {
    console.error('💥 Error in publish-article POST:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete articles or drafts
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

    ('🗑️ Deleting item:', articleId, 'from collection:', collection, 'for publisher:', publisherId);

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
      (`✅ ${collection.slice(0, -1)} deleted successfully from ${collection} collection`);
    } else {
      let deleted = false;
      
      const articleDoc = await publisherRef.collection('articles').doc(articleId).get();
      if (articleDoc.exists) {
        await publisherRef.collection('articles').doc(articleId).delete();
        deleted = true;
        ('✅ Article deleted successfully from articles collection');
      } else {
        const draftDoc = await publisherRef.collection('drafts').doc(articleId).get();
        if (draftDoc.exists) {
          await publisherRef.collection('drafts').doc(articleId).delete();
          deleted = true;
          ('✅ Draft deleted successfully from drafts collection');
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