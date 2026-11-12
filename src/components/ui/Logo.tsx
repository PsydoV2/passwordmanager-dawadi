import Link from "next/link";
import styles from "./Logo.module.css";

interface LogoProps {
  href?: string;
  size?: number;
  /** Auf dunkler/umgekehrter Fläche (z. B. Infospalte beim Einrichten). */
  inverse?: boolean;
}

/** Riegel-Symbol und Schriftzug „Latch“. */
export function Logo({ href, size = 24, inverse = false }: LogoProps) {
  const content = (
    <>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={styles.mark}>
        <rect x="1" y="1" width="22" height="22" rx="6" className={styles.plate} />
        <rect x="5" y="10" width="10" height="4" rx="1" className={styles.bolt} />
        <rect x="16.5" y="6.5" width="2.5" height="11" rx="1.25" className={styles.bolt} />
      </svg>
      <span className={styles.word} style={{ fontSize: Math.round(size * 0.8) }}>
        Latch
      </span>
    </>
  );
  const className = `${styles.logo} ${inverse ? styles.inverse : ""}`;
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
}
