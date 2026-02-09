// api/test-firebase-admin/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '@/lib/firebase-admin.js';

export async function GET() {
  try {
    ('🧪 Testing Firebase Admin SDK initialization...');
    
    // Test Firestore initialization
    const db = getFirestoreDb();
    ('✅ Firestore initialized successfully');
    
    // Test Auth initialization
    const auth = getAuth();
    ('✅ Auth initialized successfully');
    
    // Test basic Firestore operation
    const testRef = db.collection('test').doc('firebase-admin-test');
    await testRef.set({
      test: true,
      timestamp: new Date().toISOString()
    });
    ('✅ Firestore write operation successful');
    
    // Test basic Auth operation
    const users = await auth.listUsers(1);
    ('✅ Auth read operation successful');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working correctly'
    });
  } catch (error) {
    console.error('❌ Firebase Admin SDK test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}