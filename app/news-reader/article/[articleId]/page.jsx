'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Eye, Hash, User, Globe, Share2, Bookmark } from 'lucide-react';
import LikeButton from '@/components/LikeButton'
import dynamic from 'next/dynamic';

// Lazy load components for better performance
const FavoriteButton = dynamic(() => import('@/components/FavoriteButton'), {
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
});

const NewsReaderHeader = dynamic(() => import('@/components/news-reader/NewsReaderHeader'), {
  loading: () => <div className="h-16 bg-gray-100 animate-pulse"></div>
});

// Publisher-specific Ad Component with rotation and base64 support
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
      console.log('📱 Device detected:', isMobile ? 'mobile' : 'desktop', 'width:', window.innerWidth);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Fetch ads for this publisher and template
  useEffect(() => {
    const fetchAds = async () => {
      if (!publisherId || !templateId) {
        console.warn('⚠️ Missing required params:', { publisherId, templateId });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = `/api/get-ads?publisherId=${publisherId}&templateId=${templateId}&deviceType=${deviceType}`;
        console.log('🔍 Fetching ads from:', apiUrl);
        
        const response = await fetch(apiUrl);
        const result = await response.json();

        console.log('📦 Ad fetch result:', {
          success: result.success,
          count: result.data?.length || 0,
          data: result.data
        });

        if (result.success && result.data && result.data.length > 0) {
          console.log('✅ Ads loaded:', result.data.length, 'ads');
          setAds(result.data);
          setCurrentAdIndex(0);
          setError(null);
        } else {
          console.log('ℹ️ No ads found for:', { publisherId, templateId, deviceType });
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

  // Rotate ads every 10 seconds if multiple ads exist
  useEffect(() => {
    if (ads.length <= 1) return;

    console.log('🔄 Starting ad rotation for', ads.length, 'ads');
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % ads.length;
        console.log('🔄 Rotating ad:', prevIndex, '->', nextIndex);
        return nextIndex;
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  // Loading state
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

  // Error state
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

  // No ads - show placeholder
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
        
        {/* Debug info - remove in production */}
        <div className="mt-2 text-xs text-white opacity-50">
          Template {templateId} | {deviceType}
        </div>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];

  // Display ad
  return (
    <div 
      className={`w-full rounded-md overflow-hidden shadow-sm relative ${className}`}
      style={{ height }}
    >
      {/* Display image or video */}
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
            console.error('❌ Image load error:', currentAd.fileName);
            e.target.src = '/Presspass.png'; // Fallback image
          }}
        />
      )}
      
      {/* Ad indicator dots if multiple ads */}
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

      {/* Debug info - remove in production */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        T{templateId} | {deviceType}
      </div>
    </div>
  );
}

export default function ArticleViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const publisherId = searchParams.get('publisherId');
  
  const [article, setArticle] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    fetchArticleAndPublisher();
  }, [params.articleId, publisherId]);

  const fetchArticleAndPublisher = async () => {
    if (!params.articleId || !publisherId) {
      setError('Missing article ID or publisher ID');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching article:', params.articleId, 'from publisher:', publisherId);
      
      const response = await fetch(`/api/news-sources/${publisherId}/articles`);
      const data = await response.json();

      if (data.success) {
        const foundArticle = data.articles.find(a => a.id === params.articleId);
        if (foundArticle) {
          setArticle(foundArticle);
          setPublisher(data.publisher);
        } else {
          setError('Article not found');
        }
      } else {
        setError(data.error || 'Failed to fetch article');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (publisherId) {
      router.push(`/news-reader/publisher/${publisherId}`);
    } else {
      router.back();
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date available';
    
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

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadTime = (readTime) => {
    if (!readTime || readTime === 0) return '5 min read';
    return `${readTime} min read`;
  };

  const processArticleContent = (content) => {
    if (!content) {
      return '<p class="newspaper-paragraph">Content not available for this article.</p>';
    }
    
    let processedContent = content;
    
    if (!content.includes('<p>') && !content.includes('<div>')) {
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
      if (paragraphs.length > 1) {
        processedContent = paragraphs.map(paragraph => 
          `<p class="newspaper-paragraph">${paragraph.trim().replace(/\n/g, ' ')}</p>`
        ).join('');
      } else {
        processedContent = `<p class="newspaper-paragraph">${content.replace(/\n/g, ' ').trim()}</p>`;
      }
    }
    
    return processedContent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 w-24 mb-8"></div>
            <div className="h-12 bg-gray-200 w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 w-1/2 mb-8"></div>
            <div className="h-6 bg-gray-200 w-full mb-3"></div>
            <div className="h-6 bg-gray-200 w-full mb-3"></div>
            <div className="h-6 bg-gray-200 w-2/3 mb-3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <button
            onClick={handleBackClick}
            className="text-sm text-gray-600 hover:text-black mb-8 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <div className="border border-gray-300 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'This article may have been removed or moved.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const processedContent = processArticleContent(article.content);
  const mainImage = article.imageUrl || article.featuredImageUrl || article.image;

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 z-40">
        <NewsReaderHeader
          publisherImage={publisher?.logo || publisher?.companyLogo}
          publisherName={publisher?.name || publisher?.companyName}
          publisherId={publisherId}
          publisher={publisher}
        />
      </div>

      <div className="pt-16">
        <style jsx global>{`
          .newspaper-container {
            font-family: 'Times New Roman', 'Times', serif;
            line-height: 1.6;
            color: #1a1a1a;
          }
          
          .newspaper-header {
            border-bottom: 4px solid #000;
            margin-bottom: 2rem;
          }
          
          .newspaper-title {
            font-family: 'Times New Roman', 'Times', serif;
            font-weight: bold;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
          
          .newspaper-date-line {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 0.5rem 0;
            margin: 1rem 0;
            text-align: center;
          }
          
          .newspaper-content {
            text-align: justify;
            hyphens: auto;
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
          }
          
          .newspaper-paragraph {
            margin-bottom: 1.2rem;
            text-indent: 1.5em;
            line-height: 1.7;
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
            max-width: 100%;
          }
          
          .newspaper-paragraph:first-of-type {
            text-indent: 0;
            font-weight: 500;
            font-size: 1.1em;
            margin-bottom: 1.5rem;
          }
          
          @media (max-width: 480px) {
            .newspaper-title {
              font-size: 1.75rem !important;
              letter-spacing: 0.05em;
            }

            .article-headline {
              font-size: 2rem !important;
            }
            
            .newspaper-paragraph {
              font-size: 1rem;
              line-height: 1.65;
            }
          }
        `}</style>

        <div className="newspaper-container">
          {/* Newspaper Header */}
          <div className="newspaper-header">
            <div className="max-w-6xl mx-auto px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBackClick}
                  className="text-sm text-gray-600 hover:text-black flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to {publisher?.name || 'Articles'}
                </button>
                
                <div className="flex items-center space-x-3">
                  <button 
                    className="p-2 text-gray-600 hover:text-black transition-colors"
                    title="Share article"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        if (navigator.share) {
                          navigator.share({
                            title: article.title,
                            url: window.location.href
                          }).catch(err => console.log('Share failed:', err));
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                            .then(() => alert('Link copied to clipboard!'))
                            .catch(err => console.log('Copy failed:', err));
                        }
                      }
                    }}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Publication Header */}
              <div className="text-center mb-6">
                <h1 className="newspaper-title text-3xl sm:text-5xl md:text-6xl mb-2">
                  {publisher?.name?.toUpperCase() || 'DAILY NEWS'}
                </h1>
                <div className="newspaper-date-line">
                  <p className="text-sm font-medium">
                    {getCurrentDate()} • {publisher?.industry || 'News'} • TODAY'S EDITION
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Template 1 - Top Banner Ad */}
          <div className="max-w-6xl mx-auto px-8 mb-6">
            <PublisherAd 
              publisherId={publisherId} 
              templateId={1} 
              height={120}
              className="border border-gray-300"
            />
          </div>

          {/* Article Content */}
          <div className="max-w-6xl mx-auto px-8 py-6">
            {/* Article Header */}
            <div className="mb-8">
              {article.category && (
                <div className="mb-4">
                  <span className="inline-block bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest">
                    {article.category}
                  </span>
                </div>
              )}

              <h1 className="article-headline text-3xl sm:text-4xl md:text-5xl leading-tight mb-6 pb-4 border-b-4 border-black" style={{fontFamily: 'Times, "Times New Roman", serif', fontWeight: 'bold'}}>
                {article.title}
              </h1>
              
              {article.subtitle && (
                <h2 className="text-md sm:text-xl italic text-gray-700 mb-4 font-medium">
                  {article.subtitle}
                </h2>
              )}
              
              <div className="flex items-center justify-between mb-6 text-sm border-b-2 border-gray-400 pb-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="font-bold">
                      By {article.author || publisher?.name || 'Staff Writer'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatReadTime(article.readTime)}</span>
                  </div>
                </div>
                
                {article.views && article.views > 0 && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                )}
              </div>
            </div>

            {/* Article Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Article Content */}
              <div className="lg:col-span-3">
                {/* Main Image */}
                {mainImage && (
                  <div className="mb-6">
                    <img
                      src={mainImage}
                      alt={article.title}
                      className="w-full h-auto object-cover border-2 border-black"
                      loading="eager"
                    />
                    {article.imageCaption && (
                      <div className="mt-2 text-sm italic text-gray-600 border-l-4 border-black pl-3">
                        {article.imageCaption}
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                {article.summary && (
                  <div className="mb-6 p-4 border-l-4 border-black bg-gray-50">
                    <p className="text-lg font-medium leading-relaxed italic">
                      {article.summary}
                    </p>
                  </div>
                )}

                {/* Template 2 - After Introduction */}
                <div className="my-6">
                  <PublisherAd 
                    publisherId={publisherId} 
                    templateId={2} 
                    height={250}
                    className="border border-gray-300"
                  />
                </div>

                {/* Article Body */}
                <div className="newspaper-content">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: processedContent
                    }}
                  />
                </div>

                {/* Template 3 - Within Article (Middle) */}
                <div className="my-8">
                  <PublisherAd 
                    publisherId={publisherId} 
                    templateId={3} 
                    height={250}
                    className="border border-gray-300"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Template 4 - Sidebar Top */}
                <PublisherAd 
                  publisherId={publisherId} 
                  templateId={4} 
                  height={300}
                  className="border-2 border-black"
                />

                {/* Publisher Info */}
                {publisher && (
                  <div className="border-2 border-black p-4">
                    <h3 className="text-lg font-bold mb-4 border-b border-black pb-2">
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
                        <p className="text-gray-700 text-xs leading-relaxed">
                          {publisher.description}
                        </p>
                      )}
                      {publisher.website && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Globe className="w-4 h-4" />
                          <a href={publisher.website} target="_blank" rel="noopener noreferrer" 
                             className="text-xs hover:text-black transition-colors break-all">
                            {publisher.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Template 5 - Sidebar Bottom */}
                <PublisherAd 
                  publisherId={publisherId} 
                  templateId={5} 
                  height={400}
                  className="border-2 border-black"
                />

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="border-2 border-black p-4">
                    <h3 className="text-lg font-bold mb-4 border-b border-black pb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Engagement Section */}
            <div className="mt-8 pt-6 border-t-2 border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <LikeButton
                    articleId={article.id}
                    publisherId={publisherId}
                    userId={currentUser?.uid}
                    initialLikeCount={article.likeCount || 0}
                    size="large"
                  />
                  
                  {article.views && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Eye className="w-5 h-5" />
                      <span className="text-lg">{article.views.toLocaleString()} views</span>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  Share this article with others
                </div>
              </div>
            </div>

            {/* Bottom Banner Ad - Template 1 */}
            <div className="mt-8">
              <PublisherAd 
                publisherId={publisherId} 
                templateId={1} 
                height={120}
                className="border border-gray-300"
              />
            </div>

            {/* Article Footer */}
            <div className="mt-12 pt-6 border-t-4 border-black">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold">Published: {formatDate(article.createdAt)}</p>
                  {article.updatedAt && article.updatedAt !== article.createdAt && (
                    <p className="text-gray-600 mt-1">Last updated: {formatDate(article.updatedAt)}</p>
                  )}
                </div>
                
                <button
                  onClick={handleBackClick}
                  className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Back to {publisher?.name || 'Articles'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}