/* Persistance : état en localStorage, photos en IndexedDB (tout reste sur l'appareil) */
const Store = (() => {
  const KEY = 'rpgirl.state.v1';

  const defaults = () => ({
    version: 1,
    profile: null,            // { name, proDomain, proDomainName, createdAt }
    settings: { theme: 'auto', squatUnit: 'reps' },
    xpLog: [],                // { id, ts, domain, amount, reason }
    sport: { tests: [], checkins: [] },
    pro: { quiz: {}, achievements: [] },
    intel: { books: [], sessions: [] },
    missions: {},             // missionId -> { ts, note }
    quests: {},               // dayKey -> [ { id, text, domain, done, doneTs } ]
    bosses: {},               // weekKey -> { text, domain, done, doneTs, note }
    rewards: [],              // { id, domain, level, text, claimedTs }
  });

  function load() {
    let s = defaults();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const d = defaults();
        s = Object.assign(d, parsed);
        for (const k of ['settings', 'sport', 'pro', 'intel']) s[k] = Object.assign(d[k], parsed[k] || {});
      }
    } catch (e) {
      console.error('Lecture de la sauvegarde impossible', e);
    }
    return s;
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      alert('Sauvegarde impossible : ' + e.message);
      return false;
    }
  }

  function wipe() {
    try { localStorage.removeItem(KEY); } catch (e) { /* rien */ }
  }

  /* ---------- Photos (IndexedDB) ---------- */
  let dbp = null;
  function db() {
    if (!dbp) {
      dbp = new Promise((res, rej) => {
        const r = indexedDB.open('rpgirl', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    }
    return dbp;
  }
  function tx(mode, fn) {
    return db().then(d => new Promise((res, rej) => {
      const t = d.transaction('photos', mode);
      const store = t.objectStore('photos');
      let out;
      const req = fn(store);
      if (req) req.onsuccess = () => { out = req.result; };
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
    }));
  }
  const putPhoto = (id, dataUrl) => tx('readwrite', s => s.put({ id, dataUrl }));
  const getPhoto = id => tx('readonly', s => s.get(id)).then(r => (r ? r.dataUrl : null));
  const delPhoto = id => tx('readwrite', s => s.delete(id));
  const allPhotos = () => tx('readonly', s => s.getAll()).then(r => r || []);
  const clearPhotos = () => tx('readwrite', s => s.clear());

  return { load, save, wipe, defaults, putPhoto, getPhoto, delPhoto, allPhotos, clearPhotos };
})();
