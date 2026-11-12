import { ROUTES } from "@/components/app/routes";
import { InstallButton } from "@/components/landing/InstallButton";
import styles from "@/components/landing/Landing.module.css";
import { VaultPreview } from "@/components/landing/VaultPreview";
import { ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "key",
    title: "Passwortgenerator",
    text: "Erzeugt starke Passwörter mit frei wählbarer Länge und Zeichenarten. Wie stark sie sind, siehst du sofort.",
  },
  {
    icon: "shield",
    title: "Sicherheitsbericht",
    text: "Findet schwache, mehrfach verwendete und alte Passwörter und zeigt dir, wo du nachbessern solltest.",
  },
  {
    icon: "lock",
    title: "Automatische Sperre",
    text: "Ohne Aktivität sperrt sich der Tresor von selbst. Kopierte Passwörter verschwinden nach 30 Sekunden aus der Zwischenablage.",
  },
  {
    icon: "device",
    title: "Offline nutzbar",
    text: "Einmal installiert, startet Latch auch ohne Internetverbindung direkt im Tresor.",
  },
];

const FLOW = [
  { title: "Master-Passwort", text: "nur im Arbeitsspeicher" },
  { title: "PBKDF2", text: "Schlüssel ableiten", mono: true },
  { title: "AES-GCM", text: "Tresor verschlüsseln", mono: true },
  { title: "IndexedDB", text: "verschlüsselt im Browser", mono: true, highlight: true },
];

const PROMISES = [
  "Das Master-Passwort wird nie gespeichert, auch nicht verschlüsselt.",
  "Es gibt keinen Server. Deine Einträge verlassen dein Gerät nicht.",
  "Exportieren und alles löschen kannst du jederzeit in den Einstellungen.",
];

const STEPS = [
  ["Installieren", "Klicke auf „App installieren“. Latch landet als eigene App auf deinem Gerät, ohne App Store."],
  ["Tresor einrichten", "Lege ein Master-Passwort fest. Es ist der einzige Schlüssel zu deinen Daten."],
  ["Loslegen", "Lege eigene Einträge an oder lade den Demo-Tresor mit Beispieldaten zum Ausprobieren."],
];

const BROWSERS = [
  ["Chrome und Edge", "Button „App installieren“ auf dieser Seite oder das Installieren-Symbol in der Adressleiste."],
  ["Safari", "iPhone und iPad: Teilen, dann „Zum Home-Bildschirm“. Mac: Ablage, dann „Zum Dock hinzufügen“."],
  ["Firefox", "Am Desktop einfach im Browser nutzen. Unter Android: Menü, dann „Installieren“."],
];

/** Startseite (Landingpage) mit Installieren-Button */
export default function Home() {
  return (
    <div className={styles.landing}>
      <header className={`${styles.wrap} ${styles.header}`}>
        <Logo href="/" size={26} />
        <nav aria-label="Hauptnavigation" className={styles.nav}>
          <a href="#funktionen">Funktionen</a>
          <a href="#sicherheit">Sicherheit</a>
          <a href="#installation">Installation</a>
          <ButtonLink href={ROUTES.vault}>Im Browser öffnen</ButtonLink>
        </nav>
      </header>

      <main>
        <section className={`${styles.wrap} ${styles.hero}`}>
          <div className={styles.heroText}>
            <p className={`mono ${styles.eyebrow}`}>Passwort-Manager · läuft komplett im Browser</p>
            <h1>
              Deine Passwörter.
              <br />
              Nur auf deinem Gerät.
            </h1>
            <p className={styles.lead}>
              Latch speichert deine Zugangsdaten verschlüsselt direkt im Browser. Kein Konto, kein Server, keine Cloud.
              Installierbar wie eine App und auch offline nutzbar.
            </p>
            <div className={styles.ctas}>
              <InstallButton />
              <ButtonLink href={ROUTES.vault} size="lg">
                Im Browser öffnen
              </ButtonLink>
            </div>
            <p className={styles.hint}>
              Safari oder Firefox? <a href="#installation">So installierst du Latch manuell</a>
            </p>
          </div>
          <div className={styles.heroVisual}>
            <VaultPreview />
          </div>
        </section>

        <section id="funktionen" aria-labelledby="f-title" className={`${styles.wrap} ${styles.features}`}>
          <h2 id="f-title">Alles, was ein Passwort-Manager können muss. Und nichts, was deine Daten verlässt.</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.feature}>
                <Icon name={f.icon} size={24} />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="sicherheit" aria-labelledby="s-title" className={styles.security}>
          <div className={`${styles.wrap} ${styles.securityInner}`}>
            <div className={styles.securityText}>
              <p className={`mono ${styles.eyebrowInverse}`}>So sicher sind deine Daten</p>
              <h2 id="s-title">Verschlüsselt, bevor irgendetwas gespeichert wird.</h2>
              <p>
                Aus deinem Master-Passwort wird mit PBKDF2 ein Schlüssel abgeleitet. Damit wird der ganze Tresor per
                AES-GCM verschlüsselt und erst dann im Browser abgelegt.
              </p>
            </div>
            <div className={styles.securityDetails}>
              <ol className={styles.flow} aria-label="Ablauf der Verschlüsselung">
                {FLOW.map((step, i) => (
                  <li key={step.title} className={`${styles.flowStep} ${step.highlight ? styles.flowHighlight : ""}`}>
                    {i > 0 && <Icon name="arrowRight" size={16} className={styles.flowArrow} />}
                    <p className={`${styles.flowTitle} ${step.mono ? "mono" : ""}`}>{step.title}</p>
                    <p className={styles.flowText}>{step.text}</p>
                  </li>
                ))}
              </ol>
              <ul className={styles.promises}>
                {PROMISES.map((text) => (
                  <li key={text}>
                    <Icon name="check" size={18} strokeWidth={2} />
                    {text}
                  </li>
                ))}
              </ul>
              <div className={styles.warning}>
                <Icon name="warning" size={20} />
                <p>
                  Vergisst du dein Master-Passwort, kann niemand den Tresor wieder öffnen, auch Latch nicht. Eine
                  Wiederherstellung gibt es bewusst nicht.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="installation" aria-labelledby="i-title" className={`${styles.wrap} ${styles.install}`}>
          <h2 id="i-title">In drei Schritten startklar</h2>
          <ol className={styles.steps}>
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className={`mono ${styles.stepNumber}`} aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <dl className={styles.browsers}>
            {BROWSERS.map(([name, text]) => (
              <div key={name} className={styles.browser}>
                <dt>{name}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.ctas}>
            <InstallButton />
            <ButtonLink href={ROUTES.vault} size="lg">
              Im Browser öffnen
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerInner}`}>
          <p>
            <Logo size={18} />
            <span>Latch ist ein Schulprojekt im Lernfeld 10 „Benutzerschnittstellen gestalten“.</span>
          </p>
          <nav aria-label="Rechtliches">
            <a href="#sicherheit">Datenschutz</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
