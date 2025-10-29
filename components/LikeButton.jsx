import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function LikeButton({ 
  articleId, 
  publisherId, 
  userId, 
  initialLikeCount = 0,
  initialLiked = false,
  size = 'default' // 'small', 'default', 'large'
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // Fetch current engagement status
  useEffect(() => {
    if (userId && articleId && publisherId) {
      fetchEngagementStatus();
    }
  }, [userId, articleId, publisherId]);

  const fetchEngagementStatus = async () => {
    try {
      const response = await fetch(
        `/api/engagement?publisherId=${publisherId}&articleId=${articleId}&userId=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setLiked(data.userHasLiked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Error fetching engagement status:', error);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      alert('Please log in to like articles');
      return;
    }

    if (loading) return;

    setLoading(true);
    const action = liked ? 'unlike' : 'like';
    const previousLiked = liked;
    const previousCount = likeCount;

    // Optimistic update
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const response = await fetch('/api/engagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          publisherId,
          articleId,
          action
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // Revert on error
        setLiked(previousLiked);
        setLikeCount(previousCount);
        console.error('Error updating like:', data.error);
      }
    } catch (error) {
      // Revert on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('Error updating like:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: {
      button: 'p-1.5',
      icon: 'w-4 h-4',
      text: 'text-xs'
    },
    default: {
      button: 'p-2',
      icon: 'w-5 h-5',
      text: 'text-sm'
    },
    large: {
      button: 'p-3',
      icon: 'w-6 h-6',
      text: 'text-base'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`
        ${currentSize.button}
        flex items-center space-x-1.5
        rounded-lg
        transition-all duration-200
        ${liked 
          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
          : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border border-transparent
        ${liked ? 'border-red-200' : 'hover:border-gray-200'}
      `}
      title={liked ? 'Unlike this article' : 'Like this article'}
    >
      <Heart 
        className={`${currentSize.icon} transition-all ${
          liked ? 'fill-red-600' : 'fill-none'
        }`}
      />
      <span className={`${currentSize.text} font-medium`}>
        {likeCount}
      </span>
    </button>
  );
}