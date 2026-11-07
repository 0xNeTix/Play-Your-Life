/* QG : vue d'ensemble, quêtes du jour, boss de la semaine */
Views.home = {
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
    const ideas = GAME.questIdeas;
    const suggest = U.shuffle(GAME.domainOrder.map(d => ({ d, t: U.shuffle(ideas[d])[0] }))).slice(0, 4);
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

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
        <div class="q-main"><div class="q-text">${U.esc(q.text)}</div>${UI.domainBadge(q.domain)}</div>
        ${q.done ? '' : `<button class="btn ghost sm" data-act="timer" data-text="${U.esc(q.text)}" title="Démarrer 5 minutes">⏱ 5 min</button>
        <button class="icon-btn" data-act="questDel" data-id="${q.id}" aria-label="Supprimer">✕</button>`}
      </li>`).join('');

    return `
      <header class="page-head">
        <p class="eyebrow">${U.esc(today)}</p>
        <h1>Salut ${U.esc(s.profile.name)}. Qu'est-ce que tu fais <em>aujourd'hui</em> ?</h1>
        <p class="muted">Planifier ne rapporte aucun XP. Seule l'action compte.</p>
      </header>

      <section class="grid4">${domainCards}</section>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>⚔️ Quêtes du jour</h2><span class="pill">${doneN} / ${GAME.maxQuestsPerDay}</span></div>
          <p class="muted small">${GAME.maxQuestsPerDay} actions maximum, faisables aujourd'hui. Ce qui n'est pas fait disparaît à minuit : pas de liste infinie.</p>
          ${quests.length ? `<ul class="quests">${questRows}</ul>` : '<p class="empty-hint">Aucune quête. Choisis une action que tu peux commencer dans les 5 prochaines minutes.</p>'}
          ${quests.length < GAME.maxQuestsPerDay ? `
            <form data-form="quest" class="quest-form">
              <input name="text" required maxlength="90" placeholder="Une action concrète (ex. 20 pompes)">
              <select name="domain">${UI.domainOptions('sport')}</select>
              <button class="btn primary">Ajouter</button>
            </form>
            <div class="chips">${suggest.map(x => `<button class="chip dom-${x.d}" data-act="questQuick" data-d="${x.d}" data-t="${U.esc(x.t)}">${GAME.domains[x.d].icon} ${U.esc(x.t)}</button>`).join('')}</div>`
          : doneN === GAME.maxQuestsPerDay ? '<p class="win">Journée parfaite. Repose-toi ou attaque une mission.</p>' : ''}
        </div>

        <div class="stack">
          <div class="card streak-card">
            <div class="streak-n">🔥 ${streak}</div>
            <div><strong>jour${streak > 1 ? 's' : ''} de série</strong><p class="muted small">Record : ${Engine.bestStreak(s)} j. Valide au moins une quête par jour pour la garder.</p></div>
          </div>

          <a class="card link-card ${checkin ? 'ok' : 'todo'}" href="#/sport">
            <span class="lc-ico">📸</span>
            <div><strong>Check-in physique — semaine ${wk.split('-W')[1]}</strong>
            <p class="muted small">${checkin ? `Fait · score ${checkin.total}/100` : `À faire : photo + auto-évaluation (+${GAME.xp.checkin} XP)`}</p></div>
            <span class="lc-go">${checkin ? '✓' : '→'}</span>
          </a>

          <div class="card boss ${bossOpen ? '' : 'locked'}">
            <div class="card-head"><h2>👹 Boss de la semaine</h2>${boss?.done ? '<span class="pill ok">Vaincu</span>' : ''}</div>
            ${!bossOpen ? `<p class="muted">🔒 Se débloque au niveau ${GAME.bossUnlockCharLevel} du personnage (actuel : ${cl.level}).</p>`
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
        <div class="card-head"><h2>⚡ Missions de Discipline</h2><span class="muted small">Niv. ${Engine.domainLevel(s, 'discipline').level}</span></div>
        ${UI.missions(GAME.missions.filter(m => m.domain === 'discipline'))}
      </section>`;
  },
};

App.forms.quest = (fd) => {
  const q = Engine.questsToday(App.state);
  const text = String(fd.get('text') || '').trim();
  if (!text || q.length >= GAME.maxQuestsPerDay) return;
  q.push({ id: U.uid(), text, domain: fd.get('domain'), done: false });
  App.commit();
};
App.actions.questQuick = el => {
  const q = Engine.questsToday(App.state);
  if (q.length >= GAME.maxQuestsPerDay) return;
  q.push({ id: U.uid(), text: el.dataset.t, domain: el.dataset.d, done: false });
  App.commit();
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
  if (q.domain === 'discipline') App.grant('discipline', GAME.xp.quest + GAME.xp.questDiscipline, `Quête : ${q.text}`);
  else {
    App.grant(q.domain, GAME.xp.quest, `Quête : ${q.text}`);
    App.grant('discipline', GAME.xp.questDiscipline, 'Quête accomplie');
  }
  const all = Engine.questsToday(s);
  if (all.length === GAME.maxQuestsPerDay && all.every(x => x.done)) App.grant('discipline', GAME.xp.perfectDay, 'Journée parfaite');
  App.commit();
};
App.forms.boss = (fd) => {
  const text = String(fd.get('text') || '').trim();
  if (!text) return;
  App.state.bosses[U.weekKey()] = { text, domain: fd.get('domain'), done: false, createdTs: Date.now() };
  App.commit();
};
App.forms.bossDone = (fd) => {
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
    return `
      <div class="onboard">
        <p class="eyebrow">RPG IRL</p>
        <h1>Ta vie est le jeu.<br>Ton personnage, c'est toi.</h1>
        <p class="lead">Ici, aucun XP ne s'obtient en planifiant. Tu gagnes des niveaux en faisant de vraies choses : tests physiques, photos hebdomadaires, tests de compétences, livres terminés, missions concrètes.</p>
        <form data-form="onboard" class="card onboard-form">
          <label>Ton prénom ou pseudo<input name="name" required maxlength="30" autofocus></label>
          <label>Ton domaine professionnel
            <select name="proDomain" data-change="obDomain">
              <option value="it">💻 Informatique (tests disponibles : réseau, dev, cyber, cloud, systèmes, data)</option>
              <option value="other">Autre domaine</option>
            </select>
          </label>
          <label class="ob-other" hidden>Nom de ton domaine<input name="proDomainName" maxlength="40" placeholder="Ex. Marketing, Santé, Finance…"></label>
          <label>Test de squat
            <select name="squatUnit">
              <option value="reps">Nombre max de répétitions (poids du corps)</option>
              <option value="kg">Charge max sur 1 répétition (kg)</option>
            </select>
          </label>
          <div class="oath">
            <label class="check-line"><input type="checkbox" required> Je m'engage à ne saisir que des résultats réels. Tricher ici, c'est tricher avec moi-même.</label>
          </div>
          <button class="btn primary lg">Créer mon personnage</button>
        </form>
      </div>`;
  },
};
App.actions.obDomain = el => {
  document.querySelector('.ob-other').hidden = el.value !== 'other';
};
App.forms.onboard = (fd) => {
  const s = App.state;
  s.profile = {
    name: String(fd.get('name')).trim(),
    proDomain: fd.get('proDomain'),
    proDomainName: fd.get('proDomain') === 'other' ? (String(fd.get('proDomainName') || '').trim() || 'Mon métier') : GAME.proDomains.it.name,
    createdAt: Date.now(),
  };
  s.settings.squatUnit = fd.get('squatUnit');
  App.save();
  App.toast('<b>Personnage créé.</b><small>Commence par tes tests de référence : pompes, squats, gainage.</small>');
  App.go('#/sport');
};
