// app/api/upload-pdf/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '../../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    ('📄 PDF Upload request received');

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

    ('📄 Processing PDF:', {
      fileName: pdfFile.name,
      size: pdfFile.size,
      type: pdfFile.type,
      publisherId
    });

    // Convert PDF to base64
    const bytes = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Pdf = buffer.toString('base64');
    const pdfDataUrl = `data:${pdfFile.type};base64,${base64Pdf}`;

    ('✅ PDF converted to base64, size:', base64Pdf.length);

    // Create article document with PDF
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
      pdfUrl: pdfDataUrl,
      pdfFileName: pdfFile.name,
      pdfSize: pdfFile.size,
      pdfType: pdfFile.type,
      
      // Standard fields
      content: description || `PDF Document: ${pdfFile.name}`,
      style: 'pdf',
      publishNow: !isDraft,
      isDraft: isDraft,
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
      allowComments: false
    };

    // Save to Firestore
    const db = getFirestoreDb();
    const publisherRef = db.collection('publishers').doc(publisherId);
    const collectionName = isDraft ? 'drafts' : 'articles';
    
    const docRef = await publisherRef.collection(collectionName).add(articleData);

    ('✅ PDF article saved with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      message: `PDF ${isDraft ? 'draft' : 'article'} created successfully`,
      articleId: docRef.id,
      status: articleData.status,
      collection: collectionName,
      pdfFileName: pdfFile.name
    });

  } catch (error) {
    console.error('💥 Error uploading PDF:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}