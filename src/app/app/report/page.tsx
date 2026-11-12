"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import page from "@/components/app/Page.module.css";
import { ROUTES } from "@/components/app/routes";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import styles from "@/components/report/Report.module.css";
import { CategoryTile } from "@/components/vault/CategoryTile";
import { formatCheckedAt } from "@/components/vault/format";
import { IssueTag } from "@/components/vault/IssueTag";
import { useSecurityReport, type ReportItem } from "@/controller/useSecurityReport";
import { setVaultIntent } from "@/controller/vaultIntent";
import type { IssueType } from "@/model/types";

const GROUPS: { type: IssueType; anchor: string; title: string; stat: string; hint: string }[] = [
  { type: "weak", anchor: "schwach", title: "Schwache Passwörter", stat: "Schwach", hint: "Leicht zu erraten oder zu kurz" },
  { type: "reused", anchor: "mehrfach", title: "Mehrfach verwendet", stat: "Mehrfach verwendet", hint: "Dasselbe Passwort bei mehreren Konten" },
  { type: "old", anchor: "alt", title: "Alte Passwörter", stat: "Älter als 12 Monate", hint: "Seit über einem Jahr nicht geändert" },
];

/** Ansicht „Sicherheitsbericht“ */
export default function ReportPage() {
  const { report, groups, checkedAt, recheck } = useSecurityReport();
  const toast = useToast();
  const router = useRouter();
  const { total, issueCount, okCount } = report;

  const edit = (item: ReportItem) => {
    setVaultIntent({ kind: "edit", id: item.entry.id });
    router.push(ROUTES.vault);
  };

  const onRecheck = () => {
    recheck();
    toast("Prüfung abgeschlossen");
  };

  const counts: Record<IssueType | "ok", number> = {
    weak: groups.weak.length,
    reused: groups.reused.length,
    old: groups.old.length,
    ok: okCount,
  };

  return (
    <div className={`${page.page} ${page.narrow}`}>
      <div className={page.header}>
        <div>
          <h1>Sicherheitsbericht</h1>
          <p>
            {total === 1 ? "1 Eintrag" : `Alle ${total} Einträge`} geprüft · {formatCheckedAt(checkedAt)}
          </p>
        </div>
        <Button icon="refresh" onClick={onRecheck}>
          Erneut prüfen
        </Button>
      </div>

      {total === 0 ? (
        <div className={`${page.card} ${styles.allGood}`}>
          <Icon name="shield" size={28} />
          <div>
            <h2>Noch nichts zu prüfen</h2>
            <p>
              Sobald dein Tresor Einträge enthält, findest du hier schwache, mehrfach verwendete und alte Passwörter.{" "}
              <Link href={ROUTES.vault}>Zum Tresor</Link>
            </p>
          </div>
        </div>
      ) : (
        <section aria-labelledby="sum-title" className={`${page.card} ${styles.summary}`}>
          <h2 id="sum-title">
            {issueCount === 0
              ? "Alle Passwörter sind in Ordnung"
              : `${issueCount} von ${total} Einträgen ${issueCount === 1 ? "braucht" : "brauchen"} Aufmerksamkeit`}
          </h2>
          <div
            className={styles.bar}
            role="img"
            aria-label={`Verteilung: ${okCount} ohne Befund, ${counts.weak} schwach, ${counts.reused} mehrfach verwendet, ${counts.old} alt`}
          >
            {(["weak", "reused", "old", "ok"] as const).map(
              (key) => counts[key] > 0 && <span key={key} className={styles[`seg-${key}`]} style={{ flexGrow: counts[key] }} />,
            )}
          </div>
          <div className={styles.stats}>
            {GROUPS.map((g) => (
              <a key={g.type} href={`#${g.anchor}`} className={styles.stat}>
                <span className={styles.statLabel}>
                  <span aria-hidden="true" className={`${styles.dot} ${styles[`seg-${g.type}`]}`} />
                  {g.stat}
                </span>
                <span className={styles.statValue}>{counts[g.type]}</span>
              </a>
            ))}
            <Link href={ROUTES.vault} className={styles.stat}>
              <span className={styles.statLabel}>
                <span aria-hidden="true" className={`${styles.dot} ${styles["seg-ok"]}`} />
                Ohne Befund
              </span>
              <span className={styles.statValue}>{okCount}</span>
            </Link>
          </div>
        </section>
      )}

      {GROUPS.map((g) => {
        const items = groups[g.type];
        if (items.length === 0) return null;
        return (
          <section key={g.type} id={g.anchor} aria-labelledby={`h-${g.anchor}`} className={`${page.card} ${styles.group}`}>
            <div className={styles.groupHead}>
              <h2 id={`h-${g.anchor}`}>
                {g.title} <span>{items.length}</span>
              </h2>
              <p>{g.hint}</p>
            </div>
            <ul className={styles.items}>
              {items.map((item) => (
                <li key={item.entry.id} className={styles.item}>
                  <CategoryTile title={item.entry.title} category={item.entry.category} />
                  <div className={styles.itemText}>
                    <p className={styles.itemTitle}>{item.entry.title}</p>
                    <p className={styles.itemReason}>{item.issue.reason}</p>
                  </div>
                  <IssueTag type={g.type} />
                  <button
                    type="button"
                    className={styles.fix}
                    onClick={() => edit(item)}
                    aria-label={`Passwort von ${item.entry.title} ändern`}
                  >
                    Passwort ändern
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className={page.footnote}>
        <Icon name="shieldCheck" size={16} />
        Die Prüfung läuft vollständig auf diesem Gerät. Es werden keine Passwörter an Online-Dienste übertragen.
      </p>
    </div>
  );
}
