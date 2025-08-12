'use client';

import { useState, useEffect } from 'react';

export default function CategoryFilter({ onCategoryChange, selectedCategory }) {
  const categories = [
    { id: 'top', name: 'All News' },
    { id: 'business', name: 'Business' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'opinion', name: 'Opinion' },
    { id: 'sports', name: 'Sports' },
    { id: 'others', name: 'Others' },
  ];

  const handleCategoryClick = (categoryId) => {
    onCategoryChange(categoryId);
  };

  return (
    <div className="px-6 py-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}