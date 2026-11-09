/* QG : vue d'ensemble, quêtes du jour, régularité, PNJ, boss de la semaine */
Views.home = {
  boardDomain: 'all',

  render() {
    const s = App.state;
    const quests = Engine.questsToday(s);
    const doneN = quests.filter(q => q.done).length;
    const streak = Engine.streak(s);
    const cl = Engine.charLevel(s);
    const checkin = Engine.checkinThisWeek(s);
    const wk = U.weekKey();
    const boss = s.bosses[wk];
    const bossOpen = cl.level >= GAME.bossUnlockCharLevel;
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const weekW = Engine.workoutsInWeek(s).length;
    const goal = s.settings.weeklyGoal;
    const arcs = [...Engine.activeArcs(s), ...ARCS.filter(a => s.npc.arcs[a.id]?.status === 'ready')];

    const domainCards = GAME.domainOrder.map(d => {
      const info = Engine.domainLevel(s, d);
      const nx = Engine.nextUnlock(s, d);
      const dd = GAME.domains[d];
      return `<a class="card dom-card dom-${d}" href="#/${dd.route}">
        <div class="dc-head"><span class="dc-ico">${dd.icon}</span><span class="dc-name">${dd.name}</span><span class="dc-lvl">Niv. ${info.level}</span></div>
        <div class="dc-title">${U.esc(Engine.title(d, info.level))}</div>
        ${UI.xpBar(info, d)}
        <div class="dc-foot"><span>${U.fmtNum(info.into)} / ${U.fmtNum(info.need)} XP</span></div>
        ${nx ? `<div class="dc-next">Niv. ${nx.level} → ${U.esc(nx.text)}</div>` : ''}
      </a>`;
    }).join('');

    const questRows = quests.map(q => `
      <li class="quest ${q.done ? 'done' : ''}">
        <button class="check" data-act="questDone" data-id="${q.id}" ${q.done ? 'disabled' : ''} aria-label="Valider la quête">${q.done ? '✓' : ''}</button>
        <div class="q-main"><div class="q-text">${U.esc(q.text)}</div><div class="q-meta">${UI.domainBadge(q.domain)}<span class="q-xp">+${q.xp || GAME.customQuestXp} XP</span></div></div>
        ${q.done ? '' : `<button class="btn ghost sm" data-act="timer" data-text="${U.esc(q.text)}" title="Démarrer 5 minutes">5 min</button>
        <button class="icon-btn" data-act="questDel" data-id="${q.id}" aria-label="Supprimer">✕</button>`}
      </li>`).join('');

    const taken = new Set(quests.map(q => q.text));
    const board = GAME.questLibrary.map((q, i) => ({ ...q, i }))
      .filter(q => (this.boardDomain === 'all' || q.domain === this.boardDomain) && !taken.has(q.text));

    return `
      <header class="page-head">
        <p class="eyebrow">${U.esc(today)}</p>
        <h1>Salut ${U.esc(s.profile.name)}. Qu'est-ce que tu fais <em>aujourd'hui</em> ?</h1>
        <p class="muted">Planifier ne rapporte aucun XP. Seule l'action compte.</p>
      </header>

      <section class="grid4">${domainCards}</section>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Quêtes du jour</h2><span class="pill">${doneN} / ${GAME.maxQuestsPerDay}</span></div>
          <p class="muted small">${GAME.maxQuestsPerDay} actions maximum, faisables aujourd'hui. Ce qui n'est pas fait disparaît à minuit : pas de liste infinie.</p>
          ${quests.length ? `<ul class="quests">${questRows}</ul>` : '<p class="empty-hint">Aucune quête. Pioche dans le tableau ci-dessous une action que tu peux commencer dans les 5 prochaines minutes.</p>'}
          ${quests.length < GAME.maxQuestsPerDay ? `
            <div class="board">
              <div class="board-head"><h3>Tableau des quêtes</h3>
                <div class="seg">${['all', ...GAME.domainOrder].map(d => `<button class="${this.boardDomain === d ? 'on' : ''}" data-act="boardFilter" data-d="${d}">${d === 'all' ? 'Toutes' : GAME.domains[d].icon}</button>`).join('')}</div>
              </div>
              <ul class="board-list">${board.map(q => `<li><button class="board-item dom-${q.domain}" data-act="questPick" data-i="${q.i}">
                <span class="bi-dot"></span><span class="bi-text">${U.esc(q.text)}</span><span class="diff diff-${q.diff}">${GAME.questDifficulty[q.diff].label}</span><span class="bi-xp">+${GAME.questDifficulty[q.diff].xp}</span></button></li>`).join('')}</ul>
              <details class="custom-quest"><summary>Créer ma propre quête</summary>
                <form data-form="quest" class="quest-form">
                  <input name="text" required maxlength="90" placeholder="Une action concrète (ex. 20 pompes)">
                  <select name="domain">${UI.domainOptions('sport')}</select>
                  <button class="btn primary">Ajouter</button>
                </form>
              </details>
            </div>`
          : doneN === GAME.maxQuestsPerDay ? '<p class="win">Journée parfaite. Repose-toi ou attaque une mission.</p>' : ''}
        </div>

        <div class="stack">
          <div class="mini-grid">
            <div class="card streak-card">
              <div class="streak-n">${Icons.get('flame', 26)}${streak}</div>
              <div><strong>jour${streak > 1 ? 's' : ''} de série</strong><p class="muted small">Record : ${Engine.bestStreak(s)} j</p></div>
            </div>
            <a class="card streak-card link" href="#/sport/seances">
              <div class="streak-n">${Icons.get('sport', 26)}${weekW}/${goal}</div>
              <div><strong>séances cette semaine</strong><p class="muted small">${Engine.weekStreak(s)} sem. d'affilée à l'objectif</p></div>
            </a>
          </div>

          <a class="card link-card ${checkin ? 'ok' : 'todo'}" href="#/sport/physique">
            <span class="lc-ico">${Icons.get('camera', 22)}</span>
            <div><strong>Check-in physique — semaine ${wk.split('-W')[1]}</strong>
            <p class="muted small">${checkin ? `Fait · score ${checkin.total}/100` : `À faire : photo + auto-évaluation (+${GAME.xp.checkin} XP)`}</p></div>
            <span class="lc-go">${checkin ? '✓' : '→'}</span>
          </a>

          <div class="card">
            <div class="card-head"><h2>Quêtes de PNJ</h2><a href="#/journal" class="small">Journal →</a></div>
            ${arcs.length ? `<ul class="arc-mini">${arcs.map(a => {
              const p = Engine.arcProgress(s, a);
              const ready = s.npc.arcs[a.id].status === 'ready';
              return `<li><span class="am-ico">${UI.npcFace(a.npc, 36)}</span><div><strong>${U.esc(a.title)}</strong>
                <div class="xpbar sm"><span style="width:${(p.count / p.steps.length) * 100}%"></span></div>
                <small class="muted">${ready ? 'Retourne voir ' + U.esc(NPCS[a.npc].name) : `${p.count}/${p.steps.length} étapes · ${U.esc(NPCS[a.npc].name)}`}</small></div></li>`;
            }).join('')}</ul>` : '<p class="muted small">Aucune quête en cours. Les PNJ apparaissent au hasard, une à deux fois par jour, quand tu agis.</p>'}
          </div>

          <div class="card boss ${bossOpen ? '' : 'locked'}">
            <div class="card-head"><h2>Boss de la semaine</h2>${boss?.done ? '<span class="pill ok">Vaincu</span>' : ''}</div>
            ${!bossOpen ? `<p class="muted">Se débloque au niveau ${GAME.bossUnlockCharLevel} du personnage (actuel : ${cl.level}).</p>`
            : boss ? `
              <p class="boss-text">${U.esc(boss.text)}</p>${UI.domainBadge(boss.domain)}
              ${boss.done ? `<p class="muted small">Vaincu le ${U.fmtDate(boss.doneTs)} · « ${U.esc(boss.note)} »</p>` : `
                <form data-form="bossDone" class="inline-form">
                  <input name="note" required minlength="10" maxlength="240" placeholder="Preuve : comment l'as-tu vaincu ?">
                  <button class="btn primary sm">Vaincu (+${GAME.xp.boss} XP)</button>
                </form>`}`
            : `<p class="muted small">Un défi réel et significatif, à terminer avant dimanche soir. Un seul.</p>
              <form data-form="boss" class="quest-form">
                <input name="text" required maxlength="120" placeholder="Ex. Passer un examen blanc CCNA">
                <select name="domain">${UI.domainOptions('pro')}</select>
                <button class="btn primary">Défier</button>
              </form>`}
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>Missions de Discipline</h2><span class="muted small">Niv. ${Engine.domainLevel(s, 'discipline').level}</span></div>
        ${UI.missions(GAME.missions.filter(m => m.domain === 'discipline'))}
      </section>`;
  },
};

App.actions.boardFilter = el => { Views.home.boardDomain = el.dataset.d; App.render(false); };

function addQuest(text, domain, xp) {
  const q = Engine.questsToday(App.state);
  if (!text || q.length >= GAME.maxQuestsPerDay || q.some(x => x.text === text)) return;
  q.push({ id: U.uid(), text, domain, xp, done: false });
  App.commit();
}
App.forms.quest = fd => addQuest(String(fd.get('text') || '').trim(), fd.get('domain'), GAME.customQuestXp);
App.actions.questPick = el => {
  const q = GAME.questLibrary[Number(el.dataset.i)];
  if (q) addQuest(q.text, q.domain, GAME.questDifficulty[q.diff].xp);
};
App.actions.questDel = el => {
  const k = U.dayKey();
  App.state.quests[k] = Engine.questsToday(App.state).filter(q => q.id !== el.dataset.id || q.done);
  App.commit();
};
App.actions.questDone = el => {
  const s = App.state;
  const q = Engine.questsToday(s).find(x => x.id === el.dataset.id);
  if (!q || q.done) return;
  q.done = true;
  q.doneTs = Date.now();
  const xp = q.xp || GAME.customQuestXp;
  if (q.domain === 'discipline') App.grant('discipline', xp + GAME.xp.questDiscipline, `Quête : ${q.text}`);
  else {
    App.grant(q.domain, xp, `Quête : ${q.text}`);
    App.grant('discipline', GAME.xp.questDiscipline, 'Quête accomplie');
  }
  const all = Engine.questsToday(s);
  if (all.length === GAME.maxQuestsPerDay && all.every(x => x.done)) App.grant('discipline', GAME.xp.perfectDay, 'Journée parfaite');
  App.commit();
};
App.forms.boss = fd => {
  const text = String(fd.get('text') || '').trim();
  if (!text) return;
  App.state.bosses[U.weekKey()] = { text, domain: fd.get('domain'), done: false, createdTs: Date.now() };
  App.commit();
};
App.forms.bossDone = fd => {
  const b = App.state.bosses[U.weekKey()];
  const note = String(fd.get('note') || '').trim();
  if (!b || b.done || note.length < 10) return;
  Object.assign(b, { done: true, doneTs: Date.now(), note });
  App.grant(b.domain, GAME.xp.boss, `Boss vaincu : ${b.text}`);
  App.grant('discipline', GAME.xp.bossDiscipline, 'Boss de la semaine');
  App.commit();
};

/* ---------- Création du personnage ---------- */
Views.onboarding = {
  render() {
    const hasOthers = !!App._profilesCache?.length;
    return `
      <div class="onboard">
        <div class="brand big"><span class="brand-mark">${Icons.get('sword', 18)}</span><span>Play Your Life</span></div>
        <h1>Ta vie est le jeu.<br>Ton personnage, c'est toi.</h1>
        <p class="lead">Ici, aucun XP ne s'obtient en planifiant. Tu gagnes des niveaux en faisant de vraies choses : tests physiques, séances, courses, photos hebdomadaires, tests de compétences, livres terminés, quêtes confiées par des PNJ.</p>
        <form data-form="onboard" class="card onboard-form">
          <div class="ob-id">
            <label class="pp-pick" title="Photo de profil (optionnelle)">
              <img id="ob-pp" alt=""><span>＋ Photo</span>
              <input type="file" name="photo" accept="image/*" data-preview="ob-pp">
            </label>
            <div class="stack-form">
              <label>Ton prénom ou pseudo<input name="name" required maxlength="30" autofocus></label>
              <div class="row">
                <label>Taille (cm)<input name="height" type="number" min="120" max="230" required inputmode="numeric"></label>
                <label>Poids (kg)<input name="weight" type="number" min="30" max="300" step="0.1" required inputmode="decimal"></label>
              </div>
            </div>
          </div>
          <p class="muted small">La photo est optionnelle et reste sur ton appareil. Tu créeras aussi ton avatar à l'étape suivante.</p>
          <label>Ton domaine professionnel
            <select name="proDomain" data-change="obDomain">
              <option value="it">Informatique (tests disponibles : réseau, dev, cyber, cloud, systèmes, data)</option>
              <option value="other">Autre domaine</option>
            </select>
          </label>
          <label class="ob-other" hidden>Nom de ton domaine<input name="proDomainName" maxlength="40" placeholder="Ex. Marketing, Santé, Finance…"></label>
          <div class="row">
            <label>Test de squat
              <select name="squatUnit">
                <option value="reps">Répétitions max (poids du corps)</option>
                <option value="kg">Charge max sur 1 rép. (kg)</option>
              </select>
            </label>
            <label>Test de course
              <select name="runTest">
                <option value="cooper">Distance max en 12 min</option>
                <option value="pace5k">Rythme sur 5 km</option>
              </select>
            </label>
          </div>
          <label>Objectif de séances de sport par semaine
            <input name="weeklyGoal" type="number" min="1" max="14" value="3" required>
          </label>
          <div class="oath">
            <label class="check-line"><input type="checkbox" required> Je m'engage à ne saisir que des résultats réels. Tricher ici, c'est tricher avec moi-même.</label>
          </div>
          <button class="btn primary lg">Créer mon personnage</button>
          ${hasOthers ? '<button type="button" class="btn ghost" data-act="obCancel">Revenir à un profil existant</button>' : ''}
        </form>
      </div>`;
  },
};
App.actions.obDomain = el => {
  document.querySelector('.ob-other').hidden = el.value !== 'other';
};
App.actions.obCancel = async () => {
  const list = await Store.listProfiles();
  if (list.length) App.switchProfile(list[0].id);
};
App.forms.onboard = async (fd, form) => {
  const s = App.state;
  const height = Math.round(Number(fd.get('height')));
  const weight = Math.round(Number(String(fd.get('weight')).replace(',', '.')) * 10) / 10;
  if (!(height >= 120 && height <= 230) || !(weight >= 30 && weight <= 300)) { App.toast('Taille ou poids invalide.', 'warn'); return; }
  form.querySelector('button.primary').disabled = true;
  s.id = U.uid();
  s.profile = {
    name: String(fd.get('name')).trim(),
    proDomain: fd.get('proDomain'),
    proDomainName: fd.get('proDomain') === 'other' ? (String(fd.get('proDomainName') || '').trim() || 'Mon métier') : GAME.proDomains.it.name,
    createdAt: Date.now(),
    height, weight,
    avatar: Avatar.sanitize(s, Avatar.random()),
    display: 'avatar',
  };
  const file = fd.get('photo');
  if (file && file.size) {
    try {
      await Store.putPhoto(s, 'pp-' + s.id, await U.squareImage(file));
      s.profile.hasPhoto = true;
      s.profile.display = 'photo';
    } catch (e) { App.toast('Photo ignorée : ' + U.esc(e.message), 'warn'); }
  }
  s.settings.squatUnit = fd.get('squatUnit');
  s.settings.runTest = fd.get('runTest');
  s.settings.weeklyGoal = U.clamp(Math.round(Number(fd.get('weeklyGoal')) || 3), 1, 14);
  Store.setActive(s.id);
  await App.save(true);
  App.toast('<b>Personnage créé.</b><small>Dernière étape : ton avatar.</small>');
  App.go('#/avatar/first');
  App.afterProfileLoad();
};
