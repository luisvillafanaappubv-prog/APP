const CACHE_NAME = 'comuna-villafana-v1';
const ARCHIVOS_BASE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './IMAGENES/LOGOAPP1.png',
  './IMAGENES/LOGOAPP2.png'
];

// Instalación del Service Worker en el teléfono
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS_BASE);
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de versiones viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Responder a las solicitudes de la app
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
