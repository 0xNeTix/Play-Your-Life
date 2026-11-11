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
    await Library.load();
    this.applyTheme();
    window.addEventListener('hashchange', () => this.render(true));
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => this.mountView(), 200); });
    this.render(true);
    if (this.state.profile) this.afterProfileLoad();
  },

  /* Photo de profil (stockée avec les photos, chargée une fois par profil) */
  async loadPP() {
    const id = this.state.id;
    const url = id && this.state.profile?.hasPhoto ? await Store.getPhoto('pp-' + id) : null;
    if (this.state.id !== id) return;
    this.ppUrl = url;
    this.renderShell();
    if (['profile', 'guild'].includes(this.route)) this.render(false);
  },

  /* Récompenses de PNJ en attente, puis éventuelle rencontre */
  afterProfileLoad() {
    this.loadPP();
    for (const arc of ARCS) if (this.state.npc.arcs[arc.id]?.status === 'ready') this.modalQueue.push(() => this.showNpc(arc, 'complete'));
    this.checkArcs();
    this.checkEvents();
    this.checkCosmetics();
    this.save();
    this.render(false);
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
    this.ppUrl = null;
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
    this.ppUrl = null;
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
    this.checkEvents();
    this.checkArcs();
    this.checkCosmetics();
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

  /* Montée de niveau : mise en scène plein écran */
  showLevelUp(lu) {
    const isChar = lu.domain === 'char';
    const d = isChar ? { name: 'Personnage', icon: Icons.get('crown', 22) } : GAME.domains[lu.domain];
    const unlocks = Engine.unlocksBetween(this.state, lu.domain, lu.from, lu.to);
    const icons = { title: Icons.get('crown'), mission: Icons.get('target'), reward: Icons.get('rewards'), feature: Icons.get('lock') };
    const nextNeed = Engine.need(lu.to, isChar ? GAME.levelBase.char : GAME.levelBase.domain);
    const sparks = Array.from({ length: 42 }, (_, i) => {
      const a = (i / 42) * Math.PI * 2 + Math.random() * .3;
      const r = 140 + Math.random() * 220;
      return `<i style="--x:${(Math.cos(a) * r).toFixed(0)}px;--y:${(Math.sin(a) * r).toFixed(0)}px;--d:${(.25 + Math.random() * .5).toFixed(2)}s;--s:${(2 + Math.random() * 4).toFixed(1)}px"></i>`;
    }).join('');
    this.modal(`
      <div class="lu-stage ${isChar ? 'lu-char' : 'dom-' + lu.domain}">
        <div class="lu-rays"></div>
        <div class="lu-ring"></div><div class="lu-ring r2"></div>
        <div class="lu-sparks">${sparks}</div>
        <div class="lu-content">
          <p class="lu-kicker">Niveau supérieur</p>
          <div class="lu-domain">${d.icon}<span>${U.esc(d.name)}</span></div>
          <div class="lu-num"><span class="lu-old">${lu.from}</span><span class="lu-new">${lu.to}</span></div>
          <div class="lu-title">${U.esc(Engine.title(lu.domain, lu.to))}</div>
          <div class="lu-rule"><span></span>${Icons.get('gem', 14)}<span></span></div>
          ${unlocks.length ? `<ul class="lu-unlocks">${unlocks.map((u, i) => `<li style="--i:${i}"><span class="lu-ic">${icons[u.kind]}</span><div>${U.esc(u.text)}${u.kind === 'reward' ? '<small>Récompense réelle : va la chercher, tu l\'as gagnée.</small>' : ''}${u.xp ? `<small>+${u.xp} XP quand tu l'auras accomplie</small>` : ''}</div></li>`).join('')}</ul>`
            : `<p class="lu-none">Prochain palier : ${U.fmtNum(nextNeed)} XP.</p>`}
          <button class="btn primary lu-go" data-act="closeModal">Continuer</button>
        </div>
      </div>`, 'lu-modal');
    Sfx.levelUp();
  },

  /* Nouvel objet cosmétique : révélation selon la rareté */
  showLoot(item) {
    if (!item) return this.flushModals();
    this.modal(`
      <div class="loot r-${item.rarity.id}" style="--rc:${item.rarity.color}">
        <div class="loot-glow"></div>
        <p class="lu-kicker">Objet obtenu</p>
        <div class="loot-item">${Avatar.preview(this.state.profile.avatar, item, 170)}</div>
        <div class="loot-rarity">${item.rarity.label}</div>
        <h2 class="loot-name">${U.esc(item.label)}</h2>
        <p class="loot-src">${U.esc(item.partLabel)} · ${U.esc(Avatar.lockLabel(item.lock))}</p>
        <div class="loot-actions">
          <button class="btn primary" data-act="lootEquip" data-key="${U.esc(item.key)}">Équiper</button>
          <button class="btn ghost" data-act="closeModal">Plus tard</button>
        </div>
      </div>`, 'loot-modal');
    Sfx.loot(item.rarity.id);
  },

  /* Annonce les cosmétiques nouvellement débloqués (la première fois, tout est marqué comme vu) */
  checkCosmetics() {
    const s = this.state;
    if (!s.profile) return;
    const keys = Avatar.unlockedKeys(s);
    if (!s.cosmetics || !Array.isArray(s.cosmetics.seen)) { s.cosmetics = { seen: keys }; return; }
    const fresh = keys.filter(k => !s.cosmetics.seen.includes(k));
    if (!fresh.length) return;
    s.cosmetics.seen.push(...fresh);
    const all = Avatar.lockedItems();
    for (const k of fresh) this.modalQueue.push(() => this.showLoot(all.find(i => i.key === k)));
  },

  /* ---------- Boss et récompenses : tout est automatique ---------- */
  checkEvents() {
    const s = this.state;
    if (!s.profile) return;
    for (const ev of Events.tickBoss(s)) {
      if (ev.kind === 'won') {
        this.grant(ev.boss.domain, ev.boss.xp, `Boss vaincu : ${Events.bossDef(ev.boss).name}`);
        this.grant('discipline', GAME.xp.bossDiscipline, 'Boss de la semaine');
      }
      this.modalQueue.push(() => this.showBoss(ev));
    }
    const gift = Events.tickGift(s);
    if (gift) this.modalQueue.push(() => this.showGift(gift));
  },

  showBoss(ev) {
    const b = ev.boss;
    const def = Events.bossDef(b);
    const left = Math.max(0, b.deadline - Date.now());
    const days = Math.floor(left / 86400000), hours = Math.floor((left % 86400000) / 3600000);
    const head = { spawn: 'Un boss apparaît', won: 'Boss vaincu', lost: 'Défaite' }[ev.kind];
    const text = { spawn: def.taunt, won: def.win, lost: def.lose }[ev.kind];
    this.modal(`
      <div class="npc-dialog boss-dialog ${ev.kind}">
        <p class="lu-kicker">${head}</p>
        <div class="npc-top">
          <div class="npc-portrait">${Avatar.svg(def.look, { size: 104, label: def.name })}</div>
          <div><div class="npc-name">${U.esc(def.name)}</div><div class="npc-role">${U.esc(def.role)} · niveau ${b.level}</div></div>
        </div>
        <p class="npc-text">${U.esc(text)}</p>
        <div class="npc-quest show">
          ${ev.kind === 'spawn' ? `
            <p class="eyebrow">Pour le vaincre</p>
            <h3>${U.esc(b.text)}</h3>
            <p class="muted small">Il te reste ${days ? days + ' j ' : ''}${hours} h, jusqu'à dimanche soir. Seul ce que tu fais à partir de maintenant compte.</p>
            <div class="npc-reward"><span class="badge dom-${b.domain}">${GAME.domains[b.domain].icon} +${b.xp} XP</span><span class="badge stake">${Icons.get('flame', 13)} En cas d'échec : ta série de jours repart à 0</span></div>`
          : ev.kind === 'won' ? `
            <h3>${U.esc(b.text)}</h3>
            <div class="npc-reward"><span class="badge dom-${b.domain}">${GAME.domains[b.domain].icon} +${b.xp} XP</span><span class="badge dom-discipline">${GAME.domains.discipline.icon} +${GAME.xp.bossDiscipline} XP</span></div>`
          : `
            <h3>${U.esc(b.text)}</h3>
            <p class="warn-text">Quête non accomplie à temps : ta série de jours repart à zéro.</p>
            <p class="muted small">Un nouveau boss viendra la semaine prochaine. Prends ta revanche.</p>`}
          <div class="npc-actions"><button class="btn primary" data-act="closeModal">${ev.kind === 'spawn' ? 'Relever le défi' : 'Continuer'}</button></div>
        </div>
      </div>`, 'npc-modal boss-modal');
    if (ev.kind === 'won') Sfx.levelUp(); else Sfx.loot(ev.kind === 'spawn' ? 'e' : 'c');
  },

  showGift(gift) {
    this.modal(`
      <div class="loot gift" style="--rc:var(--gold)">
        <div class="loot-glow"></div>
        <p class="lu-kicker">Récompense méritée</p>
        <div class="gift-ico">${Icons.get('rewards', 54)}</div>
        <h2 class="loot-name">${U.esc(gift.text)}</h2>
        <p class="loot-src">Tu as gagné ${U.fmtNum(gift.xp)} XP depuis ta dernière récompense. Offre-toi ça pour de vrai.</p>
        <div class="loot-actions">
          <button class="btn primary" data-act="giftClaim" data-id="${gift.id}" data-close="1">Je la prends</button>
          <button class="btn ghost" data-act="closeModal">Plus tard</button>
        </div>
      </div>`, 'loot-modal');
    Sfx.loot('l');
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
      el.textContent = left > 0 ? fmt(left) : "C'est parti";
      if (left <= 0) { clearInterval(this._timer); el.classList.add('done'); }
    }, 1000);
  },

  /* ---------- PNJ ---------- */
  maybeEncounter(trigger, force = false) {
    const s = this.state;
    if (!s.profile || this.isModalOpen() || this.modalQueue.length || ['quiz', 'avatar', 'onboarding'].includes(this.route)) return;
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
          <div class="npc-portrait">${Avatar.svg(npc.look, { size: 104, label: npc.name })}</div>
          <div><div class="npc-name">${U.esc(npc.name)}</div><div class="npc-role">${U.esc(npc.role)}</div></div>
        </div>
        <p class="npc-text" id="npc-text" data-full="${U.esc(text)}"></p>
        <div class="npc-quest" id="npc-quest">
          <p class="eyebrow">${mode === 'offer' ? 'Quête proposée' : 'Quête accomplie'}</p>
          <h3>${U.esc(arc.title)}</h3>
          ${mode === 'offer' ? `<ol class="npc-steps">${arc.steps.map(st => `<li>${U.esc(st.text)}</li>`).join('')}</ol>` : ''}
          <div class="npc-reward">${xp} <span class="badge">Titre « ${U.esc(arc.reward.title)} »</span>${Avatar.arcRewards(arc.id).map(i => `<span class="badge rar" style="--rc:${i.rarity.color}">${Icons.get('gem', 13)} ${U.esc(i.label)} · ${i.rarity.label}</span>`).join('')}</div>
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
          this.toast(`<span class="toast-face">${UI.npcFace(arc.npc, 34)}</span><b>Étape accomplie</b><small>${U.esc(arc.title)} : ${U.esc(step.text)}</small>`);
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
        if (img && f) { img.src = URL.createObjectURL(f); img.closest('.photo-slot, .pp-pick, .ws-pick')?.classList.add('has'); }
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
    if (route === 'stats' || route === 'settings') { parts.splice(1, 0, route); route = 'profile'; }
    if (route === 'rewards') route = 'home';
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
      ['home', 'home', 'QG'], ['sport', 'sport', 'Corps'], ['pro', 'pro', 'Métier'], ['intel', 'intel', 'Esprit'],
      ['journal', 'quests', 'Quêtes', activeN], ['guild', 'guild', 'Multijoueur'], ['profile', 'avatar', 'Profil'],
    ];
    const active = this.route === 'quiz' ? 'pro' : this.route;
    side.innerHTML = `
      <div class="brand"><span class="brand-mark">${Icons.get('sword', 18)}</span><span>Play Your Life</span></div>
      <a class="hero-card" href="#/avatar" title="Personnaliser mon avatar">
        <div class="avatar ${aura} framed frame-${s.profile.avatar?.frame || 'none'}">${UI.portrait(s, 52)}</div>
        <div class="hero-meta">
          <div class="hero-name">${U.esc(s.profile.name)}</div>
          <div class="hero-title">${U.esc(Engine.title('char', cl.level))} · Niv. ${cl.level}</div>
          <div class="xpbar sm"><span style="width:${(cl.pct * 100).toFixed(1)}%"></span></div>
          <div class="hero-xp">${U.fmtNum(cl.into)} / ${U.fmtNum(cl.need)} XP</div>
        </div>
      </a>
      <nav class="nav">${nav.map(([r, i, l, n]) => `<a href="#/${r}" class="${active === r ? 'active' : ''}"><span class="ni">${Icons.get(i, 20)}</span><span class="nl">${l}</span>${n ? `<span class="nav-count">${n}</span>` : ''}</a>`).join('')}</nav>
      <p class="side-oath">« Rien ici n'a de valeur si ce n'est pas vrai dans ta vie. »</p>`;
  },
};

/* ---------- Composants partagés ---------- */
const UI = {
  /* Photo de profil ou avatar selon le choix du joueur */
  portrait(s, size, { forceAvatar = false } = {}) {
    const p = s.profile || {};
    if (!forceAvatar && p.display === 'photo' && App.ppUrl) return `<img class="pp" src="${App.ppUrl}" width="${size}" height="${size}" alt="${U.esc(p.name)}">`;
    return Avatar.svg(p.avatar, { size, crop: size < 80 ? 'face' : null, shape: 'circle', label: p.name });
  },
  npcFace(npcId, size) {
    const n = NPCS[npcId];
    return Avatar.svg(n.look, { size, crop: 'face', label: n.name });
  },
  /* Carte de joueur : couleur selon le niveau du personnage */
  cardTier(level) {
    if (level >= 15) return { id: 'legend', name: 'Légende' };
    if (level >= 10) return { id: 'ruby', name: 'Rubis' };
    if (level >= 7) return { id: 'gold', name: 'Or' };
    if (level >= 4) return { id: 'silver', name: 'Argent' };
    return { id: 'copper', name: 'Cuivre' };
  },
  playerCard(card, { photoUrl = card.photo || null } = {}) {
    const tier = this.cardTier(card.level);
    const frame = card.avatar?.frame || 'none';
    const pic = photoUrl
      ? `<img src="${photoUrl}" alt="" width="112" height="112">`
      : Avatar.svg(card.avatar, { size: 112, label: card.name, shape: 'circle' });
    let h = 0;
    for (const ch of String(card.id || card.name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const serial = String(h % 100000).padStart(5, '0');
    const since = card.since ? new Date(card.since).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '';
    return `<article class="pcard tier-${tier.id}">
      <div class="pc-inner">
        <div class="pc-sheen"></div>
        <header class="pc-head"><span>${card.clan ? `<b class="pc-clan" style="--cc:${card.clan.color}">${U.esc(card.clan.tag)}</b> ${U.esc(card.clan.name)}` : 'Play Your Life'}</span><span class="pc-tier">${tier.name}</span></header>
        <div class="pc-portrait"><span class="pc-ring framed frame-${frame}">${pic}</span><span class="pc-lvl"><small>Niv.</small>${card.level}</span></div>
        <div class="pc-name">${U.esc(card.name)}</div>
        <div class="pc-title">${U.esc(card.title || '')}</div>
        <div class="pc-rule"><span></span><i></i><span></span></div>
        <div class="pc-stats">${GAME.domainOrder.map(d => `<div class="pc-stat dom-${d}"><b>${card.domains?.[d] ?? 1}</b><small>${GAME.domains[d].name}</small></div>`).join('')}</div>
        <footer class="pc-foot">
          <span>Série ${card.streak ?? 0} j</span><span>${card.runKm ?? 0} km</span><span>${card.npcTitles?.length || 0} titre${(card.npcTitles?.length || 0) > 1 ? 's' : ''}</span>
        </footer>
        <div class="pc-serial"><span>N° ${serial}</span>${since ? `<span>Depuis ${since}</span>` : ''}</div>
      </div>
    </article>`;
  },
  xpBar(info, domain) {
    return `<div class="xpbar ${domain ? 'dom-' + domain : ''}"><span style="width:${(info.pct * 100).toFixed(1)}%"></span></div>`;
  },
  domainBadge(d) {
    const x = GAME.domains[d];
    return `<span class="badge dom-${d}">${x.icon} ${U.esc(x.name)}</span>`;
  },
  domainOptions(selected, withChar = false) {
    const opts = GAME.domainOrder.map(d => `<option value="${d}" ${d === selected ? 'selected' : ''}>${GAME.domains[d].name}</option>`);
    if (withChar) opts.push(`<option value="char" ${selected === 'char' ? 'selected' : ''}>Personnage (niveau global)</option>`);
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
  /* Contrats (anciennes missions) confiés par les PNJ, avec preuve écrite */
  missions(list, { lockedLimit = Infinity } = {}) {
    const s = App.state;
    if (!list.length) return '<p class="muted">Aucun contrat.</p>';
    const done = list.filter(m => s.missions[m.id]);
    const open = list.filter(m => !s.missions[m.id] && Engine.missionUnlocked(s, m));
    const locked = list.filter(m => !s.missions[m.id] && !Engine.missionUnlocked(s, m)).slice(0, lockedLimit);
    const giver = m => {
      const id = Engine.missionGiver(m);
      return `<span class="m-face" title="${U.esc(NPCS[id].name)}">${UI.npcFace(id, 36)}</span>`;
    };
    const who = m => `<small class="m-who">${U.esc(NPCS[Engine.missionGiver(m)].name)} · ${GAME.domains[m.domain].name}</small>`;
    const row = m => {
      if (s.missions[m.id]) {
        const r = s.missions[m.id];
        return `<li class="mission done">${giver(m)}<div><div>${U.esc(m.text)}</div><small>Accompli le ${U.fmtDate(r.ts)}</small></div><span class="m-xp">+${m.xp}</span></li>`;
      }
      if (!Engine.missionUnlocked(s, m)) {
        return `<li class="mission locked">${giver(m)}<div><div>${U.esc(m.text)}</div><small>${Icons.get('lock', 12)} Confié à : ${U.esc(Engine.missionLockLabel(m))}</small></div><span class="m-xp">+${m.xp}</span></li>`;
      }
      return `<li class="mission open">${giver(m)}<div class="m-main">${who(m)}<div>${U.esc(m.text)}</div></div>
        <span class="m-xp">+${m.xp}</span><button class="btn primary sm" data-act="missionDone" data-id="${m.id}">Je l'ai fait</button></li>`;
    };
    return `<ul class="missions">${[...open, ...locked].map(row).join('')}</ul>
      ${done.length ? `<details class="m-done"><summary>Contrats accomplis (${done.length})</summary><ul class="missions">${done.map(row).join('')}</ul></details>` : ''}`;
  },
  table(head, rows) {
    if (!rows.length) return '<p class="muted">Aucune donnée.</p>';
    return `<div class="table-wrap"><table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  },
  tabs(base, tabs, current) {
    return `<nav class="tabs">${tabs.map(([id, label]) => `<a href="#/${base}/${id}" class="${current === id ? 'active' : ''}">${label}</a>`).join('')}</nav>`;
  },
};

App.actions.missionDone = el => {
  const id = el.dataset.id;
  const m = Engine.allMissions(App.state).find(x => x.id === id);
  if (!m || App.state.missions[id] || !Engine.missionUnlocked(App.state, m)) return;
  App.state.missions[id] = { ts: Date.now() };
  App.grant(m.domain, m.xp, `Contrat de ${NPCS[Engine.missionGiver(m)].name} : ${m.text}`);
  App.commit();
};
App.actions.giftClaim = el => {
  const g = App.state.gifts.list.find(x => x.id === el.dataset.id);
  if (g && !g.claimedTs) g.claimedTs = Date.now();
  if (el.dataset.close) App.closeModal();
  App.toast('<b>Profite.</b><small>Tu l\'as méritée.</small>');
  App.save();
  App.render(false);
};
App.actions.lootEquip = el => {
  const [part, id] = el.dataset.key.split(':');
  const av = { ...Avatar.sanitize(App.state, App.state.profile.avatar) };
  if (part === 'extras') av.extras = [...new Set([...(av.extras || []), id])];
  else av[part] = id;
  App.state.profile.avatar = Avatar.sanitize(App.state, av);
  App.closeModal();
  App.toast('<b>Équipé.</b>');
  App.save();
  App.render(false);
};
App.actions.timer = el => App.startTimer(el.dataset.text || 'Passe à l\'action');

/* ---------- Actions PNJ ---------- */
App.actions.npcAccept = el => {
  const s = App.state;
  s.npc.arcs[el.dataset.id] = { status: 'active', acceptedTs: Date.now(), stepsDone: 0, manual: {} };
  const arc = ARCS.find(a => a.id === el.dataset.id);
  App.closeModal();
  App.toast(`<b>Quête acceptée</b><small>${U.esc(arc.title)} — suis-la dans l'onglet Quêtes.</small>`);
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
  App.toast(`<b>Nouveau titre</b><small>${U.esc(arc.reward.title)}</small>`);
  App.commit();
};
