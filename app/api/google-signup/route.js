// app/api/google-signup/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../../lib/firebase-admin';
import { OAuth2Client } from 'google-auth-library';

export async function POST(request) {
  console.log('🚀 Starting Google sign-up process...');
  
  try {
    const { credential } = await request.json();
    console.log('📥 Received data:', { hasCredential: !!credential });

    if (!credential) {
      console.error('❌ No Google credential provided');
      return NextResponse.json({ success: false, error: 'No credential provided' }, { status: 400 });
    }

    // Verify Google ID token
    console.log('🔍 Verifying Google ID token...');
    const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error('❌ Failed to verify Google token:', error);
      return NextResponse.json({ success: false, error: 'Invalid Google token' }, { status: 400 });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      console.error('❌ No payload in Google token');
      return NextResponse.json({ success: false, error: 'Invalid Google token' }, { status: 400 });
    }

    console.log('✅ Google token verified:', {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    });

    const { email, name, picture, sub: googleId } = payload;

    // Initialize Firebase
    console.log('🔥 Initializing Firebase services...');
    const db = getFirestoreDb();
    const auth = getAuth();

    // Check if user already exists in Firebase Auth
    let firebaseUser;
    try {
      console.log('👤 Checking if user exists in Firebase Auth...');
      firebaseUser = await auth.getUserByEmail(email);
      console.log('✅ User already exists in Firebase Auth:', firebaseUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('➕ Creating new Firebase user...');
        console.log('🔍 Attempting to create user with params:', { email, displayName: name, photoURL: picture });
        try {
          firebaseUser = await auth.createUser({
            email,
            displayName: name,
            photoURL: picture,
          });
          console.log('✅ Firebase user created:', firebaseUser.uid);
        } catch (createError) {
          console.error('❌ Failed to create Firebase user:', createError.message, 'Code:', createError.code);
          throw createError;
        }
      } else {
        throw error;
      }
    }

    // Return success with user info for form completion
    console.log('📝 Returning user info for form completion');

    // Generate a temporary token for form completion
    const tempToken = await auth.createCustomToken(firebaseUser.uid, {
      isTemporary: true,
      email: email,
      name: name,
      picture: picture
    });

    return NextResponse.json({
      success: true,
      needsFormCompletion: true,
      user: {
        uid: firebaseUser.uid,
        email,
        name,
        picture,
      },
      tempToken
    });

  } catch (error) {
    console.error('❌ Google sign-up error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Google sign-up failed',
      code: error.code || 'unknown'
    }, { status: 500 });
  }
}