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
    <div className="col-span-2 bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2 text-sm">Weekly Performance</h2>
      <div className="h-40 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">
        <ResponsiveContainer width="100%" height={200}>
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
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2 text-sm">Revenue Distribution</h2>
      <div className="h-56 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 font-bold">
        <ResponsiveContainer width="100%" height={250}>
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
    <div className="flex items-center bg-white p-4 rounded-xl shadow">
      <ul className="mt-4 space-y-1 text-sm">
        <li><span className="inline-block w-3 h-3 bg-[#9C27B0] mr-2 rounded-full"></span>KZN (45%)</li>
        <li><span className="inline-block w-3 h-3 bg-[#03A9F4] mr-2 rounded-full"></span>Cape Town (30%)</li>
        <li><span className="inline-block w-3 h-3 bg-[#FFC107] mr-2 rounded-full"></span>North West (10%)</li>
        <li><span className="inline-block w-3 h-3 bg-[#4CAF50] mr-2 rounded-full"></span>Gauteng (15%)</li>
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
    <div className="bg-white p-4 rounded-xl shadow flex items-center space-x-4">
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
  return (
    <>
      <Header />
      <div className="flex">
        <PublisherSidebar />
        <div className="flex-1 min-h-screen bg-gray-100 p-6">
          {/* Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Weekly Performance Chart */}
            <WeeklyPerformanceChart />

            {/* Stats Panel */}
            <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Distribution */}
            <RevenueDistributionChart />
            <RevenueLegend />
          </div>

          {/* Footer */}
          <footer className="mt-10 text-center text-sm text-gray-600">
            <div className="flex justify-center items-center space-x-2 mb-2">
              <img src="/Presspass.png" alt="Logo" className="h-8" />
              <span className="text-xs">© 2025 Press-Pass. All Rights Reserved.</span>
            </div>
            <div className="space-x-4">
              <a href="#" className="hover:underline">Terms of Use</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

