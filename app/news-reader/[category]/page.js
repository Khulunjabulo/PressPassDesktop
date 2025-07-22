import Link from "next/link"
import { fetchNews } from "@/lib/fetchNews"
import NewsReaderHeader from "@/components/UI/NewsReaderHeader"

export default async function CategoryPage({ params }) {
  const { category } = params
  const articles = await fetchNews(category)

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
        {articles.map((article, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition"
          >
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
              {new Date(article.pubDate).toLocaleString()}
            </p>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              Read More →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
