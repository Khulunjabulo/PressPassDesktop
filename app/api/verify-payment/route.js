// app/api/verify-payment/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    const { paymentIntentId } = await request.json();
    
    console.log('🔍 Verifying payment:', paymentIntentId);
    
    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('💳 Payment status:', paymentIntent.status);
    
    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        verified: true,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        metadata: paymentIntent.metadata,
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        status: paymentIntent.status,
      });
    }
    
  } catch (error) {
    console.error('🚨 Payment verification failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}