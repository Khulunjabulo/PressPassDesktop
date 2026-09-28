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
import NewsReaderHeader from '@/components/news-reader/Header';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#329ae1]/10 flex items-center justify-center">
              <Building className="w-5 h-5 text-[#329ae1]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">All Publishers</h2>
            {!loading && (
              <span className="text-sm text-gray-400 font-normal">
                ({filtered.length}{search ? ' results' : ' total'})
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-700 hover:rotate-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search publishers by name, industry or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-300"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-all duration-200">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-10 h-10 border-3 border-gray-200 border-t-[#329ae1] rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading publishers...</p>
            </div>
          )}
          {!loading && error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button onClick={fetchPublishers} className="px-5 py-2.5 bg-[#329ae1] text-white text-sm font-medium rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300">
                Retry
              </button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm">{search ? `No publishers matching "${search}"` : 'No publishers found'}</p>
              {search && <button onClick={() => setSearch('')} className="mt-4 text-[#329ae1] hover:text-[#2580c0] text-sm font-medium px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">Clear search</button>}
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <ul className="space-y-1">
              {filtered.map((publisher) => (
                <li key={publisher.id} className="flex items-center space-x-4 py-3.5 px-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group cursor-pointer">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    {publisher.logo ? (
                      <img src={publisher.logo} alt={publisher.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#329ae1] to-[#1e7bc0] flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{publisher.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#329ae1] transition-colors duration-200">{publisher.name}</p>
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

        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
          <p className="text-xs text-gray-400">Click the heart to add publishers to your favorites</p>
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200">Done</button>
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
        className={`flex items-center justify-between w-full py-2.5 px-3 rounded-xl transition-all duration-200 ${
          selectedDate ? 'text-[#329ae1] bg-blue-50 border border-blue-100' : 'hover:bg-gray-100 border border-transparent'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <Calendar className={`w-4 h-4 ${selectedDate ? 'text-[#329ae1]' : 'text-gray-500'}`} />
          <span className={`font-medium text-sm ${selectedDate ? 'text-[#329ae1]' : ''}`}>
            {selectedDate ? formatDateLabel(selectedDate) : 'Date Added'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {selectedDate && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelectDate(null); setOpen(false); }}
              className="p-1 rounded-full hover:bg-blue-200 text-[#329ae1] transition-colors"
              title="Clear date filter"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 overflow-hidden">
          {dateKeys.length === 0 ? (
            <p className="text-xs text-gray-400 px-4 py-4 text-center">No publishers added yet</p>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1.5">
              {dateKeys.map(key => {
                const count = favoritePublishers.filter(
                  p => toDateKey(parseFavoritedAt(p.favoritedAt)) === key
                ).length;
                return (
                  <li key={key}>
                    <button
                      onClick={() => { onSelectDate(key); setOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${
                        selectedDate === key ? 'bg-blue-50 text-[#329ae1] font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span>{formatDateLabel(key)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedDate === key ? 'bg-blue-100 text-[#329ae1]' : 'bg-gray-100 text-gray-500'
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
      <div className="relative w-full aspect-[4/5] mb-3 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1.5 transition-all duration-300">
        {publisher.logo ? (
          <img src={publisher.logo} alt={`${publisher.name} cover`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#329ae1] to-[#1e7bc0] flex items-center justify-center">
            <span className="text-white font-bold text-xl sm:text-2xl">{publisher.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <PublisherFavoriteButton publisher={publisher} size="small" />
        </div>
        <div className="absolute bottom-2.5 left-2.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 backdrop-blur-sm text-gray-700 capitalize shadow-sm">
            {publisher.publicationType}
          </span>
        </div>
      </div>

      <div className="text-center w-full px-1">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-[#329ae1] transition-colors duration-300 leading-tight mb-1 truncate">
          {publisher.name}
        </h3>
        {dateAdded && (
          <div className="flex items-center justify-center space-x-1 mt-1.5">
            <Calendar className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
            <span className="text-[11px] text-gray-400">{dateAdded}</span>
          </div>
        )}
        {size === 'default' && (
          <div className="hidden sm:flex items-center justify-center space-x-2 text-xs text-gray-500 mt-1.5">
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
  const [selectedDate, setSelectedDate] = useState(null);

  const favoriteStats = getFavoriteStats();

  useEffect(() => {
    if (!loading && !currentUser) router.push('/signin');
  }, [loading, currentUser, router]);

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
    if (date) setActiveTab('publishers');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-[#329ae1] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50/60 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Heart className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Sign in to view favorites</h3>
          <button onClick={() => router.push('/signin')} className="px-6 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <NewsReaderHeader />
      <MobileBottomNav />

      <PublishersModal isOpen={publishersModalOpen} onClose={() => setPublishersModalOpen(false)} />

      <div className="min-h-screen pt-16 md:pt-0 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-64 p-4 border-r border-gray-100/80">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#329ae1]/10 to-blue-50 rounded-2xl p-5 border border-blue-100/50 shadow-sm">
                <h3 className="font-bold text-sm mb-4 text-[#1e5f96] tracking-wide uppercase">Your Reading Stats</h3>
                <div className="space-y-3">
                  {Object.entries(favoriteStats).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 capitalize">{key}</span>
                      <span className="font-bold text-[#329ae1] text-lg">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <button className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-4 h-4 text-gray-400 group-hover:text-[#329ae1] transition-colors" />
                    <span className="text-sm font-medium text-gray-700">Category</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <DateFilterDropdown
                  favoritePublishers={favoritePublishers}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                />

                <button className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400 group-hover:text-[#329ae1] transition-colors" />
                    <span className="text-sm font-medium text-gray-700">Publication</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 p-4 sm:p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">My Favorites</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your saved publishers and stories</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center overflow-hidden shadow-md ring-2 ring-white">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <button onClick={handleAddMore} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200 shadow-sm" title="Browse more articles">
                  <Plus className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={refreshFavorites} className="px-4 py-2.5 bg-[#329ae1] text-white text-sm font-medium rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 shadow-sm">
                  Refresh
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6">
                <p className="text-red-800 font-medium">Error loading favorites</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button onClick={refreshFavorites} className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
                  Try Again
                </button>
              </div>
            )}

            {/* Active date filter banner */}
            {selectedDate && (
              <div className="flex items-center space-x-3 mb-6 px-4 py-3 bg-blue-50/80 border border-blue-100 rounded-2xl backdrop-blur-sm">
                <Filter className="w-4 h-4 text-[#329ae1] flex-shrink-0" />
                <p className="text-sm text-blue-700 flex-1">
                  Showing publishers added on <span className="font-semibold">{formatDateLabel(selectedDate)}</span>
                  {' '}<span className="text-blue-500">({filteredPublishers.length} {filteredPublishers.length === 1 ? 'publisher' : 'publishers'})</span>
                </p>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="flex items-center space-x-1 text-xs text-[#329ae1] hover:text-[#2580c0] font-medium transition-colors px-2 py-1 rounded-lg hover:bg-blue-100"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            )}

            {/* Tabs — pill style */}
            <div className="flex space-x-1 mb-8 bg-gray-100/80 p-1 rounded-2xl w-fit">
              {['all', 'publishers', 'magazines', 'newspapers', 'stories'].map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className={`ml-1.5 ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
                      ({favoriteStats[tab] || 0})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── Tab: All ── */}
            {activeTab === 'all' && (
              <div className="space-y-6">
                {filteredPublishers.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center flex-wrap gap-2">
                      <Building className="w-5 h-5 text-gray-700" />
                      <span>Favorite Publishers ({filteredPublishers.length})</span>
                      {selectedDate && (
                        <span className="text-sm font-normal text-[#329ae1] bg-blue-50 px-2.5 py-0.5 rounded-full">
                          {formatDateLabel(selectedDate)}
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 mb-8">
                      {filteredPublishers.slice(0, 12).map((publisher) => (
                        <PublisherCard key={publisher.id} publisher={publisher} onClick={handlePublisherClick} size="small" />
                      ))}
                    </div>
                    {filteredPublishers.length > 12 && (
                      <button onClick={() => setActiveTab('publishers')} className="text-[#329ae1] hover:text-[#2580c0] text-sm font-medium mb-6 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                        View all {filteredPublishers.length} favorite publishers →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Building className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {selectedDate ? `No publishers added on ${formatDateLabel(selectedDate)}` : 'No favorite publishers yet'}
                    </h3>
                    {selectedDate ? (
                      <button onClick={() => setSelectedDate(null)} className="text-[#329ae1] hover:text-[#2580c0] text-sm font-medium px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                        Clear date filter
                      </button>
                    ) : (
                      <button onClick={() => setPublishersModalOpen(true)} className="px-6 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium">
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
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Building className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {selectedDate ? `No publishers added on ${formatDateLabel(selectedDate)}` : 'No favorite publishers yet'}
                    </h3>
                    <p className="text-gray-500 mb-5">
                      {selectedDate ? 'Try selecting a different date or clear the filter.' : 'Start following your favorite news sources'}
                    </p>
                    {selectedDate ? (
                      <button onClick={() => setSelectedDate(null)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium">
                        Clear Date Filter
                      </button>
                    ) : (
                      <button onClick={() => setPublishersModalOpen(true)} className="px-6 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium">
                        Browse Publishers
                      </button>
                    )}
                  </div>
                ) : selectedDate ? (
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                    {filteredPublishers.map((publisher) => (
                      <PublisherCard key={publisher.id} publisher={publisher} onClick={handlePublisherClick} />
                    ))}
                  </div>
                ) : (
                  (() => {
                    const groups = {};
                    favoritePublishers.forEach(p => {
                      const key = toDateKey(parseFavoritedAt(p.favoritedAt)) || 'unknown';
                      if (!groups[key]) groups[key] = [];
                      groups[key].push(p);
                    });
                    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

                    return (
                      <div className="space-y-10">
                        {sortedKeys.map(key => (
                          <div key={key}>
                            <div className="flex items-center space-x-3 mb-5">
                              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">{formatDateLabel(key)}</span>
                                <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                                  {groups[key].length}
                                </span>
                              </div>
                              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                              <button
                                onClick={() => handleDateSelect(key)}
                                className="text-xs text-[#329ae1] hover:text-[#2580c0] font-medium whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                Filter by this date
                              </button>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
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
                  <div className="col-span-full text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Heart className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No {activeTab.slice(0, -1)} favorites yet</h3>
                    <p className="text-gray-500 mb-5">Start adding your favorite {activeTab.slice(0, -1)} stories</p>
                    <button onClick={handleAddMore} className="px-6 py-2.5 bg-[#329ae1] text-white rounded-xl hover:bg-[#2580c0] hover:shadow-lg hover:shadow-[#329ae1]/20 transition-all duration-300 font-medium">
                      Browse Stories
                    </button>
                  </div>
                ) : (
                  getGroupedFavorites(activeTab).map((publication, index) => (
                    <Card
                      key={index}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden"
                      onClick={() => handlePublicationClick(publication)}
                    >
                      <CardContent className="p-0">
                        <div className="p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/50 border-b border-blue-100/50">
                          <div className="flex items-center space-x-3">
                            {publication.logo ? (
                              <img src={publication.logo} alt={`${publication.name} logo`} className="w-10 h-10 rounded-xl object-cover border border-blue-200/50 shadow-sm" />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-[#329ae1] to-[#1e7bc0] rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">{publication.name.charAt(0)}</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{publication.name}</h3>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                                <FileText className="w-3 h-3" />
                                <span>{publication.stories.length} saved {publication.stories.length === 1 ? 'story' : 'stories'}</span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#329ae1] group-hover:translate-x-0.5 transition-all duration-300" />
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="space-y-3">
                            {publication.stories.slice(0, 3).map((story, storyIndex) => (
                              <div key={storyIndex} className="flex items-start space-x-3 group/story">
                                {story.image && (
                                  <img src={story.image} alt={story.title} className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 group-hover/story:text-[#329ae1] transition-colors duration-200">{story.title}</h4>
                                  <div className="hidden sm:flex items-center space-x-2 mt-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{formatDate(story.addedAt)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {publication.stories.length > 3 && (
                              <div className="text-center pt-2">
                                <span className="text-xs text-[#329ae1] font-medium">+{publication.stories.length - 3} more stories</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="px-4 pb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Publication folder</span>
                            <div className="flex items-center space-x-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm"></div>
                              <span className="text-emerald-600 font-medium">{publication.stories.length} saved</span>
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
              <div className="bg-gradient-to-br from-[#329ae1]/10 to-blue-50 rounded-2xl p-5 border border-blue-100/50 shadow-sm">
                <h3 className="font-bold text-sm mb-4 text-[#1e5f96] tracking-wide uppercase">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={handleAddMore} className="w-full flex items-center space-x-3 p-3 text-sm text-[#329ae1] hover:bg-white/60 rounded-xl transition-all duration-200 group">
                    <div className="w-8 h-8 rounded-lg bg-[#329ae1]/10 flex items-center justify-center group-hover:bg-[#329ae1]/20 transition-colors">
                      <Plus className="w-4 h-4 text-[#329ae1]" />
                    </div>
                    <span className="font-medium">Add More Stories</span>
                  </button>
                  <button onClick={() => setPublishersModalOpen(true)} className="w-full flex items-center space-x-3 p-3 text-sm text-[#329ae1] hover:bg-white/60 rounded-xl transition-all duration-200 group">
                    <div className="w-8 h-8 rounded-lg bg-[#329ae1]/10 flex items-center justify-center group-hover:bg-[#329ae1]/20 transition-colors">
                      <Building className="w-4 h-4 text-[#329ae1]" />
                    </div>
                    <span className="font-medium">Follow Publishers</span>
                  </button>
                  <button onClick={() => router.push('/news-reader')} className="w-full flex items-center space-x-3 p-3 text-sm text-[#329ae1] hover:bg-white/60 rounded-xl transition-all duration-200 group">
                    <div className="w-8 h-8 rounded-lg bg-[#329ae1]/10 flex items-center justify-center group-hover:bg-[#329ae1]/20 transition-colors">
                      <Search className="w-4 h-4 text-[#329ae1]" />
                    </div>
                    <span className="font-medium">Browse Articles</span>
                  </button>
                </div>
              </div>

              <AdSlot label="Sponsored Content" height={250} width={300} preferredType="rectangles" className="max-w-[300px] rounded-2xl overflow-hidden" />

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-sm mb-4 text-gray-900 tracking-wide uppercase">Share Your Reading</h3>
                <div className="flex space-x-3">
                  <button className="flex-1 py-2.5 bg-[#1877F2] text-white rounded-xl hover:bg-[#166fe5] hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 flex items-center justify-center shadow-sm">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="flex-1 py-2.5 bg-[#0A66C2] text-white rounded-xl hover:bg-[#0958a8] hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 flex items-center justify-center shadow-sm">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="flex-1 py-2.5 bg-[#FF0000] text-white rounded-xl hover:bg-[#cc0000] hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 flex items-center justify-center shadow-sm">
                    <Youtube className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <AdSlot label="Rectangle Ad" height={250} width={300} preferredType="rectangles" className="max-w-[300px] rounded-2xl overflow-hidden" />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}