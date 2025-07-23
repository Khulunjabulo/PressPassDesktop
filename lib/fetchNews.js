import axios from 'axios'

export async function fetchNews(category = 'top', country = 'us') {
  try {
    const response = await axios.get(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_API_KEY}&country=${country}&category=${category}&language=en`
    )
    return response.data.results || []
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}
