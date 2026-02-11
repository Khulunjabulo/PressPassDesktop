// app/api/upload-ad-media/route.js - FIXED VERSION WITH PROPER VIDEO HANDLING
import { NextResponse } from 'next/server';
import { getFirestoreDb, getStorageBucket } from '../../../lib/firebase-admin';
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
    const destinationUrl = formData.get('destinationUrl');

    console.log('📁 [UPLOAD-AD-MEDIA] Request:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      publisherId: rawPublisherId,
      templateId,
      deviceType,
      destinationUrl,
      isVideo: file?.type?.startsWith('video/')
    });

    if (!file || !rawPublisherId || !templateId || !deviceType) {
      return NextResponse.json(
        { success: false, error: 'File, publisherId, templateId, and deviceType are required' },
        { status: 400 }
      );
    }

    // Validate destination URL
    if (destinationUrl) {
      try {
        new URL(destinationUrl);
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
      'video/webm',
      'video/avi'
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Supported: JPG, PNG, GIF, MP4, MOV, WEBM, AVI' },
        { status: 400 }
      );
    }

    if (!['mobile', 'desktop'].includes(deviceType)) {
      return NextResponse.json(
        { success: false, error: 'deviceType must be "mobile" or "desktop"' },
        { status: 400 }
      );
    }

    const isVideo = file.type.startsWith('video/');
    let imageSrc;

    // 🎥 CRITICAL FIX: Handle videos differently from images
    if (isVideo) {
      console.log('🎥 [UPLOAD-AD-MEDIA] Video detected, uploading to Firebase Storage...');
      
      try {
        const bucket = getStorageBucket();
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${publisherId}_${deviceType}_${templateId}_${timestamp}.${fileExtension}`;
        const filePath = `ad-uploads/${publisherId}/${deviceType}/${fileName}`;
        
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Upload to Firebase Storage
        const fileRef = bucket.file(filePath);
        await fileRef.save(buffer, {
          metadata: {
            contentType: file.type,
            metadata: {
              publisherId,
              templateId: templateId.toString(),
              deviceType,
              originalName: file.name,
              uploadedAt: new Date().toISOString()
            }
          }
        });
        
        // Make file publicly accessible
        await fileRef.makePublic();
        
        // Get public URL
        imageSrc = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        
        console.log('✅ [UPLOAD-AD-MEDIA] Video uploaded to Storage:', imageSrc);
        
      } catch (storageError) {
        console.error('❌ [UPLOAD-AD-MEDIA] Storage upload failed:', storageError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload video to storage', details: storageError.message },
          { status: 500 }
        );
      }
      
    } else {
      // 🖼️ Images: Use base64 (they're smaller and work fine)
      console.log('🖼️ [UPLOAD-AD-MEDIA] Image detected, converting to base64...');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = buffer.toString('base64');
      imageSrc = `data:${file.type};base64,${base64String}`;
      console.log('✅ [UPLOAD-AD-MEDIA] Image converted, base64 length:', imageSrc.length);
    }

    // Prepare document data
    const adMediaData = {
      publisherId,
      templateId: parseInt(templateId, 10),
      deviceType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      imageSrc, // Either storage URL (video) or base64 (image)
      isVideo, // 🆕 Flag to identify videos
      destinationUrl: destinationUrl || null,
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
    const collectionName = paymentStatus === 'completed' ? 'adUploads' : 'pendingAdUploads';
    const docRef = await db.collection(collectionName).add(adMediaData);

    console.log('✅ [UPLOAD-AD-MEDIA] Saved to Firestore:', {
      docId: docRef.id,
      collection: collectionName,
      isVideo,
      imageSrcType: isVideo ? 'storage_url' : 'base64'
    });

    return NextResponse.json({
      success: true,
      message: paymentStatus === 'completed' 
        ? 'Ad media uploaded and activated successfully' 
        : 'Ad media uploaded, pending payment',
      data: {
        docId: docRef.id,
        uploadId: docRef.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isVideo,
        publisherId,
        deviceType,
        destinationUrl: adMediaData.destinationUrl,
        status: adMediaData.status,
        uploadedAt: adMediaData.uploadedAt.toDate().toISOString()
      }
    });

  } catch (error) {
    console.error('💥 [UPLOAD-AD-MEDIA] Error:', {
      message: error.message,
      stack: error.stack
    });
    
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

    console.log('🔄 [UPLOAD-AD-MEDIA PATCH] Activating:', { adId, paymentIntentId });

    if (!adId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'adId and paymentIntentId are required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    
    // Check in pendingAdUploads first
    const pendingRef = db.collection('pendingAdUploads').doc(adId);
    const pendingDoc = await pendingRef.get();

    if (pendingDoc.exists) {
      const pendingData = pendingDoc.data();
      
      // Move to adUploads
      await db.collection('adUploads').doc(adId).set({
        ...pendingData,
        status: 'active',
        paymentStatus: 'completed',
        paymentIntentId,
        activatedAt: Timestamp.now()
      });

      // Delete from pending
      await pendingRef.delete();

      console.log('✅ [UPLOAD-AD-MEDIA PATCH] Moved to active');
      return NextResponse.json({ success: true, message: 'Ad activated successfully' });
    }

    // Check in adUploads
    const adRef = db.collection('adUploads').doc(adId);
    const adDoc = await adRef.get();

    if (!adDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Update to active
    await adRef.update({
      status: 'active',
      paymentStatus: 'completed',
      paymentIntentId,
      activatedAt: Timestamp.now()
    });

    console.log('✅ [UPLOAD-AD-MEDIA PATCH] Activated');
    return NextResponse.json({ success: true, message: 'Ad activated successfully' });

  } catch (error) {
    console.error('💥 [UPLOAD-AD-MEDIA PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate ad', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';