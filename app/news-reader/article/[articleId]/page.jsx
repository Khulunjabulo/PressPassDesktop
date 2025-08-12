// app/news-reader/article/[articleId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Cards';
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatReadTime = (readTime) => {
    if (!readTime) return '5 min read';
    return `${readTime} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-32 h-6 bg-gray-300 rounded animate-pulse mb-6"></div>
            <div className="w-3/4 h-8 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="w-1/2 h-6 bg-gray-300 rounded animate-pulse mb-8"></div>
            <div className="w-full h-64 bg-gray-300 rounded-lg animate-pulse mb-6"></div>
            <div className="space-y-3">
              <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">⚠</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">Article not found</p>
                <p className="text-red-600 text-sm mt-1">{error || 'This article may have been removed or moved.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {publisher?.name || 'Articles'}</span>
          </button>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Publisher Info */}
        {publisher && (
          <Card className="mb-6 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {publisher.logo ? (
                  <img
                    src={publisher.logo}
                    alt={`${publisher.name} logo`}
                    className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {publisher.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{publisher.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="capitalize">{publisher.industry}</span>
                    {publisher.website && (
                      <div className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>{publisher.website.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight flex-1 mr-4">
              {article.title}
            </h1>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
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
                size="large"
                showText={false}
              />
              <button 
                className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
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
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
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

            {article.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {article.category}
              </span>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center space-x-2 mb-6">
              <Hash className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="mb-8">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Summary */}
        {article.summary && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700 leading-relaxed italic">
                {article.summary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Article Content */}
        <Card className="bg-white">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed"
                style={{ 
                  lineHeight: '1.7',
                  fontSize: '1.1rem'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: article.content.replace(/\n/g, '<br />')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Article Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Published on {formatDate(article.createdAt)}
              {article.updatedAt && article.updatedAt !== article.createdAt && (
                <span> • Last updated {formatDate(article.updatedAt)}</span>
              )}
            </div>
            
            <button
              onClick={handleBackClick}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to {publisher?.name || 'Articles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}