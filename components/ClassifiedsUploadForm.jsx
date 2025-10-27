'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

export default function ClassifiedsUploadForm({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: null,
    imageUrl: '',
    imagePreview: null
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]

    if (!file) {
      setFormData(prev => ({
        ...prev,
        image: null,
        imageUrl: '',
        imagePreview: null
      }))
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }))
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
      return
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file)

    // Convert to base64 for storage
    const reader = new FileReader()
    reader.onload = function(e) {
      const base64DataUrl = e.target.result
      setFormData(prev => ({
        ...prev,
        image: file,
        imageUrl: base64DataUrl,
        imagePreview: previewUrl
      }))
    }
    reader.readAsDataURL(file)

    setErrors(prev => ({ ...prev, image: null }))
  }

  const removeImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview)
    }
    setFormData(prev => ({
      ...prev,
      image: null,
      imageUrl: '',
      imagePreview: null
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required'
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Please enter a valid price'
    }

    if (!formData.image) {
      newErrors.image = 'Product image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrors({})

    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

      if (!currentUser.uid) {
        throw new Error('User authentication required')
      }

      // Prepare FormData for API call
      const submitData = new FormData()

      // Add all form data
      submitData.append('title', formData.title.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('price', formData.price)
      submitData.append('publisherId', currentUser.uid)
      submitData.append('publisherName', currentUser.companyName || 'Unknown Publisher')

      // Add image data
      if (formData.image) {
        submitData.append('image', formData.image)
      }
      if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl)
      }

      // Add timestamps
      submitData.append('createdAt', new Date().toISOString())
      submitData.append('updatedAt', new Date().toISOString())

      // Add initial engagement metrics
      submitData.append('views', '0')
      submitData.append('inquiries', '0')

      console.log('📡 Submitting classified to API...')

      // Make API call to classifieds endpoint
      const response = await fetch('/api/classifieds', {
        method: 'POST',
        body: submitData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      console.log('✅ Classified submitted successfully:', result)

      if (onSubmit && typeof onSubmit === 'function') {
        await onSubmit({
          ...formData,
          id: result.classifiedId,
          createdAt: new Date().toISOString()
        })
      }

      setSubmitStatus('success')

      // Reset form on success
      setFormData({
        title: '',
        description: '',
        price: '',
        image: null,
        imageUrl: '',
        imagePreview: null
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Auto-close after success
      setTimeout(() => {
        onClose?.()
      }, 2000)

    } catch (error) {
      console.error('Error submitting classified:', error)
      setSubmitStatus('error')
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'An error occurred while submitting. Please try again.'
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 max-h-[90vh] overflow-y-auto w-full min-w-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Upload Classified Ad</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        )}
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-800">Classifieds uploaded successfully!</span>
        </div>
      )}

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-800">{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter product title"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Short Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your product briefly"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Price */}
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">R</span>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image <span className="text-red-500">*</span>
          </label>

          {/* Image Preview */}
          {formData.imagePreview && (
            <div className="mb-4">
              <div className="relative inline-block">
                <img
                  src={formData.imagePreview}
                  alt="Product preview"
                  className="w-48 h-32 object-cover border-2 border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
              disabled={isSubmitting}
            >
              <Upload className="w-4 h-4 mr-2" />
              {formData.image ? 'Change Image' : 'Upload Image'}
            </button>
            {!formData.imagePreview && (
              <span className="text-gray-500 text-sm">No image selected</span>
            )}
          </div>

          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF. Max size: 5MB</p>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Classified Ad'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}