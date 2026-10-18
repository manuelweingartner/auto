// Änderungsprotokoll: wer hat wann was auf der Seite geändert. Reine Funktionen, testbar in Node.
import { datumAus } from './regeln.js';

const KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const AUTO = { kia: 'Kia', rav: 'RAV', keines: 'kein Auto', offen: 'Auto offen' };
const PERSON = { M: 'Manuel', S: 'Svenja' };
const SLOT = { morgen: 'Morgen', nachmittag: 'Nachmittag' };
const zweistellig = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function tagText(datum) {
  const d = datumAus(datum);
  return `${KURZ[(d.getDay() + 6) % 7]} ${d.getDate()}.${d.getMonth() + 1}.`;
}

/** aenderung: {art:'abwesend', wert:Abwesenheit|null} oder {art:'runde', slot, person, von} */
export function logText(datum, aenderung) {
  let was;
  if (aenderung.art === 'abwesend') {
    const a = aenderung.wert;
    if (!a) was = 'gelöscht';
    else was = `${AUTO[a.auto] ?? a.auto} ${a.von == null ? 'ganzer Tag' : `${zweistellig(a.von)}-${zweistellig(a.bis)}`}`;
  } else {
    was = `Hunde ${SLOT[aenderung.slot]} ${PERSON[aenderung.person] ?? aenderung.person}`;
  }
  return `${tagText(datum)}: ${was}`;
}

export function logEintrag(wer, datum, aenderung, jetzt = new Date()) {
  return { zeit: jetzt.toISOString(), wer: String(wer ?? '').trim(), text: logText(datum, aenderung) };
}

function zeitText(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()}.${d.getMonth() + 1}. ${zweistellig(d.getHours())}:${zweistellig(d.getMinutes())}`;
}

export function logHtml(eintraege) {
  if (eintraege.length === 0) return '<p class="feld">Noch keine Änderungen.</p>';
  const li = eintraege.map((e) =>
    `<li><time>${esc(zeitText(e.zeit))}</time> <b>${e.wer ? esc(e.wer) : 'ohne Name'}</b> ${esc(e.text)}</li>`);
  return `<ul class="log">${li.join('')}</ul>`;
}
