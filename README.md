# Play Your Life

Ta vie réelle, présentée comme un jeu vidéo. On ne gagne aucun XP en planifiant, uniquement en faisant des choses vérifiables.

## Lancer

Double-clique sur `Lancer.bat`. Il démarre `python -m http.server 8765` et ouvre http://localhost:8765.
Utilise toujours la même adresse : les données sont enregistrées dans le navigateur et liées à l'adresse utilisée.

## Menus

| Menu | Contenu |
|---|---|
| QG | Niveaux des 4 domaines, série de jours, séances de la semaine, **tâches à faire** (3 max, s'effacent à minuit), quêtes de PNJ en cours, boss de la semaine |
| Corps | Tests physiques (rangs E → D → C → B → A → S → SS), séances (titre, description, photo), régularité, course à pied (import GPX/TCX), check-in photo |
| Métier | Carte de compétences en radar, poste actuel et poste visé avec l'écart à combler, 5 QCM par thématique (Fondamentaux → Maître) |
| Esprit | Livres terminés (3 enseignements obligatoires), sessions d'apprentissage |
| Quêtes | Grandes quêtes des PNJ et **contrats** (les anciennes missions), confiés par les PNJ au fil des niveaux et des tests |
| Multijoueur | Classement (photo ou avatar), cartes de joueur, **clan** avec son classement interne |
| Trésor | Récompenses réelles, titres, rangs |
| Profil | Statistiques et réglages |

Plus on monte, plus il faut d'XP : passer du niveau n au niveau n+1 coûte `100 × n^1.6` XP (`250 × n^1.6` pour le personnage).

## Métier

- 6 thématiques informatiques × 5 QCM (`js/data/quiz-it.js` pour les paliers 1 à 3, `js/data/quiz-it-expert.js` pour Expert et Maître).
- Postes et niveaux attendus par thématique : `js/data/jobs.js`. Le radar compare ton niveau au poste visé et propose la prochaine étape.
- Prévu : chemin de progression automatique vers le poste visé, certifications suggérées selon le profil.

## Personnage, avatar et carte

- À la création : prénom, **taille et poids** (obligatoires), photo de profil (optionnelle, gardée sur l'appareil).
- **Avatar** (clic sur ton portrait) avec des cosmétiques de rareté Commun, Rare, Épique, Légendaire, débloqués par niveau, quêtes de PNJ, XP cumulée, tâches accomplies ou série de jours.
- **Carte de joueur** : métal selon le niveau (Cuivre, Argent, Or, Rubis, Légende), photo ou avatar, tag de clan. La photo n'est partagée que si tu l'affiches et que le réglage « Photo sur ma carte partagée » est activé.

## Course à pied et Strava

Strava ne permet pas de lire une activité à partir de son simple lien : il faut leur API (connexion OAuth et serveur). En attendant : sur Strava, ouvre l'activité, menu « … » → **Exporter GPX**, puis dépose le fichier dans Corps → Course. Distance, temps en mouvement, rythme, dénivelé et date sont calculés localement. Le lien Strava peut être ajouté comme preuve.

Prévu : import des séances depuis Hevy.

## Multijoueur et clans

- **Profils** : plusieurs personnages sur le même navigateur (Profil → Réglages).
- **Classement** : profils de l'appareil + cartes de joueur importées (fichier .json envoyé par tes amis).
- **Clan** : nom, tag, devise, blason et couleur. On y ajoute des joueurs du classement, puis on leur envoie le fichier d'invitation qu'ils importent dans Multijoueur → Clan.
- Le **chat de clan** et la mise à jour automatique des classements demandent un serveur : toute la persistance passe par `Store` et un adaptateur (`js/storage.js`, exemple Supabase dans `js/storage-remote.example.js`).

## Personnaliser

- Barèmes d'XP, titres, contrats, rangs, idées de tâches : `js/data/content.js`
- PNJ et quêtes : `js/data/npcs.js`
- Questions et postes : `js/data/quiz-it.js`, `js/data/quiz-it-expert.js`, `js/data/jobs.js`
- Couleurs : jetons en haut de `css/style.css` (thèmes sombre et clair).

## Données

Tout reste en local : l'état de chaque profil dans `localStorage`, les photos (compressées) dans IndexedDB. Exporte régulièrement depuis Profil → Réglages (fichier .json, photos comprises).
