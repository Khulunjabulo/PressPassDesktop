// app/news-reader/favorites/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/UI/Cards';
import { 
  Search, Heart, ChevronRight, User, Plus, Building,
  Linkedin, Youtube, Facebook, ArrowRight, Clock, FileText,
  Calendar, X, ChevronDown, Filter
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import AdSlot from '@/components/news-reader/AdsSlot';
import FavoriteButton from '@/components/FavoriteButton';
import PublisherFavoriteButton from '@/components/PublisherFavoriteButton'; 
import NewsReaderHeader from '@/components/news-reader/NewsReaderHeader';
import MobileBottomNav from '@/components/news-reader/MobileBottomNav';

// ─── Date Helpers ──────────────────────────────────────────────────────────────
function parseFavoritedAt(value) {
  if (!value) return null;
  if (typeof value === 'string') return new Date(value);
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function formatDateLabel(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toDateKey(date) {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatShortDate(value) {
  const date = parseFavoritedAt(value);
  if (!date) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Publishers Modal ──────────────────────────────────────────────────────────
function PublishersModal({ isOpen, onClose }) {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchPublishers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news-sources');
      const data = await res.json();
      if (data.success) {
        setPublishers(data.newsources || []);
      } else {
        setError(data.error || 'Failed to load publishers');
      }
    } catch (err) {
      setError('Failed to load publishers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) { fetchPublishers(); setSearch(''); }
  }, [isOpen, fetchPublishers]);

  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const filtered = publishers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.industry || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.publicationType || '').toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">All Publishers</h2>
            {!loading && (
              <span className="text-sm text-gray-400 font-normal">
                ({filtered.length}{search ? ' results' : ' total'})
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search publishers by name, industry or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
              <p className="text-sm text-gray-500">Loading publishers...</p>
            </div>
          )}
          {!loading && error && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">{error}</p>
              <button onClick={fetchPublishers} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">Retry</button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{search ? `No publishers matching "${search}"` : 'No publishers found'}</p>
              {search && <button onClick={() => setSearch('')} className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">Clear search</button>}
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {filtered.map((publisher) => (
                <li key={publisher.id} className="flex items-center space-x-4 py-3.5 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-gray-200">
                    {publisher.logo ? (
                      <img src={publisher.logo} alt={publisher.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-base">{publisher.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{publisher.name}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs text-gray-500 capitalize truncate">{publisher.publicationType || 'News'}</span>
                      {publisher.industry && <><span className="text-gray-300">·</span><span className="text-xs text-gray-500 truncate">{publisher.industry}</span></>}
                      {publisher.articleCount > 0 && <><span className="text-gray-300">·</span><span className="text-xs text-gray-400">{publisher.articleCount} articles</span></>}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <PublisherFavoriteButton publisher={publisher} size="default" showText={true} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-gray-400">Click the heart to add publishers to your favorites</p>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Date Filter Dropdown (sidebar) ───────────────────────────────────────────
function DateFilterDropdown({ favoritePublishers, selectedDate, onSelectDate }) {
  const [open, setOpen] = useState(false);

  const dateKeys = Array.from(
    new Set(
      favoritePublishers
        .map(p => toDateKey(parseFavoritedAt(p.favoritedAt)))
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a));

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('[data-date-dropdown]')) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" data-date-dropdown="">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between w-full py-2 border-b transition-colors ${
          selectedDate ? 'text-blue-700 bg-blue-50 rounded px-2 border-blue-200' : 'hover:bg-gray-50 border-gray-100'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Calendar className={`w-4 h-4 ${selectedDate ? 'text-blue-600' : 'text-gray-500'}`} />
          <span className={`font-medium text-sm ${selectedDate ? 'text-blue-700' : ''}`}>
            {selectedDate ? formatDateLabel(selectedDate) : 'Date Added'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {selectedDate && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelectDate(null); setOpen(false); }}
              className="p-0.5 rounded-full hover:bg-blue-200 text-blue-500 transition-colors"
              title="Clear date filter"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
          {dateKeys.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-3">No publishers added yet</p>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {dateKeys.map(key => {
                const count = favoritePublishers.filter(
                  p => toDateKey(parseFavoritedAt(p.favoritedAt)) === key
                ).length;
                return (
                  <li key={key}>
                    <button
                      onClick={() => { onSelectDate(key); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                        selectedDate === key ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span>{formatDateLabel(key)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        selectedDate === key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Publisher Card ────────────────────────────────────────────────────────────
function PublisherCard({ publisher, onClick, size = 'default' }) {
  const dateAdded = formatShortDate(publisher.favoritedAt);

  return (
    <div className="flex flex-col items-center cursor-pointer group" onClick={() => onClick(publisher)}>
      <div className="relative w-full aspect-[4/5] mb-2 sm:mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
        {publisher.logo ? (
          <img src={publisher.logo} alt={`${publisher.name} cover`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl sm:text-2xl">{publisher.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <PublisherFavoriteButton publisher={publisher} size="small" />
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-700 capitalize">
            {publisher.publicationType}
          </span>
        </div>
      </div>

      <div className="text-center w-full">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-1 truncate px-1">
          {publisher.name}
        </h3>
        {/* Date added badge */}
        {dateAdded && (
          <div className="flex items-center justify-center space-x-1 mt-1">
            <Calendar className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 truncate">{dateAdded}</span>
          </div>
        )}
        {size === 'default' && (
          <div className="hidden sm:flex items-center justify-center space-x-2 text-xs text-gray-500 mt-1">
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3" />
              <span>{publisher.articleCount}</span>
            </div>
            <span>·</span>
            <span className="capitalize">{publisher.audienceType}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Favorites Page ────────────────────────────────────────────────────────────
export default function FavoritesPage() {
  const router = useRouter();
  const {
    favorites,
    favoritePublishers,
    currentUser,
    loading,
    error,
    getGroupedFavorites,
    getFavoriteStats,
    refreshFavorites
  } = useFavorites();

  const [activeTab, setActiveTab] = useState('all');
  const [publishersModalOpen, setPublishersModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // YYYY-MM-DD or null

  const favoriteStats = getFavoriteStats();

  useEffect(() => {
    if (!loading && !currentUser) router.push('/signin');
  }, [loading, currentUser, router]);

  // Publishers filtered by the selected date (or all if none selected)
  const filteredPublishers = selectedDate
    ? favoritePublishers.filter(p => toDateKey(parseFavoritedAt(p.favoritedAt)) === selectedDate)
    : favoritePublishers;

  const handleAddMore = () => router.push('/news-reader/search');
  const handlePublicationClick = (publication) => {
    router.push(`/news-reader/favorites/${encodeURIComponent(publication.name)}?type=${publication.type}`);
  };
  const handlePublisherClick = (publisher) => {
    router.push(`/news-reader/publisher/${publisher.id}`);
  };
  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (date) setActiveTab('publishers'); // jump to publishers tab to show results
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Sign in to view favorites</h3>
          <button onClick={() => router.push('/signin')} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NewsReaderHeader />
      <MobileBottomNav />

      <PublishersModal isOpen={publishersModalOpen} onClose={() => setPublishersModalOpen(false)} />

      <div className="min-h-screen bg-white pt-16 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-64 p-4 border-r">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-3 text-blue-900">YOUR READING STATS</h3>
                <div className="space-y-2">
                  {Object.entries(favoriteStats).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-blue-700 capitalize">{key}:</span>
                      <span className="font-bold text-blue-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b hover:bg-gray-50 cursor-pointer">
                <span className="font-medium">Category</span>
                <ChevronRight className="w-4 h-4" />
              </div>

              {/* Date Added — live dropdown filter */}
              <DateFilterDropdown
                favoritePublishers={favoritePublishers}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
              />

              <div className="flex items-center justify-between py-2 border-b hover:bg-gray-50 cursor-pointer">
                <span className="font-medium">Publication</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 p-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">My Favorites</h2>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center overflow-hidden">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <button onClick={handleAddMore} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Browse more articles">
                  <Plus className="w-6 h-6" />
                </button>
                <button onClick={refreshFavorites} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Refresh
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium">Error loading favorites</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button onClick={refreshFavorites} className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">Try Again</button>
              </div>
            )}

            {/* Active date filter banner */}
            {selectedDate && (
              <div className="flex items-center space-x-2 mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Filter className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700 flex-1">
                  Showing publishers added on <span className="font-semibold">{formatDateLabel(selectedDate)}</span>
                  {' '}({filteredPublishers.length} {filteredPublishers.length === 1 ? 'publisher' : 'publishers'})
                </p>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-4 md:space-x-8 mb-6 overflow-x-auto">
              {['all', 'publishers', 'magazines', 'newspapers', 'stories'].map(tab => (
                <button
                  key={tab}
                  className={`pb-2 whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-black font-medium border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({favoriteStats[tab] || 0})
                </button>
              ))}
            </div>

            {/* ── Tab: All ── */}
            {activeTab === 'all' && (
              <div className="space-y-6">
                {filteredPublishers.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center flex-wrap gap-2">
                      <Building className="w-5 h-5" />
                      <span>Favorite Publishers ({filteredPublishers.length})</span>
                      {selectedDate && (
                        <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {formatDateLabel(selectedDate)}
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
                      {filteredPublishers.slice(0, 12).map((publisher) => (
                        <PublisherCard key={publisher.id} publisher={publisher} onClick={handlePublisherClick} size="small" />
                      ))}
                    </div>
                    {filteredPublishers.length > 12 && (
                      <button onClick={() => setActiveTab('publishers')} className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-6">
                        View all {filteredPublishers.length} favorite publishers →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      {selectedDate ? `No publishers added on ${formatDateLabel(selectedDate)}` : 'No favorite publishers yet'}
                    </h3>
                    {selectedDate ? (
                      <button onClick={() => setSelectedDate(null)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Clear date filter
                      </button>
                    ) : (
                      <button onClick={() => setPublishersModalOpen(true)} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Follow Publishers
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Publishers ── */}
            {activeTab === 'publishers' && (
              <div>
                {filteredPublishers.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      {selectedDate ? `No publishers added on ${formatDateLabel(selectedDate)}` : 'No favorite publishers yet'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {selectedDate ? 'Try selecting a different date or clear the filter.' : 'Start following your favorite news sources'}
                    </p>
                    {selectedDate ? (
                      <button onClick={() => setSelectedDate(null)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        Clear Date Filter
                      </button>
                    ) : (
                      <button onClick={() => setPublishersModalOpen(true)} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                        Browse Publishers
                      </button>
                    )}
                  </div>
                ) : selectedDate ? (
                  // Filtered: flat grid
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {filteredPublishers.map((publisher) => (
                      <PublisherCard key={publisher.id} publisher={publisher} onClick={handlePublisherClick} />
                    ))}
                  </div>
                ) : (
                  // No filter: grouped by date with section headers
                  (() => {
                    const groups = {};
                    favoritePublishers.forEach(p => {
                      const key = toDateKey(parseFavoritedAt(p.favoritedAt)) || 'unknown';
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(p);
                    });
                    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

                    return (
                      <div className="space-y-8">
                        {sortedKeys.map(key => (
                          <div key={key}>
                            {/* Date group header */}
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">{formatDateLabel(key)}</span>
                                <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-1.5 py-0.5">
                                  {groups[key].length}
                                </span>
                              </div>
                              <div className="flex-1 h-px bg-gray-100" />
                              <button
                                onClick={() => handleDateSelect(key)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                              >
                                Filter by this date
                              </button>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                              {groups[key].map((publisher) => (
                                <PublisherCard key={publisher.id} publisher={publisher} onClick={handlePublisherClick} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* ── Tabs: magazines / newspapers / stories ── */}
            {!['all', 'publishers'].includes(activeTab) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getGroupedFavorites(activeTab).length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No {activeTab.slice(0, -1)} favorites yet</h3>
                    <p className="text-gray-500 mb-4">Start adding your favorite {activeTab.slice(0, -1)} stories</p>
                    <button onClick={handleAddMore} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">Browse Stories</button>
                  </div>
                ) : (
                  getGroupedFavorites(activeTab).map((publication, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                      onClick={() => handlePublicationClick(publication)}
                    >
                      <CardContent className="p-0">
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            {publication.logo ? (
                              <img src={publication.logo} alt={`${publication.name} logo`} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-blue-200" />
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs sm:text-sm">{publication.name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">{publication.name}</h3>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 sm:text-gray-600">
                                <FileText className="w-3 h-3" />
                                <span>{publication.stories.length} saved {publication.stories.length === 1 ? 'story' : 'stories'}</span>
                              </div>
                            </div>
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="space-y-3">
                            {publication.stories.slice(0, 3).map((story, storyIndex) => (
                              <div key={storyIndex} className="flex items-start space-x-3 group">
                                {story.image && (
                                  <img src={story.image} alt={story.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover border border-gray-200 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{story.title}</h4>
                                  <div className="hidden sm:flex items-center space-x-2 mt-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{formatDate(story.addedAt)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {publication.stories.length > 3 && (
                              <div className="text-center pt-2">
                                <span className="text-xs text-blue-600 font-medium">+{publication.stories.length - 3} more stories</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="px-4 pb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Publication folder</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              <span className="text-green-600 font-medium">{publication.stories.length} saved</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </main>

          {/* ── Right Sidebar ── */}
          <aside className="hidden lg:block w-80 p-4">
            <div className="space-y-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-3 text-blue-900">QUICK ACTIONS</h3>
                  <div className="space-y-2">
                    <button onClick={handleAddMore} className="w-full flex items-center space-x-2 p-2 text-sm text-blue-700 hover:bg-blue-200 rounded transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add More Stories</span>
                    </button>
                    <button onClick={() => setPublishersModalOpen(true)} className="w-full flex items-center space-x-2 p-2 text-sm text-blue-700 hover:bg-blue-200 rounded transition-colors">
                      <Building className="w-4 h-4" />
                      <span>Follow Publishers</span>
                    </button>
                    <button onClick={() => router.push('/news-reader')} className="w-full flex items-center space-x-2 p-2 text-sm text-blue-700 hover:bg-blue-200 rounded transition-colors">
                      <Search className="w-4 h-4" />
                      <span>Browse Articles</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <AdSlot label="Sponsored Content" height={250} width={300} preferredType="rectangles" className="max-w-[300px]" />

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-3">SHARE YOUR READING</h3>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"><Facebook className="w-4 h-4" /></button>
                    <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"><Linkedin className="w-4 h-4" /></button>
                    <button className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"><Youtube className="w-4 h-4" /></button>
                  </div>
                </CardContent>
              </Card>

              <AdSlot label="Rectangle Ad" height={250} width={300} preferredType="rectangles" className="max-w-[300px]" />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}