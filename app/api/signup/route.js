// File: /app/api/signup/route.js

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { NextResponse } from 'next/server';

// Firebase configuration
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
    console.log('[Firebase] ✅ Initialized');
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

    const body = await req.json();
    console.log('[API] 📥 Received Sign-Up Data:', body);

    const {
      type,
      companyName,
      industry,
      companyWebsite,
      contactName,
      jobTitle,
      email,
      phone,
      publicationType,
      audienceType,
      monthlyReadership,
      firstName,
      lastName,
      password,
      profilePicture,
      googleId,
      isGoogleUser,
      agreeToTerms,
    } = body;

    if (!email || !type || !agreeToTerms) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, type, or terms agreement',
      }, { status: 400 });
    }

    // Generate userId
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const userId = `${type}_${timestamp}_${randomNum}`;
    const collectionName = type === 'publisher' ? 'publishers' : 'readers';

    // Step 1: Create Auth User if not Google
    let firebaseUser = null;
    if (!isGoogleUser) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = userCredential.user;
        console.log('[Auth] ✅ User created:', firebaseUser.uid);

        // Step 2: Send verification email
        await sendEmailVerification(firebaseUser);
        console.log('[Auth] 📧 Verification email sent to:', email);
      } catch (authErr) {
        console.error('[Auth Error]:', authErr.message);
        return NextResponse.json({
          success: false,
          error: `Auth error: ${authErr.message}`,
        }, { status: 500 });
      }
    }

    // Step 3: Prepare and Save Firestore Data
    const userData = {
      userId,
      type,
      email,
      agreeToTerms,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      ...(type === 'publisher'
        ? {
            companyName: companyName || '',
            industry: industry || '',
            companyWebsite: companyWebsite || '',
            contactName: contactName || '',
            jobTitle: jobTitle || '',
            phone: phone || '',
            publicationType: publicationType || '',
            audienceType: audienceType || '',
            monthlyReadership: monthlyReadership ? parseInt(monthlyReadership) : null,
          }
        : {
            firstName: firstName || '',
            lastName: lastName || '',
            password: isGoogleUser ? null : password,
            profilePicture: profilePicture || '',
            googleId: googleId || null,
            isGoogleUser: isGoogleUser || false,
          }),
    };

    console.log(`[Firestore] Saving user to ${collectionName}/${userId}...`);
    await setDoc(doc(db, collectionName, userId), userData);
    console.log(`[Firestore] ✅ Data stored at ${collectionName}/${userId}`);

    return NextResponse.json({
      success: true,
      message: `Registration successful. ${
        !isGoogleUser ? 'Please check your email to verify your account.' : ''
      }`,
      userId,
    }, { status: 201 });

  } catch (error) {
    console.error('[API ERROR] ❌ Registration failed:', error.message);
    return NextResponse.json({
      success: false,
      error: `Registration failed: ${error.message}`,
    }, { status: 500 });
  }
}
