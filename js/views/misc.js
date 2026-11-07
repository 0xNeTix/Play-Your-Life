/* Récompenses réelles, titres, réglages */
Views.rewards = {
  render() {
    const s = App.state;
    const name = d => (d === 'char' ? '⭐ Personnage' : `${GAME.domains[d].icon} ${GAME.domains[d].name}`);
    const rw = s.rewards.slice().sort((a, b) => a.level - b.level);
    const ready = rw.filter(r => Engine.rewardUnlocked(s, r) && !r.claimedTs);
    const locked = rw.filter(r => !Engine.rewardUnlocked(s, r));
    const claimed = rw.filter(r => r.claimedTs);
    const ideas = GAME.rewardIdeas.filter(i => !s.rewards.some(r => r.text === i.text));

    const titleRows = ['char', ...GAME.domainOrder].map(d => {
      const lv = Engine.levelOf(s, d);
      return `<div class="title-row"><span class="tr-d">${name(d)}</span><div class="tr-list">${GAME.titles[d].map(([l, t]) => `<span class="ttl ${lv >= l ? 'on' : ''}" title="Niveau ${l}">${lv >= l ? '' : '🔒 '}${U.esc(t)} <small>${l}</small></span>`).join('')}</div></div>`;
    }).join('');

    const rankRows = Engine.activeExercises(s).map(k => {
      const b = Engine.best(s, k);
      const cur = b == null ? null : Engine.rank(k, b).letter;
      return `<div class="title-row"><span class="tr-d">${GAME.exercises[k].icon} ${GAME.exercises[k].name}</span><div class="tr-list">${GAME.exercises[k].ranks.map(([v, l]) => `<span class="ttl ${b != null && b >= v ? 'on' : ''} ${cur === l ? 'cur' : ''}">${l} <small>${k === 'plank' ? U.fmtDuration(v) : v}</small></span>`).join('')}</div></div>`;
    }).join('');

    return `
      <header class="page-head">
        <p class="eyebrow">🎁 Récompenses</p>
        <h1>Chaque niveau se paie en vrai.</h1>
        <p class="muted">Les meilleures récompenses ne sont pas des badges : ce sont des choses réelles que tu t'offres uniquement quand tu as atteint le niveau. Fixe-les maintenant, avant d'y être.</p>
      </header>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Nouvelle récompense réelle</h2></div>
          <form data-form="reward" class="stack-form">
            <div class="row">
              <label>Domaine<select name="domain">${UI.domainOptions('sport', true)}</select></label>
              <label>Au niveau<input name="level" type="number" min="2" max="99" value="${Engine.domainLevel(s, 'sport').level + 2}" required></label>
            </div>
            <label>Je m'offre…<input name="text" required maxlength="100" placeholder="Ex. un massage, un jeu, une sortie…"></label>
            <button class="btn primary">Ajouter</button>
          </form>
          ${ideas.length ? `<p class="muted small">Idées :</p><div class="chips">${ideas.map(i => `<button class="chip" data-act="rewardIdea" data-d="${i.domain}" data-l="${i.level}" data-t="${U.esc(i.text)}">${name(i.domain)} ${i.level} · ${U.esc(i.text)}</button>`).join('')}</div>` : ''}
        </div>

        <div class="card">
          <div class="card-head"><h2>🎉 À réclamer</h2><span class="pill ${ready.length ? 'ok' : ''}">${ready.length}</span></div>
          ${ready.length ? `<ul class="rewards">${ready.map(r => `<li class="reward ready"><div><strong>${U.esc(r.text)}</strong><small>${name(r.domain)} niv. ${r.level} atteint</small></div><button class="btn primary sm" data-act="rewardClaim" data-id="${r.id}">Je l'ai prise ✔</button></li>`).join('')}</ul>`
            : '<p class="empty-hint">Rien à réclamer pour l\'instant. Monte de niveau.</p>'}
          <h3>🔒 En jeu</h3>
          ${locked.length ? `<ul class="rewards">${locked.map(r => {
            const lv = Engine.levelOf(s, r.domain);
            return `<li class="reward"><div><strong>${U.esc(r.text)}</strong><small>${name(r.domain)} : niveau ${lv} / ${r.level}</small>
              <div class="xpbar sm ${r.domain === 'char' ? '' : 'dom-' + r.domain}"><span style="width:${Math.min(100, (lv / r.level) * 100).toFixed(0)}%"></span></div></div>
              <button class="icon-btn" data-act="rewardDel" data-id="${r.id}" aria-label="Supprimer">✕</button></li>`;
          }).join('')}</ul>` : '<p class="muted small">Aucune récompense en jeu. Ajoute-en au moins une par domaine.</p>'}
          ${claimed.length ? `<h3>✅ Obtenues</h3><ul class="rewards">${claimed.map(r => `<li class="reward claimed"><div><strong>${U.esc(r.text)}</strong><small>${name(r.domain)} niv. ${r.level} · le ${U.fmtDate(r.claimedTs)}</small></div></li>`).join('')}</ul>` : ''}
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>🏷️ Titres</h2></div>
        ${titleRows}
      </section>
      <section class="card">
        <div class="card-head"><h2>🥇 Rangs physiques</h2></div>
        ${rankRows}
      </section>`;
  },
};

App.forms.reward = (fd) => {
  const text = String(fd.get('text') || '').trim();
  const level = Math.round(Number(fd.get('level')));
  if (!text || !(level >= 2)) return;
  App.state.rewards.push({ id: U.uid(), domain: fd.get('domain'), level, text });
  App.commit();
};
App.actions.rewardIdea = el => {
  App.state.rewards.push({ id: U.uid(), domain: el.dataset.d, level: Number(el.dataset.l), text: el.dataset.t });
  App.commit();
};
App.actions.rewardClaim = el => {
  const r = App.state.rewards.find(x => x.id === el.dataset.id);
  if (r) { r.claimedTs = Date.now(); App.toast('<b>Récompense obtenue.</b><small>Profite, tu l\'as méritée.</small>'); App.commit(); }
};
App.actions.rewardDel = el => {
  App.state.rewards = App.state.rewards.filter(x => x.id !== el.dataset.id);
  App.commit();
};

/* ---------- Réglages ---------- */
Views.settings = {
  render() {
    const s = App.state;
    return `
      <header class="page-head"><p class="eyebrow">⚙️ Réglages</p><h1>Personnage & données</h1></header>
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Profil</h2></div>
          <form data-form="settings" class="stack-form">
            <label>Nom<input name="name" value="${U.esc(s.profile.name)}" required maxlength="30"></label>
            <label>Domaine professionnel<select name="proDomain">
              <option value="it" ${s.profile.proDomain === 'it' ? 'selected' : ''}>Informatique</option>
              <option value="other" ${s.profile.proDomain === 'other' ? 'selected' : ''}>Autre</option></select></label>
            <label>Nom du domaine (si « Autre »)<input name="proDomainName" value="${s.profile.proDomain === 'other' ? U.esc(s.profile.proDomainName) : ''}" maxlength="40"></label>
            <label>Test de squat<select name="squatUnit">
              <option value="reps" ${s.settings.squatUnit === 'reps' ? 'selected' : ''}>Répétitions max</option>
              <option value="kg" ${s.settings.squatUnit === 'kg' ? 'selected' : ''}>Charge max (kg)</option></select></label>
            <label>Thème<select name="theme">
              <option value="auto" ${s.settings.theme === 'auto' ? 'selected' : ''}>Système</option>
              <option value="dark" ${s.settings.theme === 'dark' ? 'selected' : ''}>Sombre</option>
              <option value="light" ${s.settings.theme === 'light' ? 'selected' : ''}>Clair</option></select></label>
            <button class="btn primary">Enregistrer</button>
          </form>
        </div>
        <div class="card">
          <div class="card-head"><h2>Données</h2></div>
          <p class="muted small">Tout est stocké uniquement dans ce navigateur, photos comprises. Rien n'est envoyé sur internet. Exporte régulièrement pour ne rien perdre.</p>
          <div class="btn-col">
            <button class="btn" data-act="exportData">⬇️ Exporter une sauvegarde (.json)</button>
            <label class="btn">⬆️ Importer une sauvegarde<input type="file" accept="application/json,.json" data-change="importData" hidden></label>
            <button class="btn danger" data-act="resetAll">🗑️ Tout effacer</button>
          </div>
        </div>
      </section>`;
  },
};

App.forms.settings = (fd) => {
  const s = App.state;
  s.profile.name = String(fd.get('name')).trim() || s.profile.name;
  s.profile.proDomain = fd.get('proDomain');
  s.profile.proDomainName = s.profile.proDomain === 'it' ? 'Informatique' : (String(fd.get('proDomainName') || '').trim() || 'Mon métier');
  s.settings.squatUnit = fd.get('squatUnit');
  s.settings.theme = fd.get('theme');
  App.applyTheme();
  App.toast('Réglages enregistrés.');
  App.commit();
};

App.actions.exportData = async () => {
  const photos = await Store.allPhotos();
  const blob = new Blob([JSON.stringify({ app: 'rpg-irl', exportedAt: Date.now(), state: App.state, photos })], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rpg-irl-sauvegarde-${U.dayKey()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};

App.actions.importData = async el => {
  const f = el.files && el.files[0];
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (data.app !== 'rpg-irl' || !data.state) throw new Error('Fichier non reconnu');
    if (!confirm('Remplacer toutes les données actuelles par cette sauvegarde ?')) return;
    await Store.clearPhotos();
    for (const p of data.photos || []) await Store.putPhoto(p.id, p.dataUrl);
    Store.save(data.state);
    App.state = Store.load();
    App.applyTheme();
    App.toast('Sauvegarde importée.');
    App.go('#/home');
  } catch (e) {
    App.toast('Import impossible : ' + U.esc(e.message), 'warn');
  }
};

App.actions.resetAll = async () => {
  if (!confirm('Effacer définitivement le personnage, l\'historique et les photos ? Cette action est irréversible.')) return;
  await Store.clearPhotos();
  Store.wipe();
  App.state = Store.load();
  App.go('#/onboarding');
};
