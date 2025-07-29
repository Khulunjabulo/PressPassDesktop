import { fetchNews } from '@/lib/fetchNews';
import NewsGrid from '@/components/news-reader/NewsGrid';
import AdSlot from '@/components/news-reader/AdsSlot';

export default async function NewsReaderHome() {
  const articles = await fetchNews('top', 'us');

  return (
    <div>
      <div className="px-6 mt-4">
        <AdSlot label="Ads here (100% x 120)" height={120} color="bg-gray-200" />
      </div>

      <div className="py-8 text-left m-5">
        <h2 className="text-xl font-bold">Top Headlines</h2>
      </div>

      <NewsGrid articles={articles} />
    </div>
  );
}
