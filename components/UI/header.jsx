"use client";

import Link from "next/link";
import { Home, Newspaper, DollarSign, Wallet } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Header({ publisher }) {
  const [logoError, setLogoError] = useState(false);

  const getLogoSrc = () => {
    if (logoError) return null;

    const logoSources = [
      publisher?.companyLogo,
      publisher?.logo,
      publisher?.image,
    ];

    for (const src of logoSources) {
      if (src && typeof src === "string" && src.trim() !== "") {
        return src;
      }
    }
    return null;
  };

  const logoSrc = getLogoSrc();

  return (
    <header className="bg-[#329ae1] px-4 py-3 flex items-center justify-between shadow-md">
      {/* Logo + Company Name */}
      <Link href="/print-media" className="flex items-center space-x-3">
        <div className="w-[100px] h-[100px] flex items-center justify-center">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={
                publisher?.companyName
                  ? `${publisher.companyName} logo`
                  : "Publisher Logo"
              }
              width={100}
              height={100}
              className="object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              priority
              onError={() => setLogoError(true)}
              onLoad={() => setLogoError(false)}
            />
          ) : (
            <div className="w-[100px] h-[100px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-100">
              <span className="text-3xl font-bold text-gray-500">?</span>
            </div>
          )}
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
