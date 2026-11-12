/**
 * Datentypen des Models.
 *
 * Regel für den gesamten Ordner `src/model`: kein Import aus React oder Next.js.
 * Das Model ist reines TypeScript und kennt die Oberfläche nicht (MVC-Trennung).
 */

/** Feste Kategorien, nach denen in der Übersicht gefiltert werden kann. */
export const CATEGORIES = ["Privat", "Arbeit", "Schule", "Finanzen", "Shopping", "Sonstiges"] as const;
export type Category = (typeof CATEGORIES)[number];

/** Ein einzelner Eintrag im Tresor. Zeitangaben als Unix-Zeit in Millisekunden. */
export interface VaultEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  category: Category;
  note: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  /** Wird nur gesetzt, wenn sich das Passwort ändert – Grundlage für „alte Passwörter“. */
  passwordChangedAt: number;
}

/** Eingaben aus dem Formular „Eintrag anlegen / bearbeiten“. Zeitstempel und ID setzt der VaultService. */
export type EntryDraft = Omit<VaultEntry, "id" | "createdAt" | "updatedAt" | "passwordChangedAt">;

/** Entschlüsselter Inhalt des Tresors. Existiert nur im Arbeitsspeicher, solange der Tresor entsperrt ist. */
export interface VaultData {
  entries: VaultEntry[];
}

/** So wird der Tresor in IndexedDB abgelegt: nur verschlüsselt, Salt und IV im Klartext daneben. */
export interface EncryptedVault {
  version: 1;
  /** Salt für PBKDF2 (Base64). */
  salt: string;
  /** Initialisierungsvektor für AES-GCM (Base64). */
  iv: string;
  /** Verschlüsselte VaultData als JSON (Base64). */
  ciphertext: string;
  /** Anzahl der PBKDF2-Iterationen, damit sie später erhöht werden kann. */
  iterations: number;
}

export type Theme = "light" | "dark" | "system";

/** Einstellungen – nicht geheim, werden unverschlüsselt gespeichert. */
export interface Settings {
  autoLockMinutes: 1 | 5 | 15 | 30;
  clipboardClearSeconds: 15 | 30 | 60;
  lockWhenHidden: boolean;
  theme: Theme;
}

export const DEFAULT_SETTINGS: Settings = {
  autoLockMinutes: 5,
  clipboardClearSeconds: 30,
  lockWhenHidden: false,
  theme: "system",
};

/** Optionen für den Passwortgenerator. */
export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  /** Verwechselbare Zeichen wie I, l, 1, O, 0 weglassen. */
  avoidSimilar: boolean;
}

/** Stufen der Stärkeanzeige: 0 = leer, 1 = schwach … 4 = stark. */
export type StrengthLevel = 0 | 1 | 2 | 3 | 4;

export interface StrengthResult {
  level: StrengthLevel;
  label: "" | "Schwach" | "Mittel" | "Gut" | "Stark";
}

/** Befunde des Sicherheitsberichts. */
export type IssueType = "weak" | "reused" | "old";

export interface SecurityIssue {
  entryId: string;
  type: IssueType;
  /** Verständliche Begründung, z. B. „Gleiches Passwort wie bei Netflix“. */
  reason: string;
}
