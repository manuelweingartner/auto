// Abo-Adressen aus der Gist-Basis. Reine Funktion, testbar in Node.
// Drei Kalender: zwei für Cozi (je eine Person), einer für die Eltern (iPhone).

const DATEI = { hunde: 'auto-hunde-hunde.ics', manuel: 'auto-hunde-manuel.ics', rav: 'auto-hunde-rav.ics' };

function zweifach(https) {
  return { https, webcal: https.replace(/^https:\/\//, 'webcal://') };
}

/** basis: Raw-Adresse des Gists ohne Dateinamen, z.B. https://gist.githubusercontent.com/<user>/<id>/raw */
export function aboLinks(basis) {
  const b = basis.replace(/\/+$/, '');
  return Object.fromEntries(Object.entries(DATEI).map(([k, name]) => [k, zweifach(`${b}/${name}`)]));
}
