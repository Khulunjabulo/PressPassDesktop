// /api/log-error/route.js - CLIENT SIDE
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, paymentIntentId, error, stack, timestamp, ...additionalData } = body;

    ('📝 [LOG-ERROR] Logging error:', {
      type,
      paymentIntentId,
      error
    });

    const db = getFirestoreDb();
    
    const errorDoc = {
      type: type || 'unknown_error',
      paymentIntentId: paymentIntentId || null,
      errorMessage: error,
      errorStack: stack || null,
      timestamp: timestamp ? new Date(timestamp) : Timestamp.now(),
      createdAt: Timestamp.now(),
      ...additionalData
    };

    const docRef = await db.collection('error_logs').add(errorDoc);

    ('✅ [LOG-ERROR] Error logged:', docRef.id);

    return NextResponse.json({
      success: true,
      errorId: docRef.id
    });

  } catch (error) {
    console.error('🚨 [LOG-ERROR] Failed to log error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';