// app/api/classifieds/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase-admin/firestore';

// GET handler - Retrieve classifieds for all users or specific user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    const classifiedId = searchParams.get('classifiedId');

    ('📖 GET classifieds request params:', { publisherId, classifiedId });

    // Test Firebase connection first
    let db;
    try {
      db = getFirestoreDb();
      ('✅ Firebase connection established');
    } catch (firebaseError) {
      console.error('❌ Firebase connection failed:', firebaseError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed', details: firebaseError.message },
        { status: 500 }
      );
    }

    // If requesting a specific classified
    if (classifiedId && publisherId && publisherId !== 'all') {
      try {
        const publisherRef = db.collection('publishers').doc(publisherId);
        const classifiedDoc = await publisherRef
          .collection('classifieds')
          .doc(classifiedId)
          .get();

        if (!classifiedDoc.exists) {
          ('❌ Classified not found:', classifiedId);
          return NextResponse.json(
            { success: false, error: 'Classified not found' },
            { status: 404 }
          );
        }

        const data = classifiedDoc.data();
        const classifiedData = {
          id: classifiedDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          // Ensure image URLs are properly included
          imageUrl: data.imageUrl || data.image || null
        };

        ('✅ Single classified retrieved:', classifiedData.title);

        return NextResponse.json({
          success: true,
          classified: classifiedData
        });
      } catch (error) {
        console.error('❌ Error fetching single classified:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch classified', details: error.message },
          { status: 500 }
        );
      }
    }

    // Fetch all classifieds from all publishers
    if (publisherId === 'all') {
      try {
        ('🔍 Fetching all classifieds from all publishers...');

        // Get all publishers
        const publishersSnapshot = await db.collection('publishers').get();
        const allClassifieds = [];

        // Fetch classifieds from each publisher
        for (const publisherDoc of publishersSnapshot.docs) {
          const publisherId = publisherDoc.id;
          const publisherData = publisherDoc.data();

          try {
            const classifiedsSnapshot = await db
              .collection('publishers')
              .doc(publisherId)
              .collection('classifieds')
              .orderBy('updatedAt', 'desc')
              .get();

            const publisherClassifieds = classifiedsSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                publisherId,
                publisherName: data.publisherName || publisherData.companyName || 'Unknown Publisher',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                // Ensure image URLs are properly mapped
                imageUrl: data.imageUrl || data.image || null
              };
            });

            allClassifieds.push(...publisherClassifieds);
          } catch (publisherError) {
            console.warn(`⚠️ Could not fetch classifieds for publisher ${publisherId}:`, publisherError.message);
          }
        }

        // Sort all classifieds by updatedAt
        allClassifieds.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        ('📰 Total classifieds found:', allClassifieds.length);

        return NextResponse.json({
          success: true,
          classifieds: allClassifieds,
          total: allClassifieds.length
        });

      } catch (queryError) {
        console.error('❌ Error executing Firestore query:', queryError);

        return NextResponse.json({
          success: false,
          error: 'Failed to fetch classifieds',
          details: queryError.message
        }, { status: 500 });
      }
    }

    // Fetch classifieds for a specific publisher
    if (publisherId && publisherId !== 'all') {
      try {
        ('🔍 Fetching classifieds for publisher:', publisherId);

        const publisherRef = db.collection('publishers').doc(publisherId);
        const classifiedsSnapshot = await publisherRef
          .collection('classifieds')
          .orderBy('updatedAt', 'desc')
          .get();

        const classifieds = classifiedsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            // Ensure image URLs are properly mapped
            imageUrl: data.imageUrl || data.image || null
          };
        });

        ('📰 Classifieds found for publisher:', classifieds.length);

        return NextResponse.json({
          success: true,
          classifieds,
          total: classifieds.length,
          publisherId
        });

      } catch (queryError) {
        console.error('❌ Error executing Firestore query:', queryError);

        return NextResponse.json({
          success: false,
          error: 'Failed to fetch classifieds',
          details: queryError.message
        }, { status: 500 });
      }
    }

    // If no valid parameters provided
    return NextResponse.json(
      { success: false, error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('💥 Unexpected error in classifieds GET:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST handler - Create/Update classifieds
export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let data = {};
    let publisherId = null;

    ('📝 POST classified request received, content-type:', contentType);

    // Handle FormData from ClassifiedsUploadForm
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

    ('📝 Saving classified for publisherId:', publisherId);
    ('🖼️ Image data received:', {
      imageUrl: data.imageUrl ? 'Present' : 'Missing',
      image: data.image ? 'File present' : 'No file'
    });

    // Prepare classified document
    const classifiedData = {
      title: data.title || '',
      description: data.description || '',
      price: parseFloat(data.price || '0'),
      imageUrl: data.imageUrl || null,
      image: data.imageUrl || null,
      publisherId,
      publisherName: data.publisherName || '',
      updatedAt: Timestamp.now(),
      status: 'active',
      views: data.views || 0,
      inquiries: data.inquiries || 0
    };

    ('💾 Final classified data:', {
      title: classifiedData.title,
      price: classifiedData.price,
      imageUrl: classifiedData.imageUrl,
      publisherId: classifiedData.publisherId
    });

    // Set createdAt for new classifieds
    if (!data.classifiedId) {
      classifiedData.createdAt = Timestamp.now();
    }

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);

    let docRef;
    let message;

    if (data.classifiedId) {
      // Update existing classified
      docRef = publisherRef.collection('classifieds').doc(data.classifiedId);
      await docRef.update(classifiedData);
      message = 'Classified updated successfully';
    } else {
      // Create new classified
      docRef = await publisherRef.collection('classifieds').add(classifiedData);
      message = 'Classified created successfully';
    }

    (`✅ ${message}`);
    ('🖼️ Saved with image URL:', classifiedData.imageUrl);

    return NextResponse.json({
      success: true,
      message,
      classifiedId: typeof docRef === 'string' ? docRef : docRef.id,
      status: classifiedData.status,
      savedImageUrl: classifiedData.imageUrl
    });

  } catch (error) {
    console.error('💥 Error in classifieds POST:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete classifieds
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get('publisherId');
    const classifiedId = searchParams.get('classifiedId');

    if (!publisherId || !classifiedId) {
      return NextResponse.json(
        { success: false, error: 'Publisher ID and Classified ID are required' },
        { status: 400 }
      );
    }

    ('🗑️ Deleting classified:', classifiedId, 'for publisher:', publisherId);

    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);

    const docRef = publisherRef.collection('classifieds').doc(classifiedId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Classified not found' },
        { status: 404 }
      );
    }

    await docRef.delete();
    ('✅ Classified deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Classified deleted successfully'
    });

  } catch (error) {
    console.error('💥 Error in classifieds DELETE:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}