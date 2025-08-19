'use client'

import React from 'react'
import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { ArrowUpRight, AlertTriangle, Lightbulb } from 'lucide-react'

export default function AdvancedAnalytics() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <PublisherSidebar />
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <h1 className="text-xl md:text-2xl font-bold text-[#329ae1] mb-4">Advance analytics</h1>
            {/* Predictive Insights */}
            <div className="bg-white border rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <span className="font-semibold text-gray-800">Predictive Insights</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2 bg-blue-50 rounded px-3 py-2">
                  <ArrowUpRight className="text-blue-500 mt-1" size={18} />
                  <div>
                    <span className="font-semibold text-blue-700">Growth Forecast</span>
                    <div className="text-xs text-blue-700">
                      Predicted 15% subscriber growth in next quarter based on current trends
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-yellow-50 rounded px-3 py-2">
                  <AlertTriangle className="text-yellow-500 mt-1" size={18} />
                  <div>
                    <span className="font-semibold text-yellow-700">Churn Risk</span>
                    <div className="text-xs text-yellow-700">
                      24 subscribers at high risk of churning - engage with targeted content
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-green-50 rounded px-3 py-2">
                  <Lightbulb className="text-green-500 mt-1" size={18} />
                  <div>
                    <span className="font-semibold text-green-700">Content Opportunity</span>
                    <div className="text-xs text-green-700">
                      4 segments focusing on "Climate Technology" - 38% engagement increase predicted
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Conversion Funnel Analysis */}
            <div className="bg-white border rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <span className="font-semibold text-gray-800">Conversion Funnel Analysis</span>
              </div>
              <div className="p-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Visitors</span>
                  <span className="text-gray-500">100%</span>
                </div>
                <div className="w-full h-2 bg-purple-100 rounded mb-3">
                  <div className="h-2 bg-purple-500 rounded" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Free Registration</span>
                  <span className="text-gray-500">52.5%</span>
                </div>
                <div className="w-full h-2 bg-purple-100 rounded mb-3">
                  <div className="h-2 bg-purple-400 rounded" style={{ width: '52.5%' }} />
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Total Subscribers</span>
                  <span className="text-gray-500">18%</span>
                </div>
                <div className="w-full h-2 bg-purple-100 rounded mb-3">
                  <div className="h-2 bg-purple-300 rounded" style={{ width: '18%' }} />
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Paid Subscribers</span>
                  <span className="text-gray-500">8.5%</span>
                </div>
                <div className="w-full h-2 bg-purple-100 rounded mb-3">
                  <div className="h-2 bg-purple-600 rounded" style={{ width: '8.5%' }} />
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Premium Upgrade</span>
                  <span className="text-gray-500">5%</span>
                </div>
                <div className="w-full h-2 bg-purple-100 rounded">
                  <div className="h-2 bg-purple-800 rounded" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
            {/* Content Category Analysis */}
            <div className="bg-white border rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <span className="font-semibold text-gray-800">Content Category Analysis</span>
              </div>
              <div className="p-4 text-xs">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Technology</span>
                  <span className="text-gray-700">28% traffic</span>
                  <span className="text-gray-500">42 articles</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Business</span>
                  <span className="text-gray-700">22% traffic</span>
                  <span className="text-gray-500">38 articles</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Politics</span>
                  <span className="text-gray-700">18% traffic</span>
                  <span className="text-gray-500">27 articles</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Sports</span>
                  <span className="text-gray-700">15% traffic</span>
                  <span className="text-gray-500">21 articles</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Entertainment</span>
                  <span className="text-gray-700">12% traffic</span>
                  <span className="text-gray-500">19 articles</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Other</span>
                  <span className="text-gray-700">5% traffic</span>
                  <span className="text-gray-500">14 articles</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
