'use client'
import { useState } from 'react'
import Header from '@/components/UI/Header'

export default function Publisher() {
  const [priority, setPriority] = useState(null)
  const [previewStyle, setPreviewStyle] = useState('Modern')

  return (
    <>
      <Header />
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 font-bold text-lg text-blue-600">PressPass</div>
        <nav className="space-y-4 text-gray-700 text-sm px-6 mt-6">
          <div>OVERVIEW</div>
          <div>CONTENT ANALYSIS</div>
          <div>JOURNALIST</div>
          <div>SUBSCRIBERS</div>
          <div>NEWS FEED</div>
          <div>ADVANCED ANALYTICS</div>
        </nav>
        <div className="mt-12 px-6">
          <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">DH</div>
            <div>
              <p className="text-sm font-semibold">Daniel Hoppes</p>
              <p className="text-xs text-gray-500">Editor-in-Chief</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-center">Document Upload</h2>

          {/* Upload Section */}
          <div className="border border-gray-300 rounded-md p-6 mb-6 text-center bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">Drop PDF file here or click browse</p>
            <p className="text-xs text-gray-400">(Supports PDF files up to 10MB)</p>
            <div className="flex justify-center mt-4 space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-l-md">Upload PDF</button>
              <button className="bg-gray-200 px-4 py-2 rounded-r-md">Manual Entry</button>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input type="text" placeholder="Enter headline..." className="border p-3 rounded-md w-full" />
            <input type="text" placeholder="Byline Name" className="border p-3 rounded-md w-full" />
            <input type="text" placeholder="City/Town" className="border p-3 rounded-md w-full" />
            <select className="border p-3 rounded-md w-full">
              <option>Select Section</option>
              <option>Politics</option>
              <option>Business</option>
            </select>
            <select className="border p-3 rounded-md w-full">
              <option>Morning Edition</option>
              <option>Evening Edition</option>
            </select>
          </div>

          {/* Priority Level */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-2">Priority level</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setPriority('Breaking')}
                className={`px-4 py-2 rounded-md border ${
                  priority === 'Breaking' ? 'bg-red-500 text-white' : 'bg-white'
                }`}
              >
                🔥 BREAKING
              </button>
              <button
                onClick={() => setPriority('Important')}
                className={`px-4 py-2 rounded-md border ${
                  priority === 'Important' ? 'bg-yellow-400 text-white' : 'bg-white'
                }`}
              >
                ⭐ IMPORTANT
              </button>
            </div>
          </div>

          {/* Paragraphs */}
          <div className="mb-4">
            <textarea
              className="w-full border p-3 rounded-md"
              placeholder="Write the lead paragraph..."
              rows="2"
            />
          </div>
          <div className="mb-6">
            <textarea
              className="w-full border p-3 rounded-md"
              placeholder="Continue with the article body..."
              rows="5"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mb-6">
            <button className="bg-blue-900 text-white px-6 py-2 rounded-md">SAVE DRAFT</button>
            <button className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md">SUBMIT FOR REVIEW</button>
            <button className="bg-red-600 text-white px-6 py-2 rounded-md">PUBLISH NOW</button>
          </div>

          {/* Preview Style */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-2">Preview</p>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded-md border ${
                  previewStyle === 'Modern' ? 'bg-blue-600 text-white' : 'bg-white'
                }`}
                onClick={() => setPreviewStyle('Modern')}
              >
                Modern
              </button>
              <button
                className={`px-4 py-2 rounded-md border ${
                  previewStyle === 'Classic' ? 'bg-black text-white' : 'bg-white'
                }`}
                onClick={() => setPreviewStyle('Classic')}
              >
                Classic
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-xs text-gray-400">
          <p>Corporate HQ | Terms of Use | Privacy Policy</p>
          <p>ABOUT PRESS-PASS</p>
          <div className="mt-2 space-x-2">
            <span>🔗</span>
            <span>📘</span>
            <span>🐦</span>
          </div>
        </footer>
      </main>
    </div>
    </>
  )
}
