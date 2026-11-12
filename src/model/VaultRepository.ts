import { DEFAULT_SETTINGS, type EncryptedVault, type Settings } from "./types";

/**
 * Lesen und Schreiben in IndexedDB.
 *
 * Die Datenbank „latch“ hat einen einfachen Schlüssel-Wert-Speicher mit zwei Einträgen:
 *  - "vault":    der verschlüsselte Tresor (EncryptedVault)
 *  - "settings": die Einstellungen (nicht geheim, daher unverschlüsselt)
 *
 * Das Repository kennt keine Klartext-Passwörter – es speichert nur, was es bekommt.
 */

const DB_NAME = "latch";
const DB_VERSION = 1;
const STORE = "kv";
const VAULT_KEY = "vault";
const SETTINGS_KEY = "settings";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

/** Führt eine einzelne Anfrage im Object Store aus und wartet auf das Ergebnis. */
async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request.result as T);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function loadVault(): Promise<EncryptedVault | null> {
  return (await run<EncryptedVault | undefined>("readonly", (s) => s.get(VAULT_KEY))) ?? null;
}

export async function saveVault(vault: EncryptedVault): Promise<void> {
  await run("readwrite", (s) => s.put(vault, VAULT_KEY));
}

export async function hasVault(): Promise<boolean> {
  return (await loadVault()) !== null;
}

export async function loadSettings(): Promise<Settings> {
  const stored = await run<Partial<Settings> | undefined>("readonly", (s) => s.get(SETTINGS_KEY));
  // Fehlende Felder (z. B. nach einem Update) mit Standardwerten auffüllen.
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await run("readwrite", (s) => s.put(settings, SETTINGS_KEY));
}

/** Löscht Tresor und Einstellungen von diesem Gerät („Alle Daten löschen“). */
export async function clearAll(): Promise<void> {
  await run("readwrite", (s) => s.clear());
}
