'use client';

import Image from "next/image";
import Link from "next/link";
import { Home, Search, Star, FileText, User } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from '@/Firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { usePathname } from 'next/navigation';

export default function NewsReaderHeader() {
  const [profilePicture, setProfilePicture] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/user-profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setProfilePicture(userData.profilePicture || '');
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { href: '/news-reader', label: 'Home', icon: Home },
    { href: '/news-reader/search', label: 'Search', icon: Search },
    { href: '/news-reader/favorites', label: 'Favorites', icon: Star },
    { href: '/news-reader/classified', label: 'Classifieds', icon: FileText },
  ];

  const isActive = (href) => pathname === href;

  return (
    <header className="bg-[#329ae1] flex justify-between items-center px-4 sm:px-8 py-3 shadow-lg h-16 md:h-28 fixed md:relative top-0 left-0 right-0 w-full z-50 backdrop-blur-sm">
      {/* Logo */}
      <Link href="/">
        <Image
          src="/Presspass.png"
          alt="Press Pass"
          width={80}
          height={32}
          priority
          className="cursor-pointer hover:opacity-90 transition-opacity duration-300 w-auto h-10 md:h-20 drop-shadow-sm"
        />
      </Link>

      {/* Navigation */}
      <nav className="flex gap-2 sm:gap-6 text-white text-sm font-medium items-center">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <div
                className={`flex flex-col items-center justify-center px-2 sm:px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  active
                    ? 'bg-white/20 shadow-inner scale-105'
                    : 'hover:bg-white/10 hover:scale-105'
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-transform duration-300 ${
                    active ? 'scale-110' : ''
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-[11px] sm:text-xs mt-1 font-medium tracking-wide">
                  {label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Profile */}
        <Link href="/news-reader/profile">
          <div
            className={`flex flex-col items-center justify-center px-2 sm:px-3 py-1.5 rounded-xl transition-all duration-300 ${
              isActive('/news-reader/profile')
                ? 'bg-white/20 shadow-inner scale-105'
                : 'hover:bg-white/10 hover:scale-105'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full overflow-hidden bg-white/20 flex items-center justify-center ring-2 ring-white/30 transition-all duration-300 ${
                isActive('/news-reader/profile') ? 'ring-white/60 scale-110' : ''
              }`}
            >
              {!isLoading && profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src="/profile-image.png"
                  alt="Profile"
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-[11px] sm:text-xs mt-1 font-medium tracking-wide">
              Profile
            </span>
          </div>
        </Link>
      </nav>
    </header>
  );
}