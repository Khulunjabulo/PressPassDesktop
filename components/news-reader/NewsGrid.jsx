'use client';

import { Heart } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import AdSlot from '@/components/news-reader/AdsSlot';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';
import { Card, CardContent } from '@/components/UI/newscard';
import { FileText, Clock, Globe, Building, Users, ArrowRight, Plus } from 'lucide-react';
import PublisherFavoriteButton from '@/components/PublisherFavoriteButton'; // Add this import

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

// Helper function to strip HTML tags and clean text
function stripHtml(html) {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Get text content and clean it up
  let text = temp.textContent || temp.innerText || '';
  
  // Remove extra whitespace and normalize
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Helper function to truncate text to a specific length
function truncateText(text, maxLength = 150) {
  if (!text) return '';
  
  const cleaned = stripHtml(text);
  
  if (cleaned.length <= maxLength) return cleaned;
  
  return cleaned.substring(0, maxLength).trim() + '...';
}

export default function NewsGrid({ articles }) {
  const unique = dedupeArticles(articles || []);
  const [newsources, setNewsources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [sourcesError, setSourcesError] = useState(null);
  const router = useRouter();

  // Fetch news sources with their recent articles
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
          // Fetch recent articles for each publisher
          const sourcesWithArticles = await Promise.all(
            (data.newsources || []).map(async (source) => {
              try {
                // Fetch recent articles for this publisher
                const articlesResponse = await fetch(`/api/news-sources/${source.id}/articles`);
                
                if (articlesResponse.ok) {
                  const articlesData = await articlesResponse.json();
                  
                  if (articlesData.success && articlesData.articles && articlesData.articles.length > 0) {
                    // Get the most recent article
                    const recentArticle = articlesData.articles[0];
                    
                    // Clean the title and content
                    const cleanTitle = stripHtml(recentArticle.title);
                    const cleanExcerpt = truncateText(
                      recentArticle.summary || recentArticle.content,
                      150
                    );
                    
                    return {
                      ...source,
                      recentStory: {
                        title: cleanTitle,
                        excerpt: cleanExcerpt || 'No preview available',
                        url: `/news-reader/article/${recentArticle.id}?publisherId=${source.id}`,
                        image: recentArticle.imageUrl,
                        publishedDate: recentArticle.createdAt,
                        category: recentArticle.category
                      },
                      articleCount: articlesData.totalArticles || articlesData.articles.length,
                      hasArticles: articlesData.articles.length > 0
                    };
                  }
                }
                
                // Return source with no recent story if fetch fails or no articles
                return {
                  ...source,
                  recentStory: null,
                  hasArticles: false
                };
              } catch (articleError) {
                console.warn(`Failed to fetch articles for ${source.name}:`, articleError);
                return {
                  ...source,
                  recentStory: null,
                  hasArticles: false
                };
              }
            })
          );
          
          setNewsources(sourcesWithArticles);
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

  const handleReadMoreClick = (e, storyUrl) => {
    e.stopPropagation(); // Prevent card click
    if (storyUrl && storyUrl !== '#') {
      // Check if it's an internal link
      if (storyUrl.startsWith('/')) {
        router.push(storyUrl);
      } else {
        window.open(storyUrl, '_blank');
      }
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 px-4 sm:px-6 pb-10">
        {/* MAIN COLUMN */}
        <div className="space-y-6">
          {/* News Sources Section */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Top Headlines</h2>
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
            {!loadingSources && !sourcesError && newsources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {newsources.map((source, idx) => (
                  <Fragment key={`item-${source.id}`}>
                  <Card 
                    key={source.id} 
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleSourceClick(source)}
                  >
<CardContent className="p-4">
  {/* Publisher Name (centered header) */}
  <div className="text-center mb-3">
    <h1 className="text-base font-bold text-gray-900 truncate">
      {stripHtml(source.name)}
    </h1>
    {/* <p className="text-xs text-gray-500">{source.industry}</p> */}
  </div>

  {/* Logo + Story */}
  <div className="flex items-start space-x-3 mb-3">
    {/* Logo */}
    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
      {source.logo ? (
        <img
          src={source.logo}
          alt={`${source.name} logo`}
          className="w-full h-full rounded-lg object-contain border border-gray-200 bg-white"
        />
      ) : (
        <div className="w-full h-full bg-[#329ae1] rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold text-lg">
            {stripHtml(source.name).charAt(0)}
          </span>
        </div>
      )}
    </div>

    {/* Story Content */}
    <div className="flex-1 min-w-0">
      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
        {source.recentStory?.title ||
          "Ramaphosa pledges to tackle youth unemployment in new economic plan"}
      </h4>
      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-3">
        {source.recentStory?.excerpt ||
          "President announces comprehensive strategy to address rising unemployment rates among South African youth, focusing on skills development and job creation initiatives."}
      </p>
      <button
        onClick={(e) =>
          handleReadMoreClick(e, source.recentStory?.url || "#")
        }
        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        Read more
      </button>
    </div>
  </div>

  {/* Post Info + Favorites aligned in one row */}
  <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
    <div className="flex items-center space-x-4">
      {/* <span>{source.articleCount || 6} posts</span> */}
      <span>Last Post: {source.lastPosted || "1d ago"}</span>
       <a 
  href={source.website || "https://www.dailysun.co.za"} 
  target="_blank" 
  rel="noopener noreferrer" 
  className="hidden sm:inline text-gray-500 hover:underline"
>
  {source.website?.replace(/^https?:\/\//, "") || "www.dailysun.co.za"}
</a>

    </div>
    <PublisherFavoriteButton
      type="button"
      publisher={source}
      size="default"
      showText={false}
      className="hidden sm:inline-flex p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors"
      disabled
    />
  </div>
</CardContent>

                  </Card>
                  {((idx + 1) % 5 === 0) && (
                    <div className="w-full bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center h-12 sm:h-14 text-gray-500 text-xs sm:col-span-2">
                      <span>Advertisement</span>
                    </div>
                  )}
                  </Fragment>
                ))}
              </div>
            ) : null}
            
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
        <aside className="hidden lg:block space-y-6 lg:sticky lg:top-20 h-fit">
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