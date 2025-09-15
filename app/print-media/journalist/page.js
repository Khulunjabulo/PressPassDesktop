'use client'

import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher"

const journalists = [
  {
    name: 'Sarah Mitchell',
    articles: 45,
    status: 'Active',
    views: 125000,
    engagement: 8.2,
    color: '#4ade80',
  },
  {
    name: 'David Chen',
    articles: 38,
    status: 'Active',
    views: 98000,
    engagement: 7.8,
    color: '#22c55e',
  },
  {
    name: 'Maria Rodriguez',
    articles: 30,
    status: 'Active',
    views: 89000,
    engagement: 7.5,
    color: '#16a34a',
  },
  {
    name: 'James Wilson',
    articles: 28,
    status: 'Away',
    views: 76000,
    engagement: 7.1,
    color: '#15803d',
  },
  {
    name: 'Emily Johnson',
    articles: 20,
    status: 'Active',
    views: 68000,
    engagement: 6.9,
    color: '#166534',
  },
]

export default function Journalist() {
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");

  return (
    <>
      <Header publisher={publisher} />
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
        <PublisherSidebar />
        <main className="flex-1 p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Top Journalists</h1>
            <button className="bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 text-sm w-full sm:w-auto">
              Add Journalist
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {journalists.map((journalist, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow p-4 flex flex-col justify-between hover:shadow-md transition min-w-0"
              >
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-800">{journalist.name}</h2>
                  <p className="text-xs md:text-sm text-gray-500">{journalist.articles} articles published</p>
                  <p className={`text-xs mt-1 ${journalist.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>
                    ● {journalist.status}
                  </p>
                </div>

                <div className="my-4 h-24 sm:h-28 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ engagement: journalist.engagement }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="engagement" hide />
                      <YAxis hide domain={[0, 10]} />
                      <Tooltip />
                      <Bar
                        dataKey="engagement"
                        fill={journalist.color}
                        animationDuration={1500}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-between items-center text-xs md:text-sm text-gray-700">
                  <span className="font-medium">{(journalist.views / 1000).toFixed(0)}k views</span>
                  <span className="text-green-600 font-medium">{journalist.engagement}% engagement</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}