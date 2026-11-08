/* Bibliothèque d'exercices pour le carnet de séances.
   kind : 'reps' (poids du corps, répétitions) · 'kg' (charge × répétitions) · 'time' (secondes) · 'cardio' (minutes) */
const EXERCISES = (() => {
  const groups = {
    'Poids du corps — haut': [
      ['pushup', 'Pompes'], ['pushup-diamond', 'Pompes diamant'], ['pushup-wide', 'Pompes prise large'], ['pushup-decline', 'Pompes déclinées'],
      ['pushup-archer', 'Pompes archer'], ['pushup-pike', 'Pompes piquées (pike)'], ['hspu', 'Pompes en équilibre (HSPU)'], ['dips', 'Dips'],
      ['bench-dips', 'Dips sur banc'], ['pullup', 'Tractions pronation'], ['chinup', 'Tractions supination'], ['pullup-neutral', 'Tractions prise neutre'],
      ['australian', 'Rowing inversé (australian pull-up)'], ['muscleup', 'Muscle-up'], ['scap-pull', 'Tractions scapulaires'],
    ],
    'Poids du corps — bas': [
      ['squat', 'Squats'], ['squat-jump', 'Squats sautés'], ['lunge', 'Fentes'], ['lunge-jump', 'Fentes sautées'], ['bulgarian', 'Fentes bulgares'],
      ['pistol', 'Pistol squat'], ['step-up', 'Montées sur banc'], ['glute-bridge', 'Pont fessier'], ['calf', 'Mollets debout'], ['nordic', 'Nordic curl'],
    ],
    'Gainage & abdos': [
      ['crunch', 'Crunchs'], ['leg-raise', 'Relevés de jambes'], ['hanging-leg-raise', 'Relevés de jambes suspendu'], ['russian-twist', 'Russian twist'],
      ['mountain-climber', 'Mountain climbers'], ['superman', 'Superman'], ['ab-wheel', 'Roue abdominale'],
    ],
    'Isométrie (temps)': [
      ['plank', 'Gainage'], ['side-plank', 'Gainage latéral'], ['hollow', 'Hollow body'], ['wall-sit', 'Chaise contre le mur'],
      ['l-sit', 'L-sit'], ['dead-hang', 'Suspension à la barre'], ['handstand', 'Équilibre sur les mains'],
    ],
    'Charges — poussée': [
      ['bench', 'Développé couché'], ['bench-incline', 'Développé incliné'], ['db-bench', 'Développé haltères'], ['ohp', 'Développé militaire'],
      ['db-shoulder', 'Développé épaules haltères'], ['fly', 'Écarté haltères'], ['lateral-raise', 'Élévations latérales'], ['triceps-ext', 'Extension triceps'],
      ['skullcrusher', 'Barre au front'], ['weighted-dips', 'Dips lestés'],
    ],
    'Charges — tirage': [
      ['deadlift', 'Soulevé de terre'], ['rdl', 'Soulevé de terre roumain'], ['row', 'Rowing barre'], ['db-row', 'Rowing haltère'],
      ['lat-pulldown', 'Tirage vertical'], ['cable-row', 'Tirage horizontal'], ['weighted-pullup', 'Tractions lestées'], ['face-pull', 'Face pull'],
      ['curl', 'Curl biceps'], ['hammer-curl', 'Curl marteau'], ['shrug', 'Shrugs'], ['rear-delt', 'Oiseau'],
    ],
    'Charges — jambes': [
      ['back-squat', 'Squat barre'], ['front-squat', 'Front squat'], ['goblet', 'Goblet squat'], ['leg-press', 'Presse à cuisses'], ['hip-thrust', 'Hip thrust'],
      ['db-lunge', 'Fentes haltères'], ['leg-ext', 'Leg extension'], ['leg-curl', 'Leg curl'], ['calf-machine', 'Mollets à la machine'],
    ],
    'Haltérophilie & fonctionnel': [
      ['kb-swing', 'Kettlebell swing'], ['clean', 'Épaulé'], ['snatch', 'Arraché'], ['thruster', 'Thruster'], ['farmer', 'Marche du fermier'],
      ['burpee', 'Burpees'], ['box-jump', 'Box jumps'], ['wall-ball', 'Wall balls'],
    ],
    'Cardio (minutes)': [
      ['bike', 'Vélo'], ['rower', 'Rameur'], ['elliptical', 'Elliptique'], ['swim', 'Natation'], ['jump-rope', 'Corde à sauter'],
      ['hiit', 'HIIT'], ['boxing', 'Boxe / sac de frappe'], ['climbing', 'Escalade'], ['walk', 'Marche'],
    ],
  };
  const kindOf = g => (g.startsWith('Charges') || g.startsWith('Haltéro') ? 'kg' : g.startsWith('Isométrie') ? 'time' : g.startsWith('Cardio') ? 'cardio' : 'reps');
  const list = [];
  for (const [group, items] of Object.entries(groups)) {
    for (const [id, name] of items) list.push({ id, name, group, kind: ['burpee', 'box-jump'].includes(id) ? 'reps' : kindOf(group) });
  }
  const byId = Object.fromEntries(list.map(e => [e.id, e]));
  return { groups, list, byId };
})();
