import type { Category, IssueType } from "@/model/types";
import { CategoryTile } from "@/components/vault/CategoryTile";
import { IssueTag } from "@/components/vault/IssueTag";
import styles from "./Landing.module.css";

const ROWS: { title: string; user: string; category: Category; issue?: IssueType }[] = [
  { title: "Amazon", user: "paul.dawadi@example.com", category: "Shopping", issue: "reused" },
  { title: "Deutsche Bahn", user: "paul.dawadi@example.com", category: "Sonstiges", issue: "old" },
  { title: "GitHub", user: "pdawadi-dev", category: "Arbeit" },
  { title: "Gmail", user: "paul.dawadi@example.com", category: "Privat" },
  { title: "Moodle LGS", user: "p.dawadi", category: "Schule", issue: "weak" },
  { title: "Notion", user: "paul.dawadi@example.com", category: "Arbeit" },
  { title: "Sparkasse", user: "4471209", category: "Finanzen", issue: "old" },
  { title: "Spotify", user: "paul.dawadi@example.com", category: "Privat", issue: "weak" },
];

/** Verkleinerte, nicht bedienbare Vorschau der Tresor-Übersicht für die Startseite. */
export function VaultPreview() {
  return (
    <div role="img" aria-label="Vorschau: Tresor-Übersicht von Latch mit Einträgen und Sicherheitshinweisen" className={styles.preview}>
      <div className={styles.previewSide} aria-hidden="true">
        <p className={styles.previewBrand}>Latch</p>
        <p className={`${styles.previewNav} ${styles.previewNavActive}`}>
          Tresor <span>15</span>
        </p>
        <p className={styles.previewNav}>Generator</p>
        <p className={styles.previewNav}>
          Sicherheit <span className={styles.previewBadge}>9</span>
        </p>
        <p className={styles.previewNav}>Einstellungen</p>
      </div>
      <div className={styles.previewMain} aria-hidden="true">
        <div className={styles.previewBar}>
          <span className={styles.previewSearch}>
            Suchen … <span className="mono">Strg K</span>
          </span>
          <span className={styles.previewNew}>+ Neu</span>
        </div>
        {ROWS.map((row) => (
          <div key={row.title} className={styles.previewRow}>
            <CategoryTile title={row.title} category={row.category} size={30} />
            <span className={styles.previewText}>
              <span className={styles.previewTitle}>{row.title}</span>
              <span className="mono">{row.user}</span>
            </span>
            {row.issue && <IssueTag type={row.issue} small />}
          </div>
        ))}
      </div>
    </div>
  );
}
