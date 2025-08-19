"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft ,Filter, Check} from "lucide-react"

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
    <div className="bg-white border rounded-lg shadow-md w-full max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Link
            href="/print-media/wallet"
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-base font-semibold">Withdrawal History</h2>
        </div>
        <button className="text-gray-600 hover:text-black flex items-center gap-1 text-sm">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Table */}
      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Date</th>
            <th className="px-4 py-2 text-left font-medium">Time</th>
            <th className="px-4 py-2 text-left font-medium">Amount(R)</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? [...Array(3)].map((_, idx) => (
                <tr key={idx} className="border-t animate-pulse">
                  {Array(4)
                    .fill("")
                    .map((_, i) => (
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
                  <td className="px-4 py-2 text-green-600 flex items-center gap-1">
                    <Check size={14} strokeWidth={3} />
                    {row.status}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mt-4 text-sm">
        <div className="text-right">
          <p>Total Withdrawn <span className="ml-4 font-medium">R 971,33</span></p>
          <p>Remaining Balance <span className="ml-4 font-medium">R 602,867</span></p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between mt-6">
        <div className="space-x-2">
          <button className="border rounded px-3 py-1 text-sm">Balance Statement</button>
          <button className="bg-blue-600 text-white rounded px-3 py-1 text-sm">Withdraw History</button>
        </div>
        <div className="space-x-2">
          <button className="border rounded px-3 py-1 text-sm">Close</button>
          <button className="border rounded px-3 py-1 text-sm">Download</button>
        </div>
      </div>
    </div>
  )
}