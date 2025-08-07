import { fetchUploadedStories } from '@/lib/fetchUploadedStories';
import { fetchNews } from '@/lib/fetchNews';
import NewsGrid from '@/components/news-reader/NewsGrid';
import BannerAd from '@/components/news-reader/BannerAd';

export default async function PublicationPage({ params }) {
  const { publicationId } = params;

  const uploadedStories = await fetchUploadedStories('all');
  const allExternalNews = await fetchNews('top', 'us');

  
  const filteredUploadedStories = uploadedStories.filter(
    (story) => story.source_id?.toLowerCase() === publicationId.toLowerCase()
  );

  const filteredExternalNews = allExternalNews.filter(
    (news) => news.source_id?.toLowerCase() === publicationId.toLowerCase()
  );

  const filteredNews = [...filteredUploadedStories, ...filteredExternalNews];

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold mb-6 capitalize">{publicationId}</h1>

      <div className="mb-6">
        <BannerAd />
      </div>

      <NewsGrid articles={filteredNews} />
    </div>
  );
}
