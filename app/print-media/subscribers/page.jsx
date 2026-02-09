"use client";

import { useState, useEffect } from "react";
import Header from "@/components/UI/header";
import PublisherSidebar from "@/components/UI/publisherSidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";

export default function Subscribers() {
  const { publisher, loading: publisherLoading } = useCurrentPublisher("currentPublisherId");
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriberData, setSubscriberData] = useState({
    subscriberCount: 0,
    newThisMonth: 0,
    churnRate: 0,
    totalChurned: 0,
    growthData: {
      weekly: [],
      monthly: []
    }
  });
  const [selectedGraph, setSelectedGraph] = useState('weekly'); // 'weekly' or 'monthly'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize currentUser from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        ('👤 Current user loaded:', { 
          uid: user.uid, 
          role: user.role,
          companyName: user.companyName
        });
        setCurrentUser(user);
      } else {
        ('⚠️ No user data found in localStorage');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('❌ Error reading user data:', error);
      setCurrentUser(null);
    }
  }, []);

  // Fetch subscriber analytics
  useEffect(() => {
    const fetchSubscriberData = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        ('📊 Fetching subscriber analytics for publisher:', currentUser.uid);
        
        const response = await fetch(`/api/subscribers?publisherId=${currentUser.uid}&includeDetails=false`);
        const data = await response.json();
        
        ('📥 Subscriber analytics response:', data);
        
        if (data.success) {
          setSubscriberData({
            subscriberCount: data.subscriberCount || 0,
            newThisMonth: data.newThisMonth || 0,
            churnRate: data.churnRate || 0,
            totalChurned: data.totalChurned || 0,
            growthData: data.growthData || { weekly: [], monthly: [] }
          });
          ('✅ Subscriber data updated');
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error('❌ Error fetching subscriber analytics:', error);
        setError("Failed to load subscriber data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriberData();
  }, [currentUser?.uid]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const currentGraphData = selectedGraph === 'weekly' 
    ? subscriberData.growthData.weekly 
    : subscriberData.growthData.monthly;

  const isLoading = publisherLoading || loading;

  return (
    <>
      <Header publisher={publisher} />
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
        <PublisherSidebar />
        <main className="flex-1 p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              Subscribers
            </h1>
            <button className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm w-full sm:w-auto transition-colors">
              Export Data
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* Total Subscribers */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-500">
                  Total Subscribers
                </h2>
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24 mt-2"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    {subscriberData.subscriberCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Active readers who favorited you
                  </p>
                </>
              )}
            </div>

            {/* New Subscribers This Month */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-500">
                  New This Month
                </h2>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24 mt-2"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    +{subscriberData.newThisMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {subscriberData.newThisMonth > 0 ? '↑ Growing' : 'No new subscribers yet'}
                  </p>
                </>
              )}
            </div>

            {/* Churn Rate */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-500">
                  Churn Rate
                </h2>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24 mt-2"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    {subscriberData.churnRate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {subscriberData.totalChurned} total unfavorited
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Subscriber Growth
              </h2>
              
              {/* Graph Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedGraph('weekly')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedGraph === 'weekly'
                      ? 'bg-white text-violet-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSelectedGraph('monthly')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedGraph === 'monthly'
                      ? 'bg-white text-violet-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="h-64 sm:h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-200 border-t-violet-600"></div>
              </div>
            ) : currentGraphData.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentGraphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="subscribed" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="New Subscribers"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="churned" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Churned"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      name="Net Growth"
                      dot={{ r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-lg font-medium">No data available yet</p>
                  <p className="text-sm mt-2">Growth data will appear once readers start subscribing</p>
                </div>
              </div>
            )}

            {/* Legend Description */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">New subscribers added</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Readers who unfavorited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                  <span className="text-gray-600">Overall net growth</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}