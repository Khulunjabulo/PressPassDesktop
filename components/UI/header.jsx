'use client';

import Link from "next/link";
import { Home, Newspaper, DollarSign, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    }
  }, []);

  return (
    <header className="bg-blue-400 px-4 py-3 flex items-center justify-between">
      {/* Logo / Name */}
      <Link href="/print-media" className="flex items-center space-x-3">
        <div className="w-[40px] h-[40px]">
          {currentUser?.companyLogo ? (
            <img
              src={currentUser.companyLogo}
              alt={`${currentUser?.companyName || "Publisher"} logo`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : currentUser?.companyName ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-2xl">
                {currentUser.companyName.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-2xl">?</span>
            </div>
          )}
        </div>
        {/* Publication Name */}
        {currentUser?.companyName && (
          <span className="text-white font-semibold text-lg truncate">
            {currentUser.companyName}
          </span>
        )}
      </Link>

      {/* Navigation */}
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
