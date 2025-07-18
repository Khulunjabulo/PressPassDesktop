"use client";

import Link from "next/link";

export function NewsReaderNavbar() {
  const categories = [
    "business",
    "entertainment",
    "opinion",
    "sports",
    "others",
  ];

  return (
    <nav className="bg-secondary text-secondary-foreground py-3 px-6 shadow-md">
      <div className="container mx-auto flex flex-wrap justify-center gap-4">
        <Link href="/news-reader" passHref>
          <button variant="ghost" className="text-secondary-foreground hover:bg-secondary/80">
            Home
          </button>
        </Link>

        {categories.map((category) => (
          <Link key={category} href={`/news-reader/${category}`} passHref>
            <button
              variant="ghost"
              className="text-secondary-foreground hover:bg-secondary/80 capitalize"
            >
              {category}
            </button>
          </Link>
        ))}

        <Link href="/news-reader/search" passHref>
          <button variant="ghost" className="text-secondary-foreground hover:bg-secondary/80">
            Search
          </button>
        </Link>
      </div>
    </nav>
  );
}
