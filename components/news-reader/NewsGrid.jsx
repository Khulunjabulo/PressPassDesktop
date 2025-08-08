'use client';

import { useState, useEffect } from 'react';
import { timeAgo } from '@/lib/time';
import NewsCard from '@/components/news-reader/NewsCard';
import AdSlot from '@/components/news-reader/AdsSlot';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';
import { Card, CardContent } from '@/components/ui/newscard';
import { FileText, Clock, Globe, Building, Users } from 'lucide-react';

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

  // Fetch news sources
  useEffect(() => {
    const fetchNewsSources = async () => {
      try {
        const response = await fetch('/api/news-sources');
        const data = await response.json();
        if (data.success) {
          setNewsources(data.newsources);
        }
      } catch (error) {
        console.error('Error fetching news sources:', error);
      } finally {
        setLoadingSources(false);
      }
    };

    fetchNewsSources();
  }, []);

  const handleSourceClick = (source) => {
    // Navigate to specific publisher's articles or profile
    console.log('Clicked on source:', source.name);
    // You can implement navigation logic here
    // e.g., router.push(`/news-reader/source/${source.id}`);
  };

  return (
    <div className="relative">
      {/* Bottom-sheet overlay */}
      <RecommendedOverlayBottom articles={unique} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-6 pb-10">
        {/* MAIN COLUMN */}
        <div className="space-y-6">
          
          {/* 3 columns on large screens */}
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

          {/* News Sources Section */}
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">News Sources</h2>
            
            {loadingSources ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
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
            ) : newsources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsources.map((source) => (
                  <Card 
                    key={source.id} 
                    className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border-0 shadow-sm"
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
                          {/* Source Name */}
                          <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                            {source.name}
                          </h3>
                          
                          {/* Industry Badge */}
                          <div className="mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {source.industry}
                            </span>
                          </div>
                          
                          {/* Article Count */}
                          <div className="flex items-center space-x-1 mb-1">
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-medium text-gray-700">
                              {source.articleCount} {source.articleCount === 1 ? 'post' : 'posts'}
                            </span>
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
                          
                          {/* Last Posted */}
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {source.lastPosted === '--' ? '--' : `Last: ${source.lastPosted}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="mx-auto h-8 w-8 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No news sources yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Publishers will appear here once they register and start publishing content.
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