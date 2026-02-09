// CREATE THIS UTILITY FILE: lib/publisherIdUtils.js

/**
 * Normalizes publisher ID by removing 'publisher_' prefix if it exists
 * This ensures consistency across the app
 */
export function normalizePublisherId(publisherId) {
  if (!publisherId) return null;
  
  // Remove 'publisher_' prefix if it exists
  const normalized = publisherId.replace(/^publisher_/, '');
  
  ('🔧 Normalized publisher ID:', publisherId, '→', normalized);
  return normalized;
}

/**
 * Adds 'publisher_' prefix if it doesn't exist
 * Use this when storing in Firestore collections that expect the prefix
 */
export function addPublisherPrefix(publisherId) {
  if (!publisherId) return null;
  
  // Don't add prefix if it already exists
  if (publisherId.startsWith('publisher_')) {
    return publisherId;
  }
  
  return `publisher_${publisherId}`;
}

/**
 * Gets clean publisher ID from various sources
 * Handles localStorage, URL params, and direct values
 */
export function getCleanPublisherId(source) {
  if (!source) return null;
  
  let publisherId = null;
  
  // If it's an object (like from useParams), get the publisherId property
  if (typeof source === 'object') {
    publisherId = source.publisherId || source.id;
  } else {
    publisherId = source;
  }
  
  // Normalize it
  return normalizePublisherId(publisherId);
}