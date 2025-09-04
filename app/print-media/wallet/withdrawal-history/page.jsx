"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft ,Filter, Check, Clock, X} from "lucide-react"
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher"
import { useWallet } from "@/hooks/useWallet"

export default function WithdrawalHistory() {
  const { publisher, loading: publisherLoading } = useCurrentPublisher("currentPublisherId")
  const wallet = useWallet(publisher?.id)

  // Filter transactions to show only withdrawals
  const withdrawalTransactions = wallet.transactions.filter(
    transaction => transaction.type === 'withdrawal'
  )

  // Calculate total withdrawn from filtered transactions
  const totalWithdrawn = withdrawalTransactions.reduce(
    (sum, transaction) => sum + transaction.amount, 0
  )

  // Show loading state
  if (publisherLoading || wallet.loading) {
    return (
      <div className="bg-white border rounded-lg shadow-md w-full max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading withdrawal history...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (wallet.error) {
    return (
      <div className="bg-white border rounded-lg shadow-md w-full max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-red-600">
            <p>Error loading withdrawal history: {wallet.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if publisher is loaded
  if (!publisher || !publisher.id) {
    return (
      <div className="bg-white border rounded-lg shadow-md w-full max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-orange-600">
            <p>Publisher data not available</p>
            <p className="text-sm text-gray-600 mt-2">Please make sure you're logged in</p>
          </div>
        </div>
      </div>
    )
  }

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
            <th className="px-4 py-2 text-left font-medium">Method</th>
            <th className="px-4 py-2 text-left font-medium">Amount(R)</th>
            <th className="px-4 py-2 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {publisherLoading || wallet.loading ? (
            [...Array(3)].map((_, idx) => (
              <tr key={idx} className="border-t animate-pulse">
                {Array(5)
                  .fill("")
                  .map((_, i) => (
                    <td key={i} className="px-4 py-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </td>
                  ))}
              </tr>
            ))
          ) : withdrawalTransactions.length > 0 ? (
            withdrawalTransactions.map((transaction, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{transaction.date}</td>
                <td className="px-4 py-2">{transaction.time}</td>
                <td className="px-4 py-2">{transaction.method || 'Bank Transfer'}</td>
                <td className="px-4 py-2">R {transaction.amount.toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span className={`flex items-center gap-1 ${
                    transaction.status === 'success'
                      ? 'text-green-600'
                      : transaction.status === 'processing'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.status === 'success' ? (
                      <Check size={14} strokeWidth={3} />
                    ) : transaction.status === 'processing' ? (
                      <Clock size={14} />
                    ) : (
                      <X size={14} />
                    )}
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                No withdrawal transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mt-4 text-sm">
        <div className="text-right">
          <p>Total Withdrawn <span className="ml-4 font-medium">R {totalWithdrawn.toLocaleString()}</span></p>
          <p>Available Balance <span className="ml-4 font-medium">R {wallet.availableBalance.toLocaleString()}</span></p>
          <p>Total Transactions <span className="ml-4 font-medium">{withdrawalTransactions.length}</span></p>
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