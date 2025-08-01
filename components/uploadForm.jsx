'use client'

import React, { useState } from "react"
import FileUpload from "./fileUpload"
import PrioritySelector from "./prioritySelector"
import PreviewToggle from "./previviewToogle"
import { storage } from "../Firebase/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"

export default function UploadForm({ onSubmit }) {
  const [priority, setPriority] = useState(null)
  const [previewStyle, setPreviewStyle] = useState("Modern")
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [uploadError, setUploadError] = useState("")
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [previewError, setPreviewError] = useState("")
  const [immediatePreviewUrl, setImmediatePreviewUrl] = useState(null)

  const handlePreview = (previewUrl) => {
    setImmediatePreviewUrl(previewUrl)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploadError("")
    
    const formData = Object.fromEntries(new FormData(e.target))
    formData.priority = priority
    formData.previewStyle = previewStyle

    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setUploadError("Please select a valid PDF file")
        return
      }

      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress.toFixed(0))
        },
        (error) => {
          console.error("Upload error:", error)
          setUploadError(`Upload failed: ${error.message}`)
          setUploadProgress(null)
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            formData.pdfUrl = url
            formData.fileName = file.name
            formData.fileSize = file.size

            // Set loading state for preview
            setIsLoadingPreview(true)
            setPreviewError("")
            
            // Save URL for preview
            setPdfPreviewUrl(url)
            
            // Clear loading state after a short delay to allow iframe to load
            setTimeout(() => {
              setIsLoadingPreview(false)
            }, 1000)

            setUploadProgress(null)
            onSubmit(formData)
          } catch (error) {
            console.error("Error getting download URL:", error)
            setUploadError("Failed to get file URL")
            setUploadProgress(null)
            setIsLoadingPreview(false)
          }
        }
      )
    } else {
      onSubmit(formData)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Document Upload</h2>

        <FileUpload setFile={setFile} uploadProgress={uploadProgress} onPreview={handlePreview} />

        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input name="headline" id="headline" placeholder="Enter headline..." className="border p-3 rounded-md w-full" />
          <input name="byline" id="byline" placeholder="Byline Name" className="border p-3 rounded-md w-full" />
          <input name="location" id="location" placeholder="City/Town" className="border p-3 rounded-md w-full" />
          
          <select name="section" id="section" className="border p-3 rounded-md w-full">
            <option>Select Section</option>
            <option>Politics</option>
            <option>Business</option>
          </select>

          <select name="edition" id="edition" className="border p-3 rounded-md w-full">
            <option>Morning Edition</option>
            <option>Evening Edition</option>
          </select>
        </div>

        <PrioritySelector priority={priority} setPriority={setPriority} />

        <textarea name="lead" id="lead" placeholder="Write the lead paragraph..." className="w-full border p-3 rounded-md mb-4" rows="2" />
        <textarea name="body" id="body" placeholder="Continue with the article body..." className="w-full border p-3 rounded-md mb-6" rows="5" />

        <div className="flex justify-between mb-6">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              const formData = Object.fromEntries(new FormData(e.target.form))
              formData.priority = priority
              formData.previewStyle = previewStyle
              formData.action = 'draft'
              if (file) {
                formData.fileName = file.name
                formData.fileSize = file.size
              }
              onSubmit(formData)
            }}
            className="bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition-colors"
          >
            SAVE DRAFT
          </button>
          <button
            type="submit"
            onClick={(e) => {
              const form = e.target.form
              const hiddenInput = document.createElement('input')
              hiddenInput.type = 'hidden'
              hiddenInput.name = 'action'
              hiddenInput.value = 'review'
              form.appendChild(hiddenInput)
            }}
            className="bg-yellow-400 text-black font-semibold px-6 py-2 rounded-md hover:bg-yellow-500 transition-colors"
          >
            SUBMIT FOR REVIEW
          </button>
          <button
            type="submit"
            onClick={(e) => {
              const form = e.target.form
              const hiddenInput = document.createElement('input')
              hiddenInput.type = 'hidden'
              hiddenInput.name = 'action'
              hiddenInput.value = 'publish'
              form.appendChild(hiddenInput)
            }}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            PUBLISH NOW
          </button>
        </div>

        <PreviewToggle previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} />
      </form>

      {/* Immediate PDF Preview (before upload) */}
      {immediatePreviewUrl && !pdfPreviewUrl && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">PDF Preview (Before Upload)</h3>
            <button
              onClick={() => {
                URL.revokeObjectURL(immediatePreviewUrl)
                setImmediatePreviewUrl(null)
              }}
              className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close Preview
            </button>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <iframe
              src={immediatePreviewUrl}
              width="100%"
              height="500px"
              className="w-full"
              title="PDF Preview"
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>This is a preview of your selected PDF. Submit the form to upload and save it.</p>
          </div>
        </div>
      )}

      {/* PDF Preview After Upload */}
      {pdfPreviewUrl && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">PDF Preview</h3>
            <div className="flex space-x-2">
              <a
                href={pdfPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </a>
              <button
                onClick={() => {
                  setPdfPreviewUrl(null)
                  setPreviewError("")
                  setIsLoadingPreview(false)
                }}
                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Preview
              </button>
            </div>
          </div>

          {isLoadingPreview && (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading PDF preview...</p>
              </div>
            </div>
          )}

          {previewError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{previewError}</p>
              </div>
            </div>
          )}

          {!isLoadingPreview && !previewError && (
            <div className="border rounded-md overflow-hidden">
              <iframe
                src={`${pdfPreviewUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                width="100%"
                height="600px"
                className="w-full"
                onLoad={() => {
                  setIsLoadingPreview(false)
                  setPreviewError("")
                }}
                onError={() => {
                  setIsLoadingPreview(false)
                  setPreviewError("Failed to load PDF preview. Please try opening in a new tab.")
                }}
                title="PDF Preview"
              />
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Use the controls above the PDF to navigate, zoom, and interact with the document.</p>
          </div>
        </div>
      )}
    </>
  )
}

