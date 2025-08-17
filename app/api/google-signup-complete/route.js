// app/api/google-signup-complete/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../../lib/firebase-admin';

export async function POST(request) {
  console.log('🚀 Starting Google sign-up completion process...');
  
  try {
    const { uid, role, additionalData, tempToken } = await request.json();
    console.log('📥 Received completion data:', { uid, role, hasAdditionalData: !!additionalData });

    if (!uid || !role || !additionalData) {
      console.error('❌ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: uid, role, additionalData' 
      }, { status: 400 });
    }

    // Validate role
    if (!['reader', 'publisher'].includes(role)) {
      console.error('❌ Invalid role:', role);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Must be either "reader" or "publisher"' 
      }, { status: 400 });
    }

    // Initialize Firebase
    console.log('🔥 Initializing Firebase services...');
    const db = getFirestoreDb();
    const auth = getAuth();

    // Verify the Firebase user exists
    let firebaseUser;
    try {
      firebaseUser = await auth.getUser(uid);
      console.log('✅ Firebase user verified:', firebaseUser.uid);
    } catch (error) {
      console.error('❌ Firebase user not found:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in Firebase Auth' 
      }, { status: 404 });
    }

    // Generate role-specific document ID
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
      uid: roleSpecificUid, // Use role-specific UID as document ID
      originalUid: firebaseUser.uid, // Store original Firebase UID
      email: firebaseUser.email,
      role,
      profilePicture: additionalData.profilePicture || firebaseUser.photoURL,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signUpMethod: 'google'
    };

    if (role === 'reader') {
      userData = {
        ...userData,
        firstName: additionalData.firstName || firebaseUser.displayName?.split(' ')[0] || '',
        lastName: additionalData.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        preferences: {
          categories: additionalData.categories || [],
          notifications: true
        },
        readingHistory: [],
        bookmarks: [],
        following: []
      };
      console.log('👤 Prepared reader data');
    } else if (role === 'publisher') {
      userData = {
        ...userData,
        firstName: additionalData.contactName?.split(' ')[0] || firebaseUser.displayName?.split(' ')[0] || '',
        lastName: additionalData.contactName?.split(' ').slice(1).join(' ') || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        companyName: additionalData.companyName || '',
        industry: additionalData.industry || '',
        companyWebsite: additionalData.companyWebsite || '',
        contactName: additionalData.contactName || firebaseUser.displayName || '',
        jobTitle: additionalData.jobTitle || '',
        phone: additionalData.phone || '',
        publicationType: additionalData.publicationType || '',
        audienceType: additionalData.audienceType || '',
        monthlyReadership: additionalData.monthlyReadership || 0,
        companyLogo: null,
        staff: [],
        totalArticles: 0,
        totalViews: 0,
        isVerified: false,
        subscriptionStatus: 'free',
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
      customUid: roleSpecificUid,
      email: firebaseUser.email
    });

    console.log('🎉 Google sign-up completion process finished successfully');
    
    return NextResponse.json({
      success: true,
      user: userData,
      customToken,
      message: `${role} account created successfully`
    });

  } catch (error) {
    console.error('❌ Google sign-up completion error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Google sign-up completion failed',
      code: error.code || 'unknown'
    }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Only POST is supported.' },
    { status: 405 }
  );
}