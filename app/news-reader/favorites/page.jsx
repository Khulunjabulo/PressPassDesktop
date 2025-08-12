// app/news-reader/favorites/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/newscard';
import { 
  Home, Search, Heart, Tag, ChevronRight, User, Plus, 
  Linkedin, Youtube, Facebook, Volume2, ArrowRight, Clock, FileText,
  Trash2, ExternalLink, Calendar
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import AdSlot from '@/components/news-reader/AdsSlot';
import FavoriteButton from '@/components/FavoriteButton';

export default function FavoritesPage() {
  const router = useRouter();
  const {
    favorites,
    currentUser,
    loading,
    error,
    getGroupedFavorites,
    getFavoriteStats,
    refreshFavorites
  } = useFavorites();

  const [activeTab, setActiveTab] = useState('all');
  const favoriteStats = getFavoriteStats();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/signin');
    }
  }, [loading, currentUser, router]);

  // Navigation handlers
  const handleAddMore = () => router.push('/news-reader');
  const handlePublicationClick = (publication) => {
    router.push(`/news-reader/favorites/${encodeURIComponent(publication.name)}?type=${publication.type}`);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 p-4 border-r">
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-sm mb-3 text-blue-900">YOUR READING STATS</h3>
              <div className="space-y-2">
                {Object.entries(favoriteStats).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-blue-700 capitalize">{key}:</span>
                    <span className="font-bold text-blue-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {['Category', 'Date Added', 'Publication'].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b hover:bg-gray-50 cursor-pointer">
                <span className="font-medium">{item}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">My Favorites</h2>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center overflow-hidden">
                {currentUser?.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <button 
                onClick={handleAddMore} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Browse more articles"
              >
                <Plus className="w-6 h-6" />
              </button>
              <button 
                onClick={refreshFavorites} 
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium">Error loading favorites</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button 
                onClick={refreshFavorites}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-4 md:space-x-8 mb-6 overflow-x-auto">
            {['all', 'magazines', 'newspapers', 'stories'].map(tab => (
              <button 
                key={tab}
                className={`pb-2 whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'text-black font-medium border-b-2 border-black' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({favoriteStats[tab] || 0})
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'all' ? (
            // All Favorites - Individual Articles
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No favorites yet</h3>
                  <p className="text-gray-500 mb-4">Start adding your favorite stories and publications</p>
                  <button 
                    onClick={handleAddMore}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Browse Stories
                  </button>
                </div>
              ) : (
                favorites.map((article) => (
                  <Card 
                    key={article.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleArticleClick(article)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {/* Article Image */}
                        {article.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                            />
                          </div>
                        )}

                        {/* Article Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-1">
                              {article.title}
                            </h3>
                            <div className="flex items-center space-x-2 ml-2">
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
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {article.description}
                            </p>
                          )}

                          {/* Article Meta */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{article.source}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(article.pubDate)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Added {formatDate(article.addedAt)}</span>
                            </div>

                            {article.type && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                {article.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            // Grouped by Publication - Folders
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {getGroupedFavorites(activeTab).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No {activeTab.slice(0, -1)} favorites yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start adding your favorite {activeTab.slice(0, -1)} stories
                  </p>
                  <button 
                    onClick={handleAddMore}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Browse Stories
                  </button>
                </div>
              ) : (
                getGroupedFavorites(activeTab).map((publication, index) => (
                  <Card 
                    key={index}
                    className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                    onClick={() => handlePublicationClick(publication)}
                  >
                    <CardContent className="p-0">
                      {/* Publication Header */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                        <div className="flex items-center space-x-3">
                          {publication.logo ? (
                            <img
                              src={publication.logo}
                              alt={`${publication.name} logo`}
                              className="w-10 h-10 rounded-lg object-cover border border-blue-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {publication.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{publication.name}</h3>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <FileText className="w-3 h-3" />
                              <span>{publication.stories.length} saved {publication.stories.length === 1 ? 'story' : 'stories'}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Preview Articles */}
                      <div className="p-4">
                        <div className="space-y-3">
                          {publication.stories.slice(0, 3).map((story, storyIndex) => (
                            <div key={storyIndex} className="flex items-start space-x-3 group">
                              {story.image && (
                                <img
                                  src={story.image}
                                  alt={story.title}
                                  className="w-12 h-12 rounded object-cover border border-gray-200 flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {story.title}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {formatDate(story.addedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {publication.stories.length > 3 && (
                            <div className="text-center pt-2">
                              <span className="text-xs text-blue-600 font-medium">
                                +{publication.stories.length - 3} more stories
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Folder Status */}
                      <div className="px-4 pb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Publication folder</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="text-green-600 font-medium">{publication.stories.length} saved</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar with Ads */}
        <aside className="hidden lg:block w-80 p-4">
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3 text-blue-900">QUICK ACTIONS</h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleAddMore}
                    className="w-full flex items-center space-x-2 p-2 text-sm text-blue-700 hover:bg-blue-200 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add More Stories</span>
                  </button>
                  <button 
                    onClick={() => router.push('/news-reader/news-sources')}
                    className="w-full flex items-center space-x-2 p-2 text-sm text-blue-700 hover:bg-blue-200 rounded transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Browse Publishers</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Advertisement */}
            <AdSlot 
              label="Sponsored Content" 
              height={250} 
              width={300}
              preferredType="rectangles"
              className="max-w-[300px]"
            />

            {/* Social Share */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-3">SHARE YOUR READING</h3>
                <div className="flex space-x-2">
                  <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    <Youtube className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Another Ad Slot */}
            <AdSlot 
              label="Rectangle Ad" 
              height={250} 
              width={300}
              preferredType="rectangles"
              className="max-w-[300px]"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}