// /api/activate-ad-after-payment/route.js - CLIENT SIDE
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      paymentIntentId, 
      publisherId, 
      templateId, 
      deviceType, 
      fileData 
    } = body;

    ('📋 [ACTIVATE-AD] Request data:', {
      paymentIntentId,
      publisherId,
      templateId,
      deviceType,
      hasFileData: !!fileData
    });

    // Validation
    if (!paymentIntentId || !publisherId || !templateId || !deviceType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: paymentIntentId, publisherId, templateId, deviceType'
      }, { status: 400 });
    }

    const db = getFirestoreDb();

    // 1. Verify payment from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      // Log failed activation attempt
      await db.collection('activation_errors').add({
        paymentIntentId,
        publisherId,
        templateId,
        deviceType,
        error: 'Payment not successful',
        paymentStatus: paymentIntent.status,
        timestamp: Timestamp.now()
      });

      return NextResponse.json({
        success: false,
        error: 'Payment was not successful',
        paymentStatus: paymentIntent.status
      }, { status: 400 });
    }

    ('✅ [ACTIVATE-AD] Payment verified:', {
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: paymentIntent.status
    });

    // 2. Get payment record from Firebase
    const paymentsSnapshot = await db.collection('payments')
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    let paymentData = null;
    let paymentDocId = null;

    if (!paymentsSnapshot.empty) {
      const paymentDoc = paymentsSnapshot.docs[0];
      paymentData = paymentDoc.data();
      paymentDocId = paymentDoc.id;
      ('📄 [ACTIVATE-AD] Payment record found:', paymentDocId);
    } else {
      console.warn('⚠️ [ACTIVATE-AD] Payment record not found in Firebase');
    }

    // 3. Create ad upload record
    ('💾 [ACTIVATE-AD] Creating ad upload record...');
    
    const adUploadData = {
      publisherId,
      templateId: parseInt(templateId, 10),
      deviceType,
      imageSrc: fileData || null,
      status: 'active',
      paymentStatus: 'completed',
      paymentIntentId: paymentIntentId,
      
      // Payment details
      paymentInfo: {
        amount: paymentIntent.amount / 100,
        amountInCents: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        paidAt: Timestamp.now(),
        stripeStatus: paymentIntent.status,
        firebasePaymentDocId: paymentDocId
      },
      
      // Metadata from payment
      metadata: paymentIntent.metadata || {},
      
      // Timestamps
      uploadedAt: Timestamp.now(),
      activatedAt: Timestamp.now(),
      
      // Analytics
      impressions: 0,
      clicks: 0
    };

    const adUploadRef = await db.collection('adUploads').add(adUploadData);

    ('✅ [ACTIVATE-AD] Ad upload created:', {
      docId: adUploadRef.id,
      publisherId,
      templateId,
      deviceType,
      amount: adUploadData.paymentInfo.amount,
      currency: adUploadData.paymentInfo.currency
    });

    // 4. Update payment record with ad reference
    if (paymentDocId) {
      await db.collection('payments').doc(paymentDocId).update({
        adUploadId: adUploadRef.id,
        adActivated: true,
        activatedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      ('📝 [ACTIVATE-AD] Payment record updated with ad reference');
    }

    // 5. Create activity log
    await db.collection('activity_logs').add({
      type: 'ad_activated',
      paymentIntentId,
      adUploadId: adUploadRef.id,
      publisherId,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      timestamp: Timestamp.now()
    });

    ('🎉 [ACTIVATE-AD] Ad activation completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Ad activated successfully',
      data: {
        adUploadId: adUploadRef.id,
        paymentIntentId: paymentIntentId,
        amount: adUploadData.paymentInfo.amount,
        currency: adUploadData.paymentInfo.currency,
        status: 'active',
        activatedAt: adUploadData.activatedAt.toDate().toISOString()
      }
    });

  } catch (error) {
    console.error('🚨 [ACTIVATE-AD] Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });

    // Log activation error
    try {
      const db = getFirestoreDb();
      await db.collection('activation_errors').add({
        paymentIntentId: body?.paymentIntentId || null,
        publisherId: body?.publisherId || null,
        errorMessage: error.message,
        errorType: error.type,
        errorCode: error.code,
        timestamp: Timestamp.now(),
        requestBody: body
      });
    } catch (logError) {
      console.error('💥 [ACTIVATE-AD] Failed to log error:', logError);
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to activate ad',
      errorType: error.type,
      errorCode: error.code
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';