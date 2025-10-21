import { useState, useEffect } from 'react';
import { Users, Heart, Eye, TrendingUp, BarChart3 } from 'lucide-react';

export default function PublisherAnalytics({ publisherId }) {
  const [analytics, setAnalytics] = useState({
    subscriberCount: 0,
    totalLikes: 0,
    totalViews: 0,
    totalArticles: 0,
    topArticles: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publisherId) {
      fetchAnalytics();
    }
  }, [publisherId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch subscriber count
      const subscriberResponse = await fetch(
        `/api/subscribers?publisherId=${publisherId}`
      );
      const subscriberData = await subscriberResponse.json();

      // Fetch engagement data
      const engagementResponse = await fetch(
        `/api/engagement?publisherId=${publisherId}`
      );
      const engagementData = await engagementResponse.json();

      if (subscriberData.success && engagementData.success) {
        setAnalytics({
          subscriberCount: subscriberData.subscriberCount,
          totalLikes: engagementData.totalLikes,
          totalViews: engagementData.totalViews,
          totalArticles: engagementData.totalArticles,
          topArticles: engagementData.articles
            .sort((a, b) => (b.likeCount + b.views) - (a.likeCount + a.views))
            .slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Subscriber Count */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Subscribers</h3>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.subscriberCount.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Readers who favorited you
          </p>
        </div>

        {/* Total Likes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Likes</h3>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalLikes.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Across all articles
          </p>
        </div>

        {/* Total Views */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            All-time article views
          </p>
        </div>

        {/* Total Engagement */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Engagement</h3>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics.totalLikes + analytics.totalViews).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Likes + Views combined
          </p>
        </div>
      </div>

      {/* Top Performing Articles */}
      {analytics.topArticles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-gray-700 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Articles</h3>
          </div>
          
          <div className="space-y-4">
            {analytics.topArticles.map((article, index) => (
              <div 
                key={article.articleId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Published: {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 ml-4">
                  <div className="text-center">
                    <div className="flex items-center space-x-1 text-red-600">
                      <Heart className="w-4 h-4" />
                      <span className="font-semibold">{article.likeCount}</span>
                    </div>
                    <span className="text-xs text-gray-500">Likes</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center space-x-1 text-green-600">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold">{article.views}</span>
                    </div>
                    <span className="text-xs text-gray-500">Views</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center space-x-1 text-blue-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">
                        {article.likeCount + article.views}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}