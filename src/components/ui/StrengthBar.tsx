import type { StrengthResult } from "@/model/types";
import styles from "./StrengthBar.module.css";

interface StrengthBarProps {
  strength: StrengthResult;
  id?: string;
  /** Breite der Beschriftung rechts. */
  labelWidth?: number;
}

/** Vier Balken plus Beschriftung (Schwach … Stark). Die Farbe allein trägt keine Information. */
export function StrengthBar({ strength, id, labelWidth = 64 }: StrengthBarProps) {
  const { level, label } = strength;
  return (
    <div className={`${styles.row} ${styles[`l${level}`]}`}>
      <div className={styles.track} aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={i <= level ? styles.on : styles.off} />
        ))}
      </div>
      <span id={id} className={styles.label} style={{ flexBasis: labelWidth }}>
        {label ? (
          <>
            <span className="sr-only">Stärke: </span>
            {label}
          </>
        ) : (
          "–"
        )}
      </span>
    </div>
  );
}
