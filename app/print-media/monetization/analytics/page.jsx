'use client';

import { useState, useEffect } from "react";
import NewsReaderHeader from "@/components/news-reader/NewsReaderHeader";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';
import { Button } from "@/components/UI/Button";
import { Card, CardContent } from "@/components/MonetizationCards";
import { 
  TrendingUp, 
  MousePointer, 
  Eye, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import Link from "next/link";

// Sample data - replace with real API calls
const demographicData = [
  { name: "18-34", value: 20, color: "#3B82F6" },
  { name: "35-49", value: 9, color: "#10B981" },
  { name: "50-64", value: 6, color: "#F59E0B" },
  { name: "65+", value: 65, color: "#EF4444" },
];

const weeklyData = [
  { day: 'Mon', clicks: 120, impressions: 2400, revenue: 180 },
  { day: 'Tue', clicks: 150, impressions: 2800, revenue: 225 },
  { day: 'Wed', clicks: 180, impressions: 3200, revenue: 270 },
  { day: 'Thu', clicks: 140, impressions: 2600, revenue: 210 },
  { day: 'Fri', clicks: 200, impressions: 3800, revenue: 300 },
  { day: 'Sat', clicks: 90, impressions: 1800, revenue: 135 },
  { day: 'Sun', clicks: 110, impressions: 2200, revenue: 165 },
];

const deviceData = [
  { name: 'Desktop', value: 60, color: '#3B82F6' },
  { name: 'Mobile', value: 35, color: '#10B981' },
  { name: 'Tablet', value: 5, color: '#F59E0B' },
];

export default function AnalyticsDashboard() {
  const { publisher, loading: publisherLoading } = useCurrentPublisher();
  const [currentPublisherId, setCurrentPublisherId] = useState(null);
  const [dateRange, setDateRange] = useState('7days');
  const [activeChart, setActiveChart] = useState('performance'); // performance, demographics, devices

  useEffect(() => {
    const publisherId = localStorage.getItem('currentPublisherId');
    setCurrentPublisherId(publisherId);
  }, []);

  const metrics = [
    { 
      title: "Total Revenue", 
      value: "R12,500", 
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      title: "Total Clicks", 
      value: "12,345", 
      change: "+8.2%",
      icon: MousePointer,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    { 
      title: "Total Impressions", 
      value: "775,390", 
      change: "+15.7%",
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      title: "Average CTR", 
      value: "5.14%", 
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
  ];

  const secondaryMetrics = [
    { title: "Cost Per Click", value: "R15.00", color: "text-blue-600" },
    { title: "CPM (Cost Per 1000)", value: "R75.00", color: "text-blue-600" },
    { title: "Conversion Rate", value: "3.2%", color: "text-green-600" },
    { title: "Avg. Session Duration", value: "4m 32s", color: "text-purple-600" },
  ];

  const dateRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  if (publisherLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NewsReaderHeader />
      
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Track your ad performance and revenue</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
                
                <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Filter size={18} className="mr-2" />
                  Filters
                </Button>
                
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Download size={18} className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Primary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${metric.bgColor} p-3 rounded-lg`}>
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-green-600">{metric.change}</span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{metric.title}</h3>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveChart('performance')}
                  className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeChart === 'performance'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 size={18} className="inline mr-2" />
                  Performance Trends
                </button>
                <button
                  onClick={() => setActiveChart('demographics')}
                  className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeChart === 'demographics'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PieChartIcon size={18} className="inline mr-2" />
                  Demographics
                </button>
                <button
                  onClick={() => setActiveChart('devices')}
                  className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeChart === 'devices'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Activity size={18} className="inline mr-2" />
                  Device Breakdown
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeChart === 'performance' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={weeklyData}>
                      <defs>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="clicks" stroke="#3B82F6" fillOpacity={1} fill="url(#colorClicks)" />
                      <Area type="monotone" dataKey="impressions" stroke="#10B981" fillOpacity={1} fill="url(#colorImpressions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeChart === 'demographics' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Demographics</h3>
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={demographicData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {demographicData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-4">
                      {demographicData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <span className="text-xl font-bold" style={{ color: item.color }}>
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeChart === 'devices' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {deviceData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-4">
                      {deviceData.map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <span className="text-xl font-bold" style={{ color: item.color }}>
                              {item.value}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${item.value}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {secondaryMetrics.map((metric, index) => (
              <Card key={index} className="bg-white border border-gray-200 rounded-lg">
                <CardContent className="p-6 text-center">
                  <h3 className="text-gray-600 font-medium mb-2 text-sm">{metric.title}</h3>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/print-media/monetization/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <BarChart3 size={18} />
                View Dashboard
              </Link>
              <Link
                href="/print-media/monetization/advertise"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                <TrendingUp size={18} />
                Create Campaign
              </Link>
              <button
                onClick={() => alert('Downloading report...')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
              >
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <PrintMediaFooter />
    </>
  );
}