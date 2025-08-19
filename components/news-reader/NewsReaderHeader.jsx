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

  // Determine the logo source with fallback logic
  const getLogoSrc = () => {
    if (!isPublisherPage || logoError) return '/Presspass.png';

    const logoSources = [
      publisherImage,
      publisher?.logo,
      publisher?.companyLogo,
      publisher?.image
    ];

    for (const logoSrc of logoSources) {
      if (logoSrc && typeof logoSrc === 'string' && logoSrc.trim() !== '') {
        return logoSrc;
      }
    }
    return '/Presspass.png';
  };

  const logoSrc = getLogoSrc();

  const handleLogoError = () => {
    setLogoError(true);
  };

  const handleLogoClick = () => {
    if (isPublisherPage && publisherId) {
      router.push(`/news-reader/publisher/${publisherId}`);
    } else {
      router.push('/news-reader');
    }
  };

  return (
    <header className="bg-[#329ae1] w-full flex justify-between items-center px-6 py-3 shadow-md">
      {/* Logo Section */}
      <Link href="/news-reader">
        <Image
          src={logoSrc}
          alt={isPublisherPage && publisherName ? `${publisherName} logo` : "Press Pass"}
          width={100}
          height={50}
          priority
          onError={() => setLogoError(true)}
          onLoad={() => setLogoError(false)}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
      </Link>

      {/* Navigation Icons */}
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
    </header>
  );
}
