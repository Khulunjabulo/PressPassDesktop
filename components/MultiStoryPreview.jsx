// components/MultiStoryPreview.jsx - Preview and manage multiple stories from PDF
'use client'

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Image as ImageIcon, 
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';

export default function MultiStoryPreview({ 
  stories, 
  onPublish, 
  onCancel,
  onEditStory 
}) {
  const [selectedStories, setSelectedStories] = useState(
    stories.map((_, idx) => idx)
  );
  const [expandedStories, setExpandedStories] = useState([0]);
  const [editingStory, setEditingStory] = useState(null);
  const [storiesData, setStoriesData] = useState(stories);

  const toggleStorySelection = (index) => {
    setSelectedStories(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleStoryExpanded = (index) => {
    setExpandedStories(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleEditStory = (index) => {
    setEditingStory(index);
  };

  const handleSaveEdit = (index, updatedStory) => {
    const updated = [...storiesData];
    updated[index] = updatedStory;
    setStoriesData(updated);
    setEditingStory(null);
  };

  const handleDeleteStory = (index) => {
    if (confirm('Are you sure you want to delete this story?')) {
      setStoriesData(prev => prev.filter((_, idx) => idx !== index));
      setSelectedStories(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    }
  };

  const handlePublishSelected = () => {
    const selectedStoriesData = selectedStories
      .map(idx => storiesData[idx])
      .filter(Boolean);
    
    onPublish(selectedStoriesData);
  };

  const handleImageReassign = (storyIndex, imageIndex) => {
    // Allow user to move image to different story
    const targetStory = prompt(`Move this image to which story? (Enter number 1-${storiesData.length}):`);
    if (targetStory) {
      const targetIndex = parseInt(targetStory) - 1;
      if (targetIndex >= 0 && targetIndex < storiesData.length && targetIndex !== storyIndex) {
        const updated = [...storiesData];
        const image = updated[storyIndex].images[imageIndex];
        updated[storyIndex].images = updated[storyIndex].images.filter((_, i) => i !== imageIndex);
        updated[targetIndex].images = [...(updated[targetIndex].images || []), image];
        setStoriesData(updated);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 overflow-y-auto">
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FileText className="w-7 h-7 mr-3 text-blue-600" />
                  Multiple Stories Detected
                </h2>
                <p className="text-gray-600 mt-2">
                  We found {storiesData.length} articles in your PDF. Review, edit, and select which ones to publish.
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{storiesData.length}</div>
                <div className="text-sm text-gray-600">Total Stories</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{selectedStories.length}</div>
                <div className="text-sm text-gray-600">Selected</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {storiesData.reduce((acc, s) => acc + (s.images?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Images</div>
              </div>
            </div>
          </div>

          {/* Stories List */}
          <div className="space-y-4 mb-6">
            {storiesData.map((story, index) => (
              <StoryCard
                key={index}
                story={story}
                index={index}
                isSelected={selectedStories.includes(index)}
                isExpanded={expandedStories.includes(index)}
                isEditing={editingStory === index}
                onToggleSelect={() => toggleStorySelection(index)}
                onToggleExpand={() => toggleStoryExpanded(index)}
                onEdit={() => handleEditStory(index)}
                onSave={(updated) => handleSaveEdit(index, updated)}
                onDelete={() => handleDeleteStory(index)}
                onImageReassign={(imgIdx) => handleImageReassign(index, imgIdx)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedStories(storiesData.map((_, i) => i))}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedStories([])}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Deselect All
                </button>
                <button
                  onClick={handlePublishSelected}
                  disabled={selectedStories.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Publish {selectedStories.length} {selectedStories.length === 1 ? 'Story' : 'Stories'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Story Card Component
function StoryCard({ 
  story, 
  index, 
  isSelected, 
  isExpanded, 
  isEditing,
  onToggleSelect, 
  onToggleExpand,
  onEdit,
  onSave,
  onDelete,
  onImageReassign
}) {
  const [editData, setEditData] = useState(story);

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      {/* Card Header */}
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="font-bold text-gray-700">Story #{index + 1}</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            {story.category || 'General'}
          </span>
          {story.images && story.images.length > 0 && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded flex items-center">
              <ImageIcon className="w-3 h-3 mr-1" />
              {story.images.length} {story.images.length === 1 ? 'image' : 'images'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing && (
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit Story"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete Story"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleExpand}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Card Content */}
      {isExpanded && (
        <div className="p-6">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input
                  type="text"
                  value={editData.headline}
                  onChange={(e) => setEditData({...editData, headline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Byline</label>
                  <input
                    type="text"
                    value={editData.byline}
                    onChange={(e) => setEditData({...editData, byline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editData.content}
                  onChange={(e) => setEditData({...editData, content: e.target.value})}
                  rows="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditData(story);
                    onEdit();
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{story.headline}</h3>
              
              {(story.byline || story.location) && (
                <div className="text-sm text-gray-600 mb-4 flex items-center space-x-4">
                  {story.byline && <span>By {story.byline}</span>}
                  {story.location && <span>📍 {story.location}</span>}
                </div>
              )}

              {/* Images */}
              {story.images && story.images.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Images:</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {story.images.map((img, imgIdx) => (
                      <div key={img.id} className="relative group">
                        <img 
                          src={img.base64} 
                          alt={`Image ${imgIdx + 1}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <button
                          onClick={() => onImageReassign(imgIdx)}
                          className="absolute top-1 right-1 bg-white text-gray-700 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Move
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Preview */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Content Preview:</h4>
                <div className="bg-gray-50 p-4 rounded border text-sm text-gray-700 max-h-64 overflow-y-auto">
                  {story.content.substring(0, 500)}...
                </div>
              </div>

              {/* Word Count */}
              <div className="mt-3 text-xs text-gray-500">
                Word count: {story.content.split(/\s+/).length} words
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}