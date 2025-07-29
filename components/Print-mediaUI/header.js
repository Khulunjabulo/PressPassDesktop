'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/Firebase/firebase';
import { getUserRole } from '@/Firebase/auth';
import { useRouter } from 'next/navigation';

export default function PrintMediaHeader() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
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
    router.push('/print-media'); 
  };

  const handleNewsReaderClick = (e) => {
    e.preventDefault();
    if (user && role !== 'print-media') {
      alert('You are not a print media');
    } else {
      router.push('/');
    }
  };

  return (
    <header className="bg-[#329ae1] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image  
              src="/Presspass.png"
              alt="Press Pass logo"
              width={110}
              height={25}
              priority
            />
          </Link>
        </div>

        <nav className="flex items-center gap-4 text-white">
          {/* Always show News Reader */}
          <button onClick={handleNewsReaderClick} className="hover:underline text-sm">
            News Reader
          </button>

          {user ? (
            <button onClick={handleLogout} className="hover:underline text-sm">
              Logout
            </button>
          ) : (
            <>
              <Link href="/signup" className="hover:underline">Sign Up</Link>
              <Link href="/signin" className="hover:underline">Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
