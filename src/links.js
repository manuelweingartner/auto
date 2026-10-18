// Abo-Adressen aus der Gist-Basis. Reine Funktion, testbar in Node.

const DATEI = { alle: 'auto-hunde.ics', rav: 'auto-hunde-rav.ics' };

function dreifach(https) {
  return {
    https,
    webcal: https.replace(/^https:\/\//, 'webcal://'),
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(https)}`,
  };
}

/** basis: Raw-Adresse des Gists ohne Dateinamen, z.B. https://gist.githubusercontent.com/<user>/<id>/raw */
export function aboLinks(basis) {
  const b = basis.replace(/\/+$/, '');
  return {
    alle: dreifach(`${b}/${DATEI.alle}`),
    rav: dreifach(`${b}/${DATEI.rav}`),
  };
}
