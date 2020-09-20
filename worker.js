const CACHE_NAME = 'todo-cache-v1';
const FILE_TO_CACHE = [
  'todolist.html',
  'src/todolist.css',
  'src/todolist.js',
  'src/vue.esm.browser.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILE_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheKeepList = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (cacheKeepList.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      } else {
        return fetch(event.request);
      }
    })
  );
});
