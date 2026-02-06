'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, FileText, Clock, Globe, Building, Users, Calendar, Eye, Hash, Filter, Rss } from 'lucide-react';
import { usePublisherArticles } from '@/hooks/useNewsSources';
import LikeButton from '@/components/LikeButton';
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const NewsReaderHeader = dynamic(() => import('@/components/news-reader/NewsReaderHeader'), {
  loading: () => <div className="h-16 bg-gray-100 animate-pulse"></div>
});

const MobileBottomNav = dynamic(() => import('@/components/news-reader/MobileBottomNav'), {
  ssr: false,
});

// Helper function to strip HTML tags and clean text
function stripHtml(html) {
  if (!html) return '';
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  let text = temp.textContent || temp.innerText || '';
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Helper function to truncate text to a specific length
function truncateText(text, maxLength = 200) {
  if (!text) return '';
  
  const cleaned = stripHtml(text);
  
  if (cleaned.length <= maxLength) return cleaned;
  
  return cleaned.substring(0, maxLength).trim() + '...';
}

// Helper function to clean and prepare article data
function cleanArticleData(article) {
  if (!article) return null;
  
  console.log('🔍 Cleaning article:', {
    id: article.id,
    title: article.title?.substring(0, 50),
    hasTemplateId: !!article.templateId,
    templateId: article.templateId
  });
  
  return {
    ...article,
    title: stripHtml(article.title),
    summary: article.summary ? truncateText(article.summary, 200) : null,
    content: article.content ? truncateText(article.content, 200) : null,
    category: article.category ? stripHtml(article.category) : null,
    author: article.author ? stripHtml(article.author) : null,
    templateId: article.templateId || 3, // Default to Classic Newspaper if not set
    templateCredit: article.templateCredit || ''
  };
}

// Publisher-specific Ad Component with rotation and base64 support
// Updated PublisherAd Component with click tracking
function PublisherAd({ publisherId, templateId, className = '', height = 120 }) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop');

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
          setAds(result.data);
          setCurrentAdIndex(0);
          setError(null);
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error('❌ Error fetching ads:', error);
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
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [ads.length]);

  // 🆕 Handle ad click
  const handleAdClick = async (ad) => {
    if (!ad.destinationUrl) {
      console.log('⚠️ No destination URL for this ad');
      return;
    }

    try {
      // Track the click
      await fetch('/api/track-ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adId: ad.id,
          publisherId: publisherId
        })
      });

      console.log('✅ Click tracked, opening:', ad.destinationUrl);
      
      // Open destination URL in new tab
      window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ Error tracking click:', error);
      // Still open the URL even if tracking fails
      window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
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
      {currentAd.fileType?.startsWith('video/') ? (
        <video
          src={currentAd.imageSrc}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <img
          src={currentAd.imageSrc}
          alt={currentAd.fileName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/Presspass.png';
          }}
        />
      )}
      
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
      
      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        Ad {ads.length > 1 ? `${currentAdIndex + 1}/${ads.length}` : ''}
      </div>

      {/* 🆕 Clickable indicator */}
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

export default function PublisherArticlesPage() {
  const params = useParams();
  const router = useRouter();
  const { publisher, articles: rawArticles, loading, error, refreshArticles } = usePublisherArticles(params.publisherId);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Debug logging for articles
  useEffect(() => {
    if (rawArticles) {
      console.log('📰 Raw articles received:', {
        count: rawArticles.length,
        articles: rawArticles.map(a => ({
          id: a.id,
          title: a.title?.substring(0, 50),
          hasTemplateId: !!a.templateId,
          templateId: a.templateId,
          isRssFeed: a.isRssFeed,
          isDraft: a.isDraft,
          status: a.status
        }))
      });
    }
  }, [rawArticles]);
  
  // Clean articles data to remove HTML and ensure templateId
  const articles = useMemo(() => {
    if (!rawArticles) {
      console.log('⚠️ No raw articles available');
      return [];
    }
    
    console.log('🔄 Processing articles:', rawArticles.length);
    const cleaned = rawArticles.map(cleanArticleData).filter(article => {
      // Filter out drafts and unpublished articles
      if (article.isDraft || article.status === 'draft') {
        console.log('⏭️ Skipping draft article:', article.id);
        return false;
      }
      return true;
    });
    
    console.log('✅ Cleaned articles:', {
      total: cleaned.length,
      withTemplates: cleaned.filter(a => a.templateId).length,
      rssFeeds: cleaned.filter(a => a.isRssFeed).length
    });
    
    return cleaned;
  }, [rawArticles]);

  // Get all unique categories from articles
  const categories = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    
    const categorySet = new Set();
    articles.forEach(article => {
      if (article.category) {
        categorySet.add(article.category);
      }
    });
    
    return Array.from(categorySet).sort();
  }, [articles]);

  // Filter articles based on selected category
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (selectedCategory === 'all') return articles;
    
    return articles.filter(article => 
      article.category && article.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [articles, selectedCategory]);

  const handleArticleClick = (article) => {
    console.log('🔗 Navigating to article:', {
      id: article.id,
      templateId: article.templateId,
      publisherId: params.publisherId
    });
    router.push(`/news-reader/article/${article.id}?publisherId=${params.publisherId}`);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return 'No date available';
    }
    
    try {
      let date;
      
      if (timestamp && typeof timestamp === 'object') {
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else if (timestamp.seconds && typeof timestamp.seconds === 'number') {
          date = new Date(timestamp.seconds * 1000);
        } else if (timestamp._seconds) {
          date = new Date(timestamp._seconds * 1000);
        } else {
          date = new Date(timestamp);
        }
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Invalid date format';
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, timestamp);
      return 'Date formatting error';
    }
  };

  const formatReadTime = (readTime) => {
    if (!readTime || readTime === 0) return '5 min read';
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

  const cleanPublisher = useMemo(() => {
    if (!publisher) return null;
    
    return {
      ...publisher,
      name: stripHtml(publisher.name),
      description: stripHtml(publisher.description),
      industry: stripHtml(publisher.industry),
      publicationType: stripHtml(publisher.publicationType),
      audienceType: stripHtml(publisher.audienceType)
    };
  }, [publisher]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NewsReaderHeader 
          publisherImage={null}
          publisherName="Loading..."
          isLoading={true}
        />
        
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
        <NewsReaderHeader 
          publisherImage={null}
          publisherName="Publisher Not Found"
          isError={true}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <button
            onClick={handleBackClick}
            className="bg-[#3ba6e7] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#2a7ab8] transition-colors duration-200 mb-8 flex items-center text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to News Sources
          </button>
          
          <div className="border-2 border-red-600 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
              Publisher Not Found
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="mt-4 text-xs text-gray-500">
              Publisher ID: {params.publisherId}
            </div>
            <button 
              onClick={refreshArticles}
              className="mt-4 bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 md:pb-0">
      <div className="fixed top-0 left-0 right-0 z-40">
        <NewsReaderHeader 
          publisherImage={cleanPublisher?.logo || cleanPublisher?.companyLogo}
          publisherName={cleanPublisher?.name || cleanPublisher?.companyName}
          publisherId={params.publisherId}
          publisher={cleanPublisher}
        />
      </div>

      <MobileBottomNav />

      <div className="pt-16">
        {/* Newspaper Header */}
        <div className="border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <button
              onClick={handleBackClick}
              className="bg-[#3ba6e7] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#2a7ab8] transition-colors duration-200 mb-6 flex items-center text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to News Sources
            </button>
            
            {/* Publication Header */}
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                {cleanPublisher?.name?.toUpperCase() || 'NEWS'}
              </h1>
              <div className="border-t border-b border-black py-2 mb-4">
                <p className="text-sm tracking-widest" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  {getCurrentDate()} • {cleanPublisher?.industry || 'News'} • {articles?.length || 0} {(articles?.length || 0) === 1 ? 'Article' : 'Articles'}
                </p>
              </div>
              
              {/* Publisher Details */}
              {cleanPublisher && (
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{cleanPublisher.publicationType || 'Publication'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{cleanPublisher.audienceType || 'General'}</span>
                  </div>
                  {cleanPublisher.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>{cleanPublisher.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template 1 - Headline Banner Ad */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
          <PublisherAd 
            publisherId={params.publisherId} 
            templateId={1} 
            height={120}
            className="border border-gray-300"
          />
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Articles Column */}
            <div className="lg:col-span-3">
              {/* Section Header */}
              <div className="border-b-2 border-black mb-6 pb-2">
                <h2 className="text-3xl font-bold" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  {(!articles || articles.length === 0) ? 'No Articles Yet' : 'Latest Articles'}
                </h2>
              </div>

              {/* Category Filter */}
              {articles && articles.length > 0 && (
                <div className="mb-8 border-t border-b border-gray-300 py-4">
                  <div className="flex items-center space-x-2 mb-3 text-sm">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-wider">Filter by Category:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryFilter('all')}
                      className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      All Articles ({articles.length})
                    </button>

                    {categories.map((category) => {
                      const categoryCount = articles.filter(article => 
                        article.category && article.category.toLowerCase() === category.toLowerCase()
                      ).length;
                      
                      return (
                        <button
                          key={category}
                          onClick={() => handleCategoryFilter(category)}
                          className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                            selectedCategory.toLowerCase() === category.toLowerCase()
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {category} ({categoryCount})
                        </button>
                      );
                    })}
                  </div>

                  {selectedCategory !== 'all' && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span>Showing </span>
                      <span className="font-bold">{selectedCategory}</span>
                      <span> articles ({filteredArticles.length} of {articles.length})</span>
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Articles with ads interspersed */}
              {filteredArticles && filteredArticles.length > 0 ? (
                <>
                  {filteredArticles.map((article, index) => (
                    <div key={article.id}>
                      <article 
                        className="cursor-pointer transition-all duration-200 ease-in-out group md:border-b md:border-gray-300 md:pb-6 md:hover:bg-gray-50 md:p-4 md:-m-4 md:rounded bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-2.5 md:bg-transparent md:border-none md:shadow-none md:mb-0"
                        onClick={() => handleArticleClick(article)}
                      >
                        <div className="flex flex-col md:flex-row md:gap-6">
                          {article.imageUrl && (
                            <div className="flex-shrink-0 mb-4 md:mb-0">
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-48 md:w-28 md:h-30 object-cover border border-gray-300 rounded-md"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {article.category && (
                              <div className="mb-2">
                                <span className="inline-block bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
                                  {article.category}
                                </span>
                              </div>
                            )}
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-3 group-hover:underline flex items-start gap-2" 
                                style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                              {article.isRssFeed && (
                                <Rss className="w-5 h-5 md:w-6 md:h-6 text-orange-500 flex-shrink-0 mt-1" />
                              )}
                              <span className="flex-1">{article.title}</span>
                            </h3>
                            {(article.summary || article.content) && (
                              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                                {article.summary || article.content}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(article.createdAt)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatReadTime(article.readTime)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 pt-3 border-t border-gray-200">
                              <LikeButton
                                articleId={article.id}
                                publisherId={params.publisherId}
                                userId={currentUser?.uid}
                                initialLikeCount={article.likeCount || 0}
                                size="small"
                              />
                            </div>
                          </div>
                        </div>
                      </article>

                      {/* Template 2 - Feed Ad (after 1st article) */}
                      {index === 0 && (
                        <div className="my-6">
                          <PublisherAd 
                            publisherId={params.publisherId} 
                            templateId={2} 
                            height={250}
                            className="border border-gray-300"
                          />
                        </div>
                      )}

                      {/* Template 3 - Within Article Ad (after 3rd article) */}
                      {index === 2 && (
                        <div className="my-6">
                          <PublisherAd 
                            publisherId={params.publisherId} 
                            templateId={3} 
                            height={250}
                            className="border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-16 border border-gray-400">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                    No Articles Published
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-4">
                    This publisher's newsroom is ready for content. Check back later for breaking news and updates.
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-left max-w-md mx-auto">
                      <strong>Debug Info:</strong>
                      <div>Publisher ID: {params.publisherId}</div>
                      <div>Raw Articles: {rawArticles?.length || 0}</div>
                      <div>Filtered Articles: {articles?.length || 0}</div>
                      <div>Selected Category: {selectedCategory}</div>
                    </div>
                  )}
                  <button 
                    onClick={refreshArticles}
                    className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Refresh Articles
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Publisher Info Box */}
              {cleanPublisher && (
                <div className="border-2 border-black p-4">
                  <h3 className="text-lg font-bold mb-4 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                    About {cleanPublisher.name}
                  </h3>
                  <div className="space-y-3 text-sm">
                    {cleanPublisher.logo && (
                      <div className="text-center mb-4">
                        <img
                          src={cleanPublisher.logo}
                          alt={`${cleanPublisher.name} logo`}
                          className="w-16 h-16 mx-auto rounded border border-gray-400"
                        />
                      </div>
                    )}
                    {cleanPublisher.description && (
                      <p className="text-gray-700 italic leading-relaxed">
                        "{cleanPublisher.description}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Template 4 - Page Wrap 1 Ad */}
              <PublisherAd 
                publisherId={params.publisherId} 
                templateId={4} 
                height={300}
                className="border-2 border-black"
              />

              {/* Categories Box */}
              {categories.length > 0 && (
                <div className="border-2 border-black p-4">
                  <h3 className="text-lg font-bold mb-4 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                    Categories
                  </h3>
                  <div className="space-y-2 text-sm">
                    {categories.map((category) => {
                      const categoryCount = articles.filter(article => 
                        article.category && article.category.toLowerCase() === category.toLowerCase()
                      ).length;
                      
                      return (
                        <div 
                          key={category}
                          className={`flex justify-between items-center py-2 px-3 border cursor-pointer transition-colors ${
                            selectedCategory.toLowerCase() === category.toLowerCase()
                              ? 'bg-black text-white border-black'
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                          }`}
                          onClick={() => handleCategoryFilter(category)}
                        >
                          <span className="font-medium">{category}</span>
                          <span className="text-xs">{categoryCount}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Template 5 - Page Wrap 2 Ad */}
              <PublisherAd 
                publisherId={params.publisherId} 
                templateId={5} 
                height={400}
                className="border-2 border-black"
              />
            </div>
          </div>

          {/* Bottom Banner Ad - Same as Template 1 */}
          <div className="mt-8">
            <PublisherAd 
              publisherId={params.publisherId} 
              templateId={1} 
              height={120}
              className="border border-gray-300"
            />
          </div>

          {/* Footer */}
          <div className="border-t-2 border-black mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">
                  <span className="font-bold" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                    © {new Date().getFullYear()} {cleanPublisher?.name || 'News Publisher'}
                  </span>
                  <span className="text-gray-600">All rights reserved</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Edition: Digital</span>
                  <button
                    onClick={handleBackClick}                    
                    className="bg-[#3ba6e7] text-white px-4 py-2 rounded-md shadow-sm hover:bg-[#2a7ab8] transition-colors duration-200 flex items-center text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to News Sources
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}