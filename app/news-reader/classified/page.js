import Link from "next/link"
import NewsGrid from '@/components/news-reader/NewsGrid';
import SearchForm from '@/components/news-reader/SearchForm';
import { searchNews } from '@/lib/fetchNews';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim().toLowerCase();
  
  const articles = await searchNews(q, 'us');
  
  const filteredArticles = articles.filter((article) =>
    article?.source_id?.toLowerCase().includes(q) ||
    article?.title?.toLowerCase().includes(q) ||
    article?.description?.toLowerCase().includes(q)
  );

  return (
    <div>
      <Link href="/">
        <button variant="outline">Back to News Home</button>
      </Link>
      <div className="py-8 text-center space-y-4">
        <h2 className="text-4xl font-bold">Search</h2>
        <p className="text-muted-foreground text-gray-400">
          {q ? (
            <>Results for: <span className="text-gray-400">{q}</span></>
          ) : (
            <span className='text-gray-500'>Type something to search headlines or publication</span>
          )}
        </p>
        <SearchForm />
      </div>

      {filteredArticles?.length ? (
        <NewsGrid articles={filteredArticles} />
      ) : (
        <div className="text-center py-16 text-sm">
          {q ? (
            'No results found.'
          ) : (
            <div>
              <h2 className='text-4xl font-bold'>FIND YOUR LOCAL COMMUNITY NEWSPAPER,</h2>
              <h2 className='text-4xl font-bold'>MAGAZINE AND PUBLICATIONS.</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

