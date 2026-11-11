/* Contenu du jeu : domaines, titres, missions, barèmes. Tout est modifiable ici. */
const GAME = {
  /* Ordre fixe = ordre des couleurs */
  domains: {
    pro:        { name: 'Métier',     icon: Icons.get('pro'), route: 'pro',   tagline: 'Compétences professionnelles' },
    sport:      { name: 'Corps',      icon: Icons.get('sport'), route: 'sport', tagline: 'Force, endurance, physique' },
    intel:      { name: 'Esprit',     icon: Icons.get('intel'), route: 'intel', tagline: 'Lecture, apprentissage' },
    discipline: { name: 'Discipline', icon: Icons.get('discipline'), route: 'home',  tagline: 'Passer à l\'action, chaque jour' },
  },
  domainOrder: ['pro', 'sport', 'intel', 'discipline'],

  /* Courbe : XP pour passer du niveau n à n+1 = base * n^exposant.
     Exposant 1.6 : niv. 1→2 = 100 XP, 5→6 ≈ 1 300, 10→11 ≈ 4 000, 20→21 ≈ 12 000 */
  levelBase: { domain: 100, char: 250 },
  levelExponent: 1.6,

  titles: {
    char:       [[1, 'Recrue'], [3, 'Aventurier'], [6, 'Combattant'], [10, 'Vétéran'], [15, 'Élite'], [20, 'Champion'], [30, 'Légende']],
    pro:        [[1, 'Stagiaire'], [3, 'Junior'], [6, 'Confirmé'], [10, 'Senior'], [15, 'Expert'], [20, 'Architecte']],
    sport:      [[1, 'Sédentaire'], [3, 'Éveillé'], [6, 'Athlète amateur'], [10, 'Athlète'], [15, 'Machine'], [20, 'Spartiate']],
    intel:      [[1, 'Curieux'], [3, 'Lecteur'], [6, 'Érudit'], [10, 'Sage'], [15, 'Polymathe'], [20, 'Oracle']],
    discipline: [[1, 'Rêveur'], [3, 'Initié'], [6, 'Constant'], [10, 'Inarrêtable'], [15, 'Moine'], [20, 'Stoïcien']],
  },

  /* Missions IRL débloquées par niveau de domaine. Une preuve écrite est demandée. */
  missions: [
    { id: 'sp-1', domain: 'sport', minLevel: 1, xp: 60,  text: 'Fais 3 séances de sport (30 min min.) cette semaine' },
    { id: 'sp-2', domain: 'sport', giver: 'brann', minLevel: 2, xp: 50,  text: 'Marche 10 000 pas en une journée' },
    { id: 'sp-3', domain: 'sport', giver: 'brann', minLevel: 3, xp: 120, text: 'Cours 5 km sans t\'arrêter' },
    { id: 'sp-8', domain: 'sport', minLevel: 4, xp: 120, text: 'Fais ta première traction stricte (ou 10 si tu en fais déjà)' },
    { id: 'sp-4', domain: 'sport', minLevel: 5, xp: 150, text: '100 pompes dans la journée (en autant de séries que nécessaire)' },
    { id: 'sp-5', domain: 'sport', minLevel: 7, xp: 150, text: 'Tiens 3 minutes de gainage d\'affilée' },
    { id: 'sp-6', domain: 'sport', giver: 'brann', minLevel: 10, xp: 300, text: 'Termine une course officielle de 10 km' },
    { id: 'sp-7', domain: 'sport', giver: 'brann', minLevel: 14, xp: 500, text: 'Termine un semi-marathon ou un trail de 20 km' },

    { id: 'in-1', domain: 'intel', minLevel: 1, xp: 30,  text: 'Lis 10 pages aujourd\'hui, sans téléphone à portée' },
    { id: 'in-2', domain: 'intel', minLevel: 2, xp: 60,  text: 'Explique à quelqu\'un un concept appris cette semaine' },
    { id: 'in-3', domain: 'intel', minLevel: 3, xp: 200, text: 'Termine un cours en ligne complet (MOOC, formation)' },
    { id: 'in-4', domain: 'intel', minLevel: 5, xp: 250, text: 'Lis 3 livres en un mois' },
    { id: 'in-5', domain: 'intel', minLevel: 7, xp: 200, text: 'Publie un article sur un sujet que tu maîtrises' },
    { id: 'in-6', domain: 'intel', minLevel: 10, xp: 400, text: 'Pratique une nouvelle langue 30 jours d\'affilée' },

    { id: 'di-1', domain: 'discipline', minLevel: 1, xp: 30,  text: 'Choisis la veille au soir tes 3 tâches du lendemain, et fais-les' },
    { id: 'di-2', domain: 'discipline', minLevel: 2, xp: 120, text: 'Lève-toi à la même heure 7 jours d\'affilée' },
    { id: 'di-3', domain: 'discipline', minLevel: 4, xp: 80,  text: 'Passe une journée entière sans réseaux sociaux' },
    { id: 'di-4', domain: 'discipline', minLevel: 6, xp: 150, text: 'Douche froide 7 jours de suite' },
    { id: 'di-5', domain: 'discipline', minLevel: 8, xp: 250, text: 'Une semaine sans sucre ajouté' },
    { id: 'di-6', domain: 'discipline', minLevel: 12, xp: 400, text: 'Atteins une série de 30 jours de tâches' },

    { id: 'pr-0', domain: 'pro', minLevel: 2, xp: 80,  text: 'Mets à jour ton CV et ton profil LinkedIn avec tes dernières compétences' },
    { id: 'pr-00', domain: 'pro', minLevel: 5, xp: 150, text: 'Présente un sujet technique à ton équipe ou en meetup' },
  ],

  /* Quêtes préfaites, faisables dans la journée. diff : 1 facile, 2 moyenne, 3 difficile */
  questDifficulty: { 1: { label: 'Facile', xp: 10 }, 2: { label: 'Moyenne', xp: 20 }, 3: { label: 'Difficile', xp: 35 } },
  questLibrary: [
    { domain: 'pro', diff: 1, text: 'Lis 15 min de documentation officielle' },
    { domain: 'pro', diff: 1, text: 'Note 3 choses apprises au travail aujourd\'hui' },
    { domain: 'pro', diff: 1, text: 'Range ton bureau numérique pendant 10 min' },
    { domain: 'pro', diff: 1, text: 'Relance un contact professionnel' },
    { domain: 'pro', diff: 2, text: 'Passe un test de compétence' },
    { domain: 'pro', diff: 2, text: '30 min sur un lab pratique' },
    { domain: 'pro', diff: 2, text: 'Avance 45 min sur ton projet perso' },
    { domain: 'pro', diff: 2, text: 'Regarde une conférence technique en prenant des notes' },
    { domain: 'pro', diff: 3, text: 'Termine une fonctionnalité de ton projet perso' },
    { domain: 'pro', diff: 3, text: 'Rédige un article de veille d\'une page' },
    { domain: 'pro', diff: 3, text: '2 h de préparation à une certification' },

    { domain: 'sport', diff: 1, text: '20 pompes maintenant' },
    { domain: 'sport', diff: 1, text: '10 min d\'étirements' },
    { domain: 'sport', diff: 1, text: '15 min de marche rapide' },
    { domain: 'sport', diff: 1, text: 'Prends les escaliers toute la journée' },
    { domain: 'sport', diff: 2, text: 'Séance de sport de 30 min' },
    { domain: 'sport', diff: 2, text: 'Footing de 3 km' },
    { domain: 'sport', diff: 2, text: '5 séries de tractions max' },
    { domain: 'sport', diff: 2, text: '100 squats dans la journée' },
    { domain: 'sport', diff: 3, text: 'Séance de sport de 1 h' },
    { domain: 'sport', diff: 3, text: 'Course de 8 km' },
    { domain: 'sport', diff: 3, text: 'Séance jambes complète' },

    { domain: 'intel', diff: 1, text: 'Lis 10 pages' },
    { domain: 'intel', diff: 1, text: '15 min de langue étrangère' },
    { domain: 'intel', diff: 1, text: 'Résume un article en 5 lignes' },
    { domain: 'intel', diff: 2, text: 'Lis 30 pages' },
    { domain: 'intel', diff: 2, text: 'Suis un cours de 30 min' },
    { domain: 'intel', diff: 2, text: 'Fais une fiche de synthèse d\'un chapitre' },
    { domain: 'intel', diff: 3, text: 'Lis 60 pages' },
    { domain: 'intel', diff: 3, text: 'Explique par écrit un sujet complexe (1 page)' },

    { domain: 'discipline', diff: 1, text: 'Fais ton lit dès le lever' },
    { domain: 'discipline', diff: 1, text: 'Bois 2 L d\'eau' },
    { domain: 'discipline', diff: 1, text: 'Range ton espace 5 min' },
    { domain: 'discipline', diff: 1, text: 'Pas de téléphone la 1re heure' },
    { domain: 'discipline', diff: 2, text: 'Couché avant 23 h' },
    { domain: 'discipline', diff: 2, text: 'Aucun sucre ajouté aujourd\'hui' },
    { domain: 'discipline', diff: 2, text: '2 h sans notifications pendant le travail' },
    { domain: 'discipline', diff: 2, text: 'Prépare tes repas du lendemain' },
    { domain: 'discipline', diff: 3, text: 'Journée entière sans réseaux sociaux' },
    { domain: 'discipline', diff: 3, text: 'Réveil à 6 h et sport avant 8 h' },
    { domain: 'discipline', diff: 3, text: 'Douche froide de 2 min' },
  ],
  maxQuestsPerDay: 3,
  customQuestXp: 15,
  bossUnlockCharLevel: 3,

  xp: {
    questDiscipline: 5, perfectDay: 20,
    testFirst: 30, testDaily: 15, prMin: 10, prMax: 120, rankUp: 100,
    workoutPerMin: 1, workoutMax: 60, weekGoal: 50, weekGoalDiscipline: 20,
    runPerKm: 8, runMin: 10, runMax: 150, runRecord: 50,
    checkin: 60, checkinBonusMax: 60,
    quizFail: 10, quizTier: [0, 120, 250, 450, 700, 1000],
    book: 150, sessionPerMin: 1, sessionMax: 90,
    boss: 150, bossDiscipline: 30,
  },

  /* Exercices de test. Rangs : seuils absolus. lowerBetter : une valeur plus basse est meilleure (rythme).
     input 'time' : saisie mm:ss convertie en secondes. */
  exercises: {
    pullups: { name: 'Tractions', icon: '', unit: 'rép.', max: 200, rule: 'Prise pronation, bras tendus en bas, menton au-dessus de la barre en haut, sans élan.',
      ranks: [[0, '—'], [1, 'E'], [5, 'D'], [10, 'C'], [15, 'B'], [20, 'A'], [25, 'S'], [35, 'SS']] },
    cooper:  { name: 'Course : distance en 12 min', icon: '', unit: 'm', max: 6000, rule: 'Test de Cooper : cours le plus loin possible en 12 minutes, sur terrain plat. Note la distance en mètres.',
      ranks: [[0, '—'], [1600, 'E'], [2000, 'D'], [2300, 'C'], [2600, 'B'], [2900, 'A'], [3200, 'S'], [3500, 'SS']] },
    pace5k:  { name: 'Course : rythme sur 5 km', icon: '', unit: '/km', max: 1200, lowerBetter: true, input: 'time5k', rule: 'Cours 5 km le plus vite possible. Saisis ton temps total (mm:ss), le rythme au km est calculé.',
      ranks: [[Infinity, '—'], [450, 'E'], [390, 'D'], [345, 'C'], [310, 'B'], [280, 'A'], [255, 'S'], [230, 'SS']] },
    pushups: { name: 'Pompes', icon: '', unit: 'rép.', max: 1000, rule: 'Amplitude complète, poitrine à un poing du sol, pas de pause de plus de 2 s.',
      ranks: [[0, '—'], [10, 'E'], [20, 'D'], [35, 'C'], [50, 'B'], [70, 'A'], [90, 'S'], [120, 'SS']] },
    squats:  { name: 'Squats', icon: '', unit: 'rép.', max: 2000, rule: 'Cuisses au moins parallèles au sol, talons au sol, sans pause.',
      ranks: [[0, '—'], [20, 'E'], [40, 'D'], [60, 'C'], [85, 'B'], [110, 'A'], [150, 'S'], [200, 'SS']] },
    squatsKg:{ name: 'Squat (charge max)', icon: '', unit: 'kg', max: 400, rule: 'Une répétition propre, cuisses parallèles. Avec pareur.',
      ranks: [[0, '—'], [40, 'E'], [60, 'D'], [85, 'C'], [110, 'B'], [140, 'A'], [170, 'S'], [200, 'SS']] },
    plank:   { name: 'Gainage', icon: '', unit: 's', max: 7200, input: 'time', rule: 'Planche sur avant-bras, corps aligné. Le test s\'arrête dès que les hanches tombent.',
      ranks: [[0, '—'], [30, 'E'], [60, 'D'], [120, 'C'], [240, 'B'], [420, 'A'], [600, 'S'], [900, 'SS']] },
  },

  /* Séances & régularité */
  workoutTypes: {
    strength: { label: 'Musculation', icon: '' },
    bodyweight: { label: 'Poids du corps', icon: '' },
    cardio: { label: 'Cardio / HIIT', icon: '' },
    teamsport: { label: 'Sport collectif / combat', icon: '' },
    mobility: { label: 'Mobilité / yoga', icon: '' },
    other: { label: 'Autre', icon: '' },
  },
  runTypes: { easy: 'Footing', interval: 'Fractionné', long: 'Sortie longue', race: 'Course officielle', trail: 'Trail' },

  /* Check-in physique hebdo : auto-évaluation guidée, photo de la semaine précédente à côté */
  checkinCriteria: [
    { id: 'compo',   label: 'Composition visuelle', hint: '1 = beaucoup de gras visible, 10 = très sec' },
    { id: 'muscle',  label: 'Définition musculaire', hint: 'Abdos, épaules, bras : est-ce que ça se dessine ?' },
    { id: 'posture', label: 'Posture', hint: 'Épaules ouvertes, dos droit, tête alignée' },
    { id: 'energy',  label: 'Énergie & forme', hint: 'Ressenti physique global cette semaine' },
    { id: 'hygiene', label: 'Hygiène de la semaine', hint: 'Sommeil, alimentation, hydratation' },
  ],

  achievementTypes: {
    certif:   { label: 'Certification obtenue', xp: 400 },
    job:      { label: 'Promotion / nouveau poste', xp: 500 },
    project:  { label: 'Projet livré', xp: 200 },
    training: { label: 'Formation terminée', xp: 150 },
    talk:     { label: 'Présentation / article publié', xp: 120 },
    watch:    { label: 'Veille / apprentissage notable', xp: 40 },
  },

  sessionTypes: {
    reading: 'Lecture', course: 'Cours / formation', podcast: 'Podcast / conférence éducative', practice: 'Pratique (langue, instrument…)',
  },

  rewardIdeas: [
    { domain: 'sport', level: 3, text: 'Une nouvelle tenue de sport' },
    { domain: 'sport', level: 6, text: 'Une paire de chaussures de running de qualité' },
    { domain: 'pro', level: 3, text: 'Un livre technique que je repousse depuis longtemps' },
    { domain: 'pro', level: 6, text: 'M\'inscrire à une certification (je la paie moi-même)' },
    { domain: 'intel', level: 3, text: 'Une soirée au cinéma ou au théâtre' },
    { domain: 'discipline', level: 5, text: 'Un bon restaurant' },
    { domain: 'char', level: 10, text: 'Un week-end découverte' },
  ],

  proDomains: {
    it: { name: 'Informatique', hasQuiz: true },
    other: { name: 'Autre domaine', hasQuiz: false },
  },
};
