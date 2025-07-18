import HomePage from '@/components/news-reader/HomePage';
import BusinessPage from '@/components/news-reader/BusinessPage';
import EntertainmentPage from '@/components/news-reader/EntertainmentPage';
import OpinionPage from '@/components/news-reader/OpinionPage';
import ReadMore from '@/components/news-reader/ReadMore';


export const newsReaderPages = {
  home: {
    title: 'Home',
    component: <HomePage />
  },
  business: {
    title: 'Business',
    component: <BusinessPage />
  },
  entertainment: {
    title: 'Entertainment',
    component: <EntertainmentPage />
  },
  opinion: {
    title: 'Opinion',
    component: <OpinionPage />
  },
  'read-more-1': {
    title: 'Read More 1',
    component: <ReadMore />
  },
  // Add the rest of pages here
};
