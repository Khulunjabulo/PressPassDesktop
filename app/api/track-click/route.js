import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const { adId, publisherId } = await req.json();

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'adId is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    const adRef = db.collection('adUploads').doc(adId);
    
    // Increment click count
    await adRef.update({
      clicks: FieldValue.increment(1),
      lastClickedAt: FieldValue.serverTimestamp()
    });

    console.log('✅ Ad click tracked:', { adId, publisherId });

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully'
    });

  } catch (error) {
    console.error('💥 Error tracking ad click:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track click',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';