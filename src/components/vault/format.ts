/** Anzeige-Hilfen für Datum und Links (reine Darstellung, keine Geschäftslogik). */

const relative = new Intl.RelativeTimeFormat("de", { numeric: "auto" });
const dateFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

/** „heute“, „vor 3 Tagen“, „vor 2 Monaten“, „vor 3 Jahren“ */
export function relativeAge(timestamp: number, now: number = Date.now()): string {
  const days = Math.round((now - timestamp) / 86_400_000);
  if (days < 1) return "heute";
  if (days < 30) return relative.format(-days, "day");
  const months = Math.round(days / 30.44);
  if (months < 24) return relative.format(-months, "month");
  return relative.format(-Math.round(days / 365.25), "year");
}

export function formatDate(timestamp: number): string {
  return dateFormat.format(new Date(timestamp));
}

/** Fügt bei Bedarf https:// hinzu, damit „github.com“ als Link funktioniert. */
export function websiteHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** Zeichenart für die farbige Passwortanzeige. */
export function charKind(char: string): "digit" | "symbol" | "letter" {
  if (/[0-9]/.test(char)) return "digit";
  if (/[^A-Za-z]/.test(char)) return "symbol";
  return "letter";
}
