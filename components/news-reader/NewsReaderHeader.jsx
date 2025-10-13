"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, Star, FileText, Menu, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from 'firebase/auth';
import { auth } from '@/Firebase/firebase';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we're on a publisher page or article page with publisher data
  const isPublisherPage = pathname?.includes('/publisher/');
  const isArticlePage = pathname?.includes('/article/');
  const hasPublisherData = publisherImage || publisherName || publisher;

  // Determine the logo source with fallback logic
  const getLogoSrc = () => {
    // Show publisher logo if we're on publisher page OR article page with publisher data
    const shouldShowPublisherLogo = (isPublisherPage || (isArticlePage && hasPublisherData)) && !logoError;

    if (!shouldShowPublisherLogo) return '/Presspass.png';

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
  const isShowingPublisherLogo = (isPublisherPage || (isArticlePage && hasPublisherData)) && !logoError;

  const handleLogoError = () => {
    setLogoError(true);
  };

  const handleLogoClick = () => {
    if ((isPublisherPage || isArticlePage) && publisherId) {
      router.push(`/news-reader/publisher/${publisherId}`);
    } else {
      router.push('/news-reader');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to the main landing page
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="bg-[#329ae1] w-full flex justify-between items-center px-3 sm:px-6 py-2 sm:py-3 shadow-md h-16 md:h-32 fixed top-0 left-0 right-0 z-50">
      {/* Logo Section */}
      <Link href="/news-reader">
        <Image
          src={logoSrc}
          alt={isShowingPublisherLogo && publisherName ? `${publisherName} logo` : "Press Pass"}
          title={isShowingPublisherLogo && publisherName ? `Go to ${publisherName}` : "Go to Press Pass"}
          width={80}
          height={32}
          priority
          onError={() => setLogoError(true)}
          onLoad={() => setLogoError(false)}
          className="cursor-pointer hover:opacity-80 transition-opacity w-auto h-12 md:h-24"
        />
      </Link>

      {/* Mobile Menu Icon & Dropdown */}
      <div className="md:hidden relative">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          <Menu size={24} />
        </button>
        {isMobileMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation Icons */}
      <nav className="hidden md:flex gap-8 text-white text-sm font-medium items-center">
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
