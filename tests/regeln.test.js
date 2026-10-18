import test from 'node:test';
import assert from 'node:assert/strict';
import { loeseTag, wocheAb, pruefeAbwesenheit, tagSchluessel } from '../src/regeln.js';

test('Di 20.10. RAV 07-16: Manuel beide Runden', () => {
  const t = loeseTag('2026-10-20', { abwesend: { auto: 'rav', von: 7, bis: 16 } });
  assert.deepEqual([t.morgen.person, t.morgen.von, t.nachmittag.person], ['M', 6, 'M']);
});

test('Mi 21.10. ohne Dokument: Auto offen, Svenja 8-9 und 16-17 als Vorschlag', () => {
  const t = loeseTag('2026-10-21', undefined);
  assert.deepEqual(t.abwesend, { auto: 'offen', von: null, bis: null });
  assert.deepEqual(
    [t.morgen.person, t.morgen.von, t.morgen.quelle, t.nachmittag.person],
    ['S', 8, 'vorschlag', 'S'],
  );
});

test('Do 22.10. Kia 07-22: Manuel morgens, Svenja nachmittags', () => {
  const t = loeseTag('2026-10-22', { abwesend: { auto: 'kia', von: 7, bis: 22 } });
  assert.deepEqual([t.morgen.person, t.nachmittag.person, t.nachmittag.von], ['M', 'S', 16]);
});

test('Mittwoch auf Kia 09-15 geändert: beide Runden zurück zu Manuel', () => {
  const t = loeseTag('2026-10-21', { abwesend: { auto: 'kia', von: 9, bis: 15 } });
  assert.deepEqual([t.morgen.person, t.nachmittag.person], ['M', 'M']);
});

test('Mittwoch gelöscht: Normalfall', () => {
  const t = loeseTag('2026-10-21', { abwesend: null });
  assert.equal(t.abwesend, null);
  assert.equal(t.morgen.quelle, 'standard');
});

test('Handrunde Manuel 05-06 bleibt trotz Abwesenheit ab 6', () => {
  const t = loeseTag('2026-10-23', {
    abwesend: { auto: 'kia', von: 6, bis: 20 },
    morgen: { person: 'M', von: 5, bis: 6, quelle: 'hand' },
  });
  assert.deepEqual([t.morgen.person, t.morgen.von, t.nachmittag.person], ['M', 5, 'S']);
});

test('wocheAb über Zeitumstellung: Woche 19.10. endet So 25.10., nächste beginnt Mo 26.10.', () => {
  assert.deepEqual(wocheAb(new Date(2026, 9, 25)), [
    '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25',
  ]);
  assert.equal(wocheAb(new Date(2026, 9, 26, 0, 30))[0], '2026-10-26');
});

test('tagSchluessel nutzt lokale Felder', () => {
  assert.equal(tagSchluessel(new Date(2026, 0, 5, 0, 10)), '2026-01-05');
});

test('pruefeAbwesenheit sperrt von >= bis und bis > 24', () => {
  assert.ok(pruefeAbwesenheit({ auto: 'kia', von: 16, bis: 7 }));
  assert.ok(pruefeAbwesenheit({ auto: 'kia', von: 7, bis: 25 }));
  assert.equal(pruefeAbwesenheit({ auto: 'kia', von: 7, bis: 24 }), null);
  assert.equal(pruefeAbwesenheit({ auto: 'offen', von: null, bis: null }), null);
});

test('Mittwoch mit Handrunde, aber ohne abwesend-Feld: Vorbelegung bleibt', () => {
  const t = loeseTag('2026-10-21', { morgen: { person: 'M', von: 6, bis: 7, quelle: 'hand' } });
  assert.deepEqual(t.abwesend, { auto: 'offen', von: null, bis: null });
  assert.deepEqual([t.morgen.person, t.nachmittag.person, t.nachmittag.quelle], ['M', 'S', 'vorschlag']);
});
