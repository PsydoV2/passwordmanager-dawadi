import type { EntryDraft, VaultEntry } from "./types";

/**
 * Demo-Tresor mit 15 erfundenen Beispieleinträgen für Präsentation und Usability-Test.
 *
 * Einige Passwörter sind absichtlich unsicher, damit der Sicherheitsbericht etwas findet:
 * 3 schwache, 2 Paare mehrfach verwendeter und 2 alte Passwörter.
 * Alle Zugangsdaten sind ausgedacht; E-Mail-Adressen nutzen die reservierte Domain example.com.
 */

/** Master-Passwort des Demo-Tresors (wird auch auf der Entsperren-Seite angezeigt). */
export const DEMO_MASTER_PASSWORD = "demo";

const MONTH_MS = 1000 * 60 * 60 * 24 * 30.44;

type DemoEntry = EntryDraft & { monthsAgo: number };

const MAIL = "paul.dawadi@example.com";

const DEMO_ENTRIES: DemoEntry[] = [
  { title: "Amazon", username: MAIL, password: "Sonne#Strand88", url: "amazon.de", category: "Shopping", note: "Prime-Abo läuft über dieses Konto.", favorite: false, monthsAgo: 6 },
  { title: "Deutsche Bahn", username: MAIL, password: "Zugfahrt2023", url: "bahn.de", category: "Sonstiges", note: "BahnCard 25", favorite: false, monthsAgo: 22 },
  { title: "Discord", username: "paul.d", password: "p9!Zr4@kLm2#Qe7v", url: "discord.com", category: "Privat", note: "Zwei-Faktor-Anmeldung aktiv.", favorite: false, monthsAgo: 3 },
  { title: "GitHub", username: "pdawadi-dev", password: "tR8#mQv2!xLp9$Wz", url: "github.com", category: "Arbeit", note: "Wiederherstellungscodes liegen ausgedruckt im Ordner „Schule“.", favorite: true, monthsAgo: 2 },
  { title: "Gmail", username: MAIL, password: "Kiefer-Ruder-Nebel-71", url: "mail.google.com", category: "Privat", note: "Haupt-E-Mail, für die meisten Konten verwendet.", favorite: true, monthsAgo: 5 },
  { title: "Jira", username: "p.dawadi", password: "Qm4$vT8!nB2#xW", url: "jira.example.com", category: "Arbeit", note: "Zugang über den Ausbildungsbetrieb.", favorite: false, monthsAgo: 4 },
  { title: "Microsoft 365", username: "p.dawadi@schule.example", password: "Herbst-Tafel-2025", url: "office.com", category: "Schule", note: "Schulkonto", favorite: false, monthsAgo: 2 },
  { title: "Moodle LGS", username: "p.dawadi", password: "paul2007", url: "moodle.lgsit.de", category: "Schule", note: "Abgaben für LF10 laufen hierüber.", favorite: false, monthsAgo: 8 },
  { title: "Netflix", username: MAIL, password: "Sonne#Strand88", url: "netflix.com", category: "Privat", note: "Familienkonto", favorite: false, monthsAgo: 6 },
  { title: "Notion", username: MAIL, password: "Wn7!cK3$pR9@tY", url: "notion.so", category: "Arbeit", note: "Projektplan für das LF10-Projekt", favorite: false, monthsAgo: 1 },
  { title: "Router", username: "admin", password: "admin1234", url: "192.168.178.1", category: "Sonstiges", note: "WLAN-Router im Flur", favorite: false, monthsAgo: 36 },
  { title: "Sparkasse", username: "4471209", password: "Hanau2021!", url: "sparkasse.de", category: "Finanzen", note: "Anmeldename steht auch auf der Karte.", favorite: false, monthsAgo: 19 },
  { title: "Spotify", username: MAIL, password: "musik123", url: "spotify.com", category: "Privat", note: "", favorite: false, monthsAgo: 10 },
  { title: "Steam", username: "pd_gaming", password: "Gamer!2023x", url: "store.steampowered.com", category: "Privat", note: "Steam Guard per App", favorite: false, monthsAgo: 7 },
  { title: "Twitch", username: "pd_gaming", password: "Gamer!2023x", url: "twitch.tv", category: "Privat", note: "", favorite: false, monthsAgo: 7 },
];

/** Erzeugt die Demo-Einträge mit Zeitstempeln relativ zu „jetzt“, damit das Alter immer stimmt. */
export function createDemoEntries(now: number = Date.now()): VaultEntry[] {
  return DEMO_ENTRIES.map(({ monthsAgo, ...draft }) => {
    const changed = Math.round(now - monthsAgo * MONTH_MS);
    return {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: changed,
      updatedAt: changed,
      passwordChangedAt: changed,
    };
  });
}
