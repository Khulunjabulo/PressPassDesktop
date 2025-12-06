'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

export default function AdPaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Processing your ad...');

  useEffect(() => {
    handleAdCreation();
  }, []);

  const handleAdCreation = async () => {
    try {
      const paymentId = searchParams.get('id');
      const paymentStatus = searchParams.get('payment');

      if (paymentStatus !== 'success' || !paymentId) {
        throw new Error('Payment verification failed');
      }

      // Get pending ad data from sessionStorage
      const pendingAdDataStr = sessionStorage.getItem('pendingAdData');
      if (!pendingAdDataStr) {
        throw new Error('Ad data not found');
      }

      const pendingAdData = JSON.parse(pendingAdDataStr);

      // Verify payment with server
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentId }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success || !verifyData.verified) {
        throw new Error('Payment verification failed');
      }

      // Create the ad with payment info
      const adData = {
        ...pendingAdData,
        status: 'active',
        approved: true,
        paymentIntentId: paymentId,
        amount: verifyData.amount,
        currency: verifyData.currency,
        createdAt: new Date().toISOString(),
      };

      const adResponse = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });

      const adResult = await adResponse.json();

      if (adResult.success) {
        // Clear pending data
        sessionStorage.removeItem('pendingAdData');
        
        setStatus('success');
        setMessage('Your ad has been created successfully!');

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        throw new Error(adResult.error || 'Failed to create ad');
      }

    } catch (error) {
      console.error('Ad creation error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to create ad');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting you back...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}