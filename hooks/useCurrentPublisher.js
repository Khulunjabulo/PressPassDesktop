'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/Firebase/firebase'; // your Firebase client SDK

export const useCurrentPublisher = () => {
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublisher = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');

      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/publisher-profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch publisher profile');

      const data = await res.json();
      if (data.success) {
        // ADDED: Ensure the publisher has an 'id' field for wallet functionality
        const publisherWithId = {
          ...data,
          id: data.uid || data.id || data.publisherId, // Use uid as id if id doesn't exist
        };
        
        console.log('Publisher loaded with ID:', publisherWithId.id); // Debug log
        setPublisher(publisherWithId);
      } else {
        throw new Error(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching publisher:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublisher();
  }, [fetchPublisher]);

  return { publisher, loading, error, refetch: fetchPublisher };
};
