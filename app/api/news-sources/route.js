// app/api/news-sources/route.js — Optimized Version
import { NextResponse } from 'next/server';
import { getFirestoreDb } from '@/lib/firebase-admin.js';

// ── Image resolver ───────────────────────────────────────────────────────────
function resolveImageUrl(data) {
  const candidates = [
    data.featuredImageUrl,
    data.imageUrl,
    data.image,
    data.featuredImage,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === 'string' && c.startsWith('data:')) continue;
    if (typeof c === 'string' && c.startsWith('http')) return c;
  }
  if (data.content) {
    const m = data.content.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp|svg)/i);
    if (m) return m[0];
  }
  return null;
}

// ── Strip HTML tags (server-safe, no DOM) ───────────────────────────────────
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Time-ago formatter ───────────────────────────────────────────────────────
function formatTimeAgo(date) {
  try {
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60)       return 'Just now';
    if (diff < 3600)     return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)    return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000)  return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
  } catch {
    return 'Recently';
  }
}

export async function GET() {
  try {
    const db = getFirestoreDb();

    // 1️⃣  Fetch all active publishers in ONE read
    const publishersSnap = await db
      .collection('publishers')
      .where('isActive', '==', true)
      .get();

    if (publishersSnap.empty) {
      return NextResponse.json({ success: true, newsources: [] });
    }

    // 2️⃣  For every publisher, fetch the latest 1 article in parallel.
    //     No status filter — articles may not have a 'status' field set.
    //     Try createdAt ordering first, fall back to updatedAt, then unordered.
    const publishers = await Promise.all(
      publishersSnap.docs.map(async (pubDoc) => {
        const pub = pubDoc.data();

        // Skip explicitly inactive publishers that slipped past the query
        if (pub.hasOwnProperty('isActive') && !pub.isActive) return null;

        let recentStory  = null;
        let articleCount = 0;
        let lastPosted   = 'Just registered';

        try {
          const articlesRef = db
            .collection('publishers')
            .doc(pubDoc.id)
            .collection('articles');

          // Get latest article — try createdAt, fall back to updatedAt, then plain limit
          const latestSnap = await articlesRef
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get()
            .catch(() =>
              articlesRef
                .orderBy('updatedAt', 'desc')
                .limit(1)
                .get()
                .catch(() => articlesRef.limit(1).get())
            );

          // Count total articles (Admin SDK .count())
          const countSnap = await articlesRef
            .count()
            .get()
            .catch(() => null);

          if (countSnap && typeof countSnap.data === 'function') {
            articleCount = countSnap.data().count ?? latestSnap.size;
          } else {
            articleCount = latestSnap.size; // at least 0 or 1
          }

          // Build recentStory from the latest article doc
          if (!latestSnap.empty) {
            const doc      = latestSnap.docs[0];
            const data     = doc.data();
            const imageUrl = resolveImageUrl(data);

            // Prefer createdAt, fall back to updatedAt for the "last posted" label
            const articleDate =
              data.createdAt?.toDate ? data.createdAt.toDate() :
              data.updatedAt?.toDate ? data.updatedAt.toDate() :
              null;

            if (articleDate) lastPosted = formatTimeAgo(articleDate);

            const rawTitle   = stripHtml(data.title || 'Untitled');
            const rawSummary = stripHtml(
              data.summary || data.metaDescription || data.content || ''
            );

            recentStory = {
              id:          doc.id,
              title:       rawTitle,
              excerpt:     rawSummary.length > 150
                             ? rawSummary.substring(0, 150).trim() + '...'
                             : rawSummary || 'No preview available.',
              url:         `/news-reader/article/${doc.id}?publisherId=${pubDoc.id}`,
              imageUrl,
              category:    data.category || 'General',
              publishedAt: data.createdAt || data.updatedAt || null,
            };
          }
        } catch (err) {
          console.warn(`[news-sources] article fetch failed for ${pubDoc.id}:`, err.message);
        }

        return {
          id:              pubDoc.id,
          name:            pub.companyName    || 'Unnamed Publisher',
          city:            pub.city           || '',
          logo:            pub.companyLogo    || null,
          industry:        pub.industry       || 'General',
          publicationType: pub.publicationType|| 'News',
          audienceType:    pub.audienceType   || 'General',
          website:         pub.companyWebsite || null,
          description:     pub.description   || '',
          articleCount,
          lastPosted,
          hasArticles: articleCount > 0,
          recentStory,
          createdAt: pub.createdAt || null,
          isActive:  pub.isActive !== undefined ? pub.isActive : true,
        };
      })
    );

    // 3️⃣  Remove nulls (inactive).
    //     Sort: publishers with articles first, ordered by most-recent article date desc.
    //     Publishers with no articles go last (they appear in Recommended, not the grid).
    const sorted = publishers
      .filter(Boolean)
      .sort((a, b) => {
        // No articles → always after publishers that have articles
        if (a.hasArticles && !b.hasArticles) return -1;
        if (!a.hasArticles && b.hasArticles)  return  1;

        // Both have articles → sort by most recent article date
        if (a.hasArticles && b.hasArticles) {
          const getDate = (pub) => {
            const p = pub.recentStory?.publishedAt;
            if (!p) return new Date(0);
            if (p.toDate) return p.toDate();
            if (typeof p === 'string') return new Date(p);
            return new Date(0);
          };
          return getDate(b) - getDate(a);
        }

        // Both have no articles → sort by publisher registration date
        const dA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dB - dA;
      });

    return NextResponse.json({ success: true, newsources: sorted });

  } catch (error) {
    console.error('[news-sources] fatal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news sources', details: error.message },
      { status: 500 }
    );
  }
}