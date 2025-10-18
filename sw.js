const CACHE_NAME = 'research-hub-cache-v3'; // Bumped version for the new video

// Updated list of files to cache for offline use
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // CSS files
  '/css/main.css',
  '/css/components.css',
  // JS modules
  '/js/main.js',
  '/js/dom.js',
  '/js/events.js',
  '/js/state.js',
  // PWA icons
  '/icon-192.png',
  '/icon-512.png',
  '/image.png',
  // *** NEW: Caching the background video ***
  '/menu-background.mp4',
  // External resources
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(URLS_TO_CACHE).catch(err => {
          console.error('Failed to cache:', err);
        });
      })
  );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // For video, use a cache-first, then network strategy
    if (event.request.url.endsWith('.mp4')) {
        event.respondWith(
            caches.match(event.request).then(cacheResponse => {
                return cacheResponse || fetch(event.request).then(networkResponse => {
                    // Optional: You could add the video to cache here if it wasn't pre-cached
                    return networkResponse;
                });
            })
        );
        return;
    }

    // For all other requests, use a standard cache-first strategy
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            return response || fetch(event.request);
        })
    );
});
