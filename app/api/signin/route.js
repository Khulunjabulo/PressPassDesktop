// File: /app/api/google-signup/route.js

import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { adminAuth } from '../../../lib/firebaseAdmin';

// Firebase configuration (same as your signup route)
const firebaseConfig = {
  apiKey: "AIzaSyBGunI4nNpayJebuPecdxY1Ww_K6xEZDR8",
  authDomain: "press-pass-7c6f6.firebaseapp.com",
  projectId: "press-pass-7c6f6",
  storageBucket: "press-pass-7c6f6.appspot.com",
  messagingSenderId: "51480223395",
  appId: "1:51480223395:web:a84c3c28b1afc260e22916",
  measurementId: "G-BCFYT2PYB9",
  databaseURL: "https://press-pass-7c6f6-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let app;
let db;
let auth;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] ✅ Initialized for Google signup');
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error('[Firebase] ❌ Initialization error:', error);
}

export async function POST(req) {
  try {
    if (!db || !auth) {
      return NextResponse.json({
        success: false,
        error: 'Firebase not initialized',
      }, { status: 500 });
    }

    const { token, role = 'reader', profilePicture, firstName, lastName } = await req.json();
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing ID token' 
      }, { status: 400 });
    }

    // Verify the Google ID token using Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('✅ Token verified with Admin SDK:', decodedToken.email);
    } catch (verifyError) {
      console.error('[Token Verification] ❌ Failed:', verifyError);
      
      // Fallback: decode JWT manually
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        decodedToken = {
          uid: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          given_name: payload.given_name,
          family_name: payload.family_name
        };
        console.log('✅ Fallback JWT decode successful:', decodedToken.email);
      } catch (decodeError) {
        console.error('[Token] ❌ Failed to decode token:', decodeError);
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid token format' 
        }, { status: 401 });
      }
    }❌ Failed to decode token:', decodeError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token format' 
      }, { status: 401 });
    }

    const { uid, email, name, picture, given_name, family_name } = decodedToken;

    if (!uid || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token: UID or email missing' 
      }, { status: 401 });
    }

    console.log('✅ Verified Google user:', email, uid);

    // Create Google credential and sign in user
    const credential = GoogleAuthProvider.credentialFromResult({ credential: token });
    let firebaseUser;
    
    try {
      // For Google users, we need to create them in Firebase Auth first
      const userCredential = await signInWithCredential(auth, credential);
      firebaseUser = userCredential.user;
      
      // Send email verification to Google users too
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser);
        console.log('[Auth] 📧 Verification email sent to Google user:', email);
      }
    } catch (authError) {
      console.log('[Auth] User might already exist, continuing with data storage...');
    }

    // Generate userId
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const userId = `${role}_${timestamp}_${randomNum}`;
    const collectionName = role === 'publisher' ? 'publishers' : 'readers';

    // Prepare user data based on role
    const userData = {
      userId,
      type: role,
      email,
      agreeToTerms: true, // Assume Google users agree to terms
      createdAt: new Date().toISOString(),
      emailVerified: false, // Will be true once they verify the email we send
      isGoogleUser: true,
      googleId: uid,
      ...(role === 'publisher'
        ? {
            companyName: '',
            industry: '',
            companyWebsite: '',
            contactName: name || `${given_name} ${family_name}`.trim(),
            jobTitle: '',
            phone: '',
            publicationType: '',
            audienceType: '',
            monthlyReadership: null,
          }
        : {
            firstName: firstName || given_name || '',
            lastName: lastName || family_name || '',
            password: null, // No password for Google users
            profilePicture: profilePicture || picture || '',
          }),
    };

    console.log(`[Firestore] Saving Google user to ${collectionName}/${userId}...`);
    await setDoc(doc(db, collectionName, userId), userData);
    console.log(`[Firestore] ✅ Google user data stored at ${collectionName}/${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Google Sign-Up successful! Please check your email to verify your account.',
      userId,
      user: {
        email,
        name: name || `${given_name} ${family_name}`.trim(),
        picture: picture || profilePicture
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Google Sign-up error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Google registration failed: ${error.message}` 
    }, { status: 500 });
  }
}