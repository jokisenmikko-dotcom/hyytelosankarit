/* Hyytelösankarit service worker – välimuistin nimi vaihtuu version mukana. */
const CACHE = 'hyyte-v3.5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './RELEASE_NOTES.md',
  './LUE-MINUT.txt',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './vendor/three-r186.js',
  './api.js', './gamepad.js', './game.js', './money.js', './jobs.js',
  './shop.js', './hunger.js', './homes.js', './jobs2.js', './peds.js',
  './gfx.js', './stats.js', './palikka.js', './kikka.js', './moon.js',
  './features.js', './spices.js', './jobs3.js', './weapons.js', './bodies.js',
  './vehicles.js', './menuPad.js', './nature.js', './cooking.js', './circus.js',
  './coop.js', './hatch.js', './tunnel.js', './airplane.js', './wallet.js',
  './night.js', './ui.js', './lobby18.js', './mobile.js', './MOBIILI_ASENNUS.md',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok && req.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
