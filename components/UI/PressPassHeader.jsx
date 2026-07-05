"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, DollarSign, Wallet, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function PressPassHeader() {
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("presspass-theme");
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("presspass-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const navItems = [
    { href: "/print-media/overview", icon: Home, label: "Home" },
    { href: "/print-media/publisher", icon: Newspaper, label: "Publisher" },
    { href: "/print-media/monetization", icon: DollarSign, label: "Monetization" },
    { href: "/print-media/wallet", icon: Wallet, label: "Wallet" },
  ];

  return (
    <header className="bg-[#329ae1] px-4 py-3 flex items-center justify-between shadow-md relative z-50">
      {/* Logo + Company Name */}
      <Link href="/print-media" className="flex items-center space-x-3 group">
        <div className="w-[100px] h-[100px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <Image
            src="/Presspass.png"
            alt="News Icon"
            className="w-12 h-12 drop-shadow-sm"
            width={100}
            height={100}
          />
        </div>
      </Link>

      {/* Center Nav */}
      <nav className="flex items-center space-x-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-col items-center px-5 py-2 rounded-xl
                transition-all duration-300 ease-out
                group
                ${isActive
                  ? "text-white bg-white/20 shadow-inner"
                  : "text-white/90 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <Icon
                size={20}
                className={`
                  transition-transform duration-300
                  ${isActive ? "scale-110" : "group-hover:scale-110"}
                `}
              />
              <span className="text-sm font-medium mt-1 tracking-wide">
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Right side: Theme toggle */}
      <div className="flex items-center">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="
            relative flex items-center justify-center
            w-10 h-10 rounded-full
            bg-white/15 hover:bg-white/25
            text-white
            transition-all duration-300 ease-out
            hover:shadow-lg hover:scale-105
            active:scale-95
            focus:outline-none focus:ring-2 focus:ring-white/40
          "
        >
          <span
            className={`
              absolute transition-all duration-500 ease-in-out
              ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}
            `}
          >
            <Moon size={18} />
          </span>
          <span
            className={`
              absolute transition-all duration-500 ease-in-out
              ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}
            `}
          >
            <Sun size={18} />
          </span>
        </button>
      </div>
    </header>
  );
}