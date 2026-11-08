# Play Your Life

Ta vie réelle, présentée comme un jeu vidéo. On ne gagne aucun XP en planifiant, uniquement en faisant des choses vérifiables.

## Lancer

Double-clique sur `Lancer.bat`. Il démarre `python -m http.server 8765` et ouvre http://localhost:8765.
Utilise toujours la même adresse : les données sont enregistrées dans le navigateur et liées à l'adresse utilisée.

## Domaines

| Domaine | Comment gagner de l'XP |
|---|---|
| 💼 Métier | Tests de connaissances par sous-domaine (3 paliers), missions pratiques débloquées par palier, réalisations réelles (certifications, projets…) |
| 💪 Corps | Tests : pompes, squats, tractions, gainage, course (distance en 12 min ou rythme sur 5 km), avec des rangs de E à S+. Carnet de séances (~90 exercices), suivi de la régularité avec un objectif hebdomadaire, course à pied (distance, temps, rythme), check-in photo hebdomadaire |
| 🧠 Esprit | Livres terminés (3 enseignements obligatoires), sessions d'apprentissage chronométrées |
| ⚡ Discipline | 3 quêtes par jour maximum, à piocher dans un tableau de quêtes préfaites ou à créer (elles expirent à minuit), série de jours, boss de la semaine |

Plus on monte, plus il faut d'XP : passer du niveau n au niveau n+1 coûte `100 × n^1.6` XP (`250 × n^1.6` pour le personnage).

Chaque niveau débloque un titre, de nouvelles missions IRL ou les **récompenses réelles** que tu définis dans l'onglet Récompenses.

## Personnage, avatar et carte

- À la création : prénom, **taille et poids** (obligatoires), photo de profil (optionnelle, recadrée au carré, gardée sur l'appareil).
- **Avatar** façon Bitmoji (onglet ouvert en cliquant sur ton portrait) : visage, teint, coupe, yeux, sourcils, bouche, pilosité, lunettes, couvre-chef, tenue, détails, geste, fond. Certains objets se débloquent en montant de niveau (casque de la Garde, couronne, armure…). Moteur de dessin : `js/avatar.js`.
- **Carte de joueur** (aperçu dans Réglages et Guilde) : couleur selon le niveau du personnage (Cuivre 1–3, Argent 4–6, Or 7–9, Rubis 10–14, Légende 15+), photo ou avatar, niveaux par domaine. La carte partagée montre l'avatar, jamais la photo.

## PNJ et quêtes

Six PNJ (Maître Kael, Lyra, Orin, Sœur Mira, Capitaine Brann, le Voyageur) apparaissent au hasard, 1 à 2 fois par jour, à l'ouverture ou après une action. Leurs quêtes durent plusieurs niveaux et touchent plusieurs domaines. Seules les actions faites après avoir accepté une quête comptent. Les quêtes se suivent dans l'onglet Quêtes. Les règles d'apparition et le contenu sont dans `js/data/npcs.js`.

## Jouer à plusieurs (amis, famille)

- **Profils** : plusieurs personnages sur le même navigateur (Réglages → Profils).
- **Guilde** : classement entre les profils de l'appareil et les **cartes de joueur** de tes amis. Exporte ta carte (fichier .json) et envoie-la, tes amis l'importent. La carte ne contient que les niveaux, séries et records : jamais les photos ni l'historique.
- **Serveur plus tard** : toute la persistance passe par `Store` et un adaptateur (`js/storage.js`). Pour une synchro en ligne, écrire un adaptateur serveur avec la même interface (voir `js/storage-remote.example.js`, exemple avec Supabase) et appeler `Store.use(...)`.

## Personnaliser

- Barèmes d'XP, titres, missions, rangs, quêtes préfaites : `js/data/content.js`
- Exercices du carnet de séances : `js/data/exercises.js`
- PNJ et quêtes : `js/data/npcs.js`
- Questions informatique : `js/data/quiz-it.js`. Pour un autre métier, copie ce fichier, change la clé (`QUIZ_BANKS.monmetier`), ajoute le `<script>` dans `index.html` et l'option dans `GAME.proDomains`.
- Couleurs : jetons en haut de `css/style.css` (palette bordeaux, terracotta, sable, cyan, pétrole ; thèmes sombre et clair).

## Données

Tout reste en local : l'état de chaque profil dans `localStorage`, les photos (compressées) dans IndexedDB. Pense à faire un export régulier depuis Réglages (fichier .json, photos comprises). Les sauvegardes de la première version sont reprises automatiquement.
