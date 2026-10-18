// Selbstaktualisierung: Safari und die Startbildschirm-App laden eine offene Seite nie neu,
// und Pages liefert jede Datei mit zehn Minuten Browser-Cache. Die Seite merkt sich die
// Fassung aus version.txt beim Start, prüft sie beim Zurückkommen und jede Minute am Cache
// vorbei; weicht sie ab, holt sie alle Dateien frisch und lädt sich neu.

/** Alles, was der Browser cachen könnte. Ein Test prüft die Liste gegen src/. */
export const DATEIEN = [
  'index.html', 'style.css',
  'src/app.js', 'src/blatt.js', 'src/firebase-config.js', 'src/ics.js', 'src/links.js',
  'src/log.js', 'src/raster.js', 'src/regeln.js', 'src/speicher.js', 'src/version.js',
];

/** geladen: Fassung beim Start, aktuell: Fassung jetzt auf dem Server, blattOffen: ein Dialog ist offen. */
export function mussNeuLaden(geladen, aktuell, blattOffen) {
  if (!geladen || !aktuell || blattOffen) return false;
  return geladen !== aktuell;
}

/** Holt version.txt am Cache vorbei; null bei Fehler oder offline. */
export async function ladeVersion(fetchFn = fetch) {
  try {
    const r = await fetchFn('version.txt', { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.text()).trim();
  } catch (err) {
    console.error(err);
    return null;
  }
}

/** Erneuert den Cache-Eintrag jeder Datei, damit das folgende reload() den neuen Stand nimmt. */
export async function frischLaden(fetchFn = fetch) {
  const ergebnisse = await Promise.allSettled(DATEIEN.map((f) => fetchFn(f, { cache: 'reload' })));
  for (const e of ergebnisse) if (e.status === 'rejected') console.error(e.reason);
}
