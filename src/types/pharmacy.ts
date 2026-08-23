// Types pour l'application de contrôle de gestion d'une pharmacie d'officine

export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

export type ProductTva = 2.1 | 5.5 | 10.0 | 20.0;

export type ProductCategory = 
  | 'medicament_remboursable' 
  | 'medicament_otc' 
  | 'parapharmacie' 
  | 'dispositif_medical' 
  | 'nutrition_bebe' 
  | 'veterinaire' 
  | 'acte_pharmaceutique';

export interface ProductStock {
  id: string;
  cip: string; // Code CIP/ACL 13 chiffres
  name: string;
  dci?: string;
  category: ProductCategory;
  laboratory: string;
  stockQty: number;
  minThreshold: number;
  maxThreshold: number;
  pump: number; // Prix Unitaire Moyen Pondéré HT
  publicPriceTtc: number; // Prix public TTC
  tva: ProductTva;
  location: string; // Ex: Tiroir A3, Frigo 2-8°C, Rayon Bébé
  lotNumber: string;
  expiryDate: string; // YYYY-MM-DD
  daysUntilExpiry: number;
  status: 'optimal' | 'low_stock' | 'critical_stock' | 'near_expiry' | 'expired';
  isRefrigerated?: boolean;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  supplierType: 'grossiste' | 'laboratoire_direct' | 'prestataire';
  orderDate: string;
  deliveryDate?: string;
  status: 'en_attente' | 'validee' | 'expediee' | 'receptionnee' | 'litige';
  itemsCount: number;
  totalHt: number;
  totalTtc: number;
  discountPercentage: number;
  commercialBonus: number; // RFA / Remise fin d'année
  invoiceNumber?: string;
  paymentDueDate: string;
  paymentStatus: 'a_payer' | 'payee' | 'en_retard' | 'escompte_dispo';
}

export interface ExpenseItem {
  id: string;
  category: 'loyer' | 'salaires' | 'logiciel_lgo' | 'robot_leasing' | 'energie_fluides' | 'assurance_rcp' | 'honoraires_comptables' | 'frais_bancaires_tpe' | 'autres';
  label: string;
  monthlyBudget: number;
  actualAmount: number;
  frequency: 'mensuel' | 'trimestriel' | 'annuel';
  lastPaymentDate: string;
  nextDueDate: string;
  paymentMethod: 'prelevement_sepa' | 'virement' | 'cb';
  supplier: string;
  status: 'a_jour' | 'alerte_depassement' | 'echeance_proche';
}

export interface BankTransaction {
  id: string;
  date: string;
  label: string;
  type: 'debit' | 'credit';
  amount: number;
  category: 'fournisseur' | 'cpam_ro' | 'mutuelles_rc' | 'remise_cb' | 'especes' | 'charges_sociales' | 'loyer' | 'autre';
  status: 'rapproche' | 'a_rapprocher' | 'ecart_detecte';
  matchedInvoice?: string;
  bankAccount: string; // Ex: Crédit Agricole Pro FR76 1820 6...
  reconciliationNotes?: string;
}

export interface CompetitorPharmacy {
  id: string;
  name: string;
  distanceKm: number;
  address: string;
  city: string;
  type: 'centre_commercial' | 'centre_ville' | 'zone_rurale' | 'mutualiste';
  marketPositioning: 'discount' | 'standard' | 'premium';
}

export interface CompetitorPriceComparison {
  productId: string;
  productName: string;
  cip: string;
  category: ProductCategory;
  myPriceTtc: number;
  myCostHt: number;
  myMarginPercentage: number;
  averageCompetitorPriceTtc: number;
  minCompetitorPriceTtc: number;
  maxCompetitorPriceTtc: number;
  competitorPrices: {
    pharmacyId: string;
    pharmacyName: string;
    distanceKm: number;
    priceTtc: number;
    lastCheckedDate: string;
  }[];
  suggestedPriceTtc: number;
  suggestedMarginPercentage: number;
  recommendation: 'baisser_prix' | 'augmenter_prix' | 'prix_optimal' | 'opportunite_marge';
  priceElasticityScore: number; // 1 to 5 (sensibilité au prix)
}

export interface DailySaleStat {
  date: string;
  totalCaHt: number;
  totalCaTtc: number;
  marginHt: number;
  marginRate: number; // %
  prescriptionsCount: number;
  otcCustomersCount: number;
  totalTransactions: number;
  averageBasketTtc: number;
  hourlyDistribution: {
    hour: string; // Ex: "08h-10h"
    amountTtc: number;
    transactions: number;
  }[];
  tvaBreakdown: {
    tvaRate: ProductTva;
    baseHt: number;
    tvaAmount: number;
  }[];
  paymentBreakdown: {
    cb: number;
    especes: number;
    tiersPayantRo: number; // Sécu CPAM
    tiersPayantRc: number; // Mutuelles
    cheques: number;
  };
}

export interface MonthlyAccountingReport {
  month: string; // "2026-08"
  monthName: string;
  caTtc: number;
  caHt: number;
  achatsConsommesHt: number;
  margeBruteHt: number;
  margeBrutePct: number;
  chargesExternes: number;
  chargesPersonnel: number;
  ebe: number; // Excédent Brut d'Exploitation
  ebitdaPct: number;
  tvaCollectee: number;
  tvaDeductible: number;
  tvaAPayer: number;
  tresorerieFinale: number;
  status: 'cloture' | 'en_cours' | 'exporte';
  exportFormats: ('PDF' | 'EXCEL' | 'FEC')[];
}

export interface PushNotificationAlert {
  id: string;
  title: string;
  message: string;
  type: 'retard_paiement' | 'alerte_budget' | 'peremption' | 'rupture_stock' | 'reconciliation_bancaire' | 'concurrent_prix';
  severity: 'critique' | 'attention' | 'info';
  timestamp: string;
  isRead: boolean;
  actionLink?: string;
  metadata?: Record<string, string | number>;
}

export interface PharmacyFinancialSummary {
  todayCaTtc: number;
  todayCaTarget: number;
  todayMarginPct: number;
  monthCaTtc: number;
  monthCaTarget: number;
  monthGrowthN1: number; // % vs N-1
  currentBankBalance: number; // Solde Crédit Agricole
  accountingBalance: number;
  pendingCustomerReceivables: number; // Reste à recouvrer Tiers-Payant
  pendingSupplierPayables: number; // Factures fournisseurs à échoir
  totalStockValuePump: number; // Stock HT au PUMP
  totalStockValuePublic: number; // Stock valeur vente TTC
  criticalExpiriesCount: number; // < 30j
  pendingBankReconciliationsCount: number;
  activeBudgetAlertsCount: number;
}
