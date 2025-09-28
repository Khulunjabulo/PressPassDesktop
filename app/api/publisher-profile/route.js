// app/api/publisher-profile/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../lib/firebase-admin';

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
      console.warn('⚠️ Publisher profile not found, creating default profile...');
      
      // Create default publisher profile with ALL required fields included
      const defaultProfile = {
        uid: uid,
        email: decodedToken.email || '',
        companyName: '',
        industry: '',
        companyWebsite: '',
        contactName: '',
        jobTitle: '',
        phone: '',
        publicationType: '',
        audienceType: '',
        monthlyReadership: '',
        companyDescription: '',
        address: '',
        city: '',
        foundedYear: '',
        employeeCount: '',
        profilePicture: '',
        companyLogo: '',
        staff: [],
        // Personal Information - Required Fields
        dateOfBirth: '',
        idNumber: '',
        // Legal Requirements - Required Fields
        businessRegistrationNumber: '',
        vatNumber: '',
        publishingLicense: '',
        proofOfAddress: '',
        bankingDetails: '',
        // System fields
        articlesCount: 0,
        isActive: true,
        isVerified: false,
        isApproved: false,
        approvalStatus: 'pending',
        profileComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await db.collection('publishers').doc(publisherUid).set(defaultProfile);
      console.log('✅ Default publisher profile created with all required fields');
      
      return NextResponse.json({
        success: true,
        ...defaultProfile
      });
    }

    const userData = publisherDoc.data();
    
    // Ensure all required fields exist in the response (for backward compatibility)
    const completeUserData = {
      ...userData,
      // Personal Information - Required Fields (add if missing)
      dateOfBirth: userData.dateOfBirth || '',
      idNumber: userData.idNumber || '',
      // Legal Requirements - Required Fields (add if missing)
      businessRegistrationNumber: userData.businessRegistrationNumber || '',
      vatNumber: userData.vatNumber || '',
      publishingLicense: userData.publishingLicense || '',
      proofOfAddress: userData.proofOfAddress || '',
      bankingDetails: userData.bankingDetails || '',
      // Optional fields (add if missing)
      city: userData.city || '',
      companyDescription: userData.companyDescription || '',
      address: userData.address || '',
      foundedYear: userData.foundedYear || '',
      employeeCount: userData.employeeCount || '',
      staff: userData.staff || [],
      // System fields
      isApproved: userData.isApproved || false,
      approvalStatus: userData.approvalStatus || 'pending',
      profileComplete: userData.profileComplete || false
    };

    console.log('✅ Publisher profile retrieved successfully');
    console.log('📊 Required fields status:', {
      dateOfBirth: completeUserData.dateOfBirth ? '✅' : '❌',
      idNumber: completeUserData.idNumber ? '✅' : '❌',
      businessRegistrationNumber: completeUserData.businessRegistrationNumber ? '✅' : '❌',
      publishingLicense: completeUserData.publishingLicense ? '✅' : '❌',
      proofOfAddress: completeUserData.proofOfAddress ? '✅' : '❌'
    });

    return NextResponse.json({
      success: true,
      ...completeUserData
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
    
    // Prepare update data (exclude undefined/null values, but allow empty strings)
    const cleanUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        cleanUpdateData[key] = updateData[key];
      }
    });

    // Add update timestamp
    cleanUpdateData.updatedAt = new Date().toISOString();

    // Log what we're updating
    console.log('📝 Clean update data:', cleanUpdateData);

    // Update the document
    await db.collection('publishers').doc(publisherUid).update(cleanUpdateData);
    console.log('✅ Publisher profile updated successfully');

    // Fetch and return updated data
    const updatedDoc = await db.collection('publishers').doc(publisherUid).get();
    const updatedUserData = updatedDoc.data();

    // Log the updated required fields
    console.log('📊 Updated required fields status:', {
      dateOfBirth: updatedUserData.dateOfBirth ? '✅' : '❌',
      idNumber: updatedUserData.idNumber ? '✅' : '❌',
      businessRegistrationNumber: updatedUserData.businessRegistrationNumber ? '✅' : '❌',
      publishingLicense: updatedUserData.publishingLicense ? '✅' : '❌',
      proofOfAddress: updatedUserData.proofOfAddress ? '✅' : '❌'
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUserData
    });

  } catch (error) {
    console.error('❌ Error updating publisher profile:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update profile'
    }, { status: 500 });
  }
}