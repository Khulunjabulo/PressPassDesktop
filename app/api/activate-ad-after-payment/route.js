// app/api/activate-ad-after-payment/route.js - FULLY DEBUGGED
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  console.log('🚀 [ACTIVATE-AD] ========== STARTING AD ACTIVATION ==========');
  
  try {
    const body = await request.json();
    console.log('📦 [ACTIVATE-AD] Request body:', JSON.stringify(body, null, 2));
    
    const { 
      paymentIntentId, 
      pendingId,
      fileData,
      publisherId, 
      templateId, 
      deviceType,
      destinationUrl
    } = body;

    // Validation
    if (!paymentIntentId) {
      console.error('❌ [ACTIVATE-AD] Missing paymentIntentId');
      return NextResponse.json({
        success: false,
        error: 'Missing paymentIntentId'
      }, { status: 400 });
    }

    if (!pendingId && !publisherId) {
      console.error('❌ [ACTIVATE-AD] Missing both pendingId and publisherId');
      return NextResponse.json({
        success: false,
        error: 'Missing pendingId or publisherId'
      }, { status: 400 });
    }

    const db = getFirestoreDb();

    // 1. Verify payment with Stripe
    console.log('🔍 [ACTIVATE-AD] Verifying payment with Stripe:', paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('📊 [ACTIVATE-AD] Payment status:', paymentIntent.status);

    if (paymentIntent.status !== 'succeeded') {
      console.error('❌ [ACTIVATE-AD] Payment not successful:', paymentIntent.status);
      return NextResponse.json({
        success: false,
        error: 'Payment not successful',
        paymentStatus: paymentIntent.status
      }, { status: 400 });
    }

    console.log('✅ [ACTIVATE-AD] Payment verified successfully');

    let adData = {
      status: 'active',
      paymentStatus: 'completed',
      paymentIntentId: paymentIntentId,
      paymentInfo: {
        amount: paymentIntent.amount / 100,
        amountInCents: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        paidAt: Timestamp.now(),
        stripeStatus: paymentIntent.status
      },
      activatedAt: Timestamp.now(),
      impressions: 0,
      clicks: 0
    };

    // 2. Try to get pending ad record
    if (pendingId) {
      console.log('📄 [ACTIVATE-AD] Looking for pending ad:', pendingId);
      
      // Check in pendingAds collection
      let pendingRef = db.collection('pendingAds').doc(pendingId);
      let pendingDoc = await pendingRef.get();

      if (pendingDoc.exists) {
        console.log('✅ [ACTIVATE-AD] Found in pendingAds collection');
        const pendingData = pendingDoc.data();
        
        adData = {
          ...adData,
          publisherId: pendingData.publisherId,
          templateId: pendingData.templateId,
          deviceType: pendingData.deviceType,
          destinationUrl: pendingData.destinationUrl,
          fileName: pendingData.fileName,
          fileSize: pendingData.fileSize,
          fileType: pendingData.fileType,
          uploadedAt: pendingData.createdAt || Timestamp.now()
        };

        // Add file data if provided
        if (fileData) {
          console.log('📎 [ACTIVATE-AD] File data provided, length:', fileData.length);
          adData.imageSrc = fileData;
        }

        // Create active ad
        const adRef = await db.collection('adUploads').add(adData);
        console.log('✅ [ACTIVATE-AD] Created ad in adUploads:', adRef.id);

        // Delete pending ad
        await pendingRef.delete();
        console.log('🗑️ [ACTIVATE-AD] Deleted pending ad');

        // Update payment record
        const paymentsSnapshot = await db.collection('payments')
          .where('paymentIntentId', '==', paymentIntentId)
          .limit(1)
          .get();

        if (!paymentsSnapshot.empty) {
          await paymentsSnapshot.docs[0].ref.update({
            adUploadId: adRef.id,
            adActivated: true,
            activatedAt: Timestamp.now()
          });
          console.log('✅ [ACTIVATE-AD] Updated payment record');
        }

        console.log('🎉 [ACTIVATE-AD] ========== ACTIVATION COMPLETE ==========');

        return NextResponse.json({
          success: true,
          message: 'Ad activated successfully',
          data: {
            adUploadId: adRef.id,
            paymentIntentId,
            status: 'active',
            collection: 'adUploads'
          }
        });
      }

      // Check in pendingAdUploads collection
      pendingRef = db.collection('pendingAdUploads').doc(pendingId);
      pendingDoc = await pendingRef.get();

      if (pendingDoc.exists) {
        console.log('✅ [ACTIVATE-AD] Found in pendingAdUploads collection');
        const pendingData = pendingDoc.data();
        
        // Move to adUploads
        const activatedData = {
          ...pendingData,
          ...adData
        };

        const adRef = await db.collection('adUploads').add(activatedData);
        console.log('✅ [ACTIVATE-AD] Created ad in adUploads:', adRef.id);

        // Delete pending
        await pendingRef.delete();
        console.log('🗑️ [ACTIVATE-AD] Deleted from pendingAdUploads');

        console.log('🎉 [ACTIVATE-AD] ========== ACTIVATION COMPLETE ==========');

        return NextResponse.json({
          success: true,
          message: 'Ad activated successfully',
          data: {
            adUploadId: adRef.id,
            paymentIntentId,
            status: 'active',
            collection: 'adUploads'
          }
        });
      }

      console.warn('⚠️ [ACTIVATE-AD] Pending ad not found in either collection');
    }

    // 3. If no pending record found, create new ad from provided data
    if (publisherId && templateId && deviceType) {
      console.log('📝 [ACTIVATE-AD] Creating ad from provided data');
      
      adData = {
        ...adData,
        publisherId,
        templateId: parseInt(templateId, 10),
        deviceType,
        destinationUrl: destinationUrl || null,
        uploadedAt: Timestamp.now()
      };

      if (fileData) {
        console.log('📎 [ACTIVATE-AD] Adding file data');
        adData.imageSrc = fileData;
      }

      const adRef = await db.collection('adUploads').add(adData);
      console.log('✅ [ACTIVATE-AD] Created new ad:', adRef.id);

      console.log('🎉 [ACTIVATE-AD] ========== ACTIVATION COMPLETE ==========');

      return NextResponse.json({
        success: true,
        message: 'Ad activated successfully',
        data: {
          adUploadId: adRef.id,
          paymentIntentId,
          status: 'active',
          collection: 'adUploads'
        }
      });
    }

    console.error('❌ [ACTIVATE-AD] Insufficient data to create ad');
    return NextResponse.json({
      success: false,
      error: 'Could not find pending ad and insufficient data to create new ad'
    }, { status: 404 });

  } catch (error) {
    console.error('🚨 [ACTIVATE-AD] ========== ERROR ==========');
    console.error('🚨 [ACTIVATE-AD] Error message:', error.message);
    console.error('🚨 [ACTIVATE-AD] Error stack:', error.stack);
    
    // Log error to Firestore
    try {
      const db = getFirestoreDb();
      await db.collection('activation_errors').add({
        error: error.message,
        stack: error.stack,
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