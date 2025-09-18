// /api/ads/analytics/route.js
import { NextResponse } from 'next/server';
import { db } from '@/Firebase/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

const COLLECTION_NAME = 'advertisements';

// POST /api/ads/analytics - Track ad clicks and impressions
export async function POST(request) {
  try {
    const body = await request.json();
    const { adId, action } = body; // action: 'impression' or 'click'

    if (!adId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: adId, action'
      }, { status: 400 });
    }

    if (!['impression', 'click'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be "impression" or "click"'
      }, { status: 400 });
    }

    const adRef = doc(db, COLLECTION_NAME, adId);
    
    const updateData = {};
    if (action === 'click') {
      updateData.clicks = increment(1);
    } else if (action === 'impression') {
      updateData.impressions = increment(1);
    }

    await updateDoc(adRef, updateData);

    return NextResponse.json({
      success: true,
      message: `${action} tracked successfully`
    });
  } catch (error) {
    console.error('Error tracking ad analytics:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to track analytics'
    }, { status: 500 });
  }
}