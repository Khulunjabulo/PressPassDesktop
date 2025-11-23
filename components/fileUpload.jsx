// components/fileUpload.jsx - FIXED VERSION with AI processing and 50MB support
import React, { useState, useRef } from "react"
import { FileText, AlertCircle } from 'lucide-react';

export default function FileUpload({ 
  setFile, 
  uploadProgress, 
  onPreview, 
  onExtract,
  pdfPublishMode,
  setPdfPublishMode,
  onAiProcess // NEW: AI processing callback
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (file) => {
    setError("");
    
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file only");
      setSelectedFile(null);
      setFile(null);
      return;
    }

    // ✅ FIXED: Increased to 50MB
    const maxSize = 50 * 1024 * 1024; // 50MB instead of 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 50MB");
      setSelectedFile(null);
      setFile(null);
      return;
    }

    setSelectedFile(file);
    setFile(file);

    // Create preview URL for immediate preview
    if (onPreview) {
      const previewUrl = URL.createObjectURL(file);
      onPreview(previewUrl);
    }

    // ✅ FIXED: Trigger AI processing for extract mode
    if (pdfPublishMode === 'extract') {
      console.log('🤖 Triggering AI processing...');
      
      if (onAiProcess) {
        setIsExtracting(true);
        try {
          // Call AI processing function
          await onAiProcess(file);
        } catch (err) {
          console.error("AI processing failed:", err);
          setError("AI processing failed: " + err.message);
        } finally {
          setIsExtracting(false);
        }
      } else {
        console.warn('⚠️ onAiProcess callback not provided');
        // Fallback to basic extraction
        if (onExtract) {
          setIsExtracting(true);
          try {
            const { extractTextFromPDF, extractArticleInfo } = await import("../lib/pdfExtractor");
            const text = await extractTextFromPDF(file);
            const info = extractArticleInfo ? extractArticleInfo(text) : { headline: "", byline: "", location: "" };
            onExtract(info);
          } catch (err) {
            console.error("PDF extraction failed:", err);
          } finally {
            setIsExtracting(false);
          }
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    handleFileChange(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileChange(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFile(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="mb-3">
      {/* PDF Option Selector */}
      {setPdfPublishMode && (
        <div className="mb-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            📄 PDF Publishing Options
          </h3>
          
          <div className="space-y-2">
            <label className="flex items-start p-3 border-2 rounded-md cursor-pointer transition-all hover:bg-white bg-white"
                   style={{ borderColor: pdfPublishMode === 'extract' ? '#3b82f6' : '#e5e7eb', backgroundColor: pdfPublishMode === 'extract' ? '#eff6ff' : '#ffffff' }}>
              <input
                type="radio"
                name="pdfOption"
                value="extract"
                checked={pdfPublishMode === 'extract'}
                onChange={(e) => setPdfPublishMode(e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm">✨ AI Extract & Format</div>
                <div className="text-xs text-gray-600 mt-1">
                  AI will detect multiple articles, extract images, and format content
                </div>
              </div>
            </label>

            <label className="flex items-start p-3 border-2 rounded-md cursor-pointer transition-all hover:bg-white bg-white"
                   style={{ borderColor: pdfPublishMode === 'publish-as-is' ? '#3b82f6' : '#e5e7eb', backgroundColor: pdfPublishMode === 'publish-as-is' ? '#eff6ff' : '#ffffff' }}>
              <input
                type="radio"
                name="pdfOption"
                value="publish-as-is"
                checked={pdfPublishMode === 'publish-as-is'}
                onChange={(e) => setPdfPublishMode(e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-semibold text-sm">📄 Publish as PDF</div>
                <div className="text-xs text-gray-600 mt-1">
                  Keep original PDF format - readers will view/download the PDF
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : selectedFile
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="mb-2">
          {selectedFile ? (
            <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        
        {selectedFile ? (
          <div>
            <p className="text-sm font-medium text-green-700 mb-1">File Selected!</p>
            <p className="text-xs text-gray-600 mb-1">{selectedFile.name}</p>
            <p className="text-xs text-gray-500 mb-2">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {pdfPublishMode && (
              <p className="text-xs text-blue-600 mb-2 font-medium">
                Mode: {pdfPublishMode === 'extract' ? '✨ AI Extract' : '📄 Publish as PDF'}
              </p>
            )}
            <div className="flex justify-center space-x-2">
              {onPreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const previewUrl = URL.createObjectURL(selectedFile)
                    onPreview(previewUrl)
                  }}
                  className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove File
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragOver ? "Drop your PDF file here" : "Upload PDF Document"}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Drag and drop your PDF file here, or click to browse
            </p>
            {pdfPublishMode && (
              <p className="text-xs text-gray-500 mb-2">
                {pdfPublishMode === 'extract' 
                  ? '✨ AI will detect multiple articles and extract images' 
                  : '📄 PDF will be published in original format'}
              </p>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Choose PDF File
            </button>
          </div>
        )}
      </div>
      
      {isExtracting && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <p className="text-sm text-blue-600">AI is analyzing your PDF...</p>
          </div>
        </div>
      )}

      {pdfPublishMode === 'publish-as-is' && selectedFile && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <strong>Note:</strong> You'll need to provide a title, category, and brief description 
              for this PDF article before publishing. Readers will be able to view and download the full PDF.
            </div>
          </div>
        </div>
      )}

      {pdfPublishMode === 'extract' && selectedFile && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <strong>AI Mode:</strong> The AI will analyze your PDF to detect multiple articles, 
              extract images, and match them to the correct content. If multiple articles are found, 
              you'll see a preview to select which ones to publish.
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {uploadProgress && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
            <span className="text-sm text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-400 mt-2 text-center">
        Supported format: PDF • Maximum file size: 50MB
      </p>
    </div>
  )
}