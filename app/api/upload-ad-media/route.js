// app/api/upload-ad-media/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const publisherId = formData.get('publisherId');
    const templateId = formData.get('templateId');

    if (!file || !publisherId || !templateId) {
      return NextResponse.json(
        { success: false, error: 'File, publisherId, and templateId are required' },
        { status: 400 }
      );
    }

    console.log('📁 Processing ad media upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      publisherId,
      templateId
    });

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/avi'
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Supported: JPG, PNG, GIF, MP4, MOV, AVI' },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer for Firestore storage
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Prepare document data
    const adMediaData = {
      publisherId,
      templateId: parseInt(templateId, 10),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileData: fileData,
      uploadedAt: Timestamp.now(),
      status: 'uploaded'
    };

    // Save to Firestore
    const db = getFirestoreDb();
    const docRef = await db.collection('adUploads').add(adMediaData);

    console.log('✅ Ad media uploaded successfully:', {
      docId: docRef.id,
      fileName: file.name,
      publisherId,
      templateId
    });

    return NextResponse.json({
      success: true,
      message: 'Ad media uploaded successfully',
      docId: docRef.id,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: adMediaData.uploadedAt.toDate().toISOString()
    });

  } catch (error) {
    console.error('💥 Error in upload-ad-media POST:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload ad media',
        details: error.message
      },
      { status: 500 }
    );
  }
}