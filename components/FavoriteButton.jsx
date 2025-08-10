// components/FavoriteButton.jsx
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
    const source = item.source?.name || item.source || item.publicationName || '';
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
      // Prepare comprehensive favorite item data
      const favoriteItem = {
        id: item.id || `story_${Date.now()}`,
        title: item.title || 'Untitled',
        description: item.description || item.summary || item.content?.substring(0, 300) || '',
        image: item.image || item.imageUrl || item.urlToImage || null,
        link: item.link || item.url || `${window.location.origin}/news-reader/article/${item.id}`,
        source: item.source?.name || item.source || item.publicationName || 'Unknown Source',
        publicationName: item.source?.name || item.source || item.publicationName || 'Unknown',
        publicationLogo: item.publicationLogo || item.logo || null,
        category: item.category || 'general',
        pubDate: item.pubDate || item.publishedAt || item.createdAt || new Date().toISOString(),
        type: determineItemType(item),
        publisherId: item.publisherId || null,
        // Include any additional fields
        tags: item.tags || [],
        author: item.author || item.creator || 'Unknown',
        readTime: item.readTime || 0,
        views: item.views || 0
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
  const itemId = item.id || `item_${item.title}_${item.source}`;
  const isItemFavorite = isFavorite(itemId);

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
        ${isItemFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'} 
        transition-all duration-200 rounded-full disabled:opacity-50 border border-transparent
        ${isItemFavorite ? 'border-red-200' : 'hover:border-red-200'}
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
            className={`${config.icon} ${isItemFavorite ? 'fill-current' : ''} transition-all duration-200`}
          />
        )}
        {showText && (
          <span className={`${config.text} font-medium`}>
            {isItemFavorite ? 'Favorited' : 'Favorite'}
          </span>
        )}
      </div>
    </button>
  );
}