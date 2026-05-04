const CACHE_NAME = 'ffmpeg-offline-cache-v1';

// These are the exact files we want to save to the browser's memory 
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js',
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
    'https://cdn.jsdelivr.net/npm/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.wasm'
];

// When the page loads for the first time, download and cache everything
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching engine for offline use...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// When the browser asks for a file, intercept it.
// If we have it in the cache, serve it instantly (bypassing firewalls/offline).
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Return the offline saved file
            }
            // If not in cache, try to fetch from the internet, then save it for next time
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch(() => {
            console.error('Offline and file not found in cache:', event.request.url);
        })
    );
});
