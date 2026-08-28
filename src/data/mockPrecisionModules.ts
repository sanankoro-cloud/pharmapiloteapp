import {
  SmartOrderingItem,
  QualityNonConformity,
  QualityProcedure,
  DigitalServicePatient,
  DocumentGedItem,
  RoboticUnitStatus,
  InternalMessage,
  PatientCareFile,
  RospHealthIndicator
} from '../types/pharmacyPilotPrecision';

export const MOCK_SMART_ORDERING_ITEMS: SmartOrderingItem[] = [
  {
    id: 'ord-1',
    cip: '3400936859421',
    name: 'AMOXICILLINE / AC. CLAV. SANDOZ 1g/125mg Ad Bte 24',
    category: 'Antibiotiques & Infectiologie',
    supplier: 'Sandoz Laboratoires',
    currentStock: 4,
    minSafetyStock: 15,
    recommendedOrderQty: 48,
    averageMonthlySales: 62,
    seasonalityFactor: 1.35,
    aiConfidenceScore: 98,
    reason: 'Foyer d\'infections ORL régionales détecté (+32% délivrances) • Risque de quota grossiste CERP',
    estimatedCostHt: 3.42,
    expectedMarginPct: 33.5,
    urgency: 'critique',
    selected: true
  },
  {
    id: 'ord-2',
    cip: '3400930058479',
    name: 'VENTOLINE 100 µg/dose Susp Inhalateur 200 doses',
    category: 'Pneumologie & Asthme',
    supplier: 'GSK GlaxoSmithKline',
    currentStock: 6,
    minSafetyStock: 20,
    recommendedOrderQty: 60,
    averageMonthlySales: 75,
    seasonalityFactor: 1.2,
    aiConfidenceScore: 95,
    reason: 'Pic de pollution aux particules fines + tension d\'approvisionnement labo',
    estimatedCostHt: 2.18,
    expectedMarginPct: 31.0,
    urgency: 'critique',
    selected: true
  },
  {
    id: 'ord-3',
    cip: '3400935684729',
    name: 'DOLIPRANE 1000 mg Tabl. Boîte 8 (Paracétamol)',
    category: 'Antalgiques & Fièvre',
    supplier: 'Opella Healthcare (Sanofi)',
    currentStock: 42,
    minSafetyStock: 100,
    recommendedOrderQty: 180,
    averageMonthlySales: 340,
    seasonalityFactor: 1.15,
    aiConfidenceScore: 99,
    reason: 'Optimisation de palier de remise directe laboratoire (300 btes = +4% remise sur facture)',
    estimatedCostHt: 1.12,
    expectedMarginPct: 29.8,
    urgency: 'haute',
    selected: true
  },
  {
    id: 'ord-4',
    cip: '3400938491209',
    name: 'ELIQUIS 5 mg Comprimés Pelliculés Boîte 56',
    category: 'Cardiologie & AOD',
    supplier: 'Bristol Myers Squibb / Pfizer',
    currentStock: 2,
    minSafetyStock: 8,
    recommendedOrderQty: 16,
    averageMonthlySales: 18,
    seasonalityFactor: 1.0,
    aiConfidenceScore: 94,
    reason: '4 renouvellements patients chroniques ALD prévus sur les 7 prochains jours',
    estimatedCostHt: 54.10,
    expectedMarginPct: 18.2,
    urgency: 'haute',
    selected: true
  },
  {
    id: 'ord-5',
    cip: '3400937549102',
    name: 'DERMOVATE 0,05% Crème Tube 30g (Clobétasol)',
    category: 'Dermatologie',
    supplier: 'GlaxoSmithKline',
    currentStock: 1,
    minSafetyStock: 5,
    recommendedOrderQty: 12,
    averageMonthlySales: 9,
    seasonalityFactor: 0.95,
    aiConfidenceScore: 89,
    reason: 'Stock tampon sous le seuil critique de sécurité du LGO',
    estimatedCostHt: 3.85,
    expectedMarginPct: 32.0,
    urgency: 'normale',
    selected: false
  },
  {
    id: 'ord-6',
    cip: '3400936541298',
    name: 'DAFLON 500 mg Comprimés Boîte 60',
    category: 'Circulation & Veinotoniques',
    supplier: 'Servier Laboratoires',
    currentStock: 8,
    minSafetyStock: 12,
    recommendedOrderQty: 24,
    averageMonthlySales: 22,
    seasonalityFactor: 1.1,
    aiConfidenceScore: 91,
    reason: 'Commande groupée grossiste pour atteindre le franco de port 250 € HT',
    estimatedCostHt: 7.90,
    expectedMarginPct: 36.5,
    urgency: 'optimisation',
    selected: false
  }
];

export const MOCK_QUALITY_NON_CONFORMITIES: QualityNonConformity[] = [
  {
    id: 'nc-1',
    date: '2026-08-25',
    type: 'erreur_delivrance_evitee',
    title: 'Confusion de dosage Paroxétine 10mg vs 20mg détectée au scan',
    description: 'Lors de la délivrance à Mme Bernard, le lecteur Datamatrix a bloqué la validation pour discordance avec la ligne d\'ordonnance électronique.',
    reportedBy: 'Préparatrice Élodie Gautier',
    severity: 'moyenne',
    status: 'action_corrective_validee',
    correctiveAction: 'Reconditionnement immédiat et vérification des boîtes adjacentes dans le tiroir du comptoir.',
    preventiveAction: 'Pose d\'une étiquette de séparation fluo "Attention aux Dosages Multiples" et rappel en réunion d\'équipe.',
    validatedByPharmacist: true
  },
  {
    id: 'nc-2',
    date: '2026-08-22',
    type: 'chaine_froid',
    title: 'Alerte Sonde Frigo 1 : Dépassement 8.4°C pendant 45 min lors du dégivrage',
    description: 'La sonde connectée Sigfox a signalé une hausse thermique à 8.4°C suite à une porte mal refermée pendant l\'inventaire.',
    reportedBy: 'Dr N\'Fafode Camara',
    severity: 'haute',
    status: 'resolue',
    correctiveAction: 'Contrôle des vaccins et insulines stockés, aucun déchargement thermique critique confirmé.',
    preventiveAction: 'Installation d\'un avertisseur sonore automatique de porte entrouverte après 90 secondes.',
    resolvedDate: '2026-08-23',
    validatedByPharmacist: true
  },
  {
    id: 'nc-3',
    date: '2026-08-18',
    type: 'ordonnance_douteuse',
    title: 'Suspicion fausse ordonnance Rivotril / Pregabaline avec faux cachet',
    description: 'Présentation d\'une ordonnance émanant d\'un prescripteur hospitalier avec incohérences typographiques et RPPS radié.',
    reportedBy: 'Dr Sarah Benziane',
    severity: 'critique',
    status: 'resolue',
    correctiveAction: 'Refus courtois de dispensation et signalement sécurisé au réseau d\'alerte de l\'Ordre des Pharmaciens.',
    preventiveAction: 'Inscription du dossier au registre des alertes comptoir et information des confrères du secteur 50km.',
    resolvedDate: '2026-08-19',
    validatedByPharmacist: true
  }
];

export const MOCK_QUALITY_PROCEDURES: QualityProcedure[] = [
  {
    id: 'proc-1',
    code: 'POS-DISP-01',
    title: 'Procédure de double vérification des délivrances de médicaments à marge thérapeutique étroite',
    version: 'v3.2',
    category: 'Dispensation',
    lastReviewDate: '2026-04-10',
    nextReviewDate: '2027-04-10',
    status: 'validee',
    author: 'Dr N\'Fafode Camara',
    signedTeamMembersCount: 7,
    totalTeamMembersCount: 7
  },
  {
    id: 'proc-2',
    code: 'POS-FROID-02',
    title: 'Gestion de la chaîne du froid, étalonnage des sondes et protocole en cas de panne électrique',
    version: 'v2.1',
    category: 'Hygiène & Chaîne du Froid',
    lastReviewDate: '2026-02-15',
    nextReviewDate: '2027-02-15',
    status: 'validee',
    author: 'Dr Sarah Benziane',
    signedTeamMembersCount: 7,
    totalTeamMembersCount: 7
  },
  {
    id: 'proc-3',
    code: 'POS-STUP-03',
    title: 'Gestion sécurisée du coffre des stupéfiants, balance trimestrielle et ordonnancier sécurisé',
    version: 'v4.0',
    category: 'Stupéfiants',
    lastReviewDate: '2025-11-20',
    nextReviewDate: '2026-11-20',
    status: 'validee',
    author: 'Dr N\'Fafode Camara',
    signedTeamMembersCount: 6,
    totalTeamMembersCount: 7
  },
  {
    id: 'proc-4',
    code: 'POS-VAX-04',
    title: 'Protocole de vaccination officinale, traçabilité Mon Espace Santé et gestion du choc anaphylactique',
    version: 'v1.4',
    category: 'Vaccination',
    lastReviewDate: '2026-07-01',
    nextReviewDate: '2027-07-01',
    status: 'validee',
    author: 'Dr Sarah Benziane',
    signedTeamMembersCount: 7,
    totalTeamMembersCount: 7
  }
];

export const MOCK_DIGITAL_SERVICES: DigitalServicePatient[] = [
  {
    id: 'ds-1',
    patientName: 'M. Jean-Claude Martin',
    nirMasked: '1 54 08 72 *** *** 42',
    age: 74,
    serviceType: 'bilan_partage_medication',
    dateScheduled: '2026-08-29 14:30',
    pharmacistAssigned: 'Dr Sarah Benziane',
    status: 'planifie',
    ameliCode: 'BPM 1',
    remunerationEuro: 60.00,
    notes: 'Patient polymédiqué (9 lignes quotidiennes) avec risque d\'interaction AINS + AOD.',
    complianceScorePct: 82
  },
  {
    id: 'ds-2',
    patientName: 'Mme Françoise Dubreuil',
    nirMasked: '2 48 11 72 *** *** 18',
    age: 78,
    serviceType: 'entretien_aod',
    dateScheduled: '2026-08-27 10:00',
    pharmacistAssigned: 'Dr N\'Fafode Camara',
    status: 'realise',
    ameliCode: 'EAV 2',
    remunerationEuro: 30.00,
    notes: 'Entretien de suivi 6 mois sous Eliquis 5mg : bonne observance, rappel des signes d\'hémorragie.',
    complianceScorePct: 96
  },
  {
    id: 'ds-3',
    patientName: 'M. Thomas Moreau',
    nirMasked: '1 89 04 72 *** *** 91',
    age: 37,
    serviceType: 'entretien_asthme',
    dateScheduled: '2026-08-26 16:15',
    pharmacistAssigned: 'Dr Sarah Benziane',
    status: 'facture_ameli',
    ameliCode: 'EAS 1',
    remunerationEuro: 50.00,
    notes: 'Évaluation de la technique d\'inhalation avec chambre d\'inhalation : correction du geste.',
    complianceScorePct: 90
  },
  {
    id: 'ds-4',
    patientName: 'Mme Hélène Leroy',
    nirMasked: '2 62 03 72 *** *** 55',
    age: 64,
    serviceType: 'vaccination',
    dateScheduled: '2026-08-28 11:30',
    pharmacistAssigned: 'Dr N\'Fafode Camara',
    status: 'planifie',
    ameliCode: 'VAX DTP',
    remunerationEuro: 9.60,
    notes: 'Rappel décennal DTPolio avec enregistrement direct dans le DMP / Mon Espace Santé.',
    complianceScorePct: 100
  },
  {
    id: 'ds-5',
    patientName: 'M. Lucas Renard',
    nirMasked: '1 98 09 72 *** *** 23',
    age: 28,
    serviceType: 'trod_angine',
    dateScheduled: '2026-08-28 09:15',
    pharmacistAssigned: 'Dr Sarah Benziane',
    status: 'realise',
    ameliCode: 'TROD',
    remunerationEuro: 6.00,
    notes: 'Score de Mac Isaac = 3 • Test négatif (virale) • Délivrance traitement symptomatique.',
    complianceScorePct: 100
  }
];

export const MOCK_GED_DOCUMENTS: DocumentGedItem[] = [
  {
    id: 'ged-1',
    title: 'Facture Laboratoire Sanofi WinPharma Août 2026.xml',
    category: 'facture_fournisseur',
    fileFormat: 'XML_FACTURX',
    fileSize: '412 Ko',
    dateAdded: '2026-08-25',
    supplierOrIssuer: 'Opella Healthcare France',
    isArchived10Years: true,
    status: 'synchronise_comptable',
    amountHt: 4892.40
  },
  {
    id: 'ged-2',
    title: 'Bordereau Noemie CPAM Sarthe S34-2026.pdf',
    category: 'attestation_tp',
    fileFormat: 'PDF',
    fileSize: '1.2 Mo',
    dateAdded: '2026-08-24',
    supplierOrIssuer: 'CPAM Sarthe 72',
    isArchived10Years: true,
    status: 'valide',
    amountHt: 14280.95
  },
  {
    id: 'ged-3',
    title: 'Contrat RFA Cadencier Biogaran 2026-2027.pdf',
    category: 'contrat_rfa',
    fileFormat: 'PDF',
    fileSize: '2.8 Mo',
    dateAdded: '2026-07-02',
    supplierOrIssuer: 'Biogaran Laboratoires',
    isArchived10Years: true,
    status: 'valide'
  },
  {
    id: 'ged-4',
    title: 'Certificat Enlèvement DASRI Médicaments Périmés.pdf',
    category: 'certificat_dasri',
    fileFormat: 'PDF',
    fileSize: '780 Ko',
    dateAdded: '2026-08-10',
    supplierOrIssuer: 'Cyclamed / Suez Pro',
    isArchived10Years: true,
    status: 'valide'
  },
  {
    id: 'ged-5',
    title: 'FEC Écritures Comptables Clôture Semestre 1.csv',
    category: 'fec_comptable',
    fileFormat: 'CSV',
    fileSize: '3.4 Mo',
    dateAdded: '2026-07-15',
    supplierOrIssuer: 'Cabinet Expert-Comptable AEC',
    isArchived10Years: true,
    status: 'synchronise_comptable'
  }
];

export const MOCK_ROBOTIC_UNITS: RoboticUnitStatus[] = [
  {
    id: 'bot-1',
    robotModel: 'BD Rowa Vmax 160 iConnect',
    serialNumber: 'ROW-FR-2024-8841',
    status: 'en_service',
    storageCapacityBoxes: 14500,
    currentBoxesStored: 11840,
    fillRatePct: 81.6,
    averageRetrievalTimeSec: 8.4,
    dailyDeliveriesCount: 412,
    temperatureCelsius: 19.8,
    lastMaintenanceDate: '2026-06-15',
    nextMaintenanceDate: '2026-12-15',
    activeAlertsCount: 0
  },
  {
    id: 'bot-2',
    robotModel: 'Chargeur Automatique ProLog Rowa',
    serialNumber: 'ROW-IN-2024-1102',
    status: 'en_service',
    storageCapacityBoxes: 1200,
    currentBoxesStored: 850,
    fillRatePct: 70.8,
    averageRetrievalTimeSec: 4.2,
    dailyDeliveriesCount: 380,
    temperatureCelsius: 20.1,
    lastMaintenanceDate: '2026-06-15',
    nextMaintenanceDate: '2026-12-15',
    activeAlertsCount: 0
  }
];

export const MOCK_INTERNAL_MESSAGES: InternalMessage[] = [
  {
    id: 'msg-1',
    senderName: 'Dr N\'Fafode Camara',
    senderRole: 'Titulaire / Pharmacien Gérant',
    avatarColor: 'bg-emerald-600',
    timestamp: 'Aujourd\'hui à 08:30',
    content: '📌 Rappel équipe : Attention, la CPAM a mis à jour les modalités de facturation de la délivrance adaptée pour les antibiotiques. Merci de renseigner le motif sur WinPharma pour chaque réduction de posologie.',
    category: 'consigne_comptoir',
    isPinned: true,
    acknowledgedBy: ['Dr Sarah Benziane', 'Élodie Gautier', 'Julien Fabre', 'Manon Girard']
  },
  {
    id: 'msg-2',
    senderName: 'Dr Sarah Benziane',
    senderRole: 'Pharmacien Adjoint',
    avatarColor: 'bg-indigo-600',
    timestamp: 'Aujourd\'hui à 11:45',
    content: 'Mme Garnier passe ce soir vers 18h récupérer sa commande spécifique d\'anticancéreux (Ibrance 100mg). Le sachet est réservé dans le tiroir d\'attente N°3.',
    category: 'vigilance_patient',
    isPinned: false,
    acknowledgedBy: ['Élodie Gautier', 'Dr N\'Fafode Camara']
  },
  {
    id: 'msg-3',
    senderName: 'Élodie Gautier',
    senderRole: 'Préparatrice Référente Stocks',
    avatarColor: 'bg-teal-600',
    timestamp: 'Hier à 17:20',
    content: 'La commande directe Sandoz a été entièrement réceptionnée et scannée dans le robot Rowa. Les écarts sur les solutés ont été réclamés.',
    category: 'stock_urgent',
    isPinned: false,
    acknowledgedBy: ['Dr N\'Fafode Camara']
  },
  {
    id: 'msg-4',
    senderName: 'Julien Fabre',
    senderRole: 'Préparateur',
    avatarColor: 'bg-amber-600',
    timestamp: 'Hier à 14:10',
    content: 'Passation pour l\'équipe du soir : Les ordonnances d\'HAD pour le domicile de M. Tessier sont prêtes dans le bac 4.',
    category: 'releve_equipe',
    isPinned: false,
    acknowledgedBy: ['Manon Girard', 'Dr Sarah Benziane']
  }
];

export const MOCK_PATIENT_CARE_FILES: PatientCareFile[] = [
  {
    id: 'pat-1',
    patientName: 'M. Jean-Claude Martin',
    birthYear: 1952,
    nir: '1 52 08 72 458 123 42',
    chronicDiseases: ['Fibrillation Atriale', 'Hypertension Artérielle', 'Diabète Type 2'],
    activeTreatmentsCount: 8,
    lastVisitDate: '2026-08-25',
    doctorName: 'Dr Philippe Lambert (Généraliste)',
    hasDossierPharmaceutique: true,
    aldStatus: true,
    observanceRatePct: 94,
    interactionAlert: null,
    allergies: ['Pénicillines'],
    nextPrescriptionRenewalDate: '2026-09-15'
  },
  {
    id: 'pat-2',
    patientName: 'Mme Suzanne Dupont',
    birthYear: 1946,
    nir: '2 46 03 72 189 004 88',
    chronicDiseases: ['Ostéoporose Sévère', 'Insuffisance Rénale Modérée'],
    activeTreatmentsCount: 5,
    lastVisitDate: '2026-08-22',
    doctorName: 'Dr Claire Richard (Rhumatologue)',
    hasDossierPharmaceutique: true,
    aldStatus: true,
    observanceRatePct: 81,
    interactionAlert: 'Attention : Risque de surdosage si AINS prescrit avec son traitement calcique',
    allergies: ['Sulfamides'],
    nextPrescriptionRenewalDate: '2026-08-30'
  },
  {
    id: 'pat-3',
    patientName: 'Mme Françoise Dubreuil',
    birthYear: 1948,
    nir: '2 48 11 72 632 991 18',
    chronicDiseases: ['AVC Ischémique Antérieur', 'Hypercholestérolémie'],
    activeTreatmentsCount: 6,
    lastVisitDate: '2026-08-27',
    doctorName: 'Dr Marc Voisin (Neurologue)',
    hasDossierPharmaceutique: true,
    aldStatus: true,
    observanceRatePct: 98,
    interactionAlert: null,
    allergies: [],
    nextPrescriptionRenewalDate: '2026-09-28'
  },
  {
    id: 'pat-4',
    patientName: 'M. Thomas Moreau',
    birthYear: 1989,
    nir: '1 89 04 72 312 876 91',
    chronicDiseases: ['Asthme Sévère Persistant'],
    activeTreatmentsCount: 3,
    lastVisitDate: '2026-08-26',
    doctorName: 'Dr Sylvie Petit (Pneumologue)',
    hasDossierPharmaceutique: true,
    aldStatus: true,
    observanceRatePct: 76,
    interactionAlert: 'Surutilisation de Ventoline (> 3 flacons/trimestre) détectée',
    allergies: ['Acariens', 'Pollen de Bouleau'],
    nextPrescriptionRenewalDate: '2026-09-10'
  }
];

export const MOCK_ROSP_INDICATORS: RospHealthIndicator[] = [
  {
    id: 'rosp-1',
    code: 'ROSP-GEN-01',
    category: 'Génériques & Biosimilaires',
    label: 'Taux de pénétration des Médicaments Génériques (Répertoire ANSM)',
    targetObjectivePct: 90.0,
    currentActualPct: 93.4,
    status: 'atteint',
    potentialRemunerationEuro: 6800.00,
    securedRemunerationEuro: 6800.00,
    description: 'Objectif conventionnel fixé par l\'Assurance Maladie. Félicitations, votre officine dépasse le seuil cible.'
  },
  {
    id: 'rosp-2',
    code: 'ROSP-BIO-02',
    category: 'Génériques & Biosimilaires',
    label: 'Dispensation des Biosimilaires (Énoxaparine, Filgrastim, Insulines)',
    targetObjectivePct: 70.0,
    currentActualPct: 74.2,
    status: 'atteint',
    potentialRemunerationEuro: 3200.00,
    securedRemunerationEuro: 3200.00,
    description: 'Substitution et délivrance active des biosimilaires enregistrés avec accord prescripteur.'
  },
  {
    id: 'rosp-3',
    code: 'ROSP-NUM-03',
    category: 'Modernisation & Numérique',
    label: 'Usage de l\'ordonnance numérique (e-Prescription) & Mon Espace Santé',
    targetObjectivePct: 80.0,
    currentActualPct: 82.5,
    status: 'atteint',
    potentialRemunerationEuro: 4500.00,
    securedRemunerationEuro: 4500.00,
    description: 'Alimentation systématique du Dossier Médical Partagé et scan du QR-code e-prescription.'
  },
  {
    id: 'rosp-4',
    code: 'ROSP-BPM-04',
    category: 'Accompagnement Patients Chroniques',
    label: 'Entretiens Pharmaceutiques & Bilans Partagés de Médication (BPM)',
    targetObjectivePct: 40.0,
    currentActualPct: 35.0,
    status: 'en_bonne_voie',
    potentialRemunerationEuro: 2400.00,
    securedRemunerationEuro: 1800.00,
    description: 'Il reste 5 bilans de médication à réaliser avant fin décembre pour débloquer le palier supérieur à 100%.'
  },
  {
    id: 'rosp-5',
    code: 'ROSP-DEP-05',
    category: 'Santé Publique & Dépistage',
    label: 'Réalisation des Dépistages TROD (Angine, Cystite) & Vaccination',
    targetObjectivePct: 100.0,
    currentActualPct: 91.0,
    status: 'en_bonne_voie',
    potentialRemunerationEuro: 1900.00,
    securedRemunerationEuro: 1550.00,
    description: 'Campagne de vaccination et TROD angines orientés au comptoir.'
  }
];
