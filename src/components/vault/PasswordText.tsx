import { charKind } from "./format";
import styles from "./Vault.module.css";

/**
 * Zeigt ein Passwort in Monospace; Ziffern und Sonderzeichen farbig,
 * damit man sie beim Abtippen nicht verwechselt (z. B. 0 und O).
 */
export function PasswordText({ value, className }: { value: string; className?: string }) {
  return (
    <span className={`mono ${className ?? ""}`}>
      {value.split("").map((char, i) => (
        <span key={i} className={styles[`char-${charKind(char)}`]}>
          {char}
        </span>
      ))}
    </span>
  );
}
