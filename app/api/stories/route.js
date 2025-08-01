import { NextResponse } from 'next/server';
import { db } from '@/Firebase/firebase';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

// POST - Create a new story
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.headline || !data.body) {
      return NextResponse.json(
        { error: 'Headline and body are required' },
        { status: 400 }
      );
    }

    // Create story document
    const storyData = {
      headline: data.headline,
      byline: data.byline || '',
      location: data.location || '',
      section: data.section || 'General',
      edition: data.edition || 'Morning Edition',
      priority: data.priority || 'normal',
      lead: data.lead || '',
      body: data.body,
      pdfUrl: data.pdfUrl || null,
      fileName: data.fileName || null,
      fileSize: data.fileSize || null,
      previewStyle: data.previewStyle || 'Modern',
      action: data.action || 'draft', // draft, review, publish
      status: data.action === 'publish' ? 'published' : 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: data.action === 'publish' ? new Date().toISOString() : null,
      // Additional fields for news-reader compatibility
      title: data.headline,
      description: data.lead || data.body.substring(0, 200) + '...',
      creator: data.byline || 'Staff Writer',
      source_id: 'presspass',
      image_url: null, // Could be extracted from PDF or added separately
      pubDate: data.action === 'publish' ? new Date().toISOString() : null,
      link: null, // Will be generated for read-more functionality
      category: [data.section?.toLowerCase() || 'general']
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'stories'), storyData);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: `Story ${data.action === 'publish' ? 'published' : 'saved'} successfully!`
    });

  } catch (error) {
    console.error('Error saving story:', error);
    return NextResponse.json(
      { error: 'Failed to save story' },
      { status: 500 }
    );
  }
}

// GET - Fetch stories
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    
    let q = query(
      collection(db, 'stories'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    if (category && category !== 'all') {
      q = query(
        collection(db, 'stories'),
        where('status', '==', status),
        where('category', 'array-contains', category),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const stories = [];
    
    querySnapshot.forEach((doc) => {
      stories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return NextResponse.json({ stories });

  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}