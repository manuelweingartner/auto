# Auto-Hunde Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine Handy-Wochenseite (Raster) für Hunderunden und Autos der Familie, mit gemeinsamem Speicher und einem ICS-Abo für Cozi und Outlook.

**Architecture:** Statische Seite (Vanilla-JS, ES-Module, kein Build) auf GitHub Pages. Daten in Firestore unter einem geheimen Pfad, den nur die Regeln kennen; die Seite liest live per `onSnapshot`. Eine geplante GitHub Action liest Firestore per REST mit demselben Geheimnis, baut die ICS-Datei mit derselben Fachlogik und schreibt sie in ein geheimes Gist.

**Tech Stack:** Vanilla JS (ES-Module), Firebase JS SDK 10.14.1 vom gstatic-CDN, Node `--test` für Unit-Tests, GitHub Actions, GitHub Gist, Firebase CLI.

**Spec:** `docs/superpowers/specs/2026-10-18-auto-hunde-design.md`

## Global Constraints

- Repo `manuelweingartner/Auto-Hunde`, öffentlich, lokal `C:\CLAUDE\___PRIVAT\Auto-Hunde`. Vor jeder `gh`-Aktion `gh auth switch --user manuelweingartner`.
- Commit-Identität `Manuel Weingartner <manuel.weingartner@gmx.ch>`, **kein** `Co-Authored-By`, kein `git add -A`.
- Das Geheimnis (Link-Teil und Firestore-Pfad) steht **nie** im Repo: nicht im Code, nicht in `firestore.rules`, nicht in Commits. Lokal in `.secrets/geheim.txt` (gitignored), auf GitHub als Repo-Secret `AUTO_HUNDE_GEHEIM`.
- Firebase: neues eigenes Projekt unter dem loggd-Google-Konto, nur Firestore, Spark-Plan, Standort `eur3`. Keine Functions, kein Hosting, keine Kosten.
- Firebase CLI nur mit Node 20 portable (`C:\Users\MWE\node20-portable`) und mit geleertem `GOOGLE_APPLICATION_CREDENTIALS` aufrufen (die Variable zeigt sonst auf ein mietsenkung-Konto).
- Texte: Deutsch (Schweiz, «ss»), echte Umlaute, keine Gedankenstriche (Halbgeviert- und Geviertstrich) irgendwo, auch nicht in Code-Strings. Zeitbereiche mit `-`: `07-22`.
- Zeiten nur volle Stunden 0 bis 24, `bis` maximal 24. Zeitzone Europe/Zurich.
- Standardzeiten: Manuel morgens 6-7, Svenja morgens 8-9, nachmittags beide 16-17.
- ICS-Titel exakt: `Manuel weg 07-22 (Kia)`, `Manuel weg (RAV)` ganztägig, `Manuel weg (Auto offen)`, `Hunde: Svenja`. Runden von Manuel erscheinen nie im ICS.
- ICS-Zeitraum: heute minus 28 Tage bis heute plus 56 Tage.
- Seite muss bei 360 px Breite eine ganze Woche ohne waagrechtes Scrollen zeigen.
- **Schlichtes Design, kein AI-Standard-Look (Manuel):** keine Badges, Pillen oder Chips mit Hintergrund, keine farbigen Seitenstreifen an Karten, keine Hinweis- oder Infoboxen, keine Emojis, keine Verläufe, keine Schatten-Karten. Ruhige Tabelle mit feinen Linien, eine Schrift, zwei Personenfarben und zwei Autofarben als reine Textfarbe. Personen als Buchstabe `M`/`S` in ihrer Farbe, Autos als Text `07-22` in ihrer Farbe. Einziger Rahmen: die heutige Spalte.

## Review Focus

- **Zeitumstellung 25.10.2026 (So):** Datumsschlüssel und Wochenwechsel müssen über die Umstellung korrekt bleiben, ICS-Zeiten bleiben Ortszeit. Test in Task 1 und Task 2.
- **Gleichzeitiges Ändern:** Svenja tauscht eine Runde, während Manuel die Abwesenheit ändert. Schreiben feldweise (`setDoc` mit `merge`), nie ganzes Dokument überschreiben. Pflicht in Task 4.
- **Link ohne Geheimnis** (Startbildschirm-Symbol ohne `#`, neues Gerät): klare Meldung «Dieser Link ist unvollständig. Bitte den Link von Manuel neu öffnen.», keine leere Seite. Test in Task 4.
- **Ungültige Eingabe** `von >= bis`: Speichern ist gesperrt. Test in Task 1 (`pruefeAbwesenheit`).
- **Ende 24 Uhr** im ICS wird zu 00:00 des Folgetags. Test in Task 2.

---

### Task 1: Fachlogik (`regeln.js`)

**Files:**
- Create: `package.json` (`{"type":"module","scripts":{"test":"node --test tests/"}}`), `.gitignore` (`.secrets/`, `firestore.rules`, `node_modules/`, `.firebase/`)
- Create: `src/regeln.js`
- Test: `tests/regeln.test.js`

**Interfaces:**
- Produces:
  - Typen (JSDoc): `Abwesenheit = {auto:'kia'|'rav'|'keines'|'offen', von:number|null, bis:number|null}` (`von`/`bis` null = ganzer Tag). `Runde = {person:'M'|'S', von:number, bis:number, quelle:'standard'|'vorschlag'|'hand'}`. `TagDoc = {abwesend?:Abwesenheit|null, morgen?:Runde, nachmittag?:Runde}` (nur `quelle:'hand'`-Runden werden gespeichert). `Tag = {datum:string, abwesend:Abwesenheit|null, morgen:Runde, nachmittag:Runde}`.
  - `tagSchluessel(d: Date) -> 'YYYY-MM-DD'` (lokale Felder, nie `toISOString`)
  - `wocheAb(d: Date) -> string[7]` (Montag bis Sonntag der Woche von `d`)
  - `loeseTag(datum: string, doc: TagDoc|undefined) -> Tag`
  - `pruefeAbwesenheit(a: Abwesenheit) -> string|null` (Fehlertext oder null)
  - `docMitAbwesenheit(a: Abwesenheit|null) -> {abwesend}` und `docMitRunde(slot:'morgen'|'nachmittag', person:'M'|'S', von:number) -> {[slot]: Runde}` (Teil-Dokumente für feldweises Mergen)

Regeln für `loeseTag`:
- Kein Dokument und Mittwoch: `abwesend = {auto:'offen', von:null, bis:null}`.
- Dokument vorhanden: `doc.abwesend ?? null` gilt (auch am Mittwoch; `{abwesend:null}` ist «gelöscht»).
- Pro Runde: gespeicherte `hand`-Runde gewinnt. Sonst Überschneidung der Abwesenheit mit Manuels Standardzeit (6-7 bzw. 16-17), strikt: `von < slotBis && bis > slotVon`; ganzer Tag überschneidet immer. Überschneidung: Svenja zu ihrer Standardzeit, `quelle:'vorschlag'`. Sonst Manuel zur Standardzeit, `quelle:'standard'`.

- [ ] **Step 1: Write the failing tests**

```js
// tests/regeln.test.js
test('Di 20.10. RAV 07-16: Manuel beide Runden', () => {
  const t = loeseTag('2026-10-20', {abwesend:{auto:'rav',von:7,bis:16}});
  assert.deepEqual([t.morgen.person,t.morgen.von,t.nachmittag.person], ['M',6,'M']);
});
test('Mi 21.10. ohne Dokument: Auto offen, Svenja 8-9 und 16-17 als Vorschlag', () => {
  const t = loeseTag('2026-10-21', undefined);
  assert.deepEqual(t.abwesend, {auto:'offen',von:null,bis:null});
  assert.deepEqual([t.morgen.person,t.morgen.von,t.morgen.quelle,t.nachmittag.person], ['S',8,'vorschlag','S']);
});
test('Do 22.10. Kia 07-22: Manuel morgens, Svenja nachmittags', () => {
  const t = loeseTag('2026-10-22', {abwesend:{auto:'kia',von:7,bis:22}});
  assert.deepEqual([t.morgen.person,t.nachmittag.person,t.nachmittag.von], ['M','S',16]);
});
test('Mittwoch auf Kia 09-15 geändert: beide Runden zurück zu Manuel', () => {
  const t = loeseTag('2026-10-21', {abwesend:{auto:'kia',von:9,bis:15}});
  assert.deepEqual([t.morgen.person,t.nachmittag.person], ['M','M']);
});
test('Mittwoch gelöscht: Normalfall', () => {
  const t = loeseTag('2026-10-21', {abwesend:null});
  assert.equal(t.abwesend, null); assert.equal(t.morgen.quelle, 'standard');
});
test('Handrunde Manuel 05-06 bleibt trotz Abwesenheit ab 6', () => {
  const t = loeseTag('2026-10-23', {abwesend:{auto:'kia',von:6,bis:20}, morgen:{person:'M',von:5,bis:6,quelle:'hand'}});
  assert.deepEqual([t.morgen.person,t.morgen.von,t.nachmittag.person], ['M',5,'S']);
});
test('wocheAb über Zeitumstellung: Woche 19.10. endet So 25.10., nächste beginnt Mo 26.10.', () => {
  assert.deepEqual(wocheAb(new Date(2026,9,25)), ['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25']);
  assert.equal(wocheAb(new Date(2026,9,26,0,30))[0], '2026-10-26');
});
test('pruefeAbwesenheit sperrt von >= bis und bis > 24', () => {
  assert.ok(pruefeAbwesenheit({auto:'kia',von:16,bis:7}));
  assert.ok(pruefeAbwesenheit({auto:'kia',von:7,bis:25}));
  assert.equal(pruefeAbwesenheit({auto:'kia',von:7,bis:24}), null);
  assert.equal(pruefeAbwesenheit({auto:'offen',von:null,bis:null}), null);
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, Modul `src/regeln.js` fehlt.
- [ ] **Step 3: Implement** die Funktionen aus dem Interfaces-Block in `src/regeln.js` (keine Abhängigkeiten, läuft in Browser und Node).
- [ ] **Step 4: Run** `npm test`. Expected: alle 8 Tests PASS.
- [ ] **Step 5: Commit** `git add package.json .gitignore src/regeln.js tests/regeln.test.js && git commit -m "Fachlogik: Hunderunden, Mittwoch, Abwesenheit"`

### Task 2: ICS-Erzeugung (`ics.js`)

**Files:**
- Create: `src/ics.js`
- Test: `tests/ics.test.js`

**Interfaces:**
- Consumes: `Tag` aus Task 1.
- Produces: `baueIcs(tage: Tag[], jetzt: Date) -> string` (CRLF-Zeilen, `VCALENDAR` mit `X-WR-CALNAME:Auto-Hunde`, VTIMEZONE Europe/Zurich, `DTSTART;TZID=Europe/Zurich:…`, Ganztag als `DTSTART;VALUE=DATE`, stabile UIDs `<datum>-abwesend@auto-hunde`, `<datum>-morgen@auto-hunde`, `<datum>-nachmittag@auto-hunde`, `DTSTAMP` aus `jetzt` in UTC).

Pro Tag: Abwesenheit mit Zeit → Termin `Manuel weg 07-22 (Kia)` (`keines` ohne Klammer, `offen` → `(Auto offen)`); ganzer Tag → Ganztagestermin `Manuel weg (RAV)`; jede Runde mit `person:'S'` → Termin `Hunde: Svenja`. Kein Termin für Tage ohne Abwesenheit und für Manuel-Runden.

- [ ] **Step 1: Write the failing tests** (`tests/ics.test.js`), mit Tagen aus `loeseTag`:
  - Woche 19.10. mit Di/Do-Dokumenten wie in Task 1: genau 6 `BEGIN:VEVENT` (Di weg, Mi ganztägig, Mi Hunde morgens, Mi Hunde nachmittags, Do weg, Do Hunde nachmittags). Assertion: `match(/BEGIN:VEVENT/g).length === 6`.
  - enthält `SUMMARY:Manuel weg 07-22 (Kia)` und `DTSTART;TZID=Europe/Zurich:20261022T070000`.
  - enthält `SUMMARY:Manuel weg (Auto offen)` und `DTSTART;VALUE=DATE:20261021`.
  - enthält `SUMMARY:Hunde: Svenja` mit `DTSTART;TZID=Europe/Zurich:20261021T080000`.
  - enthält kein `Hunde: Manuel`.
  - `bis:24` am 23.10. ergibt `DTEND;TZID=Europe/Zurich:20261024T000000`.
  - Sonntag 25.10. mit Abwesenheit 07-12 ergibt `DTSTART;TZID=Europe/Zurich:20261025T070000` (keine Verschiebung durch Zeitumstellung).
  - jede Zeile endet auf `\r\n`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL, Modul fehlt.
- [ ] **Step 3: Implement** `baueIcs` in `src/ics.js`. Zeiten als lokale Wanduhrzeit mit TZID schreiben, nie über `Date`-Millisekunden rechnen.
- [ ] **Step 4: Run** `npm test`. Expected: alle Tests PASS.
- [ ] **Step 5: Commit** `git add src/ics.js tests/ics.test.js && git commit -m "ICS-Abo aus den Tagen erzeugen"`

### Task 3: Firebase-Projekt und Regeln

**Files:**
- Create: `firebase.json` (nur `{"firestore":{"rules":"firestore.rules"}}`), `firestore.rules.vorlage` (mit Platzhalter `__GEHEIM__`), `scripts/regeln-deployen.ps1`, `src/firebase-config.js` (öffentliche Web-Konfiguration, darf ins Repo)
- Lokal, nicht im Repo: `.secrets/geheim.txt`, `firestore.rules`

**Interfaces:**
- Produces: Projekt-ID (in `src/firebase-config.js` und README), `export const firebaseConfig = {...}`. Datenpfad `h/{geheim}/tage/{YYYY-MM-DD}`.

Regeln (Vorlage):
```
rules_version = '2';
service cloud.firestore { match /databases/{db}/documents {
  match /h/{k}/tage/{d} { allow read, write: if k == '__GEHEIM__'; }
}}
```

- [ ] **Step 1:** Geheimnis erzeugen: 32 Zeichen `[a-z0-9]` kryptografisch zufällig, in `.secrets/geheim.txt`. Nie ausgeben.
- [ ] **Step 2:** Mit Node 20 portable und leerem `GOOGLE_APPLICATION_CREDENTIALS`: `firebase login:list` muss das loggd-Konto zeigen (sonst Manuel `firebase login` tippen lassen). Dann `firebase projects:create auto-hunde-<suffix> --display-name "Auto-Hunde"`, `firebase firestore:databases:create "(default)" --location=eur3 --project <id>`, `firebase apps:create web auto-hunde --project <id>`, `firebase apps:sdkconfig web --project <id>` in `src/firebase-config.js` übernehmen.
- [ ] **Step 3:** `scripts/regeln-deployen.ps1` schreibt `firestore.rules` aus Vorlage plus Geheimnis und ruft `firebase deploy --only firestore:rules --project <id>`. Ausführen.
- [ ] **Step 4: Verify** per REST mit dem `apiKey`: `GET https://firestore.googleapis.com/v1/projects/<id>/databases/(default)/documents/h/<geheim>/tage?key=<apiKey>` → HTTP 200; dieselbe URL mit anderem Pfadteil → HTTP 403; `.../documents/h?key=…` → 403.
- [ ] **Step 5: Commit** `git add firebase.json firestore.rules.vorlage scripts/regeln-deployen.ps1 src/firebase-config.js && git commit -m "Firestore-Projekt und Regeln"`. Vorher `git status` prüfen: `firestore.rules` und `.secrets/` nicht gestaged.

### Task 4: Die Seite (Raster, Eingabe, Live-Daten)

**Files:**
- Create: `index.html`, `style.css`, `src/app.js` (Start, Geheimnis, Ansicht, Woche), `src/speicher.js` (Firestore), `src/raster.js` (Darstellung), `src/blatt.js` (Eingabeblätter)
- Test: `tests/raster.test.js`

**Interfaces:**
- Consumes: Task 1 (`loeseTag`, `wocheAb`, `pruefeAbwesenheit`, `docMitAbwesenheit`, `docMitRunde`), Task 3 (`firebaseConfig`, Pfad).
- Produces:
  - `src/speicher.js`: `beobachteWoche(geheim, datums: string[], rueckruf: (docs: Record<string,TagDoc>) => void) -> () => void`, `schreibeTeil(geheim, datum, teil: object) -> Promise` (`setDoc(ref, teil, {merge:true})`), `loescheTag(geheim, datum) -> Promise` (schreibt `{abwesend:null, morgen:deleteField(), nachmittag:deleteField()}` mit merge).
  - `src/raster.js`: `rasterHtml(tage: Tag[], ansicht:'alle'|'autos', heute: string) -> string` (rein, ohne DOM, testbar in Node).

Verhalten:
- Geheimnis aus `location.hash` (ohne `#`), danach in `localStorage` `auto-hunde-geheim`; Hash bleibt in der Adresszeile, damit «Zum Startbildschirm» ihn mitnimmt. Fehlt es überall: nur die Meldung aus Review Focus.
- Ansicht `alle` / `autos` per Umschalter, gemerkt in `localStorage` `auto-hunde-ansicht`. `localStorage` immer in try/catch.
- Raster wie Entwurf B: Spalten Mo bis So mit Datum, Zeilen Morgen, 16-17 (nur Ansicht `alle`), Kia, RAV. Hundezelle zeigt `M`/`S` als farbigen Buchstaben ohne Hintergrund, Zeit klein darunter nur wenn nicht Standard. Autozelle zeigt `07-22` bzw. `ganzer Tag` als farbigen Text; Auto `offen` am Mittwoch als grauer Text `offen` in beiden Autozeilen. Heutige Spalte hervorgehoben. Pfeile blättern Wochen, Start in aktueller Woche.
- Tippen auf Spaltenkopf oder Autozelle: Blatt «Manuel weg» mit Auto (Kia, RAV, keines), Schalter «ganzer Tag», sonst zwei Stundenlisten von/bis (0 bis 24), Knöpfe «Speichern», «Löschen». Speichern gesperrt, solange `pruefeAbwesenheit` einen Fehler liefert; Fehler wird angezeigt.
- Tippen auf Hundepunkt: Blatt mit Manuel/Svenja und Startstunde (Liste 4 bis 21), Vorauswahl Standardzeit der gewählten Person, «Speichern» schreibt `docMitRunde`.
- Farben als Tokens mit Hell- und Dunkelmodus; Schrift Atkinson Hyperlegible (Google Fonts) mit System-Fallback. Dichte vor Dekor.

- [ ] **Step 1: Write the failing tests** (`tests/raster.test.js`): Woche 19.10. aus `loeseTag` mit Di/Do-Dokumenten:
  - `rasterHtml(tage,'alle','2026-10-19')` enthält 7 Spaltenköpfe `Mo`…`So` und `07-22`.
  - in `'autos'` kommt kein `data-slot=` vor.
  - Mittwoch enthält `offen`.
  - Spalte mit `data-datum="2026-10-19"` trägt die Heute-Klasse.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement** `raster.js`, dann `speicher.js`, `blatt.js`, `app.js`, `index.html`, `style.css`. Firebase SDK per `import` von `https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js` und `firebase-firestore.js`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Verify im Browser** (`npx http-server -p 8080` im Repo, Playwright, Screenshots in den Session-Scratch, nie ins Repo oder nach `C:\CLAUDE`): bei 360 px Breite `document.documentElement.scrollWidth <= 360`; ohne Hash und leerem Storage erscheint die Meldung; mit Geheimnis: Abwesenheit speichern, in zweitem Tab erscheint sie ohne Neuladen; Runde tauschen im zweiten Tab, Abwesenheit im ersten Tab ändern, beide Änderungen bleiben erhalten.
- [ ] **Step 6: Commit** die genannten Dateien: `git commit -m "Wochenraster mit Eingabe und Live-Daten"`

### Task 5: ICS-Export ins geheime Gist

**Files:**
- Create: `scripts/ics-export.js`, `.github/workflows/ics.yml`
- Test: `tests/ics-export.test.js`

**Interfaces:**
- Consumes: `loeseTag`, `tagSchluessel` (Task 1), `baueIcs` (Task 2), Projekt-ID und `apiKey` (Task 3).
- Produces: `ladeDocs(projektId, apiKey, geheim, fetchFn) -> Promise<Record<string,TagDoc>>` (Firestore REST, `pageSize=300`, folgt `nextPageToken`, wandelt Firestore-Feldtypen in einfache Werte), `tageImFenster(heute: Date, docs) -> Tag[]` (heute minus 28 bis plus 56, inklusive Mittwoch-Vorbelegung), Hauptprogramm schreibt per `PATCH https://api.github.com/gists/<GIST_ID>` die Datei `auto-hunde.ics`.

- [ ] **Step 1: Write the failing tests:** `ladeDocs` mit gefälschtem `fetchFn` (zwei Seiten, ein Dokument mit `abwesend` als `mapValue`, `von` als `integerValue` String, ein Dokument mit `abwesend` `nullValue`) liefert die einfachen Objekte; `tageImFenster(new Date(2026,9,18), {})` hat 85 Einträge, erster `2026-09-20`, letzter `2026-12-13`, und alle Mittwoche haben `abwesend.auto === 'offen'`.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement** `scripts/ics-export.js`. Umgebungsvariablen `AUTO_HUNDE_GEHEIM`, `GIST_TOKEN`, `GIST_ID`; fehlt eine, Abbruch mit Exit 1 und Klartext-Meldung. Schreibt das Gist nur, wenn sich der Inhalt ohne `DTSTAMP`-Zeilen geändert hat (sonst entstehen alle paar Minuten Gist-Revisionen).
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5:** Geheimes Gist anlegen: `gh gist create` mit Platzhalter-`auto-hunde.ics` (ohne `--public`). Repo-Secrets setzen, Werte nur per stdin, nie ausgeben: `AUTO_HUNDE_GEHEIM` aus `.secrets/geheim.txt`, `GIST_ID`, `GIST_TOKEN` aus `gh auth token` von `manuelweingartner` (vorher prüfen, dass `gh auth status` den Scope `gist` zeigt). Gist-ID und Raw-URL `https://gist.githubusercontent.com/manuelweingartner/<id>/raw/auto-hunde.ics` in `.secrets/abo-url.txt`, nicht ins Repo.
- [ ] **Step 6:** `.github/workflows/ics.yml`: `schedule: cron '*/10 * * * *'` plus `workflow_dispatch`, Node 20, `node scripts/ics-export.js`. Kein `npm install` nötig (nur `fetch`).
- [ ] **Step 7: Commit** `git add scripts/ics-export.js tests/ics-export.test.js .github/workflows/ics.yml && git commit -m "ICS-Abo per Action ins geheime Gist"` (Push folgt in Task 6).

### Task 6: Veröffentlichen, echte Woche, Einrichtung

**Files:**
- Create: `README.md`

- [ ] **Step 1:** `gh auth switch --user manuelweingartner`, `gh repo create manuelweingartner/Auto-Hunde --public --source . --push`. Vorher `git log -p | grep -c <geheimnis>` = 0.
- [ ] **Step 2:** Pages aus `main`, Ordner `/`: `gh api repos/manuelweingartner/Auto-Hunde/pages -X POST -f "source[branch]=main" -f "source[path]=/"`. Warten, bis `https://manuelweingartner.github.io/Auto-Hunde/` HTTP 200 liefert.
- [ ] **Step 3:** Workflow `ics` per `gh workflow run ics` starten, Lauf grün; Raw-URL liefert `BEGIN:VCALENDAR`.
- [ ] **Step 4:** Manuels echte Woche über die Seite eintragen: Di 20.10. RAV 07-16, Mi 21.10. RAV ganzer Tag, Do 22.10. Kia 07-22. Raster prüfen gegen die Prüffälle der Spec; nach dem nächsten Action-Lauf enthält die Raw-URL `Manuel weg 07-22 (Kia)` und 3 Termine `Hunde: Svenja` in dieser Woche.
- [ ] **Step 5:** `README.md` (kurz, für Manuel): wozu, Link-Aufbau ohne Geheimnis (`…/Auto-Hunde/#<geheim>`, Geheimnis liegt in `.secrets/geheim.txt`), Startbildschirm auf iPhone und Android, Cozi-Abo (my.cozi.com, Kalender, Einstellungen, Internetkalender hinzufügen, Raw-URL einfügen), Outlook-Abo (Kalender hinzufügen, Aus dem Internet abonnieren), Regeln neu deployen, Action-Intervall, Platz für die gemessene Cozi-Verzögerung (zunächst «noch nicht gemessen»).
- [ ] **Step 6: Commit und Push** `git add README.md && git commit -m "README: Einrichtung" && git push`.
- [ ] **Step 7: Übergabe an Manuel:** vollständiger Link mit Geheimnis und Abo-URL privat im Chat, nicht im Repo. Cozi- und Outlook-Abo richtet Manuel selbst ein (seine Logins); danach Verzögerung messen und in README nachtragen.
