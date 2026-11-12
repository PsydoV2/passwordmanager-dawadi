"use client";

import { useMemo } from "react";
import { CATEGORIES } from "@/model/types";
import { countByCategory, filterEntries, type CategoryFilter } from "@/model/VaultService";
import { useVault } from "./VaultContext";

/** Kategorien für Auswahlfelder in der View. */
export { CATEGORIES };

export const CATEGORY_FILTERS: CategoryFilter[] = ["Alle", ...CATEGORIES];

/** Gefilterte und sortierte Einträge für die Übersicht sowie die Zahlen für die Filter-Chips. */
export function useEntryList(query: string, category: CategoryFilter) {
  const { entries, report } = useVault();
  const list = useMemo(() => filterEntries(entries, { query, category }), [entries, query, category]);
  const counts = useMemo(() => countByCategory(entries), [entries]);
  return { list, counts, total: entries.length, issues: report.byEntry };
}
