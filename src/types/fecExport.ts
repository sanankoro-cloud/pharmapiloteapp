// Types pour l'Export du Fichier des Écritures Comptables (FEC) et le Journal de Lettrage Officinal
// Conforme à l'Article A.47 A-1 du Livre des Procédures Fiscales (DGFIP - France)

export type FecJournalCode = 'HA' | 'VT' | 'BQ' | 'OD' | 'AN';

export interface FecEntry {
  id: string;
  JournalCode: FecJournalCode; // Code journal (HA=Achats, VT=Ventes, BQ=Banque, OD=Opérations diverses/Lettrages, AN=À-nouveaux)
  JournalLib: string; // Libellé du journal
  EcritureNum: string; // Numéro d'écriture séquentiel continu
  EcritureDate: string; // Date de comptabilisation (YYYYMMDD)
  CompteNum: string; // Numéro de compte du Plan Comptable Général / Officine
  CompteLib: string; // Intitulé du compte PCG
  CompAuxNum?: string; // Numéro de compte auxiliaire (ex: 401OCP, 411CPAM)
  CompAuxLib?: string; // Intitulé du compte auxiliaire (ex: OCP Répartition, CPAM Paris)
  PieceRef: string; // Référence de la pièce justificative (Facture, Traite LCR, Bordereau NOEMIE, Z de caisse)
  PieceDate: string; // Date de la pièce justificative (YYYYMMDD)
  EcritureLib: string; // Libellé de la ligne d'écriture
  Debit: number; // Montant Débit (€)
  Credit: number; // Montant Crédit (€)
  EcritureLet?: string; // Code de lettrage d'apurement (ex: AA, AB, LCR-01, NOE-22)
  DateLet?: string; // Date du lettrage (YYYYMMDD)
  ValidDate: string; // Date de validation définitive (YYYYMMDD)
  Montantdevise?: number; // Montant en devise étrangère (optionnel)
  Idevise: string; // Code devise ISO (ex: EUR)
}

export type LettrageNature = 
  | 'lcr_grossiste' 
  | 'lcr_laboratoire' 
  | 'tiers_payant_noemie' 
  | 'tiers_payant_mutuelle' 
  | 'remise_rfa_avoir' 
  | 'virement_fournisseur_direct'
  | 'regularisation_centimes';

export interface FecLettrageGroup {
  id: string;
  codeLettrage: string; // Ex: 'LCR-OCP-2608', 'AA', 'NOE-CPAM-08'
  dateLettrage: string; // Date du pointage (YYYY-MM-DD)
  dateLettrageFormatted: string;
  compteNum: string; // 401000 ou 411000
  compAuxNum?: string;
  compAuxLib: string; // Tiers (ex: OCP Répartition, CPAM, Sanofi)
  nature: LettrageNature;
  natureLabel: string;
  
  entriesCount: number;
  totalDebit: number;
  totalCredit: number;
  soldeLettrage: number; // Doit être 0.00 € (ou écart toléré)
  isEquilibre: boolean;
  
  pieceReferences: string[]; // Ex: ['FAC-984021', 'FAC-984022', 'LCR-OCP-2026-08-31']
  lcrStatementId?: string;
  noemieBatchId?: string;
  
  entries: FecEntry[];
  notes?: string;
}

export interface FecAuditValidationCheck {
  id: string;
  name: string;
  category: 'format' | 'equilibre' | 'dates' | 'lettrage' | 'numerotation';
  description: string;
  status: 'conforme' | 'avertissement' | 'non_conforme';
  details: string;
}

export interface FecAuditValidationReport {
  isCompliant: boolean;
  complianceScore: number; // 0 à 100%
  totalEntriesCount: number;
  totalDebit: number;
  totalCredit: number;
  balanceDifference: number;
  lettrageRatePct: number;
  totalLettragedEntriesCount: number;
  totalNonLettragedEntriesCount: number;
  checks: FecAuditValidationCheck[];
  siren: string;
  fiscalYear: number;
  generatedAt: string;
  officialFilename: string; // Format DGFiP : [SIREN]FEC[DateCloture].txt
}

export type FecExportFormat = 'txt_pipe' | 'txt_tab' | 'csv_semicolon';
