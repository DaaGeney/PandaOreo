// Service worker mínimo para que la app sea instalable.
// Pasa todo directo a la red: los datos de la rifa siempre frescos,
// sin cachés que muestren números desactualizados.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request))
})
