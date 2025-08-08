import axios from 'axios';

const newsCache = {};

// Fetch uploaded stories from API
async function fetchUploadedStories(category = 'all', publicationId = '') {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
        : 'http://localhost:3000';

    let url = `${baseUrl}/api/stories?status=published`;
    if (publicationId) {
      url += `&publication=${publicationId}`;
    } else if (category !== 'all' && category !== 'top') {
      url += `&category=${category}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error fetching uploaded stories: ${res.status}`);
    const data = await res.json();
    return data.stories || [];
  } catch (err) {
    console.error('Error fetching uploaded stories:', err.message);
    return [];
  }
}

async function fetchExternalNews({ category = 'top', country = 'us', query = '' }) {
  const cacheKey = `ext-${category}-${country}-${query || 'noquery'}`;
  const now = Date.now();

  // Check cache
  if (newsCache[cacheKey] && now - newsCache[cacheKey].timestamp < 15 * 60 * 1000) {
    return newsCache[cacheKey].data;
  }

  if (!process.env.NEXT_PUBLIC_NEWSDATA_API_KEY) return [];

  try {
    const params = {
      apikey: process.env.NEXT_PUBLIC_NEWSDATA_API_KEY,
      country,
      language: 'en',
    };
    if (query) params.q = query;
    else params.category = category;

    const { data } = await axios.get('https://newsdata.io/api/1/news', { params });
    const results = data.results || [];

    newsCache[cacheKey] = { data: results, timestamp: now };
    return results;
  } catch (err) {
    console.error('Error fetching external news:', {
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      message: err.message,
    });
    return [];
  }
}

// Home & category pages
export async function fetchNews(category = 'top', country = 'us') {
  const [uploadedStories, externalNews] = await Promise.all([
    fetchUploadedStories(category),
    fetchExternalNews({ category, country }),
  ]);

  return mergeAndSort(uploadedStories, externalNews);
}

// Dynamic publication page
export async function fetchNewsByPublication(publicationId, country = 'us') {
  const [uploadedStories, externalNews] = await Promise.all([
    fetchUploadedStories('all', publicationId),
    fetchExternalNews({ category: 'top', country }),
  ]);

  return mergeAndSort(uploadedStories, externalNews);
}

// Search page
export async function searchNews(query, country = 'us') {
  if (!query) return [];
  const [uploadedStories, externalNews] = await Promise.all([
    fetchUploadedStories('all'),
    fetchExternalNews({ query, country }),
  ]);

  const filteredUploaded = uploadedStories.filter((story) =>
    story.title?.toLowerCase().includes(query.toLowerCase()) ||
    story.content?.toLowerCase().includes(query.toLowerCase())
  );

  return mergeAndSort(filteredUploaded, externalNews);
}

// Helper: merge and sort stories
function mergeAndSort(uploadedStories, externalNews) {
  const allNews = [...uploadedStories, ...externalNews];
  return allNews.sort((a, b) => {
    const dateA = new Date(a.pubDate || a.publishedAt || a.createdAt || 0);
    const dateB = new Date(b.pubDate || b.publishedAt || b.createdAt || 0);
    return dateB - dateA;
  });
}
