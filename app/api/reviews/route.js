// app/api/reviews/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb, getAuth } from '../../../lib/firebase-admin';

// GET all reviews (public)
export async function GET(request) {
  ('📖 Getting reviews...');
  
  try {
    const db = getFirestoreDb();
    
    // Get all reviews ordered by creation date
    const reviewsSnapshot = await db.collection('reviews')
      .orderBy('createdAt', 'desc')
      .get();
    
    const reviews = [];
    reviewsSnapshot.forEach(doc => {
      reviews.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calculate overall rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    (`✅ Retrieved ${reviews.length} reviews`);

    return NextResponse.json({
      success: true,
      reviews,
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating)
    });

  } catch (error) {
    console.error('❌ Error getting reviews:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get reviews'
    }, { status: 500 });
  }
}

// POST - Create new review (authenticated users only)
export async function POST(request) {
  ('📝 Creating new review...');
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    ('🔍 Verifying ID token...');
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    ('✅ Token verified for user:', uid);

    // Parse request body
    const { rating, reviewText } = await request.json();

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: 'Rating must be between 1 and 5'
      }, { status: 400 });
    }

    if (!reviewText || reviewText.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Review text is required'
      }, { status: 400 });
    }

    const db = getFirestoreDb();
    const readerUid = `reader_${uid}`;
    
    // Get user data for the review
    ('📡 Fetching user data...');
    const readerDoc = await db.collection('readers').doc(readerUid).get();
    
    if (!readerDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User profile not found'
      }, { status: 404 });
    }

    const userData = readerDoc.data();

    // Check if user already has a review
    const existingReviewSnapshot = await db.collection('reviews')
      .where('userId', '==', readerUid)
      .limit(1)
      .get();

    if (!existingReviewSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'You have already submitted a review. You can edit your existing review instead.'
      }, { status: 400 });
    }

    // Create review data
    const reviewData = {
      userId: readerUid,
      userEmail: userData.email,
      userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous User',
      userProfilePicture: userData.profilePicture || null,
      rating: parseInt(rating),
      reviewText: reviewText.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save review to Firestore
    ('💾 Saving review to Firestore...');
    const reviewRef = await db.collection('reviews').add(reviewData);
    
    ('✅ Review created successfully:', reviewRef.id);

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      reviewId: reviewRef.id,
      review: {
        id: reviewRef.id,
        ...reviewData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating review:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create review'
    }, { status: 500 });
  }
}

// PUT - Update existing review (authenticated users only)
export async function PUT(request) {
  ('✏️ Updating review...');
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    ('✅ Token verified for user:', uid);

    // Parse request body
    const { reviewId, rating, reviewText } = await request.json();

    if (!reviewId) {
      return NextResponse.json({
        success: false,
        error: 'Review ID is required'
      }, { status: 400 });
    }

    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({
        success: false,
        error: 'Rating must be between 1 and 5'
      }, { status: 400 });
    }

    const db = getFirestoreDb();
    const readerUid = `reader_${uid}`;
    
    // Get the review
    const reviewDoc = await db.collection('reviews').doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }

    const reviewData = reviewDoc.data();

    // Check if the user owns this review
    if (reviewData.userId !== readerUid) {
      return NextResponse.json({
        success: false,
        error: 'You can only edit your own reviews'
      }, { status: 403 });
    }

    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (rating) {
      updateData.rating = parseInt(rating);
    }

    if (reviewText && reviewText.trim().length > 0) {
      updateData.reviewText = reviewText.trim();
    }

    // Update the review
    await db.collection('reviews').doc(reviewId).update(updateData);
    
    // Get updated review
    const updatedDoc = await db.collection('reviews').doc(reviewId).get();
    const updatedReview = updatedDoc.data();

    ('✅ Review updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        id: reviewId,
        ...updatedReview
      }
    });

  } catch (error) {
    console.error('❌ Error updating review:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update review'
    }, { status: 500 });
  }
}

// DELETE - Delete review (authenticated users only)
export async function DELETE(request) {
  ('🗑️ Deleting review...');
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    ('✅ Token verified for user:', uid);

    // Get reviewId from URL search params
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({
        success: false,
        error: 'Review ID is required'
      }, { status: 400 });
    }

    const db = getFirestoreDb();
    const readerUid = `reader_${uid}`;
    
    // Get the review
    const reviewDoc = await db.collection('reviews').doc(reviewId).get();
    
    if (!reviewDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }

    const reviewData = reviewDoc.data();

    // Check if the user owns this review
    if (reviewData.userId !== readerUid) {
      return NextResponse.json({
        success: false,
        error: 'You can only delete your own reviews'
      }, { status: 403 });
    }

    // Delete the review
    await db.collection('reviews').doc(reviewId).delete();
    
    ('✅ Review deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting review:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete review'
    }, { status: 500 });
  }
}