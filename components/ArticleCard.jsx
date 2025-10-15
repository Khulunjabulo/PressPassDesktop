import { useState } from 'react';
import { Heart, Eye, Clock, Calendar, Bookmark } from 'lucide-react';
import LikeButton from '@/components/LikeButton'; // Assuming you save the Like component here

export default function ArticleCard({ 
  article, 
  publisherId, 
  userId,
  onClick,
  showEngagement = true 
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on interactive elements
    if (e.target.closest('button')) {
      return;
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer overflow-hidden group"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Featured Image */}
        <div className="sm:w-48 h-48 sm:h-auto bg-gray-200 flex-shrink-0 overflow-hidden">
          {article.imageUrl || article.featuredImageUrl ? (
            <img
              src={article.imageUrl || article.featuredImageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-100">
                    <span class="text-gray-400 text-4xl">📰</span>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-4xl">📰</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Category Badge */}
          {article.category && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-3">
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </span>
          )}

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {article.subtitle}
            </p>
          )}

          {/* Excerpt */}
          {article.content && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {article.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4">
            {article.author && (
              <span className="flex items-center">
                <span className="font-medium text-gray-700">{article.author}</span>
              </span>
            )}
            {article.createdAt && (
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(article.createdAt)}
              </span>
            )}
            {article.readTime && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {article.readTime} min read
              </span>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{article.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Engagement Section */}
          {showEngagement && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {/* Like Button */}
                <LikeButton
                  articleId={article.id}
                  publisherId={publisherId}
                  userId={userId}
                  initialLikeCount={article.likeCount || 0}
                  initialLiked={article.userHasLiked || false}
                  size="default"
                />

                {/* Views */}
                <div className="flex items-center space-x-1 text-gray-600 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{article.views || 0}</span>
                </div>
              </div>

              {/* Bookmark Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBookmarked(!isBookmarked);
                  // Add bookmark API call here
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? 'text-yellow-600 bg-yellow-50'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-600' : 'fill-none'}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}