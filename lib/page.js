'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, KeyRound } from 'lucide-react';
import { handleMfaVerification } from '../../lib/authLogic';
import '../globals.css';

function MfaVerifyComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) {
      // Mask the phone number for display
      const lastFour = phone.slice(-4);
      const masked = `+***********${lastFour}`;
      setPhoneNumber(masked);
    } else {
      // If no phone number, redirect back to sign-in as we can't proceed
      router.push('/signin');
    }

    // Check if the resolver exists, if not, the user landed here directly.
    if (typeof window !== 'undefined' && !window.mfaResolver) {
      setError('Verification session not found. Please sign in again.');
      setTimeout(() => router.push('/signin'), 3000);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    await handleMfaVerification(code, router, setError, setLoading);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
          <Smartphone className="h-8 w-8 text-[#329ae1]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Two-Factor Authentication
        </h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification code to your phone number ending in{' '}
          <strong className="font-semibold text-gray-800">{phoneNumber}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-Digit Code"
              maxLength="6"
              required
              className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-center tracking-widest text-lg"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6">
          Didn't receive a code? Please wait a few moments. In a real app, you would have a "Resend Code" button here.
        </p>
      </div>
    </div>
  );
}

export default function MfaVerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MfaVerifyComponent />
    </Suspense>
  );
}
