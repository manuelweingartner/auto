# Auto-Hunde

Wochenübersicht für die Familie: wer geht wann mit den Hunden, und wann ist
welches Auto (Kia PV5, Toyota RAV) weg. Eine Seite, einmal eintragen, alle sehen
es, Cozi und Outlook holen es als Kalender-Abo.

Seite: `https://manuelweingartner.github.io/auto/#<geheim>`

Ohne den Teil nach `#` zeigt die Seite nur eine Meldung. Das Geheimnis (8
Zeichen) liegt in `.secrets/geheim.txt` (nicht im Repo). Einmal mit `#`
geöffnet, merkt sich das Gerät das Geheimnis, danach reicht die Seite ohne `#`.
Das Repo heisst `auto`, damit der Link kurz bleibt; lokal liegt es weiter
unter `___PRIVAT\Auto-Hunde`.

## Bedienung

- Tippen auf den Wochentag oder eine Auto-Zelle: «Manuel weg mit» Kia, RAV oder
  kein Auto, ganzer Tag oder von-bis in vollen Stunden. «Löschen» setzt den Tag
  auf Normalfall zurück.
- Tippen auf M oder S: die andere Person ist vorgewählt, Speichern genügt
  (zwei Tipps). Startstunde änderbar.
- Autowechsel: die Zelle des anderen Autos tippen, Speichern (zwei Tipps), die
  Zeiten bleiben.
- Zahnrad oben rechts: eigener Name für das Protokoll, Link zur Seite kopieren,
  Kalender-Abos (iPhone-Link, Android-Link, Adresse kopieren), Änderungsprotokoll
  (wer hat wann was geändert; der Name kommt vom jeweiligen Gerät).
- Normalfall: Manuel geht beide Runden (6-7 und 16-17 Uhr). Ist Manuel zu
  diesen Zeiten weg, schlägt die Seite Svenja vor (morgens 8-9 Uhr). Von Hand
  gesetzte Runden bleiben, auch wenn die Abwesenheit später geändert wird.
- Jeder Mittwoch ist vorbelegt: ganzer Tag, Auto «offen», Svenja beide Runden.
- «Autos» ist die Standardansicht (für die Eltern), «Autos und Hunde» zeigt
  dazu die Runden. Jedes Gerät merkt sich die zuletzt gewählte Ansicht.
- Alle vier dürfen alles ändern, Änderungen erscheinen sofort bei allen.
- Bei schlechtem Empfang schliesst das Blatt trotzdem sofort; die Änderung wird
  nachgeschickt, sobald Netz da ist, auch nach Schliessen der App.

## Auf den Startbildschirm

- iPhone: Link in Safari öffnen, Teilen, «Zum Home-Bildschirm».
- Android: Link in Chrome öffnen, Menü, «Zum Startbildschirm hinzufügen».

## Kalender-Abo (Cozi, Outlook)

Eine GitHub Action schreibt alle 10 Minuten zwei ICS-Dateien in ein geheimes
Gist. Die Adressen zeigt das Zahnrad auf der Seite; die Basis steht in
`.secrets/abo-url.txt` und in Firestore unter `h/<geheim>/meta/abo`.

- `auto-hunde.ics` («Autos und Hunde», für Svenja, Cozi, Outlook): «Manuel weg
  07-22 (Kia)», «Manuel weg (RAV)» ganztägig, und «Hunde: Svenja» für Runden,
  die Svenja geht. Runden von Manuel stehen nicht im Abo.
- `auto-hunde-rav.ics` («nur RAV», für die Eltern): nur Tage, an denen der RAV
  weg oder das Auto noch offen ist. Kein Kia, keine Hunde.

Einrichten:
- **iPhone (Eltern, Svenja):** im Zahnrad «iPhone: abonnieren» tippen, Safari
  fragt «Kalender abonnieren», bestätigen. Der Kalender erscheint in der
  Kalender-App und wird von iOS selbst aktualisiert.
- **Android:** «Android: Google Kalender» öffnet calendar.google.com mit der
  Adresse; dort «Hinzufügen». In der Google-Kalender-App danach unter
  Einstellungen den neuen Kalender einblenden.
- **Cozi:** Einstellungen, «Connected Calendars», «Add a calendar from a URL»,
  Adresse einfügen, Familienmitglieder wählen. Cozi zeigt die Einträge nur
  lesbar und aktualisiert laut Cozi-Hilfe etwa stündlich.
- **Outlook:** Kalender, «Kalender hinzufügen», «Aus dem Internet abonnieren»,
  Adresse einfügen. Nur für Manuel sichtbar, ohne Wirkung auf die
  Verfügbarkeit.

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
- Das Geheimnis steht nie im Repo: nicht im Code, nicht in `firestore.rules`
  (gitignored), nicht in Commits.
