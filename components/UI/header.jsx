'use client';

import Link from "next/link";
import { Home, Newspaper, DollarSign, Wallet } from "lucide-react";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import { useState, useEffect } from "react";

export default function Header() {
  // 👇 Fetch publisher data using your hook
  const { publisher: hookPublisher, loading } = useCurrentPublisher("currentPublisherId");
  const [publisher, setPublisher] = useState(hookPublisher);

  // Update state whenever hookPublisher changes
  useEffect(() => {
    if (hookPublisher) {
      setPublisher(hookPublisher);
      localStorage.setItem('currentPublisher', JSON.stringify(hookPublisher));
    }
  }, [hookPublisher]);

  // Listen for updates from localStorage (e.g., profile page updates)
  useEffect(() => {
    const handleStorageChange = () => {
      const updated = localStorage.getItem('currentPublisher');
      if (updated) setPublisher(JSON.parse(updated));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper to check if string is a base64 image
  const isBase64 = (str) => typeof str === 'string' && str.startsWith('data:image/');

  return (
    <header className="bg-blue-400 px-4 py-3 flex items-center justify-between">
      <Link href="/print-media" className="flex items-center space-x-3">
        <div className="w-[100px] h-[100px]">
          {publisher?.companyLogo ? (
            <img
              src={isBase64(publisher.companyLogo) ? publisher.companyLogo : publisher.companyLogo}
              alt={`${publisher?.companyName || "Publisher"} logo`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : publisher?.companyName ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-2xl">
                {publisher.companyName.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-2xl">?</span>
            </div>
          )}
        </div>

        {publisher?.companyName && (
          <span className="text-white font-semibold text-lg truncate">
            {publisher.companyName}
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex space-x-6 text-white font-medium">
        <Link href="/print-media/overview" className="flex flex-col items-center hover:text-gray-100">
          <Home size={20} />
          <span className="text-sm">Home</span>
        </Link>
        <Link href="/print-media/publisher" className="flex flex-col items-center hover:text-gray-100">
          <Newspaper size={20} />
          <span className="text-sm">Publisher</span>
        </Link>
        <Link href="/print-media/monetization" className="flex flex-col items-center hover:text-gray-100">
          <DollarSign size={20} />
          <span className="text-sm">Monetization</span>
        </Link>
        <Link href="/print-media/wallet" className="flex flex-col items-center hover:text-gray-100">
          <Wallet size={20} />
          <span className="text-sm">Wallet</span>
        </Link>
      </nav>
    </header>
  );
}
