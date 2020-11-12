workbox.core.setCacheNameDetails({
  prefix: 'orange-to-do',
  suffix: 'v1.0.0'
});

workbox.skipWaiting();
workbox.clientsClaim();

workbox.precaching.precacheAndRoute(self.__precacheManifest || []);

workbox.routing.registerRoute(
  /\.(?:js)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'js-cache',
    plugins: [
      //设置过期时间和最大数量
      new workbox.expiration.Plugin({
        maxEntries: 20,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      })
    ],
  })
);

workbox.precaching.precacheAndRoute([
  "/app.js",
]);
