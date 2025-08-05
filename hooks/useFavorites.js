// hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../Firebase/firebase';

const auth = getAuth(app);

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentUser(userData);
        if (userData.uid) {
          fetchFavorites(userData.uid);
        }
      } else {
        setCurrentUser(null);
        setFavorites([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch favorites from API
  const fetchFavorites = useCallback(async (userId) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/favorites?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setFavorites(data.favorites);
      } else {
        console.error('Failed to fetch favorites:', data.error);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to favorites
  const addToFavorites = useCallback(async (item) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          item: {
            ...item,
            id: item.id || `${item.type}_${Date.now()}`,
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFavorites(prev => [...prev, data.item]);
        return { success: true, message: 'Added to favorites' };
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { success: false, error: error.message };
    }
  }, [currentUser]);

  // Remove item from favorites
  const removeFromFavorites = useCallback(async (itemId) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          itemId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFavorites(prev => prev.filter(item => item.id !== itemId));
        return { success: true, message: 'Removed from favorites' };
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { success: false, error: error.message };
    }
  }, [currentUser]);

  // Check if item is in favorites
  const isFavorite = useCallback((itemId) => {
    return favorites.some(item => item.id === itemId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (item) => {
    const itemId = item.id || `${item.type}_${item.title}`;
    
    if (isFavorite(itemId)) {
      return await removeFromFavorites(itemId);
    } else {
      return await addToFavorites({
        ...item,
        id: itemId
      });
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  // Get favorites by type
  const getFavoritesByType = useCallback((type) => {
    return favorites.filter(item => item.type === type);
  }, [favorites]);

  // Get favorites stats
  const getFavoritesStats = useCallback(() => {
    return {
      all: favorites.length,
      stories: favorites.filter(item => item.type === 'story').length,
      magazines: favorites.filter(item => item.type === 'magazine').length,
      newspapers: favorites.filter(item => item.type === 'newspaper').length,
    };
  }, [favorites]);

  return {
    favorites,
    loading,
    currentUser,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
    getFavoritesStats,
    refetchFavorites: () => currentUser?.uid && fetchFavorites(currentUser.uid)
  };
};