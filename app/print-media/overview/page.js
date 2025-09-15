'use client'

import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { Wallet, Users, BarChart2, Rss } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

/**
 * Sample data for weekly performance chart
 */
const weeklyData = [
  { day: 'Mon', value: 50000 },
  { day: 'Tue', value: 56000 },
  { day: 'Wed', value: 53000 },
  { day: 'Thu', value: 67000 },
  { day: 'Fri', value: 64000 },
  { day: 'Sat', value: 48000 },
  { day: 'Sun', value: 42000 },
]

/**
 * Sample data for revenue distribution pie chart
 */
const pieData = [
  { name: 'Kwazulu Natal', value: 45, color: '#9C27B0' },
  { name: 'Cape Town', value: 30, color: '#03A9F4' },
  { name: 'North West', value: 10, color: '#FFC107' },
  { name: 'Gauteng', value: 15, color: '#4CAF50' },
]

/**
 * Weekly Performance Area Chart Component
 * @returns {JSX.Element} Weekly performance chart
 */
function WeeklyPerformanceChart() {
  return (
    <div className="col-span-2 bg-white p-4 rounded-xl shadow min-w-0 w-full">
      <h2 className="font-semibold mb-4 text-sm">Weekly Performance</h2>
      <div className="h-48 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold w-full">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              fill="#d5c9ff"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/**
 * Revenue Distribution Pie Chart Component
 * @returns {JSX.Element} Revenue distribution chart
 */
function RevenueDistributionChart() {
  return (
    <div className="bg-white p-4 rounded-xl shadow min-w-0 w-full">
      <h2 className="font-semibold mb-2 text-sm">Revenue Distribution</h2>
      <div className="h-56 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold w-full">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/**
 * Legend for Revenue Distribution Pie Chart
 * @returns {JSX.Element} Chart legend
 */
function RevenueLegend() {
  return (
    <div className="flex items-center bg-white p-4 rounded-xl shadow min-w-0 w-full">
      <ul className="mt-2 space-y-3 text-sm w-full">
        <li><span className="inline-block w-4 h-4 bg-[#9C27B0] mr-3 rounded-full"></span>KZN (45%)</li>
        <li><span className="inline-block w-4 h-4 bg-[#03A9F4] mr-3 rounded-full"></span>Cape Town (30%)</li>
        <li><span className="inline-block w-4 h-4 bg-[#FFC107] mr-3 rounded-full"></span>North West (10%)</li>
        <li><span className="inline-block w-4 h-4 bg-[#4CAF50] mr-3 rounded-full"></span>Gauteng (15%)</li>
      </ul>
    </div>
  );
}

/**
 * Stat Card Component for displaying metrics
 * @param {Object} props - Component props
 * @param {JSX.Element} props.icon - Icon to display
 * @param {string} props.title - Stat title
 * @param {string} props.value - Stat value
 * @param {string} props.change - Percentage change
 * @returns {JSX.Element} Stat card component
 */
function StatCard({ icon, title, value, change }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center space-x-4 w-full min-w-0">
      <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <h4 className="text-xs text-gray-500">{title}</h4>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-green-600">{change} vs last period</p>
      </div>
    </div>
  )
}

/**
 * Dashboard Overview Page
 * @returns {JSX.Element} Dashboard page
 */
export default function Dashboard() {
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");
  
  return (
    <>
      <Header publisher={publisher} />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex flex-1 w-full overflow-hidden">
          <PublisherSidebar />
          <main className="flex-1 min-h-screen bg-gray-100 p-2 md:p-4 lg:p-6 flex flex-col">
            {/* Top Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 w-full">
              {/* Weekly Performance Chart */}
              <div className="md:col-span-2 col-span-1 w-full min-w-0">
                <WeeklyPerformanceChart />
              </div>
              {/* Stats Panel */}
              <div className="grid grid-cols-2 gap-4 w-full min-w-0">
                <StatCard
                  icon={<Wallet className="text-green-600" />}
                  title="Total Revenue"
                  value="R602.867"
                  change="+15.3%"
                />
                <StatCard
                  icon={<Users className="text-indigo-600" />}
                  title="Total Subscribers"
                  value="44.170"
                  change="+12.5%"
                />
                <StatCard
                  icon={<BarChart2 className="text-sky-600" />}
                  title="Page Views"
                  value="1.2M"
                  change="+15.3%"
                />
                <StatCard
                  icon={<Rss className="text-orange-500" />}
                  title="RSS Subscribers"
                  value="37,700"
                  change="+6.8%"
                />
              </div>
            </div>
            {/* Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <RevenueDistributionChart />
              <RevenueLegend />
            </div>
          </main>
        </div>
        <PrintMediaFooter />
      </div>
    </>
  )
}

