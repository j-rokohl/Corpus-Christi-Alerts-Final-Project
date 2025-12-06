const CACHE_NAME = "corpus-christi-alerts-v9"

const ASSETS_TO_CACHE = [
    "/",
    // Pages
    "/index.html",
    "/pages/about.html",
    "/pages/alerts.html",
    "/pages/auth.html",
    "/pages/contact.html",
    "/pages/forecasts.html",
    "/pages/lake-levels.html",
    "/pages/notes.html",
    "/pages/icons.html",
    // "/index",  // For Netlify Friendly URLs
    // "/pages/about", // For Netlify Friendly URLs
    // "/pages/alerts",  // For Netlify Friendly URLs
    // "/pages/auth",  // For Netlify Friendly URLs
    // "/pages/contact",  // For Netlify Friendly URLs
    // "/pages/forecasts",  // For Netlify Friendly URLs
    // "/pages/lake-levels",  // For Netlify Friendly URLs
    // "/pages/notes",  // For Netlify Friendly URLs
    // "/pages/icons",  // For Netlify Friendly URLs
    // CSS
    "/css/materialize.min.css",
    "/css/style.css",
    // Icon
    "/icon/icon-16x16.png",
    "/icon/icon-32x32.png",
    "/icon/icon-192x192.png",
    "/icon/icon-512x512.png",
    // JS
    "/js/alert.js",
    "/js/firebaseConfig.js",
    "/js/firebaseDB.js",
    "/js/forecast.js",
    "/js/graphicast.js",
    "/js/lake-level.js",
    "/js/materialize.min.js",
    "/js/menus.js",
    "/js/protectedPage.js",
    "/js/signin.js",
    "/js/ui.js",
    "/js/uiUnprotected.js",
    "/js/unprotectedPage.js"
];

self.addEventListener("install", (event) => {
    console.log("Service worker: Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Service worker: caching files");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log("Service Worker: Deleting Old Caches");
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    console.log('Service Worker: Fetching...', event.request.url);
    if (event.request.method === 'POST') {
        // Handle POST requests differently.
        event.respondWith(fetch(event.request)); // Example: network-only
    } else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone()); //Update cache with new response
                        return networkResponse;
                    })
                })
            })
        );
    }
});