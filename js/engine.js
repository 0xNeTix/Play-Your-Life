/* Règles du jeu : XP, niveaux, titres, rangs, déblocages. Fonctions pures sur l'état. */
const Engine = (() => {
  const need = (n, base) => Math.round(base * Math.pow(n, 1.3));

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

  /* ---------- Sport ---------- */
  function exoKey(s, exo) {
    return exo === 'squats' && s.settings.squatUnit === 'kg' ? 'squatsKg' : exo;
  }
  function activeExercises(s) {
    return ['pushups', s.settings.squatUnit === 'kg' ? 'squatsKg' : 'squats', 'plank'];
  }
  function testsFor(s, key) {
    return s.sport.tests.filter(t => t.exo === key).sort((a, b) => a.ts - b.ts);
  }
  function best(s, key) {
    const t = testsFor(s, key);
    return t.length ? Math.max(...t.map(x => x.value)) : null;
  }
  function rank(key, value) {
    const ranks = GAME.exercises[key].ranks;
    let cur = ranks[0], next = null;
    for (let i = 0; i < ranks.length; i++) {
      if (value >= ranks[i][0]) { cur = ranks[i]; next = ranks[i + 1] || null; }
    }
    return { letter: cur[1], next: next ? { letter: next[1], at: next[0] } : null };
  }
  function checkinThisWeek(s) {
    const wk = U.weekKey();
    return s.sport.checkins.find(c => c.week === wk) || null;
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
    const doneDay = k => (s.quests[k] || []).some(q => q.done);
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
  function rewardUnlocked(s, r) { return levelOf(s, r.domain) >= r.level; }

  /* Ce qui se débloque en passant de `from` à `to` dans le domaine d */
  function unlocksBetween(s, d, from, to) {
    const out = [];
    for (const t of titlesBetween(d, from, to)) out.push({ kind: 'title', text: `Titre « ${t} »` });
    if (d !== 'char') {
      for (const m of GAME.missions) if (m.domain === d && m.minLevel > from && m.minLevel <= to) out.push({ kind: 'mission', text: m.text, xp: m.xp });
    } else if (from < GAME.bossUnlockCharLevel && to >= GAME.bossUnlockCharLevel) {
      out.push({ kind: 'feature', text: 'Boss de la semaine : un défi réel majeur chaque semaine' });
    }
    for (const r of s.rewards) if (r.domain === d && r.level > from && r.level <= to) out.push({ kind: 'reward', text: r.text });
    return out;
  }

  /* Prochain déblocage d'un domaine (titre, mission ou récompense IRL) */
  function nextUnlock(s, d) {
    const lv = levelOf(s, d);
    const cands = [];
    for (const [l, n] of GAME.titles[d] || []) if (l > lv) cands.push({ level: l, text: `Titre « ${n} »` });
    if (d !== 'char') for (const m of GAME.missions) if (m.domain === d && m.minLevel > lv) cands.push({ level: m.minLevel, text: `Mission : ${m.text}` });
    for (const r of s.rewards) if (r.domain === d && r.level > lv) cands.push({ level: r.level, text: `🎁 ${r.text}`, irl: true });
    cands.sort((a, b) => a.level - b.level || (b.irl ? 1 : 0) - (a.irl ? 1 : 0));
    return cands[0] || null;
  }

  return {
    need, levelInfo, domainXP, totalXP, domainLevel, charLevel, levelOf, snapshot, title,
    exoKey, activeExercises, testsFor, best, rank, checkinThisWeek,
    quizState, bank, allMissions, missionUnlocked, missionLockLabel,
    questsToday, streak, bestStreak, rewardUnlocked, unlocksBetween, nextUnlock,
  };
})();
