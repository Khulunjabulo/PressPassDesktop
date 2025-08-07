import axios from 'axios';


export async function fetchUploadedStories(publicationId = '') {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_SITE_URL || 'https://your-production-url.com'
        : 'http://localhost:3000';

    const url = `${baseUrl}/api/stories?publication=${publicationId}`;
    const response = await axios.get(url);

    return response.data.stories || [];
  } catch (error) {
    console.error('Error fetching uploaded stories:', error.message);
    return [];
  }
}
