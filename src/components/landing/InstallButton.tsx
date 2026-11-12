"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { useInstallPrompt } from "@/controller/useInstallPrompt";
import { ROUTES } from "@/components/app/routes";

/**
 * „App installieren“ – je nach Browser:
 * - Chrome/Edge: öffnet den Installationsdialog des Browsers.
 * - Safari/Firefox: springt zur Anleitung für die manuelle Installation.
 * - bereits installiert: öffnet die App.
 */
export function InstallButton() {
  const { state, install } = useInstallPrompt();

  if (state === "installed") {
    return (
      <ButtonLink href={ROUTES.vault} variant="primary" size="lg" icon="arrowRight">
        App öffnen
      </ButtonLink>
    );
  }
  if (state === "prompt") {
    return (
      <Button variant="primary" size="lg" icon="download" onClick={install}>
        App installieren
      </Button>
    );
  }
  // Kein Installationsdialog verfügbar: zur Anleitung springen.
  return (
    <ButtonLink href="#installation" variant="primary" size="lg" icon="download">
      App installieren
    </ButtonLink>
  );
}
