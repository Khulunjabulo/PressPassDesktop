"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function BalanceStatement() {
  const [loading, setLoading] = useState(true)

  const rows = [
    { date: "21 Jun, 2025", time: "16:00", source: "Monetization", description: "Payout", amount: 97133, status: "success" },
    { date: "19 Jun, 2025", time: "09:15", source: "Referral", description: "Bonus", amount: 12000, status: "success" },
    { date: "10 Jun, 2025", time: "14:05", source: "Ads", description: "Campaign Payment", amount: 55000, status: "success" }
  ]

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-white border rounded shadow-sm p-4">
      <div className="flex items-center mb-4">
        <Link href="/print-media/wallet" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
          <ArrowLeft size={20} />
          <span className="ml-1">Back to Wallet</span>
        </Link>
        <h2 className="text-lg font-bold">Balance Statement</h2>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Time</th>
            <th className="px-4 py-2 text-left">Source</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Amount(R)</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? [...Array(3)].map((_, idx) => (
                <tr key={idx} className="border-t animate-pulse">
                  {Array(6).fill("").map((_, i) => (
                    <td key={i} className="px-4 py-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">{row.time}</td>
                  <td className="px-4 py-2">{row.source}</td>
                  <td className="px-4 py-2">{row.description}</td>
                  <td className="px-4 py-2">R {row.amount.toLocaleString()}</td>
                  <td className={`px-4 py-2 font-semibold ${row.status === "success" ? "text-green-600" : "text-red-600"}`}>
                    {row.status === "success" ? "✓" : "✗"}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
