'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardContent } from '@/components/UI/Cards';
import { Heart } from 'lucide-react';
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

    // 🔎 If user typed something in search box
    if (query.trim()) {
      const lowerQ = query.toLowerCase();
      matches = matches.filter(
        source =>
          source.name.toLowerCase().includes(lowerQ) ||
          source.source_id?.toLowerCase().includes(lowerQ)
      );
    }

    // 🏙 If user selected a city
    if (selectedCity) {
      matches = matches.filter(
        source => source.city?.toLowerCase() === selectedCity.toLowerCase()
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
        console.warn("Favorite toggle failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {isMobile && user ? <MainHeader /> : <Header />}
      <div className={`py-8 text-center space-y-4 ${isMobile && user ? 'pt-16 sm:pt-20' : ''}`}>
        {/* Heading */}
        <h2 className="text-4xl font-bold">Search</h2>
        <p className="text-gray-500">
          {query || selectedCity 
            ? `Results for: ${query || selectedCity}` 
            : 'Type to search for publications or choose a city'}
        </p>

        {/* Input field + City Selector side by side */}
        <div className="w-full max-w-2xl mx-auto flex gap-2 items-center">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search publications..."
            className="flex-1 border rounded px-4 py-2"
            autoFocus
          />

          {/* City selector */}
          <CitySelector onCityChange={(city) => setSelectedCity(city)} />
        </div>

        {/* Default intro */}
        {!query && !selectedCity && (
          <div className="text-center py-16 text-sm space-y-2">
            <h2 className="text-4xl font-bold"> FIND YOUR LOCAL COMMUNITY NEWSPAPER, </h2>
            <h2 className="text-4xl font-bold"> MAGAZINE AND PUBLICATIONS. </h2>
          </div>
        )}

        {/* Loading & error */}
        {sourcesLoading && <p className="text-gray-500 mt-4">Loading news sources...</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {/* Results */}
        {!sourcesLoading && (query || selectedCity) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {filtered.length > 0 ? (
              filtered.map((source, idx) => (
                <CardContent
                  key={idx}
                  className="p-4 border rounded-lg hover:shadow-lg transition flex items-start justify-between cursor-pointer"
                  onClick={() => handleSourceClick(source)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-20 h-20 my-2">
                      {source.logo ? (
                        <img
                          src={source.logo}
                          alt={`${source.name} logo`}
                          className="w-full h-full rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br bg-[#329ae1] rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-2xl">
                            {source.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {source.name}
                      </h3>
                      {source.city && (
                        <p className="text-sm text-gray-500">{source.city}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: favorite button */}
                  <div className="self-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`p-2 rounded-full transition-colors ${
                        isPublisherFavorite(source.id)
                          ? 'bg-red-100 hover:bg-red-200'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={(e) => handleFavoriteToggle(e, source)}
                      disabled={favoritesLoading || !currentUser}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isPublisherFavorite(source.id) ? 'text-red-500' : 'text-gray-400'
                        }`}
                        fill={isPublisherFavorite(source.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </CardContent>
              ))
            ) : (
              <p className="text-center col-span-full">No results found.</p>
            )}
          </div>
        )}
      </div>
        </div>
  );
}
