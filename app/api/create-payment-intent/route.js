// app/api/create-payment-intent/route.js
import { NextResponse } from 'next/server';

// Dynamic import of Stripe to prevent build-time issues
let stripe = null;

function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  return stripe;
}

// Pricing logic for ads
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
    console.log('💰 Creating payment intent:', {
      type: body.adType || 'direct_amount',
      amount: body.amount,
      currency: body.currency || 'ZAR',
      metadata: body.metadata
    });
    
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
      
      console.log('📊 Ad pricing calculated:', {
        adType: body.adType,
        duration: `${body.duration} ${body.durationUnit}`,
        totalHours,
        price: `R${amountInRands}`
      });
      
    } else if (body.amount) {
      // Direct amount provided (for subscriptions, etc.)
      amountInRands = parseFloat(body.amount);
      
      if (isNaN(amountInRands) || amountInRands <= 0) {
        console.error('❌ Invalid amount:', body.amount);
        return NextResponse.json({
          success: false,
          error: 'Invalid amount provided',
        }, { status: 400 });
      }
      
      console.log('💵 Direct payment amount:', `R${amountInRands}`);
      
    } else {
      console.error('❌ Missing required fields: amount or ad details');
      return NextResponse.json({
        success: false,
        error: 'Either amount or ad details must be provided',
      }, { status: 400 });
    }
    
    // Convert to cents (Stripe uses smallest currency unit)
    const currency = (body.currency || 'ZAR').toLowerCase();
    const amountInCents = Math.round(amountInRands * 100);
    
    console.log('💵 Price calculation:', { 
      amountInRands: `R${amountInRands}`,
      amountInCents: `${amountInCents} cents`,
      currency: currency.toUpperCase(),
      metadata
    });
    
    // Get Stripe instance (lazy initialization)
    const stripeClient = getStripe();
    console.log('✅ Stripe client initialized');
    
    // Create PaymentIntent with Stripe
    // automatic_payment_methods will enable Card, Google Pay, Apple Pay automatically
    console.log('🔄 Creating Stripe PaymentIntent...');
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log('✅ Payment intent created successfully:', {
      id: paymentIntent.id,
      amount: `${amountInCents} cents`,
      currency: currency.toUpperCase(),
      status: paymentIntent.status
    });
    
    console.log('📱 Available payment methods will be determined by Stripe based on:');
    console.log('   ✓ Customer location and device');
    console.log('   ✓ Browser capabilities (Chrome = Google Pay, Safari = Apple Pay)');
    console.log('   ✓ Saved payment methods in user account');
    console.log('   ✓ Currency support:', currency.toUpperCase());
    console.log('   ✓ HTTPS requirement (Google Pay & Apple Pay need secure connection)');
    
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: amountInRands,
      currency: currency.toUpperCase(),
      paymentIntentId: paymentIntent.id,
    });
    
  } catch (error) {
    console.error('🚨 Payment intent creation failed:', {
      error: error.message,
      type: error.type,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        type: error.type,
        code: error.code
      } : undefined
    }, { status: 500 });
  }
}

// Mark route as dynamic to prevent static optimization
export const dynamic = 'force-dynamic';