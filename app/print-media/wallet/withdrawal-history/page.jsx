"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function WithdrawalHistory() {
  const [loading, setLoading] = useState(true)

  const rows = [
    { date: "10 Aug, 2025", time: "11:00", amount: 8123, status: "success" },
    { date: "05 Aug, 2025", time: "14:20", amount: 15000, status: "success" },
    { date: "29 Jul, 2025", time: "09:45", amount: 9000, status: "success" }
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
        <h2 className="text-lg font-bold">Withdrawal History</h2>
      </div>
      <table className="w-full text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Time</th>
            <th className="px-4 py-2 text-left">Amount(R)</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? [...Array(3)].map((_, idx) => (
                <tr key={idx} className="border-t animate-pulse">
                  {Array(4).fill("").map((_, i) => (
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
