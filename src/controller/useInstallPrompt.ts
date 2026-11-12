"use client";

import { useCallback, useEffect, useState } from "react";

/** Ereignis, das Chrome und Edge auslösen, wenn die Seite installiert werden kann (nicht in allen Typdefinitionen enthalten). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * - `prompt`:   Browser bietet die Installation an → Button öffnet den Installationsdialog.
 * - `manual`:   Safari/Firefox o. Ä. → Hinweis, wie man manuell installiert.
 * - `installed`: Läuft bereits als installierte App oder wurde gerade installiert.
 */
export type InstallState = "prompt" | "manual" | "installed";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari auf iPhone/iPad kennt nur diese Eigenschaft.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Steuerung für den Button „App installieren“ auf der Startseite. */
export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState<InstallState>("manual");

  useEffect(() => {
    if (isStandalone()) setState("installed");

    const onPrompt = (e: Event) => {
      // Die Mini-Infoleiste des Browsers unterdrücken – wir zeigen einen eigenen Button.
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      setState("prompt");
    };
    const onInstalled = () => {
      setEvent(null);
      setState("installed");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  /** Öffnet den Installationsdialog des Browsers. Das Ereignis darf nur einmal verwendet werden. */
  const install = useCallback(async () => {
    if (!event) return;
    await event.prompt();
    const { outcome } = await event.userChoice;
    setEvent(null);
    setState(outcome === "accepted" ? "installed" : "manual");
  }, [event]);

  return { state, install };
}
