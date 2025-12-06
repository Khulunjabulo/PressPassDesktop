// app/api/create-payment-intent/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Pricing logic for ads (can be removed if ads handle their own pricing)
function calculateAdPrice(adType, hours) {
  const isBanner = adType === 'banner';
  const days = Math.ceil(hours / 24);
  
  let pricePerDay;
  if (isBanner) {
    pricePerDay = hours <= 12 ? 100 : 150;
  } else {
    pricePerDay = hours <= 12 ? 50 : 100;
  }
  
  if (hours <= 12) {
    return pricePerDay;
  } else if (hours <= 24) {
    return isBanner ? 150 : 100;
  } else {
    const dailyRate = isBanner ? 150 : 100;
    return dailyRate * days;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('💰 Creating payment intent:', body);
    
    let amountInRands;
    let metadata = body.metadata || {};
    
    // Handle different payment types
    if (body.adType && body.duration && body.durationUnit) {
      // Ad payment - calculate price
      let totalHours;
      switch (body.durationUnit) {
        case 'hours':
          totalHours = body.duration;
          break;
        case 'days':
          totalHours = body.duration * 24;
          break;
        case 'weeks':
          totalHours = body.duration * 24 * 7;
          break;
        case 'months':
          totalHours = body.duration * 24 * 30;
          break;
        default:
          totalHours = body.duration * 24;
      }
      
      amountInRands = calculateAdPrice(body.adType, totalHours);
      
      metadata = {
        ...metadata,
        type: 'advertisement',
        adType: body.adType,
        duration: body.duration,
        durationUnit: body.durationUnit,
        totalHours,
      };
      
    } else if (body.amount) {
      // Direct amount provided (for subscriptions, etc.)
      amountInRands = parseFloat(body.amount);
      
      if (isNaN(amountInRands) || amountInRands <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid amount provided',
        }, { status: 400 });
      }
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either amount or ad details must be provided',
      }, { status: 400 });
    }
    
    // Convert to cents (Stripe uses smallest currency unit)
    const currency = (body.currency || 'ZAR').toLowerCase();
    const amountInCents = Math.round(amountInRands * 100);
    
    console.log('💵 Price calculation:', { 
      amountInRands, 
      amountInCents,
      currency,
      metadata
    });
    
    // Create PaymentIntent with Stripe
    // Using automatic_payment_methods enables card, Google Pay, Apple Pay automatically
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
    
    console.log('✅ Payment intent created:', paymentIntent.id);
    
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: amountInRands,
      currency: currency.toUpperCase(),
      paymentIntentId: paymentIntent.id,
    });
    
  } catch (error) {
    console.error('🚨 Payment intent creation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}