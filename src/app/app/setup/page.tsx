"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import styles from "@/components/auth/Auth.module.css";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/Field";
import field from "@/components/ui/Field.module.css";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { StrengthBar } from "@/components/ui/StrengthBar";
import { useMasterPasswordCheck } from "@/controller/usePasswordCheck";
import { useVault } from "@/controller/VaultContext";

/** Ansicht „Tresor einrichten“: Master-Passwort festlegen oder Demo-Tresor laden. */
export default function SetupPage() {
  const { createVault, createDemoVault } = useVault();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { rules, rulesOk, matches, strength } = useMasterPasswordCheck(password, confirmation);
  const valid = rulesOk && matches && acknowledged;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action(); // Danach leitet die App automatisch zum Tresor weiter.
    } catch {
      setError("Der Tresor konnte nicht angelegt werden. Bitte versuch es erneut.");
      setBusy(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (valid && !busy) run(() => createVault(password));
  };

  const matchText = !confirmation
    ? "Bitte gib das Passwort ein zweites Mal ein."
    : matches
      ? "Die Passwörter stimmen überein."
      : "Die Passwörter stimmen noch nicht überein.";

  return (
    <div className={styles.setup}>
      <div className={styles.aside}>
        <Logo href="/" size={26} inverse />
        <div className={styles.asideText}>
          <h2>Ein Passwort, das du dir merkst. Für alle anderen, die du dir nicht merken musst.</h2>
          <ul className={styles.facts}>
            <li>
              <strong>Wird nie gespeichert.</strong> Aus dem Master-Passwort wird nur der Schlüssel abgeleitet.
            </li>
            <li>
              <strong>Lieber lang als kompliziert.</strong> Vier zufällige Wörter sind stärker als ein kurzes
              Passwort mit Sonderzeichen.
            </li>
            <li>
              <strong>Nicht wiederherstellbar.</strong> Schreib es dir auf und bewahre es sicher auf.
            </li>
          </ul>
        </div>
      </div>

      <main className={styles.setupMain}>
        <Link href="/" className={styles.back}>
          <Icon name="arrowLeft" />
          Zur Startseite
        </Link>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <h1 className={styles.title}>Tresor einrichten</h1>
          <p className={styles.lead}>Lege dein Master-Passwort fest. Damit entsperrst du künftig deinen Tresor.</p>

          <div className={field.field} style={{ marginTop: 32 }}>
            <label htmlFor="master" className={field.label}>
              Master-Passwort
            </label>
            <PasswordInput
              id="master"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              aria-describedby="master-strength master-rules"
              emphasis
              autoFocus
            />
            <div style={{ marginTop: 4 }}>
              <StrengthBar strength={strength} id="master-strength" />
            </div>
            <ul id="master-rules" className={styles.rules}>
              {rules.map((rule) => (
                <li key={rule.text} className={`${styles.rule} ${rule.ok ? styles.ruleOk : ""}`}>
                  <Icon name={rule.ok ? "check" : "circle"} size={16} strokeWidth={2.25} />
                  <span>
                    {rule.text}
                    <span className="sr-only">{rule.ok ? " (erfüllt)" : " (noch nicht erfüllt)"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={field.field} style={{ marginTop: 24 }}>
            <label htmlFor="confirm" className={field.label}>
              Master-Passwort wiederholen
            </label>
            <PasswordInput
              id="confirm"
              value={confirmation}
              onChange={setConfirmation}
              autoComplete="new-password"
              aria-describedby="confirm-status"
              invalid={confirmation.length > 0 && !matches}
            />
            <p
              id="confirm-status"
              role="status"
              className={!confirmation ? field.hint : matches ? field.success : field.error}
            >
              {matchText}
            </p>
          </div>

          <div className={styles.ack}>
            <input
              id="ack"
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />
            <label htmlFor="ack">
              Ich habe verstanden: Wenn ich das Master-Passwort vergesse, sind alle Daten in diesem Tresor verloren.
            </label>
          </div>

          <div style={{ marginTop: 28 }}>
            <Button type="submit" variant="primary" size="lg" block disabled={!valid || busy}>
              {busy ? "Tresor wird erstellt …" : "Tresor erstellen"}
            </Button>
          </div>
          {error && (
            <p role="alert" className={field.error} style={{ marginTop: 12 }}>
              <Icon name="alert" size={16} />
              {error}
            </p>
          )}

          <p className={styles.demoHint}>
            Erst mal ausprobieren?{" "}
            <button type="button" className={styles.linkButton} disabled={busy} onClick={() => run(createDemoVault)}>
              Demo-Tresor mit Beispieldaten laden
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}
