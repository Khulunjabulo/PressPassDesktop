// app/api/signup/route.js
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
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

export async function POST(request) {
  console.log('📝 /api/signup POST route called');

  try {
    const body = await request.json();
    console.log('📊 Request body:', body);

    const {
      uid,
      email,
      firstName,
      lastName,
      role,
      profilePicture,
      companyName,
      industry,
      companyWebsite,
      jobTitle,
      phone,
      publicationType,
      audienceType,
      monthlyReadership,
    } = body;

    console.log('🔍 Processing signup for:', email, 'Role:', role);

    // Validate required fields
    if (!uid || !email || !firstName || !role) {
      console.warn('❌ Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: uid, email, firstName, role' 
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

    console.log('✅ Validation passed. Preparing user data...');

    // Prepare base user data
    const userData = {
      uid,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName?.trim() || '',
      role,
      profilePicture: profilePicture || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    // Add publisher-specific fields if role is publisher
    if (role === 'publisher') {
      console.log('📋 Adding publisher-specific fields...');
      
      // Validate publisher required fields
      if (!companyName || !industry || !publicationType || !audienceType) {
        console.warn('❌ Missing publisher required fields');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Missing required publisher fields: companyName, industry, publicationType, audienceType' 
          },
          { status: 400 }
        );
      }

      userData.publisherData = {
        companyName: companyName.trim(),
        industry: industry.trim(),
        companyWebsite: companyWebsite?.trim() || null,
        jobTitle: jobTitle?.trim() || '',
        phone: phone?.trim() || null,
        publicationType: publicationType.trim(),
        audienceType: audienceType.trim(),
        monthlyReadership: monthlyReadership ? parseInt(monthlyReadership) : null,
        isVerified: false,
        subscriptionStatus: 'trial',
      };
    }

    console.log('💾 Saving user data to Firestore...');
    console.log('📄 Final userData:', JSON.stringify(userData, null, 2));

    // Save to Firestore
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, userData);

    console.log('✅ User data saved successfully to Firestore');

    // If publisher, also create a separate publisher profile document
    if (role === 'publisher') {
      console.log('📋 Creating publisher profile document...');
      
      const publisherProfileRef = doc(db, 'publishers', uid);
      const publisherProfile = {
        uid,
        email: userData.email,
        contactName: `${firstName} ${lastName}`.trim(),
        companyName: userData.publisherData.companyName,
        industry: userData.publisherData.industry,
        companyWebsite: userData.publisherData.companyWebsite,
        jobTitle: userData.publisherData.jobTitle,
        phone: userData.publisherData.phone,
        publicationType: userData.publisherData.publicationType,
        audienceType: userData.publisherData.audienceType,
        monthlyReadership: userData.publisherData.monthlyReadership,
        profilePicture: userData.profilePicture,
        isVerified: false,
        subscriptionStatus: 'trial',
        totalArticles: 0,
        totalViews: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(publisherProfileRef, publisherProfile);
      console.log('✅ Publisher profile created successfully');
    }

    // If reader, create reader profile
    if (role === 'reader') {
      console.log('👤 Creating reader profile document...');
      
      const readerProfileRef = doc(db, 'readers', uid);
      const readerProfile = {
        uid,
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
      console.log('✅ Reader profile created successfully');
    }

    console.log('🎉 Registration completed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/signup:', error);
    
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