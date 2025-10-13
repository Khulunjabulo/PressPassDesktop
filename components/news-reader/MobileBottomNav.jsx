'use client';

import Link from 'next/link';
import { Home, Search, Star, FileText } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/news-reader', icon: Home, label: 'Home' },
  { href: '/news-reader/search', icon: Search, label: 'Search' },
  { href: '/news-reader/favorites', icon: Star, label: 'Favorite' },
  { href: '/news-reader/classified', icon: FileText, label: 'Classified' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#329ae1] border-t border-white/20 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href}>
              <div
                className={`flex flex-col items-center justify-center w-20 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-xs mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}