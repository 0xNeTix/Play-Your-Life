/* Multijoueur : classement entre amis / famille, et clan.
   Sans serveur : profils de cet appareil + cartes de joueur et invitations de clan échangées en fichier.
   Avec un serveur plus tard : mêmes données, synchronisées (classement en direct, chat de clan). */
const CLAN_EMBLEMS = ['guild', 'sword', 'crown', 'flame', 'gem', 'run', 'intel', 'target'];
const CLAN_COLORS = ['#ffbe69', '#d4704c', '#0bc5d2', '#a77be0', '#b3261e', '#2f8a5a'];
const PHOTO_RE = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;

/* Miniature de la photo de profil pour une carte partagée (≈ 5 Ko) */
async function cardPhoto(state) {
  if (!state.profile?.hasPhoto || state.profile.display !== 'photo' || state.settings.sharePhoto === false) return null;
  const url = await Store.getPhoto('pp-' + state.id);
  if (!url) return null;
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 112;
      c.getContext('2d').drawImage(img, 0, 0, 112, 112);
      res(c.toDataURL('image/jpeg', .78));
    };
    img.onerror = () => res(null);
    img.src = url;
  });
}
async function fullCard(state) {
  return { ...Engine.publicCard(state), photo: await cardPhoto(state) };
}
function cleanClan(c) {
  if (!c || typeof c !== 'object' || !c.id || !c.name) return null;
  return {
    id: String(c.id).slice(0, 40), name: String(c.name).slice(0, 24), tag: String(c.tag || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4),
    motto: String(c.motto || '').slice(0, 80), color: CLAN_COLORS.includes(c.color) ? c.color : CLAN_COLORS[0],
    emblem: CLAN_EMBLEMS.includes(c.emblem) ? c.emblem : 'guild', createdAt: Number(c.createdAt) || Date.now(),
  };
}
function cleanCard(c) {
  return {
    app: 'play-your-life-card', v: Number(c.v) || 1, id: String(c.id), name: String(c.name).slice(0, 30), title: String(c.title || '').slice(0, 40),
    updatedAt: Number(c.updatedAt) || Date.now(), since: Number(c.since) || null, level: Number(c.level) || 1, xp: Number(c.xp) || 0, xp7: Number(c.xp7) || 0,
    streak: Number(c.streak) || 0, weekStreak: Number(c.weekStreak) || 0, runKm: Number(c.runKm) || 0,
    domains: Object.fromEntries(GAME.domainOrder.map(d => [d, Number(c.domains?.[d]) || 1])),
    avatar: c.avatar && typeof c.avatar === 'object' ? Avatar.sanitizeForeign(c.avatar) : null,
    photo: typeof c.photo === 'string' && c.photo.length < 80000 && PHOTO_RE.test(c.photo) ? c.photo : null,
    npcTitles: Array.isArray(c.npcTitles) ? c.npcTitles.slice(0, 50).map(t => String(t).slice(0, 40)) : [],
    clan: c.clan ? cleanClan(c.clan) : null,
  };
}
const clanBadge = (clan, size = 44) => clan ? `<span class="clan-badge" style="--cc:${clan.color};width:${size}px;height:${size}px">${Icons.get(clan.emblem, Math.round(size * .45))}</span>` : '';

Views.guild = {
  sortBy: 'level',
  players: [],

  render([tab = 'board']) {
    this.tab = tab === 'clan' ? 'clan' : 'board';
    const s = App.state;
    return `
      <header class="page-head">
        <p class="eyebrow">${Icons.get('guild', 15)} Multijoueur</p>
        <h1>On progresse plus vite ensemble.</h1>
        <p class="muted">Compare-toi à tes amis et à ta famille, fonde un clan. Seule ta <strong>carte de joueur</strong> est partagée : niveaux, séries, records, et ta photo si tu l'as choisie.</p>
      </header>
      ${UI.tabs('guild', [['board', 'Classement'], ['clan', s.clan ? `Clan [${U.esc(s.clan.tag)}]` : 'Clan']], this.tab)}
      <div id="multi-body"><p class="muted">Chargement…</p></div>`;
  },

  async mount() {
    const s = App.state;
    const list = await Store.listProfiles();
    const locals = [];
    for (const p of list) {
      const raw = p.id === s.id ? s : await Store.peekProfile(p.id);
      if (!raw || !raw.profile) continue;
      const st = p.id === s.id ? s : Store.migrate(raw);
      const card = Engine.publicCard(st);
      if (st.profile.display === 'photo' && st.profile.hasPhoto) card.photo = p.id === s.id ? App.ppUrl : await Store.getPhoto('pp-' + p.id);
      locals.push({ ...card, local: true, me: p.id === s.id });
    }
    const ids = new Set(locals.map(c => c.id));
    const friends = (s.friends || []).filter(c => !ids.has(c.id)).map(c => ({ ...c, friend: true }));
    this.players = [...locals, ...friends];
    const el = document.getElementById('multi-body');
    if (el) el.innerHTML = this.tab === 'clan' ? this.clanHtml() : this.boardHtml(this.players);
  },

  face(c, size = 40) {
    return c.photo ? `<img class="g-photo" src="${c.photo}" width="${size}" height="${size}" alt="">` : Avatar.svg(c.avatar, { size, crop: 'face', shape: 'circle', label: c.name });
  },

  table(cards, { removable = true, clanAdd = false } = {}) {
    const key = this.sortBy;
    const val = c => (GAME.domains[key] ? c.domains?.[key] || 0 : c[key] || 0);
    cards = cards.slice().sort((a, b) => val(b) - val(a) || (b.xp || 0) - (a.xp || 0));
    const medal = i => `<span class="medal m${Math.min(i + 1, 4)}">${i + 1}</span>`;
    const s = App.state;
    const members = new Set(s.clan?.members || []);
    if (!cards.length) return '<p class="empty-hint">Personne pour l\'instant.</p>';
    return `<div class="table-wrap"><table class="guild-table">
      <thead><tr><th>#</th><th>Joueur</th><th>Niv.</th>${GAME.domainOrder.map(d => `<th title="${GAME.domains[d].name}">${GAME.domains[d].icon}</th>`).join('')}<th title="Série de jours">Série</th><th>XP 7 j</th><th></th></tr></thead>
      <tbody>${cards.map((c, i) => `<tr class="${c.me ? 'me' : ''}">
        <td class="rank-cell">${medal(i)}</td>
        <td class="gp"><span class="g-av">${this.face(c)}</span><div><strong>${U.esc(c.name)}</strong>${c.clan ? ` <span class="clan-tag" style="--cc:${c.clan.color}">${U.esc(c.clan.tag)}</span>` : ''}<small class="muted block">${U.esc(c.title || '')}${c.friend ? ` · carte du ${U.fmtShort(c.updatedAt)}` : c.me ? ' · toi' : ' · cet appareil'}</small></div></td>
        <td><strong>${c.level}</strong></td>
        ${GAME.domainOrder.map(d => `<td>${c.domains?.[d] ?? '—'}</td>`).join('')}
        <td>${c.streak ?? 0}</td><td>${U.fmtNum(c.xp7 ?? 0)}</td>
        <td class="row-acts">${clanAdd && s.clan && !c.me && !members.has(c.id) ? `<button class="btn sm ghost" data-act="clanAdd" data-id="${U.esc(c.id)}">Inviter</button>` : ''}
          ${removable && c.friend ? `<button class="icon-btn" data-act="removeFriend" data-id="${U.esc(c.id)}" aria-label="Retirer">✕</button>` : ''}
          ${!removable && !c.me ? `<button class="icon-btn" data-act="clanRemove" data-id="${U.esc(c.id)}" aria-label="Retirer du clan">✕</button>` : ''}</td>
      </tr>`).join('')}</tbody></table></div>`;
  },

  sortSelect() {
    return `<label class="inline-label">Trier par
      <select data-change="guildSort">
        ${[['level', 'Niveau'], ['xp7', 'XP des 7 derniers jours'], ['streak', 'Série de jours'], ['weekStreak', 'Semaines de régularité'], ['runKm', 'Km courus'], ...GAME.domainOrder.map(d => [d, GAME.domains[d].name])]
          .map(([k, l]) => `<option value="${k}" ${this.sortBy === k ? 'selected' : ''}>${l}</option>`).join('')}
      </select></label>`;
  },

  boardHtml(cards) {
    const me = cards.find(c => c.me);
    return `
      <section class="card">
        <div class="card-head"><h2>Classement</h2>${this.sortSelect()}</div>
        ${this.table(cards, { clanAdd: true })}
      </section>
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Ma carte</h2></div>
          <div class="pcard-wrap">${UI.playerCard(me || Engine.publicCard(App.state), { photoUrl: me?.photo || null })}</div>
          <p class="muted small">Envoie ta carte à tes amis (messagerie, mail), ils l'importent de leur côté. Renvoie-la de temps en temps pour mettre le classement à jour.</p>
          <button class="btn primary" data-act="exportCard">Exporter ma carte</button>
        </div>
        <div class="card">
          <div class="card-head"><h2>Ajouter un ami</h2></div>
          <p class="muted small">Importe la carte qu'un ami t'a envoyée. Une nouvelle carte du même joueur remplace l'ancienne.</p>
          <label class="btn">Importer une carte<input type="file" accept="application/json,.json" data-change="importCard" hidden></label>
        </div>
      </section>`;
  },

  clanHtml() {
    const s = App.state;
    const clan = s.clan;
    if (!clan) {
      return `<section class="cols">
        <div class="card">
          <div class="card-head"><h2>Fonder un clan</h2></div>
          <form data-form="clanCreate" class="stack-form">
            <div class="row"><label>Nom<input name="name" required minlength="3" maxlength="24" placeholder="Ex. Les Lève-tôt"></label><label>Tag<input name="tag" required minlength="2" maxlength="4" placeholder="LVT" style="text-transform:uppercase"></label></div>
            <label>Devise (optionnel)<input name="motto" maxlength="80" placeholder="Ex. Un pas de plus chaque jour"></label>
            <fieldset class="pick"><legend>Blason</legend><div class="pick-row">${CLAN_EMBLEMS.map((e, i) => `<label class="pick-item"><input type="radio" name="emblem" value="${e}" ${i ? '' : 'checked'}><span>${Icons.get(e, 20)}</span></label>`).join('')}</div></fieldset>
            <fieldset class="pick"><legend>Couleur</legend><div class="pick-row">${CLAN_COLORS.map((c, i) => `<label class="pick-item"><input type="radio" name="color" value="${c}" ${i ? '' : 'checked'}><span class="sw" style="background:${c}"></span></label>`).join('')}</div></fieldset>
            <button class="btn primary">Fonder le clan</button>
          </form>
        </div>
        <div class="card">
          <div class="card-head"><h2>Rejoindre un clan</h2></div>
          <p class="muted small">Un ami t'a envoyé une invitation de clan ? Importe-la : tu rejoins son clan et sa carte est ajoutée à ton classement.</p>
          <label class="btn">Importer une invitation<input type="file" accept="application/json,.json" data-change="clanImport" hidden></label>
        </div>
      </section>`;
    }
    const memberIds = new Set([...(clan.members || []), s.id]);
    const members = this.players.filter(p => memberIds.has(p.id));
    const power = members.reduce((a, m) => a + (m.level || 0), 0);
    const xp7 = members.reduce((a, m) => a + (m.xp7 || 0), 0);
    return `
      <section class="card clan-banner" style="--cc:${clan.color}">
        ${clanBadge(clan, 78)}
        <div class="clan-id"><p class="eyebrow">Clan · fondé le ${U.fmtDate(clan.createdAt)}</p><h2>${U.esc(clan.name)} <span class="clan-tag" style="--cc:${clan.color}">${U.esc(clan.tag)}</span></h2>${clan.motto ? `<p class="clan-motto">« ${U.esc(clan.motto)} »</p>` : ''}</div>
        <div class="clan-stats"><div><b>${members.length}</b><small>membres</small></div><div><b>${power}</b><small>puissance</small></div><div><b>${U.fmtNum(xp7)}</b><small>XP 7 jours</small></div></div>
      </section>
      <section class="card">
        <div class="card-head"><h2>Classement du clan</h2>${this.sortSelect()}</div>
        ${this.table(members, { removable: false })}
        <p class="muted small">Ajoute des membres depuis l'onglet Classement (bouton « Inviter »), puis envoie-leur l'invitation du clan.</p>
      </section>
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Invitation</h2></div>
          <p class="muted small">Le fichier d'invitation contient le clan et ta carte. Tes amis l'importent dans Multijoueur → Clan.</p>
          <div class="btn-col"><button class="btn primary" data-act="clanExport">Exporter l'invitation</button><button class="btn danger" data-act="clanLeave">Quitter le clan</button></div>
        </div>
        <div class="card chat-soon">
          <div class="card-head"><h2>Discussion</h2><span class="pill">Bientôt</span></div>
          <p class="muted small">Le chat du clan arrivera avec la synchronisation en ligne : il faut un serveur pour que les messages circulent entre vos appareils.</p>
          <div class="chat-preview"><input disabled placeholder="Écrire au clan…"><button class="btn" disabled>Envoyer</button></div>
        </div>
      </section>`;
  },
};

function download(name, data) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const slug = t => String(t || 'joueur').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-');

App.actions.guildSort = el => { Views.guild.sortBy = el.value; Views.guild.mount(); };
App.actions.exportCard = async () => {
  const card = await fullCard(App.state);
  download(`carte-${slug(card.name)}.json`, card);
};
App.actions.importCard = async el => {
  const f = el.files && el.files[0];
  el.value = '';
  if (!f) return;
  try {
    const c = JSON.parse(await f.text());
    if (c.app !== 'play-your-life-card' || !c.id || !c.name) throw new Error('ce n\'est pas une carte de joueur');
    if (c.id === App.state.id) throw new Error('c\'est ta propre carte');
    const card = cleanCard(c);
    App.state.friends = (App.state.friends || []).filter(x => x.id !== card.id);
    App.state.friends.push(card);
    App.toast(`<b>${U.esc(card.name)}</b> rejoint ton classement.`);
    App.commit();
  } catch (e) {
    App.toast('Import impossible : ' + U.esc(e.message), 'warn');
  }
};
App.actions.removeFriend = el => {
  const s = App.state;
  s.friends = (s.friends || []).filter(x => x.id !== el.dataset.id);
  if (s.clan) s.clan.members = s.clan.members.filter(id => id !== el.dataset.id);
  App.commit();
};

/* ---------- Clan ---------- */
App.forms.clanCreate = fd => {
  const clan = cleanClan({ id: U.uid(), name: String(fd.get('name') || '').trim(), tag: fd.get('tag'), motto: String(fd.get('motto') || '').trim(), color: fd.get('color'), emblem: fd.get('emblem'), createdAt: Date.now() });
  if (!clan || clan.name.length < 3 || clan.tag.length < 2) { App.toast('Nom (3 caractères) et tag (2 à 4 lettres ou chiffres) requis.', 'warn'); return; }
  App.state.clan = { ...clan, founderId: App.state.id, members: [App.state.id] };
  App.toast(`<b>Clan fondé</b><small>${U.esc(clan.name)} [${U.esc(clan.tag)}]</small>`);
  App.commit();
};
App.actions.clanAdd = el => {
  const c = App.state.clan;
  if (!c) return;
  if (!c.members.includes(el.dataset.id)) c.members.push(el.dataset.id);
  App.toast('Membre ajouté au clan. Envoie-lui l\'invitation.');
  App.commit();
};
App.actions.clanRemove = el => {
  const c = App.state.clan;
  if (!c) return;
  c.members = c.members.filter(id => id !== el.dataset.id);
  App.commit();
};
App.actions.clanLeave = () => {
  if (!confirm(`Quitter le clan « ${App.state.clan.name} » ?`)) return;
  App.state.clan = null;
  App.commit();
};
App.actions.clanExport = async () => {
  const s = App.state;
  const { founderId, members, ...clan } = s.clan;
  download(`invitation-clan-${slug(clan.name)}.json`, { app: 'play-your-life-clan', v: 1, clan, from: await fullCard(s) });
};
App.actions.clanImport = async el => {
  const f = el.files && el.files[0];
  el.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    const clan = data.app === 'play-your-life-clan' ? cleanClan(data.clan) : null;
    if (!clan) throw new Error('ce n\'est pas une invitation de clan');
    const s = App.state;
    const members = [s.id];
    if (data.from && data.from.id && data.from.id !== s.id) {
      const card = cleanCard(data.from);
      s.friends = (s.friends || []).filter(x => x.id !== card.id);
      s.friends.push(card);
      members.push(card.id);
    }
    s.clan = { ...clan, founderId: data.from?.id || null, members };
    App.toast(`<b>Bienvenue dans ${U.esc(clan.name)}</b><small>[${U.esc(clan.tag)}]</small>`);
    App.commit();
  } catch (e) {
    App.toast('Import impossible : ' + U.esc(e.message), 'warn');
  }
};
