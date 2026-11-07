# RPG IRL

Ta vie réelle, présentée comme un jeu vidéo. On ne gagne aucun XP en planifiant, uniquement en faisant des choses vérifiables.

## Lancer

Double-clique sur `Lancer.bat`. Il démarre `python -m http.server 8765` et ouvre http://localhost:8765.
Utilise toujours la même adresse : les données sont enregistrées dans le navigateur et liées à l'adresse utilisée.

## Domaines

| Domaine | Comment gagner de l'XP |
|---|---|
| 💼 Métier | Tests de connaissances par sous-domaine (3 paliers), missions pratiques débloquées par palier, réalisations réelles (certifications, projets…) |
| 💪 Corps | Tests max pompes / squats / gainage (rangs E → S+), check-in photo hebdomadaire avec auto-évaluation notée sur 100 |
| 🧠 Esprit | Livres terminés (3 enseignements obligatoires), sessions d'apprentissage chronométrées |
| ⚡ Discipline | 3 quêtes par jour maximum (elles expirent à minuit), série de jours, boss de la semaine |

Chaque niveau débloque un titre, de nouvelles missions IRL ou les **récompenses réelles** que tu définis dans l'onglet Récompenses.

## Personnaliser

- Barèmes d'XP, titres, missions, rangs : `js/data/content.js`
- Questions informatique : `js/data/quiz-it.js`. Pour un autre métier, copie ce fichier, change la clé (`QUIZ_BANKS.monmetier`), ajoute le `<script>` dans `index.html` et l'option dans `GAME.proDomains`.

## Données

Tout reste en local : l'état dans `localStorage`, les photos (compressées) dans IndexedDB. Pense à faire un export régulier depuis Réglages (fichier .json, photos comprises).
