import test from 'node:test';
import assert from 'node:assert/strict';
import { aboLinks } from '../src/links.js';

const BASIS = 'https://gist.githubusercontent.com/jemand/abc123/raw';

test('aboLinks: https, webcal und Google-Kalender-Link für beide Kalender', () => {
  const l = aboLinks(BASIS);
  assert.equal(l.alle.https, `${BASIS}/auto-hunde.ics`);
  assert.equal(l.alle.webcal, 'webcal://gist.githubusercontent.com/jemand/abc123/raw/auto-hunde.ics');
  assert.equal(l.alle.google, `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`${BASIS}/auto-hunde.ics`)}`);
  assert.equal(l.rav.https, `${BASIS}/auto-hunde-rav.ics`);
  assert.equal(l.rav.webcal, 'webcal://gist.githubusercontent.com/jemand/abc123/raw/auto-hunde-rav.ics');
  assert.equal(l.hunde.https, `${BASIS}/auto-hunde-hunde.ics`);
  assert.equal(l.hunde.webcal, 'webcal://gist.githubusercontent.com/jemand/abc123/raw/auto-hunde-hunde.ics');
});

test('aboLinks verträgt einen Schrägstrich am Ende', () => {
  assert.equal(aboLinks(BASIS + '/').alle.https, `${BASIS}/auto-hunde.ics`);
});
