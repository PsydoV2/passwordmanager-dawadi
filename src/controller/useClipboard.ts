"use client";

import { useCallback } from "react";
import { useVault } from "./VaultContext";

interface CopyOptions {
  /** Sensible Inhalte (Passwörter) werden nach der eingestellten Zeit wieder gelöscht. */
  sensitive?: boolean;
}

/**
 * Kopieren in die Zwischenablage mit automatischem Leeren.
 *
 * Einschränkung: Browser erlauben das Schreiben in die Zwischenablage nur, solange die Seite
 * im Vordergrund ist. Ist der Tab beim Ablauf der Zeit im Hintergrund, kann nicht geleert werden.
 * Der Inhalt wird außerdem nicht vorher gelesen (das würde eine Berechtigungsabfrage auslösen);
 * hat man inzwischen etwas anderes kopiert, wird auch das geleert.
 */
/**
 * Ein gemeinsamer Timer für die ganze App (außerhalb von React), damit das Leeren
 * auch dann stattfindet, wenn man nach dem Kopieren zu einer anderen Seite wechselt.
 */
let clearTimer = 0;

export function useClipboard() {
  const { settings } = useVault();

  const copy = useCallback(
    async (text: string, { sensitive = false }: CopyOptions = {}) => {
      await navigator.clipboard.writeText(text);
      window.clearTimeout(clearTimer);
      if (!sensitive) return;
      clearTimer = window.setTimeout(() => {
        navigator.clipboard.writeText("").catch(() => {
          // Seite nicht im Fokus – siehe Einschränkung oben.
        });
      }, settings.clipboardClearSeconds * 1000);
    },
    [settings.clipboardClearSeconds],
  );

  return { copy, clearSeconds: settings.clipboardClearSeconds };
}
