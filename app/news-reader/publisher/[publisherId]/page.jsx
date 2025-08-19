'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/newscard';
import { ArrowLeft, FileText, Clock, Globe, Building, Users, Calendar, Eye, Hash, Filter } from 'lucide-react';
import { usePublisherArticles } from '@/hooks/useNewsSources';
import BannerAd from '@/components/news-reader/BannerAd';
import AdSlot from '@/components/news-reader/AdsSlot';
import NewsReaderHeader from '@/components/news-reader/NewsReaderHeader'; 

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
function truncateText(text, maxLength = 200) {
  if (!text) return '';
  
  const cleaned = stripHtml(text);
  
  if (cleaned.length <= maxLength) return cleaned;
  
  return cleaned.substring(0, maxLength).trim() + '...';
}

// Helper function to clean and prepare article data
function cleanArticleData(article) {
  if (!article) return null;
  
  return {
    ...article,
    title: stripHtml(article.title),
    summary: article.summary ? truncateText(article.summary, 200) : null,
    content: article.content ? truncateText(article.content, 200) : null,
    category: article.category ? stripHtml(article.category) : null,
    author: article.author ? stripHtml(article.author) : null
  };
}

export default function PublisherArticlesPage() {
  const params = useParams();
  const router = useRouter();
  const { publisher, articles: rawArticles, loading, error, refreshArticles } = usePublisherArticles(params.publisherId);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Clean articles data to remove HTML
  const articles = useMemo(() => {
    if (!rawArticles) return [];
    return rawArticles.map(cleanArticleData);
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
    // Navigate to individual article
    router.push(`/news-reader/article/${article.id}?publisherId=${params.publisherId}`);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  // Improved date formatting with better error handling
  const formatDate = (timestamp) => {
    if (!timestamp) {
      console.log('No timestamp provided');
      return 'No date available';
    }
    
    try {
      let date;
      
      // Handle different timestamp formats
      if (timestamp && typeof timestamp === 'object') {
        // Handle Firestore Timestamp objects
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else if (timestamp.seconds && typeof timestamp.seconds === 'number') {
          // Handle plain Firestore timestamp objects
          date = new Date(timestamp.seconds * 1000);
        } else if (timestamp._seconds) {
          // Handle some Firestore timestamp variations
          date = new Date(timestamp._seconds * 1000);
        } else {
          // Try to create date from object
          date = new Date(timestamp);
        }
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        // Handle string or number timestamps
        date = new Date(timestamp);
      } else {
        console.log('Unknown timestamp format:', typeof timestamp, timestamp);
        return 'Invalid date format';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date created from timestamp:', timestamp);
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

  // Clean publisher data as well
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

  // Debug logging - Enhanced to show publisher data
  console.log('Publisher Page Debug:', {
    publisherId: params.publisherId,
    hasPublisher: !!cleanPublisher,
    publisherName: cleanPublisher?.name,
    publisherLogo: cleanPublisher?.logo,
    publisherCompanyLogo: cleanPublisher?.companyLogo,
    articlesCount: articles?.length || 0,
    filteredArticlesCount: filteredArticles?.length || 0,
    categoriesCount: categories?.length || 0,
    categories,
    selectedCategory,
    loading,
    error,
    fullPublisherData: cleanPublisher // Log full publisher object
  });

  // Additional debug for header props
  console.log('🔍 Header Props Debug:', {
    publisherImage: cleanPublisher?.logo || cleanPublisher?.companyLogo,
    publisherName: cleanPublisher?.name || cleanPublisher?.companyName,
    publisherExists: !!cleanPublisher,
    logoField: cleanPublisher?.logo,
    companyLogoField: cleanPublisher?.companyLogo,
    nameField: cleanPublisher?.name,
    companyNameField: cleanPublisher?.companyName
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Show header even during loading, but with loading state */}
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
        {/* Show header even during error state */}
        <NewsReaderHeader 
          publisherImage={null}
          publisherName="Publisher Not Found"
          isError={true}
        />
        
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
    <div className="min-h-screen bg-white">
      {/* Pass publisher data to header component */}
      <NewsReaderHeader 
        publisherImage={cleanPublisher?.logo || cleanPublisher?.companyLogo}
        publisherName={cleanPublisher?.name || cleanPublisher?.companyName}
        publisherId={params.publisherId}
        publisher={cleanPublisher} // Pass full publisher object if needed
      />

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
              {cleanPublisher?.name?.toUpperCase() || 'NEWS'}
            </h1>
            <div className="border-t border-b border-black py-2 mb-4">
              <p className="text-sm tracking-widest" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                {getCurrentDate()} • {cleanPublisher?.industry || 'News'} • {articles?.length || 0} {(articles?.length || 0) === 1 ? 'Article' : 'Articles'}
              </p>
            </div>
            
            {/* Publisher Details */}
            {cleanPublisher && (
              <div className="flex items-center justify-center space-x-8 text-sm">
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

      {/* Banner Ad */}
      <div className="max-w-7xl mx-auto px-8 py-4">
        <img 
          src="/press-bannerAd.png" 
          alt="Mobile preview" 
          className="mb-6" 
        />
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-8 py-4">
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
                <div className="flex items-center space-x-2 mb-3">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Filter by Category:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {/* All Articles Filter */}
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

                  {/* Dynamic Category Filters */}
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

                  {/* Uncategorized Filter (if there are articles without categories) */}
                  {articles.some(article => !article.category) && (
                    <button
                      onClick={() => handleCategoryFilter('uncategorized')}
                      className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${
                        selectedCategory === 'uncategorized'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      Uncategorized ({articles.filter(article => !article.category).length})
                    </button>
                  )}
                </div>

                {/* Active Filter Indicator */}
                {selectedCategory !== 'all' && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span>Showing </span>
                    <span className="font-bold">
                      {selectedCategory === 'uncategorized' ? 'Uncategorized' : selectedCategory}
                    </span>
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

            {(!filteredArticles || filteredArticles.length === 0) ? (
              <div className="text-center py-16 border border-gray-400">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  {selectedCategory === 'all' ? 'No Articles Published' : `No ${selectedCategory} Articles`}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-4">
                  {selectedCategory === 'all' 
                    ? "This publisher's newsroom is ready for content. Check back later for breaking news and updates."
                    : `No articles found in the ${selectedCategory} category. Try selecting a different category or view all articles.`
                  }
                </p>
                {selectedCategory !== 'all' ? (
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors mr-4"
                  >
                    View All Articles
                  </button>
                ) : (
                  <button 
                    onClick={refreshArticles}
                    className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Refresh Articles
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {filteredArticles.map((article, index) => {
                  // Debug log for each article
                  console.log(`Article ${index + 1}:`, {
                    id: article.id,
                    title: article.title,
                    category: article.category,
                    hasContent: !!article.content,
                    createdAt: article.createdAt,
                    createdAtType: typeof article.createdAt
                  });

                  return (
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
                              onError={(e) => {
                                console.log('Article image failed to load:', article.imageUrl);
                                e.target.style.display = 'none';
                              }}
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
                          
                          {/* Summary or Content Preview */}
                          {(article.summary || article.content) && (
                            <p className="text-gray-700 mb-3 leading-relaxed">
                              {article.summary || article.content || 'No preview available'}
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
                            
                            {article.views && article.views > 0 && (
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{article.views} views</span>
                              </div>
                            )}

                            {article.author && (
                              <div className="flex items-center space-x-1">
                                <span>By {article.author}</span>
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
                                    {stripHtml(tag)}
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publication Info Box */}
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
                        onError={(e) => {
                          console.log('Publisher logo failed to load:', cleanPublisher.logo);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {cleanPublisher.description && (
                    <p className="text-gray-700 italic leading-relaxed">
                      "{cleanPublisher.description}"
                    </p>
                  )}
                  
                  <div className="space-y-2 pt-3 border-t border-gray-300">
                    <div><strong>Industry:</strong> {cleanPublisher.industry || 'Publishing'}</div>
                    <div><strong>Type:</strong> {cleanPublisher.publicationType || 'Publication'}</div>
                    <div><strong>Audience:</strong> {cleanPublisher.audienceType || 'General'}</div>
                    {cleanPublisher.website && (
                      <div className="flex items-center space-x-1">
                        <strong>Web:</strong>
                        <Globe className="w-3 h-3" />
                        <a 
                          href={cleanPublisher.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs hover:underline break-all"
                        >
                          {cleanPublisher.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Category Overview Box */}
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

            {/* Recent Articles from this Publisher */}
            {articles && articles.length > 3 && (
              <div className="border-2 border-black p-4">
                <h3 className="text-lg font-bold mb-4 border-b border-black pb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  More from {cleanPublisher?.name || 'This Publisher'}
                </h3>
                <div className="space-y-3 text-sm">
                  {articles.slice(3, 7).map((article, index) => (
                    <div 
                      key={article.id}
                      className="border-b border-gray-300 pb-2 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded"
                      onClick={() => handleArticleClick(article)}
                    >
                      <h4 className="font-bold mb-1 hover:underline">{article.title}</h4>
                      <p className="text-gray-600 text-xs">
                        {formatDate(article.createdAt)} • {formatReadTime(article.readTime)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          <img 
            src="/press-bannerAd.png" 
            alt="Mobile preview" 
            className="mb-6" 
          />
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black mt-8">
          <div className="max-w-7xl mx-auto px-8 py-6">
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