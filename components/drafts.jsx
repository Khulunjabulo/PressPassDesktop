import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Eye, 
  Send,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

export default function DraftManager({ onEditDraft, onPublishDraft, onDeleteDraft }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedDrafts, setSelectedDrafts] = useState([]);
  const [showActions, setShowActions] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading drafts
    const mockDrafts = [
      {
        id: '1',
        title: 'The Future of AI in Healthcare',
        subtitle: 'Exploring revolutionary medical applications',
        author: 'Dr. Sarah Johnson',
        category: 'technology',
        wordCount: 1250,
        readingTime: 6,
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-16T14:20:00'),
        content: '<p>Artificial intelligence is transforming healthcare...</p>',
        tags: ['AI', 'Healthcare', 'Technology'],
        status: 'draft'
      },
      {
        id: '2',
        title: 'Sustainable Business Practices',
        subtitle: 'Building a greener future for commerce',
        author: 'Michael Chen',
        category: 'business',
        wordCount: 890,
        readingTime: 4,
        createdAt: new Date('2024-01-14T09:15:00'),
        updatedAt: new Date('2024-01-15T16:45:00'),
        content: '<p>As companies face increasing pressure to adopt...</p>',
        tags: ['Sustainability', 'Business', 'Environment'],
        status: 'draft'
      },
      {
        id: '3',
        title: 'Modern Web Development Trends',
        subtitle: 'What developers need to know in 2024',
        author: 'Alex Rodriguez',
        category: 'technology',
        wordCount: 2100,
        readingTime: 10,
        createdAt: new Date('2024-01-10T11:00:00'),
        updatedAt: new Date('2024-01-12T13:30:00'),
        content: '<p>The web development landscape continues to evolve...</p>',
        tags: ['Web Development', 'JavaScript', 'React'],
        status: 'draft'
      }
    ];

    setTimeout(() => {
      setDrafts(mockDrafts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort drafts
  const filteredDrafts = drafts
    .filter(draft => 
      draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleSelectDraft = (draftId) => {
    setSelectedDrafts(prev => 
      prev.includes(draftId) 
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDrafts.length === filteredDrafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(filteredDrafts.map(draft => draft.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedDrafts.length} draft(s)?`)) {
      selectedDrafts.forEach(draftId => {
        onDeleteDraft?.(draftId);
      });
      setDrafts(prev => prev.filter(draft => !selectedDrafts.includes(draft.id)));
      setSelectedDrafts([]);
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getCategoryColor = (category) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      lifestyle: 'bg-purple-100 text-purple-800',
      health: 'bg-red-100 text-red-800',
      education: 'bg-yellow-100 text-yellow-800',
      science: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Draft Articles</h1>
          <p className="text-gray-600 mt-1">
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search drafts by title, author, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created Date</option>
              <option value="title">Title</option>
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

        {/* Bulk Actions */}
        {selectedDrafts.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              {selectedDrafts.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Drafts List */}
      {filteredDrafts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'Start writing your first article!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All Header */}
          <div className="flex items-center gap-3 py-2 px-4 bg-gray-50 rounded-md">
            <input
              type="checkbox"
              checked={selectedDrafts.length === filteredDrafts.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Select All</span>
          </div>

          {/* Draft Cards */}
          {filteredDrafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedDrafts.includes(draft.id)}
                      onChange={() => handleSelectDraft(draft.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {draft.title}
                          </h3>
                          {draft.subtitle && (
                            <p className="text-gray-600 mb-2">{draft.subtitle}</p>
                          )}
                        </div>
                        
                        {/* Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowActions(showActions === draft.id ? null : draft.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          {showActions === draft.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    onEditDraft?.(draft);
                                    setShowActions(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Edit Draft
                                </button>
                                <button
                                  onClick={() => {
                                    onPublishDraft?.(draft);
                                    setShowActions(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Publish Now
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this draft?')) {
                                      onDeleteDraft?.(draft.id);
                                      setDrafts(prev => prev.filter(d => d.id !== draft.id));
                                    }
                                    setShowActions(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Draft
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <Edit3 className="w-3 h-3 mr-1" />
                          {draft.author}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(draft.category)}`}>
                          {draft.category.charAt(0).toUpperCase() + draft.category.slice(1)}
                        </span>
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          {draft.wordCount} words
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {draft.readingTime} min read
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Updated {formatDate(draft.updatedAt)}
                        </span>
                      </div>

                      {/* Tags */}
                      {draft.tags && draft.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {draft.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Content Preview */}
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {draft.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => onEditDraft?.(draft)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => onPublishDraft?.(draft)}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-sm font-medium transition-colors flex items-center"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Publish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}