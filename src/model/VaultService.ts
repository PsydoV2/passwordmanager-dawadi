import { CATEGORIES, type Category, type EntryDraft, type VaultData, type VaultEntry } from "./types";

/**
 * Geschäftslogik für die Einträge im Tresor.
 *
 * Alle Funktionen sind „rein“: Sie verändern die übergebenen Daten nicht,
 * sondern liefern einen neuen Stand zurück. Speichern übernimmt der Controller.
 */

export type CategoryFilter = Category | "Alle";

export interface EntryFilter {
  query: string;
  category: CategoryFilter;
}

export function emptyVault(): VaultData {
  return { entries: [] };
}

export function emptyDraft(): EntryDraft {
  return { title: "", username: "", password: "", url: "", category: "Privat", note: "", favorite: false };
}

/** Wandelt einen bestehenden Eintrag in Formulardaten um (für „Bearbeiten“). */
export function toDraft(entry: VaultEntry): EntryDraft {
  const { title, username, password, url, category, note, favorite } = entry;
  return { title, username, password, url, category, note, favorite };
}

export type DraftErrors = Partial<Record<keyof EntryDraft, string>>;

/** Prüft die Formulardaten. Leeres Objekt = alles in Ordnung. */
export function validateDraft(draft: EntryDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (draft.title.trim() === "") {
    errors.title = "Bitte gib einen Titel ein, damit du den Eintrag wiederfindest.";
  }
  if (!CATEGORIES.includes(draft.category)) {
    errors.category = "Bitte wähle eine Kategorie.";
  }
  return errors;
}

/** Entfernt überflüssige Leerzeichen; das Passwort bleibt unverändert. */
function clean(draft: EntryDraft): EntryDraft {
  return {
    ...draft,
    title: draft.title.trim(),
    username: draft.username.trim(),
    url: draft.url.trim(),
    note: draft.note.trim(),
  };
}

export function addEntry(data: VaultData, draft: EntryDraft, now: number = Date.now()): { data: VaultData; entry: VaultEntry } {
  const entry: VaultEntry = {
    ...clean(draft),
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    passwordChangedAt: now,
  };
  return { data: { ...data, entries: [...data.entries, entry] }, entry };
}

export function updateEntry(data: VaultData, id: string, draft: EntryDraft, now: number = Date.now()): VaultData {
  return {
    ...data,
    entries: data.entries.map((entry) => {
      if (entry.id !== id) return entry;
      const passwordChanged = entry.password !== draft.password;
      return {
        ...entry,
        ...clean(draft),
        updatedAt: now,
        // Nur ein neues Passwort setzt das „Alter“ für den Sicherheitsbericht zurück.
        passwordChangedAt: passwordChanged ? now : entry.passwordChangedAt,
      };
    }),
  };
}

export function deleteEntry(data: VaultData, id: string): VaultData {
  return { ...data, entries: data.entries.filter((entry) => entry.id !== id) };
}

export function toggleFavorite(data: VaultData, id: string): VaultData {
  return {
    ...data,
    entries: data.entries.map((entry) => (entry.id === id ? { ...entry, favorite: !entry.favorite } : entry)),
  };
}

export function findEntry(data: VaultData, id: string): VaultEntry | undefined {
  return data.entries.find((entry) => entry.id === id);
}

/** Sucht in Titel, Benutzername und Website; filtert nach Kategorie; sortiert alphabetisch. */
export function filterEntries(entries: VaultEntry[], filter: EntryFilter): VaultEntry[] {
  const query = filter.query.trim().toLocaleLowerCase("de");
  return entries
    .filter((entry) => filter.category === "Alle" || entry.category === filter.category)
    .filter((entry) => {
      if (!query) return true;
      return `${entry.title} ${entry.username} ${entry.url}`.toLocaleLowerCase("de").includes(query);
    })
    .sort((a, b) => a.title.localeCompare(b.title, "de", { sensitivity: "base" }));
}

/** Anzahl der Einträge je Kategorie, inklusive „Alle“ – für die Filter-Chips. */
export function countByCategory(entries: VaultEntry[]): Record<CategoryFilter, number> {
  const counts = { Alle: entries.length } as Record<CategoryFilter, number>;
  for (const category of CATEGORIES) {
    counts[category] = entries.filter((entry) => entry.category === category).length;
  }
  return counts;
}
