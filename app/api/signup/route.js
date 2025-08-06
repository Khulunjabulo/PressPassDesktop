// app/api/signup/route.js
import { NextResponse } from 'next/server';
const { getFirestoreDb, testFirestorePermissions } = require('../../../lib/firebase-admin');

function logApiCall(method, info) {
  console.log(`================ API DEBUG: /api/signup [${method}] ================`);
  console.log('Info:', JSON.stringify(info, null, 2));
  console.log('===============================================================');
}

// ✅ GET - Test Firebase configuration
export async function GET() {
  try {
    console.log('🧪 Testing Firebase Admin configuration...');
    
    const result = await testFirestorePermissions();
    
    if (result.success) {
      console.log('✅ Firebase Admin test successful');
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin is properly configured',
        result
      }, { status: 200 });
    } else {
      console.error('❌ Firebase Admin test failed:', result);
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin test failed',
        details: result
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Firebase Admin test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Firebase Admin configuration error',
      details: error.message
    }, { status: 500 });
  }
}

// ✅ POST - Create new user account
export async function POST(req) {
  try {
    const body = await req.json();
    const { uid, email, firstName, lastName, role, profilePicture, ...additionalData } = body;

    logApiCall('POST', { 
      uid, 
      email, 
      firstName, 
      lastName, 
      role,
      hasProfilePicture: !!profilePicture,
      additionalFields: Object.keys(additionalData)
    });

    // Validation
    if (!uid || !email || !firstName || !lastName || !role) {
      console.warn('⚠️ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: uid, email, firstName, lastName, role' 
      }, { status: 400 });
    }

    if (!['reader', 'publisher'].includes(role)) {
      console.warn('⚠️ Invalid role:', role);
      return NextResponse.json({ 
        success: false, 
        error: 'Role must be either "reader" or "publisher"' 
      }, { status: 400 });
    }

    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired for POST');

    // Determine collection and document structure based on role
    const collectionName = role === 'reader' ? 'readers' : 'publishers';
    const timestamp = new Date().toISOString();

    // Base user data
    const userData = {
      uid,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      profilePicture: profilePicture || null,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...additionalData
    };

    // Add role-specific fields
    if (role === 'reader') {
      userData.preferences = {
        categories: [],
        notifications: true
      };
      userData.readingHistory = [];
      userData.bookmarks = [];
      userData.following = [];
    } else if (role === 'publisher') {
      userData.publications = [];
      userData.subscribers = 0;
      userData.totalPublications = 0;
      userData.verified = false;
    }

    console.log(`📝 Creating ${role} document with ID:`, uid);
    console.log('📝 User data preview:', {
      uid: userData.uid,
      email: userData.email,
      firstName: userData.firstName,
      role: userData.role
    });

    // Save to Firestore
    const userDocRef = db.collection(collectionName).doc(uid);
    await userDocRef.set(userData);

    console.log(`✅ ${role} account created successfully in collection:`, collectionName);

    // Return user data (excluding sensitive information)
    const returnData = {
      uid: userData.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      profilePicture: userData.profilePicture,
      createdAt: userData.createdAt
    };

    return NextResponse.json({
      success: true,
      message: `${role} account created successfully`,
      user: returnData
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST /signup error:', error.message);
    console.error('❌ Full error:', error);
    
    // Check for specific Firestore errors
    if (error.code === 'permission-denied') {
      return NextResponse.json({
        success: false,
        error: 'Permission denied to create user document',
        details: error.message
      }, { status: 403 });
    }

    if (error.code === 'already-exists') {
      return NextResponse.json({
        success: false,
        error: 'User account already exists',
        details: error.message
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create user account',
      details: error.message
    }, { status: 500 });
  }
}