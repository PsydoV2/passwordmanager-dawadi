import type { EncryptedVault, VaultData } from "./types";

/**
 * Verschlüsselung des Tresors mit der Web Crypto API des Browsers.
 *
 * Ablauf:
 *  1. Aus Master-Passwort + zufälligem Salt wird mit PBKDF2 (SHA-256) ein 256-Bit-Schlüssel abgeleitet.
 *  2. Der Tresor wird als JSON mit AES-GCM verschlüsselt; für jedes Speichern gibt es einen neuen IV.
 *  3. Gespeichert werden nur Salt, IV und Chiffretext – das Master-Passwort selbst nie.
 *
 * Der abgeleitete Schlüssel ist nicht exportierbar und lebt nur im Arbeitsspeicher,
 * solange der Tresor entsperrt ist.
 */

/** Empfehlung von OWASP (2023) für PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

/** Wird geworfen, wenn das Entschlüsseln scheitert – in der Praxis: falsches Master-Passwort. */
export class WrongPasswordError extends Error {
  constructor() {
    super("Das Master-Passwort ist falsch.");
    this.name = "WrongPasswordError";
  }
}

/** Entsperrter Tresor: Schlüssel und Salt werden für weiteres Speichern behalten. */
export interface UnlockedKey {
  key: CryptoKey;
  salt: Uint8Array<ArrayBuffer>;
  iterations: number;
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length));
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Leitet aus dem Master-Passwort den AES-Schlüssel ab. Dauert bewusst einige hundert Millisekunden. */
export async function deriveKey(
  masterPassword: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(masterPassword), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Verschlüsselt den Tresor mit einem bereits abgeleiteten Schlüssel (z. B. nach jeder Änderung). */
export async function encryptWithKey(data: VaultData, unlocked: UnlockedKey): Promise<EncryptedVault> {
  const iv = randomBytes(IV_BYTES);
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, unlocked.key, plaintext);
  return {
    version: 1,
    salt: toBase64(unlocked.salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    iterations: unlocked.iterations,
  };
}

/** Legt einen neuen Tresor an: neues Salt, Schlüssel ableiten, verschlüsseln. */
export async function createEncryptedVault(
  data: VaultData,
  masterPassword: string,
): Promise<{ encrypted: EncryptedVault; unlocked: UnlockedKey }> {
  const salt = randomBytes(SALT_BYTES);
  const key = await deriveKey(masterPassword, salt);
  const unlocked: UnlockedKey = { key, salt, iterations: PBKDF2_ITERATIONS };
  return { encrypted: await encryptWithKey(data, unlocked), unlocked };
}

/**
 * Entschlüsselt den gespeicherten Tresor.
 * AES-GCM prüft die Integrität mit: Bei falschem Passwort (oder manipulierten Daten) schlägt das Entschlüsseln fehl.
 */
export async function decryptVault(
  encrypted: EncryptedVault,
  masterPassword: string,
): Promise<{ data: VaultData; unlocked: UnlockedKey }> {
  const salt = fromBase64(encrypted.salt);
  const key = await deriveKey(masterPassword, salt, encrypted.iterations);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(encrypted.iv) },
      key,
      fromBase64(encrypted.ciphertext),
    );
  } catch {
    throw new WrongPasswordError();
  }
  const data = JSON.parse(new TextDecoder().decode(plaintext)) as VaultData;
  return { data, unlocked: { key, salt, iterations: encrypted.iterations } };
}
