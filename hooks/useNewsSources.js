// hooks/useNewsSources.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export const useNewsSources = () => {
  const [newsources, setNewsources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNewsSources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/news-sources');
      const data = await response.json();

      if (data.success) {
        setNewsources(data.newsources);
      } else {
        setError(data.error || 'Failed to fetch news sources');
      }
    } catch (err) {
      console.error('Error fetching news sources:', err);
      setError('Failed to load news sources');
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
      
      const response = await fetch(`/api/news-sources/${publisherId}/articles`);
      const data = await response.json();

      if (data.success) {
        setPublisher(data.publisher);
        setArticles(data.articles);
      } else {
        setError(data.error || 'Failed to fetch publisher articles');
      }
    } catch (err) {
      console.error('Error fetching publisher articles:', err);
      setError('Failed to load publisher articles');
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