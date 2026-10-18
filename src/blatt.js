// Eingabeblätter: «Manuel weg» (Auto und Zeit) und «Hunderunde» (Person und Zeit).
import { STANDARD, pruefeAbwesenheit, datumAus } from './regeln.js';

const LANG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const zweistellig = (n) => String(n).padStart(2, '0');

function titel(datum) {
  const d = datumAus(datum);
  return `${LANG[(d.getDay() + 6) % 7]}, ${d.getDate()}.${d.getMonth() + 1}.`;
}

function stunden(id, von, bis, wert) {
  const opts = [];
  for (let h = von; h <= bis; h++) opts.push(`<option value="${h}"${h === wert ? ' selected' : ''}>${zweistellig(h)}</option>`);
  return `<select id="${id}">${opts.join('')}</select>`;
}

function wahl(name, werte, aktiv) {
  return `<div class="wahl" data-wahl="${name}">${werte.map(([w, l]) =>
    `<button type="button" data-wert="${w}" aria-pressed="${w === aktiv}">${l}</button>`).join('')}</div>`;
}

/** Blatt «Manuel weg». onSave(abwesend|null) bei Speichern, null heisst Tag löschen. */
export function blattAbwesend(tag, onSave, onClose) {
  const a = tag.abwesend ?? { auto: 'keines', von: 7, bis: 17 };
  const ganz = a.von == null;
  const el = document.getElementById('blatt');
  el.innerHTML = `
    <form method="dialog" class="blattinhalt">
      <h2>${titel(tag.datum)}</h2>
      <p class="feld">Manuel weg mit</p>
      ${wahl('auto', [['kia', 'Kia'], ['rav', 'RAV'], ['keines', 'kein Auto']], a.auto === 'offen' ? 'keines' : a.auto)}
      <label class="zeile"><input type="checkbox" id="ganz"${ganz ? ' checked' : ''}> ganzer Tag</label>
      <div class="zeile zeiten"${ganz ? ' hidden' : ''}>
        <label>von ${stunden('von', 0, 23, ganz ? 7 : a.von)}</label>
        <label>bis ${stunden('bis', 1, 24, ganz ? 17 : a.bis)}</label>
      </div>
      <p class="fehler" id="fehler" aria-live="polite"></p>
      <div class="knoepfe">
        <button type="button" id="loeschen" class="leise">Löschen</button>
        <span class="platz"></span>
        <button type="button" id="abbrechen" class="leise">Abbrechen</button>
        <button type="button" id="speichern" class="laut">Speichern</button>
      </div>
    </form>`;
  const lese = () => {
    const auto = el.querySelector('[data-wahl="auto"] [aria-pressed="true"]').dataset.wert;
    if (el.querySelector('#ganz').checked) return { auto, von: null, bis: null };
    return { auto, von: Number(el.querySelector('#von').value), bis: Number(el.querySelector('#bis').value) };
  };
  const pruefe = () => {
    const f = pruefeAbwesenheit(lese());
    el.querySelector('#fehler').textContent = f ?? '';
    el.querySelector('#speichern').disabled = !!f;
  };
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-wert]');
    if (b) {
      b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
      pruefe();
    }
  });
  el.querySelector('#ganz').addEventListener('change', (e) => {
    el.querySelector('.zeiten').hidden = e.target.checked;
    pruefe();
  });
  el.querySelector('#von').addEventListener('change', pruefe);
  el.querySelector('#bis').addEventListener('change', pruefe);
  el.querySelector('#speichern').addEventListener('click', () => { if (!pruefeAbwesenheit(lese())) onSave(lese()); });
  el.querySelector('#loeschen').addEventListener('click', () => onSave(null));
  el.querySelector('#abbrechen').addEventListener('click', onClose);
  pruefe();
  el.showModal();
}

/** Blatt «Hunderunde». onSave(person, von). */
export function blattRunde(tag, slot, onSave, onClose) {
  const r = tag[slot];
  const el = document.getElementById('blatt');
  const name = slot === 'morgen' ? 'Hunde am Morgen' : 'Hunde am Nachmittag';
  el.innerHTML = `
    <form method="dialog" class="blattinhalt">
      <h2>${titel(tag.datum)}</h2>
      <p class="feld">${name}</p>
      ${wahl('person', [['M', 'Manuel'], ['S', 'Svenja']], r.person)}
      <div class="zeile"><label>ab ${stunden('von', 4, 21, r.von)} Uhr</label></div>
      <div class="knoepfe">
        <span class="platz"></span>
        <button type="button" id="abbrechen" class="leise">Abbrechen</button>
        <button type="button" id="speichern" class="laut">Speichern</button>
      </div>
    </form>`;
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-wert]');
    if (!b) return;
    b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    el.querySelector('#von').value = STANDARD[slot][b.dataset.wert][0];
  });
  el.querySelector('#speichern').addEventListener('click', () => {
    const person = el.querySelector('[data-wahl="person"] [aria-pressed="true"]').dataset.wert;
    onSave(person, Number(el.querySelector('#von').value));
  });
  el.querySelector('#abbrechen').addEventListener('click', onClose);
  el.showModal();
}
