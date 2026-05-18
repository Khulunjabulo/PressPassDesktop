'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/Firebase/firebase';

export const useCurrentPublisher = () => {
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchPublisher = useCallback(async (user) => {
    // Accept the user object directly so we never rely on auth.currentUser
    // being set at the exact moment this function runs.
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const idToken = await user.getIdToken();

      const res = await fetch('/api/publisher-profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch publisher profile');
      }

      const data = await res.json();

      if (data.success) {
        const publisherWithId = {
          ...data,
          id: data.uid || data.id || data.publisherId,
        };

        console.log('✅ Publisher loaded with ID:', publisherWithId.id);
        setPublisher(publisherWithId);

        if (publisherWithId.id) {
          localStorage.setItem('currentPublisherId', publisherWithId.id);
          console.log('💾 Publisher ID stored in localStorage:', publisherWithId.id);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('❌ Error fetching publisher:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // onAuthStateChanged fires once Firebase has fully restored the session.
    // This guarantees auth.currentUser is ready before we try to use it.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchPublisher(user);
      } else {
        // User is genuinely signed out — clear state
        setPublisher(null);
        setError('Not authenticated');
        setLoading(false);
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [fetchPublisher]);

  // Manual refetch — reads current user from auth at call time
  // (safe to call after onAuthStateChanged has already fired)
  const refetch = useCallback(() => {
    const user = auth.currentUser;
    if (user) {
      fetchPublisher(user);
    } else {
      setError('Not authenticated');
      setLoading(false);
    }
  }, [fetchPublisher]);

  return { publisher, loading, error, refetch };
};