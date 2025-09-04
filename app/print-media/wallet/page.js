"use client"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Header from '@/components/UI/header'
import { CreditCard, Clock, Banknote, Lightbulb, Megaphone, Newspaper } from 'lucide-react'
import BalanceStatement from '@/app/print-media/wallet/balance-statement/page'
import WithdrawalHistory from '@/app/print-media/wallet/withdrawal-history/page'
import PaymentMethod from '@/app/print-media/wallet/payment-method/page'
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher"
import { useWallet } from "@/hooks/useWallet" // New wallet hook
import { processWithdrawal } from "@/utils/walletUtils" // Withdrawal function
import PrintMediaFooter from '@/components/UI/PrintMediaFooter'
import jsPDF from 'jspdf'

export default function Wallet() {
  const pathname = usePathname()
  const { publisher, loading: publisherLoading } = useCurrentPublisher("currentPublisherId")

  // Get real wallet data for this specific publisher
  const wallet = useWallet(publisher?.id)

  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState('mobile')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawFrom, setWithdrawFrom] = useState('')
  const [withdrawalOption, setWithdrawalOption] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)


  // Calculate earnings breakdown (you can make this more sophisticated)
  const adsEarnings = wallet.transactions
    .filter(t => t.source === 'ads' && t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const sponsoredEarnings = wallet.transactions
    .filter(t => t.source === 'sponsored' && t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0)

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAmount || !phoneNumber) {
      alert('Please fill in all fields')
      return
    }

    if (!publisher?.id) {
      alert('Publisher not loaded yet')
      return
    }

    const amount = parseFloat(withdrawAmount)
    if (amount > wallet.availableBalance) {
      alert('Insufficient balance')
      return
    }

    setProcessing(true)

    try {
      const result = await processWithdrawal(
        publisher.id,
        amount,
        selectedWithdrawMethod,
        {
          phoneNumber,
          accountName: publisher.contactName,
          // Add more details as needed
        }
      )

      if (result.success) {
        alert('Withdrawal initiated successfully!')
        setWithdrawAmount('')
        setPhoneNumber('')
      } else {
        alert(`Withdrawal failed: ${result.error}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  // Show loading state
  if (publisherLoading || wallet.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallet...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (wallet.error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading wallet: {wallet.error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Check if publisher is loaded
  if (!publisher || !publisher.id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-orange-600">
          <p>Publisher data not available</p>
          <p className="text-sm text-gray-600 mt-2">Please make sure you're logged in and try refreshing</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const renderWalletContent = () => {
    if (pathname === '/print-media/wallet/balance-statement') {
      return <BalanceStatement wallet={wallet} publisher={publisher} />
    } else if (pathname === '/print-media/wallet/withdrawal-history') {
      return <WithdrawalHistory wallet={wallet} publisher={publisher} />
    } else if (pathname === '/print-media/wallet/payment-method') {
      return <PaymentMethod publisher={publisher} />
    } else {
      // Dashboard with real data
      return (
        <div className="space-y-4">
          {/* Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available Balance - REAL DATA - CLICKABLE */}
            <div
              className="bg-white border rounded shadow-sm flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowBalanceModal(true)}
            >
              <p className="text-sm font-medium text-gray-700">Available Balance</p>
              <p className="text-3xl font-extrabold text-gray-900">
                R{wallet.availableBalance.toLocaleString()}<span className="text-lg">,00</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">Click to view statement</p>
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
                <option value="ads">Ads (R{adsEarnings.toLocaleString()})</option>
                <option value="sponsored">Sponsored articles (R{sponsoredEarnings.toLocaleString()})</option>
              </select>
              <label className="block text-xs font-medium text-gray-600 mt-3 mb-1">Amount to withdraw</label>
              <input 
                type="number" 
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                max={wallet.availableBalance}
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
                    <span className={`text-xs ${
                      selectedWithdrawMethod === method ? 'text-gray-700 font-semibold' : 'text-gray-700'
                    }`}>
                      {method === 'bank' ? 'Bank' : method === 'mobile' ? 'Mobile Wallet' : 'Paypal'}
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
                <option value="instant">Instant Transfer</option>
                <option value="standard">Standard Transfer</option>
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

          {/* Earnings Breakdown - REAL DATA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                label: 'Ads', 
                value: `R${adsEarnings.toLocaleString()}`, 
                icon: <Megaphone className="w-5 h-5 text-purple-500" /> 
              },
              { 
                label: 'Sponsored articles', 
                value: `R${sponsoredEarnings.toLocaleString()}`, 
                icon: <Newspaper className="w-5 h-5 text-orange-500" /> 
              }
            ].map((item) => (
              <div key={item.label} className="bg-white border rounded shadow-sm p-4 flex flex-col items-center justify-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Summary + Button - REAL DATA */}
          <div className="bg-white border rounded shadow-sm p-4 flex justify-between items-center">
            <div className="space-y-1 text-xs text-gray-700">
              <p>Total Earnings <span className="font-bold text-gray-900 ml-4">R {wallet.totalEarnings.toLocaleString()}</span></p>
              <p>Withdrawn <span className="font-bold text-gray-900 ml-8">R {wallet.withdrawn.toLocaleString()}</span></p>
              <p>Remaining Balance <span className="font-bold text-gray-900 ml-2">R {wallet.availableBalance.toLocaleString()}</span></p>
            </div>
            <button 
              onClick={handleWithdraw}
              disabled={processing || !withdrawAmount || !phoneNumber}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>

          {/* Transaction History - REAL DATA */}
          <div className="bg-white border rounded shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {wallet.transactions.slice(0, 5).map((transaction, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{transaction.date}</td>
                    <td className="px-4 py-2">
                      R {transaction.amount.toLocaleString()}
                      <span className={`ml-2 text-xs ${
                        transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earning' ? '+' : '-'}
                      </span>
                    </td>
                    <td className={`px-4 py-2 font-semibold ${
                      transaction.status === 'success' ? 'text-green-600' : 
                      transaction.status === 'processing' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {transaction.status}
                    </td>
                    <td className="px-4 py-2">{transaction.source || transaction.type}</td>
                  </tr>
                ))}
                {wallet.transactions.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TEST BUTTONS - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-3">Test Earnings</h4>
              
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-white rounded border text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Publisher ID: {publisher?.id || 'Not found'}</p>
                <p>Publisher loaded: {publisher ? 'Yes' : 'No'}</p>
                <p>Available balance: R{wallet.availableBalance.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button 
                  onClick={async () => {
                    if (!publisher?.id) {
                      alert('Publisher ID not available. Please refresh and try again.')
                      return
                    }
                    
                    try {
                      const { addEarnings } = await import('@/utils/walletUtils')
                      const result = await addEarnings(publisher.id, 1000, 'ads', 'Test Ad Revenue')
                      if (result.success) {
                        alert('Added R1,000 ad revenue!')
                      } else {
                        alert(`Error: ${result.error}`)
                      }
                    } catch (error) {
                      alert(`Error: ${error.message}`)
                      console.error('Add earnings error:', error)
                    }
                  }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  Add R1,000 Ads
                </button>
                <button 
                  onClick={async () => {
                    if (!publisher?.id) {
                      alert('Publisher ID not available. Please refresh and try again.')
                      return
                    }
                    
                    try {
                      const { addEarnings } = await import('@/utils/walletUtils')
                      const result = await addEarnings(publisher.id, 5000, 'sponsored', 'Test Sponsored Article')
                      if (result.success) {
                        alert('Added R5,000 sponsored revenue!')
                      } else {
                        alert(`Error: ${result.error}`)
                      }
                    } catch (error) {
                      alert(`Error: ${error.message}`)
                      console.error('Add earnings error:', error)
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  Add R5,000 Sponsored
                </button>
                <button 
                  onClick={async () => {
                    if (!publisher?.id) {
                      alert('Publisher ID not available. Please refresh and try again.')
                      return
                    }
                    
                    try {
                      const { addEarnings } = await import('@/utils/walletUtils')
                      const result = await addEarnings(publisher.id, 2000, 'referral', 'Test Referral Bonus')
                      if (result.success) {
                        alert('Added R2,000 referral bonus!')
                      } else {
                        alert(`Error: ${result.error}`)
                      }
                    } catch (error) {
                      alert(`Error: ${error.message}`)
                      console.error('Add earnings error:', error)
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  Add R2,000 Referral
                </button>
                <button 
                  onClick={async () => {
                    if (!publisher?.id) {
                      alert('Publisher ID not available. Please refresh and try again.')
                      return
                    }
                    
                    try {
                      const { addEarnings } = await import('@/utils/walletUtils')
                      const amount = Math.floor(Math.random() * 10000) + 1000
                      const result = await addEarnings(publisher.id, amount, 'ads', 'Random Ad Revenue')
                      if (result.success) {
                        alert(`Added R${amount.toLocaleString()} random revenue!`)
                      } else {
                        alert(`Error: ${result.error}`)
                      }
                    } catch (error) {
                      alert(`Error: ${error.message}`)
                      console.error('Add earnings error:', error)
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  Add Random Amount
                </button>
              </div>
              <p className="text-xs text-yellow-700 mt-2">
                These buttons will only appear in development mode and will add test earnings to this publisher's wallet.
              </p>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header publisher={publisher} />
      <div className="max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="bg-white border rounded shadow-sm">
            <Link href="/print-media/wallet" 
              className={`flex items-center gap-2 px-4 py-3 border-b ${
                pathname === '/print-media/wallet' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'
              } cursor-pointer`}>
              <CreditCard size={16} className="text-gray-700" />
              <span className="text-xs font-semibold text-gray-800">DASHBOARD</span>
            </Link>
            <Link href="/print-media/wallet/balance-statement" 
              className={`flex items-center gap-2 px-4 py-3 border-b ${
                pathname === '/print-media/wallet/balance-statement' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'
              } cursor-pointer`}>
              <CreditCard size={16} className="text-gray-700" />
              <span className="text-xs font-semibold text-gray-800">BALANCE STATEMENT</span>
            </Link>
            <Link href="/print-media/wallet/withdrawal-history" 
              className={`flex items-center gap-2 px-4 py-3 border-b ${
                pathname === '/print-media/wallet/withdrawal-history' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'
              } cursor-pointer`}>
              <Clock size={16} className="text-gray-700" />
              <span className="text-xs font-semibold text-gray-700">WITHDRAWAL HISTORY</span>
            </Link>
            <Link href="/print-media/wallet/payment-method" 
              className={`flex items-center gap-2 px-4 py-3 ${
                pathname === '/print-media/wallet/payment-method' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50'
              } cursor-pointer`}>
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

      {/* Balance Statement Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Balance Statement</h2>
              <button
                onClick={() => setShowBalanceModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
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
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
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
                      ) : wallet.transactions.length > 0 ? (
                        wallet.transactions.map((transaction, idx) => (
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
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    // PDF generation for modal
                    const doc = new jsPDF()

                    try {
                      // Add logo
                      const logoUrl = '/press-pass.png'
                      const img = new Image()
                      img.crossOrigin = 'anonymous'

                      await new Promise((resolve, reject) => {
                        img.onload = resolve
                        img.onerror = reject
                        img.src = logoUrl
                      })

                      // Add logo to PDF (positioned at top-left)
                      doc.addImage(img, 'PNG', 20, 10, 30, 30)

                      // Add title next to logo
                      doc.setFontSize(20)
                      doc.text('Balance Statement', 60, 30)

                      // Add generation date
                      doc.setFontSize(10)
                      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 60, 40)
                    } catch (error) {
                      console.warn('Could not load logo, generating PDF without logo:', error)
                      // Fallback without logo
                      doc.setFontSize(20)
                      doc.text('Balance Statement', 20, 30)

                      doc.setFontSize(10)
                      doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 20, 40)
                    }

                    doc.setFontSize(20)
                    doc.text('Balance Statement', 20, 30)

                    doc.setFontSize(10)
                    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 20, 40)

                    let contentYPosition = 60

                    doc.setFontSize(14)
                    doc.text('Summary', 20, contentYPosition)

                    doc.setFontSize(12)
                    doc.text(`Available Balance: R${wallet.availableBalance.toLocaleString()},00`, 20, contentYPosition + 15)
                    doc.text(`Total Earnings: R${wallet.totalEarnings.toLocaleString()},00`, 20, contentYPosition + 25)
                    doc.text(`Total Withdrawn: R${wallet.withdrawn.toLocaleString()},00`, 20, contentYPosition + 35)

                    doc.setFontSize(14)
                    doc.text('Transaction History', 20, contentYPosition + 55)

                    const tableYPosition = contentYPosition + 70
                    doc.setFontSize(10)
                    doc.text('Date', 20, tableYPosition)
                    doc.text('Time', 50, tableYPosition)
                    doc.text('Source', 75, tableYPosition)
                    doc.text('Description', 105, tableYPosition)
                    doc.text('Amount', 155, tableYPosition)
                    doc.text('Status', 175, tableYPosition)

                    doc.line(20, tableYPosition + 2, 190, tableYPosition + 2)

                    let yPosition = tableYPosition + 10
                    wallet.transactions.slice(0, 20).forEach((transaction, index) => {
                      if (yPosition > 270) {
                        doc.addPage()
                        yPosition = 30
                      }

                      const amount = transaction.type === 'earning'
                        ? `+R${transaction.amount.toLocaleString()}`
                        : `-R${transaction.amount.toLocaleString()}`

                      doc.text(transaction.date || '', 20, yPosition)
                      doc.text(transaction.time || '', 50, yPosition)
                      doc.text((transaction.source || 'N/A').substring(0, 15), 75, yPosition)
                      doc.text((transaction.description || 'N/A').substring(0, 25), 105, yPosition)
                      doc.text(amount, 155, yPosition)
                      doc.text(transaction.status || '', 175, yPosition)

                      yPosition += 8
                    })

                    const pageCount = doc.internal.getNumberOfPages()
                    for (let i = 1; i <= pageCount; i++) {
                      doc.setPage(i)
                      doc.setFontSize(8)
                      doc.text(`Page ${i} of ${pageCount}`, 180, 285)
                      doc.text('Generated by PressPass Wallet System', 20, 285)
                    }

                    const fileName = `balance-statement-${new Date().toISOString().split('T')[0]}.pdf`
                    doc.save(fileName)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Download Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PrintMediaFooter/>
    </div>
  )
}