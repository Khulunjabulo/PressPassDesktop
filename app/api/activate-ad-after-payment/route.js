// app/api/activate-ad-after-payment/route.js - SIMPLIFIED VERSION
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
    
    const { paymentIntentId, uploadId } = body;

    // Validation
    if (!paymentIntentId) {
      console.error('❌ [ACTIVATE-AD] Missing paymentIntentId');
      return NextResponse.json({
        success: false,
        error: 'Missing paymentIntentId'
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

    // 2. Find the pending upload
    if (uploadId) {
      console.log('📄 [ACTIVATE-AD] Looking for pending upload:', uploadId);
      
      const pendingRef = db.collection('pendingAdUploads').doc(uploadId);
      const pendingDoc = await pendingRef.get();

      if (pendingDoc.exists) {
        console.log('✅ [ACTIVATE-AD] Found pending upload');
        const pendingData = pendingDoc.data();
        
        // Move to active ads
        const activatedData = {
          ...pendingData,
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
          activatedAt: Timestamp.now()
        };

        const adRef = await db.collection('adUploads').add(activatedData);
        console.log('✅ [ACTIVATE-AD] Created ad in adUploads:', adRef.id);

        // Delete from pending
        await pendingRef.delete();
        console.log('🗑️ [ACTIVATE-AD] Deleted from pendingAdUploads');

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
    }

    console.error('❌ [ACTIVATE-AD] Upload not found');
    return NextResponse.json({
      success: false,
      error: 'Upload not found'
    }, { status: 404 });

  } catch (error) {
    console.error('🚨 [ACTIVATE-AD] ========== ERROR ==========');
    console.error('🚨 [ACTIVATE-AD] Error message:', error.message);
    console.error('🚨 [ACTIVATE-AD] Error stack:', error.stack);

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to activate ad'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';