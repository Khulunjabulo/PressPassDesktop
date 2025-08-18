"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'

export default function PaymentMethod() {
  const [withdrawMethod, setWithdrawMethod] = useState("bank")
  const [depositMethod, setDepositMethod] = useState("paypal")

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Withdraw via: ${withdrawMethod}, Deposit via: ${depositMethod}`)
  }

  return (
    <div className="bg-white border rounded shadow-sm p-6 max-w-3xl mx-auto">
               <Link href="/print-media/wallet" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
                  <ArrowLeft size={20} />
                  <span className="ml-1">Back to Wallet</span>
                </Link>
      <h2 className="text-lg font-bold mb-4">Payment Method</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Withdraw Methods */}
        <div>
          <h3 className="font-semibold mb-2">Withdraw Methods</h3>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="withdraw"
                value="bank"
                checked={withdrawMethod === "bank"}
                onChange={(e) => setWithdrawMethod(e.target.value)}
              />
              <span>Bank</span>
            </label>

            <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="withdraw"
                value="mobile"
                checked={withdrawMethod === "mobile"}
                onChange={(e) => setWithdrawMethod(e.target.value)}
              />
              <span>Mobile Wallet</span>
            </label>

            <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="withdraw"
                value="crypto"
                checked={withdrawMethod === "crypto"}
                onChange={(e) => setWithdrawMethod(e.target.value)}
              />
              <span>Crypto</span>
            </label>
          </div>
        </div>

        {/* Deposit Methods */}
        <div>
          <h3 className="font-semibold mb-2">Deposit Methods</h3>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="deposit"
                value="bank"
                checked={depositMethod === "bank"}
                onChange={(e) => setDepositMethod(e.target.value)}
              />
              <span>Bank</span>
            </label>

            <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="deposit"
                value="paypal"
                checked={depositMethod === "paypal"}
                onChange={(e) => setDepositMethod(e.target.value)}
              />
              <span>PayPal</span>
            </label>

            <label className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="deposit"
                value="crypto"
                checked={depositMethod === "crypto"}
                onChange={(e) => setDepositMethod(e.target.value)}
              />
              <span>Crypto</span>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
