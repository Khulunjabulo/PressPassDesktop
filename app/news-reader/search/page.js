'use client';

import { useState, useEffect } from 'react';
import { getPublications } from '@/lib/fetchNews';
import Link from 'next/link';

export default function SearchPage() {
  const [publications, setPublications] = useState([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch publications once
  useEffect(() => {
    async function fetchData() {
      const pubs = await getPublications();
      setPublications(pubs);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter as user types
  useEffect(() => {
    if (query.trim()) {
      const lowerQ = query.toLowerCase();
      setFiltered(
        publications.filter(pub =>
          pub.source_id.toLowerCase().includes(lowerQ)
        )
      );
    } else {
      setFiltered([]);
    }
  }, [query, publications]);

  return (
    <div className="py-8 text-center space-y-4">
      {/* Heading */}
      <h2 className="text-4xl font-bold">Search</h2>
      <p className="text-gray-500">
        {query
          ? `Results for: ${query}`
          : 'Type to search for publications'}
      </p>

      {/* Input field (live search) */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search publications..."
        className="w-full max-w-md border rounded px-4 py-2"
        autoFocus
      />

      {/* Default intro when nothing typed */}
      {!query && !loading && (
        <div className="text-center py-16 text-sm">
          <h2 className="text-4xl font-bold">
            FIND YOUR LOCAL COMMUNITY NEWSPAPER,
          </h2>
          <h2 className="text-4xl font-bold">
            MAGAZINE AND PUBLICATIONS.
          </h2>
        </div>
      )}

      {/* Autocomplete results */}
      {query && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {filtered.length > 0 ? (
            filtered.map((pub, idx) => (
              <Link
                href={`/news-reader/${pub.source_id}`}
                key={idx}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={pub.image_url}
                  alt={pub.source_id}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex justify-between items-center">
                  <span className="font-semibold">{pub.source_id}</span>
                  <button className="px-3 py-1 text-sm bg-yellow-400 rounded hover:bg-yellow-500">
                    ★ Fav
                  </button>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center col-span-full">No results found.</p>
          )}
        </div>
      )}
    </div>
  );
}
