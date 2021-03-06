// gross hack around one of @codemirror/view bugs
let document = { documentElement: { style: {} } };

importScripts("web.bundle.js");

const state = {
  version: "0.3.1",
  dotlit: typeof dotlit,
  root: "",
  enableCache: false,
  count: 0,
};

const PRECACHE = "precache-v1";
const RUNTIME = "runtime";
const CACHE_FIRST = 'cachefirst-v1';

const CACHE_FIRST_DOMAINS = [
  'https://cdn.skypack.dev',
  'http://cdn.jsdelivr.net',
  'https://cdn.jsdelivr.net',
  'https://unpkg.com/'
]

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  //'index.html',
  //'./', // Alias for index.html
  //'styles.css',
  //'../../styles/main.css',
  //'demo.js'
];

const getMockResponse = async (event) => {
  state.count += 1;
  try {
    if (typeof dotlit !== "undefined") {
      const filepath = event.request.url
        .slice(dotlit.lit.location.base.length - 1, -4)
        .slice();
      const stat = await dotlit.lit.fs.stat(filepath);
      const status = {
        ...state,
        filepath,
        stat,
        method: event.request.method,
      };
      return new Response(JSON.stringify(status, null, 2), {
        headers: { meta: state.version },
      });
    }
  } catch (err) {
    const status = {
      ...state,
      url: event.request.url,
      err: err.message,
    };
    return new Response(JSON.stringify(status, null, 2));
  }
};

const localFile = async (event) => {
  if (typeof dotlit !== "undefined") {
    const filepath = event.request.url
      .slice(dotlit.lit.location.base.length - 1)
      .slice();
    await dotlit.lit.fs.stat(filepath);
    let jsFile;
    const content = await dotlit.lit.fs.readFile(filepath, { localOnly: true });
    state.count += 1;
    return new Response(content, {
      headers: {
        server: `dotlit.org/sw@${state.version}`,
        "Content-Type":
          dotlit.lit.utils.mime.contentType(
            dotlit.lit.utils.path.extname(filepath)
          ) || "text/plain",
      },
    });
  } else throw new Error("dotlit module not loaded.");
};

// The install handler takes care of precaching the resources we always need.
self.addEventListener("install", (event) => {
  state.root = new URL(location).searchParams.get("root");
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", (event) => {
  const currentCaches = [PRECACHE, RUNTIME, CACHE_FIRST];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});


const isCacheFirstOrigin = (url) => {
  for (const domain of CACHE_FIRST_DOMAINS) {
    if (url.startsWith(domain)) return true
  }  
}

const isSameOrigin = (url) => {
  return url.startsWith(self.location.origin)
}

const fetchAndAddToCache = (event, cacheBucket = RUNTIME) => {
  return caches.match(event.request).then((cachedResponse) => {
    return caches.open(cacheBucket).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Put a copy of the response in the runtime cache.
          return cache
            .put(event.request, response.clone())
            .then(() => {
              return response;
            });
        })
        .catch((err) => {
          if (!cachedResponse) throw err;
          return cachedResponse;
        });
    });
  });
  
}

const cacheFirstHandler = (event) => {
  console.log("Cache first origin request ", event.request.url)
  return caches.match(event.request).then((cachedResponse) => {
    if (cachedResponse) {
      console.log('Serving from cache.')
      return cachedResponse
    } else return fetchAndAddToCache(event, CACHE_FIRST)
  })
}

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener("fetch", (event) => {

  const url = event.request.url
  const method = event.request.method

  // if (method.toLowerCase() !== 'get') return

  // is the request is for a CacheFirst origin
  if (isCacheFirstOrigin(url)) {
    console.log("CACHE FIRST REQUEST", url)
    event.respondWith( cacheFirstHandler(event) )

  // if the requset if for the same origin
  } else if (isSameOrigin(url)) {

    // if its a mock requests
    if (event.request.url.endsWith("--sw")) {
      console.log("Mock/Info request");
      event.respondWith(getMockResponse(event));
    
    // check local filessystem first
    } else {
      event.respondWith(
        localFile(event)
          .then((file) => {
            console.log("Responding with", file);
            return file;
          })
          .catch((err) => {
            console.log("Failed local file check, reverting to network", err);
            return fetchAndAddToCache(event)
          })
      );
    }

  // for everything else fetch and add to cache for when offline
  } else {
    event.respondWith( fetchAndAddToCache(event) )
  }
    
});
