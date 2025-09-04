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

  // Debug: Log publisher data
  console.log('Publisher data:', publisher)
  console.log('Publisher ID:', publisher?.id)
  console.log('Wallet data:', wallet)

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
            {/* Available Balance - REAL DATA */}
            <div className="bg-white border rounded shadow-sm flex flex-col items-center justify-center py-4">
              <p className="text-sm font-medium text-gray-700">Available Balance</p>
              <p className="text-3xl font-extrabold text-gray-900">
                R{wallet.availableBalance.toLocaleString()}<span className="text-lg">,00</span>
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
              <h4 className="font-semibold text-yellow-800 mb-3">🧪 Test Earnings (Dev Only)</h4>
              
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
      <PrintMediaFooter/>
    </div>
  )
}