// app/api/signin/route.js
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { NextResponse } from 'next/server';

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
const auth = getAuth(app);

export async function POST(request) {
  ('🔐 /api/signin POST route called');

  try {
    const body = await request.json();
    ('📊 Request body:', { email: body.email, role: body.role });

    const { email, password, role } = body;

    // Validate required fields
    if (!email || !password || !role) {
      console.warn('❌ Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: email, password, role' 
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!['reader', 'publisher'].includes(role)) {
      console.warn('❌ Invalid role:', role);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid role. Must be either "reader" or "publisher"' 
        },
        { status: 400 }
      );
    }

    ('🔍 Processing signin for:', email, 'Role:', role);

    // First, authenticate with Firebase Auth
    let firebaseUser;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      firebaseUser = userCredential.user;
      ('✅ Firebase Auth successful, UID:', firebaseUser.uid);
    } catch (authError) {
      console.error('❌ Firebase Auth failed:', authError.code);
      
      let errorMessage = 'Invalid email or password';
      if (authError.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (authError.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format';
      } else if (authError.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (authError.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage 
        },
        { status: 401 }
      );
    }

    // Now look for the user document using the role-specific UID format
    const collectionName = role === 'reader' ? 'readers' : 'publishers';
    const roleSpecificUid = `${role}_${firebaseUser.uid}`;
    
    ('🔍 Looking up user document:', collectionName, roleSpecificUid);
    
    const userDocRef = doc(db, collectionName, roleSpecificUid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.warn('❌ User not found in', collectionName, 'collection with UID:', roleSpecificUid);
      return NextResponse.json(
        { 
          success: false, 
          error: `No ${role} account found. Please check your role selection or sign up first.` 
        },
        { status: 404 }
      );
    }

    const userData = userDocSnap.data();
    
    ('📄 User data retrieved successfully');
    ('🆔 Document UID:', roleSpecificUid);

    // Check if account is active
    if (!userData.isActive) {
      console.warn('❌ Account is inactive');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your account is currently inactive. Please contact support.' 
        },
        { status: 403 }
      );
    }

    // Update last login timestamp
    try {
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      ('✅ Last login timestamp updated');
    } catch (updateError) {
      console.warn('⚠️ Could not update last login timestamp:', updateError);
      // Don't fail the signin for this
    }

    // Prepare response data (exclude sensitive information)
    const responseUser = {
      uid: roleSpecificUid, // Use the role-specific UID as the main UID
      originalUid: firebaseUser.uid, // Store the Firebase Auth UID separately
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      profilePicture: userData.profilePicture,
      createdAt: userData.createdAt,
      isActive: userData.isActive,
    };

    // Add role-specific data
    if (role === 'publisher') {
      responseUser.companyName = userData.companyName;
      responseUser.industry = userData.industry;
      responseUser.companyWebsite = userData.companyWebsite;
      responseUser.jobTitle = userData.jobTitle;
      responseUser.phone = userData.phone;
      responseUser.publicationType = userData.publicationType;
      responseUser.audienceType = userData.audienceType;
      responseUser.monthlyReadership = userData.monthlyReadership;
      responseUser.isVerified = userData.isVerified;
      responseUser.subscriptionStatus = userData.subscriptionStatus;
      responseUser.totalArticles = userData.totalArticles;
      responseUser.totalViews = userData.totalViews;
    } else if (role === 'reader') {
      responseUser.preferences = userData.preferences;
      responseUser.readingHistory = userData.readingHistory || [];
      responseUser.bookmarks = userData.bookmarks || [];
      responseUser.following = userData.following || [];
    }

    ('🎉 Sign-in completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Sign-in successful',
      user: responseUser
    });

  } catch (error) {
    console.error('❌ Error in /api/signin:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Permission denied. Check Firestore security rules.' 
        },
        { status: 403 }
      );
    }
    
    if (error.code === 'unavailable') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database temporarily unavailable. Please try again.' 
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Only POST is supported.' },
    { status: 405 }
  );
}