// app/api/extend-ad/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request) {
  console.log('🔄 POST /api/extend-ad - Extending ad duration...');
  
  try {
    const body = await request.json();
    
    const {
      adId,
      paymentIntentId,
      extensionDays,
      amount,
      currency
    } = body;

    // Validate required fields
    if (!adId || !paymentIntentId || !extensionDays) {
      console.error('❌ Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: adId, paymentIntentId, extensionDays'
      }, { status: 400 });
    }

    console.log('📝 Extension details:', {
      adId,
      paymentIntentId,
      extensionDays,
      amount,
      currency
    });

    const db = getFirestoreDb();
    const adRef = db.collection('advertisements').doc(adId);
    
    // Get current ad data
    const adDoc = await adRef.get();
    
    if (!adDoc.exists) {
      console.error('❌ Ad not found:', adId);
      return NextResponse.json({
        success: false,
        error: 'Advertisement not found'
      }, { status: 404 });
    }

    const adData = adDoc.data();
    
    // Calculate new end date
    const currentEndDate = adData.schedule?.endDate?.toDate 
      ? adData.schedule.endDate.toDate() 
      : new Date();
    
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + extensionDays);
    
    // Update ad with new duration
    const updateData = {
      'schedule.endDate': Timestamp.fromDate(newEndDate),
      'schedule.duration': (adData.schedule?.duration || 0) + extensionDays,
      updatedAt: Timestamp.now(),
      'paymentInfo.extensionHistory': [
        ...(adData.paymentInfo?.extensionHistory || []),
        {
          paymentIntentId,
          extensionDays,
          amount,
          currency,
          extendedAt: Timestamp.now(),
          previousEndDate: Timestamp.fromDate(currentEndDate),
          newEndDate: Timestamp.fromDate(newEndDate)
        }
      ]
    };

    await adRef.update(updateData);

    console.log('✅ Ad extended successfully:', {
      adId,
      previousEndDate: currentEndDate.toISOString(),
      newEndDate: newEndDate.toISOString(),
      extensionDays
    });

    return NextResponse.json({
      success: true,
      message: 'Ad extended successfully',
      data: {
        adId,
        previousEndDate: currentEndDate.toISOString(),
        newEndDate: newEndDate.toISOString(),
        extensionDays,
        paymentIntentId
      }
    });

  } catch (error) {
    console.error('🚨 Error extending ad:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to extend ad',
      code: error.code
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';