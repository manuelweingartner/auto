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

test('Woche 19.10.: 6 Termine (Di weg, Mi ganztägig, Mi Hunde x2, Do weg, Do Hunde)', () => {
  assert.equal(ics().match(/BEGIN:VEVENT/g).length, 6);
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

test('Svenja-Runde morgens 8-9 als Termin, keine Manuel-Runden', () => {
  const s = ics();
  assert.ok(s.includes('SUMMARY:Hunde: Svenja'));
  assert.ok(s.includes('DTSTART;TZID=Europe/Zurich:20261021T080000'));
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
  assert.ok(s.includes('UID:2026-10-21-morgen@auto-hunde'));
  assert.ok(s.includes('DTSTAMP:20261018T100000Z'));
  assert.ok(s.endsWith('END:VCALENDAR\r\n'));
  assert.ok(s.split('\r\n').every((z) => !z.includes('\n')));
});
