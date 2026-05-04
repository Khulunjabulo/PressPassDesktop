'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/Firebase/firebase';
import { getUserRole } from '@/Firebase/auth';
import { useRouter } from 'next/navigation';
import { Newspaper, LogOut, UserPlus, LogIn, Menu } from 'lucide-react';

export default function MainHeader() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const fetchedRole = await getUserRole(currentUser.uid);
        setRole(fetchedRole);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    router.push('/');
  };

  // FIX 2: Always route to /print-media — no signin/signup redirect logic
  const handlePrintMediaClick = (e) => {
    e.preventDefault();
    router.push('/print-media');
  };

  return (
    <header className="bg-[#329ae1] px-3 sm:px-6 py-2 shadow-md h-16 md:h-32 fixed md:relative top-0 left-0 right-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">

        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/Presspass.png"
              alt="Press Pass logo"
              width={80}
              height={32}
              className="w-auto h-12 md:h-24"
              priority
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-3 md:gap-4 text-white">
          <button
            onClick={handlePrintMediaClick}
            className="hover:bg-white/10 px-2 py-1 rounded text-sm flex items-center gap-1 transition-colors"
          >
            <Newspaper size={18} />
            <span className="font-medium">Print Media</span>
          </button>

          {user ? (
            <button
              onClick={handleLogout}
              className="hover:bg-white/10 px-2 py-1 rounded text-sm flex items-center gap-1 transition-colors"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Logout</span>
            </button>
          ) : (
            <>
              <Link
                href="/signup?role=reader"
                className="hover:bg-white/10 px-2 py-1 rounded flex items-center gap-1 transition-colors"
              >
                <UserPlus size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Sign Up</span>
              </Link>

              <Link
                href="/signin"
                className="hover:bg-white/10 px-2 py-1 rounded flex items-center gap-1 transition-colors bg-white/10"
              >
                <LogIn size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Login</span>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-2">
            <Menu size={24} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push('/print-media');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Newspaper className="w-4 h-4 mr-2" />
                  Print Media
                </button>

                {user ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link href="/signup?role=reader">
                      <div className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up
                      </div>
                    </Link>
                    <Link href="/signin">
                      <div className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}