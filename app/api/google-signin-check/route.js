// app/api/google-signin-check/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../../lib/firebase-admin';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  console.log('🔍 Starting Google sign-in check...');
  
  try {
    const { credential } = await request.json();
    console.log('📥 Received credential check request');

    if (!credential) {
      console.error('❌ No Google credential provided');
      return NextResponse.json({ success: false, error: 'No credential provided' }, { status: 400 });
    }

    // Decode Google JWT token
    console.log('🔍 Decoding Google JWT token...');
    const decodedToken = jwt.decode(credential);
    
    if (!decodedToken) {
      console.error('❌ Failed to decode Google token');
      return NextResponse.json({ success: false, error: 'Invalid Google token' }, { status: 400 });
    }

    const { email } = decodedToken;
    console.log('✅ Checking roles for email:', email);

    // Initialize Firebase
    const db = getFirestoreDb();
    const auth = getAuth();

    // Get Firebase user by email
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
      console.log('✅ Firebase user found:', firebaseUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ No account found with this email');
        return NextResponse.json({ 
          success: false, 
          error: 'No account found with this email. Please sign up first.' 
        }, { status: 404 });
      }
      throw error;
    }

    // Check both reader and publisher collections
    const readerUid = `reader_${firebaseUser.uid}`;
    const publisherUid = `publisher_${firebaseUser.uid}`;

    const [readerDoc, publisherDoc] = await Promise.all([
      db.collection('readers').doc(readerUid).get(),
      db.collection('publishers').doc(publisherUid).get()
    ]);

    const availableRoles = [];
    
    if (readerDoc.exists && readerDoc.data().isActive) {
      availableRoles.push('reader');
      console.log('✅ Found active reader account');
    }
    
    if (publisherDoc.exists && publisherDoc.data().isActive) {
      availableRoles.push('publisher');
      console.log('✅ Found active publisher account');
    }

    if (availableRoles.length === 0) {
      console.log('❌ No active accounts found');
      return NextResponse.json({ 
        success: false, 
        error: 'No active account found. Please sign up first.' 
      }, { status: 404 });
    }

    console.log('✅ Available roles:', availableRoles);
    
    return NextResponse.json({
      success: true,
      roles: availableRoles,
      email: email
    });

  } catch (error) {
    console.error('❌ Google sign-in check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check account',
      code: error.code || 'unknown'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Only POST is supported.' },
    { status: 405 }
  );
}