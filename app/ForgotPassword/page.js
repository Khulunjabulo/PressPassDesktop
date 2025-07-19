"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Connect to backend or Firebase for password reset
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-blue-600 text-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <Image src="/Presspass.png" alt="Logo" className="h-20 w-20" width={80} height={80} />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        {!submitted ? (
          <>
            <p className="text-sm text-white mb-6 text-center">
              Enter your email and we’ll send you instructions to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-white bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder-white"
              />
              <button
                type="submit"
                className="w-full bg-white text-blue-700 font-bold py-2 rounded-md hover:bg-gray-100 transition"
              >
                Send Recovery Email
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/signin" className="text-sm text-white underline hover:text-gray-200">
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-green-200 font-semibold">
              Recovery instructions have been sent to <br />
              <span className="underline">{email}</span>
            </p>
            <Link href="/signin" className="text-sm text-white underline hover:text-gray-200">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
