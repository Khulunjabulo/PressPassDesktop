// app/api/news-sources/route.js (More Robust Version)
import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

export async function GET() {
  try {
    console.log('Fetching news sources...');
    
    // Fetch all publishers first (without filtering by isActive to debug)
    const publishersRef = collection(db, 'publishers');
    let publishersQuery;
    
    try {
      // Try with isActive filter first
      publishersQuery = query(
        publishersRef,
        where('isActive', '==', true)
      );
    } catch (error) {
      console.warn('Error with isActive filter, fetching all publishers:', error);
      // Fallback: fetch all publishers
      publishersQuery = query(publishersRef);
    }
    
    const publishersSnapshot = await getDocs(publishersQuery);
    console.log(`Found ${publishersSnapshot.size} publishers`);
    
    if (publishersSnapshot.empty) {
      return NextResponse.json({
        success: true,
        newsources: []
      });
    }
    
    const publishers = [];

    for (const doc of publishersSnapshot.docs) {
      try {
        const publisherData = doc.data();
        console.log(`Processing publisher: ${publisherData.companyName || doc.id}`);
        
        // Skip if not active (if the field exists)
        if (publisherData.hasOwnProperty('isActive') && !publisherData.isActive) {
          console.log(`Skipping inactive publisher: ${publisherData.companyName || doc.id}`);
          continue;
        }
        
        // Get article count for this publisher from their subcollection
        let articleCount = 0;
        let lastPosted = 'Just registered';
        let lastPostedDate = publisherData.createdAt?.toDate ? publisherData.createdAt.toDate() : new Date();
        
        try {
          const articlesRef = collection(db, 'publishers', doc.id, 'articles');
          const articlesSnapshot = await getDocs(articlesRef);
          articleCount = articlesSnapshot.size;
          console.log(`Publisher ${publisherData.companyName || doc.id} has ${articleCount} articles`);
          
          if (articleCount > 0) {
            // Try to get the latest article
            try {
              const latestArticleQuery = query(
                articlesRef,
                orderBy('createdAt', 'desc'),
                limit(1)
              );
              const latestSnapshot = await getDocs(latestArticleQuery);
              if (!latestSnapshot.empty) {
                const latestArticle = latestSnapshot.docs[0].data();
                lastPostedDate = latestArticle.createdAt?.toDate ? latestArticle.createdAt.toDate() : new Date();
                lastPosted = formatTimeAgo(lastPostedDate);
              }
            } catch (orderError) {
              console.warn(`Could not order articles for ${publisherData.companyName}:`, orderError);
              // Fallback: just indicate they have articles
              lastPosted = 'Recently';
            }
          }
        } catch (articlesError) {
          console.warn(`Error fetching articles for ${publisherData.companyName}:`, articlesError);
          // Continue with articleCount = 0
        }

        publishers.push({
          id: doc.id,
          name: publisherData.companyName || 'Unnamed Publisher',
          city: publisherData.city || "",
          logo: publisherData.companyLogo || null,
          industry: publisherData.industry || 'General',
          publicationType: publisherData.publicationType || 'News',
          audienceType: publisherData.audienceType || 'General',
          website: publisherData.companyWebsite || null,
          description: publisherData.description || '',
          articleCount,
          lastPosted,
          lastPostedDate,
          createdAt: publisherData.createdAt || null,
          isActive: publisherData.isActive !== undefined ? publisherData.isActive : true,
          hasArticles: articleCount > 0
        });
      } catch (publisherError) {
        console.error(`Error processing publisher ${doc.id}:`, publisherError);
        // Continue with next publisher
        continue;
      }
    }

    console.log(`Successfully processed ${publishers.length} publishers`);

    // Sort publishers (newest first, handling missing dates)
    publishers.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      newsources: publishers
    });

  } catch (error) {
    console.error('Error fetching news sources:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news sources',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date) {
  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  } catch (error) {
    console.warn('Error formatting time:', error);
    return 'Recently';
  }
}