import test from 'node:test';
import assert from 'node:assert/strict';
import { ladeDocs, tageImFenster, ohneStempel } from '../scripts/ics-export.js';

function antwort(json) {
  return { ok: true, status: 200, json: async () => json };
}

test('ladeDocs folgt nextPageToken und wandelt Firestore-Typen', async () => {
  const seiten = [
    {
      documents: [{
        name: 'projects/p/databases/(default)/documents/h/g/tage/2026-10-22',
        fields: {
          abwesend: { mapValue: { fields: { auto: { stringValue: 'kia' }, von: { integerValue: '7' }, bis: { integerValue: '22' } } } },
          morgen: { mapValue: { fields: { person: { stringValue: 'M' }, von: { integerValue: '5' }, bis: { integerValue: '6' }, quelle: { stringValue: 'hand' } } } },
        },
      }],
      nextPageToken: 'weiter',
    },
    {
      documents: [{
        name: 'projects/p/databases/(default)/documents/h/g/tage/2026-10-21',
        fields: { abwesend: { nullValue: null } },
      }],
    },
  ];
  const urls = [];
  const fetchFn = async (url) => { urls.push(url); return antwort(seiten.shift()); };
  const docs = await ladeDocs('p', 'key', 'g', fetchFn);
  assert.deepEqual(docs['2026-10-22'], {
    abwesend: { auto: 'kia', von: 7, bis: 22 },
    morgen: { person: 'M', von: 5, bis: 6, quelle: 'hand' },
  });
  assert.deepEqual(docs['2026-10-21'], { abwesend: null });
  assert.equal(urls.length, 2);
  assert.ok(urls[0].includes('/documents/h/g/tage?') && urls[0].includes('pageSize=300') && urls[0].includes('key=key'));
  assert.ok(urls[1].includes('pageToken=weiter'));
});

test('tageImFenster: 28 Tage zurück, voraus bis Ende nächstes Jahr, nur Mo bis Fr, Mittwoche vorbelegt', () => {
  const tage = tageImFenster(new Date(2026, 9, 18), {});
  assert.equal(tage.length, 335); // Mo 21.09.2026 bis Fr 31.12.2027: 467 Kalendertage, 66 Wochen und 5 Werktage
  assert.equal(tage[0].datum, '2026-09-21');
  assert.equal(tage.at(-1).datum, '2027-12-31');
  // Anfang Januar reicht das Fenster schon bis Ende des übernächsten Kalenderjahres.
  assert.equal(tageImFenster(new Date(2027, 0, 5), {}).at(-1).datum, '2028-12-29');
  assert.ok(tage.every((t) => ![0, 6].includes(new Date(t.datum + 'T12:00').getDay())));
  const mittwoche = tage.filter((t) => new Date(t.datum + 'T12:00').getDay() === 3);
  assert.ok(mittwoche.length >= 12);
  assert.ok(mittwoche.every((t) => t.abwesend?.auto === 'offen'));
});

test('ohneStempel entfernt nur DTSTAMP-Zeilen', () => {
  const a = 'BEGIN:VEVENT\r\nDTSTAMP:20261018T100000Z\r\nSUMMARY:x\r\nEND:VEVENT\r\n';
  const b = 'BEGIN:VEVENT\r\nDTSTAMP:20261019T120000Z\r\nSUMMARY:x\r\nEND:VEVENT\r\n';
  assert.equal(ohneStempel(a), ohneStempel(b));
  assert.ok(ohneStempel(a).includes('SUMMARY:x'));
});

test('dateien liefert genau drei Kalender: Hunde Svenja, Auto Manuel, nur RAV', async () => {
  const { dateien } = await import('../scripts/ics-export.js');
  const { loeseTag } = await import('../src/regeln.js');
  const tage = [
    loeseTag('2026-10-22', { abwesend: { auto: 'kia', von: 7, bis: 22 } }),
    loeseTag('2026-10-23', { abwesend: { auto: 'rav', von: 7, bis: 16 } }),
  ];
  const d = dateien(tage, new Date(Date.UTC(2026, 9, 18, 10)));
  assert.deepEqual(Object.keys(d).sort(), ['auto-hunde-hunde.ics', 'auto-hunde-manuel.ics', 'auto-hunde-rav.ics']);
  assert.ok(d['auto-hunde-hunde.ics'].includes('Hunde: Svenja'));
  assert.ok(!d['auto-hunde-hunde.ics'].includes('Manuel weg'));
  assert.ok(d['auto-hunde-manuel.ics'].includes('Manuel weg 7 bis 22 Uhr (mit Kia)'));
  assert.ok(d['auto-hunde-manuel.ics'].includes('Manuel weg 7 bis 16 Uhr (mit Toyota)'));
  assert.ok(!d['auto-hunde-manuel.ics'].includes('Hunde: Svenja'));
  assert.ok(!d['auto-hunde-rav.ics'].includes('Hunde: Svenja'));
  assert.ok(!d['auto-hunde-rav.ics'].includes('(mit Kia)'));
  assert.ok(d['auto-hunde-rav.ics'].includes('Manuel hat Toyota 7 bis 16 Uhr'));
});
