import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Flattens a nested metadata object into dot-notation string key-value pairs.
 * Stripe requires all metadata values to be strings (no nested objects).
 * e.g. { duration: { type: 'month', quantity: '2' } }
 *   => { duration_type: 'month', duration_quantity: '2' }
 */
function flattenMetadata(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}_${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flattenMetadata(value, fullKey));
    } else {
      acc[fullKey] = String(value ?? '');
    }
    return acc;
  }, {});
}

export async function POST(request) {
  console.log('💳 [CREATE-PAYMENT-INTENT] Starting...');

  try {
    const body = await request.json();
    const { amount, currency = 'zar', metadata = {} } = body;

    console.log('📋 [CREATE-PAYMENT-INTENT] Request data:', { amount, currency, metadata });

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount. Must be greater than 0' },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(amount * 100);

    // Flatten metadata so all values are strings — Stripe rejects nested objects
    const flatMetadata = {
      ...flattenMetadata(metadata),
      originalAmount: amount.toString(),
      timestamp: new Date().toISOString(),
    };

    console.log('📦 [CREATE-PAYMENT-INTENT] Flattened metadata:', flatMetadata);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: flatMetadata,
      automatic_payment_methods: { enabled: true },
    });

    console.log('✅ [CREATE-PAYMENT-INTENT] Stripe payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });

    const db = getFirestoreDb();

    // ⚠️ clientSecret is intentionally NOT stored — it's a payment credential
    const paymentRecord = {
      paymentIntentId: paymentIntent.id,
      amount,
      amountInCents,
      currency: currency.toUpperCase(),
      status: 'pending',
      metadata, // store original structured metadata for internal use
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      stripeStatus: paymentIntent.status,
    };

    const paymentRef = await db.collection('payments').add(paymentRecord);

    console.log('💾 [CREATE-PAYMENT-INTENT] Payment record saved:', {
      docId: paymentRef.id,
      paymentIntentId: paymentIntent.id,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret, // returned to client only, never stored
      paymentIntentId: paymentIntent.id,
      amount,
      amountInCents,
      currency: currency.toUpperCase(),
      firebaseDocId: paymentRef.id,
    });

  } catch (error) {
    console.error('🚨 [CREATE-PAYMENT-INTENT] Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment intent',
        errorType: error.type,
        errorCode: error.code,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';