const STATIC_CACHE_NAME = 'daycare-static-cache-v1';
const DYNAMIC_CACHE_NAME = 'daycare-dynamic-cache-v1';
const API_CACHE_NAME = 'daycare-api-cache-v1';

const APP_SHELL = [
    '/',
    '/index.html',
    '/faq.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then(cache => {
            console.log('Pre-caching App Shell');
            return cache.addAll(APP_SHELL);
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API requests: Network first, then cache for GET requests
    if (url.pathname.startsWith('/api/data')) {
        event.respondWith(
            fetch(event.request)
            .then(networkResponse => {
                if (event.request.method === 'GET') {
                    caches.open(API_CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }
    
    // HTML file: Network first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
            .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Other requests (CSS, JS, Fonts, Images): Cache with network fallback
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                // Cache successful responses from our domain and CDNs
                if (fetchResponse.ok) {
                    const cacheName = url.hostname.includes('aistudiocdn') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')
                        ? STATIC_CACHE_NAME // Cache CDN resources in static cache
                        : DYNAMIC_CACHE_NAME; // Cache our own dynamic assets
                    
                    caches.open(cacheName).then(cache => {
                        cache.put(event.request, fetchResponse.clone());
                    });
                }
                return fetchResponse;
            });
        })
    );
});