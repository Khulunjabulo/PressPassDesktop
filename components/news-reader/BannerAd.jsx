'use client';

import { useState, useEffect } from 'react';
import { fetchAds, trackAdImpression, trackAdClick } from '@/lib/adsApi';

export default function BannerAd({ 
  className = '',
  showFallback = true 
}) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBannerAd = async () => {
      try {
        setLoading(true);
        const response = await fetchAds('banner', 1);
        
        if (response.success && response.data.length > 0) {
          const randomBanner = response.data[Math.floor(Math.random() * response.data.length)];
          setAd(randomBanner);
          // Track impression
          await trackAdImpression(randomBanner.id);
        } else {
          setError('No banner ads available');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBannerAd();
  }, []);

  const handleAdClick = async () => {
    if (ad) {
      await trackAdClick(ad.id);
      if (ad.link && ad.link !== '#') {
        window.open(ad.link, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`w-full h-[120px] bg-gray-100 animate-pulse flex items-center justify-center rounded-md border border-gray-200 ${className}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          <p className="text-sm text-gray-500 mt-2">Loading banner ad...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !ad) {
    if (!showFallback) return null;
    
    return (
      <div className={`w-full h-[120px] bg-gray-200 flex items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-500 ${className}`}>
        <p className="text-sm">Banner Ad (728 x 90)</p>
      </div>
    );
  }

  // Render banner ad
  return (
    <div 
      className={`w-full h-[120px] rounded-md overflow-hidden shadow-sm border border-gray-200 cursor-pointer transition-transform hover:scale-[1.01] ${className}`}
      onClick={handleAdClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleAdClick();
        }
      }}
      aria-label={`Banner Advertisement: ${ad.title}`}
    >
      <div 
        className="w-full h-full relative flex items-center"
        style={{ backgroundColor: ad.backgroundColor }}
      >
        {/* Background Image */}
        {ad.image && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${ad.image})` }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-between w-full px-6">
          <div className="flex-1">
            {/* Company */}
            <div className="text-xs opacity-75 mb-1" style={{ color: ad.textColor }}>
              {ad.company}
            </div>
            
            {/* Title and Description */}
            <h3 className="font-bold text-lg mb-1" style={{ color: ad.textColor }}>
              {ad.title}
            </h3>
            <p className="text-sm opacity-90" style={{ color: ad.textColor }}>
              {ad.description}
            </p>
          </div>
          
          {/* CTA Button */}
          <button 
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded font-medium transition-colors ml-4"
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
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Ad
        </div>
      </div>
    </div>
  );
}