/* PNJ et grandes quêtes (arcs) sur plusieurs niveaux et plusieurs domaines.
   Les compteurs (séances, km, livres…) ne prennent en compte que ce qui est fait
   APRÈS l'acceptation de la quête : impossible de la valider avec le passé.

   Types d'étapes :
     level {domain, value}           niveau de domaine (ou 'char') atteint
     sessions {count}                séances enregistrées
     runKm {value}                   kilomètres courus
     runs {count}                    sorties de course
     books {count}                   livres terminés
     learnMin {value}                minutes d'apprentissage
     quizTiers {count}               paliers de tests validés
     missions {count, domain?}       missions IRL accomplies
     quests {count}                  quêtes du jour accomplies
     checkins {count}                check-ins photo
     bosses {count}                  boss de la semaine vaincus
     streak {value}                  série de jours (valeur actuelle)
     weekGoals {count}               semaines où l'objectif de séances est atteint
     rank {exo, letter}              rang minimum sur un test physique
     baseline {}                     tests de référence faits (pompes, squats, tractions, gainage)
     contents {count} / themes {count} contenus validés de la bibliothèque, thèmes différents
     ratings {count} / propose {count} contenus notés, contenus proposés
     bossWins {count}                boss de la semaine vaincus
     manual {}                       étape libre, validée d'un clic */
const NPCS = {
  kael:     { name: 'Maître Kael', role: 'Forgeron des corps', icon: '🔨', domain: 'sport',
    look: { face: 'square', skin: '#d39a6a', hair: 'bald', hairColor: '#a2462a', eyes: 'determined', eyeColor: '#5a3a22', brows: 'thick', mouth: 'grin', beard: 'viking', outfit: 'apron', outfitColor: '#5a4a42', bg: '#d4704c', extras: ['scar', 'sweat'] },
    greet: ['Hé, toi ! Oui, toi. Tes bras tremblent rien qu\'à me regarder.', 'Le fer se travaille à chaud. Et toi, tu chauffes quand ?'] },
  lyra:     { name: 'Lyra', role: 'Archiviste de la Grande Bibliothèque', icon: '📜', domain: 'intel',
    look: { face: 'oval', skin: '#fde3c8', hair: 'long', hairColor: '#a2462a', eyes: 'normal', eyeColor: '#2f8a5a', brows: 'raised', mouth: 'smile', glasses: 'round', outfit: 'scholar', outfitColor: '#7b4fc9', bg: '#3b2a63', extras: ['freckles', 'blush'] },
    greet: ['Chut… Tu entends ? Ce sont des livres qui attendent d\'être lus.', 'Un esprit qui n\'apprend plus commence à rouiller. Assieds-toi.'] },
  orin:     { name: 'Orin', role: 'Ingénieur des machines', icon: '⚙️', domain: 'pro',
    look: { face: 'chubby', skin: '#8d5a36', hair: 'curly', hairColor: '#ece0c4', eyes: 'big', brows: 'raised', mouth: 'open', beard: 'mustache', glasses: 'square', headwear: 'goggles', headwearColor: '#0bc5d2', outfit: 'varsity', outfitColor: '#003440', bg: '#16213e', pose: 'hands', extras: ['sweat'] },
    greet: ['Tes compétences tournent à vide. Laisse-moi régler ça.', 'Un bon artisan se reconnaît à ce qu\'il a construit, pas à ce qu\'il a prévu.'] },
  mira:     { name: 'Sœur Mira', role: 'Gardienne du Temple de l\'Aube', icon: '🕯️', domain: 'discipline',
    look: { face: 'oval', skin: '#f6c9a0', hair: 'long', hairColor: '#2b2220', eyes: 'sleepy', eyeColor: '#6b7a86', brows: 'normal', mouth: 'smile', headwear: 'hood', headwearColor: '#efe3d0', outfit: 'robe', outfitColor: '#efe3d0', bg: '#b8862f', extras: ['blush'] },
    greet: ['La motivation est une flamme. La discipline, c\'est la lanterne.', 'Tu reviens ? Bien. Revenir chaque jour, c\'est déjà la moitié du chemin.'] },
  brann:    { name: 'Capitaine Brann', role: 'Éclaireur de la Garde', icon: '🛡️', domain: 'sport',
    look: { face: 'square', skin: '#eab48a', hair: 'short', hairColor: '#4a2e1c', eyes: 'determined', eyeColor: '#2f6db5', brows: 'angry', mouth: 'neutral', beard: 'short', headwear: 'helmet', outfit: 'armor', bg: '#450c07', extras: ['scar'] },
    greet: ['Soldat ! Les routes ne se parcourent pas en les regardant sur une carte.', 'Mes éclaireurs courent avant l\'aube. Tu en es ?'] },
  voyageur: { name: 'Le Voyageur', role: 'Personne ne connaît son nom', icon: '🧭', domain: null,
    look: { face: 'oval', skin: '#b57a4e', hair: 'short', hairColor: '#9a9a9a', eyes: 'sleepy', eyeColor: '#c08a2e', brows: 'normal', mouth: 'smirk', beard: 'stubble', headwear: 'hat', headwearColor: '#3d2a1e', outfit: 'robe', outfitColor: '#1d3b44', bg: '#003440', extras: [] },
    greet: ['…Je t\'observe depuis un moment. Tu avances, mais sur un seul pied.', 'Chaque chemin mène quelque part. Les quatre ensemble mènent à toi.'] },
  elira:    { name: 'Dame Elira', role: 'Guérisseuse du Sanctuaire', icon: '🌿', domain: 'sport',
    look: { face: 'round', skin: '#f6c9a0', hair: 'bun', hairColor: '#ece0c4', eyes: 'happy', eyeColor: '#2f8a5a', brows: 'normal', mouth: 'smile', outfit: 'robe', outfitColor: '#2f8a5a', bg: 'forest', extras: ['blush', 'flower'] },
    greet: ['Doucement, guerrier. Un corps qu\'on n\'écoute pas finit par crier.', 'Tu forces, tu forces… et quand est-ce que tu récupères ?'] },
  tobias:   { name: 'Tobias', role: 'Marchand des Quatre Routes', icon: '💰', domain: 'pro',
    look: { face: 'chubby', skin: '#d39a6a', hair: 'sidepart', hairColor: '#2b2220', eyes: 'wink', eyeColor: '#5a3a22', brows: 'raised', mouth: 'grin', beard: 'mustache', outfit: 'suit', outfitColor: '#450c07', bg: '#b8862f', extras: ['necklace'] },
    greet: ['Approche, approche ! Je n\'achète que ce qui se prouve.', 'Un savoir-faire sans preuve ne vaut pas une pièce de cuivre.'] },
  maelle:   { name: 'Maëlle', role: 'Barde des Mille Récits', icon: '🎶', domain: 'intel',
    look: { face: 'oval', skin: '#eab48a', hair: 'ponytail', hairColor: '#e86aa6', eyes: 'big', eyeColor: '#2f6db5', brows: 'raised', mouth: 'laugh', outfit: 'varsity', outfitColor: '#7b4fc9', bg: 'sunset', extras: ['freckles', 'stars'] },
    greet: ['Ah, un nouveau visage ! Dis-moi, quelle est la dernière chose qui t\'a émerveillé ?', 'Une idée qu\'on ne raconte pas est une chanson qu\'on ne chante pas.'] },
  nox:      { name: 'Nox', role: 'Ton ombre', icon: '🌑', domain: 'discipline',
    look: { face: 'square', skin: '#6a4128', hair: 'spiky', hairColor: '#2b2220', eyes: 'determined', eyeColor: '#1b1b2f', brows: 'angry', mouth: 'smirk', beard: 'stubble', headwear: 'hood', headwearColor: '#1f1f1f', outfit: 'hoodie', outfitColor: '#1f1f1f', bg: '#16213e', extras: ['eyepatch'] },
    greet: ['Je suis ce que tu deviens quand tu abandonnes. Prouve-moi que j\'ai tort.', 'Chaque jour que tu sautes, je grandis. Tu le sens, non ?'] },
};

const ARCS = [
  {
    id: 'kael-1', npc: 'kael', minChar: 1, title: 'L\'éveil du corps',
    intro: 'Avant de forger une lame, je mesure le métal. Montre-moi de quoi tu es fait, puis reviens me voir quand ton corps aura commencé à changer.',
    outro: 'Je l\'entends dans ta respiration : le métal commence à prendre forme. Garde ce marteau, tu en auras besoin.',
    steps: [
      { type: 'baseline', text: 'Fais tes tests de référence : pompes, squats, tractions, gainage' },
      { type: 'sessions', count: 3, text: 'Enregistre 3 séances de sport' },
      { type: 'level', domain: 'sport', value: 3, text: 'Atteins Corps niveau 3' },
    ],
    reward: { xp: { sport: 200, discipline: 50 }, title: 'Apprenti de Kael' },
  },
  {
    id: 'lyra-1', npc: 'lyra', minChar: 1, title: 'La bibliothèque oubliée',
    intro: 'Des milliers de pages, et personne pour les ouvrir. Prouve-moi que tu sais encore apprendre, et je t\'ouvrirai la réserve.',
    outro: 'Tu as l\'œil de ceux qui comprennent ce qu\'ils lisent. Voici la clé de la réserve.',
    steps: [
      { type: 'learnMin', value: 120, text: 'Cumule 2 h de lecture ou de vidéos validées' },
      { type: 'books', count: 1, text: 'Valide un livre de la bibliothèque' },
      { type: 'level', domain: 'intel', value: 3, text: 'Atteins Esprit niveau 3' },
    ],
    reward: { xp: { intel: 250, pro: 50 }, title: 'Lecteur de la Réserve' },
  },
  {
    id: 'orin-1', npc: 'orin', minChar: 1, title: 'Le premier circuit',
    intro: 'Les plans, tout le monde en a. Moi je veux voir ce qui fonctionne. Valide tes bases, puis mets les mains dans le cambouis.',
    outro: 'Ça tourne ! Pas parfait, mais ça tourne. C\'est comme ça que commencent tous les ingénieurs.',
    steps: [
      { type: 'quizTiers', count: 1, text: 'Valide un palier de test Métier' },
      { type: 'missions', count: 1, domain: 'pro', text: 'Accomplis une mission pratique Métier' },
      { type: 'level', domain: 'pro', value: 3, text: 'Atteins Métier niveau 3' },
    ],
    reward: { xp: { pro: 250, intel: 50 }, title: 'Mécanicien d\'Orin' },
  },
  {
    id: 'mira-1', npc: 'mira', minChar: 1, title: 'Le serment de l\'aube',
    intro: 'Allume une bougie chaque jour. Une seule. Ne la laisse jamais s\'éteindre trois jours de suite.',
    outro: 'La flamme a tenu. Tu as compris le secret : ce n\'est pas l\'intensité, c\'est la répétition.',
    steps: [
      { type: 'streak', value: 3, text: 'Tiens une série de 3 jours de tâches' },
      { type: 'quests', count: 10, text: 'Accomplis 10 tâches du jour' },
      { type: 'level', domain: 'discipline', value: 3, text: 'Atteins Discipline niveau 3' },
    ],
    reward: { xp: { discipline: 250 }, title: 'Porteur de la Flamme' },
  },
  {
    id: 'brann-1', npc: 'brann', minChar: 2, title: 'La route des 50 km',
    intro: 'Un message doit traverser la vallée. 50 kilomètres. Pas d\'un coup : je ne suis pas un monstre. Mais tu les feras.',
    outro: '50 kilomètres. Le message est arrivé. Bienvenue chez les éclaireurs.',
    steps: [
      { type: 'runKm', value: 10, text: 'Cours 10 km au total' },
      { type: 'runKm', value: 25, text: 'Cours 25 km au total' },
      { type: 'runKm', value: 50, text: 'Cours 50 km au total' },
      { type: 'rank', exo: 'run', letter: 'C', text: 'Obtiens le rang C au test de course' },
    ],
    reward: { xp: { sport: 400, discipline: 100 }, title: 'Éclaireur de la Garde' },
  },
  {
    id: 'voyageur-1', npc: 'voyageur', minChar: 3, title: 'Les quatre chemins',
    intro: 'Le corps, l\'esprit, le métier, la volonté. Les gens choisissent un chemin et oublient les autres. Avance sur les quatre.',
    outro: '…Te voilà enfin équilibré. Je reviendrai. Quand tu seras prêt pour la suite.',
    steps: [
      { type: 'level', domain: 'sport', value: 4, text: 'Corps niveau 4' },
      { type: 'level', domain: 'intel', value: 4, text: 'Esprit niveau 4' },
      { type: 'level', domain: 'pro', value: 4, text: 'Métier niveau 4' },
      { type: 'level', domain: 'discipline', value: 4, text: 'Discipline niveau 4' },
    ],
    reward: { xp: { sport: 150, intel: 150, pro: 150, discipline: 150 }, title: 'Marcheur des Quatre Chemins' },
  },
  {
    id: 'kael-2', npc: 'kael', minChar: 4, after: 'kael-1', title: 'La forge',
    intro: 'Le métal est chaud, maintenant on frappe. Fort, et souvent.',
    outro: 'Regarde-toi. Tu n\'es plus de l\'acier brut, tu es une lame.',
    steps: [
      { type: 'rank', exo: 'pushups', letter: 'B', text: 'Rang B en pompes' },
      { type: 'rank', exo: 'pullups', letter: 'C', text: 'Rang C en tractions' },
      { type: 'weekGoals', count: 4, text: 'Atteins ton objectif hebdomadaire de séances 4 semaines' },
      { type: 'level', domain: 'sport', value: 6, text: 'Atteins Corps niveau 6' },
    ],
    reward: { xp: { sport: 500, discipline: 100 }, title: 'Lame de la Forge' },
  },
  {
    id: 'lyra-2', npc: 'lyra', minChar: 4, after: 'lyra-1', title: 'Le savoir partagé',
    intro: 'Un savoir qu\'on garde pour soi finit par moisir. Lis, puis transmets.',
    outro: 'Tu ne lis plus seulement : tu transmets. Ma bibliothèque n\'a plus de portes fermées pour toi.',
    steps: [
      { type: 'books', count: 3, text: 'Valide 3 livres de la bibliothèque' },
      { type: 'manual', text: 'Explique à quelqu\'un, en vrai, un concept appris dans ces livres' },
      { type: 'level', domain: 'intel', value: 6, text: 'Atteins Esprit niveau 6' },
    ],
    reward: { xp: { intel: 500, pro: 100 }, title: 'Gardien des Archives' },
  },
  {
    id: 'orin-2', npc: 'orin', minChar: 5, after: 'orin-1', title: 'L\'architecte',
    intro: 'Tu sais réparer. Maintenant, construis quelque chose qui n\'existait pas.',
    outro: 'Ça, c\'est une œuvre. Signe-la, elle est à toi.',
    steps: [
      { type: 'quizTiers', count: 4, text: 'Valide 4 paliers de test' },
      { type: 'missions', count: 2, domain: 'pro', text: 'Accomplis 2 missions pratiques Métier' },
      { type: 'manual', text: 'Construis et documente un projet perso de bout en bout' },
      { type: 'level', domain: 'pro', value: 6, text: 'Atteins Métier niveau 6' },
    ],
    reward: { xp: { pro: 600, intel: 100 }, title: 'Architecte d\'Orin' },
  },
  {
    id: 'mira-2', npc: 'mira', minChar: 5, after: 'mira-1', title: 'Le moine',
    intro: 'Quatorze aubes. Quatorze bougies. Et chaque dimanche, un démon à affronter.',
    outro: 'Le temple est silencieux, et toi aussi. C\'est cela, la paix.',
    steps: [
      { type: 'streak', value: 14, text: 'Tiens une série de 14 jours' },
      { type: 'checkins', count: 4, text: 'Fais 4 check-ins photo' },
      { type: 'bosses', count: 3, text: 'Vaincs 3 boss de la semaine' },
      { type: 'level', domain: 'discipline', value: 6, text: 'Atteins Discipline niveau 6' },
    ],
    reward: { xp: { discipline: 600, sport: 100 }, title: 'Moine de l\'Aube' },
  },
  {
    id: 'brann-2', npc: 'brann', minChar: 6, after: 'brann-1', title: 'L\'expédition',
    intro: 'Une vraie expédition. Une vraie course, avec un dossard. Prépare-toi.',
    outro: 'Tu as franchi la ligne. Tu n\'es plus un éclaireur, tu es un guide.',
    steps: [
      { type: 'runs', count: 12, text: 'Fais 12 sorties de course' },
      { type: 'runKm', value: 100, text: 'Cours 100 km au total' },
      { type: 'manual', text: 'Termine une course officielle (10 km ou plus)' },
    ],
    reward: { xp: { sport: 700, discipline: 150 }, title: 'Guide de la Garde' },
  },
  {
    id: 'voyageur-2', npc: 'voyageur', minChar: 8, after: 'voyageur-1', title: 'L\'équilibre',
    intro: 'Tu as marché sur les quatre chemins. Il est temps de voir jusqu\'où ils montent.',
    outro: 'Tu sais maintenant qui je suis, n\'est-ce pas ? Je suis celui que tu deviens.',
    steps: [
      { type: 'level', domain: 'sport', value: 8, text: 'Corps niveau 8' },
      { type: 'level', domain: 'intel', value: 8, text: 'Esprit niveau 8' },
      { type: 'level', domain: 'pro', value: 8, text: 'Métier niveau 8' },
      { type: 'level', domain: 'discipline', value: 8, text: 'Discipline niveau 8' },
      { type: 'manual', text: 'Écris une lettre à toi-même, à ouvrir dans un an' },
    ],
    reward: { xp: { sport: 400, intel: 400, pro: 400, discipline: 400 }, title: 'Celui qui devient' },
  },
  {
    id: 'elira-1', npc: 'elira', minChar: 2, title: 'Le repos du guerrier',
    intro: 'La force ne vient pas de l\'effort seul, mais de l\'effort suivi du repos. Montre-moi que tu sais tenir un rythme, pas seulement un sprint.',
    outro: 'Voilà. Régulier comme une marée. Ton corps te remerciera longtemps.',
    steps: [
      { type: 'weekGoals', count: 2, text: 'Atteins ton objectif de séances 2 semaines' },
      { type: 'checkins', count: 2, text: 'Fais 2 check-ins physiques' },
      { type: 'manual', text: 'Dors au moins 7 h pendant 5 nuits de suite' },
    ],
    reward: { xp: { sport: 250, discipline: 100 }, title: 'Protégé d\'Elira' },
  },
  {
    id: 'tobias-1', npc: 'tobias', minChar: 2, title: 'Le prix du savoir-faire',
    intro: 'J\'ai un client qui paie cher les gens compétents. Mais il veut des preuves, pas des promesses. Tu en as ?',
    outro: 'Marché conclu ! Tu vaux plus cher qu\'hier, et ça se voit.',
    steps: [
      { type: 'quizTiers', count: 2, text: 'Valide 2 paliers de test Métier' },
      { type: 'missions', count: 1, domain: 'pro', text: 'Accomplis un contrat Métier' },
      { type: 'contents', count: 2, text: 'Valide 2 contenus de la bibliothèque' },
    ],
    reward: { xp: { pro: 300, intel: 100 }, title: 'Associé de Tobias' },
  },
  {
    id: 'maelle-1', npc: 'maelle', minChar: 1, title: 'Le chant des trois savoirs',
    intro: 'Je compose une ballade sur trois idées qui changent une vie. Il me manque… les trois idées. Va les chercher pour moi.',
    outro: 'Quelle matière ! J\'en ferai trois couplets, et ton nom sera dans le refrain.',
    steps: [
      { type: 'contents', count: 3, text: 'Valide 3 contenus de la bibliothèque' },
      { type: 'themes', count: 3, text: 'Explore 3 thèmes différents' },
      { type: 'ratings', count: 3, text: 'Note 3 contenus que tu as validés' },
    ],
    reward: { xp: { intel: 300 }, title: 'Muse de Maëlle' },
  },
  {
    id: 'maelle-2', npc: 'maelle', minChar: 4, after: 'maelle-1', title: 'La voix du royaume',
    intro: 'Tu as écouté les récits des autres. Il est temps d\'ajouter le tien à la bibliothèque.',
    outro: 'On racontera ce que tu as partagé bien après nous. C\'est ça, une œuvre.',
    steps: [
      { type: 'contents', count: 8, text: 'Valide 8 contenus de la bibliothèque' },
      { type: 'propose', count: 1, text: 'Propose un contenu avec son résumé et son test' },
      { type: 'level', domain: 'intel', value: 5, text: 'Atteins Esprit niveau 5' },
    ],
    reward: { xp: { intel: 500, discipline: 100 }, title: 'Voix du Royaume' },
  },
  {
    id: 'nox-1', npc: 'nox', minChar: 2, title: 'L\'ombre qui te suit',
    intro: 'Un boss rôde chaque semaine. Tu peux le fuir, et je te remplace. Ou tu peux le vaincre.',
    outro: 'Tch. Tu tiens debout. Je recule d\'un pas… mais je ne pars pas.',
    steps: [
      { type: 'bossWins', count: 1, text: 'Vaincs un boss de la semaine' },
      { type: 'streak', value: 5, text: 'Tiens une série de 5 jours' },
      { type: 'quests', count: 15, text: 'Accomplis 15 tâches' },
    ],
    reward: { xp: { discipline: 300 }, title: 'Chasseur d\'ombre' },
  },
  {
    id: 'nox-2', npc: 'nox', minChar: 5, after: 'nox-1', title: 'Face à face',
    intro: 'Quatre boss. Trois semaines sans faillir. Si tu y arrives, je n\'aurai plus rien à te dire.',
    outro: '…Je n\'ai plus de prise sur toi. Garde mon manteau : désormais, c\'est toi l\'ombre que les autres craignent.',
    steps: [
      { type: 'bossWins', count: 4, text: 'Vaincs 4 boss de la semaine' },
      { type: 'streak', value: 21, text: 'Tiens une série de 21 jours' },
    ],
    reward: { xp: { discipline: 700, sport: 100, pro: 100, intel: 100 }, title: 'Sans Ombre' },
  },
];

const NPC_RULES = {
  maxPerDay: 2,
  minGapHours: 3,
  chanceOnOpen: 0.7,
  chanceAfterAction: 0.3,
  declineCooldownDays: 2,
  maxActive: 3,
};
