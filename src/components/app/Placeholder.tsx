"use client";

import { Button } from "@/components/ui/Button";
import { useVault } from "@/controller/VaultContext";

/** Vorübergehender Inhalt für Ansichten, die noch umgesetzt werden. */
export function Placeholder({ title }: { title: string }) {
  const { entries, lock } = useVault();
  return (
    <div style={{ padding: "32px 40px", display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600 }}>{title}</h1>
      <p style={{ color: "var(--text-2)" }}>
        Diese Ansicht folgt im nächsten Schritt. Im Tresor liegen {entries.length} Einträge.
      </p>
      <Button icon="lock" onClick={() => lock("manual")}>
        Jetzt sperren
      </Button>
    </div>
  );
}
