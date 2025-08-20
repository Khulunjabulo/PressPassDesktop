"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Header from '@/components/UI/header'
import { CreditCard, 
  Clock, 
  Banknote, 
  Lightbulb, 
  Megaphone, 
  Newspaper
} from 'lucide-react'
import BalanceStatement from './balance-statement/page'
import WithdrawalHistory from './withdrawal-history/page'
import PaymentMethod from './payment-method/page'
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";

export default function Wallet() {
  const pathname = usePathname()
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState('mobile')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawFrom, setWithdrawFrom] = useState('')
  const [withdrawalOption, setWithdrawalOption] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const { publisher, loading } = useCurrentPublisher("currentPublisherId");

  // Determine which content to show based on the current path
  const renderWalletContent = () => {
    if (pathname === '/print-media/wallet/balance-statement') {
      return <BalanceStatement />
    } else if (pathname === '/print-media/wallet/withdrawal-history') {
      return <WithdrawalHistory />
    } else if (pathname === '/print-media/wallet/payment-method') {
      return <PaymentMethod />
    } else {
      // Default dashboard content
      return (
        <div className="space-y-4">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available Balance */}
            <div className="bg-white border rounded shadow-sm flex flex-col items-center justify-center py-4">
              <p className="text-sm font-medium text-gray-700">Available Balance</p>
              <p className="text-3xl font-extrabold text-gray-900">
                R602,867<span className="text-lg">,00</span>
              </p>
            </div>

            {/* Source of Funds */}
            <div className="bg-white border rounded shadow-sm p-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Withdraw from</label>
              <select
                value={withdrawFrom}
                onChange={(e) => setWithdrawFrom(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs"
              >
                <option value="">Select source</option>
                <option>Monetization</option>
                <option>Ads</option>
                <option>Sponsored articles</option>
              </select>

              <label className="block text-xs font-medium text-gray-600 mt-3 mb-1">Amount to withdraw</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded p-2 text-xs"
              />
            </div>

            {/* Withdraw Methods */}
            <div className="bg-white border rounded shadow-sm p-4">
              <h3 className="text-xs font-medium text-gray-700 mb-2">Withdraw Methods</h3>
              <div className="space-y-2">
                {['bank', 'mobile', 'paypal'].map((method) => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="withdrawMethod"
                      value={method}
                      checked={selectedWithdrawMethod === method}
                      onChange={(e) => setSelectedWithdrawMethod(e.target.value)}
                      className="w-3 h-3 accent-blue-600"
                    />
                    <span
                      className={`text-xs ${
                        selectedWithdrawMethod === method
                          ? method === 'mobile'
                            ? 'text-gray-700 font-semibold'
                            : 'text-gray-700 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {method === 'bank'
                        ? 'Bank'
                        : method === 'mobile'
                        ? 'Mobile Wallet'
                        : 'Paypal'}
                    </span>
                  </label>
                ))}
              </div>

              <label className="block text-xs font-medium text-gray-600 mt-3 mb-1">Withdrawal Option</label>
              <select
                value={withdrawalOption}
                onChange={(e) => setWithdrawalOption(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs"
              >
                <option value="">Select option</option>
                <option>Instant Transfer</option>
                <option>Standard Transfer</option>
              </select>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="w-full border border-gray-300 rounded p-2 text-xs mt-2"
              />
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Monetization', value: 'R300,000', icon: <Lightbulb className="w-5 h-5 text-yellow-500" /> },
              { label: 'Ads', value: 'R200,000', icon: <Megaphone className="w-5 h-5 text-purple-500" /> },
              { label: 'Sponsored articles', value: 'R102,867', icon: <Newspaper className="w-5 h-5 text-orange-500" /> }
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border rounded shadow-sm p-4 flex flex-col items-center justify-center"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Summary + Button */}
          <div className="bg-white border rounded shadow-sm p-4 flex justify-between items-center">
            <div className="space-y-1 text-xs text-gray-700">
              <p>Total Earnings <span className="font-bold text-gray-900 ml-4">R 700,000</span></p>
              <p>Withdrawn <span className="font-bold text-gray-900 ml-8">R 97,133</span></p>
              <p>Remaining Balance <span className="font-bold text-gray-900 ml-2">R 602,867</span></p>
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm font-semibold shadow">
              Withdraw
            </button>
          </div>

          {/* Transaction History */}
          <div className="bg-white border rounded shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Withdrawal Method</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2].map((i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">29 June 2025</td>
                    <td className="px-4 py-2">Processed</td>
                    <td className="px-4 py-2 text-green-600 font-semibold">Processed</td>
                    <td className="px-4 py-2">Bank Account</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
       <Header publisher={publisher} />

      <div className="max-w-6xl mx-auto px-4 py-6 w-full">
        {/* Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="bg-white border rounded shadow-sm">
            <Link href="/print-media/wallet" className={`flex items-center gap-2 px-4 py-3 border-b ${pathname === '/print-media/wallet' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'} cursor-pointer`}>
              <CreditCard size={16} className="text-gray-700" />
              <span className="text-xs font-semibold text-gray-800">DASHBOARD</span>
            </Link>
            <Link href="/print-media/wallet/balance-statement" className={`flex items-center gap-2 px-4 py-3 border-b ${pathname === '/print-media/wallet/balance-statement' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'} cursor-pointer`}>
              <CreditCard size={16} className="text-gray-700" />
              <span className="text-xs font-semibold text-gray-800">BALANCE STATEMENT</span>
            </Link>
            <Link href="/print-media/wallet/withdrawal-history" className={`flex items-center gap-2 px-4 py-3 border-b ${pathname === '/print-media/wallet/withdrawal-history' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'} cursor-pointer`}>
              <Clock size={16} className="text-gray-700" />
              <span className="text-xs font-semibold text-gray-700">WITHDRAWAL HISTORY</span>
            </Link>
            <Link href="/print-media/wallet/payment-method" className={`flex items-center gap-2 px-4 py-3 ${pathname === '/print-media/wallet/payment-method' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'} cursor-pointer`}>
              <Banknote size={16} className="text-gray-700" />
              <span className="text-xs font-semibold text-gray-700">PAYMENT METHOD</span>
            </Link>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3">
            {renderWalletContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
