// A unique name for the cache, updated to trigger a refresh when the service worker changes.
const CACHE_NAME = 'apr-shell-v7';
const DATA_CACHE = 'apr-data-v2';

// Core assets that make up the app's shell. All HTML pages are included for the router.
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/plan.html',
  '/visa.html',
  '/documents.html',
  '/contact.html',
  '/css/style.css',
  '/js/main.js',
  '/js/router.js',
  '/js/ui.js'
];

// On install, pre-cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching all required shell assets');
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

// On activation, clean up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (![CACHE_NAME, DATA_CACHE].includes(k)) {
            return caches.delete(k);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Intercept fetch requests to implement caching strategies.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore requests to external domains.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Strategy 1: Stale-while-revalidate for data files.
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkResponsePromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) cache.put(request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || networkResponsePromise;
      })
    );
    return;
  }
  
  // --- MODIFIED SECTION ---
  // Strategy 2: For direct navigation, serve from cache or network for assets,
  // but fall back to the SPA shell for page routes.
  if (request.mode === 'navigate') {
    // Regex to check for common file extensions in the URL path.
    const isAsset = /\.(png|jpe?g|gif|svg|webp|ico|css|js|woff2?|json|webmanifest)$/.test(url.pathname);

    event.respondWith(
      caches.match(request).then(cachedResponse => {
        // If the exact request is in the cache, always return it.
        if (cachedResponse) {
          return cachedResponse;
        }
        // If it's not in the cache AND it's not an asset, it's a page route.
        // Serve the SPA's index.html.
        if (!isAsset) {
          return caches.match('/index.html').then(response => {
            return response || fetch('/index.html');
          });
        }
        // If it's an asset not in the cache, try fetching it from the network.
        // This will fail gracefully offline, which is the correct behavior
        // for a non-essential asset that wasn't pre-cached.
        return fetch(request);
      })
    );
    return;
  }
  // --- END OF MODIFIED SECTION ---


  // Strategy 3: Cache-first for all other assets (CSS, JS, images, and HTML partials requested by the router).
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request);
    })
  );
});