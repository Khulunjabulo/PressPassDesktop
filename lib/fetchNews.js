import axios from 'axios'

// Fetch uploaded stories from our API
async function fetchUploadedStories(category = 'all') {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'
      : 'http://localhost:3000'
    
    const url = `${baseUrl}/api/stories?status=published${category !== 'all' && category !== 'top' ? `&category=${category}` : ''}`
    console.log('Fetching uploaded stories from:', url)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error ${response.status}:`, errorText)
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Fetched uploaded stories:', data.stories?.length || 0, 'stories')
    return data.stories || []
  } catch (error) {
    console.error('Error fetching uploaded stories:', {
      message: error.message,
      stack: error.stack,
      category,
      url: `${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com' : 'http://localhost:3000'}/api/stories?status=published${category !== 'all' && category !== 'top' ? `&category=${category}` : ''}`
    })
    return []
  }
}

export async function fetchNews(category = 'top', country = 'us') {
  try {
    console.log('fetchNews called with:', { category, country })
    
    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_NEWSDATA_API_KEY) {
      console.warn('NEXT_PUBLIC_NEWSDATA_API_KEY not found, skipping external news')
    }

    // Fetch external news (only if API key is available)
    const externalNewsPromise = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY
      ? axios.get(
          `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_API_KEY}&country=${country}&category=${category}&language=en`
        )
      : Promise.resolve({ data: { results: [] } })

    // Fetch uploaded stories
    const uploadedStoriesPromise = fetchUploadedStories(category)

    // Wait for both requests
    const [externalResponse, uploadedStories] = await Promise.all([
      externalNewsPromise.catch(error => {
        console.error('Error fetching external news:', {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          message: error.message
        })
        return { data: { results: [] } }
      }),
      uploadedStoriesPromise
    ])

    const externalNews = externalResponse.data.results || []
    console.log('External news fetched:', externalNews.length, 'articles')
    console.log('Uploaded stories fetched:', uploadedStories.length, 'stories')
    
    // Combine and sort by publication date (newest first)
    const allNews = [...uploadedStories, ...externalNews]
    
    // Sort by publication date, handling different date formats
    allNews.sort((a, b) => {
      const dateA = new Date(a.pubDate || a.publishedAt || a.createdAt || 0)
      const dateB = new Date(b.pubDate || b.publishedAt || b.createdAt || 0)
      return dateB - dateA
    })

    console.log('Total news items returned:', allNews.length)
    return allNews
  } catch (error) {
    console.error('Error in fetchNews:', {
      message: error.message,
      stack: error.stack,
      response: error?.response?.data,
      category,
      country
    })
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
