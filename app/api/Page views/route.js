// app/api/track-view/route.js
import { NextResponse } from 'next/server';
import { getFirestore, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { app } from '@/Firebase/firebase';

const db = getFirestore(app);

/**
 * POST - Increment the view count for an article.
 * Expects { articleId: string, publisherId: string } in the body.
 */
export async function POST(request) {
  try {
    const { articleId, publisherId } = await request.json();

    if (!articleId || !publisherId) {
      return NextResponse.json(
        { success: false, error: 'articleId and publisherId are required' },
        { status: 400 }
      );
    }

    console.log(`👁️ Tracking view for article: ${articleId} of publisher: ${publisherId}`);

    // The path to the article could be in 'articles' or 'drafts' but views are usually for published articles.
    const articleRef = doc(db, 'publishers', publisherId, 'articles', articleId);

    const articleDoc = await getDoc(articleRef);

    if (!articleDoc.exists()) {
        // It might be a draft or an old article, let's not error out, just log it.
        console.warn(`Article with ID ${articleId} not found for view tracking.`);
        // We can still return success to not break the client-side flow.
        return NextResponse.json({ success: true, message: 'Article not found, view not tracked.' });
    }

    // Atomically increment the 'views' field.
    await updateDoc(articleRef, {
      views: increment(1)
    });

    console.log(`✅ View count incremented for article: ${articleId}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error tracking view:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track view' },
      { status: 500 }
    );
  }
}