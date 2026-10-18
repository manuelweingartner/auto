// ICS-Abo aus gelösten Tagen. Zeiten als Wanduhrzeit mit TZID, nie über Millisekunden gerechnet.
import { datumAus, tagSchluessel } from './regeln.js';

const AUTO_NAME = { kia: 'Kia', rav: 'RAV', offen: 'Auto offen' };
const zweistellig = (n) => String(n).padStart(2, '0');
const kompakt = (schluessel) => schluessel.replaceAll('-', '');

function folgetag(schluessel) {
  const d = datumAus(schluessel);
  d.setDate(d.getDate() + 1);
  return tagSchluessel(d);
}

function wanduhr(schluessel, stunde) {
  if (stunde === 24) return `${kompakt(folgetag(schluessel))}T000000`;
  return `${kompakt(schluessel)}T${zweistellig(stunde)}0000`;
}

function stempel(jetzt) {
  return jetzt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function titelAbwesend(a) {
  const auto = AUTO_NAME[a.auto];
  const klammer = auto ? ` (${auto})` : '';
  if (a.von == null) return `Manuel weg${klammer}`;
  return `Manuel weg ${zweistellig(a.von)}-${zweistellig(a.bis)}${klammer}`;
}

function termin({ uid, titel, datum, von, bis, ganztag }, jetzt) {
  const zeit = ganztag
    ? [`DTSTART;VALUE=DATE:${kompakt(datum)}`, `DTEND;VALUE=DATE:${kompakt(folgetag(datum))}`]
    : [`DTSTART;TZID=Europe/Zurich:${wanduhr(datum, von)}`, `DTEND;TZID=Europe/Zurich:${wanduhr(datum, bis)}`];
  return ['BEGIN:VEVENT', `UID:${uid}@auto-hunde`, `DTSTAMP:${stempel(jetzt)}`, ...zeit, `SUMMARY:${titel}`, 'END:VEVENT'];
}

const kopf = (name) => [
  'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Auto-Hunde//DE', 'CALSCALE:GREGORIAN',
  `X-WR-CALNAME:${name}`, 'X-WR-TIMEZONE:Europe/Zurich',
  'BEGIN:VTIMEZONE', 'TZID:Europe/Zurich',
  'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST',
  'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET',
  'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
  'END:VTIMEZONE',
];

/** nurRav: Kalender für die Eltern. Nur Tage, an denen der RAV weg ist; kein Kia,
 *  kein offenes Auto (Entscheid Manuel 18.10.2026), kein «kein Auto», keine Hunderunden. */
export function baueIcs(tage, jetzt, { nurRav = false } = {}) {
  const zeilen = kopf(nurRav ? 'Auto-Hunde RAV' : 'Auto-Hunde');
  for (const t of tage) {
    const a = t.abwesend;
    if (a && (!nurRav || a.auto === 'rav')) {
      zeilen.push(...termin({
        uid: `${t.datum}-abwesend`, titel: titelAbwesend(a), datum: t.datum,
        von: a.von, bis: a.bis, ganztag: a.von == null,
      }, jetzt));
    }
    if (nurRav) continue;
    // Svenjas Runden als ein Ganztagestermin pro Tag; Uhrzeiten werden bewusst nicht exportiert.
    const runden = ['morgen', 'nachmittag'].filter((slot) => t[slot].person === 'S');
    if (runden.length > 0) {
      const welche = runden.map((s) => (s === 'morgen' ? 'Morgen' : 'Nachmittag')).join(' und ');
      zeilen.push(...termin({ uid: `${t.datum}-hunde`, titel: `Hunde: Svenja (${welche})`, datum: t.datum, ganztag: true }, jetzt));
    }
  }
  zeilen.push('END:VCALENDAR');
  return zeilen.join('\r\n') + '\r\n';
}
