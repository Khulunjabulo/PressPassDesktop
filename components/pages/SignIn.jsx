'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const router = useRouter();

  const handleSignIn = (e) => {
    e.preventDefault();
    alert(`Form submitted (no authentication logic implemented yet)
Email: ${email}
Password: ${password}
Keep me signed in: ${keepSignedIn}`);
    // router.push('/'); // Uncomment when authentication is implemented
  };

  return (
    <div className="min-h-screen flex items-center justify-center black">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-black"
             
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-black"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="text-blue-800"
              />
              Keep me signed in
            </label>
            <button
              type="button"
              onClick={() => alert('Forgot password logic goes here')}
              className="text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
          >
            Sign In
          </button>
        </form>

        <button
          onClick={() => router.push('/signup')}
          className="mt-4 text-sm text-blue-700 hover:underline bg-transparent border-none cursor-pointer w-full text-center"
        >
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
}
