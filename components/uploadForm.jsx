'use client'

import React, { useState, useRef, useEffect } from "react"
import {
  Eye, ExternalLink, RotateCw,
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
  Edit3,
  Image as ImageIcon,
  X
} from 'lucide-react';
import FileUpload from "./fileUpload";
import { checkPublisherApproval } from '@/lib/publisherAuth';
import { useRouter } from 'next/navigation';

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
  const [showPreview, setShowPreview] = useState(false);
  
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
    featuredImageUrl: '',
    imageCredit: '', 
    imageCaption: '',
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
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Publisher approval states
  const router = useRouter();
  const [publisherApproval, setPublisherApproval] = useState({ canPublish: false });

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

  // Auto-fill journalist position when selected
useEffect(() => {
  if (formData.author && currentUser?.staff) {
    const selectedJournalist = currentUser.staff.find(
      member => member.name === formData.author
    );
    
    if (selectedJournalist && selectedJournalist.position) {
      setFormData(prev => ({
        ...prev,
        authorTitle: selectedJournalist.position
      }));
    }
  }
}, [formData.author, currentUser]);

  // Check publisher approval status
  useEffect(() => {
    if (currentUser) {
      const approval = checkPublisherApproval(currentUser);
      setPublisherApproval(approval);
      console.log('Publisher approval status:', approval);
    }
  }, [currentUser]);

  // Get current user from localStorage
// Replace the existing useEffect for loading currentUser
useEffect(() => {
  console.log('🎯 FlipCardUploadForm mounted');
  
  const loadUserData = async () => {
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
            email: parsedUser.email,
            staffCount: parsedUser.staff?.length || 0
          });
          
          // CRITICAL FIX: Fetch fresh profile data to ensure staff is loaded
          if (parsedUser.uid && parsedUser.role === 'publisher') {
            console.log('🔄 Fetching fresh profile data for dropdown...');
            
            try {
              const { auth } = await import('../Firebase/firebase');
              const currentAuthUser = auth.currentUser;
              
              if (currentAuthUser) {
                const idToken = await currentAuthUser.getIdToken();
                
                const response = await fetch('/api/publisher-profile', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (response.ok) {
                  const freshData = await response.json();
                  console.log('✅ Fresh profile data loaded with', freshData.staff?.length || 0, 'staff members');
                  
                  // Update currentUser with fresh staff data
                  const updatedUser = {
                    ...parsedUser,
                    staff: freshData.staff || [],
                    profileComplete: freshData.profileComplete,
                    isVerified: freshData.isVerified,
                    isApproved: freshData.isApproved
                  };
                  
                  // Update localStorage
                  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                  
                  setCurrentUser(updatedUser);
                } else {
                  console.warn('⚠️ Failed to fetch fresh profile, using cached data');
                  setCurrentUser(parsedUser);
                }
              } else {
                console.warn('⚠️ No authenticated user, using cached data');
                setCurrentUser(parsedUser);
              }
            } catch (fetchError) {
              console.error('❌ Error fetching fresh profile:', fetchError);
              setCurrentUser(parsedUser);
            }
          } else {
            setCurrentUser(parsedUser);
          }
          
          // Pre-fill author name if available
          if ((parsedUser.companyName || parsedUser.displayName) && !formData.author) {
            console.log('👤 Pre-filling author name:', parsedUser.companyName || parsedUser.displayName);
            setFormData(prev => ({ 
              ...prev, 
              author: parsedUser.companyName || parsedUser.displayName || '' 
            }));
          }
        } else {
          console.warn('⚠️ No current user found in localStorage');
          // Mock current user for demo
          setCurrentUser({
            uid: 'demo-user-123',
            companyName: 'Demo Publisher',
            role: 'Editor',
            staff: []
          });
          setFormData(prev => ({ ...prev, author: 'Demo Publisher' }));
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        // Mock current user for demo
        setCurrentUser({
          uid: 'demo-user-123',
          companyName: 'Demo Publisher',
          role: 'Editor',
          staff: []
        });
        setFormData(prev => ({ ...prev, author: 'Demo Publisher' }));
      }
    }
  };
  
  loadUserData();
  updateWordCount();
  
  return () => {
    console.log('🎯 FlipCardUploadForm unmounted');
  };
}, []); // Empty dependency array - runs once on mount

  // Upload Form Functions
  const handlePreview = (previewUrl) => {
    setImmediatePreviewUrl(previewUrl);
  };

  const ApprovalStatusBanner = () => {
    if (publisherApproval.canPublish) return null;

    return (
      <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Publishing Restricted
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              {publisherApproval.reason === 'Profile incomplete' && (
                <div>
                  <p>Please complete your publisher profile to proceed with approval.</p>
                  <button
                    onClick={() => router.push('/print-media/profile')}
                    className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700"
                  >
                    Complete Profile
                  </button>
                </div>
              )}
              {publisherApproval.reason === 'Waiting for admin approval' && (
                <div>
                  <p>Your publisher account is under review. You can create drafts but cannot publish until approved.</p>
                  <p className="text-xs mt-1">Status: {publisherApproval.status}</p>
                </div>
              )}
              {publisherApproval.reason === 'Not a publisher account' && (
                <p>Only approved publishers can create articles.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleUploadSubmit = async (e, action = 'publish') => {
    e.preventDefault();
    
    // Check approval status before allowing publish
    if (action === 'publish' && !publisherApproval.canPublish) {
      setUploadError(`Cannot publish: ${publisherApproval.reason}`);
      return;
    }

    setUploadError("");
    setIsSubmitting(true);

    try {
      // If we have a file, extract content from PDF
      if (file) {
        try {
          // Extract text from PDF
          const { extractTextFromPDF } = await import('../lib/pdfExtractor');
          const pdfText = await extractTextFromPDF(file);
          
          // Split text into lines and clean up
          const lines = pdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          
          // Extract headline (first non-empty line)
          const headline = lines[0] || 'Untitled Article';
          
          // Extract byline (look for "by" pattern)
          let byline = '';
          const bylineIndex = lines.findIndex(line => line.toLowerCase().startsWith('by '));
          if (bylineIndex !== -1) {
            byline = lines[bylineIndex].substring(3).trim();
          }
          
          // Extract location (look for location pattern)
          let location = '';
          const locationMatch = pdfText.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[a-z]+)\b/);
          if (locationMatch) {
            location = locationMatch[0];
          }
          
          // Extract content (everything after headline and byline)
          let contentStartIndex = 1;
          if (bylineIndex !== -1) {
            contentStartIndex = Math.max(contentStartIndex, bylineIndex + 1);
          }
          
          // Get content from remaining lines
          const contentLines = lines.slice(contentStartIndex);
          const content = contentLines.join('\n');
          
          // Auto-generate meta description (first 160 characters)
          const metaDescription = content.substring(0, 160) + (content.length > 160 ? '...' : '');
          
          // Create article data
          const articleData = {
            title: headline,
            subtitle: '',
            author: byline || currentUser?.companyName || 'Unknown Author',
            authorTitle: '',
            category: 'general', // Default category
            tags: [],
            featuredImage: null,
            featuredImageUrl: '',
            style: 'modern',
            content: content,
            metaDescription: metaDescription,
            publishNow: action === 'publish',
            allowComments: true,
            sendNewsletter: false,
            isDraft: action !== 'publish',
            wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
            readingTime: Math.ceil(content.split(/\s+/).filter(word => word.length > 0).length / 200) || 1,
            publisherId: currentUser?.uid,
            publisherName: currentUser?.companyName || 'Unknown Publisher'
          };
          
          if (onSubmit && typeof onSubmit === 'function') {
            await onSubmit(articleData);  // delegate to parent (page.js)
            setSubmitStatus('success');
          } else {
            await submitArticle(action !== 'publish');
            setSubmitStatus('success');
          }
          
          // Reset form
          setFile(null);
          setUploadProgress(null);
          setAutofill({ headline: "", byline: "", location: "" });
          
          // Auto-close after success
          setTimeout(() => {
            onClose?.();
          }, 2000);
          
        } catch (extractionError) {
          console.error('Error extracting PDF content:', extractionError);
          setUploadError("Failed to extract content from PDF. Please try again or use manual entry.");
        }
      } else {
        setUploadError("Please select a PDF file to upload.");
      }
    } catch (error) {
      console.error('Error in PDF upload submit:', error);
      setUploadError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async (e) => {
    await handleUploadSubmit(e, 'draft');
  };

  // Fixed text formatting with better paragraph handling
  const formatText = (command, value = null) => {
    console.log('🎨 Formatting text with command:', command, value);
    try {
      if (!editorRef.current) {
        console.error('❌ Editor ref not available');
        return;
      }

      // Focus the editor first
      editorRef.current.focus();
      
      // Special handling for paragraph formatting
      if (command === 'formatBlock') {
        document.execCommand('formatBlock', false, value || 'p');
      } else if (command === 'insertParagraph') {
        // Insert a proper paragraph break
        document.execCommand('insertHTML', false, '<br><br>');
      } else {
        document.execCommand(command, false, value);
      }
      
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
        if (imageUrl) {
          // Insert image with proper styling
          const imageHtml = `<div class="image-container" style="margin: 20px 0; text-align: center;">
            <img src="${imageUrl}" alt="Article image" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />
          </div>`;
          document.execCommand('insertHTML', false, imageHtml);
          updateWordCount();
        }
      } else {
        formatText(command);
      }
    } catch (error) {
      console.error('❌ Error handling toolbar click:', error);
    }
  };

  // Fixed word count function with better content handling
  const updateWordCount = () => {
    try {
      if (!editorRef.current) {
        console.log('⚠️ Editor ref not available for word count');
        return;
      }
      
      const text = editorRef.current.textContent || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const readingTimeCalc = Math.ceil(words / 200) || 1;
      
      console.log('📊 Word count updated:', { words, readingTime: readingTimeCalc });
      
      setWordCount(words);
      setReadingTime(readingTimeCalc);
      
      // Store the HTML content
      const content = editorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, content: content }));
    } catch (error) {
      console.error('❌ Error updating word count:', error);
    }
  };

  // Fixed file change handler with proper image upload
  const handleFileChange = async (e) => {
    console.log('📁 File input changed');
    try {
      const file = e.target.files[0];
      console.log('📁 Selected file:', file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : 'No file');

      if (!file) {
        setFileName('No file chosen');
        setFormData(prev => ({ 
          ...prev, 
          featuredImage: null, 
          featuredImageUrl: '',
          imageCredit: prev.imageCredit || '' // Keep existing image credit
        }));
        setImagePreview(null);
        return;
      }

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

      // Show local preview immediately
      const localImageUrl = URL.createObjectURL(file);
      setImagePreview(localImageUrl);
      setFileName(file.name);
      setIsUploadingImage(true);

      try {
        // Convert image to base64 data URL (like logo system)
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64DataUrl = e.target.result;
          console.log('✅ Image converted to base64:', base64DataUrl.substring(0, 50) + '...');
          
          // Update form data with base64 data URL
          setFormData(prev => ({ 
            ...prev, 
            featuredImage: file,
            featuredImageUrl: base64DataUrl, // Base64 data URL
            imageUrl: base64DataUrl // Backup field
          }));
          
          // Update preview to use base64 data URL
          setImagePreview(base64DataUrl);
          setIsUploadingImage(false);
        };
        
        reader.onerror = function(error) {
          throw new Error('Failed to read file: ' + error.message);
        };
        
        // Read file as data URL (base64)
        reader.readAsDataURL(file);
        
      } catch (uploadError) {
        console.error('❌ Base64 conversion failed:', uploadError);
        setErrors(prev => ({ 
          ...prev, 
          featuredImage: 'Failed to process image: ' + uploadError.message 
        }));
        
        // Keep local preview as fallback
        setFormData(prev => ({ 
          ...prev, 
          featuredImage: file,
          featuredImageUrl: localImageUrl 
        }));
        setIsUploadingImage(false);
      }

      setErrors(prev => ({ ...prev, featuredImage: null }));

    } catch (error) {
      console.error('❌ Error handling file change:', error);
      setErrors(prev => ({ ...prev, featuredImage: 'Error processing file' }));
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFileName('No file chosen');
    setFormData(prev => ({ ...prev, featuredImage: null, featuredImageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  // Handle editor content changes with better paragraph handling
  const handleEditorInput = () => {
    try {
      if (!editorRef.current) return;

      // Fix empty paragraphs and ensure proper line breaks
      const content = editorRef.current.innerHTML;
      
      // Replace multiple <br> tags with proper paragraphs
      const fixedContent = content
        .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '</p><p>')
        .replace(/^(?!<p>)/, '<p>')
        .replace(/(?!<\/p>)$/, '</p>')
        .replace(/<p><\/p>/g, '<p><br></p>'); // Fix empty paragraphs

      if (fixedContent !== content) {
        editorRef.current.innerHTML = fixedContent;
        
        // Move cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      updateWordCount();
    } catch (error) {
      console.error('❌ Error handling editor input:', error);
    }
  };

  // Handle Enter key in editor for better paragraph handling
  const handleEditorKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Don't prevent default, but ensure we have proper paragraph structure
      setTimeout(() => {
        handleEditorInput();
      }, 10);
    }
  };

  // Validate form
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
    if (!content || content === '<br>' || content === '<div><br></div>' || content === '<p><br></p>' || content === '<p></p>') {
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

// getAuth
const getAuthToken = async () => {
  try {
    // Get Firebase Auth instance
    const { auth } = await import('../Firebase/firebase');
    const currentAuthUser = auth.currentUser;
    
    if (!currentAuthUser) {
      throw new Error('No authenticated user. Please sign in.');
    }
    
    // Get fresh Firebase ID token (JWT)
    const idToken = await currentAuthUser.getIdToken(true);
    console.log('✅ Firebase ID token retrieved:', idToken.substring(0, 20) + '...');
    
    return idToken;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    throw new Error('Authentication failed. Please sign in again.');
  }
};

 // Submit article to API with image handling and author tracking
const submitArticle = async (isDraft = false) => {
  console.log('📡 Submitting article to API...', { isDraft, currentUser: !!currentUser });
  
  // Get Firebase Auth token
  const authToken = await getAuthToken();
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
    } else if (key !== 'featuredImage' && formData[key] !== null && formData[key] !== undefined) {
      submitData.append(key, formData[key]);
    }
  });

  // Add content from editor with proper formatting
  const content = editorRef.current?.innerHTML?.trim() || '';
  submitData.append('content', content);
  submitData.append('isDraft', isDraft.toString());
  submitData.append('wordCount', wordCount.toString());
  submitData.append('readingTime', readingTime.toString());

  // CRITICAL: Add author/journalist information
  // This must match the journalist name EXACTLY from the dropdown
  const authorName = formData.author || currentUser?.companyName || 'Unknown Author';
  const authorTitle = formData.authorTitle || '';
  
  console.log('✍️ Article author details:', {
    authorName,
    authorTitle,
    journalist: formData.author
  });

  submitData.append('author', authorName);
  submitData.append('authorName', authorName); // Backup field for matching
  submitData.append('authorTitle', authorTitle);
  submitData.append('journalist', authorName); // Another backup field

  // Add publisher information (CRITICAL for Firebase path)
  const publisherId = currentUser.uid;
  const publisherName = currentUser.companyName || 'Unknown Publisher';
  
  console.log('🏢 Publisher details:', {
    publisherId,
    publisherName
  });

  submitData.append('publisherId', publisherId);
  submitData.append('publisherName', publisherName);

  // Add image URL if available
  if (formData.featuredImageUrl) {
    submitData.append('featuredImageUrl', formData.featuredImageUrl);
  }

  // Add image credit and caption
  if (formData.imageCredit) {
    submitData.append('imageCredit', formData.imageCredit);
  }
  if (formData.imageCaption) {
    submitData.append('imageCaption', formData.imageCaption);
  }

  // Add timestamps
  submitData.append('createdAt', new Date().toISOString());
  submitData.append('updatedAt', new Date().toISOString());

  // Add initial engagement metrics
  submitData.append('views', '0');
  submitData.append('engagement', '0');
  submitData.append('likes', '0');
  submitData.append('comments', '0');
  submitData.append('shares', '0');

  // Prepare headers and URL
  const headers = {
    'Authorization': `Bearer ${authToken}`
    // Don't set Content-Type - browser will set it with boundary for FormData
  };

  // Use the correct API endpoint for article submission
  const url = `/api/publish-article`;
  
  console.log('📡 Making request to:', url);
  console.log('📦 FormData keys:', [...submitData.keys()]);
  console.log('📦 Form data summary:', {
    title: formData.title,
    author: authorName,
    authorTitle: authorTitle,
    category: formData.category,
    isDraft,
    contentLength: content.length,
    hasImage: !!formData.featuredImage,
    imageUrl: formData.featuredImageUrl ? 'Yes' : 'No',
    publisherId: publisherId,
    publisherName: publisherName
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

  // Handle form submission
  const handleManualSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    // Check approval status before allowing publish
    if (!isDraft && !publisherApproval.canPublish) {
      setErrors(prev => ({
        ...prev,
        submit: `Cannot publish: ${publisherApproval.reason}`
      }));
      return;
    }

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
          imageCredit: formData.imageCredit || '',
          imageCaption: formData.imageCaption || '',
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
          featuredImageUrl: '',
          imageCredit: '',
          imageCaption: '',
          style: 'modern',
          content: '',
          metaDescription: '',
          publishNow: true,
          allowComments: true,
          sendNewsletter: false
        });
        setFileName('No file chosen');
        setImagePreview(null);
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

  // Handle save draft
  const handleManualSaveDraft = async (e) => {
    console.log('💾 Save draft requested');
    const title = formData.title.trim();
    const content = editorRef.current?.innerHTML?.trim();
    
    if (!title && (!content || content === '<br>' || content === '<div><br></div>' || content === '<p><br></p>' || content === '<p></p>')) {
      console.log('⚠️ Empty draft - showing warning');
      setErrors(prev => ({ 
        ...prev, 
        submit: 'Please add a title or some content before saving as draft.' 
      }));
      return;
    }
    
    await handleManualSubmit(e, true);
  };

  const ArticlePreview = ({ onClose }) => {
    const previewData = {
      id: 'preview-' + Date.now(),
      title: formData.title || 'Article Title',
      subtitle: formData.subtitle || '',
      content: editorRef.current?.innerHTML || formData.content || '<p>Start writing your article content here...</p>',
      author: formData.author || 'Author Name',
      authorTitle: formData.authorTitle || '',
      category: formData.category || 'General',
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      imageUrl: imagePreview || formData.featuredImageUrl || null,
      featuredImageUrl: imagePreview || formData.featuredImageUrl || null,
      createdAt: new Date().toISOString(),
      readTime: readingTime || 5,
      wordCount: wordCount || 0,
      metaDescription: formData.metaDescription || '',
      style: formData.style || 'modern',
      status: 'preview'
    };

    const mockPublisher = {
      name: currentUser?.companyName || 'Your Publication',
      industry: 'Publishing',
      logo: null
    };

    // Format date for preview
    const formatPreviewDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getCurrentDate = () => {
      const today = new Date();
      return today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
        <div className="min-h-screen bg-white">
          {/* Preview Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">Article Preview</h2>
                <p className="text-sm opacity-90">How your article will appear to readers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-blue-500 rounded-full text-xs font-medium">
                PREVIEW MODE
              </span>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Newspaper-style Article Preview */}
          <div className="newspaper-container">
            <style jsx>{`
              .newspaper-container {
                font-family: 'Times New Roman', 'Times', serif;
                line-height: 1.6;
                color: #1a1a1a;
              }
              
              .newspaper-header {
                border-bottom: 4px solid #000;
                margin-bottom: 2rem;
              }
              
              .newspaper-title {
                font-family: 'Times New Roman', 'Times', serif;
                font-weight: bold;
                letter-spacing: 0.1em;
                text-transform: uppercase;
              }
              
              .newspaper-date-line {
                border-top: 2px solid #000;
                border-bottom: 2px solid #000;
                padding: 0.5rem 0;
                margin: 1rem 0;
                text-align: center;
              }
              
              .preview-main-image-container {
                float: left;
                width: 350px;
                margin: 0 2rem 1.5rem 0;
                border: 3px solid #000;
                background: #fff;
                box-shadow: 0 6px 12px rgba(0,0,0,0.2);
                clear: left;
              }
              
              .preview-main-image {
                width: 100%;
                height: 250px;
                object-fit: cover;
                display: block;
                border-bottom: 2px solid #000;
              }
              
              .preview-main-image-caption {
                padding: 1rem;
                font-size: 0.85em;
                font-style: italic;
                color: #333;
                background: #f8f8f8;
                line-height: 1.5;
                font-family: 'Times New Roman', serif;
                border-top: 1px solid #ccc;
              }
              
              .preview-content {
                text-align: justify;
                hyphens: auto;
                overflow-wrap: break-word;
              }
              
              .preview-content p {
                margin-bottom: 1.2rem;
                text-indent: 1.5em;
                line-height: 1.7;
                overflow-wrap: break-word;
              }
              
              .preview-content p:first-of-type {
                text-indent: 0;
                font-weight: 500;
                font-size: 1.1em;
                margin-bottom: 1.5rem;
              }
              
              @media (max-width: 768px) {
                .preview-main-image-container {
                  float: none;
                  width: 100%;
                  margin: 0 0 2rem 0;
                }
              }
            `}</style>

            {/* Newspaper Header */}
            <div className="newspaper-header">
              <div className="max-w-6xl mx-auto px-8 py-6">
                <div className="text-center mb-6">
                  <h1 className="newspaper-title text-6xl mb-2">
                    {mockPublisher.name.toUpperCase()}
                  </h1>
                  <div className="newspaper-date-line">
                    <p className="text-sm font-medium">
                      {getCurrentDate()} • {mockPublisher.industry} • PREVIEW EDITION
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="max-w-6xl mx-auto px-8 py-6">
              {/* Article Header */}
              <div className="mb-8">
                {/* Category Badge */}
                {previewData.category && (
                  <div className="mb-4">
                    <span className="inline-block bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest">
                      {previewData.category}
                    </span>
                  </div>
                )}

                {/* Main Headline */}
                <h1 className="newspaper-title text-5xl leading-tight mb-6 pb-4 border-b-4 border-black">
                  {previewData.title}
                </h1>
                
                {/* Subtitle */}
                {previewData.subtitle && (
                  <h2 className="text-xl italic text-gray-700 mb-4 font-medium">
                    {previewData.subtitle}
                  </h2>
                )}
                
                {/* Byline and Meta */}
                <div className="flex items-center justify-between mb-6 text-sm border-b-2 border-gray-400 pb-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">
                        By {previewData.author}
                        {previewData.authorTitle && ` • ${previewData.authorTitle}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{formatPreviewDate(previewData.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{previewData.readTime} min read</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-gray-600">
                    <span>{previewData.wordCount} words</span>
                  </div>
                </div>
              </div>

              {/* Article Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Article Content */}
                <div className="lg:col-span-3">
                  {/* Article Body with Image */}
                  <div className="article-content-wrapper overflow-hidden">
                    {/* Main Image */}
                    {previewData.imageUrl && (
                      <div className="preview-main-image-container">
                        <img
                          src={previewData.imageUrl}
                          alt={previewData.title}
                          className="preview-main-image"
                          loading="eager"
                        />
                        <div className="preview-main-image-caption">
                          <strong>{previewData.title}</strong>
                          {formData.imageCredit && (
                            <div className="text-xs mt-1 text-gray-600">
                              Photo: {formData.imageCredit}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="preview-content">
                      <div dangerouslySetInnerHTML={{ __html: previewData.content }} />
                    </div>
                    
                    <div className="clear-both"></div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  {/* Publication Info */}
                  <div className="border-2 border-black p-4 bg-gray-50 mb-4">
                    <h3 className="border-bottom-2 border-black pb-2 mb-3 font-bold text-sm uppercase">
                      About {mockPublisher.name}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-bold border-2 border-black">
                          {mockPublisher.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-black block">{mockPublisher.name}</span>
                          <span className="text-gray-600 text-xs uppercase">{mockPublisher.industry}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {previewData.tags && previewData.tags.length > 0 && (
                    <div className="border-2 border-black p-4 bg-gray-50">
                      <h3 className="border-bottom-2 border-black pb-2 mb-3 font-bold text-sm uppercase">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {previewData.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flip-card-container w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6">
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
        
        .rich-editor {
          word-wrap: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.6;
        }
        
        .rich-editor p {
          margin-bottom: 1em;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        
        .rich-editor img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 10px auto;
        }
        
        .image-preview {
          border: 2px dashed #e5e7eb;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          background: #f9fafb;
        }
      `}</style>

      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        {/* Front Side - Upload Form */}
        <div className="flip-card-front bg-white p-4 sm:p-6 w-full min-w-0">
          {/* Flip Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Document Upload</h2>
            <button
              onClick={() => setIsFlipped(true)}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Manual Entry
            </button>
          </div>

          {/* Approval Status Banner */}
          <ApprovalStatusBanner />

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
                <option>World</option>
                <option>Politics</option>
                <option>Business</option>
                <option>Sports</option>
                <option>Education</option>
                <option>Entertainment</option>
                <option>Health</option>
                <option>Government</option>
                <option>Environment</option>
                <option>Other</option>
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

            {/* Updated Submit Buttons with Approval Awareness */}
            <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-blue-900 text-white px-3 py-1.5 rounded-md hover:bg-blue-800 transition-colors text-xs w-full sm:w-auto"
                disabled={isSubmitting || !currentUser}
              >
                {isSubmitting ? "Saving..." : "SAVE DRAFT"}
              </button>
              
              {/* Review button - always allowed */}
              <button
                type="button"
                onClick={(e) => handleUploadSubmit(e, 'review')}
                className="bg-yellow-400 text-black font-semibold px-3 py-1.5 rounded-md hover:bg-yellow-500 transition-colors text-xs w-full sm:w-auto"
                disabled={isSubmitting || !currentUser}
              >
                {isSubmitting ? "Submitting..." : "SUBMIT FOR REVIEW"}
              </button>
              
              {/* Publish button - approval required */}
              {publisherApproval.canPublish ? (
                <button
                  type="button"
                  onClick={(e) => handleUploadSubmit(e, 'publish')}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors text-xs w-full sm:w-auto"
                  disabled={isSubmitting || !currentUser}
                >
                  {isSubmitting ? "Publishing..." : "PUBLISH NOW"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="bg-gray-400 text-white px-3 py-1.5 rounded-md cursor-not-allowed text-xs w-full sm:w-auto"
                  title={publisherApproval.reason}
                >
                  PUBLISH RESTRICTED
                </button>
              )}
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

        {/* Back Side - Manual Article Form */}
        <div className="flip-card-back bg-white p-6 max-h-[90vh] overflow-y-auto w-full min-w-0">
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

          {/* Approval Status Banner */}
          <ApprovalStatusBanner />

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

          {/* Featured Image Preview */}
          {imagePreview && (
            <div className="mb-6">
              <div className="flex items-start gap-4">
                <div className="w-48 h-32 relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Featured image preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-xs">Processing...</div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Featured Image:</strong> {fileName}
                  </p>
                  {formData.featuredImageUrl && (
                    <p className="text-xs text-green-600">
                      ✅ Image processed
                    </p>
                  )}
                  {isUploadingImage && (
                    <p className="text-xs text-blue-600">
                      ⏳ Processing image...
                    </p>
                  )}
                </div>
              </div>
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

            {/* Author Information - UPDATED */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <div>
    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
      Journalist Name <span className="text-red-500">*</span>
      <span className="text-xs text-gray-500 ml-2">(Select from your team)</span>
    </label>
    <select
      id="author"
      name="author"
      value={formData.author}
      onChange={handleInputChange}
      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        errors.author ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      <option value="">Select a journalist</option>
      {currentUser?.staff
        ?.filter(member => 
          member.department === 'Editorial' || 
          member.department === 'Journalism' ||
          member.position?.toLowerCase().includes('journalist') ||
          member.position?.toLowerCase().includes('reporter') ||
          member.position?.toLowerCase().includes('editor') ||
          member.position?.toLowerCase().includes('writer')
        )
        .map((journalist, index) => (
          <option key={journalist.id || index} value={journalist.name}>
            {journalist.name} - {journalist.position}
          </option>
        ))
      }
    </select>
    {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
    
    {/* Helper text if no journalists exist */}
    {(!currentUser?.staff || currentUser.staff.filter(m => 
      m.department === 'Editorial' || m.department === 'Journalism' ||
      m.position?.toLowerCase().includes('journalist')
    ).length === 0) && (
      <p className="text-amber-600 text-xs mt-2 flex items-center">
        <span className="mr-1">⚠️</span>
        No journalists added yet. Please add team members to your profile.
      </p>
    )}
  </div>
  
  {/* Position - Auto-filled */}
  <div>
    <label htmlFor="authorTitle" className="block text-sm font-medium text-gray-700 mb-2">
      Position/Title
      <span className="text-xs text-gray-500 ml-2">(Auto-filled)</span>
    </label>
    <input
      type="text"
      id="authorTitle"
      name="authorTitle"
      value={formData.authorTitle}
      onChange={handleInputChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
      placeholder="Position will auto-fill"
      readOnly
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

            {/* Featured Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="space-y-3">
                {/* File Upload Button */}
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    key={imagePreview ? 'with-image' : 'no-image'}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
                    disabled={isUploadingImage}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploadingImage ? 'Processing...' : 'Upload Image'}
                  </button>
                  {!imagePreview && (
                    <span className="text-gray-500 text-sm">{fileName}</span>
                  )}
                  {isUploadingImage && (
                    <div className="text-blue-600 text-sm flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Processing image...
                    </div>
                  )}
                </div>

                {/* Image Credit Input - ONLY show when image is selected */}
                {(imagePreview || formData.featuredImageUrl) && (
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="imageCredit" className="block text-sm font-medium text-gray-600 mb-1">
                        Image Credit (Who took this photo?)
                      </label>
                      <input
                        type="text"
                        id="imageCredit"
                        name="imageCredit"
                        value={formData.imageCredit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., John Smith, Reuters, Getty Images"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="imageCaption" className="block text-sm font-medium text-gray-600 mb-1">
                        Image Caption (Optional)
                      </label>
                      <input
                        type="text"
                        id="imageCaption"
                        name="imageCaption"
                        value={formData.imageCaption}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe what's shown in the image..."
                      />
                    </div>
                  </div>
                )}
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
                  <button type="button" onClick={() => handleToolbarClick('bold')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bold">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('italic')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Italic">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('underline')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Underline">
                    <Underline className="w-4 h-4" />
                  </button>
                  <div className="border-r mx-2"></div>
                  <button type="button" onClick={() => handleToolbarClick('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Bullet List">
                    <List className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => formatText('formatBlock', 'p')} className="p-2 hover:bg-gray-200 rounded transition-colors text-xs font-medium" title="Paragraph">
                    P
                  </button>
                  <button type="button" onClick={() => formatText('formatBlock', 'h3')} className="p-2 hover:bg-gray-200 rounded transition-colors text-xs font-medium" title="Heading">
                    H3
                  </button>
                  <div className="border-r mx-2"></div>
                  <button type="button" onClick={() => handleToolbarClick('justifyLeft')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Left">
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('justifyCenter')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Center">
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('justifyRight')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Align Right">
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <div className="border-r mx-2"></div>
                  <button type="button" onClick={() => handleToolbarClick('createLink')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Insert Link">
                    <Link className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToolbarClick('insertImage')} className="p-2 hover:bg-gray-200 rounded transition-colors" title="Insert Image">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Editor */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="rich-editor min-h-[300px] p-4 focus:outline-none text-left"
                  onInput={handleEditorInput}
                  onKeyDown={handleEditorKeyDown}
                  style={{ 
                    minHeight: '300px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6'
                  }}
                  suppressContentEditableWarning={true}
                  placeholder="Start writing your article here..."
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
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter a brief description for search engines (150-160 characters)"
                style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
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

            {/* Submit Buttons with Approval Awareness */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!formData.title && !formData.content}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              
              {/* Save Draft - always allowed */}
              <button
                type="button"
                onClick={handleManualSaveDraft}
                disabled={isSubmitting || !currentUser}
                className="flex-1 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>
              
              {/* Publish Article - approval required */}
              {publisherApproval.canPublish ? (
                <button
                  type="submit"
                  disabled={isSubmitting || !currentUser}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Publishing...' : 'Publish Article'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 px-6 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed flex items-center justify-center w-full sm:w-auto"
                  title={publisherApproval.reason}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publishing Restricted
                </button>
              )}
            </div>

            {/* Debug Information (remove in production) */}
            {process.env.NODE_ENV === 'development' && currentUser && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
                <h4 className="font-medium text-gray-800 mb-2">Debug Info:</h4>
                <p><strong>User ID:</strong> {currentUser.uid}</p>
                <p><strong>Company:</strong> {currentUser.companyName || 'Not set'}</p>
                <p><strong>Can Publish:</strong> {publisherApproval.canPublish ? 'Yes' : 'No'}</p>
                <p><strong>Restriction Reason:</strong> {publisherApproval.reason || 'None'}</p>
                <p><strong>Featured Image URL:</strong> {formData.featuredImageUrl || 'Not uploaded'}</p>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Preview Modal */}
      {showPreview && (
        <ArticlePreview onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}