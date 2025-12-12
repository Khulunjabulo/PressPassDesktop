import React from 'react';
import { Building, Users, Globe, Calendar, Clock } from 'lucide-react';

// Desktop Article Placeholder - Exact replica of publisher article page
export default function DesktopArticlePlaceholder({ ads = {}, previewAd = null, highlightTemplate = null, publisherId }) {
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
              <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                YOUR AD HERE
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              Ad {templateId}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white p-4">
            <div className="w-20 h-20 mb-3">
              <img
                src="/Presspass.png"
                alt="PressPass"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-bold text-sm mb-1">Advertise Here</h3>
            <p className="text-xs opacity-90">Template {templateId}</p>
            {isHighlighted && (
              <div className="mt-2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                PREVIEW AREA
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
    <div className="min-h-screen bg-white">
      {/* Newspaper Header */}
      <div className="border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
          {/* Publication Header */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
              YOUR PUBLICATION
            </h1>
            <div className="border-t border-b border-black py-2 mb-4">
              <p className="text-sm tracking-widest" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                {getCurrentDate()} • News • Preview Mode
              </p>
            </div>
            
            {/* Publisher Details */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Digital Publication</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>General Audience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>yourpublication.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template 1 - Headline Banner Ad (120px height) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
        {renderAdSpace(1, 120, 'border border-gray-300')}
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Articles Column */}
          <div className="lg:col-span-3">
            {/* Section Header */}
            <div className="border-b-2 border-black mb-6 pb-2">
              <h2 className="text-3xl font-bold" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                Latest Articles
              </h2>
            </div>

            {/* Mock Article 1 */}
            <article className="border-b border-gray-300 pb-6 mb-6">
              <div className="flex flex-col md:flex-row md:gap-6">
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className="w-full h-48 md:w-28 md:h-30 bg-gray-200 border border-gray-300 rounded-md"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                      CATEGORY
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-3" 
                      style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                    Breaking News: Sample Article Headline Goes Here
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    This is a sample article preview text that would normally contain the first few lines of the article content...
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getCurrentDate()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>5 min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Template 2 - Feed Ad (250px height) */}
            <div className="my-6">
              {renderAdSpace(2, 250, 'border border-gray-300')}
            </div>

            {/* Mock Article 2 */}
            <article className="border-b border-gray-300 pb-6 mb-6">
              <div className="flex flex-col md:flex-row md:gap-6">
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className="w-full h-48 md:w-28 md:h-30 bg-gray-200 border border-gray-300 rounded-md"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                      CATEGORY
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-3" 
                      style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                    Another Important Story with Engaging Title
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Sample article preview content that provides readers with a brief overview of the story...
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getCurrentDate()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>3 min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Mock Article 3 */}
            <article className="border-b border-gray-300 pb-6 mb-6">
              <div className="flex flex-col md:flex-row md:gap-6">
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className="w-full h-48 md:w-28 md:h-30 bg-gray-200 border border-gray-300 rounded-md"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                      CATEGORY
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-3" 
                      style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                    Third Article Headline for Preview Purposes
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    This preview text demonstrates how articles appear in the publication layout...
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getCurrentDate()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>4 min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Template 3 - Within Article Ad (250px height) */}
            <div className="my-6">
              {renderAdSpace(3, 250, 'border border-gray-300')}
            </div>

            {/* More mock articles */}
            <article className="border-b border-gray-300 pb-6 mb-6">
              <div className="flex flex-col md:flex-row md:gap-6">
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <div className="w-full h-48 md:w-28 md:h-30 bg-gray-200 border border-gray-300 rounded-md"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                      CATEGORY
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-3" 
                      style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                    More News Content Continues Here
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Additional article content showing the continuous flow of news...
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getCurrentDate()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>6 min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publisher Info Box */}
            <div className="border-2 border-black p-4">
              <h3 className="text-lg font-bold mb-4 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                About Us
              </h3>
              <div className="space-y-3 text-sm">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded border border-gray-400"></div>
                </div>
                <p className="text-gray-700 italic leading-relaxed">
                  "Your trusted source for news and information."
                </p>
              </div>
            </div>

            {/* Template 4 - Page Wrap 1 Ad (300px height) */}
            {renderAdSpace(4, 300, 'border-2 border-black')}

            {/* Categories Box */}
            <div className="border-2 border-black p-4">
              <h3 className="text-lg font-bold mb-4 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                Categories
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 px-3 border bg-gray-50 border-gray-300">
                  <span className="font-medium">Politics</span>
                  <span className="text-xs">12</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 border bg-gray-50 border-gray-300">
                  <span className="font-medium">Business</span>
                  <span className="text-xs">8</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 border bg-gray-50 border-gray-300">
                  <span className="font-medium">Sports</span>
                  <span className="text-xs">15</span>
                </div>
              </div>
            </div>

            {/* Template 5 - Page Wrap 2 Ad (400px height) */}
            {renderAdSpace(5, 400, 'border-2 border-black')}
          </div>
        </div>

        {/* Bottom Banner Ad - Same as Template 1 */}
        <div className="mt-8">
          {renderAdSpace(1, 120, 'border border-gray-300')}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <span className="font-bold" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  © {new Date().getFullYear()} Your Publication
                </span>
                <span className="text-gray-600">All rights reserved</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Edition: Digital</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}