import NewsReaderHeader from '@/components/news-reader/NewsReaderHeader';
import NewsGrid from '@/components/news-reader/NewsGrid';
import SearchForm from '@/components/news-reader/SearchForm';
import { searchNews } from '@/lib/fetchNews';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const articles = await searchNews(q, 'us');

  return (
    <div>
      <NewsReaderHeader />

      <div className="py-8 text-center space-y-4">
        <h2 className="text-4xl font-bold">Search</h2>
        <p className="text-muted-foreground">
          {q ? (
            <>Results for: <span className="font-semibold">{q}</span></>
          ) : (
            'Type something to search headlines'
          )}
        </p>
        <SearchForm />
      </div>

      {articles?.length ? (
        <NewsGrid articles={articles} />
      ) : (
        <div className="text-center py-16 text-sm text-gray-500">
          {q ? 'No results found.' : 'Start by entering a keyword.'}
        </div>
      )}
    </div>
  );
}
