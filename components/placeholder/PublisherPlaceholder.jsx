// components/placeholder/PublisherPlaceholder.jsx
import React from 'react';

export default function PublisherPlaceholder({ index }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      {/* Publisher Name (centered header) */}
      <div className="text-center mb-3">
        <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
      </div>

      {/* Logo + Story */}
      <div className="flex items-start space-x-3 mb-3">
        {/* Logo Placeholder */}
        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg"></div>

        {/* Story Content Placeholder */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title lines */}
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
          </div>
          
          {/* Excerpt lines */}
          <div className="space-y-1.5">
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-4/5"></div>
          </div>
          
          {/* Read more button placeholder */}
          <div className="h-2.5 bg-blue-200 rounded w-16"></div>
        </div>
      </div>

      {/* Post Info + Favorites */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="h-2 bg-gray-200 rounded w-20"></div>
          <div className="h-2 bg-gray-200 rounded w-24 hidden sm:block"></div>
        </div>
        <div className="w-8 h-8 bg-gray-100 rounded-full hidden sm:block"></div>
      </div>
    </div>
  );
}