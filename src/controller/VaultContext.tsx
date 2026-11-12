"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createEncryptedVault, decryptVault, encryptWithKey, type UnlockedKey } from "@/model/CryptoService";
import { createDemoEntries, DEMO_MASTER_PASSWORD } from "@/model/demoData";
import { buildSecurityReport, type SecurityReport } from "@/model/SecurityReport";
import { DEFAULT_SETTINGS, type EntryDraft, type Settings, type VaultData, type VaultEntry } from "@/model/types";
import * as Repository from "@/model/VaultRepository";
import * as VaultService from "@/model/VaultService";
import { useAutoLock } from "./useAutoLock";

/**
 * Controller: verbindet die Oberfläche (View) mit dem Model.
 *
 * Die View liest hier nur Zustand und ruft Aktionen auf. Sie greift nie selbst
 * auf IndexedDB oder die Web Crypto API zu – das erledigen die Model-Dateien.
 */

export type VaultStatus =
  | "loading" // Beim Start wird geprüft, ob schon ein Tresor existiert.
  | "empty" // Noch kein Tresor auf diesem Gerät → Einrichten.
  | "locked" // Tresor vorhanden, aber gesperrt → Entsperren.
  | "unlocked";

export type LockReason = "manual" | "inactivity" | "hidden" | null;

interface VaultContextValue {
  status: VaultStatus;
  lockReason: LockReason;
  entries: VaultEntry[];
  report: SecurityReport;
  settings: Settings;
  /** Master-Passwort des Demo-Tresors, wird als Hilfe auf der Entsperren-Seite angezeigt. */
  demoMasterPassword: string;

  createVault(masterPassword: string): Promise<void>;
  /** Legt einen Tresor mit Beispieldaten und dem Master-Passwort „demo“ an. */
  createDemoVault(): Promise<void>;
  /** Wirft `WrongPasswordError`, wenn das Master-Passwort nicht stimmt. */
  unlock(masterPassword: string): Promise<void>;
  lock(reason?: LockReason): void;

  addEntry(draft: EntryDraft): Promise<VaultEntry>;
  updateEntry(id: string, draft: EntryDraft): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<void>;
  addDemoEntries(): Promise<void>;

  updateSettings(patch: Partial<Settings>): Promise<void>;
  exportBackup(): Promise<void>;
  deleteAllData(): Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>("loading");
  const [lockReason, setLockReason] = useState<LockReason>(null);
  const [data, setData] = useState<VaultData | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Der abgeleitete Schlüssel liegt nur im Arbeitsspeicher und nie im React-State.
  const keyRef = useRef<UnlockedKey | null>(null);

  // Beim Start: Einstellungen laden und prüfen, ob ein Tresor existiert.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedSettings, exists] = await Promise.all([Repository.loadSettings(), Repository.hasVault()]);
      if (cancelled) return;
      setSettings(storedSettings);
      setStatus(exists ? "locked" : "empty");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Neuen Stand anzeigen und verschlüsselt speichern. */
  const persist = useCallback(async (next: VaultData) => {
    if (!keyRef.current) throw new Error("Der Tresor ist gesperrt.");
    setData(next);
    await Repository.saveVault(await encryptWithKey(next, keyRef.current));
  }, []);

  const open = useCallback((vault: VaultData, unlocked: UnlockedKey) => {
    keyRef.current = unlocked;
    setData(vault);
    setLockReason(null);
    setStatus("unlocked");
  }, []);

  const createWith = useCallback(
    async (vault: VaultData, masterPassword: string) => {
      const { encrypted, unlocked } = await createEncryptedVault(vault, masterPassword);
      await Repository.saveVault(encrypted);
      open(vault, unlocked);
    },
    [open],
  );

  const createVault = useCallback(
    (masterPassword: string) => createWith(VaultService.emptyVault(), masterPassword),
    [createWith],
  );

  const createDemoVault = useCallback(
    () => createWith({ entries: createDemoEntries() }, DEMO_MASTER_PASSWORD),
    [createWith],
  );

  const unlock = useCallback(
    async (masterPassword: string) => {
      const stored = await Repository.loadVault();
      if (!stored) {
        setStatus("empty");
        return;
      }
      const { data: vault, unlocked } = await decryptVault(stored, masterPassword);
      open(vault, unlocked);
    },
    [open],
  );

  const lock = useCallback((reason: LockReason = "manual") => {
    keyRef.current = null;
    setData(null);
    setLockReason(reason);
    setStatus((current) => (current === "unlocked" ? "locked" : current));
  }, []);

  const withData = useCallback(
    async (change: (vault: VaultData) => VaultData) => {
      if (!data) throw new Error("Der Tresor ist gesperrt.");
      await persist(change(data));
    },
    [data, persist],
  );

  const addEntry = useCallback(
    async (draft: EntryDraft) => {
      if (!data) throw new Error("Der Tresor ist gesperrt.");
      const result = VaultService.addEntry(data, draft);
      await persist(result.data);
      return result.entry;
    },
    [data, persist],
  );

  const updateEntry = useCallback(
    (id: string, draft: EntryDraft) => withData((vault) => VaultService.updateEntry(vault, id, draft)),
    [withData],
  );

  const deleteEntry = useCallback((id: string) => withData((vault) => VaultService.deleteEntry(vault, id)), [withData]);

  const toggleFavorite = useCallback(
    (id: string) => withData((vault) => VaultService.toggleFavorite(vault, id)),
    [withData],
  );

  const addDemoEntries = useCallback(
    () => withData((vault) => ({ ...vault, entries: [...vault.entries, ...createDemoEntries()] })),
    [withData],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await Repository.saveSettings(next);
    },
    [settings],
  );

  /** Lädt die verschlüsselte Sicherung als JSON-Datei herunter. */
  const exportBackup = useCallback(async () => {
    const stored = await Repository.loadVault();
    if (!stored) return;
    const blob = new Blob([JSON.stringify(stored, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `latch-sicherung-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const deleteAllData = useCallback(async () => {
    await Repository.clearAll();
    keyRef.current = null;
    setData(null);
    setSettings(DEFAULT_SETTINGS);
    setLockReason(null);
    setStatus("empty");
  }, []);

  useAutoLock({
    active: status === "unlocked",
    minutes: settings.autoLockMinutes,
    lockWhenHidden: settings.lockWhenHidden,
    onLock: lock,
  });

  const entries = useMemo(() => data?.entries ?? [], [data]);
  const report = useMemo(() => buildSecurityReport(entries), [entries]);

  const value: VaultContextValue = {
    status,
    lockReason,
    entries,
    report,
    settings,
    demoMasterPassword: DEMO_MASTER_PASSWORD,
    createVault,
    createDemoVault,
    unlock,
    lock,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    addDemoEntries,
    updateSettings,
    exportBackup,
    deleteAllData,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

/** Zugriff auf Tresor-Zustand und -Aktionen aus jeder Komponente innerhalb des VaultProviders. */
export function useVault(): VaultContextValue {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault muss innerhalb von <VaultProvider> verwendet werden.");
  return context;
}
