import { ConnectorHealthItem, ConnectorHealthLog } from '../types/connectorStatus';

export const INITIAL_CONNECTORS_HEALTH: ConnectorHealthItem[] = [
  {
    id: 'resopharma',
    name: 'Resopharma Concentrateur',
    shortCode: 'RESOPHARMA',
    provider: 'GIE Resopharma Santé',
    category: 'teletransmission',
    categoryLabel: 'Télétransmission & NOEMIE',
    description: 'Concentration sécurisée des FSE (Feuilles de Soins Électroniques), retours NOEMIE CPAM 721 Sarthe, flux DRE mutuelles et conventions AMC.',
    iconName: 'Network',
    status: 'operational',
    uptime30d: 99.98,
    latencyMs: 84,
    lastCheckedAt: 'À l\'instant (surveillance continue 30s)',
    endpointUrl: 'https://teletrans.resopharma.fr/api/v3/officine',
    protocol: 'SOAP_XML',
    authType: 'Certificat CPS / Logiciel agréé SESAM-Vitale v1.40',
    certificateExpiry: '2027-11-14',
    certificateStatus: 'valid',
    dailyVolume: {
      label: 'Lots FSE & NOEMIE télétransmis',
      value: '142 lots / 438 FSE',
      successRate: 100.0
    },
    supportedFlows: [
      'Bordereaux de télétransmission B2',
      'Retours NOEMIE CPAM Sarthe 721',
      'Demandes de Remboursement Électroniques (DRE)',
      'Tiers Payant Mutuelles (Harmonie, MGEN, Isanté)'
    ],
    endpoints: [
      { name: 'Gateway FSE Ingestion', url: 'https://teletrans.resopharma.fr/v3/fse/submit', status: 'operational', latencyMs: 78, lastHttpCode: 200 },
      { name: 'Flux NOEMIE Poll', url: 'https://teletrans.resopharma.fr/v3/noemie/pull', status: 'operational', latencyMs: 92, lastHttpCode: 200 },
      { name: 'Serveur DRE Mutuelles', url: 'https://dre.resopharma.fr/api/v2/verify', status: 'operational', latencyMs: 82, lastHttpCode: 200 }
    ],
    incidentHistory: [
      { date: '12/08/2026', title: 'Maintenance planifiée serveurs NOEMIE de nuit', impact: 'File d\'attente différée de 02h00 à 03h15', resolvedInMinutes: 75 }
    ],
    contingencyPlan: 'En cas d\'indisponibilité Resopharma, bascule automatique sur file d\'attente locale WinPharma avec re-télétransmission différée dès rétablissement du handshake TLS.'
  },
  {
    id: 'credit_agricole',
    name: 'Crédit Agricole Anjou Maine',
    shortCode: 'CA-PRO',
    provider: 'Crédit Agricole SA / Open Banking DSP2 & EBICS TS',
    category: 'banking',
    categoryLabel: 'Open Banking & LCR',
    description: 'API bancaire européenne DSP2 & flux EBICS TS pour la relève automatique du solde, lettrage des LCR / Traites fournisseurs et réconciliation des virements CPAM.',
    iconName: 'Landmark',
    status: 'operational',
    uptime30d: 99.95,
    latencyMs: 165,
    lastCheckedAt: 'À l\'instant (surveillance continue 30s)',
    endpointUrl: 'https://api.credit-agricole.fr/open-banking/v2.1/aisp',
    protocol: 'OPEN_BANKING_DSP2',
    authType: 'Certificat eIDAS QWAC + Token OAuth2 SCA',
    certificateExpiry: '2026-10-05',
    certificateStatus: 'valid',
    dailyVolume: {
      label: 'Écritures & LCR synchronisées',
      value: '28 transactions / 6 LCR',
      successRate: 100.0
    },
    supportedFlows: [
      'Relève des soldes et écritures (camt.053 / camt.054)',
      'Avis d\'échéance LCR Métier (Pointage et BAP)',
      'Virements SEPA et prélèvements automatiques',
      'Rapprochement automatisé Factur-X / Relevé bancaire'
    ],
    endpoints: [
      { name: 'AISP Account Balance API', url: 'https://api.credit-agricole.fr/open-banking/v2.1/accounts', status: 'operational', latencyMs: 154, lastHttpCode: 200 },
      { name: 'AISP Transactions Fetcher', url: 'https://api.credit-agricole.fr/open-banking/v2.1/transactions', status: 'operational', latencyMs: 172, lastHttpCode: 200 },
      { name: 'EBICS TS LCR Settlement Gateway', url: 'https://ebics.credit-agricole.fr/ebicsweb/ebics', status: 'operational', latencyMs: 169, lastHttpCode: 200 }
    ],
    incidentHistory: [
      { date: '04/08/2026', title: 'Renouvellement Token SCA Banque de France', impact: 'Déconnexion temporaire de 15 minutes', resolvedInMinutes: 15 }
    ],
    contingencyPlan: 'Import manuel de fichiers relevés .OFX / .QIF ou fichier LCR EDIFACT AFB120 depuis l\'espace Crédit Agricole Entreprises en un clic.'
  },
  {
    id: 'cegedim_sy',
    name: 'SY by Cegedim (PDP #0023)',
    shortCode: 'CEGEDIM-SY',
    provider: 'Cegedim e-business / PharmaML',
    category: 'dematerialization',
    categoryLabel: 'Plateforme Dématérialisation DGFIP',
    description: 'Plateforme de Dématérialisation Partenaire (PDP #0023) agréée DGFIP. Réception certifiée des factures électroniques Factur-X de Pfizer, CSP Movianto, U.Labs et CERP.',
    iconName: 'Building2',
    status: 'operational',
    uptime30d: 100.0,
    latencyMs: 118,
    lastCheckedAt: 'À l\'instant (surveillance continue 30s)',
    endpointUrl: 'https://api.sybycegedim.com/v2/officine/invoices',
    protocol: 'REST_JSON',
    authType: 'Clé API Sécurisée PDP + Signature eIDAS PAdES',
    certificateExpiry: '2028-03-20',
    certificateStatus: 'valid',
    dailyVolume: {
      label: 'Factures Factur-X certifiées',
      value: '18 factures / 46 250,90 € TTC',
      successRate: 100.0
    },
    supportedFlows: [
      'Factur-X Profils EXTENDED & COMFORT (Norme EN 16931)',
      'Contrôle intégrité scellement eIDAS & Horodatage légal',
      'Transmission automatique du statut Bon à Payer (BAP)',
      'Déclaration e-reporting DGFIP 2026'
    ],
    endpoints: [
      { name: 'PDP Invoices Ingestion', url: 'https://api.sybycegedim.com/v2/officine/invoices/incoming', status: 'operational', latencyMs: 110, lastHttpCode: 200 },
      { name: 'eIDAS Seal Verifier', url: 'https://api.sybycegedim.com/v2/signatures/verify', status: 'operational', latencyMs: 125, lastHttpCode: 200 },
      { name: 'PharmaML Laboratory Gateway', url: 'https://pml.cegedim.com/ws/officine', status: 'operational', latencyMs: 119, lastHttpCode: 200 }
    ],
    incidentHistory: [],
    contingencyPlan: 'Archivage miroir automatique dans le coffre-fort local sécurisé avec conformité Piste d\'Audit Fiable (PAF).'
  },
  {
    id: 'chorus_pro',
    name: 'Chorus Pro / PPF (AIFE)',
    shortCode: 'CHORUS-PPF',
    provider: 'AIFE / Ministère de l\'Économie et des Finances',
    category: 'dematerialization',
    categoryLabel: 'Portail Public de Facturation',
    description: 'Portail Public de Facturation (PPF). Gestion des factures électroniques du secteur public : Centre Hospitalier du Mans, EHPADs conventionnés et SDIS Sarthe.',
    iconName: 'FileCheck',
    status: 'operational',
    uptime30d: 98.85,
    latencyMs: 310,
    lastCheckedAt: 'À l\'instant (surveillance continue 30s)',
    endpointUrl: 'https://api.piste.gouv.fr/chorus-pro/v1/invoices',
    protocol: 'REST_JSON',
    authType: 'PISTE Gouv OAuth2 Client Credentials',
    certificateExpiry: '2027-01-18',
    certificateStatus: 'valid',
    dailyVolume: {
      label: 'Factures Établissements Publics',
      value: '4 factures / 4 210,00 € TTC',
      successRate: 98.2
    },
    supportedFlows: [
      'Facturation hôpitaux (CH Le Mans - SIRET 26720016000013)',
      'Facturation EHPADs conventionnés Le Mans Métropole',
      'Facturation SDIS Sarthe (Pharmacie à usage intérieur)',
      'Suivi des mandats administratifs et paiements Trésor Public'
    ],
    endpoints: [
      { name: 'PISTE OAuth2 Token Auth', url: 'https://api.piste.gouv.fr/token', status: 'operational', latencyMs: 280, lastHttpCode: 200 },
      { name: 'Chorus Pro Invoice Status API', url: 'https://api.piste.gouv.fr/chorus-pro/v1/invoices/status', status: 'operational', latencyMs: 340, lastHttpCode: 200 },
      { name: 'Chorus Pro Structures Search', url: 'https://api.piste.gouv.fr/chorus-pro/v1/structures', status: 'operational', latencyMs: 310, lastHttpCode: 200 }
    ],
    incidentHistory: [
      { date: '18/08/2026', title: 'Ralentissement national sur l\'API PISTE Gouv', impact: 'Latence accrue (>1200ms) pendant 40 minutes', resolvedInMinutes: 40 }
    ],
    contingencyPlan: 'Dépôt direct au format Factur-X / PDF via le portail web Chorus Pro avec synchronisation différée par SIREN.'
  },
  {
    id: 'tx2_pharma',
    name: 'TX2 Concept Pharma Hub',
    shortCode: 'TX2-EDI',
    provider: 'TX2 Concept EDI Solutions',
    category: 'grossiste_edi',
    categoryLabel: 'Passerelle EDI Répartiteurs',
    description: 'Passerelle EDI grossistes-répartiteurs pour les flux de commandes urgentes, avis d\'expédition et factures CERP Bretagne Atlantique et Welcoop.',
    iconName: 'Truck',
    status: 'operational',
    uptime30d: 99.96,
    latencyMs: 95,
    lastCheckedAt: 'À l\'instant (surveillance continue 30s)',
    endpointUrl: 'https://edi.tx2.fr/pharma/api/v1',
    protocol: 'EDIFACT_AS2',
    authType: 'Passerelle AS2 Sécurisée + Certificat X.509',
    certificateExpiry: '2027-08-30',
    certificateStatus: 'valid',
    dailyVolume: {
      label: 'Messages EDI Grossistes échangés',
      value: '8 commandes / 24 avis d\'expédition',
      successRate: 100.0
    },
    supportedFlows: [
      'Commandes répartiteurs (ORDERS)',
      'Avis d\'expédition et bordereaux de livraison (DESADV)',
      'Factures électroniques répartiteurs (INVOIC)',
      'Déclarations ruptures stock DP-Ruptures'
    ],
    endpoints: [
      { name: 'TX2 AS2 Receiver', url: 'https://edi.tx2.fr/as2/receive', status: 'operational', latencyMs: 89, lastHttpCode: 200 },
      { name: 'Pharma Hub REST Sync', url: 'https://edi.tx2.fr/pharma/api/v1/sync', status: 'operational', latencyMs: 101, lastHttpCode: 200 }
    ],
    incidentHistory: [],
    contingencyPlan: 'Passage automatique des commandes via commande directe téléphonique ou web CERP Bretagne en cas de rupture de flux EDI.'
  },
  {
    id: 'winpharma_lgo',
    name: 'WinPharma (Equasens / LGO Officine)',
    shortCode: 'WINPHARMA',
    provider: 'Equasens / Logiciel Officinal de Gestion',
    category: 'lgo_officine',
    categoryLabel: 'Logiciel de Gestion Officine (LGO)',
    description: 'Passerelle réseau locale reliant les 4 postes de comptoir, le robot de dispensation et la base de données SQL WinPharma pour la synchronisation en temps réel.',
    iconName: 'Cpu',
    status: 'operational',
    uptime30d: 99.99,
    latencyMs: 4,
    lastCheckedAt: 'À l\'instant (surveillance continue 30s)',
    endpointUrl: 'http://192.168.1.50:8080/api/winpharma/v1',
    protocol: 'WEBSOCKET_LAN',
    authType: 'Jeton Local API Gateway + Authentification RPPS Poste',
    certificateExpiry: 'Permanent (Réseau Local Sécurisé VLAN Officine)',
    certificateStatus: 'valid',
    dailyVolume: {
      label: 'Tickets et délivrances synchronisés',
      value: '312 délivrances / 4 postes actifs',
      successRate: 100.0
    },
    supportedFlows: [
      'Synchronisation stocks et PUMP en temps réel',
      'Remontée instantanée des délivrances et CA journalier',
      'Génération automatique des bordereaux télétransmis',
      'Liaison robot de dispensation et tiroirs sécurisés'
    ],
    endpoints: [
      { name: 'LAN WebSocket Stream', url: 'ws://192.168.1.50:8080/ws', status: 'operational', latencyMs: 2, lastHttpCode: 200 },
      { name: 'Local SQL Sync Engine', url: 'http://192.168.1.50:8080/api/sync', status: 'operational', latencyMs: 6, lastHttpCode: 200 }
    ],
    incidentHistory: [],
    contingencyPlan: 'Fonctionnement autonome en mode déconnecté sur chaque poste avec synchronisation en arrière-plan à la reconnexion.'
  },
  {
    id: 'sesam_vitale',
    name: 'Téléservices AmeliPro & SESAM-Vitale',
    shortCode: 'ADRi-IMTi',
    provider: 'CNAM / GIE SESAM-Vitale',
    category: 'assurance_maladie',
    categoryLabel: 'Assurance Maladie Obligatoire',
    description: 'Téléservices intégrés : Acquisition des Droits en direct (ADRi), Information Médecin Traitant (IMTi) et consultation droits Carte Vitale.',
    iconName: 'ShieldAlert',
    status: 'operational',
    uptime30d: 99.45,
    latencyMs: 182,
    lastCheckedAt: 'À l\'instant (surveillance continue 30s)',
    endpointUrl: 'https://services-ameli.cnamts.fr/teleservices/v2',
    protocol: 'SOAP_XML',
    authType: 'Carte CPS Titulaire (Dr Camara) / Lecteur PC/SC',
    certificateExpiry: '2028-06-15',
    certificateStatus: 'valid',
    dailyVolume: {
      label: 'Consultations droits ADRi en direct',
      value: '198 requêtes ADRi',
      successRate: 99.5
    },
    supportedFlows: [
      'Acquisition des Droits Intégrée (ADRi en ligne)',
      'Information Médecin Traitant (IMTi)',
      'Déclaration ALD & Maternité en temps réel',
      'Contrôle de validité des attestations papier'
    ],
    endpoints: [
      { name: 'CNAM ADRi Endpoint', url: 'https://services-ameli.cnamts.fr/adri/v2', status: 'operational', latencyMs: 175, lastHttpCode: 200 },
      { name: 'CNAM IMTi Endpoint', url: 'https://services-ameli.cnamts.fr/imti/v1', status: 'operational', latencyMs: 189, lastHttpCode: 200 }
    ],
    incidentHistory: [
      { date: '10/08/2026', title: 'Ralentissement serveur national ADRi CNAM', impact: 'Temps de réponse supérieur à 3 secondes pendant 25 minutes', resolvedInMinutes: 25 }
    ],
    contingencyPlan: 'Lecture des données en local sur la puce physique de la Carte Vitale si le téléservice ADRi est momentanément indisponible.'
  },
  {
    id: 'docaposte',
    name: 'Docaposte / Cecurity Vault',
    shortCode: 'DOCAPOSTE',
    provider: 'Docaposte (Groupe La Poste)',
    category: 'dematerialization',
    categoryLabel: 'Archivage Légal Valeur Probante',
    description: 'Coffre-fort numérique d\'archivage à valeur probante (Norme NF Z42-013) pour la conservation légale de 10 ans des pièces comptables et ordonnances numérisées.',
    iconName: 'Archive',
    status: 'operational',
    uptime30d: 99.99,
    latencyMs: 140,
    lastCheckedAt: 'À l\'instant (surveillance continue 30s)',
    endpointUrl: 'https://api.docaposte.com/vault/v3',
    protocol: 'REST_JSON',
    authType: 'Certificat eIDAS Cachet Serveur',
    certificateExpiry: '2029-05-10',
    certificateStatus: 'valid',
    dailyVolume: {
      label: 'Documents scellés & archivés',
      value: '42 documents archivés',
      successRate: 100.0
    },
    supportedFlows: [
      'Archivage probant des factures fournisseurs 10 ans',
      'Scellement cryptographique SHA-256 / eIDAS',
      'Traçabilité Piste d\'Audit Fiable (PAF) DGFIP'
    ],
    endpoints: [
      { name: 'Docaposte Vault API', url: 'https://api.docaposte.com/vault/v3/store', status: 'operational', latencyMs: 135, lastHttpCode: 200 },
      { name: 'Docaposte Proof Verifier', url: 'https://api.docaposte.com/vault/v3/verify', status: 'operational', latencyMs: 145, lastHttpCode: 200 }
    ],
    incidentHistory: [],
    contingencyPlan: 'Stockage tampon local chiffré AES-256 avec réplication asynchrone dès rétablissement du canal.'
  }
];

export const INITIAL_HEALTH_LOGS: ConnectorHealthLog[] = [
  {
    id: 'hlog-1',
    timestamp: '23/08/2026 09:33:10',
    connectorId: 'resopharma',
    connectorName: 'Resopharma Concentrateur',
    level: 'success',
    status: 'operational',
    httpCode: 200,
    latencyMs: 84,
    message: 'Ping de santé réussi. Canal TLS 1.3 actif. 142 lots FSE synchronisés, 0 erreur de transmission.'
  },
  {
    id: 'hlog-2',
    timestamp: '23/08/2026 09:32:50',
    connectorId: 'credit_agricole',
    connectorName: 'Crédit Agricole Anjou Maine',
    level: 'success',
    status: 'operational',
    httpCode: 200,
    latencyMs: 165,
    message: 'Liaison Open Banking DSP2 & EBICS TS validée. Token SCA actif. Solde 16 708,87 € synchronisé.'
  },
  {
    id: 'hlog-3',
    timestamp: '23/08/2026 09:32:30',
    connectorId: 'cegedim_sy',
    connectorName: 'SY by Cegedim (PDP #0023)',
    level: 'success',
    status: 'operational',
    httpCode: 200,
    latencyMs: 118,
    message: 'Passerelle PDP DGFIP opérationnelle. Factures Factur-X certifiées eIDAS importées sans écart.'
  },
  {
    id: 'hlog-4',
    timestamp: '23/08/2026 09:32:00',
    connectorId: 'chorus_pro',
    connectorName: 'Chorus Pro / PPF (AIFE)',
    level: 'info',
    status: 'operational',
    httpCode: 200,
    latencyMs: 310,
    message: 'Liaison PISTE Gouv opérationnelle. Latence normale pour le portail d\'État (310 ms).'
  },
  {
    id: 'hlog-5',
    timestamp: '23/08/2026 09:31:40',
    connectorId: 'tx2_pharma',
    connectorName: 'TX2 Concept Pharma Hub',
    level: 'success',
    status: 'operational',
    httpCode: 200,
    latencyMs: 95,
    message: 'Passerelle EDIFACT CERP & Welcoop connectée. Handshake AS2 réussi.'
  },
  {
    id: 'hlog-6',
    timestamp: '23/08/2026 09:31:10',
    connectorId: 'winpharma_lgo',
    connectorName: 'WinPharma (Equasens / LGO)',
    level: 'success',
    status: 'operational',
    httpCode: 200,
    latencyMs: 4,
    message: 'Liaison réseau local LAN temps réel active (4 ms). 4 postes de comptoir synchronisés.'
  },
  {
    id: 'hlog-7',
    timestamp: '23/08/2026 09:30:45',
    connectorId: 'sesam_vitale',
    connectorName: 'Téléservices AmeliPro & SESAM-Vitale',
    level: 'success',
    status: 'operational',
    httpCode: 200,
    latencyMs: 182,
    message: 'Téléservice ADRi en ligne. Vérification des droits assurés en direct validée.'
  }
];
