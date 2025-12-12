// app/api/user-profile/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../../lib/firebase-admin';

export async function GET(request) {
  console.log('📖 Getting user profile...');
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    console.log('🔍 Verifying ID token...');
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    console.log('✅ Token verified for user:', uid);

    // Get user data from Firestore
    const db = getFirestoreDb();
    const readerUid = `reader_${uid}`;
    
    console.log('📡 Fetching reader data from Firestore...');
    const readerDoc = await db.collection('readers').doc(readerUid).get();
    
    if (!readerDoc.exists) {
      console.error('❌ Reader profile not found');
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const userData = readerDoc.data();
    console.log('✅ User profile retrieved successfully');

    return NextResponse.json({
      success: true,
      ...userData
    });

  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get profile'
    }, { status: 500 });
  }
}

export async function PUT(request) {
  console.log('💾 Updating user profile...');
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    console.log('🔍 Verifying ID token...');
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    console.log('✅ Token verified for user:', uid);

    // Parse request body
    const updateData = await request.json();
    console.log('📥 Update data received:', Object.keys(updateData));

    // Get user data from Firestore
    const db = getFirestoreDb();
    const readerUid = `reader_${uid}`;
    
    console.log('📡 Updating reader data in Firestore...');
    
    // Prepare update data (exclude undefined/null values)
    const cleanUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Add update timestamp
    cleanUpdateData.updatedAt = new Date().toISOString();

    // Update the document
    await db.collection('readers').doc(readerUid).update(cleanUpdateData);
    console.log('✅ User profile updated successfully');

    // Fetch and return updated data
    const updatedDoc = await db.collection('readers').doc(readerUid).get();
    const updatedUserData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUserData
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update profile'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  console.log('🗑️ Deleting user profile...');
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    console.log('🔍 Verifying ID token...');
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    console.log('✅ Token verified for user:', uid);

    // Get Firestore database
    const db = getFirestoreDb();
    const readerUid = `reader_${uid}`;
    
    // Check if reader document exists
    console.log('📡 Checking if reader document exists...');
    const readerDoc = await db.collection('readers').doc(readerUid).get();
    
    if (!readerDoc.exists) {
      console.warn('⚠️ Reader document not found, but will continue with auth deletion');
    } else {
      // Delete Firestore document
      console.log('📡 Deleting reader data from Firestore...');
      await db.collection('readers').doc(readerUid).delete();
      console.log('✅ Firestore document deleted');
    }

    // Delete Firebase Auth user
    console.log('🔥 Deleting Firebase Auth user...');
    await auth.deleteUser(uid);
    console.log('✅ Firebase Auth user deleted');

    return NextResponse.json({
      success: true,
      message: 'Profile and account deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error deleting user profile:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to delete profile';
    let statusCode = 500;
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User account not found';
      statusCode = 404;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: statusCode });
  }
}