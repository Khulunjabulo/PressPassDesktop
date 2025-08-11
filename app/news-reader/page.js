'use client';

import { fetchNews } from '@/lib/fetchNews';
import NewsGrid from '@/components/news-reader/NewsGrid';
import BannerAd from '@/components/news-reader/BannerAd';
import CategoryFilter from '@/components/news-reader/CategoryFilter';
import { useState, useEffect } from 'react';

export default function NewsReaderHome() {
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles when component mounts or category changes
  const fetchArticles = async (category = 'top') => {
    setLoading(true);
    try {
      const fetchedArticles = await fetchNews(category, 'us');
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Fetch articles when selectedCategory changes
  useEffect(() => {
    fetchArticles(selectedCategory);
  }, [selectedCategory]);

  return (
    <div>
      {/* Top Banner Ad */}
      <div className="px-6 mt-4">
        <BannerAd />
      </div>

      {/* Category Filter */}
      <CategoryFilter
        onCategoryChange={handleCategoryChange}
        selectedCategory={selectedCategory}
      />

      <div className="py-8 text-left m-5">
        <h2 className="text-xl font-bold">
          {selectedCategory === 'top' ? 'Top Headlines' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} News`}
        </h2>
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