// gross hack around one of @codemirror/view bugs
let document = { documentElement: { style: {} } };

importScripts("web.bundle.js");

const state = {
  version: "0.2.8",
  dotlit: typeof dotlit,
  root: "",
  enableCache: false,
};

const PRECACHE = Date.now(); // no-cache 'precache-v1';
const RUNTIME = "runtime";

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  //'index.html',
  //'./', // Alias for index.html
  //'styles.css',
  //'../../styles/main.css',
  //'demo.js'
];

const getMockResponse = async (event) => {
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
      };
      return new Response(JSON.stringify(status, null, 2), {headers: {'meta': state.version}});
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
      .slice(dotlit.lit.location.base.length - 1, -4)
      .slice();
    await dotlit.lit.fs.stat(filepath);
    let jsFile;
    if ((/.*\.m?jsx?$/).test(filepath)) {
        jsFile = true
    }
    const content = await dotlit.lit.fs.readFile(filepath);
    return new Response(content,{headers: {'meta': state.version, 'jsFile': jsFile}});
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
  const currentCaches = [PRECACHE, RUNTIME];
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

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests, like those for Google Analytics. And add mock response
  if (event.request.url.startsWith(self.location.origin)) {
    if (event.request.url.endsWith("--sw")) {
      console.log("Mock/Info request");
      event.respondWith(getMockResponse(event));
    } else {
      event.respondWith(
        localFile(event)
          .then((file) => {
            console.log("Responding with", file);
            return file;
          })
          .catch((err) => {
            console.log("Failed local file check, reverting to network", err);
            return caches.match(event.request).then((cachedResponse) => {
              if (state.enableCache && cachedResponse) {
                return cachedResponse;
              }

              return caches.open(RUNTIME).then((cache) => {
                return fetch(event.request).then((response) => {
                  // Put a copy of the response in the runtime cache.
                  return cache.put(event.request, response.clone()).then(() => {
                    return response;
                  });
                });
              });
            });
          })
      );
    }
  }
});
