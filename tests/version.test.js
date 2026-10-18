import test from 'node:test';
import assert from 'node:assert/strict';
import { mussNeuLaden } from '../src/version.js';

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
