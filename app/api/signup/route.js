// app/api/signup/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';

export async function POST(request) {
  console.log('📝 Processing email signup...');
  
  try {
    const { 
      uid, 
      email, 
      firstName, 
      lastName, 
      role, 
      profilePicture,
      signUpMethod,
      // Publisher specific fields
      companyName,
      industry,
      companyWebsite,
      jobTitle,
      phone,
      publicationType,
      audienceType,
      monthlyReadership,
      contactName
    } = await request.json();

    console.log('📥 Received signup data:', { 
      uid, 
      email, 
      role, 
      signUpMethod,
      hasProfilePicture: !!profilePicture 
    });

    if (!uid || !email || !role) {
      console.error('❌ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: uid, email, role' 
      }, { status: 400 });
    }

    // Initialize Firebase
    console.log('🔥 Initializing Firestore...');
    const db = getFirestoreDb();

    const roleSpecificUid = `${role}_${uid}`;
    const collectionName = role === 'reader' ? 'readers' : 'publishers';

    // Check if user already exists in role-specific collection
    console.log('🔍 Checking if user already exists...');
    const existingDoc = await db.collection(collectionName).doc(roleSpecificUid).get();
    
    if (existingDoc.exists) {
      console.log('⚠️ User already exists in role-specific collection');
      return NextResponse.json({ 
        success: false, 
        error: `You already have a ${role} account.` 
      }, { status: 409 });
    }

    // Prepare user data based on role
    let userData = {
      uid,
      email,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signUpMethod: signUpMethod || 'email'
    };

    if (role === 'reader') {
      userData = {
        ...userData,
        firstName: firstName || '',
        lastName: lastName || '',
        profilePicture: profilePicture || null,
        preferences: {
          categories: [],
          notifications: true,
          emailUpdates: true
        },
        articlesRead: 0,
        // Additional reader fields
        phone: '',
        bio: '',
        location: '',
        dateOfBirth: ''
      };
      console.log('👤 Prepared reader data');
    } else if (role === 'publisher') {
  userData = {
    ...userData,
    companyName: companyName || '',
    industry: industry || '',
    companyWebsite: companyWebsite || '',
    contactName: contactName || `${firstName} ${lastName}`.trim(),
    jobTitle: jobTitle || '',
    phone: phone || '',
    publicationType: publicationType || '',
    audienceType: audienceType || '',
    monthlyReadership: parseInt(monthlyReadership) || 0,
    firstName: firstName || '',
    lastName: lastName || '',
    profilePicture: profilePicture || null,
    companyLogo: null,
    staff: [],
    articlesCount: 0,
    lastPosted: null,
    isVerified: false,
    // ADD THESE NEW FIELDS:
    isApproved: false,
    approvalStatus: 'pending', // 'pending', 'approved', 'rejected'
    profileComplete: false,
    approvedBy: null,
    approvedAt: null,
    rejectedReason: null,
    // Required fields tracking
    requiredFields: [
      'companyName', 'contactName', 'jobTitle', 'dateOfBirth', 
      'idNumber', 'businessRegistrationNumber', 'publishingLicense', 
      'proofOfAddress', 'publicationType', 'audienceType'
    ],
    // Additional publisher fields
    companyDescription: '',
    address: '',
    city: '',
    foundedYear: '',
    employeeCount: '',
    dateOfBirth: '',
    idNumber: '',
    businessRegistrationNumber: '',
    vatNumber: '',
    publishingLicense: null,
    proofOfAddress: null,
    bankingDetails: ''
  };
  console.log('🏢 Prepared publisher data with approval fields');
}

    // Save to Firestore
    console.log('💾 Saving user data to Firestore...');
    await db.collection(collectionName).doc(roleSpecificUid).set(userData);
    console.log('✅ User data saved successfully');

    console.log('🎉 Email signup process completed successfully');
    
    return NextResponse.json({
      success: true,
      user: userData,
      message: `${role} account created successfully`
    });

  } catch (error) {
    console.error('❌ Email signup error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Email signup failed',
      code: error.code || 'unknown'
    }, { status: 500 });
  }
}