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

  // Helper function to get the correct reader ID
  const getReaderId = useCallback((userData) => {
    // First check if originalUid exists (your custom reader ID)
    if (userData?.originalUid) {
      console.log('🔍 Using originalUid as reader ID:', userData.originalUid);
      return userData.originalUid;
    }
    
    // If no originalUid, construct reader ID from Firebase UID
    if (userData?.uid) {
      // Check if UID already starts with "reader_"
      if (userData.uid.startsWith('reader_')) {
        console.log('🔍 UID already has reader_ prefix:', userData.uid);
        return userData.uid;
      } else {
        // Construct reader ID by adding "reader_" prefix
        const readerId = `reader_${userData.uid}`;
        console.log('🔍 Constructed reader ID from UID:', readerId);
        return readerId;
      }
    }
    
    console.warn('⚠️ No valid UID found in user data');
    return null;
  }, []);

  // Check authentication and get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Get user data from localStorage (stored during sign-in)
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('👤 Current user from localStorage:', userData);
        
        // Get the correct reader ID
        const readerId = getReaderId(userData);
        
        if (readerId) {
          const updatedUserData = {
            ...userData,
            readerId: readerId // Store the correct reader ID
          };
          setCurrentUser(updatedUserData);
          fetchFavorites(readerId);
          fetchFavoritePublishers(readerId);
        } else {
          console.warn('⚠️ User data found but no valid reader ID could be determined');
          setCurrentUser(null);
          setFavorites([]);
          setFavoritePublishers([]);
        }
      } else {
        console.log('👤 No authenticated user found');
        setCurrentUser(null);
        setFavorites([]);
        setFavoritePublishers([]);
        // Clear localStorage when user is not authenticated
        localStorage.removeItem('currentUser');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [getReaderId]);

  // Fetch article favorites from API
  const fetchFavorites = useCallback(async (readerId) => {
    if (!readerId) {
      console.warn('⚠️ Cannot fetch favorites: No reader ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching favorites for reader:', readerId);
      const response = await fetch(`/api/favorites?userId=${readerId}`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Favorites fetched successfully:', data.favorites?.length || 0, 'items');
        setFavorites(data.favorites || []);
      } else {
        console.error('❌ Failed to fetch favorites:', data.error);
        setError(data.error || 'Failed to fetch favorites');
      }
    } catch (err) {
      console.error('❌ Error fetching favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch publisher favorites from API
  const fetchFavoritePublishers = useCallback(async (readerId) => {
    if (!readerId) {
      console.warn('⚠️ Cannot fetch favorite publishers: No reader ID provided');
      return;
    }
    
    try {
      console.log('🔍 Fetching favorite publishers for reader:', readerId);
      const response = await fetch(`/api/favorites/publishers?userId=${readerId}`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Favorite publishers fetched successfully:', data.publishers?.length || 0, 'items');
        setFavoritePublishers(data.publishers || []);
      } else {
        console.error('❌ Failed to fetch favorite publishers:', data.error);
      }
    } catch (err) {
      console.error('❌ Error fetching favorite publishers:', err);
    }
  }, []);

  // Check if an article is favorited
  const isFavorite = useCallback((itemId) => {
    const result = favorites.some(fav => fav.id === itemId);
    console.log('🔍 Checking if item is favorite:', itemId, '→', result);
    return result;
  }, [favorites]);

  // Check if a publisher is favorited
  const isPublisherFavorite = useCallback((publisherId) => {
    const result = favoritePublishers.some(pub => pub.id === publisherId);
    console.log('🔍 Checking if publisher is favorite:', publisherId, '→', result);
    return result;
  }, [favoritePublishers]);

  // Add article to favorites
  const addToFavorites = useCallback(async (item) => {
    const readerId = currentUser?.readerId;
    
    if (!readerId) {
      console.warn('⚠️ Cannot add to favorites: Reader not authenticated');
      console.warn('Current user data:', currentUser);
      return { success: false, error: 'Reader not authenticated' };
    }

    try {
      console.log('➕ Adding item to favorites for reader:', readerId, item.title);
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: readerId, // Use the proper reader ID
          item
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Successfully added to favorites');
        setFavorites(prev => [data.favorite, ...prev]);
        return { success: true, message: 'Added to favorites' };
      } else {
        console.error('❌ Failed to add to favorites:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      return { success: false, error: 'Failed to add to favorites' };
    }
  }, [currentUser]);

  // Add publisher to favorites
  const addPublisherToFavorites = useCallback(async (publisher) => {
    const readerId = currentUser?.readerId;
    
    if (!readerId) {
      console.warn('⚠️ Cannot add publisher to favorites: Reader not authenticated');
      console.warn('Current user data:', currentUser);
      return { success: false, error: 'Reader not authenticated' };
    }

    try {
      console.log('➕ Adding publisher to favorites for reader:', readerId, publisher.name);
      const response = await fetch('/api/favorites/publishers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: readerId, // Use the proper reader ID
          publisher
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Successfully added publisher to favorites');
        setFavoritePublishers(prev => [data.publisher, ...prev]);
        return { success: true, message: 'Publisher added to favorites' };
      } else {
        console.error('❌ Failed to add publisher to favorites:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Error adding publisher to favorites:', error);
      return { success: false, error: 'Failed to add publisher to favorites' };
    }
  }, [currentUser]);

  // Remove article from favorites
  const removeFromFavorites = useCallback(async (itemId) => {
    const readerId = currentUser?.readerId;
    
    if (!readerId) {
      console.warn('⚠️ Cannot remove from favorites: Reader not authenticated');
      return { success: false, error: 'Reader not authenticated' };
    }

    try {
      console.log('➖ Removing item from favorites for reader:', readerId, itemId);
      const response = await fetch(`/api/favorites?userId=${readerId}&itemId=${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Successfully removed from favorites');
        setFavorites(prev => prev.filter(fav => fav.id !== itemId));
        return { success: true, message: 'Removed from favorites' };
      } else {
        console.error('❌ Failed to remove from favorites:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      return { success: false, error: 'Failed to remove from favorites' };
    }
  }, [currentUser]);

  // Remove publisher from favorites
  const removePublisherFromFavorites = useCallback(async (publisherId) => {
    const readerId = currentUser?.readerId;
    
    if (!readerId) {
      console.warn('⚠️ Cannot remove publisher from favorites: Reader not authenticated');
      return { success: false, error: 'Reader not authenticated' };
    }

    try {
      console.log('➖ Removing publisher from favorites for reader:', readerId, publisherId);
      const response = await fetch(`/api/favorites/publishers?userId=${readerId}&publisherId=${publisherId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Successfully removed publisher from favorites');
        setFavoritePublishers(prev => prev.filter(pub => pub.id !== publisherId));
        return { success: true, message: 'Publisher removed from favorites' };
      } else {
        console.error('❌ Failed to remove publisher from favorites:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('❌ Error removing publisher from favorites:', error);
      return { success: false, error: 'Failed to remove publisher from favorites' };
    }
  }, [currentUser]);

  // Toggle article favorite status
  const toggleFavorite = useCallback(async (item) => {
    const itemId = item.id || `item_${Date.now()}`;
    
    console.log('🔄 Toggling favorite status for item:', itemId);
    
    if (isFavorite(itemId)) {
      return await removeFromFavorites(itemId);
    } else {
      return await addToFavorites(item);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  // Toggle publisher favorite status
  const togglePublisherFavorite = useCallback(async (publisher) => {
    const publisherId = publisher.id;
    
    console.log('🔄 Toggling favorite status for publisher:', publisherId);
    console.log('🔄 Using reader ID:', currentUser?.readerId);
    
    if (isPublisherFavorite(publisherId)) {
      return await removePublisherFromFavorites(publisherId);
    } else {
      return await addPublisherToFavorites(publisher);
    }
  }, [isPublisherFavorite, addPublisherToFavorites, removePublisherFromFavorites, currentUser]);

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
    const stats = {
      all: favorites.length,
      magazines: favorites.filter(fav => fav.type === 'magazine').length,
      newspapers: favorites.filter(fav => fav.type === 'newspaper').length,
      stories: favorites.filter(fav => fav.type === 'story').length,
      publishers: favoritePublishers.length
    };
    
    console.log('📊 Favorite stats:', stats);
    return stats;
  }, [favorites, favoritePublishers]);

  // Refresh all favorites
  const refreshFavorites = useCallback(() => {
    console.log('🔄 Refreshing favorites...');
    const readerId = currentUser?.readerId;
    if (readerId) {
      fetchFavorites(readerId);
      fetchFavoritePublishers(readerId);
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