import type { Category } from "@/model/types";
import styles from "./CategoryTile.module.css";

const CLASS: Record<Category, string> = {
  Privat: styles.privat,
  Arbeit: styles.arbeit,
  Schule: styles.schule,
  Finanzen: styles.finanzen,
  Shopping: styles.shopping,
  Sonstiges: styles.sonstiges,
};

/** Farbige Kachel mit dem Anfangsbuchstaben – Farbe je Kategorie. */
export function CategoryTile({ title, category, size = 36 }: { title: string; category: Category; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.tile} ${CLASS[category]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42), borderRadius: Math.round(size / 4) }}
    >
      {title.charAt(0).toUpperCase() || "?"}
    </span>
  );
}
