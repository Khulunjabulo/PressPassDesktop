"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, Search, Star, FileText, User } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from '@/Firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function NewsReaderHeader() {
  const [profilePicture, setProfilePicture] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

        {/* Profile Image/Icon */}
        <Link href="/news-reader/profile">
          <div className="flex flex-col items-center hover:text-gray-200 transition">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
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
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-xs mt-1">Profile</span>
          </div>
        </Link>
      </nav>
    </header>
  );
}