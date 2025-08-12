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


// 'use client';

// import { useState } from 'react';
// import { Clock, ExternalLink } from 'lucide-react';
// import FavoriteButton from '@/components/FavoriteButton';

// export default function NewsCard({ 
//   imageUrl, 
//   publicationName, 
//   logoBgColor, 
//   author, 
//   time, 
//   isUploadedStory, 
//   pdfUrl, 
//   link, 
//   summary,
//   title,
//   category,
//   pubDate,
//   articleId,
//   publisherId
// }) {
//   const [imageError, setImageError] = useState(false);

//   const handleCardClick = (e) => {
//     // Don't navigate if clicking on favorite button
//     if (e.target.closest('button')) {
//       return;
//     }

//     if (isUploadedStory && pdfUrl) {
//       window.open(pdfUrl, '_blank');
//     } else if (link) {
//       window.open(link, '_blank');
//     }
//   };

//   const handleImageError = () => {
//     setImageError(true);
//   };

//   // Prepare item data for favorite button
//   const favoriteItemData = {
//     id: articleId || `article_${title}_${publicationName}`,
//     title: title || summary?.substring(0, 100) + '...' || 'Untitled',
//     description: summary || '',
//     image: imageUrl,
//     link: link,
//     source: publicationName,
//     publicationName: publicationName,
//     category: category || 'general',
//     pubDate: pubDate || new Date().toISOString(),
//     author: author,
//     publisherId: publisherId
//   };

//   return (
//     <div 
//       className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
//       onClick={handleCardClick}
//     >
//       {/* Image Section */}
//       <div className="relative h-48 bg-gray-200">
//         {imageUrl && !imageError ? (
//           <img
//             src={imageUrl}
//             alt={title || "News article"}
//             className="w-full h-full object-cover"
//             onError={handleImageError}
//           />
//         ) : (
//           <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
//             <span className="text-gray-600 text-4xl font-bold">
//               {publicationName.charAt(0)}
//             </span>
//           </div>
//         )}

//         {/* Favorite Button Overlay */}
//         <div className="absolute top-3 right-3">
//           <FavoriteButton 
//             item={favoriteItemData}
//             size="small"
//             className="bg-white/90 backdrop-blur-sm shadow-lg"
//           />
//         </div>

//         {/* Publication Logo */}
//         <div className="absolute bottom-3 left-3">
//           <div 
//             className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
//             style={{ backgroundColor: logoBgColor }}
//           >
//             {publicationName.charAt(0)}
//           </div>
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="p-4">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-3">
//           <span className="text-sm font-semibold text-gray-900 truncate">
//             {publicationName}
//           </span>
//           {isUploadedStory && (
//             <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//               PDF
//             </span>
//           )}
//         </div>

//         {/* Summary */}
//         <p className="text-gray-700 text-sm mb-3 line-clamp-3 leading-relaxed">
//           {summary || 'No summary available.'}
//         </p>

//         {/* Footer */}
//         <div className="flex items-center justify-between text-xs text-gray-500">
//           <div className="flex items-center space-x-2">
//             {author && (
//               <span className="truncate max-w-24">{author}</span>
//             )}
//             <div className="flex items-center space-x-1">
//               <Clock className="w-3 h-3" />
//               <span>{time}</span>
//             </div>
//           </div>

//           {link && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 window.open(link, '_blank');
//               }}
//               className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
//               title="Open article"
//             >
//               <ExternalLink className="w-3 h-3" />
//               <span>Read</span>
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }