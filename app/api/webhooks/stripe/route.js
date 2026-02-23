// /api/webhooks/stripe/route.js - CLIENT SIDE
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  console.log('🪝 [STRIPE-WEBHOOK] Received webhook event');
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ [STRIPE-WEBHOOK] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ [STRIPE-WEBHOOK] Signature verified');
    } catch (err) {
      console.error('❌ [STRIPE-WEBHOOK] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('📨 [STRIPE-WEBHOOK] Event type:', event.type);
    console.log('📋 [STRIPE-WEBHOOK] Event data:', {
      id: event.id,
      type: event.type,
      created: event.created
    });

    const db = getFirestoreDb();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object, db);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object, db);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object, db);
        break;

      case 'payment_intent.created':
        await handlePaymentCreated(event.data.object, db);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object, db);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object, db);
        break;

      default:
        console.log(`ℹ️ [STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
    }

    // Log webhook event
   await db.collection('webhook_events').add({
  eventId: event.id,
  eventType: event.type,
  processed: true,
  timestamp: Timestamp.now(),
  // Store only a safe summary — full event.data.object can exceed Firestore's 1MB limit
  summary: {
    id: event.data.object.id,
    amount: event.data.object.amount,
    currency: event.data.object.currency,
    status: event.data.object.status,
  },
});

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('🚨 [STRIPE-WEBHOOK] Error processing webhook:', {
      message: error.message,
      stack: error.stack
    });

    // Log webhook error
    try {
      const db = getFirestoreDb();
      await db.collection('webhook_errors').add({
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: Timestamp.now()
      });
    } catch (logError) {
      console.error('💥 [STRIPE-WEBHOOK] Failed to log error:', logError);
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentSucceeded(paymentIntent, db) {
  console.log('✅ [WEBHOOK] Payment succeeded:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase()
  });

  const paymentsRef = db.collection('payments');
  const querySnapshot = await paymentsRef
    .where('paymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get();

  const paymentData = {
    status: 'successful',
    stripeStatus: paymentIntent.status,
    amount: paymentIntent.amount / 100,
    amountReceived: paymentIntent.amount_received / 100,
    currency: paymentIntent.currency.toUpperCase(),
    succeededAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    metadata: paymentIntent.metadata || {}
  };

  if (!querySnapshot.empty) {
    const paymentDoc = querySnapshot.docs[0];
    await paymentsRef.doc(paymentDoc.id).update(paymentData);
    console.log('📝 [WEBHOOK] Payment record updated:', paymentDoc.id);
  } else {
    paymentData.paymentIntentId = paymentIntent.id;
    paymentData.createdAt = Timestamp.now();
    const newDoc = await paymentsRef.add(paymentData);
    console.log('📄 [WEBHOOK] New payment record created:', newDoc.id);
  }
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent, db) {
  console.log('❌ [WEBHOOK] Payment failed:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    error: paymentIntent.last_payment_error?.message
  });

  const paymentsRef = db.collection('payments');
  const querySnapshot = await paymentsRef
    .where('paymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get();

  const failureCode = paymentIntent.last_payment_error?.code || 'unknown_error';
  const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
  
  // Determine failure reason category
  let failureReason = 'unknown_error';
  if (failureCode.includes('insufficient')) {
    failureReason = 'insufficient_funds';
  } else if (failureCode.includes('card_declined') || failureCode.includes('declined')) {
    failureReason = 'card_declined';
  } else if (failureCode.includes('fraud') || failureCode.includes('risk')) {
    failureReason = 'fraud_suspected';
  } else if (failureCode.includes('expired')) {
    failureReason = 'card_expired';
  } else if (failureCode.includes('processing')) {
    failureReason = 'processing_error';
  }

  const paymentData = {
    status: 'failed',
    stripeStatus: paymentIntent.status,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase(),
    failureReason: failureReason,
    failureCode: failureCode,
    failureMessage: failureMessage,
    lastError: paymentIntent.last_payment_error,
    failedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    metadata: paymentIntent.metadata || {}
  };

  if (!querySnapshot.empty) {
    const paymentDoc = querySnapshot.docs[0];
    await paymentsRef.doc(paymentDoc.id).update(paymentData);
    console.log('📝 [WEBHOOK] Failed payment record updated:', paymentDoc.id);
  } else {
    paymentData.paymentIntentId = paymentIntent.id;
    paymentData.createdAt = Timestamp.now();
    const newDoc = await paymentsRef.add(paymentData);
    console.log('📄 [WEBHOOK] New failed payment record created:', newDoc.id);
  }
}

// Handle canceled payment
async function handlePaymentCanceled(paymentIntent, db) {
  console.log('🚫 [WEBHOOK] Payment canceled:', {
    id: paymentIntent.id,
    reason: paymentIntent.cancellation_reason
  });

  const paymentsRef = db.collection('payments');
  const querySnapshot = await paymentsRef
    .where('paymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get();

  const paymentData = {
    status: 'canceled',
    stripeStatus: paymentIntent.status,
    canceledReason: paymentIntent.cancellation_reason || 'user_canceled',
    canceledAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  if (!querySnapshot.empty) {
    const paymentDoc = querySnapshot.docs[0];
    await paymentsRef.doc(paymentDoc.id).update(paymentData);
    console.log('📝 [WEBHOOK] Canceled payment record updated:', paymentDoc.id);
  }
}

// Handle payment created
async function handlePaymentCreated(paymentIntent, db) {
  console.log('🆕 [WEBHOOK] Payment created:', {
    id: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency.toUpperCase()
  });

  // This usually happens via the create-payment-intent endpoint
  // But we can create/update here as a backup
  const paymentsRef = db.collection('payments');
  const querySnapshot = await paymentsRef
    .where('paymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    await paymentsRef.add({
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      amountInCents: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'pending',
      stripeStatus: paymentIntent.status,
      metadata: paymentIntent.metadata || {},
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log('📄 [WEBHOOK] Payment record created from webhook');
  }
}

// Handle charge succeeded
async function handleChargeSucceeded(charge, db) {
  console.log('💳 [WEBHOOK] Charge succeeded:', {
    id: charge.id,
    amount: charge.amount / 100,
    paymentIntent: charge.payment_intent
  });

  if (charge.payment_intent) {
    const paymentsRef = db.collection('payments');
    const querySnapshot = await paymentsRef
      .where('paymentIntentId', '==', charge.payment_intent)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0];
      await paymentsRef.doc(paymentDoc.id).update({
        chargeId: charge.id,
        chargeSucceededAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  }
}

// Handle charge failed
async function handleChargeFailed(charge, db) {
  console.log('❌ [WEBHOOK] Charge failed:', {
    id: charge.id,
    paymentIntent: charge.payment_intent,
    failureCode: charge.failure_code,
    failureMessage: charge.failure_message
  });

  if (charge.payment_intent) {
    const paymentsRef = db.collection('payments');
    const querySnapshot = await paymentsRef
      .where('paymentIntentId', '==', charge.payment_intent)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const paymentDoc = querySnapshot.docs[0];
      await paymentsRef.doc(paymentDoc.id).update({
        chargeId: charge.id,
        chargeFailedAt: Timestamp.now(),
        chargeFailureCode: charge.failure_code,
        chargeFailureMessage: charge.failure_message,
        updatedAt: Timestamp.now()
      });
    }
  }
}

export const dynamic = 'force-dynamic';