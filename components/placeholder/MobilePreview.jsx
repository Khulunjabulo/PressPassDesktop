// components/placeholder/MobilePreview.jsx
import React from 'react';
import PublisherPlaceholder from './PublisherPlaceholder';

export default function MobilePreview({ adType, adImage, adUrl }) {
  const isBanner = adType === 'banner';
  const isMobile = adType === 'mobile';

  ('MobilePreview - adType:', adType, 'adImage:', adImage ? 'exists' : 'missing', 'isBanner:', isBanner, 'isMobile:', isMobile);

  // Ad preview component - shows user's uploaded ad
  const AdPreview = ({ type, image, url, width, height, className = '' }) => {
    ('MobilePreview AdPreview rendering:', { type, hasImage: !!image, width, height });
    
    return (
      <div className={`relative ${className}`}>
        <div 
          className="border-2 border-blue-500 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white mx-auto shadow-lg"
          style={{ width, height }}
          onClick={() => url && window.open(url, '_blank')}
        >
          {image ? (
            <img
              src={image}
              alt="Your ad"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-xs">Loading ad...</span>
            </div>
          )}
          <div className="absolute top-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
            Ad
          </div>
          <div className="absolute top-1 right-1 text-xs text-white bg-blue-600 px-2 py-0.5 rounded font-medium shadow-md">
            YOUR AD
          </div>
        </div>
      </div>
    );
  };

  // Placeholder ads for non-selected positions
  const PlaceholderAd = ({ width, height, label, className = '' }) => (
    <div 
      className={`bg-gray-200 rounded-lg flex items-center justify-center mx-auto ${className}`}
      style={{ width, height }}
    >
      <span className="text-gray-400 text-xs font-medium text-center px-2">{label}</span>
    </div>
  );

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 min-h-[600px] max-w-md mx-auto">
      {/* Mobile Phone Frame */}
      <div className="bg-white rounded-2xl shadow-2xl border-8 border-gray-800 overflow-hidden">
        {/* Phone Notch */}
        <div className="bg-gray-800 h-6 flex items-center justify-center">
          <div className="bg-gray-900 w-32 h-4 rounded-full"></div>
        </div>

        {/* Mobile Content */}
        <div className="bg-white overflow-y-auto" style={{ height: '667px' }}>
          <div className="p-3 space-y-4">
            {/* Banner Ad Section (Mobile version) */}
            <section>
              {isBanner ? (
                <AdPreview 
                  type="banner_mobile"
                  image={adImage}
                  url={adUrl}
                  width="100%"
                  height="50px"
                />
              ) : (
                <PlaceholderAd width="100%" height="50px" label="Banner (320×50)" />
              )}
            </section>

            {/* Headlines Section */}
            <section>
              <div className="mb-3">
                <div className="h-5 bg-gray-300 rounded w-28"></div>
              </div>
              
              {/* Publisher Cards - Mobile Layout */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i}>
                    <PublisherPlaceholder index={i} />
                    
                    {/* Mobile ads between cards (every 3rd card) */}
                    {i % 3 === 0 && (
                      <div className="my-3">
                        {isMobile ? (
                          <AdPreview 
                            type="mobile"
                            image={adImage}
                            url={adUrl}
                            width="100%"
                            height="100px"
                          />
                        ) : (
                          <PlaceholderAd width="100%" height="100px" label="Mobile Ad (320×100)" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Additional mobile ad at bottom */}
                <div className="my-3">
                  {isMobile ? (
                    <AdPreview 
                      type="mobile"
                      image={adImage}
                      url={adUrl}
                      width="100%"
                      height="100px"
                    />
                  ) : (
                    <PlaceholderAd width="100%" height="100px" label="Mobile Ad (320×100)" />
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Phone Home Indicator */}
        <div className="bg-gray-800 h-6 flex items-center justify-center">
          <div className="bg-gray-600 w-24 h-1 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}