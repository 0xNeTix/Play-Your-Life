/* Événements automatiques : boss de la semaine et récompenses spontanées.
   Rien n'est saisi par le joueur : tout est calculé à partir de son niveau et de son travail réel. */

/* ---------- Boss : quatre démons intérieurs, un par domaine ---------- */
const BOSSES = {
  sport: { id: 'flemme', name: 'La Flemme', role: 'Démon du canapé',
    taunt: 'Reste donc assis. Le canapé est si doux, et demain existe.', win: 'Impossible… tu t\'es levé. Je reviendrai, plus lourde.', lose: 'Je savais que tu resterais avec moi.',
    look: { face: 'chubby', skin: '#7fae8a', hair: 'bald', eyes: 'sleepy', eyeColor: '#1b1b2f', brows: 'thick', mouth: 'smirk', beard: 'none', headwear: 'horned', outfit: 'hoodie', outfitColor: '#3a3a3a', bg: 'ember', extras: ['sweat'] } },
  pro: { id: 'doute', name: 'Le Doute', role: 'Spectre de l\'imposteur',
    taunt: 'Tu n\'es pas à la hauteur. Les autres savent, toi tu fais semblant.', win: 'Tu as prouvé ce que tu vaux. Je me tais… pour l\'instant.', lose: 'Tu vois ? Tu n\'as même pas essayé.',
    look: { face: 'oval', skin: '#9aa3c9', hair: 'long', hairColor: '#f2f2f2', eyes: 'big', eyeColor: '#1b1b2f', brows: 'worried', mouth: 'neutral', headwear: 'hood', headwearColor: '#16213e', outfit: 'robe', outfitColor: '#16213e', bg: 'starfield', extras: [] } },
  intel: { id: 'oubli', name: 'L\'Oubli', role: 'Dévoreur de savoir',
    taunt: 'Pourquoi apprendre ? Tout ce que tu lis finira dans mon ventre.', win: 'Ce que tu as compris, je ne peux plus te le prendre.', lose: 'Encore une semaine sans rien apprendre. Délicieux.',
    look: { face: 'round', skin: '#b9a4d6', hair: 'afro', hairColor: '#4a2e6b', eyes: 'happy', eyeColor: '#1b1b2f', brows: 'raised', mouth: 'laugh', headwear: 'wizard', headwearColor: '#3b2a63', outfit: 'robe', outfitColor: '#3b2a63', bg: 'aurora', extras: [] } },
  discipline: { id: 'chaos', name: 'Le Chaos', role: 'Seigneur de la procrastination',
    taunt: 'Fais-le plus tard. Plus tard, c\'est mon royaume.', win: 'De l\'ordre… quelle horreur. Tu as gagné cette manche.', lose: 'Plus tard, plus tard… et te voilà à moi.',
    look: { face: 'square', skin: '#c96a5a', hair: 'spiky', hairColor: '#2b2220', eyes: 'determined', eyeColor: '#ffbe69', brows: 'angry', mouth: 'grin', beard: 'goatee', headwear: 'crown', outfit: 'cape', outfitColor: '#450c07', bg: 'royal', extras: ['warpaint'] } },
};

/* ---------- Récompenses : simples, peu coûteuses, accessibles à tous ---------- */
const GIFT_POOL = {
  sport: ['Un long bain chaud ou une douche brûlante, sans regarder l\'heure', 'Ton plat préféré ce soir', 'Une grasse matinée ce week-end', 'Une soirée canapé complète, jambes en l\'air'],
  pro: ['Une heure de jeu vidéo sans culpabilité', 'Un café ou un thé en terrasse, sans téléphone', 'Une soirée entière sans écran de travail', 'Une pâtisserie de la boulangerie'],
  intel: ['Une soirée film ou série', 'Un album écouté en entier, sans rien faire d\'autre', 'Une balade sans but ni podcast', 'Une heure de lecture purement plaisir'],
  discipline: ['Une sieste sans réveil', 'Une soirée où tu ne fais rien de productif', 'Un dessert maison', 'Un verre ou un repas avec un ami'],
  any: ['Un moment avec quelqu\'un que tu aimes', 'Cuisine-toi un vrai bon repas', 'Une heure rien que pour ton passe-temps préféré', 'Un coucher de soleil ou une vue que tu aimes, dix minutes sans rien faire'],
};
const GIFT_RULES = { maxAvailable: 2, maxPerWeek: 2, maxGapDays: 14, minGapDays: 2, baseXp: 200, xpPerLevel: 50 };

const Events = (() => {
  const DAY = 86400000;
  const hash = str => { let h = 2166136261; for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };

  /* ================= Boss ================= */
  /* Moment d'apparition dans la semaine : du lundi au mercredi, stable pour un joueur et une semaine donnés */
  function spawnTime(s, weekStartTs) {
    const h = hash(s.id + ':' + weekStartTs);
    return weekStartTs + (h % 3) * DAY + (8 + (h >> 4) % 10) * 3600000;
  }

  /* Quête calculée d'après le niveau du joueur dans le domaine visé */
  function buildBoss(s, weekStartTs) {
    const levels = GAME.domainOrder.map(d => ({ d, lv: Engine.domainLevel(s, d).level })).sort((a, b) => a.lv - b.lv);
    const week = Math.round(weekStartTs / (7 * DAY));
    const last = (s.bossLog || []).slice(-1)[0];
    // On vise l'un des deux domaines les plus faibles, sans reprendre celui de la semaine précédente
    let pick = levels[week % 2];
    if (last && last.domain === pick.d) pick = levels[(week + 1) % 2];
    const L = pick.lv;
    let kind, target, text;
    if (pick.d === 'sport') {
      if (s.sport.runs.length >= 2 && week % 2) { kind = 'runKm'; target = U.clamp(4 + 2 * L, 5, 40); text = `Cours ${target} km cette semaine`; }
      else { kind = 'workouts'; target = U.clamp(2 + Math.floor(L / 3), 2, 6); text = `Fais ${target} séances de sport cette semaine (courses comprises)`; }
    } else if (pick.d === 'pro') {
      kind = 'proActs'; target = L >= 5 ? 2 : 1; text = target > 1 ? 'Valide 2 paliers de test ou contrats Métier' : 'Valide un palier de test ou un contrat Métier';
    } else if (pick.d === 'intel') {
      kind = 'contents'; target = U.clamp(1 + Math.floor(L / 3), 1, 4); text = target > 1 ? `Valide ${target} contenus de la bibliothèque` : 'Valide un contenu de la bibliothèque (test réussi)';
    } else {
      kind = 'tasks'; target = U.clamp(5 + L, 6, 15); text = `Accomplis ${target} tâches cette semaine`;
    }
    return {
      week: U.weekKey(weekStartTs), type: BOSSES[pick.d].id, domain: pick.d, level: L, kind, target, text,
      xp: 80 + 30 * L, spawnTs: Date.now(), deadline: weekStartTs + 7 * DAY - 1000, status: 'active',
    };
  }

  function bossProgress(s, b = s.boss) {
    if (!b) return 0;
    const since = b.spawnTs;
    switch (b.kind) {
      case 'workouts': return Engine.workouts(s).filter(w => w.ts >= since).length;
      case 'runKm': return Math.floor(s.sport.runs.filter(r => r.ts >= since).reduce((a, r) => a + r.km, 0) * 10) / 10;
      case 'proActs': return Object.values(s.pro.quiz).reduce((a, q) => a + q.attempts.filter(t => t.passed && t.ts >= since).length, 0)
        + Object.entries(s.missions).filter(([id, m]) => id.startsWith('pr') && m.ts >= since).length;
      case 'contents': return Engine.doneContents(s, since).length;
      case 'tasks': return Object.values(s.quests).flat().filter(q => q.done && (q.doneTs || 0) >= since).length;
    }
    return 0;
  }

  /* Fait vivre le boss : apparition, victoire, défaite. Renvoie les événements à annoncer. */
  function tickBoss(s) {
    const out = [];
    const now = Date.now();
    if (!s.profile) return out;
    if (!Array.isArray(s.bossLog)) s.bossLog = [];
    const b = s.boss;
    if (b && b.status === 'active') {
      if (bossProgress(s, b) >= b.target) {
        b.status = 'won'; b.endTs = now;
        s.bossLog.push({ week: b.week, type: b.type, domain: b.domain, status: 'won', ts: now });
        out.push({ kind: 'won', boss: b });
      } else if (now > b.deadline) {
        b.status = 'lost'; b.endTs = now;
        s.streakResetTs = now;
        s.bossLog.push({ week: b.week, type: b.type, domain: b.domain, status: 'lost', ts: now });
        out.push({ kind: 'lost', boss: b });
      }
    }
    const ws = U.weekStart().getTime();
    const wk = U.weekKey();
    if (!s.boss || s.boss.week !== wk) {
      const spawn = spawnTime(s, ws);
      const deadline = ws + 7 * DAY - 1000;
      // Pas de boss si le joueur n'a pas au moins 3 jours devant lui (compte tout neuf, fin de semaine)
      if (now >= spawn && deadline - Math.max(now, s.profile.createdAt || 0) >= 3 * DAY && now - (s.profile.createdAt || 0) >= DAY) {
        s.boss = buildBoss(s, ws);
        out.push({ kind: 'spawn', boss: s.boss });
      }
    }
    return out;
  }
  const bossDef = b => BOSSES[b.domain];

  /* ================= Récompenses ================= */
  const giftThreshold = s => GIFT_RULES.baseXp + GIFT_RULES.xpPerLevel * Engine.charLevel(s).level;
  function giftState(s) {
    const g = s.gifts;
    const last = g.lastTs || s.profile?.createdAt || Date.now();
    const since = s.xpLog.filter(e => e.ts > last);
    const xp = since.reduce((a, e) => a + e.amount, 0);
    const ws = U.weekStart().getTime();
    return {
      xp, threshold: giftThreshold(s), since, last,
      available: g.list.filter(x => !x.claimedTs),
      thisWeek: g.list.filter(x => x.ts >= ws).length,
      days: (Date.now() - last) / DAY,
    };
  }
  /* Offre une récompense si le travail accompli le justifie. Renvoie la récompense ou null. */
  function tickGift(s) {
    if (!s.profile) return null;
    const st = giftState(s);
    if (st.available.length >= GIFT_RULES.maxAvailable || st.thisWeek >= GIFT_RULES.maxPerWeek) return null;
    const first = !s.gifts.lastTs;
    const earned = st.xp >= st.threshold && (first || st.days >= GIFT_RULES.minGapDays);
    // Au moins une toutes les deux semaines, à condition d'avoir un minimum travaillé
    const overdue = st.days >= GIFT_RULES.maxGapDays && st.xp >= st.threshold * .25;
    if (!earned && !overdue) return null;
    const per = {};
    for (const e of st.since) per[e.domain] = (per[e.domain] || 0) + e.amount;
    const domain = Object.keys(per).sort((a, b) => per[b] - per[a])[0] || 'any';
    const recent = new Set(s.gifts.list.slice(-6).map(x => x.text));
    const pool = [...(GIFT_POOL[domain] || []), ...GIFT_POOL.any].filter(t => !recent.has(t));
    const text = pool[Math.floor(Math.random() * pool.length)] || GIFT_POOL.any[0];
    const gift = { id: U.uid(), ts: Date.now(), text, domain, xp: st.xp };
    s.gifts.list.push(gift);
    s.gifts.lastTs = gift.ts;
    return gift;
  }

  return { tickBoss, bossProgress, bossDef, tickGift, giftState, giftThreshold };
})();
