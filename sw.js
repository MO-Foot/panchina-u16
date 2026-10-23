/* Panchina U16: copia offline. Cambia VERSION a ogni aggiornamento dell'app. */
const VERSION = 'panchina-v114';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
// all'installazione scarica sempre dal server (mai dalla cache del browser)
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(u => new Request(u, {cache:'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Prima la rete (sempre l'ultima versione), poi la copia salvata se non c'è connessione.
  // Nota: una richiesta di navigazione non si può riusare con opzioni, quindi si riparte dall'indirizzo.
  const net = req.mode === 'navigate' ? fetch(req.url, {cache:'no-store', credentials:'same-origin'}) : fetch(req, {cache:'no-cache'});
  e.respondWith(net.then(r => { if(r && r.ok){ const copy = r.clone(); caches.open(VERSION).then(c => c.put(req.mode === 'navigate' ? './index.html' : req, copy)); } return r; })
    .catch(() => caches.match(req, {ignoreSearch:true}).then(r => r || caches.match('./index.html'))));
});
