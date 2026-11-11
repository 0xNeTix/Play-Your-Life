/* ============================================================================
   Avatars cartoon en SVG (joueurs et PNJ).
   Style : contours épais, aplats de couleur, fond à rayons de soleil.
   Avatar.svg(config, { size, crop, shape }) -> chaîne SVG
   ========================================================================== */
const Avatar = (() => {
  const O = '#1b1b2f';
  const SW = 3.5;
  const st = (fill, w = SW) => `fill="${fill}" stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  let uid = 0;

  /* ---------- Catalogue ----------
     Option : [id, libellé, déblocage?, rareté?]
     Déblocage : { domain, level } · { arc } (quête de PNJ) · { xp } (XP totale) · { quests } (quêtes du jour) · { streak } (meilleure série)
     Rareté : c commun · r rare · e épique · l légendaire */
  const RARITY = {
    c: { id: 'c', label: 'Commun', color: '#9aa3ad' },
    r: { id: 'r', label: 'Rare', color: '#0bc5d2' },
    e: { id: 'e', label: 'Épique', color: '#a77be0' },
    l: { id: 'l', label: 'Légendaire', color: '#ffbe69' },
  };
  const colors = {
    skin: ['#fde3c8', '#f6c9a0', '#eab48a', '#d39a6a', '#b57a4e', '#8d5a36', '#6a4128', '#4a2c1c'],
    hair: ['#2b2220', '#4a2e1c', '#7a4a26', '#a2462a', '#e2b45a', '#ece0c4', '#9a9a9a', '#f2f2f2', '#3a6fd8', '#e86aa6', '#2fa36b', '#7b4fc9'],
    eye: ['#5a3a22', '#2f6db5', '#2f8a5a', '#6b7a86', '#c08a2e', '#1b1b2f'],
    cloth: ['#450c07', '#d4704c', '#ffbe69', '#0bc5d2', '#003440', '#16213e', '#2f8a5a', '#7b4fc9', '#e86aa6', '#f2f2f2', '#3a3a3a', '#9aa3ad'],
    bg: [
      { c: '#16213e' }, { c: '#003440' }, { c: '#450c07' }, { c: '#d4704c' }, { c: '#0bc5d2' }, { c: '#3b2a63' }, { c: '#1f5c3a' }, { c: '#ffbe69' },
      { c: '#b8862f', unlock: { domain: 'char', level: 5 }, label: 'Or terni', r: 'r' },
      { c: '#e86aa6', unlock: { domain: 'discipline', level: 4 }, label: 'Aube rose', r: 'r' },
      { c: 'aurora', unlock: { arc: 'lyra-2' }, label: 'Aurore boréale', r: 'e' },
      { c: 'ember', unlock: { arc: 'kael-2' }, label: 'Braises de la forge', r: 'e' },
      { c: 'royal', unlock: { xp: 25000 }, label: 'Salle du trône', r: 'l' },
      { c: 'starfield', unlock: { arc: 'voyageur-2' }, label: 'Voûte étoilée', r: 'l' },
    ],
  };
  const SPECIAL_BG = ['aurora', 'ember', 'royal', 'starfield'];

  const parts = {
    face: { label: 'Visage', options: [['round', 'Rond'], ['oval', 'Ovale'], ['square', 'Carré'], ['chubby', 'Joues rondes']] },
    hair: { label: 'Coupe', options: [['bald', 'Chauve'], ['short', 'Courts'], ['sidepart', 'Raie'], ['curly', 'Bouclés'], ['spiky', 'En pics'], ['long', 'Longs'], ['bun', 'Chignon'], ['ponytail', 'Queue'], ['afro', 'Afro']] },
    eyes: { label: 'Yeux', options: [['normal', 'Normaux'], ['big', 'Grands'], ['happy', 'Rieurs'], ['sleepy', 'Calmes'], ['determined', 'Déterminés'], ['wink', 'Clin d\'œil']] },
    brows: { label: 'Sourcils', options: [['normal', 'Normaux'], ['raised', 'Levés'], ['angry', 'Froncés'], ['worried', 'Inquiets'], ['thick', 'Épais']] },
    mouth: { label: 'Bouche', options: [['smile', 'Sourire'], ['grin', 'Dents'], ['laugh', 'Rire'], ['open', 'Surpris'], ['smirk', 'En coin'], ['neutral', 'Neutre']] },
    beard: { label: 'Pilosité', options: [['none', 'Aucune'], ['stubble', 'Barbe de 3 jours'], ['mustache', 'Moustache'], ['goatee', 'Bouc'], ['short', 'Barbe courte'], ['full', 'Barbe + moustache'], ['long', 'Barbe longue'], ['viking', 'Barbe viking', { domain: 'sport', level: 4 }, 'r']] },
    glasses: { label: 'Lunettes', options: [['none', 'Aucune'], ['square', 'Carrées'], ['round', 'Rondes'], ['shades', 'Solaires', { streak: 7 }, 'r'], ['monocle', 'Monocle d\'Orin', { arc: 'orin-1' }, 'r'], ['visor', 'Visière d\'architecte', { arc: 'orin-2' }, 'e']] },
    headwear: { label: 'Couvre-chef', options: [['none', 'Aucun'], ['cap', 'Casquette'], ['beanie', 'Bonnet'],
      ['headband', 'Bandeau', { domain: 'sport', level: 2 }, 'r'], ['bandana', 'Bandana', { xp: 1000 }, 'r'], ['goggles', 'Lunettes d\'ingénieur', { domain: 'pro', level: 3 }, 'r'],
      ['hood', 'Capuche de l\'Aube', { arc: 'mira-1' }, 'r'], ['hat', 'Chapeau de voyageur', { domain: 'intel', level: 4 }, 'r'], ['wizard', 'Chapeau d\'érudit', { arc: 'lyra-1' }, 'e'],
      ['helmet', 'Casque de la Garde', { domain: 'sport', level: 6 }, 'e'], ['horned', 'Casque à cornes', { arc: 'brann-1' }, 'e'],
      ['crown', 'Couronne', { domain: 'char', level: 8 }, 'l'], ['laurel', 'Couronne de laurier', { xp: 20000 }, 'l'], ['halo', 'Auréole', { arc: 'voyageur-2' }, 'l']] },
    outfit: { label: 'Tenue', options: [['tshirt', 'T-shirt'], ['hoodie', 'Sweat à capuche'], ['varsity', 'Teddy'],
      ['scholar', 'Pull à col', { domain: 'intel', level: 2 }, 'r'], ['leather', 'Blouson de cuir', { xp: 2500 }, 'r'], ['gi', 'Kimono d\'entraînement', { quests: 30 }, 'r'],
      ['suit', 'Costume', { domain: 'pro', level: 4 }, 'r'], ['apron', 'Tablier de forge', { arc: 'kael-1' }, 'r'],
      ['robe', 'Robe du temple', { arc: 'mira-2' }, 'e'], ['armor', 'Armure', { arc: 'brann-2' }, 'e'], ['cape', 'Cape royale', { arc: 'voyageur-1' }, 'l']] },
    frame: { label: 'Cadre', options: [['none', 'Aucun'], ['iron', 'Fer'], ['bronze', 'Bronze', { xp: 1500 }, 'r'], ['silver', 'Argent', { xp: 6000 }, 'r'],
      ['runic', 'Runique', { arc: 'voyageur-1' }, 'e'], ['gold', 'Or', { xp: 15000 }, 'e'], ['legend', 'Légende', { xp: 40000 }, 'l']] },
    pose: { label: 'Geste', options: [['none', 'Aucun'], ['hands', 'Mains levées']] },
  };
  const extras = [['blush', 'Joues roses'], ['freckles', 'Taches de rousseur'], ['sweat', 'Goutte de sueur'], ['bandage', 'Pansement'],
    ['earring', 'Boucle d\'oreille', { xp: 4000 }, 'r'], ['scar', 'Cicatrice', { domain: 'sport', level: 5 }, 'r'], ['warpaint', 'Peinture de guerre', { arc: 'kael-2' }, 'e']];

  const defaults = () => ({
    face: 'round', skin: colors.skin[1], hair: 'short', hairColor: colors.hair[2], eyes: 'normal', eyeColor: colors.eye[0],
    brows: 'normal', mouth: 'smile', beard: 'none', glasses: 'none', headwear: 'none', headwearColor: colors.cloth[1],
    outfit: 'tshirt', outfitColor: colors.cloth[3], bg: colors.bg[0].c, pose: 'none', frame: 'none', extras: ['blush'],
  });

  function random() {
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const free = p => parts[p].options.filter(o => !o[2]).map(o => o[0]);
    return {
      ...defaults(), face: pick(free('face')), skin: pick(colors.skin), hair: pick(free('hair')), hairColor: pick(colors.hair.slice(0, 8)),
      eyes: pick(free('eyes')), eyeColor: pick(colors.eye), brows: pick(free('brows')), mouth: pick(free('mouth')),
      beard: Math.random() < 0.6 ? 'none' : pick(free('beard')), glasses: Math.random() < 0.7 ? 'none' : pick(free('glasses')),
      headwear: Math.random() < 0.7 ? 'none' : pick(free('headwear')), headwearColor: pick(colors.cloth),
      outfit: pick(free('outfit')), outfitColor: pick(colors.cloth), bg: pick(colors.bg.filter(b => !b.unlock)).c,
      extras: Math.random() < 0.5 ? ['blush'] : [],
    };
  }

  /* ---------- Géométrie ---------- */
  const HEAD_RX = { round: 46, oval: 42, square: 45, chubby: 48 };
  function head(face, skin) {
    switch (face) {
      case 'oval': return `<ellipse cx="100" cy="94" rx="42" ry="53" ${st(skin)}/>`;
      case 'square': return `<path d="M55 72 Q55 44 100 44 Q145 44 145 72 V106 Q145 146 100 147 Q55 146 55 106 Z" ${st(skin)}/>`;
      case 'chubby': return `<path d="M53 90 Q52 44 100 44 Q148 44 147 90 Q151 126 128 141 Q100 154 72 141 Q49 126 53 90 Z" ${st(skin)}/>`;
      default: return `<ellipse cx="100" cy="95" rx="46" ry="50" ${st(skin)}/>`;
    }
  }
  function ears(face, skin) {
    const rx = HEAD_RX[face] || 46;
    return `<ellipse cx="${100 - rx}" cy="100" rx="9" ry="12" ${st(skin)}/><ellipse cx="${100 + rx}" cy="100" rx="9" ry="12" ${st(skin)}/>
      <path d="M${100 - rx - 3} 96 q4 4 0 8 M${100 + rx + 3} 96 q-4 4 0 8" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>`;
  }

  function eye(cx, cy, style, color, side = 1, skin = "#f6c9a0") {
    const iris = `<circle cx="${cx + 1}" cy="${cy + 1}" r="4.6" fill="${color}"/><circle cx="${cx + 1}" cy="${cy + 1}" r="2.3" fill="${O}"/><circle cx="${cx - 1}" cy="${cy - 1.5}" r="1.6" fill="#fff"/>`;
    switch (style) {
      case 'big': return `<ellipse cx="${cx}" cy="${cy}" rx="10.5" ry="11.5" ${st('#fff', 3)}/><circle cx="${cx}" cy="${cy}" r="3.6" fill="${O}"/><circle cx="${cx - 1.5}" cy="${cy - 1.5}" r="1.3" fill="#fff"/>`;
      case 'happy': return `<path d="M${cx - 8} ${cy + 3} Q${cx} ${cy - 8} ${cx + 8} ${cy + 3}" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>`;
      case 'sleepy': return `<ellipse cx="${cx}" cy="${cy + 1}" rx="8.5" ry="8" ${st('#fff', 3)}/>${iris}<path d="M${cx - 9.5} ${cy + 1} Q${cx} ${cy - 10} ${cx + 9.5} ${cy + 1} Z" fill="${skin}" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>`;
      case 'determined': {
        // paupière inclinée vers le nez (side 1 = œil gauche, -1 = œil droit)
        const yl = cy - (side > 0 ? 7 : 2), yr = cy - (side > 0 ? 2 : 7);
        return `<ellipse cx="${cx}" cy="${cy}" rx="8.5" ry="9" ${st('#fff', 3)}/>${iris}<path d="M${cx - 11} ${yl} L${cx + 11} ${yr} L${cx + 11} ${cy - 13} L${cx - 11} ${cy - 13} Z" fill="${skin}"/><path d="M${cx - 10} ${yl} L${cx + 10} ${yr}" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`;
      }
      default: return `<ellipse cx="${cx}" cy="${cy}" rx="8.5" ry="9.5" ${st('#fff', 3)}/>${iris}`;
    }
  }
  function eyes(c) {
    if (c.eyes === 'wink') return eye(82, 96, 'normal', c.eyeColor) + eye(118, 96, 'happy', c.eyeColor);
    return eye(82, 96, c.eyes, c.eyeColor, 1, c.skin) + eye(118, 96, c.eyes, c.eyeColor, -1, c.skin);
  }
  function brows(style, color) {
    const col = color === '#f2f2f2' || color === '#ece0c4' ? '#b9a98a' : color;
    const p = (d, w = 5.5) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + 2.5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    switch (style) {
      case 'raised': return p('M72 78 Q82 68 92 76') + p('M108 76 Q118 68 128 78');
      case 'angry': return p('M72 76 L92 84') + p('M108 84 L128 76');
      case 'worried': return p('M72 82 L91 76') + p('M109 76 L128 82');
      case 'thick': return p('M71 81 Q82 73 93 80', 8) + p('M107 80 Q118 73 129 81', 8);
      default: return p('M72 82 Q82 75 92 80') + p('M108 80 Q118 75 128 82');
    }
  }
  const nose = () => `<path d="M100 102 Q94 112 98 116 Q103 118 106 114" fill="none" stroke="${O}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  function mouth(style) {
    const red = '#7a1f2b', tongue = '#e0707a';
    switch (style) {
      case 'grin': return `<path d="M86 123 Q100 142 114 123 Z" ${st(red, 3)}/><path d="M88.5 124.5 H111.5 Q110 129 100 129 Q90 129 88.5 124.5 Z" fill="#fff"/>`;
      case 'laugh': return `<path d="M84 121 H116 Q115 145 100 145 Q85 145 84 121 Z" ${st(red, 3)}/><path d="M86.5 122.5 H113.5 Q113 127 100 127 Q87 127 86.5 122.5 Z" fill="#fff"/><path d="M92 140 Q100 132 108 140 Q100 144 92 140 Z" fill="${tongue}"/>`;
      case 'open': return `<ellipse cx="100" cy="129" rx="6.5" ry="8.5" ${st(red, 3)}/><ellipse cx="100" cy="133" rx="3.5" ry="2.5" fill="${tongue}"/>`;
      case 'smirk': return `<path d="M89 128 Q103 131 113 121" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>`;
      case 'neutral': return `<path d="M90 128 H110" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>`;
      default: return `<path d="M87 124 Q100 136 113 124" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>`;
    }
  }
  function beard(style, color) {
    const must = `<path d="M100 117 Q88 111 80 121 Q90 126 100 121 Q110 126 120 121 Q112 111 100 117 Z" ${st(color, 3)}/>`;
    const short = `<path d="M57 104 Q57 152 100 154 Q143 152 143 104 Q137 124 120 121 Q110 117 100 119 Q90 117 80 121 Q63 124 57 104 Z" ${st(color)}/>`;
    const long = `<path d="M57 104 Q54 168 100 190 Q146 168 143 104 Q137 124 120 121 Q110 117 100 119 Q90 117 80 121 Q63 124 57 104 Z" ${st(color)}/><path d="M86 160 Q100 172 114 160 M80 144 Q100 158 120 144" fill="none" stroke="${O}" stroke-width="2" opacity=".35" stroke-linecap="round"/>`;
    switch (style) {
      case 'stubble': return `<path d="M58 106 Q60 148 100 150 Q140 148 142 106 Q132 128 100 130 Q68 128 58 106 Z" fill="${color}" opacity=".28"/><path d="M84 118 Q100 112 116 118 Q100 122 84 118 Z" fill="${color}" opacity=".28"/>`;
      case 'mustache': return must;
      case 'goatee': return `<path d="M89 136 Q100 154 111 136 Q100 141 89 136 Z" ${st(color, 3)}/>`;
      case 'short': return short;
      case 'full': return short + must;
      case 'long': return long;
      case 'viking': return long + must + `<path d="M88 176 l-6 12 M112 176 l6 12" stroke="${O}" stroke-width="3"/><circle cx="82" cy="190" r="4" ${st('#ffbe69', 2.5)}/><circle cx="118" cy="190" r="4" ${st('#ffbe69', 2.5)}/>`;
      default: return '';
    }
  }
  function glasses(style) {
    const temples = `<path d="M66 94 L54 92 M134 94 L146 92" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>`;
    switch (style) {
      case 'square': return `${temples}<rect x="67" y="84" width="29" height="23" rx="5" fill="#fff" fill-opacity=".18" stroke="${O}" stroke-width="4.5"/><rect x="104" y="84" width="29" height="23" rx="5" fill="#fff" fill-opacity=".18" stroke="${O}" stroke-width="4.5"/><path d="M96 93 Q100 90 104 93" fill="none" stroke="${O}" stroke-width="4"/>`;
      case 'round': return `${temples}<circle cx="82" cy="96" r="13" fill="#fff" fill-opacity=".18" stroke="${O}" stroke-width="3.5"/><circle cx="118" cy="96" r="13" fill="#fff" fill-opacity=".18" stroke="${O}" stroke-width="3.5"/><path d="M95 94 Q100 90 105 94" fill="none" stroke="${O}" stroke-width="3.5"/>`;
      case 'monocle': return `<path d="M130 104 Q144 128 134 152" fill="none" stroke="#ffbe69" stroke-width="2"/><circle cx="118" cy="96" r="13" fill="#fff" fill-opacity=".2" stroke="${O}" stroke-width="5.5"/><circle cx="118" cy="96" r="13" fill="none" stroke="#ffbe69" stroke-width="2.5"/>`;
      case 'visor': return `<path d="M58 85 H142 Q144 104 133 109 H67 Q56 104 58 85 Z" fill="#0bc5d2" fill-opacity=".8" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/><path d="M66 91 H112" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/><path d="M58 92 L50 90 M142 92 L150 90" stroke="${O}" stroke-width="4" stroke-linecap="round"/>`;
      case 'shades': return `${temples}<path d="M66 88 H96 V98 Q95 110 82 110 Q67 110 66 98 Z M104 88 H134 V98 Q133 110 118 110 Q105 110 104 98 Z" ${st('#1b1b2f', 3)}/><path d="M96 91 H104" stroke="${O}" stroke-width="4"/><path d="M72 92 L78 92 M110 92 L116 92" stroke="#fff" stroke-width="2.5" opacity=".6" stroke-linecap="round"/>`;
      default: return '';
    }
  }

  /* Cheveux : partie arrière (derrière la tête) et avant */
  function curls(cx, cy, rx, ry, n, r, from, to, color) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (from + ((to - from) * i) / (n - 1)) * Math.PI / 180;
      s += `<circle cx="${(cx + rx * Math.cos(a)).toFixed(1)}" cy="${(cy + ry * Math.sin(a)).toFixed(1)}" r="${r}" ${st(color)}/>`;
    }
    return s;
  }
  function hairBack(style, color) {
    switch (style) {
      case 'long': return `<path d="M48 92 C42 38 80 26 100 26 C120 26 158 38 152 92 L160 170 Q132 180 122 162 L78 162 Q68 180 40 170 Z" ${st(color)}/>`;
      case 'bun': return `<circle cx="100" cy="30" r="17" ${st(color)}/>`;
      case 'ponytail': return `<path d="M136 64 Q182 84 166 158 Q160 128 140 104 Z" ${st(color)}/>`;
      case 'afro': return `<ellipse cx="100" cy="74" rx="62" ry="50" ${st(color)}/>${curls(100, 74, 60, 48, 14, 16, 160, 380, color)}`;
      default: return '';
    }
  }
  function hairFront(style, color) {
    const base = `<path d="M52 92 C46 46 78 32 102 33 C130 33 156 50 148 92 C142 70 128 59 100 59 C76 59 60 70 52 92 Z" ${st(color)}/>`;
    switch (style) {
      case 'short': return base;
      case 'bun': return base;
      case 'ponytail': return base;
      case 'sidepart': return `<path d="M52 96 C44 46 80 28 106 32 C136 34 156 56 148 94 C146 74 140 64 128 58 C110 72 82 68 68 58 C60 66 54 80 52 96 Z" ${st(color)}/><path d="M118 40 Q112 50 100 56" fill="none" stroke="${O}" stroke-width="2.5" stroke-linecap="round"/>`;
      case 'spiky': return `<path d="M52 94 L48 62 L62 68 L62 40 L78 52 L84 26 L98 44 L110 22 L118 44 L134 30 L134 54 L150 48 L146 70 L150 94 C140 72 126 61 100 61 C76 61 60 72 52 94 Z" ${st(color)}/>`;
      case 'curly': return `<path d="M53 90 C50 52 78 36 100 36 C122 36 150 52 147 90 C140 72 124 63 100 63 C76 63 60 72 53 90 Z" ${st(color)}/>${curls(100, 66, 48, 30, 11, 14, 175, 365, color)}${curls(100, 48, 22, 6, 3, 14, 180, 360, color)}`;
      case 'long': return `<path d="M50 100 C44 44 80 30 100 30 C120 30 156 44 150 100 C144 66 122 54 106 54 C96 68 72 72 50 100 Z" ${st(color)}/>`;
      case 'afro': return `<path d="M54 90 C52 64 72 54 100 54 C128 54 148 64 146 90 C138 76 124 70 100 70 C76 70 62 76 54 90 Z" ${st(color)}/>`;
      case 'bald': return `<path d="M80 58 Q92 50 106 52" fill="none" stroke="#fff" stroke-width="4" opacity=".45" stroke-linecap="round"/>`;
      default: return base;
    }
  }

  function headwearBack(style, color) {
    if (style === 'hood') return `<path d="M38 124 C26 40 70 16 100 16 C130 16 174 40 162 124 L174 176 L26 176 Z" ${st(color)}/>`;
    return '';
  }
  function headwearFront(style, color) {
    switch (style) {
      case 'cap': return `<path d="M50 80 C50 40 80 28 100 28 C120 28 150 40 150 80 Z" ${st(color)}/><path d="M46 80 Q100 66 154 80 Q158 94 100 89 Q42 94 46 80 Z" ${st(color)}/><circle cx="100" cy="29" r="4" ${st(color, 2.5)}/><path d="M100 30 V78" stroke="${O}" stroke-width="2" opacity=".35"/>`;
      case 'beanie': return `<path d="M50 80 C48 34 80 22 100 22 C120 22 152 34 150 80 Z" ${st(color)}/><rect x="45" y="68" width="110" height="18" rx="8" ${st(color)}/><path d="M60 72 V82 M75 72 V82 M90 72 V82 M105 72 V82 M120 72 V82 M135 72 V82" stroke="${O}" stroke-width="2" opacity=".35"/><circle cx="100" cy="20" r="10" ${st('#f2f2f2')}/>`;
      case 'headband': return `<path d="M52 70 Q100 54 148 70 L148 82 Q100 66 52 82 Z" ${st(color)}/><path d="M148 74 Q164 78 166 92 M148 78 Q158 86 156 100" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M148 74 Q164 78 166 92 M148 78 Q158 86 156 100" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>`;
      case 'goggles': return `<path d="M52 66 Q100 52 148 66 L148 74 Q100 60 52 74 Z" ${st('#3a3a3a', 3)}/><circle cx="82" cy="62" r="13" ${st('#9aa3ad')}/><circle cx="118" cy="62" r="13" ${st('#9aa3ad')}/><circle cx="82" cy="62" r="8" ${st(color, 2.5)}/><circle cx="118" cy="62" r="8" ${st(color, 2.5)}/><path d="M78 58 l3 -2 M114 58 l3 -2" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`;
      case 'hood': return `<path d="M50 118 C44 52 74 32 100 32 C126 32 156 52 150 118" fill="none" stroke="${O}" stroke-width="16" stroke-linecap="round"/><path d="M50 118 C44 52 74 32 100 32 C126 32 156 52 150 118" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>`;
      case 'hat': return `<ellipse cx="100" cy="60" rx="74" ry="15" ${st(color)}/><path d="M66 58 Q66 12 100 12 Q134 12 134 58 Z" ${st(color)}/><path d="M67 48 Q100 40 133 48 L134 58 Q100 50 66 58 Z" ${st('#ffbe69', 2.5)}/><path d="M26 58 Q100 78 174 58" fill="none" stroke="${O}" stroke-width="3" opacity=".5"/>`;
      case 'helmet': return `<path d="M120 26 Q138 4 162 12 Q146 18 132 34 Z" ${st('#b3261e')}/><path d="M47 98 C44 38 78 22 100 22 C122 22 156 38 153 98 L153 104 H137 V86 Q100 74 63 86 V104 H47 Z" ${st('#9aa3ad')}/><path d="M95 78 H105 V114 Q100 118 95 114 Z" ${st('#9aa3ad', 3)}/><circle cx="56" cy="92" r="2.5" fill="${O}"/><circle cx="144" cy="92" r="2.5" fill="${O}"/><path d="M66 40 Q100 28 134 40" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`;
      case 'bandana': return `<path d="M50 84 C50 42 80 30 100 30 C120 30 150 42 150 84 Q100 70 50 84 Z" ${st(color)}/><path d="M146 72 Q170 62 174 82 Q162 78 150 82 Z M147 78 Q166 92 158 108 Q153 94 145 86 Z" ${st(color, 3)}/><g fill="#fff" opacity=".7"><circle cx="76" cy="54" r="2.5"/><circle cx="96" cy="44" r="2.5"/><circle cx="118" cy="48" r="2.5"/><circle cx="134" cy="62" r="2.5"/><circle cx="64" cy="70" r="2.5"/><circle cx="106" cy="62" r="2.5"/></g>`;
      case 'wizard': return `<ellipse cx="100" cy="60" rx="68" ry="13" ${st(color)}/><path d="M64 60 Q80 32 94 6 Q104 -6 118 6 Q108 12 108 22 Q122 42 136 60 Z" ${st(color)}/><path d="M66 52 Q100 62 134 52 L137 60 Q100 70 63 60 Z" ${st('#ffbe69', 2.5)}/><path d="M92 34 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M114 40 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill="#ffbe69"/>`;
      case 'horned': return `<path d="M58 64 Q28 58 20 22 Q42 42 64 46 Z" ${st('#efe3d0')}/><path d="M142 64 Q172 58 180 22 Q158 42 136 46 Z" ${st('#efe3d0')}/><path d="M28 34 l8 4 M172 34 l-8 4" stroke="${O}" stroke-width="2" opacity=".4"/><path d="M48 96 C46 42 78 26 100 26 C122 26 154 42 152 96 L152 100 Q100 86 48 100 Z" ${st('#8b949c')}/><path d="M50 82 Q100 70 150 82" fill="none" stroke="${O}" stroke-width="3"/><path d="M95 72 H105 V112 Q100 116 95 112 Z" ${st('#8b949c', 3)}/><circle cx="64" cy="80" r="2.5" fill="${O}"/><circle cx="136" cy="80" r="2.5" fill="${O}"/><path d="M68 42 Q100 30 132 42" fill="none" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>`;
      case 'laurel': {
        let l = '';
        for (let i = 0; i < 6; i++) {
          const a = (196 + i * 15) * Math.PI / 180, b = (344 - i * 15) * Math.PI / 180;
          const lx = 100 + 54 * Math.cos(a), ly = 92 + 54 * Math.sin(a), rx2 = 100 + 54 * Math.cos(b), ry2 = 92 + 54 * Math.sin(b);
          l += `<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="10" ry="4.5" transform="rotate(${(196 + i * 15 + 60).toFixed(0)} ${lx.toFixed(1)} ${ly.toFixed(1)})" ${st('#ffbe69', 2.5)}/>`;
          l += `<ellipse cx="${rx2.toFixed(1)}" cy="${ry2.toFixed(1)}" rx="10" ry="4.5" transform="rotate(${(344 - i * 15 - 60).toFixed(0)} ${rx2.toFixed(1)} ${ry2.toFixed(1)})" ${st('#ffbe69', 2.5)}/>`;
        }
        return l + `<circle cx="100" cy="38" r="4" ${st('#b3261e', 2)}/>`;
      }
      case 'halo': return `<ellipse cx="100" cy="22" rx="36" ry="9" fill="none" stroke="#ffe3a8" stroke-width="14" opacity=".25"/><ellipse cx="100" cy="22" rx="34" ry="8" fill="none" stroke="${O}" stroke-width="8"/><ellipse cx="100" cy="22" rx="34" ry="8" fill="none" stroke="#ffd27a" stroke-width="4.5"/>`;
      case 'crown': return `<path d="M60 56 L58 22 L78 38 L100 14 L122 38 L142 22 L140 56 Z" ${st('#ffbe69')}/><circle cx="100" cy="44" r="5" ${st('#b3261e', 2.5)}/><circle cx="76" cy="47" r="3.5" ${st('#0bc5d2', 2)}/><circle cx="124" cy="47" r="3.5" ${st('#0bc5d2', 2)}/>`;
      default: return '';
    }
  }

  function outfitBody(style, color) {
    const torso = c => `<path d="M20 206 C22 172 50 156 100 156 C150 156 178 172 180 206 Z" ${st(c)}/>`;
    switch (style) {
      case 'hoodie': return torso(color) + `<path d="M66 162 Q100 140 134 162 Q100 180 66 162 Z" ${st(color)}/>`;
      case 'armor': return torso('#9aa3ad');
      case 'cape': return `<path d="M4 206 C10 162 38 146 70 146 H130 C162 146 190 162 196 206 Z" ${st(color)}/><path d="M48 206 C50 176 70 162 100 162 C130 162 150 176 152 206 Z" ${st('#1b1b2f', 3)}/><path d="M60 206 C62 186 76 178 100 178 C124 178 138 186 140 206" fill="none" stroke="#ffbe69" stroke-width="2" opacity=".6"/>`;
      case 'leather': return torso('#2a2420');
      case 'gi': return torso(color);
      case 'robe': return torso(color);
      default: return torso(color);
    }
  }
  function outfitFront(style, color, skin) {
    switch (style) {
      case 'tshirt': return `<path d="M83 158 Q100 174 117 158" fill="none" stroke="${O}" stroke-width="3.5" stroke-linecap="round"/>`;
      case 'hoodie': return `<path d="M94 170 V188 M106 170 V188" stroke="${O}" stroke-width="3" stroke-linecap="round"/><circle cx="94" cy="190" r="2.5" ${st('#f2f2f2', 2)}/><circle cx="106" cy="190" r="2.5" ${st('#f2f2f2', 2)}/>`;
      case 'varsity': return `<path d="M20 206 C22 178 34 166 52 160 L62 206 Z M180 206 C178 178 166 166 148 160 L138 206 Z" ${st('#f3e6d3')}/><path d="M82 157 L100 186 L118 157 Z" ${st('#f2f2f2', 3)}/><path d="M80 156 L100 190 L120 156" fill="none" stroke="${O}" stroke-width="10" stroke-linejoin="round"/><path d="M80 156 L100 190 L120 156" fill="none" stroke="#f3e6d3" stroke-width="5" stroke-linejoin="round"/><path d="M80 156 L100 190 L120 156" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>`;
      case 'scholar': return `<path d="M84 157 L100 172 L116 157" fill="none" stroke="${O}" stroke-width="3"/><path d="M84 156 L80 172 L100 168 Z M116 156 L120 172 L100 168 Z" ${st('#f2f2f2', 3)}/>`;
      case 'suit': return `<path d="M82 157 L100 198 L118 157 Z" ${st('#f2f2f2', 3)}/><path d="M96 166 H104 L107 190 L100 200 L93 190 Z" ${st('#b3261e', 3)}/><path d="M82 157 L92 186 L74 172 Z M118 157 L108 186 L126 172 Z" ${st(color, 3)}/>`;
      case 'apron': return `<path d="M83 158 Q100 172 117 158" fill="none" stroke="${O}" stroke-width="3"/><path d="M64 172 H136 L142 206 H58 Z" ${st('#6b4a32')}/><path d="M66 172 L62 156 M134 172 L138 156" stroke="${O}" stroke-width="5" stroke-linecap="round"/><rect x="88" y="182" width="24" height="14" rx="3" ${st('#5a3d29', 2.5)}/>`;
      case 'cape': return `<path d="M62 150 L80 180 L88 158 Z M138 150 L120 180 L112 158 Z" ${st(color, 3)}/><path d="M82 172 Q100 184 118 172" fill="none" stroke="#ffbe69" stroke-width="2.5"/><circle cx="82" cy="172" r="6" ${st('#ffbe69', 3)}/><circle cx="118" cy="172" r="6" ${st('#ffbe69', 3)}/><circle cx="82" cy="172" r="2" fill="#b3261e"/><circle cx="118" cy="172" r="2" fill="#b3261e"/>`;
      case 'leather': return `<path d="M86 157 L100 206 L114 157 Z" ${st(color, 3)}/><path d="M86 157 L72 192 L92 178 Z M114 157 L128 192 L108 178 Z" ${st('#3a322c', 3)}/><path d="M60 196 L66 206 M140 196 L134 206" stroke="#9aa3ad" stroke-width="2.5"/>`;
      case 'gi': return `<path d="M80 156 L120 206 L136 206 L92 156 Z" fill="#000" fill-opacity=".14" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M120 156 L94 198 L82 192 L108 156 Z" ${st(color, 3)}/><path d="M60 196 H140" stroke="#1b1b2f" stroke-width="7"/>`;
      case 'robe': return `<path d="M84 157 L100 186 L116 157 Z" ${st('#f3e6d3', 3)}/><path d="M84 157 L100 186 L116 157" fill="none" stroke="#ffbe69" stroke-width="3"/>`;
      case 'armor': return `<ellipse cx="40" cy="178" rx="27" ry="18" ${st('#7d8790')}/><ellipse cx="160" cy="178" rx="27" ry="18" ${st('#7d8790')}/><path d="M66 184 Q100 198 134 184" fill="none" stroke="${O}" stroke-width="3"/><path d="M84 158 Q100 168 116 158" fill="none" stroke="${O}" stroke-width="3"/><circle cx="74" cy="176" r="2.5" fill="${O}"/><circle cx="126" cy="176" r="2.5" fill="${O}"/><path d="M60 170 Q100 158 140 170" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>`;
      default: return '';
    }
  }

  function hand(cx, top, skin, sleeve, mirror) {
    const spread = [-16, -6, 5, 15], hs = [16, 21, 20, 16], xs = [-13, -5.5, 2, 9.5];
    let f = '';
    for (let i = 0; i < 4; i++) f += `<rect x="${cx + xs[i]}" y="${top - hs[i] + 6}" width="8" height="${hs[i] + 8}" rx="4" transform="rotate(${spread[i]} ${cx} ${top + 14})" ${st(skin, 3)}/>`;
    const tx = mirror ? cx - 22 : cx + 10;
    const thumb = `<rect x="${tx}" y="${top + 8}" width="12" height="8" rx="4" transform="rotate(${mirror ? 35 : -35} ${cx} ${top + 16})" ${st(skin, 3)}/>`;
    return `<g>${f}${thumb}<rect x="${cx - 15}" y="${top}" width="30" height="28" rx="12" ${st(skin, 3)}/><path d="M${cx - 6} ${top + 10} q6 4 12 0" fill="none" stroke="${O}" stroke-width="1.5" opacity=".4"/><rect x="${cx - 16}" y="${top + 24}" width="32" height="18" rx="5" ${st(sleeve, 3)}/></g>`;
  }

  /* Valide une config (elle peut venir d'une carte importée) : valeurs connues et couleurs hexadécimales uniquement */
  const HEX = /^#[0-9a-f]{6}$/i;
  function clean(cfg) {
    const d = defaults();
    const c = { ...d };
    if (!cfg || typeof cfg !== 'object') return c;
    for (const p of Object.keys(parts)) if (parts[p].options.some(o => o[0] === cfg[p])) c[p] = cfg[p];
    for (const k of ['skin', 'hairColor', 'eyeColor', 'headwearColor', 'outfitColor', 'bg']) if (HEX.test(cfg[k])) c[k] = cfg[k];
    if (SPECIAL_BG.includes(cfg.bg)) c.bg = cfg.bg;
    c.extras = Array.isArray(cfg.extras) ? cfg.extras.filter(e => extras.some(x => x[0] === e)) : d.extras;
    return c;
  }

  const STARS = [[18, 22], [42, 14], [70, 30], [130, 18], [160, 34], [184, 16], [24, 60], [176, 70], [12, 110], [190, 120], [34, 150], [168, 160], [150, 40], [58, 48]];
  function background(bg, id, rays) {
    if (bg === 'aurora') return `<defs><linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1b3a"/><stop offset=".45" stop-color="#0b6f7a"/><stop offset="1" stop-color="#3b2a63"/></linearGradient></defs><rect width="200" height="200" fill="url(#${id}a)"/><path d="M-10 70 Q50 30 100 60 T210 40 V90 Q150 70 100 96 T-10 100Z" fill="#0bc5d2" opacity=".25"/><path d="M-10 40 Q60 10 110 34 T210 20 V50 Q150 36 100 60 T-10 64Z" fill="#a77be0" opacity=".2"/>`;
    if (bg === 'ember') return `<defs><radialGradient id="${id}a" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="#d4704c"/><stop offset=".6" stop-color="#7a1e10"/><stop offset="1" stop-color="#2a0603"/></radialGradient></defs><rect width="200" height="200" fill="url(#${id}a)"/><path d="${rays}" fill="#ffbe69" opacity=".07"/><g fill="#ffbe69">${STARS.map(([x, y], i) => `<circle cx="${x}" cy="${y + 30}" r="${1 + (i % 3) * .6}" opacity="${.4 + (i % 4) * .15}"/>`).join('')}</g>`;
    if (bg === 'royal') return `<rect width="200" height="200" fill="#3a0905"/><path d="${rays}" fill="#ffbe69" opacity=".16"/><circle cx="100" cy="120" r="80" fill="#ffbe69" opacity=".08"/>`;
    if (bg === 'starfield') return `<defs><radialGradient id="${id}a" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#1d2a5a"/><stop offset="1" stop-color="#05070f"/></radialGradient></defs><rect width="200" height="200" fill="url(#${id}a)"/><g fill="#fff">${STARS.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${.8 + (i % 3) * .5}" opacity="${.5 + (i % 3) * .2}"/>`).join('')}</g><path d="M150 40 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#ffe3a8"/>`;
    return `<rect width="200" height="200" fill="${bg}"/><path d="${rays}" fill="#fff" opacity=".08"/>`;
  }

  function svg(cfg, opts = {}) {
    const c = clean(cfg);
    const size = opts.size || 120;
    const view = opts.crop === 'face' ? '28 18 144 144' : '0 0 200 200';
    const id = 'avc' + (++uid);
    const rx = opts.shape === 'circle' ? 100 : 26;
    let rays = '';
    for (let i = 0; i < 18; i++) {
      const a1 = (i * 20) * Math.PI / 180, a2 = (i * 20 + 10) * Math.PI / 180;
      rays += `M100 120 L${(100 + 260 * Math.cos(a1)).toFixed(0)} ${(120 + 260 * Math.sin(a1)).toFixed(0)} L${(100 + 260 * Math.cos(a2)).toFixed(0)} ${(120 + 260 * Math.sin(a2)).toFixed(0)} Z `;
    }
    const ex = new Set(c.extras || []);
    const sleeve = c.outfit === 'armor' ? '#9aa3ad' : c.outfitColor;
    const hideHair = c.headwear === 'helmet' || c.headwear === 'horned' || c.headwear === 'hood' && !['long', 'curly'].includes(c.hair);
    const hairFrontStyle = ['hat', 'beanie', 'cap', 'bandana', 'wizard'].includes(c.headwear) && ['curly', 'spiky', 'afro', 'bun'].includes(c.hair) ? 'short' : c.hair;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" width="${size}" height="${size}" class="avatar-svg" role="img" aria-label="${U.esc(opts.label || 'Avatar')}" style="--av-skin:${c.skin}">
      <defs><clipPath id="${id}"><rect x="0" y="0" width="200" height="200" rx="${rx}"/></clipPath></defs>
      <g clip-path="url(#${id})">
        ${background(c.bg, id, rays)}
        <circle cx="100" cy="120" r="70" fill="#fff" opacity=".06"/>
        ${headwearBack(c.headwear, c.headwearColor)}
        ${hideHair ? '' : hairBack(c.hair, c.hairColor)}
        ${outfitBody(c.outfit, c.outfitColor)}
        <path d="M87 124 V160 Q100 168 113 160 V124 Z" ${st(c.skin)}/>
        <path d="M88 150 Q100 156 112 150" fill="none" stroke="${O}" stroke-width="2" opacity=".25"/>
        ${outfitFront(c.outfit, c.outfitColor, c.skin)}
        ${ears(c.face, c.skin)}
        ${head(c.face, c.skin)}
        ${ex.has('blush') ? '<ellipse cx="70" cy="116" rx="9" ry="5" fill="#ff6b6b" opacity=".35"/><ellipse cx="130" cy="116" rx="9" ry="5" fill="#ff6b6b" opacity=".35"/>' : ''}
        ${ex.has('freckles') ? '<g fill="#8a4a2a" opacity=".55"><circle cx="70" cy="110" r="1.6"/><circle cx="76" cy="114" r="1.6"/><circle cx="66" cy="115" r="1.6"/><circle cx="130" cy="110" r="1.6"/><circle cx="124" cy="114" r="1.6"/><circle cx="134" cy="115" r="1.6"/></g>' : ''}
        ${ex.has('warpaint') ? `<path d="M62 108 L84 113 M64 116 L82 119 M138 108 L116 113 M136 116 L118 119" stroke="#b3261e" stroke-width="4" stroke-linecap="round" opacity=".85"/>` : ''}
        ${beard(c.beard, c.hairColor)}
        ${eyes(c)}
        ${brows(c.brows, c.hairColor)}
        ${nose()}
        ${mouth(c.mouth)}
        ${glasses(c.glasses)}
        ${ex.has('bandage') ? `<g transform="rotate(-20 100 92)"><rect x="90" y="88" width="20" height="9" rx="3" ${st('#f3e6d3', 2.5)}/><path d="M97 90 V95 M103 90 V95" stroke="${O}" stroke-width="1.5" opacity=".4"/></g>` : ''}
        ${ex.has('scar') ? `<path d="M124 104 L134 124 M126 110 l6 -3 M129 117 l6 -3" stroke="#a83a3a" stroke-width="2.5" stroke-linecap="round" fill="none"/>` : ''}
        ${ex.has('earring') ? `<circle cx="${100 - (HEAD_RX[c.face] || 46) - 2}" cy="114" r="4" ${st('#ffbe69', 2.5)}/>` : ''}
        ${hideHair ? '' : hairFront(hairFrontStyle, c.hairColor)}
        ${headwearFront(c.headwear, c.headwearColor)}
        ${ex.has('sweat') ? `<path d="M138 64 Q132 74 138 78 Q144 74 138 64 Z" ${st('#9fe3f0', 2.5)}/>` : ''}
        ${c.pose === 'hands' ? hand(34, 140, c.skin, sleeve, false) + hand(166, 140, c.skin, sleeve, true) : ''}
      </g>
    </svg>`;
  }

  /* ---------- Déblocages & rareté ---------- */
  function entry(part, id) {
    if (part === 'extras') return extras.find(e => e[0] === id) || null;
    if (part === 'bg') { const b = colors.bg.find(x => x.c === id); return b ? [b.c, b.label || 'Fond', b.unlock, b.r] : null; }
    return (parts[part]?.options || []).find(o => o[0] === id) || null;
  }
  const lockOf = (part, id) => (entry(part, id) || [])[2] || null;
  const rarityOf = (part, id) => RARITY[(entry(part, id) || [])[3] || 'c'];
  function isUnlocked(state, lock) {
    if (!lock) return true;
    if (lock.arc) return state.npc?.arcs?.[lock.arc]?.status === 'done';
    if (lock.xp) return Engine.totalXP(state) >= lock.xp;
    if (lock.quests) return Object.values(state.quests || {}).flat().filter(q => q.done).length >= lock.quests;
    if (lock.streak) return Engine.bestStreak(state) >= lock.streak;
    return Engine.levelOf(state, lock.domain) >= lock.level;
  }
  function lockLabel(lock) {
    if (!lock) return '';
    if (lock.arc) { const a = ARCS.find(x => x.id === lock.arc); return a ? `Quête « ${a.title} »` : 'Quête'; }
    if (lock.xp) return `${U.fmtNum(lock.xp)} XP au total`;
    if (lock.quests) return `${lock.quests} tâches du jour`;
    if (lock.streak) return `Série de ${lock.streak} jours`;
    return `${lock.domain === 'char' ? 'Personnage' : GAME.domains[lock.domain].name} niv. ${lock.level}`;
  }
  /* Tous les objets à débloquer : { key, part, id, label, lock, rarity } */
  function lockedItems() {
    const out = [];
    for (const [part, def] of Object.entries(parts)) for (const [id, label, lock, r] of def.options) if (lock) out.push({ key: `${part}:${id}`, part, partLabel: def.label, id, label, lock, rarity: RARITY[r || 'c'] });
    for (const [id, label, lock, r] of extras) if (lock) out.push({ key: `extras:${id}`, part: 'extras', partLabel: 'Détail', id, label, lock, rarity: RARITY[r || 'c'] });
    for (const b of colors.bg) if (b.unlock) out.push({ key: `bg:${b.c}`, part: 'bg', partLabel: 'Fond', id: b.c, label: b.label, lock: b.unlock, rarity: RARITY[b.r || 'c'] });
    return out;
  }
  const unlockedKeys = state => lockedItems().filter(i => isUnlocked(state, i.lock)).map(i => i.key);
  const arcRewards = arcId => lockedItems().filter(i => i.lock.arc === arcId);
  /* Aperçu d'un objet seul, appliqué à un avatar */
  function preview(base, item, size = 120) {
    const cfg = { ...clean(base) };
    if (item.part === 'extras') cfg.extras = [...new Set([...(cfg.extras || []), item.id])];
    else cfg[item.part] = item.id;
    return svg(cfg, { size, crop: ['headwear', 'glasses', 'extras', 'beard'].includes(item.part) ? 'face' : null });
  }
  /* Remplace les objets verrouillés par la valeur par défaut */
  function sanitize(state, cfg) {
    const c = clean(cfg);
    const d = defaults();
    for (const p of Object.keys(parts)) if (!isUnlocked(state, lockOf(p, c[p]))) c[p] = d[p];
    if (!isUnlocked(state, lockOf('bg', c.bg))) c.bg = d.bg;
    c.extras = (c.extras || []).filter(e => isUnlocked(state, lockOf('extras', e)));
    return c;
  }

  return { svg, parts, extras, colors, RARITY, defaults, random, lockOf, rarityOf, isUnlocked, lockLabel, lockedItems, unlockedKeys, arcRewards, preview, sanitize, sanitizeForeign: clean };
})();
