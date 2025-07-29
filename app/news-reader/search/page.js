import NewsGrid from '@/components/news-reader/NewsGrid';
import SearchForm from '@/components/news-reader/SearchForm';
import { searchNews } from '@/lib/fetchNews';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const articles = await searchNews(q, 'us');

  return (
    <div>
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

      {articles?.length ? (
        <NewsGrid articles={articles} />
      ) : (
        <div className="text-center py-16 text-sm">
          {q ? 'No results found.' :<div><h2 className='text-4xl font-bold'>FIND YOUR LOCAL COMMUNITY NEWSPAPER,</h2><h2 className='text-4xl font-bold'>MAGAZINE AND PUBLICATIONS.</h2></div>}
        </div>
      )}
    </div>
  );
}
