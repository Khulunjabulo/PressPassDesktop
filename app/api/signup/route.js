
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '../../../lib/emailService';

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
  console.log('/api/signup POST route called');

  try {
    const body = await request.json();
    console.log(' Request body:', body);

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

    console.log('Processing signup for:', email, 'Role:', role);

    // Validate required fields
    if (!uid || !email || !firstName || !role) {
      console.warn(' Missing required fields');
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
      console.warn(' Invalid role:', role);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid role. Must be either "reader" or "publisher"' 
        },
        { status: 400 }
      );
    }

    console.log(' Validation passed. Preparing user data...');

    // Generate role-specific UID
    const roleSpecificUid = `${role}_${uid}`;
    console.log(' Generated role-specific UID:', roleSpecificUid);

    // Prepare base user data
    const userData = {
      originalUid: uid, // Store original Firebase Auth UID for reference
      uid: roleSpecificUid,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName?.trim() || '',
      role,
      profilePicture: profilePicture || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    if (role === 'publisher') {
      console.log(' Processing publisher signup...');
      
      // Validate publisher required fields
      if (!companyName || !industry || !publicationType || !audienceType) {
        console.warn(' Missing publisher required fields');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Missing required publisher fields: companyName, industry, publicationType, audienceType' 
          },
          { status: 400 }
        );
      }

      // Add publisher-specific fields
      userData.companyName = companyName.trim();
      userData.industry = industry.trim();
      userData.companyWebsite = companyWebsite?.trim() || null;
      userData.jobTitle = jobTitle?.trim() || '';
      userData.phone = phone?.trim() || null;
      userData.publicationType = publicationType.trim();
      userData.audienceType = audienceType.trim();
      userData.monthlyReadership = monthlyReadership ? parseInt(monthlyReadership) : null;
      userData.isVerified = false;
      userData.subscriptionStatus = 'trial';
      userData.totalArticles = 0;
      userData.totalViews = 0;

      console.log(' Saving publisher data to Firestore...');
      console.log(' Final publisher userData:', JSON.stringify(userData, null, 2));

      // Save to publishers collection only
      const publisherDocRef = doc(db, 'publishers', roleSpecificUid);
      await setDoc(publisherDocRef, userData);

      console.log(' Publisher data saved successfully to Firestore');

    } else if (role === 'reader') {
      console.log(' Processing reader signup...');
      
      // Add reader-specific fields
      userData.preferences = {
        categories: [],
        notifications: true,
      };
      userData.readingHistory = [];
      userData.bookmarks = [];
      userData.following = [];

      console.log(' Saving reader data to Firestore...');
      console.log(' Final reader userData:', JSON.stringify(userData, null, 2));

      // Save to readers collection only
      const readerDocRef = doc(db, 'readers', roleSpecificUid);
      await setDoc(readerDocRef, userData);

      console.log(' Reader data saved successfully to Firestore');
    }

    console.log('🎉 Registration completed successfully');

    // Send welcome email
    try {
      console.log(' Sending welcome email...');
      await sendWelcomeEmail(userData.email, userData.firstName, userData.role);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.warn(' Failed to send welcome email:', emailError);
      // Don't fail the registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        uid: roleSpecificUid,
        originalUid: uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      }
    });

  } catch (error) {
    console.error(' Error in /api/signup:', error);
    
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