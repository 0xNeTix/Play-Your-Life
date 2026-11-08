/* Corps : tests, séances & régularité, course à pied, physique (photos), missions */
const SPORT_TABS = [['tests', '🏁 Tests'], ['seances', '🏋️ Séances'], ['course', '🏃 Course'], ['physique', '📸 Physique'], ['missions', '🎯 Missions']];

Views.sport = {
  render([tab = 'tests']) {
    if (!SPORT_TABS.some(t => t[0] === tab)) tab = 'tests';
    this.tab = tab;
    return `
      ${UI.pageHead('sport', 'Ton corps ne ment pas.')}
      ${UI.tabs('sport', SPORT_TABS, tab)}
      ${this['tab_' + tab]()}`;
  },
  mount() {
    const fn = this['mount_' + this.tab];
    if (fn) fn.call(this);
  },

  /* ================= Tests ================= */
  tab_tests() {
    const s = App.state;
    const exos = Engine.activeExercises(s);
    const noTests = !s.sport.tests.length;
    const cards = exos.map(k => {
      const ex = GAME.exercises[k];
      const tests = Engine.testsFor(s, k);
      const b = Engine.best(s, k);
      const r = b == null ? null : Engine.rank(k, b);
      const last = tests[tests.length - 1];
      let prog = 0;
      if (r && r.next) {
        const cur = ex.ranks[r.index][0];
        prog = ex.lowerBetter
          ? (isFinite(cur) ? (cur - b) / (cur - r.next.at) : b ? r.next.at / b : 0)
          : (b - cur) / (r.next.at - cur);
      }
      return `<div class="card record">
        <div class="rec-head"><span>${ex.icon} ${ex.name}</span>${r ? `<span class="rank rank-${r.letter.replace('+', 'p')}">${r.letter}</span>` : '<span class="rank rank-none">?</span>'}</div>
        <div class="rec-val">${b == null ? '—' : Engine.fmtTest(k, b)}</div>
        <div class="muted small">${b == null ? 'Pas encore testé' : `Record · dernier test ${U.fmtShort(last.ts)} : ${Engine.fmtTest(k, last.value)}`}</div>
        ${r && r.next ? `<div class="rec-next">Rang ${r.next.letter} à ${Engine.fmtTest(k, r.next.at)}</div>
          <div class="xpbar sm dom-sport"><span style="width:${(U.clamp(prog, 0, 1) * 100).toFixed(0)}%"></span></div>` : r ? '<div class="rec-next">Rang maximum atteint 👑</div>' : ''}
      </div>`;
    }).join('');

    return `
      ${noTests ? '<div class="callout">🎯 <strong>Première étape :</strong> fais maintenant tes tests de référence. Ils n\'ont pas besoin d\'être bons, ils doivent être vrais.</div>' : ''}
      <section class="grid-auto">${cards}</section>
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Enregistrer un test</h2></div>
          <form data-form="test" class="stack-form">
            <label>Exercice
              <select name="exo" data-change="exoRule" id="exo-select">
                ${exos.map(k => `<option value="${k}">${GAME.exercises[k].icon} ${GAME.exercises[k].name}</option>`).join('')}
              </select>
            </label>
            <p class="rule small" id="exo-rule">📏 ${U.esc(GAME.exercises[exos[0]].rule)}</p>
            <label><span id="exo-label">${this.testLabel(exos[0])}</span>
              <div class="row">
                <input name="value" id="exo-value" required inputmode="numeric" autocomplete="off">
                <button type="button" class="btn ghost" id="chrono-btn" hidden>⏱ Chrono</button>
              </div>
            </label>
            <button class="btn primary">Valider le test</button>
            <p class="muted small">+${GAME.xp.testFirst} XP pour un premier test, +${GAME.xp.testDaily} par test (1 fois par jour et par exercice), bonus si record battu, +${GAME.xp.rankUp} par rang gagné. Le test de course se choisit dans les réglages (distance en 12 min ou rythme sur 5 km).</p>
          </form>
        </div>
        <div class="card">
          <div class="card-head"><h2>Grille des rangs</h2></div>
          ${exos.map(k => `<div class="title-row"><span class="tr-d">${GAME.exercises[k].icon} ${GAME.exercises[k].name}</span><div class="tr-list">${GAME.exercises[k].ranks.slice(1).map(([v, l]) => `<span class="ttl">${l} <small>${Engine.fmtTest(k, v)}</small></span>`).join('')}</div></div>`).join('')}
        </div>
      </section>`;
  },
  testLabel(k) {
    const ex = GAME.exercises[k];
    if (ex.input === 'time') return 'Durée (secondes, ou mm:ss)';
    if (ex.input === 'time5k') return 'Temps total sur 5 km (mm:ss)';
    return `Résultat (${ex.unit})`;
  },
  mount_tests() {
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
        iv = setInterval(() => { const sec = Math.floor((Date.now() - t0) / 1000); btn.textContent = `⏹ ${U.fmtClock(sec)}`; input.value = sec; }, 250);
      }
    };
  },

  /* ================= Séances & régularité ================= */
  tab_seances() {
    const s = App.state;
    const goal = s.settings.weeklyGoal;
    const thisWeek = Engine.workoutsInWeek(s);
    const reg = Engine.regularity(s);
    const ws = Engine.weekStreak(s);
    const sessions = s.sport.sessions.slice().sort((a, b) => b.ts - a.ts);
    const prs = Engine.liftPRs(s);
    const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const monday = U.weekStart();
    const dayDots = days.map((d, i) => {
      const a = new Date(monday); a.setDate(a.getDate() + i);
      const k = U.dayKey(a);
      const n = thisWeek.filter(w => U.dayKey(w.ts) === k).length;
      return `<div class="day-dot ${n ? 'on' : ''} ${k === U.dayKey() ? 'today' : ''}"><span>${d}</span><i>${n || ''}</i></div>`;
    }).join('');
    const today = U.dayKey();
    const minDay = U.dayKey(Date.now() - 7 * 86400000);
    const prRows = Object.entries(prs).sort((a, b) => EXERCISES.byId[a[0]].name.localeCompare(EXERCISES.byId[b[0]].name))
      .map(([id, p]) => [U.esc(EXERCISES.byId[id].name), this.fmtLoad(p.kind, p.value), U.fmtDate(p.ts)]);

    return `
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Régularité</h2><span class="pill ${thisWeek.length >= goal ? 'ok' : ''}">${thisWeek.length} / ${goal} cette semaine</span></div>
          <div class="week-dots">${dayDots}</div>
          <div class="kpi-row">
            <div><div class="kpi-v">${ws}</div><div class="muted small">semaine${ws > 1 ? 's' : ''} d'affilée à l'objectif</div></div>
            <div><div class="kpi-v">${reg == null ? '—' : reg + ' %'}</div><div class="muted small">semaines réussies (8 dernières)</div></div>
            <div><div class="kpi-v">${Engine.workouts(s).length}</div><div class="muted small">séances au total</div></div>
          </div>
          <p class="muted small">Objectif : ${goal} séances par semaine (courses comprises). +${GAME.xp.weekGoal} XP Corps et +${GAME.xp.weekGoalDiscipline} XP Discipline chaque semaine où il est atteint. Modifiable dans les réglages.</p>
          <div id="ch-sessions"></div>
        </div>

        <div class="card">
          <div class="card-head"><h2>Enregistrer une séance</h2></div>
          <form data-form="workout" class="stack-form" id="workout-form">
            <div class="row">
              <label>Type<select name="type">${Object.entries(GAME.workoutTypes).map(([k, t]) => `<option value="${k}">${t.icon} ${t.label}</option>`).join('')}</select></label>
              <label>Date<input type="date" name="date" value="${today}" min="${minDay}" max="${today}" required></label>
            </div>
            <div class="row">
              <label>Durée (min)<input type="number" name="minutes" min="5" max="600" required></label>
              <label class="slider"><span>Intensité ressentie <output id="out-rpe">6</output>/10</span><input type="range" name="rpe" min="1" max="10" value="6" data-out="out-rpe"></label>
            </div>
            <div class="ex-rows" id="ex-rows"></div>
            <button type="button" class="btn ghost" data-act="addExRow">＋ Ajouter un exercice</button>
            <label>Notes (optionnel)<input name="notes" maxlength="200" placeholder="Ressenti, programme suivi…"></label>
            <button class="btn primary">Valider la séance (+1 XP/min, max ${GAME.xp.workoutMax})</button>
          </form>
        </div>
      </section>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Historique</h2><span class="muted small">${sessions.length}</span></div>
          ${sessions.length ? `<ul class="log">${sessions.slice(0, 15).map(se => {
            const t = GAME.workoutTypes[se.type] || GAME.workoutTypes.other;
            const ex = (se.exercises || []).map(e => `${EXERCISES.byId[e.ex]?.name || e.ex} ${this.fmtSet(e)}`).join(' · ');
            return `<li><span>${t.icon} ${t.label} · RPE ${se.rpe}</span><strong>${U.fmtDate(se.ts, { weekday: 'short', day: 'numeric', month: 'short' })} · ${se.minutes} min</strong>${ex ? `<small>${U.esc(ex)}</small>` : ''}${se.notes ? `<small>« ${U.esc(se.notes)} »</small>` : ''}</li>`;
          }).join('')}</ul>` : '<p class="empty-hint">Aucune séance. La prochaine que tu fais, note-la ici juste après.</p>'}
        </div>
        <div class="card">
          <div class="card-head"><h2>Records du carnet</h2></div>
          ${prRows.length ? UI.table(['Exercice', 'Meilleur', 'Date'], prRows) : '<p class="empty-hint">Ajoute des exercices à tes séances pour suivre tes charges et répétitions max.</p>'}
        </div>
      </section>`;
  },
  fmtLoad(kind, v) {
    return kind === 'kg' ? `${v} kg` : kind === 'time' ? U.fmtDuration(v) : kind === 'cardio' ? `${v} min` : `${v} rép.`;
  },
  fmtSet(e) {
    const ex = EXERCISES.byId[e.ex];
    if (!ex) return '';
    if (ex.kind === 'cardio') return `${e.min} min`;
    if (ex.kind === 'time') return `${e.sets}×${U.fmtDuration(e.sec)}`;
    if (ex.kind === 'kg') return `${e.sets}×${e.reps} @ ${e.kg} kg`;
    return `${e.sets}×${e.reps}`;
  },
  exRowHtml() {
    const opts = Object.entries(EXERCISES.groups).map(([g, items]) => `<optgroup label="${U.esc(g)}">${items.map(([id, n]) => `<option value="${id}">${U.esc(n)}</option>`).join('')}</optgroup>`).join('');
    return `<div class="ex-row">
      <select name="ex" data-change="exKind"><option value="">— Exercice —</option>${opts}</select>
      <input name="sets" type="number" min="1" max="50" placeholder="Séries" title="Séries">
      <input name="reps" type="number" min="1" max="1000" placeholder="Rép." title="Répétitions">
      <input name="load" type="number" min="0" max="1000" step="0.5" placeholder="kg" title="Charge (kg)">
      <button type="button" class="icon-btn" data-act="delExRow" aria-label="Retirer">✕</button>
    </div>`;
  },
  mount_seances() {
    const rows = document.getElementById('ex-rows');
    if (rows && !rows.children.length) rows.insertAdjacentHTML('beforeend', this.exRowHtml());
    const s = App.state;
    const el = document.getElementById('ch-sessions');
    if (el) {
      const ws = U.weekStart();
      const items = [];
      for (let i = 11; i >= 0; i--) {
        const a = new Date(ws); a.setDate(a.getDate() - i * 7);
        const n = Engine.workoutsInWeek(s, a).length;
        items.push({ label: 'S' + U.weekKey(a).split('-W')[1], value: n, tip: `<strong>${n} séance${n > 1 ? 's' : ''}</strong><span>Semaine du ${U.fmtShort(a)}</span>` });
      }
      Charts.columns(el, items, { color: 'var(--c-sport)', height: 170, goal: s.settings.weeklyGoal, label: 'Séances par semaine', emptyMsg: 'Aucune séance sur les 12 dernières semaines' });
    }
  },

  /* ================= Course ================= */
  tab_course() {
    const s = App.state;
    const st = Engine.runStats(s);
    const runs = s.sport.runs.slice().sort((a, b) => b.ts - a.ts);
    const today = U.dayKey();
    const minDay = U.dayKey(Date.now() - 7 * 86400000);
    return `
      <section class="grid-auto kpis">
        <div class="card kpi"><div class="kpi-v">${U.fmtKm(Math.round(st.km * 10) / 10)}</div><div class="muted small">au total · ${st.count} sortie${st.count > 1 ? 's' : ''}</div></div>
        <div class="card kpi"><div class="kpi-v">${U.fmtKm(Math.round(st.weekKm * 10) / 10)}</div><div class="muted small">cette semaine · ${U.fmtKm(Math.round(st.monthKm * 10) / 10)} ce mois</div></div>
        <div class="card kpi"><div class="kpi-v">${st.longest ? U.fmtKm(st.longest.km) : '—'}</div><div class="muted small">plus longue sortie</div></div>
        <div class="card kpi"><div class="kpi-v">${st.fastest ? U.fmtPace(st.fastest.sec / st.fastest.km) + ' /km' : '—'}</div><div class="muted small">meilleur rythme (3 km et plus)</div></div>
      </section>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Enregistrer une course</h2></div>
          <form data-form="run" class="stack-form">
            <div class="row">
              <label>Type<select name="type">${Object.entries(GAME.runTypes).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
              <label>Date<input type="date" name="date" value="${today}" min="${minDay}" max="${today}" required></label>
            </div>
            <div class="row">
              <label>Distance (km)<input name="km" type="number" step="0.01" min="0.2" max="300" required data-input="runPreview"></label>
              <label>Temps (h:mm:ss ou mm:ss)<input name="time" required placeholder="32:15" data-input="runPreview" autocomplete="off"></label>
            </div>
            <div class="run-preview" id="run-preview"><span>Rythme : <strong>—</strong></span><span>Vitesse : <strong>—</strong></span></div>
            <label>Notes (optionnel)<input name="notes" maxlength="200" placeholder="Parcours, sensations…"></label>
            <button class="btn primary">Valider la course</button>
            <p class="muted small">+${GAME.xp.runPerKm} XP par km (max ${GAME.xp.runMax}), +${GAME.xp.runRecord} XP pour une plus longue sortie ou un meilleur rythme. Chaque course compte comme une séance pour ta régularité.</p>
          </form>
        </div>
        <div class="card">
          <div class="card-head"><h2>Kilomètres par semaine</h2></div>
          <div id="ch-runkm"></div>
          <div class="card-head" style="margin-top:14px"><h2>Évolution du rythme</h2><span class="muted small">min/km, plus bas = plus rapide</span></div>
          <div id="ch-pace"></div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2>Historique des courses</h2></div>
        ${UI.table(['Date', 'Type', 'Distance', 'Temps', 'Rythme', 'Vitesse'], runs.slice(0, 30).map(r => [
          U.fmtDate(r.ts), GAME.runTypes[r.type] || r.type, U.fmtKm(r.km), U.fmtClock(r.sec), `${U.fmtPace(r.sec / r.km)} /km`, `${(r.km / (r.sec / 3600)).toFixed(1)} km/h`,
        ]))}
      </section>`;
  },
  mount_course() {
    const s = App.state;
    const ws = U.weekStart();
    const items = [];
    for (let i = 11; i >= 0; i--) {
      const a = new Date(ws); a.setDate(a.getDate() - i * 7);
      const b = a.getTime() + 7 * 86400000;
      const km = Math.round(s.sport.runs.filter(r => r.ts >= a && r.ts < b).reduce((t, r) => t + r.km, 0) * 10) / 10;
      items.push({ label: 'S' + U.weekKey(a).split('-W')[1], value: km, tip: `<strong>${U.fmtKm(km)}</strong><span>Semaine du ${U.fmtShort(a)}</span>` });
    }
    const el = document.getElementById('ch-runkm');
    if (el) Charts.columns(el, items, { color: 'var(--c-sport)', height: 170, label: 'Kilomètres par semaine', emptyMsg: 'Aucune course sur les 12 dernières semaines' });
    const pel = document.getElementById('ch-pace');
    const pts = s.sport.runs.filter(r => r.km >= 1).sort((a, b) => a.ts - b.ts).map(r => ({ x: r.ts, y: Math.round(r.sec / r.km), note: U.fmtKm(r.km) }));
    if (pel) Charts.line(pel, pts, { color: 'var(--c-sport)', height: 170, fmt: v => U.fmtPace(v), label: 'Rythme', emptyMsg: 'Enregistre ta première course' });
  },

  /* ================= Physique ================= */
  tab_physique() {
    const s = App.state;
    const checkin = Engine.checkinThisWeek(s);
    const checkins = s.sport.checkins.slice().sort((a, b) => a.ts - b.ts);
    const last = checkins[checkins.length - 1];
    return `
      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Check-in de la semaine</h2><span class="pill ${checkin ? 'ok' : ''}">${U.weekKey().replace('-W', ' · S')}</span></div>
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
        <div class="card">
          <div class="card-head"><h2>Évolution physique</h2><span class="muted small">${checkins.length} photo${checkins.length > 1 ? 's' : ''}</span></div>
          ${checkins.length >= 2 ? `
            <div class="compare-ctrl">
              <label>Avant<select id="cmp-a" data-change="compare">${checkins.map((c, i) => `<option value="${c.id}" ${i === 0 ? 'selected' : ''}>S${c.week.split('-W')[1]} ${c.week.slice(0, 4)} · ${c.total}/100</option>`).join('')}</select></label>
              <label>Après<select id="cmp-b" data-change="compare">${checkins.map((c, i) => `<option value="${c.id}" ${i === checkins.length - 1 ? 'selected' : ''}>S${c.week.split('-W')[1]} ${c.week.slice(0, 4)} · ${c.total}/100</option>`).join('')}</select></label>
            </div>
            <div class="compare-pair"><div class="photo-slot has"><img id="cmp-img-a" alt="Avant"></div><div class="photo-slot has"><img id="cmp-img-b" alt="Après"></div></div>` : ''}
          ${checkins.length ? `<div class="gallery">${checkins.slice().reverse().map(c => `<figure><div class="photo-slot has"><img data-photo="${c.photoId}" alt="Semaine ${c.week}"></div><figcaption>S${c.week.split('-W')[1]} · <strong>${c.total}</strong></figcaption></figure>`).join('')}</div>`
            : '<p class="empty-hint">Ta première photo sera ton point de départ. Dans 3 mois, tu seras content de l\'avoir prise.</p>'}
        </div>
      </section>`;
  },
  mount_physique() {
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
  },

  /* ================= Missions ================= */
  tab_missions() {
    return `<section class="card"><div class="card-head"><h2>Missions Corps</h2></div>${UI.missions(GAME.missions.filter(m => m.domain === 'sport'))}</section>`;
  },
};

/* ---------- Actions : tests ---------- */
App.actions.exoRule = el => {
  const ex = GAME.exercises[el.value];
  document.getElementById('exo-rule').textContent = '📏 ' + ex.rule;
  document.getElementById('exo-label').textContent = Views.sport.testLabel(el.value);
  document.getElementById('chrono-btn').hidden = el.value !== 'plank';
};

App.forms.test = fd => {
  const s = App.state;
  const key = fd.get('exo');
  const ex = GAME.exercises[key];
  const raw = String(fd.get('value') || '').trim().replace(',', '.');
  let value;
  if (ex.input === 'time') value = raw.includes(':') ? U.parseClock(raw) : Number(raw);
  else if (ex.input === 'time5k') value = U.parseClock(raw) / 5;
  else value = Number(raw);
  value = Math.round(value);
  const valid = ex.input === 'time5k' ? value >= 150 && value <= ex.max : value > 0 && value <= ex.max;
  if (!ex || !valid) { App.toast(ex.input === 'time5k' ? 'Temps invalide : saisis ton temps sur 5 km, ex. 27:30.' : `Valeur invalide (1 à ${ex.max}).`, 'warn'); return; }
  const prevBest = Engine.best(s, key);
  const today = U.dayKey();
  const testedToday = s.sport.tests.some(t => t.exo === key && U.dayKey(t.ts) === today);
  s.sport.tests.push({ id: U.uid(), ts: Date.now(), exo: key, value });
  const label = Engine.fmtTest(key, value);
  if (prevBest == null) {
    App.grant('sport', GAME.xp.testFirst, `Test de référence ${ex.name} : ${label}`);
  } else {
    if (!testedToday) App.grant('sport', GAME.xp.testDaily, `Test ${ex.name} : ${label}`);
    if (Engine.better(key, value, prevBest)) {
      const gain = Math.abs(value - prevBest) / prevBest * 100;
      App.grant('sport', U.clamp(Math.round(gain * 3), GAME.xp.prMin, GAME.xp.prMax), `Record ${ex.name} : ${label} (${gain.toFixed(0)} % de mieux)`);
      const before = Engine.rank(key, prevBest).index, after = Engine.rank(key, value).index;
      for (let i = before + 1; i <= after; i++) App.grant('sport', GAME.xp.rankUp, `Rang ${ex.ranks[i][1]} en ${ex.name}`);
    } else if (testedToday) {
      App.toast('Test enregistré. Pas d\'XP en plus aujourd\'hui sans nouveau record.');
    }
  }
  App.commit();
};

/* ---------- Actions : séances ---------- */
App.actions.addExRow = () => {
  const rows = document.getElementById('ex-rows');
  if (rows && rows.children.length < 20) rows.insertAdjacentHTML('beforeend', Views.sport.exRowHtml());
};
App.actions.delExRow = el => el.closest('.ex-row').remove();
App.actions.exKind = el => {
  const row = el.closest('.ex-row');
  const ex = EXERCISES.byId[el.value];
  const reps = row.querySelector('[name=reps]'), load = row.querySelector('[name=load]'), sets = row.querySelector('[name=sets]');
  const kind = ex ? ex.kind : 'reps';
  sets.hidden = kind === 'cardio';
  reps.hidden = kind === 'time' || kind === 'cardio';
  load.hidden = kind === 'reps';
  load.placeholder = kind === 'kg' ? 'kg' : kind === 'time' ? 'sec' : 'min';
  load.title = kind === 'kg' ? 'Charge (kg)' : kind === 'time' ? 'Durée par série (secondes)' : 'Durée (minutes)';
};

/* Bonus de régularité : objectif hebdomadaire atteint (une fois par semaine) */
function checkWeekGoal(ts) {
  const s = App.state;
  const wk = U.weekKey(ts);
  if (s.sport.goalWeeks[wk]) return;
  if (Engine.workoutsInWeek(s, new Date(ts)).length >= s.settings.weeklyGoal) {
    s.sport.goalWeeks[wk] = Date.now();
    App.grant('sport', GAME.xp.weekGoal, `Objectif de la semaine atteint (${s.settings.weeklyGoal} séances)`);
    App.grant('discipline', GAME.xp.weekGoalDiscipline, 'Régularité sportive');
  }
}
function tsFromDate(dateStr) {
  if (!dateStr || dateStr === U.dayKey()) return Date.now();
  const d = new Date(dateStr + 'T12:00:00');
  return isNaN(d) ? Date.now() : Math.min(d.getTime(), Date.now());
}

App.forms.workout = (fd, form) => {
  const s = App.state;
  const minutes = Math.round(Number(fd.get('minutes')));
  if (!(minutes >= 5 && minutes <= 600)) return;
  const exercises = [];
  form.querySelectorAll('.ex-row').forEach(row => {
    const id = row.querySelector('[name=ex]').value;
    const ex = EXERCISES.byId[id];
    if (!ex) return;
    const n = name => Number(row.querySelector(`[name=${name}]`).value) || 0;
    const e = { ex: id, sets: Math.max(1, n('sets')) };
    if (ex.kind === 'reps') e.reps = n('reps');
    if (ex.kind === 'kg') { e.reps = n('reps'); e.kg = n('load'); }
    if (ex.kind === 'time') e.sec = n('load');
    if (ex.kind === 'cardio') { e.min = n('load'); delete e.sets; }
    exercises.push(e);
  });
  const id = U.uid();
  const ts = tsFromDate(fd.get('date'));
  const type = fd.get('type');
  s.sport.sessions.push({ id, ts, type, minutes, rpe: Number(fd.get('rpe')), notes: String(fd.get('notes') || '').trim(), exercises });
  App.grant('sport', Math.min(GAME.xp.workoutMax, minutes * GAME.xp.workoutPerMin), `Séance ${GAME.workoutTypes[type].label} (${minutes} min)`, id);
  checkWeekGoal(ts);
  App.commit();
};

/* ---------- Actions : course ---------- */
App.actions.runPreview = el => {
  const f = el.form;
  const km = Number(String(f.km.value).replace(',', '.'));
  const sec = U.parseClock(f.time.value);
  const box = document.getElementById('run-preview');
  if (!box) return;
  if (km > 0 && sec > 0) {
    box.innerHTML = `<span>Rythme : <strong>${U.fmtPace(sec / km)} /km</strong></span><span>Vitesse : <strong>${(km / (sec / 3600)).toFixed(1)} km/h</strong></span>`;
  } else {
    box.innerHTML = '<span>Rythme : <strong>—</strong></span><span>Vitesse : <strong>—</strong></span>';
  }
};

App.forms.run = fd => {
  const s = App.state;
  const km = Math.round(Number(String(fd.get('km')).replace(',', '.')) * 100) / 100;
  const sec = Math.round(U.parseClock(fd.get('time')));
  const pace = sec / km;
  if (!(km >= 0.2 && km <= 300) || !(sec > 0)) { App.toast('Distance ou temps invalide.', 'warn'); return; }
  if (pace < 150 || pace > 1200) { App.toast(`Rythme de ${U.fmtPace(pace)} /km improbable : vérifie le temps (h:mm:ss ou mm:ss).`, 'warn'); return; }
  const prev = Engine.runStats(s);
  const id = U.uid();
  const ts = tsFromDate(fd.get('date'));
  s.sport.runs.push({ id, ts, type: fd.get('type'), km, sec, notes: String(fd.get('notes') || '').trim() });
  App.grant('sport', U.clamp(Math.round(km * GAME.xp.runPerKm), GAME.xp.runMin, GAME.xp.runMax), `Course : ${U.fmtKm(km)} en ${U.fmtClock(sec)} (${U.fmtPace(pace)} /km)`, id);
  if (prev.longest && km > prev.longest.km) App.grant('sport', GAME.xp.runRecord, `Plus longue sortie : ${U.fmtKm(km)}`, id);
  if (prev.fastest && km >= 3 && pace < prev.fastest.sec / prev.fastest.km) App.grant('sport', GAME.xp.runRecord, `Meilleur rythme : ${U.fmtPace(pace)} /km`, id);
  checkWeekGoal(ts);
  App.commit();
};

/* ---------- Actions : physique ---------- */
App.actions.compare = async () => {
  const a = document.getElementById('cmp-a'), b = document.getElementById('cmp-b');
  if (!a || !b) return;
  const find = id => App.state.sport.checkins.find(c => c.id === id);
  const ca = find(a.value), cb = find(b.value);
  document.getElementById('cmp-img-a').src = (ca && (await Store.getPhoto(ca.photoId))) || '';
  document.getElementById('cmp-img-b').src = (cb && (await Store.getPhoto(cb.photoId))) || '';
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
    await Store.putPhoto(s, photoId, dataUrl);
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
