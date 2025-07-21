"use client";

import { Home, Search, Star, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NewsReaderHeader() {
  return (
    <header className="bg-[#329ae1] w-full flex justify-between items-center px-6 py-3 shadow-md">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <Link href="/news-reader">
        <Image
          src="/Presspass.png"
          alt="Press Pass logo"
          width={110}
          height={25}
        />
        </Link>
      </div>

      {/* Navigation Icons */}
      <nav className="flex gap-8 text-white text-sm font-medium items-center">
        <Link href="/">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>

        <Link href="/search">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <Search size={24} />
            <span className="text-xs mt-1">Search</span>
          </div>
        </Link>

        <Link href="/favorite">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <Star size={24} />
            <span className="text-xs mt-1">Favorite</span>
          </div>
        </Link>

        <Link href="/classified">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <FileText size={24} />
            <span className="text-xs mt-1">Classified</span>
          </div>
        </Link>
      </nav>
    </header>
  );
}
