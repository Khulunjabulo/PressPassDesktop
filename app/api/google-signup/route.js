// app/api/google-signup/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../../lib/firebase-admin';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  console.log('🚀 Starting Google sign-up process...');
  
  try {
    const { credential, role, additionalData } = await request.json();
    console.log('📥 Received data:', { role, hasCredential: !!credential, additionalData: !!additionalData });

    if (!credential) {
      console.error('❌ No Google credential provided');
      return NextResponse.json({ success: false, error: 'No credential provided' }, { status: 400 });
    }

    // Decode Google JWT token
    console.log('🔍 Decoding Google JWT token...');
    const decodedToken = jwt.decode(credential);
    
    if (!decodedToken) {
      console.error('❌ Failed to decode Google token');
      return NextResponse.json({ success: false, error: 'Invalid Google token' }, { status: 400 });
    }

    console.log('✅ Google token decoded:', {
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    });

    const { email, name, picture, sub: googleId } = decodedToken;

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
        firebaseUser = await auth.createUser({
          email,
          displayName: name,
          photoURL: picture,
          uid: googleId, // Use Google ID as Firebase UID for consistency
        });
        console.log('✅ Firebase user created:', firebaseUser.uid);
      } else {
        throw error;
      }
    }

    // If no additional data provided, return success with user info for form completion
    if (!additionalData) {
      console.log('📝 No additional data provided, returning user info for form completion');
      
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
    }

    // Process form completion with additional data
    console.log('📋 Processing form completion with additional data...');
    const roleSpecificUid = `${role}_${firebaseUser.uid}`;
    const collectionName = role === 'reader' ? 'readers' : 'publishers';

    // Check if user already exists in role-specific collection
    const existingDoc = await db.collection(collectionName).doc(roleSpecificUid).get();
    
    if (existingDoc.exists) {
      console.log('⚠️ User already exists in role-specific collection');
      return NextResponse.json({ 
        success: false, 
        error: `You already have a ${role} account. Please sign in instead.` 
      }, { status: 409 });
    }

    // Prepare user data based on role
    let userData = {
      uid: firebaseUser.uid,
      email,
      role,
      googleId,
      profilePicture: picture,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signUpMethod: 'google'
    };

    if (role === 'reader') {
      userData = {
        ...userData,
        firstName: additionalData.firstName || name.split(' ')[0] || '',
        lastName: additionalData.lastName || name.split(' ').slice(1).join(' ') || '',
        preferences: {
          categories: [],
          notifications: true
        }
      };
      console.log('👤 Prepared reader data');
    } else if (role === 'publisher') {
      userData = {
        ...userData,
        companyName: additionalData.companyName || '',
        industry: additionalData.industry || '',
        companyWebsite: additionalData.companyWebsite || '',
        contactName: additionalData.contactName || name,
        jobTitle: additionalData.jobTitle || '',
        phone: additionalData.phone || '',
        publicationType: additionalData.publicationType || '',
        audienceType: additionalData.audienceType || '',
        monthlyReadership: additionalData.monthlyReadership || 0,
        companyLogo: null,
        staff: [],
        articlesCount: 0,
        lastPosted: null
      };
      console.log('🏢 Prepared publisher data');
    }

    // Save to Firestore
    console.log('💾 Saving user data to Firestore...');
    await db.collection(collectionName).doc(roleSpecificUid).set(userData);
    console.log('✅ User data saved successfully');

    // Create custom token for authentication
    console.log('🎫 Creating custom token...');
    const customToken = await auth.createCustomToken(firebaseUser.uid, {
      role,
      email,
      name
    });

    console.log('🎉 Google sign-up process completed successfully');
    
    return NextResponse.json({
      success: true,
      user: userData,
      customToken,
      message: `${role} account created successfully`
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