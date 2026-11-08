/* Graphiques SVG légers, sans dépendance. Couleurs via variables CSS. */
const Charts = (() => {
  const NS = 'http://www.w3.org/2000/svg';

  /* Max d'axe arrondi pour que les 4 graduations tombent sur des valeurs rondes */
  function niceMax(v) {
    if (v <= 0) return 4;
    const raw = v / 4;
    const p = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / p;
    const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
    return Math.max(4, step * 4);
  }

  function frame(el, height) {
    el.innerHTML = '';
    el.classList.add('chart');
    const w = Math.max(260, el.clientWidth || 600);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${height}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', height);
    svg.setAttribute('role', 'img');
    el.appendChild(svg);
    const tip = document.createElement('div');
    tip.className = 'chart-tip';
    el.appendChild(tip);
    return { svg, w, h: height, tip };
  }

  function add(parent, tag, attrs = {}, text) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    parent.appendChild(n);
    return n;
  }

  function showTip(el, tip, html, x, y) {
    tip.innerHTML = html;
    tip.style.display = 'block';
    const box = el.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = x + 12, top = y - th - 10;
    if (left + tw > box.width) left = x - tw - 12;
    if (top < 0) top = y + 14;
    tip.style.left = Math.max(0, left) + 'px';
    tip.style.top = top + 'px';
  }
  const hideTip = tip => { tip.style.display = 'none'; };

  function empty(el, msg) {
    el.innerHTML = `<div class="chart-empty">${U.esc(msg)}</div>`;
  }

  /* Courbe d'une seule série : pts = [{ x: timestamp, y }] */
  function line(el, pts, { color = 'var(--c-pro)', fmt = v => v, emptyMsg = 'Pas encore de données', height = 200, label = '' } = {}) {
    if (!pts.length) return empty(el, emptyMsg);
    const { svg, w, h, tip } = frame(el, height);
    svg.setAttribute('aria-label', label);
    const m = { l: 44, r: 16, t: 14, b: 28 };
    const iw = w - m.l - m.r, ih = h - m.t - m.b;
    const xs = pts.map(p => p.x);
    let x0 = Math.min(...xs), x1 = Math.max(...xs);
    if (x0 === x1) { x0 -= 3 * 86400000; x1 += 3 * 86400000; }
    const yMax = niceMax(Math.max(...pts.map(p => p.y)) * 1.1);
    const X = x => m.l + ((x - x0) / (x1 - x0)) * iw;
    const Y = y => m.t + ih - (y / yMax) * ih;

    for (let i = 0; i <= 4; i++) {
      const v = (yMax / 4) * i, y = Y(v);
      add(svg, 'line', { x1: m.l, x2: w - m.r, y1: y, y2: y, class: i === 0 ? 'axis' : 'grid' });
      add(svg, 'text', { x: m.l - 8, y: y + 4, 'text-anchor': 'end', class: 'tick' }, fmt(Math.round(v * 10) / 10));
    }
    const nT = Math.min(5, pts.length);
    for (let i = 0; i < nT; i++) {
      const t = nT === 1 ? pts[0].x : x0 + ((x1 - x0) / (nT - 1)) * i;
      add(svg, 'text', { x: X(t), y: h - 8, 'text-anchor': i === 0 ? 'start' : i === nT - 1 ? 'end' : 'middle', class: 'tick' }, U.fmtShort(t));
    }

    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
    add(svg, 'path', { d, class: 'series-line', style: `stroke:${color}` });
    const showDots = pts.length <= 40;
    if (showDots) for (const p of pts) add(svg, 'circle', { cx: X(p.x), cy: Y(p.y), r: 4, class: 'series-dot', style: `fill:${color}` });

    // Dernière valeur annotée
    const last = pts[pts.length - 1];
    add(svg, 'text', { x: Math.min(X(last.x), w - m.r), y: Y(last.y) - 10, 'text-anchor': 'end', class: 'value-label' }, fmt(last.y));

    // Survol : réticule + infobulle
    const cross = add(svg, 'line', { y1: m.t, y2: m.t + ih, class: 'crosshair', visibility: 'hidden' });
    const hot = add(svg, 'circle', { r: 6, class: 'series-dot hot', style: `fill:${color}`, visibility: 'hidden' });
    const hit = add(svg, 'rect', { x: m.l, y: 0, width: iw, height: h, fill: 'transparent' });
    hit.addEventListener('pointermove', ev => {
      const r = svg.getBoundingClientRect();
      const px = ((ev.clientX - r.left) / r.width) * w;
      let best = pts[0];
      for (const p of pts) if (Math.abs(X(p.x) - px) < Math.abs(X(best.x) - px)) best = p;
      const cx = X(best.x), cy = Y(best.y);
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.setAttribute('visibility', 'visible');
      hot.setAttribute('cx', cx); hot.setAttribute('cy', cy); hot.setAttribute('visibility', 'visible');
      const sc = r.width / w;
      showTip(el, tip, `<strong>${U.esc(fmt(best.y))}</strong><span>${U.fmtDate(best.x)}${best.note ? ' · ' + U.esc(best.note) : ''}</span>`, cx * sc, cy * sc);
    });
    hit.addEventListener('pointerleave', () => {
      cross.setAttribute('visibility', 'hidden'); hot.setAttribute('visibility', 'hidden'); hideTip(tip);
    });
  }

  /* Colonnes : items = [{ label, value, tip }] */
  function columns(el, items, { color = 'var(--c-pro)', height = 200, fmt = v => v, label = '', goal = null, emptyMsg = 'Aucune XP sur la période' } = {}) {
    if (!items.some(i => i.value > 0)) return empty(el, emptyMsg);
    const { svg, w, h, tip } = frame(el, height);
    svg.setAttribute('aria-label', label);
    const m = { l: 44, r: 8, t: 14, b: 28 };
    const iw = w - m.l - m.r, ih = h - m.t - m.b;
    const yMax = niceMax(Math.max(goal || 0, ...items.map(i => i.value)) * 1.1);
    const Y = v => m.t + ih - (v / yMax) * ih;
    for (let i = 0; i <= 4; i++) {
      const v = (yMax / 4) * i, y = Y(v);
      add(svg, 'line', { x1: m.l, x2: w - m.r, y1: y, y2: y, class: i === 0 ? 'axis' : 'grid' });
      add(svg, 'text', { x: m.l - 8, y: y + 4, 'text-anchor': 'end', class: 'tick' }, fmt(v));
    }
    if (goal) {
      const gy = Y(goal);
      add(svg, 'line', { x1: m.l, x2: w - m.r, y1: gy, y2: gy, class: 'goal-line' });
      add(svg, 'text', { x: m.l + 4, y: gy - 5, 'text-anchor': 'start', class: 'tick goal-label' }, `Objectif ${goal}`);
    }
    const slot = iw / items.length, bw = Math.min(36, slot - 2);
    items.forEach((it, i) => {
      const x = m.l + slot * i + (slot - bw) / 2;
      if (it.value > 0) {
        const y = Y(it.value), base = Y(0), r = Math.min(4, (base - y) / 2, bw / 2);
        const dPath = `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${base} Z`;
        add(svg, 'path', { d: dPath, style: `fill:${color}`, class: 'bar' });
      }
      if (items.length <= 8 || i % 2 === 0 || i === items.length - 1) {
        add(svg, 'text', { x: x + bw / 2, y: h - 8, 'text-anchor': 'middle', class: 'tick' }, it.label);
      }
      const hit = add(svg, 'rect', { x: m.l + slot * i, y: m.t, width: slot, height: ih, fill: 'transparent' });
      hit.addEventListener('pointermove', () => {
        const sc = svg.getBoundingClientRect().width / w;
        showTip(el, tip, it.tip || `<strong>${U.esc(fmt(it.value))}</strong><span>${U.esc(it.label)}</span>`, (x + bw / 2) * sc, Y(it.value) * sc);
      });
      hit.addEventListener('pointerleave', () => hideTip(tip));
    });
  }

  /* Calendrier d'activité : counts = { 'AAAA-MM-JJ': n } */
  function heatmap(el, counts, weeks = 18) {
    const cell = 13, gap = 3, top = 16, left = 26;
    const { svg, w, tip } = frame(el, top + 7 * (cell + gap) + 4);
    svg.setAttribute('aria-label', 'Calendrier d\'activité');
    const start = U.weekStart(new Date());
    start.setDate(start.getDate() - (weeks - 1) * 7);
    const cols = Math.min(weeks, Math.floor((w - left) / (cell + gap)));
    const offset = weeks - cols;
    const lvl = n => (n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);
    ['L', '', 'M', '', 'V', '', 'D'].forEach((t, i) => t && add(svg, 'text', { x: 0, y: top + i * (cell + gap) + 10, class: 'tick' }, t));
    const today = U.dayKey();
    let lastMonth = -1;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < 7; r++) {
        const d = new Date(start);
        d.setDate(d.getDate() + (c + offset) * 7 + r);
        const k = U.dayKey(d);
        if (k > today) continue;
        if (r === 0 && d.getMonth() !== lastMonth) {
          lastMonth = d.getMonth();
          add(svg, 'text', { x: left + c * (cell + gap), y: 10, class: 'tick' }, d.toLocaleDateString('fr-FR', { month: 'short' }));
        }
        const n = counts[k] || 0;
        const x = left + c * (cell + gap), y = top + r * (cell + gap);
        const rect = add(svg, 'rect', { x, y, width: cell, height: cell, rx: 3, class: `heat heat-${lvl(n)}` });
        rect.addEventListener('pointermove', () => {
          const sc = svg.getBoundingClientRect().width / w;
          showTip(el, tip, `<strong>${n} action${n > 1 ? 's' : ''}</strong><span>${U.fmtDate(d)}</span>`, (x + cell / 2) * sc, y * sc);
        });
        rect.addEventListener('pointerleave', () => hideTip(tip));
      }
    }
  }

  return { line, columns, heatmap };
})();
