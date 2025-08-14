'use client';

import { useState, useEffect } from 'react';
import { CardContent } from '@/components/UI/Cards';
import { ArrowRight, FileText, Plus, Users, Globe, Clock, Heart } from 'lucide-react';
import { useNewsSources } from '@/hooks/useNewsSources';

export default function SearchPage() {
  const { newsources, loading: sourcesLoading, error } = useNewsSources();
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }

    const lowerQ = query.toLowerCase();
    const matches = newsources.filter(source =>
      source.name.toLowerCase().includes(lowerQ) ||
      source.source_id?.toLowerCase().includes(lowerQ)
    );

    setFiltered(matches);
  }, [query, newsources]);

  return (
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

      {/* Default intro when nothing typed */}
      {!query && (
        <div className="text-center py-16 text-sm space-y-2">
          <h2 className="text-4xl font-bold">
            FIND YOUR LOCAL COMMUNITY NEWSPAPER,
          </h2>
          <h2 className="text-4xl font-bold">
            MAGAZINE AND PUBLICATIONS.
          </h2>
        </div>
      )}

      {/* Loading & error messages */}
      {sourcesLoading && <p className="text-gray-500 mt-4">Loading news sources...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* Show filtered results when user types */}
      {!sourcesLoading && query && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {filtered.length > 0 ? (
            filtered.map((source, idx) => (
              <CardContent key={idx} className="p-4 border rounded-lg hover:shadow-lg transition">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {source.logo ? (
                      <img
                        src={source.logo}
                        alt={`${source.name} logo`}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {source.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{source.name}</h3>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {source.industry || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex items-center space-x-1">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">
                          {source.articleCount || 0} {source.articleCount === 1 ? 'post' : 'posts'}
                        </span>
                      </div>
                      {!source.hasArticles && (
                        <div className="flex items-center space-x-1">
                          <Plus className="w-2 h-2 text-orange-500" />
                          <span className="text-xs text-orange-600 font-medium">New</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mb-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600 capitalize truncate">{source.publicationType || 'Publication'}</span>
                    </div>
                    {source.website && (
                      <div className="flex items-center space-x-1 mb-1">
                        <Globe className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600 truncate">
                          {source.website.replace(/^https?:\/\//, '')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className={`text-xs ${source.hasArticles ? 'text-gray-500' : 'text-green-600 font-medium'}`}>
                        {source.lastPosted || '--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    className="p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors"
                    disabled
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Folder</span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${source.hasArticles ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span className="text-xs text-gray-500">{source.hasArticles ? 'Active' : 'Ready'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            ))
          ) : (
            <p className="text-center col-span-full">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
