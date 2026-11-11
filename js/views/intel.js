/* Esprit : livres terminés (avec enseignements), sessions d'apprentissage */
Views.intel = {
  render() {
    const s = App.state;
    const info = Engine.domainLevel(s, 'intel');
    const books = s.intel.books.slice().sort((a, b) => b.ts - a.ts);
    const sessions = s.intel.sessions.slice().sort((a, b) => b.ts - a.ts);
    const weekStart = U.weekStart().getTime();
    const minutesWeek = sessions.filter(x => x.ts >= weekStart).reduce((a, x) => a + x.minutes, 0);

    return `
      <header class="page-head">
        <p class="eyebrow">Esprit · Niv. ${info.level} · ${U.esc(Engine.title('intel', info.level))}</p>
        <h1>Ce que tu apprends te change.</h1>
        ${UI.xpBar(info, 'intel')}
        <p class="muted small">${U.fmtNum(info.into)} / ${U.fmtNum(info.need)} XP avant le niveau ${info.level + 1}</p>
      </header>

      <section class="grid3 kpis">
        <div class="card kpi"><div class="kpi-v">${books.length}</div><div class="muted small">livre${books.length > 1 ? 's' : ''} terminé${books.length > 1 ? 's' : ''}</div></div>
        <div class="card kpi"><div class="kpi-v">${minutesWeek}</div><div class="muted small">minutes d'apprentissage cette semaine</div></div>
        <div class="card kpi"><div class="kpi-v">${sessions.length}</div><div class="muted small">sessions au total</div></div>
      </section>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Session d'apprentissage</h2></div>
          <form data-form="session" class="stack-form">
            <label>Type<select name="kind">${Object.entries(GAME.sessionTypes).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
            <label>Sujet<input name="topic" required maxlength="100" placeholder="Ex. Chapitre 4 de Clean Code"></label>
            <label>Durée réelle (minutes)<input name="minutes" type="number" min="5" max="300" required></label>
            <button class="btn primary">Enregistrer (+1 XP / min, max ${GAME.xp.sessionMax})</button>
          </form>
        </div>
        <div class="card">
          <div class="card-head"><h2>J'ai terminé un livre</h2></div>
          <form data-form="book" class="stack-form">
            <div class="row"><label>Titre<input name="title" required maxlength="120"></label><label>Auteur<input name="author" maxlength="80"></label></div>
            <p class="muted small">Un livre ne compte que si tu peux en tirer 3 enseignements avec tes propres mots.</p>
            ${[1, 2, 3].map(i => `<label>Enseignement ${i}<input name="t${i}" required minlength="15" maxlength="240"></label>`).join('')}
            <button class="btn primary">Valider le livre (+${GAME.xp.book} XP)</button>
          </form>
        </div>
      </section>

      <section class="cols">
        <div class="card">
          <div class="card-head"><h2>Bibliothèque</h2></div>
          ${books.length ? `<ul class="books">${books.map(b => `<li><details><summary><strong>${U.esc(b.title)}</strong>${b.author ? ` <span class="muted">— ${U.esc(b.author)}</span>` : ''} <small class="muted">${U.fmtShort(b.ts)}</small></summary><ol>${b.takeaways.map(t => `<li>${U.esc(t)}</li>`).join('')}</ol></details></li>`).join('')}</ul>`
            : '<p class="empty-hint">Ta bibliothèque est vide. 10 pages par jour, c\'est environ 15 livres par an.</p>'}
        </div>
        <div class="card">
          <div class="card-head"><h2>Sessions récentes</h2></div>
          ${sessions.length ? `<ul class="log">${sessions.slice(0, 12).map(x => `<li><span>${U.esc(GAME.sessionTypes[x.kind])}</span><strong>${U.esc(x.topic)}</strong><small>${U.fmtDate(x.ts)} · ${x.minutes} min</small></li>`).join('')}</ul>` : '<p class="empty-hint">Aucune session.</p>'}
        </div>
      </section>
`;
  },
};

App.forms.session = (fd, form) => {
  const minutes = Math.round(Number(fd.get('minutes')));
  const topic = String(fd.get('topic') || '').trim();
  if (!(minutes >= 5 && minutes <= 300) || !topic) return;
  const id = U.uid();
  App.state.intel.sessions.push({ id, ts: Date.now(), kind: fd.get('kind'), topic, minutes });
  App.grant('intel', Math.min(GAME.xp.sessionMax, minutes * GAME.xp.sessionPerMin), `${GAME.sessionTypes[fd.get('kind')]} : ${topic} (${minutes} min)`, id);
  App.commit();
};

App.forms.book = (fd) => {
  const title = String(fd.get('title') || '').trim();
  const takeaways = [1, 2, 3].map(i => String(fd.get('t' + i) || '').trim());
  if (!title || takeaways.some(t => t.length < 15)) return;
  const id = U.uid();
  App.state.intel.books.push({ id, ts: Date.now(), title, author: String(fd.get('author') || '').trim(), takeaways });
  App.grant('intel', GAME.xp.book, `Livre terminé : ${title}`, id);
  App.commit();
};
