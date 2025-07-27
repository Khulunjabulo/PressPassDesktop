'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');

  useEffect(() => {
    setQ(sp.get('q') || '');
  }, [sp]);

  function onSubmit(e) {
    e.preventDefault();
    const keyword = q.trim();
    router.push(`/news-reader/search${keyword ? `?q=${encodeURIComponent(keyword)}` : ''}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl mx-auto flex gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search headlines…"
        className="flex-1 border rounded-md px-3 py-2"
      />
      <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">
        Search
      </button>
    </form>
  );
}
