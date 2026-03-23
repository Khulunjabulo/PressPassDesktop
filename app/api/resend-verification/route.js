// app/api/resend-verification/route.js
//
// Handles ONE action only: update-email
// (delete old unverified account + create new one with corrected email)
//
// The RESEND action is no longer handled here — it is done entirely on the
// client via Firebase client SDK (signInWithEmailAndPassword → sendEmailVerification
// → signOut), exactly the same way the original signup sends the email.
// See UnverifiedEmailPanel in signin/page.jsx for that logic.

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestoreDb } from '../../../lib/firebase-admin';

export async function POST(request) {
  console.log('📧 /api/resend-verification POST route called');

  try {
    const body = await request.json();
    const { action, email, newEmail, password, role } = body;

    console.log('📥 Received:', { action, email, role });

    if (!action || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: action, email, role' },
        { status: 400 }
      );
    }

    // ─── ACTION: update-email ─────────────────────────────────────────────────
    // Deletes the old unverified Firebase Auth account + Firestore doc,
    // creates a fresh account with the corrected email, and returns success
    // so the client can then call sendEmailVerification() directly.
    if (action === 'update-email') {
      if (!newEmail || !password) {
        return NextResponse.json(
          { success: false, error: 'New email and password are required.' },
          { status: 400 }
        );
      }

      const adminAuth = getAuth();
      const db = getFirestoreDb();

      const normalizedOld = email.toLowerCase().trim();
      const normalizedNew = newEmail.toLowerCase().trim();

      if (normalizedOld === normalizedNew) {
        return NextResponse.json(
          { success: false, error: 'New email is the same as the current email.' },
          { status: 400 }
        );
      }

      console.log('🔄 Updating email from', normalizedOld, 'to', normalizedNew);

      // 1. Look up old Firebase Auth user
      let oldUserRecord;
      try {
        oldUserRecord = await adminAuth.getUserByEmail(normalizedOld);
      } catch (err) {
        return NextResponse.json(
          { success: false, error: 'Original account not found.' },
          { status: 404 }
        );
      }

      if (oldUserRecord.emailVerified) {
        return NextResponse.json(
          { success: false, error: 'This account is already verified. Please sign in normally.' },
          { status: 400 }
        );
      }

      // 2. Make sure new email is not already taken in Firebase Auth
      try {
        await adminAuth.getUserByEmail(normalizedNew);
        return NextResponse.json(
          { success: false, error: 'That email address is already registered.' },
          { status: 409 }
        );
      } catch (err) {
        if (err.code !== 'auth/user-not-found') throw err;
        // user-not-found is what we want — proceed
      }

      const oldUid = oldUserRecord.uid;
      const collectionName = role === 'reader' ? 'readers' : 'publishers';
      const oldRoleUid = `${role}_${oldUid}`;

      // 3. Fetch existing Firestore document
      const oldDocRef = db.collection(collectionName).doc(oldRoleUid);
      const oldDocSnap = await oldDocRef.get();

      if (!oldDocSnap.exists) {
        return NextResponse.json(
          { success: false, error: 'User data not found in database.' },
          { status: 404 }
        );
      }

      const existingData = oldDocSnap.data();

      // 4. Create new Firebase Auth account with corrected email + same password
      let newUserRecord;
      try {
        newUserRecord = await adminAuth.createUser({
          email: normalizedNew,
          password: password,
          displayName: existingData.firstName
            ? `${existingData.firstName} ${existingData.lastName || ''}`.trim()
            : existingData.contactName || '',
        });
        console.log('✅ New Firebase Auth user created:', newUserRecord.uid);
      } catch (err) {
        console.error('❌ Failed to create new Firebase Auth user:', err);
        return NextResponse.json(
          { success: false, error: 'Failed to create account with new email. Please try again.' },
          { status: 500 }
        );
      }

      const newUid = newUserRecord.uid;
      const newRoleUid = `${role}_${newUid}`;

      // 5. Write new Firestore document with updated email + uid
      const updatedData = {
        ...existingData,
        uid: newUid,
        email: normalizedNew,
        updatedAt: new Date().toISOString(),
      };

      await db.collection(collectionName).doc(newRoleUid).set(updatedData);
      console.log('✅ New Firestore document created:', newRoleUid);

      // 6. Delete old Firestore document
      await oldDocRef.delete();
      console.log('✅ Old Firestore document deleted:', oldRoleUid);

      // 7. Delete old Firebase Auth account
      await adminAuth.deleteUser(oldUid);
      console.log('✅ Old Firebase Auth account deleted:', oldUid);

      // Return the new email so the client can sign in and call sendEmailVerification()
      console.log('✅ Email update complete. Client will now send verification email to:', normalizedNew);

      return NextResponse.json({
        success: true,
        newEmail: normalizedNew,
        message: 'Account updated. Sending verification email now…',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ /api/resend-verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}