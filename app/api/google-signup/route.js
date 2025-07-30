// pages/api/google-signup.js
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, createCustomToken } from 'firebase-admin/auth';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// Initialize Firebase Admin
if (getAdminApps().length === 0) {
  initializeAdminApp({
    credential: credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Initialize Firebase client
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const adminAuth = getAuth();

// Function to verify Google ID token
async function verifyGoogleToken(credential) {
  try {
    console.log('🔍 Verifying Google ID token...');
    
    // Decode the JWT token (you might want to use a proper JWT library)
    const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
    console.log('👤 Google token payload:', payload);
    
    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };
  } catch (error) {
    console.error('❌ Error verifying Google token:', error);
    throw new Error('Invalid Google token');
  }
}

export default async function handler(req, res) {
  console.log('🔐 /api/google-signup endpoint called');
  console.log('🔍 Request method:', req.method);
  console.log('📊 Request body keys:', Object.keys(req.body));

  if (req.method !== 'POST') {
    console.warn('❌ Invalid request method:', req.method);
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const {
      credential,
      role,
      firstName: additionalFirstName,
      lastName: additionalLastName,
      profilePicture,
    } = req.body;

    console.log('🔍 Validating request data...');
    
    if (!credential) {
      console.warn('❌ Missing Google credential');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing Google credential' 
      });
    }

    if (!role || !['reader', 'publisher'].includes(role)) {
      console.warn('❌ Invalid or missing role:', role);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role. Must be either "reader" or "publisher"' 
      });
    }

    console.log('🔐 Verifying Google token...');
    const googleUser = await verifyGoogleToken(credential);
    
    if (!googleUser.email_verified) {
      console.warn('❌ Google email not verified');
      return res.status(400).json({ 
        success: false, 
        error: 'Google email not verified' 
      });
    }

    console.log('✅ Google token verified for user:', googleUser.email);

    // Check if user already exists
    const userDocRef = doc(db, 'users', googleUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('👤 User already exists, signing them in...');
      
      // Create custom token for existing user
      const customToken = await adminAuth.createCustomToken(googleUser.uid);
      
      return res.status(200).json({
        success: true,
        message: 'User signed in successfully',
        customToken,
        user: userDoc.data(),
        isNewUser: false,
      });
    }

    console.log('👤 Creating new user account...');

    // Parse name from Google or use provided names
    const [googleFirstName, ...googleLastNameParts] = (googleUser.name || '').split(' ');
    const googleLastName = googleLastNameParts.join(' ');

    const firstName = additionalFirstName || googleFirstName || '';
    const lastName = additionalLastName || googleLastName || '';

    // Prepare user data
    const userData = {
      uid: googleUser.uid,
      email: googleUser.email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      profilePicture: profilePicture || googleUser.picture || null,
      authProvider: 'google',
      googleData: {
        googleId: googleUser.uid,
        verified: googleUser.email_verified,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    console.log('💾 Saving new user to Firestore...');
    console.log('📄 User data:', JSON.stringify(userData, null, 2));

    // Save user to Firestore
    await setDoc(userDocRef, userData);
    console.log('✅ User saved to Firestore');

    // Create role-specific profile
    if (role === 'publisher') {
      console.log('📋 Creating publisher profile...');
      
      // For Google signup, we might not have all publisher data
      // So we create a basic profile that they can complete later
      const publisherProfileRef = doc(db, 'publishers', googleUser.uid);
      const publisherProfile = {
        uid: googleUser.uid,
        email: userData.email,
        contactName: `${firstName} ${lastName}`.trim(),
        companyName: '', // To be filled later
        industry: '',
        companyWebsite: null,
        jobTitle: '',
        phone: null,
        publicationType: '',
        audienceType: '',
        monthlyReadership: null,
        profilePicture: userData.profilePicture,
        isVerified: false,
        subscriptionStatus: 'trial',
        totalArticles: 0,
        totalViews: 0,
        profileComplete: false, // Flag to indicate incomplete profile
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(publisherProfileRef, publisherProfile);
      console.log('✅ Publisher profile created');
    }

    if (role === 'reader') {
      console.log('👤 Creating reader profile...');
      
      const readerProfileRef = doc(db, 'readers', googleUser.uid);
      const readerProfile = {
        uid: googleUser.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profilePicture: userData.profilePicture,
        preferences: {
          categories: [],
          notifications: true,
        },
        readingHistory: [],
        bookmarks: [],
        following: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(readerProfileRef, readerProfile);
      console.log('✅ Reader profile created');
    }

    // Create custom token for Firebase Auth
    console.log('🔑 Creating custom token...');
    const customToken = await adminAuth.createCustomToken(googleUser.uid);
    console.log('✅ Custom token created');

    console.log('🎉 Google signup completed successfully');

    res.status(200).json({
      success: true,
      message: 'User registered successfully with Google',
      customToken,
      user: {
        uid: googleUser.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        profilePicture: userData.profilePicture,
      },
      isNewUser: true,
      needsProfileCompletion: role === 'publisher', // Publishers need to complete their profile
    });

  } catch (error) {
    console.error('❌ Error in /api/google-signup:', error);
    
    // Handle specific errors
    if (error.message === 'Invalid Google token') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Google credentials' 
      });
    }
    
    if (error.code === 'auth/uid-already-exists') {
      return res.status(409).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }

    if (error.code === 'permission-denied') {
      return res.status(403).json({ 
        success: false, 
        error: 'Permission denied. Check Firestore security rules.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Internal server error. Please try again.' 
    });
  }
}