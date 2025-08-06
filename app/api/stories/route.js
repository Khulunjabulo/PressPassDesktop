import { NextResponse } from 'next/server';
import { db } from '@/Firebase/firebase';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

// POST - Create a new story
export async function POST(request) {
  try {
    // Check if database is available
    if (!db) {
      console.error('Database not initialized');
      return NextResponse.json(
        { error: 'Database connection not available. Please check Firebase configuration.' },
        { status: 503 }
      );
    }

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
    // Check if database is available
    if (!db) {
      console.error('Database not initialized');
      return NextResponse.json(
        { error: 'Database connection not available. Please check Firebase configuration.' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    
    // Validate status parameter
    const validStatuses = ['published', 'draft', 'review'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    
    let q;
    
    if (category && category !== 'all') {
      // For category filtering, we need to handle the composite index requirement
      // First get all published stories, then filter by category in memory
      q = query(
        collection(db, 'stories'),
        where('status', '==', status),
        where('category', 'array-contains', category)
      );
    } else {
      // For all stories, we can use orderBy directly
      q = query(
        collection(db, 'stories'),
        where('status', '==', status),
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

    // Sort by createdAt in descending order (newest first)
    // This is especially important for category-filtered results
    stories.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    return NextResponse.json({ stories });

  } catch (error) {
    console.error('Error fetching stories:', error);
    
    // Check if it's a Firebase connection issue
    if (error.code === 'unavailable' || error.message.includes('UNAVAILABLE')) {
      return NextResponse.json(
        { error: 'Database temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }
    
    // Check if it's a permission issue
    if (error.code === 'permission-denied') {
      return NextResponse.json(
        { error: 'Database access denied. Please check Firebase rules.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch stories', details: error.message },
      { status: 500 }
    );
  }
}