// app/api/news-sources/[publisherId]/articles/route.js
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin.js';

export async function GET(request, { params }) {
  try {
    const { publisherId } = await params;

    console.log('🔍 Fetching articles for publisher:', publisherId);

    const db = getFirestoreDb();

    const publisherRef = db.collection('publishers').doc(publisherId);
    const publisherSnap = await publisherRef.get();

    if (!publisherSnap.exists) {
      console.log('❌ Publisher not found:', publisherId);
      return NextResponse.json(
        { success: false, error: 'Publisher not found' },
        { status: 404 }
      );
    }

    const publisherData = publisherSnap.data();
    console.log('✅ Publisher found:', publisherData.companyName);

    const articlesSnapshot = await publisherRef
      .collection('articles')
      .orderBy('updatedAt', 'desc')
      .get();

    const draftsSnapshot = await publisherRef
      .collection('drafts')
      .orderBy('updatedAt', 'desc')
      .get();

    const articles = [];

    // ─── Helper: resolve the best image URL from a Firestore doc ───────────────
    // Cloudinary URLs come through as featuredImageUrl.
    // Legacy base64 or other fields are fallbacks.
    function resolveImageUrl(data) {
      const candidates = [
        data.featuredImageUrl,
        data.imageUrl,
        data.image,
        data.featuredImage,
      ];

      for (const candidate of candidates) {
        if (!candidate) continue;
        // Skip base64 blobs — they're too large and break Firestore reads
        if (typeof candidate === 'string' && candidate.startsWith('data:')) continue;
        // Accept any valid http/https URL (Cloudinary, Firebase Storage, etc.)
        if (typeof candidate === 'string' && candidate.startsWith('http')) return candidate;
      }

      // Last resort: try to pull a URL out of the article content
      if (data.content) {
        const match = data.content.match(
          /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|svg)/i
        );
        if (match) return match[0];
      }

      return null;
    }

    // ─── Map a Firestore doc to a clean article object ─────────────────────────
    function mapArticle(doc, isDraft) {
      const data = doc.data();
      const imageUrl = resolveImageUrl(data);

      console.log(`📄 ${isDraft ? 'Draft' : 'Article'}: "${data.title?.substring(0, 40)}"`, {
        imageUrl: imageUrl ? imageUrl.substring(0, 60) + '...' : 'none',
        isPdfArticle: data.isPdfArticle,
        isRssFeed: data.isRssFeed,
      });

      return {
        id: doc.id,
        title: data.title || 'Untitled',
        subtitle: data.subtitle || '',
        content: data.content || '',
        summary: data.summary || data.metaDescription || '',
        category: data.category || 'General',
        tags: data.tags || [],
        author: data.author || publisherData.companyName,
        authorTitle: data.authorTitle || '',

        // ✅ FIXED: always set BOTH fields so templates can read either one
        imageUrl,
        featuredImageUrl: imageUrl,

        imageCredit: data.imageCredit || null,
        imageCaption: data.imageCaption || null,

        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        publishedAt: isDraft ? null : data.publishedAt,
        status: isDraft ? 'draft' : (data.status || 'published'),
        readTime: data.readingTime || data.readTime || 5,
        wordCount: data.wordCount || 0,
        views: data.views || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        priority: data.priority || 'normal',
        style: data.style || 'modern',
        templateId: data.templateId || 3,
        templateCredit: data.templateCredit || null,
        allowComments: data.allowComments !== false,
        isDraft,

        // RSS fields
        isRssFeed: data.isRssFeed === true,
        rssFeedId: data.rssFeedId || null,
        rssFeedName: data.rssFeedName || null,
        rssFeedUrl: data.rssFeedUrl || null,
        link: data.link || null,
        guid: data.guid || null,

        // PDF fields
        isPdfArticle: data.isPdfArticle === true,
        pdfUrl: data.pdfUrl || null,
        pdfFileName: data.pdfFileName || null,
        pdfSize: data.pdfSize || null,
        pdfType: data.pdfType || null,
        description: data.description || null,
      };
    }

    console.log('📊 Processing', articlesSnapshot.size, 'published articles...');
    articlesSnapshot.forEach(doc => articles.push(mapArticle(doc, false)));

    console.log('📊 Processing', draftsSnapshot.size, 'draft articles...');
    draftsSnapshot.forEach(doc => articles.push(mapArticle(doc, true)));

    const rssCount = articles.filter(a => a.isRssFeed).length;
    const pdfCount = articles.filter(a => a.isPdfArticle).length;
    const withImages = articles.filter(a => a.imageUrl).length;

    console.log(`📰 Total: ${articles.length} | RSS: ${rssCount} | PDF: ${pdfCount} | With images: ${withImages}`);

    return NextResponse.json({
      success: true,
      publisher: {
        id: publisherId,
        name: publisherData.companyName || publisherData.name,
        logo: publisherData.companyLogo || publisherData.logo || null,
        industry: publisherData.industry || 'Publishing',
        description: publisherData.description || '',
        website: publisherData.companyWebsite || publisherData.website,
        publicationType: publisherData.publicationType || 'Digital',
        audienceType: publisherData.audienceType || 'General',
      },
      articles,
      totalArticles: articles.length,
      publishedArticles: articles.filter(a => !a.isDraft).length,
      drafts: articles.filter(a => a.isDraft).length,
      rssArticles: rssCount,
      pdfArticles: pdfCount,
    });

  } catch (error) {
    console.error('💥 Error fetching publisher articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch publisher articles', details: error.message },
      { status: 500 }
    );
  }
}