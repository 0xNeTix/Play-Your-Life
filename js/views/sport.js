/* Corps : tests physiques, check-in photo hebdomadaire, missions */
Views.sport = {
  render() {
    const s = App.state;
    const info = Engine.domainLevel(s, 'sport');
    const exos = Engine.activeExercises(s);
    const checkin = Engine.checkinThisWeek(s);
    const checkins = s.sport.checkins.slice().sort((a, b) => a.ts - b.ts);
    const noTests = !s.sport.tests.length;

    const recordCards = exos.map(k => {
      const ex = GAME.exercises[k];
      const tests = Engine.testsFor(s, k);
      const b = Engine.best(s, k);
      const r = b == null ? null : Engine.rank(k, b);
      const last = tests[tests.length - 1];
      const fmtV = v => (k === 'plank' ? U.fmtDuration(v) : `${v} ${ex.unit}`);
      return `<div class="card record">
        <div class="rec-head"><span>${ex.icon} ${ex.name}</span>${r ? `<span class="rank rank-${r.letter.replace('+', 'p')}">${r.letter}</span>` : '<span class="rank rank-none">?</span>'}</div>
        <div class="rec-val">${b == null ? '—' : fmtV(b)}</div>
        <div class="muted small">${b == null ? 'Pas encore testé' : `Record · dernier test ${U.fmtShort(last.ts)} : ${fmtV(last.value)}`}</div>
        ${r && r.next ? `<div class="rec-next">Rang ${r.next.letter} à ${k === 'plank' ? U.fmtDuration(r.next.at) : r.next.at + ' ' + ex.unit}</div>
          <div class="xpbar sm dom-sport"><span style="width:${Math.min(100, (b / r.next.at) * 100).toFixed(0)}%"></span></div>` : r ? '<div class="rec-next">Rang maximum atteint 👑</div>' : ''}
      </div>`;
    }).join('');

    const last = checkins[checkins.length - 1];

    return `
      <header class="page-head">
        <p class="eyebrow">💪 Corps · Niv. ${info.level} · ${U.esc(Engine.title('sport', info.level))}</p>
        <h1>Ton corps ne ment pas.</h1>
        ${UI.xpBar(info, 'sport')}
        <p class="muted small">${U.fmtNum(info.into)} / ${U.fmtNum(info.need)} XP avant le niveau ${info.level + 1}</p>
      </header>

      ${noTests ? '<div class="callout">🎯 <strong>Première étape :</strong> fais maintenant tes 3 tests de référence. Ce sont tes points de départ, ils n\'ont pas besoin d\'être bons, ils doivent être vrais.</div>' : ''}

      <section class="grid3">${recordCards}</section>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>🏁 Enregistrer un test</h2></div>
          <form data-form="test" class="stack-form">
            <label>Exercice
              <select name="exo" data-change="exoRule" id="exo-select">
                ${exos.map(k => `<option value="${k}">${GAME.exercises[k].icon} ${GAME.exercises[k].name}</option>`).join('')}
              </select>
            </label>
            <p class="rule small" id="exo-rule">📏 ${U.esc(GAME.exercises[exos[0]].rule)}</p>
            <label><span id="exo-label">Résultat (${GAME.exercises[exos[0]].unit})</span>
              <div class="row">
                <input name="value" id="exo-value" type="number" min="1" step="1" required inputmode="numeric">
                <button type="button" class="btn ghost" id="chrono-btn" hidden>⏱ Chrono</button>
              </div>
            </label>
            <button class="btn primary">Valider le test</button>
            <p class="muted small">XP : +${GAME.xp.testFirst} pour un premier test, +${GAME.xp.testDaily} par test (1 fois par jour et par exercice), bonus si record battu, +${GAME.xp.rankUp} par rang gagné.</p>
          </form>
        </div>

        <div class="card">
          <div class="card-head"><h2>📸 Check-in de la semaine</h2><span class="pill ${checkin ? 'ok' : ''}">${U.weekKey().replace('-W', ' · S')}</span></div>
          ${checkin ? `
            <div class="checkin-done">
              <div class="photo-slot has"><img id="ci-current" alt="Photo de la semaine"></div>
              <div>
                <div class="score-big">${checkin.total}<small>/100</small></div>
                ${checkin.weight ? `<div>Poids : <strong>${checkin.weight} kg</strong></div>` : ''}
                ${checkin.waist ? `<div>Tour de taille : <strong>${checkin.waist} cm</strong></div>` : ''}
                <p class="muted small">Prochain check-in à partir de lundi.</p>
                <button class="btn ghost sm" data-act="checkinDel" data-id="${checkin.id}">Supprimer et refaire</button>
              </div>
            </div>` : `
            <form data-form="checkin" class="stack-form">
              <p class="muted small">Même lieu, même lumière, même pose, le matin à jeun. La photo reste sur ton appareil.</p>
              <div class="compare-pair">
                <div><div class="small muted">${last ? 'Semaine ' + last.week.split('-W')[1] : 'Précédente'}</div><div class="photo-slot ${last ? 'has' : ''}"><img id="ci-prev" alt="">${last ? '' : '<span>Aucune</span>'}</div></div>
                <div><div class="small muted">Cette semaine</div><label class="photo-slot pick"><img id="ci-new" alt=""><span>＋ Photo</span><input type="file" name="photo" accept="image/*" capture="environment" data-preview="ci-new" required></label></div>
              </div>
              <p class="small"><strong>Note-toi en comparant avec la photo de gauche.</strong> Sois honnête : une note gonflée ne fait progresser personne.</p>
              ${GAME.checkinCriteria.map(c => `
                <label class="slider"><span>${c.label} <output id="out-${c.id}">5</output>/10</span>
                  <input type="range" name="${c.id}" min="1" max="10" value="${last?.scores?.[c.id] ?? 5}" data-out="out-${c.id}">
                  <small class="muted">${c.hint}</small></label>`).join('')}
              <div class="row">
                <label>Poids (kg, optionnel)<input name="weight" type="number" step="0.1" min="30" max="300"></label>
                <label>Tour de taille (cm, optionnel)<input name="waist" type="number" step="0.5" min="40" max="200"></label>
              </div>
              <button class="btn primary">Valider le check-in (+${GAME.xp.checkin} XP)</button>
            </form>`}
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>🖼️ Évolution physique</h2><span class="muted small">${checkins.length} photo${checkins.length > 1 ? 's' : ''}</span></div>
        ${checkins.length >= 2 ? `
          <div class="compare-ctrl">
            <label>Avant<select id="cmp-a" data-change="compare">${checkins.map((c, i) => `<option value="${c.id}" ${i === 0 ? 'selected' : ''}>S${c.week.split('-W')[1]} ${c.week.slice(0, 4)} · ${c.total}/100</option>`).join('')}</select></label>
            <label>Après<select id="cmp-b" data-change="compare">${checkins.map((c, i) => `<option value="${c.id}" ${i === checkins.length - 1 ? 'selected' : ''}>S${c.week.split('-W')[1]} ${c.week.slice(0, 4)} · ${c.total}/100</option>`).join('')}</select></label>
          </div>
          <div class="compare-pair big"><div class="photo-slot has"><img id="cmp-img-a" alt="Avant"></div><div class="photo-slot has"><img id="cmp-img-b" alt="Après"></div></div>` : ''}
        ${checkins.length ? `<div class="gallery">${checkins.slice().reverse().map(c => `<figure><div class="photo-slot has"><img data-photo="${c.photoId}" alt="Semaine ${c.week}"></div><figcaption>S${c.week.split('-W')[1]} · <strong>${c.total}</strong></figcaption></figure>`).join('')}</div>`
          : '<p class="empty-hint">Ta première photo sera ton point de départ. Dans 3 mois, tu seras content de l\'avoir prise.</p>'}
      </section>

      <section class="card">
        <div class="card-head"><h2>🎯 Missions Corps</h2></div>
        ${UI.missions(GAME.missions.filter(m => m.domain === 'sport'))}
      </section>`;
  },

  async mount() {
    const s = App.state;
    const ci = Engine.checkinThisWeek(s);
    const checkins = s.sport.checkins.slice().sort((a, b) => a.ts - b.ts);
    const setImg = async (id, photoId) => {
      const el = document.getElementById(id);
      if (el && photoId) el.src = (await Store.getPhoto(photoId)) || '';
    };
    if (ci) setImg('ci-current', ci.photoId);
    else if (checkins.length) setImg('ci-prev', checkins[checkins.length - 1].photoId);
    document.querySelectorAll('img[data-photo]').forEach(async img => { img.src = (await Store.getPhoto(img.dataset.photo)) || ''; });
    if (checkins.length >= 2) App.actions.compare();
    GAME.checkinCriteria.forEach(c => {
      const r = document.querySelector(`input[name=${c.id}]`);
      const o = document.getElementById('out-' + c.id);
      if (r && o) o.textContent = r.value;
    });
    Views.sport.setupChrono();
  },

  setupChrono() {
    const btn = document.getElementById('chrono-btn');
    const sel = document.getElementById('exo-select');
    if (!btn || !sel) return;
    btn.hidden = sel.value !== 'plank';
    let t0 = 0, iv = null;
    btn.onclick = () => {
      const input = document.getElementById('exo-value');
      if (iv) {
        clearInterval(iv); iv = null;
        input.value = Math.floor((Date.now() - t0) / 1000);
        btn.textContent = '⏱ Chrono';
        btn.classList.remove('running');
      } else {
        t0 = Date.now();
        btn.classList.add('running');
        iv = setInterval(() => { const sec = Math.floor((Date.now() - t0) / 1000); btn.textContent = `⏹ ${sec} s`; input.value = sec; }, 250);
      }
    };
  },
};

App.actions.exoRule = el => {
  const ex = GAME.exercises[el.value];
  document.getElementById('exo-rule').textContent = '📏 ' + ex.rule;
  document.getElementById('exo-label').textContent = `Résultat (${ex.unit})`;
  document.getElementById('chrono-btn').hidden = el.value !== 'plank';
};

App.actions.compare = async () => {
  const a = document.getElementById('cmp-a'), b = document.getElementById('cmp-b');
  if (!a || !b) return;
  const find = id => App.state.sport.checkins.find(c => c.id === id);
  const ca = find(a.value), cb = find(b.value);
  document.getElementById('cmp-img-a').src = (ca && (await Store.getPhoto(ca.photoId))) || '';
  document.getElementById('cmp-img-b').src = (cb && (await Store.getPhoto(cb.photoId))) || '';
};

App.forms.test = (fd) => {
  const s = App.state;
  const key = fd.get('exo');
  const ex = GAME.exercises[key];
  const value = Math.round(Number(fd.get('value')));
  if (!ex || !(value > 0) || value > ex.max) { App.toast(`Valeur invalide (1 à ${ex.max}).`, 'warn'); return; }
  const prevBest = Engine.best(s, key);
  const today = U.dayKey();
  const testedToday = s.sport.tests.some(t => t.exo === key && U.dayKey(t.ts) === today);
  s.sport.tests.push({ id: U.uid(), ts: Date.now(), exo: key, value });
  const label = key === 'plank' ? U.fmtDuration(value) : `${value} ${ex.unit}`;
  if (prevBest == null) {
    App.grant('sport', GAME.xp.testFirst, `Test de référence ${ex.name} : ${label}`);
  } else {
    if (!testedToday) App.grant('sport', GAME.xp.testDaily, `Test ${ex.name} : ${label}`);
    if (value > prevBest) {
      const gain = ((value - prevBest) / prevBest) * 100;
      App.grant('sport', U.clamp(Math.round(gain * 3), GAME.xp.prMin, GAME.xp.prMax), `Record ${ex.name} : ${label} (+${gain.toFixed(0)} %)`);
      const ranks = ex.ranks.map(r => r[1]);
      const before = ranks.indexOf(Engine.rank(key, prevBest).letter);
      const after = ranks.indexOf(Engine.rank(key, value).letter);
      for (let i = before + 1; i <= after; i++) App.grant('sport', GAME.xp.rankUp, `Rang ${ranks[i]} en ${ex.name}`);
    } else if (testedToday) {
      App.toast('Test enregistré. Pas d\'XP en plus aujourd\'hui sans nouveau record.');
    }
  }
  App.commit();
};

App.forms.checkin = async (fd, form) => {
  const s = App.state;
  if (Engine.checkinThisWeek(s)) return;
  const file = fd.get('photo');
  if (!file || !file.size) { App.toast('Ajoute ta photo de la semaine.', 'warn'); return; }
  const btn = form.querySelector('button.primary');
  btn.disabled = true; btn.textContent = 'Enregistrement…';
  try {
    const dataUrl = await U.compressImage(file);
    const photoId = U.uid();
    await Store.putPhoto(photoId, dataUrl);
    const scores = {};
    let sum = 0;
    for (const c of GAME.checkinCriteria) { scores[c.id] = Number(fd.get(c.id)); sum += scores[c.id]; }
    const total = Math.round((sum / (GAME.checkinCriteria.length * 10)) * 100);
    const prev = s.sport.checkins.slice().sort((a, b) => b.ts - a.ts)[0];
    const num = k => { const v = parseFloat(fd.get(k)); return isFinite(v) ? v : null; };
    const id = U.uid();
    s.sport.checkins.push({ id, ts: Date.now(), week: U.weekKey(), photoId, scores, total, weight: num('weight'), waist: num('waist') });
    App.grant('sport', GAME.xp.checkin, `Check-in physique S${U.weekKey().split('-W')[1]} : ${total}/100`, id);
    if (prev && total > prev.total) App.grant('sport', Math.min(GAME.xp.checkinBonusMax, (total - prev.total) * 2), `Progression physique : +${total - prev.total} pts`, id);
    App.commit();
  } catch (e) {
    btn.disabled = false; btn.textContent = 'Réessayer';
    App.toast('Erreur : ' + U.esc(e.message), 'warn');
  }
};

App.actions.checkinDel = async el => {
  if (!confirm('Supprimer le check-in de cette semaine ? L\'XP gagnée sera retirée.')) return;
  const s = App.state;
  const c = s.sport.checkins.find(x => x.id === el.dataset.id);
  if (!c) return;
  await Store.delPhoto(c.photoId);
  s.sport.checkins = s.sport.checkins.filter(x => x.id !== c.id);
  s.xpLog = s.xpLog.filter(e => e.ref !== c.id);
  App.commit();
};
