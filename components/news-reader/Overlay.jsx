'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PublisherFavoriteButton from '@/components/PublisherFavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';

const LOCAL_STORAGE_KEY = 'recommended-section-is-open';
const PUBLISHERS_PER_SLIDE = 3;

// ─── Shared carousel logic ───────────────────────────────────────────────────
function useCarousel(total, perSlide, autoPlayMs = 0) {
  const [page, setPage]       = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const [visible, setVisible] = useState(true);
  const timeoutRef            = useRef(null);
  const autoRef               = useRef(null);
  const totalPages            = Math.ceil(total / perSlide);

  const navigate = useCallback((dir) => {
    if (animDir) return;
    setAnimDir(dir);
    setVisible(false);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPage((p) => dir === 'right' ? (p + 1) % totalPages : (p - 1 + totalPages) % totalPages);
      setVisible(true);
      setAnimDir(null);
    }, 220);
  }, [animDir, totalPages]);

  useEffect(() => {
    if (!autoPlayMs || totalPages <= 1) return;
    autoRef.current = setInterval(() => navigate('right'), autoPlayMs);
    return () => clearInterval(autoRef.current);
  }, [autoPlayMs, totalPages, navigate]);

  useEffect(() => () => {
    clearTimeout(timeoutRef.current);
    clearInterval(autoRef.current);
  }, []);

  return { page, animDir, visible, totalPages, navigate };
}

// ─── Publisher mini-card ─────────────────────────────────────────────────────
function PublisherMiniCard({ source }) {
  const router = useRouter();
  const { isPublisherFavorite } = useFavorites();
  const isFav = isPublisherFavorite?.(source.id);
  const initials = (source.name || '?').replace(/<[^>]*>/g, '').trim().charAt(0).toUpperCase();

  return (
    <div
      onClick={() => router.push(`/news-reader/publisher/${source.id}`)}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col items-center text-center p-4 gap-3"
    >
      <div className="w-12 h-12 flex-shrink-0">
        {source.logo ? (
          <img
            src={source.logo}
            alt={source.name}
            className="w-full h-full rounded-full object-contain border border-gray-100 bg-white"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-[#329ae1] flex items-center justify-center">
            <span className="text-white font-bold text-base">{initials}</span>
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight w-full">
        {source.name}
      </p>
      <PublisherFavoriteButton
        publisher={source}
        size="sm"
        showText={false}
        onClick={(e) => e.stopPropagation()}
        className={`mt-auto p-1.5 rounded-full transition-colors ${
          isFav
            ? 'bg-red-100 text-red-500'
            : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400'
        }`}
      />
    </div>
  );
}

// ─── Publisher carousel ──────────────────────────────────────────────────────
function PublisherRecommendedCarousel({ publishers }) {
  const { page, animDir, visible, totalPages, navigate } = useCarousel(
    publishers.length,
    PUBLISHERS_PER_SLIDE,
    10000
  );
  const slice = publishers.slice(
    page * PUBLISHERS_PER_SLIDE,
    (page + 1) * PUBLISHERS_PER_SLIDE
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">
          New Publishers · Follow to stay updated
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (i !== page) navigate(i > page ? 'right' : 'left'); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === page ? 'bg-[#329ae1] w-4' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{page + 1}/{totalPages}</span>
            {[['left', ChevronLeft], ['right', ChevronRight]].map(([dir, Icon]) => (
              <button
                key={dir}
                onClick={() => navigate(dir)}
                disabled={!!animDir}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-40"
                aria-label={dir === 'left' ? 'Previous' : 'Next'}
              >
                <Icon className="w-3.5 h-3.5 text-gray-600" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Always 3 columns — matches the main content column width */}
      <div
        style={{
          transition: visible ? 'opacity 0.22s ease, transform 0.22s ease' : 'none',
          opacity: visible ? 1 : 0,
          transform: visible
            ? 'translateX(0)'
            : animDir === 'right' ? 'translateX(-10px)' : 'translateX(10px)',
        }}
        className="grid grid-cols-3 gap-3"
      >
        {slice.map((source) => (
          <PublisherMiniCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
// No col-span-full — width is fully controlled by parent (main column in NewsGrid)
export default function RecommendedOverlayBottom({ articles, noArticlePublishers = [] }) {
  const [isOpen, setIsOpen] = useState(true);
  const recommended = (articles || []).slice(0, 8);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) setIsOpen(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(isOpen));
  }, [isOpen]);

  if (recommended.length === 0 && noArticlePublishers.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-lg mt-8 w-full">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-100 rounded-lg transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Recommended For You
        </h3>
        {isOpen
          ? <ChevronUp className="w-5 h-5 text-gray-500" />
          : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 pt-0 space-y-6">

          {noArticlePublishers.length > 0 && (
            <PublisherRecommendedCarousel publishers={noArticlePublishers} />
          )}

          {noArticlePublishers.length > 0 && recommended.length > 0 && (
            <hr className="border-gray-200" />
          )}

          {recommended.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Articles You Might Like</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommended.map((a, i) => (
                  <a
                    key={i}
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border rounded-lg p-3 bg-white hover:shadow-md hover:border-blue-400 transition-all"
                  >
                    <p className="text-xs text-gray-500 mb-1 uppercase font-medium">{a.source_id}</p>
                    <h4 className="font-semibold text-gray-800 leading-snug">{a.title}</h4>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}