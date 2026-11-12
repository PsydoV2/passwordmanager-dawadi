/*
 * Service Worker von Latch – sorgt dafür, dass die App auch offline startet.
 *
 * Wichtig: Der Service Worker speichert nur die App selbst (HTML, JavaScript, CSS, Schriften, Icons).
 * Der Tresor liegt verschlüsselt in IndexedDB und hat mit diesem Cache nichts zu tun.
 *
 * Ablauf:
 * 1. install:  alle Dateien der App vorab in den Cache legen (Liste wird beim Build eingefügt).
 * 2. activate: Caches älterer Versionen löschen.
 * 3. fetch:    Seiten zuerst aus dem Netz laden (damit Updates ankommen), sonst aus dem Cache.
 *              Dateien unter /_next/static/ ändern sich nie (Name enthält einen Hash) → direkt aus dem Cache.
 */

// Beide Werte ersetzt scripts/precache.mjs nach `next build`. Im Dev-Modus wird der Service Worker nicht registriert.
const VERSION = "dev";
const PRECACHE_URLS = [];

const CACHE = `latch-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map(async (url) => {
            const response = await clean(await fetch(url, { cache: "reload" }));
            if (!response.ok) throw new Error(`${url}: ${response.status}`);
            await cache.put(url, response);
          }),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith("latch-") && key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/**
 * Antworten nach einer Weiterleitung (z. B. /app → /app/) darf der Browser nicht für Seitenaufrufe
 * verwenden. Deshalb wird so eine Antwort als „normale“ Antwort neu verpackt.
 */
async function clean(response) {
  if (!response.redirected) return response;
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/** Netz zuerst, bei Fehler (offline) aus dem Cache. Erfolgreiche Antworten werden für später gespeichert. */
async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);
  try {
    const response = await clean(await fetch(request));
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ?? (fallbackUrl && (await cache.match(fallbackUrl)));
    if (cached) return cached;
    throw error;
  }
}

/** Cache zuerst – für Dateien, deren Inhalt sich unter derselben Adresse nie ändert. */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Seitenaufruf: unbekannte Adressen unter /app/ fallen offline auf die Tresor-Seite zurück.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, url.pathname.startsWith("/app") ? "/app/" : "/"));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Alles andere (Daten für Seitenwechsel, Manifest, Icons): Netz zuerst, offline aus dem Cache.
  event.respondWith(networkFirst(request));
});
