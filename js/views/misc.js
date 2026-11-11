/* Profil : titres, rangs, réglages, profils */
UI.titlesHtml = () => {
  const s = App.state;
  const name = d => (d === 'char' ? `${Icons.get('crown', 16)} Personnage` : `${GAME.domains[d].icon} ${GAME.domains[d].name}`);
  const titleRows = ['char', ...GAME.domainOrder].map(d => {
    const lv = Engine.levelOf(s, d);
    return `<div class="title-row ${d === 'char' ? '' : 'dom-' + d}"><span class="tr-d">${name(d)}</span><div class="tr-list">${GAME.titles[d].map(([l, t]) => `<span class="ttl ${lv >= l ? 'on' : ''} ${Engine.title(d, lv) === t ? 'cur' : ''}" title="Niveau ${l}">${U.esc(t)} <small>${l}</small></span>`).join('')}</div></div>`;
  }).join('');
  const rankRows = Engine.activeExercises(s).map(k => {
    const b = Engine.best(s, k);
    const idx = b == null ? -1 : Engine.rank(k, b).index;
    return `<div class="title-row"><span class="tr-d">${GAME.exercises[k].name}</span><div class="tr-list">${GAME.exercises[k].ranks.slice(1).map(([v, l], i) => `<span class="ttl ${idx >= i + 1 ? 'on' : ''} ${idx === i + 1 ? 'cur' : ''}">${l} <small>${Engine.fmtTest(k, v)}</small></span>`).join('')}</div></div>`;
  }).join('');
  const quest = s.npc.titles.length ? `<div class="title-row"><span class="tr-d">${Icons.get('quests', 16)} Quêtes</span><div class="tr-list">${s.npc.titles.map(t => `<span class="ttl on">${U.esc(t.title)}</span>`).join('')}</div></div>` : '';
  return `<section class="card"><div class="card-head"><h2>Titres</h2></div>${titleRows}${quest}</section>
    <section class="card"><div class="card-head"><h2>Rangs physiques</h2></div>${rankRows}</section>`;
};

/* ---------- Réglages ---------- */
Views.settings = {
  render() {
    const s = App.state;
    const sel = (name, cur, opts) => `<select name="${name}">${opts.map(([v, l]) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
    return `
      <header class="page-head"><p class="eyebrow">Réglages</p><h1>Personnage & données</h1></header>
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Ma carte de joueur</h2><span class="muted small">aperçu</span></div>
          <div class="pcard-wrap">${UI.playerCard(Engine.publicCard(s), { photoUrl: s.profile.display === 'photo' ? App.ppUrl : null })}</div>
          <p class="muted small">Sa couleur évolue avec ton niveau : Cuivre (1–3), Argent (4–6), Or (7–9), Rubis (10–14), Légende (15+). Ta photo n'apparaît sur ta carte partagée que si tu l'affiches et que tu l'autorises ci-dessous.</p>
        </div>
        <div class="card">
          <div class="card-head"><h2>Apparence</h2></div>
          <div class="look-pair">
            <figure>${Avatar.svg(s.profile.avatar, { size: 110, label: 'Avatar' })}<figcaption>Avatar</figcaption></figure>
            <figure>${App.ppUrl ? `<img class="pp-big" src="${App.ppUrl}" alt="Photo de profil">` : '<div class="pp-empty">Aucune photo</div>'}<figcaption>Photo</figcaption></figure>
          </div>
          <label>Afficher dans l'application
            <select data-change="ppDisplay">
              <option value="avatar" ${s.profile.display !== 'photo' ? 'selected' : ''}>Mon avatar</option>
              <option value="photo" ${s.profile.display === 'photo' ? 'selected' : ''} ${App.ppUrl ? '' : 'disabled'}>Ma photo de profil</option>
            </select>
          </label>
          <div class="btn-col" style="margin-top:12px">
            <a class="btn" href="#/avatar">Modifier mon avatar</a>
            <label class="btn">${App.ppUrl ? 'Changer de' : 'Ajouter une'} photo<input type="file" accept="image/*" data-change="ppChange" hidden></label>
            ${App.ppUrl ? '<button class="btn ghost" data-act="ppRemove">Retirer la photo</button>' : ''}
          </div>
        </div>
      </section>
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Profil</h2></div>
          <form data-form="settings" class="stack-form">
            <label>Nom<input name="name" value="${U.esc(s.profile.name)}" required maxlength="30"></label>
            <div class="row">
              <label>Taille (cm)<input name="height" type="number" min="120" max="230" value="${s.profile.height || ''}" required></label>
              <label>Poids actuel (kg)<input name="weight" type="number" min="30" max="300" step="0.1" value="${s.profile.weight || ''}" required></label>
            </div>
            <label>Domaine professionnel${sel('proDomain', s.profile.proDomain, [['it', 'Informatique'], ['other', 'Autre']])}</label>
            <label>Nom du domaine (si « Autre »)<input name="proDomainName" value="${s.profile.proDomain === 'other' ? U.esc(s.profile.proDomainName) : ''}" maxlength="40"></label>
            <div class="row">
              <label>Test de squat${sel('squatUnit', s.settings.squatUnit, [['reps', 'Répétitions max'], ['kg', 'Charge max (kg)']])}</label>
              <label>Test de course${sel('runTest', s.settings.runTest, [['cooper', 'Distance en 12 min'], ['pace5k', 'Rythme sur 5 km']])}</label>
            </div>
            <div class="row">
              <label>Séances par semaine<input name="weeklyGoal" type="number" min="1" max="14" value="${s.settings.weeklyGoal}" required></label>
              <label>Thème${sel('theme', s.settings.theme, [['auto', 'Système'], ['dark', 'Sombre'], ['light', 'Clair']])}</label>
              <label>Sons${sel('sound', s.settings.sound === false ? 'off' : 'on', [['on', 'Activés'], ['off', 'Coupés']])}</label>
            </div>
            <div class="row">
              <label>Photo sur ma carte partagée${sel('sharePhoto', s.settings.sharePhoto === false ? 'off' : 'on', [['on', 'Oui, si je l’affiche'], ['off', 'Non, avatar seulement']])}</label>
            </div>
            <button class="btn primary">Enregistrer</button>
          </form>
        </div>
        <div class="stack">
          <div class="card">
            <div class="card-head"><h2>Profils de cet appareil</h2></div>
            <p class="muted small">Chaque membre de la famille peut avoir son personnage sur le même navigateur. Tous apparaissent dans la Guilde.</p>
            <ul class="profiles" id="profiles"><li class="muted small">Chargement…</li></ul>
            <button class="btn" data-act="newProfile">＋ Créer un autre personnage</button>
          </div>
          <div class="card">
            <div class="card-head"><h2>Données</h2></div>
            <p class="muted small">Tout est stocké uniquement dans ce navigateur, photos comprises. Rien n'est envoyé sur internet. Exporte régulièrement pour ne rien perdre.</p>
            <div class="btn-col">
              <button class="btn" data-act="exportData">Exporter la sauvegarde de ce profil</button>
              <label class="btn">Importer une sauvegarde dans ce profil<input type="file" accept="application/json,.json" data-change="importData" hidden></label>
              <button class="btn danger" data-act="resetAll">Supprimer ce personnage</button>
            </div>
          </div>
        </div>
      </section>`;
  },
  async mount() {
    const el = document.getElementById('profiles');
    if (!el) return;
    const list = await Store.listProfiles();
    el.innerHTML = list.map(p => `<li class="${p.id === App.state.id ? 'current' : ''}">
      <span class="avatar xs">${U.esc((p.name || '?').charAt(0).toUpperCase())}</span><strong>${U.esc(p.name)}</strong>
      ${p.id === App.state.id ? '<span class="pill ok">Actif</span>' : `<button class="btn sm" data-act="switchProfile" data-id="${p.id}">Jouer</button>`}
    </li>`).join('');
  },
};

App.actions.switchProfile = el => App.switchProfile(el.dataset.id);
App.actions.ppDisplay = el => {
  App.state.profile.display = el.value === 'photo' && App.ppUrl ? 'photo' : 'avatar';
  App.commit();
};
App.actions.ppChange = async el => {
  const f = el.files && el.files[0];
  if (!f) return;
  try {
    const url = await U.squareImage(f);
    await Store.putPhoto(App.state, 'pp-' + App.state.id, url);
    App.state.profile.hasPhoto = true;
    App.state.profile.display = 'photo';
    App.ppUrl = url;
    App.toast('Photo de profil mise à jour.');
    App.commit();
  } catch (e) { App.toast('Photo illisible : ' + U.esc(e.message), 'warn'); }
};
App.actions.ppRemove = async () => {
  await Store.delPhoto('pp-' + App.state.id);
  App.state.profile.hasPhoto = false;
  App.state.profile.display = 'avatar';
  App.ppUrl = null;
  App.commit();
};
App.actions.newProfile = () => App.newProfile();

App.forms.settings = fd => {
  const s = App.state;
  s.profile.name = String(fd.get('name')).trim() || s.profile.name;
  const h = Math.round(Number(fd.get('height'))), w = Math.round(Number(String(fd.get('weight')).replace(',', '.')) * 10) / 10;
  if (h >= 120 && h <= 230) s.profile.height = h;
  if (w >= 30 && w <= 300 && w !== s.profile.weight) {
    s.profile.weight = w;
    s.profile.weightLog = [...(s.profile.weightLog || []), { ts: Date.now(), kg: w }];
  }
  s.profile.proDomain = fd.get('proDomain');
  s.profile.proDomainName = s.profile.proDomain === 'it' ? 'Informatique' : (String(fd.get('proDomainName') || '').trim() || 'Mon métier');
  s.settings.squatUnit = fd.get('squatUnit');
  s.settings.runTest = fd.get('runTest');
  s.settings.weeklyGoal = U.clamp(Math.round(Number(fd.get('weeklyGoal')) || 3), 1, 14);
  s.settings.theme = fd.get('theme');
  s.settings.sound = fd.get('sound') !== 'off';
  s.settings.sharePhoto = fd.get('sharePhoto') !== 'off';
  App.applyTheme();
  App.toast('Réglages enregistrés.');
  App.commit();
};

App.actions.exportData = async () => {
  const photos = await Store.allPhotos(App.state);
  const blob = new Blob([JSON.stringify({ app: 'play-your-life', exportedAt: Date.now(), state: App.state, photos })], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `play-your-life-${(App.state.profile.name || 'profil').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${U.dayKey()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

App.actions.importData = async el => {
  const f = el.files && el.files[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!['rpg-irl', 'play-your-life'].includes(data.app) || !data.state) throw new Error('Fichier non reconnu');
    if (!confirm(`Remplacer les données du profil « ${App.state.profile.name} » par cette sauvegarde ?`)) return;
    for (const p of await Store.allPhotos(App.state)) await Store.delPhoto(p.id);
    const st = Store.migrate(data.state);
    st.id = App.state.id;
    for (const p of data.photos || []) await Store.putPhoto(st, p.id, p.dataUrl);
    App.state = st;
    await App.save(true);
    App.applyTheme();
    App.toast('Sauvegarde importée.');
    App.go('#/home');
  } catch (e) {
    App.toast('Import impossible : ' + U.esc(e.message), 'warn');
  }
  el.value = '';
};

App.actions.resetAll = async () => {
  if (!confirm(`Supprimer définitivement le personnage « ${App.state.profile.name} », son historique et ses photos ? Cette action est irréversible.`)) return;
  await Store.deleteProfile(App.state.id);
  App.state.id = null; // empêche toute réécriture du profil supprimé
  const list = await Store.listProfiles();
  if (list.length) return App.switchProfile(list[0].id);
  App.state = Store.fresh();
  App._profilesCache = [];
  App.go('#/onboarding');
};

/* ---------- Profil : statistiques + réglages ---------- */
Views.profile = {
  render([tab = 'stats']) {
    this.tab = tab === 'settings' ? 'settings' : 'stats';
    const inner = (this.tab === 'stats' ? Views.stats : Views.settings).render([]);
    const s = App.state;
    const cl = Engine.charLevel(s);
    return `
      <header class="page-head profile-head">
        <a class="profile-pic" href="#/avatar" title="Personnaliser mon avatar">${UI.portrait(s, 84)}</a>
        <div>
          <p class="eyebrow">Profil</p>
          <h1>${U.esc(s.profile.name)}</h1>
          <p class="muted">${U.esc(Engine.title('char', cl.level))} · niveau ${cl.level} · ${U.fmtNum(Engine.totalXP(s))} XP${s.profile.height ? ` · ${s.profile.height} cm · ${s.profile.weight} kg` : ''}${s.clan ? ` · clan ${U.esc(s.clan.name)}` : ''}</p>
        </div>
      </header>
      ${UI.tabs('profile', [['stats', 'Statistiques'], ['settings', 'Réglages']], this.tab)}
      ${inner.replace(/^\s*<header class="page-head">[\s\S]*?<\/header>/, '')}`;
  },
  mount(params) {
    const v = this.tab === 'stats' ? Views.stats : Views.settings;
    if (v.mount) v.mount(params);
  },
};
