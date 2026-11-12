"use client";

import { useEffect } from "react";

/**
 * Registriert den Service Worker (public/sw.js), damit die App offline startet.
 * Nur im fertigen Build – im Dev-Modus würde der Cache neue Änderungen verdecken.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Ohne Service Worker funktioniert die App weiterhin, nur nicht offline.
    });
  }, []);
}
