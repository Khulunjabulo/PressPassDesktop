// Fixed hook with separate collections handling
const usePublisherContent = (publisherId) => {
  const [articles, setArticles] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all content for publisher with better error handling
  const fetchContent = async () => {
    if (!publisherId) {
      ('⏩ No publisherId provided, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      ('🔄 Fetching content for publisher:', publisherId);

      const url = `/api/publish-article?publisherId=${publisherId}&type=both`;
      ('📡 Making request to:', url);

      const response = await fetch(url);
      
      ('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API response not ok:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const responseText = await response.text();
      ('📄 Raw response preview:', responseText.substring(0, 200) + '...');

      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }

      ('📊 Parsed data:', { 
        success: data.success, 
        articlesCount: data.articles?.length || 0, 
        draftsCount: data.drafts?.length || 0,
        error: data.error
      });

      if (data.success) {
        // Articles come from 'articles' collection - all should be published
        const publishedArticles = (data.articles || []).map(item => ({
          ...item,
          status: 'published' // Ensure status is correct
        }));
        
        // Drafts come from 'drafts' collection - all should be drafts
        const draftArticles = (data.drafts || []).map(item => ({
          ...item,
          status: 'draft' // Ensure status is correct
        }));

        setArticles(publishedArticles);
        setDrafts(draftArticles);
        
        ('✅ Content categorized:', { 
          published: publishedArticles.length, 
          drafts: draftArticles.length 
        });
      } else {
        throw new Error(data.error || data.details || 'Failed to fetch content');
      }
    } catch (err) {
      console.error('❌ Error in fetchContent:', err);
      setError(err.message);
      setArticles([]);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when publisherId changes
  useEffect(() => {
    fetchContent();
  }, [publisherId]);

  const publishDraft = async (draftId) => {
    if (!publisherId || !draftId) {
      throw new Error('Publisher ID and Draft ID are required');
    }

    try {
      ('📤 Publishing draft:', draftId);

      const response = await fetch(
        `/api/manage-drafts?publisherId=${publisherId}&draftId=${draftId}&action=publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Refresh content to get updated lists
        await fetchContent();
        ('✅ Draft published successfully');
        return result;
      } else {
        throw new Error(result.error || 'Failed to publish draft');
      }
    } catch (err) {
      console.error('❌ Error publishing draft:', err);
      throw err;
    }
  };

  const deleteArticle = async (articleId) => {
    if (!publisherId || !articleId) {
      throw new Error('Publisher ID and Article ID are required');
    }

    try {
      ('🗑️ Deleting article:', articleId);

      const response = await fetch(
        `/api/publish-article?publisherId=${publisherId}&articleId=${articleId}&collection=articles`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        setArticles(prev => prev.filter(article => article.id !== articleId));
        ('✅ Article deleted successfully');
        return result;
      } else {
        throw new Error(result.error || 'Failed to delete article');
      }
    } catch (err) {
      console.error('❌ Error deleting article:', err);
      throw err;
    }
  };

  const deleteDraft = async (draftId) => {
    if (!publisherId || !draftId) {
      throw new Error('Publisher ID and Draft ID are required');
    }

    try {
      ('🗑️ Deleting draft:', draftId);

      const response = await fetch(
        `/api/manage-drafts?publisherId=${publisherId}&draftId=${draftId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update local state
        setDrafts(prev => prev.filter(draft => draft.id !== draftId));
        ('✅ Draft deleted successfully');
        return result;
      } else {
        throw new Error(result.error || 'Failed to delete draft');
      }
    } catch (err) {
      console.error('❌ Error deleting draft:', err);
      throw err;
    }
  };

  const getStats = () => ({
    publishedCount: articles.length,
    draftCount: drafts.length,
    totalViews: articles.reduce((sum, article) => sum + (article.views || 0), 0),
    totalEngagements: articles.reduce((sum, article) => sum + (article.likes || 0) + (article.comments || 0), 0)
  });

  return {
    articles,
    drafts,
    loading,
    error,
    publishDraft,
    deleteArticle,
    deleteDraft,
    getStats,
    refetch: fetchContent
  };
};