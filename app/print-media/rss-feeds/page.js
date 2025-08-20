'use client'

import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { useState } from 'react'

export default function RssFeeds() {
  const [showAddFeedForm, setShowAddFeedForm] = useState(false)
  const [feedUrl, setFeedUrl] = useState('')
  const [feedName, setFeedName] = useState('')

  const handleAddFeed = () => {
    setShowAddFeedForm(true)
  }

  const handleSaveFeed = () => {
    // Here you would typically save the feed to your database
    console.log('Saving feed:', { name: feedName, url: feedUrl })
    
    // Reset form and hide it
    setFeedName('')
    setFeedUrl('')
    setShowAddFeedForm(false)
    
    // Show success message or update UI
    alert('Feed added successfully!')
  }

  const handleCancel = () => {
    setFeedName('')
    setFeedUrl('')
    setShowAddFeedForm(false)
  }

  return (
    <>
      <Header />
     <div className="h-screen bg-gray-50 flex overflow-hidden">
        <PublisherSidebar />
        <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">RSS Feeds</h1>
        <button
          className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm"
          onClick={handleAddFeed}
        >
          Add New Feed
        </button>
      </div>
      
      {showAddFeedForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New RSS Feed</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feed Name</label>
              <input
                type="text"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter feed name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Feed URL</label>
              <input
                type="url"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="https://example.com/rss"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveFeed}
                className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700"
              >
                Save Feed
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">Configure your RSS feeds here.</p>
      </div>
        </div>
      </div>
    </>
  )
}