"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, Search, Star, FileText } from "lucide-react";

export default function NewsReaderHeader() {
  return (
    <header className="bg-[#329ae1] w-full flex justify-between items-center px-6 py-3 shadow-md">
      {/* Logo - always goes to news-reader */}
      <Link href="/news-reader">
        <Image
          src="/Presspass.png"
          alt="Press Pass"
          width={200}
          height={100}
          priority
          className="cursor-pointer hover:opacity-80 transition-opacity"
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
