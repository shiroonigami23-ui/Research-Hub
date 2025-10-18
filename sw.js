// A version number for the cache.
// Changing this version will trigger the 'activate' event and clear old caches.
const CACHE_NAME = 'research-hub-cache-v1';

// A list of all the essential files the app needs to work offline.
// This is often called the "App Shell".
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  'https://cdn.tailwindcss.com', // Caching the CDN script
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' // Caching the font file
];

// --- INSTALL Event ---
// This event is fired when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // waitUntil() ensures that the service worker will not install until the
  // code inside has successfully completed.
  event.waitUntil(
    // Open the cache by name.
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // Add all the specified URLs to the cache.
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// --- ACTIVATE Event ---
// This event is fired when the service worker is activated.
// It's a good place to clean up old caches.
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // If a cache's name is not the current one, delete it.
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


// --- FETCH Event ---
// This event is fired for every network request the page makes.
self.addEventListener('fetch', (event) => {
  // We use respondWith() to hijack the request and provide our own response.
  event.respondWith(
    // Check if the requested resource is in the cache.
    caches.match(event.request)
      .then((response) => {
        // If the resource is found in the cache, return it.
        if (response) {
          console.log('Service Worker: Found in cache', event.request.url);
          return response;
        }

        // If the resource is not in the cache, fetch it from the network.
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request);
      })
  );
});
