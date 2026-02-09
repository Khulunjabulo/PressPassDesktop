// app/api/engagement/route.js
import { NextResponse } from 'next/server';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  deleteDoc,
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

// Helper function to normalize reader ID
const normalizeReaderId = (userId) => {
  if (!userId) return null;
  if (userId.startsWith('reader_')) return userId;
  return `reader_${userId}`;
};

// GET - Fetch engagement for an article
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publisherId = searchParams.get('publisherId');
    const articleId = searchParams.get('articleId');
    const userId = searchParams.get('userId');
    
    ('📊 GET engagement:', { publisherId, articleId, userId });

    if (!publisherId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID is required' },
        { status: 400 }
      );
    }

    // If specific article requested
    if (articleId) {
      const articleRef = doc(db, 'publishers', publisherId, 'articles', articleId);
      const articleDoc = await getDoc(articleRef);

      if (!articleDoc.exists()) {
        ('❌ Article not found:', articleId);
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { status: 404 }
        );
      }

      const articleData = articleDoc.data();
      const likeCount = articleData.likeCount || 0;

      // Check if current user has liked
      let userHasLiked = false;
      if (userId) {
        const readerId = normalizeReaderId(userId);
        const engagementRef = doc(db, 'publishers', publisherId, 'articles', articleId, 'engagements', readerId);
        const engagementDoc = await getDoc(engagementRef);
        userHasLiked = engagementDoc.exists() && engagementDoc.data().liked;
      }

      ('✅ Engagement data:', { likeCount, userHasLiked });

      return NextResponse.json({
        success: true,
        articleId,
        likeCount,
        userHasLiked,
        views: articleData.views || 0
      });
    }

    // Fetch all articles engagement
    const articlesRef = collection(db, 'publishers', publisherId, 'articles');
    const articlesSnapshot = await getDocs(articlesRef);

    let totalLikes = 0;
    let totalViews = 0;
    const articleEngagements = [];

    articlesSnapshot.forEach((articleDoc) => {
      const data = articleDoc.data();
      const likeCount = data.likeCount || 0;
      const views = data.views || 0;

      totalLikes += likeCount;
      totalViews += views;

      articleEngagements.push({
        articleId: articleDoc.id,
        title: data.title,
        likeCount,
        views,
        createdAt: data.createdAt
      });
    });

    return NextResponse.json({
      success: true,
      publisherId,
      totalLikes,
      totalViews,
      totalArticles: articleEngagements.length,
      articles: articleEngagements
    });

  } catch (error) {
    console.error('❌ Error in GET /api/engagement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Like/Unlike an article
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, publisherId, articleId, action } = body;

    ('💙 POST engagement:', { userId, publisherId, articleId, action });

    if (!userId || !publisherId || !articleId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const readerId = normalizeReaderId(userId);
    const articleRef = doc(db, 'publishers', publisherId, 'articles', articleId);
    const engagementRef = doc(db, 'publishers', publisherId, 'articles', articleId, 'engagements', readerId);

    // Check if article exists
    const articleDoc = await getDoc(articleRef);
    if (!articleDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    if (action === 'like') {
      // Check if already liked
      const engagementDoc = await getDoc(engagementRef);
      if (engagementDoc.exists() && engagementDoc.data().liked) {
        return NextResponse.json(
          { success: false, error: 'Already liked' },
          { status: 409 }
        );
      }

      // Add like
      await setDoc(engagementRef, {
        readerId: readerId,
        liked: true,
        likedAt: serverTimestamp()
      });

      // Increment like count
      await setDoc(articleRef, {
        likeCount: increment(1),
        lastEngagement: serverTimestamp()
      }, { merge: true });

      ('✅ Article liked');

      return NextResponse.json({
        success: true,
        message: 'Article liked',
        action: 'like'
      });

    } else if (action === 'unlike') {
      // Remove like
      await deleteDoc(engagementRef);

      // Decrement like count
      await setDoc(articleRef, {
        likeCount: increment(-1),
        lastEngagement: serverTimestamp()
      }, { merge: true });

      ('✅ Article unliked');

      return NextResponse.json({
        success: true,
        message: 'Article unliked',
        action: 'unlike'
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Error in POST /api/engagement:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
