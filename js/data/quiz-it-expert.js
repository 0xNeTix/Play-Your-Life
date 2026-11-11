/* Paliers 4 (Expert) et 5 (Maître) de la banque Informatique.
   Même format que quiz-it.js : { q, a: [bonne, mauvaise, mauvaise, mauvaise], e } */
(() => {
  const EXTRA = {
    reseau: [
      [
        { q: 'Sur un routeur Cisco, quel attribut BGP est comparé en premier pour choisir le meilleur chemin ?', a: ['Weight', 'AS_PATH', 'MED', 'Origin'], e: 'Weight (propriétaire Cisco, local au routeur), puis Local Preference, routes originées localement, AS_PATH le plus court, Origin, MED…' },
        { q: 'Qu\'est-ce que MPLS ?', a: ['Une commutation par labels insérés entre les couches 2 et 3', 'Un protocole de chiffrement de liens', 'Un protocole de routage à vecteur de distance', 'Une norme Wi-Fi d\'entreprise'], e: 'Les routeurs commutent sur un label court au lieu d\'analyser l\'adresse IP : base des VPN L3 opérateurs et de l\'ingénierie de trafic.' },
        { q: 'Quel type de LSA OSPF un ABR génère-t-il pour annoncer les réseaux d\'une autre zone ?', a: ['Type 3 (Summary)', 'Type 1 (Router)', 'Type 5 (External)', 'Type 7 (NSSA)'], e: 'Type 1 et 2 restent dans la zone, type 3 traverse les zones, type 5 vient d\'un ASBR, type 7 est propre aux zones NSSA.' },
        { q: 'Que fait LACP (802.3ad) ?', a: ['Il agrège plusieurs liens physiques en un lien logique', 'Il élit un routeur passerelle', 'Il chiffre les trames Ethernet', 'Il attribue les VLAN dynamiquement'], e: 'Plus de bande passante et de la redondance : si un lien tombe, le trafic passe par les autres.' },
        { q: 'Qu\'est-ce que VXLAN ?', a: ['Une encapsulation de trames L2 dans UDP pour étendre des segments au-dessus d\'un réseau IP', 'Un VLAN chiffré', 'Un protocole de découverte de voisins', 'Une version d\'OSPF pour IPv6'], e: 'Identifiant VNI sur 24 bits : jusqu\'à 16 millions de segments, contre 4094 VLAN.' },
        { q: 'Quelle est la distance administrative par défaut d\'OSPF chez Cisco ?', a: ['110', '90', '120', '20'], e: '90 = EIGRP interne, 120 = RIP, 20 = eBGP, 110 = OSPF.' },
      ],
      [
        { q: 'Pourquoi un pair iBGP ne réannonce-t-il pas une route apprise d\'un autre pair iBGP ?', a: ['Règle de split-horizon iBGP, pour éviter les boucles : il faut un full-mesh, des route reflectors ou des confédérations', 'Parce que le TTL est limité à 1', 'Parce que la route n\'a pas de MED', 'Parce qu\'iBGP n\'utilise pas TCP'], e: 'L\'AS_PATH ne change pas en iBGP, il ne peut donc pas détecter de boucle : d\'où cette règle.' },
        { q: 'Que permet le Segment Routing ?', a: ['Un routage par la source : le chemin est encodé comme une liste de segments, sans LDP ni RSVP', 'Le découpage d\'un réseau en VLAN', 'La fragmentation des paquets IPv6', 'Le chiffrement de bout en bout'], e: 'L\'état du chemin est porté par le paquet, le cœur du réseau reste simple.' },
        { q: 'En EVPN-VXLAN, quel type de route annonce les adresses MAC et IP des hôtes ?', a: ['Type 2', 'Type 5', 'Type 3', 'Type 1'], e: 'Type 2 = MAC/IP, type 3 = inclusive multicast, type 5 = préfixes IP, type 1 = Ethernet auto-discovery.' },
        { q: 'Qu\'est-ce que l\'ECMP ?', a: ['La répartition du trafic sur plusieurs chemins de coût égal', 'Un protocole de multicast', 'Un mécanisme de QoS', 'Un protocole de supervision'], e: 'Le hachage par flux garde les paquets d\'une même connexion sur le même chemin.' },
        { q: 'Quel marquage QoS utilise 6 bits de l\'en-tête IP ?', a: ['DSCP', 'CoS 802.1p', 'TTL', 'MTU'], e: 'CoS (802.1p) est sur 3 bits dans la trame Ethernet ; DSCP est sur 6 bits dans l\'en-tête IP.' },
        { q: 'En IPv6, quel mécanisme remplace ARP ?', a: ['NDP (Neighbor Discovery, via ICMPv6)', 'DHCPv6', 'IGMPv3', 'RARP'], e: 'Neighbor Solicitation et Neighbor Advertisement résolvent les adresses de couche 2.' },
      ],
    ],
    dev: [
      [
        { q: 'Comment rendre sûr un consommateur de messages livrés « au moins une fois » ?', a: ['Rendre le traitement idempotent (clé de déduplication)', 'Augmenter le délai d\'expiration', 'Ajouter plus de consommateurs', 'Désactiver les acquittements'], e: 'Recevoir deux fois le même message doit produire le même effet qu\'une seule fois.' },
        { q: 'Qu\'est-ce que le pattern CQRS ?', a: ['Séparer le modèle d\'écriture (commandes) du modèle de lecture (requêtes)', 'Mettre en cache toutes les requêtes', 'Un framework de tests', 'Un protocole de file de messages'], e: 'Chaque côté est optimisé pour son usage ; souvent associé à l\'event sourcing.' },
        { q: 'Pourquoi les bases de données utilisent-elles des arbres B+ pour leurs index ?', a: ['Faible hauteur et parcours ordonné : peu d\'accès disque', 'Ils n\'occupent aucun espace', 'Ils évitent tout verrou', 'Ils trient les données à l\'insertion uniquement'], e: 'Des nœuds larges = peu de niveaux, et les feuilles chaînées permettent les requêtes par plage.' },
        { q: 'À quoi sert `git reflog` ?', a: ['Retrouver les positions passées de HEAD, et donc des commits « perdus »', 'Afficher les fichiers ignorés', 'Nettoyer les branches distantes', 'Signer les commits'], e: 'Très utile après un reset ou un rebase raté.' },
        { q: 'Quelle est la complexité du tri fusion dans le pire cas ?', a: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], e: 'Contrairement au tri rapide, dont le pire cas est O(n²).' },
        { q: 'Qu\'est-ce qu\'un interblocage (deadlock) ?', a: ['Des tâches qui s\'attendent mutuellement pour des ressources verrouillées', 'Une boucle infinie', 'Une fuite mémoire', 'Une exception non capturée'], e: 'Parade classique : toujours prendre les verrous dans le même ordre.' },
      ],
      [
        { q: 'Selon la loi d\'Amdahl, si 10 % d\'un programme est séquentiel, quelle est l\'accélération maximale ?', a: ['10×', 'Infinie', '90×', '2×'], e: 'Accélération max = 1 / fraction séquentielle = 1 / 0,1.' },
        { q: 'Qu\'est-ce qu\'un CRDT ?', a: ['Une structure de données répliquée qui converge sans coordination', 'Un algorithme de chiffrement', 'Un type de base relationnelle', 'Un format de sérialisation'], e: 'Utilisé pour l\'édition collaborative et les applis hors ligne.' },
        { q: 'Que fait l\'algorithme de consensus Raft ?', a: ['Il élit un leader et réplique un journal ordonné sur un cluster tolérant les pannes', 'Il trie des données distribuées', 'Il répartit la charge HTTP', 'Il compresse des journaux'], e: 'Utilisé par etcd, Consul… Une majorité de nœuds doit être disponible.' },
        { q: 'Dans le pattern Saga, comment annule-t-on une transaction distribuée ?', a: ['Par des transactions de compensation exécutées en sens inverse', 'Par un commit en deux phases', 'Par un rollback global de la base', 'En redémarrant les services'], e: 'Chaque étape a son action compensatoire, car il n\'y a pas de transaction ACID globale.' },
        { q: 'Qu\'est-ce que le « cache stampede » ?', a: ['De nombreuses requêtes recalculent en même temps la même entrée de cache expirée', 'Un cache trop petit', 'Une corruption du cache', 'Un cache qui ne s\'invalide jamais'], e: 'Parades : verrou par clé, expiration anticipée probabiliste, valeur périmée servie pendant le recalcul.' },
        { q: 'Que signifie qu\'un problème est NP-complet ?', a: ['Il est dans NP et tout problème de NP s\'y réduit en temps polynomial', 'Il est impossible à résoudre', 'Il se résout en temps linéaire', 'Il n\'a pas de solution vérifiable'], e: 'Ex. SAT, voyageur de commerce (décision). Aucun algorithme polynomial connu.' },
      ],
    ],
    cyber: [
      [
        { q: 'Qu\'est-ce qu\'une attaque Pass-the-Hash ?', a: ['S\'authentifier avec l\'empreinte NTLM d\'un mot de passe sans le connaître', 'Deviner un mot de passe par force brute', 'Intercepter un cookie de session', 'Injecter du code dans une page'], e: 'Parades : LAPS, comptes à privilèges séparés, Credential Guard.' },
        { q: 'À quoi sert un SIEM ?', a: ['Collecter et corréler les journaux pour détecter des incidents', 'Chiffrer les postes de travail', 'Gérer les mots de passe', 'Filtrer le trafic web'], e: 'Ex. Splunk, Elastic, Sentinel : cœur d\'un SOC.' },
        { q: 'Que décrit la Cyber Kill Chain ?', a: ['Les étapes d\'une intrusion, de la reconnaissance aux actions sur l\'objectif', 'Une chaîne de certificats', 'Le cycle de vie d\'un mot de passe', 'Un processus de sauvegarde'], e: 'Reconnaissance, armement, livraison, exploitation, installation, commande et contrôle, actions.' },
        { q: 'Qu\'est-ce qu\'une faille SSRF ?', a: ['Forcer le serveur à émettre des requêtes vers des cibles choisies par l\'attaquant', 'Voler la session d\'un utilisateur', 'Injecter du SQL', 'Saturer le serveur'], e: 'Cible typique : les métadonnées cloud (169.254.169.254) ou des services internes.' },
        { q: 'En pentest, qu\'appelle-t-on élévation de privilèges ?', a: ['Obtenir des droits supérieurs à ceux obtenus au départ', 'Ouvrir un port', 'Créer un compte invité', 'Scanner le réseau'], e: 'Ex. d\'un compte utilisateur vers root ou administrateur du domaine.' },
        { q: 'Qu\'est-ce que DMARC ?', a: ['Une politique DNS qui s\'appuie sur SPF et DKIM pour traiter les e-mails non authentifiés', 'Un antivirus de messagerie', 'Un protocole de chiffrement des e-mails', 'Un format de signature PDF'], e: 'Politiques none, quarantine ou reject, avec des rapports agrégés.' },
      ],
      [
        { q: 'Qu\'est-ce qu\'une attaque DCSync ?', a: ['Se faire passer pour un contrôleur de domaine pour obtenir par réplication les empreintes de l\'AD', 'Synchroniser l\'heure du domaine', 'Créer un faux serveur DNS', 'Saturer la réplication'], e: 'Nécessite les droits de réplication ; à surveiller dans les journaux du DC.' },
        { q: 'Quel principe est au cœur du Zero Trust ?', a: ['Aucune confiance implicite : chaque accès est vérifié selon l\'identité, le contexte et le moindre privilège', 'Faire confiance au réseau interne', 'Bloquer tout accès distant', 'Remplacer le pare-feu par un VPN'], e: 'Le périmètre n\'est plus le réseau, c\'est chaque requête.' },
        { q: 'Qu\'est-ce qu\'une attaque « padding oracle » ?', a: ['Exploiter les erreurs de padding pour déchiffrer un message chiffré en CBC', 'Remplir un formulaire automatiquement', 'Saturer un champ de saisie', 'Deviner la longueur d\'un mot de passe'], e: 'Parade : chiffrement authentifié (AES-GCM) et messages d\'erreur uniformes.' },
        { q: 'Que fait l\'ASLR ?', a: ['Elle rend aléatoires les adresses mémoire des segments pour compliquer l\'exploitation', 'Elle chiffre la mémoire vive', 'Elle bloque les ports inutilisés', 'Elle signe les exécutables'], e: 'Souvent couplée à DEP/NX et aux stack canaries.' },
        { q: 'Qu\'est-ce qu\'un Golden Ticket Kerberos ?', a: ['Un TGT forgé avec la clé du compte krbtgt, qui donne accès à tout le domaine', 'Un ticket d\'accès invité', 'Un certificat racine', 'Un jeton OAuth expiré'], e: 'Remédiation : réinitialiser deux fois le mot de passe du compte krbtgt.' },
        { q: 'Qu\'est-ce qu\'une attaque par canal auxiliaire ?', a: ['Déduire des secrets à partir d\'effets mesurables : temps, consommation, cache', 'Attaquer par le Wi-Fi invité', 'Passer par un sous-traitant', 'Utiliser un second écran'], e: 'Ex. Spectre, Meltdown, attaques temporelles sur des comparaisons de chaînes.' },
      ],
    ],
    cloud: [
      [
        { q: 'Quel objet Kubernetes fait tourner un pod sur chaque nœud ?', a: ['DaemonSet', 'Deployment', 'StatefulSet', 'Job'], e: 'Idéal pour les agents de logs ou de supervision.' },
        { q: 'À quoi sert un StatefulSet ?', a: ['Déployer des pods avec une identité réseau stable et un stockage persistant dédié', 'Exécuter une tâche ponctuelle', 'Exposer des pods sur Internet', 'Stocker des secrets'], e: 'Utilisé pour les bases de données et les systèmes en cluster.' },
        { q: 'Que fait un Horizontal Pod Autoscaler ?', a: ['Il ajuste le nombre de réplicas selon des métriques', 'Il augmente la RAM d\'un pod', 'Il ajoute des nœuds au cluster', 'Il redémarre les pods en erreur'], e: 'Ajouter des nœuds, c\'est le rôle du Cluster Autoscaler.' },
        { q: 'À quoi sert un module Terraform ?', a: ['Regrouper et réutiliser un ensemble de ressources paramétrables', 'Stocker le state', 'Exécuter des scripts shell', 'Gérer les versions du provider'], e: 'Entrées (variables), sorties (outputs), réutilisables entre environnements.' },
        { q: 'Que mesure le RPO d\'un plan de reprise ?', a: ['La perte de données maximale acceptée, exprimée en temps', 'La durée maximale d\'indisponibilité', 'Le coût de la reprise', 'Le nombre de sauvegardes'], e: 'La durée maximale d\'indisponibilité, c\'est le RTO.' },
        { q: 'Qu\'est-ce qu\'un service mesh ?', a: ['Une couche qui gère le trafic entre services (mTLS, retries, observabilité) via des proxys', 'Un réseau physique de serveurs', 'Un équilibreur de charge DNS', 'Un registre d\'images'], e: 'Ex. Istio, Linkerd.' },
      ],
      [
        { q: 'Quelle stratégie expose une nouvelle version à une petite fraction du trafic avant de la généraliser ?', a: ['Canary', 'Recreate', 'Big bang', 'Shadow'], e: 'Shadow duplique le trafic sans servir la réponse ; Recreate coupe tout puis redéploie.' },
        { q: 'Qu\'est-ce qu\'un SLO ?', a: ['Un objectif chiffré de fiabilité sur un indicateur, ex. 99,9 % de requêtes réussies sur 30 jours', 'Un contrat avec pénalités financières', 'Un outil de supervision', 'Un journal d\'incidents'], e: 'Le contrat avec pénalités, c\'est le SLA ; l\'indicateur mesuré, le SLI.' },
        { q: 'Que représente l\'error budget ?', a: ['La marge d\'indisponibilité tolérée par le SLO, qui conditionne le rythme des mises en production', 'Le budget du service cloud', 'Le nombre de bugs autorisés par sprint', 'Le coût d\'un incident'], e: 'Budget épuisé = priorité à la fiabilité plutôt qu\'aux nouveautés.' },
        { q: 'Que fait un Operator Kubernetes ?', a: ['Il encode la logique d\'exploitation d\'une application via des CRD et un contrôleur', 'Il remplace kubectl', 'Il gère la facturation', 'Il chiffre les volumes'], e: 'Ex. opérateurs PostgreSQL qui gèrent sauvegardes, bascules, mises à jour.' },
        { q: 'Quelle différence entre un conteneur et une microVM comme Firecracker ?', a: ['La microVM a son propre noyau, donc une isolation plus forte', 'Le conteneur démarre plus lentement', 'La microVM n\'a pas de réseau', 'Aucune'], e: 'Utilisé pour le serverless multi-locataire (AWS Lambda, Fargate).' },
        { q: 'Qu\'est-ce qu\'une architecture « cellulaire » ?', a: ['Un service découpé en cellules indépendantes pour limiter l\'impact d\'une panne', 'Un réseau 5G privé', 'Un cluster à un seul nœud', 'Un cache distribué'], e: 'Une panne ou un mauvais déploiement ne touche qu\'une fraction des clients.' },
      ],
    ],
    systeme: [
      [
        { q: 'Que fait `strace` ?', a: ['Il trace les appels système d\'un processus', 'Il affiche l\'arbre des processus', 'Il mesure la bande passante', 'Il vérifie le système de fichiers'], e: 'Ex. `strace -p PID -e trace=open,read` pour voir ce qu\'un programme ouvre.' },
        { q: 'Quelle commande affiche les journaux d\'un service systemd ?', a: ['journalctl -u nom-du-service', 'systemctl logs nom-du-service', 'dmesg nom-du-service', 'tail /var/log/systemd'], e: 'Ajoute `-f` pour suivre en direct, `--since today` pour filtrer.' },
        { q: 'Que sont les cgroups ?', a: ['Un mécanisme du noyau pour limiter et mesurer les ressources de groupes de processus', 'Des groupes d\'utilisateurs', 'Des groupes de disques RAID', 'Des fichiers de configuration réseau'], e: 'Base des limites CPU et mémoire des conteneurs.' },
        { q: 'Quelle différence entre RAID 1 et RAID 5 ?', a: ['RAID 1 duplique les données, RAID 5 répartit données et parité sur au moins 3 disques', 'RAID 5 n\'offre aucune redondance', 'RAID 1 demande au moins 4 disques', 'Ce sont des synonymes'], e: 'RAID 5 survit à la perte d\'un disque ; RAID 6 à deux.' },
        { q: 'Que fait SELinux ?', a: ['Un contrôle d\'accès obligatoire basé sur des étiquettes de sécurité', 'Un pare-feu applicatif', 'Un antivirus', 'Une sauvegarde automatique'], e: 'Même root est contraint par la politique. Modes enforcing, permissive, disabled.' },
        { q: 'Quel rôle FSMO gère l\'heure de référence et les changements de mot de passe d\'un domaine AD ?', a: ['Émulateur PDC', 'Maître RID', 'Maître d\'infrastructure', 'Maître de schéma'], e: 'Le maître RID distribue les plages d\'identifiants ; le maître de schéma gère le schéma de la forêt.' },
      ],
      [
        { q: 'Que sont les namespaces Linux ?', a: ['Une isolation de la vue du système (PID, réseau, montages, utilisateurs) pour un groupe de processus', 'Des dossiers partagés', 'Des noms DNS locaux', 'Des modules du noyau'], e: 'Avec les cgroups, ils forment la base des conteneurs.' },
        { q: 'Quelle technologie permet d\'exécuter du code sandboxé dans le noyau pour l\'observabilité ou le réseau ?', a: ['eBPF', 'SystemTap', 'DKMS', 'udev'], e: 'Utilisée par Cilium, Falco, bpftrace…' },
        { q: 'Que signifie le copy-on-write lors d\'un fork() ?', a: ['Les pages mémoire sont partagées et ne sont copiées qu\'à la première écriture', 'Le processus enfant reçoit une copie immédiate de toute la mémoire', 'Les fichiers sont dupliqués sur disque', 'Le parent est mis en pause'], e: 'C\'est ce qui rend fork() rapide.' },
        { q: 'À quoi sert le journal d\'un système de fichiers comme ext4 ?', a: ['Garantir la cohérence après un crash en rejouant ou annulant les opérations', 'Garder l\'historique des fichiers supprimés', 'Accélérer la lecture', 'Chiffrer les métadonnées'], e: 'Évite un fsck complet après une coupure de courant.' },
        { q: 'Que révèle un iowait élevé ?', a: ['Le CPU est inactif en attendant des entrées/sorties', 'Le CPU est saturé de calculs', 'La mémoire est pleine', 'Le réseau est coupé'], e: 'À croiser avec iostat pour identifier le disque en cause.' },
        { q: 'Qu\'est-ce qu\'une relation d\'approbation (trust) dans Active Directory ?', a: ['Un lien permettant aux utilisateurs d\'un domaine d\'accéder aux ressources d\'un autre', 'Une stratégie de mot de passe', 'Un certificat de domaine', 'Un groupe d\'administrateurs'], e: 'Une approbation peut être unidirectionnelle ou bidirectionnelle, transitive ou non.' },
      ],
    ],
    data: [
      [
        { q: 'Qu\'est-ce qu\'un index couvrant ?', a: ['Un index qui contient toutes les colonnes nécessaires à la requête', 'Un index sur toutes les tables', 'Un index unique', 'Un index sur la clé primaire'], e: 'La requête est servie par l\'index seul, sans lire la table.' },
        { q: 'Qu\'est-ce que le MVCC ?', a: ['Plusieurs versions des lignes coexistent : chaque transaction lit un instantané sans bloquer les écritures', 'Un type de réplication', 'Un format de sauvegarde', 'Un langage de requête'], e: 'Utilisé par PostgreSQL, Oracle, InnoDB. Le VACUUM nettoie les anciennes versions.' },
        { q: 'À quoi sert une CTE récursive (WITH RECURSIVE) ?', a: ['Parcourir des hiérarchies ou des graphes', 'Créer une table temporaire indexée', 'Accélérer les jointures', 'Supprimer les doublons'], e: 'Ex. organigramme : chaque employé et toute sa chaîne de managers.' },
        { q: 'Quelle différence entre OLTP et OLAP ?', a: ['OLTP : beaucoup de petites transactions ; OLAP : requêtes analytiques sur de gros volumes', 'OLAP est réservé aux bases NoSQL', 'OLTP ne gère pas les transactions', 'Aucune'], e: 'Une appli de caisse fait de l\'OLTP, un tableau de bord BI de l\'OLAP.' },
        { q: 'Qu\'est-ce que la dénormalisation ?', a: ['Introduire volontairement de la redondance pour accélérer les lectures', 'Corriger une base mal normalisée', 'Supprimer les index', 'Fusionner deux bases'], e: 'Au prix d\'écritures plus complexes et d\'un risque d\'incohérence.' },
        { q: 'À quoi sert le partitionnement d\'une table ?', a: ['Découper une table selon une clé (date…) pour n\'en lire qu\'une partie', 'Répartir la table sur plusieurs serveurs', 'Chiffrer une table', 'Dupliquer une table'], e: 'Le planificateur élague les partitions inutiles. Sur plusieurs serveurs, on parle de sharding.' },
      ],
      [
        { q: 'Que garantit le niveau d\'isolation Read Committed ?', a: ['Pas de lecture sale, mais des lectures non répétables restent possibles', 'Aucune anomalie possible', 'Des lectures sales autorisées', 'Un instantané figé pour toute la transaction'], e: 'C\'est le niveau par défaut de PostgreSQL et d\'Oracle.' },
        { q: 'Qu\'est-ce qu\'une anomalie de « write skew » ?', a: ['Deux transactions lisent les mêmes données, écrivent des lignes différentes et violent ensemble une contrainte', 'Une écriture perdue sur la même ligne', 'Une lecture d\'une donnée non validée', 'Une corruption de l\'index'], e: 'Possible en snapshot isolation ; évitée en SERIALIZABLE.' },
        { q: 'Dans Kafka, que garantit une partition ?', a: ['L\'ordre des messages au sein de la partition', 'L\'ordre global du topic', 'La livraison exactement une fois par défaut', 'La suppression des doublons'], e: 'Les messages d\'une même clé vont dans la même partition, donc restent ordonnés.' },
        { q: 'Qu\'est-ce que le Change Data Capture ?', a: ['Capturer les modifications d\'une base, souvent via son journal, pour les propager ailleurs', 'Un outil de visualisation', 'Une sauvegarde quotidienne', 'Un type d\'index'], e: 'Ex. Debezium lit le WAL ou le binlog et publie les changements.' },
        { q: 'Pourquoi un format colonne comme Parquet accélère-t-il l\'analytique ?', a: ['On ne lit que les colonnes utiles et la compression par colonne est très efficace', 'Il stocke tout en mémoire', 'Il n\'a pas de schéma', 'Il interdit les jointures'], e: 'Une requête qui agrège 3 colonnes sur 50 ne lit qu\'une fraction du fichier.' },
        { q: 'Qu\'est-ce qu\'une dimension à évolution lente de type 2 ?', a: ['On garde l\'historique en créant une nouvelle ligne versionnée à chaque changement', 'On écrase l\'ancienne valeur', 'On ajoute une colonne « valeur précédente »', 'On supprime la dimension'], e: 'Avec des dates de validité ou un indicateur de ligne courante.' },
      ],
    ],
  };
  const bank = QUIZ_BANKS.it;
  bank.tierNames = ['', 'Fondamentaux', 'Intermédiaire', 'Avancé', 'Expert', 'Maître'];
  const ICONS = { reseau: 'network', dev: 'code', cyber: 'shield', cloud: 'cloud', systeme: 'server', data: 'database' };
  for (const sd of bank.subdomains) {
    if (EXTRA[sd.id]) sd.tiers.push(...EXTRA[sd.id]);
    if (ICONS[sd.id]) sd.icon = Icons.get(ICONS[sd.id], 22);
  }
})();
