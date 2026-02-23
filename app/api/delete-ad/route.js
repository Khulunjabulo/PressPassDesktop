// app/api/delete-ad/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { deleteFromCloudinary } from '../../../lib/cloudinary';

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adId = searchParams.get('adId');

    console.log('🗑️ [DELETE-AD] Request:', { adId });

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
      console.error('❌ [DELETE-AD] Ad not found:', adId);
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
        console.log('✅ [DELETE-AD] Deleted from Cloudinary:', adData.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('⚠️ [DELETE-AD] Cloudinary deletion failed:', cloudinaryError);
        // Continue with Firestore deletion even if Cloudinary fails
      }
    }

    // Delete from Firestore
    await db.collection(collection).doc(adId).delete();

    console.log('✅ [DELETE-AD] Ad deleted from Firestore:', { adId, collection });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ad deleted successfully' 
    });

  } catch (error) {
    console.error('💥 [DELETE-AD] Error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete ad', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';