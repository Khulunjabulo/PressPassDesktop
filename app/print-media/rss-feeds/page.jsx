'use client'

import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import { useState, useEffect } from 'react'
import { Rss, Trash2, RefreshCw, Eye, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function RssFeeds() {
  const { publisher, loading: publisherLoading } = useCurrentPublisher("currentPublisherId");
  
  const [showAddFeedForm, setShowAddFeedForm] = useState(false)
  const [feedUrl, setFeedUrl] = useState('')
  const [feedName, setFeedName] = useState('')
  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [publishingFeed, setPublishingFeed] = useState(false)

  // Debug: Log publisher data
  useEffect(() => {
    console.log('🔍 Publisher Debug:', {
      hasPublisher: !!publisher,
      publisherId: publisher?.id,
      publisherUid: publisher?.uid,
      publisherName: publisher?.companyName,
      publisherLoading
    });
  }, [publisher, publisherLoading]);

  // Fetch existing RSS feeds
  useEffect(() => {
    if (publisher?.uid || publisher?.id) {
      fetchFeeds()
    }
  }, [publisher])

  const fetchFeeds = async () => {
    const publisherId = publisher?.uid || publisher?.id
    if (!publisherId) {
      console.error('No publisher ID found')
      return
    }
    
    try {
      setLoading(true)
      console.log('Fetching RSS feeds for publisher:', publisherId)
      const response = await fetch(`/api/rss-feeds?publisherId=${publisherId}`)
      const data = await response.json()
      
      if (data.success) {
        setFeeds(data.feeds)
      } else {
        console.error('Failed to fetch feeds:', data.error)
        alert('Failed to load RSS feeds: ' + data.error)
      }
    } catch (error) {
      console.error('Error fetching feeds:', error)
      alert('Failed to load RSS feeds')
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewFeed = async () => {
    const publisherId = publisher?.uid || publisher?.id
    
    // Better validation
    if (!publisherId) {
      alert('Publisher information not found. Please refresh the page.')
      return
    }
    
    if (!feedUrl || !feedUrl.trim()) {
      alert('Please enter an RSS feed URL')
      return
    }
    
    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(feedUrl.trim())) {
      alert('Please enter a valid URL starting with http:// or https://')
      return
    }
    
    console.log('✅ Validation passed. Publisher ID:', publisherId);
    console.log('✅ Feed URL:', feedUrl.trim());
    
    try {
      setPreviewLoading(true)
      console.log('Previewing RSS feed:', feedUrl)
      const response = await fetch('/api/rss-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisherId: publisherId,
          feedUrl: feedUrl.trim(),
          feedName: feedName.trim(),
          action: 'preview'
        })
      })

      const data = await response.json()
      console.log('Preview response:', data)

      if (data.success) {
        setPreviewData(data)
      } else {
        alert(data.error || 'Failed to fetch RSS feed')
      }
    } catch (error) {
      console.error('Error previewing feed:', error)
      alert('Failed to preview RSS feed: ' + error.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handlePublishFeed = async () => {
    const publisherId = publisher?.uid || publisher?.id
    
    // Better validation
    if (!publisherId) {
      alert('Publisher information not found. Please refresh the page.')
      return
    }
    
    if (!feedUrl || !feedUrl.trim()) {
      alert('Please enter an RSS feed URL')
      return
    }
    
    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(feedUrl.trim())) {
      alert('Please enter a valid URL starting with http:// or https://')
      return
    }
    
    console.log('✅ Publishing with Publisher ID:', publisherId);
    console.log('✅ Feed URL:', feedUrl.trim());
    
    try {
      setPublishingFeed(true)
      console.log('Publishing RSS feed for publisher:', publisherId)
      const response = await fetch('/api/rss-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisherId: publisherId,
          feedUrl: feedUrl.trim(),
          feedName: feedName.trim() || previewData?.feedInfo?.title,
          action: 'publish'
        })
      })

      const data = await response.json()
      console.log('Publish response:', data)

      if (data.success) {
        alert(`RSS feed published! ${data.articlesPublished} articles added.`)
        setFeedName('')
        setFeedUrl('')
        setPreviewData(null)
        setShowAddFeedForm(false)
        fetchFeeds()
      } else {
        alert(data.error || 'Failed to publish RSS feed')
      }
    } catch (error) {
      console.error('Error publishing feed:', error)
      alert('Failed to publish RSS feed: ' + error.message)
    } finally {
      setPublishingFeed(false)
    }
  }

  const handleSyncFeed = async (feedId) => {
    const publisherId = publisher?.uid || publisher?.id
    if (!publisherId) return
    
    try {
      console.log('Syncing feed:', feedId, 'for publisher:', publisherId)
      const response = await fetch(`/api/rss-feeds/${feedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisherId: publisherId,
          action: 'sync'
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Synced! ${data.newArticles} new articles added.`)
        fetchFeeds()
      } else {
        alert(data.error || 'Failed to sync RSS feed')
      }
    } catch (error) {
      console.error('Error syncing feed:', error)
      alert('Failed to sync RSS feed: ' + error.message)
    }
  }

  const handleDeleteFeed = async (feedId) => {
    const publisherId = publisher?.uid || publisher?.id
    if (!publisherId) return
    if (!confirm('Are you sure? This will delete the RSS feed and all its articles.')) return
    
    try {
      console.log('Deleting feed:', feedId, 'for publisher:', publisherId)
      const response = await fetch(`/api/rss-feeds/${feedId}?publisherId=${publisherId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert(`RSS feed deleted. ${data.articlesDeleted} articles removed.`)
        fetchFeeds()
      } else {
        alert(data.error || 'Failed to delete RSS feed')
      }
    } catch (error) {
      console.error('Error deleting feed:', error)
      alert('Failed to delete RSS feed: ' + error.message)
    }
  }

  const handleCancel = () => {
    setFeedName('')
    setFeedUrl('')
    setPreviewData(null)
    setShowAddFeedForm(false)
  }

  if (publisherLoading) {
    return (
      <>
        <Header publisher={publisher} />
        <div className="h-screen bg-gray-50 flex overflow-hidden">
          <PublisherSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header publisher={publisher} />
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <PublisherSidebar />
        <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">RSS Feeds</h1>
              <p className="text-sm text-gray-600 mt-1">Import and manage external RSS feeds</p>
            </div>
            <button
              className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm flex items-center gap-2"
              onClick={() => setShowAddFeedForm(true)}
            >
              <Rss className="w-4 h-4" />
              Add RSS Feed
            </button>
          </div>
          
          {/* Add Feed Form */}
          {showAddFeedForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Rss className="w-5 h-5 text-violet-600" />
                Add New RSS Feed
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feed Name (Optional)</label>
                  <input
                    type="text"
                    value={feedName}
                    onChange={(e) => setFeedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g., Tech News Feed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RSS Feed URL *</label>
                  <input
                    type="url"
                    value={feedUrl}
                    onChange={(e) => setFeedUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="https://example.com/rss.xml"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handlePreviewFeed}
                    disabled={!feedUrl.trim() || previewLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {previewLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Preview Feed
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              {previewData && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{previewData.feedInfo.title}</h3>
                      <p className="text-sm text-gray-600">{previewData.feedInfo.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {previewData.feedInfo.totalArticles} articles found
                      </p>
                    </div>
                    <button
                      onClick={handlePublishFeed}
                      disabled={publishingFeed}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {publishingFeed ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Publish All Articles
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-gray-700 mb-3">Preview Articles:</h4>
                    <div className="space-y-3">
                      {previewData.articles.slice(0, 10).map((article, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex gap-3">
                            {article.imageUrl && (
                              <img 
                                src={article.imageUrl} 
                                alt="" 
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-semibold text-sm text-gray-800 line-clamp-2">{article.title}</h5>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{article.summary}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                                {article.link && (
                                  <a 
                                    href={article.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Original
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {previewData.articles.length > 10 && (
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        + {previewData.articles.length - 10} more articles will be published
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Existing Feeds List */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your RSS Feeds</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-600 border-t-transparent"></div>
              </div>
            ) : feeds.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Rss className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No RSS feeds added yet</p>
                <p className="text-xs mt-1">Click "Add RSS Feed" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feeds.map((feed) => (
                  <div key={feed.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Rss className="w-5 h-5 text-violet-600" />
                          <h3 className="font-semibold text-gray-800">{feed.feedName}</h3>
                          {feed.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <a 
                          href={feed.feedUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2"
                        >
                          {feed.feedUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Added: {feed.createdAt ? new Date(feed.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                          <span>Articles: {feed.totalArticles || 0}</span>
                          {feed.lastFetched && (
                            <span>Last synced: {new Date(feed.lastFetched).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleSyncFeed(feed.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Sync feed"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteFeed(feed.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete feed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}