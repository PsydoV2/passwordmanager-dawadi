"use client";

import { useEffect, useRef } from "react";
import type { LockReason } from "./VaultContext";

interface AutoLockOptions {
  /** Nur aktiv, solange der Tresor entsperrt ist. */
  active: boolean;
  minutes: number;
  /** Sofort sperren, wenn der Tab in den Hintergrund wechselt. */
  lockWhenHidden: boolean;
  onLock: (reason: LockReason) => void;
}

/** Ereignisse, die als Aktivität zählen und den Sperr-Timer zurücksetzen. */
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;

/**
 * Sperrt den Tresor nach einer einstellbaren Zeit ohne Aktivität
 * und optional, sobald der Tab nicht mehr sichtbar ist.
 */
export function useAutoLock({ active, minutes, lockWhenHidden, onLock }: AutoLockOptions): void {
  // Immer die aktuelle Callback-Funktion verwenden, ohne den Effekt neu zu starten.
  const onLockRef = useRef(onLock);
  useEffect(() => {
    onLockRef.current = onLock;
  }, [onLock]);

  useEffect(() => {
    if (!active) return;

    let timer = 0;
    const restart = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => onLockRef.current("inactivity"), minutes * 60_000);
    };
    const onVisibilityChange = () => {
      if (lockWhenHidden && document.visibilityState === "hidden") onLockRef.current("hidden");
    };

    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, restart, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    restart();

    return () => {
      window.clearTimeout(timer);
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, restart);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [active, minutes, lockWhenHidden]);
}
