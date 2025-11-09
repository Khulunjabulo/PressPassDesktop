// app/api/upload-ad-media/route.js - UPDATED VERSION
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Utility function to normalize publisher ID
function normalizePublisherId(publisherId) {
  if (!publisherId) return null;
  // Remove 'publisher_' prefix if it exists
  return publisherId.replace(/^publisher_/, '');
}

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
    const rawPublisherId = formData.get('publisherId');
    const templateId = formData.get('templateId');
    const deviceType = formData.get('deviceType');

    if (!file || !rawPublisherId || !templateId || !deviceType) {
      return NextResponse.json(
        { success: false, error: 'File, publisherId, templateId, and deviceType are required' },
        { status: 400 }
      );
    }

    // Normalize publisher ID (remove 'publisher_' prefix if present)
    const publisherId = normalizePublisherId(rawPublisherId);

    console.log('📁 Processing ad media upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      rawPublisherId,
      normalizedPublisherId: publisherId,
      templateId,
      deviceType
    });

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
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

    // Validate deviceType
    if (!['mobile', 'desktop'].includes(deviceType)) {
      return NextResponse.json(
        { success: false, error: 'deviceType must be "mobile" or "desktop"' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');
    
    // Create data URL with proper MIME type
    const dataUrl = `data:${file.type};base64,${base64String}`;

    // Prepare document data for Firestore with NORMALIZED publisher ID
    const adMediaData = {
      publisherId, // Using normalized ID (without 'publisher_' prefix)
      templateId: parseInt(templateId, 10),
      deviceType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      imageSrc: dataUrl,
      uploadedAt: Timestamp.now(),
      status: 'active',
      impressions: 0,
      clicks: 0
    };

    // Save metadata to Firestore
    const db = getFirestoreDb();
    const docRef = await db.collection('adUploads').add(adMediaData);

    console.log('✅ Ad media uploaded successfully:', {
      docId: docRef.id,
      fileName: file.name,
      normalizedPublisherId: publisherId,
      templateId,
      deviceType,
      dataUrlLength: dataUrl.length
    });

    return NextResponse.json({
      success: true,
      message: 'Ad media uploaded successfully',
      data: {
        docId: docRef.id,
        fileName: file.name,
        fileSize: file.size,
        publisherId, // Return normalized ID
        deviceType,
        imageSrc: dataUrl,
        uploadedAt: adMediaData.uploadedAt.toDate().toISOString()
      }
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