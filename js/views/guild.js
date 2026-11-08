/* Guilde : classement entre amis / famille.
   Sans serveur : profils de cet appareil + cartes de joueur échangées en fichier.
   Avec un serveur plus tard : la même liste viendra de la colonne `card` partagée. */
Views.guild = {
  sortBy: 'level',

  async mount() {
    const list = await Store.listProfiles();
    const s = App.state;
    const locals = [];
    for (const p of list) {
      const st = p.id === s.id ? s : await Store.peekProfile(p.id);
      if (st && st.profile) locals.push({ ...Engine.publicCard(Store.migrate(st)), local: true, me: p.id === s.id });
    }
    const ids = new Set(locals.map(c => c.id));
    const friends = (s.friends || []).filter(c => !ids.has(c.id)).map(c => ({ ...c, friend: true }));
    this.renderBoard([...locals, ...friends]);
  },

  render() {
    return `
      <header class="page-head">
        <p class="eyebrow">🛡️ Guilde</p>
        <h1>On progresse plus vite ensemble.</h1>
        <p class="muted">Compare-toi à tes amis et ta famille. Seule ta <strong>carte de joueur</strong> est partagée : niveaux, séries, records. Jamais tes photos ni ton historique détaillé.</p>
      </header>
      <section class="card">
        <div class="card-head"><h2>Classement</h2>
          <label class="inline-label">Trier par
            <select data-change="guildSort">
              ${[['level', 'Niveau'], ['xp7', 'XP des 7 derniers jours'], ['streak', 'Série de jours'], ['weekStreak', 'Semaines de régularité'], ['runKm', 'Km courus'], ...GAME.domainOrder.map(d => [d, GAME.domains[d].name])]
                .map(([k, l]) => `<option value="${k}" ${this.sortBy === k ? 'selected' : ''}>${l}</option>`).join('')}
            </select>
          </label>
        </div>
        <div id="guild-board"><p class="muted">Chargement…</p></div>
      </section>
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Partager ma carte</h2></div>
          <p class="muted small">Exporte ta carte et envoie-la à tes amis (messagerie, mail). Ils l'importent de leur côté. Renvoie-la de temps en temps pour mettre ton classement à jour.</p>
          <button class="btn primary" data-act="exportCard">⬇️ Exporter ma carte de joueur</button>
        </div>
        <div class="card">
          <div class="card-head"><h2>Ajouter un ami</h2></div>
          <p class="muted small">Importe la carte qu'un ami t'a envoyée. Une nouvelle carte du même joueur remplace l'ancienne.</p>
          <label class="btn">⬆️ Importer une carte<input type="file" accept="application/json,.json" data-change="importCard" hidden></label>
        </div>
      </section>
      <div class="callout small">🔮 Prochaine étape possible : un serveur commun pour que la guilde se mette à jour toute seule, avec des défis entre joueurs. L'application est déjà structurée pour ça.</div>`;
  },

  renderBoard(cards) {
    const el = document.getElementById('guild-board');
    if (!el) return;
    const key = this.sortBy;
    const val = c => (GAME.domains[key] ? c.domains?.[key] || 0 : c[key] || 0);
    cards.sort((a, b) => val(b) - val(a) || (b.xp || 0) - (a.xp || 0));
    const medal = i => ['🥇', '🥈', '🥉'][i] || `${i + 1}`;
    el.innerHTML = cards.length ? `<div class="table-wrap"><table class="guild-table">
      <thead><tr><th>#</th><th>Joueur</th><th>Niv.</th>${GAME.domainOrder.map(d => `<th title="${GAME.domains[d].name}">${GAME.domains[d].icon}</th>`).join('')}<th>🔥</th><th>XP 7 j</th><th></th></tr></thead>
      <tbody>${cards.map((c, i) => `<tr class="${c.me ? 'me' : ''}">
        <td class="rank-cell">${medal(i)}</td>
        <td><strong>${U.esc(c.name)}</strong><small class="muted block">${U.esc(c.title || '')}${c.friend ? ` · carte du ${U.fmtShort(c.updatedAt)}` : c.me ? ' · toi' : ' · cet appareil'}</small></td>
        <td><strong>${c.level}</strong></td>
        ${GAME.domainOrder.map(d => `<td>${c.domains?.[d] ?? '—'}</td>`).join('')}
        <td>${c.streak ?? 0}</td><td>${U.fmtNum(c.xp7 ?? 0)}</td>
        <td>${c.friend ? `<button class="icon-btn" data-act="removeFriend" data-id="${U.esc(c.id)}" aria-label="Retirer">✕</button>` : ''}</td>
      </tr>`).join('')}</tbody></table></div>`
      : '<p class="empty-hint">Personne pour l\'instant.</p>';
  },
};

App.actions.guildSort = el => { Views.guild.sortBy = el.value; Views.guild.mount(); };
App.actions.exportCard = () => {
  const card = Engine.publicCard(App.state);
  const blob = new Blob([JSON.stringify(card, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `carte-${(card.name || 'joueur').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
App.actions.importCard = async el => {
  const f = el.files && el.files[0];
  if (!f) return;
  try {
    const c = JSON.parse(await f.text());
    if (c.app !== 'play-your-life-card' || !c.id || !c.name) throw new Error('ce n\'est pas une carte de joueur');
    if (c.id === App.state.id) throw new Error('c\'est ta propre carte');
    const clean = {
      app: c.app, v: c.v, id: String(c.id), name: String(c.name).slice(0, 30), title: String(c.title || '').slice(0, 40),
      updatedAt: Number(c.updatedAt) || Date.now(), level: Number(c.level) || 1, xp: Number(c.xp) || 0, xp7: Number(c.xp7) || 0,
      streak: Number(c.streak) || 0, weekStreak: Number(c.weekStreak) || 0, runKm: Number(c.runKm) || 0,
      domains: Object.fromEntries(GAME.domainOrder.map(d => [d, Number(c.domains?.[d]) || 1])),
    };
    App.state.friends = (App.state.friends || []).filter(x => x.id !== clean.id);
    App.state.friends.push(clean);
    App.toast(`<b>${U.esc(clean.name)}</b> a rejoint ta guilde.`);
    App.commit();
  } catch (e) {
    App.toast('Import impossible : ' + U.esc(e.message), 'warn');
  }
  el.value = '';
};
App.actions.removeFriend = el => {
  App.state.friends = (App.state.friends || []).filter(x => x.id !== el.dataset.id);
  App.commit();
};
