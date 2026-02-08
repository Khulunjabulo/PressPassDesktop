// app/api/activate-ad-after-payment/route.js - SIMPLIFIED VERSION
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  console.log('🚀 [ACTIVATE-AD] Starting ad activation...');
  
  try {
    const body = await request.json();
    const { 
      paymentIntentId, 
      uploadId, // This is the docId from pendingAdUploads
      publisherId, 
      templateId, 
      deviceType
    } = body;

    console.log('📋 [ACTIVATE-AD] Request data:', {
      paymentIntentId,
      uploadId,
      publisherId,
      templateId,
      deviceType
    });

    // Validation
    if (!paymentIntentId || !uploadId) {
      console.error('❌ [ACTIVATE-AD] Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: paymentIntentId, uploadId'
      }, { status: 400 });
    }

    const db = getFirestoreDb();

    // 1. Verify payment from Stripe
    console.log('🔍 [ACTIVATE-AD] Verifying payment with Stripe...');
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      console.error('❌ [ACTIVATE-AD] Payment not successful:', paymentIntent.status);
      return NextResponse.json({
        success: false,
        error: 'Payment was not successful',
        paymentStatus: paymentIntent.status
      }, { status: 400 });
    }

    console.log('✅ [ACTIVATE-AD] Payment verified:', {
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: paymentIntent.status
    });

    // 2. Use the existing PATCH endpoint to activate the ad
    console.log('🔄 [ACTIVATE-AD] Calling PATCH to activate ad...');
    
    const patchResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload-ad-media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId: uploadId,
        paymentIntentId: paymentIntentId
      })
    });

    const patchResult = await patchResponse.json();

    if (!patchResult.success) {
      throw new Error(patchResult.error || 'Failed to activate ad');
    }

    console.log('✅ [ACTIVATE-AD] Ad activated via PATCH endpoint');

    // 3. Update payment record if exists
    const paymentsSnapshot = await db.collection('payments')
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    if (!paymentsSnapshot.empty) {
      const paymentDocId = paymentsSnapshot.docs[0].id;
      await db.collection('payments').doc(paymentDocId).update({
        adUploadId: uploadId,
        adActivated: true,
        activatedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log('📝 [ACTIVATE-AD] Payment record updated');
    }

    // 4. Create activity log
    await db.collection('activity_logs').add({
      type: 'ad_activated',
      paymentIntentId,
      adUploadId: uploadId,
      publisherId: publisherId || 'unknown',
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      timestamp: Timestamp.now()
    });

    console.log('🎉 [ACTIVATE-AD] Ad activation completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Ad activated successfully',
      data: {
        adUploadId: uploadId,
        paymentIntentId: paymentIntentId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'active'
      }
    });

  } catch (error) {
    console.error('🚨 [ACTIVATE-AD] Error:', {
      message: error.message,
      stack: error.stack
    });

    // Log activation error
    try {
      const db = getFirestoreDb();
      await db.collection('activation_errors').add({
        paymentIntentId: body?.paymentIntentId || null,
        uploadId: body?.uploadId || null,
        errorMessage: error.message,
        timestamp: Timestamp.now(),
        requestBody: body
      });
    } catch (logError) {
      console.error('💥 [ACTIVATE-AD] Failed to log error:', logError);
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to activate ad'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';