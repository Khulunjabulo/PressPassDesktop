// app/api/news-sources/route.js
import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

export async function GET() {
  try {
    // Fetch all active publishers
    const publishersRef = collection(db, 'publishers');
    const publishersQuery = query(
      publishersRef, 
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const publishersSnapshot = await getDocs(publishersQuery);
    const publishers = [];

    for (const doc of publishersSnapshot.docs) {
      const publisherData = doc.data();
      
      // Get article count for this publisher
      const articlesRef = collection(db, 'articles');
      const articlesQuery = query(
        articlesRef,
        where('publisherId', '==', doc.id)
      );
      
      const articlesSnapshot = await getDocs(articlesQuery);
      const articleCount = articlesSnapshot.size;
      
      // Handle last posted - show registration date if no articles yet
      let lastPosted = '--';
      if (articleCount > 0) {
        // Get the latest article for last posted time
        const latestArticleQuery = query(
          articlesRef,
          where('publisherId', '==', doc.id),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const latestSnapshot = await getDocs(latestArticleQuery);
        if (!latestSnapshot.empty) {
          const latestArticle = latestSnapshot.docs[0].data();
          const lastPostDate = latestArticle.createdAt?.toDate() || new Date();
          lastPosted = formatTimeAgo(lastPostDate);
        }
      }

      publishers.push({
        id: doc.id,
        name: publisherData.companyName,
        logo: publisherData.companyLogo || null,
        industry: publisherData.industry,
        publicationType: publisherData.publicationType,
        audienceType: publisherData.audienceType,
        website: publisherData.companyWebsite,
        articleCount,
        lastPosted,
        createdAt: publisherData.createdAt,
        isActive: publisherData.isActive
      });
    }

    return NextResponse.json({ 
      success: true, 
      newsources: publishers 
    });

  } catch (error) {
    console.error('Error fetching news sources:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news sources' 
      },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}