/* Journal de quêtes : quêtes confiées par les PNJ */
Views.journal = {
  cFilter: 'all',

  render() {
    const s = App.state;
    const byStatus = st => ARCS.filter(a => s.npc.arcs[a.id]?.status === st);
    const ready = byStatus('ready'), active = byStatus('active'), done = byStatus('done');
    const contracts = Engine.allMissions(s).filter(m => this.cFilter === 'all' || m.domain === this.cFilter)
      .sort((a, b) => (a.minLevel || a.minTier || 0) - (b.minLevel || b.minTier || 0));
    const met = new Set(Object.keys(s.npc.arcs).map(id => ARCS.find(a => a.id === id)?.npc).filter(Boolean));
    for (const m of Engine.allMissions(s)) if (Engine.missionUnlocked(s, m)) met.add(Engine.missionGiver(m));
    const today = s.npc.encounters[U.dayKey()] || 0;

    const arcCard = (arc, mode) => {
      const npc = NPCS[arc.npc];
      const st = s.npc.arcs[arc.id];
      const p = Engine.arcProgress(s, arc);
      const xp = Object.entries(arc.reward.xp).map(([d, v]) => `<span class="badge dom-${d}">${GAME.domains[d].icon} +${v}</span>`).join(' ');
      return `<article class="card arc ${mode} ${npc.domain ? 'dom-' + npc.domain : ''}">
        <div class="arc-head">
          <div class="npc-portrait sm">${UI.npcFace(arc.npc, 46)}</div>
          <div class="arc-meta"><h3>${U.esc(arc.title)}</h3><div class="muted small">${U.esc(npc.name)} · ${U.esc(npc.role)}</div></div>
          <span class="pill ${mode === 'done' ? 'ok' : ''}">${mode === 'done' ? 'Terminée' : `${p.count}/${p.steps.length}`}</span>
        </div>
        ${mode !== 'done' ? `<blockquote class="arc-quote">« ${U.esc(arc.intro)} »</blockquote>` : ''}
        <ol class="arc-steps">${p.steps.map((step, i) => `
          <li class="${step.done ? 'done' : ''}">
            <span class="as-check">${step.done ? '✓' : i + 1}</span>
            <div class="as-main"><div>${U.esc(step.text)}</div>
              ${step.manual && !step.done && mode === 'active' ? `
                <form data-form="arcManual" data-id="${arc.id}" data-step="${i}" class="inline-form">
                  <input name="note" required minlength="10" maxlength="240" placeholder="Preuve : qu'as-tu fait ?">
                  <button class="btn primary sm">Valider</button>
                </form>` : `<small class="muted">${U.esc(step.label)}</small>`}
              ${!step.manual && !step.done && step.target > 1 ? `<div class="xpbar sm"><span style="width:${(step.cur / step.target) * 100}%"></span></div>` : ''}
            </div>
          </li>`).join('')}</ol>
        <div class="arc-foot">${xp} <span class="badge">${U.esc(arc.reward.title)}</span>
          ${mode === 'ready' ? `<button class="btn primary sm" data-act="arcTalk" data-id="${arc.id}">Retourner voir ${U.esc(npc.name)}</button>` : ''}
          ${mode === 'active' ? `<button class="btn ghost sm" data-act="arcAbandon" data-id="${arc.id}">Abandonner</button>` : ''}
          ${mode === 'done' ? `<span class="muted small">le ${U.fmtDate(st.doneTs)}</span>` : ''}
        </div>
        ${mode === 'active' ? `<p class="muted small">Acceptée le ${U.fmtDate(st.acceptedTs)}. Seules les actions faites depuis cette date comptent.</p>` : ''}
      </article>`;
    };

    return `
      <header class="page-head">
        <p class="eyebrow">Journal de quêtes</p>
        <h1>Les gens du royaume comptent sur toi.</h1>
        <p class="muted">Des PNJ te croisent au hasard, une à deux fois par jour, quand tu ouvres l'application ou après une action. Leurs quêtes s'étalent sur plusieurs niveaux et plusieurs domaines. Tu peux mener ${NPC_RULES.maxActive} quêtes à la fois.</p>
      </header>

      ${ready.length ? `<section class="stack"><h2 class="section-title">À rendre</h2>${ready.map(a => arcCard(a, 'ready')).join('')}</section>` : ''}

      <section class="stack">
        <h2 class="section-title">En cours <span class="muted small">${active.length}/${NPC_RULES.maxActive}</span></h2>
        ${active.length ? `<div class="arc-grid">${active.map(a => arcCard(a, 'active')).join('')}</div>`
          : `<div class="empty-hint">Aucune quête en cours. ${today >= NPC_RULES.maxPerDay ? 'Tu as déjà croisé assez de monde aujourd\'hui : reviens demain.' : 'Continue d\'agir : quelqu\'un finira par venir te parler.'}</div>`}
      </section>

      <section class="card">
        <div class="card-head"><h2>Contrats</h2>
          <div class="seg">${['all', ...GAME.domainOrder].map(d => `<button class="${this.cFilter === d ? 'on' : ''}" data-act="contractFilter" data-d="${d}" title="${d === 'all' ? 'Tous' : GAME.domains[d].name}">${d === 'all' ? 'Tous' : GAME.domains[d].icon}</button>`).join('')}</div>
        </div>
        <p class="muted small">Des tâches concrètes que les PNJ te confient au fil de tes niveaux et de tes tests. Valide-les avec une preuve de ce que tu as fait.</p>
        ${UI.missions(contracts, { lockedLimit: 4 })}
      </section>

      <section class="card">
        <div class="card-head"><h2>Personnages rencontrés</h2><span class="muted small">${met.size} / ${Object.keys(NPCS).length}</span></div>
        <div class="npc-roster">${Object.entries(NPCS).map(([id, n]) => met.has(id)
          ? `<div class="roster-item ${n.domain ? 'dom-' + n.domain : ''}"><div class="npc-portrait sm">${UI.npcFace(id, 46)}</div><div><strong>${U.esc(n.name)}</strong><small class="muted">${U.esc(n.role)}</small></div></div>`
          : '<div class="roster-item unknown"><div class="npc-portrait sm">?</div><div><strong>???</strong><small class="muted">Pas encore rencontré</small></div></div>').join('')}</div>
      </section>

      ${done.length ? `<section class="stack"><h2 class="section-title">Terminées</h2><div class="arc-grid">${done.map(a => arcCard(a, 'done')).join('')}</div></section>` : ''}`;
  },
};

App.forms.arcManual = (fd, form) => {
  const st = App.state.npc.arcs[form.dataset.id];
  const note = String(fd.get('note') || '').trim();
  if (!st || st.status !== 'active' || note.length < 10) return;
  st.manual = st.manual || {};
  st.manual[form.dataset.step] = note;
  App.commit();
};
App.actions.arcTalk = el => {
  const arc = ARCS.find(a => a.id === el.dataset.id);
  if (arc) App.showNpc(arc, 'complete');
};
App.actions.arcAbandon = el => {
  if (!confirm('Abandonner cette quête ? Le PNJ pourra te la reproposer plus tard, mais ta progression repartira de zéro.')) return;
  App.state.npc.arcs[el.dataset.id] = { status: 'declined', declinedTs: Date.now() };
  App.commit();
};

App.actions.contractFilter = el => { Views.journal.cFilter = el.dataset.d; App.render(false); };
