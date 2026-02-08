// app/api/create-pending-ad/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request) {
  console.log('📝 [CREATE-PENDING-AD] Starting...');
  
  try {
    const body = await request.json();
    const {
      publisherId,
      templateId,
      deviceType,
      destinationUrl,
      fileName,
      fileSize,
      fileType
    } = body;

    console.log('📋 [CREATE-PENDING-AD] Data:', {
      publisherId,
      templateId,
      deviceType,
      fileName
    });

    // Validation
    if (!publisherId || !templateId || !deviceType || !destinationUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const db = getFirestoreDb();
    
    // Create pending ad record (no file yet)
    const pendingAdData = {
      publisherId,
      templateId: parseInt(templateId, 10),
      deviceType,
      destinationUrl,
      fileName,
      fileSize,
      fileType,
      status: 'awaiting_payment',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await db.collection('pendingAds').add(pendingAdData);

    console.log('✅ [CREATE-PENDING-AD] Created:', docRef.id);

    return NextResponse.json({
      success: true,
      message: 'Pending ad created',
      data: {
        pendingId: docRef.id
      }
    });

  } catch (error) {
    console.error('🚨 [CREATE-PENDING-AD] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create pending ad'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';