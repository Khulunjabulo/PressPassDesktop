// api/test-firebase-admin/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../lib/firebase-admin';

export async function GET() {
  try {
    console.log('🧪 Testing Firebase Admin SDK initialization...');
    
    // Test Firestore initialization
    const db = getFirestoreDb();
    console.log('✅ Firestore initialized successfully');
    
    // Test Auth initialization
    const auth = getAuth();
    console.log('✅ Auth initialized successfully');
    
    // Test basic Firestore operation
    const testRef = db.collection('test').doc('firebase-admin-test');
    await testRef.set({
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Firestore write operation successful');
    
    // Test basic Auth operation
    const users = await auth.listUsers(1);
    console.log('✅ Auth read operation successful');
    
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