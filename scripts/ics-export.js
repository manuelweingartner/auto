// Liest alle Tage per Firestore-REST, baut das ICS und schreibt es ins geheime Gist.
// Läuft in der GitHub Action (Node 20, nur fetch). Umgebung: AUTO_HUNDE_GEHEIM, GIST_TOKEN, GIST_ID.
import { loeseTag, tagSchluessel } from '../src/regeln.js';
import { baueIcs } from '../src/ics.js';
import { firebaseConfig } from '../src/firebase-config.js';

function wert(v) {
  if ('nullValue' in v) return null;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('mapValue' in v) return felder(v.mapValue.fields ?? {});
  if ('arrayValue' in v) return (v.arrayValue.values ?? []).map(wert);
  return null;
}

function felder(f) {
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, wert(v)]));
}

export async function ladeDocs(projektId, apiKey, geheim, fetchFn = fetch) {
  const basis = `https://firestore.googleapis.com/v1/projects/${projektId}/databases/(default)/documents/h/${geheim}/tage`;
  const docs = {};
  let token = '';
  do {
    const url = `${basis}?pageSize=300&key=${apiKey}${token ? `&pageToken=${encodeURIComponent(token)}` : ''}`;
    const r = await fetchFn(url);
    if (!r.ok) throw new Error(`Firestore antwortet mit HTTP ${r.status}`);
    const json = await r.json();
    for (const d of json.documents ?? []) docs[d.name.split('/').pop()] = felder(d.fields ?? {});
    token = json.nextPageToken ?? '';
  } while (token);
  return docs;
}

/** 28 Tage zurück und voraus bis zum 31.12. des nächsten Jahres (Wunsch Manuel 18.10.2026),
 *  damit jeder vorbelegte Mittwoch schon im Kalender steht. */
export function tageImFenster(heute, docs) {
  const tage = [];
  const ende = new Date(heute.getFullYear() + 1, 11, 31, 12);
  for (let i = -28; ; i++) {
    const d = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate() + i, 12);
    if (d > ende) break;
    if (d.getDay() === 0 || d.getDay() === 6) continue; // kein Wochenende, wie auf der Seite
    const k = tagSchluessel(d);
    tage.push(loeseTag(k, docs[k]));
  }
  return tage;
}

export function ohneStempel(ics) {
  return ics.split('\r\n').filter((z) => !z.startsWith('DTSTAMP:')).join('\r\n');
}

/** Die drei Kalenderdateien des Gists: Svenjas Hunderunden und Manuels Abwesenheiten
 *  (je ein Cozi-Kalender pro Person) sowie nur RAV für die Eltern. */
export function dateien(tage, jetzt) {
  return {
    'auto-hunde-hunde.ics': baueIcs(tage, jetzt, { nurHunde: true }),
    'auto-hunde-manuel.ics': baueIcs(tage, jetzt, { nurManuel: true }),
    'auto-hunde-rav.ics': baueIcs(tage, jetzt, { nurRav: true }),
  };
}

async function haupt() {
  const { AUTO_HUNDE_GEHEIM: geheim, GIST_TOKEN: token, GIST_ID: gistId } = process.env;
  for (const [n, v] of [['AUTO_HUNDE_GEHEIM', geheim], ['GIST_TOKEN', token], ['GIST_ID', gistId]]) {
    if (!v) { console.error(`Umgebungsvariable ${n} fehlt.`); process.exit(1); }
  }
  const docs = await ladeDocs(firebaseConfig.projectId, firebaseConfig.apiKey, geheim);
  const neuDateien = dateien(tageImFenster(new Date(), docs), new Date());
  const kopf = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
  const alt = await fetch(`https://api.github.com/gists/${gistId}`, { headers: kopf });
  if (!alt.ok) { console.error(`Gist lesen: HTTP ${alt.status}`); process.exit(1); }
  const bisher = (await alt.json()).files ?? {};
  const files = {};
  for (const [name, ics] of Object.entries(neuDateien)) {
    if (ohneStempel(bisher[name]?.content ?? '') !== ohneStempel(ics)) files[name] = { content: ics };
  }
  if (Object.keys(files).length === 0) { console.log('Unverändert, kein Schreiben.'); return; }
  const neu = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH', headers: { ...kopf, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  if (!neu.ok) { console.error(`Gist schreiben: HTTP ${neu.status}`); process.exit(1); }
  for (const [name, f] of Object.entries(files)) console.log(`Geschrieben: ${name}, ${f.content.match(/BEGIN:VEVENT/g)?.length ?? 0} Termine.`);
}

// Im Cloudflare Worker gibt es kein process; dort werden nur die Funktionen importiert.
if (typeof process !== 'undefined' && process.argv?.[1]?.replace(/\\/g, '/').endsWith('/scripts/ics-export.js')) {
  haupt().catch((e) => { console.error(e); process.exit(1); });
}
