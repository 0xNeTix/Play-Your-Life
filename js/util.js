/* Petits utilitaires partagés */
const U = {
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },
  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
  clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },
  /* Jour local au format AAAA-MM-JJ */
  dayKey(d = new Date()) {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  },
  /* Semaine ISO, ex. 2026-W45 */
  weekKey(d = new Date()) {
    const x = new Date(d);
    const t = new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const y = t.getUTCFullYear();
    const w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7);
    return `${y}-W${String(w).padStart(2, '0')}`;
  },
  /* Lundi 00:00 de la semaine contenant d */
  weekStart(d = new Date()) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
  },
  fmtDate(ts, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
    return new Date(ts).toLocaleDateString('fr-FR', opts);
  },
  fmtShort(ts) {
    return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  },
  fmtNum(n) { return Number(n).toLocaleString('fr-FR'); },
  fmtDuration(sec) {
    sec = Math.round(sec);
    if (sec < 60) return `${sec} s`;
    const m = Math.floor(sec / 60), s = sec % 60;
    return s ? `${m} min ${String(s).padStart(2, '0')}` : `${m} min`;
  },
  /* Rythme en secondes/km -> "5:12" */
  fmtPace(sec) {
    if (!isFinite(sec)) return '—';
    sec = Math.round(sec);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  },
  /* Durée en secondes -> "1:02:15" ou "42:10" */
  fmtClock(sec) {
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  },
  /* "42", "42:10" ou "1:02:15" -> secondes (un nombre seul = minutes) */
  parseClock(str) {
    const p = String(str || '').trim().split(':').map(Number);
    if (!p.length || p.some(n => !isFinite(n) || n < 0)) return NaN;
    if (p.length === 1) return p[0] * 60;
    if (p.length === 2) return p[0] * 60 + p[1];
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    return NaN;
  },
  fmtKm(km) { return `${Number(km).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} km`; },
  fmtRemaining(ms) {
    const h = Math.floor(ms / 3600000), m = Math.ceil((ms % 3600000) / 60000);
    return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
  },
  /* Recadre une image (File) au carré, centrée, en JPEG dataURL */
  squareImage(file, side = 360, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onerror = () => reject(new Error('Image illisible'));
      img.onload = () => {
        const m = Math.min(img.width, img.height);
        const c = document.createElement('canvas');
        c.width = c.height = side;
        c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, side, side);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.src = url;
    });
  },
  /* Compresse une image (File) en JPEG dataURL */
  compressImage(file, maxSide = 900, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Image illisible'));
        img.onload = () => {
          const r = Math.min(1, maxSide / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * r);
          c.height = Math.round(img.height * r);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  },
};
