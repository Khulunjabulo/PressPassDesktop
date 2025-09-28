// app/api/news-sources/[publisherId]/articles/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';

export async function GET(request, { params }) {
  try {
    const { publisherId } = await params;
    
    console.log('🔍 Fetching articles for publisher:', publisherId);
    
    const db = getFirestoreDb();
    
    // Get publisher info
    const publisherRef = db.collection('publishers').doc(publisherId);
    const publisherSnap = await publisherRef.get();
    
    if (!publisherSnap.exists) {
      console.log('❌ Publisher not found:', publisherId);
      return NextResponse.json(
        { success: false, error: 'Publisher not found' },
        { status: 404 }
      );
    }
    
    const publisherData = publisherSnap.data();
    console.log('✅ Publisher found:', publisherData.companyName);
    
    // Get articles from BOTH articles and drafts collections
    const articlesSnapshot = await publisherRef
      .collection('articles')
      .orderBy('updatedAt', 'desc')
      .get();
    
    const draftsSnapshot = await publisherRef
      .collection('drafts')
      .orderBy('updatedAt', 'desc')
      .get();
    
    const articles = [];
    
    // Process published articles
    articlesSnapshot.forEach((doc) => {
      const articleData = doc.data();
      
      // Enhanced image URL extraction
      let imageUrl = articleData.featuredImageUrl || 
                    articleData.imageUrl || 
                    articleData.image || 
                    articleData.featuredImage || 
                    null;
      
      // Try to extract image from content if no featured image
      if (!imageUrl && articleData.content) {
        const contentImageMatch = articleData.content.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|svg)/i);
        if (contentImageMatch) {
          imageUrl = contentImageMatch[0];
        }
      }
      
      articles.push({
        id: doc.id,
        title: articleData.title || 'Untitled',
        subtitle: articleData.subtitle || '',
        content: articleData.content || '',
        summary: articleData.summary || articleData.metaDescription || '',
        category: articleData.category || 'General',
        tags: articleData.tags || [],
        author: articleData.author || publisherData.companyName,
        authorTitle: articleData.authorTitle || '',
        imageUrl: imageUrl, // Main featured image
        featuredImageUrl: articleData.featuredImageUrl, // Keep original field too
        createdAt: articleData.createdAt,
        updatedAt: articleData.updatedAt,
        publishedAt: articleData.publishedAt,
        status: articleData.status || 'published',
        readTime: articleData.readingTime || articleData.readTime || 5,
        wordCount: articleData.wordCount || 0,
        views: articleData.views || 0,
        likes: articleData.likes || 0,
        comments: articleData.comments || 0,
        priority: articleData.priority || 'normal',
        style: articleData.style || 'modern',
        allowComments: articleData.allowComments !== false,
        isDraft: false
      });
    });
    
    // Process drafts (include them as well for completeness)
    draftsSnapshot.forEach((doc) => {
      const articleData = doc.data();
      
      // Enhanced image URL extraction for drafts too
      let imageUrl = articleData.featuredImageUrl || 
                    articleData.imageUrl || 
                    articleData.image || 
                    articleData.featuredImage || 
                    null;
      
      if (!imageUrl && articleData.content) {
        const contentImageMatch = articleData.content.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|svg)/i);
        if (contentImageMatch) {
          imageUrl = contentImageMatch[0];
        }
      }
      
      articles.push({
        id: doc.id,
        title: articleData.title || 'Untitled Draft',
        subtitle: articleData.subtitle || '',
        content: articleData.content || '',
        summary: articleData.summary || articleData.metaDescription || '',
        category: articleData.category || 'General',
        tags: articleData.tags || [],
        author: articleData.author || publisherData.companyName,
        authorTitle: articleData.authorTitle || '',
        imageUrl: imageUrl,
        featuredImageUrl: articleData.featuredImageUrl,
        createdAt: articleData.createdAt,
        updatedAt: articleData.updatedAt,
        publishedAt: null,
        status: 'draft',
        readTime: articleData.readingTime || articleData.readTime || 5,
        wordCount: articleData.wordCount || 0,
        views: 0,
        likes: 0,
        comments: 0,
        priority: articleData.priority || 'normal',
        style: articleData.style || 'modern',
        allowComments: articleData.allowComments !== false,
        isDraft: true
      });
    });
    
    console.log('📰 Total articles found:', articles.length);
    console.log('🖼️ Articles with images:', articles.filter(a => a.imageUrl).length);
    
    return NextResponse.json({
      success: true,
      publisher: {
        id: publisherId,
        name: publisherData.companyName || publisherData.name,
        logo: publisherData.companyLogo || publisherData.logo || null,
        industry: publisherData.industry || 'Publishing',
        description: publisherData.description || '',
        website: publisherData.companyWebsite || publisherData.website,
        publicationType: publisherData.publicationType || 'Digital',
        audienceType: publisherData.audienceType || 'General'
      },
      articles: articles,
      totalArticles: articles.length,
      publishedArticles: articles.filter(a => !a.isDraft).length,
      drafts: articles.filter(a => a.isDraft).length
    });
    
  } catch (error) {
    console.error('💥 Error fetching publisher articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch publisher articles', details: error.message },
      { status: 500 }
    );
  }
}