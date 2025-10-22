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
import { useWallet } from "@/hooks/useWallet";
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
 * @param {Object[]} props.data - The data for the pie chart.
 * @returns {JSX.Element} Revenue distribution chart
 */
function RevenueDistributionChart({ data: pieData }) {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    if (percent === 0) return null; // Don't render a label for 0%

    // Position the label inside the slice
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
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
              animationDuration={800}
              labelLine={false}
              label={renderCustomizedLabel}
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
 * @param {Object[]} props.data - The data for the legend.
 * @returns {JSX.Element} Chart legend
 */
function RevenueLegend({ data: pieData, total }) {
  return (
    <div className="flex items-center bg-white p-4 rounded-xl shadow min-w-0 w-full">
      <ul className="mt-2 space-y-3 text-sm w-full">
        {pieData.map(entry => {
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
          return (
            <li key={entry.name}>
              <span 
                className="inline-block w-4 h-4 mr-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></span>
              {entry.name} ({percentage}%)
            </li>
          );
        })}
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
 * @param {boolean} [props.showPeriod=true] - Whether to show "vs last period"
 * @returns {JSX.Element} Stat card component
 */
function StatCard({ icon, title, value, change, showPeriod = true }) {
  const isPositive = change.startsWith('+');
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center space-x-4 w-full min-w-0">
      <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <h4 className="text-xs text-gray-500">{title}</h4>
        <p className="text-lg font-bold">{value}</p>
        <p className={`text-xs font-medium ${changeColor}`}>
          {change}
          {showPeriod && ' vs last period'}
        </p>
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
  const wallet = useWallet(publisher?.id);

  /**
   * Calculates the percentage change between two numbers.
   * @param {number} current - The current value.
   * @param {number} previous - The previous value.
   * @returns {string} The formatted percentage change string.
   */
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? '+100.0%' : '+0.0%';
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // --- Real-time Revenue Percentage Calculation ---
  const today = new Date();
  const startOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const thisWeekEarnings = wallet.transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'earning' && transactionDate >= startOfThisWeek;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const lastWeekEarnings = wallet.transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'earning' && transactionDate >= startOfLastWeek && transactionDate < startOfThisWeek;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const revenueChange = calculatePercentageChange(thisWeekEarnings, lastWeekEarnings);

  // --- Real-time Revenue Distribution Calculation ---
  const adsEarnings = wallet.transactions
    .filter(t => t.source === 'ads' && t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const sponsoredEarnings = wallet.transactions
    .filter(t => t.source === 'sponsored' && t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const referralEarnings = wallet.transactions
    .filter(t => t.source === 'referral' && t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDistribution = adsEarnings + sponsoredEarnings + referralEarnings;

  const revenueDistributionData = [
    { name: 'Ads', value: adsEarnings, color: '#9C27B0' },
    { name: 'Sponsored articles', value: sponsoredEarnings, color: '#03A9F4' },
    { name: 'Referral', value: referralEarnings, color: '#FFC107' },
  ].filter(item => item.value > 0); // Only show sources with earnings

  if (revenueDistributionData.length === 0) {
    revenueDistributionData.push({ name: 'No earnings yet', value: 1, color: '#E0E0E0' });
  }

  return (
    <>
      <Header publisher={publisher} />
      <div className="min-h-screen bg-gray-50 flex flex-col pt-16 pb-16">
        <PublisherSidebar />
        <main className="flex-1 bg-gray-100 p-2 md:p-4 lg:p-6 flex flex-col ml-0 md:ml-64 overflow-y-auto">
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
                value={`R${wallet.totalEarnings.toLocaleString()}`}
                change={revenueChange}
                showPeriod={true}
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
            <RevenueDistributionChart data={revenueDistributionData} />
            <RevenueLegend data={revenueDistributionData} total={totalDistribution} />
          </div>
        </main>
      </div>
      <PrintMediaFooter />
    </>
  )
}
