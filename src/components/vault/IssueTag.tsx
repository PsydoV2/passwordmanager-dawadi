import type { IssueType } from "@/model/types";
import styles from "./Vault.module.css";

export const ISSUE_LABEL: Record<IssueType, string> = {
  weak: "Schwach",
  reused: "Mehrfach",
  old: "Alt",
};

export const ISSUE_TEXT: Record<IssueType, string> = {
  weak: "Dieses Passwort ist leicht zu erraten.",
  reused: "Dieses Passwort wird auch bei einem anderen Eintrag verwendet.",
  old: "Dieses Passwort wurde seit über einem Jahr nicht geändert.",
};

/** Kleines Etikett „Schwach“, „Mehrfach“ oder „Alt“. */
export function IssueTag({ type, small = false }: { type: IssueType; small?: boolean }) {
  return (
    <span className={`${styles.tag} ${styles[`tag-${type}`]} ${small ? styles.tagSmall : ""}`}>
      {ISSUE_LABEL[type]}
    </span>
  );
}
