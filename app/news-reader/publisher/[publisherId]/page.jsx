// app/news-reader/publisher/[publisherId]/page.jsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/newscard';
import { ArrowLeft, FileText, Clock, Globe, Building, Users, Calendar, Eye, Hash } from 'lucide-react';
import { usePublisherArticles } from '@/hooks/useNewsSources';

export default function PublisherArticlesPage() {
  const params = useParams();
  const router = useRouter();
  const { publisher, articles, loading, error, refreshArticles } = usePublisherArticles(params.publisherId);

  const handleArticleClick = (article) => {
    // Navigate to individual article
    router.push(`/news-reader/article/${article.id}?publisherId=${params.publisherId}`);
  };

  const handleBackClick = () => {
    router.back();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-3">
                <div className="w-64 h-8 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Articles Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="w-3/4 h-6 bg-gray-300 rounded"></div>
                    <div className="w-full h-4 bg-gray-300 rounded"></div>
                    <div className="w-2/3 h-4 bg-gray-300 rounded"></div>
                    <div className="flex space-x-4">
                      <div className="w-20 h-4 bg-gray-300 rounded"></div>
                      <div className="w-24 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to News Sources</span>
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">⚠</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">Error loading publisher</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button 
              onClick={refreshArticles}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to News Sources</span>
          </button>

          {/* Publisher Info */}
          {publisher && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-start space-x-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {publisher.logo ? (
                    <img
                      src={publisher.logo}
                      alt={`${publisher.name} logo`}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center border-2 border-blue-300">
                      <span className="text-white font-bold text-2xl">
                        {publisher.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{publisher.name}</h1>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {publisher.industry}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{publisher.publicationType} • {publisher.audienceType}</span>
                    </div>
                  </div>

                  {publisher.description && (
                    <p className="text-gray-700 mb-3">{publisher.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {publisher.website && (
                      <div className="flex items-center space-x-1">
                        <Globe className="w-4 h-4" />
                        <span>{publisher.website.replace(/^https?:\/\//, '')}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{articles.length} {articles.length === 1 ? 'article' : 'articles'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Articles Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {articles.length === 0 ? 'No Articles Yet' : `Articles (${articles.length})`}
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No articles published yet</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              This publisher's folder is ready for articles. Check back later for new content.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <Card 
                key={article.id}
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-white"
                onClick={() => handleArticleClick(article)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Article Image */}
                    {article.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      {article.summary && (
                        <p className="text-gray-600 mb-3 line-clamp-3">
                          {article.summary}
                        </p>
                      )}

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Hash className="w-3 h-3 text-gray-400" />
                          <div className="flex flex-wrap gap-2">
                            {article.tags.slice(0, 3).map((tag, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{article.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Article Meta */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {article.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}