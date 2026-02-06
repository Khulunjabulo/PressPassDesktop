'use client';

import { useState, useRef } from 'react';
import { X, Monitor, Smartphone, ExternalLink } from 'lucide-react';

export default function AdUploadOverlay({ isOpen, onClose, onUpload, deviceType = 'desktop' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [destinationUrl, setDestinationUrl] = useState(''); // URL field
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrlStep, setShowUrlStep] = useState(false); // 🆕 Track if we're on URL step
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setError('');
    setSuccess('');

    if (!file) return;

    // Validate file type (images, videos, GIFs)
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'video/avi'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image (JPEG, PNG, GIF) or video (MP4, MOV, AVI) file');
      setSelectedFile(null);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setShowUrlStep(true); // 🆕 Move to URL step after file is selected
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleClick = () => {
    if (!showUrlStep) {
      fileInputRef.current?.click();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDestinationUrl('');
    setShowUrlStep(false);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate URL format
  const validateUrl = (url) => {
    if (!url || url.trim() === '') {
      return { valid: false, message: 'Please enter where your ad should link to' };
    }

    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('http')) {
        return { valid: false, message: 'URL must start with http:// or https://' };
      }
      return { valid: true };
    } catch (err) {
      return { valid: false, message: 'Please enter a valid URL (e.g., https://yourwebsite.com)' };
    }
  };

  const handleSubmit = async () => {
    // Validate file
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    // Validate URL
    const urlValidation = validateUrl(destinationUrl);
    if (!urlValidation.valid) {
      setError(urlValidation.message);
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    
    try {
      // Call the parent's upload function with BOTH file and URL
      await onUpload(selectedFile, destinationUrl);
      
      // Show success message
      setSuccess(`Ad uploaded successfully for ${deviceType}!`);
      
      // Reset state
      setSelectedFile(null);
      setDestinationUrl('');
      setShowUrlStep(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Close the overlay after a short delay
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedFile(null);
    setDestinationUrl('');
    setShowUrlStep(false);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#329ae1] bg-opacity-50"
        onClick={handleClose}
      ></div>

      {/* Overlay Content */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">
              {showUrlStep ? 'Step 2: Add Link' : 'Step 1: Upload Media'}
            </h3>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
              deviceType === 'mobile' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {deviceType === 'mobile' ? (
                <>
                  <Smartphone size={14} />
                  <span>Mobile</span>
                </>
              ) : (
                <>
                  <Monitor size={14} />
                  <span>Desktop</span>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Progress indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              selectedFile ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              1
            </div>
            <div className={`h-1 w-12 ${selectedFile ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              showUrlStep ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>

          {!showUrlStep ? (
            // STEP 1: FILE UPLOAD
            <>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Step 1:</span> Upload your ad media for <span className="font-semibold">{deviceType}</span> devices
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
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
                  accept="image/jpeg,image/png,image/gif,video/mp4,video/quicktime,video/avi"
                  onChange={handleInputChange}
                  className="hidden"
                />
                
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {isDragOver ? "Drop your file here" : "Upload Image or Video"}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supported: JPG, PNG, GIF, MP4, MOV, AVI (Max 10MB)
                  </p>
                </div>
              </div>
            </>
          ) : (
            // STEP 2: URL INPUT
            <>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">✓ File Selected:</span> {selectedFile.name}
                </p>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Step 2:</span> Where should this ad take users when clicked?
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ad Destination URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={destinationUrl}
                    onChange={(e) => {
                      setDestinationUrl(e.target.value);
                      setError('');
                    }}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <ExternalLink className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Example: https://mycompany.com or https://myshop.com/products
                </p>
              </div>

              {/* Show file preview */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Selected File:</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type.startsWith('video/') ? 'Video' : 'Image'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            {showUrlStep && (
              <button
                type="button"
                onClick={() => setShowUrlStep(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            {showUrlStep && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!destinationUrl || uploading}
                className={`px-6 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  destinationUrl && !uploading
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {uploading ? "Uploading..." : "Continue to Preview"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}