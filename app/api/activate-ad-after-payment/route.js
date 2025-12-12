// app/api/activate-ad-after-payment/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      paymentIntentId, 
      publisherId, 
      templateId, 
      deviceType,
      fileData // base64 or file reference
    } = body;

    console.log('🔓 Activating ad after payment:', {
      paymentIntentId,
      publisherId,
      templateId,
      deviceType
    });

    if (!paymentIntentId || !publisherId || !templateId || !deviceType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment with Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      );
    }

    console.log('✅ Payment verified:', {
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    const db = getFirestoreDb();

    // Check if ad already exists for this payment
    const existingAdsQuery = await db
      .collection('adUploads')
      .where('paymentIntentId', '==', paymentIntentId)
      .get();

    if (!existingAdsQuery.empty) {
      console.log('ℹ️ Ad already activated for this payment');
      return NextResponse.json({
        success: true,
        message: 'Ad already activated',
        data: { adId: existingAdsQuery.docs[0].id }
      });
    }

    // Create new active ad
    const adData = {
      publisherId,
      templateId: parseInt(templateId, 10),
      deviceType,
      fileName: fileData?.name || 'Uploaded Ad',
      fileSize: fileData?.size || 0,
      fileType: fileData?.type || 'image/jpeg',
      imageSrc: fileData?.imageSrc || '',
      uploadedAt: Timestamp.now(),
      activatedAt: Timestamp.now(),
      status: 'active',
      paymentIntentId,
      paymentStatus: 'completed',
      paymentAmount: paymentIntent.amount / 100, // Convert from cents
      paymentCurrency: paymentIntent.currency.toUpperCase(),
      impressions: 0,
      clicks: 0
    };

    const docRef = await db.collection('adUploads').add(adData);

    console.log('✅ Ad activated and saved:', {
      adId: docRef.id,
      templateId,
      deviceType
    });

    // Log the transaction
    await db.collection('adTransactions').add({
      adId: docRef.id,
      publisherId,
      paymentIntentId,
      amount: adData.paymentAmount,
      currency: adData.paymentCurrency,
      templateId: adData.templateId,
      deviceType: adData.deviceType,
      status: 'completed',
      createdAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Ad activated successfully',
      data: {
        adId: docRef.id,
        status: 'active',
        paymentAmount: adData.paymentAmount,
        paymentCurrency: adData.paymentCurrency
      }
    });

  } catch (error) {
    console.error('💥 Error activating ad:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to activate ad after payment',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';