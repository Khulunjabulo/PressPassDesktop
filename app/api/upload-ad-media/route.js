// app/api/upload-ad-media/route.js - UPDATED WITH DURATION SUPPORT
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { uploadToCloudinary, deleteFromCloudinary } from '../../../lib/cloudinary';
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
    
    // NEW: Duration data
    const durationJson = formData.get('duration');
    const notes = formData.get('notes');

    console.log('📁 [UPLOAD-AD-MEDIA] Request:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      publisherId: rawPublisherId,
      templateId,
      deviceType,
      destinationUrl,
      hasDuration: !!durationJson,
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

    // Parse duration data
    let duration = null;
    if (durationJson) {
      try {
        duration = JSON.parse(durationJson);
        console.log('📅 [UPLOAD-AD-MEDIA] Duration data:', duration);
      } catch (err) {
        console.error('❌ [UPLOAD-AD-MEDIA] Failed to parse duration:', err);
      }
    }

    const isVideo = file.type.startsWith('video/');
    let imageSrc;
    let cloudinaryPublicId = null;

    // 🎥 CLOUDINARY: Handle both videos and images
    console.log(`${isVideo ? '🎥' : '🖼️'} [UPLOAD-AD-MEDIA] Uploading to Cloudinary...`);
    
    try {
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Create unique public ID
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const publicId = `${publisherId}_${deviceType}_${templateId}_${timestamp}`;
      
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(buffer, {
        folder: `ad-uploads/${publisherId}/${deviceType}`,
        public_id: publicId,
        resource_type: isVideo ? 'video' : 'image',
        // Video optimizations
        ...(isVideo && {
          eager: [
            { format: 'mp4', video_codec: 'h264' }, // Optimize for web
          ],
          eager_async: true,
        }),
        // Image optimizations
        ...(!isVideo && {
          quality: 'auto',
          fetch_format: 'auto',
        })
      });
      
      imageSrc = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
      
      console.log('✅ [UPLOAD-AD-MEDIA] Uploaded to Cloudinary:', {
        url: imageSrc,
        publicId: cloudinaryPublicId,
        resourceType: uploadResult.resource_type
      });
      
    } catch (cloudinaryError) {
      console.error('❌ [UPLOAD-AD-MEDIA] Cloudinary upload failed:', cloudinaryError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to upload to Cloudinary', 
          details: cloudinaryError.message 
        },
        { status: 500 }
      );
    }

    // Prepare document data
    const adMediaData = {
      publisherId,
      templateId: parseInt(templateId, 10),
      deviceType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      imageSrc, // Cloudinary URL
      cloudinaryPublicId, // Store for deletion later
      isVideo,
      destinationUrl: destinationUrl || null,
      uploadedAt: Timestamp.now(),
      status: paymentStatus === 'completed' ? 'active' : 'pending_payment',
      paymentIntentId: paymentIntentId || null,
      paymentStatus: paymentStatus,
      impressions: 0,
      clicks: 0,
      activatedAt: paymentStatus === 'completed' ? Timestamp.now() : null,
      
      // NEW: Duration data
      duration: duration ? {
        type: duration.type,
        quantity: parseInt(duration.quantity, 10),
        startDate: duration.startDate,
        endDate: duration.endDate
      } : null,
      
      // NEW: Notes
      notes: notes || null
    };

    // Save to Firestore
    const db = getFirestoreDb();
    const collectionName = paymentStatus === 'completed' ? 'adUploads' : 'pendingAdUploads';
    const docRef = await db.collection(collectionName).add(adMediaData);

    console.log('✅ [UPLOAD-AD-MEDIA] Saved to Firestore:', {
      docId: docRef.id,
      collection: collectionName,
      isVideo,
      cloudinaryUrl: imageSrc,
      hasDuration: !!duration
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
        uploadedAt: adMediaData.uploadedAt.toDate().toISOString(),
        mediaUrl: imageSrc,
        duration: adMediaData.duration
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
    const { adId, paymentIntentId, paymentAmount } = body;

    console.log('🔄 [UPLOAD-AD-MEDIA PATCH] Activating:', { adId, paymentIntentId, paymentAmount });

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
        paymentAmount: paymentAmount || null,
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
      paymentAmount: paymentAmount || null,
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

// DELETE endpoint to remove ad and its media from Cloudinary
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adId = searchParams.get('adId');

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'adId is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    
    // Try both collections
    let adDoc = await db.collection('adUploads').doc(adId).get();
    let collection = 'adUploads';
    
    if (!adDoc.exists) {
      adDoc = await db.collection('pendingAdUploads').doc(adId).get();
      collection = 'pendingAdUploads';
    }

    if (!adDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    const adData = adDoc.data();

    // Delete from Cloudinary if we have a public ID
    if (adData.cloudinaryPublicId) {
      try {
        const resourceType = adData.isVideo ? 'video' : 'image';
        await deleteFromCloudinary(adData.cloudinaryPublicId, resourceType);
        console.log('✅ Deleted from Cloudinary:', adData.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('⚠️ Cloudinary deletion failed:', cloudinaryError);
        // Continue with Firestore deletion even if Cloudinary fails
      }
    }

    // Delete from Firestore
    await db.collection(collection).doc(adId).delete();

    console.log('✅ [DELETE] Ad deleted:', adId);
    return NextResponse.json({ 
      success: true, 
      message: 'Ad deleted successfully' 
    });

  } catch (error) {
    console.error('💥 [DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ad', details: error.message },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';