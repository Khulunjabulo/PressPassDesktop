// app/news-reader/publisher/[publisherId]/page.jsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/newscard';
import { ArrowLeft, FileText, Clock, Globe, Building, Users, Calendar, Eye, Hash } from 'lucide-react';
import { usePublisherArticles } from '@/hooks/useNewsSources';
import BannerAd from '@/components/news-reader/BannerAd';
import AdSlot from '@/components/news-reader/AdsSlot';

export default function PublisherArticlesPage() {
  const params = useParams();
  const router = useRouter();
  const { publisher, articles, loading, error, refreshArticles } = usePublisherArticles(params.publisherId);

  const handleArticleClick = (article) => {
    // Navigate to individual article
    router.push(`/news-reader/article/${article.id}?publisherId=${params.publisherId}`);
  };

  const handleBackClick = () => {
    router.back();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadTime = (readTime) => {
    if (!readTime) return '5 min read';
    return `${readTime} min read`;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 w-24 mb-8"></div>
            <div className="text-center mb-8">
              <div className="h-16 bg-gray-200 w-96 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 w-64 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-300 p-6">
                    <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 w-2/3"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 border border-gray-300"></div>
                <div className="h-32 bg-gray-200 border border-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <button
            onClick={handleBackClick}
            className="text-sm text-gray-600 hover:text-black mb-8 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to News Sources
          </button>
          
          <div className="border-2 border-red-600 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
              Publisher Not Found
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refreshArticles}
              className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Newspaper Header */}
      <div className="border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={handleBackClick}
            className="text-sm text-gray-600 hover:text-black mb-6 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to News Sources
          </button>
          
          {/* Publication Header */}
          <div className="text-center">
            <h1 className="text-6xl font-bold tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
              {publisher?.name?.toUpperCase() || 'NEWS'}
            </h1>
            <div className="border-t border-b border-black py-2 mb-4">
              <p className="text-sm tracking-widest" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                {getCurrentDate()} • {publisher?.industry || 'News'} • {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
              </p>
            </div>
            
            {/* Publisher Details */}
            {publisher && (
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>{publisher.publicationType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{publisher.audienceType}</span>
                </div>
                {publisher.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>{publisher.website.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner Ad */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        <BannerAd className="mb-6" />
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Articles Column */}
          <div className="lg:col-span-3">
            {/* Section Header */}
            <div className="border-b-2 border-black mb-6 pb-2">
              <h2 className="text-3xl font-bold" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                {articles.length === 0 ? 'No Articles Yet' : 'Latest Articles'}
              </h2>
            </div>

            {articles.length === 0 ? (
              <div className="text-center py-16 border border-gray-400">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  No Articles Published
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  This publisher's newsroom is ready for content. Check back later for breaking news and updates.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {articles.map((article, index) => (
                  <article 
                    key={article.id}
                    className="border-b border-gray-300 pb-6 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors p-4 -m-4 rounded"
                    onClick={() => handleArticleClick(article)}
                  >
                    <div className="flex gap-6">
                      {/* Article Image */}
                      {article.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-32 h-24 object-cover border border-gray-400"
                          />
                        </div>
                      )}

                      {/* Article Content */}
                      <div className="flex-1">
                        {/* Category */}
                        {article.category && (
                          <div className="mb-2">
                            <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                              {article.category}
                            </span>
                          </div>
                        )}

                        {/* Headline */}
                        <h3 className="text-2xl font-bold leading-tight mb-3 hover:underline" 
                            style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                          {article.title}
                        </h3>
                        
                        {/* Summary */}
                        {article.summary && (
                          <p className="text-gray-700 mb-3 leading-relaxed">
                            {article.summary}
                          </p>
                        )}

                        {/* Article Meta */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.createdAt)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatReadTime(article.readTime)}</span>
                          </div>
                          
                          {article.views > 0 && (
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{article.views} views</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Hash className="w-3 h-3 text-gray-400" />
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 4).map((tag, tagIndex) => (
                                <span 
                                  key={tagIndex}
                                  className="inline-block bg-gray-200 px-2 py-1 text-xs font-medium uppercase tracking-wider border text-gray-700"
                                >
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 4 && (
                                <span className="text-xs text-gray-500 self-center">
                                  +{article.tags.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publication Info Box */}
            {publisher && (
              <div className="border-2 border-black p-4">
                <h3 className="text-lg font-bold mb-4 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  About {publisher.name}
                </h3>
                
                <div className="space-y-3 text-sm">
                  {publisher.logo && (
                    <div className="text-center mb-4">
                      <img
                        src={publisher.logo}
                        alt={`${publisher.name} logo`}
                        className="w-16 h-16 mx-auto rounded border border-gray-400"
                      />
                    </div>
                  )}
                  
                  {publisher.description && (
                    <p className="text-gray-700 italic leading-relaxed">
                      "{publisher.description}"
                    </p>
                  )}
                  
                  <div className="space-y-2 pt-3 border-t border-gray-300">
                    <div><strong>Industry:</strong> {publisher.industry}</div>
                    <div><strong>Type:</strong> {publisher.publicationType}</div>
                    <div><strong>Audience:</strong> {publisher.audienceType}</div>
                    {publisher.website && (
                      <div className="flex items-center space-x-1">
                        <strong>Web:</strong>
                        <Globe className="w-3 h-3" />
                        <span className="text-xs">{publisher.website.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Square Ad Slot */}
            <AdSlot 
              label="Advertisement"
              height={300}
              width="100%"
              preferredType="square"
              className="border-2 border-gray-400"
            />

            {/* Today's Headlines Box */}
            <div className="border-2 border-black p-4">
              <h3 className="text-lg font-bold mb-4 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                Today's Headlines
              </h3>
              <div className="space-y-3 text-sm">
                <div className="border-b border-gray-300 pb-2">
                  <h4 className="font-bold mb-1">Breaking News Update</h4>
                  <p className="text-gray-600 text-xs">Latest developments in local government proceedings...</p>
                </div>
                <div className="border-b border-gray-300 pb-2">
                  <h4 className="font-bold mb-1">Weather Alert</h4>
                  <p className="text-gray-600 text-xs">Heavy rainfall expected this weekend across the region...</p>
                </div>
                <div className="border-b border-gray-300 pb-2">
                  <h4 className="font-bold mb-1">Sports Results</h4>
                  <p className="text-gray-600 text-xs">Local teams advance to regional championships...</p>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Community Events</h4>
                  <p className="text-gray-600 text-xs">Annual festival preparations underway downtown...</p>
                </div>
              </div>
            </div>

            {/* Vertical Ad Slot */}
            <AdSlot 
              label="Advertisement"
              height={400}
              width="100%"
              preferredType="skyscraper"
              className="border-2 border-gray-400"
            />

            {/* Classified Ads Box */}
            <div className="border-2 border-black p-4">
              <h3 className="text-lg font-bold mb-4 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                Classified Ads
              </h3>
              <div className="space-y-3 text-xs">
                <div className="border border-gray-300 p-2">
                  <div className="font-bold uppercase">For Sale</div>
                  <div>Vintage furniture collection. Call 555-0123</div>
                </div>
                <div className="border border-gray-300 p-2">
                  <div className="font-bold uppercase">Employment</div>
                  <div>Seeking experienced reporters. Apply today!</div>
                </div>
                <div className="border border-gray-300 p-2">
                  <div className="font-bold uppercase">Services</div>
                  <div>Professional printing services. Quality guaranteed.</div>
                </div>
                <div className="text-center pt-2 border-t border-gray-300">
                  <span className="font-bold text-xs">Place your ad: 555-NEWS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Ad */}
        <div className="max-w-7xl mx-auto px-8 py-6">
          <BannerAd className="border-2 border-gray-400" />
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black mt-8">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <span className="font-bold" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  © {new Date().getFullYear()} {publisher?.name || 'News Publisher'}
                </span>
                <span className="text-gray-600">All rights reserved</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Edition: Digital</span>
                <button
                  onClick={handleBackClick}
                  className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  Back to Sources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}