// Types pour le Connecteur RESOPHARMA (Télétransmission SESAM-Vitale, Retours NOEMIE, DRE Mutuelles et Rapprochement Bancaire)

export type ResopharmaFluxType = 
  | 'RO_NOEMIE'        // Régime Obligatoire (CPAM, MSA, MGEN, etc.)
  | 'RC_DRE'           // Régime Complémentaire (Viamédis, Almerys, iSanté, SP Santé, Actil, etc.)
  | 'REJET_TIERS_PAYANT' // Rejets de télétransmission / Indus à régulariser
  | 'ROSP_FORFAIT';    // Rémunération sur Objectifs de Santé Publique / Forfaits officine

export type ResopharmaReconciliationStatus = 
  | 'rapproche_total'      // Virement bancaire reçu et égal au montant du bordereau
  | 'en_attente_virement'  // Télétransmis, en attente de crédit bancaire
  | 'ecart_detecte'        // Virement reçu mais montant différent (rejet partiel ou déduction)
  | 'rejet_a_traiter';     // Rejet total ou dossier bloqué par la caisse/mutuelle

export interface ResopharmaFseDetail {
  id: string;
  fseNumber: string;         // N° Feuille de Soins Électronique
  prescriptionDate: string;  // Date de dispensation
  patientName: string;
  patientNir: string;        // Numéro de Sécurité Sociale masqué (ex: 1 85 04 75 *** 12)
  prescribingDoctor?: string;
  partRo: number;            // Part Régime Obligatoire (€)
  partRc: number;            // Part Régime Complémentaire (€)
  totalTtc: number;          // Montant total (€)
  status: 'regle' | 'en_attente' | 'rejet';
  rejetCode?: string;        // Code retour norme B2/NOEMIE (ex: '032', '104')
  rejetMotif?: string;       // Libellé de l'anomalie
}

export interface ResopharmaBordereau {
  id: string;
  bordereauNumber: string;       // Ex: BORD-RESO-20260822-01
  lotTeletransNumber: string;    // Ex: LOT-FSE-2026-0821-41
  fluxType: ResopharmaFluxType;
  organismeName: string;         // Ex: CPAM Paris 75, VIAMEDIS Santé, ALMERYS
  organismeCode: string;         // Code préfectoral ou AMC (ex: '01751', 'AMC-9901')
  teletransDate: string;         // Date d'émission de la télétransmission
  bankExpectedDate: string;      // Date estimée du virement bancaire
  bankReceivedDate?: string;     // Date réelle du virement constaté en banque
  amountTeletrans: number;       // Montant total télétransmis (€)
  amountPaid: number;            // Montant effectivement crédité en banque (€)
  rejectionAmount: number;       // Montant rejeté / retenu (€)
  fseCount: number;              // Nombre de feuilles de soins dans le bordereau
  status: ResopharmaReconciliationStatus;
  linkedBankTransactionId?: string; // ID de l'écriture bancaire liée
  bankTransferRef?: string;      // Référence du virement bancaire constaté
  reconciliationNotes?: string;  // Commentaires de lettrage
  fseDetails: ResopharmaFseDetail[]; // Liste détaillée des FSE du bordereau
}

export interface ResopharmaConnectorConfig {
  id: string;
  name: string;
  finessOfficine: string;        // N° FINESS de la pharmacie (9 chiffres)
  rppsTitulaire: string;         // N° RPPS du pharmacien titulaire (11 chiffres)
  concentratorCode: string;      // Code concentrateur Resopharma (ex: '000' ou '999')
  concentratorName: string;
  apiEndpoint: string;
  isConnected: boolean;
  status: 'active' | 'syncing' | 'error' | 'disconnected';
  lastSyncDate: string;
  totalBorderauxCount: number;
  totalAmountReconciled: number;
  totalAmountPending: number;
  totalRejectionsAmount: number;
  autoReconcileBank: boolean;    // Rapprochement automatique NOEMIE / DRE avec le compte bancaire
  toleranceDays: number;         // Tolérance de décalage de dates (ex: 4 jours ouvrés)
  autoCreateRejectionAlerts: boolean; // Alerter en cas de rejet > 10 €
  certificateValidityDate: string; // Validité du certificat Sesam-Vitale / CPS
}

export interface ResopharmaSyncLog {
  id: string;
  timestamp: string;
  borderauxFetched: number;
  totalAmountFetched: number;
  matchedCount: number;
  rejectedCount: number;
  status: 'success' | 'warning' | 'error';
  message: string;
}
