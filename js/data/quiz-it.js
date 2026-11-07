/* Banque de questions — Informatique.
   Format : { q, a: [bonne réponse, mauvaise, mauvaise, mauvaise], e: explication }
   Les réponses sont mélangées à l'affichage. 3 paliers par sous-domaine.
   Pour ajouter un domaine pro : créer un fichier sur ce modèle et l'enregistrer dans QUIZ_BANKS. */
const QUIZ_BANKS = window.QUIZ_BANKS || {};
QUIZ_BANKS.it = {
  name: 'Informatique',
  tierNames: ['', 'Fondamentaux', 'Intermédiaire', 'Avancé'],
  questionsPerQuiz: 5,
  passScore: 4,
  cooldownHours: 6,
  subdomains: [
    {
      id: 'reseau', name: 'Réseau', icon: '🌐',
      missions: [
        { tier: 1, xp: 80,  text: 'Cartographie ton réseau domestique (IP, masque, passerelle, DNS) avec ipconfig / ip a et fais-en un schéma' },
        { tier: 2, xp: 180, text: 'Monte un lab Packet Tracer ou GNS3 avec 2 VLAN et du routage inter-VLAN fonctionnel' },
        { tier: 3, xp: 350, text: 'Configure OSPF entre 3 routeurs dans un lab et capture les échanges avec Wireshark' },
      ],
      tiers: [
        [],
        [
          { q: 'Combien de couches compte le modèle OSI ?', a: ['7', '4', '5', '9'], e: 'Physique, Liaison, Réseau, Transport, Session, Présentation, Application. Le modèle TCP/IP, lui, en compte 4.' },
          { q: 'Quel protocole attribue automatiquement une adresse IP à une machine ?', a: ['DHCP', 'DNS', 'ARP', 'NAT'], e: 'DHCP distribue IP, masque, passerelle et DNS (échange DORA : Discover, Offer, Request, Ack).' },
          { q: 'Quel est le port par défaut de HTTPS ?', a: ['443', '80', '22', '8443'], e: '80 = HTTP, 22 = SSH, 443 = HTTPS.' },
          { q: 'Quel est le rôle principal du DNS ?', a: ['Traduire un nom de domaine en adresse IP', 'Chiffrer les échanges web', 'Attribuer des adresses IP', 'Router les paquets entre réseaux'], e: 'Le DNS résout par exemple example.com vers son adresse IP.' },
          { q: 'Sur combien de bits est codée une adresse IPv4 ?', a: ['32', '64', '128', '48'], e: 'IPv4 = 32 bits, IPv6 = 128 bits, adresse MAC = 48 bits.' },
          { q: 'Quel équipement travaille principalement en couche 2 (liaison) ?', a: ['Le switch', 'Le routeur', 'Le hub', 'Le proxy'], e: 'Le switch commute selon les adresses MAC. Le routeur est en couche 3, le hub en couche 1.' },
        ],
        [
          { q: 'Combien d\'adresses hôtes utilisables dans un sous-réseau /26 ?', a: ['62', '64', '30', '126'], e: '/26 laisse 6 bits hôtes : 2^6 = 64 adresses, moins le réseau et le broadcast = 62.' },
          { q: 'Quelle affirmation sur TCP et UDP est vraie ?', a: ['TCP est orienté connexion et garantit la livraison', 'UDP garantit l\'ordre des paquets', 'TCP n\'utilise pas de handshake', 'UDP utilise un 3-way handshake'], e: 'TCP : connexion (SYN, SYN-ACK, ACK), accusés, retransmission. UDP : sans connexion, plus léger.' },
          { q: 'À quoi sert ARP ?', a: ['Trouver l\'adresse MAC correspondant à une adresse IP', 'Trouver l\'IP correspondant à un nom', 'Attribuer une IP', 'Détecter les boucles réseau'], e: 'ARP fait le lien couche 3 → couche 2 sur un réseau local.' },
          { q: 'Que permet un VLAN ?', a: ['Segmenter logiquement un réseau de niveau 2', 'Augmenter le débit d\'un lien', 'Chiffrer le trafic local', 'Remplacer un routeur'], e: 'Un VLAN crée des domaines de broadcast séparés sur un même switch. Il faut du routage pour passer de l\'un à l\'autre.' },
          { q: 'Laquelle de ces plages est une plage privée (RFC 1918) ?', a: ['172.16.0.0/12', '172.32.0.0/12', '100.64.0.0/10', '169.254.0.0/16'], e: 'RFC 1918 : 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. 100.64/10 = CGNAT, 169.254/16 = link-local.' },
          { q: 'Que fait le PAT (NAT avec ports) d\'une box internet ?', a: ['Il partage une IP publique entre plusieurs IP privées grâce aux ports', 'Il chiffre le trafic sortant', 'Il attribue les IP privées', 'Il bloque tout le trafic entrant'], e: 'Le PAT réécrit IP et port source pour que de nombreux appareils sortent avec une seule IP publique.' },
        ],
        [
          { q: 'OSPF est un protocole de routage de type :', a: ['État de liens', 'Vecteur de distance', 'Vecteur de chemin', 'Statique'], e: 'OSPF construit une carte de la topologie et calcule les routes avec l\'algorithme de Dijkstra. RIP est à vecteur de distance, BGP à vecteur de chemin.' },
          { q: 'BGP établit ses sessions sur :', a: ['TCP 179', 'UDP 179', 'TCP 520', 'UDP 520'], e: 'BGP utilise TCP port 179. UDP 520 correspond à RIP.' },
          { q: 'Quel mécanisme évite les boucles de niveau 2 ?', a: ['Spanning Tree (STP)', 'OSPF', 'HSRP', 'LACP'], e: 'STP bloque des ports redondants pour obtenir une topologie sans boucle.' },
          { q: 'Quelle est la taille de l\'en-tête fixe IPv6 ?', a: ['40 octets', '20 octets', '32 octets', '60 octets'], e: 'L\'en-tête IPv6 fait 40 octets fixes, les options passent par des en-têtes d\'extension. IPv4 : 20 à 60 octets.' },
          { q: 'Que se passe-t-il quand le TTL d\'un paquet atteint 0 ?', a: ['Le paquet est détruit et un ICMP Time Exceeded est renvoyé', 'Le paquet est retransmis', 'Le paquet est mis en file d\'attente', 'Le routeur réinitialise le TTL'], e: 'C\'est le principe de traceroute : TTL croissants pour découvrir chaque saut.' },
          { q: 'Quel protocole standard ouvert fournit une passerelle par défaut redondante ?', a: ['VRRP', 'HSRP', 'GLBP', 'LACP'], e: 'VRRP est un standard IETF. HSRP et GLBP sont propriétaires Cisco. LACP agrège des liens.' },
        ],
      ],
    },
    {
      id: 'dev', name: 'Développement', icon: '💻',
      missions: [
        { tier: 1, xp: 80,  text: 'Crée un dépôt Git public et pousse un mini-projet avec un README' },
        { tier: 2, xp: 180, text: 'Développe une API REST CRUD avec des tests automatisés' },
        { tier: 3, xp: 350, text: 'Ouvre une pull request sur un projet open source que tu utilises' },
      ],
      tiers: [
        [],
        [
          { q: 'Que fait `git commit` ?', a: ['Enregistre les modifications indexées dans l\'historique local', 'Envoie les modifications sur le serveur distant', 'Crée une nouvelle branche', 'Fusionne deux branches'], e: 'commit = historique local. push = envoi vers le dépôt distant.' },
          { q: 'Quelle structure de données suit le principe LIFO ?', a: ['La pile', 'La file', 'L\'arbre binaire', 'La table de hachage'], e: 'Last In, First Out : le dernier élément empilé est le premier dépilé. La file est FIFO.' },
          { q: 'Que renvoie `typeof null` en JavaScript ?', a: ['"object"', '"null"', '"undefined"', '"number"'], e: 'Un héritage historique du langage : typeof null vaut "object".' },
          { q: 'Que signifie le code HTTP 404 ?', a: ['Ressource introuvable', 'Erreur interne du serveur', 'Accès non autorisé', 'Redirection permanente'], e: '404 = Not Found, 500 = erreur serveur, 401 = non authentifié, 301 = redirection permanente.' },
          { q: 'Dans une API REST, quel verbe sert généralement à créer une ressource ?', a: ['POST', 'GET', 'DELETE', 'HEAD'], e: 'POST crée, GET lit, PUT/PATCH modifie, DELETE supprime.' },
          { q: 'En Python, lequel de ces types est immuable ?', a: ['tuple', 'list', 'dict', 'set'], e: 'Un tuple ne peut pas être modifié après création, contrairement aux listes, dictionnaires et ensembles.' },
        ],
        [
          { q: 'Quelle est la complexité d\'une recherche dichotomique dans un tableau trié ?', a: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], e: 'On divise l\'espace de recherche par deux à chaque étape.' },
          { q: 'Que fait `git rebase` ?', a: ['Réapplique des commits par-dessus une autre base', 'Supprime une branche distante', 'Annule le dernier push', 'Crée un tag de version'], e: 'rebase réécrit l\'historique pour obtenir une histoire linéaire. À éviter sur une branche déjà partagée.' },
          { q: 'En JavaScript, quelle est la différence entre `==` et `===` ?', a: ['`===` compare sans conversion de type', '`===` compare uniquement les références', '`==` est plus strict que `===`', 'Il n\'y en a aucune'], e: '`0 == "0"` vaut true, `0 === "0"` vaut false.' },
          { q: 'Que signifie le « S » de SOLID ?', a: ['Responsabilité unique', 'Sécurité', 'Simplicité', 'Substitution'], e: 'Single Responsibility : une classe ne doit avoir qu\'une seule raison de changer. La substitution est le L (Liskov).' },
          { q: 'Quel code HTTP indique qu\'une ressource a été créée ?', a: ['201', '200', '204', '302'], e: '201 Created. 204 = succès sans contenu, 302 = redirection temporaire.' },
          { q: 'Qu\'est-ce que l\'injection de dépendances ?', a: ['Fournir à un objet ses dépendances depuis l\'extérieur plutôt qu\'il les crée', 'Une faille de sécurité', 'L\'installation de paquets npm', 'Le chargement dynamique de modules'], e: 'Elle découple le code et facilite les tests (on injecte des doublures).' },
        ],
        [
          { q: 'Lequel de ces verbes HTTP n\'est PAS idempotent ?', a: ['POST', 'PUT', 'DELETE', 'GET'], e: 'Répéter un POST peut créer plusieurs ressources. PUT, DELETE et GET produisent le même état quel que soit le nombre d\'appels.' },
          { q: 'En JS, qui s\'exécute en premier : `setTimeout(f, 0)` ou `Promise.resolve().then(g)` ?', a: ['g, car les microtâches passent avant les macrotâches', 'f, car il a été déclaré avant', 'L\'ordre est aléatoire', 'Les deux en parallèle'], e: 'Après chaque tâche, l\'event loop vide la file des microtâches (promesses) avant de prendre la tâche suivante (timers).' },
          { q: 'Que dit le théorème CAP ?', a: ['Un système distribué ne peut garantir à la fois cohérence, disponibilité et tolérance au partitionnement', 'Le cache améliore toujours les performances', 'Les API doivent être compatibles et paginées', 'Toute base doit être ACID'], e: 'En cas de partition réseau, il faut choisir entre cohérence et disponibilité.' },
          { q: 'Qu\'est-ce qu\'une race condition ?', a: ['Un résultat qui dépend de l\'ordre non maîtrisé de tâches concurrentes', 'Une boucle infinie', 'Un dépassement de pile', 'Une fuite mémoire'], e: 'Exemple : deux threads incrémentent un compteur sans verrou et des incréments sont perdus.' },
          { q: 'Quelle est la complexité moyenne d\'une insertion dans une table de hachage ?', a: ['O(1) amorti', 'O(log n)', 'O(n)', 'O(n²)'], e: 'En moyenne constante. Dans le pire cas (collisions massives) elle peut dégrader en O(n).' },
          { q: 'À quoi sert `git bisect` ?', a: ['Trouver par dichotomie le commit qui a introduit un bug', 'Couper une branche en deux', 'Fusionner deux dépôts', 'Comparer deux fichiers'], e: 'On marque un commit bon et un mauvais, Git teste les commits du milieu jusqu\'à isoler le coupable.' },
        ],
      ],
    },
    {
      id: 'cyber', name: 'Cybersécurité', icon: '🛡️',
      missions: [
        { tier: 1, xp: 80,  text: 'Active la double authentification sur tes 5 comptes principaux et adopte un gestionnaire de mots de passe' },
        { tier: 2, xp: 180, text: 'Termine 3 salles TryHackMe ou 5 challenges Root-Me' },
        { tier: 3, xp: 350, text: 'Rédige un write-up complet d\'une machine Hack The Box (retirée)' },
      ],
      tiers: [
        [],
        [
          { q: 'Qu\'est-ce que le phishing ?', a: ['Se faire passer pour un tiers de confiance pour obtenir des informations', 'Un virus qui surchauffe le processeur', 'Une attaque par saturation de serveur', 'Un pare-feu mal configuré'], e: 'Mail, SMS ou site imitant une banque ou un service pour voler identifiants ou argent.' },
          { q: 'Que signifie l\'authentification multifacteur (MFA) ?', a: ['Utiliser au moins deux facteurs de nature différente', 'Avoir deux mots de passe', 'Changer de mot de passe chaque mois', 'Se connecter depuis deux appareils'], e: 'Ce que je sais (mot de passe), ce que je possède (téléphone, clé), ce que je suis (biométrie).' },
          { q: 'Quel est le meilleur choix de mot de passe ?', a: ['Une longue phrase de passe unique par site', 'Prénom + date de naissance', 'P@ssw0rd!', 'Un mot de passe complexe réutilisé partout'], e: 'La longueur et l\'unicité comptent le plus. Un gestionnaire de mots de passe aide.' },
          { q: 'Quel est le rôle d\'un pare-feu ?', a: ['Filtrer le trafic réseau selon des règles', 'Chiffrer le disque dur', 'Supprimer les virus', 'Sauvegarder les données'], e: 'Il autorise ou bloque les flux selon IP, ports, protocoles, voire applications.' },
          { q: 'La triade de la sécurité de l\'information (CIA / DIC) regroupe :', a: ['Confidentialité, Intégrité, Disponibilité', 'Contrôle, Identité, Audit', 'Chiffrement, Isolation, Authentification', 'Conformité, Inventaire, Alerte'], e: 'Les trois propriétés à protéger pour toute donnée.' },
          { q: 'Qu\'est-ce qu\'un rançongiciel (ransomware) ?', a: ['Un logiciel qui chiffre les données et exige une rançon', 'Un logiciel publicitaire', 'Un outil de sauvegarde', 'Un antivirus gratuit'], e: 'La meilleure parade : des sauvegardes hors ligne testées régulièrement.' },
        ],
        [
          { q: 'Qu\'est-ce qui caractérise le chiffrement asymétrique ?', a: ['Une paire de clés : publique et privée', 'Une seule clé partagée', 'Il est plus rapide que le symétrique', 'Il ne sert qu\'au hachage'], e: 'Ex. RSA, ECC. En pratique on l\'utilise pour échanger une clé symétrique (AES) plus rapide.' },
          { q: 'Quelle méthode convient pour stocker des mots de passe ?', a: ['Argon2 ou bcrypt avec sel', 'MD5', 'SHA-1 sans sel', 'Encodage Base64'], e: 'Il faut une fonction lente et salée. Base64 n\'est pas du chiffrement.' },
          { q: 'Qu\'est-ce qu\'une faille XSS ?', a: ['L\'injection de script exécuté dans le navigateur des victimes', 'L\'injection de requêtes SQL', 'Une attaque par déni de service', 'Le vol physique d\'un serveur'], e: 'Parade : échapper les sorties, Content-Security-Policy, cookies HttpOnly.' },
          { q: 'Quelle est la protection principale contre l\'injection SQL ?', a: ['Les requêtes préparées (paramétrées)', 'Masquer les messages d\'erreur', 'Chiffrer la base', 'Passer le site en HTTPS'], e: 'Les paramètres ne sont jamais interprétés comme du SQL.' },
          { q: 'Le principe du moindre privilège consiste à :', a: ['N\'accorder que les droits strictement nécessaires', 'Donner les droits admin aux développeurs', 'Supprimer les comptes inactifs', 'Changer les mots de passe souvent'], e: 'Il limite l\'impact d\'un compte compromis.' },
          { q: 'À quoi sert principalement nmap ?', a: ['Scanner les ports et services d\'hôtes', 'Craquer des mots de passe', 'Analyser des malwares', 'Chiffrer des fichiers'], e: 'Découverte réseau : hôtes actifs, ports ouverts, versions de services, OS.' },
        ],
        [
          { q: 'Quelle mesure protège efficacement contre le CSRF ?', a: ['Jeton anti-CSRF et cookies SameSite', 'Requêtes préparées', 'Hachage des mots de passe', 'Pare-feu réseau'], e: 'Le CSRF force le navigateur d\'un utilisateur connecté à envoyer une requête. Un jeton imprévisible la rend impossible à forger.' },
          { q: 'Que garantit la Perfect Forward Secrecy ?', a: ['La compromission de la clé privée long terme ne permet pas de déchiffrer les sessions passées', 'Le chiffrement ne peut jamais être cassé', 'Les certificats n\'expirent pas', 'Les mots de passe sont salés'], e: 'Chaque session utilise une clé éphémère (DHE/ECDHE) détruite ensuite.' },
          { q: 'Qu\'est-ce que MITRE ATT&CK ?', a: ['Une base de connaissances des tactiques et techniques des attaquants', 'Un antivirus', 'Un algorithme de chiffrement', 'Une norme ISO'], e: 'Elle sert à cartographier les détections et à structurer l\'analyse d\'incidents.' },
          { q: 'Qu\'appelle-t-on un mouvement latéral ?', a: ['La progression d\'un attaquant d\'une machine compromise vers d\'autres', 'Le déplacement d\'un serveur entre datacenters', 'Une rotation des clés de chiffrement', 'Le changement de VLAN d\'un poste'], e: 'Ex. pass-the-hash, RDP ou PsExec avec des identifiants volés.' },
          { q: 'L\'attaque Kerberoasting cible :', a: ['Les comptes de service avec SPN, en craquant hors ligne leurs tickets TGS', 'Le contrôleur de domaine par déni de service', 'Les certificats TLS du domaine', 'Les mots de passe Wi-Fi'], e: 'Parade : mots de passe longs pour les comptes de service, gMSA, chiffrement AES.' },
          { q: 'En TLS 1.3, l\'échange de clés repose sur :', a: ['(EC)DHE éphémère', 'RSA statique', 'DES', 'Une clé prépartagée obligatoire'], e: 'TLS 1.3 a supprimé l\'échange de clés RSA statique : la confidentialité persistante est systématique.' },
        ],
      ],
    },
    {
      id: 'cloud', name: 'Cloud & DevOps', icon: '☁️',
      missions: [
        { tier: 1, xp: 80,  text: 'Lance un conteneur Docker nginx qui sert une page HTML que tu as écrite' },
        { tier: 2, xp: 180, text: 'Mets en place un pipeline CI (GitHub Actions ou GitLab CI) qui teste et déploie une app' },
        { tier: 3, xp: 350, text: 'Provisionne une infrastructure avec Terraform, puis détruis-la proprement' },
      ],
      tiers: [
        [],
        [
          { q: 'Gmail est un exemple de :', a: ['SaaS', 'IaaS', 'PaaS', 'Bare metal'], e: 'Logiciel prêt à l\'emploi. IaaS = machines virtuelles, PaaS = plateforme pour déployer son code.' },
          { q: 'Qu\'est-ce qu\'un conteneur Docker ?', a: ['Un processus isolé avec ses dépendances, qui partage le noyau de l\'hôte', 'Une machine virtuelle complète avec son propre OS', 'Un serveur physique dédié', 'Un format d\'archive compressée'], e: 'Plus léger qu\'une VM car il n\'embarque pas de noyau.' },
          { q: 'Que signifie CI/CD ?', a: ['Intégration continue / Livraison ou déploiement continu', 'Code Interne / Code Distant', 'Contrôle d\'Infrastructure / Contrôle de Données', 'Cloud Interne / Cloud Dédié'], e: 'Chaque modification est construite et testée automatiquement, puis livrée.' },
          { q: 'Que désigne l\'élasticité dans le cloud ?', a: ['Ajuster les ressources automatiquement selon la demande', 'La résistance aux pannes matérielles', 'La compatibilité entre fournisseurs', 'La compression des données'], e: 'On ajoute des ressources lors d\'un pic et on les retire ensuite : on paie l\'usage réel.' },
          { q: 'En IaaS, qui applique les correctifs de l\'OS des machines virtuelles ?', a: ['Le client', 'Le fournisseur cloud', 'Personne, c\'est automatique', 'L\'éditeur de l\'OS'], e: 'Modèle de responsabilité partagée : le fournisseur gère le matériel et l\'hyperviseur, le client tout ce qui est au-dessus.' },
          { q: 'Qu\'est-ce qu\'une région cloud ?', a: ['Une zone géographique regroupant plusieurs zones de disponibilité', 'Un seul serveur', 'Un compte client', 'Un réseau privé virtuel'], e: 'Chaque zone de disponibilité rassemble un ou plusieurs datacenters isolés.' },
        ],
        [
          { q: 'Quelle instruction Dockerfile s\'exécute pendant la construction de l\'image ?', a: ['RUN', 'CMD', 'ENTRYPOINT', 'EXPOSE'], e: 'RUN s\'exécute au build. CMD et ENTRYPOINT définissent ce qui tourne au démarrage du conteneur.' },
          { q: 'Quelle est la plus petite unité déployable dans Kubernetes ?', a: ['Le Pod', 'Le Node', 'Le Deployment', 'Le Namespace'], e: 'Un Pod contient un ou plusieurs conteneurs qui partagent réseau et stockage.' },
          { q: 'Lequel de ces outils fait de l\'Infrastructure as Code ?', a: ['Terraform', 'Grafana', 'Jira', 'Wireshark'], e: 'Terraform décrit l\'infrastructure en fichiers déclaratifs versionnés.' },
          { q: 'Quelle est la différence entre scale up et scale out ?', a: ['Scale out ajoute des instances, scale up rend une instance plus puissante', 'Scale up ajoute des instances, scale out les supprime', 'Ce sont des synonymes', 'Scale out concerne seulement le stockage'], e: 'Scale out = horizontal, scale up = vertical.' },
          { q: 'Un bucket S3 est un service de :', a: ['Stockage objet', 'Stockage bloc', 'Base relationnelle', 'File de messages'], e: 'Fichiers adressés par clé, via HTTP. Le stockage bloc (EBS) sert de disque aux VM.' },
          { q: 'Qu\'est-ce qu\'un déploiement blue/green ?', a: ['Deux environnements identiques, on bascule le trafic de l\'ancien au nouveau', 'Un déploiement uniquement la nuit', 'Le déploiement sur deux clouds différents', 'Des tests sur 1 % des utilisateurs'], e: 'Retour arrière instantané en rebasculant. Tester sur une fraction des utilisateurs, c\'est le canary.' },
        ],
        [
          { q: 'Dans Kubernetes, quel objet expose un ensemble de pods derrière une adresse stable ?', a: ['Service', 'ConfigMap', 'ReplicaSet', 'PersistentVolume'], e: 'Le Service sélectionne les pods par labels et répartit le trafic entre eux.' },
          { q: 'À quoi sert le fichier state de Terraform ?', a: ['Faire le lien entre la configuration et les ressources réelles', 'Stocker la documentation', 'Lister les providers disponibles', 'Remplacer le code HCL'], e: 'Il doit être stocké à distance avec verrouillage en équipe, et il peut contenir des secrets.' },
          { q: 'Que provoque l\'échec d\'une liveness probe ?', a: ['Le redémarrage du conteneur', 'Le retrait du pod du Service sans redémarrage', 'La suppression du node', 'Rien, c\'est informatif'], e: 'Le retrait du trafic sans redémarrage, c\'est le rôle de la readiness probe.' },
          { q: 'Qu\'est-ce que le GitOps ?', a: ['L\'état désiré est déclaré dans Git et réconcilié automatiquement', 'Héberger Git dans le cloud', 'Commiter directement en production', 'Un outil de revue de code'], e: 'Un opérateur (Argo CD, Flux) compare en continu le cluster au dépôt et corrige l\'écart.' },
          { q: 'Quels sont les 4 « golden signals » du SRE ?', a: ['Latence, trafic, erreurs, saturation', 'CPU, RAM, disque, réseau', 'Disponibilité, coût, sécurité, vitesse', 'Logs, métriques, traces, alertes'], e: 'Proposés par Google SRE pour surveiller un service orienté utilisateur.' },
          { q: 'AWS IAM : une politique autorise une action, une autre la refuse explicitement. Résultat ?', a: ['Le refus explicite l\'emporte', 'L\'autorisation l\'emporte', 'La politique la plus récente l\'emporte', 'Cela dépend de l\'ordre d\'attachement'], e: 'Ordre d\'évaluation IAM : un Deny explicite bat toujours un Allow.' },
        ],
      ],
    },
    {
      id: 'systeme', name: 'Systèmes', icon: '🖥️',
      missions: [
        { tier: 1, xp: 80,  text: 'Installe une distribution Linux en machine virtuelle et utilise-la une journée' },
        { tier: 2, xp: 180, text: 'Écris un script bash de sauvegarde et planifie-le avec cron' },
        { tier: 3, xp: 350, text: 'Monte un lab Active Directory (1 contrôleur + 1 client) et applique une GPO' },
      ],
      tiers: [
        [],
        [
          { q: 'Quelle commande Linux liste les fichiers d\'un répertoire ?', a: ['ls', 'cd', 'pwd', 'cat'], e: 'cd change de répertoire, pwd affiche le répertoire courant, cat affiche un fichier.' },
          { q: 'Que fait `sudo` ?', a: ['Exécute une commande avec les privilèges d\'un autre utilisateur (root par défaut)', 'Supprime un utilisateur', 'Éteint la machine', 'Met à jour le système'], e: 'Les droits sont définis dans /etc/sudoers.' },
          { q: 'Quelle commande affiche le répertoire courant ?', a: ['pwd', 'ls', 'whoami', 'echo'], e: 'pwd = print working directory. whoami affiche l\'utilisateur courant.' },
          { q: 'Lequel est un système de fichiers ?', a: ['ext4', 'GRUB', 'BIOS', 'systemd'], e: 'ext4, NTFS, XFS, FAT32 sont des systèmes de fichiers. GRUB est un chargeur de démarrage.' },
          { q: 'La RAM est :', a: ['Une mémoire vive, volatile', 'Un stockage permanent', 'Un processeur graphique', 'Une carte réseau'], e: 'Son contenu disparaît à l\'extinction.' },
          { q: 'Sous Windows, quelle commande affiche la configuration IP ?', a: ['ipconfig', 'ifconfig', 'netstat -r', 'tracert'], e: 'ifconfig est l\'équivalent historique sous Linux (remplacé par ip a).' },
        ],
        [
          { q: '`chmod 754 fichier` donne quels droits ?', a: ['rwx r-x r--', 'rwx rw- r--', 'rw- r-x r--', 'rwx r-x r-x'], e: 'r=4, w=2, x=1. 7 = rwx (propriétaire), 5 = r-x (groupe), 4 = r-- (autres).' },
          { q: 'Que fait `grep` ?', a: ['Recherche des motifs dans du texte', 'Compresse des fichiers', 'Affiche les processus', 'Change le propriétaire d\'un fichier'], e: 'Ex. grep -ri "erreur" /var/log' },
          { q: 'Quel fichier liste les comptes utilisateurs locaux sous Linux ?', a: ['/etc/passwd', '/etc/shadow', '/etc/users', '/home/users'], e: '/etc/passwd liste les comptes. Les empreintes des mots de passe sont dans /etc/shadow.' },
          { q: 'Quel est le gestionnaire de services de la plupart des distributions Linux actuelles ?', a: ['systemd', 'cron', 'GRUB', 'bash'], e: 'On le pilote avec systemctl start/stop/enable/status.' },
          { q: 'Qu\'est-ce qu\'Active Directory ?', a: ['Le service d\'annuaire Microsoft qui gère utilisateurs, ordinateurs et stratégies', 'Un antivirus Windows', 'Un explorateur de fichiers', 'Un hyperviseur'], e: 'Il repose sur LDAP, Kerberos et DNS.' },
          { q: 'À quoi sert cron ?', a: ['Planifier des tâches récurrentes', 'Surveiller la température CPU', 'Gérer les paquets', 'Monter des disques'], e: 'Ex. `0 2 * * * /opt/backup.sh` lance un script tous les jours à 2 h.' },
        ],
        [
          { q: 'Qu\'est-ce qu\'un processus zombie ?', a: ['Un processus terminé dont le parent n\'a pas encore lu le code de retour', 'Un processus qui consomme 100 % du CPU', 'Un processus caché par un rootkit', 'Un processus sans terminal'], e: 'Il ne consomme rien sauf une entrée dans la table des processus, jusqu\'à l\'appel à wait() du parent.' },
          { q: 'Que mesure le load average sous Linux ?', a: ['Le nombre moyen de processus en exécution ou en attente (CPU ou I/O)', 'Le pourcentage moyen d\'utilisation CPU', 'La RAM utilisée', 'Le débit disque'], e: 'Il se compare au nombre de cœurs : 4.0 sur 4 cœurs = pleine charge.' },
          { q: 'Que contient un inode ?', a: ['Les métadonnées d\'un fichier (droits, propriétaire, blocs) mais pas son nom', 'Le nom et le contenu du fichier', 'Uniquement le contenu', 'La liste des utilisateurs'], e: 'Le nom est stocké dans le répertoire, qui associe nom et numéro d\'inode.' },
          { q: 'Dans quel ordre s\'appliquent les GPO ?', a: ['Local, Site, Domaine, OU', 'OU, Domaine, Site, Local', 'Domaine, OU, Site, Local', 'Site, Local, OU, Domaine'], e: 'LSDOU : la dernière appliquée (l\'OU la plus proche) gagne en cas de conflit, sauf paramètre Appliqué.' },
          { q: 'Que fait le OOM killer ?', a: ['Il tue un processus quand la mémoire est épuisée', 'Il libère le cache disque', 'Il redémarre la machine', 'Il compresse la swap'], e: 'Il choisit sa cible selon un score (oom_score), en général le plus gros consommateur.' },
          { q: 'Quelle est la différence entre lien physique et lien symbolique ?', a: ['Le lien physique pointe vers le même inode, le symbolique vers un chemin', 'Le symbolique copie le fichier', 'Le physique fonctionne entre systèmes de fichiers différents', 'Aucune'], e: 'Supprimer la cible casse un lien symbolique, pas un lien physique.' },
        ],
      ],
    },
    {
      id: 'data', name: 'Bases de données', icon: '🗄️',
      missions: [
        { tier: 1, xp: 80,  text: 'Crée une base SQLite avec 3 tables liées et insère des données' },
        { tier: 2, xp: 180, text: 'Écris 10 requêtes avec JOIN et GROUP BY sur un vrai jeu de données open data' },
        { tier: 3, xp: 350, text: 'Optimise une requête lente avec EXPLAIN et un index, mesure le temps avant et après' },
      ],
      tiers: [
        [],
        [
          { q: 'Quelle commande SQL lit des données ?', a: ['SELECT', 'INSERT', 'UPDATE', 'DROP'], e: 'INSERT ajoute, UPDATE modifie, DROP supprime une table entière.' },
          { q: 'Qu\'est-ce qu\'une clé primaire ?', a: ['L\'identifiant unique de chaque ligne', 'Un mot de passe de base de données', 'La première colonne de la table', 'Un index facultatif'], e: 'Elle est unique et non nulle.' },
          { q: 'Lequel est un SGBD relationnel ?', a: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'], e: 'MongoDB = documents, Redis = clé-valeur en mémoire, Elasticsearch = moteur de recherche.' },
          { q: 'Quelle clause filtre les lignes d\'une requête ?', a: ['WHERE', 'ORDER BY', 'GROUP BY', 'FROM'], e: 'ORDER BY trie, GROUP BY regroupe, FROM désigne la table.' },
          { q: 'Quel format texte est le plus utilisé par les API web ?', a: ['JSON', 'BMP', 'DOCX', 'MP4'], e: 'JSON : objets clé-valeur et tableaux, lisible et léger.' },
          { q: 'Que fait `ORDER BY prix DESC` ?', a: ['Trie par prix décroissant', 'Trie par prix croissant', 'Filtre les prix négatifs', 'Groupe par prix'], e: 'ASC (par défaut) = croissant, DESC = décroissant.' },
        ],
        [
          { q: 'Quelle est la différence entre INNER JOIN et LEFT JOIN ?', a: ['LEFT JOIN garde toutes les lignes de gauche même sans correspondance', 'INNER JOIN garde toutes les lignes des deux tables', 'LEFT JOIN est plus rapide', 'Aucune'], e: 'Sans correspondance, les colonnes de droite valent NULL.' },
          { q: 'Quelle est la différence entre WHERE et HAVING ?', a: ['HAVING filtre après l\'agrégation (GROUP BY)', 'WHERE filtre après l\'agrégation', 'HAVING remplace ORDER BY', 'Ce sont des synonymes'], e: 'Ex. HAVING COUNT(*) > 5 sur des groupes.' },
          { q: 'Quel est le coût d\'un index ?', a: ['Des écritures plus lentes et de l\'espace disque', 'Aucun coût', 'Des lectures plus lentes', 'La perte de la clé primaire'], e: 'Il accélère les lectures mais doit être mis à jour à chaque écriture.' },
          { q: 'À quoi sert une clé étrangère ?', a: ['Garantir l\'intégrité référentielle avec une autre table', 'Chiffrer une colonne', 'Accélérer les tris', 'Identifier un utilisateur externe'], e: 'Impossible de référencer une ligne qui n\'existe pas.' },
          { q: 'Dans ACID, que signifie le A ?', a: ['Atomicité', 'Accessibilité', 'Agrégation', 'Authentification'], e: 'Atomicité, Cohérence, Isolation, Durabilité. Une transaction réussit entièrement ou pas du tout.' },
          { q: 'Quel est le but principal de la normalisation ?', a: ['Réduire la redondance et les anomalies de mise à jour', 'Accélérer toutes les requêtes', 'Chiffrer les données', 'Supprimer les index'], e: '1NF, 2NF, 3NF… On dénormalise parfois volontairement pour la performance en lecture.' },
        ],
        [
          { q: 'Quel niveau d\'isolation SQL standard empêche les lectures fantômes ?', a: ['SERIALIZABLE', 'READ COMMITTED', 'REPEATABLE READ', 'READ UNCOMMITTED'], e: 'Dans la norme, REPEATABLE READ autorise encore les fantômes (certains moteurs vont plus loin).' },
          { q: 'Qu\'est-ce que le problème N+1 ?', a: ['Une requête pour la liste, puis une requête par élément', 'Une table avec une colonne de trop', 'Un index en double', 'Une jointure circulaire'], e: 'Fréquent avec les ORM. Solution : jointure ou chargement groupé (eager loading).' },
          { q: 'Que fait `ROW_NUMBER() OVER (PARTITION BY client ORDER BY date)` ?', a: ['Numérote les lignes de chaque client par date', 'Compte les clients', 'Supprime les doublons', 'Crée un index'], e: 'Une fonction de fenêtre : calcul par groupe sans réduire le nombre de lignes.' },
          { q: 'Qu\'est-ce que le sharding ?', a: ['Répartir les lignes sur plusieurs serveurs selon une clé', 'Dupliquer la base sur un serveur de secours', 'Compresser les tables', 'Découper une requête en sous-requêtes'], e: 'Partitionnement horizontal entre machines. La réplication, elle, copie les mêmes données.' },
          { q: 'À quoi sert `EXPLAIN ANALYZE` (PostgreSQL) ?', a: ['Exécuter la requête et afficher son plan réel avec les temps', 'Documenter une table', 'Vérifier la syntaxe uniquement', 'Recalculer les statistiques'], e: 'On y repère les Seq Scan coûteux et les mauvaises estimations de lignes.' },
          { q: 'Qu\'est-ce qu\'un schéma en étoile ?', a: ['Une table de faits reliée à des tables de dimensions', 'Une base sans clé primaire', 'Un réseau de réplicas', 'Une table unique dénormalisée'], e: 'Le modèle classique des entrepôts de données.' },
        ],
      ],
    },
  ],
};
window.QUIZ_BANKS = QUIZ_BANKS;
