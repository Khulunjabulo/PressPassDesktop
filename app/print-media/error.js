"use client"

import useErrorHandler from "@/hooks/useErrorHandler"

export default function Error({ error, reset }) {
  useErrorHandler(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#329ae1] text-white px-4">
      <div className="bg-white text-[#1e1e1e] p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          We couldn't load the news content. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-[#329ae1] hover:bg-[#2784c1] text-white font-semibold rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
