'use client'

import React, { useState, useRef, useEffect } from "react"
import { 
  FileText, 
  Upload, 
  Save, 
  Send, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Edit3
} from 'lucide-react';

// Mock components for demo - replace with your actual imports
const FileUpload = ({ setFile, uploadProgress, onPreview, onExtract }) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
    <p className="text-sm text-gray-600">Drop your PDF here or click to upload</p>
    <input 
      type="file" 
      accept=".pdf"
      className="mt-2 text-xs"
      onChange={(e) => {
        const file = e.target.files[0];
        setFile(file);
        if (file && onExtract) {
          onExtract({ headline: "Sample Headline", byline: "John Doe", location: "New York" });
        }
      }}
    />
    {uploadProgress && (
      <div className="mt-2 bg-blue-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
    )}
  </div>
);

const PrioritySelector = ({ priority, setPriority }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
    <select 
      value={priority || ''} 
      onChange={(e) => setPriority(e.target.value)}
      className="border p-1.5 rounded-md w-full text-xs"
    >
      <option value="">Select Priority</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
      <option value="urgent">Urgent</option>
    </select>
  </div>
);

const PreviewToggle = ({ previewStyle, setPreviewStyle }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium text-gray-700 mb-1">Preview Style</label>
    <select 
      value={previewStyle} 
      onChange={(e) => setPreviewStyle(e.target.value)}
      className="border p-1.5 rounded-md w-full text-xs"
    >
      <option value="Modern">Modern</option>
      <option value="Classic">Classic</option>
      <option value="Minimal">Minimal</option>
    </select>
  </div>
);

export default function FlipCardUploadForm({ onSubmit, onClose }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Upload Form States
  const [priority, setPriority] = useState(null);
  const [previewStyle, setPreviewStyle] = useState("Modern");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [immediatePreviewUrl, setImmediatePreviewUrl] = useState(null);
  const [autofill, setAutofill] = useState({ headline: "", byline: "", location: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Article Form States
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    author: '',
    authorTitle: '',
    category: '',
    tags: '',
    featuredImage: null,
    style: 'modern',
    content: '',
    metaDescription: '',
    publishNow: true,
    allowComments: true,
    sendNewsletter: false
  });

  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [metaCharCount, setMetaCharCount] = useState(0);
  const [fileName, setFileName] = useState('No file chosen');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'education', label: 'Education' },
    { value: 'science', label: 'Science' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'politics', label: 'Politics' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ];

  const styleOptions = [
    { value: 'modern', label: 'Modern', color: 'bg-blue-500', description: 'Clean, contemporary design' },
    { value: 'classic', label: 'Classic', color: 'bg-gray-800', description: 'Traditional serif typography' },
    { value: 'minimal', label: 'Minimal', color: 'bg-gray-300', description: 'Simple, distraction-free' },
    { value: 'academic', label: 'Academic', color: 'bg-green-600', description: 'Formal, research-oriented' }
  ];

  // Get current user from localStorage
  useEffect(() => {
    console.log('🎯 FlipCardUploadForm mounted');
    
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('currentUser');
        console.log('👤 Raw user data from localStorage:', userData);
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('👤 Current user loaded:', { 
            uid: parsedUser.uid, 
            role: parsedUser.role,
            companyName: parsedUser.companyName,
            email: parsedUser.email
          });
          setCurrentUser(parsedUser);
          
          // Pre-fill author name if available
          if (parsedUser.companyName && !formData.author) {
            console.log('👤 Pre-filling author name:', parsedUser.companyName);
            setFormData(prev => ({ ...prev, author: parsedUser.companyName }));
          }
        } else {
          console.warn('⚠️ No current user found in localStorage');
          // Mock current user for demo
          setCurrentUser({
            uid: 'demo-user-123',
            companyName: 'Demo Publisher',
            role: 'Editor'
          });
          setFormData(prev => ({ ...prev, author: 'Demo Publisher' }));
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        // Mock current user for demo
        setCurrentUser({
          uid: 'demo-user-123',
          companyName: 'Demo Publisher',
          role: 'Editor'
        });
        setFormData(prev => ({ ...prev, author: 'Demo Publisher' }));
      }
    }
    
    updateWordCount();
    
    return () => {
      console.log('🎯 FlipCardUploadForm unmounted');
    };
  }, []);

  // Upload Form Functions
  const handlePreview = (previewUrl) => {
    setImmediatePreviewUrl(previewUrl);
  };

  const handleUploadSubmit = async (e, action = 'publish') => {
    e.preventDefault();
    setUploadError("");
    setIsSubmitting(true);

    try {
      const form = e.target.form || e.target.closest("form");
      const formData = Object.fromEntries(new FormData(form));
      formData.priority = priority;
      formData.previewStyle = previewStyle;
      formData.action = action;

      // Mock file upload process
      if (file) {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        formData.pdfUrl = 'mock-pdf-url';
        formData.fileName = file.name;
        formData.fileSize = file.size;
        setUploadProgress(null);
      }

      const result = await onSubmit(formData);
      setIsSubmitting(false);
      
      // Mock navigation
      if (action === "publish" && result?.storyId) {
        console.log(`Navigating to /reader/${result.storyId}`);
      }
    } catch (error) {
      setUploadError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (e) => {
    await handleUploadSubmit(e, 'draft');
  };

  // Manual Article Form Functions - Fixed from working version
  const formatText = (command, value = null) => {
    console.log('🎨 Formatting text with command:', command, value);
    try {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      updateWordCount();
    } catch (error) {
      console.error('❌ Error formatting text:', error);
    }
  };

  const handleToolbarClick = (command) => {
    console.log('🔧 Toolbar button clicked:', command);
    try {
      if (command === 'createLink') {
        const url = prompt('Enter the URL:');
        if (url) formatText(command, url);
      } else if (command === 'insertImage') {
        const imageUrl = prompt('Enter the image URL:');
        if (imageUrl) formatText(command, imageUrl);
      } else {
        formatText(command);
      }
    } catch (error) {
      console.error('❌ Error handling toolbar click:', error);
    }
  };

  const updateWordCount = () => {
    try {
      if (!editorRef.current) {
        console.log('⚠️ Editor ref not available for word count');
        return;
      }
      
      const text = editorRef.current.textContent || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const readingTimeCalc = Math.ceil(words / 200);
      
      console.log('📊 Word count updated:', { words, readingTime: readingTimeCalc });
      
      setWordCount(words);
      setReadingTime(readingTimeCalc);
      setFormData(prev => ({ ...prev, content: editorRef.current.innerHTML }));
    } catch (error) {
      console.error('❌ Error updating word count:', error);
    }
  };

  const handleFileChange = (e) => {
    console.log('📁 File input changed');
    try {
      const file = e.target.files[0];
      console.log('📁 Selected file:', file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : 'No file');

      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('❌ Invalid file type:', file.type);
          setErrors(prev => ({ ...prev, featuredImage: 'Please select a valid image file' }));
          return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          console.error('❌ File too large:', file.size);
          setErrors(prev => ({ ...prev, featuredImage: 'Image size must be less than 5MB' }));
          return;
        }

        setFileName(file.name);
        setFormData(prev => ({ ...prev, featuredImage: file }));
        setErrors(prev => ({ ...prev, featuredImage: null }));
        console.log('✅ File validated and set');
      } else {
        setFileName('No file chosen');
        setFormData(prev => ({ ...prev, featuredImage: null }));
      }
    } catch (error) {
      console.error('❌ Error handling file change:', error);
      setErrors(prev => ({ ...prev, featuredImage: 'Error processing file' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('📝 Input changed:', { name, value: type === 'checkbox' ? checked : value });
    
    try {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));

      // Clear errors for this field
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }

      if (name === 'metaDescription') {
        setMetaCharCount(value.length);
      }
    } catch (error) {
      console.error('❌ Error handling input change:', error);
    }
  };

  // Validate form - Fixed from working version
  const validateForm = () => {
    console.log('✅ Validating form...');
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      console.log('❌ Validation error: Missing title');
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author name is required';
      console.log('❌ Validation error: Missing author');
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
      console.log('❌ Validation error: Missing category');
    }

    const content = editorRef.current?.innerHTML?.trim();
    if (!content || content === '<br>' || content === '<div><br></div>') {
      newErrors.content = 'Article content is required';
      console.log('❌ Validation error: Missing content');
    }

    if (!currentUser) {
      newErrors.auth = 'User authentication required';
      console.log('❌ Validation error: No authenticated user');
    }

    console.log('✅ Validation result:', { 
      hasErrors: Object.keys(newErrors).length > 0, 
      errorCount: Object.keys(newErrors).length,
      errors: Object.keys(newErrors)
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create auth token for API call - Fixed from working version
  const getAuthToken = () => {
    if (!currentUser) {
      console.error('❌ No current user for auth token');
      return null;
    }
    
    const token = currentUser.uid || `mock_token_${Date.now()}`;
    console.log('🔑 Generated auth token preview:', token.substring(0, 20) + '...');
    return token;
  };

  // Submit article to API - Fixed from working version
  const submitArticle = async (isDraft = false) => {
    console.log('📡 Submitting article to API...', { isDraft, currentUser: !!currentUser });
    
    const authToken = getAuthToken();
    if (!authToken) {
      throw new Error('Authentication token required');
    }

    // Create FormData for proper file upload
    const submitData = new FormData();

    // Add all form data fields
    Object.keys(formData).forEach(key => {
      if (key === 'featuredImage' && formData[key]) {
        console.log('🖼️ Adding featured image to FormData');
        submitData.append(key, formData[key]);
      } else if (key !== 'featuredImage') {
        submitData.append(key, formData[key]);
      }
    });

    // Add content from editor
    const content = editorRef.current?.innerHTML?.trim() || '';
    submitData.append('content', content);
    submitData.append('isDraft', isDraft.toString());
    submitData.append('wordCount', wordCount.toString());
    submitData.append('readingTime', readingTime.toString());

    // Add publisher information
    submitData.append('publisherId', currentUser.uid);
    if (currentUser.companyName) {
      submitData.append('publisherName', currentUser.companyName);
    }

    // Prepare headers and URL
    const headers = {
      'Authorization': `Bearer ${authToken}`
    };

    const url = `/api/publish-article?publisherId=${encodeURIComponent(currentUser.uid)}`;
    
    console.log('📡 Making request to:', url);
    console.log('📡 Request headers:', headers);
    console.log('📡 FormData keys:', [...submitData.keys()]);
    console.log('📡 Publisher ID:', currentUser.uid);
    console.log('📦 Form data summary:', {
      title: formData.title,
      author: formData.author,
      category: formData.category,
      isDraft,
      contentLength: content.length,
      hasImage: !!formData.featuredImage,
      publisherId: currentUser.uid
    });

    // Make API call
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: submitData
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    const result = await response.json();
    console.log('📡 Response data:', result);

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return result;
  };

  // Handle form submission - Fixed from working version
  const handleManualSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    console.log('🚀 Form submission started', { 
      isDraft, 
      currentUser: !!currentUser,
      userId: currentUser?.uid
    });
    
    // Clear previous status
    setSubmitStatus(null);
    setErrors({});
    
    if (!isDraft && !validateForm()) {
      console.log('❌ Validation failed, submission cancelled');
      return;
    }

    // Check authentication even for drafts
    if (!currentUser) {
      console.error('❌ No authenticated user');
      setErrors(prev => ({ ...prev, auth: 'Please sign in to publish articles' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('📡 Calling submitArticle...');
      
      let result;
      if (onSubmit && typeof onSubmit === 'function') {
        // Use custom onSubmit handler if provided
        console.log('📡 Using custom onSubmit handler...');
        
        // Prepare data for custom handler
        const submitData = {
          ...formData,
          content: editorRef.current?.innerHTML?.trim() || '',
          isDraft,
          wordCount,
          readingTime,
          publisherId: currentUser.uid,
          publisherName: currentUser.companyName
        };
        
        result = await onSubmit(submitData);
      } else {
        // Use built-in API call
        console.log('📡 Using built-in API call...');
        result = await submitArticle(isDraft);
      }
      
      console.log('✅ Submit successful:', result);
      setSubmitStatus('success');
      
      // Clear form data on successful publish (but not for drafts)
      if (!isDraft) {
        console.log('🧹 Clearing form after successful publish...');
        setFormData({
          title: '',
          subtitle: '',
          author: currentUser.companyName || '',
          authorTitle: '',
          category: '',
          tags: '',
          featuredImage: null,
          style: 'modern',
          content: '',
          metaDescription: '',
          publishNow: true,
          allowComments: true,
          sendNewsletter: false
        });
        setFileName('No file chosen');
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
        updateWordCount();
      }
      
      // Auto-close after success (optional)
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (error) {
      console.error('💥 Submit error:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setSubmitStatus('error');
      
      // Show user-friendly error message
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'An error occurred while submitting. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Submit process completed');
    }
  };

  // Handle save draft - Fixed from working version
  const handleManualSaveDraft = async (e) => {
    console.log('💾 Save draft requested');
    const title = formData.title.trim();
    const content = editorRef.current?.innerHTML?.trim();
    
    if (!title && (!content || content === '<br>' || content === '<div><br></div>')) {
      console.log('⚠️ Empty draft - showing warning');
      setErrors(prev => ({ 
        ...prev, 
        submit: 'Please add a title or some content before saving as draft.' 
      }));
      return;
    }
    
    await handleManualSubmit(e, true);
  };

  return (
    <div className="flip-card-container w-full max-w-4xl mx-auto">
      <style jsx>{`
        .flip-card-container {
          perspective: 1000px;
          height: auto;
          min-height: 600px;
        }
        
        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        
        .flip-card.flipped {
          transform: rotateY(180deg);
        }
        
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Side - Upload Form */}
        <div className="flip-card-front bg-white p-6">
          {/* Flip Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Document Upload</h2>
            <button
              onClick={() => setIsFlipped(true)}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Manual Entry
            </button>
          </div>

          <form onSubmit={handleUploadSubmit} className="w-full">
            <FileUpload
              setFile={setFile}
              uploadProgress={uploadProgress}
              onPreview={handlePreview}
              onExtract={(data) => setAutofill(data)}
            />

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <input
                name="headline"
                id="headline"
                placeholder="Enter headline..."
                defaultValue={autofill.headline}
                className="border p-1.5 rounded-md w-full text-xs"
              />
              <input
                name="byline"
                id="byline"
                placeholder="Byline Name"
                defaultValue={autofill.byline}
                className="border p-1.5 rounded-md w-full text-xs"
              />
              <input
                name="location"
                id="location"
                placeholder="City/Town"
                defaultValue={autofill.location}
                className="border p-1.5 rounded-md w-full text-xs"
              />
              <select name="section" id="section" className="border p-1.5 rounded-md w-full text-xs">
                <option>Select Section</option>
                <option>Politics</option>
                <option>Business</option>
              </select>
              <select name="edition" id="edition" className="border p-1.5 rounded-md w-full text-xs">
                <option>Morning Edition</option>
                <option>Evening Edition</option>
              </select>
            </div>

            <PrioritySelector priority={priority} setPriority={setPriority} />

            <textarea
              name="lead"
              id="lead"
              placeholder="Write the lead paragraph..."
              className="w-full border p-1.5 rounded-md mb-2 text-xs"
              rows="2"
            />
            <textarea
              name="body"
              id="body"
              placeholder="Continue with the article body..."
              className="w-full border p-1.5 rounded-md mb-3 text-xs"
              rows="2"
            />

            <div className="flex justify-between mb-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-blue-900 text-white px-3 py-1.5 rounded-md hover:bg-blue-800 transition-colors text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "SAVE DRAFT"}
              </button>
              <button
                type="button"
                onClick={(e) => handleUploadSubmit(e, 'review')}
                className="bg-yellow-400 text-black font-semibold px-3 py-1.5 rounded-md hover:bg-yellow-500 transition-colors text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "SUBMIT FOR REVIEW"}
              </button>
              <button
                type="button"
                onClick={(e) => handleUploadSubmit(e, 'publish')}
                className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "PUBLISH NOW"}
              </button>
            </div>

            <PreviewToggle previewStyle={previewStyle} setPreviewStyle={setPreviewStyle} />
          </form>

          {/* PDF Previews */}
          {immediatePreviewUrl && !pdfPreviewUrl && (
            <div className="mt-3 bg-white rounded-lg shadow-md p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-800">PDF Preview (Before Upload)</h3>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(immediatePreviewUrl);
                    setImmediatePreviewUrl(null);
                  }}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                >
                  Close Preview
                </button>
              </div>
              <div className="border rounded-md overflow-hidden">
                <iframe
                  src={immediatePreviewUrl}
                  width="100%"
                  height="200px"
                  className="w-full"
                  title="PDF Preview"
                />
              </div>
            </div>
          )}
        </div>

        {/* Back Side - Manual Article Form - FIXED */}
        <div className="flip-card-back bg-white p-6 max-h-[90vh] overflow-y-auto">
          {/* Flip Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Manual Article Entry</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFlipped(false)}
                className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Back to Upload
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* User Info Display */}
          {currentUser && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Publishing as:</strong> {currentUser.companyName || currentUser.displayName || 'Unknown Publisher'}
                {currentUser.role && ` (${currentUser.role})`}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Publisher ID: {currentUser.uid}
              </p>
            </div>
          )}

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-800">Article submitted successfully!</span>
            </div>
          )}

          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-800">{errors.submit}</span>
            </div>
          )}

          {errors.auth && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-yellow-800">{errors.auth}</span>
            </div>
          )}

          <form onSubmit={(e) => handleManualSubmit(e, false)}>
            {/* Article Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Article Title <span className="text-red-500">*</span>
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
                placeholder="Enter your article title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Subtitle */}
            <div className="mb-4">
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a subtitle (optional)"
              />
            </div>

            {/* Author Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.author ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your name"
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
              </div>
              <div>
                <label htmlFor="authorTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Author Title/Position
                </label>
                <input
                  type="text"
                  id="authorTitle"
                  name="authorTitle"
                  value={formData.authorTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Senior Writer, Editor"
                />
              </div>
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., innovation, AI, future"
                />
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </button>
                <span className="text-gray-500 text-sm">{fileName}</span>
              </div>
              {errors.featuredImage && <p className="text-red-500 text-sm mt-1">{errors.featuredImage}</p>}
            </div>

            {/* Article Style */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Style/Format
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {styleOptions.map(style => (
                  <div
                    key={style.value}
                    onClick={() => setFormData(prev => ({ ...prev, style: style.value }))}
                    className={`cursor-pointer border rounded-lg p-3 transition-all hover:shadow-md ${
                      formData.style === style.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className={`w-8 h-8 ${style.color} rounded-full mb-2`}></div>
                    <h4 className="font-medium text-gray-800 text-sm">{style.label}</h4>
                    <p className="text-xs text-gray-500">{style.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Content <span className="text-red-500">*</span>
              </label>
              <div className={`border rounded-md overflow-hidden ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
                  <button type="button" onClick={() => handleToolbarClick('bold')} className="p-1 hover:bg-gray-200 rounded">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('italic')} className="p-1 hover:bg-gray-200 rounded">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('underline')} className="p-1 hover:bg-gray-200 rounded">
                    <Underline className="w-4 h-4" />
                  </button>
                  <div className="border-r mx-2"></div>
                  <button type="button" onClick={() => handleToolbarClick('insertUnorderedList')} className="p-1 hover:bg-gray-200 rounded">
                    <List className="w-4 h-4" />
                  </button>
                  <div className="border-r mx-2"></div>
                  <button type="button" onClick={() => handleToolbarClick('justifyLeft')} className="p-1 hover:bg-gray-200 rounded">
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('justifyCenter')} className="p-1 hover:bg-gray-200 rounded">
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('justifyRight')} className="p-1 hover:bg-gray-200 rounded">
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <div className="border-r mx-2"></div>
                  <button type="button" onClick={() => handleToolbarClick('createLink')} className="p-1 hover:bg-gray-200 rounded">
                    <Link className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('insertImage')} className="p-1 hover:bg-gray-200 rounded">
                    📷
                  </button>
                </div>
                
                {/* Editor */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[200px] p-4 focus:outline-none"
                  onInput={updateWordCount}
                  style={{ minHeight: '200px' }}
                  suppressContentEditableWarning={true}
                />
              </div>
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>

            {/* Word Count */}
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span>Words: {wordCount}</span>
              <span>Reading time: {readingTime} min</span>
            </div>

            {/* Meta Description */}
            <div className="mb-4">
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (for SEO)
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a brief description for search engines (150-160 characters)"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Recommended: 150-160 characters</span>
                <span className={`text-xs ${metaCharCount > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                  {metaCharCount}/160
                </span>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Publishing Options</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="publishNow"
                    checked={formData.publishNow}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowComments"
                    checked={formData.allowComments}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow reader comments</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="sendNewsletter"
                    checked={formData.sendNewsletter}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Send notification to subscribers</span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleManualSaveDraft}
                disabled={isSubmitting || !currentUser}
                className="flex-1 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !currentUser}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>

            {/* Debug Information (remove in production) */}
            {process.env.NODE_ENV === 'development' && currentUser && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
                <h4 className="font-medium text-gray-800 mb-2">Debug Info:</h4>
                <p><strong>User ID:</strong> {currentUser.uid}</p>
                <p><strong>Company:</strong> {currentUser.companyName || 'Not set'}</p>
                <p><strong>API Endpoint:</strong> /api/publish-article</p>
                <p><strong>Publisher ID:</strong> {currentUser.uid}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}