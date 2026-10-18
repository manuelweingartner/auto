import test from 'node:test';
import assert from 'node:assert/strict';
import { logText, logEintrag, logHtml } from '../src/log.js';

test('logText: Abwesenheit mit Auto und Zeit, ganzer Tag, offen, kein Auto, gelöscht', () => {
  assert.equal(logText('2026-10-20', { art: 'abwesend', wert: { auto: 'rav', von: 7, bis: 16 } }), 'Di 20.10.: RAV 07-16');
  assert.equal(logText('2026-10-21', { art: 'abwesend', wert: { auto: 'kia', von: null, bis: null } }), 'Mi 21.10.: Kia ganzer Tag');
  assert.equal(logText('2026-10-21', { art: 'abwesend', wert: { auto: 'offen', von: 9, bis: 15 } }), 'Mi 21.10.: Auto offen 09-15');
  assert.equal(logText('2026-10-21', { art: 'abwesend', wert: { auto: 'keines', von: 9, bis: 15 } }), 'Mi 21.10.: kein Auto 09-15');
  assert.equal(logText('2026-10-21', { art: 'abwesend', wert: null }), 'Mi 21.10.: gelöscht');
});

test('logText: Hunderunde mit Person und Zeit', () => {
  assert.equal(logText('2026-10-22', { art: 'runde', slot: 'morgen', person: 'S', von: 8 }), 'Do 22.10.: Morgen Svenja 08-09');
  assert.equal(logText('2026-10-22', { art: 'runde', slot: 'nachmittag', person: 'M', von: 16 }), 'Do 22.10.: Nachmittag Manuel 16-17');
});

test('logEintrag: Zeit als ISO, Name getrimmt, Text', () => {
  const e = logEintrag('  Manuel ', '2026-10-20', { art: 'abwesend', wert: null }, new Date(Date.UTC(2026, 9, 18, 12, 5)));
  assert.deepEqual(e, { zeit: '2026-10-18T12:05:00.000Z', wer: 'Manuel', text: 'Di 20.10.: gelöscht' });
});

test('logHtml: Liste mit Zeit, Name und Text, escaped, ohne Name markiert', () => {
  const h = logHtml([
    { zeit: '2026-10-18T12:05:00.000Z', wer: 'Manuel', text: 'Di 20.10.: RAV 07-16' },
    { zeit: '2026-10-18T11:00:00.000Z', wer: '', text: '<img>' },
  ]);
  assert.ok(h.startsWith('<ul class="log">'));
  assert.ok(h.includes('Manuel'));
  assert.ok(h.includes('Di 20.10.: RAV 07-16'));
  assert.ok(h.includes('ohne Name'));
  assert.ok(!h.includes('<img>'));
  assert.ok(h.includes('&lt;img&gt;'));
  assert.equal(logHtml([]), '<p class="feld">Noch keine Änderungen.</p>');
});
