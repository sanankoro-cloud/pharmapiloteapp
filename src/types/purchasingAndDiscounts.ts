// Types pour le suivi des variations de prix d'achat et le contrôle des remises commerciales / RFA

import { ProductCategory } from './pharmacy';

export type PriceVariationSeverity = 'critique' | 'haute' | 'moderee' | 'baisse';
export type PriceVariationStatus = 
  | 'non_traite' 
  | 'prix_vente_ajuste' 
  | 'en_contestation' 
  | 'hausse_acceptee' 
  | 'substitut_trouve';

export interface PurchasePriceVariation {
  id: string;
  cip: string;
  name: string;
  dci?: string;
  laboratory: string;
  supplier: string;
  category: ProductCategory;
  previousPriceHt: number;
  newPriceHt: number;
  deltaAmountHt: number;
  deltaPercentage: number;
  previousMarginPct: number;
  newMarginPct: number;
  currentPublicPriceTtc: number;
  suggestedPublicPriceTtc: number;
  dateDetected: string;
  sourceDocument: string; // Ex: "Facture OCP #8831940", "Tarif Labo Pfizer 08/2026"
  status: PriceVariationStatus;
  severity: PriceVariationSeverity;
  estimatedAnnualVolumeUnits: number;
  estimatedAnnualImpactEuros: number;
  reason?: string; // Ex: "Hausse tarifaire brute laboratoire", "Perte de remise grossiste", "Augmentation coût matière active"
  suggestedAction: string;
  alternativeProduct?: {
    cip: string;
    name: string;
    laboratory: string;
    priceHt: number;
    savingsPerUnit: number;
  };
  notes?: string;
}

export type DiscountAuditStatus = 'conforme' | 'sous_remise_detectee' | 'avoir_en_attente' | 'objectif_proche';

export interface DiscountDiscrepancyItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  productOrCategory: string;
  grossAmountHt: number;
  contractualRatePct: number;
  appliedRatePct: number;
  expectedDiscountEuros: number;
  appliedDiscountEuros: number;
  discrepancyLossEuros: number; // Montant de la sous-remise à réclamer
  status: 'a_reclamer' | 'avoir_recu' | 'justifie_par_labo';
}

export interface SupplierRfaContract {
  id: string;
  supplierName: string;
  supplierType: 'grossiste' | 'laboratoire_direct' | 'groupement';
  groupementName?: string; // Ex: 'Alphega Pharmacie', 'Giphar', 'Pharmactiv'
  contractYear: number;
  contractReference: string;
  directInvoiceDiscountRatePct: number; // Remise directe sur facture
  paymentCashDiscountRatePct: number;  // Escompte de règlement (ex: 1.0%)
  rfaAnnualTargetTurnoverHt: number;   // Seuil de CA annuel HT pour déblocage RFA
  rfaRatePct: number;                  // Taux RFA contractuel (ex: 4.5%)
  rfaTierDescription: string;          // Ex: "3% si > 50k€, 4.5% si > 100k€, 6% si > 180k€"
  actualYtdPurchasesHt: number;        // Achats cumulés réels YTD
  projectedAnnualPurchasesHt: number;  // Projection à fin d'exercice
  accruedRfaAmountEuros: number;       // Montant RFA acquis à ce jour
  receivedCreditNotesEuros: number;    // Avoirs RFA déjà déduits / payés
  pendingCreditNotesEuros: number;     // Avoirs RFA restant à réclamer
  discrepanciesCount: number;          // Nombre d'anomalies de sous-remise
  totalDiscrepancyLossEuros: number;   // Total pertes détectées
  auditStatus: DiscountAuditStatus;
  discrepancies: DiscountDiscrepancyItem[];
  lastAuditDate: string;
}

export interface PriceAlertFilterConfig {
  searchQuery: string;
  selectedSeverity: string;
  selectedCategory: string;
  selectedLaboratory: string;
  minDeltaPct: number;
  onlyUnprocessed: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  priceHt: number;
  invoiceRef: string;
  invoiceType: 'direct_labo' | 'grossiste_repartition' | 'tarif_catalogue';
  discountRatePct: number;
  netPriceHt: number;
  publicPriceTtc: number;
  marginRatePct: number;
  comment?: string;
}

export type NegotiationStatus = 
  | 'a_negocier' 
  | 'en_cours' 
  | 'remise_obtenue' 
  | 'refuse_par_labo' 
  | 'substitue';

export interface ProductPriceHistory {
  cip: string;
  name: string;
  dci?: string;
  category: ProductCategory;
  laboratory: string;
  supplier: string;
  annualVolumeUnits: number;
  currentPriceHt: number;
  basePriceHtNMinus1: number;
  totalVariationPct: number;
  totalAnnualExtraCostEuros: number;
  marginErosionPts: number;
  currentMarginPct: number;
  targetMarginPct: number;
  currentPublicPriceTtc: number;
  suggestedPublicPriceTtc: number;
  historyPoints: PriceHistoryPoint[];
  negotiationStatus: NegotiationStatus;
  requestedCompensationRatePct: number;
  requestedCreditNoteEuros: number;
  substituteAlternative?: {
    cip: string;
    name: string;
    laboratory: string;
    priceHt: number;
    estimatedSavings: number;
  };
  laboJustification?: string;
}

export interface SupplierPriceHistorySummary {
  supplierId: string;
  supplierName: string;
  supplierType: 'laboratoire_direct' | 'grossiste' | 'groupement';
  contactCommercial?: {
    name: string;
    role: string;
    email: string;
    phone: string;
    lastMeetingDate?: string;
    nextMeetingDate?: string;
  };
  annualPurchasesVolumeHt: number;
  totalReferencesCount: number;
  hikesReferencesCount: number;
  decreasesReferencesCount: number;
  averagePriceHikePct: number;
  totalAnnualOvercostEuros: number;
  totalMarginErosionPts: number;
  negotiationPriority: 'urgente' | 'haute' | 'moderee' | 'faible';
  suggestedRemiseCompensationPct: number;
  products: ProductPriceHistory[];
  negotiationNotes?: string;
}

