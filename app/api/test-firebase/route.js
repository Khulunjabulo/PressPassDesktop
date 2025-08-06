// app/api/test-firebase/route.js
import { NextResponse } from 'next/server';
const { testFirestorePermissions, getFirestoreDb } = require('../../../lib/firebase-admin');

export async function GET() {
  console.log('================ API DEBUG: /api/test-firebase ================');

  try {
    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired:', !!db);

    console.log('🧪 Testing Firebase Admin configuration...');
    const result = await testFirestorePermissions();

    if (result.success) {
      console.log('✅ Firebase Admin test successful');
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin is properly configured',
        result
      }, { status: 200 });
    } else {
      console.error('❌ Firebase Admin test failed:', result);
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin test failed',
        details: result
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Firebase Admin test error:', error.message);
    console.error('❌ Full error:', error);
    return NextResponse.json({
      success: false,
      error: 'Firebase Admin configuration error',
      details: error.message
    }, { status: 500 });
  }
}
