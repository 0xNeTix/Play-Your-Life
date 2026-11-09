/* Sons synthétisés (aucun fichier audio). Désactivables dans les réglages. */
const Sfx = (() => {
  let ctx = null;
  const on = () => typeof App !== 'undefined' && App.state?.settings?.sound !== false;
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, { type = 'triangle', gain = .12 } = {}) {
    const c = ac();
    if (!c) return;
    const t = c.currentTime + start;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + .05);
  }
  return {
    levelUp() {
      if (!on()) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, .12 + i * .11, .5));
      tone(1046.5, .6, 1.4, { type: 'sine', gain: .08 });
      tone(1567.98, .62, 1.2, { type: 'sine', gain: .05 });
    },
    loot(r) {
      if (!on()) return;
      const seq = { c: [659, 784], r: [659, 880, 1047], e: [587, 784, 988, 1175], l: [523, 659, 784, 1047, 1319] }[r] || [659, 784];
      seq.forEach((f, i) => tone(f, i * .09, .45, { type: 'sine', gain: .09 }));
    },
  };
})();
