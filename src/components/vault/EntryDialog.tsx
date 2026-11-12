"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/Field";
import field from "@/components/ui/Field.module.css";
import { Icon } from "@/components/ui/Icon";
import { StrengthBar } from "@/components/ui/StrengthBar";
import { useEntryForm } from "@/controller/useEntryForm";
import { MAX_LENGTH, MIN_LENGTH } from "@/controller/usePasswordGenerator";
import { CATEGORIES } from "@/controller/useEntryList";
import type { Category, VaultEntry } from "@/model/types";
import styles from "./EntryDialog.module.css";

interface EntryDialogProps {
  entry?: VaultEntry;
  initialPassword?: string;
  onClose: () => void;
  onSaved: (id: string) => void;
  onDeleted?: () => void;
}

const KINDS = [
  { key: "uppercase", label: "Großbuchstaben", sample: "A–Z" },
  { key: "lowercase", label: "Kleinbuchstaben", sample: "a–z" },
  { key: "digits", label: "Ziffern", sample: "0–9" },
  { key: "symbols", label: "Sonderzeichen", sample: "!#$%" },
] as const;

/**
 * Dialog „Neuer Eintrag“ bzw. „Eintrag bearbeiten“.
 * Nutzt das native <dialog>: Fokus bleibt im Dialog, Esc schließt ihn.
 */
export function EntryDialog({ entry, initialPassword, onClose, onSaved, onDeleted }: EntryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const form = useEntryForm({ entry, initialPassword });
  const [showOptions, setShowOptions] = useState(form.isNew);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { draft, set, errors, generator } = form;

  // Öffnen: Fokus ins erste Feld. Schließen: Fokus zurück auf den Button, der den Dialog geöffnet hat,
  // damit Tastatur- und Screenreader-Nutzer an derselben Stelle weitermachen.
  // Der Öffner wird beim ersten Rendern gemerkt – noch bevor der Dialog den Fokus übernimmt.
  const [opener] = useState(() => (document.activeElement instanceof HTMLElement ? document.activeElement : null));
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    const timer = window.setTimeout(() => document.getElementById("f-title")?.focus());
    return () => {
      window.clearTimeout(timer);
      if (opener?.isConnected) opener.focus();
    };
  }, [opener]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const id = await form.submit();
    if (id) onSaved(id);
  };

  const onDelete = async () => {
    await form.remove();
    onDeleted?.();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="dlg-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <form onSubmit={onSubmit} noValidate className={styles.form}>
        <div className={styles.head}>
          <h1 id="dlg-title">{form.isNew ? "Neuer Eintrag" : "Eintrag bearbeiten"}</h1>
          <IconButton icon="close" label="Dialog schließen" onClick={onClose} />
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <div className={`${field.field} ${styles.grow2}`}>
              <label htmlFor="f-title" className={field.label}>
                Titel{" "}
                <span aria-hidden="true" className={styles.required}>
                  *
                </span>
              </label>
              <input
                id="f-title"
                className={field.input}
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                aria-required="true"
                aria-invalid={errors.title ? true : undefined}
                aria-describedby={errors.title ? "f-title-err" : undefined}
                autoComplete="off"
              />
              {errors.title && (
                <p id="f-title-err" className={field.error}>
                  {errors.title}
                </p>
              )}
            </div>
            <div className={`${field.field} ${styles.grow1}`}>
              <label htmlFor="f-cat" className={field.label}>
                Kategorie
              </label>
              <select
                id="f-cat"
                className={field.input}
                value={draft.category}
                onChange={(e) => set("category", e.target.value as Category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={field.field}>
            <label htmlFor="f-user" className={field.label}>
              Benutzername oder E-Mail
            </label>
            <input
              id="f-user"
              className={`${field.input} mono`}
              style={{ fontSize: 15 }}
              value={draft.username}
              onChange={(e) => set("username", e.target.value)}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="off"
            />
          </div>

          <div className={field.field}>
            <label htmlFor="f-pw" className={field.label}>
              Passwort
            </label>
            <div className={styles.pwRow}>
              <PasswordInput
                id="f-pw"
                value={draft.password}
                onChange={(value) => set("password", value)}
                autoComplete="new-password"
                aria-describedby="f-pw-strength"
                className={styles.pwInput}
              />
              <Button icon="refresh" onClick={() => form.generate()}>
                Generieren
              </Button>
            </div>
            <StrengthBar strength={form.strength} id="f-pw-strength" labelWidth={56} />

            <div className={styles.options}>
              <button
                type="button"
                className={styles.optionsToggle}
                aria-expanded={showOptions}
                aria-controls="gen-opts"
                onClick={() => setShowOptions((v) => !v)}
              >
                Generator-Optionen
                <span className="mono">
                  {generator.length} Zeichen · {form.activeKinds} von 4 Zeichenarten
                </span>
              </button>
              {showOptions && (
                <div id="gen-opts" className={styles.optionsBody}>
                  <div className={styles.lengthRow}>
                    <label htmlFor="f-len">Länge</label>
                    <input
                      id="f-len"
                      type="range"
                      min={MIN_LENGTH}
                      max={MAX_LENGTH}
                      value={generator.length}
                      onChange={(e) => form.generate({ length: Number(e.target.value) })}
                    />
                    <span className="mono">{generator.length}</span>
                  </div>
                  <div className={styles.kinds}>
                    {KINDS.map((kind) => (
                      <label key={kind.key} className={styles.kind}>
                        <input
                          type="checkbox"
                          checked={generator[kind.key]}
                          disabled={generator[kind.key] && form.activeKinds === 1}
                          onChange={() => form.generate({ [kind.key]: !generator[kind.key] })}
                        />
                        {kind.label} <span className="mono">{kind.sample}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={field.field}>
            <label htmlFor="f-url" className={field.label}>
              Website
            </label>
            <input
              id="f-url"
              className={field.input}
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="z. B. github.com"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
            />
          </div>

          <div className={field.field}>
            <label htmlFor="f-note" className={field.label}>
              Notiz <span className={field.optional}>(optional)</span>
            </label>
            <textarea
              id="f-note"
              rows={2}
              className={field.input}
              value={draft.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="z. B. Sicherheitsfrage oder Hinweis zur Anmeldung"
            />
          </div>

          <label className={styles.kind}>
            <input type="checkbox" checked={draft.favorite} onChange={(e) => set("favorite", e.target.checked)} />
            Als Favorit markieren
          </label>
        </div>

        {confirmDelete ? (
          <div className={styles.confirm} role="alertdialog" aria-labelledby="del-q">
            <p id="del-q">
              <Icon name="warning" size={18} />
              <span>
                <strong>„{entry?.title}“ wirklich löschen?</strong> Das lässt sich nicht rückgängig machen.
              </span>
            </p>
            <div className={styles.footActions}>
              <Button onClick={() => setConfirmDelete(false)}>Abbrechen</Button>
              <Button variant="danger" icon="trash" onClick={onDelete}>
                Endgültig löschen
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.foot}>
            {!form.isNew && (
              <Button
                variant="ghost"
                icon="trash"
                className={styles.deleteButton}
                onClick={() => setConfirmDelete(true)}
              >
                Löschen
              </Button>
            )}
            <div className={styles.footActions}>
              <Button onClick={onClose}>Abbrechen</Button>
              <Button type="submit" variant="primary" disabled={form.saving}>
                {form.saving ? "Wird gespeichert …" : "Speichern"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </dialog>
  );
}
