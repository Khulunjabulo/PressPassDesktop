import Link from "next/link"
import NewsReaderHeader from "@/components/UI/NewsReaderHeader"
import { fetchNews } from "@/lib/fetchNews"

export default async function HomePage() {
  const articles = await fetchNews('top', 'us')

  return (
    <div>
      <NewsReaderHeader />
      <div className="py-8 text-center">
        <h2 className="text-4xl font-bold mb-8 bg">Home screen with Top stories</h2>
        <p className="text-muted-foreground mb-6">This page is for Headlines</p>
        <Link href="/">
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
              Source: {article.source_id} | {new Date(article.pubDate).toLocaleString()}
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
