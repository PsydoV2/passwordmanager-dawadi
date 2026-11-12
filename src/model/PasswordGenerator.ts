import type { GeneratorOptions } from "./types";

/**
 * Erzeugt zufällige Passwörter.
 *
 * Als Zufallsquelle dient ausschließlich `crypto.getRandomValues` (kryptografisch sicher),
 * niemals `Math.random`.
 */

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 64;

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: true,
  avoidSimilar: true,
};

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!#$%&*+-=?@_",
} as const;

/** Zeichen, die man beim Abtippen leicht verwechselt. */
const SIMILAR = /[IlO01]/g;

type CharsetKey = keyof typeof CHARSETS;
const CHARSET_KEYS: CharsetKey[] = ["uppercase", "lowercase", "digits", "symbols"];

/** Liefert die aktiven Zeichengruppen. Ist keine gewählt, werden Kleinbuchstaben verwendet. */
function activeGroups(options: GeneratorOptions): string[] {
  const groups = CHARSET_KEYS.filter((key) => options[key]).map((key) =>
    options.avoidSimilar ? CHARSETS[key].replace(SIMILAR, "") : CHARSETS[key],
  );
  return groups.length > 0 ? groups : [CHARSETS.lowercase];
}

/**
 * Gleichverteilte Zufallszahl im Bereich 0 … max-1.
 * Werte oberhalb des größten Vielfachen von `max` werden verworfen,
 * damit einzelne Zeichen nicht häufiger vorkommen als andere (kein Modulo-Bias).
 */
function randomIndex(max: number): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
}

function clampLength(length: number): number {
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.round(length)));
}

/**
 * Erzeugt ein Passwort nach den gewählten Optionen.
 * Aus jeder gewählten Zeichengruppe kommt mindestens ein Zeichen vor.
 */
export function generatePassword(options: GeneratorOptions): string {
  const length = clampLength(options.length);
  const groups = activeGroups(options);
  const pool = groups.join("");

  // Zuerst je ein Zeichen pro Gruppe, der Rest aus dem gesamten Vorrat.
  const chars = groups.map((group) => group[randomIndex(group.length)]);
  while (chars.length < length) {
    chars.push(pool[randomIndex(pool.length)]);
  }

  // Mischen (Fisher-Yates), damit die Pflichtzeichen nicht immer vorne stehen.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

/** Geschätzte Stärke in Bit (Länge × log2 der Zeichenvorratsgröße), z. B. für die Anzeige „≈ 128 Bit“. */
export function entropyBits(options: GeneratorOptions): number {
  const poolSize = activeGroups(options).join("").length;
  return Math.round(clampLength(options.length) * Math.log2(poolSize));
}
