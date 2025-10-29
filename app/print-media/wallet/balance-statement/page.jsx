"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Clock, X, Download, Filter } from "lucide-react"
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher"
import { useWallet } from "@/hooks/useWallet"
import { generateBalanceStatementPDF } from '@/utils/pdfUtils' // Import the new utility

export default function BalanceStatement() {
  const { publisher, loading: publisherLoading } = useCurrentPublisher("currentPublisherId")
  const wallet = useWallet(publisher?.id)

  // Filter states
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filter transactions based on selected criteria
  const filteredTransactions = wallet.transactions.filter(transaction => {
    // Date filtering
    if (dateFrom || dateTo) {
      const transactionDate = new Date(transaction.date?.split('/').reverse().join('-') || transaction.date)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null

      if (fromDate && transactionDate < fromDate) return false
      if (toDate && transactionDate > toDate) return false
    }

    // Source filtering
    if (sourceFilter && transaction.source !== sourceFilter) return false

    return true
  })

  // Get unique sources for filter dropdown
  const uniqueSources = [...new Set(wallet.transactions.map(t => t.source).filter(Boolean))]

  // Clear all filters
  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setSourceFilter('')
  }

  // Show loading state
  if (publisherLoading || wallet.loading) {
    return (
      <div className="bg-white border rounded-lg shadow-xl w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading balance statement...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (wallet.error) {
    return (
      <div className="bg-white border rounded-lg shadow-xl w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-red-600">
            <p>Error loading balance statement: {wallet.error}</p>
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
      <div className="bg-white border rounded-lg shadow-xl w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-orange-600">
            <p>Publisher data not available</p>
            <p className="text-sm text-gray-600 mt-2">Please make sure you're logged in</p>
          </div>
        </div>
      </div>
    )
  }

  // PDF Generation Function
  const generatePDF = async () => {
    // The filters object can be expanded if you want to show them on the PDF
    const filters = { dateFrom, dateTo, sourceFilter };
    await generateBalanceStatementPDF(wallet, filteredTransactions, filters);
  }

  return (
    <div className="bg-white border rounded-lg shadow-xl w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link
              href="/print-media/wallet"
              className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
            >
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-xl font-semibold text-gray-900">Balance Statement</h2>
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
          <div className="bg-gray-50 p-4 rounded-lg border">
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

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">All Sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-500 text-white rounded px-3 py-2 text-sm hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(dateFrom || dateTo || sourceFilter) && (
              <div className="mt-3 flex flex-wrap gap-2">
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
                {sourceFilter && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    Source: {sourceFilter.charAt(0).toUpperCase() + sourceFilter.slice(1)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Content */}
      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-700">Available Balance</p>
            <p className="text-2xl font-bold text-blue-900">
              R{wallet.availableBalance.toLocaleString()},00
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-700">Total Earnings</p>
            <p className="text-2xl font-bold text-green-900">
              R{wallet.totalEarnings.toLocaleString()},00
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-700">Total Withdrawn</p>
            <p className="text-2xl font-bold text-red-900">
              R{wallet.withdrawn.toLocaleString()},00
            </p>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
            <span className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {wallet.transactions.length} transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Time</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Source</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Description</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wallet.loading ? (
                  [...Array(5)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    </tr>
                  ))
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{transaction.date}</td>
                      <td className="px-6 py-4 text-gray-900">{transaction.time}</td>
                      <td className="px-6 py-4 text-gray-900">{transaction.source || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-900">{transaction.description || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${
                          transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'earning' ? '+' : '-'}R{transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {wallet.transactions.length === 0
                        ? "No transactions found"
                        : "No transactions match the selected filters"
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-3">
            <Link
              href="/print-media/wallet/balance-statement"
              className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
            >
              Balance Statement
            </Link>
            <Link
              href="/print-media/wallet/withdrawal-history"
              className="border rounded px-4 py-2 text-sm font-medium"
            >
              Withdrawal History
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/print-media/wallet"
              className="border rounded px-4 py-2 text-sm font-medium"
            >
              Back to Wallet
            </Link>
            <button
              onClick={generatePDF}
              className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Download size={16} />
              Download Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}