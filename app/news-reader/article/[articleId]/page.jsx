// app/news-reader/article/[articleId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/newscard';
import { ArrowLeft, Calendar, Clock, Eye, Hash, User, Globe, Share2, Bookmark } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';

export default function ArticleViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const publisherId = searchParams.get('publisherId');
  
  const [article, setArticle] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticleAndPublisher();
  }, [params.articleId, publisherId]);

  const fetchArticleAndPublisher = async () => {
    if (!params.articleId || !publisherId) return;
    
    try {
      setLoading(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-8 py-12">
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
        <div className="max-w-5xl mx-auto px-8 py-12">
          <button
            onClick={handleBackClick}
            className="text-sm text-gray-600 hover:text-black mb-8 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <div className="border border-gray-300 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
            <p className="text-gray-600">{error || 'This article may have been removed or moved.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Newspaper Header */}
      <div className="border-b-4 border-black">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackClick}
              className="text-sm text-gray-600 hover:text-black flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to {publisher?.name || 'Articles'}
            </button>
            
            <div className="flex items-center space-x-3">
              <FavoriteButton 
                item={{
                  id: article.id,
                  title: article.title,
                  description: article.summary || article.content?.substring(0, 200) + '...',
                  image: article.imageUrl,
                  link: `${window.location.origin}/news-reader/article/${article.id}?publisherId=${publisherId}`,
                  source: publisher?.name || 'Unknown',
                  publicationName: publisher?.name || 'Unknown',
                  publicationLogo: publisher?.logo,
                  category: article.category,
                  pubDate: article.createdAt,
                  type: 'story',
                  publisherId: publisherId
                }}
                size="small"
                showText={false}
              />
              <button 
                className="p-2 text-gray-600 hover:text-black transition-colors"
                title="Share article"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Publication Header */}
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
              {publisher?.name?.toUpperCase() || 'NEWS'}
            </h1>
            <div className="border-t border-b border-black py-1">
              <p className="text-sm tracking-widest" style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                {formatDate(article.createdAt)} • {publisher?.industry || 'News'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Article Header */}
        <div className="mb-8">
          {/* Category Badge */}
          {article.category && (
            <div className="mb-4">
              <span className="inline-block bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {article.category}
              </span>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="text-5xl font-bold leading-tight mb-6 border-b-2 border-black pb-4" 
              style={{fontFamily: 'Times, "Times New Roman", serif'}}>
            {article.title}
          </h1>
          
          {/* Byline and Meta */}
          <div className="flex items-center justify-between mb-6 text-sm border-b border-gray-300 pb-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="font-semibold">By {publisher?.name || 'Staff Writer'}</span>
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
            
            {article.views > 0 && (
              <div className="flex items-center space-x-1 text-gray-600">
                <Eye className="w-4 h-4" />
                <span>{article.views} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Article Layout - Two Column Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            {article.imageUrl && (
              <div className="mb-6">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-64 object-cover border border-gray-400"
                />
                <div className="border-l-4 border-gray-400 pl-4 mt-2">
                  <p className="text-sm italic text-gray-600">
                    {article.title}
                  </p>
                </div>
              </div>
            )}

            {/* Summary/Lead */}
            {article.summary && (
              <div className="mb-6">
                <p className="text-lg font-medium leading-relaxed italic border-l-4 border-black pl-4 py-2"
                   style={{fontFamily: 'Times, "Times New Roman", serif'}}>
                  {article.summary}
                </p>
              </div>
            )}

            {/* Article Body */}
            <div className="space-y-4">
              <div 
                className="text-base leading-relaxed text-justify"
                style={{ 
                  fontFamily: 'Times, "Times New Roman", serif',
                  lineHeight: '1.6',
                  columnGap: '2rem'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: article.content.replace(/\n\n/g, '</p><p class="mb-4">').replace(/\n/g, ' ')
                }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-gray-400 p-4 mb-6">
              <h3 className="text-lg font-bold mb-4 border-b border-gray-400 pb-2">
                Related Stories
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">AI in Healthcare: A Timeline</h4>
                  <p className="text-gray-600">How artificial intelligence continues to transform healthcare delivery and patient outcomes.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Future of Medicine</h4>
                  <p className="text-gray-600">Medical experts share predictions for the next decade of healthcare innovation.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Tech Breakthrough</h4>
                  <p className="text-gray-600">Silicon Valley continues to disrupt traditional industries with cutting-edge solutions.</p>
                </div>
              </div>
            </div>

            {/* Publication Info */}
            {publisher && (
              <div className="border border-gray-400 p-4">
                <h3 className="text-lg font-bold mb-3 border-b border-gray-400 pb-2">
                  About {publisher.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {publisher.logo ? (
                      <img
                        src={publisher.logo}
                        alt={`${publisher.name} logo`}
                        className="w-8 h-8 rounded object-cover border"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-black text-white rounded flex items-center justify-center text-xs font-bold">
                        {publisher.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold">{publisher.name}</span>
                  </div>
                  <p className="text-gray-600 capitalize">{publisher.industry}</p>
                  {publisher.website && (
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Globe className="w-3 h-3" />
                      <span className="text-xs">{publisher.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="border border-gray-400 p-4 mt-6">
                <h3 className="text-lg font-bold mb-3 border-b border-gray-400 pb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-gray-200 px-2 py-1 text-xs font-semibold uppercase tracking-wider border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Article Footer */}
        <div className="mt-12 pt-6 border-t-2 border-black">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold">Published: {formatDate(article.createdAt)}</p>
              {article.updatedAt && article.updatedAt !== article.createdAt && (
                <p className="text-gray-600">Last updated: {formatDate(article.updatedAt)}</p>
              )}
            </div>
            
            <button
              onClick={handleBackClick}
              className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Back to {publisher?.name || 'Articles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}