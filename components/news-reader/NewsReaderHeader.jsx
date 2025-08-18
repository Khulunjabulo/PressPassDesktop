"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Star, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NewsReaderHeader({ 
  publisherImage, 
  publisherName, 
  publisherId, 
  publisher, 
  isLoading = false, 
  isError = false 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  // Check if we're on a publisher page
  const isPublisherPage = pathname?.includes('/publisher/');

  // Enhanced debug logging
  useEffect(() => {
    console.log('🔎 NewsReaderHeader Debug ->', {
      pathname,
      isPublisherPage,
      publisherImage,
      publisherName,
      publisherId,
      hasPublisher: !!publisher,
      isLoading,
      isError,
      logoError,
      fullPublisherData: publisher
    });
  }, [pathname, isPublisherPage, publisherImage, publisherName, publisherId, publisher, isLoading, isError, logoError]);

  // Determine the logo source with fallback logic
  const getLogoSrc = () => {
    // If we're not on a publisher page or there's a logo error, use default Press Pass logo
    if (!isPublisherPage || logoError) {
      console.log('🖼️ Using default Press Pass logo');
      return '/Presspass.png';
    }

    // Try different publisher logo fields
    const logoSources = [
      publisherImage,
      publisher?.logo,
      publisher?.companyLogo,
      publisher?.image
    ];

    for (const logoSrc of logoSources) {
      if (logoSrc && typeof logoSrc === 'string' && logoSrc.trim() !== '') {
        console.log('🖼️ Using publisher logo source:', logoSrc);
        return logoSrc;
      }
    }

    console.log('🖼️ No valid publisher logo found, using default Press Pass logo');
    return '/Presspass.png';
  };

  const logoSrc = getLogoSrc();

  const handleLogoError = (e) => {
    console.error('❌ Header logo failed to load:', logoSrc);
    setLogoError(true);
  };

  const handleLogoClick = () => {
    if (isPublisherPage && publisherId) {
      router.push(`/news-reader/publisher/${publisherId}`);
    } else {
      router.push('/news-reader');
    }
  };

  // Single blue header that works for all pages
  return (
    <header className="bg-[#329ae1] w-full flex justify-between items-center px-6 py-3 shadow-md">
      {/* Logo Section - changes based on page */}
      <div className="flex items-center gap-3">
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
        >
          <Image
            src={logoSrc}
            alt={isPublisherPage && publisherName ? `${publisherName} logo` : "Press Pass logo"}
            width={200}
            height={100}
            priority
            onError={handleLogoError}
            onLoad={() => {
              console.log('✅ Header logo loaded successfully:', logoSrc);
              setLogoError(false);
            }}
          />
        </div>
      </div>

      {/* Navigation Icons - always the same */}
      <nav className="flex gap-8 text-white text-sm font-medium items-center">
        <Link href="/news-reader">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>

        <Link href="/news-reader/search">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <Search size={24} />
            <span className="text-xs mt-1">Search</span>
          </div>
        </Link>

        <Link href="/news-reader/favorites">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <Star size={24} />
            <span className="text-xs mt-1">Favorite</span>
          </div>
        </Link>

        <Link href="/news-reader/classified">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <FileText size={24} />
            <span className="text-xs mt-1">Classified</span>
          </div>
        </Link>
      </nav>

      {/* Debug Info (remove in production) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-full left-0 w-full bg-yellow-50 border-b border-yellow-200 px-4 py-2 z-50">
          <details className="text-xs">
            <summary className="cursor-pointer text-yellow-800 font-medium">
              🐛 Debug Info (Development Only)
            </summary>
            <div className="mt-2 space-y-1 text-yellow-700">
              <div><strong>Is Publisher Page:</strong> {isPublisherPage.toString()}</div>
              <div><strong>Pathname:</strong> {pathname}</div>
              <div><strong>Logo Src:</strong> {logoSrc}</div>
              <div><strong>Publisher Name:</strong> {publisherName || 'null'}</div>
              <div><strong>Using Publisher Logo:</strong> {(isPublisherPage && !logoError && logoSrc !== '/Presspass.png').toString()}</div>
            </div>
          </details>
        </div>
      )} */}
    </header>
  );
}