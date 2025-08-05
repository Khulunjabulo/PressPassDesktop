import { fetchNews } from "@/lib/fetchNews";
import NewsGrid from "@/components/news-reader/NewsGrid";
import BannerAd from "@/components/news-reader/BannerAd";

export default async function NewsReaderHome() {
  const articles = await fetchNews("top", "us");

  return (
    <div>
      {/* Top Banner Ad */}
      <div className="px-6 mt-4">
        <BannerAd />
      </div>

      <div className="py-8 text-left m-5">
        <h2 className="text-xl font-bold">Top Headlines</h2>
      </div>

      <NewsGrid articles={articles} />
    </div>
  );
}
