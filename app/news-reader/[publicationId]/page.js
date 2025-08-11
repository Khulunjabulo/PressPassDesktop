import { fetchNews } from '@/lib/fetchNews';

export default async function PublicationPage({ params }) {
  const { publicationId } = params;

  const allNews = await fetchNews();

  console.log("Publication ID from URL:", publicationId);
  console.log("All source IDs for debugging:", allNews.map(s => s.source_id));

  const filteredNews = allNews.filter((story) => {
    const sourceId = (story?.source_id || '').toLowerCase();
    return sourceId === publicationId.toLowerCase();
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 capitalize">{publicationId}</h1>

      {filteredNews.length === 0 ? (
        <p className="text-muted-foreground">No stories found for this publication.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.map((article, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-md flex flex-col"
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold mb-2">{article.title}</h2>
                <p className="text-sm text-gray-700 flex-grow line-clamp-3">
                  {article.description || article.content || 'No description available.'}
                </p>
                <div className="mt-4 flex justify-between items-end">
                  <p className="text-xs text-muted-foreground">
                    {new Date(article.pubDate).toLocaleDateString()}
                  </p>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Read more
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
