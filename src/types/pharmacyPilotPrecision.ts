// Types for PharmaPilot Precision System Modules

export interface SmartOrderingItem {
  id: string;
  cip: string;
  name: string;
  category: string;
  supplier: string;
  currentStock: number;
  minSafetyStock: number;
  recommendedOrderQty: number;
  averageMonthlySales: number;
  seasonalityFactor: number; // e.g. 1.4 for winter allergy/cold spike
  aiConfidenceScore: number; // e.g. 96%
  reason: string; // Ex: "Pic épidémique grippal détecté à 72h + Rupture labo Sanofi anticipée"
  estimatedCostHt: number;
  expectedMarginPct: number;
  urgency: 'critique' | 'haute' | 'normale' | 'optimisation';
  selected: boolean;
}

export interface QualityNonConformity {
  id: string;
  date: string;
  type: 'erreur_delivrance_evitee' | 'chaine_froid' | 'reclamation_patient' | 'defaut_lot_labo' | 'ordonnance_douteuse' | 'retrait_ansm';
  title: string;
  description: string;
  reportedBy: string;
  severity: 'faible' | 'moyenne' | 'haute' | 'critique';
  status: 'ouverte' | 'analyse_en_cours' | 'action_corrective_validee' | 'resolue';
  correctiveAction: string;
  preventiveAction: string;
  resolvedDate?: string;
  validatedByPharmacist: boolean;
}

export interface QualityProcedure {
  id: string;
  code: string;
  title: string;
  version: string;
  category: 'BPDO' | 'Dispensation' | 'Hygiène & Chaîne du Froid' | 'Stupéfiants' | 'Vaccination' | 'Gestion des Déchets';
  lastReviewDate: string;
  nextReviewDate: string;
  status: 'validee' | 'a_reviser' | 'en_redaction';
  author: string;
  signedTeamMembersCount: number;
  totalTeamMembersCount: number;
}

export interface DigitalServicePatient {
  id: string;
  patientName: string;
  nirMasked: string;
  age: number;
  serviceType: 'entretien_avk' | 'entretien_aod' | 'entretien_asthme' | 'entretien_anticancereux' | 'bilan_partage_medication' | 'vaccination' | 'teleconsultation' | 'trod_angine';
  dateScheduled: string;
  pharmacistAssigned: string;
  status: 'planifie' | 'realise' | 'facture_ameli' | 'en_attente_accord';
  ameliCode: string; // Ex: "EAV 1", "BPM 1", "VAX"
  remunerationEuro: number;
  notes: string;
  complianceScorePct: number;
}

export interface DocumentGedItem {
  id: string;
  title: string;
  category: 'facture_fournisseur' | 'ordonnance_securisee' | 'contrat_rfa' | 'attestation_tp' | 'certificat_dasri' | 'fec_comptable' | 'releve_bancaire';
  fileFormat: 'PDF' | 'XML_FACTURX' | 'ZIP' | 'CSV';
  fileSize: string;
  dateAdded: string;
  supplierOrIssuer: string;
  isArchived10Years: boolean;
  status: 'valide' | 'a_controler' | 'synchronise_comptable';
  amountHt?: number;
}

export interface RoboticUnitStatus {
  id: string;
  robotModel: string; // "BD Rowa Vmax 160" | "Consis D3" | "Gollmann"
  serialNumber: string;
  status: 'en_service' | 'maintenance' | 'alerte_bourrage' | 'hors_ligne';
  storageCapacityBoxes: number;
  currentBoxesStored: number;
  fillRatePct: number;
  averageRetrievalTimeSec: number;
  dailyDeliveriesCount: number;
  temperatureCelsius: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  activeAlertsCount: number;
}

export interface InternalMessage {
  id: string;
  senderName: string;
  senderRole: string;
  avatarColor: string;
  timestamp: string;
  content: string;
  category: 'consigne_comptoir' | 'releve_equipe' | 'vigilance_patient' | 'stock_urgent' | 'general';
  isPinned: boolean;
  acknowledgedBy: string[];
}

export interface PatientCareFile {
  id: string;
  patientName: string;
  birthYear: number;
  nir: string;
  chronicDiseases: string[];
  activeTreatmentsCount: number;
  lastVisitDate: string;
  doctorName: string;
  hasDossierPharmaceutique: boolean;
  aldStatus: boolean;
  observanceRatePct: number;
  interactionAlert: string | null;
  allergies: string[];
  nextPrescriptionRenewalDate: string;
}

export interface RospHealthIndicator {
  id: string;
  code: string;
  category: 'Modernisation & Numérique' | 'Santé Publique & Dépistage' | 'Génériques & Biosimilaires' | 'Accompagnement Patients Chroniques';
  label: string;
  targetObjectivePct: number;
  currentActualPct: number;
  status: 'atteint' | 'en_bonne_voie' | 'a_renforcer';
  potentialRemunerationEuro: number;
  securedRemunerationEuro: number;
  description: string;
}
