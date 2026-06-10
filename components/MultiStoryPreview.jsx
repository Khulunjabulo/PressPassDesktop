// components/MultiStoryPreview.jsx — rich text editor in edit mode + proper HTML view
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle, Edit3, Image as ImageIcon, FileText,
  ChevronDown, ChevronUp, Trash2, Save, X,
  User, Camera, MapPin, Tag, Crop,
  Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight,
  Link, Type,
} from 'lucide-react';
import ImageCropper from './ImageCropper';

export default function MultiStoryPreview({ stories, onPublish, onCancel, onEditStory }) {
  const [selectedStories, setSelectedStories] = useState(stories.map((_, i) => i));
  const [expandedStories, setExpandedStories] = useState([0]);
  const [editingStory, setEditingStory] = useState(null);
  const [storiesData, setStoriesData] = useState(stories);

  const toggleSelect = (i) =>
    setSelectedStories(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const toggleExpand = (i) =>
    setExpandedStories(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const handleSaveEdit = (index, updated) => {
    const next = [...storiesData];
    next[index] = updated;
    setStoriesData(next);
    if (onEditStory) onEditStory(index, updated);
    setEditingStory(null);
  };

  const handleDelete = (index) => {
    if (!confirm('Remove this story?')) return;
    setStoriesData(p => p.filter((_, i) => i !== index));
    setSelectedStories(p =>
      p.filter(i => i !== index).map(i => (i > index ? i - 1 : i))
    );
    if (editingStory === index) setEditingStory(null);
  };

  const handlePublish = () => {
    const selected = selectedStories.map(i => storiesData[i]).filter(Boolean);
    onPublish(selected);
  };

  const totalImages = storiesData.reduce((a, s) => a + (s.images?.length || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
      <div className="min-h-screen bg-gray-100 py-6 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ── Header ── */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-5 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-blue-600" />
                  {storiesData.length} Articles Detected
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Review each article, edit or crop images if needed, then publish.
                </p>
              </div>
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5">
              {[
                { label: 'Total Articles', value: storiesData.length, color: 'blue' },
                { label: 'Selected',       value: selectedStories.length, color: 'green' },
                { label: 'Images',         value: totalImages, color: 'purple' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-${color}-50 rounded-lg p-4 text-center`}>
                  <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Story cards ── */}
          <div className="space-y-4 mb-24">
            {storiesData.map((story, index) => (
              <StoryCard
                key={index}
                story={story}
                index={index}
                isSelected={selectedStories.includes(index)}
                isExpanded={expandedStories.includes(index)}
                isEditing={editingStory === index}
                onToggleSelect={() => toggleSelect(index)}
                onToggleExpand={() => toggleExpand(index)}
                onEdit={() => {
                  setExpandedStories(p => p.includes(index) ? p : [...p, index]);
                  setEditingStory(index);
                }}
                onCancelEdit={() => setEditingStory(null)}
                onSave={(updated) => handleSaveEdit(index, updated)}
                onDelete={() => handleDelete(index)}
              />
            ))}
          </div>

          {/* ── Sticky action bar ── */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-10">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setSelectedStories(storiesData.map((_, i) => i))}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setSelectedStories([])}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Deselect All
                </button>
                <button
                  onClick={handlePublish}
                  disabled={selectedStories.length === 0}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-semibold text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Publish {selectedStories.length}{' '}
                  {selectedStories.length === 1 ? 'Article' : 'Articles'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Toolbar button ────────────────────────────────────────────────────────────
function ToolBtn({ onClick, title, children, active }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focused
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${active ? 'bg-gray-200' : ''}`}
    >
      {children}
    </button>
  );
}

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichEditor({ initialContent, onChange }) {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);

  // Seed the editor once on mount
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
      countWords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countWords = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.textContent || '';
    const count = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(count);
  }, []);

  const handleInput = useCallback(() => {
    countWords();
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [countWords, onChange]);

  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const FONT_SIZES = ['1', '2', '3', '4', '5', '6', '7'];
  const FONT_LABELS = ['Tiny', 'Small', 'Normal', 'Large', 'X-Large', '2X-Large', '3X-Large'];

  const FONT_FAMILIES = [
    { label: 'Default', value: 'inherit' },
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Sans', value: 'Arial, sans-serif' },
    { label: 'Mono', value: 'Courier New, monospace' },
    { label: 'Times', value: 'Times New Roman, serif' },
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">

      {/* ── Toolbar row 1: formatting ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">

        {/* Font family */}
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => exec('fontName', e.target.value)}
          className="text-xs border border-gray-300 rounded px-1 py-1 bg-white mr-1"
          defaultValue="inherit"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Font size */}
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => exec('fontSize', e.target.value)}
          className="text-xs border border-gray-300 rounded px-1 py-1 bg-white mr-1"
          defaultValue="3"
        >
          {FONT_SIZES.map((s, i) => (
            <option key={s} value={s}>{FONT_LABELS[i]}</option>
          ))}
        </select>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Text style */}
        <ToolBtn onClick={() => exec('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Underline"><Underline className="w-3.5 h-3.5" /></ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Block style */}
        <select
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => exec('formatBlock', e.target.value)}
          className="text-xs border border-gray-300 rounded px-1 py-1 bg-white mr-1"
          defaultValue="p"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Blockquote</option>
        </select>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Numbered list">
          <span className="text-xs font-bold">1.</span>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Alignment */}
        <ToolBtn onClick={() => exec('justifyLeft')} title="Align left"><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('justifyCenter')} title="Align center"><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('justifyRight')} title="Align right"><AlignRight className="w-3.5 h-3.5" /></ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <ToolBtn onClick={insertLink} title="Insert link"><Link className="w-3.5 h-3.5" /></ToolBtn>

        {/* Text colour */}
        <label title="Text colour" className="p-1.5 rounded hover:bg-gray-200 cursor-pointer flex items-center">
          <Type className="w-3.5 h-3.5" />
          <input
            type="color"
            className="w-0 h-0 opacity-0 absolute"
            onChange={(e) => exec('foreColor', e.target.value)}
          />
        </label>

        {/* Highlight */}
        <label title="Highlight" className="p-1.5 rounded hover:bg-gray-200 cursor-pointer flex items-center">
          <span className="text-xs font-bold bg-yellow-300 px-1 rounded">A</span>
          <input
            type="color"
            className="w-0 h-0 opacity-0 absolute"
            defaultValue="#FFFF00"
            onChange={(e) => exec('hiliteColor', e.target.value)}
          />
        </label>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="p-4 focus:outline-none text-sm text-gray-800 leading-relaxed"
        style={{
          minHeight: '520px',
          maxHeight: '680px',
          overflowY: 'auto',
          wordBreak: 'break-word',
          lineHeight: '1.8',
        }}
      />

      {/* ── Footer: word count ── */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 flex justify-between text-xs text-gray-400">
        <span>{wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
        <span>Rich text · HTML preserved on save</span>
      </div>
    </div>
  );
}

// ─── Story Card ────────────────────────────────────────────────────────────────
function StoryCard({
  story, index, isSelected, isExpanded, isEditing,
  onToggleSelect, onToggleExpand, onEdit, onCancelEdit, onSave, onDelete,
}) {
  const [editData, setEditData]               = useState({ ...story });
  const [showCropper, setShowCropper]         = useState(false);
  const [isCropUploading, setIsCropUploading] = useState(false);
  const [cropUploadError, setCropUploadError] = useState('');

  // live HTML content from the rich editor
  const editorContentRef = useRef(story.content || '');

  // Sync editData if parent story changes
  useEffect(() => {
    setEditData({ ...story });
    editorContentRef.current = story.content || '';
  }, [story]);

  const wordCount = (story.content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;

  // Always prefer Cloudinary URL; fall back to base64 for display only
  const currentImage =
    editData.images?.[0]?.url ||
    editData.images?.[0]?.base64 ||
    null;

  // ── Crop handler ────────────────────────────────────────────────────────────
  const handleCropDone = async (croppedBase64) => {
    setIsCropUploading(true);
    setCropUploadError('');

    try {
      const fetchRes = await fetch(croppedBase64);
      const blob     = await fetchRes.blob();

      const formData = new FormData();
      formData.append('imageFile', blob, `cropped_${Date.now()}.jpg`);

      const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const result   = await response.json();

      if (!response.ok || !result.success) throw new Error(result.error || 'Cropped image upload failed');

      const newImages = [
        { ...(editData.images?.[0] || {}), url: result.url, base64: null },
        ...(editData.images?.slice(1) || []),
      ];
      setEditData(prev => ({ ...prev, images: newImages }));
    } catch (err) {
      console.error('❌ Crop upload error:', err);
      setCropUploadError('Upload failed — the original image will be used.');
    } finally {
      setIsCropUploading(false);
      setShowCropper(false);
    }
  };

  // ── Save: merge live editor HTML into editData ───────────────────────────
  const handleSave = () => {
    onSave({ ...editData, content: editorContentRef.current });
  };

  return (
    <>
      {showCropper && currentImage && (
        <ImageCropper
          imageSrc={currentImage}
          onCrop={handleCropDone}
          onCancel={() => setShowCropper(false)}
        />
      )}

      <div
        className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${
          isSelected ? 'border-blue-500' : 'border-transparent'
        }`}
      >
        {/* ── Card header ── */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-5 h-5 text-blue-600 rounded flex-shrink-0 cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-500 flex-shrink-0">#{index + 1}</span>
            <span className="font-semibold text-gray-800 truncate text-sm">
              {story.headline || 'Untitled'}
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0 capitalize">
              {story.category || 'news'}
            </span>
            {story.images?.length > 0 && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex-shrink-0 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />{story.images.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!isEditing && (
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Edit"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Card body ── */}
        {isExpanded && (
          <div className="p-5">
            {isEditing ? (
              /* ════════════ EDIT MODE ════════════ */
              <div className="space-y-5">

                {/* Headline */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Headline *
                  </label>
                  <input
                    type="text"
                    value={editData.headline || ''}
                    onChange={e => setEditData(p => ({ ...p, headline: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-base font-semibold"
                    placeholder="Article headline..."
                  />
                </div>

                {/* Writer + Photo credit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      <User className="w-3.5 h-3.5" /> Writer / Byline
                    </label>
                    <input
                      type="text"
                      value={editData.byline || ''}
                      onChange={e => setEditData(p => ({ ...p, byline: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Romita Hanuman-Pillay"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      <Camera className="w-3.5 h-3.5" /> Photo Credit
                    </label>
                    <input
                      type="text"
                      value={editData.imageCredit || ''}
                      onChange={e => setEditData(p => ({ ...p, imageCredit: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Thuli Dlamini"
                    />
                  </div>
                </div>

                {/* Location + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5" /> Location
                    </label>
                    <input
                      type="text"
                      value={editData.location || ''}
                      onChange={e => setEditData(p => ({ ...p, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Durban"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      <Tag className="w-3.5 h-3.5" /> Category
                    </label>
                    <select
                      value={editData.category || 'news'}
                      onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {[
                        'news', 'politics', 'business', 'sports', 'education',
                        'health', 'environment', 'entertainment', 'lifestyle',
                        'community', 'technology',
                      ].map(c => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image preview + crop */}
                {currentImage && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      <ImageIcon className="w-3.5 h-3.5" /> Article Image
                    </label>

                    {cropUploadError && (
                      <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                        ⚠️ {cropUploadError}
                      </div>
                    )}

                    <div
                      className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                      style={{ maxHeight: '280px' }}
                    >
                      <img
                        src={currentImage}
                        alt="Article"
                        className="w-full object-cover transition-opacity"
                        style={{ maxHeight: '280px', opacity: isCropUploading ? 0.4 : 1 }}
                      />

                      {isCropUploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2" />
                          <p className="text-white text-xs font-medium">Uploading cropped image...</p>
                        </div>
                      )}

                      {!isCropUploading && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => setShowCropper(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-800 rounded-xl font-semibold text-sm shadow-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <Crop className="w-4 h-4" />
                            Crop Image
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-1.5">
                      Hover over the image and click <strong>Crop Image</strong> to select just the photo you need.
                    </p>
                  </div>
                )}

                {/* ── Rich Text Editor (replaces textarea) ── */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Article Body *
                  </label>
                  <RichEditor
                    initialContent={editData.content || ''}
                    onChange={(html) => { editorContentRef.current = html; }}
                  />
                </div>

                {/* Save / Cancel */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditData({ ...story });
                      editorContentRef.current = story.content || '';
                      onCancelEdit();
                    }}
                    className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>

            ) : (
              /* ════════════ VIEW MODE ════════════ */
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{story.headline}</h3>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  {story.byline && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <strong className="text-gray-700">By</strong> {story.byline}
                    </span>
                  )}
                  {story.imageCredit && (
                    <span className="flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      <strong className="text-gray-700">Photo:</strong> {story.imageCredit}
                    </span>
                  )}
                  {story.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />{story.location}
                    </span>
                  )}
                </div>

                {/* Page image */}
                {story.images?.length > 0 && (story.images[0].url || story.images[0].base64) && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Page Image</p>
                    <img
                      src={story.images[0].url || story.images[0].base64}
                      alt="Article page"
                      className="w-full max-h-56 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* ── Article preview: render HTML properly with paragraph spacing ── */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Content Preview</p>

                  {/* Render HTML content with proper paragraph spacing */}
                  <div
                    className="text-sm text-gray-700 leading-relaxed article-preview-content"
                    style={{
                      maxHeight: '360px',
                      overflowY: 'auto',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: story.content
                        ? story.content.length > 2000
                          ? story.content.substring(0, 2000) + '<p class="text-gray-400 italic">… preview truncated</p>'
                          : story.content
                        : '<p class="text-gray-400 italic">No content</p>',
                    }}
                  />
                </div>

                {/* Paragraph spacing styles injected inline so they work without a global CSS file */}
                <style>{`
                  .article-preview-content p {
                    margin-bottom: 1em;
                    line-height: 1.75;
                  }
                  .article-preview-content h1,
                  .article-preview-content h2,
                  .article-preview-content h3 {
                    font-weight: 700;
                    margin-top: 1.25em;
                    margin-bottom: 0.5em;
                  }
                  .article-preview-content ul,
                  .article-preview-content ol {
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                  }
                  .article-preview-content li {
                    margin-bottom: 0.3em;
                  }
                  .article-preview-content blockquote {
                    border-left: 3px solid #d1d5db;
                    padding-left: 1em;
                    color: #6b7280;
                    font-style: italic;
                    margin: 1em 0;
                  }
                `}</style>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium"
                  >
                    <Edit3 className="w-3 h-3" /> Edit this article
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}