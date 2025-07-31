import axios from 'axios'

// Fetch uploaded stories from our API
async function fetchUploadedStories(category = 'all') {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
      : 'http://localhost:3000'
    
    const url = `${baseUrl}/api/stories?status=published${category !== 'all' && category !== 'top' ? `&category=${category}` : ''}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.stories || []
  } catch (error) {
    console.error('Error fetching uploaded stories:', error)
    return []
  }
}

export async function fetchNews(category = 'top', country = 'us') {
  try {
    // Fetch external news
    const externalNewsPromise = axios.get(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_API_KEY}&country=${country}&category=${category}&language=en`
    )

    // Fetch uploaded stories
    const uploadedStoriesPromise = fetchUploadedStories(category)

    // Wait for both requests
    const [externalResponse, uploadedStories] = await Promise.all([
      externalNewsPromise.catch(error => {
        console.error('Error fetching external news:', error?.response?.data || error.message || error)
        return { data: { results: [] } }
      }),
      uploadedStoriesPromise
    ])

    const externalNews = externalResponse.data.results || []
    
    // Combine and sort by publication date (newest first)
    const allNews = [...uploadedStories, ...externalNews]
    
    // Sort by publication date, handling different date formats
    allNews.sort((a, b) => {
      const dateA = new Date(a.pubDate || a.publishedAt || a.createdAt || 0)
      const dateB = new Date(b.pubDate || b.publishedAt || b.createdAt || 0)
      return dateB - dateA
    })

    return allNews
  } catch (error) {
    console.error('Error fetching news:', error?.response?.data || error.message || error)
    return []
  }
}

export async function searchNews(query = '', country = 'us') {
  if (!query) return []
  try {
    const response = await axios.get(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_API_KEY}&q=${encodeURIComponent(query)}&country=${country}&language=en`
    )
    return response.data.results || []
  } catch (error) {
    console.error('Error searching news:', error?.response?.data || error.message || error)
    return []
  }
}
