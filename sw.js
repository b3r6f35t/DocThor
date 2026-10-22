/* DocThor – Offline-Start: Seite und Icon kommen vom Netz (bis 3 s), sonst aus dem Zwischenspeicher. */
var C = 'docthor-v1';
var FILES = ['./', 'index.html', 'icon-180.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // Schnittstelle und Bilder nie abfangen
  e.respondWith(new Promise(function (resolve) {
    var done = false;
    function fromCache() {
      caches.match(r, { ignoreSearch: true }).then(function (m) {
        if (m) { done = true; resolve(m); }
      });
    }
    var t = setTimeout(fromCache, 3000);
    fetch(r).then(function (res) {
      clearTimeout(t);
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(C).then(function (c) { c.put(r, copy); });
      }
      if (!done) { done = true; resolve(res); }
    }).catch(function () {
      clearTimeout(t);
      caches.match(r, { ignoreSearch: true }).then(function (m) { if (!done) { done = true; resolve(m || Response.error()); } });
    });
  }));
});
