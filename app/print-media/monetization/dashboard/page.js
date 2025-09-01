"use client"

import { Button } from "@/components/UI/Button"
import { Card, CardContent } from "@/components/MonetizationCards"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import NewsReaderHeader from "@/components/news-reader/NewsReaderHeader"
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

const demographicData = [
  { name: "18 - 34 Demographic", value: 20, color: "#1E40AF" },
  { name: "35 - 49 Demographic", value: 9, color: "#3B82F6" },
  { name: "50 - 64 Demographic", value: 6, color: "#1D4ED8" },
  { name: "65 and Older", value: 65, color: "#60A5FA" },
]

const filterButtons = [
  { label: "Ad Network Clicks", active: true },
  { label: "Ad Impressions", active: true },
  { label: "Source Summary", active: true },
  { label: "CPC Per Source", active: true },
  { label: "CPR And CPQ Blend", active: true },
  { label: "Campaign Performance", active: true },
]

const metrics = [
  { title: "Advertisement Cost", value: "R12,500.00", color: "text-blue-600" },
  { title: "Clicks", value: "12,345", color: "text-blue-600" },
  { title: "Impressions", value: "775,390", color: "text-blue-600" },
  { title: "Cost Per Click", value: "R15.00", color: "text-blue-600" },
  { title: "Click-Through-Rate", value: "5.14%", color: "text-blue-600" },
  { title: "Cost Per 1000 (Impressions)", value: "R75.00", color: "text-blue-600" },
]

export default function AnalyticsDashboard() {
  return (
    <>
      <NewsReaderHeader />
    
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with date range and filters button */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-medium text-gray-700">06 Jul 2025 - 13 Jul 2025</div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">Filters</Button>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {filterButtons.map((button, index) => (
            <Button
              key={index}
              variant={button.active ? "default" : "outline"}
              className={`px-4 py-2 rounded-lg border ${
                button.active
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {button.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart */}
          <Card className="lg:col-span-1 bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
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
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend beneath chart */}
              <div className="mt-6 space-y-2">
                {demographicData.map((item, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-blue-600 font-medium">{item.value}%</span>
                    <span className="text-gray-600 ml-1">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index} className="bg-white border border-gray-200 rounded-lg">
                <CardContent className="p-6 text-center">
                  <h3 className="text-gray-700 font-medium mb-2 text-sm">{metric.title}</h3>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>

    <PrintMediaFooter/>
    </>
  )
}
