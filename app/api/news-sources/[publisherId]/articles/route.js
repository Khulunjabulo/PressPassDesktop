// app/api/news-sources/[publisherId]/articles/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin.js';

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
    console.log('📊 Processing', articlesSnapshot.size, 'published articles...');
    
    articlesSnapshot.forEach((doc) => {
      const articleData = doc.data();
      
      // 🔍 DEBUG: Log each article's RSS status
      console.log('📄 Article:', articleData.title?.substring(0, 40), '| isRssFeed:', articleData.isRssFeed, '| rssFeedId:', articleData.rssFeedId);
      
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
        isDraft: false,
        // ✅ RSS FEED FIELDS - CRITICAL: Check for existence first
        isRssFeed: articleData.isRssFeed === true, // ← FIXED: Explicit boolean check
        rssFeedId: articleData.rssFeedId || null,
        rssFeedName: articleData.rssFeedName || null,
        rssFeedUrl: articleData.rssFeedUrl || null,
        link: articleData.link || null, // Original RSS article link
        guid: articleData.guid || null // RSS article unique identifier
      });
    });
    
    // Process drafts (include them as well for completeness)
    console.log('📊 Processing', draftsSnapshot.size, 'draft articles...');
    
    draftsSnapshot.forEach((doc) => {
      const articleData = doc.data();
      
      // 🔍 DEBUG: Log each draft's RSS status
      console.log('📄 Draft:', articleData.title?.substring(0, 40), '| isRssFeed:', articleData.isRssFeed);
      
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
        isDraft: true,
        // ✅ RSS FEED FIELDS - CRITICAL: Explicit boolean check
        isRssFeed: articleData.isRssFeed === true, // ← FIXED
        rssFeedId: articleData.rssFeedId || null,
        rssFeedName: articleData.rssFeedName || null,
        rssFeedUrl: articleData.rssFeedUrl || null,
        link: articleData.link || null,
        guid: articleData.guid || null
      });
    });
    
    // Count RSS articles
    const rssArticlesCount = articles.filter(a => a.isRssFeed === true).length;
    
    console.log('📰 Total articles found:', articles.length);
    console.log('📡 RSS feed articles:', rssArticlesCount);
    console.log('🖼️ Articles with images:', articles.filter(a => a.imageUrl).length);
    
    // 🔍 DEBUG: List all RSS articles found
    if (rssArticlesCount > 0) {
      console.log('📡 RSS Articles Details:');
      articles.filter(a => a.isRssFeed).forEach((article, idx) => {
        console.log(`  ${idx + 1}. "${article.title.substring(0, 50)}" - Feed: ${article.rssFeedName}`);
      });
    } else {
      console.log('⚠️ NO RSS ARTICLES FOUND - Checking why...');
      articles.forEach((article, idx) => {
        console.log(`  ${idx + 1}. "${article.title.substring(0, 50)}" - isRssFeed: ${article.isRssFeed}, rssFeedId: ${article.rssFeedId}`);
      });
    }
    
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
      drafts: articles.filter(a => a.isDraft).length,
      rssArticles: rssArticlesCount // ✅ NEW: Count RSS articles
    });
    
  } catch (error) {
    console.error('💥 Error fetching publisher articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch publisher articles', details: error.message },
      { status: 500 }
    );
  }
}