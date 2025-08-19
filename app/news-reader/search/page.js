'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardContent } from '@/components/UI/Cards';
import { Heart } from 'lucide-react';
import { useNewsSources } from '@/hooks/useNewsSources';
import { useFavorites } from '@/hooks/useFavorites';
import Header from '@/components/news-reader/Header';

export default function SearchPage() {
  const { newsources, loading: sourcesLoading, error } = useNewsSources();
  const { 
    isPublisherFavorite, 
    togglePublisherFavorite, 
    currentUser,
    loading: favoritesLoading 
  } = useFavorites();
  
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }
    const lowerQ = query.toLowerCase();
    const matches = newsources.filter(
      source =>
        source.name.toLowerCase().includes(lowerQ) ||
        source.source_id?.toLowerCase().includes(lowerQ)
    );
    setFiltered(matches);
  }, [query, newsources]);

  const handleSourceClick = (source) => {
    router.push(`/news-reader/publisher/${source.id}`);
  };

  const handleFavoriteToggle = async (e, source) => {
    e.stopPropagation();
    
    if (!currentUser) {
      return;
    }

    try {
      const result = await togglePublisherFavorite(source);
      if (!result.success) {
      }
    } catch (error) {
    }
  };

  return (
    <div>
      <Header/>
    <div className="py-8 text-center space-y-4">
      {/* Heading */}
      <h2 className="text-4xl font-bold">Search</h2>
      <p className="text-gray-500">
        {query ? `Results for: ${query}` : 'Type to search for publications'}
      </p>

      {/* Input field */}
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search publications..."
        className="w-full max-w-md border rounded px-4 py-2"
        autoFocus
      />

      {/* Default intro */}
      {!query && (
        <div className="text-center py-16 text-sm space-y-2">
          <h2 className="text-4xl font-bold"> FIND YOUR LOCAL COMMUNITY NEWSPAPER, </h2>
          <h2 className="text-4xl font-bold"> MAGAZINE AND PUBLICATIONS. </h2>
        </div>
      )}

      {/* Loading & error */}
      {sourcesLoading && <p className="text-gray-500 mt-4">Loading news sources...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {!sourcesLoading && query && (
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
