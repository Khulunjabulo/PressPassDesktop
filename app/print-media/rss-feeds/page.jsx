'use client'

import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import { useState, useEffect } from 'react'
import { Rss, Trash2, RefreshCw, Eye, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

// Normalize URL — prepend https:// if missing scheme
const normalizeUrl = (url) => {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`
  return trimmed
}

// Validate that a URL is usable (http/https after normalization)
const isValidUrl = (url) => {
  const normalized = normalizeUrl(url)
  return /^https?:\/\/.+/i.test(normalized)
}

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

  // Inline error state — keyed by field name
  const [fieldErrors, setFieldErrors] = useState({
    feedUrl: '',
    feedName: '',
    general: '',   // for errors not tied to a specific field (e.g. sync/delete)
  })

  // Sync/delete operation inline messages (shown per feed row)
  const [feedMessages, setFeedMessages] = useState({}) // { [feedId]: { type: 'success'|'error', text: string } }

  const setFieldError = (field, message) =>
    setFieldErrors((prev) => ({ ...prev, [field]: message }))

  const clearFieldError = (field) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))

  const clearAllErrors = () =>
    setFieldErrors({ feedUrl: '', feedName: '', general: '' })

  const setFeedMessage = (feedId, type, text) =>
    setFeedMessages((prev) => ({ ...prev, [feedId]: { type, text } }))

  const clearFeedMessage = (feedId) =>
    setFeedMessages((prev) => { const n = { ...prev }; delete n[feedId]; return n })

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
      const response = await fetch(`/api/rss-feeds?publisherId=${publisherId}`)
      const data = await response.json()

      if (data.success) {
        setFeeds(data.feeds)
      } else {
        setFieldError('general', 'Failed to load RSS feeds: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error fetching feeds:', error)
      setFieldError('general', 'Failed to load RSS feeds. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  // Validate before any feed action — returns normalized URL or null
  const validateAndNormalize = () => {
    clearAllErrors()
    const publisherId = publisher?.uid || publisher?.id
    let valid = true

    if (!publisherId) {
      setFieldError('general', 'Publisher information not found. Please refresh the page.')
      valid = false
    }

    if (!feedUrl.trim()) {
      setFieldError('feedUrl', 'Please enter an RSS feed URL.')
      valid = false
    } else if (!isValidUrl(feedUrl)) {
      setFieldError('feedUrl', 'Please enter a valid URL (e.g. https://example.com/rss.xml or www.example.com/rss.xml).')
      valid = false
    }

    if (!valid) return null
    return normalizeUrl(feedUrl)
  }

  const handlePreviewFeed = async () => {
    const normalizedUrl = validateAndNormalize()
    if (!normalizedUrl) return

    const publisherId = publisher?.uid || publisher?.id

    try {
      setPreviewLoading(true)
      setPreviewData(null)
      const response = await fetch('/api/rss-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisherId,
          feedUrl: normalizedUrl,
          feedName: feedName.trim(),
          action: 'preview'
        })
      })

      const data = await response.json()

      if (data.success) {
        setPreviewData(data)
        clearAllErrors()
      } else {
        // Show error under the URL field since the URL is what caused it
        setFieldError('feedUrl', data.error || 'Failed to fetch RSS feed. Check the URL and try again.')
      }
    } catch (error) {
      console.error('Error previewing feed:', error)
      setFieldError('feedUrl', 'Failed to preview RSS feed: ' + error.message)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handlePublishFeed = async () => {
    const normalizedUrl = validateAndNormalize()
    if (!normalizedUrl) return

    const publisherId = publisher?.uid || publisher?.id

    try {
      setPublishingFeed(true)
      const response = await fetch('/api/rss-feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisherId,
          feedUrl: normalizedUrl,
          feedName: feedName.trim() || previewData?.feedInfo?.title,
          action: 'publish'
        })
      })

      const data = await response.json()

      if (data.success) {
        setFeedName('')
        setFeedUrl('')
        setPreviewData(null)
        setShowAddFeedForm(false)
        clearAllErrors()
        fetchFeeds()
        // Show inline success in the feeds list area
        setFieldError('general', '') // clear any lingering errors
      } else {
        setFieldError('general', data.error || 'Failed to publish RSS feed.')
      }
    } catch (error) {
      console.error('Error publishing feed:', error)
      setFieldError('general', 'Failed to publish RSS feed: ' + error.message)
    } finally {
      setPublishingFeed(false)
    }
  }

  const handleSyncFeed = async (feedId) => {
    const publisherId = publisher?.uid || publisher?.id
    if (!publisherId) return

    clearFeedMessage(feedId)

    try {
      const response = await fetch(`/api/rss-feeds/${feedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisherId, action: 'sync' })
      })

      const data = await response.json()

      if (data.success) {
        setFeedMessage(feedId, 'success', `Synced! ${data.newArticles} new article${data.newArticles === 1 ? '' : 's'} added.`)
        fetchFeeds()
      } else {
        setFeedMessage(feedId, 'error', data.error || 'Failed to sync RSS feed.')
      }
    } catch (error) {
      console.error('Error syncing feed:', error)
      setFeedMessage(feedId, 'error', 'Failed to sync RSS feed: ' + error.message)
    }
  }

  const handleDeleteFeed = async (feedId) => {
    const publisherId = publisher?.uid || publisher?.id
    if (!publisherId) return
    if (!window.confirm('Are you sure? This will delete the RSS feed and all its articles.')) return

    clearFeedMessage(feedId)

    try {
      const response = await fetch(`/api/rss-feeds/${feedId}?publisherId=${publisherId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchFeeds()
      } else {
        setFeedMessage(feedId, 'error', data.error || 'Failed to delete RSS feed.')
      }
    } catch (error) {
      console.error('Error deleting feed:', error)
      setFeedMessage(feedId, 'error', 'Failed to delete RSS feed: ' + error.message)
    }
  }

  const handleCancel = () => {
    setFeedName('')
    setFeedUrl('')
    setPreviewData(null)
    setShowAddFeedForm(false)
    clearAllErrors()
  }

  // Reusable inline error component
  const FieldError = ({ message }) =>
    message ? (
      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {message}
      </p>
    ) : null

  // Reusable inline banner for general errors (non-field)
  const GeneralError = ({ message }) =>
    message ? (
      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2 text-sm text-red-700">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    ) : null

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
              onClick={() => {
                setShowAddFeedForm(true)
                clearAllErrors()
              }}
            >
              <Rss className="w-4 h-4" />
              Add RSS Feed
            </button>
          </div>

          {/* General error banner (fetch feeds failures, publish failures) */}
          <GeneralError message={fieldErrors.general} />

          {/* ── Add Feed Form ── */}
          {showAddFeedForm && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Rss className="w-5 h-5 text-violet-600" />
                Add New RSS Feed
              </h2>

              <div className="space-y-4">
                {/* Feed Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feed Name <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={feedName}
                    onChange={(e) => {
                      setFeedName(e.target.value)
                      clearFieldError('feedName')
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${
                      fieldErrors.feedName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Tech News Feed"
                  />
                  <FieldError message={fieldErrors.feedName} />
                </div>

                {/* Feed URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RSS Feed URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={feedUrl}
                    onChange={(e) => {
                      setFeedUrl(e.target.value)
                      clearFieldError('feedUrl')
                      // Clear preview when URL changes
                      if (previewData) setPreviewData(null)
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${
                      fieldErrors.feedUrl ? 'border-red-400 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/rss.xml or www.example.com/feed"
                  />
                  <FieldError message={fieldErrors.feedUrl} />
                  {/* Helper hint */}
                  {!fieldErrors.feedUrl && (
                    <p className="mt-1 text-xs text-gray-400">
                      Accepts URLs with or without https:// (e.g. www.example.com/feed)
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handlePreviewFeed}
                    disabled={!feedUrl.trim() || previewLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {previewLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* ── Preview Section ── */}
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
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {publishingFeed ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
                                className="w-20 h-20 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
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

          {/* ── Existing Feeds List ── */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your RSS Feeds</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-600 border-t-transparent" />
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Rss className="w-5 h-5 text-violet-600 flex-shrink-0" />
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
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2 truncate max-w-full"
                        >
                          {feed.feedUrl}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>

                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Added: {feed.createdAt ? new Date(feed.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                          <span>Articles: {feed.totalArticles || 0}</span>
                          {feed.lastFetched && (
                            <span>Last synced: {new Date(feed.lastFetched).toLocaleDateString()}</span>
                          )}
                        </div>

                        {/* Per-feed inline message (sync success/error, delete error) */}
                        {feedMessages[feed.id] && (
                          <p className={`mt-2 text-xs flex items-center gap-1 ${
                            feedMessages[feed.id].type === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {feedMessages[feed.id].type === 'success'
                              ? <CheckCircle className="w-3 h-3 flex-shrink-0" />
                              : <AlertCircle className="w-3 h-3 flex-shrink-0" />
                            }
                            {feedMessages[feed.id].text}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
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