/* Esprit : bibliothèque de contenus par thèmes, mini tests, notes, contributions */
const INTEL_TABS = [['pour-toi', 'Pour toi'], ['explorer', 'Tout explorer'], ['top', 'Les meilleurs'], ['proposer', 'Proposer']];

Views.intel = {
  filter: 'all',
  period: 7,
  order: {},   // ordre mélangé des réponses, par contenu
  result: null,

  render([tab = 'pour-toi', id]) {
    const s = App.state;
    if (tab === 'test') return this.testHtml(id);
    if (!INTEL_TABS.some(t => t[0] === tab)) tab = 'pour-toi';
    this.tab = tab;
    const themes = s.profile.themes || [];
    const done = Engine.doneContents(s);
    const body = (this.editThemes || themes.length !== 3) && tab === 'pour-toi' ? this.themePicker() : this['tab_' + tab.replace('-', '_')]();
    return `
      ${UI.pageHead('intel', 'Nourris ton esprit.')}
      <section class="grid3 kpis">
        <div class="card kpi"><div class="kpi-v">${done.length}</div><div class="muted small">contenu${done.length > 1 ? 's' : ''} validé${done.length > 1 ? 's' : ''}</div></div>
        <div class="card kpi"><div class="kpi-v">${Math.round(done.reduce((a, c) => a + (c.minutes || 0), 0) / 60)} h</div><div class="muted small">de lecture et de visionnage</div></div>
        <div class="card kpi"><div class="kpi-v">${new Set(done.map(c => c.theme)).size}</div><div class="muted small">thème${new Set(done.map(c => c.theme)).size > 1 ? 's' : ''} exploré${new Set(done.map(c => c.theme)).size > 1 ? 's' : ''}</div></div>
      </section>
      ${UI.tabs('intel', INTEL_TABS, tab)}
      ${body}`;
  },

  tag(themeId) {
    const t = Library.theme(themeId);
    return `<span class="theme-tag" style="--tc:${t.color}">${U.esc(t.name)}</span>`;
  },
  stars(avg, n) {
    if (!n) return '<span class="stars-ro none">Pas encore noté</span>';
    const full = Math.round(avg);
    return `<span class="stars-ro" title="${avg.toFixed(1)} / 5">${'★'.repeat(full)}<i>${'★'.repeat(5 - full)}</i> <small>${avg.toFixed(1)} · ${n} avis</small></span>`;
  },

  /* Fiche d'un contenu : étiquette de thème, résumé, lien, test, note */
  card(c) {
    const s = App.state;
    const d = s.intel.done[c.id];
    const mine = c.by && c.by.id === s.id;
    const lock = (s.intel.locks[c.id] || 0) > Date.now();
    const r = Library.rating(c.id);
    const my = Library.myRating(s, c.id);
    return `<article class="lib-card ${d ? 'done' : ''}">
      <div class="lib-top">${this.tag(c.theme)}<span class="lib-type">${CONTENT_TYPES[c.type]} · ${c.minutes >= 90 ? Math.round(c.minutes / 60) + ' h' : c.minutes + ' min'}</span><span class="lib-xp">+${Library.xp(c)} XP</span></div>
      <h3>${U.esc(c.title)}</h3>
      <div class="lib-author">${U.esc(c.author || '')}${c.by ? ` · proposé par ${U.esc(c.by.name)}` : ''}</div>
      <p class="lib-summary">${U.esc(c.summary)}</p>
      <div class="lib-rating">${this.stars(r.avg, r.n)}</div>
      ${d ? `<div class="lib-done">${Icons.get('check', 16)} Validé ${d.score}/${d.total} le ${U.fmtShort(d.ts)}
          <span class="rate" role="group" aria-label="Ta note">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= my ? 'on' : ''}" data-act="libRate" data-id="${U.esc(c.id)}" data-n="${n}" aria-label="${n} étoile${n > 1 ? 's' : ''}">★</button>`).join('')}</span></div>`
        : `<div class="lib-actions">
          <a class="btn sm" href="${U.esc(Library.url(c))}" target="_blank" rel="noopener noreferrer">${c.type === 'book' ? 'Trouver le livre' : 'Ouvrir'} ${Icons.get('link', 13)}</a>
          ${mine ? '<span class="pill">Ta contribution</span>'
            : lock ? `<button class="btn sm" disabled>Test dans ${U.fmtRemaining(s.intel.locks[c.id] - Date.now())}</button>`
            : `<a class="btn primary sm" href="#/intel/test/${encodeURIComponent(c.id)}">J'ai fini : passer le test</a>`}
        </div>`}
      ${mine ? `<button class="icon-btn lib-del" data-act="libRemove" data-id="${U.esc(c.id)}" aria-label="Retirer ma contribution">✕</button>` : ''}
    </article>`;
  },
  grid(list, emptyMsg) {
    return list.length ? `<div class="lib-grid">${list.map(c => this.card(c)).join('')}</div>` : `<p class="empty-hint">${emptyMsg}</p>`;
  },

  themePicker() {
    const cur = App.state.profile.themes || [];
    return `<section class="card">
      <div class="card-head"><h2>Choisis tes 3 thèmes</h2></div>
      <p class="muted small">La bibliothèque te proposera en priorité des livres et des vidéos sur ces sujets. Tu pourras en changer.</p>
      <form data-form="themes" class="stack-form">
        <div class="theme-pick">${THEMES.map(t => `<label class="theme-opt" style="--tc:${t.color}"><input type="checkbox" name="themes" value="${t.id}" ${cur.includes(t.id) ? 'checked' : ''}><span>${U.esc(t.name)}</span></label>`).join('')}</div>
        <button class="btn primary" style="align-self:flex-start">Valider mes thèmes</button>
      </form>
    </section>`;
  },

  tab_pour_toi() {
    const s = App.state;
    const themes = s.profile.themes;
    const all = Library.all();
    return themes.map(tid => {
      const t = Library.theme(tid);
      const list = all.filter(c => c.theme === tid).sort((a, b) => (s.intel.done[a.id] ? 1 : 0) - (s.intel.done[b.id] ? 1 : 0) || Library.rating(b.id).avg - Library.rating(a.id).avg);
      return `<section class="stack"><h2 class="section-title"><span class="theme-dot" style="--tc:${t.color}"></span>${U.esc(t.name)} <span class="muted small">${list.filter(c => s.intel.done[c.id]).length}/${list.length}</span></h2>${this.grid(list, 'Aucun contenu pour ce thème. Propose le premier.')}</section>`;
    }).join('') + '<p class="muted small"><a href="#/intel/pour-toi" data-act="themesEdit">Changer mes thèmes</a></p>';
  },

  tab_explorer() {
    const list = Library.all().filter(c => this.filter === 'all' || c.theme === this.filter);
    return `<div class="theme-filter"><button class="${this.filter === 'all' ? 'on' : ''}" data-act="libFilter" data-t="all">Tous</button>${THEMES.map(t => `<button class="${this.filter === t.id ? 'on' : ''}" style="--tc:${t.color}" data-act="libFilter" data-t="${t.id}">${U.esc(t.name)}</button>`).join('')}</div>
      ${this.grid(list, 'Aucun contenu pour ce thème.')}`;
  },

  tab_top() {
    const top = Library.top(this.period);
    return `<section class="card">
      <div class="card-head"><h2>Les mieux notés</h2>
        <div class="seg">${[[7, 'Cette semaine'], [30, 'Ce mois'], [0, 'Depuis toujours']].map(([d, l]) => `<button class="${this.period === d ? 'on' : ''}" data-act="libPeriod" data-d="${d}">${l}</button>`).join('')}</div>
      </div>
      ${top.length ? `<ol class="top-list">${top.map(({ c, r }, i) => `<li><span class="medal m${Math.min(i + 1, 4)}">${i + 1}</span>
          <div><strong>${U.esc(c.title)}</strong><small class="muted block">${this.tag(c.theme)} ${CONTENT_TYPES[c.type]} · ${U.esc(c.author || '')}</small></div>
          ${this.stars(r.avg, r.n)}</li>`).join('')}</ol>`
        : '<p class="empty-hint">Aucune note sur cette période. Valide un contenu puis note-le : le classement se construit avec les avis des joueurs.</p>'}
      <p class="muted small">Le classement compte les notes des joueurs de cet appareil. Il deviendra commun à tous quand le serveur sera en place.</p>
    </section>`;
  },

  tab_proposer() {
    const s = App.state;
    const mine = Library.contributions().filter(c => c.by && c.by.id === s.id);
    return `<section class="cols">
      <div class="card">
        <div class="card-head"><h2>Proposer un contenu</h2></div>
        <p class="muted small">Un livre, une vidéo, un podcast ou un article qui t'a vraiment appris quelque chose. Écris le résumé et le test : les autres joueurs le trouveront dans la bibliothèque. +${GAME.xp.contribution} XP Esprit.</p>
        <form data-form="libPropose" class="stack-form">
          <div class="row">
            <label>Type<select name="type">${Object.entries(CONTENT_TYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
            <label>Thème<select name="theme">${THEMES.map(t => `<option value="${t.id}">${U.esc(t.name)}</option>`).join('')}</select></label>
          </div>
          <label>Titre<input name="title" required maxlength="120"></label>
          <div class="row">
            <label>Auteur ou chaîne<input name="author" maxlength="80"></label>
            <label>Durée (min)<input name="minutes" type="number" min="1" max="3000" required></label>
          </div>
          <label>Lien (optionnel pour un livre)<input name="url" type="url" placeholder="https://…" maxlength="300"></label>
          <label>Résumé (ce qu'on y apprend, sans tout dévoiler)<textarea name="summary" rows="4" required minlength="80" maxlength="700"></textarea></label>
          ${[1, 2, 3].map(i => `<fieldset class="q-set"><legend>Question ${i}</legend>
            <input name="q${i}" required maxlength="200" placeholder="La question">
            <input name="q${i}a" required maxlength="140" placeholder="Bonne réponse" class="good">
            <input name="q${i}b" required maxlength="140" placeholder="Mauvaise réponse">
            <input name="q${i}c" required maxlength="140" placeholder="Mauvaise réponse">
          </fieldset>`).join('')}
          <button class="btn primary">Ajouter à la bibliothèque</button>
        </form>
      </div>
      <div class="stack">
        <div class="card">
          <div class="card-head"><h2>Mes contributions</h2><span class="muted small">${mine.length}</span></div>
          ${mine.length ? `<ul class="log">${mine.map(c => { const r = Library.rating(c.id); return `<li><span>${U.esc(Library.theme(c.theme).name)} · ${CONTENT_TYPES[c.type]}</span><strong>${U.esc(c.title)}</strong><small>${r.n ? `${r.avg.toFixed(1)} / 5 · ${r.n} avis` : 'Pas encore noté'}</small></li>`; }).join('')}</ul>`
            : '<p class="empty-hint">Tu n\'as encore rien proposé.</p>'}
        </div>
        <div class="card">
          <div class="card-head"><h2>Partager entre joueurs</h2></div>
          <p class="muted small">En attendant le serveur commun, les contributions circulent par fichier : exporte les tiennes, importe celles de tes amis.</p>
          <div class="btn-col">
            <button class="btn" data-act="libExport" ${mine.length ? '' : 'disabled'}>Exporter mes contributions</button>
            <label class="btn">Importer un pack de contenus<input type="file" accept="application/json,.json" data-change="libImport" hidden></label>
          </div>
        </div>
      </div>
    </section>`;
  },

  /* ---------- Mini test ---------- */
  testHtml(rawId) {
    const s = App.state;
    const id = decodeURIComponent(rawId || '');
    const c = Library.byId(id);
    if (!c) return `<div class="card center"><p>Contenu introuvable.</p><a class="btn" href="#/intel">Retour à la bibliothèque</a></div>`;
    const res = this.result && this.result.id === id ? this.result : null;
    if (res) {
      const my = Library.myRating(s, id);
      return `<div class="card quiz-result">
        <p class="eyebrow">${this.tag(c.theme)} ${CONTENT_TYPES[c.type]}</p>
        <div class="score-big">${res.score}<small>/${res.total}</small></div>
        <h2>${res.passed ? 'Contenu validé' : 'Pas encore'}</h2>
        <p class="muted">${res.passed ? `+${Library.xp(c)} XP Esprit pour « ${U.esc(c.title)} ».` : `Il fallait ${Library.passScore(c)} bonnes réponses. Reprends le contenu : tu pourras retenter dans 1 h.`}</p>
        ${res.passed ? `<div class="rate-box"><p>Qu'en as-tu pensé ? Ta note aide les autres joueurs.</p>
          <span class="rate big">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= my ? 'on' : ''}" data-act="libRate" data-id="${U.esc(id)}" data-n="${n}" aria-label="${n} étoile${n > 1 ? 's' : ''}">★</button>`).join('')}</span></div>` : ''}
        <a class="btn primary" href="#/intel">Retour à la bibliothèque</a>
      </div>`;
    }
    if (s.intel.done[id] || (c.by && c.by.id === s.id) || (s.intel.locks[id] || 0) > Date.now()) {
      return `<div class="card center"><p>Ce test n'est pas disponible pour l'instant.</p><a class="btn" href="#/intel">Retour à la bibliothèque</a></div>`;
    }
    if (!this.order[id]) this.order[id] = c.quiz.map(q => U.shuffle(q.a.map((t, i) => ({ t, ok: i === 0 }))));
    return `<form class="card quiz" data-form="libTest" data-id="${U.esc(id)}">
      <div class="quiz-top"><span class="eyebrow">${this.tag(c.theme)} ${CONTENT_TYPES[c.type]}</span><span class="pill">${c.quiz.length} questions</span></div>
      <h2 class="quiz-q">${U.esc(c.title)}</h2>
      <p class="muted small">Un test rapide pour vérifier que tu l'as bien ${c.type === 'book' ? 'lu' : 'suivi'}. ${Library.passScore(c)} bonnes réponses sur ${c.quiz.length} pour valider. En cas d'échec, nouveau test possible dans 1 h.</p>
      ${c.quiz.map((q, i) => `<fieldset class="q-block"><legend>${i + 1}. ${U.esc(q.q)}</legend>
        ${this.order[id][i].map((o, j) => `<label class="q-opt"><input type="radio" name="q${i}" value="${j}" required><span>${U.esc(o.t)}</span></label>`).join('')}
      </fieldset>`).join('')}
      <div class="row"><a class="btn ghost" href="#/intel">Annuler</a><button class="btn primary">Valider mes réponses</button></div>
    </form>`;
  },
};

/* ---------- Actions ---------- */
App.forms.themes = fd => {
  const picked = fd.getAll('themes').filter(t => THEMES.some(x => x.id === t));
  if (picked.length !== 3) { App.toast('Choisis exactement 3 thèmes.', 'warn'); return; }
  App.state.profile.themes = picked;
  Views.intel.editThemes = false;
  App.commit();
};
App.actions.themesEdit = () => { Views.intel.editThemes = true; App.render(false); };
App.actions.libFilter = el => { Views.intel.filter = el.dataset.t; App.render(false); };
App.actions.libPeriod = el => { Views.intel.period = Number(el.dataset.d); App.render(false); };
App.actions.libRate = el => {
  Library.rate(App.state, el.dataset.id, Number(el.dataset.n));
  App.toast('Merci pour ta note.');
  App.commit();
};
App.actions.libRemove = el => {
  const c = Library.byId(el.dataset.id);
  if (!c || !c.by || c.by.id !== App.state.id || !confirm(`Retirer « ${c.title} » de la bibliothèque ?`)) return;
  Library.remove(c.id);
  App.render(false);
};

App.forms.libTest = (fd, form) => {
  const s = App.state;
  const id = form.dataset.id;
  const c = Library.byId(id);
  const order = Views.intel.order[id];
  if (!c || !order || s.intel.done[id]) return;
  let score = 0;
  c.quiz.forEach((q, i) => { if (order[i][Number(fd.get('q' + i))]?.ok) score++; });
  const passed = score >= Library.passScore(c);
  delete Views.intel.order[id];
  Views.intel.result = { id, score, total: c.quiz.length, passed };
  if (passed) {
    s.intel.done[id] = { ts: Date.now(), score, total: c.quiz.length };
    App.grant('intel', Library.xp(c), `${CONTENT_TYPES[c.type]} validé : ${c.title}`, 'lib-' + id);
  } else {
    s.intel.locks[id] = Date.now() + 3600000;
  }
  App.commit();
  window.scrollTo(0, 0);
};

App.forms.libPropose = fd => {
  const s = App.state;
  const g = k => String(fd.get(k) || '').trim();
  const item = Library.add({
    id: 'u-' + U.uid(), type: g('type'), theme: g('theme'), title: g('title'), author: g('author'), minutes: g('minutes'), url: g('url'), summary: g('summary'),
    quiz: [1, 2, 3].map(i => ({ q: g('q' + i), a: [g(`q${i}a`), g(`q${i}b`), g(`q${i}c`)] })),
    by: { id: s.id, name: s.profile.name }, ts: Date.now(),
  });
  if (!item) { App.toast('Contenu incomplet : vérifie le résumé (80 caractères min.) et les 3 questions.', 'warn'); return; }
  const today = U.dayKey();
  const rewarded = s.xpLog.filter(e => e.ref && String(e.ref).startsWith('contrib-') && U.dayKey(e.ts) === today).length;
  if (rewarded < 2) App.grant('intel', GAME.xp.contribution, `Contribution à la bibliothèque : ${item.title}`, 'contrib-' + item.id);
  else App.toast('Contenu ajouté. L\'XP de contribution est limitée à 2 par jour.');
  Views.intel.filter = item.theme;
  App.commit();
  App.go('#/intel/explorer');
};

App.actions.libExport = () => {
  const s = App.state;
  const items = Library.contributions().filter(c => c.by && c.by.id === s.id);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ app: 'play-your-life-contents', v: 1, items }, null, 1)], { type: 'application/json' }));
  a.download = `contenus-${(s.profile.name || 'joueur').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
App.actions.libImport = async el => {
  const f = el.files && el.files[0];
  el.value = '';
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (data.app !== 'play-your-life-contents' || !Array.isArray(data.items)) throw new Error('ce n\'est pas un pack de contenus');
    let n = 0;
    for (const c of data.items.slice(0, 200)) if (Library.add(c)) n++;
    App.toast(`<b>${n} contenu${n > 1 ? 's' : ''} ajouté${n > 1 ? 's' : ''}</b> à la bibliothèque.`);
    App.render(false);
  } catch (e) {
    App.toast('Import impossible : ' + U.esc(e.message), 'warn');
  }
};
