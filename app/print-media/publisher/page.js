'use client'
import { useState } from 'react'
import Header from '@/components/UI/header'
import PublisherSidebar from '@/components/UI/publisherSidebar'
import UploadForm from '@/components/uploadForm'

export default function Publisher() {
  const [submissionStatus, setSubmissionStatus] = useState(null)

  const handleFormSubmit = async (formData) => {
    try {
      console.log('Form submitted with data:', formData)
      
      // Send the data to the stories API endpoint
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmissionStatus({
          type: 'success',
          message: result.message || 'Article submitted successfully!'
        })
      } else {
        throw new Error(result.error || 'Failed to submit article')
      }
      
      // Clear the status after 5 seconds
      setTimeout(() => {
        setSubmissionStatus(null)
      }, 5000)
      
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmissionStatus({
        type: 'error',
        message: error.message || 'Failed to submit article. Please try again.'
      })
      
      // Clear the status after 5 seconds
      setTimeout(() => {
        setSubmissionStatus(null)
      }, 5000)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex">
        <PublisherSidebar />

        {/* Main Content */}
        <main className="flex-1 p-10">
          {/* Status Messages */}
          {submissionStatus && (
            <div className={`mb-6 p-4 rounded-md ${
              submissionStatus.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <p className="font-medium">{submissionStatus.message}</p>
            </div>
          )}

          {/* Upload Form */}
          <UploadForm onSubmit={handleFormSubmit} />

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
