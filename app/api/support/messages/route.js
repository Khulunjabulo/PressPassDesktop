// app/api/support/messages/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, conversationId } = body;

    if (!userId || !conversationId) {
      return NextResponse.json(
        { success: false, error: 'userId and conversationId are required' },
        { status: 400 }
      );
    }

    const db = getFirestoreDb();
    
    // Get messages from Firestore
    const messagesRef = db
      .collection('support-messages')
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc');

    const snapshot = await messagesRef.get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString()
      });
    });

    return NextResponse.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('❌ [SUPPORT-MESSAGES] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';