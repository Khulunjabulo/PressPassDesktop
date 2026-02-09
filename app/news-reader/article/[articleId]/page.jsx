// app/news-reader/article/[articleId]/page.jsx - COMPLETE WITH PDF SUPPORT
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Eye, Share2, FileText } from 'lucide-react';
import LikeButton from '@/components/LikeButton';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Import Template Layouts
import {
  FashionMagazineLayout,
  TechBusinessLayout,
  ClassicNewspaperLayout,
  MagazineFeatureLayout,
  MinimalCleanLayout,
  ModernGridLayout,
  EditorialLayout
} from '@/components/TemplateLayouts';

const FavoriteButton = dynamic(() => import('@/components/FavoriteButton'), {
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
});

const NewsReaderHeader = dynamic(() => import('@/components/news-reader/NewsReaderHeader'), {
  loading: () => <div className="h-16 bg-gray-100 animate-pulse"></div>
});

const PdfArticleViewer = dynamic(() => import('@/components/PdfArticleViewer'), {
  loading: () => (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 mb-4"></div>
        <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 w-1/2"></div>
      </div>
    </div>
  )
});

// Publisher Ad Component
function PublisherAd({ publisherId, templateId, className = '', height = 120 }) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 768;
      setDeviceType(isMobile ? 'mobile' : 'desktop');
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      if (!publisherId || !templateId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiUrl = `/api/get-ads?publisherId=${publisherId}&templateId=${templateId}&deviceType=${deviceType}`;
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          setAds(result.data);
          setCurrentAdIndex(0);
        } else {
          setAds([]);
        }
      } catch (error) {
        console.error('Error fetching ads:', error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [publisherId, templateId, deviceType]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [ads.length]);

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

  if (ads.length === 0) {
    return (
      <div 
        className={`w-full flex flex-col items-center justify-center rounded-md ${className}`}
        style={{ height, backgroundColor: '#3ba6e7' }}
      >
        <div className="w-32 h-32 mb-2">
          <img src="/Presspass.png" alt="PressPass Logo" className="w-full h-full object-contain" />
        </div>
        <h3 className="text-yellow-400 font-bold text-sm">Advertise Here</h3>
        <p className="text-white text-xs">Partners@presspass.africa</p>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div 
      className={`w-full rounded-md overflow-hidden shadow-sm relative ${className}`}
      style={{ height }}
    >
      {currentAd.fileType?.startsWith('video/') ? (
        <video src={currentAd.imageSrc} className="w-full h-full object-cover" autoPlay loop muted playsInline />
      ) : (
        <img src={currentAd.imageSrc} alt={currentAd.fileName} className="w-full h-full object-cover" />
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

  // Template mapping
  const templateComponents = {
    1: FashionMagazineLayout,
    2: TechBusinessLayout,
    3: ClassicNewspaperLayout,
    4: MagazineFeatureLayout,
    5: MinimalCleanLayout,
    6: ModernGridLayout,
    7: EditorialLayout
  };

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
      ('🔍 Fetching article:', params.articleId, 'from publisher:', publisherId);
      
      const response = await fetch(`/api/news-sources/${publisherId}/articles`);
      const data = await response.json();

      if (data.success) {
        const foundArticle = data.articles.find(a => a.id === params.articleId);
        if (foundArticle) {
          ('✅ Article found:', {
            id: foundArticle.id,
            title: foundArticle.title,
            isPdfArticle: foundArticle.isPdfArticle,
            hasPdfUrl: !!foundArticle.pdfUrl,
            pdfFileName: foundArticle.pdfFileName,
            style: foundArticle.style,
            hasStyle: !!foundArticle.style
          });
          
          setArticle(foundArticle);
          setPublisher(data.publisher);
        } else {
          console.error('❌ Article not found in list');
          setError('Article not found');
        }
      } else {
        console.error('❌ API error:', data.error);
        setError(data.error || 'Failed to fetch article');
      }
    } catch (err) {
      console.error('💥 Error fetching article:', err);
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
    if (!timestamp) {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
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
        date = new Date();
      }
      
      if (isNaN(date.getTime())) {
        date = new Date();
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
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

  // 🆕 CHECK IF THIS IS A PDF ARTICLE FIRST
  ('🔍 Rendering article:', {
    isPdfArticle: article.isPdfArticle,
    hasPdfUrl: !!article.pdfUrl,
    pdfFileName: article.pdfFileName
  });

  // Map style names to template IDs
  const styleToTemplateId = {
    'fashion': 1,
    'tech': 2,
    'classic': 3,
    'magazine': 4,
    'minimal': 5,
    'modern': 6,
    'editorial': 7,
    'pdf': 3 // Default for PDFs
  };

  const templateId = article.style ? styleToTemplateId[article.style] || 3 : 3;
  const TemplateComponent = templateComponents[templateId] || ClassicNewspaperLayout;

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
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackClick}
              className="text-sm text-gray-600 hover:text-black flex items-center bg-white px-4 py-2 rounded-md shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to {publisher?.name || 'Articles'}
            </button>
            
            <div className="flex items-center space-x-3">
              <button 
                className="p-2 text-gray-600 hover:text-black transition-colors bg-white rounded-md shadow-sm"
                title="Share article"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    if (navigator.share) {
                      navigator.share({
                        title: article.title,
                        url: window.location.href
                      }).catch(err => ('Share failed:', err));
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                        .then(() => alert('Link copied to clipboard!'))
                        .catch(err => ('Copy failed:', err));
                    }
                  }
                }}
              >
                <Share2 className="w-5 h-5" />
              </button>

              <FavoriteButton
                item={article}
                size="default"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 mb-6">
          <PublisherAd 
            publisherId={publisherId} 
            templateId={1} 
            height={120}
            className="border border-gray-300"
          />
        </div>

        {/* 🆕 CRITICAL: CHECK FOR PDF FIRST, THEN RENDER APPROPRIATE COMPONENT */}
        {article.isPdfArticle && article.pdfUrl ? (
          <>
            <PdfArticleViewer article={article} />
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="max-w-6xl mx-auto px-8 mb-4">
                <div className="bg-green-50 border border-green-300 p-4 rounded text-xs">
                  <strong>✅ PDF Article Detected:</strong>
                  <div>isPdfArticle: {String(article.isPdfArticle)}</div>
                  <div>pdfUrl exists: {String(!!article.pdfUrl)}</div>
                  <div>pdfUrl length: {article.pdfUrl?.length || 0} chars</div>
                  <div>pdfFileName: {article.pdfFileName}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <TemplateComponent article={article} isPreview={false} />
            
            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="max-w-6xl mx-auto px-8 mb-4">
                <div className="bg-blue-50 border border-blue-300 p-4 rounded text-xs">
                  <strong>📰 Regular Article Rendered:</strong>
                  <div>isPdfArticle: {String(article.isPdfArticle)}</div>
                  <div>Template: {article.style || 'default'}</div>
                  <div>Template ID: {templateId}</div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="border-t-2 border-gray-300 pt-6">
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
                {article.isPdfArticle ? 'Download and share this PDF' : 'Share this article with others'}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <PublisherAd 
              publisherId={publisherId} 
              templateId={1} 
              height={120}
              className="border border-gray-300"
            />
          </div>

          <div className="mt-12 pt-6 border-t-4 border-black">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-bold">
                  Published: {formatDate(article.createdAt)}
                </p>
                {article.updatedAt && article.updatedAt !== article.createdAt && (
                  <p className="text-gray-600 mt-1">
                    Last updated: {formatDate(article.updatedAt)}
                  </p>
                )}
                {article.isPdfArticle && article.pdfFileName && (
                  <p className="text-blue-600 mt-1 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    PDF Document: {article.pdfFileName}
                  </p>
                )}
                {article.templateCredit && !article.isPdfArticle && (
                  <p className="text-gray-500 mt-1 italic">
                    Design Credit: {article.templateCredit}
                  </p>
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
  );
}