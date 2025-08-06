
import { NextResponse } from 'next/server';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { sendForgotPasswordEmail } from '../../../lib/emailService';

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
  console.log('/api/forgot-password POST route called');

  try {
    const body = await request.json();
    const { email } = body;

    console.log('Request body:', { email });

    // Validate required fields
    if (!email) {
      console.warn('Missing email field');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is required' 
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('🔍 Processing forgot password for:', normalizedEmail);

    // Check if user exists in either readers or publishers collection
    let userExists = false;
    let userRole = null;
    let userName = '';

    // Check readers collection
    const readersQuery = query(
      collection(db, 'readers'), 
      where('email', '==', normalizedEmail)
    );
    const readersSnapshot = await getDocs(readersQuery);
    
    if (!readersSnapshot.empty) {
      userExists = true;
      userRole = 'reader';
      const userData = readersSnapshot.docs[0].data();
      userName = userData.firstName || 'User';
      console.log('User found in readers collection');
    }

    // Check publishers collection if not found in readers
    if (!userExists) {
      const publishersQuery = query(
        collection(db, 'publishers'), 
        where('email', '==', normalizedEmail)
      );
      const publishersSnapshot = await getDocs(publishersQuery);
      
      if (!publishersSnapshot.empty) {
        userExists = true;
        userRole = 'publisher';
        const userData = publishersSnapshot.docs[0].data();
        userName = userData.firstName || userData.contactName || 'User';
        console.log(' User found in publishers collection');
      }
    }

    if (!userExists) {
      console.warn(' No user found with email:', normalizedEmail);
      // For security reasons, we still return success even if user doesn't exist
      // This prevents email enumeration attacks
      return NextResponse.json({ 
        success: true, 
        message: 'If an account with this email exists, you will receive password reset instructions.' 
      });
    }

    console.log('🔑 Sending custom password reset email...');
    
    try {
      // Generate password reset link (in a real implementation, you would use Firebase's link generation)
      // For now, we'll create a placeholder link
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=PLACEHOLDER_TOKEN`;
      
      // Send custom password reset email
      const emailResult = await sendForgotPasswordEmail(normalizedEmail, resetLink);
      console.log('Custom password reset email sent successfully:', emailResult);

      return NextResponse.json({
        success: true,
        message: 'Password reset instructions have been sent to your email address.'
      });

    } catch (emailError) {
      console.error(' Error sending password reset email:', emailError);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in /api/forgot-password:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.' 
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