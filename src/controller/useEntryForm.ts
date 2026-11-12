"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_GENERATOR_OPTIONS, generatePassword } from "@/model/PasswordGenerator";
import { checkStrength } from "@/model/StrengthMeter";
import type { EntryDraft, GeneratorOptions, VaultEntry } from "@/model/types";
import { emptyDraft, toDraft, validateDraft } from "@/model/VaultService";
import { useVault } from "./VaultContext";

const KIND_KEYS = ["uppercase", "lowercase", "digits", "symbols"] as const;

interface EntryFormOptions {
  /** Bestehender Eintrag zum Bearbeiten; ohne Eintrag wird ein neuer angelegt. */
  entry?: VaultEntry;
  /** Vorbelegtes Passwort, z. B. aus dem Generator. */
  initialPassword?: string;
}

/**
 * Formular „Eintrag anlegen / bearbeiten“: Formulardaten, Prüfung, Generator und Speichern.
 * Die View zeigt nur an und ruft diese Funktionen auf.
 */
export function useEntryForm({ entry, initialPassword }: EntryFormOptions = {}) {
  const { addEntry, updateEntry, deleteEntry } = useVault();
  const [draft, setDraft] = useState<EntryDraft>(() =>
    entry ? toDraft(entry) : { ...emptyDraft(), password: initialPassword ?? "" },
  );
  const [generator, setGenerator] = useState<GeneratorOptions>({ ...DEFAULT_GENERATOR_OPTIONS, length: 18 });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Neuer Eintrag ohne Vorgabe: direkt ein starkes Passwort vorschlagen.
  useEffect(() => {
    if (!entry && !initialPassword) {
      setDraft((d) => ({ ...d, password: generatePassword({ ...DEFAULT_GENERATOR_OPTIONS, length: 18 }) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = useCallback(<K extends keyof EntryDraft>(key: K, value: EntryDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const errors = useMemo(() => validateDraft(draft), [draft]);
  const strength = useMemo(() => checkStrength(draft.password), [draft.password]);

  const generate = useCallback(
    (patch: Partial<GeneratorOptions> = {}) => {
      const next = { ...generator, ...patch };
      if (!KIND_KEYS.some((key) => next[key])) return;
      setGenerator(next);
      setDraft((d) => ({ ...d, password: generatePassword(next) }));
    },
    [generator],
  );

  /** Speichert und liefert die ID des Eintrags – oder `null`, wenn das Formular Fehler hat. */
  const submit = useCallback(async (): Promise<string | null> => {
    setSubmitted(true);
    if (Object.keys(validateDraft(draft)).length > 0) return null;
    setSaving(true);
    try {
      if (entry) {
        await updateEntry(entry.id, draft);
        return entry.id;
      }
      return (await addEntry(draft)).id;
    } finally {
      setSaving(false);
    }
  }, [draft, entry, addEntry, updateEntry]);

  const remove = useCallback(async () => {
    if (entry) await deleteEntry(entry.id);
  }, [entry, deleteEntry]);

  return {
    draft,
    set,
    /** Fehler erst nach dem ersten Speichern-Versuch anzeigen. */
    errors: submitted ? errors : {},
    isValid: Object.keys(errors).length === 0,
    strength,
    generator,
    activeKinds: KIND_KEYS.filter((key) => generator[key]).length,
    generate,
    submit,
    remove,
    saving,
    isNew: !entry,
  };
}
