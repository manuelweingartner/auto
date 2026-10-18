import test from 'node:test';
import assert from 'node:assert/strict';
import { aboLinks } from '../src/links.js';

const BASIS = 'https://gist.githubusercontent.com/jemand/abc123/raw';

test('aboLinks: genau drei Kalender (Hunde Svenja, Auto Manuel, nur RAV) mit https und webcal', () => {
  const l = aboLinks(BASIS);
  assert.deepEqual(Object.keys(l).sort(), ['hunde', 'manuel', 'rav']);
  assert.equal(l.hunde.https, `${BASIS}/auto-hunde-hunde.ics`);
  assert.equal(l.manuel.https, `${BASIS}/auto-hunde-manuel.ics`);
  assert.equal(l.rav.https, `${BASIS}/auto-hunde-rav.ics`);
  assert.equal(l.rav.webcal, 'webcal://gist.githubusercontent.com/jemand/abc123/raw/auto-hunde-rav.ics');
  assert.equal(l.rav.google, undefined);
});

test('aboLinks verträgt einen Schrägstrich am Ende', () => {
  assert.equal(aboLinks(BASIS + '/').rav.https, `${BASIS}/auto-hunde-rav.ics`);
});
