/* Règles du jeu : XP, niveaux, titres, rangs, déblocages, PNJ. Fonctions pures sur l'état. */
const Engine = (() => {
  const need = (n, base) => Math.round(base * Math.pow(n, GAME.levelExponent));

  function levelInfo(xp, base) {
    let level = 1, rem = xp;
    while (rem >= need(level, base)) { rem -= need(level, base); level++; }
    const n = need(level, base);
    return { level, into: rem, need: n, pct: rem / n, xp };
  }

  function domainXP(state) {
    const r = { pro: 0, sport: 0, intel: 0, discipline: 0 };
    for (const e of state.xpLog) r[e.domain] = (r[e.domain] || 0) + e.amount;
    return r;
  }
  const totalXP = s => Object.values(domainXP(s)).reduce((a, b) => a + b, 0);
  const domainLevel = (s, d) => levelInfo(domainXP(s)[d] || 0, GAME.levelBase.domain);
  const charLevel = s => levelInfo(totalXP(s), GAME.levelBase.char);
  const levelOf = (s, d) => (d === 'char' ? charLevel(s) : domainLevel(s, d)).level;

  function snapshot(s) {
    const o = { char: charLevel(s).level };
    for (const d of GAME.domainOrder) o[d] = domainLevel(s, d).level;
    return o;
  }

  function title(d, level) {
    const list = GAME.titles[d] || [];
    let t = list[0] ? list[0][1] : '';
    for (const [lv, name] of list) if (level >= lv) t = name;
    return t;
  }
  function titlesBetween(d, from, to) {
    return (GAME.titles[d] || []).filter(([lv]) => lv > from && lv <= to).map(([, n]) => n);
  }

  /* ---------- Tests physiques ---------- */
  const runKey = s => (s.settings.runTest === 'pace5k' ? 'pace5k' : 'cooper');
  function activeExercises(s) {
    return ['pushups', s.settings.squatUnit === 'kg' ? 'squatsKg' : 'squats', 'pullups', 'plank', runKey(s)];
  }
  function resolveExo(s, key) {
    if (key === 'run') return runKey(s);
    if (key === 'squats') return s.settings.squatUnit === 'kg' ? 'squatsKg' : 'squats';
    return key;
  }
  function testsFor(s, key) {
    return s.sport.tests.filter(t => t.exo === key).sort((a, b) => a.ts - b.ts);
  }
  const better = (key, a, b) => (GAME.exercises[key].lowerBetter ? a < b : a > b);
  function best(s, key) {
    const t = testsFor(s, key);
    if (!t.length) return null;
    return t.reduce((m, x) => (better(key, x.value, m) ? x.value : m), t[0].value);
  }
  function rank(key, value) {
    const ex = GAME.exercises[key];
    const ranks = ex.ranks;
    let idx = 0;
    for (let i = 0; i < ranks.length; i++) {
      const ok = ex.lowerBetter ? value <= ranks[i][0] : value >= ranks[i][0];
      if (ok) idx = i;
    }
    const next = ranks[idx + 1];
    return { letter: ranks[idx][1], index: idx, next: next ? { letter: next[1], at: next[0] } : null };
  }
  /* Affichage d'une valeur de test */
  function fmtTest(key, v) {
    if (v == null) return '—';
    if (key === 'plank') return U.fmtDuration(v);
    if (key === 'pace5k') return `${U.fmtPace(v)} /km`;
    if (key === 'cooper') return `${U.fmtNum(v)} m`;
    return `${v} ${GAME.exercises[key].unit}`;
  }
  function checkinThisWeek(s) {
    const wk = U.weekKey();
    return s.sport.checkins.find(c => c.week === wk) || null;
  }

  /* ---------- Séances, course, régularité ---------- */
  const workouts = s => [
    ...s.sport.sessions.map(x => ({ ...x, kind: 'session' })),
    ...s.sport.runs.map(x => ({ ...x, kind: 'run' })),
  ].sort((a, b) => b.ts - a.ts);
  function workoutsInWeek(s, d = new Date()) {
    const a = U.weekStart(d).getTime(), b = a + 7 * 86400000;
    return workouts(s).filter(w => w.ts >= a && w.ts < b);
  }
  /* Semaines consécutives où l'objectif est atteint (la semaine en cours compte si déjà atteinte) */
  function weekStreak(s) {
    const goal = s.settings.weeklyGoal;
    const d = new Date();
    let n = 0;
    if (workoutsInWeek(s, d).length >= goal) n++;
    d.setDate(d.getDate() - 7);
    while (workoutsInWeek(s, d).length >= goal) { n++; d.setDate(d.getDate() - 7); }
    return n;
  }
  /* % de semaines réussies sur les N dernières semaines terminées */
  function regularity(s, weeks = 8) {
    const created = s.profile?.createdAt || Date.now();
    let ok = 0, total = 0;
    const d = new Date();
    for (let i = 1; i <= weeks; i++) {
      d.setDate(d.getDate() - 7);
      if (U.weekStart(d).getTime() + 7 * 86400000 < created) break;
      total++;
      if (workoutsInWeek(s, d).length >= s.settings.weeklyGoal) ok++;
    }
    return total ? Math.round((ok / total) * 100) : null;
  }
  function runStats(s) {
    const runs = s.sport.runs;
    const km = runs.reduce((a, r) => a + r.km, 0);
    const longest = runs.reduce((m, r) => (r.km > (m?.km || 0) ? r : m), null);
    const paced = runs.filter(r => r.km >= 3);
    const fastest = paced.reduce((m, r) => (!m || r.sec / r.km < m.sec / m.km ? r : m), null);
    const ws = U.weekStart().getTime();
    const weekKm = runs.filter(r => r.ts >= ws).reduce((a, r) => a + r.km, 0);
    const m0 = new Date(); m0.setDate(1); m0.setHours(0, 0, 0, 0);
    const monthKm = runs.filter(r => r.ts >= m0.getTime()).reduce((a, r) => a + r.km, 0);
    return { km, longest, fastest, weekKm, monthKm, count: runs.length };
  }
  /* ---------- Métier ---------- */
  function quizState(s, sub) {
    if (!s.pro.quiz[sub]) s.pro.quiz[sub] = { tier: 0, attempts: [], lockUntil: 0 };
    return s.pro.quiz[sub];
  }
  function bank(s) {
    return s.profile && QUIZ_BANKS[s.profile.proDomain] ? QUIZ_BANKS[s.profile.proDomain] : null;
  }

  /* ---------- Missions ---------- */
  function allMissions(s) {
    const list = GAME.missions.map(m => ({ ...m }));
    const b = bank(s);
    if (b) {
      for (const sd of b.subdomains) {
        for (const m of sd.missions) {
          list.push({ id: `pro-${sd.id}-${m.tier}`, domain: 'pro', sub: sd.id, subName: sd.name, minTier: m.tier, xp: m.xp, text: m.text });
        }
      }
    }
    return list;
  }
  const GIVERS = { sport: 'kael', intel: 'lyra', discipline: 'mira', pro: 'orin' };
  const missionGiver = m => m.giver || GIVERS[m.domain] || 'voyageur';
  function missionUnlocked(s, m) {
    if (m.minTier) return (s.pro.quiz[m.sub]?.tier || 0) >= m.minTier;
    return domainLevel(s, m.domain).level >= m.minLevel;
  }
  function missionLockLabel(m) {
    return m.minTier ? `Test ${m.subName} niv. ${m.minTier}` : `${GAME.domains[m.domain].name} niv. ${m.minLevel}`;
  }

  /* ---------- Discipline ---------- */
  function questsToday(s) {
    const k = U.dayKey();
    if (!s.quests[k]) s.quests[k] = [];
    return s.quests[k];
  }
  function streak(s) {
    const reset = s.streakResetTs || 0; // défaite contre un boss : seules les tâches faites après comptent
    const doneDay = k => (s.quests[k] || []).some(q => q.done && (q.doneTs || 0) > reset);
    const d = new Date();
    let n = 0;
    if (!doneDay(U.dayKey(d))) d.setDate(d.getDate() - 1); // la série tient tant qu'hier est validé
    while (doneDay(U.dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function bestStreak(s) {
    const days = Object.keys(s.quests).filter(k => s.quests[k].some(q => q.done)).sort();
    let bestN = 0, cur = 0, prev = null;
    for (const k of days) {
      const t = new Date(k + 'T12:00:00');
      cur = prev && Math.round((t - prev) / 86400000) === 1 ? cur + 1 : 1;
      bestN = Math.max(bestN, cur);
      prev = t;
    }
    return bestN;
  }

  /* ---------- Récompenses & déblocages ---------- */
  function unlocksBetween(s, d, from, to) {
    const out = [];
    for (const t of titlesBetween(d, from, to)) out.push({ kind: 'title', text: `Titre « ${t} »` });
    if (d !== 'char') {
      for (const m of GAME.missions) if (m.domain === d && m.minLevel > from && m.minLevel <= to) out.push({ kind: 'mission', text: `Contrat de ${NPCS[missionGiver(m)].name} : ${m.text}`, xp: m.xp });
    } else {
      const newNpc = ARCS.filter(a => a.minChar > from && a.minChar <= to).map(a => NPCS[a.npc].name);
      if (newNpc.length) out.push({ kind: 'feature', text: `De nouveaux PNJ peuvent te croiser : ${[...new Set(newNpc)].join(', ')}` });
    }
    return out;
  }

  function nextUnlock(s, d) {
    const lv = levelOf(s, d);
    const cands = [];
    for (const [l, n] of GAME.titles[d] || []) if (l > lv) cands.push({ level: l, text: `Titre « ${n} »` });
    if (d !== 'char') for (const m of GAME.missions) if (m.domain === d && m.minLevel > lv) cands.push({ level: m.minLevel, text: `Contrat : ${m.text}` });
    cands.sort((a, b) => a.level - b.level);
    return cands[0] || null;
  }

  /* Contenus de la bibliothèque validés (test réussi) depuis une date */
  function doneContents(s, since = 0) {
    return Object.entries(s.intel.done || {}).filter(([, d]) => d.ts >= since).map(([id, d]) => ({ ...(Library.byId(id) || { id, type: 'video', theme: '', minutes: 0 }), doneTs: d.ts, score: d.score }));
  }

  /* ---------- PNJ : progression des étapes ---------- */
  function stepProgress(s, arcState, step, idx) {
    const since = arcState.acceptedTs || 0;
    const after = arr => arr.filter(x => x.ts >= since);
    let cur = 0, target = 1;
    switch (step.type) {
      case 'level': cur = levelOf(s, step.domain); target = step.value; break;
      case 'sessions': cur = after(s.sport.sessions).length; target = step.count; break;
      case 'runs': cur = after(s.sport.runs).length; target = step.count; break;
      case 'runKm': cur = Math.floor(after(s.sport.runs).reduce((a, r) => a + r.km, 0) * 10) / 10; target = step.value; break;
      case 'books': cur = after(s.intel.books).length + doneContents(s, since).filter(c => c.type === 'book').length; target = step.count; break;
      case 'learnMin': cur = after(s.intel.sessions).reduce((a, x) => a + x.minutes, 0) + doneContents(s, since).reduce((a, c) => a + (c.minutes || 0), 0); target = step.value; break;
      case 'contents': cur = doneContents(s, since).length; target = step.count; break;
      case 'themes': cur = new Set(doneContents(s, since).map(c => c.theme)).size; target = step.count; break;
      case 'ratings': cur = Library.myRatings(s).filter(r => r.ts >= since).length; target = step.count; break;
      case 'propose': cur = Library.all().filter(c => c.by && c.by.id === s.id && c.ts >= since).length; target = step.count; break;
      case 'bossWins': cur = (s.bossLog || []).filter(b => b.status === 'won' && b.ts >= since).length; target = step.count; break;
      case 'quizTiers': cur = Object.values(s.pro.quiz).reduce((a, q) => a + q.attempts.filter(t => t.passed && t.ts >= since).length, 0); target = step.count; break;
      case 'missions': cur = Object.entries(s.missions).filter(([id, m]) => m.ts >= since && (!step.domain || id.startsWith(step.domain === 'pro' ? 'pr' : step.domain.slice(0, 2)))).length; target = step.count; break;
      case 'quests': cur = Object.values(s.quests).flat().filter(q => q.done && q.doneTs >= since).length; target = step.count; break;
      case 'checkins': cur = after(s.sport.checkins).length; target = step.count; break;
      case 'bosses': cur = Object.values(s.bosses).filter(b => b.done && b.doneTs >= since).length + (s.bossLog || []).filter(b => b.status === 'won' && b.ts >= since).length; target = step.count; break;
      case 'streak': cur = streak(s); target = step.value; break;
      case 'weekGoals': cur = Object.values(s.sport.goalWeeks).filter(ts => ts >= since).length; target = step.count; break;
      case 'rank': {
        const key = resolveExo(s, step.exo);
        const b = best(s, key);
        const ranks = GAME.exercises[key].ranks.map(r => r[1]);
        cur = b == null ? 0 : rank(key, b).index;
        target = ranks.indexOf(step.letter);
        return { cur, target, done: cur >= target, label: b == null ? 'pas encore testé' : `rang ${ranks[cur]} / ${step.letter}` };
      }
      case 'baseline': {
        const keys = ['pushups', resolveExo(s, 'squats'), 'pullups', 'plank'];
        cur = keys.filter(k => testsFor(s, k).length).length; target = keys.length; break;
      }
      case 'manual': {
        const ok = !!arcState.manual?.[idx];
        return { cur: ok ? 1 : 0, target: 1, done: ok, label: ok ? 'fait' : 'à faire, puis à valider', manual: true };
      }
    }
    cur = Math.min(cur, target);
    return { cur, target, done: cur >= target, label: `${U.fmtNum(cur)} / ${U.fmtNum(target)}` };
  }
  function arcProgress(s, arc) {
    const st = s.npc.arcs[arc.id] || {};
    const steps = arc.steps.map((step, i) => ({ ...step, ...stepProgress(s, st, step, i) }));
    return { steps, done: steps.every(x => x.done), count: steps.filter(x => x.done).length };
  }
  /* Arcs qu'un PNJ peut proposer maintenant */
  function availableArcs(s) {
    const cl = charLevel(s).level;
    const now = Date.now();
    return ARCS.filter(a => {
      const st = s.npc.arcs[a.id];
      if (cl < a.minChar) return false;
      if (a.after && s.npc.arcs[a.after]?.status !== 'done') return false;
      if (!st) return true;
      return st.status === 'declined' && now - st.declinedTs > NPC_RULES.declineCooldownDays * 86400000;
    });
  }
  const activeArcs = s => ARCS.filter(a => s.npc.arcs[a.id]?.status === 'active');

  /* ---------- Carte publique (ce qu'on partage avec ses amis) ---------- */
  function publicCard(s) {
    const lv = {};
    for (const d of GAME.domainOrder) lv[d] = domainLevel(s, d).level;
    const wk = Date.now() - 7 * 86400000;
    const records = {};
    for (const k of activeExercises(s)) { const b = best(s, k); if (b != null) records[k] = b; }
    return {
      app: 'play-your-life-card', v: 1, id: s.id, name: s.profile?.name, updatedAt: Date.now(),
      level: charLevel(s).level, title: title('char', charLevel(s).level), xp: totalXP(s),
      xp7: s.xpLog.filter(e => e.ts >= wk).reduce((a, e) => a + e.amount, 0),
      domains: lv, streak: streak(s), weekStreak: weekStreak(s), runKm: Math.round(runStats(s).km), records,
      npcTitles: s.npc.titles.map(t => t.title),
      avatar: s.profile?.avatar || null,
      since: s.profile?.createdAt || null,
      clan: s.clan ? { id: s.clan.id, name: s.clan.name, tag: s.clan.tag, motto: s.clan.motto, color: s.clan.color, emblem: s.clan.emblem, createdAt: s.clan.createdAt } : null,
    };
  }

  return {
    need, levelInfo, domainXP, totalXP, domainLevel, charLevel, levelOf, snapshot, title,
    activeExercises, resolveExo, testsFor, best, better, rank, fmtTest, checkinThisWeek,
    workouts, workoutsInWeek, weekStreak, regularity, runStats,
    quizState, bank, allMissions, missionUnlocked, missionLockLabel, missionGiver,
    questsToday, streak, bestStreak, unlocksBetween, nextUnlock,
    arcProgress, availableArcs, activeArcs, publicCard, doneContents,
  };
})();
