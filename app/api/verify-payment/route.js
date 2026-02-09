// /api/verify-payment/route.js - UPDATED WITH EXTENSION & INVOICE SUPPORT
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  ('🔍 [VERIFY-PAYMENT] Starting verification...');
  
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      console.error('❌ [VERIFY-PAYMENT] Missing paymentIntentId');
      return NextResponse.json({
        success: false,
        error: 'Payment Intent ID is required'
      }, { status: 400 });
    }

    ('🔎 [VERIFY-PAYMENT] Retrieving payment from Stripe:', paymentIntentId);

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    ('📊 [VERIFY-PAYMENT] Stripe payment intent retrieved:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      amountReceived: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata
    });

    const isSuccessful = paymentIntent.status === 'succeeded';
    const amount = paymentIntent.amount / 100; // Convert from cents
    const currency = paymentIntent.currency.toUpperCase();

    // Update payment record in Firebase
    const db = getFirestoreDb();
    const paymentsRef = db.collection('payments');
    
    // Find the payment record by paymentIntentId
    const querySnapshot = await paymentsRef
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    let firebaseDocId = null;
    let paymentUpdateResult = null;

    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0];
      firebaseDocId = paymentDoc.id;
      
      ('📝 [VERIFY-PAYMENT] Updating existing payment record:', firebaseDocId);

      const updateData = {
        status: isSuccessful ? 'successful' : 'failed',
        stripeStatus: paymentIntent.status,
        amount: amount,
        amountReceived: paymentIntent.amount_received / 100,
        currency: currency,
        verifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastError: paymentIntent.last_payment_error?.message || null,
        failureReason: isSuccessful ? null : (
          paymentIntent.last_payment_error?.code || 
          paymentIntent.cancellation_reason || 
          'unknown_error'
        )
      };

      await paymentsRef.doc(firebaseDocId).update(updateData);
      paymentUpdateResult = updateData;

      ('✅ [VERIFY-PAYMENT] Payment record updated:', {
        docId: firebaseDocId,
        status: updateData.status,
        amount: updateData.amount,
        currency: updateData.currency
      });

    } else {
      // Create new payment record if it doesn't exist
      ('⚠️ [VERIFY-PAYMENT] Payment record not found, creating new one');
      
      const newPaymentData = {
        paymentIntentId: paymentIntent.id,
        amount: amount,
        amountInCents: paymentIntent.amount,
        amountReceived: paymentIntent.amount_received / 100,
        currency: currency,
        status: isSuccessful ? 'successful' : 'failed',
        stripeStatus: paymentIntent.status,
        metadata: paymentIntent.metadata || {},
        createdAt: Timestamp.now(),
        verifiedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastError: paymentIntent.last_payment_error?.message || null,
        failureReason: isSuccessful ? null : (
          paymentIntent.last_payment_error?.code || 
          paymentIntent.cancellation_reason || 
          'unknown_error'
        )
      };

      const newPaymentRef = await paymentsRef.add(newPaymentData);
      firebaseDocId = newPaymentRef.id;
      paymentUpdateResult = newPaymentData;

      ('✅ [VERIFY-PAYMENT] New payment record created:', {
        docId: firebaseDocId,
        paymentIntentId: paymentIntent.id
      });
    }

    // 🆕 Handle ad extension if this is an extension payment
    if (isSuccessful && paymentIntent.metadata?.type === 'ad_extension') {
      ('🔄 [VERIFY-PAYMENT] This is an ad extension payment, processing...');
      
      const { adId, extensionDays, publisherId } = paymentIntent.metadata;
      
      if (adId && extensionDays) {
        try {
          const adsRef = db.collection('advertisements');
          const adDoc = await adsRef.doc(adId).get();
          
          if (adDoc.exists) {
            const adData = adDoc.data();
            
            // Calculate new end date
            const currentEndDate = adData.schedule?.endDate?.toDate 
              ? adData.schedule.endDate.toDate() 
              : new Date();
            
            const newEndDate = new Date(currentEndDate);
            newEndDate.setDate(newEndDate.getDate() + parseInt(extensionDays));
            
            // Update ad with extended duration
            const updateData = {
              'schedule.endDate': Timestamp.fromDate(newEndDate),
              'schedule.duration': (adData.schedule?.duration || 0) + parseInt(extensionDays),
              updatedAt: Timestamp.now(),
              'paymentInfo.extensionHistory': [
                ...(adData.paymentInfo?.extensionHistory || []),
                {
                  paymentIntentId,
                  extensionDays: parseInt(extensionDays),
                  amount,
                  currency,
                  extendedAt: Timestamp.now(),
                  previousEndDate: Timestamp.fromDate(currentEndDate),
                  newEndDate: Timestamp.fromDate(newEndDate)
                }
              ]
            };

            await adsRef.doc(adId).update(updateData);

            ('✅ [VERIFY-PAYMENT] Ad extended successfully:', {
              adId,
              previousEndDate: currentEndDate.toISOString(),
              newEndDate: newEndDate.toISOString(),
              extensionDays: parseInt(extensionDays)
            });

          } else {
            console.error('❌ [VERIFY-PAYMENT] Ad not found for extension:', adId);
          }
          
        } catch (extError) {
          console.error('🚨 [VERIFY-PAYMENT] Error extending ad:', extError);
          // Don't fail the whole payment verification, just log the error
        }
      }
    }

    // Log detailed result
    ('🎯 [VERIFY-PAYMENT] Final verification result:', {
      verified: isSuccessful,
      paymentIntentId: paymentIntent.id,
      firebaseDocId: firebaseDocId,
      amount: amount,
      currency: currency,
      status: paymentIntent.status,
      type: paymentIntent.metadata?.type || 'unknown',
      failureReason: paymentUpdateResult?.failureReason || null
    });

    return NextResponse.json({
      success: true,
      verified: isSuccessful,
      paymentIntentId: paymentIntent.id,
      firebaseDocId: firebaseDocId,
      amount: amount,
      currency: currency,
      metadata: paymentIntent.metadata || {},
      stripeStatus: paymentIntent.status,
      failureReason: paymentUpdateResult?.failureReason || null,
      lastError: paymentIntent.last_payment_error?.message || null,
      message: isSuccessful 
        ? `Payment of ${currency} ${amount} verified successfully` 
        : `Payment failed: ${paymentUpdateResult?.failureReason || 'Unknown error'}`
    });

  } catch (error) {
    console.error('🚨 [VERIFY-PAYMENT] Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });

    // Store failed verification attempt in Firebase
    try {
      const db = getFirestoreDb();
      await db.collection('payment_errors').add({
        paymentIntentId: body?.paymentIntentId || null,
        errorMessage: error.message,
        errorType: error.type,
        errorCode: error.code,
        timestamp: Timestamp.now()
      });
    } catch (logError) {
      console.error('💥 [VERIFY-PAYMENT] Failed to log error:', logError);
    }

    return NextResponse.json({
      success: false,
      verified: false,
      error: error.message || 'Failed to verify payment',
      errorType: error.type,
      errorCode: error.code
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';