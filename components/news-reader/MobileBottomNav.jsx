"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Search, Star, FileText } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/Firebase/firebase";

export default function MobileBottomNav() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  // Show only when logged in
  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#329ae1] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <nav className="flex gap-8 text-white text-sm font-medium items-center justify-between">
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
      </div>
    </div>
  );
}
