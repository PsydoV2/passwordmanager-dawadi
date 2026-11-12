"use client";

import { useServiceWorker } from "@/controller/useServiceWorker";

/** Unsichtbar: registriert nur den Service Worker. */
export function ServiceWorker() {
  useServiceWorker();
  return null;
}
