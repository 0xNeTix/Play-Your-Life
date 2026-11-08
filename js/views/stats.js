/* Stats : fiche personnage et courbes d'évolution */
Views.stats = {
  render() {
    const s = App.state;
    const cl = Engine.charLevel(s);
    const xp = Engine.domainXP(s);
    const exos = Engine.activeExercises(s);
    const maxLvl = Math.max(...GAME.domainOrder.map(d => Engine.domainLevel(s, d).level), 5);
    const days = Math.max(1, Math.ceil((Date.now() - s.profile.createdAt) / 86400000));
    const recent = s.xpLog.slice().sort((a, b) => b.ts - a.ts).slice(0, 40);

    return `
      <header class="page-head">
        <p class="eyebrow">📊 Fiche de personnage</p>
        <h1>${U.esc(s.profile.name)}, niveau ${cl.level}</h1>
        <p class="muted">${U.esc(Engine.title('char', cl.level))} · ${U.fmtNum(Engine.totalXP(s))} XP au total · aventure commencée il y a ${days} jour${days > 1 ? 's' : ''}</p>
      </header>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Niveaux par domaine</h2></div>
          <div class="hbars">${GAME.domainOrder.map(d => {
            const lv = Engine.domainLevel(s, d);
            const val = lv.level - 1 + lv.pct;
            return `<div class="hbar"><span class="hb-l">${GAME.domains[d].icon} ${GAME.domains[d].name}</span>
              <div class="hb-track"><span class="hb-fill dom-${d}" style="width:${Math.max(2, (val / maxLvl) * 100).toFixed(1)}%"></span></div>
              <span class="hb-v">Niv. ${lv.level}</span></div>`;
          }).join('')}</div>
          <p class="muted small">XP : ${GAME.domainOrder.map(d => `${GAME.domains[d].name} ${U.fmtNum(xp[d])}`).join(' · ')}</p>
        </div>
        <div class="card">
          <div class="card-head"><h2>Activité</h2><span class="muted small">actions réelles par jour</span></div>
          <div id="ch-heat"></div>
          <div class="heat-legend small muted">Moins <i class="heat-0"></i><i class="heat-1"></i><i class="heat-2"></i><i class="heat-3"></i><i class="heat-4"></i> Plus</div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>XP gagnée par semaine</h2><span class="muted small">12 dernières semaines</span></div>
        <div id="ch-weeks"></div>
      </section>

      <section class="grid-auto">
        ${exos.map(k => `<div class="card"><div class="card-head"><h3>${GAME.exercises[k].icon} ${GAME.exercises[k].name}</h3><span class="muted small">${GAME.exercises[k].unit}</span></div><div id="ch-${k}"></div></div>`).join('')}
      </section>

      <section class="cols">
        <div class="card"><div class="card-head"><h3>📸 Score physique</h3><span class="muted small">/100</span></div><div id="ch-score"></div></div>
        <div class="card"><div class="card-head"><h3>⚖️ Poids</h3><span class="muted small">kg</span></div><div id="ch-weight"></div></div>
      </section>

      <section class="card">
        <details><summary><strong>Tableau des tests physiques</strong></summary>
          ${UI.table(['Date', 'Exercice', 'Résultat'], s.sport.tests.slice().sort((a, b) => b.ts - a.ts).map(t => [U.fmtDate(t.ts), GAME.exercises[t.exo].name, Engine.fmtTest(t.exo, t.value)]))}
        </details>
      </section>

      <section class="card">
        <div class="card-head"><h2>📜 Journal d'XP</h2><span class="muted small">40 derniers gains</span></div>
        ${recent.length ? `<ul class="xp-log">${recent.map(e => `<li><span class="xl-d dom-${e.domain}">${GAME.domains[e.domain].icon}</span><span class="xl-r">${U.esc(e.reason)}</span><span class="xl-t">${U.fmtShort(e.ts)}</span><strong>+${e.amount}</strong></li>`).join('')}</ul>` : '<p class="empty-hint">Aucun XP pour le moment.</p>'}
      </section>`;
  },

  mount() {
    const s = App.state;
    const $ = id => document.getElementById(id);

    // Heatmap : nombre de gains d'XP par jour (chaque gain = une action réelle)
    const counts = {};
    for (const e of s.xpLog) { const k = U.dayKey(e.ts); counts[k] = (counts[k] || 0) + 1; }
    if ($('ch-heat')) Charts.heatmap($('ch-heat'), counts, 18);

    // XP par semaine
    const ws = U.weekStart();
    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const a = new Date(ws); a.setDate(a.getDate() - i * 7);
      const b = new Date(a); b.setDate(b.getDate() + 7);
      const per = {};
      let tot = 0;
      for (const e of s.xpLog) if (e.ts >= a && e.ts < b) { per[e.domain] = (per[e.domain] || 0) + e.amount; tot += e.amount; }
      const detail = GAME.domainOrder.filter(d => per[d]).map(d => `${GAME.domains[d].icon} ${GAME.domains[d].name} : ${per[d]}`).join('<br>');
      weeks.push({ label: 'S' + U.weekKey(a).split('-W')[1], value: tot, tip: `<strong>${tot} XP</strong><span>Semaine du ${U.fmtShort(a)}</span>${detail ? `<span>${detail}</span>` : ''}` });
    }
    if ($('ch-weeks')) Charts.columns($('ch-weeks'), weeks, { color: 'var(--c-pro)', label: 'XP par semaine' });

    for (const k of Engine.activeExercises(s)) {
      const el = $('ch-' + k);
      if (!el) continue;
      const pts = Engine.testsFor(s, k).map(t => ({ x: t.ts, y: t.value }));
      Charts.line(el, pts, {
        color: 'var(--c-sport)', height: 180, label: GAME.exercises[k].name,
        fmt: v => (k === 'plank' ? U.fmtDuration(v) : k === 'pace5k' ? U.fmtPace(v) : `${v}`), emptyMsg: 'Fais ton premier test',
      });
    }
    const ci = s.sport.checkins.slice().sort((a, b) => a.ts - b.ts);
    if ($('ch-score')) Charts.line($('ch-score'), ci.map(c => ({ x: c.ts, y: c.total, note: c.week })), { color: 'var(--c-sport)', height: 180, label: 'Score physique', emptyMsg: 'Fais ton premier check-in' });
    if ($('ch-weight')) Charts.line($('ch-weight'), ci.filter(c => c.weight).map(c => ({ x: c.ts, y: c.weight })), { color: 'var(--c-sport)', height: 180, label: 'Poids', fmt: v => `${v} kg`, emptyMsg: 'Renseigne ton poids au check-in' });
  },
};
