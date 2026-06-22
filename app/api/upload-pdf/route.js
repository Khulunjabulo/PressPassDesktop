// app/api/upload-pdf/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a PDF buffer to Cloudinary and returns the secure URL.
 */
async function uploadToCloudinary(buffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',         // Required for PDFs and non-image files
        folder: 'pdf_articles',       // Organises uploads in a folder
        public_id: `${Date.now()}_${fileName.replace(/\s+/g, '_')}`,
        overwrite: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    console.log('📄 PDF Upload request received');

    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Content must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const pdfFile = formData.get('pdfFile');
    const publisherId = formData.get('publisherId');
    const title = formData.get('title');
    const category = formData.get('category');
    const description = formData.get('description');
    const author = formData.get('author');
    const isDraft = formData.get('isDraft') === 'true';

    // Validation
    if (!pdfFile || !publisherId) {
      return NextResponse.json(
        { success: false, error: 'PDF file and Publisher ID are required' },
        { status: 400 }
      );
    }

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Title and category are required' },
        { status: 400 }
      );
    }

    console.log('📄 Processing PDF:', {
      fileName: pdfFile.name,
      size: pdfFile.size,
      type: pdfFile.type,
      publisherId,
    });

    // Convert file to buffer for Cloudinary upload
    const bytes = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary — get back a secure HTTPS URL
    console.log('☁️ Uploading PDF to Cloudinary...');
    const cloudinaryResult = await uploadToCloudinary(buffer, pdfFile.name);
    const pdfUrl = cloudinaryResult.secure_url;
    console.log('✅ Cloudinary upload successful:', pdfUrl);

    // Build Firestore document — store only the URL, NOT base64
    const articleData = {
      title: title || 'Untitled PDF Article',
      subtitle: '',
      author: author || 'Unknown',
      authorTitle: '',
      category: category || 'general',
      description: description || '',
      metaDescription: description || '',
      tags: [],

      // PDF-specific fields
      isPdfArticle: true,
      pdfUrl,                          // ✅ Cloudinary HTTPS URL (tiny string)
      pdfFileName: pdfFile.name,
      pdfSize: pdfFile.size,
      pdfType: pdfFile.type,
      cloudinaryPublicId: cloudinaryResult.public_id, // Useful if you want to delete later

      // Standard fields
      content: description || `PDF Document: ${pdfFile.name}`,
      style: 'pdf',
      publishNow: !isDraft,
      isDraft,
      status: isDraft ? 'draft' : 'published',

      // Metadata
      publisherId,
      publisherName: formData.get('publisherName') || '',
      wordCount: 0,
      readingTime: 5,

      // Timestamps
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      publishedAt: isDraft ? null : Timestamp.now(),

      // Engagement
      views: 0,
      likes: 0,
      comments: 0,
      allowComments: false,
    };

    // Save lightweight document to Firestore
    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);
    const collectionName = isDraft ? 'drafts' : 'articles';

    const docRef = await publisherRef.collection(collectionName).add(articleData);
    console.log('✅ PDF article saved to Firestore with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      message: `PDF ${isDraft ? 'draft' : 'article'} created successfully`,
      articleId: docRef.id,
      status: articleData.status,
      collection: collectionName,
      pdfFileName: pdfFile.name,
      pdfUrl,                          // Return URL to the client too
    });

  } catch (error) {
    console.error('💥 Error uploading PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}