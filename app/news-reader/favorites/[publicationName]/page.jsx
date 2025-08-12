// app/news-reader/favorites/[publicationName]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/UI/Cards';
import { ArrowLeft, Calendar, Clock, ExternalLink, User, FileText, Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from '@/components/FavoriteButton';

export default function PublicationFavoritesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const publicationType = searchParams.get('type');
  
  const { favorites, currentUser, loading } = useFavorites();
  const [publicationFavorites, setPublicationFavorites] = useState([]);
  const [publicationInfo, setPublicationInfo] = useState(null);

  const publicationName = decodeURIComponent(params.publicationName);

  useEffect(() => {
    if (favorites.length > 0) {
      // Filter favorites for this specific publication
      const pubFavorites = favorites.filter(fav => 
        (fav.publicationName === publicationName || fav.source === publicationName) &&
        (!publicationType || fav.type === publicationType)
      );
      
      setPublicationFavorites(pubFavorites);
      
      // Set publication info from first article
      if (pubFavorites.length > 0) {
        const firstArticle = pubFavorites[0];
        setPublicationInfo({
          name: publicationName,
          type: firstArticle.type,
          logo: firstArticle.publicationLogo,
          totalStories: pubFavorites.length
        });
      }
    }
  }, [favorites, publicationName, publicationType]);

  const handleBackClick = () => {
    router.push('/news-reader/favorites');
  };

  const handleArticleClick = (article) => {
    if (article.link && article.link.startsWith('http')) {
      // External article
      window.open(article.link, '_blank');
    } else if (article.publisherId) {
      // Internal article
      router.push(`/news-reader/article/${article.id}?publisherId=${article.publisherId}`);
    } else {
      // Fallback
      if (article.link) {
        window.open(article.link, '_blank');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="w-32 h-6 bg-gray-300 rounded animate-pulse mb-6"></div>
            <div className="w-3/4 h-8 bg-gray-300 rounded animate-pulse mb-4"></div>
            <div className="w-1/2 h-6 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Sign in to view favorites</h3>
          <button 
            onClick={() => router.push('/signin')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </button>
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
            <span>Back to Favorites</span>
          </button>
        </div>
      </div>

      {/* Publication Info */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {publicationInfo && (
          <Card className="mb-8 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                {publicationInfo.logo ? (
                  <img
                    src={publicationInfo.logo}
                    alt={`${publicationInfo.name} logo`}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {publicationInfo.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{publicationInfo.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {publicationInfo.type}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{publicationInfo.totalStories} favorites</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Articles */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Saved Articles {publicationFavorites.length > 0 && `(${publicationFavorites.length})`}
          </h2>
        </div>

        {publicationFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No saved articles</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              You haven't saved any articles from {publicationName} yet.
            </p>
            <button 
              onClick={() => router.push('/news-reader')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Articles
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {publicationFavorites.map((article) => (
              <Card 
                key={article.id}
                className="hover:shadow-lg transition-shadow cursor-pointer bg-white"
                onClick={() => handleArticleClick(article)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Article Image */}
                    {article.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-4">
                          {article.title}
                        </h3>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <FavoriteButton 
                            item={article}
                            size="small"
                          />
                          {article.link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(article.link, '_blank');
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Open original"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {article.description && (
                        <p className="text-gray-600 mb-3 line-clamp-3">
                          {article.description}
                        </p>
                      )}

                      {/* Article Meta */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Published {formatDate(article.pubDate)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>Saved {formatDate(article.addedAt)}</span>
                        </div>

                        {article.category && article.category !== 'general' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
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