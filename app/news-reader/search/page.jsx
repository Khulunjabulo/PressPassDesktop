'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardContent } from '@/components/UI/Cards';
import { Heart, Search as SearchIcon, MapPin } from 'lucide-react';
import { useNewsSources } from '@/hooks/useNewsSources';
import { useFavorites } from '@/hooks/useFavorites';
import CitySelector from '@/components/news-reader/CitySelector';
import Header from '@/components/news-reader/Header';
import MainHeader from '@/components/news-reader/NewsReaderMainHeader';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/Firebase/firebase';

export default function SearchPage() {
  const { newsources, loading: sourcesLoading, error } = useNewsSources();
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const {
    isPublisherFavorite,
    togglePublisherFavorite,
    currentUser,
    loading: favoritesLoading
  } = useFavorites();

  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filtered, setFiltered] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  useEffect(() => {
    let matches = newsources;

    if (query.trim()) {
      const lowerQ = query.toLowerCase();
      matches = matches.filter(
        (source) =>
          source.name.toLowerCase().includes(lowerQ) ||
          source.source_id?.toLowerCase().includes(lowerQ)
      );
    }

    if (selectedCity) {
      matches = matches.filter(
        (source) => source.city?.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    setFiltered(matches);
  }, [query, selectedCity, newsources]);

  const handleSourceClick = (source) => {
    router.push(`/news-reader/publisher/${source.id}`);
  };

  const handleFavoriteToggle = async (e, source) => {
    e.stopPropagation();
    if (!currentUser) return;

    try {
      const result = await togglePublisherFavorite(source);
      if (!result.success) {
        console.warn('Favorite toggle failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const hasSearch = query || selectedCity;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {isMobile && user ? <MainHeader /> : <Header />}

      <div
        className={`py-10 text-center space-y-6 ${
          isMobile && user ? 'pt-20 sm:pt-24' : ''
        }`}
      >
        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Search
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            {hasSearch
              ? `Results for: ${query || selectedCity}`
              : 'Type to search for publications or choose a city'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative group">
              <SearchIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-[#329ae1]"
                strokeWidth={2}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search publications..."
                className="w-full border border-gray-200 bg-white rounded-2xl pl-12 pr-4 py-3.5 shadow-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#329ae1]/20 focus:border-[#329ae1] transition-all duration-300"
                autoFocus
              />
            </div>

            <div className="relative">
              <CitySelector onCityChange={(city) => setSelectedCity(city)} />
              {selectedCity && (
                <button
                  onClick={() => setSelectedCity('')}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#329ae1] text-white rounded-full text-[10px] flex items-center justify-center shadow-md hover:bg-[#2580c0] transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero / Empty State */}
        {!hasSearch && (
          <div className="text-center py-16 sm:py-20 px-4 space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#329ae1]/10 mb-4">
              <SearchIcon className="w-8 h-8 text-[#329ae1]" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              FIND YOUR LOCAL COMMUNITY NEWSPAPER,
            </h2>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              MAGAZINE AND PUBLICATIONS.
            </h2>
          </div>
        )}

        {/* Loading & Error */}
        {sourcesLoading && (
          <div className="flex items-center justify-center gap-2 text-gray-500 mt-6">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#329ae1] rounded-full animate-spin" />
            <span className="text-sm">Loading news sources...</span>
          </div>
        )}
        {error && (
          <p className="text-red-500 mt-6 bg-red-50 inline-block px-4 py-2 rounded-lg text-sm">
            {error}
          </p>
        )}

        {/* Results Grid */}
        {!sourcesLoading && hasSearch && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-6xl mx-auto">
            {filtered.length > 0 ? (
              filtered.map((source, idx) => (
                <CardContent
                  key={source.id || idx}
                  className="p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-start justify-between cursor-pointer group"
                  onClick={() => handleSourceClick(source)}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 my-auto">
                      {source.logo ? (
                        <img
                          src={source.logo}
                          alt={`${source.name} logo`}
                          className="w-full h-full rounded-xl object-cover border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#329ae1] to-[#1e7bc0] rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-xl sm:text-2xl">
                            {source.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-[#329ae1] transition-colors duration-300">
                        {source.name}
                      </h3>
                      {source.city && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{source.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <div
                    className="self-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 active:scale-90 ${
                        isPublisherFavorite(source.id)
                          ? 'bg-red-50 hover:bg-red-100 shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={(e) => handleFavoriteToggle(e, source)}
                      disabled={favoritesLoading || !currentUser}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors duration-300 ${
                          isPublisherFavorite(source.id)
                            ? 'text-red-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        fill={isPublisherFavorite(source.id) ? 'currentColor' : 'none'}
                        strokeWidth={isPublisherFavorite(source.id) ? 2.5 : 2}
                      />
                    </button>
                  </div>
                </CardContent>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                <SearchIcon className="w-12 h-12 mb-3 opacity-40" strokeWidth={1.5} />
                <p className="text-lg font-medium">No results found.</p>
                <p className="text-sm">Try a different search term or city.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}