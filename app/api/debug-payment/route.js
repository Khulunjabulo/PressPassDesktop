// /api/debug-payment/route.js - CLIENT SIDE
// Use this to troubleshoot payment issues
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json({
        error: 'paymentIntentId query parameter required'
      }, { status: 400 });
    }

    console.log('🔍 [DEBUG] Looking up payment:', paymentIntentId);

    // Get from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Get from Firebase
    const db = getFirestoreDb();
    const paymentsSnapshot = await db.collection('payments')
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    let firebaseData = null;
    if (!paymentsSnapshot.empty) {
      const doc = paymentsSnapshot.docs[0];
      firebaseData = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString()
      };
    }

    // Check for associated ad
    const adUploadsSnapshot = await db.collection('adUploads')
      .where('paymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    let adData = null;
    if (!adUploadsSnapshot.empty) {
      const doc = adUploadsSnapshot.docs[0];
      adData = {
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate().toISOString(),
        activatedAt: doc.data().activatedAt?.toDate().toISOString()
      };
    }

    // Check activation errors
    const activationErrorsSnapshot = await db.collection('activation_errors')
      .where('paymentIntentId', '==', paymentIntentId)
      .get();

    const activationErrors = activationErrorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate().toISOString()
    }));

    return NextResponse.json({
      success: true,
      paymentIntentId,
      stripe: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        metadata: paymentIntent.metadata,
        created: new Date(paymentIntent.created * 1000).toISOString()
      },
      firebase: {
        paymentRecord: firebaseData,
        adRecord: adData,
        activationErrors: activationErrors
      },
      diagnosis: {
        paymentSuccessful: paymentIntent.status === 'succeeded',
        paymentRecordExists: !!firebaseData,
        adCreated: !!adData,
        hasActivationErrors: activationErrors.length > 0,
        issue: !adData && paymentIntent.status === 'succeeded' 
          ? 'Payment succeeded but ad was not created' 
          : null
      }
    });

  } catch (error) {
    console.error('🚨 [DEBUG] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';