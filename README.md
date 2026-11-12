# Latch – Passwort-Manager als PWA

Latch ist ein Passwort-Manager, der komplett im Browser läuft. Die Zugangsdaten werden verschlüsselt **nur auf dem eigenen Gerät** gespeichert – es gibt kein Konto, keinen Server und keine Cloud. Die App lässt sich wie eine normale App installieren und funktioniert auch offline.

Schulprojekt der Klasse 12IT2 im Lernfeld 10 „Benutzerschnittstellen gestalten“.

---

## Inhalt

1. [Funktionen](#funktionen)
2. [Schnellstart](#schnellstart)
3. [Bedienung (Anleitung)](#bedienung-anleitung)
4. [Technik](#technik)
5. [Architektur nach MVC](#architektur-nach-mvc)
6. [Sicherheit](#sicherheit)
7. [Barrierefreiheit](#barrierefreiheit)
8. [Qualitätssicherung](#qualitätssicherung)
9. [Grenzen und bewusste Entscheidungen](#grenzen-und-bewusste-entscheidungen)

---

## Funktionen

| Bereich                  | Was die App kann                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Tresor einrichten**    | Master-Passwort festlegen, Regeln werden live geprüft, Stärkeanzeige in vier Stufen                                  |
| **Entsperren / Sperren** | Entsperren mit Master-Passwort, manuell sperren, automatische Sperre nach 1–30 Minuten ohne Aktivität                |
| **Tresor-Übersicht**     | Einträge anlegen, bearbeiten, löschen (mit Rückfrage), Suche (Strg + K), Filter nach Kategorie, Favoriten            |
| **Kopieren**             | Benutzername und Passwort kopieren; Passwörter werden nach 15/30/60 Sekunden wieder aus der Zwischenablage gelöscht  |
| **Passwortgenerator**    | Länge 8–64, vier Zeichenarten, „ähnliche Zeichen vermeiden“, Stärke und Entropie (Bit), direkt als Eintrag speichern |
| **Sicherheitsbericht**   | Findet schwache, mehrfach verwendete und alte Passwörter (älter als 12 Monate) mit Begründung                        |
| **Einstellungen**        | Sperrzeit, Zwischenablage, Sperren im Hintergrund, Hell / Dunkel / System, Export, Demo-Daten, alles löschen         |
| **PWA**                  | Installierbar (Chrome, Edge, Safari, Android), startet offline, eigenes App-Icon                                     |

## Schnellstart

Voraussetzung: **Node.js 20.9 oder neuer**.

```bash
npm install      # Abhängigkeiten installieren
npm run dev      # Entwicklungsserver auf http://localhost:3000
```

Fertige Version bauen und lokal starten (nur hier ist der Service Worker aktiv, also Offline-Betrieb und Installation):

```bash
npm run build    # statischer Export nach out/ + Service Worker vorbereiten
npm start        # out/ auf http://localhost:3000 ausliefern
```

Weitere Befehle:

| Befehl           | Zweck                                       |
| ---------------- | ------------------------------------------- |
| `npm run lint`   | ESLint (inkl. Prüfung der MVC-Trennung)     |
| `npm run format` | Code mit Prettier formatieren               |
| `npm run check`  | Typprüfung + ESLint + Formatierung in einem |

### Demo ausprobieren

Auf der Seite „Tresor einrichten“ auf **„Demo-Tresor mit Beispieldaten laden“** klicken. Es werden 15 erfundene Einträge angelegt, darunter absichtlich unsichere, damit der Sicherheitsbericht etwas zu zeigen hat.

Master-Passwort des Demo-Tresors: **`demo`**

> Die Demo-Daten sind frei erfunden (Benutzernamen auf `example.com`). Für echte Passwörter bitte einen eigenen Tresor mit starkem Master-Passwort anlegen.

## Bedienung (Anleitung)

1. **Startseite öffnen** und „App installieren“ oder „Im Browser öffnen“ wählen.
   - Chrome / Edge: Der Button öffnet direkt den Installationsdialog.
   - Safari (iPhone/iPad): Teilen → „Zum Home-Bildschirm“. Safari (Mac): Ablage → „Zum Dock hinzufügen“.
   - Firefox: Am Desktop im Browser nutzen, unter Android Menü → „Installieren“.
2. **Tresor einrichten:** Master-Passwort zweimal eingeben (mindestens 12 Zeichen, Groß- und Kleinbuchstaben, mindestens eine Ziffer oder ein Sonderzeichen) und bestätigen, dass es nicht wiederhergestellt werden kann.
3. **Einträge anlegen:** „Neuer Eintrag“ – ein starkes Passwort wird automatisch vorgeschlagen und kann über die Generator-Optionen angepasst werden.
4. **Passwort verwenden:** Eintrag auswählen, Passwort kopieren und beim Dienst einfügen. Nach der eingestellten Zeit wird die Zwischenablage geleert.
5. **Sicherheit prüfen:** Unter „Sicherheit“ steht, welche Passwörter geändert werden sollten. „Passwort ändern“ öffnet den Eintrag direkt.
6. **Sperren:** „Jetzt sperren“ in der Seitenleiste (bzw. Schloss-Symbol am Smartphone). Ohne Aktivität sperrt sich der Tresor automatisch.
7. **Sichern:** Unter „Einstellungen“ → „Exportieren“ wird eine verschlüsselte `.json`-Sicherung heruntergeladen.

Tastenkürzel: **Strg + K** (Mac: Cmd + K) springt in die Suche, **Esc** schließt den Dialog.

## Technik

| Bereich         | Umsetzung                                                                    |
| --------------- | ---------------------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router) mit React 19, statischer Export (`output: "export"`) |
| Sprache         | TypeScript (strikt)                                                          |
| Styling         | CSS Modules + CSS-Variablen (Design-Tokens, heller und dunkler Modus)        |
| Speicherung     | IndexedDB (Datenbank `latch`)                                                |
| Verschlüsselung | Web Crypto API: PBKDF2-SHA-256 + AES-GCM 256 Bit                             |
| Offline         | Eigener Service Worker (`public/sw.js`) + Web App Manifest                   |
| Schriften       | Instrument Sans, JetBrains Mono (über `next/font`, lokal ausgeliefert)       |
| Codequalität    | ESLint (Next-Regeln + eigene MVC-Regel), Prettier                            |

Es gibt **keine Laufzeit-Abhängigkeiten** außer Next.js und React – Verschlüsselung, Passwortgenerator, Stärkeprüfung und Service Worker sind selbst geschrieben.

### Routen

| Adresse           | Seite                                                   |
| ----------------- | ------------------------------------------------------- |
| `/`               | Startseite mit Installieren-Button                      |
| `/app/setup/`     | Tresor einrichten                                       |
| `/app/unlock/`    | Entsperren                                              |
| `/app/`           | Tresor-Übersicht (Einträge öffnen sich in einem Dialog) |
| `/app/generator/` | Passwortgenerator                                       |
| `/app/report/`    | Sicherheitsbericht                                      |
| `/app/settings/`  | Einstellungen                                           |

`AppGate` leitet automatisch weiter: ohne Tresor → Einrichten, gesperrt → Entsperren.

## Architektur nach MVC

Der Code ist strikt in drei Schichten getrennt:

```
src/
├── model/        Model – Daten und Logik, ohne React
├── controller/   Controller – React-Hooks, verbinden Model und View
├── components/   View – wiederverwendbare Oberflächen-Bausteine
└── app/          View – Seiten (Routen von Next.js)
```

```
  View (app/, components/)
        │  ruft Hooks auf, zeigt Daten an
        ▼
  Controller (controller/)
        │  ruft Funktionen auf, hält den Zustand
        ▼
  Model (model/)
        │  liest / schreibt verschlüsselt
        ▼
  IndexedDB
```

**Model** (`src/model/`) – reines TypeScript, ohne React, einzeln testbar:

| Datei                  | Aufgabe                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `types.ts`             | Datentypen (Eintrag, Tresor, Einstellungen …) und Konstanten  |
| `CryptoService.ts`     | Schlüssel ableiten (PBKDF2), ver- und entschlüsseln (AES-GCM) |
| `VaultRepository.ts`   | Speichern und Laden in IndexedDB                              |
| `VaultService.ts`      | Einträge anlegen, ändern, löschen, filtern, prüfen            |
| `PasswordGenerator.ts` | Zufällige Passwörter mit `crypto.getRandomValues`             |
| `StrengthMeter.ts`     | Passwortstärke in vier Stufen, Regeln für das Master-Passwort |
| `SecurityReport.ts`    | Schwache, mehrfach verwendete und alte Passwörter finden      |
| `demoData.ts`          | Erfundene Beispieldaten                                       |

**Controller** (`src/controller/`) – React-Hooks:

| Datei                     | Aufgabe                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| `VaultContext.tsx`        | Zentraler Zustand: Status, Einträge, Schlüssel im Speicher, Aktionen      |
| `useAutoLock.ts`          | Sperre nach Inaktivität bzw. beim Wechsel in den Hintergrund              |
| `useClipboard.ts`         | Kopieren mit automatischem Leeren der Zwischenablage                      |
| `useEntryForm.ts`         | Formular „Eintrag anlegen / bearbeiten“                                   |
| `useEntryList.ts`         | Suche, Filter und Zahlen für die Übersicht                                |
| `usePasswordGenerator.ts` | Zustand des Generators                                                    |
| `usePasswordCheck.ts`     | Live-Stärkeprüfung, Regeln für das Master-Passwort                        |
| `useSecurityReport.ts`    | Bericht mit „Erneut prüfen“                                               |
| `useApplyTheme.ts`        | Hell / Dunkel / System anwenden                                           |
| `useInstallPrompt.ts`     | Button „App installieren“ (`beforeinstallprompt`)                         |
| `useServiceWorker.ts`     | Service Worker registrieren                                               |
| `vaultIntent.ts`          | Übergabe an den Tresor, z. B. „mit diesem Passwort neuen Eintrag anlegen“ |

**View** (`src/app/`, `src/components/`) – zeigt nur an und ruft Controller-Hooks auf.

Die Trennung wird **automatisch geprüft**: Eine ESLint-Regel in `eslint.config.mjs` verbietet, dass Views etwas anderes als Typen aus `src/model/` importieren. Ein Verstoß bricht `npm run lint` mit der Meldung „Views greifen nicht direkt auf das Model zu“ ab.

## Sicherheit

```
Master-Passwort ──PBKDF2 (600 000 Runden, SHA-256, zufälliges Salt)──▶ Schlüssel (nur im Arbeitsspeicher)
                                                                          │
Tresor (alle Einträge als JSON) ──AES-GCM 256 Bit, neuer IV bei jedem Speichern──▶ IndexedDB
```

- Das **Master-Passwort wird nie gespeichert**, auch nicht verschlüsselt. Ob es stimmt, erkennt AES-GCM selbst: Mit falschem Schlüssel schlägt die Entschlüsselung fehl.
- Der abgeleitete Schlüssel liegt nur im Arbeitsspeicher und wird beim Sperren verworfen.
- Gespeichert werden nur `salt`, `iv`, `ciphertext` und die Rundenzahl – im Klartext steht nichts im Browser.
- Zufall kommt ausschließlich aus `crypto.getRandomValues`, nie aus `Math.random`.
- Es gibt keinen Server und keine Netzwerk-Anfragen mit Tresordaten. Der Service Worker speichert nur die App selbst (HTML, JS, CSS, Icons), nicht den Tresor.
- Passwörter werden nie in die Adresszeile geschrieben (z. B. beim Weg vom Generator zum Tresor), damit sie nicht im Browserverlauf landen.
- Einstellungen (Sperrzeit, Design) sind nicht geheim und werden unverschlüsselt gespeichert.

**Wichtig:** Wer das Master-Passwort vergisst, kann den Tresor nicht mehr öffnen. Eine Wiederherstellung gibt es bewusst nicht.

## Barrierefreiheit

- Alle Funktionen sind per Tastatur bedienbar, mit sichtbarem Fokusrahmen.
- „Zum Inhalt springen“ ist der erste Tab-Stopp und überspringt die Navigation.
- Der Dialog nutzt das native `<dialog>`: Fokus bleibt im Dialog, Esc schließt ihn, danach springt der Fokus zurück zum auslösenden Button.
- Icon-Buttons haben eine Beschriftung für Screenreader (`aria-label`), Rückmeldungen wie „Passwort kopiert“ werden über einen Live-Bereich vorgelesen.
- Die Stärkeanzeige zeigt immer auch einen Text („Schwach“ … „Stark“), nicht nur Farbe.
- Kontraste erfüllen WCAG AA im hellen und im dunklen Modus.
- Buttons und Icon-Buttons sind mindestens 44 px hoch (gut mit dem Finger zu treffen); die Smartphone-Ansicht ist mit 390 px Breite getestet.

Geprüft mit **axe-core** (WCAG 2.1 A/AA + Best Practices) auf Startseite, Tresor, Dialog, Generator, Bericht und Einstellungen – jeweils hell und dunkel ohne Befund.

## Qualitätssicherung

| Prüfung                | Ergebnis                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run check`        | Typprüfung, ESLint und Prettier ohne Fehler                                                     |
| Barrierefreiheit (axe) | 0 Verstöße auf allen geprüften Seiten, hell und dunkel                                          |
| Tastatur               | Fokusreihenfolge, Dialog-Fokus, Sprunglink, Strg + K geprüft                                    |
| Offline                | Fertigen Build gestartet, Server beendet: App lädt, Demo-Tresor und Seitenwechsel funktionieren |
| Installation           | Chrome bietet die Installation an, Button öffnet den Installationsdialog                        |
| Responsive             | Desktop und Smartphone (390 px Breite)                                                          |

## Grenzen und bewusste Entscheidungen

- **Nur ein Gerät:** Ohne Server gibt es keine Synchronisation. Der Export dient als Sicherung.
- **Kein Import:** Die exportierte Datei kann (noch) nicht wieder eingelesen werden.
- **Zwischenablage:** Browser erlauben das Leeren nur, solange die Seite im Vordergrund ist.
- **Manifest-Scope `/`:** `start_url` ist `/app/`, der Scope umfasst aber auch die Startseite, damit die Installation direkt von dort funktioniert.
- **TypeScript 7 + ESLint:** `typescript-eslint` unterstützt TS 7 noch nicht. Deshalb ist TS 6 unter dem Namen `typescript` installiert (für ESLint und Next.js) und TS 7 als `@typescript/native` (für `tsc`) – so wie es das TypeScript-Team empfiehlt.
- **Service Worker nur im Build:** Im Entwicklungsmodus wird er nicht registriert, damit der Cache keine Änderungen verdeckt.
