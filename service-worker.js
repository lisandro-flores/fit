const CACHE_NAME = "v1";
const ASSETS = [ // Archivos a cachear
  "./index.html",
  "./manifest.json",
  "./styles.css",
  "./app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Evento 'install': se ejecuta cuando el Service Worker se instala por primera vez.
self.addEventListener("install", event => {
  event.waitUntil(
	caches.open(CACHE_NAME).then(cache => {
	  return cache.addAll(ASSETS); // Agrega todos los archivos a la caché.
	}).then(() => {
	  // Fuerza la activacion del nuevo Service Worker.
	  return self.skipWaiting();
	})
  );
});

// Evento 'activate': se ejecuta cuando el Service Worker se activa.
self.addEventListener("activate", event => {
  event.waitUntil(
	caches.keys().then(keys =>
	  Promise.all(
		keys
		  .filter(key => key !== CACHE_NAME) // Filtra las caches antiguas.
		  .map(key => caches.delete(key)) // Elimina las cachés antiguas.
	  )
	)
  );
  // Reclama el control de las paginas abiertas.
  self.clients.claim();
});

// Evento 'fetch': se ejecuta para cada peticion de red.
self.addEventListener("fetch", event => {
  event.respondWith(
	caches.match(event.request).then(cachedResponse => {
	  return (
		cachedResponse || // Si está en caché, devuelve la respuesta cacheada.
		fetch(event.request).then(networkResponse => {
		  return caches.open(CACHE_NAME).then(cache => {
			cache.put(event.request, networkResponse.clone()); // Cacha la nueva respuesta.
			return networkResponse; // Devuelve la respuesta de la red.
		  });
		})
	  );
	})
  );
});