'use client';

import NewsGrid from '@/components/news-reader/NewsGrid';
import BannerAd from '@/components/news-reader/BannerAd';
import { useState } from 'react';

export default function NewsReaderHome() {
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div>
      {/* Top Banner Ad */}
      <div className="px-6 mt-4">
        <BannerAd />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <NewsGrid articles={articles} />
      )}
    </div>
  );
}
