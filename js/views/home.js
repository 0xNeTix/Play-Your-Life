/* QG : vue d'ensemble épurée — niveaux, tâches du jour, régularité, PNJ, boss */
Views.home = {
  render() {
    const s = App.state;
    const tasks = Engine.questsToday(s);
    const doneN = tasks.filter(q => q.done).length;
    const streak = Engine.streak(s);
    const cl = Engine.charLevel(s);
    const boss = s.boss && s.boss.week === U.weekKey() ? s.boss : null;
    const gs = Events.giftState(s);
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const weekW = Engine.workoutsInWeek(s).length;
    const goal = s.settings.weeklyGoal;
    const arcs = [...Engine.activeArcs(s), ...ARCS.filter(a => s.npc.arcs[a.id]?.status === 'ready')];
    const contracts = Engine.allMissions(s).filter(m => !s.missions[m.id] && Engine.missionUnlocked(s, m)).length;

    const domainCards = GAME.domainOrder.map(d => {
      const info = Engine.domainLevel(s, d);
      const dd = GAME.domains[d];
      return `<a class="card dom-card dom-${d}" href="#/${dd.route}">
        <div class="dc-head"><span class="dc-ico">${dd.icon}</span><span class="dc-name">${dd.name}</span><span class="dc-lvl">${info.level}</span></div>
        <div class="dc-title">${U.esc(Engine.title(d, info.level))}</div>
        ${UI.xpBar(info, d)}
        <div class="dc-foot">${U.fmtNum(info.into)} / ${U.fmtNum(info.need)} XP</div>
      </a>`;
    }).join('');

    const taskRows = tasks.map(q => `
      <li class="quest ${q.done ? 'done' : ''}">
        <button class="check" data-act="questDone" data-id="${q.id}" ${q.done ? 'disabled' : ''} aria-label="Fait"></button>
        <div class="q-main"><div class="q-text">${U.esc(q.text)}</div><div class="q-meta"><span class="q-dom dom-${q.domain}">${GAME.domains[q.domain].icon}${GAME.domains[q.domain].name}</span><span class="q-xp">+${q.xp || GAME.customQuestXp} XP</span></div></div>
        ${q.done ? '' : `<button class="icon-btn" data-act="timer" data-text="${U.esc(q.text)}" title="Lancer 5 minutes">${Icons.get('timer', 17)}</button><button class="icon-btn" data-act="questDel" data-id="${q.id}" aria-label="Supprimer">✕</button>`}
      </li>`).join('');

    return `
      <header class="page-head">
        <p class="eyebrow">${U.esc(today)}</p>
        <h1>Salut ${U.esc(s.profile.name)}. Qu'est-ce que tu fais <em>aujourd'hui</em> ?</h1>
      </header>

      <section class="grid4">${domainCards}</section>

      <section class="cols">
        <div class="stack">
          <div class="mini-grid">
            <div class="card streak-card">
              <div class="streak-n">${Icons.get('flame', 24)}${streak}</div>
              <div><strong>jour${streak > 1 ? 's' : ''} de série</strong><p class="muted small">Record : ${Engine.bestStreak(s)} j</p></div>
            </div>
            <a class="card streak-card" href="#/sport/seances">
              <div class="streak-n">${Icons.get('sport', 24)}${weekW}/${goal}</div>
              <div><strong>séances cette semaine</strong><p class="muted small">${Engine.weekStreak(s)} sem. à l'objectif</p></div>
            </a>
          </div>

          <div class="card">
            <div class="card-head"><h2>Tâches à faire</h2><span class="pill ${doneN && doneN === tasks.length ? 'ok' : ''}">${doneN} / ${tasks.length || GAME.maxQuestsPerDay}</span></div>
            ${tasks.length ? `<ul class="quests">${taskRows}</ul>` : '<p class="muted small">Rien pour aujourd\'hui. Ajoute une action que tu peux commencer dans les 5 minutes.</p>'}
            ${tasks.length < GAME.maxQuestsPerDay ? `
              <form data-form="quest" class="task-form">
                <input name="text" list="task-ideas" required maxlength="90" placeholder="Nouvelle tâche…" autocomplete="off">
                <select name="domain" aria-label="Domaine">${UI.domainOptions('discipline')}</select>
                <button class="btn primary" aria-label="Ajouter">＋</button>
                <datalist id="task-ideas">${GAME.questLibrary.map(q => `<option value="${U.esc(q.text)}"></option>`).join('')}</datalist>
              </form>
              <p class="muted small">${GAME.maxQuestsPerDay} tâches maximum, elles s'effacent à minuit.</p>` : ''}
          </div>
        </div>

        <div class="stack">
          <div class="card">
            <div class="card-head"><h2>Quêtes</h2><a href="#/journal">Journal →</a></div>
            ${arcs.length ? `<ul class="arc-mini">${arcs.map(a => {
              const p = Engine.arcProgress(s, a);
              const ready = s.npc.arcs[a.id].status === 'ready';
              return `<li><span class="am-ico">${UI.npcFace(a.npc, 36)}</span><div><strong>${U.esc(a.title)}</strong>
                <div class="xpbar sm"><span style="width:${(p.count / p.steps.length) * 100}%"></span></div>
                <small class="muted">${ready ? 'Retourne voir ' + U.esc(NPCS[a.npc].name) : `${p.count}/${p.steps.length} étapes · ${U.esc(NPCS[a.npc].name)}`}</small></div></li>`;
            }).join('')}</ul>` : '<p class="muted small">Aucune grande quête en cours. Les PNJ apparaissent au hasard quand tu agis.</p>'}
            ${contracts ? `<a class="contract-link" href="#/journal">${Icons.get('target', 16)} ${contracts} contrat${contracts > 1 ? 's' : ''} en attente</a>` : ''}
          </div>

          ${boss ? (() => {
            const def = Events.bossDef(boss);
            const prog = Math.min(Events.bossProgress(s, boss), boss.target);
            const left = Math.max(0, boss.deadline - Date.now());
            const d = Math.floor(left / 86400000), h = Math.floor((left % 86400000) / 3600000);
            return `<div class="card boss ${boss.status}">
              <div class="card-head"><h2>Boss de la semaine</h2><span class="pill ${boss.status === 'won' ? 'ok' : ''}">${boss.status === 'won' ? 'Vaincu' : boss.status === 'lost' ? 'Perdu' : `${d ? d + ' j ' : ''}${h} h`}</span></div>
              <div class="boss-row">
                <div class="npc-portrait sm">${Avatar.svg(def.look, { size: 56, crop: 'face', label: def.name })}</div>
                <div><strong class="boss-name">${U.esc(def.name)}</strong><small class="muted block">${U.esc(def.role)} · niveau ${boss.level}</small></div>
              </div>
              <p class="boss-text">${U.esc(boss.text)}</p>
              <div class="xpbar dom-${boss.domain}"><span style="width:${(prog / boss.target) * 100}%"></span></div>
              <div class="boss-foot"><span>${U.fmtNum(prog)} / ${U.fmtNum(boss.target)}</span><span>${boss.status === 'active' ? `+${boss.xp} XP · échec : série remise à 0` : boss.status === 'won' ? `+${boss.xp} XP gagnés` : 'Série remise à zéro'}</span></div>
            </div>`;
          })() : `<div class="card boss idle">
              <div class="card-head"><h2>Boss de la semaine</h2></div>
              <p class="muted small">Aucun boss pour l'instant. Il en surgit un chaque semaine, avec une quête à ta mesure. Si tu ne la termines pas avant dimanche soir, ta série de jours repart à zéro.</p>
            </div>`}

          <div class="card gifts">
            <div class="card-head"><h2>Récompenses</h2><span class="pill ${gs.available.length ? 'ok' : ''}">${gs.available.length} à prendre</span></div>
            ${gs.available.length ? `<ul class="gift-list">${gs.available.map(g => `<li>${Icons.get('rewards', 20)}<div><strong>${U.esc(g.text)}</strong><small class="muted block">Offerte le ${U.fmtShort(g.ts)}</small></div><button class="btn primary sm" data-act="giftClaim" data-id="${g.id}">Prise</button></li>`).join('')}</ul>` : ''}
            ${gs.available.length < GIFT_RULES.maxAvailable ? `
              <div class="gift-next"><div class="xpbar sm"><span style="width:${Math.min(100, (gs.xp / gs.threshold) * 100)}%"></span></div>
              <small class="muted">${gs.thisWeek >= GIFT_RULES.maxPerWeek ? 'Deux récompenses cette semaine : la prochaine arrivera la semaine suivante.' : `Prochaine récompense : ${U.fmtNum(Math.min(gs.xp, gs.threshold))} / ${U.fmtNum(gs.threshold)} XP`}</small></div>`
              : '<p class="muted small">Prends d\'abord celles-ci : pas plus de deux en attente.</p>'}
          </div>
        </div>
      </section>`;
  },
};

function addQuest(text, domain, xp) {
  const q = Engine.questsToday(App.state);
  if (!text || q.length >= GAME.maxQuestsPerDay || q.some(x => x.text === text)) return;
  q.push({ id: U.uid(), text, domain, xp, done: false });
  App.commit();
}
/* Une tâche tirée des idées garde son domaine et son XP de difficulté */
App.forms.quest = fd => {
  const text = String(fd.get('text') || '').trim();
  const idea = GAME.questLibrary.find(q => q.text === text);
  if (idea) addQuest(idea.text, idea.domain, GAME.questDifficulty[idea.diff].xp);
  else addQuest(text, fd.get('domain'), GAME.customQuestXp);
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
  if (q.domain === 'discipline') App.grant('discipline', xp + GAME.xp.questDiscipline, `Tâche : ${q.text}`);
  else {
    App.grant(q.domain, xp, `Tâche : ${q.text}`);
    App.grant('discipline', GAME.xp.questDiscipline, 'Tâche accomplie');
  }
  const all = Engine.questsToday(s);
  if (all.length === GAME.maxQuestsPerDay && all.every(x => x.done)) App.grant('discipline', GAME.xp.perfectDay, 'Journée parfaite');
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
        <p class="lead">Ici, aucun XP ne s'obtient en planifiant. Tu gagnes des niveaux en faisant de vraies choses : tests physiques, séances, courses, photos hebdomadaires, tests de compétences, livres et vidéos validés par un test, quêtes confiées par des PNJ.</p>
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
          <h3 class="ob-title">Ton métier</h3>
          <label>Domaine professionnel
            <select name="proDomain">
              <option value="it">Informatique</option>
              <option value="" disabled>D'autres domaines arrivent bientôt</option>
            </select>
          </label>
          <div class="row">
            <label>Ton poste actuel
              <select name="currentJob" required><option value="">— Choisir —</option>${JOBS.it.map(j => `<option value="${j.id}">${U.esc(j.name)}</option>`).join('')}<option value="none">Étudiant / en reconversion</option></select>
            </label>
            <label>Le poste que tu vises
              <select name="targetJob" required><option value="">— Choisir —</option>${JOBS.it.map(j => `<option value="${j.id}">${U.esc(j.name)}</option>`).join('')}</select>
            </label>
          </div>
          <h3 class="ob-title">Ton esprit</h3>
          <fieldset class="pick"><legend>Choisis 3 thèmes qui t'attirent : la bibliothèque te proposera des livres et des vidéos dessus</legend>
            <div class="theme-pick">${THEMES.map(t => `<label class="theme-opt" style="--tc:${t.color}"><input type="checkbox" name="themes" value="${t.id}"><span>${U.esc(t.name)}</span></label>`).join('')}</div>
          </fieldset>
          <h3 class="ob-title">Ton corps</h3>
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
App.actions.obCancel = async () => {
  const list = await Store.listProfiles();
  if (list.length) App.switchProfile(list[0].id);
};
App.forms.onboard = async (fd, form) => {
  const s = App.state;
  const height = Math.round(Number(fd.get('height')));
  const weight = Math.round(Number(String(fd.get('weight')).replace(',', '.')) * 10) / 10;
  if (!(height >= 120 && height <= 230) || !(weight >= 30 && weight <= 300)) { App.toast('Taille ou poids invalide.', 'warn'); return; }
  const themes = fd.getAll('themes').filter(t => THEMES.some(x => x.id === t));
  if (themes.length !== 3) { App.toast('Choisis exactement 3 thèmes.', 'warn'); return; }
  form.querySelector('button.primary').disabled = true;
  s.id = U.uid();
  s.profile = {
    name: String(fd.get('name')).trim(),
    proDomain: 'it',
    proDomainName: GAME.proDomains.it.name,
    createdAt: Date.now(),
    height, weight, themes,
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
  s.pro.currentJob = JOBS.it.some(j => j.id === fd.get('currentJob')) ? fd.get('currentJob') : null;
  s.pro.targetJob = JOBS.it.some(j => j.id === fd.get('targetJob')) ? fd.get('targetJob') : null;
  s.settings.squatUnit = fd.get('squatUnit');
  s.settings.runTest = fd.get('runTest');
  s.settings.weeklyGoal = U.clamp(Math.round(Number(fd.get('weeklyGoal')) || 3), 1, 14);
  Store.setActive(s.id);
  await App.save(true);
  App.toast('<b>Personnage créé.</b><small>Dernière étape : ton avatar.</small>');
  App.go('#/avatar/first');
  App.afterProfileLoad();
};
