// hooks/useNewsSources.js
'use client';

import { useState, useEffect, useCallback } from 'react';

// Request deduplication cache
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Request deduplication utility
class RequestManager {
  constructor() {
    this.pendingRequests = new Map();
    this.cache = new Map();
  }

  async dedupeRequest(key, requestFn, ttl = CACHE_DURATION) {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      return cached.data;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request
    const requestPromise = this.makeRequest(key, requestFn, ttl);
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  async makeRequest(key, requestFn, ttl) {
    try {
      const data = await requestFn();

      // Cache successful response
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('❌ Request failed:', key, error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  getCacheStats() {
    return {
      cachedRequests: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Global request manager instance
const requestManager = new RequestManager();

// Enhanced cache with TTL support
const cache = {
  get(key) {
    const item = requestManager.cache.get(key);
    if (item && (Date.now() - item.timestamp) < CACHE_DURATION) {
      return item;
    }
    if (item) {
      requestManager.cache.delete(key); // Remove expired item
    }
    return null;
  },

  set(key, data) {
    requestManager.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  clear() {
    requestManager.cache.clear();
  },

  stats() {
    return requestManager.getCacheStats();
  }
};

export const useNewsSources = () => {
  const [newsources, setNewsources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNewsSources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use request deduplication
      const data = await requestManager.dedupeRequest(
        'news-sources',
        async () => {
          const response = await fetch('/api/news-sources');
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch news sources');
          }

          return result;
        }
      );

      setNewsources(data.newsources || []);
    } catch (err) {
      console.error('❌ Error fetching news sources:', err);
      setError(err.message || 'Failed to load news sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsSources();
  }, [fetchNewsSources]);

  const refreshSources = () => {
    fetchNewsSources();
  };

  return {
    newsources,
    loading,
    error,
    refreshSources
  };
};

export const usePublisherArticles = (publisherId) => {
  const [publisher, setPublisher] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublisherArticles = useCallback(async () => {
    if (!publisherId) return;

    try {
      setLoading(true);
      setError(null);

      // Use request deduplication with publisher-specific cache key
      const cacheKey = `publisher-articles-${publisherId}`;
      const data = await requestManager.dedupeRequest(
        cacheKey,
        async () => {
          const response = await fetch(`/api/news-sources/${publisherId}/articles`);
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch publisher articles');
          }

          return result;
        }
      );

      setPublisher(data.publisher);
      setArticles(data.articles || []);
    } catch (err) {
      console.error('❌ Error fetching publisher articles:', err);
      setError(err.message || 'Failed to load publisher articles');
    } finally {
      setLoading(false);
    }
  }, [publisherId]);

  useEffect(() => {
    fetchPublisherArticles();
  }, [fetchPublisherArticles]);

  const refreshArticles = () => {
    fetchPublisherArticles();
  };

  return {
    publisher,
    articles,
    loading,
    error,
    refreshArticles
  };
};