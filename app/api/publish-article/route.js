// app/api/publish-article/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs if needed
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let data = {};
    let publisherId = null;

    // Handle FormData from ManualArticleForm
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();

      // Convert FormData to plain object
      formData.forEach((value, key) => {
        data[key] = value;
      });

      publisherId = data.publisherId || null;
    } else {
      // Handle JSON fallback
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

    console.log('📝 Saving article for publisherId:', publisherId);

    // Prepare article document
    const articleData = {
      title: data.title || '',
      subtitle: data.subtitle || '',
      author: data.author || '',
      authorTitle: data.authorTitle || '',
      category: data.category || '',
      tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      style: data.style || 'modern',
      content: data.content || '',
      metaDescription: data.metaDescription || '',
      publishNow: data.publishNow === 'true' || data.publishNow === true,
      allowComments: data.allowComments === 'true' || data.allowComments === true,
      sendNewsletter: data.sendNewsletter === 'true' || data.sendNewsletter === true,
      isDraft: data.isDraft === 'true' || data.isDraft === true,
      wordCount: parseInt(data.wordCount || '0', 10),
      readingTime: parseInt(data.readingTime || '0', 10),
      publisherId,
      publisherName: data.publisherName || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: data.isDraft ? 'draft' : 'published',
    };

    // ✅ TODO: Upload featuredImage to Firebase Storage if provided
    if (data.featuredImage && typeof data.featuredImage !== 'string') {
      console.log('🖼️ Featured image detected - needs upload handling');
      // Storage upload logic can be added here
    }

    const db = getFirestoreDb();
    const docRef = await db
      .collection('publishers')
      .doc(publisherId)
      .collection('articles')
      .add(articleData);

    return NextResponse.json({
      success: true,
      message: 'Article saved successfully',
      articleId: docRef.id,
    });

  } catch (error) {
    console.error('💥 Error in publish-article POST:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Optional GET handler
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'GET not supported on this endpoint' },
    { status: 405 }
  );
}
