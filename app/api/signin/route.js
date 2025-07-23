import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { auth, db } from '@/firebase/firebase'; // client-side
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const uid = firebaseUser.uid;
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'User data not found in database. Please sign up first.' }, { status: 404 });
    }

    const userData = snapshot.val();

    if (userData.role !== role) {
      return NextResponse.json(
        {
          error: `You registered as a ${userData.role}. Please sign in as that role or sign up as a ${role}.`,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: 'Sign in successful',
      uid,
      role: userData.role,
      email: userData.email,
    });
  } catch (err) {
    console.error('[API /signin] Error:', err.message);
    return NextResponse.json(
      { error: 'Invalid credentials or sign-in failed.' },
      { status: 401 }
    );
  }
}
