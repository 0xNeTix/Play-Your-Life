/* ============================================================================
   Persistance multi-profils.

   L'application ne parle qu'à `Store`. `Store` délègue à un ADAPTATEUR qui sait
   où ranger les données. Aujourd'hui : LocalAdapter (navigateur). Demain, pour
   jouer entre amis sur plusieurs appareils, il suffira d'écrire un adaptateur
   serveur avec la même interface (voir js/storage-remote.example.js) et
   d'appeler Store.use(MonAdaptateur) avant App.init().

   Interface d'un adaptateur (toutes les méthodes renvoient des Promises) :
     listProfiles()                -> [{ id, name, createdAt }]
     loadState(profileId)          -> state | null
     saveState(profileId, state)
     deleteProfile(profileId)
     putPhoto(profileId, id, dataUrl) / getPhoto(id) / delPhoto(id)
     allPhotos(profileId)          -> [{ id, profileId, dataUrl }]
   ========================================================================== */

const SCHEMA_VERSION = 2;

const LocalAdapter = (() => {
  const REG = 'pyl.profiles';
  const ST = id => `pyl.state.${id}`;
  const readJSON = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };

  let dbp = null;
  function db() {
    if (!dbp) {
      dbp = new Promise((res, rej) => {
        const r = indexedDB.open('rpgirl', 2);
        r.onupgradeneeded = ev => {
          const d = r.result;
          const store = ev.oldVersion < 1 ? d.createObjectStore('photos', { keyPath: 'id' }) : r.transaction.objectStore('photos');
          if (!store.indexNames.contains('profileId')) store.createIndex('profileId', 'profileId');
        };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
    }
    return dbp;
  }
  function tx(mode, fn) {
    return db().then(d => new Promise((res, rej) => {
      const t = d.transaction('photos', mode);
      let out;
      const req = fn(t.objectStore('photos'));
      if (req) req.onsuccess = () => { out = req.result; };
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
    }));
  }

  return {
    async listProfiles() { return readJSON(REG, []); },
    async loadState(id) { return readJSON(ST(id), null); },
    async saveState(id, state) {
      localStorage.setItem(ST(id), JSON.stringify(state));
      const reg = readJSON(REG, []);
      const entry = { id, name: state.profile?.name || '?', createdAt: state.profile?.createdAt || Date.now() };
      const i = reg.findIndex(p => p.id === id);
      if (i >= 0) reg[i] = entry; else reg.push(entry);
      localStorage.setItem(REG, JSON.stringify(reg));
    },
    async deleteProfile(id) {
      localStorage.removeItem(ST(id));
      localStorage.setItem(REG, JSON.stringify(readJSON(REG, []).filter(p => p.id !== id)));
      const photos = await this.allPhotos(id);
      for (const p of photos) await this.delPhoto(p.id);
    },
    putPhoto: (profileId, id, dataUrl) => tx('readwrite', s => s.put({ id, profileId, dataUrl })),
    getPhoto: id => tx('readonly', s => s.get(id)).then(r => (r ? r.dataUrl : null)),
    delPhoto: id => tx('readwrite', s => s.delete(id)),
    allPhotos: profileId => tx('readonly', s => (profileId ? s.index('profileId').getAll(profileId) : s.getAll())).then(r => r || []),
    /* Préférences propres à l'appareil (pas synchronisées) */
    getActive() { try { return localStorage.getItem('pyl.active'); } catch (e) { return null; } },
    setActive(id) { try { id ? localStorage.setItem('pyl.active', id) : localStorage.removeItem('pyl.active'); } catch (e) { /* rien */ } },
  };
})();

const Store = (() => {
  let adapter = LocalAdapter;
  let saveTimer = null;

  const fresh = () => ({
    version: SCHEMA_VERSION,
    id: null,
    profile: null,            // { name, proDomain, proDomainName, createdAt }
    settings: { theme: 'auto', squatUnit: 'reps', runTest: 'cooper', weeklyGoal: 3, sound: true },
    xpLog: [],                // { id, ts, domain, amount, reason, ref? }
    sport: { tests: [], checkins: [], sessions: [], runs: [], goalWeeks: {} },
    pro: { quiz: {}, achievements: [] },
    intel: { books: [], sessions: [] },
    missions: {},             // missionId -> { ts, note }
    quests: {},               // dayKey -> [ { id, text, domain, xp, done, doneTs } ]
    bosses: {},               // weekKey -> { text, domain, done, doneTs, note }
    rewards: [],              // { id, domain, level, text, claimedTs }
    npc: { arcs: {}, encounters: {}, lastTs: 0, titles: [] },
    cosmetics: { seen: null }, // objets d'avatar déjà annoncés
    friends: [],              // cartes de joueurs importées
  });

  /* Complète un état ancien avec les champs récents */
  function migrate(raw) {
    const d = fresh();
    const s = Object.assign(d, raw);
    for (const k of ['settings', 'sport', 'pro', 'intel', 'npc', 'cosmetics']) s[k] = Object.assign(fresh()[k], raw[k] || {});
    s.version = SCHEMA_VERSION;
    return s;
  }

  /* Reprise des données de la première version (un seul profil) */
  async function migrateV1() {
    let raw = null;
    try { raw = localStorage.getItem('rpgirl.state.v1'); } catch (e) { return; }
    if (!raw) return;
    try {
      const old = JSON.parse(raw);
      if (old.profile) {
        const s = migrate(old);
        s.id = U.uid();
        await adapter.saveState(s.id, s);
        adapter.setActive(s.id);
        const photos = await adapter.allPhotos();
        for (const p of photos) if (!p.profileId) await adapter.putPhoto(s.id, p.id, p.dataUrl);
      }
      localStorage.setItem('rpgirl.state.v1.backup', raw);
      localStorage.removeItem('rpgirl.state.v1');
    } catch (e) {
      console.error('Migration v1 impossible', e);
    }
  }

  return {
    use(a) { adapter = a; },
    fresh,
    migrate,
    async init() {
      await migrateV1();
      const id = adapter.getActive();
      if (id) {
        const s = await adapter.loadState(id);
        if (s) return migrate(s);
      }
      const list = await adapter.listProfiles();
      if (list.length) {
        adapter.setActive(list[0].id);
        const s = await adapter.loadState(list[0].id);
        if (s) return migrate(s);
      }
      return fresh();
    },
    async loadProfile(id) {
      const s = await adapter.loadState(id);
      if (!s) return null;
      adapter.setActive(id);
      return migrate(s);
    },
    /* Lecture seule d'un autre profil (classement de la guilde) */
    peekProfile: id => adapter.loadState(id),
    listProfiles: () => adapter.listProfiles(),
    setActive: id => adapter.setActive(id),
    /* Sauvegarde différée : regroupe les écritures rapprochées */
    save(state, immediate = false) {
      if (!state.id) return;
      clearTimeout(saveTimer);
      const run = () => adapter.saveState(state.id, state).catch(e => alert('Sauvegarde impossible : ' + e.message));
      if (immediate) return run();
      saveTimer = setTimeout(run, 150);
    },
    async deleteProfile(id) { await adapter.deleteProfile(id); if (adapter.getActive() === id) adapter.setActive(null); },
    putPhoto: (state, id, dataUrl) => adapter.putPhoto(state.id, id, dataUrl),
    getPhoto: id => adapter.getPhoto(id),
    delPhoto: id => adapter.delPhoto(id),
    allPhotos: state => adapter.allPhotos(state.id),
  };
})();
