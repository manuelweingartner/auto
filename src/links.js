// Abo-Adressen aus der Gist-Basis. Reine Funktion, testbar in Node.
// Vier Kalender: zwei für Cozi (je eine Person), einer für die Eltern (iPhone),
// dazu der Sammelkalender mit allem für Manuel selbst (19.10.2026).

const DATEI = { hunde: 'auto-hunde-hunde.ics', manuel: 'auto-hunde-manuel.ics', rav: 'auto-hunde-rav.ics', alles: 'auto-hunde.ics' };

function zweifach(https) {
  return { https, webcal: https.replace(/^https:\/\//, 'webcal://') };
}

/** basis: Raw-Adresse des Gists ohne Dateinamen, z.B. https://gist.githubusercontent.com/<user>/<id>/raw */
export function aboLinks(basis) {
  const b = basis.replace(/\/+$/, '');
  return Object.fromEntries(Object.entries(DATEI).map(([k, name]) => [k, zweifach(`${b}/${name}`)]));
}
