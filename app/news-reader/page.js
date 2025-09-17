'use client';

import NewsGrid from '@/components/news-reader/NewsGrid';
// import BannerAd from '@/components/news-reader/BannerAd';
import { useState, useEffect } from 'react';
import Header from '@/components/news-reader/Header';
import MainHeader from '@/components/news-reader/NewsReaderMainHeader';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/Firebase/firebase';

export default function NewsReaderHome() {
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  return (
    <div>
    {isMobile ? <MainHeader /> : <Header />}
    <div className={isMobile ? 'pt-16 sm:pt-20' : ''}>
      {/* Top Banner Ad */}
      <div className="px-6 mt-4">
        {/* <BannerAd /> */}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <NewsGrid articles={articles} />
      )}
    </div>
    </div>
  );
}
