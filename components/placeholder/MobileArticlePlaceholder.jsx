import React from 'react';
import { Building, Users, Globe, Calendar, Clock, X } from 'lucide-react';

// Mobile Article Placeholder - Wrapped in iPhone Frame
export default function MobileArticlePlaceholder({ ads = {}, previewAd = null, highlightTemplate = null, publisherId }) {
  // Get ad to display for a template
  const getAdForTemplate = (templateId) => {
    // If preview mode and this template is highlighted, show preview
    if (previewAd && highlightTemplate === templateId) {
      return previewAd;
    }
    // Otherwise show uploaded ads
    const templateAds = ads[templateId] || [];
    return templateAds.length > 0 ? templateAds[0] : null;
  };

  // Render ad space with exact dimensions from publisher page
  const renderAdSpace = (templateId, height, className = '') => {
    const ad = getAdForTemplate(templateId);
    const isHighlighted = highlightTemplate === templateId;

    return (
      <div
        className={`w-full rounded-md overflow-hidden shadow-sm relative border-2 transition-all ${
          isHighlighted ? 'border-yellow-400 ring-4 ring-yellow-200' : 'border-gray-300'
        } ${className}`}
        style={{ height }}
      >
        {ad ? (
          <>
            {ad.fileType?.startsWith('video/') ? (
              <video
                src={ad.imageSrc}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={ad.imageSrc}
                alt={ad.fileName || 'Advertisement'}
                className="w-full h-full object-cover"
              />
            )}
            {isHighlighted && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                YOUR AD
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              Ad {templateId}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white p-3">
            <div className="w-16 h-16 mb-2">
              <img
                src="/Presspass.png"
                alt="PressPass"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-bold text-xs mb-1">Advertise Here</h3>
            <p className="text-xs opacity-90">Template {templateId}</p>
            {isHighlighted && (
              <div className="mt-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                PREVIEW
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      {/* iPhone Frame */}
      <div className="relative" style={{ width: '375px', height: '812px' }}>
        {/* Phone Body */}
        <div className="absolute inset-0 bg-blue-600 rounded-[3rem] shadow-2xl p-3">
          {/* Screen Bezel */}
          <div className="relative w-full h-full bg-black rounded-[2.5rem] overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20"></div>
            
            {/* Screen Content Area with Scroll */}
            <div className="absolute inset-0 bg-white overflow-y-auto overflow-x-hidden" 
                 style={{ 
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              <style>
                {`
                  .absolute.inset-0.bg-white::-webkit-scrollbar {
                    display: none;
                  }
                `}
              </style>
              
              {/* Original Mobile Content Starts Here */}
              <div className="min-h-screen bg-white">
                {/* Mobile Newspaper Header */}
                <div className="border-b-4 border-black">
                  <div className="px-4 py-4">
                    {/* Publication Header */}
                    <div className="text-center">
                      <h1 className="text-3xl font-bold tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                        YOUR PUBLICATION
                      </h1>
                      <div className="border-t border-b border-black py-2 mb-3">
                        <p className="text-xs tracking-widest" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                          {getCurrentDate()}
                        </p>
                        <p className="text-xs tracking-widest" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                          News • Preview Mode
                        </p>
                      </div>
                      
                      {/* Publisher Details - Stacked for mobile */}
                      <div className="flex flex-col items-center space-y-1 text-xs">
                        <div className="flex items-center space-x-1">
                          <Building className="w-3 h-3" />
                          <span>Digital Publication</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>General Audience</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>yourpublication.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template 1 - Mobile Banner Ad (120px height) */}
                <div className="px-4 mt-4">
                  {renderAdSpace(1, 120, 'border border-gray-300')}
                </div>

                {/* Main Content */}
                <div className="px-4 py-4">
                  {/* Section Header */}
                  <div className="border-b-2 border-black mb-4 pb-2">
                    <h2 className="text-2xl font-bold" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                      Latest Articles
                    </h2>
                  </div>

                  {/* Mock Article 1 - Mobile Card Style */}
                  <article className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                    <div className="mb-3">
                      <div className="w-full h-48 bg-gray-200 border border-gray-300 rounded-md"></div>
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                        CATEGORY
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight mb-2" 
                        style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                      Breaking News Article on Mobile
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      Sample preview text for mobile layout demonstration...
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getCurrentDate()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>5 min read</span>
                      </div>
                    </div>
                  </article>

                  {/* Template 2 - Feed Ad (250px height) */}
                  <div className="mb-4">
                    {renderAdSpace(2, 250, 'border border-gray-300')}
                  </div>

                  {/* Mock Article 2 */}
                  <article className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                    <div className="mb-3">
                      <div className="w-full h-48 bg-gray-200 border border-gray-300 rounded-md"></div>
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                        CATEGORY
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight mb-2" 
                        style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                      Another Story in Mobile View
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      More sample content for the second article...
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getCurrentDate()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>3 min read</span>
                      </div>
                    </div>
                  </article>

                  {/* Mock Article 3 */}
                  <article className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                    <div className="mb-3">
                      <div className="w-full h-48 bg-gray-200 border border-gray-300 rounded-md"></div>
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                        CATEGORY
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight mb-2" 
                        style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                      Third Article for Preview
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      Preview text showing mobile article layout...
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getCurrentDate()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>4 min read</span>
                      </div>
                    </div>
                  </article>

                  {/* Template 3 - Within Article Ad (250px height) */}
                  <div className="mb-4">
                    {renderAdSpace(3, 250, 'border border-gray-300')}
                  </div>

                  {/* Mock Article 4 */}
                  <article className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                    <div className="mb-3">
                      <div className="w-full h-48 bg-gray-200 border border-gray-300 rounded-md"></div>
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                        CATEGORY
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight mb-2" 
                        style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                      More News Content
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      Additional article showing content flow...
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getCurrentDate()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>6 min read</span>
                      </div>
                    </div>
                  </article>

                  {/* Template 4 - Half Page Ad 1 (300px height) */}
                  <div className="mb-4">
                    {renderAdSpace(4, 300, 'border-2 border-black')}
                  </div>

                  {/* Publisher Info Box */}
                  <div className="border-2 border-black p-4 mb-4">
                    <h3 className="text-base font-bold mb-3 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                      About Us
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="text-center mb-3">
                        <div className="w-12 h-12 mx-auto bg-gray-200 rounded border border-gray-400"></div>
                      </div>
                      <p className="text-gray-700 italic leading-relaxed text-xs">
                        "Your trusted source for news and information."
                      </p>
                    </div>
                  </div>

                  {/* Mock Article 5 */}
                  <article className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                    <div className="mb-3">
                      <div className="w-full h-48 bg-gray-200 border border-gray-300 rounded-md"></div>
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                        CATEGORY
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight mb-2" 
                        style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                      Continued Coverage
                    </h3>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                      More articles in mobile format...
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{getCurrentDate()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>7 min read</span>
                      </div>
                    </div>
                  </article>

                  {/* Template 5 - Half Page Ad 2 (400px height) */}
                  <div className="mb-4">
                    {renderAdSpace(5, 400, 'border-2 border-black')}
                  </div>

                  {/* Categories Box */}
                  <div className="border-2 border-black p-4 mb-4">
                    <h3 className="text-base font-bold mb-3 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                      Categories
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center py-2 px-3 border bg-gray-50 border-gray-300">
                        <span className="font-medium text-xs">Politics</span>
                        <span className="text-xs">12</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 border bg-gray-50 border-gray-300">
                        <span className="font-medium text-xs">Business</span>
                        <span className="text-xs">8</span>
                      </div>
                      <div className="flex justify-between items-center py-2 px-3 border bg-gray-50 border-gray-300">
                        <span className="font-medium text-xs">Sports</span>
                        <span className="text-xs">15</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Banner Ad - Same as Template 1 */}
                <div className="px-4 mb-4">
                  {renderAdSpace(1, 120, 'border border-gray-300')}
                </div>

                {/* Footer */}
                <div className="border-t-2 border-black mt-4">
                  <div className="px-4 py-4">
                    <div className="text-center text-xs space-y-2">
                      <div>
                        <span className="font-bold" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                          © {new Date().getFullYear()} Your Publication
                        </span>
                      </div>
                      <div className="text-gray-600">All rights reserved</div>
                      <div className="text-gray-600">Edition: Mobile</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Original Mobile Content Ends Here */}

            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60 z-20"></div>
          </div>
        </div>

        {/* Power Button */}
        <div className="absolute right-0 top-32 w-1 h-16 bg-blue-700 rounded-l"></div>
        
        {/* Volume Buttons */}
        <div className="absolute left-0 top-28 w-1 h-8 bg-blue-700 rounded-r"></div>
        <div className="absolute left-0 top-40 w-1 h-8 bg-blue-700 rounded-r"></div>
      </div>
    </div>
  );
}