// Service Worker for PressPass News Reader
const CACHE_NAME = 'presspass-v1.0.0';
const STATIC_CACHE = 'presspass-static-v1.0.0';
const API_CACHE = 'presspass-api-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/news-reader',
  '/Presspass.png',
  '/favicon.ico',
  '/globals.css',
  '/layout.js'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/news-sources',
  '/api/news-sources/',
  '/api/news-sources/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Default fetch for other requests
  event.respondWith(fetch(request));
});

// Handle API requests with caching
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cacheKey = `${request.method}-${url.pathname}${url.search}`;

  try {
    // Try network first for API calls
    const networkResponse = await fetch(request.clone());

    // Cache successful GET responses
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      cache.put(cacheKey, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {

    // Try cache fallback
    const cachedResponse = await caches.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for critical endpoints
    if (url.pathname === '/api/news-sources') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Offline - Please check your connection',
          offline: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    throw error;
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  // This could sync offline actions like favorites, reading progress, etc.
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/Presspass.png',
      badge: '/Presspass.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/news-reader')
  );
});

// Periodic background fetch (if needed)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  // Implement periodic content sync here
  // Could prefetch popular articles, update caches, etc.
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    caches.keys().then((cacheNames) => {
      const stats = {
        cacheNames,
        timestamp: Date.now()
      };
      event.ports[0].postMessage(stats);
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});