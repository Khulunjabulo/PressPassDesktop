// hooks/useFavorites.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/Firebase/firebase';

const auth = getAuth(app);

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoritePublishers, setFavoritePublishers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication and get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (userData.uid) {
          setCurrentUser(userData);
          fetchFavorites(userData.uid);
          fetchFavoritePublishers(userData.uid);
        }
      } else {
        setCurrentUser(null);
        setFavorites([]);
        setFavoritePublishers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch article favorites from API
  const fetchFavorites = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/favorites?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setFavorites(data.favorites || []);
      } else {
        setError(data.error || 'Failed to fetch favorites');
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch publisher favorites from API
  const fetchFavoritePublishers = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/favorites/publishers?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setFavoritePublishers(data.publishers || []);
      } else {
        console.error('Failed to fetch favorite publishers:', data.error);
      }
    } catch (err) {
      console.error('Error fetching favorite publishers:', err);
    }
  }, []);

  // Check if an article is favorited
  const isFavorite = useCallback((itemId) => {
    return favorites.some(fav => fav.id === itemId);
  }, [favorites]);

  // Check if a publisher is favorited
  const isPublisherFavorite = useCallback((publisherId) => {
    return favoritePublishers.some(pub => pub.id === publisherId);
  }, [favoritePublishers]);

  // Add article to favorites
  const addToFavorites = useCallback(async (item) => {
    if (!currentUser?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          item
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(prev => [data.favorite, ...prev]);
        return { success: true, message: 'Added to favorites' };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return { success: false, error: 'Failed to add to favorites' };
    }
  }, [currentUser]);

  // Add publisher to favorites
  const addPublisherToFavorites = useCallback(async (publisher) => {
    if (!currentUser?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await fetch('/api/favorites/publishers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.uid,
          publisher
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFavoritePublishers(prev => [data.publisher, ...prev]);
        return { success: true, message: 'Publisher added to favorites' };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error adding publisher to favorites:', error);
      return { success: false, error: 'Failed to add publisher to favorites' };
    }
  }, [currentUser]);

  // Remove article from favorites
  const removeFromFavorites = useCallback(async (itemId) => {
    if (!currentUser?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await fetch(`/api/favorites?userId=${currentUser.uid}&itemId=${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(prev => prev.filter(fav => fav.id !== itemId));
        return { success: true, message: 'Removed from favorites' };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return { success: false, error: 'Failed to remove from favorites' };
    }
  }, [currentUser]);

  // Remove publisher from favorites
  const removePublisherFromFavorites = useCallback(async (publisherId) => {
    if (!currentUser?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await fetch(`/api/favorites/publishers?userId=${currentUser.uid}&publisherId=${publisherId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setFavoritePublishers(prev => prev.filter(pub => pub.id !== publisherId));
        return { success: true, message: 'Publisher removed from favorites' };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error removing publisher from favorites:', error);
      return { success: false, error: 'Failed to remove publisher from favorites' };
    }
  }, [currentUser]);

  // Toggle article favorite status
  const toggleFavorite = useCallback(async (item) => {
    const itemId = item.id || `item_${Date.now()}`;
    
    if (isFavorite(itemId)) {
      return await removeFromFavorites(itemId);
    } else {
      return await addToFavorites(item);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  // Toggle publisher favorite status
  const togglePublisherFavorite = useCallback(async (publisher) => {
    const publisherId = publisher.id;
    
    if (isPublisherFavorite(publisherId)) {
      return await removePublisherFromFavorites(publisherId);
    } else {
      return await addPublisherToFavorites(publisher);
    }
  }, [isPublisherFavorite, addPublisherToFavorites, removePublisherFromFavorites]);

  // Get favorites by type
  const getFavoritesByType = useCallback((type) => {
    if (type === 'all') return favorites;
    return favorites.filter(fav => fav.type === type);
  }, [favorites]);

  // Get grouped favorites by publication
  const getGroupedFavorites = useCallback((type = 'all') => {
    const filtered = getFavoritesByType(type);
    
    if (type === 'all') {
      return filtered;
    }

    const grouped = {};
    filtered.forEach(fav => {
      const pubName = fav.publicationName || fav.source || 'Unknown';
      if (!grouped[pubName]) {
        grouped[pubName] = {
          name: pubName,
          type: fav.type,
          logo: fav.publicationLogo || null,
          stories: [],
          image: fav.image || null
        };
      }
      grouped[pubName].stories.push(fav);
    });

    return Object.values(grouped);
  }, [getFavoritesByType]);

  // Get favorite stats
  const getFavoriteStats = useCallback(() => {
    return {
      all: favorites.length,
      magazines: favorites.filter(fav => fav.type === 'magazine').length,
      newspapers: favorites.filter(fav => fav.type === 'newspaper').length,
      stories: favorites.filter(fav => fav.type === 'story').length,
      publishers: favoritePublishers.length
    };
  }, [favorites, favoritePublishers]);

  // Refresh all favorites
  const refreshFavorites = useCallback(() => {
    if (currentUser?.uid) {
      fetchFavorites(currentUser.uid);
      fetchFavoritePublishers(currentUser.uid);
    }
  }, [currentUser, fetchFavorites, fetchFavoritePublishers]);

  return {
    favorites,
    favoritePublishers,
    currentUser,
    loading,
    error,
    isFavorite,
    isPublisherFavorite,
    addToFavorites,
    addPublisherToFavorites,
    removeFromFavorites,
    removePublisherFromFavorites,
    toggleFavorite,
    togglePublisherFavorite,
    getFavoritesByType,
    getGroupedFavorites,
    getFavoriteStats,
    refreshFavorites
  };
};