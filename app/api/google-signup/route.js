import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../../../lib/firebaseAdmin'; // Adjust path if needed
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    const token = body.token;
    const role = body.role;

    if (!token || !role) {
      console.error('Missing token or role');
      return NextResponse.json({ success: false, error: 'Missing token or role' }, { status: 400 });
    }

    let payload;

    try {
      // Safely decode JWT token in Node.js
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    } catch (decodeError) {
      console.error('❌ Failed to decode token:', decodeError);
      return NextResponse.json({ success: false, error: 'Invalid token format' }, { status: 401 });
    }

    const uid = payload.user_id;

    if (!uid) {
      console.error('❌ UID not found in token payload');
      return NextResponse.json({ success: false, error: 'UID missing in token' }, { status: 401 });
    }

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // New user, save to Firestore
      const userData = {
        uid,
        name: payload.name || '',
        email: payload.email || '',
        picture: payload.picture || '',
        role,
        provider: payload.firebase?.sign_in_provider || 'google',
        email_verified: payload.email_verified || false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, userData);
      console.log('✅ New user saved to Firestore:', userData);
    } else {
      console.log('ℹ️ User already exists in Firestore');
    }

    // Optional: Generate email verification link
    const auth = getAuth();
    try {
      const link = await auth.generateEmailVerificationLink(payload.email);
      console.log('🔗 Email verification link generated:', link);
    } catch (emailError) {
      console.warn('⚠️ Could not generate email verification link:', emailError.message);
    }

    return NextResponse.json({ success: true, uid });

  } catch (error) {
    console.error('❌ Error in /api/google-signup:', error.message);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
