import test from 'node:test';
import assert from 'node:assert/strict';
import { loeseTag, wocheAb } from '../src/regeln.js';
import { baueIcs } from '../src/ics.js';

const DOCS = {
  '2026-10-20': { abwesend: { auto: 'rav', von: 7, bis: 16 } },
  '2026-10-22': { abwesend: { auto: 'kia', von: 7, bis: 22 } },
};
const JETZT = new Date(Date.UTC(2026, 9, 18, 10, 0, 0));
const woche = () => wocheAb(new Date(2026, 9, 19)).map((d) => loeseTag(d, DOCS[d]));
const ics = () => baueIcs(woche(), JETZT);

test('Woche 19.10.: 5 Termine (Di weg, Mi ganztägig, Mi Hunde, Do weg, Do Hunde)', () => {
  assert.equal(ics().match(/BEGIN:VEVENT/g).length, 5);
});

test('Abwesenheit mit Zeit als Termin mit Ortszeit', () => {
  const s = ics();
  assert.ok(s.includes('SUMMARY:Manuel weg 07-22 (Kia)'));
  assert.ok(s.includes('DTSTART;TZID=Europe/Zurich:20261022T070000'));
  assert.ok(s.includes('DTEND;TZID=Europe/Zurich:20261022T220000'));
});

test('Ganzer Tag mit offenem Auto als Ganztagestermin', () => {
  const s = ics();
  assert.ok(s.includes('SUMMARY:Manuel weg (Auto offen)'));
  assert.ok(s.includes('DTSTART;VALUE=DATE:20261021'));
  assert.ok(s.includes('DTEND;VALUE=DATE:20261022'));
});

test('Svenja-Runden als ein Ganztagestermin pro Tag ohne Uhrzeit, keine Manuel-Runden', () => {
  const s = ics();
  // Mi 21.10.: beide Runden Svenja. Do 22.10.: Manuel weg 07-22, nur der Nachmittag geht an Svenja.
  assert.ok(s.includes('DTSTART;VALUE=DATE:20261021\r\nDTEND;VALUE=DATE:20261022\r\nSUMMARY:Hunde: Svenja (Morgen und Nachmittag)'));
  assert.ok(s.includes('DTSTART;VALUE=DATE:20261022\r\nDTEND;VALUE=DATE:20261023\r\nSUMMARY:Hunde: Svenja (Nachmittag)'));
  // jeder Hunde-Termin ist ganztägig, keiner trägt eine Uhrzeit
  assert.equal((s.match(/-hunde@auto-hunde\r\nDTSTAMP:[^\r]*\r\nDTSTART;VALUE=DATE/g) || []).length, 2);
  assert.equal((s.match(/-hunde@auto-hunde\r\nDTSTAMP:[^\r]*\r\nDTSTART;TZID/g) || []).length, 0);
  assert.ok(!s.includes('Hunde: Manuel'));
});

test('Ende 24 Uhr wird 00:00 des Folgetags', () => {
  const t = loeseTag('2026-10-23', { abwesend: { auto: 'keines', von: 7, bis: 24 } });
  const s = baueIcs([t], JETZT);
  assert.ok(s.includes('SUMMARY:Manuel weg 07-24'));
  assert.ok(!s.includes('SUMMARY:Manuel weg 07-24 ('));
  assert.ok(s.includes('DTEND;TZID=Europe/Zurich:20261024T000000'));
});

test('Sonntag der Zeitumstellung bleibt Ortszeit', () => {
  const t = loeseTag('2026-10-25', { abwesend: { auto: 'rav', von: 7, bis: 12 } });
  assert.ok(baueIcs([t], JETZT).includes('DTSTART;TZID=Europe/Zurich:20261025T070000'));
});

test('Kopf, stabile UIDs, DTSTAMP in UTC, CRLF', () => {
  const s = ics();
  assert.ok(s.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(s.includes('X-WR-CALNAME:Auto-Hunde'));
  assert.ok(s.includes('BEGIN:VTIMEZONE'));
  assert.ok(s.includes('UID:2026-10-22-abwesend@auto-hunde'));
  assert.ok(s.includes('UID:2026-10-21-hunde@auto-hunde'));
  assert.ok(s.includes('DTSTAMP:20261018T100000Z'));
  assert.ok(s.endsWith('END:VCALENDAR\r\n'));
  assert.ok(s.split('\r\n').every((z) => !z.includes('\n')));
});

test('nurHunde: nur Svenjas Hunderunden, keine Abwesenheiten, eigener Kalendername', () => {
  const s = baueIcs(woche(), JETZT, { nurHunde: true });
  assert.equal(s.match(/BEGIN:VEVENT/g).length, 2);
  assert.ok(s.includes('SUMMARY:Hunde: Svenja (Morgen und Nachmittag)'));
  assert.ok(s.includes('SUMMARY:Hunde: Svenja (Nachmittag)'));
  assert.ok(!s.includes('Manuel weg'));
  assert.ok(s.includes('X-WR-CALNAME:Hunde Svenja'));
});

test('nurManuel: alle Abwesenheiten von Manuel (Kia, RAV, offen), keine Hunderunden, eigener Kalendername', () => {
  const s = baueIcs(woche(), JETZT, { nurManuel: true });
  assert.equal(s.match(/BEGIN:VEVENT/g).length, 3);
  assert.ok(s.includes('SUMMARY:Manuel weg 07-16 (RAV)'));
  assert.ok(s.includes('SUMMARY:Manuel weg (Auto offen)'));
  assert.ok(s.includes('SUMMARY:Manuel weg 07-22 (Kia)'));
  assert.ok(!s.includes('Hunde: Svenja'));
  assert.ok(s.includes('X-WR-CALNAME:Auto Manuel'));
});

test('nurRav: nur RAV-Abwesenheiten, kein Kia, kein offenes Auto, keine Hunderunden, eigener Kalendername', () => {
  const s = baueIcs(woche(), JETZT, { nurRav: true });
  assert.equal(s.match(/BEGIN:VEVENT/g).length, 1);
  assert.ok(!s.includes('Hunde: Svenja'));
  assert.ok(!s.includes('(Kia)'));
  assert.ok(!s.includes('Auto offen'));
  assert.ok(s.includes('SUMMARY:Manuel weg 07-16 (RAV)'));
  assert.ok(s.includes('X-WR-CALNAME:Auto-Hunde RAV'));
  assert.ok(baueIcs(woche(), JETZT).includes('X-WR-CALNAME:Auto-Hunde\r\n'));
});
