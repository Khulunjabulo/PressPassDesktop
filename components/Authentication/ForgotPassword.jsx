'use client'

import useForgotPassword from "@/hooks/SignUpLogic"
import Link from "next/link"
import Image from "next/image"

export default function ForgotPasswordForm() {
  const { email, setEmail, submitted, handleSubmit } = useForgotPassword()

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
                    Enter your email and we’ll send you instructions to reset your password.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-[#67a2c9]  bg-white-500 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder-white"
                    />
                    <button
                      type="submit"
                      className="text-black w-full bg-[#329ae1] text-black-700 font-bold py-2 rounded-md hover:bg-[#67a2c9] transition"
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
        </div>
      </div>
    </div>
  )
}
