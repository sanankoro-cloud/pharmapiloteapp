// Types pour le contrôle des factures, bordereaux et règlements par LCR (Lettre de Change Relevé)

export type LcrStatus = 
  | 'a_controler'        // Relevé reçu, pointage en cours
  | 'bon_a_payer'        // BAP validé par le pharmacien titulaire
  | 'litige_partiel'     // Écart détecté (avoir manquant, facture contestée, double facturation)
  | 'rejete_banque'      // Rejet total ou partiel transmis à la banque avant l'échéance
  | 'regle_debit';       // Débité et lettré sur le compte Crédit Agricole

export interface LcrInvoiceItem {
  id: string;
  invoiceNumber: string;
  deliverySlipNumber?: string; // N° BL (Bon de livraison)
  issueDate: string;
  amountHt: number;
  amountTtc: number;
  discountAmount?: number;
  commercialBonusRfa?: number;
  itemsCount: number;
  verified: boolean;
  notes?: string;
  matchedStockReception: boolean;
  facturXId?: string;
}

export interface LcrCreditNoteItem {
  id: string;
  creditNoteNumber: string;
  referenceInvoiceNumber?: string;
  date: string;
  reason: 'retour_perime' | 'manquant_livraison' | 'casse_transport' | 'rfa_trimestrielle' | 'remise_commerciale';
  amountTtc: number;
  appliedOnLcr: boolean;
  notes?: string;
}

export interface LcrStatement {
  id: string;
  lcrNumber: string; // Ex: LCR-OCP-2026-08-31
  supplierName: string;
  supplierSiren: string;
  supplierType: 'grossiste' | 'laboratoire_direct';
  periodLabel: string; // Ex: "Quinzaine du 01 au 15 Août 2026" ou "Relevé Mensuel Août 2026"
  issueDate: string;
  dueDate: string; // Date d'échéance de présentation bancaire
  rejectionDeadlineDate: string; // Date limite légale d'opposition / rejet (J-2 ouvré)
  
  totalAmountDrawn: number; // Montant tiré par le fournisseur sur la LCR
  calculatedAmountInvoices: number; // Somme des factures pointées
  totalCreditNotes: number; // Somme des avoirs déduits
  discrepancyAmount: number; // Écart (totalAmountDrawn - (calculatedAmountInvoices - totalCreditNotes))
  
  status: LcrStatus;
  reconciliationScore: number; // Score de concordance 0 - 100%
  
  bankAccount: string; // Ex: Crédit Agricole Pro FR76 1820 6001 2345 6789 01
  bankPreNotificationReceived: boolean;
  
  invoices: LcrInvoiceItem[];
  creditNotes: LcrCreditNoteItem[];
  
  discrepancyReasons?: string[];
  bapSignedBy?: string;
  bapDate?: string;
  bapNotes?: string;
  
  rejectionNoticeNumber?: string;
  rejectionDate?: string;
  rejectionReason?: string;
  
  paidAtDate?: string;
  debitTransactionId?: string;
}

export interface LcrAutoMatchRulesConfig {
  amountToleranceEuros: number; // Ex: 0.05 € (tolérance centimes / arrondi TVA)
  dueDateToleranceDays: number; // Ex: 5 jours (tolérance décalage date émission/échéance)
  supplierNameFuzzyMatch: boolean; // Correspondance fournisseur insensible casse/forme juridique
  allowDeliverySlipMatch: boolean; // Autoriser rapprochement par N° de BL (Bon de Livraison)
  minConfidenceScore: number; // Seuil de score minimal pour proposer (ex: 80%)
  autoSelectExactMatches: boolean; // Pré-sélectionner automatiquement les correspondances à 100%
  
  // Paramètres d'alerte d'erreurs
  anomalyAlertThreshold: number; // Seuil d'anomalies (ex: 3) déclenchant l'alerte visuelle
  evaluationPeriodDays: number; // Période d'évaluation en jours (ex: 30 jours)
}

export const DEFAULT_LCR_RULES_CONFIG: LcrAutoMatchRulesConfig = {
  amountToleranceEuros: 0.05,
  dueDateToleranceDays: 5,
  supplierNameFuzzyMatch: true,
  allowDeliverySlipMatch: true,
  minConfidenceScore: 80,
  autoSelectExactMatches: true,
  anomalyAlertThreshold: 3,
  evaluationPeriodDays: 30
};

export interface LcrMatchAnomaly {
  id: string;
  statementId: string;
  statementLcrNumber: string;
  statementSupplierName: string;
  invoiceId: string;
  invoiceNumber: string;
  expectedAmountTtc: number;
  candidateSource: string;
  candidateReference?: string;
  candidateAmountTtc?: number;
  amountDifference: number;
  dateDifferenceDays: number;
  anomalyType: 'amount_out_of_tolerance' | 'date_out_of_tolerance' | 'missing_counterpart' | 'unrecognized_reference';
  detectedAt: string;
  suggestedAction: string;
}

export interface LcrAutoMatchProposal {
  id: string;
  statementId: string;
  statementLcrNumber: string;
  statementSupplierName: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmountTtc: number;
  invoiceAmountHt: number;
  invoiceDate: string;
  deliverySlipNumber?: string;
  
  matchedSource: 'facturx_vault' | 'supplier_order_lgo' | 'stock_reception_bl' | 'releve_grossiste';
  matchedSourceName: string;
  matchedReference: string; // N° Facture ou N° BL trouvé dans la source
  matchedAmountTtc: number;
  amountDifference: number; // Différence (0.00 ou dans la tolérance)
  dateDifferenceDays: number;
  matchedSupplier: string;
  matchScore: number; // 0 - 100%
  matchConfidence: 'exact_perfect' | 'high_confidence' | 'probable';
  matchReason: string; // Ex: "Montant TTC 6 387,24 € et Réf. 9702086525 identiques à la facture Factur-X PDP"
  isWithinTolerance: boolean;
  alreadyVerified: boolean;
  selectedForApplication: boolean;
}

export interface LcrAutoMatchResult {
  totalProposals: number;
  unverifiedProposalsCount: number;
  exactMatchesCount: number;
  toleranceMatchesCount: number;
  totalAmountMatchedTtc: number;
  statementsImpactedCount: number;
  proposals: LcrAutoMatchProposal[];
  anomalies: LcrMatchAnomaly[];
  anomaliesCount: number;
  isAlertThresholdExceeded: boolean;
}

export interface LcrKpiSummary {
  totalPendingAmount: number;
  totalBapApprovedAmount: number;
  totalDiscrepancyAmount: number;
  nextDueDate: string;
  nextDueAmount: number;
  nextDueSupplier: string;
  daysUntilNextDue: number;
  statementsCount: {
    total: number;
    toControl: number;
    bapApproved: number;
    inDispute: number;
    settled: number;
  };
}
