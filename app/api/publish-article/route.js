// app/api/publish-article/route.js
import { NextResponse } from 'next/server';
const { getFirestoreDb } = require('../../../lib/firebase-admin'); // Use admin SDK like favorites
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/Firebase/firebase';
import { headers } from 'next/headers';

const storage = getStorage(app);

function logApiCall(method, info) {
  console.log(`================ API DEBUG: /api/publish-article [${method}] ================`);
  console.log('Info:', JSON.stringify(info, null, 2));
  console.log('===============================================================');
}

function validateUserId(userId) {
  if (!userId) {
    return { valid: false, error: 'Publisher ID is required' };
  }
  if (typeof userId !== 'string') {
    return { valid: false, error: 'Publisher ID must be a string' };
  }
  if (userId.trim() === '') {
    return { valid: false, error: 'Publisher ID cannot be empty' };
  }
  if (userId.includes('/')) {
    return { valid: false, error: 'Publisher ID cannot contain forward slashes' };
  }
  return { valid: true };
}

export async function POST(request) {
  console.log('🚀 API Route: publish-article called');
  
  try {
    // Log request details
    console.log('📝 Request method:', request.method);
    console.log('📝 Request URL:', request.url);
    
    // Get authorization from headers
    console.log('🔐 Getting authorization header...');
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    console.log('🔐 Auth header exists:', !!authHeader);
    console.log('🔐 Auth header preview:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');

    // Extract user ID from auth header or use mock for testing
    let currentUserId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      console.log('🔐 Token extracted, length:', token?.length || 0);
      
      // For testing - extract user ID from token or create mock
      // In production, verify the token and extract user ID
      if (token && token !== 'null' && token !== 'undefined') {
        // Mock user ID extraction - replace with real token verification
        currentUserId = `publisher_${Date.now()}`;
        console.log('🔐 Mock user ID created:', currentUserId);
      }
    }

    // Alternative: Try to get user ID from request body or query params FIRST
    console.log('🔐 Checking for publisher ID in query params and form data...');
    const url = new URL(request.url);
    const publisherIdFromQuery = url.searchParams.get('publisherId');
    console.log('🔐 Publisher ID from query:', publisherIdFromQuery);
    
    // Try to get from form data as well
    let publisherIdFromForm = null;
    let formData;
    try {
      formData = await request.formData();
      publisherIdFromForm = formData.get('publisherId');
      console.log('🔐 Publisher ID from form data:', publisherIdFromForm);
      
      // We need to recreate the FormData for later use since we consumed it
      request.formData = () => Promise.resolve(formData);
    } catch (formError) {
      console.log('🔐 Could not read form data for publisher ID:', formError.message);
      throw formError; // Fail fast if form data can't be read
    }

    // First, try the form data and query params
    if (publisherIdFromForm) {
      currentUserId = publisherIdFromForm;
      console.log('🔐 Using publisher ID from form data:', currentUserId);
    } else if (publisherIdFromQuery) {
      currentUserId = publisherIdFromQuery;
      console.log('🔐 Using publisher ID from query params:', currentUserId);
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      console.log('🔐 Token extracted, length:', token?.length || 0);
      
      // For testing - extract user ID from token or create mock
      // In production, verify the token and extract user ID
      if (token && token !== 'null' && token !== 'undefined') {
        currentUserId = `publisher_${Date.now()}`;
        console.log('🔐 Mock user ID created from token:', currentUserId);
      }
    }

    if (!currentUserId) {
      console.error('❌ No publisher ID found - authentication required');
      return NextResponse.json(
        { success: false, error: 'Authentication required - Publisher ID not found' },
        { status: 401 }
      );
    }

    // Validate the publisher ID
    const userValidation = validateUserId(currentUserId);
    if (!userValidation.valid) {
      console.error('❌ Invalid publisher ID:', userValidation.error);
      return NextResponse.json(
        { success: false, error: userValidation.error },
        { status: 400 }
      );
    }

    console.log('✅ Publisher ID validated:', currentUserId);
    
    // Extract form data fields into articleData
    const articleData = {
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      author: formData.get('author'),
      authorTitle: formData.get('authorTitle'),
      category: formData.get('category'),
      tags: formData.get('tags')?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
      style: formData.get('style'),
      content: formData.get('content'),
      metaDescription: formData.get('metaDescription'),
      publishNow: formData.get('publishNow') === 'true',
      allowComments: formData.get('allowComments') === 'true',
      sendNewsletter: formData.get('sendNewsletter') === 'true',
      isDraft: formData.get('isDraft') === 'true',
      wordCount: parseInt(formData.get('wordCount')) || 0,
      readingTime: parseInt(formData.get('readingTime')) || 0
    };

    logApiCall('POST', {
      publisherId: currentUserId,
      title: articleData.title?.substring(0, 50) + '...',
      author: articleData.author,
      category: articleData.category,
      tagsCount: articleData.tags?.length || 0,
      isDraft: articleData.isDraft,
      publishNow: articleData.publishNow,
      contentLength: articleData.content?.length || 0,
      formDataKeys: [...formData.keys()]
    });

    // Validation
    console.log('✅ Starting validation...');
    
    if (!articleData.title?.trim()) {
      console.error('❌ Validation failed: Title is required');
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!articleData.author?.trim()) {
      console.error('❌ Validation failed: Author name is required');
      return NextResponse.json(
        { success: false, error: 'Author name is required' },
        { status: 400 }
      );
    }

    if (!articleData.category) {
      console.error('❌ Validation failed: Category is required');
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!articleData.content?.trim()) {
      console.error('❌ Validation failed: Article content is required');
      return NextResponse.json(
        { success: false, error: 'Article content is required' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    let featuredImageUrl = null;
    
    // Handle featured image upload inside try-catch for more precise error logs
    const featuredImage = formData.get('featuredImage');
    console.log('🖼️ Featured image check:', {
      hasImage: !!featuredImage,
      imageSize: featuredImage?.size || 0,
      imageName: featuredImage?.name || 'none'
    });

    if (featuredImage && featuredImage.size > 0) {
      try {
        console.log('🖼️ Starting image upload...');
        const imagePath = `articles/${currentUserId}/${Date.now()}-${featuredImage.name}`;
        console.log('🖼️ Image path:', imagePath);
        
        const imageRef = ref(storage, imagePath);
        console.log('🖼️ Image ref created');
        
        const snapshot = await uploadBytes(imageRef, featuredImage);
        console.log('🖼️ Image uploaded, getting download URL...');
        
        featuredImageUrl = await getDownloadURL(snapshot.ref);
        console.log('🖼️ Image upload successful:', featuredImageUrl?.substring(0, 100) + '...');
      } catch (uploadError) {
        console.error('❌ Error uploading image:', uploadError);
        console.error('❌ Upload error details:', {
          message: uploadError.message,
          code: uploadError.code,
          stack: uploadError.stack
        });
        return NextResponse.json(
          { success: false, error: 'Failed to upload featured image: ' + uploadError.message },
          { status: 500 }
        );
      }
    }

    // Get Firestore instance using admin SDK like favorites
    console.log('🔥 Getting Firestore DB instance...');
    const db = getFirestoreDb();
    console.log('✅ Firestore DB instance acquired');

    // Create unique article ID similar to favorites approach
    const articleId = `article_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('🆔 Generated article ID:', articleId);

    // Create the article document
    console.log('📄 Creating article document...');
    const article = {
      id: articleId,
      publisherId: currentUserId,
      publisherName: articleData.author, // Use author as publisher name for now
      title: articleData.title,
      subtitle: articleData.subtitle || '',
      author: articleData.author,
      authorTitle: articleData.authorTitle || '',
      category: articleData.category,
      tags: articleData.tags,
      style: articleData.style || 'modern',
      content: articleData.content,
      metaDescription: articleData.metaDescription || articleData.content.substring(0, 200).replace(/<[^>]*>/g, ''),
      featuredImage: featuredImageUrl,
      allowComments: articleData.allowComments,
      sendNewsletter: articleData.sendNewsletter,
      wordCount: articleData.wordCount,
      readingTime: articleData.readingTime,
      
      // Additional fields for news feed compatibility
      source_id: 'presspass',
      creator: articleData.author,
      description: articleData.metaDescription || articleData.content.substring(0, 200).replace(/<[^>]*>/g, ''),
      image_url: featuredImageUrl,
      link: `/article/${articleId}`,
      pubDate: new Date().toISOString(),
      
      // Status and timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: articleData.publishNow && !articleData.isDraft ? new Date().toISOString() : null,
      addedAt: new Date().toISOString(), // Similar to favorites
      status: articleData.isDraft ? 'draft' : (articleData.publishNow ? 'published' : 'scheduled'),
      
      // Engagement metrics
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      
      // Flags
      isDraft: articleData.isDraft,
      publishNow: articleData.publishNow
    };

    console.log('📄 Article document created:', {
      id: article.id,
      publisherId: article.publisherId,
      status: article.status,
      hasImage: !!article.featuredImage,
      publishedAt: article.publishedAt,
      contentPreview: article.content?.substring(0, 100) + '...'
    });

    // Save to Firestore using the same pattern as favorites
    console.log('💾 Saving article to Firestore...');
    
    // Use subcollection approach like favorites: publishers/{publisherId}/articles/{articleId}
    const publisherPath = `publishers/${currentUserId}`;
    const articlesPath = `${publisherPath}/articles`;
    const articlePath = `${articlesPath}/${articleId}`;
    console.log('🔍 Using Firestore path:', articlePath);

    const articleRef = db.collection('publishers').doc(currentUserId).collection('articles').doc(articleId);
    
    // Check if article with same title already exists (optional duplicate check)
    if (articleData.title) {
      try {
        console.log('🔍 Checking for duplicate titles...');
        const duplicateQuery = db.collection('publishers').doc(currentUserId).collection('articles')
          .where('title', '==', articleData.title)
          .limit(1);
        
        const duplicateSnapshot = await duplicateQuery.get();
        if (!duplicateSnapshot.empty) {
          console.warn('⚠️ Article with this title already exists');
          return NextResponse.json(
            { success: false, error: 'An article with this title already exists' },
            { status: 400 }
          );
        }
      } catch (dupError) {
        console.error('❌ Error during duplicate title check:', dupError);
        throw dupError;
      }
    }

    try {
      await articleRef.set(article);
      console.log('💾 Article saved successfully with ID:', articleId);
    } catch (saveError) {
      console.error('❌ Error saving article:', saveError);
      throw saveError;
    }

    // Also save to main articles collection for global access (optional)
    try {
      console.log('💾 Saving to main articles collection...');
      const mainArticleRef = db.collection('articles').doc(articleId);
      await mainArticleRef.set(article);
      console.log('💾 Article also saved to main collection');
    } catch (mainCollectionError) {
      console.error('⚠️ Error saving to main articles collection (non-critical):', mainCollectionError);
    }

    // Update publisher stats only if not a draft
    if (!articleData.isDraft) {
      try {
        console.log('📊 Updating publisher stats...');
        const publisherRef = db.collection('publishers').doc(currentUserId);
        
        // Get current publisher data first
        const publisherDoc = await publisherRef.get();
        const currentData = publisherDoc.data() || {};
        const currentCount = currentData.articleCount || 0;
        
        await publisherRef.update({
          articleCount: currentCount + 1,
          lastPosted: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('📊 Publisher stats updated successfully');
      } catch (statsError) {
        console.error('⚠️ Error updating publisher stats (non-critical):', statsError);
      }
    } else {
      console.log('📊 Skipping publisher stats update (article is draft)');
    }

    // Newsletter logic placeholder
    if (articleData.sendNewsletter && !articleData.isDraft) {
      console.log('📧 Newsletter sending requested (implement newsletter logic here)');
      // TODO: Implement newsletter sending logic
      // await sendNewsletterToSubscribers(currentUserId, articleId);
    }

    const responseMessage = articleData.isDraft 
      ? 'Article saved as draft successfully!'
      : 'Article published successfully!';

    console.log('✅ Operation completed successfully:', {
      articleId: articleId,
      publisherId: currentUserId,
      status: article.status,
      message: responseMessage
    });

    return NextResponse.json({
      success: true,
      message: responseMessage,
      articleId: articleId,
      article: {
        id: articleId,
        title: article.title,
        status: article.status,
        publishedAt: article.publishedAt,
        featuredImage: featuredImageUrl,
        publisherId: currentUserId
      }
    });

  } catch (error) {
    console.error('💥 Critical error in publish-article route:', error);
    console.error('💥 Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    
    if (error.cause) {
      console.error('💥 Error cause:', error.cause);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to publish article. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
