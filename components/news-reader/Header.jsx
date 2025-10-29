"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, Search, Star, FileText } from "lucide-react";

export default function NewsReaderHeader() {
  return (
    <header className="bg-[#329ae1] flex justify-between items-center px-3 sm:px-6 py-2 shadow-md h-16 md:h-32 fixed md:relative top-0 left-0 right-0 w-full z-50">
      {/* Logo - always goes to news-reader */}
      <Link href="/">
        <Image
          src="/Presspass.png"
          alt="Press Pass"
          width={80}
          height={32}
          priority
          className="cursor-pointer hover:opacity-80 transition-opacity w-auto h-12 md:h-24"
        />
      </Link>

      {/* Navigation */}
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
            <span className="text-xs mt-1">Favorites</span>
          </div>
        </Link>

        <Link href="/news-reader/classified">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <FileText size={24} />
            <span className="text-xs mt-1">Classifieds</span>
          </div>
        </Link>
      </nav>
    </header>
  );
}
