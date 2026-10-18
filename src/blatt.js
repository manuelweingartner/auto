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

/** Blatt «Manuel weg». onSave(abwesend|null) bei Speichern, null heisst Tag löschen.
 *  vorwahl: das Auto der angetippten Zelle. Damit ist ein Autowechsel zwei Tipps:
 *  andere Autozelle antippen, Speichern. Zeiten bleiben. */
export function blattAbwesend(tag, onSave, onClose, vorwahl) {
  const a = { ...(tag.abwesend ?? { auto: 'keines', von: 7, bis: 17 }) };
  if (vorwahl) a.auto = vorwahl;
  const ganz = a.von == null;
  const el = document.getElementById('blatt');
  el.innerHTML = `
    <form method="dialog" class="blattinhalt">
      <h2>${titel(tag.datum)}</h2>
      <p class="feld">Manuel weg mit</p>
      ${wahl('auto', [['kia', 'Kia'], ['rav', 'RAV'], ['keines', 'kein Auto']], a.auto)}
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
    // Kein Knopf gedrückt heisst: Auto bleibt offen (Mittwoch-Vorbelegung), nicht «kein Auto».
    const gedrueckt = el.querySelector('[data-wahl="auto"] [aria-pressed="true"]');
    const auto = gedrueckt ? gedrueckt.dataset.wert : 'offen';
    if (el.querySelector('#ganz').checked) return { auto, von: null, bis: null };
    return { auto, von: Number(el.querySelector('#von').value), bis: Number(el.querySelector('#bis').value) };
  };
  const pruefe = () => {
    const f = pruefeAbwesenheit(lese());
    el.querySelector('#fehler').textContent = f ?? '';
    el.querySelector('#speichern').disabled = !!f;
  };
  // Listener am Formular, nicht am Dialog: das Formular wird bei jedem Öffnen neu gebaut.
  el.querySelector('form').addEventListener('click', (e) => {
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
  // Ende rutscht mit, wenn der Anfang darüber gesetzt wird, und umgekehrt.
  const von = el.querySelector('#von');
  const bis = el.querySelector('#bis');
  von.addEventListener('change', () => { if (Number(bis.value) <= Number(von.value)) bis.value = Math.min(24, Number(von.value) + 1); pruefe(); });
  bis.addEventListener('change', () => { if (Number(bis.value) <= Number(von.value)) von.value = Math.max(0, Number(bis.value) - 1); pruefe(); });
  el.querySelector('#speichern').addEventListener('click', () => { if (!pruefeAbwesenheit(lese())) onSave(lese()); });
  el.querySelector('#loeschen').addEventListener('click', () => onSave(null));
  el.querySelector('#abbrechen').addEventListener('click', onClose);
  pruefe();
  el.showModal();
}

/** Blatt «Hunderunde». onSave(person, von).
 *  Die andere Person ist vorgewählt, mit ihrer Standardzeit: ein Wechsel M/S ist zwei Tipps. */
export function blattRunde(tag, slot, onSave, onClose) {
  const r = tag[slot];
  const person = r.person === 'M' ? 'S' : 'M';
  const el = document.getElementById('blatt');
  const name = slot === 'morgen' ? 'Hunde am Morgen' : 'Hunde am Nachmittag';
  el.innerHTML = `
    <form method="dialog" class="blattinhalt">
      <h2>${titel(tag.datum)}</h2>
      <p class="feld">${name}, bisher ${r.person === 'M' ? 'Manuel' : 'Svenja'}</p>
      ${wahl('person', [['M', 'Manuel'], ['S', 'Svenja']], person)}
      <div class="knoepfe">
        <span class="platz"></span>
        <button type="button" id="abbrechen" class="leise">Abbrechen</button>
        <button type="button" id="speichern" class="laut">Speichern</button>
      </div>
    </form>`;
  el.querySelector('form').addEventListener('click', (e) => {
    const b = e.target.closest('[data-wert]');
    if (!b) return;
    b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  });
  el.querySelector('#speichern').addEventListener('click', () => {
    const person = el.querySelector('[data-wahl="person"] [aria-pressed="true"]').dataset.wert;
    // Startstunde ist die übliche der Person; sie wird gespeichert, aber nirgends angezeigt.
    onSave(person, STANDARD[slot][person][0]);
  });
  el.querySelector('#abbrechen').addEventListener('click', onClose);
  el.showModal();
}

const escAttr = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function linkZeile(l) {
  return `<div class="linkzeile">
      <a href="${escAttr(l.webcal)}">iPhone: abonnieren</a>
      <a href="${escAttr(l.google)}" target="_blank" rel="noopener">Android: Google Kalender</a>
      <button type="button" class="kopie" data-kopie="${escAttr(l.https)}">Adresse kopieren</button>
    </div>`;
}

/** Blatt «Einstellungen»: Name für den Log, Links zum Kopieren, Änderungsprotokoll.
 *  opts: { name, seite, links|null, logLaden: () => Promise<html> }, onName(name), onClose(). */
export function blattEinstellungen(opts, onName, onClose) {
  const el = document.getElementById('blatt');
  const abo = opts.links
    ? `<section class="abschnitt"><h3>Kalender «Autos und Hunde»</h3><p class="feld">Für Svenja, Cozi und Outlook.</p>${linkZeile(opts.links.alle)}</section>
       <section class="abschnitt"><h3>Kalender «nur RAV»</h3><p class="feld">Für die Eltern: nur Tage, an denen der RAV weg ist.</p>${linkZeile(opts.links.rav)}</section>`
    : '<p class="feld">Abo-Adresse ist nicht hinterlegt.</p>';
  el.innerHTML = `
    <form method="dialog" class="blattinhalt einstellungen">
      <h2>Einstellungen</h2>
      <section class="abschnitt">
        <label class="feld" for="name">Dein Name auf diesem Gerät (für das Protokoll)</label>
        <input type="text" id="name" value="${escAttr(opts.name ?? '')}" placeholder="z.B. Manuel" autocomplete="off">
      </section>
      <section class="abschnitt">
        <h3>Seite</h3>
        <div class="linkzeile"><button type="button" class="kopie" data-kopie="${escAttr(opts.seite)}">Link zur Seite kopieren</button></div>
      </section>
      ${abo}
      <section class="abschnitt"><h3>Änderungen</h3><div id="log"><p class="feld">Lade …</p></div></section>
      <div class="knoepfe"><span class="platz"></span><button type="button" id="schliessen" class="laut">Fertig</button></div>
    </form>`;
  el.querySelector('form').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-kopie]');
    if (!b) return;
    const alt = b.textContent;
    try {
      await navigator.clipboard.writeText(b.dataset.kopie);
      b.textContent = 'Kopiert';
    } catch (err) {
      console.error(err);
      window.prompt('Zum Kopieren markieren:', b.dataset.kopie);
    }
    setTimeout(() => { b.textContent = alt; }, 1500);
  });
  el.querySelector('#name').addEventListener('change', (e) => onName(e.target.value.trim()));
  el.querySelector('#schliessen').addEventListener('click', () => { onName(el.querySelector('#name').value.trim()); onClose(); });
  el.showModal();
  opts.logLaden().then((html) => { const z = el.querySelector('#log'); if (z) z.innerHTML = html; })
    .catch((err) => { console.error(err); const z = el.querySelector('#log'); if (z) z.innerHTML = '<p class="feld">Protokoll konnte nicht geladen werden.</p>'; });
}
