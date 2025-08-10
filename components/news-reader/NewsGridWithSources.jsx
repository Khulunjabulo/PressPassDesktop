// Example: How to integrate the news sources with your existing news grid
// You can modify your NewsGrid component to include a sources section

// components/news-reader/NewsGridWithSources.jsx
'use client';

import { useState } from 'react';
import { timeAgo } from '@/lib/time';
import NewsCard from '@/components/news-reader/NewsCard';
import AdSlot from '@/components/news-reader/AdsSlot';
import RecommendedOverlayBottom from '@/components/news-reader/Overlay';
import NewsSources from '@/components/news-reader/NewsSources';
import { Building, FileText } from 'lucide-react';

function dedupeArticles(articles = []) {
  const seen = new Set();
  const out = [];
  for (const a of articles) {
    const key = a.link || a.title;
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

export default function NewsGridWithSources({ articles }) {
  const [activeTab, setActiveTab] = useState('articles');
  const unique = dedupeArticles(articles || []);

  return (
    <div className="relative">
      {/* Bottom-sheet overlay */}
      <RecommendedOverlayBottom articles={unique} />

      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-6 py-4">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center space-x-2 px-1 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'articles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Articles</span>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center space-x-2 px-1 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'sources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>News Sources</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'articles' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-6 pb-10">
          {/* MAIN COLUMN */}
          <div className="space-y-6">
            {/* 3 columns on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unique.map((article, index) => {
                const isUploadedStory = article.source_id === 'presspass';
                
                return (
                  <NewsCard
                    key={index}
                    imageUrl={article.image_url}
                    publicationName={(article.source_id || 'News').slice(0, 10)}
                    logoBgColor={isUploadedStory ? "#1f2937" : "#008000"}
                    author={
                      Array.isArray(article.creator)
                        ? article.creator[0]
                        : article.creator || 'Unknown'
                    }
                    time={timeAgo(article.pubDate || article.publishedAt || article.createdAt)}
                    isUploadedStory={isUploadedStory}
                    pdfUrl={article.pdfUrl}
                    link={article.link}
                    summary={
                      article.description ||
                      article.content ||
                      'No summary available.'
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR (ads) */}
          <aside className="space-y-6 lg:sticky lg:top-20 h-fit">
            {/* Rectangle Ad (300x250) */}
            <AdSlot 
              label="Rectangle Ad (300x250)"
              height={250}
              width={300}
              preferredType="rectangles"
              className="max-w-[300px]"
            />
            
            {/* Skyscraper Ad (300x600) */}
            <AdSlot 
              label="Skyscraper Ad (300x600)"
              height={600}
              width={300}
              preferredType="skyscrapers"
              className="max-w-[300px]"
            />
            
            {/* Another Rectangle Ad (300x250) */}
            <AdSlot 
              label="Rectangle Ad (300x250)"
              height={250}
              width={300}
              preferredType="rectangles"
              className="max-w-[300px]"
            />
          </aside>
        </div>
      ) : (
        <NewsSources />
      )}
    </div>
  );
}

// Example: How to call updatePublisherStats when a publisher uploads an article
// This would typically be called in your article upload/publish API endpoint

// app/api/publish-article/route.js (example usage)
export async function POST(request) {
  try {
    const articleData = await request.json();
    
    // Save the article to Firestore
    const articlesRef = collection(db, 'articles');
    const newArticle = await addDoc(articlesRef, {
      ...articleData,
      publisherId: articleData.publisherId,
      createdAt: new Date(),
      publishedAt: new Date()
    });

    // Update publisher stats
    const updateStatsResponse = await fetch('/api/update-publisher-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publisherId: articleData.publisherId,
        lastPosted: new Date().toISOString()
      })
    });

    return NextResponse.json({
      success: true,
      articleId: newArticle.id,
      message: 'Article published and publisher stats updated'
    });

  } catch (error) {
    console.error('Error publishing article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish article' },
      { status: 500 }
    );
  }
}