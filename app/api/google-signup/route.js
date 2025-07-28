// File: /app/api/google-signup/route.js
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../../../lib/firebaseAdmin';

export async function POST(req) {
  try {
    const { token, role = 'reader', profilePicture, firstName, lastName } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    // ✅ Verify token using Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    if (!uid || !email) {
      return NextResponse.json({ error: 'Invalid token: UID or email missing' }, { status: 401 });
    }

    console.log('✅ Verified Google user:', email, uid);

    const userRef = db.ref(`users/${uid}`);
    await userRef.set({
      uid,
      email,
      role,
      firstName: firstName || '',
      lastName: lastName || '',
      profilePicture: profilePicture || '',
      isGoogleUser: true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Google Sign-Up successful', uid });
  } catch (error) {
    console.error('❌ Google Sign-up error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
