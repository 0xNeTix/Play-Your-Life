/* Contenu du jeu : domaines, titres, missions, barèmes. Tout est modifiable ici. */
const GAME = {
  /* Ordre fixe = ordre des couleurs */
  domains: {
    pro:        { name: 'Métier',     icon: '💼', route: 'pro',   tagline: 'Compétences professionnelles' },
    sport:      { name: 'Corps',      icon: '💪', route: 'sport', tagline: 'Force, endurance, physique' },
    intel:      { name: 'Esprit',     icon: '🧠', route: 'intel', tagline: 'Lecture, apprentissage' },
    discipline: { name: 'Discipline', icon: '⚡', route: 'home',  tagline: 'Passer à l\'action, chaque jour' },
  },
  domainOrder: ['pro', 'sport', 'intel', 'discipline'],

  /* Courbe : XP pour passer du niveau n à n+1 = base * n^1.3 */
  levelBase: { domain: 100, char: 250 },

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
    { id: 'sp-2', domain: 'sport', minLevel: 2, xp: 50,  text: 'Marche 10 000 pas en une journée' },
    { id: 'sp-3', domain: 'sport', minLevel: 3, xp: 120, text: 'Cours 5 km sans t\'arrêter' },
    { id: 'sp-4', domain: 'sport', minLevel: 5, xp: 150, text: '100 pompes dans la journée (en autant de séries que nécessaire)' },
    { id: 'sp-5', domain: 'sport', minLevel: 7, xp: 150, text: 'Tiens 3 minutes de gainage d\'affilée' },
    { id: 'sp-6', domain: 'sport', minLevel: 10, xp: 300, text: 'Termine une course officielle de 10 km' },
    { id: 'sp-7', domain: 'sport', minLevel: 14, xp: 500, text: 'Termine un semi-marathon ou un trail de 20 km' },

    { id: 'in-1', domain: 'intel', minLevel: 1, xp: 30,  text: 'Lis 10 pages aujourd\'hui, sans téléphone à portée' },
    { id: 'in-2', domain: 'intel', minLevel: 2, xp: 60,  text: 'Explique à quelqu\'un un concept appris cette semaine' },
    { id: 'in-3', domain: 'intel', minLevel: 3, xp: 200, text: 'Termine un cours en ligne complet (MOOC, formation)' },
    { id: 'in-4', domain: 'intel', minLevel: 5, xp: 250, text: 'Lis 3 livres en un mois' },
    { id: 'in-5', domain: 'intel', minLevel: 7, xp: 200, text: 'Publie un article sur un sujet que tu maîtrises' },
    { id: 'in-6', domain: 'intel', minLevel: 10, xp: 400, text: 'Pratique une nouvelle langue 30 jours d\'affilée' },

    { id: 'di-1', domain: 'discipline', minLevel: 1, xp: 30,  text: 'Choisis la veille au soir tes 3 quêtes du lendemain, et fais-les' },
    { id: 'di-2', domain: 'discipline', minLevel: 2, xp: 120, text: 'Lève-toi à la même heure 7 jours d\'affilée' },
    { id: 'di-3', domain: 'discipline', minLevel: 4, xp: 80,  text: 'Passe une journée entière sans réseaux sociaux' },
    { id: 'di-4', domain: 'discipline', minLevel: 6, xp: 150, text: 'Douche froide 7 jours de suite' },
    { id: 'di-5', domain: 'discipline', minLevel: 8, xp: 250, text: 'Une semaine sans sucre ajouté' },
    { id: 'di-6', domain: 'discipline', minLevel: 12, xp: 400, text: 'Atteins une série de 30 jours de quêtes' },

    { id: 'pr-0', domain: 'pro', minLevel: 2, xp: 80,  text: 'Mets à jour ton CV et ton profil LinkedIn avec tes dernières compétences' },
    { id: 'pr-00', domain: 'pro', minLevel: 5, xp: 150, text: 'Présente un sujet technique à ton équipe ou en meetup' },
  ],

  /* Quêtes suggérées : courtes, faisables aujourd'hui */
  questIdeas: {
    pro: ['Fais un test de compétence', '30 min sur un lab pratique', 'Lis 15 min de doc officielle', 'Avance 25 min sur ton projet perso', 'Note une chose apprise au travail'],
    sport: ['20 pompes maintenant', 'Séance de 30 min', '15 min de marche rapide', '3 séries de gainage', '10 min d\'étirements'],
    intel: ['Lis 10 pages', 'Regarde un cours de 20 min', 'Résume un article en 5 lignes', '15 min de langue étrangère'],
    discipline: ['Range ton bureau 5 min', 'Pas de téléphone la 1re heure', 'Couché avant 23 h', 'Bois 2 L d\'eau', 'Coupe les notifications 2 h'],
  },
  maxQuestsPerDay: 3,
  bossUnlockCharLevel: 3,

  xp: {
    quest: 15, questDiscipline: 5, perfectDay: 20,
    testFirst: 30, testDaily: 15, prMin: 10, prMax: 120, rankUp: 100,
    checkin: 60, checkinBonusMax: 60,
    quizFail: 10, quizTier: [0, 120, 250, 450],
    book: 150, sessionPerMin: 1, sessionMax: 90,
    boss: 150, bossDiscipline: 30,
  },

  /* Exercices de test. Rangs : seuils absolus. */
  exercises: {
    pushups: { name: 'Pompes', icon: '🫸', unit: 'rép.', max: 1000, rule: 'Amplitude complète, poitrine à un poing du sol, pas de pause de plus de 2 s.',
      ranks: [[0, 'E'], [10, 'D'], [20, 'C'], [35, 'B'], [50, 'A'], [75, 'S'], [100, 'S+']] },
    squats:  { name: 'Squats', icon: '🦵', unit: 'rép.', max: 2000, rule: 'Cuisses au moins parallèles au sol, talons au sol, sans pause.',
      ranks: [[0, 'E'], [20, 'D'], [40, 'C'], [60, 'B'], [80, 'A'], [100, 'S'], [150, 'S+']] },
    squatsKg:{ name: 'Squat (charge max)', icon: '🏋️', unit: 'kg', max: 400, rule: 'Une répétition propre, cuisses parallèles. Avec pareur.',
      ranks: [[0, 'E'], [40, 'D'], [60, 'C'], [80, 'B'], [100, 'A'], [140, 'S'], [180, 'S+']] },
    plank:   { name: 'Gainage', icon: '🧱', unit: 's', max: 3600, rule: 'Planche sur avant-bras, corps aligné. Le test s\'arrête dès que les hanches tombent.',
      ranks: [[0, 'E'], [30, 'D'], [60, 'C'], [90, 'B'], [120, 'A'], [180, 'S'], [300, 'S+']] },
  },

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
