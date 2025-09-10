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
    <header className="bg-[#329ae1] px-2 md:px-4 py-2 md:py-3 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md gap-2 md:gap-0">
      {/* Logo + Company Name */}
      <Link href="/print-media" className="flex items-center space-x-2 md:space-x-3">
        <div className="w-[56px] h-[56px] md:w-[100px] md:h-[100px] flex items-center justify-center">
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
              className="object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity w-full h-full"
              priority
              onError={() => setLogoError(true)}
              onLoad={() => setLogoError(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-100">
              <span className="text-2xl md:text-3xl font-bold text-gray-500">?</span>
            </div>
          )}
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex w-full md:w-auto justify-center md:justify-end overflow-x-auto gap-2 md:gap-0 space-x-0 md:space-x-6 text-white font-medium">
        <Link
          href="/print-media/overview"
          className="flex flex-col items-center hover:text-gray-100 min-w-[60px]"
        >
          <Home size={20} />
          <span className="text-xs md:text-sm">Home</span>
        </Link>
        <Link
          href="/print-media/publisher"
          className="flex flex-col items-center hover:text-gray-100 min-w-[60px]"
        >
          <Newspaper size={20} />
          <span className="text-xs md:text-sm">Publisher</span>
        </Link>
        <Link
          href="/print-media/monetization"
          className="flex flex-col items-center hover:text-gray-100 min-w-[60px]"
        >
          <DollarSign size={20} />
          <span className="text-xs md:text-sm">Monetization</span>
        </Link>
        <Link
          href="/print-media/wallet"
          className="flex flex-col items-center hover:text-gray-100 min-w-[60px]"
        >
          <Wallet size={20} />
          <span className="text-xs md:text-sm">Wallet</span>
        </Link>
      </nav>
    </header>
  );
}
