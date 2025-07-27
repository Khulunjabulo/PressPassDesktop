'use client'

import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const contentData = [
  { category: 'News', articles: 45, views: 125000, engagement: 8.2 },
  { category: 'Sports', articles: 38, views: 98000, engagement: 7.8 },
  { category: 'Business', articles: 30, views: 89000, engagement: 7.5 },
  { category: 'Entertainment', articles: 28, views: 76000, engagement: 7.1 },
  { category: 'Technology', articles: 20, views: 68000, engagement: 6.9 },
]

export default function ContentAnalysis() {
  return (
    <>
      <Header />
      <div className="flex">
        <PublisherSidebar />
        <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Content Analysis</h1>
        <button className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm">
          Generate Report
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Content Performance by Category</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="articles" fill="#8884d8" name="Articles" />
              <Bar dataKey="engagement" fill="#82ca9d" name="Engagement %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Performing Content</h2>
          <ul className="space-y-4">
            {contentData.map((item, index) => (
              <li key={index} className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-green-600">{item.engagement}% engagement</span>
                </div>
                <div className="text-sm text-gray-500">{item.articles} articles, {(item.views / 1000).toFixed(0)}k views</div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Content Recommendations</h2>
          <ul className="space-y-2">
            <li className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-500">Increase sports content by 15% to meet growing demand</li>
            <li className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-500">Technology articles have highest engagement rate per view</li>
            <li className="text-sm p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">Business content needs more visual elements to improve engagement</li>
            <li className="text-sm p-2 bg-purple-50 rounded border-l-4 border-purple-500">Entertainment articles perform best on weekends</li>
          </ul>
        </div>
      </div>
        </div>
      </div>
    </>
  )
}