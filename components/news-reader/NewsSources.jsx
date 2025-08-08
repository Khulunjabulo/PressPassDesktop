'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/newscard';
import { FileText, Clock, Globe, Building, Users } from 'lucide-react';

export default function NewsSources() {
  const [newsources, setNewsources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewsSources();
  }, []);

  const fetchNewsSources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news-sources');
      const data = await response.json();

      if (data.success) {
        setNewsources(data.newsources);
      } else {
        setError(data.error || 'Failed to fetch news sources');
      }
    } catch (err) {
      console.error('Error fetching news sources:', err);
      setError('Failed to load news sources');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceClick = (source) => {
    // Navigate to specific publisher's articles or profile
    console.log('Clicked on source:', source.name);
    // You can implement navigation logic here
    // e.g., router.push(`/news-reader/source/${source.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">News Sources</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">News Sources</h1>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchNewsSources}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">News Sources</h1>
          <p className="text-sm text-gray-500">{newsources.length} publishers</p>
        </div>
        
        {newsources.length === 0 ? (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No news sources yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Publishers will appear here once they register and start publishing content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsources.map((source) => (
              <Card 
                key={source.id} 
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border-0 shadow-sm"
                onClick={() => handleSourceClick(source)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {source.logo ? (
                        <img
                          src={source.logo}
                          alt={`${source.name} logo`}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {source.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Source Name */}
                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                        {source.name}
                      </h3>
                      
                      {/* Industry Badge */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {source.industry}
                        </span>
                      </div>
                      
                      {/* Article Count */}
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {source.articleCount} {source.articleCount === 1 ? 'article' : 'articles'}
                        </span>
                      </div>
                      
                      {/* Publication Type */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 capitalize">
                          {source.publicationType} • {source.audienceType}
                        </span>
                      </div>
                      
                      {/* Website */}
                      {source.website && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 truncate">
                            {source.website.replace(/^https?:\/\//, '')}
                          </span>
                        </div>
                      )}
                      
                      {/* Last Posted */}
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          Last posted: {source.lastPosted}
                        </span>
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