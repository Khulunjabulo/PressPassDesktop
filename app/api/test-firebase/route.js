// app/api/test-firebase/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, testFirestorePermissions } from '../../../lib/firebase-admin';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let publisherId = searchParams.get('publisherId');

    if (!publisherId) {
      console.warn('⚠️ No publisherId provided, using default: test-publisher');
      publisherId = 'test-publisher';
    }

    ('🔍 Testing Firebase for publisherId:', publisherId);

    // ✅ Get Firestore instance
    const db = getFirestoreDb();

    // Optional: Run a Firestore permissions test
    const permissions = await testFirestorePermissions();

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin connection successful',
      publisherId,
      permissions
    });

  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { publisherId } = body;

    if (!publisherId) {
      console.warn('⚠️ No publisherId in body, using default: test-publisher');
      publisherId = 'test-publisher';
    }

    ('🔍 Testing Firebase for publisherId:', publisherId);

    // ✅ Get Firestore instance
    const db = getFirestoreDb();

    // Optional: Run a Firestore permissions test
    const permissions = await testFirestorePermissions();

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin connection successful',
      publisherId,
      permissions
    });

  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
