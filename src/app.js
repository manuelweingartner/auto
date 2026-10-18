// Start, Geheimnis, Ansicht, Woche, Verdrahtung von Raster, Blättern und Speicher.
import { loeseTag, wocheAb, tagSchluessel, datumAus, docMitAbwesenheit, docMitRunde } from './regeln.js';
import { rasterHtml } from './raster.js';
import { blattAbwesend, blattRunde } from './blatt.js';
import { beobachteWoche, schreibeTeil, loescheTag } from './speicher.js';

const MONATE = ['Jan.', 'Feb.', 'März', 'April', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];

function lesSpeicher(k) { try { return localStorage.getItem(k); } catch { return null; } }
function schreibSpeicher(k, v) { try { localStorage.setItem(k, v); } catch { /* privates Fenster o.ä. */ } }

function geheimnis() {
  const ausLink = location.hash.replace(/^#/, '').trim();
  if (/^[a-z0-9]{20,}$/.test(ausLink)) { schreibSpeicher('auto-hunde-geheim', ausLink); return ausLink; }
  return lesSpeicher('auto-hunde-geheim');
}

const state = {
  geheim: geheimnis(),
  ansicht: lesSpeicher('auto-hunde-ansicht') === 'autos' ? 'autos' : 'alle',
  start: new Date(),
  heute: tagSchluessel(new Date()),
  docs: null, // null: noch kein Snapshot für diese Woche
  stop: null,
};

const $ = (s) => document.querySelector(s);

function wochenTitel(datums) {
  const a = new Date(datums[0] + 'T12:00'); const b = new Date(datums[6] + 'T12:00');
  const m = a.getMonth() === b.getMonth() ? `${MONATE[a.getMonth()]}` : `${MONATE[a.getMonth()]} / ${MONATE[b.getMonth()]}`;
  return `${a.getDate()}. bis ${b.getDate()}. ${m}`;
}

function zeichne() {
  const datums = wocheAb(state.start);
  const docs = state.docs ?? {};
  const tage = datums.map((d) => loeseTag(d, docs[d]));
  $('#woche').textContent = wochenTitel(datums);
  $('#raster').innerHTML = rasterHtml(tage, state.ansicht, state.heute);
  $('#raster .raster').classList.toggle('laedt', state.docs === null);
  document.querySelectorAll('[data-ansicht]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.ansicht === state.ansicht));
}

function abonniere() {
  if (state.stop) state.stop();
  const datums = wocheAb(state.start);
  state.docs = null;
  zeichne();
  state.stop = beobachteWoche(state.geheim, datums, (docs) => {
    state.docs = docs;
    $('#meldung').hidden = true;
    zeichne();
  }, (e) => {
    console.error(e);
    $('#meldung').textContent = 'Keine Verbindung zum Speicher. Ist der Link vollständig?';
    $('#meldung').hidden = false;
  });
}

function tagVon(datum) { return loeseTag(datum, state.docs[datum]); }

function schliesse() { $('#blatt').close(); }

// Blatt sofort schliessen: Firestore zeigt die Änderung lokal sofort und schickt sie nach,
// sobald Netz da ist. Nur eine Ablehnung des Servers wird gemeldet.
function speichere(p) {
  schliesse();
  p.catch((e) => {
    console.error(e);
    $('#meldung').textContent = 'Speichern hat nicht geklappt. Bitte nochmals versuchen.';
    $('#meldung').hidden = false;
  });
}

function start() {
  if (!state.geheim) {
    $('#meldung').textContent = 'Dieser Link ist unvollständig. Bitte den Link von Manuel neu öffnen.';
    $('#meldung').hidden = false;
    $('#inhalt').hidden = true;
    return;
  }
  $('#zurueck').addEventListener('click', () => { state.start.setDate(state.start.getDate() - 7); abonniere(); });
  $('#vor').addEventListener('click', () => { state.start.setDate(state.start.getDate() + 7); abonniere(); });
  $('#heute').addEventListener('click', () => { state.start = new Date(); abonniere(); });
  document.querySelectorAll('[data-ansicht]').forEach((b) => b.addEventListener('click', () => {
    state.ansicht = b.dataset.ansicht; schreibSpeicher('auto-hunde-ansicht', state.ansicht); zeichne();
  }));
  $('#raster').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tag]');
    if (!b) return;
    const datum = b.dataset.tag;
    if (b.dataset.slot) {
      blattRunde(tagVon(datum), b.dataset.slot, (person, von) => speichere(schreibeTeil(state.geheim, datum, docMitRunde(b.dataset.slot, person, von))), schliesse);
    } else {
      blattAbwesend(tagVon(datum), (a) => speichere(a === null ? loescheTag(state.geheim, datum) : schreibeTeil(state.geheim, datum, docMitAbwesenheit(a))), schliesse, b.dataset.auto);
    }
  });
  // Seite blieb über Mitternacht offen (Startbildschirm): Heute-Markierung und Startwoche nachziehen.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const heute = tagSchluessel(new Date());
    if (heute === state.heute) return;
    const zeigteHeute = wocheAb(state.start)[0] === wocheAb(datumAus(state.heute))[0];
    state.heute = heute;
    if (zeigteHeute) { state.start = new Date(); abonniere(); } else zeichne();
  });
  abonniere();
}

start();
