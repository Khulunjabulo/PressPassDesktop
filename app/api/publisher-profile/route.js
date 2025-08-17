// app/api/publisher-profile/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../../lib/firebase-admin';

export async function GET(request) {
  console.log('🏢 Getting publisher profile...');
  
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

    // Get publisher data from Firestore
    const db = getFirestoreDb();
    const publisherUid = `publisher_${uid}`;
    
    console.log('📡 Fetching publisher data from Firestore...');
    const publisherDoc = await db.collection('publishers').doc(publisherUid).get();
    
    if (!publisherDoc.exists) {
      console.error('❌ Publisher profile not found');
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const userData = publisherDoc.data();
    console.log('✅ Publisher profile retrieved successfully');

    return NextResponse.json({
      success: true,
      ...userData
    });

  } catch (error) {
    console.error('❌ Error getting publisher profile:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get profile'
    }, { status: 500 });
  }
}

export async function PUT(request) {
  console.log('💾 Updating publisher profile...');
  
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

    // Get publisher data from Firestore
    const db = getFirestoreDb();
    const publisherUid = `publisher_${uid}`;
    
    console.log('📡 Updating publisher data in Firestore...');
    
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
    await db.collection('publishers').doc(publisherUid).update(cleanUpdateData);
    console.log('✅ Publisher profile updated successfully');

    // Fetch and return updated data
    const updatedDoc = await db.collection('publishers').doc(publisherUid).get();
    const updatedPublisherData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedPublisherData
    });

  } catch (error) {
    console.error('❌ Error updating publisher profile:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update profile'
    }, { status: 500 });
  }
}