'use client'

import useForgotPassword from "@/hooks/SignUpLogic"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordForm() {
  const { email, setEmail, submitted, loading, error, handleSubmit } = useForgotPassword()

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side panel */}
          <div className="md:w-2/5 bg-gradient-to-br bg-[#329ae1] text-white p-8 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="bg-white/20 p-4 rounded-full inline-block mb-4">
                <Image
                  src="/Presspass.png"
                  alt="News Icon"
                  className="w-12 h-12"
                  width={48}
                  height={48}
                />
              </div>
              <h1 className="text-3xl font-bold mb-2">MediaHub</h1>
              <p className="text-blue-100">Publishing Platform</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  {/* You can replace with your icons or leave empty */}
                  {/* Example icon placeholder */}
                  <svg className="text-xl w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Reach Millions</h3>
                  <p className="text-blue-100 text-sm">Access our global audience of readers</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <svg className="text-xl w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect width="14" height="14" x="5" y="5" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Analytics Dashboard</h3>
                  <p className="text-blue-100 text-sm">Track your publication performance</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-4">
                  <svg className="text-xl w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 19h14v2H5z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Multi-Platform</h3>
                  <p className="text-blue-100 text-sm">Publish to web, mobile, and tablets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side panel - your forgot password form content */}
          <div className="md:w-3/5 p-8">
            {/* Your original forgot password form JSX — unchanged */}
            <div className="w-full max-w-md  text-white p-8 rounded-lg shadow-lg mx-auto">
              <div className="flex justify-center mb-6">
                <Image
                  src="/Presspass.png"
                  alt="Logo"
                  className="h-20 w-20"
                  width={80}
                  height={80}
                />
              </div>

              <h2 className="text-2xl text-black font-bold text-center mb-6">Reset Password</h2>

              {!submitted ? (
                <>
                  <p className="text-sm text-black mb-6 text-center">
                    Enter your email and we'll send you instructions to reset your password.
                  </p>
                  
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                      {error}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2 border border-[#67a2c9] bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#329ae1] placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#329ae1] text-white font-bold py-2 rounded-md hover:bg-[#67a2c9] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending...' : 'Send Recovery Email'}
                    </button>
                  </form>
                  <div className="mt-6 text-center">
                    <Link href="/signin" className="text-sm text-[#329ae1] underline hover:text-[#67a2c9]">
                      Back to Sign In
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    <p className="font-semibold">
                      Password reset instructions have been sent to:
                    </p>
                    <p className="underline mt-1">{email}</p>
                    <p className="text-sm mt-2">
                      Please check your email and follow the instructions to reset your password.
                    </p>
                  </div>
                  <Link href="/signin" className="text-sm text-[#329ae1] underline hover:text-[#67a2c9]">
                    Back to Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
