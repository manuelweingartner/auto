# Schreibt firestore.rules aus der Vorlage plus Geheimnis und deployt sie.
# firestore.rules ist gitignored, weil das Geheimnis darin steht.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$geheim = (Get-Content (Join-Path $repo '.secrets\geheim.txt') -Raw).Trim()
if ($geheim.Length -lt 20) { throw 'Geheimnis fehlt oder ist zu kurz (.secrets\geheim.txt).' }
$vorlage = Get-Content (Join-Path $repo 'firestore.rules.vorlage') -Raw
[IO.File]::WriteAllText((Join-Path $repo 'firestore.rules'), $vorlage.Replace('__GEHEIM__', $geheim))

$env:GOOGLE_APPLICATION_CREDENTIALS = ''
$env:Path = "C:\Users\MWE\node20-portable;$env:Path"
Push-Location $repo
try {
  & "$env:APPDATA\npm\firebase.cmd" deploy --only firestore:rules --project auto-hunde --non-interactive
} finally {
  Pop-Location
}
