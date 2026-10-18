// Selbstaktualisierung: Safari und die Startbildschirm-App laden eine offene Seite nie neu.
// Die Seite merkt sich die Fassung aus version.txt beim Start und vergleicht sie beim
// Zurückkommen; weicht sie ab, lädt sie sich neu.

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
