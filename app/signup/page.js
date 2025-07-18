'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  signUpWithEmail,
  onUserChanged,
  setAuthPersistence,
} from '@/Firebase/auth';
import { auth, provider } from '@/Firebase/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function SignUp() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onUserChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user]);

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await setAuthPersistence(false);
      await signUpWithEmail(email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in or use another email.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);

    try {
      await setAuthPersistence(false);
      const result = await signInWithPopup(auth, provider);
    } catch (err) {
      setError('Failed to sign up with Google. Please try again.');
      console.error('Google sign-up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="w-full max-w-md bg-blue-600 text-white p-8 rounded-lg shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/Presspass.png" alt="Logo" width={80} height={80} className="h-20 w-20" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

        {error && <p className="text-red-200 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-white bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-white bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-700 font-bold py-2 rounded-md hover:bg-gray-100 transition"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-white text-blue-700 py-2 rounded-md hover:bg-gray-100 font-bold transition flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M533.5 278.4c0-17.4-1.6-34.2-4.7-50.5H272v95.4h146.9c-6.3 34.1-25 63-53.3 82.3v68.2h86.1c50.3-46.4 81.8-114.7 81.8-195.4z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c72.6 0 133.6-23.8 178.2-64.8l-86.1-68.2c-23.9 16-54.6 25.5-92.1 25.5-70.9 0-131-47.9-152.5-112.1H32.8v70.7c44.6 88 136.8 148.9 239.2 148.9z"
                fill="#34A853"
              />
              <path
                d="M119.5 324.7c-10.8-32-10.8-66.5 0-98.5V155.5H32.8c-44.5 88-44.5 192.8 0 280.7l86.7-67.8z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.7c39.5 0 75 13.6 103 40.2l77-77C405.6 24.6 344.6 0 272 0 169.6 0 77.4 60.9 32.8 148.9l86.7 67.8C141 155.6 201.1 107.7 272 107.7z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </button>

          <Link href="/signin" className="text-sm text-white underline text-center hover:text-gray-200">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
