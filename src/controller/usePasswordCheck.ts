"use client";

import { useMemo } from "react";
import { checkMasterPasswordRules, checkStrength, type PasswordRule } from "@/model/StrengthMeter";
import type { StrengthResult } from "@/model/types";

/** Stärke eines Passworts in Echtzeit (für die Stärkeanzeige in Formularen). */
export function usePasswordStrength(password: string): StrengthResult {
  return useMemo(() => checkStrength(password), [password]);
}

/** Checkliste und Gesamtergebnis für das Master-Passwort beim Einrichten. */
export function useMasterPasswordCheck(password: string, confirmation: string) {
  return useMemo(() => {
    const rules: PasswordRule[] = checkMasterPasswordRules(password);
    const rulesOk = rules.every((rule) => rule.ok);
    const matches = confirmation.length > 0 && confirmation === password;
    return { rules, rulesOk, matches, strength: checkStrength(password) };
  }, [password, confirmation]);
}
