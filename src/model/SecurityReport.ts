import { containsCommonPassword, isWeak, isWordThenNumber } from "./StrengthMeter";
import type { IssueType, SecurityIssue, VaultEntry } from "./types";

/**
 * Sicherheitsbericht: findet schwache, mehrfach verwendete und alte Passwörter.
 *
 * Jeder Eintrag erscheint höchstens einmal, und zwar mit dem wichtigsten Befund
 * (schwach vor mehrfach verwendet vor alt). So ergibt die Summe der Gruppen
 * genau die Zahl der Einträge, die Aufmerksamkeit brauchen.
 */

/** Ab diesem Alter gilt ein Passwort als „alt“. */
export const OLD_AFTER_MONTHS = 12;
const MONTH_MS = 1000 * 60 * 60 * 24 * 30.44;

export interface SecurityReport {
  weak: SecurityIssue[];
  reused: SecurityIssue[];
  old: SecurityIssue[];
  /** Einträge ohne Befund. */
  okCount: number;
  /** Einträge mit mindestens einem Befund. */
  issueCount: number;
  total: number;
  /** Schneller Zugriff auf den Befund eines Eintrags, z. B. für Hinweise in der Liste. */
  byEntry: Map<string, SecurityIssue>;
}

export function monthsSince(timestamp: number, now: number = Date.now()): number {
  return Math.floor((now - timestamp) / MONTH_MS);
}

function weakReason(password: string): string {
  if (containsCommonPassword(password)) return "Enthält ein sehr häufiges Passwort und ist leicht zu erraten";
  if (isWordThenNumber(password)) return `Nur ein Wort mit angehängter Zahl (${password.length} Zeichen)`;
  if (password.length < 12) return `Nur ${password.length} Zeichen lang`;
  return "Leicht zu erratendes Muster";
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} und ${names[names.length - 1]}`;
}

export function buildSecurityReport(entries: VaultEntry[], now: number = Date.now()): SecurityReport {
  // Einträge nach Passwort gruppieren, um Mehrfachverwendung zu finden.
  const byPassword = new Map<string, VaultEntry[]>();
  for (const entry of entries) {
    if (!entry.password) continue;
    const group = byPassword.get(entry.password) ?? [];
    group.push(entry);
    byPassword.set(entry.password, group);
  }

  const byEntry = new Map<string, SecurityIssue>();
  const add = (entry: VaultEntry, type: IssueType, reason: string) => {
    byEntry.set(entry.id, { entryId: entry.id, type, reason });
  };

  for (const entry of entries) {
    if (!entry.password) continue;
    const sameAs = (byPassword.get(entry.password) ?? []).filter((other) => other.id !== entry.id);
    const age = monthsSince(entry.passwordChangedAt, now);

    if (isWeak(entry.password)) {
      add(entry, "weak", weakReason(entry.password));
    } else if (sameAs.length > 0) {
      add(entry, "reused", `Gleiches Passwort wie bei ${joinNames(sameAs.map((e) => e.title))}`);
    } else if (age >= OLD_AFTER_MONTHS) {
      add(entry, "old", `Zuletzt geändert vor ${age} Monaten`);
    }
  }

  const issues = [...byEntry.values()];
  const sortByTitle = (list: SecurityIssue[]) => {
    const title = (id: string) => entries.find((e) => e.id === id)?.title ?? "";
    return list.sort((a, b) => title(a.entryId).localeCompare(title(b.entryId), "de"));
  };

  return {
    weak: sortByTitle(issues.filter((i) => i.type === "weak")),
    reused: sortByTitle(issues.filter((i) => i.type === "reused")),
    old: sortByTitle(issues.filter((i) => i.type === "old")),
    okCount: entries.length - byEntry.size,
    issueCount: byEntry.size,
    total: entries.length,
    byEntry,
  };
}
