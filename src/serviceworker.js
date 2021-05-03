
// gross hack around one of @codemirror/view bugs
let document = { documentElement: { style: {} } }

importScripts('web.bundle.js')

const state = {
    version: '0.0.16',
    dotlit: typeof dotlit,
    root: '',
}

const ENABLE_CACHE = false
const PRECACHE = Date.now() // no-cache 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  //'index.html',
  //'./', // Alias for index.html
  //'styles.css',
  //'../../styles/main.css',
  //'demo.js'
];

const getMockResponse = async (event) => {
    return new Response(JSON.stringify(state, null, 2))
}

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  state.root = new URL(location).searchParams.get('root')
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics. And add mock response
  if (event.request.url.startsWith(self.location.origin)) {
    if (event.request.url.endsWith('--sw')) {
       // event.respondWith(getMockResponse(event))
       event.respondWith(getMockResponse(event))
    }
    else event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (ENABLE_CACHE && cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});