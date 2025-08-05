"use client";

import { useState } from "react";
import FavoriteButton from "../../components/FavoriteButton";

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

  const toggleLiked = () => {
    setLiked(!liked);
  };

  // Use PDF link for uploaded stories, otherwise regular link
  const readMoreLink = isUploadedStory && pdfUrl ? pdfUrl : link;

  // Build the favorite item object to pass to FavoriteButton
  const favoriteItem = {
    id: link || pdfUrl || `story_${Date.now()}`,
    title: summary || publicationName,
    description: summary || "",
    image: imageUrl || "",
    link: link || "",
    pdfUrl: pdfUrl || "",
    source: publicationName || "Unknown",
    publicationName: publicationName || "Unknown",
    category: "general",
    type: isUploadedStory ? "story" : "story",
  };

  return (
    <div className="flex items-start gap-4 bg-white rounded-xl shadow-sm hover:shadow-md transition p-4">
      {/* Left image or logo box with heart button */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-20 h-20 rounded-md flex items-center justify-center overflow-hidden"
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

        {/* Favorite button below the picture */}
        <div className="mt-2">
          <FavoriteButton item={favoriteItem} size="default" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isUploadedStory && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              📰 Press Pass Story
            </span>
          </div>
        )}

        <p className="text-sm font-semibold text-gray-800 mb-1">
          {publicationName.toUpperCase()}
        </p>

        {summary && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-3">{summary}</p>
        )}

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
