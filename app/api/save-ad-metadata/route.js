// app/api/save-ad-metadata/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Utility function to normalize publisher ID
function normalizePublisherId(publisherId) {
  if (!publisherId) return null;
  return publisherId.replace(/^publisher_/, '');
}

export async function POST(request) {
  console.log('💾 [SAVE-AD-METADATA] Starting...');
  
  try {
    const body = await request.json();
    const {
      publisherId: rawPublisherId,
      templateId,
      deviceType,
      destinationUrl,
      fileName,
      fileSize,
      fileType,
      fileUrl,
      filePath,
      paymentStatus = 'pending'
    } = body;

    console.log('📋 [SAVE-AD-METADATA] Request data:', {
      rawPublisherId,
      templateId,
      deviceType,
      destinationUrl,
      fileName,
      fileSize,
      hasFileUrl: !!fileUrl
    });

    // Validation
    if (!rawPublisherId || !templateId || !deviceType || !fileUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: publisherId, templateId, deviceType, fileUrl'
      }, { status: 400 });
    }

    const publisherId = normalizePublisherId(rawPublisherId);

    // Prepare document data
    const adMetadata = {
      publisherId,
      templateId: parseInt(templateId, 10),
      deviceType,
      fileName,
      fileSize,
      fileType,
      fileUrl,
      filePath,
      destinationUrl: destinationUrl || null,
      uploadedAt: Timestamp.now(),
      status: paymentStatus === 'completed' ? 'active' : 'pending_payment',
      paymentStatus: paymentStatus,
      impressions: 0,
      clicks: 0,
      activatedAt: paymentStatus === 'completed' ? Timestamp.now() : null
    };

    // Save to Firestore
    const db = getFirestoreDb();
    const collectionName = paymentStatus === 'completed' ? 'adUploads' : 'pendingAdUploads';
    const docRef = await db.collection(collectionName).add(adMetadata);

    console.log('✅ [SAVE-AD-METADATA] Saved to Firestore:', {
      docId: docRef.id,
      collection: collectionName,
      publisherId,
      templateId,
      deviceType
    });

    return NextResponse.json({
      success: true,
      message: 'Ad metadata saved successfully',
      data: {
        uploadId: docRef.id,
        publisherId,
        templateId,
        deviceType,
        fileUrl,
        destinationUrl: adMetadata.destinationUrl,
        status: adMetadata.status,
        uploadedAt: adMetadata.uploadedAt.toDate().toISOString()
      }
    });

  } catch (error) {
    console.error('🚨 [SAVE-AD-METADATA] Error:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save ad metadata'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';