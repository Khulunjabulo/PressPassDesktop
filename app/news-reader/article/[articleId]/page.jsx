'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Eye, Hash, User, Globe, Share2, Bookmark } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import NewsReaderHeader from '@/components/news-reader/NewsReaderHeader';

export default function ArticleViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const publisherId = searchParams.get('publisherId');
  
  const [article, setArticle] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticleAndPublisher();
  }, [params.articleId, publisherId]);

  useEffect(() => {
    if (article && article.imageUrl) {
      console.log('🔍 Article image debugging:', {
        imageUrl: article.imageUrl,
        isFirebaseUrl: article.imageUrl.includes('firebasestorage'),
        isBlobUrl: article.imageUrl.startsWith('blob:'),
        isDataUrl: article.imageUrl.startsWith('data:'),
        articleId: article.id,
        articleTitle: article.title
      });
      
      // Only test accessibility for non-blob URLs
      if (!article.imageUrl.startsWith('blob:')) {
        fetch(article.imageUrl)
          .then(response => {
            console.log('✅ Image URL is accessible:', response.status);
          })
          .catch(error => {
            console.error('❌ Image URL is NOT accessible:', error.message);
          });
      } else {
        console.log('⚠️ Skipping accessibility test for blob URL (temporary URL)');
      }
    }
  }, [article]);

  const fetchArticleAndPublisher = async () => {
    if (!params.articleId || !publisherId) {
      setError('Missing article ID or publisher ID');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching article:', params.articleId, 'from publisher:', publisherId);
      
      const response = await fetch(`/api/news-sources/${publisherId}/articles`);
      const data = await response.json();

      console.log('API Response:', data);

      if (data.success) {
        const foundArticle = data.articles.find(a => a.id === params.articleId);
        if (foundArticle) {
          console.log('Article found:', foundArticle);
          setArticle(foundArticle);
          setPublisher(data.publisher);
        } else {
          console.log('Article not found in articles list');
          setError('Article not found');
        }
      } else {
        console.log('API request failed:', data.error);
        setError(data.error || 'Failed to fetch article');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const debugImageData = () => {
  console.group('🖼️ IMAGE DEBUG DATA');
  console.log('Article ID:', article?.id);
  console.log('Raw image fields:', {
    imageUrl: article?.imageUrl,
    featuredImageUrl: article?.featuredImageUrl,
    image: article?.image,
    featured_image: article?.featured_image,
    featuredImage: article?.featuredImage
  });
  console.log('Image credit/caption:', {
    imageCredit: article?.imageCredit,
    imageCaption: article?.imageCaption
  });
  console.log('Determined main image:', mainImage);
  console.log('Content images found:', contentImages.length);
  console.groupEnd();
};

// Call this in useEffect
useEffect(() => {
  if (article) {
    debugImageData();
  }
}, [article]);

  const handleBackClick = () => {
    if (publisherId) {
      router.push(`/news-reader/publisher/${publisherId}`);
    } else {
      router.back();
    }
  };

  // Fixed date formatting with better error handling
  const formatDate = (timestamp) => {
    if (!timestamp) {
      console.log('No timestamp provided');
      return 'No date available';
    }
    
    try {
      let date;
      
      // Handle different timestamp formats
      if (timestamp && typeof timestamp === 'object') {
        // Handle Firestore Timestamp objects
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else if (timestamp.seconds && typeof timestamp.seconds === 'number') {
          // Handle plain Firestore timestamp objects
          date = new Date(timestamp.seconds * 1000);
        } else if (timestamp._seconds) {
          // Handle some Firestore timestamp variations
          date = new Date(timestamp._seconds * 1000);
        } else {
          // Try to create date from object
          date = new Date(timestamp);
        }
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        // Handle string or number timestamps
        date = new Date(timestamp);
      } else {
        console.log('Unknown timestamp format:', typeof timestamp, timestamp);
        return 'Invalid date format';
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid date created from timestamp:', timestamp);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, timestamp);
      return 'Date formatting error';
    }
  };

  // Get current date for newspaper header
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadTime = (readTime) => {
    if (!readTime || readTime === 0) return '5 min read';
    return `${readTime} min read`;
  };

  // Fixed function to create safe base64 encoded SVG placeholder
  const createSafePlaceholder = (width = 350, height = 250, text = 'Image Not Available') => {
    try {
      // Use only ASCII characters to avoid btoa() encoding issues
      const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="45%" font-family="Arial" font-size="16" fill="#6b7280" text-anchor="middle">📷</text><text x="50%" y="60%" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle">${text}</text></svg>`;
      
      // Use encodeURIComponent instead of btoa to handle any character safely
      return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    } catch (error) {
      console.error('Error creating placeholder:', error);
      // Fallback to a simple colored div approach
      return null;
    }
  };

  // Enhanced function to process article content with proper image handling
  const processArticleContent = (content) => {
    if (!content) {
      console.log('❌ No content provided');
      return '<p class="newspaper-paragraph">Content not available for this article.</p>';
    }
    
    console.log('🔍 Processing content type:', typeof content);
    console.log('🔍 Content preview:', content.substring(0, 200) + '...');
    
    // Handle content that might be a JSON string with embedded images
    try {
      // If content starts with array bracket, it might be JSON
      if (content.startsWith('[')) {
        console.log('📋 Detected JSON array content');
        const parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          console.log('✅ Successfully parsed JSON array with', parsedContent.length, 'items');
          return parsedContent.map((item, index) => {
            if (item.type === 'text') {
              // Break text into proper paragraphs and handle overflow
              const paragraphs = item.content.split(/\n\s*\n/).filter(p => p.trim());
              return paragraphs.map((paragraph, pIndex) => 
                `<p key="${index}-${pIndex}" class="newspaper-paragraph">${paragraph.trim()}</p>`
              ).join('');
            } else if (item.type === 'image') {
              console.log('🖼️ Found image in content:', item.src?.substring(0, 50) + '...');
              return `<div key="${index}" class="newspaper-image-container">
                        <img src="${item.src}" alt="${item.caption || 'Article image'}" class="newspaper-image" 
                             loading="lazy" 
                             onerror="this.parentElement.style.display='none';" />
                        ${item.caption ? `<div class="newspaper-image-caption">${item.caption}</div>` : ''}
                      </div>`;
            }
            return '';
          }).join('');
        }
      }
    } catch (e) {
      console.log('ℹ️ Content is not JSON, processing as regular text/HTML');
    }
    
    // Process regular HTML/text content with better paragraph handling
    let processedContent = content;
    
    // Handle line breaks and create proper paragraphs
    if (!content.includes('<p>') && !content.includes('<div>')) {
      // Split by double line breaks for paragraphs
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
      if (paragraphs.length > 1) {
        processedContent = paragraphs.map(paragraph => 
          `<p class="newspaper-paragraph">${paragraph.trim().replace(/\n/g, ' ')}</p>`
        ).join('');
      } else {
        // Single paragraph, handle single line breaks
        processedContent = `<p class="newspaper-paragraph">${content.replace(/\n/g, ' ').trim()}</p>`;
      }
    } else {
      // Already has HTML structure, clean it up
      processedContent = content
        .replace(/<div><br><\/div>/g, '</p><p class="newspaper-paragraph">')
        .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '</p><p class="newspaper-paragraph">')
        .replace(/<br\s*\/?>/g, ' ')
        .replace(/<div[^>]*>/g, '<p class="newspaper-paragraph">')
        .replace(/<\/div>/g, '</p>');
    }
    
    // Handle Firebase Storage URLs and other image sources - Enhanced regex
    processedContent = processedContent.replace(
      /<img([^>]*)src\s*=\s*["']([^"']+)["']([^>]*)>/gi, 
      (match, before, src, after) => {
        console.log('🖼️ Found image URL in content:', src.substring(0, 50) + '...');
        return `<div class="newspaper-image-container">
                  <img${before}src="${src}"${after} class="newspaper-image" loading="lazy" 
                       onerror="this.parentElement.style.display='none';" />
                </div>`;
      }
    );
    
    // Look for standalone URLs that might be images
    processedContent = processedContent.replace(
      /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg))(?:\s|$)/gi,
      (match, url) => {
        console.log('🖼️ Found standalone image URL:', url.substring(0, 50) + '...');
        return `<div class="newspaper-image-container">
                  <img src="${url.trim()}" alt="Article image" class="newspaper-image" loading="lazy" 
                       onerror="this.parentElement.style.display='none';" />
                </div>`;
      }
    );
    
    // Ensure we have at least one paragraph wrapper
    if (!processedContent.includes('<p')) {
      processedContent = `<p class="newspaper-paragraph">${processedContent}</p>`;
    }
    
    console.log('✅ Processed content length:', processedContent.length);
    return processedContent;
  };

  // Enhanced function to extract images from content - including all possible sources
  const extractImagesFromContent = (content) => {
    const images = [];
    if (!content) {
      console.log('❌ No content provided for image extraction');
      return images;
    }
    
    console.log('🔍 Extracting images from content...');
    
    try {
      if (content.startsWith('[')) {
        console.log('📋 Parsing JSON content for images');
        const parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          parsedContent.forEach((item, index) => {
            if (item.type === 'image' && item.src) {
              console.log('🖼️ Found image in JSON:', item.src?.substring(0, 50) + '...');
              images.push({
                src: item.src,
                caption: item.caption || '',
                index: index
              });
            }
          });
        }
      }
    } catch (e) {
      console.log('ℹ️ Not JSON content, looking for HTML img tags and URLs');
    }
    
    // Look for Firebase Storage URLs
    const firebaseMatches = content.match(/https?:\/\/firebasestorage\.googleapis\.com\/[^\s"'<>]+/g);
    if (firebaseMatches) {
      console.log('🔥 Found', firebaseMatches.length, 'Firebase Storage URLs');
      firebaseMatches.forEach((url, index) => {
        console.log('🔥 Firebase image URL:', url.substring(0, 50) + '...');
        images.push({
          src: url,
          caption: '',
          index: `firebase-${index}`
        });
      });
    }
    
    // Look for img tags in HTML content
    const imgMatches = content.match(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi);
    if (imgMatches) {
      console.log('🖼️ Found', imgMatches.length, 'img tags in HTML');
      imgMatches.forEach((match, index) => {
        const srcMatch = match.match(/src\s*=\s*["']([^"']+)["']/i);
        if (srcMatch) {
          console.log('🖼️ Extracted image URL:', srcMatch[1].substring(0, 50) + '...');
          images.push({
            src: srcMatch[1],
            caption: '',
            index: `html-${index}`
          });
        }
      });
    }
    
    // Look for standalone image URLs
    const urlMatches = content.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|svg)/gi);
    if (urlMatches) {
      console.log('🔗 Found', urlMatches.length, 'standalone image URLs');
      urlMatches.forEach((url, index) => {
        console.log('🔗 Standalone image URL:', url.substring(0, 50) + '...');
        images.push({
          src: url,
          caption: '',
          index: `url-${index}`
        });
      });
    }
    
    // Look for data:image URLs
    const dataImageMatches = content.match(/data:image\/[^"\s<>]+/g);
    if (dataImageMatches) {
      console.log('📊 Found', dataImageMatches.length, 'data:image URLs');
      dataImageMatches.forEach((url, index) => {
        console.log('📊 Data image URL found');
        images.push({
          src: url,
          caption: '',
          index: `data-${index}`
        });
      });
    }
    
    // Remove duplicates
    const uniqueImages = images.filter((image, index, self) => 
      index === self.findIndex(img => img.src === image.src)
    );
    
    console.log('✅ Extracted', uniqueImages.length, 'unique images from content');
    return uniqueImages;
  };

  // Enhanced function to validate and handle different image URL types
  const validateImageUrl = (url) => {
    if (!url) return null;
    
    // Handle blob URLs - they might be expired
    if (url.startsWith('blob:')) {
      console.log('⚠️ Warning: Blob URL detected, may be expired:', url.substring(0, 50) + '...');
      return url; // Still try to load it, but expect it might fail
    }
    
    // Handle data URLs
    if (url.startsWith('data:image/')) {
      console.log('✅ Data URL detected:', url.substring(0, 50) + '...');
      return url;
    }
    
    // Handle Firebase Storage URLs
    if (url.includes('firebasestorage.googleapis.com')) {
      console.log('🔥 Firebase Storage URL detected:', url.substring(0, 50) + '...');
      return url;
    }
    
    // Handle regular HTTP/HTTPS URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('🌐 HTTP URL detected:', url.substring(0, 50) + '...');
      return url;
    }
    
    // Handle relative URLs
    if (url.startsWith('/') || !url.includes('://')) {
      console.log('📁 Relative URL detected:', url.substring(0, 50) + '...');
      return url;
    }
    
    console.log('❓ Unknown URL format:', url.substring(0, 50) + '...');
    return url;
  };

  // Enhanced image error handler with blob URL specific handling
  const handleImageError = (e, fallbackText = 'Image Not Available') => {
  const failedUrl = e.target.src;
  console.error('❌ Image failed to load:', failedUrl?.substring(0, 50) + '...');
  
  // Log the specific error
  if (failedUrl && failedUrl.startsWith('blob:')) {
    console.log('⚠️ Blob URL expired or invalid');
  } else if (failedUrl && failedUrl.includes('firebasestorage')) {
    console.log('🔥 Firebase Storage URL failed - check permissions/existence');
  }
  
  // Create a simple placeholder
  const canvas = document.createElement('canvas');
  canvas.width = 350;
  canvas.height = 250;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, 350, 250);
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('📷', 175, 120);
  ctx.fillText(failbackText, 175, 140);
  
  e.target.src = canvas.toDataURL();
  e.target.alt = fallbackText;
  e.target.onerror = null; // Prevent infinite loops
};

// 5. DEBUG: Test your image URLs manually
const testImageUrl = async (url) => {
  if (!url) return console.log('❌ No URL provided');
  
  console.log('🧪 Testing image URL:', url.substring(0, 50) + '...');
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    console.log(response.ok ? '✅ URL is accessible' : '❌ URL returned error:', response.status);
  } catch (error) {
    console.error('❌ URL test failed:', error.message);
  }
  
  // Test if it loads as an image
  const img = new Image();
  img.onload = () => console.log('✅ Image loads successfully');
  img.onerror = () => console.log('❌ Image failed to load');
  img.src = url;
};

  // Banner Ad Component
  const BannerAd = () => (
    <div className="max-w-7xl mx-auto px-8 py-6">
      <img 
        src="/press-bannerAd.png" 
        alt="Mobile preview" 
        className="mb-6" 
        onError={(e) => {
          console.log('Banner ad failed to load');
          e.target.style.display = 'none';
        }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 w-24 mb-8"></div>
            <div className="h-12 bg-gray-200 w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 w-1/2 mb-8"></div>
            <div className="h-6 bg-gray-200 w-full mb-3"></div>
            <div className="h-6 bg-gray-200 w-full mb-3"></div>
            <div className="h-6 bg-gray-200 w-2/3 mb-3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    console.log('❌ Article error or not found:', { error, hasArticle: !!article });
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <button
            onClick={handleBackClick}
            className="text-sm text-gray-600 hover:text-black mb-8 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          
          <div className="border border-gray-300 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'This article may have been removed or moved.'}</p>
            <div className="mt-4 text-xs text-gray-500">
              Article ID: {params.articleId}<br/>
              Publisher ID: {publisherId}
            </div>
            <button 
              onClick={() => {
                setError(null);
                fetchArticleAndPublisher();
              }}
              className="mt-4 bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const contentImages = extractImagesFromContent(article.content);
  const processedContent = processArticleContent(article.content);

  // Debug logging for the article data
  console.log('📰 Article Data:', {
    id: article.id,
    title: article.title,
    hasContent: !!article.content,
    contentLength: article.content?.length,
    hasImageUrl: !!article.imageUrl,
    imageUrl: article.imageUrl?.substring(0, 50) + '...',
    hasPublisher: !!publisher,
    publisherName: publisher?.name,
    contentImages: contentImages.length,
    createdAt: article.createdAt,
    createdAtType: typeof article.createdAt
  });

  // Determine the main image to show - check all possible image fields and validate them
  const rawMainImage = article.imageUrl || 
                      article.featuredImageUrl || 
                      article.image || 
                      article.featured_image ||
                      article.featuredImage ||
                      contentImages[0]?.src;
  
  const mainImage = validateImageUrl(rawMainImage);
  
  console.log('🖼️ Main image determination:', {
    rawImageUrl: rawMainImage?.substring(0, 50) + '...',
    validatedImageUrl: mainImage?.substring(0, 50) + '...',
    contentImages: contentImages.length,
    imageType: rawMainImage?.startsWith('blob:') ? 'BLOB' : 
               rawMainImage?.startsWith('data:') ? 'DATA' :
               rawMainImage?.includes('firebasestorage') ? 'FIREBASE' : 'OTHER'
  });

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        .newspaper-container {
          font-family: 'Times New Roman', 'Times', serif;
          line-height: 1.6;
          color: #1a1a1a;
        }
        
        .newspaper-header {
          border-bottom: 4px solid #000;
          margin-bottom: 2rem;
        }
        
        .newspaper-title {
          font-family: 'Times New Roman', 'Times', serif;
          font-weight: bold;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        
        .newspaper-date-line {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 0.5rem 0;
          margin: 1rem 0;
          text-align: center;
        }
        
        .main-image-container {
          float: left;
          width: 350px;
          margin: 0 2rem 1.5rem 0;
          border: 3px solid #000;
          background: #fff;
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
          clear: left;
        }
        
        .main-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          display: block;
          border-bottom: 2px solid #000;
        }
        
        .main-image-caption {
          padding: 1rem;
          font-size: 0.85em;
          font-style: italic;
          color: #333;
          background: #f8f8f8;
          line-height: 1.5;
          font-family: 'Times New Roman', serif;
          border-top: 1px solid #ccc;
        }
        
        .hero-image-container {
          width: 100%;
          margin-bottom: 2rem;
          border: 3px solid #000;
          background: #fff;
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }
        
        .hero-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          display: block;
          border-bottom: 2px solid #000;
        }
        
        .hero-image-caption {
          padding: 1rem;
          font-size: 0.9em;
          font-style: italic;
          color: #333;
          background: #f8f8f8;
          line-height: 1.5;
          font-family: 'Times New Roman', serif;
          border-top: 1px solid #ccc;
          text-align: center;
        }
        
        .newspaper-content {
          text-align: justify;
          hyphens: auto;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }
        
        .newspaper-paragraph {
          margin-bottom: 1.2rem;
          text-indent: 1.5em;
          line-height: 1.7;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
          max-width: 100%;
        }
        
        .newspaper-paragraph:first-of-type {
          text-indent: 0;
          font-weight: 500;
          font-size: 1.1em;
          margin-bottom: 1.5rem;
        }
        
        .drop-cap {
          float: left;
          font-size: 4em;
          line-height: 0.8;
          padding-right: 0.1em;
          margin-top: 0.1em;
          margin-bottom: -0.1em;
          font-weight: bold;
          color: #000;
        }
        
        .newspaper-image-container {
          margin: 1.5rem auto;
          max-width: 100%;
          text-align: center;
          clear: both;
        }
        
        .newspaper-image {
          max-width: 100%;
          height: auto;
          border: 1px solid #333;
          display: block;
          margin: 0 auto;
        }
        
        .newspaper-image-caption {
          font-size: 0.85em;
          font-style: italic;
          color: #666;
          margin-top: 0.5rem;
          padding: 0.5rem;
          border-left: 3px solid #333;
          background: #f9f9f9;
          text-align: left;
          max-width: 100%;
        }
        
        .newspaper-sidebar {
          border: 2px solid #000;
          padding: 1rem;
          background: #fafafa;
          margin-bottom: 1.5rem;
        }
        
        .newspaper-sidebar h3 {
          border-bottom: 2px solid #000;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .article-content-wrapper {
          overflow: hidden;
        }
        
        .article-content-wrapper p,
        .article-content-wrapper div {
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
        }
        
        @media (max-width: 768px) {
          .main-image-container,
          .hero-image-container {
            float: none;
            width: 100%;
            margin: 0 0 2rem 0;
          }
          
          .main-image,
          .hero-image {
            height: 250px;
          }
          
          .newspaper-paragraph {
            text-indent: 0;
          }
          
          .drop-cap {
            font-size: 3em;
          }
        }
        
        @media (max-width: 480px) {
          .main-image,
          .hero-image {
            height: 200px;
          }
          
          .newspaper-title {
            font-size: 2.5rem !important;
          }
          
          .newspaper-paragraph {
            font-size: 0.95em;
            line-height: 1.6;
          }
          
          .main-image-container,
          .hero-image-container {
            width: 100%;
            margin: 0 0 1.5rem 0;
          }
        }

        .hero-image-caption,
.main-image-caption {
  padding: 1rem;
  font-size: 0.85em;
  font-style: italic;
  color: #333;
  background: #f8f8f8;
  line-height: 1.5;
  font-family: 'Times New Roman', serif;
  border-top: 1px solid #ccc;
}

.hero-image-caption {
  text-align: center;
}

.main-image-caption strong,
.hero-image-caption strong {
  font-style: normal;
  color: #1a1a1a;
  display: block;
  margin-bottom: 0.5em;
}
      `}</style>

      <div className="newspaper-container">
        {/* Newspaper Header */}
        <NewsReaderHeader/>
        <div className="newspaper-header">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBackClick}
                className="text-sm text-gray-600 hover:text-black flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to {publisher?.name || 'Articles'}
              </button>
              
              <div className="flex items-center space-x-3">
                <button 
                  className="p-2 text-gray-600 hover:text-black transition-colors"
                  title="Share article"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      if (navigator.share) {
                        navigator.share({
                          title: article.title,
                          url: window.location.href
                        }).catch(err => console.log('Share failed:', err));
                      } else {
                        navigator.clipboard.writeText(window.location.href)
                          .then(() => alert('Link copied to clipboard!'))
                          .catch(err => console.log('Copy failed:', err));
                      }
                    }
                  }}
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Publication Header */}
            <div className="text-center mb-6">
              <h1 className="newspaper-title text-6xl mb-2">
                {publisher?.name?.toUpperCase() || 'DAILY NEWS'}
              </h1>
              <div className="newspaper-date-line">
                <p className="text-sm font-medium">
                  {getCurrentDate()} • {publisher?.industry || 'News'} • TODAY'S EDITION
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-6xl mx-auto px-8 py-6">
          {/* Article Header */}
          <div className="mb-8">
            {/* Category Badge */}
            {article.category && (
              <div className="mb-4">
                <span className="inline-block bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest">
                  {article.category}
                </span>
              </div>
            )}

            {/* Main Headline */}
            <h1 className="newspaper-title text-5xl leading-tight mb-6 pb-4 border-b-4 border-black">
              {article.title}
            </h1>
            
            {/* Subtitle */}
            {article.subtitle && (
              <h2 className="text-xl italic text-gray-700 mb-4 font-medium">
                {article.subtitle}
              </h2>
            )}
            
            {/* Byline and Meta */}
            <div className="flex items-center justify-between mb-6 text-sm border-b-2 border-gray-400 pb-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="font-bold">
                    By {article.author || publisher?.name || 'Staff Writer'}
                    {article.authorTitle && ` • ${article.authorTitle}`}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatReadTime(article.readTime)}</span>
                </div>
              </div>
              
              {article.views && article.views > 0 && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              )}
            </div>
          </div>

          {/* Article Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Article Content */}
            <div className="lg:col-span-3">
              {/* Hero Image - Full width if important article */}
              {mainImage && article.priority === 'high' && (
                <div className="hero-image-container">
                  <img
                    src={mainImage}
                    alt={article.title}
                    className="hero-image"
                    loading="eager"
                    onLoad={() => {
                      const imageType = mainImage.startsWith('blob:') ? 'BLOB' : 
                                      mainImage.startsWith('data:') ? 'DATA' :
                                      mainImage.includes('firebasestorage') ? 'FIREBASE' : 'HTTP';
                      console.log(`✅ Hero image loaded successfully [${imageType}]:`, mainImage?.substring(0, 50) + '...');
                    }}
                    onError={(e) => {
                      const imageType = mainImage.startsWith('blob:') ? 'BLOB' : 
                                      mainImage.startsWith('data:') ? 'DATA' :
                                      mainImage.includes('firebasestorage') ? 'FIREBASE' : 'HTTP';
                      console.error(`❌ Hero image failed to load [${imageType}]:`, mainImage?.substring(0, 50) + '...');
                      
                      if (mainImage.startsWith('blob:')) {
                        handleImageError(e, 'Hero Image Expired (Blob URL)');
                      } else {
                        handleImageError(e, 'Hero Image Not Available');
                      }
                    }}
                  />
                  // For Hero Image Caption:
// ACTUAL Implementation - Main Image Caption (the one being used in your code):
<div className="main-image-caption">
  {/* Only show caption if it exists and is different from title */}
  {article.imageCaption && article.imageCaption !== article.title && (
    <div className="mb-1">
      <strong>{article.imageCaption}</strong>
    </div>
  )}
  
  {/* Photo credit */}
  {article.imageCredit && (
    <span className="block text-sm mt-1 text-gray-500">
      📷 Photo by: {article.imageCredit}
    </span>
  )}
  
  {/* Temporary image warning */}
  {mainImage && mainImage.startsWith('blob:') && (
    <div className="text-xs text-orange-600 mt-1 italic">
      ⚠️ Temporary image URL - may expire on page reload
    </div>
  )}
</div>

// Hero Image Caption (if you're using this elsewhere):
<div className="hero-image-caption">
  {/* Only show caption if it exists */}
  {article.imageCaption && (
    <div className="mb-1">
      <strong>{article.imageCaption}</strong>
    </div>
  )}
  
  {/* Photo credit */}
  {article.imageCredit && (
    <div className="text-sm mt-1 text-gray-600 font-normal">
      📷 Photo by: {article.imageCredit}
    </div>
  )}
  
  {/* Temporary image warning */}
  {mainImage && mainImage.startsWith('blob:') && (
    <div className="text-xs text-orange-600 mt-2 italic">
      ⚠️ Temporary image URL - may expire on page reload
    </div>
  )}
</div>
                </div>
              )}

              {/* Article Body with Image Float */}
              <div className="article-content-wrapper">
                {/* Main Image - Positioned at top left for regular articles */}
                {mainImage && article.priority !== 'high' && (
                  <div className="main-image-container">
                    <img
                      src={mainImage}
                      alt={article.title}
                      className="main-image"
                      loading="eager"
                      onLoad={() => {
                        const imageType = mainImage.startsWith('blob:') ? 'BLOB' : 
                                        mainImage.startsWith('data:') ? 'DATA' :
                                        mainImage.includes('firebasestorage') ? 'FIREBASE' : 'HTTP';
                        console.log(`✅ Main image loaded successfully [${imageType}]:`, mainImage?.substring(0, 50) + '...');
                      }}
                      onError={(e) => {
                        const imageType = mainImage.startsWith('blob:') ? 'BLOB' : 
                                        mainImage.startsWith('data:') ? 'DATA' :
                                        mainImage.includes('firebasestorage') ? 'FIREBASE' : 'HTTP';
                        console.error(`❌ Main image failed to load [${imageType}]:`, mainImage?.substring(0, 50) + '...');
                        
                        if (mainImage.startsWith('blob:')) {
                          handleImageError(e, 'Image Expired (Blob URL)');
                        } else {
                          handleImageError(e, 'Main Image Not Available');
                        }
                      }}
                    />
                    <div className="main-image-caption">
                      <strong>{article.imageCaption || article.title}</strong>
                      {article.imageCredit && (
                        <span className="block text-sm mt-1 text-gray-500">
                          Photo: {article.imageCredit}
                        </span>
                      )}
                      {mainImage && mainImage.startsWith('blob:') && (
                        <div className="text-xs text-orange-600 mt-1 italic">
                          ⚠️ Temporary image URL - may expire on page reload
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Image Placeholder for Debug */}
                {!mainImage && process.env.NODE_ENV === 'development' && (
                  <div className="main-image-container">
                    <div className="main-image bg-gray-200 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📷</div>
                        <div className="text-sm">No Image Available</div>
                      </div>
                    </div>
                    <div className="main-image-caption">
                      <em>No featured image found for this article</em>
                    </div>
                  </div>
                )}

                {/* Summary/Lead with drop cap */}
                {article.summary && (
                  <div className="mb-6 p-4 border-l-4 border-black bg-gray-50 clear-both">
                    <p className="text-lg font-medium leading-relaxed italic">
                      <span className="drop-cap">{article.summary.charAt(0)}</span>
                      {article.summary.substring(1)}
                    </p>
                  </div>
                )}

                {/* Article Body - Fixed overflow and paragraph handling */}
                <div className="newspaper-content">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: processedContent
                    }}
                  />
                </div>
                
                {/* Additional content images (excluding the main one) */}
                {contentImages.slice(mainImage ? 1 : 0).map((img, index) => (
                  <div key={`content-image-${index}`} className="newspaper-image-container">
                    <img
                      src={img.src}
                      alt={img.caption || `Article image ${index + 1}`}
                      className="newspaper-image"
                      loading="lazy"
                      onError={(e) => handleImageError(e, `Image ${index + 1} Not Available`)}
                    />
                    {img.caption && (
                      <div className="newspaper-image-caption">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="clear-both"></div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Related Stories */}
              {article.relatedStories && article.relatedStories.length > 0 && (
                <div className="newspaper-sidebar">
                  <h3>Related Stories</h3>
                  <div className="space-y-4 text-sm">
                    {article.relatedStories.slice(0, 3).map((story, index) => (
                      <div key={index}>
                        <h4 className="font-bold mb-1 text-black">{story.title}</h4>
                        <p className="text-gray-700 leading-relaxed">{story.description || story.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Publication Info */}
              {publisher && (
                <div className="newspaper-sidebar">
                  <h3>About {publisher.name}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      {publisher.logo ? (
                        <img
                          src={publisher.logo}
                          alt={`${publisher.name} logo`}
                          className="w-12 h-12 object-cover border-2 border-black"
                          onError={(e) => {
                            console.log('Publisher logo failed to load:', publisher.logo);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-xl font-bold border-2 border-black" 
                           style={{display: publisher.logo ? 'none' : 'flex'}}>
                        {publisher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-black block">{publisher.name}</span>
                        <span className="text-gray-600 text-xs uppercase">{publisher.industry || 'Publishing'}</span>
                      </div>
                    </div>
                    {publisher.description && (
                      <p className="text-gray-700 text-xs leading-relaxed">{publisher.description}</p>
                    )}
                    {publisher.website && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <a href={publisher.website} target="_blank" rel="noopener noreferrer" 
                           className="text-xs hover:text-black transition-colors break-all">
                          {publisher.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="newspaper-sidebar">
                  <h3>Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Banner Ad */}
          <div className="max-w-7xl mx-auto h-28 bg-[#3ba6e7] flex items-center justify-between px-8 rounded-md shadow-md mt-4">
              <div className="flex flex-col items-center mt-5">
                  <img src="/Presspass.png" alt="PressPass Logo" height={200} width={180} className="object-contain" /> 
              </div>
            <div className="flex flex-col justify-center items-center space-y-2 text-center mx-auto">
              <h3 className="text-yellow-400 font-bold text-lg">Advertise Here</h3>
              <p className="text-white text-sm flex flex-col items-center space-y-1">
                <span>Partners@presspass.africa</span>
              </p>
              <p className="text-white text-sm flex flex-col items-center space-y-1">
                <span>Phone: +27 87 XXX XXX</span>
              </p>
            </div>
          </div>


          {/* Article Footer */}
          <div className="mt-12 pt-6 border-t-4 border-black">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-bold">Published: {formatDate(article.createdAt)}</p>
                {article.updatedAt && article.updatedAt !== article.createdAt && (
                  <p className="text-gray-600 mt-1">Last updated: {formatDate(article.updatedAt)}</p>
                )}
              </div>
              
              <button
                onClick={handleBackClick}
                className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Back to {publisher?.name || 'Articles'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}