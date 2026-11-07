/* Métier : arbre de compétences avec tests, missions pratiques, réalisations réelles */
Views.pro = {
  render() {
    const s = App.state;
    const info = Engine.domainLevel(s, 'pro');
    const b = Engine.bank(s);
    const now = Date.now();

    const tree = b ? b.subdomains.map(sd => {
      const q = Engine.quizState(s, sd.id);
      const maxTier = sd.tiers.length - 1;
      const locked = q.lockUntil > now;
      const stars = Array.from({ length: maxTier }, (_, i) => `<span class="star ${i < q.tier ? 'on' : ''}">★</span>`).join('');
      const missions = sd.missions.map(m => ({ id: `pro-${sd.id}-${m.tier}`, domain: 'pro', sub: sd.id, subName: sd.name, minTier: m.tier, xp: m.xp, text: m.text }));
      return `<div class="card skill ${q.tier >= maxTier ? 'mastered' : ''}">
        <div class="sk-head"><span class="sk-ico">${sd.icon}</span><div><h3>${sd.name}</h3><div class="stars">${stars}</div></div></div>
        <p class="muted small">${q.tier ? `Validé : ${b.tierNames[q.tier]}` : 'Non évalué'}</p>
        ${q.tier >= maxTier ? '<div class="pill ok">Maîtrisé ✔</div>'
          : locked ? `<button class="btn" disabled>⏳ Réessai dans ${U.fmtRemaining(q.lockUntil - now)}</button>`
          : `<button class="btn primary" data-act="quizStart" data-sub="${sd.id}">Passer le test : ${b.tierNames[q.tier + 1]}</button>`}
        <details class="sk-missions"><summary>Missions pratiques (${missions.filter(m => s.missions[m.id]).length}/${missions.length})</summary>${UI.missions(missions)}</details>
      </div>`;
    }).join('') : '';

    const ach = s.pro.achievements.slice().sort((a, c) => c.ts - a.ts);

    return `
      <header class="page-head">
        <p class="eyebrow">💼 Métier · ${U.esc(s.profile.proDomainName)} · Niv. ${info.level} · ${U.esc(Engine.title('pro', info.level))}</p>
        <h1>Tes compétences, prouvées.</h1>
        ${UI.xpBar(info, 'pro')}
        <p class="muted small">${U.fmtNum(info.into)} / ${U.fmtNum(info.need)} XP avant le niveau ${info.level + 1}</p>
      </header>

      ${b ? `
        <div class="callout small">🧪 Chaque test : ${b.questionsPerQuiz} questions, ${b.passScore} bonnes réponses pour valider. Un échec, ou un test abandonné, bloque le sous-domaine ${b.cooldownHours} h : révise avant de retenter. Chaque palier validé débloque une mission pratique à faire pour de vrai.</div>
        <section class="grid3">${tree}</section>`
      : `<div class="callout">Les tests de connaissances ne sont pas encore disponibles pour « ${U.esc(s.profile.proDomainName)} ». Tu peux déjà gagner de l'XP Métier avec tes réalisations réelles ci-dessous. Pour ajouter une banque de questions, crée un fichier sur le modèle de <code>js/data/quiz-it.js</code>.</div>`}

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>🏆 Déclarer une réalisation réelle</h2></div>
          <form data-form="achievement" class="stack-form">
            <label>Type<select name="type">${Object.entries(GAME.achievementTypes).map(([k, t]) => `<option value="${k}">${t.label} (+${t.xp} XP)</option>`).join('')}</select></label>
            <label>Intitulé<input name="title" required maxlength="100" placeholder="Ex. CCNA 200-301, refonte de l'API facturation…"></label>
            <label>Preuve / détail<input name="proof" required minlength="10" maxlength="240" placeholder="Numéro de certif, lien du dépôt, ce que tu as livré…"></label>
            <button class="btn primary">Enregistrer</button>
          </form>
        </div>
        <div class="card">
          <div class="card-head"><h2>📜 Palmarès</h2><span class="muted small">${ach.length}</span></div>
          ${ach.length ? `<ul class="log">${ach.map(a => `<li><span>${U.esc(GAME.achievementTypes[a.type]?.label || a.type)}</span><strong>${U.esc(a.title)}</strong><small>${U.fmtDate(a.ts)} · ${U.esc(a.proof)}</small></li>`).join('')}</ul>`
            : '<p class="empty-hint">Rien encore. Une formation finie, un projet livré, une certif : tout ce qui est réel compte.</p>'}
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>🎯 Missions Métier</h2></div>
        ${UI.missions(GAME.missions.filter(m => m.domain === 'pro'))}
      </section>`;
  },
};

App.forms.achievement = (fd) => {
  const type = fd.get('type');
  const t = GAME.achievementTypes[type];
  const title = String(fd.get('title') || '').trim();
  const proof = String(fd.get('proof') || '').trim();
  if (!t || !title || proof.length < 10) return;
  const id = U.uid();
  App.state.pro.achievements.push({ id, ts: Date.now(), type, title, proof });
  App.grant('pro', t.xp, `${t.label} : ${title}`, id);
  App.commit();
};

/* ---------- Test de connaissances ---------- */
App.quiz = null;

App.actions.quizStart = el => {
  const s = App.state;
  const b = Engine.bank(s);
  const sd = b && b.subdomains.find(x => x.id === el.dataset.sub);
  if (!sd) return;
  const q = Engine.quizState(s, sd.id);
  if (q.lockUntil > Date.now() || q.tier >= sd.tiers.length - 1) return;
  const tier = q.tier + 1;
  const questions = U.shuffle(sd.tiers[tier]).slice(0, b.questionsPerQuiz).map(x => ({
    q: x.q, e: x.e, opts: U.shuffle(x.a.map((t, i) => ({ t, ok: i === 0 }))),
  }));
  q.lockUntil = Date.now() + b.cooldownHours * 3600000; // abandon = échec
  App.save();
  App.quiz = { sub: sd.id, tier, questions, i: 0, score: 0, picked: null, finished: false };
  App.go('#/quiz/' + sd.id);
};

App.actions.quizAnswer = el => {
  const z = App.quiz;
  if (!z || z.picked !== null) return;
  z.picked = Number(el.dataset.i);
  if (z.questions[z.i].opts[z.picked].ok) z.score++;
  App.render(false);
};

App.actions.quizNext = () => {
  const z = App.quiz;
  if (!z || z.picked === null) return;
  if (z.i < z.questions.length - 1) {
    z.i++; z.picked = null;
    App.render(false);
    return;
  }
  const s = App.state;
  const b = Engine.bank(s);
  const sd = b.subdomains.find(x => x.id === z.sub);
  const q = Engine.quizState(s, z.sub);
  z.finished = true;
  z.passed = z.score >= b.passScore;
  q.attempts.push({ ts: Date.now(), tier: z.tier, score: z.score, total: z.questions.length, passed: z.passed });
  if (z.passed) {
    q.tier = z.tier;
    q.lockUntil = 0;
    App.grant('pro', GAME.xp.quizTier[z.tier], `Test ${sd.name} — ${b.tierNames[z.tier]} validé (${z.score}/${z.questions.length})`);
  } else {
    App.grant('pro', GAME.xp.quizFail, `Tentative ${sd.name} (${z.score}/${z.questions.length})`);
  }
  App.commit();
};

Views.quiz = {
  render([sub]) {
    const z = App.quiz;
    const b = Engine.bank(App.state);
    const sd = b && b.subdomains.find(x => x.id === sub);
    if (!z || z.sub !== sub || !sd) {
      return `<div class="card center"><p>Aucun test en cours.</p><a class="btn" href="#/pro">Retour au Métier</a></div>`;
    }
    if (z.finished) {
      const m = sd.missions.find(x => x.tier === z.tier);
      return `<div class="card quiz-result ${z.passed ? 'win' : 'lose'}">
        <p class="eyebrow">${sd.icon} ${sd.name} · ${b.tierNames[z.tier]}</p>
        <div class="score-big">${z.score}<small>/${z.questions.length}</small></div>
        <h2>${z.passed ? 'Palier validé !' : 'Pas encore.'}</h2>
        <p class="muted">${z.passed ? `+${GAME.xp.quizTier[z.tier]} XP Métier.` : `Il fallait ${b.passScore} bonnes réponses. Relis les explications, révise, et retente dans ${b.cooldownHours} h.`}</p>
        ${z.passed && m ? `<div class="callout">🎯 <strong>Mission débloquée :</strong> ${U.esc(m.text)} <small>(+${m.xp} XP quand tu l'auras faite pour de vrai)</small></div>` : ''}
        <a class="btn primary" href="#/pro">Retour à l'arbre de compétences</a>
      </div>`;
    }
    const cur = z.questions[z.i];
    const answered = z.picked !== null;
    return `<div class="card quiz">
      <div class="quiz-top"><span class="eyebrow">${sd.icon} ${sd.name} · ${b.tierNames[z.tier]}</span><span class="pill">${z.i + 1} / ${z.questions.length}</span></div>
      <div class="quiz-progress"><span style="width:${((z.i + (answered ? 1 : 0)) / z.questions.length) * 100}%"></span></div>
      <h2 class="quiz-q">${U.esc(cur.q)}</h2>
      <div class="quiz-opts">${cur.opts.map((o, i) => {
        let cls = '';
        if (answered) cls = o.ok ? 'right' : i === z.picked ? 'wrong' : 'dim';
        return `<button class="opt ${cls}" data-act="quizAnswer" data-i="${i}" ${answered ? 'disabled' : ''}><span class="opt-l">${'ABCD'[i]}</span>${U.esc(o.t)}</button>`;
      }).join('')}</div>
      ${answered ? `<div class="explain ${cur.opts[z.picked].ok ? 'ok' : 'ko'}"><strong>${cur.opts[z.picked].ok ? '✔ Correct' : '✘ Raté'}</strong> ${U.esc(cur.e)}</div>
        <button class="btn primary" data-act="quizNext">${z.i < z.questions.length - 1 ? 'Question suivante' : 'Voir le résultat'}</button>` : ''}
    </div>`;
  },
};
