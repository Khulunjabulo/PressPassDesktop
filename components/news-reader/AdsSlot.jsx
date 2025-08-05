'use client';

import { useState, useEffect } from 'react';
import { fetchRandomAd, trackAdImpression, trackAdClick } from '@/lib/adsApi';

export default function AdSlot({ 
  label = 'Advertisement', 
  height = 250, 
  width = '100%',
  preferredType = null,
  showFallback = true,
  className = ''
}) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAd = async () => {
      try {
        setLoading(true);
        const response = await fetchRandomAd(preferredType);
        
        if (response.success && response.data) {
          setAd(response.data);
          // Track impression
          await trackAdImpression(response.data.id);
        } else {
          setError('No ads available');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAd();
  }, [preferredType]);

  const handleAdClick = async () => {
    if (ad) {
      await trackAdClick(ad.id);
      // Open link in new tab
      if (ad.link && ad.link !== '#') {
        window.open(ad.link, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className={`w-full bg-gray-100 animate-pulse flex items-center justify-center rounded-md border border-gray-200 ${className}`}
        style={{ height, width }}
        aria-label="Loading advertisement"
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          <p className="text-sm text-gray-500 mt-2">Loading ad...</p>
        </div>
      </div>
    );
  }

  // Error state or no ad available
  if (error || !ad) {
    if (!showFallback) return null;
    
    return (
      <div 
        className={`w-full bg-gray-200 flex items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-500 ${className}`}
        style={{ height, width }}
        aria-label="Advertisement placeholder"
      >
        <p className="text-sm">{label}</p>
      </div>
    );
  }

  // Render actual ad
  return (
    <div 
      className={`w-full rounded-md overflow-hidden shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
      style={{ height, width }}
      onClick={handleAdClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleAdClick();
        }
      }}
      aria-label={`Advertisement: ${ad.title}`}
    >
      <div 
        className="w-full h-full relative flex flex-col"
        style={{ backgroundColor: ad.backgroundColor }}
      >
        {/* Ad Image */}
        {ad.image && (
          <div className="flex-shrink-0">
            <img 
              src={ad.image} 
              alt={ad.title}
              className="w-full object-cover"
              style={{ 
                height: ad.type === 'banner' ? '60%' : ad.type === 'skyscraper' ? '60%' : '60%'
              }}
              loading="lazy"
            />
          </div>
        )}
        
        {/* Ad Content */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            {/* Company */}
            <div className="text-xs opacity-75 mb-1" style={{ color: ad.textColor }}>
              {ad.company}
            </div>
            
            {/* Title */}
            <h3 
              className="font-bold text-sm mb-1 line-clamp-2" 
              style={{ color: ad.textColor }}
            >
              {ad.title}
            </h3>
            
            {/* Description */}
            <p 
              className="text-xs opacity-90 line-clamp-2 mb-2" 
              style={{ color: ad.textColor }}
            >
              {ad.description}
            </p>
          </div>
          
          {/* Call to Action Button */}
          <button 
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-xs font-medium transition-colors self-start"
            style={{ color: ad.textColor }}
            onClick={(e) => {
              e.stopPropagation();
              handleAdClick();
            }}
          >
            {ad.buttonText}
          </button>
        </div>
        
        {/* Ad Label */}
        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          Ad
        </div>
      </div>
    </div>
  );
}