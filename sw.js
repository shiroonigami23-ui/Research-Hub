const CACHE_NAME = 'research-hub-v8'; // Incremented version
const urlsToCache = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/components.css',
    '/js/main.js',
    '/js/dom.js',
    '/js/state.js',
    '/js/events.js',
    '/manifest.json',
    '/image.png',
    '/icon-512.png',
    '/menu-background.mp4',
    '/profile-background.mp4',
    '/default.png' // Add the new profile picture
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // Use { cache: 'reload' } to ensure we get the latest versions from the network
                const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
                return cache.addAll(requests);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not in cache - fetch from network
                return fetch(event.request);
            }
        )
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
