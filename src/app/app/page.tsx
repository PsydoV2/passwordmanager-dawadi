"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { CategoryTile } from "@/components/vault/CategoryTile";
import { EntryDetail } from "@/components/vault/EntryDetail";
import { EntryDialog } from "@/components/vault/EntryDialog";
import { IssueTag } from "@/components/vault/IssueTag";
import styles from "@/components/vault/Vault.module.css";
import { useClipboard } from "@/controller/useClipboard";
import { CATEGORY_FILTERS, useEntryList } from "@/controller/useEntryList";
import { useVault } from "@/controller/VaultContext";
import { clearVaultIntent, peekVaultIntent } from "@/controller/vaultIntent";
import type { CategoryFilter } from "@/model/VaultService";

type DialogState = { mode: "new"; password?: string } | { mode: "edit"; id: string } | null;

/** Ansicht „Tresor-Übersicht“: Suche, Kategorie-Filter, Liste und Details. */
export default function VaultPage() {
  const { entries, lock, addDemoEntries } = useVault();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Alle");
  // Ein Auftrag aus Generator („Als Eintrag speichern“) oder Bericht („Passwort ändern“) bestimmt den Anfangszustand.
  const [intent] = useState(peekVaultIntent);
  const [selectedId, setSelectedId] = useState<string | null>(intent?.kind === "edit" ? intent.id : null);
  /** Am Smartphone: Details als eigene Ansicht statt neben der Liste. */
  const [mobileDetail, setMobileDetail] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(() => {
    if (intent?.kind === "new") return { mode: "new", password: intent.password };
    if (intent?.kind === "edit") return { mode: "edit", id: intent.id };
    return null;
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const { list, counts, total, issues } = useEntryList(query, category);
  const { copy, clearSeconds } = useClipboard();
  const toast = useToast();

  // Ausgewählt ist der angeklickte Eintrag, sonst der erste der Liste.
  const selected = useMemo(
    () => list.find((e) => e.id === selectedId) ?? (mobileDetail ? undefined : list[0]),
    [list, selectedId, mobileDetail],
  );
  const editing = dialog?.mode === "edit" ? entries.find((e) => e.id === dialog.id) : undefined;

  // Auftrag ist übernommen und wird gelöscht.
  useEffect(clearVaultIntent, []);

  // Tastenkürzel Strg+K (bzw. Cmd+K) springt in die Suche.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pick = (id: string) => {
    setSelectedId(id);
    setMobileDetail(true);
  };

  const quickCopy = async (password: string, title: string) => {
    try {
      await copy(password, { sensitive: true });
      toast(`Passwort für ${title} kopiert · wird in ${clearSeconds} s gelöscht`);
    } catch {
      toast("Kopieren nicht möglich – der Browser hat den Zugriff verweigert.");
    }
  };

  const dialogElement = dialog && (
    <EntryDialog
      key={dialog.mode === "edit" ? dialog.id : "new"}
      entry={editing}
      initialPassword={dialog.mode === "new" ? dialog.password : undefined}
      onClose={() => setDialog(null)}
      onSaved={(id) => {
        toast(dialog.mode === "new" ? "Eintrag angelegt" : "Änderungen gespeichert");
        setDialog(null);
        setSelectedId(id);
      }}
      onDeleted={() => {
        toast("Eintrag gelöscht");
        setDialog(null);
        setSelectedId(null);
        setMobileDetail(false);
      }}
    />
  );

  // Leerer Tresor: kurze Einführung statt leerer Liste.
  if (total === 0) {
    return (
      <div className={styles.emptyVault}>
        <Icon name="vault" size={36} />
        <h1>Dein Tresor ist noch leer</h1>
        <p>Lege deinen ersten Eintrag an oder lade Beispieldaten, um Latch auszuprobieren.</p>
        <div className={styles.emptyActions}>
          <Button variant="primary" icon="plus" onClick={() => setDialog({ mode: "new" })}>
            Ersten Eintrag anlegen
          </Button>
          <Button onClick={() => addDemoEntries().then(() => toast("15 Beispieleinträge hinzugefügt"))}>
            Demo-Daten laden
          </Button>
        </div>
        {dialogElement}
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${mobileDetail && selected ? styles.showDetail : ""}`}>
      <div className={styles.toolbar}>
        <div className={styles.heading}>
          <h1>Tresor</h1>
          <span>{list.length === total ? `${total} Einträge` : `${list.length} von ${total}`}</span>
        </div>
        <div className={styles.mobileActions}>
          <IconButton icon="lock" label="Tresor jetzt sperren" onClick={() => lock("manual")} />
        </div>
        <div className={styles.search}>
          <Icon name="search" />
          <label htmlFor="search" className="sr-only">
            Einträge durchsuchen
          </label>
          <input
            ref={searchRef}
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, Benutzername oder Website suchen"
            autoComplete="off"
          />
          <kbd className="mono">Strg K</kbd>
        </div>
        <Button variant="primary" icon="plus" className={styles.newButton} onClick={() => setDialog({ mode: "new" })}>
          <span className={styles.newLabel}>Neuer Eintrag</span>
        </Button>
      </div>

      <div role="group" aria-label="Nach Kategorie filtern" className={styles.chips}>
        {CATEGORY_FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={c === category}
            className={styles.chip}
            onClick={() => setCategory(c)}
          >
            {c}
            <span>{counts[c]}</span>
          </button>
        ))}
      </div>

      <div className={styles.split}>
        <div className={styles.listCol}>
          {list.length > 0 && (
            <div className={styles.listHead} aria-hidden="true">
              <span>Name</span>
              <span>Kategorie</span>
            </div>
          )}
          <ul className={styles.list}>
            {list.map((entry) => {
              const issue = issues.get(entry.id);
              const isSelected = entry.id === selected?.id;
              return (
                <li key={entry.id} className={styles.rowWrap}>
                  <button
                    type="button"
                    className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => pick(entry.id)}
                  >
                    <CategoryTile title={entry.title} category={entry.category} />
                    <span className={styles.rowText}>
                      <span className={styles.rowTitle}>
                        {entry.title}
                        {entry.favorite && (
                          <span className={styles.favIcon} title="Favorit">
                            <Icon name="star" size={14} filled />
                            <span className="sr-only">Favorit</span>
                          </span>
                        )}
                        {issue && <IssueTag type={issue.type} />}
                      </span>
                      <span className={`mono ${styles.rowUser}`}>{entry.username}</span>
                    </span>
                    <span className={styles.rowCat}>{entry.category}</span>
                  </button>
                  <IconButton
                    icon="copy"
                    label={`Passwort für ${entry.title} kopieren`}
                    className={styles.rowCopy}
                    onClick={() => quickCopy(entry.password, entry.title)}
                  />
                </li>
              );
            })}
          </ul>
          {list.length === 0 && (
            <div className={styles.noHits}>
              <Icon name="search" size={32} strokeWidth={1.5} />
              <p className={styles.noHitsTitle}>
                {query ? `Keine Treffer für „${query}“` : "Keine Einträge in dieser Kategorie"}
              </p>
              <p>Prüfe die Schreibweise oder lege einen neuen Eintrag an.</p>
              <button type="button" className={styles.inlineLink} onClick={() => setDialog({ mode: "new" })}>
                Neuen Eintrag anlegen
              </button>
            </div>
          )}
        </div>

        {selected && (
          <EntryDetail
            key={selected.id}
            entry={selected}
            issue={issues.get(selected.id)}
            onEdit={() => setDialog({ mode: "edit", id: selected.id })}
            onBack={() => setMobileDetail(false)}
          />
        )}
      </div>

      {dialogElement}
    </div>
  );
}
