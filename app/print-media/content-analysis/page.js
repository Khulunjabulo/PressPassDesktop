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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
           <div className="h-screen bg-gray-50 flex overflow-hidden">
        <PublisherSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Content Analysis</h1>
              <button className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm md:text-base self-start md:self-auto">
                Generate Report
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Content Performance by Category</h2>
              <div className="h-80 md:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="category"
                      angle={0}
                      textAnchor="middle"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="articles" fill="#8884d8" name="Articles" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="engagement" fill="#82ca9d" name="Engagement %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Top Performing Content</h2>
                <ul className="space-y-4">
                  {contentData.map((item, index) => (
                    <li key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-800">{item.category}</span>
                        <span className="text-green-600 font-medium">{item.engagement}% engagement</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{item.articles} articles, {(item.views / 1000).toFixed(0)}k views</div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Content Recommendations</h2>
                <ul className="space-y-3">
                  <li className="text-sm p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="font-medium text-gray-800">Increase sports content</div>
                    <div className="mt-1">Increase sports content by 15% to meet growing demand</div>
                  </li>
                  <li className="text-sm p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="font-medium text-gray-800">Technology engagement</div>
                    <div className="mt-1">Technology articles have highest engagement rate per view</div>
                  </li>
                  <li className="text-sm p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="font-medium text-gray-800">Business visuals</div>
                    <div className="mt-1">Business content needs more visual elements to improve engagement</div>
                  </li>
                  <li className="text-sm p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <div className="font-medium text-gray-800">Entertainment timing</div>
                    <div className="mt-1">Entertainment articles perform best on weekends</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}