'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmail,
  signInWithGoogle,
  setAuthPersistence,
} from '../firebase/auth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [role, setRole] = useState('reader');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await setAuthPersistence(keepSignedIn);
      await signInWithEmail(email, password);
      alert(`Signed in as ${role}`);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await setAuthPersistence(keepSignedIn);
      await signInWithGoogle();
      alert(`Signed in as ${role}`);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-full max-w-md bg-blue-600 text-white p-8 rounded-lg shadow-lg">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/Presspass.png" alt="Logo" className="h-20 w-20" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        {error && <p className="text-red-200 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSignIn} className="space-y-4">
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

          {/* Role Selection */}
          <div className="flex items-center justify-between text-sm text-white">
            <label className="mr-2">Sign in as:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-blue-500 border border-white px-2 py-1 rounded text-white"
            >
              <option value="reader">News Reader</option>
              <option value="buyer">Media Buyer</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              Keep me signed in
            </label>
            <button
              type="button"
              onClick={() => alert('Forgot password logic goes here')}
              className="text-white underline hover:text-gray-200"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-700 font-bold py-2 rounded-md hover:bg-gray-100 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-blue-700 py-2 rounded-md hover:bg-gray-100 font-bold transition flex items-center justify-center gap-2"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            Sign in with Google
          </button>

          <button
            onClick={() => router.push('/PressPass/signUp')}
            className="text-sm text-white underline text-center hover:text-gray-200"
          >
            Don’t have an account? Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
