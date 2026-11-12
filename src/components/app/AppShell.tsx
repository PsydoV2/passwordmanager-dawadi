"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVault } from "@/controller/VaultContext";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ToastProvider } from "@/components/ui/Toast";
import { ROUTES } from "./routes";
import styles from "./AppShell.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

const NAV: NavItem[] = [
  { href: ROUTES.vault, label: "Tresor", icon: "vault" },
  { href: ROUTES.generator, label: "Generator", icon: "key" },
  { href: ROUTES.report, label: "Sicherheit", icon: "shield" },
  { href: ROUTES.settings, label: "Einstellungen", icon: "sliders" },
];

/** App-Rahmen: Seitenleiste am Desktop, Tab-Leiste unten am Smartphone. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { entries, report, settings, lock } = useVault();
  const pathname = usePathname();
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const issues = report.issueCount;

  const counter = (href: string) => {
    if (href === ROUTES.vault) return <span className={styles.count}>{entries.length}</span>;
    if (href === ROUTES.report && issues > 0)
      return (
        <span className={styles.badge}>
          {issues}
          <span className="sr-only"> Hinweise</span>
        </span>
      );
    return null;
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Logo href="/" size={24} />
        </div>
        <nav aria-label="App-Navigation" className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={path === item.href ? "page" : undefined}
              className={styles.navLink}
            >
              <Icon name={item.icon} />
              {item.label}
              {counter(item.href)}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <p className={styles.deviceNote}>
            <Icon name="device" size={15} />
            Nur auf diesem Gerät
          </p>
          <div className={styles.lockCard}>
            <p>
              Sperrt sich nach <strong>{settings.autoLockMinutes} Min.</strong> ohne Aktivität
            </p>
            <button type="button" className={styles.lockButton} onClick={() => lock("manual")}>
              <Icon name="lock" size={16} />
              Jetzt sperren
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <ToastProvider>{children}</ToastProvider>
      </main>

      <nav aria-label="App-Navigation" className={styles.tabbar}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={path === item.href ? "page" : undefined}
            className={styles.tab}
          >
            <span className={styles.tabIcon}>
              <Icon name={item.icon} size={20} />
              {item.href === ROUTES.report && issues > 0 && (
                <span className={styles.tabBadge}>
                  {issues}
                  <span className="sr-only"> Hinweise</span>
                </span>
              )}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
