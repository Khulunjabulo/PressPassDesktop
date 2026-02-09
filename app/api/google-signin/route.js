// app/api/google-signin/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../../lib/firebase-admin';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  ('🚀 Starting Google sign-in process...');
  
  try {
    const { credential, role, keepSignedIn } = await request.json();
    ('📥 Received sign-in data:', { role, hasCredential: !!credential, keepSignedIn });

    if (!credential) {
      console.error('❌ No Google credential provided');
      return NextResponse.json({ success: false, error: 'No credential provided' }, { status: 400 });
    }

    if (!role || !['reader', 'publisher'].includes(role)) {
      console.error('❌ Invalid role:', role);
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    // Decode Google JWT token
    ('🔍 Decoding Google JWT token...');
    const decodedToken = jwt.decode(credential);
    
    if (!decodedToken) {
      console.error('❌ Failed to decode Google token');
      return NextResponse.json({ success: false, error: 'Invalid Google token' }, { status: 400 });
    }

    ('✅ Google token decoded:', {
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    });

    const { email, name, picture, sub: googleId } = decodedToken;

    // Initialize Firebase
    ('🔥 Initializing Firebase services...');
    const db = getFirestoreDb();
    const auth = getAuth();

    // Get Firebase user by email
    let firebaseUser;
    try {
      ('👤 Checking if user exists in Firebase Auth...');
      firebaseUser = await auth.getUserByEmail(email);
      ('✅ User found in Firebase Auth:', firebaseUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        ('❌ User not found in Firebase Auth');
        return NextResponse.json({ 
          success: false, 
          error: 'No account found with this email. Please sign up first.' 
        }, { status: 404 });
      } else {
        throw error;
      }
    }

    // Look for user in role-specific collection
    const roleSpecificUid = `${role}_${firebaseUser.uid}`;
    const collectionName = role === 'reader' ? 'readers' : 'publishers';
    
    ('🔍 Looking up user in collection:', collectionName, 'with UID:', roleSpecificUid);
    
    const userDoc = await db.collection(collectionName).doc(roleSpecificUid).get();
    
    if (!userDoc.exists) {
      ('❌ User not found in role-specific collection');
      return NextResponse.json({ 
        success: false, 
        error: `No ${role} account found with this email. Please check your role selection or sign up as a ${role}.` 
      }, { status: 404 });
    }

    const userData = userDoc.data();
    ('✅ User data retrieved from Firestore');

    // Check if account is active
    if (!userData.isActive) {
      console.warn('❌ Account is inactive');
      return NextResponse.json({ 
        success: false, 
        error: 'Your account is currently inactive. Please contact support.' 
      }, { status: 403 });
    }

    // Update last login timestamp
    try {
      await db.collection(collectionName).doc(roleSpecificUid).update({
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      ('✅ Last login timestamp updated');
    } catch (updateError) {
      console.warn('⚠️ Could not update last login timestamp:', updateError);
      // Don't fail the signin for this
    }

    // Create custom token for authentication
    ('🎫 Creating custom token...');
    const customToken = await auth.createCustomToken(firebaseUser.uid, {
      role,
      customUid: roleSpecificUid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || name
    });

    // Prepare response user data (exclude sensitive information)
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

    ('🎉 Google sign-in process completed successfully');
    
    return NextResponse.json({
      success: true,
      user: responseUser,
      customToken,
      message: 'Google sign-in successful'
    });

  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Google sign-in failed',
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