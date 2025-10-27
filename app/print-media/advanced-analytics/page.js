'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { ArrowUpRight, AlertTriangle, Lightbulb } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";

const FunnelStage = ({ label, value, rate, color }) => (
  <>
    <div className="flex justify-between text-xs mb-1">
      <span>{label}</span>
      <span className="text-gray-500">{rate}% ({value.toLocaleString()})</span>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded mb-3">
      <div className={`h-2 ${color} rounded`} style={{ width: `${rate}%` }} />
    </div>
  </>
);

const LoadingSkeleton = () => (
  <div className="bg-white border rounded-lg shadow-sm mb-6 animate-pulse">
    <div className="p-4 border-b">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-12 bg-gray-100 rounded"></div>
      <div className="h-12 bg-gray-100 rounded"></div>
      <div className="h-12 bg-gray-100 rounded"></div>
    </div>
  </div>
);

export default function AdvancedAnalytics() {
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async (publisherId) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/advanced-analytics?publisherId=${publisherId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        if (data.success) {
          setAnalyticsData(data);
        } else {
          throw new Error(data.error || 'An unknown error occurred');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (publisher?.id) {
      fetchAnalytics(publisher.id);
    } else if (!loading) {
      // If publisher loading is finished but there's no ID
      setIsLoading(false);
      setError("Could not identify the publisher.");
    }
  }, [publisher, loading]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header publisher={publisher} />
        <div className="h-screen bg-gray-50 flex overflow-hidden">
          <PublisherSidebar />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-xl md:text-2xl font-bold text-[#329ae1] mb-4">Advanced Analytics</h1>
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header publisher={publisher} />
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <PublisherSidebar />
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-[#329ae1] mb-4">Advanced Analytics</h1>
            {/* Predictive Insights */}
            <div className="bg-white border rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <span className="font-semibold text-gray-800">Predictive Insights</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2 bg-blue-50 rounded px-3 py-2">
                  <ArrowUpRight className="text-blue-500 mt-1" size={18} />
                  <div>
                    <span className="font-semibold text-blue-700">Growth Forecast ({analyticsData.predictiveInsights.growthForecast.value}%)</span>
                    <div className="text-xs text-blue-700">
                      {analyticsData.predictiveInsights.growthForecast.message}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-yellow-50 rounded px-3 py-2">
                  <AlertTriangle className="text-yellow-500 mt-1" size={18} />
                  <div>
                    <span className="font-semibold text-yellow-700">Churn Risk ({analyticsData.predictiveInsights.churnRisk.value} Users)</span>
                    <div className="text-xs text-yellow-700">
                      {analyticsData.predictiveInsights.churnRisk.message}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-green-50 rounded px-3 py-2">
                  <Lightbulb className="text-green-500 mt-1" size={18} />
                  <div>
                    <span className="font-semibold text-green-700">Content Opportunity: {analyticsData.predictiveInsights.contentOpportunity.value}</span>
                    <div className="text-xs text-green-700">
                      {analyticsData.predictiveInsights.contentOpportunity.message}
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
                <FunnelStage label="Total Visitors" value={analyticsData.funnelData.visitors.value} rate={analyticsData.funnelData.visitors.rate} color="bg-purple-500" />
                <FunnelStage label="Total Subscribers" value={analyticsData.funnelData.subscribers.value} rate={analyticsData.funnelData.subscribers.rate} color="bg-purple-400" />
              </div>
            </div>
            {/* Content Category Analysis */}
            <div className="bg-white border rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <span className="font-semibold text-gray-800">Content Category Analysis (by Views)</span>
              </div>
              <div className="p-4 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.contentCategoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'traffic') return [`${value}%`, 'Traffic Share'];
                        if (name === 'articles') return [value, 'Article Count'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="traffic" name="Traffic %" fill="#8884d8" background={{ fill: '#eee' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
