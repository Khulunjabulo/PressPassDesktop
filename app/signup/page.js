'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import { getAuth, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { get, ref } from 'firebase/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, provider } from '@/firebase/firebase';

export default function SignUp() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reader');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    

    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        setUser({ ...firebaseUser, role: userData.role });
      } else {
        
        setUser({ ...firebaseUser, role: 'reader' });
      }
    } catch (err) {
      console.error('[onAuthStateChanged] Error loading user from Realtime DB:', err);
      setUser({ ...firebaseUser, role: null });
    }
  });

  return () => unsubscribe();
}, []);


  useEffect(() => {
    
    if (!user || !user.role) return;

    if (user.role === 'buyer') {
      console.log('[useEffect] Redirecting to /newsbuyer/home');
      router.push('/newsbuyer/home');
    } else if (user.role === 'reader') {
      console.log('[useEffect] Redirecting to /newsreader/home');
      router.push('/newsreader/home');
    }
  }, [user, router]);

 const handleEmailPasswordSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  console.log('[handleEmailPasswordSubmit] Submitting with:', { email, password, role });

  try {
    console.log('[handleEmailPasswordSubmit] Creating user with Firebase auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const uid = user.uid;

    console.log('[handleEmailPasswordSubmit] Firebase user created:', { uid, email: user.email });

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email: user.email, role }),
    });

    

    const data = await res.json();
    

    if (!res.ok) {
      throw new Error(data.error || 'Sign-up failed. Please try again.');
    }

    setEmail('');
    setPassword('');
    console.log('[handleEmailPasswordSubmit] Account creation successful.');
  } catch (err) {
    console.error('[handleEmailPasswordSubmit] Error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
    console.log('[handleEmailPasswordSubmit] Submission complete.');
    console.log('===============================');
  }
};



  const handleGoogleSignUp = async () => {
  setError('');
  setLoading(true);
  

  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    console.log('[handleGoogleSignUp] Firebase user:', firebaseUser);

    const userRef = ref(db, `users/${firebaseUser.uid}`);
    const snapshot = await get(userRef);

    console.log('[handleGoogleSignUp] Snapshot exists:', snapshot.exists());

    if (!snapshot.exists()) {
      console.log('[handleGoogleSignUp] User does not exist in Realtime DB. Creating via API...');

      const response = await fetch(`/api/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          password: null, 
          role: role || 'reader',
          uid: firebaseUser.uid,
        }),
      });

      console.log('[handleGoogleSignUp] API response status:', response.status);

      const data = await response.json();
      console.log('[handleGoogleSignUp] API response JSON:', data);

      if (!response.ok) {
        console.error('[handleGoogleSignUp] API responded with error:', data.error);
        throw new Error(data.error || 'Failed to create user profile');
      }

      console.log('[handleGoogleSignUp] User profile successfully created in Realtime Database.');
    } else {
      console.log('[handleGoogleSignUp] User already exists in Realtime Database.');
    }
  } catch (err) {
    console.error('[handleGoogleSignUp] Error caught:', err);
    console.error('[handleGoogleSignUp] Error code:', err.code);
    console.error('[handleGoogleSignUp] Error message:', err.message);
    setError(err.message || 'Google sign-up failed. Please try again.');
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-blue-600 text-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <Image src="/Presspass.png" alt="Logo" width={80} height={80} />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

        {error && <p className="text-red-200 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => {
      console.log('[Input] Email changed:', e.target.value);
      setEmail(e.target.value);
    }}
    required
    className="w-full px-4 py-2 border border-white bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder-white"
  />

  <input
    type="password"
    placeholder="Password (min 6 characters)"
    value={password}
    onChange={(e) => {
      console.log('[Input] Password changed:', e.target.value);
      setPassword(e.target.value);
    }}
    required
    minLength={6}
    className="w-full px-4 py-2 border border-white bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder-white"
  />

  <div className="flex items-center justify-between text-sm text-white">
    <label className="mr-2">Sign up as:</label>
    <select
      required
      value={role}
      onChange={(e) => {
        console.log('[Select] Role changed to:', e.target.value);
        setRole(e.target.value);
      }}
      className="bg-blue-500 border border-white px-2 py-1 rounded text-white"
    >
      <option value="" disabled>
        Select role
      </option>
      <option value="reader">News Reader</option>
      <option value="buyer">Media Buyer</option>
    </select>
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full bg-white text-blue-700 font-bold py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
  >
    {loading ? 'Creating account...' : 'Sign Up'}
  </button>
</form>


        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-white text-blue-700 py-2 rounded-md hover:bg-gray-100 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 278.4c0-17.4-1.6-34.2-4.7-50.5H272v95.4h146.9c-6.3 34.1-25 63-53.3 82.3v68.2h86.1c50.3-46.4 81.8-114.7 81.8-195.4z" fill="#4285F4" />
              <path d="M272 544.3c72.6 0 133.6-23.8 178.2-64.8l-86.1-68.2c-23.9 16-54.6 25.5-92.1 25.5-70.9 0-131-47.9-152.5-112.1H32.8v70.7c44.6 88 136.8 148.9 239.2 148.9z" fill="#34A853" />
              <path d="M119.5 324.7c-10.8-32-10.8-66.5 0-98.5V155.5H32.8c-44.5 88-44.5 192.8 0 280.7l86.7-67.8z" fill="#FBBC05" />
              <path d="M272 107.7c39.5 0 75 13.6 103 40.2l77-77C405.6 24.6 344.6 0 272 0 169.6 0 77.4 60.9 32.8 148.9l86.7 67.8C141 155.6 201.1 107.7 272 107.7z" fill="#EA4335" />
            </svg>
            {loading ? 'Signing up...' : 'Sign up with Google'}
          </button>

          <Link href="/signin" className="text-sm text-white underline text-center hover:text-gray-200">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
