"use client";
import React from "react";
import { useSearchParams } from "next/navigation";

export default function ArticleWithAds() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  
  const isHeadlineTemplate = templateId === "1";
  const isFeedTemplate = templateId === "4";
  const isWithinArticleTemplate = templateId === "2";
  const isPageWrap1Template = templateId === "3";
  const isPageWrap2Template = templateId === "5";

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Headline Ad */}
      <div className="w-full border-2 border-dashed border-blue-400 p-4 mb-6 text-center">
        {isHeadlineTemplate ? (
          <img src="/press-bannerAd.png" alt="Advertisement" className="max-w-full h-auto" />
        ) : (
          <>
            <h2 className="text-3xl font-bold text-blue-600">HEADLINE</h2>
            <p>300w x 250h(px)</p>
            <p>100kb: JPEG, PNG, HTML</p>
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
              Payment Link
            </button>
          </>
        )}
      </div>

      {/* Article Section */}
      <article className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2">
          <h1 className="text-2xl font-bold mb-2">
            Dummy Article: How to Place Ads Around Content
          </h1>
          <p className="text-gray-500 mb-4">By Jane Doe – August 14, 2025</p>

          <p className="mb-4">
            Placing advertising intelligently around <strong>editorial content</strong> improves
            visibility without disrupting the reading experience. In this demo, we illustrate several common placements.
          </p>

          {/* Within Article Ad */}
          <div className="w-full border-2 border-dashed border-blue-400 p-4 my-6 text-center">
            {isWithinArticleTemplate ? (
              <img src="/press-bannerAd.png" alt="Advertisement" className="max-w-full h-auto" />
            ) : (
              <>
                <h2 className="text-2xl font-bold text-blue-600">WITHIN ARTICLE</h2>
                <p>300w x 250h(px)</p>
                <p>100kb: JPEG, PNG, HTML</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                  Payment Link
                </button>
              </>
            )}
          </div>

          <p className="mb-4">
            Inline units (within article) are inserted between paragraphs. These break up long reads and keep engagement consistent throughout the page.
          </p>

          <p className="mb-4">
            Sidebar feed ads are ideal for performance formats and can remain sticky while the user scrolls, maintaining presence without obstructing content.
          </p>

          <p className="mb-4">
            Balance is key: ensure ads don't crowd the content and that spacing, contrast, and loading performance are considered.
          </p>
        </div>

        {/* Sidebar Ads */}
        <div className="flex flex-col space-y-6">
          {/* Feed Ad */}
          <div className="border-2 border-dashed border-blue-400 p-4 text-center">
            {isFeedTemplate ? (
              <img src="/PressPass-WrapAd.png" alt="Advertisement" className="max-w-full h-auto" />
            ) : (
              <>
                <h2 className="text-xl font-bold text-blue-600">FEED</h2>
                <p>250w x 250h(px)</p>
                <p>100kb JPEG, PNG, HTML</p>
                <p>Publisher to Quote</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                  Payment Link
                </button>
              </>
            )}
          </div>

          {/* Page Wrap 2 */}
          <div className="border-2 border-dashed border-blue-400 p-4 text-center">
            {isPageWrap2Template ? (
              <img src="/PressPass-WrapAd.png" alt="Advertisement" className="max-w-300px h-900px" />
            ) : (
              <>
                <h2 className="text-xl font-bold text-blue-600">PAGE WRAP 2</h2>
                <p>200w x 200h(px)</p>
                <p>100kb JPEG, PNG, HTML</p>
                <p>Publisher to Quote</p>
                <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                  Payment Link
                </button>
              </>
            )}
          </div>
        </div>
      </article>

      {/* Page Wrap 1 Ad */}
      {isPageWrap1Template && (
        <div className="w-full border-2 border-dashed border-blue-400 p-4 mt-8 text-center">
          <img src="/press-bannerAd.png" alt="Advertisement" className="max-w-full h-auto" />
        </div>
      )}

      
    </div>
  );
}
