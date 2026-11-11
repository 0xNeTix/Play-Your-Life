/* Postes du domaine Informatique et niveau attendu (paliers de test, 0 à 5) par compétence.
   Sert au radar « Mon niveau / Poste visé » et à l'écart à combler.
   Base pour plus tard : chemin de progression et certifications proposés automatiquement. */
const JOBS = {
  it: [
    { id: 'support', name: 'Technicien support / helpdesk', req: { reseau: 2, dev: 1, cyber: 1, cloud: 1, systeme: 2, data: 1 } },
    { id: 'sysadmin', name: 'Administrateur systèmes et réseaux', req: { reseau: 4, dev: 1, cyber: 3, cloud: 2, systeme: 4, data: 2 } },
    { id: 'netengineer', name: 'Ingénieur réseau', req: { reseau: 5, dev: 1, cyber: 3, cloud: 2, systeme: 3, data: 1 } },
    { id: 'backend', name: 'Développeur back-end', req: { reseau: 2, dev: 5, cyber: 2, cloud: 3, systeme: 2, data: 4 } },
    { id: 'fullstack', name: 'Développeur full-stack', req: { reseau: 2, dev: 5, cyber: 2, cloud: 3, systeme: 2, data: 3 } },
    { id: 'devops', name: 'Ingénieur DevOps / SRE', req: { reseau: 3, dev: 4, cyber: 3, cloud: 5, systeme: 4, data: 2 } },
    { id: 'cloud', name: 'Ingénieur cloud', req: { reseau: 3, dev: 3, cyber: 3, cloud: 5, systeme: 3, data: 2 } },
    { id: 'soc', name: 'Analyste SOC / cybersécurité', req: { reseau: 4, dev: 2, cyber: 5, cloud: 2, systeme: 3, data: 2 } },
    { id: 'pentester', name: 'Pentester', req: { reseau: 4, dev: 3, cyber: 5, cloud: 2, systeme: 4, data: 2 } },
    { id: 'dataeng', name: 'Data engineer', req: { reseau: 1, dev: 4, cyber: 1, cloud: 3, systeme: 2, data: 5 } },
    { id: 'architect', name: 'Architecte SI', req: { reseau: 4, dev: 3, cyber: 4, cloud: 4, systeme: 4, data: 3 } },
  ],
};
