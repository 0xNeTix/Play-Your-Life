/* Lecture des fichiers d'activité GPX et TCX (export Strava, Garmin, Coros…), entièrement dans le navigateur.
   RunFile.parse(texte, nomDeFichier) -> { km, sec, elapsed, start, elev, sport, points } */
const RunFile = (() => {
  const R = 6371000;
  const rad = d => (d * Math.PI) / 180;
  function dist(a, b) {
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const tag = (el, name) => el.getElementsByTagName(name)[0]?.textContent?.trim();

  function gain(eles) {
    const v = eles.filter(x => isFinite(x));
    if (v.length < 2) return 0;
    const sm = v.map((_, i) => { const w = v.slice(Math.max(0, i - 2), i + 3); return w.reduce((a, b) => a + b, 0) / w.length; });
    let g = 0;
    for (let i = 1; i < sm.length; i++) { const d = sm[i] - sm[i - 1]; if (d > 0) g += d; }
    return Math.round(g);
  }

  /* Temps en mouvement : on ignore les arrêts (vitesse < 0,6 m/s) et les trous d'enregistrement */
  function fromPoints(pts) {
    let m = 0, moving = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = dist(pts[i - 1], pts[i]);
      m += d;
      if (pts[i].t && pts[i - 1].t) {
        const dt = (pts[i].t - pts[i - 1].t) / 1000;
        if (dt > 0 && dt <= 60 && d / dt >= .6 && d / dt <= 12) moving += dt;
      }
    }
    const timed = pts.filter(p => p.t);
    const elapsed = timed.length > 1 ? (timed[timed.length - 1].t - timed[0].t) / 1000 : 0;
    return { m, moving, elapsed, start: timed[0]?.t || null };
  }

  function parseGPX(doc) {
    const pts = [...doc.getElementsByTagName('trkpt')].map(p => ({
      lat: parseFloat(p.getAttribute('lat')), lon: parseFloat(p.getAttribute('lon')),
      t: Date.parse(tag(p, 'time') || '') || null, ele: parseFloat(tag(p, 'ele')),
    })).filter(p => isFinite(p.lat) && isFinite(p.lon));
    if (pts.length < 2) throw new Error('aucun tracé trouvé dans le fichier');
    const r = fromPoints(pts);
    const type = (tag(doc, 'type') || '').toLowerCase();
    return { km: r.m / 1000, sec: r.moving || r.elapsed, elapsed: r.elapsed, start: r.start, elev: gain(pts.map(p => p.ele)), sport: type, points: pts.length, name: tag(doc, 'name') || '' };
  }

  function parseTCX(doc) {
    const act = doc.getElementsByTagName('Activity')[0];
    const sport = (act?.getAttribute('Sport') || '').toLowerCase();
    const laps = [...doc.getElementsByTagName('Lap')];
    const tps = [...doc.getElementsByTagName('Trackpoint')];
    const pts = tps.map(p => ({
      lat: parseFloat(tag(p, 'LatitudeDegrees')), lon: parseFloat(tag(p, 'LongitudeDegrees')),
      t: Date.parse(tag(p, 'Time') || '') || null, ele: parseFloat(tag(p, 'AltitudeMeters')),
    }));
    let m = laps.reduce((a, l) => a + (parseFloat(tag(l, 'DistanceMeters')) || 0), 0);
    let sec = laps.reduce((a, l) => a + (parseFloat(tag(l, 'TotalTimeSeconds')) || 0), 0);
    const start = Date.parse(laps[0]?.getAttribute('StartTime') || '') || pts.find(p => p.t)?.t || null;
    const geo = pts.filter(p => isFinite(p.lat) && isFinite(p.lon));
    if (!m && geo.length > 1) m = fromPoints(geo).m;
    if (!sec && geo.length > 1) { const r = fromPoints(geo); sec = r.moving || r.elapsed; }
    if (!m || !sec) throw new Error('distance ou durée introuvable dans le fichier');
    return { km: m / 1000, sec, elapsed: sec, start, elev: gain(pts.map(p => p.ele)), sport, points: tps.length, name: '' };
  }

  function parse(text, filename = '') {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('fichier illisible');
    const root = doc.documentElement.nodeName.toLowerCase();
    const r = root.includes('trainingcenterdatabase') || /\.tcx$/i.test(filename) ? parseTCX(doc) : parseGPX(doc);
    r.km = Math.round(r.km * 100) / 100;
    r.sec = Math.round(r.sec);
    r.notRun = /bik|cycl|ride|swim|velo|vélo|^1$|^2$/.test(r.sport);
    return r;
  }

  /* Lien Strava d'activité (version web ou lien de partage de l'appli) */
  function stravaLink(url) {
    const u = String(url || '').trim();
    const m = u.match(/^https:\/\/(?:www\.)?strava\.com\/activities\/(\d{5,})/i);
    if (m) return `https://www.strava.com/activities/${m[1]}`;
    if (/^https:\/\/strava\.app\.link\/[A-Za-z0-9]+$/.test(u)) return u;
    return null;
  }

  return { parse, stravaLink };
})();
