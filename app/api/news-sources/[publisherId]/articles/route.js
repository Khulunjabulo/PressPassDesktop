// app/api/news-sources/[publisherId]/articles/route.js
import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

export async function GET(request, { params }) {
  try {
    // Await params before destructuring (Next.js 15 requirement)
    const { publisherId } = await params;
    
    // First, get publisher info
    const publisherRef = doc(db, 'publishers', publisherId);
    const publisherSnap = await getDoc(publisherRef);
    
    if (!publisherSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Publisher not found'
        },
        { status: 404 }
      );
    }
    
    const publisherData = publisherSnap.data();
    
    // Get articles from the publisher's subcollection
    const articlesRef = collection(db, 'publishers', publisherId, 'articles');
    const articlesQuery = query(
      articlesRef,
      orderBy('createdAt', 'desc')
    );
    
    const articlesSnapshot = await getDocs(articlesQuery);
    const articles = [];
    
    articlesSnapshot.forEach((doc) => {
      const articleData = doc.data();
      articles.push({
        id: doc.id,
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary || '',
        category: articleData.category,
        tags: articleData.tags || [],
        imageUrl: articleData.imageUrl || null,
        createdAt: articleData.createdAt,
        updatedAt: articleData.updatedAt,
        status: articleData.status || 'published',
        readTime: articleData.readTime || 0,
        views: articleData.views || 0
      });
    });
    
    return NextResponse.json({
      success: true,
      publisher: {
        id: publisherId,
        name: publisherData.companyName,
        logo: publisherData.companyLogo || null,
        industry: publisherData.industry,
        description: publisherData.description || '',
        website: publisherData.companyWebsite,
        publicationType: publisherData.publicationType,
        audienceType: publisherData.audienceType
      },
      articles,
      totalArticles: articles.length
    });
    
  } catch (error) {
    console.error('Error fetching publisher articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch publisher articles'
      },
      { status: 500 }
    );
  }
}