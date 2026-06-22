'use client'

import React, { useState, useEffect } from 'react';
import Header from '@/components/UI/header';
import PublisherSidebar from '@/components/UI/publisherSidebar'
import { Wallet, Users, BarChart2, Rss } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import { useWallet } from "@/hooks/useWallet";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

function WeeklyPerformanceChart({ data }) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="p-2 bg-white border rounded-lg shadow-lg text-sm">
          <p className="font-bold mb-1 text-gray-700">{d.label}</p>
          <p className="text-green-600">New: {d.subscribed}</p>
          <p className="text-red-600">Churn: {d.churned}</p>
          <p className="font-semibold mt-1 text-gray-800">Net: {d.net}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="col-span-2 bg-white p-4 rounded-xl shadow min-w-0 w-full">
      <h2 className="font-semibold mb-4 text-sm">Weekly Growth</h2>
      <div className="h-48 bg-purple-100 rounded-xl flex items-center justify-center w-full">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="net" stroke="#8884d8" fill="#d5c9ff" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RevenueDistributionChart({ data: pieData }) {
  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;
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
      <div className="h-56 bg-purple-100 rounded-xl flex items-center justify-center w-full">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={renderLabel} animationDuration={800}>
              {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RevenueLegend({ data: pieData, total }) {
  return (
    <div className="flex items-center bg-white p-4 rounded-xl shadow min-w-0 w-full">
      <ul className="mt-2 space-y-3 text-sm w-full">
        {pieData.map(entry => {
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
          return (
            <li key={entry.name}>
              <span className="inline-block w-4 h-4 mr-3 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name} ({percentage}%)
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatCard({ icon, title, value, change, showPeriod = true }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center space-x-4 w-full min-w-0">
      <div className="p-2 bg-gray-100 rounded-full">{icon}</div>
      <div>
        <h4 className="text-xs text-gray-500">{title}</h4>
        <p className="text-lg font-bold">{value}</p>
        <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}{showPeriod && ' vs last period'}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");
  const wallet = useWallet(publisher?.id);
  const [subscriberData, setSubscriberData] = useState({ count: 0, change: '+0.0%' });
  const [pageViewsData, setPageViewsData] = useState({ count: 0, change: '+0.0%' });
  const [rssSubscribersData, setRssSubscribersData] = useState({ count: 0, change: '+0.0%' });
  const [weeklyChartData, setWeeklyChartData] = useState([]);

  useEffect(() => {
    const fetchAllAnalytics = async (currentPublisher) => {
      try {
        const [subscribersResponse, analyticsResponse] = await Promise.all([
          fetch(`/api/subscribers?publisherId=${currentPublisher.id}`),
          fetch(`/api/overview?publisherId=${currentPublisher.id}`)
        ]);
        if (subscribersResponse.ok) {
          const data = await subscribersResponse.json();
          if (data.success) {
            setSubscriberData({ count: data.subscriberCount, change: data.change });
            setWeeklyChartData(data.growthData?.weekly || []);
          }
        }
        if (analyticsResponse.ok) {
          const data = await analyticsResponse.json();
          if (data.success) {
            setPageViewsData(data.pageViews);
            setRssSubscribersData(data.rssSubscribers);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard analytics:", error);
      }
    };
    if (publisher?.id) fetchAllAnalytics(publisher);
  }, [publisher?.id]);

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100.0%' : '+0.0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const today = new Date();
  const startOfThisWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
  startOfThisWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const thisWeekEarnings = wallet.transactions.filter(t => t.type === 'earning' && new Date(t.date) >= startOfThisWeek).reduce((s, t) => s + t.amount, 0);
  const lastWeekEarnings = wallet.transactions.filter(t => t.type === 'earning' && new Date(t.date) >= startOfLastWeek && new Date(t.date) < startOfThisWeek).reduce((s, t) => s + t.amount, 0);
  const revenueChange = calculatePercentageChange(thisWeekEarnings, lastWeekEarnings);

  const adsEarnings      = wallet.transactions.filter(t => t.source === 'ads'      && t.type === 'earning').reduce((s, t) => s + t.amount, 0);
  const sponsoredEarnings = wallet.transactions.filter(t => t.source === 'sponsored' && t.type === 'earning').reduce((s, t) => s + t.amount, 0);
  const referralEarnings  = wallet.transactions.filter(t => t.source === 'referral'  && t.type === 'earning').reduce((s, t) => s + t.amount, 0);
  const totalDistribution = adsEarnings + sponsoredEarnings + referralEarnings;

  let revenueDistributionData = [
    { name: 'Ads', value: adsEarnings, color: '#9C27B0' },
    { name: 'Sponsored articles', value: sponsoredEarnings, color: '#03A9F4' },
    { name: 'Referral', value: referralEarnings, color: '#FFC107' },
  ].filter(item => item.value > 0);

  if (revenueDistributionData.length === 0) {
    revenueDistributionData = [{ name: 'No earnings yet', value: 1, color: '#E0E0E0' }];
  }

  return (
    <>
      <Header publisher={publisher} />

      {/*
        flex-row: sidebar + main side by side
        min-h-screen: fills viewport
        NO overflow-hidden — would clip sticky sidebar
      */}
      <div className="flex flex-row min-h-screen bg-gray-50">
        <PublisherSidebar />

        {/* Main scrolls independently */}
        <main className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-6">
          {/* Top grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 w-full">
            <div className="md:col-span-2 col-span-1 w-full min-w-0">
              <WeeklyPerformanceChart data={weeklyChartData} />
            </div>
            <div className="grid grid-cols-2 gap-4 w-full min-w-0">
              <StatCard icon={<Wallet className="text-green-600" />}   title="Total Revenue"      value={`R${wallet.totalEarnings.toLocaleString()}`}         change={revenueChange} />
              <StatCard icon={<Users className="text-indigo-600" />}   title="Total Subscribers"  value={subscriberData.count.toLocaleString()}                change={subscriberData.change} />
              <StatCard icon={<BarChart2 className="text-sky-600" />}  title="Page Views"         value={pageViewsData.count.toLocaleString()}                 change={pageViewsData.change} />
              <StatCard icon={<Rss className="text-orange-500" />}     title="RSS Subscribers"    value={rssSubscribersData.count.toLocaleString()}            change={rssSubscribersData.change} />
            </div>
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <RevenueDistributionChart data={revenueDistributionData} />
            <RevenueLegend data={revenueDistributionData} total={totalDistribution} />
          </div>
        </main>
      </div>

      <PrintMediaFooter />
    </>
  );
}