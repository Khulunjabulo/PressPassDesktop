"use client";

import { useState, useEffect } from 'react';
import { Heart, Building } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites'; 

export default function PublisherFavoriteButton({ 
  publisher, 
  size = 'default',
  showText = false,
  className = ''
}) {
  const { togglePublisherFavorite, isPublisherFavorite, currentUser } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  // Log when the component mounts and props received
  useEffect(() => {
    console.log('[PublisherFavoriteButton] Mounted');
    console.log('[PublisherFavoriteButton] Props received:', {
      publisher,
      size,
      showText,
      className
    });
  }, []);

  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent parent click events
    console.log('[PublisherFavoriteButton] Favorite button clicked for:', publisher?.id);

    if (!currentUser) {
      console.warn('[PublisherFavoriteButton] No currentUser detected.');
      alert('Please sign in to add favorite publishers');
      return;
    }

    setIsLoading(true);
    console.log('[PublisherFavoriteButton] Loading state set to true');

    try {
      // Prepare comprehensive publisher data
      const publisherData = {
        id: publisher.id,
        name: publisher.name || 'Unknown Publisher',
        logo: publisher.logo || null,
        website: publisher.website || null,
        description: publisher.description || '',
        industry: publisher.industry || 'Media',
        publicationType: publisher.publicationType || 'newspaper',
        audienceType: publisher.audienceType || 'general',
        articleCount: publisher.articleCount || 0,
        hasArticles: publisher.hasArticles || false,
        lastPosted: publisher.lastPosted || 'Recently',
        coverImage: publisher.coverImage || publisher.logo || null,
        favoritedAt: new Date().toISOString()
      };

      console.log('[PublisherFavoriteButton] Sending publisherData to togglePublisherFavorite:', publisherData);

      const result = await togglePublisherFavorite(publisherData);

      console.log('[PublisherFavoriteButton] togglePublisherFavorite result:', result);

      if (!result.success) {
        console.error('[PublisherFavoriteButton] Failed to update favorites:', result.error);
        alert(result.error || 'Failed to update publisher favorites');
      } else {
        console.log('[PublisherFavoriteButton] Favorite successfully updated.');
      }
    } catch (error) {
      console.error('[PublisherFavoriteButton] Error toggling favorite:', error);
      alert('Failed to update publisher favorites');
    } finally {
      setIsLoading(false);
      console.log('[PublisherFavoriteButton] Loading state set to false');
    }
  };

  // Check if current publisher is favorited
  const isPublisherFav = isPublisherFavorite(publisher.id);
  console.log(`[PublisherFavoriteButton] isPublisherFavorite(${publisher.id}):`, isPublisherFav);

  // Dynamic size configs
  const sizeConfig = {
    small: { icon: 'w-4 h-4', button: 'p-1', text: 'text-xs' },
    default: { icon: 'w-5 h-5', button: 'p-2', text: 'text-sm' },
    large: { icon: 'w-6 h-6', button: 'p-3', text: 'text-base' }
  };
  const config = sizeConfig[size] || sizeConfig.default;

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        ${config.button} 
        ${isPublisherFav ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'} 
        transition-all duration-200 rounded-full disabled:opacity-50 border border-transparent
        ${isPublisherFav ? 'border-red-200' : 'hover:border-red-200'}
        ${className}
      `}
      title={isPublisherFav ? 'Remove publisher from favorites' : 'Add publisher to favorites'}
    >
      <div className="flex items-center space-x-1">
        {isLoading ? (
          <div
            className={`${config.icon} animate-spin border-2 border-current border-t-transparent rounded-full`}
          />
        ) : (
          <div className="relative">
            <Heart
              className={`${config.icon} ${isPublisherFav ? 'fill-current' : ''} transition-all duration-200`}
            />
            <Building 
              className="absolute -bottom-1 -right-1 w-2 h-2 text-current bg-white rounded-full" 
            />
          </div>
        )}
        {showText && (
          <span className={`${config.text} font-medium`}>
            {isPublisherFav ? 'Following' : 'Follow'}
          </span>
        )}
      </div>
    </button>
  );
}
