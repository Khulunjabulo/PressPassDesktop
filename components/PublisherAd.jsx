// components/PublisherAd.jsx - IMPROVED VERSION WITH VIDEO DEBUGGING
'use client';

import { useState, useEffect, useRef } from 'react';

export default function PublisherAd({ publisherId, templateId, className = '', height = 120 }) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');
  const [videoError, setVideoError] = useState(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  // Detect device type
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 768;
      setDeviceType(isMobile ? 'mobile' : 'desktop');
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Fetch ads
  useEffect(() => {
    const fetchAds = async () => {
      if (!publisherId || !templateId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `/api/get-ads?publisherId=${publisherId}&templateId=${templateId}&deviceType=${deviceType}`;
        
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          console.log('🎬 [PublisherAd] Fetched ads:', result.data.map(ad => ({
            id: ad.id,
            fileType: ad.fileType,
            isVideo: ad.isVideo,
            imageSrcType: ad.imageSrc?.startsWith('http') ? 'url' : 'base64',
            imageSrcLength: ad.imageSrc?.length
          })));
          
          setAds(result.data);
          setCurrentAdIndex(0);
          setError(null);
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error('❌ [PublisherAd] Error fetching ads:', error);
        setError(error.message);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [publisherId, templateId, deviceType]);

  // Rotate ads
  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % ads.length;
        console.log(`🔄 [PublisherAd] Rotating ad: ${prevIndex} → ${newIndex}`);
        // Reset video states when rotating
        setVideoError(null);
        setVideoLoaded(false);
        return newIndex;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [ads.length]);

  // Handle ad click
  const handleAdClick = async (ad) => {
    if (!ad.destinationUrl) {
      console.log('⚠️ No destination URL for this ad');
      return;
    }

    try {
      await fetch('/api/track-ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          publisherId: publisherId
        })
      });

      console.log('✅ Click tracked, opening:', ad.destinationUrl);
      window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ Error tracking click:', error);
      window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Video event handlers
  const handleVideoLoad = () => {
    console.log('✅ [PublisherAd] Video loaded successfully');
    setVideoLoaded(true);
    setVideoError(null);
  };

  const handleVideoError = (e) => {
    console.error('❌ [PublisherAd] Video error:', e);
    const video = e.target;
    setVideoError({
      code: video.error?.code,
      message: video.error?.message,
      src: video.src?.substring(0, 100)
    });
  };

  const handleVideoCanPlay = () => {
    console.log('▶️ [PublisherAd] Video can play');
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn('⚠️ [PublisherAd] Autoplay blocked:', err);
      });
    }
  };

  if (loading) {
    return (
      <div 
        className={`w-full bg-gray-100 animate-pulse flex items-center justify-center rounded-md ${className}`}
        style={{ height }}
      >
        <span className="text-sm text-gray-400">Loading ad...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`w-full bg-red-50 border border-red-200 flex items-center justify-center rounded-md ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <span className="text-sm text-red-600 block">Error loading ad</span>
          <span className="text-xs text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div 
        className={`w-full flex flex-col items-center justify-center rounded-md ${className}`}
        style={{ height, backgroundColor: '#3ba6e7' }}
      >
        <div className="w-32 h-32 mb-2">
          <img
            src="/Presspass.png"
            alt="PressPass Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-yellow-400 font-bold text-sm">Advertise Here</h3>
        <p className="text-white text-xs">Partners@presspass.africa</p>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];
  const isVideo = currentAd.fileType?.startsWith('video/') || currentAd.isVideo;

  console.log('🎨 [PublisherAd] Rendering ad:', {
    id: currentAd.id,
    fileType: currentAd.fileType,
    isVideo,
    imageSrcType: currentAd.imageSrc?.startsWith('http') ? 'url' : 'base64',
    hasDestinationUrl: !!currentAd.destinationUrl
  });

  return (
    <div 
      className={`w-full rounded-md overflow-hidden shadow-sm relative ${className} ${
        currentAd.destinationUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
      }`}
      style={{ height }}
      onClick={() => handleAdClick(currentAd)}
      role={currentAd.destinationUrl ? "button" : undefined}
      tabIndex={currentAd.destinationUrl ? 0 : undefined}
      onKeyDown={(e) => {
        if (currentAd.destinationUrl && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleAdClick(currentAd);
        }
      }}
    >
      {isVideo ? (
        <div className="relative w-full h-full bg-black">
          <video
            ref={videoRef}
            src={currentAd.imageSrc}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onCanPlay={handleVideoCanPlay}
          />
          
          {/* Video Loading Indicator */}
          {!videoLoaded && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                <span className="text-white text-sm">Loading video...</span>
              </div>
            </div>
          )}
          
          {/* Video Error Display */}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-90 p-4">
              <div className="text-center text-white">
                <p className="font-bold mb-2">Video Error</p>
                <p className="text-xs mb-1">Code: {videoError.code}</p>
                <p className="text-xs opacity-75">{videoError.message}</p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="text-xs mt-2 opacity-50 break-all">{videoError.src}</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <img
          src={currentAd.imageSrc}
          alt={currentAd.fileName}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('❌ [PublisherAd] Image load error');
            e.target.src = '/Presspass.png';
          }}
        />
      )}
      
      {/* Ad rotation indicators */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentAdIndex ? 'bg-white w-4' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Ad label */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        Ad {ads.length > 1 ? `${currentAdIndex + 1}/${ads.length}` : ''}
      </div>

      {/* Clickable indicator */}
      {currentAd.destinationUrl && (
        <div className="absolute bottom-2 right-2 bg-blue-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <span>Click to visit</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}
    </div>
  );
}