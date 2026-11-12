"use client";

import { useCallback, useMemo, useState } from "react";
import { DEFAULT_GENERATOR_OPTIONS, entropyBits, generatePassword } from "@/model/PasswordGenerator";
import { checkStrength } from "@/model/StrengthMeter";
import type { GeneratorOptions } from "@/model/types";

/** Grenzen für den Längen-Schieberegler in der View. */
export { MAX_LENGTH, MIN_LENGTH } from "@/model/PasswordGenerator";

const KIND_KEYS = ["uppercase", "lowercase", "digits", "symbols"] as const;

/**
 * Zustand des Passwortgenerators: Optionen und aktuelles Passwort.
 * Jede Änderung an den Optionen erzeugt sofort ein neues Passwort.
 */
export function usePasswordGenerator(initial: GeneratorOptions = DEFAULT_GENERATOR_OPTIONS) {
  const [options, setOptions] = useState<GeneratorOptions>(initial);
  // Die Generator-Seite wird erst nach dem Entsperren gerendert – das Passwort landet nie im statischen HTML.
  const [password, setPassword] = useState(() => generatePassword(initial));

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
