"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft ,Filter, Check, Clock, X} from "lucide-react"
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher"
import { useWallet } from "@/hooks/useWallet"

export default function WithdrawalHistory() {
  const { publisher, loading: publisherLoading } = useCurrentPublisher("currentPublisherId")
  const wallet = useWallet(publisher?.id)

  // Filter states
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filter transactions to show only withdrawals
  const withdrawalTransactions = wallet.transactions.filter(
    transaction => transaction.type === 'withdrawal'
  )

  // Apply additional filters
  const filteredTransactions = withdrawalTransactions.filter(transaction => {
    // Date filtering
    if (dateFrom || dateTo) {
      const transactionDate = new Date(transaction.date?.split('/').reverse().join('-') || transaction.date)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      if (fromDate && transactionDate < fromDate) return false
      if (toDate && transactionDate > toDate) return false
    }

    // Method filtering
    if (methodFilter && transaction.method !== methodFilter) return false

    // Status filtering
    if (statusFilter && transaction.status !== statusFilter) return false

    return true
  })

  // Get unique methods and statuses for filter dropdowns
  const uniqueMethods = [...new Set(withdrawalTransactions.map(t => t.method).filter(Boolean))]
  const uniqueStatuses = [...new Set(withdrawalTransactions.map(t => t.status).filter(Boolean))]

  // Calculate total withdrawn from filtered transactions
  const totalWithdrawn = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.amount, 0
  )

  // Clear all filters
  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setMethodFilter('')
    setStatusFilter('')
  }

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
      <div className="mb-4">
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-600 hover:text-black flex items-center gap-1 text-sm px-3 py-1 border rounded"
          >
            <Filter size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Methods</option>
                  {uniqueMethods.map(method => (
                    <option key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white rounded px-3 py-1 text-sm hover:bg-gray-600"
              >
                Clear All Filters
              </button>

              {/* Active Filters Display */}
              {(dateFrom || dateTo || methodFilter || statusFilter) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {dateFrom && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      From: {new Date(dateFrom).toLocaleDateString()}
                    </span>
                  )}
                  {dateTo && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      To: {new Date(dateTo).toLocaleDateString()}
                    </span>
                  )}
                  {methodFilter && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      Method: {methodFilter.charAt(0).toUpperCase() + methodFilter.slice(1)}
                    </span>
                  )}
                  {statusFilter && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction, idx) => (
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
                {withdrawalTransactions.length === 0
                  ? "No withdrawal transactions found"
                  : "No transactions match the selected filters"
                }
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-between items-start mt-4 text-sm">
        <div className="text-left">
          <p className="text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredTransactions.length}</span> of{' '}
            <span className="font-medium text-gray-900">{withdrawalTransactions.length}</span> withdrawal transactions
          </p>
        </div>
        <div className="text-right">
          <p>Total Withdrawn <span className="ml-4 font-medium">R {totalWithdrawn.toLocaleString()}</span></p>
          <p>Available Balance <span className="ml-4 font-medium">R {wallet.availableBalance.toLocaleString()}</span></p>
          <p>Filtered Transactions <span className="ml-4 font-medium">{filteredTransactions.length}</span></p>
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