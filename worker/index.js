// Cloudflare Worker: liefert die drei Kalender live aus Firestore, bei jedem Abruf frisch.
// Ersetzt den Umweg über GitHub Action und Gist (bis 15 Minuten Verzögerung). Es bleibt
// nur das Abfrage-Intervall des Kalenders selbst (Cozi etwa stündlich).
// Adresse: https://<worker>/<geheim>/auto-hunde-{hunde,manuel,rav}.ics
// Das Geheimnis liegt als Worker-Secret GEHEIM, nie im Code.
import { ladeDocs, tageImFenster, dateien } from '../scripts/ics-export.js';
import { firebaseConfig } from '../src/firebase-config.js';

// auto-hunde.ics ist der Sammelkalender nur für Manuel (nicht im Zahnrad, Wunsch 19.10.2026).
const DATEIEN = ['auto-hunde-hunde.ics', 'auto-hunde-manuel.ics', 'auto-hunde-rav.ics', 'auto-hunde.ics'];

/** '/<geheim>/<datei>' -> Dateiname oder null. Ein leeres Geheimnis passt nie. */
export function deuteWeg(pfad, geheim) {
  if (!geheim) return null;
  const teile = pfad.split('/');
  if (teile.length !== 3 || teile[0] !== '' || teile[1] !== geheim) return null;
  return DATEIEN.includes(teile[2]) ? teile[2] : null;
}

export async function antwort(request, env, fetchFn = fetch, jetzt = new Date()) {
  const datei = deuteWeg(new URL(request.url).pathname, env.GEHEIM);
  if (!datei) return new Response('Nicht gefunden', { status: 404 });
  let docs;
  try {
    docs = await ladeDocs(firebaseConfig.projectId, firebaseConfig.apiKey, env.GEHEIM, fetchFn);
  } catch (e) {
    console.error(e);
    return new Response('Firestore nicht erreichbar', { status: 502 });
  }
  const ics = dateien(tageImFenster(jetzt, docs), jetzt)[datei];
  return new Response(ics, {
    status: 200,
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      // Kurz cachen, damit Cozi, iOS und Outlook Firestore nicht im Sekundentakt lesen.
      'cache-control': 'public, max-age=60',
    },
  });
}

export default { fetch: (request, env) => antwort(request, env) };
