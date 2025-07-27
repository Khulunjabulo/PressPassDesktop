'use client';

import { timeAgo } from '@/lib/time';
import NewsCard from '@/components/news-reader/NewsCard';
import AdSlot from '@/components/news-reader/AdsSlot';
import PublicationCard from '@/components/news-reader/PublicationCard';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';

function dedupeArticles(articles = []) {
  const seen = new Set();
  const out = [];
  for (const a of articles) {
    const key = a.link || a.title;
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

export default function NewsGrid({ articles }) {
  const unique = dedupeArticles(articles || []);

  return (
    <div className="relative">
      {/* Bottom-sheet overlay */}
      <RecommendedOverlayBottom articles={unique} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-6 pb-10">
        {/* MAIN COLUMN */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Top Headlines</h2>

          {/* 3 columns on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unique.map((article, index) => (
              <NewsCard
                key={index}
                imageUrl={article.image_url}
                logoText={(article.source_id || 'News').slice(0, 10)}
                logoBgColor="#008000"
                title={article.title || ''}
                description={article.description || ''}
                author={
                  Array.isArray(article.creator)
                    ? article.creator[0]
                    : article.creator || 'Unknown'
                }
                time={timeAgo(article.pubDate)}
              />
            ))}
          </div>

          {/* Publications */}
          {/* <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Publications</h2>
            <div className="space-y-3">
              <PublicationCard logoText="Isolezwe" logoBgColor="#008000" publicationName="Isolezwe" />
              <PublicationCard logoText="Briefly" logoBgColor="#000000" publicationName="Briefly" />
              <PublicationCard logoText="Sowetan" logoBgColor="#E31B23" publicationName="Sowetan" />
            </div>
          </section> */}
        </div>

        {/* RIGHT SIDEBAR (ads) */}
        <aside className="space-y-6 lg:sticky lg:top-20 h-fit">
          <AdSlot label="Ads here (300x250)" height={250} color="bg-blue-200" />
          <AdSlot label="Ads here (300x600)" height={600} color="bg-gray-200" />
          <AdSlot label="Ads here (300x250)" height={250} color="bg-blue-200" />
        </aside>
      </div>
    </div>
  );
}
