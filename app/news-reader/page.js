import NewsReaderHeader from '@/components/news-reader/NewsReaderHeader';
import { fetchNews } from '@/lib/fetchNews';
import NewsGrid from '@/components/news-reader/NewsGrid';
import AdSlot from '@/components/news-reader/AdsSlot';

export default async function NewsReaderHome() {
  const articles = await fetchNews('top', 'us');

  return (
    <div>
      <NewsReaderHeader />

      {/* NEW: ad box directly under header */}
      <div className="px-6 mt-4">
        <AdSlot label="Ads here (100% x 120)" height={120} color="bg-gray-200" />
      </div>

      <div className="py-8 text-center">
        <h2 className="text-4xl font-bold mb-2">Home – Top Stories</h2>
        <p className="text-muted-foreground mb-6">This page is for Headlines</p>
      </div>

      <NewsGrid articles={articles} />
    </div>
  );
}
