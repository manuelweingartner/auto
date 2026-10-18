import test from 'node:test';
import assert from 'node:assert/strict';
import { loeseTag, wocheAb } from '../src/regeln.js';
import { rasterHtml } from '../src/raster.js';

const DOCS = {
  '2026-10-20': { abwesend: { auto: 'rav', von: 7, bis: 16 } },
  '2026-10-22': { abwesend: { auto: 'kia', von: 7, bis: 22 } },
};
const tage = () => wocheAb(new Date(2026, 9, 19)).map((d) => loeseTag(d, DOCS[d]));

test('Ansicht alle: sieben Spaltenköpfe und die Kia-Zeit', () => {
  const h = rasterHtml(tage(), 'alle', '2026-10-19');
  for (const k of ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']) assert.ok(h.includes(`>${k}<`), k);
  assert.ok(h.includes('07-22'));
  assert.ok(h.includes('data-slot='));
});

test('Ansicht autos: keine Hundezellen', () => {
  assert.ok(!rasterHtml(tage(), 'autos', '2026-10-19').includes('data-slot='));
});

test('Mittwoch zeigt offen', () => {
  assert.ok(rasterHtml(tage(), 'alle', '2026-10-19').includes('offen'));
});

test('heutige Spalte ist markiert', () => {
  const h = rasterHtml(tage(), 'alle', '2026-10-19');
  assert.match(h, /class="tag heute"[^>]*data-datum="2026-10-19"/);
  assert.doesNotMatch(h, /class="tag heute"[^>]*data-datum="2026-10-20"/);
});

test('Svenja-Runde als S, abweichende Zeit sichtbar', () => {
  const t = loeseTag('2026-10-23', {
    abwesend: { auto: 'kia', von: 6, bis: 20 },
    morgen: { person: 'M', von: 5, bis: 6, quelle: 'hand' },
  });
  const h = rasterHtml([t], 'alle', '2026-10-19');
  assert.ok(h.includes('05-06'));
  assert.match(h, /data-slot="nachmittag"[^>]*>[\s\S]*?S/);
});

test('Mittwoch mit Zeit und offenem Auto zeigt offen 09-15 in beiden Autozeilen', () => {
  const t = loeseTag('2026-10-21', { abwesend: { auto: 'offen', von: 9, bis: 15 } });
  const h = rasterHtml([t], 'alle', '2026-10-19');
  assert.equal((h.match(/class="auto offen"[^>]*>offen 09-15</g) || []).length, 2);
});

test('Hundezelle schreibt Person und Zeit escaped', () => {
  const t = { datum: '2026-10-23', abwesend: null,
    morgen: { person: '<b>', von: 5, bis: 6, quelle: 'hand' },
    nachmittag: { person: 'M', von: 16, bis: 17, quelle: 'standard' } };
  const h = rasterHtml([t], 'alle', '2026-10-19');
  assert.ok(!h.includes('<b>'));
  assert.ok(h.includes('&lt;b&gt;'));
});
