'use client'

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  User,
  Plus,
  Search,
  Filter,
  MoreVertical,
  BookOpen,
  Send,
  Save,
  AlertCircle,
  CheckCircle,
  Globe,
  TrendingUp,
  BarChart3,
  Users,
  X,
  ArrowLeft
} from 'lucide-react';
import PublisherSidebar from '@/components/UI/publisherSidebar';
import Header from '@/components/UI/header';
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher"
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

// Fixed hook with proper status filtering
const usePublisherContent = (publisherId) => {
  const [articles, setArticles] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all content for publisher with better error handling
  const fetchContent = async () => {
    if (!publisherId) {
      ('⏩ No publisherId provided, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      ('🔄 Fetching content for publisher:', publisherId);

      const url = `/api/publish-article?publisherId=${publisherId}&type=both`;
      ('📡 Making request to:', url);

      const response = await fetch(url);
      
      ('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API response not ok:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const responseText = await response.text();
      ('📄 Raw response preview:', responseText.substring(0, 200) + '...');

      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      ('📊 Parsed data:', { 
        success: data.success, 
        articlesCount: data.articles?.length || 0, 
        draftsCount: data.drafts?.length || 0,
        error: data.error
      });

      if (data.success) {
        // FIXED: Proper status filtering with logging
        const publishedArticles = (data.articles || []).filter(item => {
          const isPublished = item.status === 'published';
          (`📰 Article "${item.title}": status="${item.status}", isPublished=${isPublished}`);
          return isPublished;
        });
        
        const draftArticles = (data.drafts || []).filter(item => {
          const isDraft = item.status === 'draft';
          (`✏️ Draft "${item.title}": status="${item.status}", isDraft=${isDraft}`);
          return isDraft;
        });

        setArticles(publishedArticles);
        setDrafts(draftArticles);
        
        ('✅ Content categorized:', { 
          published: publishedArticles.length, 
          drafts: draftArticles.length 
        });
      } else {
        throw new Error(data.error || data.details || 'Failed to fetch content');
      }
    } catch (err) {
      console.error('❌ Error in fetchContent:', err);
      setError(err.message);
      setArticles([]);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when publisherId changes
  useEffect(() => {
    fetchContent();
  }, [publisherId]);

  const publishDraft = async (draftId) => {
    if (!publisherId || !draftId) {
      throw new Error('Publisher ID and Draft ID are required');
    }

    try {
      ('📤 Publishing draft:', draftId);

      const response = await fetch(
        `/api/manage-drafts?publisherId=${publisherId}&draftId=${draftId}&action=publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Refresh content to get updated lists
        await fetchContent();
        ('✅ Draft published successfully');
        return result;
      } else {
        throw new Error(result.error || 'Failed to publish draft');
      }
    } catch (err) {
      console.error('❌ Error publishing draft:', err);
      throw err;
    }
  };

  const deleteArticle = async (articleId) => {
    if (!publisherId || !articleId) {
      throw new Error('Publisher ID and Article ID are required');
    }

    try {
      ('🗑️ Deleting article:', articleId);

      const response = await fetch(
        `/api/publish-article?publisherId=${publisherId}&articleId=${articleId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        setArticles(prev => prev.filter(article => article.id !== articleId));
        ('✅ Article deleted successfully');
        return result;
      } else {
        throw new Error(result.error || 'Failed to delete article');
      }
    } catch (err) {
      console.error('❌ Error deleting article:', err);
      throw err;
    }
  };

  const deleteDraft = async (draftId) => {
    if (!publisherId || !draftId) {
      throw new Error('Publisher ID and Draft ID are required');
    }

    try {
      ('🗑️ Deleting draft:', draftId);

      const response = await fetch(
        `/api/manage-drafts?publisherId=${publisherId}&draftId=${draftId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        setDrafts(prev => prev.filter(draft => draft.id !== draftId));
        ('✅ Draft deleted successfully');
        return result;
      } else {
        throw new Error(result.error || 'Failed to delete draft');
      }
    } catch (err) {
      console.error('❌ Error deleting draft:', err);
      throw err;
    }
  };

  const getStats = (subscriberCount) => ({
    publishedCount: articles.length,
    draftCount: drafts.length,
    subscriberCount: subscriberCount,
    totalViews: articles.reduce((sum, article) => sum + (article.views || 0), 0),
    totalEngagements: articles.reduce((sum, article) => sum + (article.likeCount || 0) + (article.comments || 0), 0)
  });

  return {
    articles,
    drafts,
    loading,
    error,
    publishDraft,
    deleteArticle,
    deleteDraft,
    getStats,
    refetch: fetchContent
  };
};

// Fixed Article Editor Component with proper tags handling
const ArticleEditor = ({ item, onSave, onCancel, isNew = false }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    subtitle: item?.subtitle || '',
    author: item?.author || '',
    authorTitle: item?.authorTitle || '',
    category: item?.category || '',
    // FIXED: Handle tags properly - check if it's array or string
    tags: Array.isArray(item?.tags) ? item.tags.join(', ') : (item?.tags || ''),
    style: item?.style || 'modern',
    content: item?.content || '',
    metaDescription: item?.metaDescription || '',
    publishNow: item?.publishNow ?? true,
    allowComments: item?.allowComments ?? true,
    sendNewsletter: item?.sendNewsletter ?? false,
    featuredImageUrl: item?.featuredImageUrl || '',
    ...item
  });

  const [saving, setSaving] = useState(false);

  ('🎯 ArticleEditor initialized:', {
    isNew,
    itemTitle: item?.title,
    itemStatus: item?.status,
    itemTags: item?.tags,
    tagsType: typeof item?.tags,
    formDataTags: formData.tags
  });

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const submitData = {
        ...formData,
        // FIXED: Proper tags handling - check if it's already an array
        tags: typeof formData.tags === 'string' 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : Array.isArray(formData.tags) 
            ? formData.tags 
            : [],
        isDraft: asDraft,
        status: asDraft ? 'draft' : 'published',
        wordCount: formData.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length,
        readingTime: Math.ceil(formData.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length / 200),
        articleId: item?.id || null // Add article ID for updates
      };

      ('💾 Submitting article data:', {
        title: submitData.title,
        status: submitData.status,
        isDraft: submitData.isDraft,
        tags: submitData.tags,
        tagsType: typeof submitData.tags,
        articleId: submitData.articleId
      });

      await onSave(submitData, asDraft);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isNew ? 'Create New Article' : `Edit ${item?.status === 'draft' ? 'Draft' : 'Article'}`}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-6">
          <form onSubmit={(e) => handleSubmit(e, false)}>
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter article title"
                required
              />
            </div>

            {/* Subtitle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter subtitle (optional)"
              />
            </div>

            {/* Author Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Author name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author Title
                </label>
                <input
                  type="text"
                  value={formData.authorTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, authorTitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Writer, Editor"
                />
              </div>
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., innovation, AI, future"
                />
              </div>
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

            {/* Content */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content.replace(/<[^>]*>/g, '')} // Strip HTML for simple editing
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  content: `<p>${e.target.value.split('\n\n').join('</p><p>')}</p>` 
                }))}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                placeholder="Start writing your article here..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Words: {formData.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length} • 
                Reading time: {Math.ceil(formData.content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length / 200)} min
              </p>
            </div>

            {/* Meta Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (for SEO)
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter a brief description for search engines (150-160 characters)"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">Recommended: 150-160 characters</span>
                <span className={`text-xs ${formData.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.metaDescription.length}/160
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
                    checked={formData.publishNow}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishNow: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allowComments}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow reader comments</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sendNewsletter}
                    onChange={(e) => setFormData(prev => ({ ...prev, sendNewsletter: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Send notification to subscribers</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={saving}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              {(isNew || item?.status === 'draft') && (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {saving ? 'Publishing...' : 'Publish Article'}
                </button>
              )}
              {!isNew && item?.status !== 'draft' && (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Updating...' : 'Update Article'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function EnhancedPublisherDashboard() {
  // ✅ STEP 1: Declare currentUser state FIRST
  const [currentUser, setCurrentUser] = useState(null);
  
  // ✅ STEP 2: Declare subscriberCount state
  const [subscriberCount, setSubscriberCount] = useState(0);
  
  // Other state variables
  const [activeTab, setActiveTab] = useState('articles');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showActions, setShowActions] = useState(null);
  const [showPreview, setShowPreview] = useState(null);
  const [showEditor, setShowEditor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const { publisher } = useCurrentPublisher("currentPublisherId");

  // ✅ STEP 3: Initialize currentUser
  useEffect(() => {
    try {
      const userData = localStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        ('👤 Current user loaded:', { 
          uid: user.uid, 
          role: user.role,
          companyName: user.companyName
        });
        setCurrentUser(user);
      } else {
        ('⚠️ No user data found in localStorage');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('❌ Error reading user data:', error);
      setCurrentUser(null);
    }
  }, []);

  // ✅ STEP 4: Fetch subscriber count (NOW in component, not hook)
  useEffect(() => {
    const fetchSubscriberCount = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const response = await fetch(`/api/subscribers?publisherId=${currentUser.uid}`);
        const data = await response.json();
        
        if (data.success) {
          setSubscriberCount(data.subscriberCount);
        }
      } catch (error) {
        console.error('Error fetching subscriber count:', error);
      }
    };
    
    fetchSubscriberCount();
  }, [currentUser?.uid]);

  // ✅ STEP 5: Now use the hook
  const { 
    articles, 
    drafts, 
    loading,
    error,
    publishDraft, 
    deleteArticle, 
    deleteDraft, 
    getStats,
    refetch
  } = usePublisherContent(currentUser?.uid);

  // ✅ STEP 6: Override stats with actual subscriber count
  const stats = {
    ...getStats(subscriberCount),
    subscriberCount: subscriberCount // Use the state value
  };
  
  const handleEdit = (item) => {
    ('✏️ Edit button clicked for:', {
      id: item.id,
      title: item.title,
      status: item.status,
      tags: item.tags,
      tagsType: typeof item.tags
    });
    setShowEditor({ item, isNew: false });
  };

  const handleNewArticle = () => {
    setShowEditor({ item: null, isNew: true });
  };

  const handleView = (item) => {
    setShowPreview(item);
  };

  const handleDelete = async (itemId, itemType) => {
    try {
      if (itemType === 'article') {
        await deleteArticle(itemId);
      } else {
        await deleteDraft(itemId);
      }
      
      setNotification({
        type: 'success',
        message: `${itemType} deleted successfully`
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to delete ${itemType}`
      });
      
      setTimeout(() => setNotification(null), 3000);
    }
    
    setDeleteConfirm(null);
  };

  const handlePublishDraft = async (draft) => {
    try {
      await publishDraft(draft.id);
      
      setNotification({
        type: 'success',
        message: 'Draft published successfully!'
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to publish draft'
      });
      
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Fixed handleSave with proper API integration
  const handleSave = async (data, asDraft) => {
    if (!currentUser?.uid) {
      setNotification({
        type: 'error',
        message: 'Publisher ID not found. Please log in again.'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      ('💾 Saving article:', { 
        title: data.title, 
        asDraft, 
        articleId: data.articleId,
        publisherId: currentUser.uid,
        status: data.status
      });

      const formData = new FormData();
      
      // Add all article data to form
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          if (Array.isArray(data[key])) {
            formData.append(key, data[key].join(','));
          } else {
            formData.append(key, data[key]);
          }
        }
      });

      // Set proper flags
      formData.append('isDraft', asDraft.toString());
      formData.append('publishNow', (!asDraft).toString());
      formData.append('publisherId', currentUser.uid);
      formData.append('publisherName', currentUser.companyName || currentUser.email || 'Publisher');
      formData.append('status', asDraft ? 'draft' : 'published');

      // Add article ID if updating existing article
      if (data.articleId) {
        formData.append('articleId', data.articleId);
      }

      const url = `/api/publish-article?publisherId=${currentUser.uid}`;
      ('📡 Making request to:', url);
      ('📦 Form data summary:', {
        title: data.title,
        isDraft: asDraft,
        status: asDraft ? 'draft' : 'published',
        articleId: data.articleId || 'new',
        publisherId: currentUser.uid
      });

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      ('📡 Response:', result);

      if (result.success) {
        setNotification({
          type: 'success',
          message: asDraft ? 'Draft saved successfully!' : 'Article published successfully!'
        });
        
        setShowEditor(null);
        
        // Refresh content
        if (typeof refetch === 'function') {
          await refetch();
        }
      } else {
        throw new Error(result.error || `Failed to ${asDraft ? 'save draft' : 'publish article'}`);
      }
    } catch (error) {
      console.error('❌ Error saving article:', error);
      setNotification({
        type: 'error',
        message: error.message || `Failed to ${asDraft ? 'save draft' : 'publish article'}`
      });
    } finally {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getCategoryColor = (category) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-800 border-blue-200',
      business: 'bg-green-100 text-green-800 border-green-200',
      lifestyle: 'bg-purple-100 text-purple-800 border-purple-200',
      health: 'bg-red-100 text-red-800 border-red-200',
      education: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      science: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || colors.other;
  };

  const currentItems = activeTab === 'articles' ? articles : drafts;
  const filteredItems = currentItems
    .filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Article Preview Component
  const ArticlePreview = ({ article, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Preview Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Article Preview</h3>
            <p className="text-sm text-gray-600">
              {article.status === 'published' ? 'Published Article' : 'Draft Preview'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Preview Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Article Header - Newspaper Style */}
          <div className="p-6 border-b-2 border-black">
            <div className="text-center mb-4">
              <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
                {currentUser?.companyName || 'Publisher Name'}
              </h1>
              <div className="border-t-2 border-b-2 border-black py-1">
                <p className="text-sm font-medium">
                  {formatDate(new Date())} • Today's Edition
                </p>
              </div>
            </div>

            {/* Category */}
            {article.category && (
              <div className="mb-4">
                <span className="inline-block bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest">
                  {article.category}
                </span>
              </div>
            )}

            {/* Headline */}
            <h1 className="text-3xl font-bold leading-tight mb-4 pb-4 border-b-2 border-black">
              {article.title}
            </h1>
            
            {/* Subtitle */}
            {article.subtitle && (
              <h2 className="text-xl italic text-gray-700 mb-4 font-medium">
                {article.subtitle}
              </h2>
            )}
            
            {/* Byline */}
            <div className="flex items-center justify-between text-sm border-b border-gray-400 pb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="font-bold">By {article.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readingTime} min read</span>
                </div>
              </div>
              
              {article.status === 'published' && (
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{article.likes || 0} likes</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6">
            {/* Featured Image */}
            {article.featuredImageUrl && (
              <div className="mb-6">
                <img
                  src={article.featuredImageUrl}
                  alt={article.title}
                  className="w-full max-w-md mx-auto border-2 border-black"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Content */}
            <div 
              className="prose max-w-none text-justify leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{ 
                fontFamily: '"Times New Roman", Times, serif',
                lineHeight: '1.7',
                wordBreak: 'break-word',
                hyphens: 'auto'
              }}
            />

            {/* Tags */}
            {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
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
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Authentication Required</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Please log in to access your publisher dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Error Loading Content</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header publisher={publisher} />
      <div className="flex h-screen bg-gray-50 overflow-clip scroll-auto">
        <PublisherSidebar/>
        <div className='flex-1 flex flex-col md:p-6 bg-gray-50 overflow-y-auto'>
          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <span>{notification.message}</span>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Publisher Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {currentUser?.companyName || 'Publisher'}
              </p>
            </div>
            
            <div className="flex gap-3 mt-4 lg:mt-0">
              <button
                onClick={handleNewArticle}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Published Articles</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.publishedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Draft Articles</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.draftCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Subscribers</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.subscriberCount?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Readers who favorited you
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Engagement</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalEngagements?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Likes + Comments combined
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'articles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Published Articles ({stats.publishedCount})
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'drafts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Drafts ({stats.draftCount})
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, author, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Created Date</option>
                  <option value="title">Title</option>
                  <option value="views">Views</option>
                  <option value="wordCount">Word Count</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Content List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : `You haven't ${activeTab === 'articles' ? 'published any articles' : 'saved any drafts'} yet.`
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNewArticle}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Article
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Featured Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.featuredImageUrl ? (
                          <img
                            src={item.featuredImageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.title}
                            </h3>
                            {item.subtitle && (
                              <p className="text-gray-600 mb-2">{item.subtitle}</p>
                            )}
                          </div>
                          
                          {/* Actions Dropdown */}
                          <div className="relative ml-4">
                            <button
                              onClick={() => setShowActions(showActions === item.id ? null : item.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                            
                            {showActions === item.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleView(item);
                                      setShowActions(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview Article
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleEdit(item);
                                      setShowActions(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                  >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit {activeTab === 'articles' ? 'Article' : 'Draft'}
                                  </button>
                                  {activeTab === 'drafts' && (
                                    <button
                                      onClick={() => {
                                        handlePublishDraft(item);
                                        setShowActions(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                    >
                                      <Send className="w-4 h-4 mr-2" />
                                      Publish Now
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setDeleteConfirm({ 
                                        id: item.id, 
                                        title: item.title, 
                                        type: activeTab.slice(0, -1) 
                                      });
                                      setShowActions(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete {activeTab === 'articles' ? 'Article' : 'Draft'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
                            {item.category?.charAt(0).toUpperCase() + item.category?.slice(1)}
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {item.wordCount} words
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.readingTime} min read
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {item.status === 'published' ? 'Published' : 'Updated'} {formatDate(item.status === 'published' ? item.publishedAt : item.updatedAt)}
                          </span>
                          {item.status === 'published' && (
                            <>
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {item.views || 0} views
                              </span>
                              <span className="flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {(item.likes || 0) + (item.comments || 0)} engagements
                              </span>
                            </>
                          )}
                        </div>

                        {/* Tags */}
                        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{item.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Content Preview */}
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {item.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleView(item)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium transition-colors flex items-center"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      {activeTab === 'drafts' && (
                        <button
                          onClick={() => handlePublishDraft(item)}
                          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors flex items-center"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Article Preview Modal */}
          {showPreview && (
            <ArticlePreview
              article={showPreview}
              onClose={() => setShowPreview(null)}
            />
          )}

          {/* Article Editor Modal */}
          {showEditor && (
            <ArticleEditor
              item={showEditor.item}
              isNew={showEditor.isNew}
              onSave={handleSave}
              onCancel={() => setShowEditor(null)}
            />
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete {deleteConfirm.type}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"? 
                    This action cannot be undone.
                  </p>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.type)}
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
                    >
                      Delete {deleteConfirm.type}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <PrintMediaFooter/>
    </>
  );
}