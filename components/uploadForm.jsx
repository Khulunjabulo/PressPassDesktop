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
  X,
  Camera
} from 'lucide-react';
import FileUpload from "./fileUpload";
import ClassifiedsUploadForm from "./ClassifiedsUploadForm";
import { checkPublisherApproval } from '@/lib/publisherAuth';
import { useRouter } from 'next/navigation';

// Import Template Layouts
import { 
  FashionMagazineLayout,
  TechBusinessLayout,
  ClassicNewspaperLayout,
  MagazineFeatureLayout,
  MinimalCleanLayout,
  ModernGridLayout,
  EditorialLayout
} from './TemplateLayouts';

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
  const [showClassifiedsForm, setShowClassifiedsForm] = useState(false);
  
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
  const [pdfPublishMode, setPdfPublishMode] = useState('extract');

  // Template States
  const [selectedTemplateId, setSelectedTemplateId] = useState(3);
  const [templateCredit, setTemplateCredit] = useState('');

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
    content: '',
    metaDescription: '',
    publishNow: true,
    allowComments: true,
    sendNewsletter: false,
    templateId: 3,
    templateCredit: ''
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

  const router = useRouter();
  const [publisherApproval, setPublisherApproval] = useState({ canPublish: false });

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const templateIdToStyle = {
    1: 'fashion',
    2: 'tech',
    3: 'classic',
    4: 'magazine',
    5: 'minimal',
    6: 'modern',
    7: 'editorial'
  };

  const templates = [
    {
      id: 1,
      name: "Fashion Magazine",
      description: "Elegant layout for fashion, lifestyle, and style articles",
      component: FashionMagazineLayout,
      color: "from-pink-500 to-purple-500"
    },
    {
      id: 2,
      name: "Tech & Business",
      description: "Professional layout for technology and business news",
      component: TechBusinessLayout,
      color: "from-blue-600 to-blue-800"
    },
    {
      id: 3,
      name: "Classic Newspaper",
      description: "Traditional newspaper layout for breaking news",
      component: ClassicNewspaperLayout,
      color: "from-gray-700 to-gray-900"
    },
    {
      id: 4,
      name: "Magazine Feature",
      description: "Full-screen feature layout with visual storytelling",
      component: MagazineFeatureLayout,
      color: "from-yellow-500 to-orange-600"
    },
    {
      id: 5,
      name: "Minimal Clean",
      description: "Clean, minimalist layout for focused reading",
      component: MinimalCleanLayout,
      color: "from-gray-300 to-gray-500"
    },
    {
      id: 6,
      name: "Modern Grid",
      description: "Contemporary grid-based layout with bold design",
      component: ModernGridLayout,
      color: "from-indigo-600 to-purple-600"
    },
    {
      id: 7,
      name: "Editorial Opinion",
      description: "Professional editorial layout for opinion pieces",
      component: EditorialLayout,
      color: "from-amber-600 to-orange-700"
    }
  ];

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

  useEffect(() => {
    if (currentUser) {
      const approval = checkPublisherApproval(currentUser);
      setPublisherApproval(approval);
    }
  }, [currentUser]);

  useEffect(() => {
    const loadUserData = async () => {
      if (typeof window !== 'undefined') {
        try {
          const userData = localStorage.getItem('currentUser');
          
          if (userData) {
            const parsedUser = JSON.parse(userData);
            
            if (parsedUser.uid && parsedUser.role === 'publisher') {
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
                    
                    const updatedUser = {
                      ...parsedUser,
                      staff: freshData.staff || [],
                      profileComplete: freshData.profileComplete,
                      isVerified: freshData.isVerified,
                      isApproved: freshData.isApproved
                    };
                    
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    setCurrentUser(updatedUser);
                  } else {
                    setCurrentUser(parsedUser);
                  }
                } else {
                  setCurrentUser(parsedUser);
                }
              } catch (fetchError) {
                setCurrentUser(parsedUser);
              }
            } else {
              setCurrentUser(parsedUser);
            }
            
            if ((parsedUser.companyName || parsedUser.displayName) && !formData.author) {
              setFormData(prev => ({ 
                ...prev, 
                author: parsedUser.companyName || parsedUser.displayName || '' 
              }));
            }
          } else {
            setCurrentUser({
              uid: 'demo-user-123',
              companyName: 'Demo Publisher',
              role: 'Editor',
              staff: []
            });
            setFormData(prev => ({ ...prev, author: 'Demo Publisher' }));
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
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
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = parseInt(e.target.value);
    setSelectedTemplateId(templateId);
    setFormData(prev => ({
      ...prev,
      templateId: templateId
    }));
  };

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

  const getAuthToken = async () => {
    try {
      const { auth } = await import('../Firebase/firebase');
      const currentAuthUser = auth.currentUser;
      
      if (!currentAuthUser) {
        throw new Error('No authenticated user. Please sign in.');
      }
      
      const idToken = await currentAuthUser.getIdToken(true);
      return idToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Authentication failed. Please sign in again.');
    }
  };

  const handlePdfAsIsUpload = async (action) => {
    try {
      const title = document.getElementById('headline')?.value;
      const author = document.getElementById('byline')?.value;
      const category = document.getElementById('section')?.value;
      const description = document.getElementById('lead')?.value || document.getElementById('body')?.value;

      if (!title || !category) {
        setUploadError("Please provide at least a title and category for the PDF.");
        return;
      }

      const authToken = await getAuthToken();
      
      const formData = new FormData();
      formData.append('pdfFile', file);
      formData.append('publisherId', currentUser.uid);
      formData.append('publisherName', currentUser.companyName || 'Unknown Publisher');
      formData.append('title', title);
      formData.append('category', category.toLowerCase());
      formData.append('description', description || '');
      formData.append('author', author || currentUser.companyName || 'Unknown Author');
      formData.append('isDraft', action !== 'publish');

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload PDF');
      }

      setSubmitStatus('success');
      
      setFile(null);
      setUploadProgress(null);
      document.getElementById('headline').value = '';
      document.getElementById('byline').value = '';
      document.getElementById('lead').value = '';
      document.getElementById('body').value = '';
      
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError(error.message || "Failed to upload PDF. Please try again.");
    }
  };

  const handleExtractAndPublish = async (action) => {
    try {
      const { extractTextFromPDF } = await import('../lib/pdfExtractor');
      const pdfText = await extractTextFromPDF(file);
      
      const lines = pdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const headline = lines[0] || 'Untitled Article';
      
      let byline = '';
      const bylineIndex = lines.findIndex(line => line.toLowerCase().startsWith('by '));
      if (bylineIndex !== -1) {
        byline = lines[bylineIndex].substring(3).trim();
      }
      
      let contentStartIndex = 1;
      if (bylineIndex !== -1) {
        contentStartIndex = Math.max(contentStartIndex, bylineIndex + 1);
      }
      
      const contentLines = lines.slice(contentStartIndex);
      const content = contentLines.join('\n');
      const metaDescription = content.substring(0, 160) + (content.length > 160 ? '...' : '');
      
      const articleData = {
        title: headline,
        subtitle: '',
        author: byline || currentUser?.companyName || 'Unknown Author',
        authorTitle: '',
        category: 'general',
        tags: [],
        featuredImage: null,
        featuredImageUrl: '',
        content: content,
        metaDescription: metaDescription,
        publishNow: action === 'publish',
        allowComments: true,
        sendNewsletter: false,
        isDraft: action !== 'publish',
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
        readingTime: Math.ceil(content.split(/\s+/).filter(word => word.length > 0).length / 200) || 1,
        publisherId: currentUser?.uid,
        publisherName: currentUser?.companyName || 'Unknown Publisher',
        templateId: selectedTemplateId,
        style: templateIdToStyle[selectedTemplateId] || 'classic',
        templateCredit: templateCredit
      };
      
      if (onSubmit && typeof onSubmit === 'function') {
        await onSubmit(articleData);
        setSubmitStatus('success');
      } else {
        await submitArticle(action !== 'publish');
        setSubmitStatus('success');
      }
      
      setFile(null);
      setUploadProgress(null);
      setAutofill({ headline: "", byline: "", location: "" });
      
      setTimeout(() => {
        onClose?.();
      }, 2000);
      
    } catch (extractionError) {
      console.error('Error extracting PDF content:', extractionError);
      setUploadError("Failed to extract content from PDF. Please try again or use manual entry.");
    }
  };

  const handleUploadSubmit = async (e, action = 'publish') => {
    e.preventDefault();
    
    if (action === 'publish' && !publisherApproval.canPublish) {
      setUploadError(`Cannot publish: ${publisherApproval.reason}`);
      return;
    }

    setUploadError("");
    setIsSubmitting(true);

    try {
      if (!file) {
        setUploadError("Please select a PDF file to upload.");
        setIsSubmitting(false);
        return;
      }

      if (pdfPublishMode === 'publish-as-is') {
        await handlePdfAsIsUpload(action);
      } else {
        await handleExtractAndPublish(action);
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

  const formatText = (command, value = null) => {
    try {
      if (!editorRef.current) {
        return;
      }

      editorRef.current.focus();
      
      if (command === 'formatBlock') {
        document.execCommand('formatBlock', false, value || 'p');
      } else if (command === 'insertParagraph') {
        document.execCommand('insertHTML', false, '<br><br>');
      } else {
        document.execCommand(command, false, value);
      }
      
      updateWordCount();
    } catch (error) {
      console.error('Error formatting text:', error);
    }
  };

  const handleToolbarClick = (command) => {
    try {
      if (command === 'createLink') {
        const url = prompt('Enter the URL:');
        if (url) formatText(command, url);
      } else if (command === 'insertImage') {
        fileInputRef.current?.click();
      } else {
        formatText(command);
      }
    } catch (error) {
      console.error('Error handling toolbar click:', error);
    }
  };

  const updateWordCount = () => {
    try {
      if (!editorRef.current) {
        return;
      }
      
      const text = editorRef.current.textContent || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const readingTimeCalc = Math.ceil(words / 200) || 1;
      
      setWordCount(words);
      setReadingTime(readingTimeCalc);
      
      const content = editorRef.current.innerHTML;
      setFormData(prev => ({ ...prev, content: content }));
    } catch (error) {
      console.error('Error updating word count:', error);
    }
  };

  const handleFileChange = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) {
        setFileName('No file chosen');
        setFormData(prev => ({ 
          ...prev, 
          featuredImage: null, 
          featuredImageUrl: '',
          imageCredit: prev.imageCredit || ''
        }));
        setImagePreview(null);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, featuredImage: 'Please select a valid image file' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, featuredImage: 'Image size must be less than 5MB' }));
        return;
      }

      const localImageUrl = URL.createObjectURL(file);
      setImagePreview(localImageUrl);
      setFileName(file.name);
      setIsUploadingImage(true);

      try {
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64DataUrl = e.target.result;
          
          setFormData(prev => ({ 
            ...prev, 
            featuredImage: file,
            featuredImageUrl: base64DataUrl,
            imageUrl: base64DataUrl
          }));
          
          setImagePreview(base64DataUrl);
          setIsUploadingImage(false);
        };
        
        reader.onerror = function(error) {
          throw new Error('Failed to read file: ' + error.message);
        };
        
        reader.readAsDataURL(file);
        
      } catch (uploadError) {
        console.error('Base64 conversion failed:', uploadError);
        setErrors(prev => ({ 
          ...prev, 
          featuredImage: 'Failed to process image: ' + uploadError.message 
        }));
        
        setFormData(prev => ({ 
          ...prev, 
          featuredImage: file,
          featuredImageUrl: localImageUrl 
        }));
        setIsUploadingImage(false);
      }

      setErrors(prev => ({ ...prev, featuredImage: null }));

    } catch (error) {
      console.error('Error handling file change:', error);
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
    
    try {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }

      if (name === 'metaDescription') {
        setMetaCharCount(value.length);
      }
    } catch (error) {
      console.error('Error handling input change:', error);
    }
  };

  const handleEditorInput = () => {
    try {
      if (!editorRef.current) return;

      const content = editorRef.current.innerHTML;
      
      const fixedContent = content
        .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '</p><p>')
        .replace(/^(?!<p>)/, '<p>')
        .replace(/(?!<\/p>)$/, '</p>')
        .replace(/<p><\/p>/g, '<p><br></p>');

      if (fixedContent !== content) {
        editorRef.current.innerHTML = fixedContent;
        
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      updateWordCount();
    } catch (error) {
      console.error('Error handling editor input:', error);
    }
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Enter') {
      setTimeout(() => {
        handleEditorInput();
      }, 10);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    const content = editorRef.current?.innerHTML?.trim();
    if (!content || content === '<br>' || content === '<div><br></div>' || content === '<p><br></p>' || content === '<p></p>') {
      newErrors.content = 'Article content is required';
    }

    if (!currentUser) {
      newErrors.auth = 'User authentication required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitArticle = async (isDraft = false) => {
    const authToken = await getAuthToken();
    if (!authToken) {
      throw new Error('Authentication token required');
    }

    const submitData = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === 'featuredImage' && formData[key]) {
        submitData.append(key, formData[key]);
      } else if (key !== 'featuredImage' && formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    });

    const content = editorRef.current?.innerHTML?.trim() || '';
    submitData.append('content', content);
    submitData.append('isDraft', isDraft.toString());
    submitData.append('wordCount', wordCount.toString());
    submitData.append('readingTime', readingTime.toString());

    const authorName = formData.author || currentUser?.companyName || 'Unknown Author';
    const authorTitle = formData.authorTitle || '';

    submitData.append('author', authorName);
    submitData.append('authorName', authorName);
    submitData.append('authorTitle', authorTitle);
    submitData.append('journalist', authorName);

    const publisherId = currentUser.uid;
    const publisherName = currentUser.companyName || 'Unknown Publisher';

    submitData.append('publisherId', publisherId);
    submitData.append('publisherName', publisherName);

    const styleString = templateIdToStyle[selectedTemplateId] || 'classic';
    submitData.append('templateId', selectedTemplateId.toString());
    submitData.append('style', styleString); 
    submitData.append('templateCredit', templateCredit);

    if (formData.featuredImageUrl) {
      submitData.append('featuredImageUrl', formData.featuredImageUrl);
    }

    if (formData.imageCredit) {
      submitData.append('imageCredit', formData.imageCredit);
    }
    if (formData.imageCaption) {
      submitData.append('imageCaption', formData.imageCaption);
    }

    submitData.append('createdAt', new Date().toISOString());
    submitData.append('updatedAt', new Date().toISOString());

    submitData.append('views', '0');
    submitData.append('engagement', '0');
    submitData.append('likes', '0');
    submitData.append('comments', '0');
    submitData.append('shares', '0');

    const headers = {
      'Authorization': `Bearer ${authToken}`
    };

    const url = `/api/publish-article`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: submitData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return result;
  };

  const handleManualSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    if (!isDraft && !publisherApproval.canPublish) {
      setErrors(prev => ({
        ...prev,
        submit: `Cannot publish: ${publisherApproval.reason}`
      }));
      return;
    }

    setSubmitStatus(null);
    setErrors({});
    
    if (!isDraft && !validateForm()) {
      return;
    }

    if (!currentUser) {
      setErrors(prev => ({ ...prev, auth: 'Please sign in to publish articles' }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      let result;
      if (onSubmit && typeof onSubmit === 'function') {
        const submitData = {
          ...formData,
          imageCredit: formData.imageCredit || '',
          imageCaption: formData.imageCaption || '',
          content: editorRef.current?.innerHTML?.trim() || '',
          isDraft,
          wordCount,
          readingTime,
          publisherId: currentUser.uid,
          publisherName: currentUser.companyName,
          templateId: selectedTemplateId,
          style: templateIdToStyle[selectedTemplateId] || 'classic',
          templateCredit: templateCredit
        };
        
        result = await onSubmit(submitData);
      } else {
        result = await submitArticle(isDraft);
      }
      
      setSubmitStatus('success');
      
      if (!isDraft) {
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
          content: '',
          metaDescription: '',
          publishNow: true,
          allowComments: true,
          sendNewsletter: false,
          templateId: 3,
          templateCredit: ''
        });
        setFileName('No file chosen');
        setImagePreview(null);
        setSelectedTemplateId(3);
        setTemplateCredit('');
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
        updateWordCount();
      }
      
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (error) {
      console.error('Submit error:', error);
      
      setSubmitStatus('error');
      
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'An error occurred while submitting. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSaveDraft = async (e) => {
    const title = formData.title.trim();
    const content = editorRef.current?.innerHTML?.trim();
    
    if (!title && (!content || content === '<br>' || content === '<div><br></div>' || content === '<p><br></p>' || content === '<p></p>')) {
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
      templateCredit: templateCredit || '',
      status: 'preview'
    };

    const SelectedTemplate = templates.find(t => t.id === selectedTemplateId)?.component || ClassicNewspaperLayout;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
        <div className="min-h-screen bg-white">
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <Eye className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-bold">Article Preview</h2>
                <p className="text-sm opacity-90">
                  Template: {templates.find(t => t.id === selectedTemplateId)?.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <SelectedTemplate article={previewData} isPreview={true} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full mx-auto">
      <style jsx>{`
        .flip-card-container {
          perspective: 1000px;
          height: auto;
          min-height: 600px;
          width: 100%;
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

      <div className="flip-card-container">
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          {/* Front Side - PDF Upload Form */}
          <div className="flip-card-front bg-white p-6 w-full min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Document Upload</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Manual Entry
                </button>
                <button
                  onClick={() => setShowClassifiedsForm(true)}
                  className="flex items-center px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Classifieds
                </button>
              </div>
            </div>

            <ApprovalStatusBanner />

            <form onSubmit={handleUploadSubmit} className="w-full">
              <FileUpload
                setFile={setFile}
                uploadProgress={uploadProgress}
                onPreview={handlePreview}
                onExtract={(data) => setAutofill(data)}
                pdfPublishMode={pdfPublishMode}
                setPdfPublishMode={setPdfPublishMode}
              />

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              )}

              {submitStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-800">PDF submitted successfully!</span>
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

              <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="bg-blue-900 text-white px-3 py-1.5 rounded-md hover:bg-blue-800 transition-colors text-xs w-full sm:w-auto"
                  disabled={isSubmitting || !currentUser}
                >
                  {isSubmitting ? "Saving..." : "SAVE DRAFT"}
                </button>
                
                <button
                  type="button"
                  onClick={(e) => handleUploadSubmit(e, 'review')}
                  className="bg-yellow-400 text-black font-semibold px-3 py-1.5 rounded-md hover:bg-yellow-500 transition-colors text-xs w-full sm:w-auto"
                  disabled={isSubmitting || !currentUser}
                >
                  {isSubmitting ? "Submitting..." : "SUBMIT FOR REVIEW"}
                </button>
                
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

            <ApprovalStatusBanner />

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

              {/* Template Selector */}
              <div className="mb-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Template <span className="text-red-500">*</span>
                </label>
                <select
                  id="templateId"
                  value={selectedTemplateId}
                  onChange={handleTemplateChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
                
                <div className="mb-2">
                  <div className={`h-12 rounded-md bg-gradient-to-r ${templates.find(t => t.id === selectedTemplateId)?.color} flex items-center justify-center text-white font-bold`}>
                    {templates.find(t => t.id === selectedTemplateId)?.name}
                  </div>
                </div>

                <div>
                  <label htmlFor="templateCredit" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Camera className="w-4 h-4 mr-1" />
                    Designer/Photographer Credit (Optional)
                  </label>
                  <input
                    type="text"
                    id="templateCredit"
                    value={templateCredit}
                    onChange={(e) => {
                      setTemplateCredit(e.target.value);
                      setFormData(prev => ({ ...prev, templateCredit: e.target.value }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., John Smith Photography"
                  />
                </div>
              </div>

              {/* Featured Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <div className="space-y-3">
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

              {/* Rich Text Editor */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Content <span className="text-red-500">*</span>
                </label>
                <div className={`border rounded-md overflow-hidden ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}>
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

              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>Words: {wordCount}</span>
                <span>Reading time: {readingTime} min</span>
              </div>

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
                
                <button
                  type="button"
                  onClick={handleManualSaveDraft}
                  disabled={isSubmitting || !currentUser}
                  className="flex-1 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50 w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Draft'}
                </button>
                
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

              {process.env.NODE_ENV === 'development' && currentUser && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
                  <h4 className="font-medium text-gray-800 mb-2">Debug Info:</h4>
                  <p><strong>User ID:</strong> {currentUser.uid}</p>
                  <p><strong>Company:</strong> {currentUser.companyName || 'Not set'}</p>
                  <p><strong>Can Publish:</strong> {publisherApproval.canPublish ? 'Yes' : 'No'}</p>
                  <p><strong>Restriction Reason:</strong> {publisherApproval.reason || 'None'}</p>
                  <p><strong>Featured Image URL:</strong> {formData.featuredImageUrl || 'Not uploaded'}</p>
                  <p><strong>Template ID:</strong> {selectedTemplateId}</p>
                  <p><strong>Template Name:</strong> {templates.find(t => t.id === selectedTemplateId)?.name}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      
      {showPreview && (
        <ArticlePreview onClose={() => setShowPreview(false)} />
      )}

      {showClassifiedsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <ClassifiedsUploadForm
            onSubmit={async (classifiedData) => {
              console.log('Classified submitted:', classifiedData);
              setShowClassifiedsForm(false);
            }}
            onClose={() => setShowClassifiedsForm(false)}
          />
        </div>
      )}
    </div>
  );
}