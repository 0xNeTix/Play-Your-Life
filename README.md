# Play Your Life

Ta vie réelle, présentée comme un jeu vidéo. On ne gagne aucun XP en planifiant, uniquement en faisant des choses vérifiables.

## Lancer

Double-clique sur `Lancer.bat`. Il démarre `python -m http.server 8765` et ouvre http://localhost:8765.
Utilise toujours la même adresse : les données sont enregistrées dans le navigateur et liées à l'adresse utilisée.

## Menus

| Menu | Contenu |
|---|---|
| QG | Niveaux des 4 domaines, série de jours, séances de la semaine, **tâches à faire** (3 max, s'effacent à minuit), quêtes de PNJ en cours, **boss de la semaine** et **récompenses** à prendre |
| Corps | Tests physiques (rangs E → D → C → B → A → S → SS), séances (titre, description, photo), régularité, course à pied (import GPX/TCX), check-in photo |
| Métier | Carte de compétences en radar, poste actuel et poste visé avec l'écart à combler, 5 QCM par thématique (Fondamentaux → Maître) |
| Esprit | Bibliothèque par thèmes : livres et vidéos avec résumé, mini test, notes des joueurs, classement, contributions |
| Quêtes | Grandes quêtes des 10 PNJ et **contrats**, validés d'un clic « Je l'ai fait » |
| Multijoueur | Classement (photo ou avatar), cartes de joueur, **clan** avec son classement interne |
| Profil | Statistiques, titres, rangs, journal d'XP et réglages |

Plus on monte, plus il faut d'XP : passer du niveau n au niveau n+1 coûte `100 × n^1.6` XP (`250 × n^1.6` pour le personnage).

## Boss et récompenses automatiques

Rien à saisir : tout est calculé (`js/events.js`).

- **Boss** : un par semaine, apparu entre lundi et mercredi. Sa quête vise l'un de tes deux domaines les plus faibles et sa difficulté suit ton niveau dans ce domaine. Elle se valide toute seule avec ce que tu fais après son apparition. Non terminée dimanche soir, elle remet la série de jours à zéro.
- **Récompenses** : offertes en pop-up quand tu as gagné assez d'XP depuis la précédente (`200 + 50 × niveau`). Au plus 2 en attente et 2 par semaine, au moins une toutes les 2 semaines si tu as un minimum travaillé. Ce sont des plaisirs simples et peu coûteux, choisis selon le domaine où tu as le plus avancé.

## Esprit : la bibliothèque

- 3 thèmes choisis à l'inscription (modifiables), parmi 11.
- 33 contenus de départ (`js/data/library.js`), chacun avec étiquette de thème, résumé et mini test de 3 questions (2 bonnes réponses pour valider, nouvel essai 1 h après un échec).
- Les vidéos ouvrent une recherche YouTube sur leur titre exact : aucun identifiant de vidéo n'est codé en dur. Un contenu proposé par un joueur garde le lien qu'il a fourni.
- **Proposer** : type, thème, lien, résumé et 3 questions. **Noter** de 1 à 5 étoiles un contenu validé. **Les meilleurs** : semaine, mois, depuis toujours.
- Contributions et notes sont des données partagées (`Store.loadShared`). Sans serveur, elles le sont entre les profils de l'appareil, avec un export/import par fichier entre amis.

## Métier

- 6 thématiques informatiques × 5 QCM (`js/data/quiz-it.js` pour les paliers 1 à 3, `js/data/quiz-it-expert.js` pour Expert et Maître).
- Postes et niveaux attendus par thématique : `js/data/jobs.js`. Le radar compare ton niveau au poste visé et propose la prochaine étape.
- Prévu : chemin de progression automatique vers le poste visé, certifications suggérées selon le profil.

## Personnage, avatar et carte

- À la création : prénom, **taille et poids**, photo de profil (optionnelle), **poste actuel et poste visé**, 3 thèmes pour l'Esprit.
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
- PNJ et quêtes : `js/data/npcs.js` · boss et récompenses : `js/events.js` · bibliothèque : `js/data/library.js`
- Questions et postes : `js/data/quiz-it.js`, `js/data/quiz-it-expert.js`, `js/data/jobs.js`
- Couleurs : jetons en haut de `css/style.css` (thèmes sombre et clair).

## Données

Tout reste en local : l'état de chaque profil dans `localStorage`, les photos (compressées) dans IndexedDB. Exporte régulièrement depuis Profil → Réglages (fichier .json, photos comprises).
