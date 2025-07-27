'use client'

import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'

export default function RssFeeds() {
  return (
    <>
      <Header />
      <div className="flex">
        <PublisherSidebar />
        <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">RSS Feeds</h1>
        <button className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm">
          Add New Feed
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500">Configure your RSS feeds here.</p>
      </div>
        </div>
      </div>
    </>
  )
}