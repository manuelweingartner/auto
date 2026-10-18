// Darstellung der Woche als Tabelle. Reine Funktion, ohne DOM, testbar in Node.
import { datumAus } from './regeln.js';

const KURZ = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const zweistellig = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function zeitText(von, bis) {
  return `${zweistellig(von)}-${zweistellig(bis)}`;
}

function kopf(t, heute) {
  const d = datumAus(t.datum);
  const klasse = t.datum === heute ? 'tag heute' : 'tag';
  return `<th class="${klasse}" data-datum="${t.datum}" scope="col"><button type="button" class="tagknopf" data-tag="${t.datum}"><span class="wt">${KURZ[(d.getDay() + 6) % 7]}</span><span class="dt">${d.getDate()}.</span></button></th>`;
}

// Nur die Person. Die Uhrzeiten der Runden sind Beiwerk und werden nirgends gezeigt.
function hundeZelle(t, slot) {
  const p = esc(t[slot].person);
  return `<td><button type="button" class="runde p${p}" data-tag="${t.datum}" data-slot="${slot}">${p}</button></td>`;
}

function autoZelle(t, auto) {
  const a = t.abwesend;
  let inhalt = '';
  if (a && a.auto === auto) inhalt = a.von == null ? 'ganzer Tag' : zeitText(a.von, a.bis);
  else if (a && a.auto === 'offen') inhalt = a.von == null ? 'offen' : `offen ${zeitText(a.von, a.bis)}`;
  const klasse = a && a.auto === 'offen' ? 'auto offen' : `auto ${auto}`;
  return `<td><button type="button" class="${klasse}" data-tag="${t.datum}" data-auto="${auto}">${esc(inhalt)}</button></td>`;
}

function zeile(label, zellen, klasse = '') {
  return `<tr class="${klasse}"><th scope="row">${label}</th>${zellen}</tr>`;
}

export function rasterHtml(tage, ansicht, heute) {
  const koepfe = tage.map((t) => kopf(t, heute)).join('');
  const zeilen = [];
  if (ansicht === 'alle') {
    zeilen.push(zeile('<span class="rl"><small>Hunde</small>Morgen</span>', tage.map((t) => hundeZelle(t, 'morgen')).join(''), 'hunde'));
    zeilen.push(zeile('<span class="rl"><small>Hunde</small>Nach&shy;mittag</span>', tage.map((t) => hundeZelle(t, 'nachmittag')).join(''), 'hunde'));
  }
  zeilen.push(zeile('<img src="bilder/kia.png" alt="Kia PV5" class="autobild">', tage.map((t) => autoZelle(t, 'kia')).join(''), 'autos'));
  zeilen.push(zeile('<img src="bilder/rav.png" alt="Toyota RAV" class="autobild">', tage.map((t) => autoZelle(t, 'rav')).join(''), 'autos'));
  return `<table class="raster"><thead><tr><th></th>${koepfe}</tr></thead><tbody>${zeilen.join('')}</tbody></table>`;
}
