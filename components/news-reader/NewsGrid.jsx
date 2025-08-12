'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { timeAgo } from '@/lib/time';
import NewsCard from '@/components/news-reader/NewsCard';
import AdSlot from '@/components/news-reader/AdsSlot';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';
import { Card, CardContent } from '@/components/ui/Cards';
import { FileText, Clock, Globe, Building, Users, ArrowRight, Plus } from 'lucide-react';

function dedupeArticles(articles = []) {
  const seen = new Set();
  const out = [];
  for (const a of articles) {
    const key = a.link || a.title;
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

export default function NewsGrid({ articles }) {
  const unique = dedupeArticles(articles || []);
  const [newsources, setNewsources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [sourcesError, setSourcesError] = useState(null);
  const router = useRouter();

  // Fetch news sources
  useEffect(() => {
    const fetchNewsSources = async () => {
      try {
        setLoadingSources(true);
        setSourcesError(null);
        
        const response = await fetch('/api/news-sources');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setNewsources(data.newsources || []);
        } else {
          throw new Error(data.error || 'Failed to fetch news sources');
        }
      } catch (error) {
        console.error('Error fetching news sources:', error);
        setSourcesError(error.message);
        setNewsources([]); // Set empty array on error
      } finally {
        setLoadingSources(false);
      }
    };

    fetchNewsSources();
  }, []);

  const handleSourceClick = (source) => {
    // Navigate to specific publisher's articles page
    router.push(`/news-reader/publisher/${source.id}`);
  };

  const retryFetchSources = () => {
    setSourcesError(null);
    setLoadingSources(true);
    // Re-run the effect by changing a dependency
    window.location.reload(); // Simple reload for now
  };

  return (
    <div className="relative">
      {/* Bottom-sheet overlay */}
      <RecommendedOverlayBottom articles={unique} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-6 pb-10">
        {/* MAIN COLUMN */}
        <div className="space-y-6">
          
          {/* 3 columns on large screens */}
          {unique.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unique.map((article, index) => {
                const isUploadedStory = article.source_id === 'presspass';
                
                return (
                <NewsCard
                  key={index}
                  imageUrl={article.image_url}
                  publicationName={(article.source_id || 'News').slice(0, 10)}
                  logoBgColor={isUploadedStory ? "#1f2937" : "#008000"}
                  author={
                    Array.isArray(article.creator)
                      ? article.creator[0]
                      : article.creator || 'Unknown'
                  }
                  time={timeAgo(article.pubDate || article.publishedAt || article.createdAt)}
                  isUploadedStory={isUploadedStory}
                  pdfUrl={article.pdfUrl}
                  link={article.link}
                  summary={
                    article.description ||
                    article.content ||
                    'No summary available.'
                  }
                />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No articles found for this category.</p>
            </div>
          )}

          {/* News Sources Section */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">News Sources</h2>
              {!loadingSources && !sourcesError && (
                <span className="text-sm text-gray-500">
                  {newsources.length} publisher{newsources.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Error State */}
            {sourcesError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 font-medium">Failed to load news sources</p>
                    <p className="text-red-600 text-sm mt-1">{sourcesError}</p>
                  </div>
                  <button 
                    onClick={retryFetchSources}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {loadingSources && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* News Sources Grid */}
            {!loadingSources && !sourcesError && newsources.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsources.map((source) => (
                  <Card 
                    key={source.id} 
                    className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer border-0 shadow-sm bg-white"
                    onClick={() => handleSourceClick(source)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          {source.logo ? (
                            <img
                              src={source.logo}
                              alt={`${source.name} logo`}
                              className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">
                                {source.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Source Name with Arrow */}
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {source.name}
                            </h3>
                            <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          </div>
                          
                          {/* Industry Badge */}
                          <div className="mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {source.industry}
                            </span>
                          </div>
                          
                          {/* Article Count with New Badge */}
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="flex items-center space-x-1">
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span className="text-xs font-medium text-gray-700">
                                {source.articleCount} {source.articleCount === 1 ? 'post' : 'posts'}
                              </span>
                            </div>
                            {!source.hasArticles && (
                              <div className="flex items-center space-x-1">
                                <Plus className="w-2 h-2 text-orange-500" />
                                <span className="text-xs text-orange-600 font-medium">New</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Publication Type */}
                          <div className="flex items-center space-x-1 mb-1">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600 capitalize truncate">
                              {source.publicationType}
                            </span>
                          </div>
                          
                          {/* Website */}
                          {source.website && (
                            <div className="flex items-center space-x-1 mb-1">
                              <Globe className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600 truncate">
                                {source.website.replace(/^https?:\/\//, '')}
                              </span>
                            </div>
                          )}
                          
                          {/* Last Posted with Status Color */}
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className={`text-xs ${source.hasArticles ? 'text-gray-500' : 'text-green-600 font-medium'}`}>
                              {source.lastPosted === '--' ? 'Ready' : (source.hasArticles ? `Last: ${source.lastPosted}` : source.lastPosted)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Folder</span>
                          <div className="flex items-center space-x-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${source.hasArticles ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                            <span className="text-xs text-gray-500">
                              {source.hasArticles ? 'Active' : 'Ready'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!loadingSources && !sourcesError && newsources.length === 0 && (
              <div className="text-center py-8">
                <Building className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No publishers yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Publisher folders will automatically appear here when they register.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT SIDEBAR (ads) */}
        <aside className="space-y-6 lg:sticky lg:top-20 h-fit">
          {/* Rectangle Ad (300x250) */}
          <AdSlot 
            label="Rectangle Ad (300x250)" 
            height={250} 
            width={300}
            preferredType="rectangles"
            className="max-w-[300px]"
          />
          
          {/* Skyscraper Ad (300x600) */}
          <AdSlot 
            label="Skyscraper Ad (300x600)" 
            height={600} 
            width={300}
            preferredType="skyscrapers"
            className="max-w-[300px]"
          />
          
          {/* Another Rectangle Ad (300x250) */}
          <AdSlot 
            label="Rectangle Ad (300x250)" 
            height={250} 
            width={300}
            preferredType="rectangles"
            className="max-w-[300px]"
          />
        </aside>
      </div>
    </div>
  );
}