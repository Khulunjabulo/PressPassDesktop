"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites'; 

export default function FavoriteButton({ 
  item, 
  size = 'default',
  showText = false,
  className = ''
}) {
  const { toggleFavorite, isFavorite, currentUser } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);

  // Determine item type based on source or category
  const determineItemType = (item) => {
    const source = item.source?.name || item.source || '';
    const magazines = ['Drum', 'You', 'Fairlady', 'GQ', 'Sarie', 'Huis Genoot'];
    const newspapers = ['Isolezwe', 'The Star', 'City Press', 'Mail & Guardian'];

    if (magazines.some(mag => source.toLowerCase().includes(mag.toLowerCase()))) {
      return 'magazine';
    } else if (newspapers.some(news => source.toLowerCase().includes(news.toLowerCase()))) {
      return 'newspaper';
    }
    return 'story';
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent parent click events

    if (!currentUser) {
      alert('Please sign in to add favorites');
      return;
    }

    setIsLoading(true);
    try {
      const favoriteItem = {
        id: item.id || `story_${Date.now()}`,
        title: item.title,
        description: item.description || item.content || '',
        image: item.image || item.urlToImage || '',
        link: item.link || item.url || '',
        source: item.source?.name || item.source || 'Unknown Source',
        publicationName: item.source?.name || item.source || 'Unknown',
        category: item.category || 'general',
        pubDate: item.pubDate || item.publishedAt || new Date().toISOString(),
        type: determineItemType(item),
        ...item // Preserve any extra fields
      };

      const result = await toggleFavorite(favoriteItem);

      if (!result.success) {
        alert(result.error || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if current item is in favorites
  const isItemFavorite = item.id ? isFavorite(item.id) : false;

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
        ${isItemFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} 
        transition-colors rounded-full hover:bg-gray-100 disabled:opacity-50
        ${className}
      `}
      title={isItemFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <div className="flex items-center space-x-1">
        {isLoading ? (
          <div
            className={`${config.icon} animate-spin border-2 border-current border-t-transparent rounded-full`}
          />
        ) : (
          <Heart
            className={`${config.icon} ${isItemFavorite ? 'fill-current' : ''}`}
          />
        )}
        {showText && (
          <span className={config.text}>
            {isItemFavorite ? 'Favorited' : 'Favorite'}
          </span>
        )}
      </div>
    </button>
  );
}
