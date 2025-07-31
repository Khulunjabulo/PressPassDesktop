import Link from "next/link";
import { fetchNews } from "@/lib/fetchNews";
import NewsReaderHeader from "@/components/news-reader/NewsReaderHeader";

export default async function CategoryPage({ params }) {
  const { category } = params;
  const articles = await fetchNews(category);

  return (
    <div>
      <NewsReaderHeader />
      <div className="py-8 text-center">
        <h2 className="text-4xl font-bold mb-8 capitalize">{category} News</h2>
        <p className="text-muted-foreground mb-6">
          Displaying articles for the "{category}" category.
        </p>
        <Link href="/news-reader">
          <button variant="outline">Back to News Home</button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-10">
        {articles.map((article, index) => {
          const isUploadedStory = article.source_id === 'presspass';
          const readMoreLink = isUploadedStory && article.pdfUrl ? article.pdfUrl : article.link;
          const publishDate = article.pubDate || article.publishedAt || article.createdAt;
          
          return (
            <div
              key={index}
              className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition"
            >
              {/* Add indicator for uploaded stories */}
              {isUploadedStory && (
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    📰 Press Pass Story
                  </span>
                </div>
              )}
              
              <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <p className="text-sm text-gray-700 mb-2">{article.description}</p>
              <p className="text-xs text-gray-500 mb-2">
                Source: {article.source_id} |{" "}
                {publishDate ? new Date(publishDate).toLocaleString() : 'Unknown date'}
              </p>
              {readMoreLink ? (
                <a
                  href={readMoreLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {isUploadedStory && article.pdfUrl ? 'View PDF →' : 'Read More →'}
                </a>
              ) : (
                <span className="text-gray-400 text-sm">No link available</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
