/* Métier : carte de compétences (radar), trajectoire de poste, tests par thématique */
Views.pro = {
  render() {
    const s = App.state;
    const info = Engine.domainLevel(s, 'pro');
    const b = Engine.bank(s);
    const now = Date.now();
    const jobs = JOBS[s.profile.proDomain] || [];
    const cur = jobs.find(j => j.id === s.pro.currentJob);
    const tgt = jobs.find(j => j.id === s.pro.targetJob);
    const maxTier = b ? b.tierNames.length - 1 : 5;
    const jobSelect = (name, value, custom) => jobs.length
      ? `<select name="${name}" data-change="jobSet"><option value="">— Choisir —</option>${jobs.map(j => `<option value="${j.id}" ${value === j.id ? 'selected' : ''}>${U.esc(j.name)}</option>`).join('')}</select>`
      : `<input name="${name}" value="${U.esc(custom || '')}" maxlength="60" data-change="jobSet" placeholder="Intitulé du poste">`;

    /* Écart avec le poste visé : compétences à monter, de la plus grosse marche à la plus petite */
    const gaps = b && tgt ? b.subdomains.map(sd => ({ sd, have: Engine.quizState(s, sd.id).tier, need: tgt.req[sd.id] || 0 }))
      .filter(g => g.need > g.have).sort((a, c) => (c.need - c.have) - (a.need - a.have)) : [];
    const ready = b && tgt && !gaps.length;

    const tree = b ? b.subdomains.map(sd => {
      const q = Engine.quizState(s, sd.id);
      const max = sd.tiers.length - 1;
      const locked = q.lockUntil > now;
      const need = tgt ? tgt.req[sd.id] || 0 : 0;
      const pips = Array.from({ length: max }, (_, i) => `<span class="pip ${i < q.tier ? 'on' : ''} ${i >= q.tier && i < need ? 'goal' : ''}" title="${b.tierNames[i + 1]}"></span>`).join('');
      return `<div class="card skill ${q.tier >= max ? 'mastered' : ''}">
        <div class="sk-head"><span class="sk-ico">${sd.icon}</span><div><h3>${sd.name}</h3><div class="pips">${pips}</div></div></div>
        <p class="muted small">${q.tier ? `${b.tierNames[q.tier]} validé` : 'Non évalué'}${need > q.tier ? ` · visé : ${b.tierNames[need]}` : ''}</p>
        ${q.tier >= max ? '<div class="pill ok">Maîtrisé</div>'
          : locked ? `<button class="btn" disabled>Réessai dans ${U.fmtRemaining(q.lockUntil - now)}</button>`
          : `<button class="btn ${need > q.tier ? 'primary' : ''}" data-act="quizStart" data-sub="${sd.id}">Test ${q.tier + 1}/${max} : ${b.tierNames[q.tier + 1]}</button>`}
      </div>`;
    }).join('') : '';

    return `
      <header class="page-head">
        <p class="eyebrow">${GAME.domains.pro.icon} Métier · ${U.esc(s.profile.proDomainName)} · Niv. ${info.level} · ${U.esc(Engine.title('pro', info.level))}</p>
        <h1>Tes compétences, prouvées.</h1>
        ${UI.xpBar(info, 'pro')}
        <p class="muted small">${U.fmtNum(info.into)} / ${U.fmtNum(info.need)} XP avant le niveau ${info.level + 1}</p>
      </header>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Carte de compétences</h2><span class="muted small">paliers validés sur ${maxTier}</span></div>
          ${b ? `<div id="ch-radar"></div>
            <div class="legend"><span class="lg-cur">Mon niveau</span>${tgt ? `<span class="lg-tgt">${U.esc(tgt.name)}</span>` : ''}</div>`
            : '<p class="empty-hint">La carte de compétences apparaîtra quand une banque de tests existera pour ton domaine.</p>'}
        </div>

        <div class="card">
          <div class="card-head"><h2>Trajectoire</h2></div>
          <form class="stack-form" onsubmit="return false">
            <label>Poste actuel${jobSelect('currentJob', s.pro.currentJob, s.pro.currentJobText)}</label>
            <label>Poste visé${jobSelect('targetJob', s.pro.targetJob, s.pro.targetJobText)}</label>
          </form>
          ${!b ? '' : !tgt ? '<p class="muted small" style="margin-top:14px">Choisis le poste que tu vises : le radar te montrera l\'écart à combler.</p>'
            : ready ? `<div class="callout" style="margin-top:14px">Tu as le niveau de compétences attendu pour <strong>${U.esc(tgt.name)}</strong>. Il reste à le prouver en vrai : projets, entretiens, certification.</div>`
            : `<h3>À combler pour devenir ${U.esc(tgt.name)}</h3>
              <ul class="gaps">${gaps.map(g => `<li><span>${g.sd.icon} ${g.sd.name}</span><span class="gap-bar">${Array.from({ length: maxTier }, (_, i) => `<i class="${i < g.have ? 'on' : i < g.need ? 'goal' : ''}"></i>`).join('')}</span><small>${g.need - g.have} palier${g.need - g.have > 1 ? 's' : ''}</small></li>`).join('')}</ul>
              <p class="next-step">Prochaine étape : <strong>test ${U.esc(gaps[0].sd.name)} — ${b.tierNames[gaps[0].have + 1]}</strong></p>`}
          <p class="muted small">Bientôt : un chemin de progression et des certifications proposés automatiquement selon ton profil.</p>
        </div>
      </section>

      ${b ? `
        <div class="callout small">${maxTier} QCM par thématique, du niveau Fondamentaux au niveau Maître. ${b.questionsPerQuiz} questions par test, ${b.passScore} bonnes réponses pour valider. Un échec ou un abandon bloque la thématique ${b.cooldownHours} h. Les paliers validés débloquent des contrats d'Orin dans l'onglet Quêtes.</div>
        <section class="grid3">${tree}</section>`
      : `<div class="callout">Les tests ne sont pas encore disponibles pour « ${U.esc(s.profile.proDomainName)} ». Pour ajouter une banque de questions, crée un fichier sur le modèle de <code>js/data/quiz-it.js</code>.</div>`}`;
  },

  mount() {
    const s = App.state;
    const b = Engine.bank(s);
    const el = document.getElementById('ch-radar');
    if (!b || !el) return;
    const tgt = (JOBS[s.profile.proDomain] || []).find(j => j.id === s.pro.targetJob);
    const series = [{ label: 'Mon niveau', color: 'var(--c-pro)', values: b.subdomains.map(sd => Engine.quizState(s, sd.id).tier), fill: true }];
    if (tgt) series.push({ label: tgt.name, color: 'var(--gold)', values: b.subdomains.map(sd => tgt.req[sd.id] || 0), dash: true });
    Charts.radar(el, { axes: b.subdomains.map(sd => sd.name), max: b.tierNames.length - 1, series, levels: b.tierNames });
  },
};

App.actions.jobSet = el => {
  const p = App.state.pro;
  const jobs = JOBS[App.state.profile.proDomain];
  if (jobs) p[el.name] = el.value || null;
  else p[el.name + 'Text'] = String(el.value || '').trim().slice(0, 60);
  App.save();
  App.render(false);
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
        ${z.passed && m ? `<div class="callout"><strong>Orin te confie un contrat :</strong> ${U.esc(m.text)} <small>(+${m.xp} XP quand tu l'auras faite pour de vrai)</small></div>` : ''}
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
      ${answered ? `<div class="explain ${cur.opts[z.picked].ok ? 'ok' : 'ko'}"><strong>${cur.opts[z.picked].ok ? 'Correct' : 'Raté'}</strong> ${U.esc(cur.e)}</div>
        <button class="btn primary" data-act="quizNext">${z.i < z.questions.length - 1 ? 'Question suivante' : 'Voir le résultat'}</button>` : ''}
    </div>`;
  },
};
