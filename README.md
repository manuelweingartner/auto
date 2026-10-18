# Auto-Hunde

Wochenübersicht für die Familie: wer geht wann mit den Hunden, und wann ist
welches Auto (Kia PV5, Toyota RAV) weg. Eine Seite, einmal eintragen, alle sehen
es, Cozi und Outlook holen es als Kalender-Abo.

Seite: `https://manuelweingartner.github.io/Auto-Hunde/#<geheim>`

Ohne den Teil nach `#` zeigt die Seite nur eine Meldung. Das Geheimnis liegt in
`.secrets/geheim.txt` (nicht im Repo). Einmal mit `#` geöffnet, merkt sich das
Gerät das Geheimnis, danach reicht die Seite ohne `#`.

## Bedienung

- Tippen auf den Wochentag oder eine Auto-Zelle: «Manuel weg mit» Kia, RAV oder
  kein Auto, ganzer Tag oder von-bis in vollen Stunden. «Löschen» setzt den Tag
  auf Normalfall zurück.
- Tippen auf M oder S: Person und Startstunde der Hunderunde.
- Normalfall: Manuel geht beide Runden (6-7 und 16-17 Uhr). Ist Manuel zu
  diesen Zeiten weg, schlägt die Seite Svenja vor (morgens 8-9 Uhr). Von Hand
  gesetzte Runden bleiben, auch wenn die Abwesenheit später geändert wird.
- Jeder Mittwoch ist vorbelegt: ganzer Tag, Auto «offen», Svenja beide Runden.
- «Nur Autos» ist die Ansicht für die Eltern. Die Seite merkt sich die Wahl.
- Alle vier dürfen alles ändern, Änderungen erscheinen sofort bei allen.

## Auf den Startbildschirm

- iPhone: Link in Safari öffnen, Teilen, «Zum Home-Bildschirm».
- Android: Link in Chrome öffnen, Menü, «Zum Startbildschirm hinzufügen».

## Kalender-Abo (Cozi, Outlook)

Eine GitHub Action schreibt alle 10 Minuten eine ICS-Datei in ein geheimes Gist.
Die Abo-Adresse steht in `.secrets/abo-url.txt`. Inhalt: «Manuel weg 07-22
(Kia)», «Manuel weg (RAV)» ganztägig, und «Hunde: Svenja» für Runden, die Svenja
geht. Runden von Manuel stehen nicht im Abo.

- **Cozi:** my.cozi.com, Kalender, Einstellungen, «Internetkalender hinzufügen»,
  Abo-Adresse einfügen. Einträge sind in Cozi nur lesbar.
- **Outlook:** Kalender, «Kalender hinzufügen», «Aus dem Internet abonnieren»,
  Abo-Adresse einfügen. Nur für Manuel sichtbar, ohne Wirkung auf die
  Verfügbarkeit.

Verzögerung: GitHub liefert die Raw-Adresse bis zu 5 Minuten aus dem Cache, die
Action läuft alle 10 Minuten, dazu kommt das Abfrage-Intervall von Cozi bzw.
Outlook. Gemessene Cozi-Verzögerung: noch nicht gemessen. Kurzfristiges steht
immer zuerst auf der Seite.

## Technik

- Statische Seite (Vanilla JS, kein Build) auf GitHub Pages aus `main`.
- Daten in Firestore, Projekt `auto-hunde` (Spark, nur Firestore, eur3), Pfad
  `h/<geheim>/tage/<YYYY-MM-DD>`. Die Regeln erlauben Lesen und Schreiben nur
  unter dem Geheimnis. Regeln neu deployen: `scripts/regeln-deployen.ps1`
  (braucht Node 20 portable und `firebase login`).
- Repo-Secrets für die Action: `AUTO_HUNDE_GEHEIM`, `GIST_ID`, `GIST_TOKEN`.
  `GIST_TOKEN` ist zurzeit das gh-Token von `manuelweingartner`; ein
  feingranulares Token nur mit Gist-Recht wäre enger.
- Tests: `npm test` (Fachregeln, ICS, Raster, Export).
- Das Geheimnis steht nie im Repo: nicht im Code, nicht in `firestore.rules`
  (gitignored), nicht in Commits.
