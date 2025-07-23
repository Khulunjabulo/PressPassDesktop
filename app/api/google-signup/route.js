import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/firebase/firebaseAdmin';

export async function POST(req) {
  try {
    const { email, uid } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing UID or email' }, { status: 400 });
    }

    const userRef = db.ref(`users/${uid}`);
    await userRef.set({
      email,
      role: 'reader', // or 'buyer' depending on what you want
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'User signed up with Google', uid });
  } catch (error) {
    console.error('Google Sign-up error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
