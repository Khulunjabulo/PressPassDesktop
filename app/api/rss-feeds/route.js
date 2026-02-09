// app/api/rss-feeds/route.js
import { NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';
import Parser from 'rss-parser';

const db = getFirestore(app);
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
      ['enclosure', 'enclosure']
    ]
  }
});

// ✅ CRITICAL FIX: Ensure publisher ID always has the prefix
function ensurePublisherPrefix(publisherId) {
  if (!publisherId) return null;
  
  // If it already starts with "publisher_", return as is
  if (publisherId.startsWith('publisher_')) {
    return publisherId;
  }
  
  // Otherwise, add the prefix
  return `publisher_${publisherId}`;
}

// Helper to extract image from RSS item
function extractImage(item) {
  // Try different image sources
  if (item.enclosure?.url) return item.enclosure.url;
  if (item.media?.$ && item.media.$.url) return item.media.$.url;
  if (item.thumbnail?.$ && item.thumbnail.$.url) return item.thumbnail.$.url;
  if (item['media:content']?.$ && item['media:content'].$.url) return item['media:content'].$.url;
  
  // Try to extract from content
  if (item.content || item.description) {
    const content = item.content || item.description;
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  
  return null;
}

// POST - Add new RSS feed and preview it
export async function POST(request) {
  try {
    const body = await request.json();
    let { publisherId, feedUrl, feedName, action } = body;

    ('🔍 RSS Feed Request (BEFORE FIX):', { publisherId, feedUrl, feedName, action });

    // ✅ FIX: Ensure publisher ID has the correct prefix
    publisherId = ensurePublisherPrefix(publisherId);
    
    ('✅ RSS Feed Request (AFTER FIX):', { publisherId, feedUrl, feedName, action });

    if (!publisherId || !feedUrl) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID and feed URL are required' },
        { status: 400 }
      );
    }

    // Verify publisher exists
    const publisherRef = doc(db, 'publishers', publisherId);
    const publisherSnap = await getDoc(publisherRef);
    
    if (!publisherSnap.exists()) {
      console.error('❌ Publisher not found:', publisherId);
      return NextResponse.json(
        { success: false, error: `Publisher not found with ID: ${publisherId}` },
        { status: 404 }
      );
    }

    const publisherData = publisherSnap.data();
    ('✅ Publisher found:', publisherData.companyName, '| ID:', publisherId);

    (`📡 Fetching RSS feed: ${feedUrl}`);

    // Parse RSS feed
    let feed;
    try {
      feed = await parser.parseURL(feedUrl);
      ('✅ RSS feed parsed successfully:', {
        title: feed.title,
        itemCount: feed.items?.length || 0,
        firstItem: feed.items?.[0]?.title
      });
    } catch (error) {
      console.error('❌ RSS parsing error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to parse RSS feed. Please check the URL.' },
        { status: 400 }
      );
    }

    // Check if feed has items
    if (!feed.items || feed.items.length === 0) {
      console.warn('⚠️ RSS feed has no items');
      return NextResponse.json(
        { success: false, error: 'RSS feed contains no articles' },
        { status: 400 }
      );
    }

    // Extract articles from feed
    const articles = feed.items.map(item => {
      const article = {
        title: item.title || 'Untitled',
        content: item.contentSnippet || item.description || item.content || '',
        summary: (item.contentSnippet || item.description || item.content || '').substring(0, 200),
        link: item.link || '',
        imageUrl: extractImage(item),
        publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        author: item.creator || item.author || feed.title || 'RSS Feed',
        category: item.categories?.[0] || 'General',
        guid: item.guid || item.link || `${feed.title}-${item.title}-${Date.now()}`
      };
      
      ('📄 Extracted article:', {
        title: article.title?.substring(0, 50),
        hasContent: !!article.content,
        hasImage: !!article.imageUrl,
        guid: article.guid?.substring(0, 50)
      });
      
      return article;
    });

    (`📊 Total articles extracted: ${articles.length}`);

    // If action is 'preview', just return the articles
    if (action === 'preview') {
      return NextResponse.json({
        success: true,
        preview: true,
        feedInfo: {
          title: feed.title,
          description: feed.description,
          link: feed.link,
          totalArticles: articles.length
        },
        articles
      });
    }

    // If action is 'publish', save to Firestore
    if (action === 'publish') {
      ('📝 Starting to publish RSS feed to Firestore...');
      (`📍 Using Publisher ID: ${publisherId}`);
      
      // Save RSS feed metadata
      const rssFeedRef = collection(db, 'publishers', publisherId, 'rssFeeds');
      const feedDoc = await addDoc(rssFeedRef, {
        feedName: feedName || feed.title,
        feedUrl,
        feedTitle: feed.title || '',
        feedDescription: feed.description || '',
        feedLink: feed.link || '',
        totalArticles: articles.length,
        lastFetched: serverTimestamp(),
        createdAt: serverTimestamp(),
        isActive: true,
        autoSync: true,
        publisherId,
        publisherName: publisherData.companyName || 'Unknown Publisher'
      });

      (`✅ RSS feed metadata saved with ID: ${feedDoc.id}`);
      (`✅ RSS feed path: publishers/${publisherId}/rssFeeds/${feedDoc.id}`);

      // Save each article to articles subcollection
      const articlesRef = collection(db, 'publishers', publisherId, 'articles');
      const savedArticles = [];
      let successCount = 0;
      let errorCount = 0;

      (`💾 Starting to save ${articles.length} articles to Firestore...`);
      (`📍 Articles collection path: publishers/${publisherId}/articles`);

      for (const article of articles) {
        try {
          // Validate required fields before saving
          if (!article.title || !article.guid) {
            console.warn('⚠️ Skipping article without title or guid:', article);
            errorCount++;
            continue;
          }

          const articleData = {
            title: article.title,
            content: article.content || '',
            summary: article.summary || '',
            link: article.link || '',
            imageUrl: article.imageUrl || null,
            featuredImageUrl: article.imageUrl || null,
            publishedDate: article.publishedDate,
            author: article.author,
            category: article.category,
            tags: [],
            guid: article.guid,
            // 🔥 CRITICAL: RSS Feed flags
            isRssFeed: true,
            rssFeedId: feedDoc.id,
            rssFeedName: feedName || feed.title || 'RSS Feed',
            rssFeedUrl: feedUrl,
            // Publisher info - ✅ NOW USING CORRECT PREFIXED ID
            publisherId,
            publisherName: publisherData.companyName || 'Unknown Publisher',
            publisherLogo: publisherData.companyLogo || null,
            // Article metadata
            status: 'published',
            views: 0,
            likeCount: 0,
            wordCount: article.content ? article.content.split(' ').length : 0,
            readTime: article.content ? Math.ceil(article.content.split(' ').length / 200) : 5,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          (`  💾 Saving article: "${article.title.substring(0, 50)}..."`);
          (`  📊 Article data:`, {
            hasTitle: !!articleData.title,
            hasContent: !!articleData.content,
            hasImage: !!articleData.imageUrl,
            isRssFeed: articleData.isRssFeed,
            rssFeedId: articleData.rssFeedId,
            publisherId: articleData.publisherId, // ✅ Should now have prefix
            category: articleData.category
          });
          
          const articleDoc = await addDoc(articlesRef, articleData);
          
          savedArticles.push({ id: articleDoc.id, ...article });
          successCount++;
          (`  ✅ Article saved with ID: ${articleDoc.id}`);
          (`  ✅ Article path: publishers/${publisherId}/articles/${articleDoc.id}`);
        } catch (error) {
          errorCount++;
          console.error(`  ❌ Failed to save article "${article.title}":`, error);
          console.error(`  Error details:`, error.message);
        }
      }

      (`📊 Save complete: ${successCount} successful, ${errorCount} failed`);

      if (successCount === 0) {
        console.error('❌ No articles were saved, deleting RSS feed metadata...');
        // If no articles were saved, delete the feed document
        const feedDocRef = doc(db, 'publishers', publisherId, 'rssFeeds', feedDoc.id);
        await deleteDoc(feedDocRef);
        return NextResponse.json(
          { success: false, error: 'Failed to save any articles from the RSS feed' },
          { status: 500 }
        );
      }

      (`🎉 RSS feed published successfully! ${successCount} articles added.`);

      return NextResponse.json({
        success: true,
        message: 'RSS feed published successfully',
        feedId: feedDoc.id,
        articlesPublished: savedArticles.length,
        successCount,
        errorCount,
        articles: savedArticles,
        publisherId // ✅ Return the corrected publisher ID
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "preview" or "publish"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error in RSS feed API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch all RSS feeds for a publisher
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let publisherId = searchParams.get('publisherId');

    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    // ✅ FIX: Ensure publisher ID has the correct prefix
    publisherId = ensurePublisherPrefix(publisherId);
    ('✅ Fetching RSS feeds for publisher:', publisherId);

    const rssFeedsRef = collection(db, 'publishers', publisherId, 'rssFeeds');
    const q = query(rssFeedsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const feeds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      lastFetched: doc.data().lastFetched?.toDate?.() || null
    }));

    (`✅ Found ${feeds.length} RSS feeds for publisher ${publisherId}`);

    return NextResponse.json({
      success: true,
      feeds
    });

  } catch (error) {
    console.error('❌ Error fetching RSS feeds:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}