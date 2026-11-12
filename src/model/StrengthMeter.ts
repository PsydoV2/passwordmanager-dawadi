import type { StrengthLevel, StrengthResult } from "./types";

/**
 * Bewertet die Stärke eines Passworts in vier Stufen (Schwach, Mittel, Gut, Stark).
 *
 * Eigene, bewusst einfache Regeln, damit die Bewertung nachvollziehbar bleibt:
 *  1. Punkte für Länge (ab 8, 12 und 16 Zeichen) und für Vielfalt (mind. 3 Zeichenarten).
 *  2. Abzug für leicht erratbare Muster.
 *  3. Enthält das Passwort ein sehr häufiges Passwort, ist es immer „Schwach“.
 */

const LABELS: Record<StrengthLevel, StrengthResult["label"]> = {
  0: "",
  1: "Schwach",
  2: "Mittel",
  3: "Gut",
  4: "Stark",
};

/** Kleine Auswahl der häufigsten Passwörter bzw. Bestandteile (Kleinschreibung). */
const COMMON = [
  "passwort",
  "password",
  "admin",
  "qwertz",
  "qwerty",
  "123456",
  "hallo",
  "letmein",
  "welcome",
  "iloveyou",
  "geheim",
  "login",
  "master",
];

/** Anzahl verschiedener Zeichenarten: Klein, Groß, Ziffer, Sonderzeichen. */
function countCharKinds(password: string): number {
  return [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
}

/** Drei gleiche Zeichen („aaa“) oder drei aufeinanderfolgende („abc“, „123“). */
function hasRunOrSequence(password: string): boolean {
  const s = password.toLowerCase();
  for (let i = 0; i + 2 < s.length; i++) {
    const a = s.charCodeAt(i);
    const b = s.charCodeAt(i + 1);
    const c = s.charCodeAt(i + 2);
    if ((a === b && b === c) || (b === a + 1 && c === b + 1)) return true;
  }
  return false;
}

/** Typisches Muster „Wort + Zahl am Ende“, z. B. „musik123“ oder „Zugfahrt2023“. */
function isWordThenNumber(password: string): boolean {
  return /^[A-Za-z]+[0-9]+$/.test(password);
}

export function checkStrength(password: string): StrengthResult {
  if (!password) return { level: 0, label: LABELS[0] };

  const lower = password.toLowerCase();
  if (COMMON.some((word) => lower.includes(word))) {
    return { level: 1, label: LABELS[1] };
  }

  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (password.length >= 16) points++;
  if (countCharKinds(password) >= 3) points++;

  // Höchstens ein Punkt Abzug, auch wenn mehrere Muster zutreffen.
  if (isWordThenNumber(password) || hasRunOrSequence(password)) points--;

  const level = Math.min(4, Math.max(1, points)) as StrengthLevel;
  return { level, label: LABELS[level] };
}

/** Ab welcher Stufe ein Passwort im Sicherheitsbericht als „schwach“ gilt. */
export function isWeak(password: string): boolean {
  return checkStrength(password).level <= 1;
}
