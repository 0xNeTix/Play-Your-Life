/* Cœur de l'application : routeur, rendu, XP, notifications, PNJ */
const Views = {};

const App = {
  state: null,
  actions: {},
  forms: {},
  route: 'home',
  params: [],
  modalQueue: [],

  async init() {
    this.bindEvents();
    this.state = await Store.init();
    this.applyTheme();
    window.addEventListener('hashchange', () => this.render(true));
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => this.mountView(), 200); });
    this.render(true);
    if (this.state.profile) this.afterProfileLoad();
  },

  /* Récompenses de PNJ en attente, puis éventuelle rencontre */
  afterProfileLoad() {
    for (const arc of ARCS) if (this.state.npc.arcs[arc.id]?.status === 'ready') this.modalQueue.push(() => this.showNpc(arc, 'complete'));
    this.checkArcs();
    setTimeout(() => { this.flushModals(); this.maybeEncounter('open'); }, 1200);
  },

  save(immediate) { return Store.save(this.state, immediate); },

  applyTheme() {
    const th = this.state.settings.theme;
    if (th === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', th);
  },

  go(hash) {
    if (location.hash === hash) this.render(true);
    else location.hash = hash;
  },

  /* ---------- Profils ---------- */
  async switchProfile(id) {
    await this.save(true);
    const s = await Store.loadProfile(id);
    if (!s) return;
    this.state = s;
    this.modalQueue = [];
    this.applyTheme();
    this.toast(`Profil actif : <b>${U.esc(s.profile.name)}</b>`);
    this.go('#/home');
    this.afterProfileLoad();
  },
  async newProfile() {
    await this.save(true);
    this._profilesCache = await Store.listProfiles();
    this.modalQueue = [];
    this.state = Store.fresh();
    this.go('#/onboarding');
  },

  /* ---------- XP ---------- */
  grant(domain, amount, reason, ref) {
    amount = Math.round(amount);
    if (!amount) return;
    const before = Engine.snapshot(this.state);
    const entry = { id: U.uid(), ts: Date.now(), domain, amount, reason };
    if (ref) entry.ref = ref;
    this.state.xpLog.push(entry);
    const after = Engine.snapshot(this.state);
    const d = GAME.domains[domain];
    this.toast(`<b>+${amount} XP</b> ${d.icon} ${U.esc(d.name)}<small>${U.esc(reason)}</small>`);
    for (const k of ['char', ...GAME.domainOrder]) {
      if (after[k] > before[k]) this.modalQueue.push(() => this.showLevelUp({ domain: k, from: before[k], to: after[k] }));
    }
  },

  commit() {
    this.checkArcs();
    this.save();
    this.render(false);
    this.flushModals();
    setTimeout(() => this.maybeEncounter('action'), 1500);
  },

  /* ---------- Notifications ---------- */
  toast(html, kind = '') {
    const box = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.innerHTML = html;
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 3200);
    setTimeout(() => t.remove(), 3700);
  },

  isModalOpen() { return document.getElementById('modal').classList.contains('open'); },
  flushModals() {
    if (!this.modalQueue.length || this.isModalOpen()) return;
    this.modalQueue.shift()();
  },
  modal(html, cls = '') {
    const m = document.getElementById('modal');
    m.querySelector('.modal-body').className = 'modal-body ' + cls;
    m.querySelector('.modal-body').innerHTML = html;
    m.classList.add('open');
  },
  closeModal() {
    document.getElementById('modal').classList.remove('open');
    clearInterval(this._timer);
    clearInterval(this._typer);
    setTimeout(() => this.flushModals(), 150);
  },

  showLevelUp(lu) {
    const isChar = lu.domain === 'char';
    const d = isChar ? { name: 'Personnage', icon: '⭐' } : GAME.domains[lu.domain];
    const unlocks = Engine.unlocksBetween(this.state, lu.domain, lu.from, lu.to);
    const icons = { title: '🏷️', mission: '🎯', reward: '🎁', feature: '🔓' };
    const nextNeed = Engine.need(lu.to, isChar ? GAME.levelBase.char : GAME.levelBase.domain);
    this.modal(`
      <div class="levelup ${isChar ? 'char' : 'dom-' + lu.domain}">
        <div class="lu-burst">${d.icon}</div>
        <p class="eyebrow">Niveau supérieur</p>
        <h2>${U.esc(d.name)} — niveau ${lu.to}</h2>
        <p class="muted">Titre actuel : <strong>${U.esc(Engine.title(lu.domain, lu.to))}</strong> · prochain niveau : ${U.fmtNum(nextNeed)} XP</p>
        ${unlocks.length ? `<h3>Débloqué</h3><ul class="unlock-list">${unlocks.map(u => `<li><span>${icons[u.kind]}</span><div>${U.esc(u.text)}${u.kind === 'reward' ? '<small>Récompense réelle : va la chercher, tu l\'as gagnée.</small>' : ''}${u.xp ? `<small>+${u.xp} XP quand tu l'auras accomplie</small>` : ''}</div></li>`).join('')}</ul>`
          : `<p class="muted">Aucun déblocage à ce niveau. <a href="#/rewards" data-act="closeModal">Définis une récompense réelle</a> pour le prochain.</p>`}
        <button class="btn primary" data-act="closeModal">Continuer</button>
      </div>`);
  },

  /* Règle des 5 minutes : on commence, c'est tout */
  startTimer(text) {
    let left = 300;
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    this.modal(`
      <div class="timer">
        <p class="eyebrow">Règle des 5 minutes</p>
        <h2>${U.esc(text)}</h2>
        <div class="timer-clock" id="timer-clock">${fmt(left)}</div>
        <p class="muted">Engage-toi juste pour 5 minutes. Le plus dur, c'est de commencer.</p>
        <button class="btn" data-act="closeModal">Fermer</button>
      </div>`);
    clearInterval(this._timer);
    this._timer = setInterval(() => {
      left--;
      const el = document.getElementById('timer-clock');
      if (!el) return clearInterval(this._timer);
      el.textContent = left > 0 ? fmt(left) : 'Lancé 🔥';
      if (left <= 0) { clearInterval(this._timer); el.classList.add('done'); }
    }, 1000);
  },

  /* ---------- PNJ ---------- */
  maybeEncounter(trigger, force = false) {
    const s = this.state;
    if (!s.profile || this.isModalOpen() || this.modalQueue.length || this.route === 'quiz') return;
    const today = U.dayKey();
    const n = s.npc.encounters[today] || 0;
    const avail = Engine.availableArcs(s);
    if (!avail.length) return;
    if (!force) {
      if (n >= NPC_RULES.maxPerDay) return;
      if (Date.now() - s.npc.lastTs < NPC_RULES.minGapHours * 3600000) return;
      if (Engine.activeArcs(s).length >= NPC_RULES.maxActive) return;
      const first = !Object.keys(s.npc.arcs).length;
      const chance = first ? 1 : trigger === 'open' ? NPC_RULES.chanceOnOpen : NPC_RULES.chanceAfterAction;
      if (Math.random() > chance) return;
    }
    const arc = avail[Math.floor(Math.random() * avail.length)];
    s.npc.encounters[today] = n + 1;
    s.npc.lastTs = Date.now();
    this.save();
    this.showNpc(arc, 'offer');
  },

  showNpc(arc, mode) {
    const npc = NPCS[arc.npc];
    const greet = npc.greet[Math.floor(Math.random() * npc.greet.length)];
    const text = mode === 'offer' ? `${greet} ${arc.intro}` : arc.outro;
    const xp = Object.entries(arc.reward.xp).map(([d, v]) => `<span class="badge dom-${d}">${GAME.domains[d].icon} +${v} XP</span>`).join(' ');
    const dom = npc.domain ? 'dom-' + npc.domain : '';
    this.modal(`
      <div class="npc-dialog ${dom}">
        <div class="npc-top">
          <div class="npc-portrait">${npc.icon}</div>
          <div><div class="npc-name">${U.esc(npc.name)}</div><div class="npc-role">${U.esc(npc.role)}</div></div>
        </div>
        <p class="npc-text" id="npc-text" data-full="${U.esc(text)}"></p>
        <div class="npc-quest" id="npc-quest">
          <p class="eyebrow">${mode === 'offer' ? 'Quête proposée' : 'Quête accomplie'}</p>
          <h3>${U.esc(arc.title)}</h3>
          ${mode === 'offer' ? `<ol class="npc-steps">${arc.steps.map(st => `<li>${U.esc(st.text)}</li>`).join('')}</ol>` : ''}
          <div class="npc-reward">${xp} <span class="badge">🏷️ Titre « ${U.esc(arc.reward.title)} »</span></div>
          <div class="npc-actions">
            ${mode === 'offer'
              ? `<button class="btn primary" data-act="npcAccept" data-id="${arc.id}">Accepter la quête</button><button class="btn ghost" data-act="npcDecline" data-id="${arc.id}">Pas maintenant</button>`
              : `<button class="btn primary" data-act="npcClaim" data-id="${arc.id}">Recevoir la récompense</button>`}
          </div>
        </div>
      </div>`, 'npc-modal');
    // Effet machine à écrire (un clic l'accélère)
    const el = document.getElementById('npc-text');
    const quest = document.getElementById('npc-quest');
    let i = 0;
    clearInterval(this._typer);
    const finish = () => { clearInterval(this._typer); el.textContent = text; quest.classList.add('show'); };
    el.onclick = finish;
    this._typer = setInterval(() => {
      i += 2;
      el.textContent = text.slice(0, i);
      if (i >= text.length) finish();
    }, 18);
  },

  /* Vérifie l'avancement des quêtes de PNJ après chaque action */
  checkArcs() {
    const s = this.state;
    for (const arc of Engine.activeArcs(s)) {
      const st = s.npc.arcs[arc.id];
      const p = Engine.arcProgress(s, arc);
      if (p.count > (st.stepsDone || 0)) {
        for (const step of p.steps.filter(x => x.done).slice(st.stepsDone || 0)) {
          this.toast(`<b>${NPCS[arc.npc].icon} Étape accomplie</b><small>${U.esc(arc.title)} : ${U.esc(step.text)}</small>`);
        }
      }
      st.stepsDone = p.count;
      if (p.done) {
        st.status = 'ready';
        this.modalQueue.push(() => this.showNpc(arc, 'complete'));
      }
    }
  },

  /* ---------- Événements délégués ---------- */
  bindEvents() {
    document.addEventListener('click', ev => {
      const el = ev.target.closest('[data-act]');
      if (!el) return;
      const name = el.dataset.act;
      if (name === 'closeModal') { this.closeModal(); if (el.tagName !== 'A') ev.preventDefault(); return; }
      const fn = this.actions[name];
      if (fn) { ev.preventDefault(); fn(el, ev); }
    });
    document.addEventListener('submit', ev => {
      const form = ev.target.closest('form[data-form]');
      if (!form) return;
      ev.preventDefault();
      const fn = this.forms[form.dataset.form];
      if (fn) fn(new FormData(form), form);
    });
    document.addEventListener('input', ev => {
      const el = ev.target;
      if (el.dataset.out) {
        const o = document.getElementById(el.dataset.out);
        if (o) o.textContent = el.value;
      }
      if (el.dataset.input && this.actions[el.dataset.input]) this.actions[el.dataset.input](el, ev);
    });
    document.addEventListener('change', ev => {
      const el = ev.target;
      if (el.matches('input[type=file][data-preview]')) {
        const img = document.getElementById(el.dataset.preview);
        const f = el.files && el.files[0];
        if (img && f) { img.src = URL.createObjectURL(f); img.closest('.photo-slot')?.classList.add('has'); }
      }
      if (el.dataset.change && this.actions[el.dataset.change]) this.actions[el.dataset.change](el, ev);
    });
    document.getElementById('modal').addEventListener('click', ev => {
      if (ev.target.id === 'modal' && !document.querySelector('.npc-modal')) this.closeModal();
    });
  },

  /* ---------- Rendu ---------- */
  render(routeChanged) {
    const parts = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
    let route = parts[0];
    if (!this.state.profile) route = 'onboarding';
    if (!Views[route]) route = 'home';
    this.route = route;
    this.params = parts.slice(1);

    document.body.classList.toggle('no-shell', route === 'onboarding');
    this.renderShell();
    const v = Views[route];
    document.getElementById('view').innerHTML = v.render(this.params);
    this.mountView();
    if (routeChanged) window.scrollTo(0, 0);
  },

  mountView() {
    const v = Views[this.route];
    if (v && v.mount) v.mount(this.params);
  },

  renderShell() {
    const s = this.state;
    const side = document.getElementById('side');
    if (!s.profile) { side.innerHTML = ''; return; }
    const cl = Engine.charLevel(s);
    const aura = cl.level >= 20 ? 'aura-5' : cl.level >= 15 ? 'aura-4' : cl.level >= 10 ? 'aura-3' : cl.level >= 6 ? 'aura-2' : cl.level >= 3 ? 'aura-1' : 'aura-0';
    const activeN = Engine.activeArcs(s).length + ARCS.filter(a => s.npc.arcs[a.id]?.status === 'ready').length;
    const nav = [
      ['home', '🏠', 'QG'], ['sport', '💪', 'Corps'], ['pro', '💼', 'Métier'], ['intel', '🧠', 'Esprit'],
      ['journal', '📜', 'Quêtes', activeN], ['stats', '📊', 'Stats'], ['guild', '🛡️', 'Guilde'],
      ['rewards', '🎁', 'Récompenses'], ['settings', '⚙️', 'Réglages'],
    ];
    const active = this.route === 'quiz' ? 'pro' : this.route;
    side.innerHTML = `
      <div class="brand"><span class="brand-mark">⚔️</span><span>Play Your Life</span></div>
      <a class="hero-card" href="#/stats">
        <div class="avatar ${aura}">${U.esc((s.profile.name || '?').trim().charAt(0).toUpperCase())}</div>
        <div class="hero-meta">
          <div class="hero-name">${U.esc(s.profile.name)}</div>
          <div class="hero-title">${U.esc(Engine.title('char', cl.level))} · Niv. ${cl.level}</div>
          <div class="xpbar sm"><span style="width:${(cl.pct * 100).toFixed(1)}%"></span></div>
          <div class="hero-xp">${U.fmtNum(cl.into)} / ${U.fmtNum(cl.need)} XP</div>
        </div>
      </a>
      <nav class="nav">${nav.map(([r, i, l, n]) => `<a href="#/${r}" class="${active === r ? 'active' : ''}"><span class="ni">${i}</span><span class="nl">${l}</span>${n ? `<span class="nav-count">${n}</span>` : ''}</a>`).join('')}</nav>
      <p class="side-oath">« Rien ici n'a de valeur si ce n'est pas vrai dans ta vie. »</p>`;
  },
};

/* ---------- Composants partagés ---------- */
const UI = {
  xpBar(info, domain) {
    return `<div class="xpbar ${domain ? 'dom-' + domain : ''}"><span style="width:${(info.pct * 100).toFixed(1)}%"></span></div>`;
  },
  domainBadge(d) {
    const x = GAME.domains[d];
    return `<span class="badge dom-${d}">${x.icon} ${U.esc(x.name)}</span>`;
  },
  domainOptions(selected, withChar = false) {
    const opts = GAME.domainOrder.map(d => `<option value="${d}" ${d === selected ? 'selected' : ''}>${GAME.domains[d].icon} ${GAME.domains[d].name}</option>`);
    if (withChar) opts.push(`<option value="char" ${selected === 'char' ? 'selected' : ''}>⭐ Personnage (niveau global)</option>`);
    return opts.join('');
  },
  pageHead(domain, h1) {
    const s = App.state;
    const info = Engine.domainLevel(s, domain);
    const d = GAME.domains[domain];
    return `<header class="page-head">
      <p class="eyebrow">${d.icon} ${d.name} · Niv. ${info.level} · ${U.esc(Engine.title(domain, info.level))}</p>
      <h1>${h1}</h1>
      ${UI.xpBar(info, domain)}
      <p class="muted small">${U.fmtNum(info.into)} / ${U.fmtNum(info.need)} XP avant le niveau ${info.level + 1}</p>
    </header>`;
  },
  /* Liste de missions IRL avec preuve écrite */
  missions(list) {
    const s = App.state;
    if (!list.length) return '<p class="muted">Aucune mission.</p>';
    const done = list.filter(m => s.missions[m.id]);
    const open = list.filter(m => !s.missions[m.id] && Engine.missionUnlocked(s, m));
    const locked = list.filter(m => !s.missions[m.id] && !Engine.missionUnlocked(s, m));
    const row = m => {
      if (s.missions[m.id]) {
        const r = s.missions[m.id];
        return `<li class="mission done"><span class="m-ico">✅</span><div><div>${U.esc(m.text)}</div><small>${U.fmtDate(r.ts)} · « ${U.esc(r.note)} »</small></div><span class="m-xp">+${m.xp}</span></li>`;
      }
      if (!Engine.missionUnlocked(s, m)) {
        return `<li class="mission locked"><span class="m-ico">🔒</span><div><div>${U.esc(m.text)}</div><small>Débloquée à : ${U.esc(Engine.missionLockLabel(m))}</small></div><span class="m-xp">+${m.xp}</span></li>`;
      }
      return `<li class="mission open"><span class="m-ico">🎯</span><div class="m-main"><div>${U.esc(m.text)}</div>
        <details><summary>Je l'ai fait</summary>
          <form data-form="mission" data-id="${m.id}" class="inline-form">
            <input name="note" required minlength="10" maxlength="240" placeholder="Preuve : qu'as-tu fait concrètement ? (10 caractères min.)">
            <button class="btn primary sm">Valider</button>
          </form></details></div><span class="m-xp">+${m.xp}</span></li>`;
    };
    return `<ul class="missions">${[...open, ...locked, ...done].map(row).join('')}</ul>`;
  },
  table(head, rows) {
    if (!rows.length) return '<p class="muted">Aucune donnée.</p>';
    return `<div class="table-wrap"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  },
  tabs(base, tabs, current) {
    return `<nav class="tabs">${tabs.map(([id, label]) => `<a href="#/${base}/${id}" class="${current === id ? 'active' : ''}">${label}</a>`).join('')}</nav>`;
  },
};

App.forms.mission = (fd, form) => {
  const id = form.dataset.id;
  const m = Engine.allMissions(App.state).find(x => x.id === id);
  const note = String(fd.get('note') || '').trim();
  if (!m || App.state.missions[id] || note.length < 10) return;
  App.state.missions[id] = { ts: Date.now(), note };
  App.grant(m.domain, m.xp, `Mission : ${m.text}`);
  App.commit();
};
App.actions.timer = el => App.startTimer(el.dataset.text || 'Passe à l\'action');

/* ---------- Actions PNJ ---------- */
App.actions.npcAccept = el => {
  const s = App.state;
  s.npc.arcs[el.dataset.id] = { status: 'active', acceptedTs: Date.now(), stepsDone: 0, manual: {} };
  const arc = ARCS.find(a => a.id === el.dataset.id);
  App.closeModal();
  App.toast(`<b>📜 Quête acceptée</b><small>${U.esc(arc.title)} — suis-la dans l'onglet Quêtes.</small>`);
  App.commit();
};
App.actions.npcDecline = el => {
  App.state.npc.arcs[el.dataset.id] = { status: 'declined', declinedTs: Date.now() };
  App.closeModal();
  App.save();
  App.render(false);
};
App.actions.npcClaim = el => {
  const s = App.state;
  const arc = ARCS.find(a => a.id === el.dataset.id);
  const st = s.npc.arcs[arc.id];
  if (!st || st.status !== 'ready') return App.closeModal();
  st.status = 'done';
  st.doneTs = Date.now();
  s.npc.titles.push({ title: arc.reward.title, npc: arc.npc, arc: arc.id, ts: Date.now() });
  App.closeModal();
  for (const [d, v] of Object.entries(arc.reward.xp)) App.grant(d, v, `Quête « ${arc.title} » (${NPCS[arc.npc].name})`);
  App.toast(`<b>🏷️ Nouveau titre</b><small>${U.esc(arc.reward.title)}</small>`);
  App.commit();
};
