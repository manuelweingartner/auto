# Planung Autos und Hunde

Wochenübersicht Montag bis Freitag für die Familie: wer geht wann mit den
Hunden, und wann ist welches Auto (Kia PV5, Toyota RAV) weg. Samstag und
Sonntag gibt es nicht, die Koordination betrifft nur Arbeitstage. Eine Seite, einmal eintragen, alle sehen
es, Cozi und Outlook holen es als Kalender-Abo.

Seite: `https://manuelweingartner.github.io/auto/#<geheim>`

Ohne den Teil nach `#` zeigt die Seite nur eine Meldung. Das Geheimnis (8
Zeichen) liegt in `.secrets/geheim.txt` (nicht im Repo). Einmal mit `#`
geöffnet, merkt sich das Gerät das Geheimnis, danach reicht die Seite ohne `#`.
Das Repo heisst `auto`, damit der Link kurz bleibt; lokal liegt es weiter
unter `___PRIVAT\Auto-Hunde`.

## Bedienung

- Tippen auf den Wochentag oder eine Auto-Zelle: «Manuel weg mit» Kia, RAV,
  noch offen oder kein Auto, ganzer Tag oder von-bis in vollen Stunden. «Noch
  offen» heisst: Manuel ist weg, das Auto wird später festgelegt; die Seite
  zeigt «offen» in beiden Autozeilen, der Eltern-Kalender zeigt nichts, der
  Cozi-Kalender «Auto Manuel» zeigt «Manuel weg (Auto offen)». «Kein Auto»
  (Zug) steht ebenso in beiden Autozeilen als «ohne Auto», im Cozi-Kalender
  als «Manuel weg 07-17 (ohne Auto)», bei den Eltern nicht. «Löschen» setzt
  den Tag auf Normalfall zurück.
- Tippen auf M oder S: die andere Person ist vorgewählt, Speichern genügt
  (zwei Tipps). Startstunde änderbar.
- Autowechsel: die Zelle des anderen Autos tippen, Speichern (zwei Tipps), die
  Zeiten bleiben.
- Zahnrad oben rechts: eigener Name für das Protokoll, Link zur Seite kopieren,
  drei Kalender-Abos (zwei für Cozi zum Kopieren, eines für die Eltern zum
  Abonnieren am iPhone), Änderungsprotokoll (wer hat wann was geändert; der
  Name kommt vom jeweiligen Gerät).
- Normalfall: Manuel geht beide Runden. Ist Manuel dann weg, schlägt die Seite
  Svenja vor. Die Seite rechnet dafür intern mit den üblichen Zeiten (Manuel
  06-07 und 16-17, Svenja 08-09), zeigt aber nirgends Uhrzeiten für Hunderunden,
  auch nicht im Kalender-Abo (Entscheid 18.10.2026). Von Hand gesetzte Runden
  bleiben, auch wenn die Abwesenheit später geändert wird.
- Jeder Mittwoch ist vorbelegt: ganzer Tag, Auto «offen», Svenja beide Runden.
- «Autos» ist die Standardansicht (für die Eltern), «Autos und Hunde» zeigt
  dazu die Runden. Jedes Gerät merkt sich die zuletzt gewählte Ansicht.
- Beim Öffnen zeigt die Seite die laufende Woche, ab Freitag 14 Uhr und am
  Wochenende schon die kommende. Der Wochentitel in der Mitte springt dorthin
  zurück.
- Alle vier dürfen alles ändern, Änderungen erscheinen sofort bei allen.
- Bei schlechtem Empfang schliesst das Blatt trotzdem sofort; die Änderung wird
  nachgeschickt, sobald Netz da ist, auch nach Schliessen der App.

## Auf den Startbildschirm

- iPhone: Link in Safari öffnen, Teilen, «Zum Home-Bildschirm».
- Android: Link in Chrome öffnen, Menü, «Zum Startbildschirm hinzufügen».

## Kalender-Abo (Cozi, Outlook)

Eine GitHub Action schreibt alle 10 Minuten drei ICS-Dateien in ein geheimes
Gist. Das Zahnrad auf der Seite zeigt genau drei Zeilen (Entscheid 18.10.2026,
vorher waren es vier Kalender mit je drei Links, zu viel zum Kopieren); die
Basis steht in `.secrets/abo-url.txt` und in Firestore unter
`h/<geheim>/meta/abo`.

- `auto-hunde-hunde.ics` («Hunde Svenja», Cozi): nur Svenjas Hunderunden als
  Ganztagestermin «Hunde: Svenja (Morgen und Nachmittag)», keine
  Abwesenheiten. In Cozi als Kalender von Svenja eintragen, dann steht jede
  neue oder verschobene Runde automatisch bei ihr.
- `auto-hunde-manuel.ics` («Auto Manuel», Cozi): nur Manuels Abwesenheiten
  («Manuel weg 07-22 (Kia)», «Manuel weg (RAV)», «Manuel weg (Auto offen)»),
  keine Hunderunden. In Cozi als Kalender von Manuel eintragen. Cozi ordnet
  ein Abo als Ganzes einer Person zu, darum pro Person ein eigener Kalender.
- `auto-hunde-rav.ics` («nur RAV», Eltern, iPhone): nur Tage, an denen der RAV
  weg ist. Kein Kia, keine Hunde, und Tage mit noch offenem Auto erscheinen erst,
  sobald der RAV festgelegt ist (Entscheid 18.10.2026).

Runden von Manuel stehen in keinem Abo. Einen Sammelkalender (Outlook) und
Android-Links gibt es seit 18.10.2026 nicht mehr.

Einrichten:
- **Cozi (Manuel):** im Zahnrad bei «Cozi: Hunde Svenja» und «Cozi: Auto
  Manuel» je «Adresse kopieren». In Cozi: Einstellungen, «Connected
  Calendars», «Add a calendar from a URL», Adresse einfügen, als
  Familienmitglied Svenja bzw. Manuel wählen. Cozi zeigt die Einträge nur
  lesbar und aktualisiert laut Cozi-Hilfe etwa stündlich.
- **iPhone (Eltern):** im Zahnrad bei «Eltern: nur RAV» auf «iPhone:
  abonnieren» tippen, Safari fragt «Kalender abonnieren», bestätigen. Der
  Kalender erscheint in der Kalender-App und wird von iOS selbst
  aktualisiert.

Verzögerung: GitHub liefert die Raw-Adresse bis zu 5 Minuten aus dem Cache, die
Action läuft alle 10 Minuten, dazu kommt das Abfrage-Intervall des Kalenders
(Cozi etwa eine Stunde, iOS je nach Einstellung). Gemessene Cozi-Verzögerung:
noch nicht gemessen. Kurzfristiges steht immer zuerst auf der Seite.

## Technik

- Statische Seite (Vanilla JS, kein Build) auf GitHub Pages aus `main`.
- Daten in Firestore, Projekt `auto-hunde` (Spark, nur Firestore, eur3):
  `h/<geheim>/tage/<YYYY-MM-DD>` (Tage), `h/<geheim>/meta/abo` (Gist-Basis),
  `h/<geheim>/log/<id>` (Änderungsprotokoll). Die Regeln erlauben Lesen und
  Schreiben nur unter dem Geheimnis. Regeln neu deployen: `scripts/regeln-deployen.ps1`
  (braucht Node 20 portable und `firebase login`).
- GitHub schaltet Cron-Workflows nach 60 Tagen ohne Commit ab; der Workflow
  schaltet sich darum bei jedem Lauf selbst wieder ein. Bleibt das Gist trotzdem
  stehen: unter Actions nachsehen, ob `ics` noch läuft.
- Repo-Secrets für die Action: `AUTO_HUNDE_GEHEIM`, `GIST_ID`, `GIST_TOKEN`.
  `GIST_TOKEN` ist zurzeit das gh-Token von `manuelweingartner`; ein
  feingranulares Token nur mit Gist-Recht wäre enger.
- Tests: `npm test` (Fachregeln, ICS, Raster, Export).
- **`version.txt` bei jedem Commit hochzählen, der Seite, Skripte oder Stil
  ändert.** Safari und die Startbildschirm-App laden eine offene Seite nie
  neu, und Pages liefert jede Datei mit 10 Minuten Browser-Cache. Die Seite
  liest `version.txt` beim Start, beim Zurückkommen und jede Minute am Cache
  vorbei; bei einer neuen Fassung holt sie alle Dateien aus `DATEIEN` in
  `src/version.js` frisch (`cache: 'reload'`) und lädt sich neu, ausser ein
  Blatt ist offen. Ein neues Modul in `src/` gehört in diese Liste, ein Test
  prüft das. Bleibt: die ein bis drei Minuten, die Pages zum Ausliefern
  braucht. Vergisst man das Hochzählen, sehen die Geräte die Änderung erst
  nach Schliessen der App plus bis zu 10 Minuten.
- Das Geheimnis steht nie im Repo: nicht im Code, nicht in `firestore.rules`
  (gitignored), nicht in Commits.
