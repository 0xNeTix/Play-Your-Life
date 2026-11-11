/* Bibliothèque de l'Esprit : contenus de départ + contributions des joueurs, notes et classements.
   Les contributions et les notes sont des données PARTAGÉES (Store.loadShared / saveShared) :
   aujourd'hui entre les profils de l'appareil, demain entre tous les joueurs via un serveur. */
const Library = (() => {
  let data = { items: [], ratings: {} }; // ratings : { contentId: { profileId: { stars, ts } } }
  const HTTP = /^https?:\/\/[^\s<>"']+$/i;

  async function load() {
    const d = await Store.loadShared('library');
    data = { items: Array.isArray(d?.items) ? d.items.map(sanitize).filter(Boolean) : [], ratings: d?.ratings && typeof d.ratings === 'object' ? d.ratings : {} };
  }
  const save = () => Store.saveShared('library', data);

  const all = () => [...LIBRARY_SEED, ...data.items];
  const byId = id => all().find(c => c.id === id) || null;
  const theme = id => THEMES.find(t => t.id === id) || { id, name: 'Autre', color: '#9aa3ad' };

  /* Lien d'accès : celui fourni par le contributeur, sinon une recherche sur le titre exact */
  function url(c) {
    if (c.url && HTTP.test(c.url)) return c.url;
    const q = encodeURIComponent(`${c.title} ${c.author || ''}`.trim());
    return c.type === 'book' ? `https://www.google.com/search?q=${q}+livre` : `https://www.youtube.com/results?search_query=${q}`;
  }
  const xp = c => (c.type === 'book' ? 150 : U.clamp(Math.round((c.minutes || 10) * 1.5), 20, 90));
  const passScore = c => Math.ceil(c.quiz.length * 2 / 3);

  /* ---------- Notes ---------- */
  function rating(id, since = 0) {
    const r = Object.values(data.ratings[id] || {}).filter(x => x.ts >= since);
    return { n: r.length, avg: r.length ? r.reduce((a, x) => a + x.stars, 0) / r.length : 0 };
  }
  const myRating = (s, id) => data.ratings[id]?.[s.id]?.stars || 0;
  const myRatings = s => Object.entries(data.ratings).filter(([, r]) => r[s.id]).map(([id, r]) => ({ id, ...r[s.id] }));
  function rate(s, id, stars) {
    if (!data.ratings[id]) data.ratings[id] = {};
    data.ratings[id][s.id] = { stars: U.clamp(Math.round(stars), 1, 5), ts: Date.now() };
    save();
  }
  /* Meilleurs contenus sur une période (jours ; 0 = depuis toujours) */
  function top(days = 0, limit = 10) {
    const since = days ? Date.now() - days * 86400000 : 0;
    return all().map(c => ({ c, r: rating(c.id, since) })).filter(x => x.r.n > 0)
      .sort((a, b) => b.r.avg - a.r.avg || b.r.n - a.r.n).slice(0, limit);
  }

  /* ---------- Contributions ---------- */
  const txt = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  function sanitize(c) {
    if (!c || typeof c !== 'object') return null;
    const quiz = (Array.isArray(c.quiz) ? c.quiz : []).map(q => ({ q: txt(q?.q, 200), a: (Array.isArray(q?.a) ? q.a : []).slice(0, 3).map(x => txt(x, 140)) }))
      .filter(q => q.q && q.a.length === 3 && q.a.every(Boolean)).slice(0, 5);
    const out = {
      id: txt(c.id, 40) || 'u-' + U.uid(), theme: THEMES.some(t => t.id === c.theme) ? c.theme : null, type: CONTENT_TYPES[c.type] ? c.type : 'video',
      title: txt(c.title, 120), author: txt(c.author, 80), minutes: U.clamp(Math.round(Number(c.minutes)) || 10, 1, 3000),
      url: HTTP.test(String(c.url || '').trim()) ? String(c.url).trim().slice(0, 300) : '', summary: txt(c.summary, 700), quiz,
      by: c.by && c.by.id ? { id: txt(c.by.id, 40), name: txt(c.by.name, 30) } : null, ts: Number(c.ts) || Date.now(),
    };
    if (!out.theme || !out.title || out.summary.length < 40 || quiz.length < 2) return null;
    if (LIBRARY_SEED.some(x => x.id === out.id)) return null;
    return out;
  }
  function add(c) {
    const item = sanitize(c);
    if (!item) return null;
    data.items = data.items.filter(x => x.id !== item.id);
    data.items.push(item);
    save();
    return item;
  }
  function remove(id) {
    data.items = data.items.filter(x => x.id !== id);
    delete data.ratings[id];
    save();
  }
  const contributions = () => data.items.slice();

  return { load, all, byId, theme, url, xp, passScore, rating, myRating, myRatings, rate, top, add, remove, contributions, sanitize };
})();
