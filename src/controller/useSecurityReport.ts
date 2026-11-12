"use client";

import { useCallback, useMemo, useState } from "react";
import { buildSecurityReport } from "@/model/SecurityReport";
import type { SecurityIssue, VaultEntry } from "@/model/types";
import { useVault } from "./VaultContext";

export interface ReportItem {
  issue: SecurityIssue;
  entry: VaultEntry;
}

/** Sicherheitsbericht für die Ansicht „Sicherheit“, mit Zeitpunkt der Prüfung und „Erneut prüfen“. */
export function useSecurityReport() {
  const { entries } = useVault();
  const [checkedAt, setCheckedAt] = useState(() => Date.now());
  const report = useMemo(() => buildSecurityReport(entries, checkedAt), [entries, checkedAt]);

  // Befunde mit dem zugehörigen Eintrag verbinden, damit die View Titel und Kategorie zeigen kann.
  const groups = useMemo(() => {
    const byId = new Map(entries.map((e) => [e.id, e]));
    const withEntry = (issues: SecurityIssue[]): ReportItem[] =>
      issues.flatMap((issue) => {
        const entry = byId.get(issue.entryId);
        return entry ? [{ issue, entry }] : [];
      });
    return { weak: withEntry(report.weak), reused: withEntry(report.reused), old: withEntry(report.old) };
  }, [entries, report]);

  const recheck = useCallback(() => setCheckedAt(Date.now()), []);

  return { report, groups, checkedAt, recheck };
}
