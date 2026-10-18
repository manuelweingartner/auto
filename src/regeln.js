// Fachlogik: Hunderunden, Abwesenheit, Mittwoch-Vorbelegung. Läuft im Browser und in Node.

/**
 * @typedef {{auto:'kia'|'rav'|'keines'|'offen', von:number|null, bis:number|null}} Abwesenheit
 * @typedef {{person:'M'|'S', von:number, bis:number, quelle:'standard'|'vorschlag'|'hand'}} Runde
 * @typedef {{abwesend?:Abwesenheit|null, morgen?:Runde, nachmittag?:Runde}} TagDoc
 * @typedef {{datum:string, abwesend:Abwesenheit|null, morgen:Runde, nachmittag:Runde}} Tag
 */

export const STANDARD = {
  morgen: { M: [6, 7], S: [8, 9] },
  nachmittag: { M: [16, 17], S: [16, 17] },
};

const MITTWOCH_VORBELEGUNG = { auto: 'offen', von: null, bis: null };

const zweistellig = (n) => String(n).padStart(2, '0');

export function tagSchluessel(d) {
  return `${d.getFullYear()}-${zweistellig(d.getMonth() + 1)}-${zweistellig(d.getDate())}`;
}

export function datumAus(schluessel) {
  const [j, m, t] = schluessel.split('-').map(Number);
  return new Date(j, m - 1, t, 12);
}

export function wocheAb(d) {
  const montag = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  montag.setDate(montag.getDate() - ((montag.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(montag);
    x.setDate(montag.getDate() + i);
    return tagSchluessel(x);
  });
}

export function istMittwoch(schluessel) {
  return datumAus(schluessel).getDay() === 3;
}

function ueberschneidet(abwesend, [slotVon, slotBis]) {
  if (!abwesend) return false;
  if (abwesend.von == null || abwesend.bis == null) return true;
  return abwesend.von < slotBis && abwesend.bis > slotVon;
}

function runde(person, slot, quelle) {
  const [von, bis] = STANDARD[slot][person];
  return { person, von, bis, quelle };
}

// Ein verbogenes Dokument (falsche Person, keine Stunde) darf die Woche nicht leeren.
function gueltigeRunde(slot, r) {
  return !!r && r.quelle === 'hand' && !!STANDARD[slot][r.person] && Number.isInteger(r.von);
}

function gueltigeAbwesenheit(a) {
  return !!a && ['kia', 'rav', 'keines', 'offen'].includes(a.auto) && !pruefeAbwesenheit(a);
}

function loeseRunde(slot, abwesend, gespeichert) {
  if (gueltigeRunde(slot, gespeichert)) return { ...gespeichert, bis: gespeichert.von + 1 };
  if (ueberschneidet(abwesend, STANDARD[slot].M)) return runde('S', slot, 'vorschlag');
  return runde('M', slot, 'standard');
}

export function loeseTag(datum, doc) {
  // Kein Feld «abwesend» (kein Dokument oder nur Runden gespeichert): Mittwoch bleibt vorbelegt.
  // «abwesend: null» ist dagegen ein bewusstes Löschen.
  let abwesend;
  if (doc === undefined || !('abwesend' in doc)) abwesend = istMittwoch(datum) ? { ...MITTWOCH_VORBELEGUNG } : null;
  else abwesend = gueltigeAbwesenheit(doc.abwesend) ? doc.abwesend : null;
  return {
    datum,
    abwesend,
    morgen: loeseRunde('morgen', abwesend, doc?.morgen),
    nachmittag: loeseRunde('nachmittag', abwesend, doc?.nachmittag),
  };
}

export function pruefeAbwesenheit(a) {
  if (!['kia', 'rav', 'keines', 'offen'].includes(a.auto)) return 'Bitte ein Auto wählen.';
  if (a.von == null && a.bis == null) return null;
  if (!Number.isInteger(a.von) || !Number.isInteger(a.bis)) return 'Bitte von und bis wählen.';
  if (a.von < 0 || a.bis > 24) return 'Zeiten nur zwischen 0 und 24 Uhr.';
  if (a.von >= a.bis) return 'Das Ende muss nach dem Anfang liegen.';
  return null;
}

export function docMitAbwesenheit(a) {
  return { abwesend: a };
}

export function docMitRunde(slot, person, von) {
  return { [slot]: { person, von, bis: von + 1, quelle: 'hand' } };
}
