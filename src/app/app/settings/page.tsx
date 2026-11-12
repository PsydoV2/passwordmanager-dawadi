"use client";

import { useEffect, useRef, useState } from "react";
import page from "@/components/app/Page.module.css";
import styles from "@/components/settings/Settings.module.css";
import { Button } from "@/components/ui/Button";
import field from "@/components/ui/Field.module.css";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useVault } from "@/controller/VaultContext";
import type { Settings, Theme } from "@/model/types";

const LOCK_OPTIONS: Settings["autoLockMinutes"][] = [1, 5, 15, 30];
const CLIPBOARD_OPTIONS: Settings["clipboardClearSeconds"][] = [15, 30, 60];
const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Hell" },
  { value: "dark", label: "Dunkel" },
  { value: "system", label: "System" },
];

/** Ansicht „Einstellungen“ – jede Änderung wird sofort gespeichert. */
export default function SettingsPage() {
  const { settings, updateSettings, entries, exportBackup, addDemoEntries, deleteAllData } = useVault();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Beim Öffnen der Rückfrage den Fokus auf „Abbrechen“ setzen – die sichere Wahl.
  useEffect(() => {
    if (confirm) cancelRef.current?.focus();
  }, [confirm]);

  const onExport = async () => {
    await exportBackup();
    toast("Sicherung heruntergeladen");
  };

  const onDemo = async () => {
    await addDemoEntries();
    toast("15 Beispieleinträge hinzugefügt");
  };

  return (
    <div className={`${page.page} ${page.narrow}`}>
      <div className={page.header}>
        <div>
          <h1>Einstellungen</h1>
          <p>Änderungen werden sofort übernommen.</p>
        </div>
      </div>

      <section aria-labelledby="s-sec" className={`${page.card} ${styles.section}`}>
        <h2 id="s-sec">Sperre und Zwischenablage</h2>
        <div className={styles.row}>
          <div className={styles.text}>
            <label htmlFor="lock" className={styles.label}>
              Automatisch sperren nach
            </label>
            <p id="lock-d">Ohne Maus- oder Tastatureingabe wird der Tresor nach dieser Zeit gesperrt.</p>
          </div>
          <select
            id="lock"
            aria-describedby="lock-d"
            className={`${field.input} ${styles.select}`}
            value={settings.autoLockMinutes}
            onChange={(e) => updateSettings({ autoLockMinutes: Number(e.target.value) as Settings["autoLockMinutes"] })}
          >
            {LOCK_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m === 1 ? "1 Minute" : `${m} Minuten`}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <div className={styles.text}>
            <label htmlFor="clip" className={styles.label}>
              Zwischenablage leeren nach
            </label>
            <p id="clip-d">Gilt für kopierte Passwörter. Benutzernamen bleiben in der Zwischenablage.</p>
          </div>
          <select
            id="clip"
            aria-describedby="clip-d"
            className={`${field.input} ${styles.select}`}
            value={settings.clipboardClearSeconds}
            onChange={(e) =>
              updateSettings({ clipboardClearSeconds: Number(e.target.value) as Settings["clipboardClearSeconds"] })
            }
          >
            {CLIPBOARD_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} Sekunden
              </option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <div className={styles.text}>
            <p id="tablock-l" className={styles.label}>
              Sperren, wenn der Tab im Hintergrund ist
            </p>
            <p id="tablock-d">Sperrt sofort, sobald du zu einem anderen Tab oder Programm wechselst.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.lockWhenHidden}
            aria-labelledby="tablock-l"
            aria-describedby="tablock-d"
            className={styles.switch}
            onClick={() => updateSettings({ lockWhenHidden: !settings.lockWhenHidden })}
          >
            <span />
          </button>
        </div>
      </section>

      <section aria-labelledby="s-look" className={`${page.card} ${styles.section}`}>
        <h2 id="s-look">Darstellung</h2>
        <div className={styles.row}>
          <div className={styles.text}>
            <p id="theme-l" className={styles.label}>
              Erscheinungsbild
            </p>
            <p>„System“ folgt der Einstellung deines Geräts.</p>
          </div>
          {/* Echte Radiobuttons: Pfeiltasten funktionieren damit automatisch. */}
          <div role="radiogroup" aria-labelledby="theme-l" className={styles.segmented}>
            {THEMES.map((t) => (
              <label key={t.value} className={styles.segment}>
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={settings.theme === t.value}
                  onChange={() => updateSettings({ theme: t.value })}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="s-data" className={`${page.card} ${styles.section}`}>
        <h2 id="s-data">Daten</h2>
        <div className={styles.row}>
          <div className={styles.text}>
            <p className={styles.label}>Tresor exportieren</p>
            <p>
              Lädt eine verschlüsselte Sicherung als <span className="mono">.json</span>-Datei herunter. Zum Öffnen
              brauchst du dein Master-Passwort.
            </p>
          </div>
          <Button icon="download" onClick={onExport}>
            Exportieren
          </Button>
        </div>
        <div className={styles.row}>
          <div className={styles.text}>
            <p className={styles.label}>Demo-Tresor laden</p>
            <p>Fügt 15 Beispieleinträge hinzu, darunter einige absichtlich unsichere.</p>
          </div>
          <Button onClick={onDemo}>Demo laden</Button>
        </div>
        <p className={`${page.footnote} ${styles.storage}`}>
          <Icon name="device" size={15} />
          Gespeichert in IndexedDB auf diesem Gerät · verschlüsselt mit AES-GCM
        </p>
      </section>

      <section aria-labelledby="s-danger" className={`${page.card} ${styles.section} ${styles.danger}`}>
        <div className={styles.row}>
          <div className={styles.text}>
            <h2 id="s-danger">Alle Daten löschen</h2>
            <p>Entfernt den Tresor und alle Einstellungen von diesem Gerät.</p>
          </div>
          <Button
            variant="danger-outline"
            icon="trash"
            aria-expanded={confirm}
            aria-controls="confirm-box"
            onClick={() => setConfirm(true)}
          >
            Alles löschen
          </Button>
        </div>
        {confirm && (
          <div id="confirm-box" role="alertdialog" aria-labelledby="c-title" aria-describedby="c-desc" className={styles.confirm}>
            <p id="c-title" className={styles.confirmTitle}>
              <Icon name="warning" size={18} />
              Wirklich {entries.length === 1 ? "den einen Eintrag" : `alle ${entries.length} Einträge`} löschen?
            </p>
            <p id="c-desc">
              Das lässt sich nicht rückgängig machen. Exportiere vorher eine Sicherung, falls du die Daten noch brauchst.
            </p>
            <div className={styles.confirmActions}>
              <Button ref={cancelRef} onClick={() => setConfirm(false)}>
                Abbrechen
              </Button>
              <Button variant="danger" icon="trash" onClick={deleteAllData}>
                Endgültig löschen
              </Button>
            </div>
          </div>
        )}
      </section>

      <p className={page.footnote}>Latch 1.0 · Schulprojekt im Lernfeld 10</p>
    </div>
  );
}
