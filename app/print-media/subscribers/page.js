'use client'

import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const subscriberData = [
  { month: 'Jan', subscribers: 32000 },
  { month: 'Feb', subscribers: 34500 },
  { month: 'Mar', subscribers: 36800 },
  { month: 'Apr', subscribers: 38200 },
  { month: 'May', subscribers: 40100 },
  { month: 'Jun', subscribers: 42300 },
  { month: 'Jul', subscribers: 44170 },
]

const subscriberTypes = [
  { type: 'Premium', count: 18250, percentage: 41.3, color: '#8884d8' },
  { type: 'Standard', count: 15920, percentage: 36.0, color: '#82ca9d' },
  { type: 'Basic', count: 10000, percentage: 22.7, color: '#ffc658' },
]

export default function Subscribers() {
  return (
    <>
      <Header />
      <div className="flex">
        <PublisherSidebar />
        <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Subscribers</h1>
        <button className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm">
          Export Data
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Subscribers</h2>
          <p className="text-3xl font-bold mt-2">44,170</p>
          <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">New Subscribers (This Month)</h2>
          <p className="text-3xl font-bold mt-2">1,870</p>
          <p className="text-sm text-green-600 mt-1">+4.4% from last month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Churn Rate</h2>
          <p className="text-3xl font-bold mt-2">2.3%</p>
          <p className="text-sm text-green-600 mt-1">-0.5% from last month</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Subscriber Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }}
                  name="Subscribers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Subscriber Types</h2>
          <ul className="space-y-4">
            {subscriberTypes.map((item, index) => (
              <li key={index} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.type}</h3>
                    <p className="text-sm text-gray-500">{item.count.toLocaleString()} subscribers</p>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Subscriber Acquisition</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Direct</p>
                <p className="font-medium">62%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Referral</p>
                <p className="font-medium">24%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Social</p>
                <p className="font-medium">10%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-500">Other</p>
                <p className="font-medium">4%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  )
}
