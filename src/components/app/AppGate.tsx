"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApplyTheme } from "@/controller/useApplyTheme";
import { useVault, type VaultStatus } from "@/controller/VaultContext";
import { AppShell } from "./AppShell";
import styles from "./AppShell.module.css";
import { ROUTES } from "./routes";

/** Welche Seite zu welchem Zustand gehört. */
function targetFor(status: VaultStatus, path: string): string | null {
  if (status === "empty" && path !== ROUTES.setup) return ROUTES.setup;
  if (status === "locked" && path !== ROUTES.unlock) return ROUTES.unlock;
  if (status === "unlocked" && (path === ROUTES.setup || path === ROUTES.unlock)) return ROUTES.vault;
  return null;
}

/** Pfad immer mit abschließendem Schrägstrich vergleichen. */
function normalize(path: string): string {
  return path.endsWith("/") ? path : `${path}/`;
}

/**
 * Sorgt dafür, dass immer die passende Seite angezeigt wird:
 * kein Tresor → Einrichten, gesperrt → Entsperren, entsperrt → App mit Navigation.
 */
export function AppGate({ children }: { children: React.ReactNode }) {
  const { status, settings } = useVault();
  const router = useRouter();
  const path = normalize(usePathname());
  const target = status === "loading" ? null : targetFor(status, path);

  useApplyTheme(settings.theme);

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (status === "loading" || target) {
    return (
      <div className={styles.loading} role="status">
        Tresor wird geladen …
      </div>
    );
  }
  if (path === ROUTES.setup || path === ROUTES.unlock) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}
