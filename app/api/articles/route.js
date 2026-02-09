// app/api/articles/route.js
import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

export async function GET(request) {
  try {
    ('📚 Fetching all articles from all publishers...');
    
    const allArticles = [];

    // Get all publishers
    const publishersRef = collection(db, 'publishers');
    const publishersSnapshot = await getDocs(publishersRef);
    (`📊 Found ${publishersSnapshot.size} publishers`);

    // Loop through each publisher and get their articles
    for (const publisherDoc of publishersSnapshot.docs) {
      try {
        const publisherId = publisherDoc.id;
        const publisherData = publisherDoc.data();
        
        (`📖 Fetching articles for: ${publisherData.companyName || publisherId}`);
        
        // Get articles subcollection for this publisher
        const articlesRef = collection(db, 'publishers', publisherId, 'articles');
        const articlesSnapshot = await getDocs(articlesRef);
        
        (`  ✅ Found ${articlesSnapshot.size} articles`);

        // Add each article to the list with publisher info
        articlesSnapshot.docs.forEach(articleDoc => {
          const articleData = articleDoc.data();
          
          allArticles.push({
            id: articleDoc.id,
            ...articleData,
            publisherId: publisherId,
            publisherName: publisherData.companyName || 'Unknown Publisher',
            // Ensure author field is present
            author: articleData.author || articleData.authorName || 'Unknown Author',
            authorName: articleData.author || articleData.authorName || 'Unknown Author',
            // Convert Firestore timestamps to ISO strings
            createdAt: articleData.createdAt?.toDate 
              ? articleData.createdAt.toDate().toISOString() 
              : articleData.createdAt,
            updatedAt: articleData.updatedAt?.toDate 
              ? articleData.updatedAt.toDate().toISOString() 
              : articleData.updatedAt,
            // Ensure numeric fields
            views: parseInt(articleData.views) || 0,
            engagement: parseFloat(articleData.engagement) || 0,
            likes: parseInt(articleData.likes) || 0,
            comments: parseInt(articleData.comments) || 0,
            shares: parseInt(articleData.shares) || 0
          });
        });
      } catch (error) {
        console.error(`❌ Error fetching articles for publisher ${publisherDoc.id}:`, error);
        // Continue with next publisher
      }
    }

    (`✅ Total articles fetched: ${allArticles.length}`);

    // Sort by creation date (newest first)
    allArticles.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    // Log some sample authors for debugging
    const sampleAuthors = allArticles.slice(0, 5).map(a => ({
      title: a.title?.substring(0, 30),
      author: a.author
    }));
    ('📝 Sample article authors:', sampleAuthors);

    return NextResponse.json({
      success: true,
      articles: allArticles,
      count: allArticles.length
    });

  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
        details: error.message
      },
      { status: 500 }
    );
  }
}