// Firestore-Zugriff. Pfad: h/{geheim}/tage/{YYYY-MM-DD}. Schreiben immer feldweise (merge).
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, query, where, documentId, onSnapshot, setDoc, deleteField,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

// Lokaler Zwischenspeicher: Schreibvorgänge bei schlechtem Empfang überleben das Schliessen der App.
const db = initializeFirestore(initializeApp(firebaseConfig), {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
const tage = (geheim) => collection(db, 'h', geheim, 'tage');

export function beobachteWoche(geheim, datums, rueckruf, fehler) {
  const q = query(tage(geheim), where(documentId(), 'in', datums));
  return onSnapshot(q, (snap) => {
    const docs = {};
    snap.forEach((d) => { docs[d.id] = d.data(); });
    rueckruf(docs);
  }, fehler);
}

export function schreibeTeil(geheim, datum, teil) {
  return setDoc(doc(tage(geheim), datum), teil, { merge: true });
}

export function loescheTag(geheim, datum) {
  return setDoc(doc(tage(geheim), datum), { abwesend: null, morgen: deleteField(), nachmittag: deleteField() }, { merge: true });
}
