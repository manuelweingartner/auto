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

export function tageImFenster(heute, docs) {
  const tage = [];
  for (let i = -28; i <= 56; i++) {
    const d = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate() + i, 12);
    const k = tagSchluessel(d);
    tage.push(loeseTag(k, docs[k]));
  }
  return tage;
}

export function ohneStempel(ics) {
  return ics.split('\r\n').filter((z) => !z.startsWith('DTSTAMP:')).join('\r\n');
}

async function haupt() {
  const { AUTO_HUNDE_GEHEIM: geheim, GIST_TOKEN: token, GIST_ID: gistId } = process.env;
  for (const [n, v] of [['AUTO_HUNDE_GEHEIM', geheim], ['GIST_TOKEN', token], ['GIST_ID', gistId]]) {
    if (!v) { console.error(`Umgebungsvariable ${n} fehlt.`); process.exit(1); }
  }
  const docs = await ladeDocs(firebaseConfig.projectId, firebaseConfig.apiKey, geheim);
  const ics = baueIcs(tageImFenster(new Date(), docs), new Date());
  const kopf = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };
  const alt = await fetch(`https://api.github.com/gists/${gistId}`, { headers: kopf });
  if (!alt.ok) { console.error(`Gist lesen: HTTP ${alt.status}`); process.exit(1); }
  const bisher = (await alt.json()).files?.['auto-hunde.ics']?.content ?? '';
  if (ohneStempel(bisher) === ohneStempel(ics)) { console.log('Unverändert, kein Schreiben.'); return; }
  const neu = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH', headers: { ...kopf, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: { 'auto-hunde.ics': { content: ics } } }),
  });
  if (!neu.ok) { console.error(`Gist schreiben: HTTP ${neu.status}`); process.exit(1); }
  console.log(`Geschrieben: ${ics.match(/BEGIN:VEVENT/g)?.length ?? 0} Termine.`);
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('/scripts/ics-export.js')) {
  haupt().catch((e) => { console.error(e); process.exit(1); });
}
