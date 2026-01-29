// /api/create-payment-intent/route.js - CLIENT SIDE
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  console.log('💳 [CREATE-PAYMENT-INTENT] Starting...');
  
  try {
    const body = await request.json();
    const { amount, currency = 'zar', metadata = {} } = body;

    console.log('📋 [CREATE-PAYMENT-INTENT] Request data:', {
      amount,
      currency,
      metadata
    });

    // Validation
    if (!amount || amount <= 0) {
      console.error('❌ [CREATE-PAYMENT-INTENT] Invalid amount:', amount);
      return NextResponse.json({
        success: false,
        error: 'Invalid amount. Must be greater than 0'
      }, { status: 400 });
    }

    // Convert amount to cents (Stripe requires smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    console.log('💰 [CREATE-PAYMENT-INTENT] Amount conversion:', {
      original: amount,
      inCents: amountInCents,
      currency: currency.toUpperCase()
    });

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        originalAmount: amount.toString(),
        timestamp: new Date().toISOString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ [CREATE-PAYMENT-INTENT] Stripe payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    // Store initial payment record in Firebase
    const db = getFirestoreDb();
    const paymentRecord = {
      paymentIntentId: paymentIntent.id,
      amount: amount, // Store original amount
      amountInCents: amountInCents,
      currency: currency.toUpperCase(),
      status: 'pending',
      metadata: metadata,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      stripeStatus: paymentIntent.status,
      clientSecret: paymentIntent.client_secret
    };

    const paymentRef = await db.collection('payments').add(paymentRecord);

    console.log('💾 [CREATE-PAYMENT-INTENT] Payment record saved to Firebase:', {
      docId: paymentRef.id,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency.toUpperCase()
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      amountInCents: amountInCents,
      currency: currency.toUpperCase(),
      firebaseDocId: paymentRef.id
    });

  } catch (error) {
    console.error('🚨 [CREATE-PAYMENT-INTENT] Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create payment intent',
      errorType: error.type,
      errorCode: error.code
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';