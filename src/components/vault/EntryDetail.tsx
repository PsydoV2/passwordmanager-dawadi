"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StrengthBar } from "@/components/ui/StrengthBar";
import { useToast } from "@/components/ui/Toast";
import { usePasswordStrength } from "@/controller/usePasswordCheck";
import { useClipboard } from "@/controller/useClipboard";
import { useVault } from "@/controller/VaultContext";
import type { SecurityIssue, VaultEntry } from "@/model/types";
import { CategoryTile } from "./CategoryTile";
import { formatDate, relativeAge, websiteHref } from "./format";
import { ISSUE_TEXT } from "./IssueTag";
import { PasswordText } from "./PasswordText";
import styles from "./Vault.module.css";

interface EntryDetailProps {
  entry: VaultEntry;
  issue?: SecurityIssue;
  onEdit: () => void;
  /** Nur am Smartphone: zurück zur Liste. */
  onBack?: () => void;
}

/** Rechte Spalte: Details eines Eintrags mit Kopieren, Anzeigen und Hinweisen. */
export function EntryDetail({ entry, issue, onEdit, onBack }: EntryDetailProps) {
  const [revealed, setRevealed] = useState(false);
  const { toggleFavorite } = useVault();
  const { copy, clearSeconds } = useClipboard();
  const toast = useToast();
  const strength = usePasswordStrength(entry.password);

  const copyValue = async (value: string, sensitive: boolean, what: string) => {
    try {
      await copy(value, { sensitive });
      toast(sensitive ? `${what} kopiert · wird in ${clearSeconds} s aus der Zwischenablage gelöscht` : `${what} kopiert`);
    } catch {
      toast("Kopieren nicht möglich – der Browser hat den Zugriff auf die Zwischenablage verweigert.");
    }
  };

  return (
    <section className={styles.detail} aria-labelledby="detail-title">
      {onBack && (
        <button type="button" className={styles.backButton} onClick={onBack}>
          <Icon name="arrowLeft" />
          Alle Einträge
        </button>
      )}

      <div className={styles.detailHead}>
        <CategoryTile title={entry.title} category={entry.category} size={48} />
        <div className={styles.detailTitle}>
          <h2 id="detail-title">{entry.title}</h2>
          <p>{entry.category}</p>
        </div>
        <IconButton
          icon="star"
          label={entry.favorite ? "Aus Favoriten entfernen" : "Als Favorit markieren"}
          aria-pressed={entry.favorite}
          className={entry.favorite ? styles.favOn : ""}
          onClick={() => toggleFavorite(entry.id)}
        />
        <IconButton icon="edit" label="Eintrag bearbeiten" className={styles.outlined} onClick={onEdit} />
      </div>

      {issue && (
        <div className={`${styles.issueBox} ${styles[`issue-${issue.type}`]}`}>
          <Icon name="warning" size={18} />
          <p>
            {ISSUE_TEXT[issue.type]} {issue.reason}.{" "}
            <button type="button" className={styles.inlineLink} onClick={onEdit}>
              Passwort ändern
            </button>
          </p>
        </div>
      )}

      <div className={styles.fields}>
        <div className={styles.fieldRow}>
          <div className={styles.fieldText}>
            <p className={styles.fieldLabel}>Benutzername</p>
            <p className={`mono ${styles.fieldValue}`}>{entry.username || "–"}</p>
          </div>
          {entry.username && (
            <IconButton icon="copy" label="Benutzername kopieren" onClick={() => copyValue(entry.username, false, "Benutzername")} />
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldText}>
            <p className={styles.fieldLabel}>Passwort</p>
            <p className={styles.fieldValue}>
              {revealed ? (
                <PasswordText value={entry.password} className={styles.pwValue} />
              ) : (
                <span className="mono" aria-label="Passwort verborgen">
                  {"•".repeat(Math.min(16, Math.max(10, entry.password.length)))}
                </span>
              )}
            </p>
          </div>
          <IconButton
            icon={revealed ? "eyeOff" : "eye"}
            label={revealed ? "Passwort verbergen" : "Passwort anzeigen"}
            aria-pressed={revealed}
            onClick={() => setRevealed((r) => !r)}
          />
          <IconButton icon="copy" label="Passwort kopieren" onClick={() => copyValue(entry.password, true, "Passwort")} />
        </div>

        <div className={`${styles.fieldRow} ${styles.strengthRow}`}>
          <p className={styles.fieldLabel}>Stärke</p>
          <div style={{ flex: "1 1 auto" }}>
            <StrengthBar strength={strength} labelWidth={56} />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldText}>
            <p className={styles.fieldLabel}>Website</p>
            <p className={styles.fieldValue}>
              {entry.url ? (
                <a href={websiteHref(entry.url)} target="_blank" rel="noopener noreferrer">
                  {entry.url}
                </a>
              ) : (
                "–"
              )}
            </p>
          </div>
          {entry.url && (
            <a
              href={websiteHref(entry.url)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website in neuem Tab öffnen"
              className={styles.iconLink}
            >
              <Icon name="external" size={17} />
            </a>
          )}
        </div>
      </div>

      <div>
        <p className={styles.fieldLabel}>Notiz</p>
        <p className={styles.note}>{entry.note || "Keine Notiz"}</p>
      </div>

      <p className={styles.meta}>
        Passwort geändert {relativeAge(entry.passwordChangedAt)} · angelegt am {formatDate(entry.createdAt)}
      </p>
    </section>
  );
}
