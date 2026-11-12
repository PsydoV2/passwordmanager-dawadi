"use client";

import { useRouter } from "next/navigation";
import page from "@/components/app/Page.module.css";
import { ROUTES } from "@/components/app/routes";
import { Button } from "@/components/ui/Button";
import { StrengthBar } from "@/components/ui/StrengthBar";
import { useToast } from "@/components/ui/Toast";
import styles from "@/components/generator/Generator.module.css";
import { PasswordText } from "@/components/vault/PasswordText";
import { useClipboard } from "@/controller/useClipboard";
import { MAX_LENGTH, MIN_LENGTH, usePasswordGenerator } from "@/controller/usePasswordGenerator";
import { setVaultIntent } from "@/controller/vaultIntent";
import type { GeneratorOptions } from "@/model/types";

const PRESETS = [12, 16, 20, 32];

const OPTIONS: { key: keyof Omit<GeneratorOptions, "length">; label: string; sample: string }[] = [
  { key: "uppercase", label: "Großbuchstaben", sample: "A–Z" },
  { key: "lowercase", label: "Kleinbuchstaben", sample: "a–z" },
  { key: "digits", label: "Ziffern", sample: "0–9" },
  { key: "symbols", label: "Sonderzeichen", sample: "!#$%&*" },
  { key: "avoidSimilar", label: "Ähnliche Zeichen vermeiden", sample: "I l 1 O 0" },
];

const TIPS = [
  ["Länge schlägt Komplexität", "Jedes zusätzliche Zeichen vervielfacht die Zahl der möglichen Kombinationen."],
  ["Für jedes Konto ein eigenes", "Wird ein Dienst gehackt, bleiben deine anderen Konten sicher."],
  ["Merken musst du es nicht", "Das übernimmt Latch. Merken musst du dir nur dein Master-Passwort."],
];

/** Ansicht „Passwortgenerator“ */
export default function GeneratorPage() {
  const gen = usePasswordGenerator();
  const { copy, clearSeconds } = useClipboard();
  const toast = useToast();
  const router = useRouter();
  const { options } = gen;

  const onCopy = async () => {
    try {
      await copy(gen.password, { sensitive: true });
      toast(`Kopiert · wird in ${clearSeconds} s aus der Zwischenablage gelöscht`);
    } catch {
      toast("Kopieren nicht möglich – der Browser hat den Zugriff verweigert.");
    }
  };

  const saveAsEntry = () => {
    setVaultIntent({ kind: "new", password: gen.password });
    router.push(ROUTES.vault);
  };

  return (
    <div className={page.page}>
      <div className={page.header}>
        <div>
          <h1>Passwortgenerator</h1>
          <p>Erzeugt Passwörter aus echtem Zufall direkt auf deinem Gerät.</p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={`${page.card} ${styles.output}`}>
            <div className={styles.outputText}>
              {/* Screenreader lesen das neue Passwort vor, sobald es sich ändert. */}
              <p className={styles.password} aria-live="polite">
                <span className="sr-only">Generiertes Passwort: </span>
                <PasswordText value={gen.password} />
              </p>
              <div className={styles.strength}>
                <div className={styles.strengthBar}>
                  <StrengthBar strength={gen.strength} labelWidth={56} />
                </div>
                <span className={`mono ${styles.bits}`}>≈ {gen.bits} Bit</span>
              </div>
            </div>
            <div className={styles.actions}>
              <Button icon="refresh" onClick={gen.regenerate}>
                Neu generieren
              </Button>
              <Button icon="plus" onClick={saveAsEntry}>
                Als Eintrag speichern
              </Button>
              <Button variant="primary" icon="copy" onClick={onCopy}>
                Kopieren
              </Button>
            </div>
          </div>

          <p className={styles.legend}>
            <span className={styles.digit}>7</span> Ziffern und <span className={styles.symbol}>#</span> Sonderzeichen
            sind farbig, damit du sie beim Abtippen nicht verwechselst.
          </p>

          <div className={`${page.card} ${styles.settings}`}>
            <div className={styles.lengthRow}>
              <label htmlFor="g-len">Länge</label>
              <input
                id="g-len"
                type="range"
                min={MIN_LENGTH}
                max={MAX_LENGTH}
                value={options.length}
                onChange={(e) => gen.update({ length: Number(e.target.value) })}
              />
              <span className={`mono ${styles.lengthValue}`}>{options.length}</span>
              <div role="group" aria-label="Schnellauswahl Länge" className={styles.presets}>
                {PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={options.length === n}
                    className={styles.preset}
                    onClick={() => gen.update({ length: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.kinds}>
              {OPTIONS.map((opt) => {
                const isKind = opt.key !== "avoidSimilar";
                const lastKind = isKind && options[opt.key] && gen.activeKinds === 1;
                return (
                  <label key={opt.key} className={styles.kind}>
                    <input
                      type="checkbox"
                      checked={options[opt.key]}
                      disabled={lastKind}
                      onChange={() => gen.update({ [opt.key]: !options[opt.key] })}
                    />
                    <span className={styles.kindLabel}>{opt.label}</span>
                    <span className={`mono ${styles.kindSample}`}>{opt.sample}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <aside aria-labelledby="tips-title" className={styles.tips}>
          <h2 id="tips-title">Woran erkennt man ein starkes Passwort?</h2>
          {TIPS.map(([title, text]) => (
            <div key={title} className={styles.tip}>
              <p className={styles.tipTitle}>{title}</p>
              <p>{text}</p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
