const CACHE_NAME = "giappone-v1";
const CORE_ASSETS = [
  "index.html",
  "checklist.html",
  "budget.html",
  "emergenza.html",
  "cover.jpg",
  "manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Rete prima (per avere sempre dati aggiornati), cache come riserva se offline
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if(event.request.method === "GET" && event.request.url.startsWith(self.location.origin)){
            cache.put(event.request, resClone);
          }
        });
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
