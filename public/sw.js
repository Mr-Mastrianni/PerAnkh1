/**
 * Per Ankh Service Worker
 * Provides offline caching for static assets and pages.
 */

const CACHE_NAME = 'per-ankh-v1';

// Assets to pre-cache on install
const PRECACHE_URLS = [
    '/',
    '/pages/index.html'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests and chrome-extension URLs
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            return fetch(event.request).then(response => {
                // Cache successful responses for HTML and static assets
                if (response.ok && (
                    event.request.destination === 'document' ||
                    event.request.destination === 'style' ||
                    event.request.destination === 'script' ||
                    event.request.destination === 'image' ||
                    event.request.destination === 'font'
                )) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                // Offline fallback for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('/pages/index.html');
                }
            });
        })
    );
});
