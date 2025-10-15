'use client';

import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'recommended-section-is-open';

export default function RecommendedOverlayBottom({ articles }) {
  // Default to true, then check localStorage on the client to prevent hydration mismatch.
  const [isOpen, setIsOpen] = useState(true);
  const recommended = (articles || []).slice(0, 8);

  // On component mount, read the saved state from localStorage.
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  // Whenever the state changes, save it to localStorage.
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(isOpen));
  }, [isOpen]);

  return (
    <div className="bg-gray-50 rounded-lg mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-gray-100 rounded-lg transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-gray-500" />
          Recommended For You
        </h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 sm:p-6 pt-0">
          {recommended.length > 0 ? (
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
          ) : (
            <p className="text-sm text-gray-500">No recommendations available at the moment.</p>
          )}
        </div>
      )}
    </div>
  );
}
