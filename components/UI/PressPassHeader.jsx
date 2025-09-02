"use client";

import Link from "next/link";
import { Home, Newspaper, DollarSign, Wallet } from "lucide-react";
import Image from "next/image";

export default function PressPassHeader() {
  
  return (
    <header className="bg-[#329ae1] px-4 py-3 flex items-center justify-between shadow-md">
      {/* Logo + Company Name */}
      <Link href="/print-media" className="flex items-center space-x-3">
        <div className="w-[100px] h-[100px] flex items-center justify-center">
            <Image
            src="/Presspass.png" alt="News Icon" className="w-12 h-12" width={100} height={100}
            />
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex space-x-6 text-white font-medium">
        <Link
          href="/print-media/overview"
          className="flex flex-col items-center hover:text-gray-100"
        >
          <Home size={20} />
          <span className="text-sm">Home</span>
        </Link>
        <Link
          href="/print-media/publisher"
          className="flex flex-col items-center hover:text-gray-100"
        >
          <Newspaper size={20} />
          <span className="text-sm">Publisher</span>
        </Link>
        <Link
          href="/print-media/monetization"
          className="flex flex-col items-center hover:text-gray-100"
        >
          <DollarSign size={20} />
          <span className="text-sm">Monetization</span>
        </Link>
        <Link
          href="/print-media/wallet"
          className="flex flex-col items-center hover:text-gray-100"
        >
          <Wallet size={20} />
          <span className="text-sm">Wallet</span>
        </Link>
      </nav>
    </header>
  );
}
