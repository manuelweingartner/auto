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

test('Woche 19.10. im Sammelkalender: 9 Termine (3 weg, Svenja Mi und Do, Manuel Mo, Di, Do morgens, Fr)', () => {
  const s = ics();
  assert.equal(s.match(/BEGIN:VEVENT/g).length, 9);
  assert.ok(s.includes('UID:2026-10-19-hunde-manuel@auto-hunde'));
  assert.ok(s.includes('SUMMARY:Hunde: Manuel (Morgen und Nachmittag)'));
  assert.ok(s.includes('SUMMARY:Hunde: Manuel (Morgen)'));
  assert.ok(s.includes('SUMMARY:Hunde: Svenja (Nachmittag)'));
  assert.ok(s.includes('UID:2026-10-22-hunde@auto-hunde'));
});

test('Abwesenheit mit Zeit als Termin mit Ortszeit', () => {
  const s = ics();
  assert.ok(s.includes('SUMMARY:Manuel weg 7 bis 22 Uhr (mit Kia)'));
  assert.ok(s.includes('DTSTART;TZID=Europe/Zurich:20261022T070000'));
  assert.ok(s.includes('DTEND;TZID=Europe/Zurich:20261022T220000'));
});

test('Ganzer Tag mit offenem Auto als Ganztagestermin', () => {
  const s = ics();
  assert.ok(s.includes('SUMMARY:Manuel ganzer Tag weg mit Abendessen (Auto noch offen)'));
  assert.ok(s.includes('DTSTART;VALUE=DATE:20261021'));
  assert.ok(s.includes('DTEND;VALUE=DATE:20261022'));
});

test('Runden als ein Ganztagestermin pro Person und Tag ohne Uhrzeit', () => {
  const s = ics();
  // Mi 21.10.: beide Runden Svenja. Do 22.10.: Manuel weg 7 bis 22 Uhr, nur der Nachmittag geht an Svenja.
  assert.ok(s.includes('DTSTART;VALUE=DATE:20261021\r\nDTEND;VALUE=DATE:20261022\r\nSUMMARY:Hunde: Svenja (Morgen und Nachmittag)'));
  assert.ok(s.includes('DTSTART;VALUE=DATE:20261022\r\nDTEND;VALUE=DATE:20261023\r\nSUMMARY:Hunde: Svenja (Nachmittag)'));
  // jeder Hunde-Termin ist ganztägig, keiner trägt eine Uhrzeit
  assert.equal((s.match(/-hunde@auto-hunde\r\nDTSTAMP:[^\r]*\r\nDTSTART;VALUE=DATE/g) || []).length, 2);
  assert.equal((s.match(/-hunde@auto-hunde\r\nDTSTAMP:[^\r]*\r\nDTSTART;TZID/g) || []).length, 0);
  // Manuel: Mo, Di und Fr beide Runden, Do nur der Morgen; ebenfalls ganztägig
  assert.equal((s.match(/-hunde-manuel@auto-hunde\r\nDTSTAMP:[^\r]*\r\nDTSTART;VALUE=DATE/g) || []).length, 4);
  assert.equal((s.match(/-hunde-manuel@auto-hunde\r\nDTSTAMP:[^\r]*\r\nDTSTART;TZID/g) || []).length, 0);
});

test('Ende 24 Uhr wird 00:00 des Folgetags', () => {
  const t = loeseTag('2026-10-23', { abwesend: { auto: 'keines', von: 7, bis: 24 } });
  const s = baueIcs([t], JETZT);
  assert.ok(s.includes('SUMMARY:Manuel weg 7 bis 24 Uhr (ohne Auto)'));
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
  assert.ok(!s.includes('Hunde: Manuel'));
  assert.ok(s.includes('X-WR-CALNAME:Hunde Svenja'));
});

test('nurManuel: Kia, RAV, ohne Auto und noch offen (auch der Mittwoch), keine Hunderunden', () => {
  const tage = woche();
  tage.push(loeseTag('2026-10-26', { abwesend: { auto: 'keines', von: 7, bis: 17 } }));
  const s = baueIcs(tage, JETZT, { nurManuel: true });
  assert.equal(s.match(/BEGIN:VEVENT/g).length, 4);
  assert.ok(s.includes('SUMMARY:Manuel weg 7 bis 16 Uhr (mit Toyota)'));
  assert.ok(s.includes('SUMMARY:Manuel ganzer Tag weg mit Abendessen (Auto noch offen)'));
  assert.ok(s.includes('SUMMARY:Manuel weg 7 bis 22 Uhr (mit Kia)'));
  assert.ok(s.includes('SUMMARY:Manuel weg 7 bis 17 Uhr (ohne Auto)'));
  assert.ok(!s.includes('Hunde:'));
  assert.ok(s.includes('X-WR-CALNAME:Auto Manuel'));
});

test('nurRav: nur RAV-Abwesenheiten als «Manuel hat Toyota», kein Kia, kein offenes Auto, keine Hunderunden', () => {
  const tage = woche();
  tage.push(loeseTag('2026-10-26', { abwesend: { auto: 'rav', von: null, bis: null } }));
  const s = baueIcs(tage, JETZT, { nurRav: true });
  assert.equal(s.match(/BEGIN:VEVENT/g).length, 2);
  assert.ok(!s.includes('Hunde: Svenja'));
  assert.ok(!s.includes('(mit Kia)'));
  assert.ok(!s.includes('noch offen'));
  assert.ok(!s.includes('Manuel weg'));
  assert.ok(s.includes('SUMMARY:Manuel hat Toyota 7 bis 16 Uhr\r\n'));
  assert.ok(s.includes('SUMMARY:Manuel hat Toyota (ganzer Tag)\r\n'));
  assert.ok(s.includes('X-WR-CALNAME:Auto-Hunde RAV'));
  assert.ok(baueIcs(woche(), JETZT).includes('X-WR-CALNAME:Auto-Hunde\r\n'));
});
