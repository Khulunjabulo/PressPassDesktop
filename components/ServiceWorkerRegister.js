'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service worker in production and if supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      ('🔧 Registering Service Worker...');

      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          ('✅ Service Worker registered successfully:', registration.scope);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  ('🔄 New content is available and will be used when all tabs for this page are closed.');

                  // Optional: Show update notification to user
                  if (window.confirm('New version available! Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Handle messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_STATS') {
              ('📊 Cache stats:', event.data);
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // Handle controller change (when new SW takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        ('🎯 Service Worker controller changed - page will reload');
        window.location.reload();
      });
    } else {
      ('⚠️ Service Worker not supported or not in production mode');
    }
  }, []);

  return null; // This component doesn't render anything
}