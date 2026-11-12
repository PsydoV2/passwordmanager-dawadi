"use client";

import { useState, type FormEvent } from "react";
import styles from "@/components/auth/Auth.module.css";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/Field";
import field from "@/components/ui/Field.module.css";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { useVault, type LockReason } from "@/controller/VaultContext";

function reasonText(reason: LockReason, minutes: number): string {
  if (reason === "inactivity") return `Automatisch gesperrt nach ${minutes} Minuten ohne Aktivität. `;
  if (reason === "hidden") return "Gesperrt, weil die App im Hintergrund war. ";
  return "";
}

/** Ansicht „Entsperren“: Master-Passwort eingeben. */
export default function UnlockPage() {
  const { unlock, lockReason, settings, demoMasterPassword, deleteAllData } = useVault();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    try {
      await unlock(password); // Bei Erfolg leitet die App automatisch zum Tresor weiter.
    } catch {
      setWrong(true);
      setBusy(false);
    }
  };

  return (
    <div className={styles.unlock}>
      <div className={styles.topbar}>
        <Logo size={26} href="/" />
        <span className={styles.deviceNote}>
          <Icon name="device" size={16} />
          Nur auf diesem Gerät gespeichert
        </span>
      </div>

      <main className={styles.unlockMain}>
        <div className={styles.lockBadge}>
          <Icon name="lock" size={26} />
        </div>
        <h1 className={styles.title}>Tresor gesperrt</h1>
        <p className={styles.lead}>
          {reasonText(lockReason, settings.autoLockMinutes)}Gib dein Master-Passwort ein, um weiterzumachen.
        </p>

        <form onSubmit={onSubmit} className={field.field} style={{ marginTop: 32 }}>
          <label htmlFor="unlock" className={field.label}>
            Master-Passwort
          </label>
          <PasswordInput
            id="unlock"
            value={password}
            onChange={(value) => {
              setPassword(value);
              setWrong(false);
            }}
            autoComplete="current-password"
            aria-describedby="unlock-error"
            invalid={wrong}
            emphasis
            autoFocus
          />
          <p id="unlock-error" role="alert" className={`${field.error} ${styles.errorLine}`}>
            {wrong && (
              <>
                <Icon name="alert" size={16} strokeWidth={2} />
                Das Master-Passwort ist falsch. Versuch es noch einmal.
              </>
            )}
          </p>
          <Button type="submit" variant="primary" size="lg" block disabled={busy}>
            {busy ? "Wird entsperrt …" : "Entsperren"}
          </Button>
          <p className={field.hint} style={{ marginTop: 6, fontSize: 13 }}>
            Im Demo-Tresor lautet das Master-Passwort <span className="mono">{demoMasterPassword}</span>.
          </p>
        </form>

        <details className={styles.forgot}>
          <summary>Master-Passwort vergessen?</summary>
          <p>
            Das Master-Passwort kann nicht wiederhergestellt werden, weil es nirgends gespeichert ist. Du kannst nur
            alle Daten auf diesem Gerät löschen und einen neuen Tresor anlegen.
          </p>
          {!confirmDelete ? (
            <button
              type="button"
              className={`${styles.linkButton} ${styles.dangerLink}`}
              onClick={() => setConfirmDelete(true)}
            >
              Daten löschen und neu beginnen
            </button>
          ) : (
            <div className={styles.confirmBox} role="alertdialog" aria-labelledby="del-title">
              <p id="del-title">
                <strong>Wirklich alle Daten löschen?</strong> Das lässt sich nicht rückgängig machen.
              </p>
              <div className={styles.confirmActions}>
                <Button onClick={() => setConfirmDelete(false)}>Abbrechen</Button>
                <Button variant="danger" icon="trash" onClick={() => deleteAllData()}>
                  Endgültig löschen
                </Button>
              </div>
            </div>
          )}
        </details>
      </main>
    </div>
  );
}
