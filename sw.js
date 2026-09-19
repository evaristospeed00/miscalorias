// Service Worker de MiscalorIAs
// - App assets: stale-while-revalidate
// - Modelo Food-101 ONNX (~58 MB): cache-first (1 descarga, luego instantaneo)
// - CDNs (ort, tfjs, mobilenet, fonts): stale-while-revalidate

const APP_CACHE = 'miscalorias-app-v9';
const MODEL_CACHE = 'miscalorias-model-food101-v1';

const APP_ASSETS = [
    './',
    './index.html',
    './style.css',
    './nutrition-engine.js',
    './app.js',
    './model.js',
    './foods.json',
    './models/food101/config.json',
    './models/food101/preprocessor_config.json',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap',
];

const MODEL_PATTERNS = [
    '/models/food101/',
    '/models/mobilenet/',
    'model_q4.onnx',
    'group1-shard'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(APP_CACHE).then(async (cache) => {
            for (const asset of APP_ASSETS) {
                try {
                    await cache.add(asset);
                } catch (e) {
                    console.warn('SW: no se pudo cachear', asset, e);
                }
            }
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== APP_CACHE && k !== MODEL_CACHE)
                    .map((k) => {
                        console.log('SW: borrando cache obsoleto:', k);
                        return caches.delete(k);
                    })
            )
        )
    );
    self.clients.claim();
});

function isModelRequest(url) {
    return MODEL_PATTERNS.some((p) => url.pathname.includes(p) || url.href.includes(p));
}

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const fetchPromise = fetch(request)
        .then((response) => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => cached);
    return cached || fetchPromise;
}

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (isModelRequest(url)) {
        event.respondWith(cacheFirst(event.request, MODEL_CACHE));
        return;
    }

    if (url.origin === self.location.origin) {
        event.respondWith(staleWhileRevalidate(event.request, APP_CACHE));
        return;
    }

    if (
        url.hostname.includes('cdn.jsdelivr.net') ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('storage.googleapis.com')
    ) {
        event.respondWith(staleWhileRevalidate(event.request, APP_CACHE));
        return;
    }
});
