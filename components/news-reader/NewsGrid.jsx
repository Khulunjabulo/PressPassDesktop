'use client';

import { Heart, X, Upload, ExternalLink, CreditCard } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';
import { Card, CardContent } from '@/components/UI/newscard';
import { FileText, Clock, Globe, Building, Users, ArrowRight, Plus } from 'lucide-react';
import PublisherFavoriteButton from '@/components/PublisherFavoriteButton';

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

// Ad Component
function AdSlot({ 
  adType, 
  width, 
  height, 
  className = "", 
  onAdvertiseClick 
}) {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [adType]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000); // Rotate every 10 seconds
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ads?type=${adType}`);
      const data = await response.json();
      
      if (data.success) {
        const activeAds = data.ads.filter(ad => ad.status === 'active');
        setAds(activeAds);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse rounded-lg ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    );
  }

  if (ads.length === 0) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
        onClick={onAdvertiseClick}
      >
        <Plus className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-sm font-medium text-gray-600">Advertise Here</p>
        <p className="text-xs text-gray-500 mt-1">{width}×{height}</p>
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div 
      className={`relative rounded-lg overflow-hidden border border-gray-200 cursor-pointer group ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={() => handleAdClick(currentAd.url)}
    >
      <img
        src={currentAd.desktopImage || currentAd.mobileImage}
        alt="Advertisement"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4 text-white drop-shadow" />
      </div>
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
          {currentAdIndex + 1} of {ads.length}
        </div>
      )}
    </div>
  );
}

// Ad Creation Modal
function AdCreationModal({ isOpen, onClose, adType, dimensions }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    desktopImage: null,
    mobileImage: null,
    desktopImagePreview: '',
    mobileImagePreview: '',
    contactEmail: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setFormData(prev => ({
        ...prev,
        [`${type}Image`]: base64,
        [`${type}ImagePreview`]: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.url.trim()) newErrors.url = 'URL is required';
    if (!formData.url.startsWith('http')) newErrors.url = 'URL must start with http:// or https://';
    if (!formData.desktopImage) newErrors.desktopImage = 'Desktop image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log('📤 Submitting ad data:', {
        ...formData,
        adType,
        dimensions,
        imageSize: formData.desktopImage ? `${(formData.desktopImage.length / 1024 / 1024).toFixed(2)}MB` : 'No image'
      });
      
      const adData = {
        ...formData,
        adType,
        dimensions,
        status: 'active', // Will be changed to 'pending' when approval system is implemented
        createdAt: new Date().toISOString(),
        approved: true // Will be false when approval system is implemented
      };

      console.log('🚀 Sending ad data to API...');
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adData),
      });

      console.log(`📡 API Response status: ${response.status}`);
      const result = await response.json();
      console.log('📊 API Response:', result);
      
      if (result.success) {
        console.log('✅ Ad created successfully with ID:', result.id);
        alert('Ad created successfully! It will appear on the site shortly.');
        onClose();
        // Refresh the page to show new ad
        console.log('🔄 Reloading page to show new ad...');
        window.location.reload();
      } else {
        console.error('❌ API returned error:', result.error);
        throw new Error(result.error || 'Failed to create ad');
      }
    } catch (error) {
      console.error('🚨 Error creating ad:', error);
      alert('Error creating ad: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Create Advertisement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Ad Details */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 1 of 3: Ad Details ({dimensions.width}×{dimensions.height})
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter ad title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-website.com"
              />
              {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desktop Image * ({dimensions.width}×{dimensions.height}px)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'desktop')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {errors.desktopImage && <p className="text-red-500 text-xs mt-1">{errors.desktopImage}</p>}
              {formData.desktopImagePreview && (
                <div className="mt-2">
                  <img
                    src={formData.desktopImagePreview}
                    alt="Desktop preview"
                    className="max-w-full h-auto border border-gray-300 rounded"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Image (Optional - 320×50px or 300×250px)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files[0], 'mobile')}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {formData.mobileImagePreview && (
                <div className="mt-2">
                  <img
                    src={formData.mobileImagePreview}
                    alt="Mobile preview"
                    className="max-w-full h-auto border border-gray-300 rounded"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 2 of 3: Preview Your Ad
            </div>

            <div className="text-center space-y-4">
              <h3 className="font-medium">{formData.title}</h3>
              
              <div className="flex justify-center">
                <div 
                  className="border border-gray-300 rounded cursor-pointer hover:shadow-md transition-shadow"
                  style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
                  onClick={() => window.open(formData.url, '_blank')}
                >
                  <img
                    src={formData.desktopImagePreview}
                    alt="Ad preview"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Clicking the ad will redirect to: <br />
                <span className="text-blue-600 break-all">{formData.url}</span>
              </p>

              {formData.mobileImagePreview && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Mobile Version:</h4>
                  <div className="flex justify-center">
                    <img
                      src={formData.mobileImagePreview}
                      alt="Mobile ad preview"
                      className="border border-gray-300 rounded max-h-24"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment (Placeholder) */}
        {step === 3 && (
          <div className="p-6 space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Step 3 of 3: Payment Details
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Payment integration will be implemented soon. For now, your ad will be published immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Publish Ad'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewsGrid({ articles }) {
  const unique = dedupeArticles(articles || []);
  const [newsources, setNewsources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [sourcesError, setSourcesError] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState({});
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

  const handleAdvertiseClick = (adType, dimensions) => {
    setSelectedAdType(adType);
    setSelectedDimensions(dimensions);
    setShowAdModal(true);
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
            {!loadingSources && !sourcesError && newsources.length > 0 && (
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
                    
                    {/* Mobile ads between articles (every 5th article, only on small screens) */}
                    {((idx + 1) % 5 === 0) && (
                      <div className="sm:col-span-2 lg:hidden">
                        <AdSlot 
                          adType="mobile"
                          width={320}
                          height={50}
                          className="w-full"
                          onAdvertiseClick={() => handleAdvertiseClick('mobile', { width: 320, height: 50 })}
                        />
                      </div>
                    )}
                  </Fragment>
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

        {/* RIGHT SIDEBAR (desktop ads only) */}
        <aside className="hidden lg:block space-y-6 lg:sticky lg:top-20 h-fit">
          {/* Rectangle Ad (300x250) */}
          <AdSlot 
            adType="sidebar_rectangle"
            width={300}
            height={250}
            onAdvertiseClick={() => handleAdvertiseClick('sidebar_rectangle', { width: 300, height: 250 })}
          />
          
          {/* Skyscraper Ad (300x600) */}
          <AdSlot 
            adType="sidebar_skyscraper"
            width={300}
            height={600}
            onAdvertiseClick={() => handleAdvertiseClick('sidebar_skyscraper', { width: 300, height: 600 })}
          />
          
          {/* Another Rectangle Ad (300x250) */}
          <AdSlot 
            adType="sidebar_rectangle2"
            width={300}
            height={250}
            onAdvertiseClick={() => handleAdvertiseClick('sidebar_rectangle2', { width: 300, height: 250 })}
          />
        </aside>
      </div>

      {/* Ad Creation Modal */}
      <AdCreationModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        adType={selectedAdType}
        dimensions={selectedDimensions}
      />
    </div>
  );
}