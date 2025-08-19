'use client';

import Link from "next/link";
import { Home, Newspaper, DollarSign, Wallet } from "lucide-react";
import { useCurrentPublisher } from "@/hooks/useCurrentPublisher";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const { publisher: hookPublisher, loading } = useCurrentPublisher("currentPublisherId");
  const [publisher, setPublisher] = useState(hookPublisher);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (hookPublisher) {
      setPublisher(hookPublisher);
      localStorage.setItem("currentPublisher", JSON.stringify(hookPublisher));
    }
  }, [hookPublisher]);

  useEffect(() => {
    const handleStorageChange = () => {
      const updated = localStorage.getItem("currentPublisher");
      if (updated) setPublisher(JSON.parse(updated));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getLogoSrc = () => {
    if (logoError) return "/Presspass.png";

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
    return "/Presspass.png";
  };

  const logoSrc = getLogoSrc();

  return (
    <header className="bg-blue-400 px-4 py-3 flex items-center justify-between shadow-md">
      <Link href="/print-media" className="flex items-center space-x-3">
        <div className="w-[100px] h-[100px] flex items-center justify-center">
          <Image
            src={logoSrc}
            alt={publisher?.companyName ? `${publisher.companyName} logo` : "Press Pass"}
            width={100}
            height={100}
            className="object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            priority
            onError={() => setLogoError(true)}
            onLoad={() => setLogoError(false)}
          />
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
