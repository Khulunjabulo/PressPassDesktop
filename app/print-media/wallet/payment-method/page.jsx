"use client"

import { useState } from "react"
import { User } from "lucide-react"
import Link from 'next/link'

export default function PaymentMethod() {
  // State for each card
  const [method1, setMethod1] = useState("bank")
  const [option1, setOption1] = useState("")
  const [phone1, setPhone1] = useState("")

  const [method2, setMethod2] = useState("bank")
  const [option2, setOption2] = useState("")
  const [phone2, setPhone2] = useState("")

  const [method3, setMethod3] = useState("bank")
  const [option3, setOption3] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`
      Method 1 - Withdraw via: ${method1}, Option: ${option1}, Phone: ${phone1}
      Method 2 - Withdraw via: ${method2}, Option: ${option2}, Phone: ${phone2}
      Method 3 - Withdraw via: ${method3}, Option: ${option3}, PayPal Email: ${paypalEmail}
    `)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl">
        {/* Header */}
        <div className="flex items-center mb-2">
          <User className="text-blue-600 mr-2" size={28} />
          <h2 className="text-lg font-bold">Payment Method</h2>
        </div>
        {/* Note */}
        <div className="mb-6">
          <span className="font-semibold text-sm text-gray-700">
            Note:
          </span>
          <span className="text-sm text-gray-600 ml-1">
            Withdrawals cannot be processed directly on this page. Please select the most suitable withdrawal method to proceed with accessing your funds.
          </span>
        </div>
        {/* Cards */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1 */}
          <div className="bg-white rounded-md shadow border p-4 flex flex-col">
            <h3 className="font-semibold mb-2 text-gray-800 text-sm">Withdraw Methods</h3>
            <div className="flex flex-col gap-2 mb-4">
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw1"
                  value="bank"
                  checked={method1 === "bank"}
                  onChange={() => setMethod1("bank")}
                />
                Bank
              </label>
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw1"
                  value="mobile"
                  checked={method1 === "mobile"}
                  onChange={() => setMethod1("mobile")}
                />
                Mobile Wallet
              </label>
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw1"
                  value="paypal"
                  checked={method1 === "paypal"}
                  onChange={() => setMethod1("paypal")}
                />
                Paypal
              </label>
            </div>
            <select
              className="border rounded px-3 py-2 mb-3 text-sm text-gray-700"
              value={option1}
              onChange={e => setOption1(e.target.value)}
            >
              <option value="">Withdrawal Option</option>
              <option value="instant">Instant</option>
              <option value="standard">Standard</option>
            </select>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm text-gray-700"
              placeholder="Phone Number"
              value={phone1}
              onChange={e => setPhone1(e.target.value)}
            />
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-md shadow border p-4 flex flex-col">
            <h3 className="font-semibold mb-2 text-gray-800 text-sm">Withdraw Methods</h3>
            <div className="flex flex-col gap-2 mb-4">
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw2"
                  value="bank"
                  checked={method2 === "bank"}
                  onChange={() => setMethod2("bank")}
                />
                Bank
              </label>
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw2"
                  value="mobile"
                  checked={method2 === "mobile"}
                  onChange={() => setMethod2("mobile")}
                />
                Mobile Wallet
              </label>
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw2"
                  value="paypal"
                  checked={method2 === "paypal"}
                  onChange={() => setMethod2("paypal")}
                />
                Paypal
              </label>
            </div>
            <select
              className="border rounded px-3 py-2 mb-3 text-sm text-gray-700"
              value={option2}
              onChange={e => setOption2(e.target.value)}
            >
              <option value="">Withdrawal Option</option>
              <option value="instant">Instant</option>
              <option value="standard">Standard</option>
            </select>
            <input
              type="text"
              className="border rounded px-3 py-2 text-sm text-gray-700"
              placeholder="Phone Number"
              value={phone2}
              onChange={e => setPhone2(e.target.value)}
            />
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-md shadow border p-4 flex flex-col">
            <h3 className="font-semibold mb-2 text-gray-800 text-sm">Withdraw Methods</h3>
            <div className="flex flex-col gap-2 mb-4">
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw3"
                  value="bank"
                  checked={method3 === "bank"}
                  onChange={() => setMethod3("bank")}
                />
                Bank
              </label>
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw3"
                  value="mobile"
                  checked={method3 === "mobile"}
                  onChange={() => setMethod3("mobile")}
                />
                Mobile Wallet
              </label>
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="radio"
                  name="withdraw3"
                  value="paypal"
                  checked={method3 === "paypal"}
                  onChange={() => setMethod3("paypal")}
                />
                Paypal
              </label>
            </div>
            <select
              className="border rounded px-3 py-2 mb-3 text-sm text-gray-700"
              value={option3}
              onChange={e => setOption3(e.target.value)}
            >
              <option value="">Withdrawal Option</option>
              <option value="instant">Instant</option>
              <option value="standard">Standard</option>
            </select>
            <input
              type="email"
              className="border rounded px-3 py-2 text-sm text-gray-700"
              placeholder="PayPal Email Address"
              value={paypalEmail}
              onChange={e => setPaypalEmail(e.target.value)}
            />
          </div>
        </form>
        {/* Close Button */}
        <div className="flex justify-center">
          <button
            className="border border-gray-400 rounded px-8 py-2 bg-white hover:bg-gray-100 transition text-gray-700 font-medium"
            onClick={() => window.history.back()}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
