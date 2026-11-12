"use client";

import { useEffect } from "react";
import type { Theme } from "@/model/types";

/**
 * Überträgt die Einstellung „Erscheinungsbild“ auf das <html>-Element.
 * Bei „System“ wird das Attribut entfernt – dann entscheidet die CSS-Media-Query.
 */
export function useApplyTheme(theme: Theme): void {
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
}
