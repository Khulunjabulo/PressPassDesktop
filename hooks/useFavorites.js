'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../Firebase/firebase';

const auth = getAuth(app);

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Log helper
  const log = (...args) => console.log('🎯 [useFavorites]', ...args);

  // ✅ Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      log('🔐 Auth state changed:', user ? 'authenticated' : 'not authenticated');
      
      if (user) {
        // First try to get user data from localStorage (which has role info)
        const storedUser = localStorage.getItem('currentUser');
        let userData;
        
        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
            log('✅ Using stored user data:', userData);
          } catch (e) {
            log('⚠️ Failed to parse stored user, using Firebase Auth data');
            userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            };
          }
        } else {
          // Fallback to Firebase Auth user data
          userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          };
          log('✅ Using Firebase Auth data:', userData);
        }
        
        // Ensure we have the required uid
        if (!userData.uid && user.uid) {
          userData.uid = user.uid;
        }
        
        setCurrentUser(userData);
        setError(null);
        
        // Fetch favorites with the confirmed user ID
        if (userData.uid) {
          log('📡 Starting fetchFavorites for user:', userData.uid);
          fetchFavorites(userData.uid);
        } else {
          log('⚠️ No UID found in user data');
          setLoading(false);
        }
      } else {
        log('🔒 User not authenticated, clearing favorites');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setFavorites([]);
        setError(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch favorites from API
  const fetchFavorites = useCallback(async (userId) => {
    if (!userId) {
      log('⚠️ fetchFavorites called with empty userId');
      setLoading(false);
      return;
    }

    log('📡 fetchFavorites starting for userId:', userId, 'type:', typeof userId);
    setLoading(true);
    setError(null);

    try {
      const url = `/api/favorites?userId=${encodeURIComponent(userId)}`;
      log('📡 Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      log('📡 [GET] /api/favorites response status:', response.status);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const text = await response.text();
        log('❌ Failed to parse JSON, response text:', text.slice(0, 500));
        throw new Error('Invalid JSON response from server');
      }

      log('📡 [GET] /api/favorites response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }

      setFavorites(data.favorites || []);
      setError(null);
      log('✅ Favorites loaded successfully:', data.favorites?.length || 0, 'items');
    } catch (error) {
      log('❌ Error fetching favorites:', error.message);
      setError(error.message);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Add item to favorites
  const addToFavorites = useCallback(async (item) => {
    if (!currentUser?.uid) {
      const errMsg = 'User not authenticated';
      log('❌', errMsg, 'currentUser:', currentUser);
      return { success: false, error: errMsg };
    }

    try {
      log('➕ Adding to favorites:', item.title || item.url || item.id);
      log('➕ Using userId:', currentUser.uid, 'type:', typeof currentUser.uid);

      const payload = {
        userId: currentUser.uid,
        item: {
          ...item,
          id: item.id || item.url || `${item.type || 'item'}_${Date.now()}`,
        },
      };

      log('➕ POST payload:', payload);

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      log('📡 [POST] /api/favorites status:', response.status);

      const data = await response.json();
      log('📡 [POST] /api/favorites response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }

      setFavorites((prev) => [...prev, data.item]);
      return { success: true, message: 'Added to favorites' };

    } catch (error) {
      log('❌ Error adding to favorites:', error.message);
      return { success: false, error: error.message };
    }
  }, [currentUser]);

  // ✅ Remove item from favorites
  const removeFromFavorites = useCallback(async (itemId) => {
    if (!currentUser?.uid) {
      const errMsg = 'User not authenticated';
      log('❌', errMsg);
      return { success: false, error: errMsg };
    }

    try {
      log('🗑 Removing favorite item:', itemId);
      log('🗑 Using userId:', currentUser.uid, 'type:', typeof currentUser.uid);

      const payload = {
        userId: currentUser.uid,
        itemId,
      };

      log('🗑 DELETE payload:', payload);

      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      log('📡 [DELETE] /api/favorites status:', response.status);

      const data = await response.json();
      log('📡 [DELETE] /api/favorites response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }

      setFavorites((prev) => prev.filter((item) => item.id !== itemId));
      return { success: true, message: 'Removed from favorites' };

    } catch (error) {
      log('❌ Error removing from favorites:', error.message);
      return { success: false, error: error.message };
    }
  }, [currentUser]);

  // ✅ Toggle favorite
  const toggleFavorite = useCallback(async (item) => {
    const itemId = item.id || item.url || `${item.type || 'item'}_${item.title || Date.now()}`;
    const exists = favorites.some((f) => f.id === itemId || f.url === item.url);

    log('🔄 Toggling favorite:', itemId, exists ? '(removing)' : '(adding)');

    if (exists) {
      return await removeFromFavorites(itemId);
    } else {
      return await addToFavorites({ ...item, id: itemId });
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  // ✅ Check if item is in favorites
  const isFavorite = useCallback((itemId) => {
    const exists = favorites.some((item) => item.id === itemId || item.url === itemId);
    log('🔍 isFavorite check for', itemId, ':', exists);
    return exists;
  }, [favorites]);

  // ✅ Debug function to check current state
  const debugState = useCallback(() => {
    log('=== DEBUG STATE ===');
    log('currentUser:', currentUser);
    log('currentUser.uid:', currentUser?.uid);
    log('favorites length:', favorites.length);
    log('loading:', loading);
    log('error:', error);
    log('================');
  }, [currentUser, favorites, loading, error]);

  return {
    favorites,
    loading,
    currentUser,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    refetchFavorites: () => currentUser?.uid && fetchFavorites(currentUser.uid),
    debugState, // Add this for debugging
  };
};