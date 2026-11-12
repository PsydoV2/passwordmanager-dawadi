/**
 * Auftrag an die Tresor-Übersicht, der beim Seitenwechsel mitgegeben wird –
 * z. B. „Neuen Eintrag mit diesem Passwort anlegen“ aus dem Generator oder
 * „Diesen Eintrag bearbeiten“ aus dem Sicherheitsbericht.
 *
 * Bewusst nur im Arbeitsspeicher und nicht in der URL: Ein Passwort in der Adresszeile
 * würde im Verlauf des Browsers landen.
 */
export type VaultIntent = { kind: "new"; password: string } | { kind: "edit"; id: string };

let pending: VaultIntent | null = null;

export function setVaultIntent(intent: VaultIntent): void {
  pending = intent;
}

/** Liefert den Auftrag genau einmal und löscht ihn danach. */
export function takeVaultIntent(): VaultIntent | null {
  const intent = pending;
  pending = null;
  return intent;
}
