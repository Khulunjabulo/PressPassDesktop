import axios from 'axios';

const API = 'https://newsdata.io/api/1/news';

export async function fetchNewsByCategory(category = 'top', country = 'us') {
  try {
    const { data } = await axios.get(API, {
      params: {
        apikey: process.env.NEXT_PUBLIC_NEWSDATA_API_KEY,
        country,
        category,
        language: 'en',
      },
    });
    return data.results || [];
  } catch (e) {
    console.error('Error fetching news by category:', e);
    return [];
  }
}

export async function searchNews(keyword = '', country = 'us') {
  if (!keyword) return [];
  try {
    const { data } = await axios.get(API, {
      params: {
        apikey: process.env.NEXT_PUBLIC_NEWSDATA_API_KEY,
        q: keyword,
        country,
        language: 'en',
      },
    });
    return data.results || [];
  } catch (e) {
    console.error('Error searching news:', e);
    return [];
  }
}
