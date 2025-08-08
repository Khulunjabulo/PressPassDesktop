'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewsCard({
  imageUrl = "",
  publicationName = "NEWS",
  logoBgColor = "#008000",
  author = "Unknown",
  time = "Unknown",
  summary = "",
  isUploadedStory = false,
  pdfUrl = null,
  link = null,
}) {
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  const toggleLiked = () => {
    setLiked(!liked);
  };

  // Create URL-friendly slug for navigation
  const slug = publicationName?.toLowerCase().replace(/\s+/g, "-");

  const handlePublicationClick = () => {
    if (slug) {
      console.log("Navigating to:", `/news-reader/${slug}`);
      router.push(`/news-reader/${slug}`);
    }
  };

  const readMoreLink = isUploadedStory && pdfUrl ? pdfUrl : link;

  return (
    <div className="flex items-start gap-4 bg-white rounded-xl shadow-sm hover:shadow-md transition p-4">
      {/* Left image or logo box with heart button */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          onClick={handlePublicationClick}
          className="w-20 h-20 rounded-md flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ backgroundColor: imageUrl ? "transparent" : logoBgColor }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={publicationName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-xs text-center px-1">
              {publicationName.toUpperCase()}
            </span>
          )}
        </div>

        {/* Heart button */}
        <button
          onClick={toggleLiked}
          aria-label={liked ? "Unlike" : "Like"}
          className="mt-2"
          type="button"
        >
          {liked ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-blue-400 fill-current"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
              4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 
              16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
              11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 
                4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 
                16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 
                11.54L12 21.35z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Right content */}
      <div className="flex-1 min-w-0">
        {isUploadedStory && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              📰 Press Pass Story
            </span>
          </div>
        )}

        {/* Publication name - clickable */}
        <p
          onClick={handlePublicationClick}
          className="text-sm font-semibold text-gray-800 mb-1 cursor-pointer hover:underline"
        >
          {publicationName.toUpperCase()}
        </p>

        {/* Summary */}
        {summary && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-3">{summary}</p>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span className="truncate max-w-[40%]">By: {author || "Unknown"}</span>
          <span>{time}</span>
          {readMoreLink ? (
            <a
              href={readMoreLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              {isUploadedStory && pdfUrl ? "View PDF" : "Read more"}
            </a>
          ) : (
            <span className="text-blue-600 cursor-default">Read more</span>
          )}
        </div>
      </div>
    </div>
  );
}
