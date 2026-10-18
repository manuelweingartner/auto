import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { mussNeuLaden, DATEIEN, frischLaden } from '../src/version.js';

test('DATEIEN nennt Seite, Stil und jedes Modul in src/, damit nichts aus dem Cache überlebt', () => {
  const module = readdirSync(new URL('../src/', import.meta.url)).filter((f) => f.endsWith('.js')).map((f) => `src/${f}`);
  assert.deepEqual([...DATEIEN].sort(), ['index.html', 'style.css', ...module].sort());
});

test('frischLaden holt jede Datei am Cache vorbei und wirft bei einem Fehler nicht', async () => {
  const geholt = [];
  await frischLaden(async (url, opts) => { geholt.push([url, opts.cache]); if (url === 'style.css') throw new Error('offline'); return { ok: true }; });
  assert.deepEqual(geholt.map(([u]) => u).sort(), [...DATEIEN].sort());
  assert.ok(geholt.every(([, c]) => c === 'reload'));
});

test('neu laden, wenn auf dem Server eine andere Fassung liegt', () => {
  assert.equal(mussNeuLaden('2026-10-18.3', '2026-10-18.4', false), true);
});

test('nicht neu laden bei gleicher Fassung', () => {
  assert.equal(mussNeuLaden('2026-10-18.4', '2026-10-18.4', false), false);
});

test('nicht neu laden, wenn eine Fassung unbekannt ist (offline, Fehler)', () => {
  assert.equal(mussNeuLaden(null, '2026-10-18.4', false), false);
  assert.equal(mussNeuLaden('2026-10-18.3', null, false), false);
  assert.equal(mussNeuLaden('2026-10-18.3', '', false), false);
});

test('nicht neu laden, solange ein Blatt offen ist', () => {
  assert.equal(mussNeuLaden('2026-10-18.3', '2026-10-18.4', true), false);
});
