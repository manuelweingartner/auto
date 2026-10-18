import test from 'node:test';
import assert from 'node:assert/strict';
import { deuteWeg, antwort } from '../worker/index.js';

const env = { GEHEIM: 'g' };
const dok = (datum, fields) => ({ name: `projects/p/databases/(default)/documents/h/g/tage/${datum}`, fields });
const firestore = {
  documents: [
    dok('2026-10-22', { abwesend: { mapValue: { fields: { auto: { stringValue: 'rav' }, von: { integerValue: '7' }, bis: { integerValue: '22' } } } } }),
    dok('2026-10-23', { abwesend: { mapValue: { fields: { auto: { stringValue: 'keines' }, von: { nullValue: null }, bis: { nullValue: null } } } } }),
  ],
};
const fetchFn = async () => ({ ok: true, status: 200, json: async () => firestore });
const jetzt = new Date(2026, 9, 18, 12);

test('deuteWeg kennt nur die drei Dateien unter dem richtigen Geheimnis', () => {
  assert.equal(deuteWeg('/g/auto-hunde-manuel.ics', 'g'), 'auto-hunde-manuel.ics');
  assert.equal(deuteWeg('/g/auto-hunde-hunde.ics', 'g'), 'auto-hunde-hunde.ics');
  assert.equal(deuteWeg('/g/auto-hunde-rav.ics', 'g'), 'auto-hunde-rav.ics');
  assert.equal(deuteWeg('/falsch/auto-hunde-manuel.ics', 'g'), null);
  assert.equal(deuteWeg('/g/auto-hunde.ics', 'g'), null);
  assert.equal(deuteWeg('/g/', 'g'), null);
  assert.equal(deuteWeg('/g/auto-hunde-manuel.ics', ''), null);
});

test('falsches Geheimnis gibt 404, ohne Firestore anzufragen', async () => {
  let gefragt = 0;
  const r = await antwort(new Request('https://w.example/x/auto-hunde-manuel.ics'), env, async () => { gefragt++; }, jetzt);
  assert.equal(r.status, 404);
  assert.equal(gefragt, 0);
});

test('Manuel-Kalender kommt live aus Firestore als text/calendar', async () => {
  const r = await antwort(new Request('https://w.example/g/auto-hunde-manuel.ics'), env, fetchFn, jetzt);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'text/calendar; charset=utf-8');
  const ics = await r.text();
  assert.ok(ics.includes('X-WR-CALNAME:Auto Manuel'));
  assert.ok(ics.includes('SUMMARY:Manuel weg 7 bis 22 Uhr ca. (mit Toyota)'));
  assert.ok(ics.includes('SUMMARY:Manuel weg (ohne Auto)'));
});

test('RAV-Kalender enthält nur den RAV-Tag, Hunde-Kalender keine Abwesenheit', async () => {
  const rav = await (await antwort(new Request('https://w.example/g/auto-hunde-rav.ics'), env, fetchFn, jetzt)).text();
  assert.ok(rav.includes('SUMMARY:Manuel weg 7 bis 22 Uhr ca. (mit Toyota)'));
  assert.ok(!rav.includes('ohne Auto'));
  const hunde = await (await antwort(new Request('https://w.example/g/auto-hunde-hunde.ics'), env, fetchFn, jetzt)).text();
  assert.ok(hunde.includes('X-WR-CALNAME:Hunde Svenja'));
  assert.ok(!hunde.includes('Manuel weg'));
});

test('Firestore-Fehler wird 502, nicht leerer Kalender', async () => {
  const kaputt = async () => ({ ok: false, status: 500, json: async () => ({}) });
  const r = await antwort(new Request('https://w.example/g/auto-hunde-manuel.ics'), env, kaputt, jetzt);
  assert.equal(r.status, 502);
});
