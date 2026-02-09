// components/placeholder/DesktopPreview.jsx
import React from 'react';
import PublisherPlaceholder from './PublisherPlaceholder';

export default function DesktopPreview({ adType, adImage, adUrl }) {
  const isBanner = adType === 'banner';
  const isSidebarRectangle = adType === 'sidebar_rectangle' || adType === 'sidebar_rectangle2';
  const isSidebarSkyscraper = adType === 'sidebar_skyscraper';

  ('DesktopPreview - adType:', adType, 'adImage:', adImage ? 'exists' : 'missing');

  // Ad preview component - shows user's uploaded ad
  const AdPreview = ({ type, image, url, width, height, className = '' }) => {
    ('AdPreview rendering:', { type, hasImage: !!image, width, height });
    
    return (
      <div className={`relative ${className}`}>
        <div 
          className="border-2 border-blue-500 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white shadow-lg"
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
              <span className="text-gray-500 text-sm">Loading ad...</span>
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
      className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <span className="text-gray-400 text-xs font-medium">{label}</span>
    </div>
  );

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 min-h-[600px]">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="grid grid-cols-[1fr_300px] gap-6">
          {/* Main Content Column */}
          <div className="space-y-6">
            {/* Banner Ad Section */}
            <section>
              {isBanner ? (
                <AdPreview 
                  type="banner"
                  image={adImage}
                  url={adUrl}
                  width="100%"
                  height="90px"
                />
              ) : (
                <PlaceholderAd width="100%" height="90px" label="Banner Ad (728×90)" />
              )}
            </section>

            {/* Headlines Section */}
            <section>
              <div className="mb-4">
                <div className="h-6 bg-gray-300 rounded w-32"></div>
              </div>
              
              {/* Publisher Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <PublisherPlaceholder key={i} index={i} />
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6 sticky top-6 h-fit">
            {/* Rectangle Ad 1 */}
            {isSidebarRectangle && adType === 'sidebar_rectangle' ? (
              <AdPreview 
                type="rectangle"
                image={adImage}
                url={adUrl}
                width="300px"
                height="250px"
              />
            ) : (
              <PlaceholderAd width="300px" height="250px" label="Rectangle (300×250)" />
            )}
            
            {/* Skyscraper Ad */}
            {isSidebarSkyscraper ? (
              <AdPreview 
                type="skyscraper"
                image={adImage}
                url={adUrl}
                width="300px"
                height="600px"
              />
            ) : (
              <PlaceholderAd width="300px" height="600px" label="Skyscraper (300×600)" />
            )}
            
            {/* Rectangle Ad 2 */}
            {isSidebarRectangle && adType === 'sidebar_rectangle2' ? (
              <AdPreview 
                type="rectangle2"
                image={adImage}
                url={adUrl}
                width="300px"
                height="250px"
              />
            ) : (
              <PlaceholderAd width="300px" height="250px" label="Rectangle (300×250)" />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}