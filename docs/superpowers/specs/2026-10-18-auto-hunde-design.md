# Auto-Hunde: Wochenübersicht für Hunderunden und Autos

Stand 18.10.2026, aus dem Gespräch mit Manuel.

## Wozu

Vier Personen stimmen sich ab: Manuel, seine Frau Svenja und Manuels Eltern. Es
geht um zwei Dinge:

- **Hunderunden.** Zweimal am Tag muss jemand mit den Hunden laufen, morgens und
  am Nachmittag. Mittags geht nie jemand.
- **Autos.** Für Auswärtstermine nimmt Manuel entweder den eigenen Kia PV5 oder
  den Toyota RAV der Eltern.

Heute läuft das über WhatsApp und im Gespräch. Es gibt keinen Ort zum
Nachschauen. Svenja sieht in Cozi nur, ob Manuel weg ist und ob auch am Abend.
Manuel trägt dieselbe Information an mehreren Orten ein.

Die Seite ist das **Nachschlagewerk für alle vier**. Sie ist kein neuer
Kommunikationskanal. Jede Information wird **einmal** auf der Seite erfasst und
erscheint von dort aus in Cozi und in Outlook.

## Wer was sehen will

- **Svenja und Manuel:** Hunderunden und Autos.
- **Eltern:** nur die Autos, also wann welches Auto weg ist. Die Hunderunden
  interessieren sie nicht.

## Fachregeln

**Normalfall (kein Eintrag):** Manuel geht beide Runden, beide Autos sind da.

| Runde | Manuel | Svenja |
|---|---|---|
| Morgen | 06-07 | 08-09 |
| Nachmittag | 16-17 | 16-17 |

Das sind Standardzeiten. Pro Tag kann jede Runde eine andere Person **und** eine
andere Zeit haben. Beispiel: Manuel geht 05-06, weil er ab 6 Uhr mit dem Auto weg
ist und Svenja nicht kann.

**Abwesenheit von Manuel:** pro Tag höchstens eine. Sie hat:
- ein Auto: Kia, RAV oder keines,
- einen Zeitraum: von-bis (z.B. 07-22) oder «ganzer Tag».

**Vorschlag für die Hunderunden:** Überschneidet sich die Abwesenheit mit Manuels
Standardzeit einer Runde (06-07 bzw. 16-17), schlägt die Seite Svenja für diese
Runde vor, morgens zu ihrer Zeit 08-09. «Ganzer Tag» überschneidet beide Runden.
Der Vorschlag wird beim Speichern der Abwesenheit gesetzt und lässt sich danach
pro Runde überschreiben. Eine von Hand gesetzte Runde wird durch spätere
Änderungen an der Abwesenheit **nicht** mehr automatisch überschrieben.

Prüffälle aus Manuels Woche ab 19.10.2026:

| Tag | Abwesenheit | Morgen | Nachmittag |
|---|---|---|---|
| Di 20.10. | RAV 07-16 | Manuel 06-07 | Manuel 16-17 |
| Mi 21.10. | RAV ganzer Tag | Svenja 08-09 | Svenja 16-17 |
| Do 22.10. | Kia 07-22 | Manuel 06-07 | Svenja 16-17 |

(07-16 überschneidet 06-07 nicht und 16-17 nicht: Grenzen zählen nicht als
Überschneidung.)

**Mittwoch:** Jeder Mittwoch ist vorbelegt als «ganzer Tag, Auto offen», Svenja
für beide Runden. «Auto offen» ist sichtbar als offen markiert, bis Manuel Kia
oder RAV wählt. Ein einzelner Mittwoch lässt sich löschen, dann gilt dort der
Normalfall. Die Vorbelegung ist nur ein Startwert, kein gespeicherter Eintrag,
bis jemand den Tag ändert.

**Herkunft einer Runde (Claudes Wahl):** Jede Runde weiss, ob sie Standard,
Vorschlag oder von Hand gesetzt ist. Die Svenja-Runden der Mittwoch-Vorbelegung
sind Vorschläge. Ändert jemand die Abwesenheit eines Mittwochs (z.B. auf Kia
09-15), läuft die Überschneidungsregel neu, und nicht von Hand gesetzte Runden
folgen ihr. Wird ein Tag gelöscht, gilt für alle Runden wieder der Normalfall,
auch für von Hand gesetzte.

**Zeiten:** nur volle Stunden (Manuel-Entscheid). Auswahl am Handy als Liste von
Stunden. Abwesenheiten sind nie mehrtägig und enden nie nach Mitternacht; «bis
24» ist das späteste Ende.

**Wer ändert:** Alle vier dürfen alles ändern. Die Eltern tragen keine eigene
RAV-Nutzung ein (bewusst nicht gewünscht).

## Die Seite

Entschiedene Darstellung: **Raster** (Entwurf B der Probeseite
https://claude.ai/artifact/5f2nok2BFe8AWqg69zLGYT).

- Eine Woche Montag bis Sonntag als Tabelle, Tage als Spalten.
- Zeilen: Morgen, Nachmittag (je ein Punkt M oder S, farbig je Person, Zeit
  sichtbar wenn sie vom Standard abweicht), Kia, RAV (Balken mit Zeitraum, wenn
  das Auto weg ist; «offen» wenn am Mittwoch noch kein Auto gewählt ist).
- Startet in der aktuellen Woche. Pfeile blättern vor und zurück. Heute ist
  hervorgehoben.
- Umschalter «Hunde und Autos» / «Nur Autos». In «Nur Autos» fehlen die
  Hundezeilen. Das Gerät merkt sich die zuletzt gewählte Ansicht.
- **Schlicht und schön, kein AI-Standard-Look (Manuel):** keine Badges oder
  Pillen, keine farbigen Seitenstreifen, keine Hinweisboxen. Ruhige Tabelle,
  Farbe nur als Textfarbe für Personen und Autos.
- **Super einfach und übersichtlich ist die oberste Regel.** Ändern heisst
  antippen und auswählen, keine Menüs, keine Einstellungsseiten.
- Tippen auf einen Tag öffnet ein kleines Feld: Auto (Kia, RAV, keines), von-bis
  oder ganzer Tag, Löschen. Tippen auf einen Hundepunkt öffnet Person und Zeit.
- Muss am Handy (ca. 400 px) ohne seitliches Scrollen der Seite funktionieren.
  Die Probeseite scrollt das Raster am Handy waagrecht; der Builder soll eine
  Darstellung finden, in der eine Woche ohne Scrollen ablesbar ist.
- Deutsch (Schweiz, «ss»), echte Umlaute, keine Gedankenstriche.
- Änderungen der anderen erscheinen ohne Neuladen.

## Zugang

Kein Login. Ein **geheimer Link**, den alle vier als Symbol auf den Startbildschirm
legen. Wer den Link hat, liest und ändert. Manuel hat entschieden, dass das
genügt; ein Änderungsprotokoll wird nicht gebraucht.

## Kalender

Die Seite liefert einen **Kalender-Abo-Link (ICS)**:

- **Cozi** abonniert ihn über «Internetkalender hinzufügen» (offizieller Weg,
  Einträge in Cozi nur lesbar). Damit sieht Svenja alles weiter in Cozi.
- **Outlook (Firma)** abonniert denselben Link als Internetkalender. Nur für
  Manuel sichtbar, ohne Wirkung auf seine Verfügbarkeit. Echte private
  Blocker-Termine sind ein möglicher späterer Ausbau, nicht Teil dieser Runde.
- Kalender der Eltern: kein Abgleich.

Inhalt des Abos, nur Abweichungen vom Normalfall:
- Abwesenheit mit Zeit: Termin «Manuel weg 07-22 (Kia)».
- Abwesenheit ganzer Tag: Ganztagestermin «Manuel weg (RAV)», bzw. «(Auto offen)».
- Nur Runden, die Svenja geht: Termin «Hunde: Svenja» zur jeweiligen Zeit, z.B.
  08-09 oder 16-17. Runden von Manuel erscheinen nie im Abo, auch nicht zu
  abweichender Zeit (Manuel-Entscheid: «normal mache ich Hunde»).
- Zeitzone Europe/Zurich. Zeitraum mindestens vier Wochen zurück und acht Wochen
  voraus, damit die vorbelegten Mittwoche erscheinen.

Bekanntes Risiko: Cozi aktualisiert Internetkalender verzögert, wie stark ist
unbekannt. Kurzfristige Änderungen sind immer zuerst auf der Seite. Der Builder
misst die Verzögerung im ersten Test und notiert sie in der README.

Manuels bisherige Handeinträge in Cozi entfallen (meine Annahme, mit Manuel
beim Einrichten bestätigen). Künftige Handeinträge löscht er beim Umstieg.

## Technik (Claudes Wahl, von Manuel nicht widersprochen)

- **Repo** `manuelweingartner/Auto-Hunde`, lokal `C:\CLAUDE\___PRIVAT\Auto-Hunde`.
  Commit-Identität `Manuel Weingartner <manuel.weingartner@gmx.ch>`, `gh` vorher
  auf `manuelweingartner` schalten.
- **Seite** statisch über GitHub Pages aus dem Repo.
- **Daten nicht im Repo.** Wann das Haus leer ist, gehört nicht in ein
  öffentliches Repo. Daten liegen in einem **neuen, eigenen Firebase-Projekt**
  (nur Firestore, Gratisstufe, kein Hosting, keine Functions), nicht in einem
  Projekt von loggd, clutch oder mietsenkung. Es läuft unter demselben
  Google-Konto wie loggd. Claude legt Projekt, Datenbank, Regeln und Service
  Account selbst über die Kommandozeile an (Manuel-Entscheid); nur Logins tippt
  Manuel selbst.
- Der geheime Teil steckt im Link (nicht im Code des Repos) und bestimmt den
  Firestore-Pfad. Die Firestore-Regeln erlauben Lesen und Schreiben nur unter
  genau diesem Pfad; alles andere ist gesperrt.
- **ICS-Abo:** Eine geplante GitHub Action liest Firestore und schreibt die
  ICS-Datei in ein **geheimes Gist** von `manuelweingartner`. Cozi und Outlook
  abonnieren die feste Raw-URL ohne Revisions-Hash. Intervall so kurz, wie
  GitHub es zulässt (alle 5 bis 15 Minuten). Kostet nichts.
- Die Action liest Firestore per REST mit demselben Geheimnis wie die Seite (als
  Repo-Secret). Ein Service Account ist damit unnötig (geändert beim Planen,
  Claudes Wahl). Lokale Firebase-Befehle laufen mit geleertem
  `GOOGLE_APPLICATION_CREDENTIALS`, weil die Variable auf ein mietsenkung-Konto
  zeigt.

## Ziele

- Svenja sieht auf einen Blick, wann sie mit den Hunden geht.
- Die Eltern sehen auf einen Blick, wann welches Auto weg ist.
- Manuel trägt jede Abwesenheit genau einmal ein.

## Nicht Teil davon

- Logins, Rollen, Änderungsprotokoll.
- Benachrichtigungen (WhatsApp bleibt für Kurzfristiges).
- Eigene RAV-Nutzung der Eltern.
- Abgleich mit dem Kalender der Eltern.
- Direktes Schreiben in Cozi über die inoffizielle Schnittstelle.
- Mehrere Abwesenheiten am selben Tag.

## Was es zum Misserfolg macht, auch wenn es technisch läuft

- Die Seite ist für Svenja oder die Eltern nicht ohne Erklärung lesbar.
- Daten oder der geheime Link landen in einem öffentlichen Repo.
- Es entstehen laufende Kosten.
- Manuel muss doch wieder zusätzlich in Cozi eintragen.

## Dem Builder überlassen

- Frontend ohne oder mit kleinem Framework, Aufbau der Dateien.
- Genaue Gestaltung des Rasters am Handy, Farben, Schrift (Entwurf B als
  Ausgangspunkt, Dichte vor Dekor).
- Wie der geheime Link aussieht und wie das Gerät ihn sich merkt.
- Tests: die Überschneidungsregel, die Mittwoch-Vorbelegung und die
  ICS-Erzeugung brauchen Unit-Tests mit den Prüffällen oben.
- Einrichtungsanleitung (Cozi-Abo, Outlook-Abo, Startbildschirm) als kurze README
  für Manuel.
