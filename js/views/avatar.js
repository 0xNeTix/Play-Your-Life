/* Éditeur d'avatar. Les objets ont une rareté et se débloquent par niveaux, quêtes de PNJ, XP ou régularité. */
const AV_CATS = [
  { id: 'face', label: 'Visage', parts: ['face'], color: ['skin', 'Teint'] },
  { id: 'hair', label: 'Cheveux', parts: ['hair'], color: ['hairColor', 'Couleur'] },
  { id: 'eyes', label: 'Yeux', parts: ['eyes', 'brows'], color: ['eyeColor', 'Couleur des yeux'] },
  { id: 'mouth', label: 'Bouche', parts: ['mouth'] },
  { id: 'beard', label: 'Pilosité', parts: ['beard'], color: ['hairColor', 'Couleur'] },
  { id: 'glasses', label: 'Lunettes', parts: ['glasses'] },
  { id: 'headwear', label: 'Couvre-chef', parts: ['headwear'], color: ['headwearColor', 'Couleur'] },
  { id: 'outfit', label: 'Tenue', parts: ['outfit'], color: ['outfitColor', 'Couleur'] },
  { id: 'extras', label: 'Détails', parts: ['pose'], extras: true },
  { id: 'frame', label: 'Cadre', parts: ['frame'] },
  { id: 'bg', label: 'Fond', bg: true },
];
const FACE_PARTS = ['face', 'hair', 'eyes', 'brows', 'mouth', 'beard', 'glasses', 'headwear'];

Views.avatar = {
  draft: null,
  draftFor: null,
  cat: 'face',

  /* Vignette d'option : aperçu, nom, rareté, condition de déblocage */
  opt({ selected, ok, rarity, lock, label, act, svg }) {
    const rare = rarity && rarity.id !== 'c';
    return `<button class="av-opt ${selected ? 'on' : ''} ${ok ? '' : 'locked'} ${rare ? 'rar' : ''}" style="--rc:${rarity ? rarity.color : 'transparent'}" ${ok ? act : 'disabled'} title="${U.esc(label)}${ok ? '' : ' — ' + Avatar.lockLabel(lock)}">
      <span class="av-thumb">${svg}${ok ? '' : `<span class="av-lock">${Icons.get('lock', 16)}</span>`}</span>
      <span class="av-name">${U.esc(label)}</span>
      ${rare ? `<span class="av-rar">${rarity.label}</span>` : ''}
      ${ok ? '' : `<span class="av-cond">${U.esc(Avatar.lockLabel(lock))}</span>`}
    </button>`;
  },

  render([mode]) {
    const s = App.state;
    if (!this.draft || this.draftFor !== s.id) {
      this.draft = Avatar.sanitize(s, s.profile.avatar || Avatar.defaults());
      this.draftFor = s.id;
    }
    const d = this.draft;
    const cat = AV_CATS.find(c => c.id === this.cat) || AV_CATS[0];
    const first = mode === 'first';
    const items = Avatar.lockedItems();
    const owned = items.filter(i => Avatar.isUnlocked(s, i.lock)).length;

    const optionGrid = part => {
      const def = Avatar.parts[part];
      return `<h3>${def.label}</h3><div class="av-grid">${def.options.map(([id, label, lock]) => {
        const cfg = { ...d, [part]: id };
        if (part === 'hair') cfg.headwear = 'none'; // on voit la coupe en entier
        const svg = part === 'frame'
          ? `<span class="framed frame-${id}">${Avatar.svg(d, { size: 64, crop: 'face', shape: 'circle' })}</span>`
          : Avatar.svg(cfg, { size: 76, crop: FACE_PARTS.includes(part) ? 'face' : null });
        return this.opt({ selected: d[part] === id, ok: Avatar.isUnlocked(s, lock), rarity: Avatar.rarityOf(part, id), lock, label, svg, act: `data-act="avSet" data-part="${part}" data-val="${id}"` });
      }).join('')}</div>`;
    };
    const swatches = (key, title) => {
      const list = key === 'skin' ? Avatar.colors.skin : key === 'hairColor' ? Avatar.colors.hair : key === 'eyeColor' ? Avatar.colors.eye : Avatar.colors.cloth;
      return `<h3>${title}</h3><div class="swatches">${list.map(c => `<button class="sw ${d[key] === c ? 'on' : ''}" style="background:${c}" data-act="avSet" data-part="${key}" data-val="${c}" aria-label="${c}"></button>`).join('')}</div>`;
    };

    let panel = '';
    if (cat.parts) panel += cat.parts.map(optionGrid).join('');
    if (cat.color) panel += swatches(cat.color[0], cat.color[1]);
    if (cat.extras) {
      panel += `<h3>Détails</h3><div class="av-grid">${Avatar.extras.map(([id, label, lock]) => {
        const on = d.extras.includes(id);
        const svg = Avatar.svg({ ...d, extras: on ? d.extras : [...d.extras, id] }, { size: 76, crop: 'face' });
        return this.opt({ selected: on, ok: Avatar.isUnlocked(s, lock), rarity: Avatar.rarityOf('extras', id), lock, label, svg, act: `data-act="avToggle" data-val="${id}"` });
      }).join('')}</div>`;
    }
    if (cat.bg) {
      panel += `<h3>Fond</h3><div class="av-grid">${Avatar.colors.bg.map(b => this.opt({
        selected: d.bg === b.c, ok: Avatar.isUnlocked(s, b.unlock), rarity: Avatar.rarityOf('bg', b.c), lock: b.unlock, label: b.label || 'Uni',
        svg: Avatar.svg({ ...d, bg: b.c }, { size: 76 }), act: `data-act="avSet" data-part="bg" data-val="${b.c}"`,
      })).join('')}</div>`;
    }

    return `
      <header class="page-head">
        <p class="eyebrow">${first ? 'Étape 2 sur 2' : 'Avatar'}</p>
        <h1>${first ? 'Crée ton avatar' : 'À ton image'}</h1>
        <p class="muted">Les objets rares s'obtiennent en vrai : niveaux, quêtes de PNJ, XP cumulée, régularité.</p>
      </header>
      <section class="av-layout">
        <div class="card av-preview">
          <span class="framed big frame-${d.frame}">${Avatar.svg(d, { size: 240, label: 'Aperçu', shape: d.frame !== 'none' ? 'circle' : null })}</span>
          <div class="av-collection"><span>Collection</span><strong>${owned} / ${items.length}</strong></div>
          <div class="rar-legend">${Object.values(Avatar.RARITY).map(r => `<span style="--rc:${r.color}">${r.label}</span>`).join('')}</div>
          <div class="av-actions">
            <button class="btn ghost" data-act="avRandom">Aléatoire</button>
            ${s.profile.avatar ? '<button class="btn ghost" data-act="avReset">Annuler</button>' : ''}
            <button class="btn primary" data-act="avSave" data-first="${first ? 1 : ''}">${first ? 'Valider et commencer' : 'Enregistrer'}</button>
          </div>
        </div>
        <div class="card av-editor">
          <nav class="av-cats">${AV_CATS.map(c => `<button class="${c.id === cat.id ? 'on' : ''}" data-act="avCat" data-id="${c.id}">${c.label}</button>`).join('')}</nav>
          ${panel}
        </div>
      </section>`;
  },
};

App.actions.avCat = el => { Views.avatar.cat = el.dataset.id; App.render(false); };
App.actions.avSet = el => { Views.avatar.draft[el.dataset.part] = el.dataset.val; App.render(false); };
App.actions.avToggle = el => {
  const d = Views.avatar.draft;
  d.extras = d.extras.includes(el.dataset.val) ? d.extras.filter(x => x !== el.dataset.val) : [...d.extras, el.dataset.val];
  App.render(false);
};
App.actions.avRandom = () => { Views.avatar.draft = { ...Avatar.sanitize(App.state, Avatar.random()), frame: Views.avatar.draft?.frame || 'none' }; App.render(false); };
App.actions.avReset = () => { Views.avatar.draft = null; App.render(false); };
App.actions.avSave = el => {
  App.state.profile.avatar = Avatar.sanitize(App.state, Views.avatar.draft);
  Views.avatar.draft = null;
  App.toast('<b>Avatar enregistré.</b>');
  App.save();
  if (el.dataset.first) App.go('#/sport/tests');
  else App.render(false);
};
