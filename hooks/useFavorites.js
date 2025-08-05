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
      if (user) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        log('🔐 User authenticated:', userData.uid);

        setCurrentUser(userData);
        if (userData.uid) {
          fetchFavorites(userData.uid);
        }
      } else {
        log('🔒 User not authenticated, clearing favorites');
        setCurrentUser(null);
        setFavorites([]);
        setError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch favorites from API
  const fetchFavorites = useCallback(async (userId) => {
    if (!userId) {
      log('⚠️ fetchFavorites called with empty userId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      log('📡 Fetching favorites for user:', userId);

      const response = await fetch(`/api/favorites?userId=${userId}`, {
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

      log('✅ Favorites fetch response:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }

      setFavorites(data.favorites || []);
      setError(null);
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
      log('❌', errMsg);
      return { success: false, error: errMsg };
    }

    try {
      log('➕ Adding to favorites:', item.title || item.id);

      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          item: {
            ...item,
            id: item.id || `${item.type || 'item'}_${Date.now()}`,
          },
        }),
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

      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          itemId,
        }),
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
    const itemId = item.id || `${item.type || 'item'}_${item.title || Date.now()}`;
    const exists = favorites.some((f) => f.id === itemId);

    log('🔄 Toggling favorite:', itemId, exists ? '(removing)' : '(adding)');

    if (exists) {
      return await removeFromFavorites(itemId);
    } else {
      return await addToFavorites({ ...item, id: itemId });
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  // ✅ Check if item is in favorites
  const isFavorite = useCallback((itemId) => {
    const exists = favorites.some((item) => item.id === itemId);
    log('🔍 isFavorite check for', itemId, ':', exists);
    return exists;
  }, [favorites]);

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
  };
};
