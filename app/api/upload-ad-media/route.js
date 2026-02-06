// app/api/upload-ad-media/route.js - UPDATED with payment status and destination URL
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Utility function to normalize publisher ID
function normalizePublisherId(publisherId) {
  if (!publisherId) return null;
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
    const paymentIntentId = formData.get('paymentIntentId');
    const paymentStatus = formData.get('paymentStatus') || 'pending';
    const destinationUrl = formData.get('destinationUrl'); // 🆕 NEW FIELD

    if (!file || !rawPublisherId || !templateId || !deviceType) {
      return NextResponse.json(
        { success: false, error: 'File, publisherId, templateId, and deviceType are required' },
        { status: 400 }
      );
    }

    // 🆕 Validate destination URL if provided
    if (destinationUrl) {
      try {
        new URL(destinationUrl); // Validates URL format
        if (!destinationUrl.startsWith('http://') && !destinationUrl.startsWith('https://')) {
          return NextResponse.json(
            { success: false, error: 'Destination URL must start with http:// or https://' },
            { status: 400 }
          );
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, error: 'Invalid destination URL format' },
          { status: 400 }
        );
      }
    }

    const publisherId = normalizePublisherId(rawPublisherId);

    console.log('📁 Processing ad media upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      publisherId,
      templateId,
      deviceType,
      paymentIntentId,
      paymentStatus,
      destinationUrl // 🆕 NEW LOG
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
    const dataUrl = `data:${file.type};base64,${base64String}`;

    // Prepare document data
    const adMediaData = {
      publisherId,
      templateId: parseInt(templateId, 10),
      deviceType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      imageSrc: dataUrl,
      destinationUrl: destinationUrl || null, // 🆕 NEW FIELD
      uploadedAt: Timestamp.now(),
      status: paymentStatus === 'completed' ? 'active' : 'pending_payment',
      paymentIntentId: paymentIntentId || null,
      paymentStatus: paymentStatus,
      impressions: 0,
      clicks: 0,
      activatedAt: paymentStatus === 'completed' ? Timestamp.now() : null
    };

    // Save to Firestore
    const db = getFirestoreDb();
    const docRef = await db.collection('adUploads').add(adMediaData);

    console.log('✅ Ad media uploaded successfully:', {
      docId: docRef.id,
      fileName: file.name,
      publisherId,
      templateId,
      deviceType,
      status: adMediaData.status,
      destinationUrl: adMediaData.destinationUrl, // 🆕 NEW LOG
      dataUrlLength: dataUrl.length
    });

    return NextResponse.json({
      success: true,
      message: paymentStatus === 'completed' 
        ? 'Ad media uploaded and activated successfully' 
        : 'Ad media uploaded, pending payment',
      data: {
        docId: docRef.id,
        fileName: file.name,
        fileSize: file.size,
        publisherId,
        deviceType,
        imageSrc: dataUrl,
        destinationUrl: adMediaData.destinationUrl, // 🆕 NEW FIELD
        status: adMediaData.status,
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

// Endpoint to activate ad after payment
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { adId, paymentIntentId } = body;

    if (!adId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'adId and paymentIntentId are required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const adRef = db.collection('adUploads').doc(adId);
    const adDoc = await adRef.get();

    if (!adDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Update ad to active status
    await adRef.update({
      status: 'active',
      paymentStatus: 'completed',
      paymentIntentId,
      activatedAt: Timestamp.now()
    });

    console.log('✅ Ad activated after payment:', {
      adId,
      paymentIntentId
    });

    return NextResponse.json({
      success: true,
      message: 'Ad activated successfully'
    });

  } catch (error) {
    console.error('💥 Error activating ad:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to activate ad',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';