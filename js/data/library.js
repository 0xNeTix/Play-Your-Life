/* Bibliothèque de l'Esprit : thèmes et contenus de départ.
   Chaque contenu : résumé + mini test (bonne réponse toujours en premier dans `a`, mélangée à l'affichage).
   Les vidéos pointent vers une recherche YouTube sur le titre exact (pas d'identifiant de vidéo figé qui pourrait disparaître).
   Les joueurs ajoutent leurs propres contenus depuis l'onglet « Proposer ». */
const THEMES = [
  { id: 'philo', name: 'Philosophie', color: '#a77be0' },
  { id: 'eco', name: 'Économie', color: '#3ccf6b' },
  { id: 'histoire', name: 'Histoire', color: '#d4704c' },
  { id: 'psycho', name: 'Psychologie', color: '#e86aa6' },
  { id: 'sciences', name: 'Sciences', color: '#0bc5d2' },
  { id: 'spirit', name: 'Religion & spiritualité', color: '#e8c48c' },
  { id: 'geopo', name: 'Géopolitique', color: '#6f9be8' },
  { id: 'devperso', name: 'Développement personnel', color: '#ffbe69' },
  { id: 'tech', name: 'Technologie & IA', color: '#7fe3ea' },
  { id: 'finance', name: 'Finance personnelle', color: '#b8d46a' },
  { id: 'sante', name: 'Santé & sommeil', color: '#ff9b8a' },
];

const CONTENT_TYPES = { book: 'Livre', video: 'Vidéo', podcast: 'Podcast', article: 'Article' };

const LIBRARY_SEED = [
  /* ---------- Philosophie ---------- */
  { id: 'philo-epictete', theme: 'philo', type: 'book', title: 'Manuel', author: 'Épictète', minutes: 60,
    summary: 'Un très court traité stoïcien. Tout part d\'une distinction : ce qui dépend de nous (nos jugements, nos désirs, nos actions) et ce qui n\'en dépend pas (le corps, la réputation, la richesse). Ce qui nous trouble, ce ne sont pas les choses, mais les jugements que nous portons sur elles.',
    quiz: [
      { q: 'Selon Épictète, qu\'est-ce qui dépend de nous ?', a: ['Nos jugements, nos désirs et nos actions', 'Notre réputation', 'Notre santé'] },
      { q: 'D\'où vient ce qui trouble les hommes ?', a: ['Des jugements qu\'ils portent sur les choses', 'Des choses elles-mêmes', 'Du manque d\'argent'] },
      { q: 'À quelle école philosophique appartient Épictète ?', a: ['Le stoïcisme', 'L\'épicurisme', 'Le scepticisme'] },
    ] },
  { id: 'philo-marc-aurele', theme: 'philo', type: 'book', title: 'Pensées pour moi-même', author: 'Marc Aurèle', minutes: 240,
    summary: 'Les notes intimes d\'un empereur romain, écrites pour lui seul, souvent en campagne militaire. Des exercices stoïciens répétés : se rappeler que la vie est brève, agir pour le bien commun, accepter ce qui arrive sans se plaindre.',
    quiz: [
      { q: 'Qui était Marc Aurèle ?', a: ['Un empereur romain', 'Un esclave affranchi', 'Un orateur athénien'] },
      { q: 'À qui ces pensées étaient-elles destinées ?', a: ['À lui-même', 'Au Sénat', 'À ses soldats'] },
      { q: 'Quelle idée revient le plus souvent ?', a: ['La vie est brève : accepte ce qui ne dépend pas de toi et agis bien', 'Le plaisir est le but de la vie', 'La conquête donne un sens à l\'existence'] },
    ] },
  { id: 'philo-caverne', theme: 'philo', type: 'video', title: 'L\'allégorie de la caverne de Platon expliquée', author: 'Platon, La République (livre VII)', minutes: 15,
    summary: 'Des prisonniers enchaînés depuis toujours ne voient que des ombres projetées sur une paroi et les prennent pour la réalité. L\'un d\'eux est libéré, sort, d\'abord ébloui, puis découvre le soleil. Il redescend prévenir les autres, qui ne le croient pas. Une image de l\'éducation et du passage de l\'opinion à la connaissance.',
    quiz: [
      { q: 'Que voient les prisonniers dans la caverne ?', a: ['Des ombres projetées sur la paroi', 'Le soleil', 'Leur reflet dans l\'eau'] },
      { q: 'Que représente le soleil ?', a: ['L\'idée du Bien, source de vérité', 'Le pouvoir politique', 'La mort'] },
      { q: 'Comment les autres réagissent-ils au retour du prisonnier libéré ?', a: ['Ils ne le croient pas et se moquent de lui', 'Ils le suivent aussitôt dehors', 'Ils le nomment roi'] },
    ] },

  /* ---------- Économie ---------- */
  { id: 'eco-dalio', theme: 'eco', type: 'video', title: 'How The Economic Machine Works', author: 'Ray Dalio', minutes: 31,
    summary: 'L\'économie décrite comme une machine simple : la somme de toutes les transactions. Trois forces la font bouger : la croissance de la productivité, le cycle court de la dette et le cycle long de la dette. Le crédit permet de dépenser plus aujourd\'hui, mais il faudra dépenser moins demain : c\'est lui qui crée les cycles.',
    quiz: [
      { q: 'Pour Dalio, de quoi l\'économie est-elle la somme ?', a: ['Des transactions', 'Des impôts', 'Des réserves d\'or'] },
      { q: 'Quelles sont les trois forces qui font bouger l\'économie ?', a: ['La productivité, le cycle court de la dette et le cycle long de la dette', 'L\'offre, la demande et la monnaie', 'Le travail, la terre et le capital'] },
      { q: 'Pourquoi le crédit crée-t-il des cycles ?', a: ['On dépense plus aujourd\'hui, puis il faut rembourser en dépensant moins', 'Les banques ferment une partie de l\'année', 'La productivité baisse chaque année'] },
    ] },
  { id: 'eco-smith', theme: 'eco', type: 'book', title: 'La Richesse des nations', author: 'Adam Smith', minutes: 600,
    summary: 'Le texte fondateur de l\'économie moderne (1776). La division du travail, illustrée par une manufacture d\'épingles, multiplie la productivité. Le marché coordonne les intérêts individuels comme une « main invisible ». La richesse d\'un pays, c\'est ce qu\'il produit, pas l\'or qu\'il entasse.',
    quiz: [
      { q: 'Quel exemple illustre la division du travail ?', a: ['La manufacture d\'épingles', 'La boulangerie', 'La mine de charbon'] },
      { q: 'Que désigne la « main invisible » ?', a: ['La recherche de l\'intérêt individuel peut servir l\'intérêt général par le marché', 'L\'intervention secrète de l\'État', 'La fraude fiscale'] },
      { q: 'Pour Smith, d\'où vient la richesse d\'une nation ?', a: ['De son travail et de sa production', 'De son stock d\'or et d\'argent', 'De ses conquêtes'] },
    ] },
  { id: 'eco-piketty', theme: 'eco', type: 'book', title: 'Le Capital au XXIe siècle', author: 'Thomas Piketty', minutes: 900,
    summary: 'Une histoire de la répartition des richesses sur deux siècles. Quand le rendement du capital (r) dépasse durablement la croissance (g), les patrimoines hérités grossissent plus vite que les revenus du travail et les inégalités se creusent. L\'auteur propose un impôt progressif sur le capital.',
    quiz: [
      { q: 'Que signifie « r > g » ?', a: ['Le rendement du capital est supérieur à la croissance économique', 'Les revenus dépassent les dépenses', 'Le risque dépasse le gain'] },
      { q: 'Quelle en est la conséquence selon l\'auteur ?', a: ['Les inégalités de patrimoine se creusent', 'L\'inflation disparaît', 'Le chômage baisse'] },
      { q: 'Quelle mesure propose-t-il ?', a: ['Un impôt progressif sur le capital', 'Le retour à l\'étalon-or', 'La suppression de la monnaie'] },
    ] },

  /* ---------- Histoire ---------- */
  { id: 'hist-sapiens', theme: 'histoire', type: 'book', title: 'Sapiens : une brève histoire de l\'humanité', author: 'Yuval Noah Harari', minutes: 720,
    summary: 'Comment une espèce parmi d\'autres a pris le contrôle de la planète. Trois révolutions : cognitive, agricole, scientifique. La force de Sapiens : coopérer en très grand nombre grâce à des fictions partagées (mythes, argent, nations). La révolution agricole y est qualifiée de « plus grande escroquerie de l\'histoire ».',
    quiz: [
      { q: 'Qu\'est-ce qui permet à Sapiens de coopérer en très grand nombre ?', a: ['La croyance en des fictions communes', 'Sa force physique', 'La taille de ses outils'] },
      { q: 'Comment Harari qualifie-t-il la révolution agricole ?', a: ['La plus grande escroquerie de l\'histoire', 'Le plus grand progrès de l\'humanité', 'Un détail sans importance'] },
      { q: 'Quelles sont les trois grandes révolutions du livre ?', a: ['Cognitive, agricole, scientifique', 'Française, industrielle, numérique', 'Néolithique, romaine, médiévale'] },
    ] },
  { id: 'hist-bighistory', theme: 'histoire', type: 'video', title: 'L\'histoire du monde en 18 minutes (TED)', author: 'David Christian', minutes: 18,
    summary: 'Du Big Bang à nos jours en dix-huit minutes. L\'Univers franchit des « seuils » de complexité croissante : étoiles, éléments chimiques, planètes, vie, humains. Chaque seuil demande des conditions très précises. Ce qui rend l\'humain unique : l\'apprentissage collectif, le savoir qui s\'accumule de génération en génération.',
    quiz: [
      { q: 'Comment s\'appelle cette approche de l\'histoire ?', a: ['La Big History', 'La micro-histoire', 'L\'uchronie'] },
      { q: 'Qu\'est-ce qui distingue les humains selon l\'orateur ?', a: ['L\'apprentissage collectif : le savoir s\'accumule', 'La station debout', 'La seule taille du cerveau'] },
      { q: 'Par quoi commence son récit ?', a: ['Le Big Bang', 'L\'apparition de la vie', 'L\'invention de l\'écriture'] },
    ] },
  { id: 'hist-diamond', theme: 'histoire', type: 'book', title: 'De l\'inégalité parmi les sociétés', author: 'Jared Diamond', minutes: 780,
    summary: 'Pourquoi certaines sociétés ont-elles conquis les autres ? Pas à cause de différences biologiques, répond l\'auteur, mais de la géographie : espèces domesticables disponibles, axe est-ouest de l\'Eurasie qui facilite la diffusion des cultures. D\'où l\'agriculture, la densité de population, les germes, puis la technologie.',
    quiz: [
      { q: 'Quelle est la thèse centrale ?', a: ['Les écarts entre sociétés viennent de la géographie et de l\'environnement', 'Certains peuples sont plus intelligents', 'Tout est dû au hasard'] },
      { q: 'Pourquoi l\'axe est-ouest de l\'Eurasie est-il un avantage ?', a: ['Cultures et animaux se diffusent facilement à climat similaire', 'Il protège des invasions', 'Il raccourcit les distances'] },
      { q: 'Quel rôle les germes ont-ils joué ?', a: ['Les maladies venues des animaux domestiques ont décimé des peuples jamais exposés', 'Ils ont surtout affaibli l\'Europe', 'Aucun'] },
    ] },

  /* ---------- Psychologie ---------- */
  { id: 'psy-kahneman', theme: 'psycho', type: 'book', title: 'Système 1 / Système 2 : les deux vitesses de la pensée', author: 'Daniel Kahneman', minutes: 780,
    summary: 'Notre esprit fonctionne à deux vitesses. Le Système 1 est rapide, intuitif, automatique. Le Système 2 est lent, réfléchi, et paresseux. La plupart de nos erreurs viennent de la confiance excessive dans le premier : ancrage, biais de disponibilité, aversion à la perte.',
    quiz: [
      { q: 'Comment fonctionne le Système 1 ?', a: ['Vite, de façon intuitive et automatique', 'Lentement et logiquement', 'Uniquement pendant le sommeil'] },
      { q: 'Qu\'est-ce que l\'aversion à la perte ?', a: ['Une perte fait plus mal qu\'un gain équivalent ne fait plaisir', 'On préfère perdre que gagner', 'On oublie vite ses pertes'] },
      { q: 'Qu\'est-ce que le biais d\'ancrage ?', a: ['Un premier chiffre, même arbitraire, influence nos estimations', 'On s\'attache à ses objets', 'On préfère les nombres ronds'] },
    ] },
  { id: 'psy-grit', theme: 'psycho', type: 'video', title: 'Grit : le pouvoir de la passion et de la persévérance (TED)', author: 'Angela Duckworth', minutes: 6,
    summary: 'Ancienne professeure de mathématiques devenue psychologue, l\'oratrice a étudié des cadets militaires, des élèves, des vendeurs. Ce qui prédit le mieux la réussite n\'est ni le QI ni le talent, mais le « grit » : la passion et la persévérance pour des objectifs à très long terme.',
    quiz: [
      { q: 'Qu\'est-ce que le « grit » ?', a: ['La passion et la persévérance pour des objectifs à long terme', 'Le talent naturel', 'La chance'] },
      { q: 'Que prédit-il mieux que le QI dans ses études ?', a: ['La réussite', 'La taille', 'Le salaire des parents'] },
      { q: 'Quelle piste cite-t-elle pour le développer ?', a: ['L\'état d\'esprit de développement de Carol Dweck', 'Le régime cétogène', 'Dormir moins'] },
    ] },
  { id: 'psy-cialdini', theme: 'psycho', type: 'book', title: 'Influence et manipulation', author: 'Robert Cialdini', minutes: 540,
    summary: 'Pourquoi dit-on oui ? Six principes de persuasion, tirés d\'expériences et d\'observations de vendeurs : réciprocité, engagement et cohérence, preuve sociale, autorité, sympathie, rareté. Les connaître permet aussi de s\'en défendre.',
    quiz: [
      { q: 'Lequel de ces principes fait partie des six ?', a: ['La preuve sociale', 'La télépathie', 'La punition'] },
      { q: 'Que dit le principe de réciprocité ?', a: ['On se sent obligé de rendre ce qu\'on a reçu', 'On imite la majorité', 'On obéit aux experts'] },
      { q: 'Pourquoi « plus que 2 places disponibles » fonctionne-t-il ?', a: ['La rareté rend les choses plus désirables', 'C\'est le principe d\'autorité', 'C\'est le principe de sympathie'] },
    ] },

  /* ---------- Sciences ---------- */
  { id: 'sci-feynman', theme: 'sciences', type: 'video', title: 'Fun to Imagine', author: 'Richard Feynman (BBC, 1983)', minutes: 60,
    summary: 'Assis dans un fauteuil, le physicien explique le monde avec des images simples : la chaleur est l\'agitation des atomes, un arbre est fait surtout d\'air, et le feu de bois rend la lumière du soleil que l\'arbre avait stockée. Une leçon sur le plaisir de comprendre.',
    quiz: [
      { q: 'Selon Feynman, qu\'est-ce que la chaleur ?', a: ['L\'agitation des atomes', 'Un fluide invisible', 'Une onde sonore'] },
      { q: 'D\'où vient l\'essentiel de la matière d\'un arbre ?', a: ['De l\'air, par le carbone du CO2', 'Du sol', 'Uniquement de l\'eau de pluie'] },
      { q: 'Que libère un feu de bois ?', a: ['L\'énergie du soleil stockée par l\'arbre', 'L\'énergie du sol', 'De l\'électricité statique'] },
    ] },
  { id: 'sci-hawking', theme: 'sciences', type: 'book', title: 'Une brève histoire du temps', author: 'Stephen Hawking', minutes: 360,
    summary: 'L\'Univers raconté sans équations : le Big Bang et l\'expansion, la relativité et la mécanique quantique, les trous noirs qui rayonnent et finissent par s\'évaporer, la flèche du temps. Et la quête d\'une théorie capable d\'unifier toute la physique.',
    quiz: [
      { q: 'Qu\'a montré Hawking à propos des trous noirs ?', a: ['Ils émettent un rayonnement et peuvent s\'évaporer', 'Ils sont éternels', 'Ils n\'existent pas'] },
      { q: 'Quelles théories la physique cherche-t-elle à unifier ?', a: ['La relativité générale et la mécanique quantique', 'L\'optique et l\'acoustique', 'La chimie et la biologie'] },
      { q: 'Que décrit le Big Bang ?', a: ['Le début de l\'expansion de l\'Univers depuis un état très dense et très chaud', 'L\'explosion d\'une étoile', 'La formation de la Lune'] },
    ] },
  { id: 'sci-darwin', theme: 'sciences', type: 'book', title: 'L\'Origine des espèces', author: 'Charles Darwin', minutes: 900,
    summary: 'Publié en 1859. Les individus d\'une espèce varient, et ces variations se transmettent. Comme il naît plus d\'individus que le milieu ne peut en nourrir, ceux dont les variations sont avantageuses survivent et se reproduisent davantage : c\'est la sélection naturelle. Toutes les espèces descendent d\'ancêtres communs.',
    quiz: [
      { q: 'Quel est le mécanisme central décrit par Darwin ?', a: ['La sélection naturelle', 'La génération spontanée', 'L\'hérédité des caractères acquis'] },
      { q: 'Quelle condition est indispensable ?', a: ['Des variations héritables entre individus', 'Des individus tous identiques', 'Un milieu qui ne change jamais'] },
      { q: 'En quelle année le livre paraît-il ?', a: ['1859', '1789', '1905'] },
    ] },

  /* ---------- Religion & spiritualité ---------- */
  { id: 'spi-bouddha', theme: 'spirit', type: 'video', title: 'Les quatre nobles vérités du bouddhisme', author: 'Enseignement du Bouddha', minutes: 12,
    summary: 'Le premier enseignement du Bouddha après son éveil. Il existe une souffrance (dukkha). Elle a une origine : la soif, le désir d\'attachement. Elle peut cesser : c\'est le nirvana. Et il existe un chemin pour y parvenir : le noble sentier octuple.',
    quiz: [
      { q: 'Que dit la première noble vérité ?', a: ['La souffrance existe', 'Un dieu a créé le monde', 'Les rois se réincarnent'] },
      { q: 'Quelle est l\'origine de la souffrance ?', a: ['La soif, le désir d\'attachement', 'Le péché originel', 'La colère des dieux'] },
      { q: 'Quel chemin mène à la cessation de la souffrance ?', a: ['Le noble sentier octuple', 'Les dix commandements', 'Les cinq piliers'] },
    ] },
  { id: 'spi-siddhartha', theme: 'spirit', type: 'book', title: 'Siddhartha', author: 'Hermann Hesse', minutes: 240,
    summary: 'Un roman court (1922). Le jeune Siddhartha quitte son père brahmane, vit en ascète, rencontre le Bouddha mais refuse de le suivre, connaît l\'amour et la richesse, puis finit passeur au bord d\'un fleuve. Sa conclusion : la sagesse ne s\'enseigne pas, elle se vit.',
    quiz: [
      { q: 'Pourquoi Siddhartha refuse-t-il de suivre le Bouddha ?', a: ['La sagesse ne se transmet pas par un enseignement, elle se vit', 'Il le prend pour un menteur', 'Son père le lui interdit'] },
      { q: 'Qui devient son guide à la fin du livre ?', a: ['Le passeur Vasudeva et le fleuve', 'Le marchand Kamaswami', 'Un roi'] },
      { q: 'Que lui apprend le fleuve ?', a: ['L\'écoute et l\'unité de toutes choses', 'L\'art du commerce', 'Le mépris du monde'] },
    ] },
  { id: 'spi-ecclesiaste', theme: 'spirit', type: 'book', title: 'L\'Ecclésiaste (Qohélet)', author: 'Bible hébraïque', minutes: 45,
    summary: 'Un livre de sagesse très bref et étonnamment lucide. « Vanité des vanités, tout est vanité » : rien de nouveau sous le soleil, tout passe. « Il y a un temps pour tout. » Face à la brièveté de la vie, le texte invite à goûter les joies simples.',
    quiz: [
      { q: 'Quelle formule ouvre le livre ?', a: ['Vanité des vanités, tout est vanité', 'Aime ton prochain comme toi-même', 'Que la lumière soit'] },
      { q: 'Que veut dire « il y a un temps pour tout » ?', a: ['Chaque chose a son moment : naître et mourir, planter et arracher', 'Il faut tout faire vite', 'Le temps n\'existe pas'] },
      { q: 'Que conseille le texte face à la brièveté de la vie ?', a: ['Goûter les joies simples', 'Accumuler des richesses', 'Se retirer au désert'] },
    ] },

  /* ---------- Géopolitique ---------- */
  { id: 'geo-marshall', theme: 'geopo', type: 'book', title: 'Prisonniers de la géographie', author: 'Tim Marshall', minutes: 480,
    summary: 'Dix cartes pour comprendre le monde. Montagnes, fleuves, mers et plaines contraignent les choix des dirigeants. La Russie cherche à sécuriser la grande plaine d\'Europe du Nord et des ports en eaux chaudes. La Chine tient le Tibet, barrière stratégique et château d\'eau de l\'Asie.',
    quiz: [
      { q: 'Quelle est la thèse du livre ?', a: ['La géographie contraint fortement les décisions des États', 'La géographie ne compte plus', 'Seule la personnalité des dirigeants compte'] },
      { q: 'Que cherche la Russie depuis des siècles ?', a: ['Sécuriser la plaine d\'Europe du Nord et accéder à des ports en eaux chaudes', 'Contrôler le Sahara', 'Coloniser l\'Antarctique'] },
      { q: 'Pourquoi le Tibet compte-t-il pour la Chine ?', a: ['C\'est une barrière stratégique et la source de grands fleuves', 'C\'est un grand port commercial', 'C\'est sa principale région agricole'] },
    ] },
  { id: 'geo-suntzu', theme: 'geopo', type: 'book', title: 'L\'Art de la guerre', author: 'Sun Tzu', minutes: 120,
    summary: 'Un traité chinois de stratégie en treize chapitres, vieux d\'environ 2 500 ans. L\'idéal n\'est pas de gagner cent batailles, mais de vaincre sans combattre. Tout repose sur la connaissance de l\'ennemi et de soi-même, la préparation, le terrain et la tromperie.',
    quiz: [
      { q: 'Quel est l\'idéal du stratège selon Sun Tzu ?', a: ['Soumettre l\'ennemi sans combattre', 'Attaquer toujours le premier', 'Ne jamais reculer'] },
      { q: 'Que gagne celui qui connaît l\'ennemi et se connaît lui-même ?', a: ['Il ne sera pas en danger, même en cent batailles', 'Il perdra une bataille sur deux', 'Il n\'aura plus besoin d\'armée'] },
      { q: 'Sur quoi toute guerre repose-t-elle ?', a: ['La tromperie', 'L\'honneur', 'Le nombre'] },
    ] },
  { id: 'geo-huntington', theme: 'geopo', type: 'book', title: 'Le Choc des civilisations', author: 'Samuel Huntington', minutes: 600,
    summary: 'Publié en 1996. Après la guerre froide, les conflits n\'opposeraient plus des idéologies mais de grandes civilisations définies par la culture et la religion. Une thèse très discutée, souvent opposée à « La Fin de l\'histoire » de Fukuyama, et critiquée pour sa vision de blocs figés.',
    quiz: [
      { q: 'Quelle est la thèse du livre ?', a: ['Les conflits d\'après la guerre froide suivent des lignes culturelles et civilisationnelles', 'Les conflits resteront idéologiques', 'Il n\'y aura plus de conflits'] },
      { q: 'À quel autre essai l\'oppose-t-on souvent ?', a: ['La Fin de l\'histoire, de Fukuyama', 'Le Prince, de Machiavel', 'Le Capital, de Marx'] },
      { q: 'Quelle critique lui fait-on le plus ?', a: ['Présenter les civilisations comme des blocs homogènes et figés', 'Être trop optimiste', 'Ignorer la religion'] },
    ] },

  /* ---------- Développement personnel ---------- */
  { id: 'dev-atomic', theme: 'devperso', type: 'book', title: 'Un rien peut tout changer (Atomic Habits)', author: 'James Clear', minutes: 330,
    summary: 'De petites habitudes, répétées, produisent de grands résultats. Quatre lois pour en installer une : la rendre évidente, attractive, facile et satisfaisante. Deux idées fortes : partir de l\'identité qu\'on veut incarner, et la règle des deux minutes pour démarrer.',
    quiz: [
      { q: 'Quelles sont les quatre lois d\'une bonne habitude ?', a: ['Évidente, attractive, facile, satisfaisante', 'Longue, difficile, rare, coûteuse', 'Secrète, rapide, solitaire, quotidienne'] },
      { q: 'Que dit la règle des deux minutes ?', a: ['Une nouvelle habitude doit pouvoir se démarrer en moins de deux minutes', 'Il faut méditer deux minutes', 'Il faut une pause toutes les deux minutes'] },
      { q: 'Sur quoi fonder ses habitudes ?', a: ['Sur l\'identité qu\'on veut incarner', 'Sur la motivation du jour', 'Sur la peur de la punition'] },
    ] },
  { id: 'dev-procrastination', theme: 'devperso', type: 'video', title: 'Dans la tête d\'un maître de la procrastination (TED)', author: 'Tim Urban', minutes: 14,
    summary: 'Dans le cerveau du procrastinateur, le décideur rationnel se fait voler le volant par le singe de la gratification instantanée. Seul le monstre panique, qui se réveille à l\'approche d\'une échéance, le fait fuir. Le vrai danger : les projets sans échéance, où la panique n\'arrive jamais.',
    quiz: [
      { q: 'Quels sont les trois personnages de la conférence ?', a: ['Le décideur rationnel, le singe de la gratification instantanée, le monstre panique', 'Le lion, la sorcière et l\'armoire', 'Le sage, le fou et le roi'] },
      { q: 'Quand le monstre panique se réveille-t-il ?', a: ['À l\'approche d\'une échéance', 'Chaque matin', 'Jamais'] },
      { q: 'Quelle procrastination est la plus dangereuse ?', a: ['Celle des projets sans échéance', 'Celle des examens', 'Celle du ménage'] },
    ] },
  { id: 'dev-covey', theme: 'devperso', type: 'book', title: 'Les 7 habitudes de ceux qui réalisent tout ce qu\'ils entreprennent', author: 'Stephen Covey', minutes: 660,
    summary: 'Sept habitudes pour passer de la dépendance à l\'indépendance, puis à l\'interdépendance : être proactif, commencer avec la fin en tête, donner la priorité aux priorités, penser gagnant-gagnant, chercher d\'abord à comprendre, créer des synergies, aiguiser ses facultés.',
    quiz: [
      { q: 'Quelle est la première habitude ?', a: ['Être proactif', 'Penser gagnant-gagnant', 'Aiguiser ses facultés'] },
      { q: 'Que veut dire « commencer avec la fin en tête » ?', a: ['Définir clairement le but avant d\'agir', 'Finir le plus vite possible', 'Commencer par le plus simple'] },
      { q: 'Que recouvre « aiguiser ses facultés » ?', a: ['Se renouveler régulièrement : corps, esprit, relations, sens', 'Travailler toujours plus', 'Changer de métier'] },
    ] },

  /* ---------- Technologie & IA ---------- */
  { id: 'tech-3b1b', theme: 'tech', type: 'video', title: 'Mais qu\'est-ce qu\'un réseau de neurones ?', author: '3Blue1Brown', minutes: 19,
    summary: 'Le premier épisode d\'une série très visuelle sur l\'apprentissage profond. Exemple : reconnaître des chiffres écrits à la main. 784 neurones d\'entrée (un par pixel d\'une image 28 × 28), des couches cachées, dix sorties. Apprendre, c\'est ajuster des poids et des biais.',
    quiz: [
      { q: 'Quel exemple sert de fil rouge ?', a: ['La reconnaissance de chiffres manuscrits', 'La traduction automatique', 'Le jeu d\'échecs'] },
      { q: 'Pourquoi 784 neurones en entrée ?', a: ['Un par pixel d\'une image de 28 × 28', 'Un par chiffre possible', 'Un par couleur'] },
      { q: 'Que règle-t-on pendant l\'apprentissage ?', a: ['Les poids et les biais', 'Le nombre de pixels', 'La vitesse du processeur'] },
    ] },
  { id: 'tech-karpathy', theme: 'tech', type: 'video', title: 'Intro to Large Language Models', author: 'Andrej Karpathy', minutes: 60,
    summary: 'Une heure pour comprendre les grands modèles de langage. Un modèle, c\'est un fichier de paramètres et un petit programme pour le faire tourner. Sa tâche : prédire le mot suivant. L\'entraînement ressemble à une compression avec pertes d\'une grande partie d\'internet. La fin traite de la sécurité : jailbreaks et injections de prompt.',
    quiz: [
      { q: 'Quelle est la tâche de base d\'un modèle de langage ?', a: ['Prédire le mot suivant', 'Chercher sur internet', 'Compiler du code'] },
      { q: 'À quoi l\'orateur compare-t-il l\'entraînement ?', a: ['À une compression avec pertes d\'une partie d\'internet', 'À une copie exacte d\'internet', 'À une base de données classique'] },
      { q: 'Quel type d\'attaque décrit-il ?', a: ['L\'injection de prompt', 'Le phishing bancaire', 'Le déni de service'] },
    ] },
  { id: 'tech-bazar', theme: 'tech', type: 'book', title: 'La Cathédrale et le Bazar', author: 'Eric S. Raymond', minutes: 60,
    summary: 'L\'essai fondateur du mouvement open source. Deux façons de construire un logiciel : la cathédrale, bâtie par un petit groupe fermé, et le bazar, ouvert à tous, comme Linux. Sa loi la plus célèbre : avec assez d\'yeux, tous les bugs sont superficiels.',
    quiz: [
      { q: 'Que désigne le modèle du « bazar » ?', a: ['Un développement ouvert à de nombreux contributeurs', 'Un petit groupe fermé de développeurs', 'Un magasin de logiciels'] },
      { q: 'Que dit la loi de Linus ?', a: ['Avec assez d\'yeux, tous les bugs sont superficiels', 'Le code doit rester secret', 'Un logiciel n\'a qu\'un auteur'] },
      { q: 'Quel conseil l\'auteur donne-t-il ?', a: ['Publier tôt, publier souvent', 'Attendre que tout soit parfait', 'Ne pas écouter les utilisateurs'] },
    ] },

  /* ---------- Finance personnelle ---------- */
  { id: 'fin-kiyosaki', theme: 'finance', type: 'book', title: 'Père riche, père pauvre', author: 'Robert Kiyosaki', minutes: 360,
    summary: 'Deux figures paternelles, deux rapports à l\'argent. Le « père pauvre » travaille pour l\'argent ; le « père riche » fait travailler l\'argent pour lui. Idée clé : un actif met de l\'argent dans ta poche, un passif en retire. Et l\'école n\'enseigne pas l\'éducation financière.',
    quiz: [
      { q: 'Qu\'est-ce qu\'un actif selon l\'auteur ?', a: ['Ce qui met de l\'argent dans ta poche', 'Tout ce qui coûte cher', 'Forcément ta résidence principale'] },
      { q: 'Que font les riches, d\'après le livre ?', a: ['Ils font travailler l\'argent pour eux', 'Ils travaillent pour l\'argent', 'Ils évitent d\'investir'] },
      { q: 'Qu\'est-ce que l\'école n\'enseigne pas ?', a: ['L\'éducation financière', 'Les mathématiques', 'Le sport'] },
    ] },
  { id: 'fin-babylone', theme: 'finance', type: 'book', title: 'L\'Homme le plus riche de Babylone', author: 'George S. Clason', minutes: 180,
    summary: 'Des paraboles situées dans l\'ancienne Babylone pour transmettre des règles simples : se payer en premier en gardant au moins un dixième de ses revenus, maîtriser ses dépenses, faire fructifier son or et le protéger des placements hasardeux.',
    quiz: [
      { q: 'Quelle est la première règle ?', a: ['Se payer en premier : garder au moins un dixième de ses revenus', 'Dépenser avant d\'épargner', 'Emprunter pour investir'] },
      { q: 'Que faire de l\'or épargné ?', a: ['Le faire travailler pour qu\'il rapporte', 'L\'enterrer', 'Le prêter à n\'importe qui'] },
      { q: 'Sous quelle forme le livre est-il écrit ?', a: ['Des paraboles dans l\'ancienne Babylone', 'Un manuel de bourse', 'Une biographie'] },
    ] },
  { id: 'fin-housel', theme: 'finance', type: 'book', title: 'La Psychologie de l\'argent', author: 'Morgan Housel', minutes: 300,
    summary: 'Bien gérer son argent tient moins à l\'intelligence qu\'au comportement. Vingt courts chapitres : la puissance des intérêts composés sur la durée, savoir dire « assez », garder une marge d\'erreur parce que rien ne se passe comme prévu.',
    quiz: [
      { q: 'Quelle est l\'idée centrale ?', a: ['La réussite financière dépend plus du comportement que de l\'intelligence', 'Il faut un diplôme en finance', 'Tout est une question de chance'] },
      { q: 'D\'où vient l\'essentiel de la fortune de Warren Buffett ?', a: ['Des intérêts composés sur une très longue durée', 'D\'un seul coup de génie', 'D\'un héritage'] },
      { q: 'Pourquoi garder une marge d\'erreur ?', a: ['Parce que les choses ne se passent pas comme prévu', 'Pour maximiser le rendement', 'Pour pouvoir s\'endetter'] },
    ] },

  /* ---------- Santé & sommeil ---------- */
  { id: 'san-walker', theme: 'sante', type: 'book', title: 'Pourquoi nous dormons', author: 'Matthew Walker', minutes: 600,
    summary: 'Un neuroscientifique fait le point sur le sommeil : deux mécanismes le règlent, l\'horloge interne et la pression de sommeil liée à l\'adénosine. La caféine bloque cette dernière. Un adulte a besoin de 7 à 9 heures. Le sommeil consolide la mémoire et protège la santé.',
    quiz: [
      { q: 'De combien d\'heures de sommeil un adulte a-t-il besoin ?', a: ['7 à 9 heures', '4 à 5 heures', '10 à 12 heures'] },
      { q: 'Comment agit la caféine ?', a: ['Elle bloque les récepteurs de l\'adénosine, la molécule de la pression de sommeil', 'Elle augmente la mélatonine', 'Elle réchauffe le corps'] },
      { q: 'Quel est le lien entre sommeil et mémoire ?', a: ['Le sommeil consolide les apprentissages', 'Le sommeil efface les souvenirs', 'Il n\'y en a aucun'] },
    ] },
  { id: 'san-suzuki', theme: 'sante', type: 'video', title: 'Les bienfaits de l\'exercice sur le cerveau (TED)', author: 'Wendy Suzuki', minutes: 13,
    summary: 'Une neuroscientifique raconte comment le sport a changé son propre cerveau. Une seule séance améliore l\'humeur et l\'attention. À long terme, l\'exercice renforce l\'hippocampe et le cortex préfrontal, et les protège du vieillissement. Sa recommandation : trois à quatre séances de trente minutes par semaine.',
    quiz: [
      { q: 'Quel effet immédiat a une séance de sport ?', a: ['Elle améliore l\'humeur et l\'attention', 'Elle diminue la mémoire', 'Aucun'] },
      { q: 'Quelles zones du cerveau l\'exercice renforce-t-il ?', a: ['L\'hippocampe et le cortex préfrontal', 'Uniquement le cervelet', 'La moelle épinière'] },
      { q: 'Quelle dose recommande-t-elle ?', a: ['3 à 4 fois par semaine, au moins 30 minutes', 'Une fois par mois', 'Trois heures par jour'] },
    ] },
  { id: 'san-enders', theme: 'sante', type: 'book', title: 'Le Charme discret de l\'intestin', author: 'Giulia Enders', minutes: 420,
    summary: 'Un organe sous-estimé raconté avec humour. L\'intestin abrite un immense peuple de bactéries, le microbiote, qui aide à digérer et entraîne le système immunitaire. Il dialogue aussi en permanence avec le cerveau, au point d\'influencer notre humeur.',
    quiz: [
      { q: 'Qu\'est-ce que le microbiote ?', a: ['L\'ensemble des bactéries qui vivent dans notre intestin', 'Une enzyme digestive', 'Un muscle'] },
      { q: 'Avec quel organe l\'intestin dialogue-t-il en permanence ?', a: ['Le cerveau', 'Les poumons', 'Aucun'] },
      { q: 'À quoi servent les bactéries intestinales ?', a: ['Elles aident à digérer et entraînent le système immunitaire', 'À rien', 'Elles sont uniquement nocives'] },
    ] },
];
