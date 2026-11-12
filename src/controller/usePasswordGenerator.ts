"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_GENERATOR_OPTIONS, entropyBits, generatePassword } from "@/model/PasswordGenerator";
import { checkStrength } from "@/model/StrengthMeter";
import type { GeneratorOptions } from "@/model/types";

/** Grenzen für den Längen-Schieberegler in der View. */
export { MAX_LENGTH, MIN_LENGTH } from "@/model/PasswordGenerator";

const KIND_KEYS =["uppercase", "lowercase", "digits", "symbols"] as const;

/**
 * Zustand des Passwortgenerators: Optionen und aktuelles Passwort.
 * Jede Änderung an den Optionen erzeugt sofort ein neues Passwort.
 */
export function usePasswordGenerator(initial: GeneratorOptions = DEFAULT_GENERATOR_OPTIONS) {
  const [options, setOptions] = useState<GeneratorOptions>(initial);
  const [password, setPassword] = useState("");

  // Erst im Browser erzeugen, damit beim statischen Export kein Passwort im HTML landet.
  useEffect(() => {
    setPassword(generatePassword(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Optionen ändern. Mindestens eine Zeichenart bleibt immer aktiv. */
  const update = useCallback(
    (patch: Partial<GeneratorOptions>) => {
      const next = { ...options, ...patch };
      if (!KIND_KEYS.some((key) => next[key])) return;
      setOptions(next);
      setPassword(generatePassword(next));
    },
    [options],
  );

  const regenerate = useCallback(() => setPassword(generatePassword(options)), [options]);

  const strength = useMemo(() => checkStrength(password), [password]);
  const activeKinds = KIND_KEYS.filter((key) => options[key]).length;

  return { options, password, update, regenerate, strength, bits: entropyBits(options), activeKinds };
}
