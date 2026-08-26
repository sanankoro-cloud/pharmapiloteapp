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
  monthlySalesQty?: number; // Ventes mensuelles moyennes (unités)
  lastSaleDate?: string; // Date de dernière sortie/dispensation
  abcClass?: 'A' | 'B' | 'C'; // Classification Pareto ABC
  stockDaysCoverage?: number; // Jours de couverture de stock
  supplier?: string; // Grossiste / Fournisseur principal (ex: OCP, Phoenix, Direct Labo)
  isHighValue?: boolean; // Haute valeur / Coffre sécurisé
  isDormant?: boolean; // Stock dormant / Surstock > 90 jours
  isEssential?: boolean; // MITM - Médicament d'Intérêt Thérapeutique Majeur / Produit Vital
  dailySalesRate?: number; // Vitesse de sortie moyenne quotidienne (boîtes/jour)
  salesTrendPct?: number; // Tendance d'accélération des ventes récentes vs N-1 (+25%, -10%, etc.)
  leadTimeDays?: number; // Délai d'approvisionnement fournisseur en jours (0.5j grossiste, 5j direct)
  reorderPoint?: number; // Seuil de commande prédictif calculé (ROP)
  suggestedReorderQty?: number; // Quantité de réassort optimale calculée
}

export type StockoutSeverity = 'critical_imminent' | 'warning_reorder' | 'watch_trend' | 'healthy';

export interface StockoutPrediction {
  productId: string;
  product: ProductStock;
  currentStock: number;
  minThreshold: number;
  maxThreshold: number;
  dailyVelocity: number; // Boîtes vendues par jour
  salesTrendPct: number; // % variation récente
  leadTimeDays: number; // Délai livraison
  safetyStockDays: number; // Marge de sécurité
  daysUntilCriticalThreshold: number; // Jours restants avant de toucher le seuil mini
  daysUntilStockout: number; // Jours restants avant stock 0 (rupture sèche)
  predictedThresholdDate: string; // Date estimée franchissement seuil mini
  predictedStockoutDate: string; // Date estimée rupture 0
  urgencyLevel: StockoutSeverity;
  urgencyScore: number; // 0 (sûr) à 100 (urgence absolue)
  recommendedReorderQty: number; // Quantité recommandée à commander
  reorderCostPumpHt: number; // Coût d'achat du réassort (€ HT)
  potentialLostRevenueHt: number; // CA hebdomadaire menacé par la rupture (€ HT)
  isEssential: boolean; // MITM / Traitement vital
  isRefrigerated: boolean;
  abcClass: 'A' | 'B' | 'C';
  supplierName: string;
  supplierType: 'grossiste' | 'laboratoire_direct';
  hasAvailableGenericAlternative: boolean;
  genericAlternativesCount: number;
  riskReason: string; // Explication pédagogique pour le pharmacien
}

export interface PredictiveAlertsSummary {
  totalAnalyzed: number;
  totalAlerts: number;
  criticalImminentCount: number; // < 3 jours
  warningReorderCount: number; // 3 - 7 jours
  watchTrendCount: number; // 8 - 14 jours
  healthyCount: number;
  essentialAtRiskCount: number; // MITM menacés
  totalPotentialLostRevenueHt: number; // CA menacé
  totalReorderBudgetHt: number; // Budget réassort préconisé
  averageCoverageDaysEssential: number;
  reorderSuggestionLinesCount: number;
}

export interface StockCategoryStats {
  category: ProductCategory;
  categoryLabel: string;
  tvaRate: ProductTva;
  productCount: number;
  totalUnits: number;
  totalValuePumpHt: number;
  totalRetailValueTtc: number;
  potentialMarginHt: number;
  marginRatePct: number;
  shareOfStockPct: number;
  color: string;
}

export interface StockAbcStats {
  classA: {
    count: number;
    valueHt: number;
    pctValue: number;
    pctItems: number;
    description: string;
  };
  classB: {
    count: number;
    valueHt: number;
    pctValue: number;
    pctItems: number;
    description: string;
  };
  classC: {
    count: number;
    valueHt: number;
    pctValue: number;
    pctItems: number;
    description: string;
  };
}

export interface StockTurnoverStats {
  averageTurnoverRate: number; // Ex: 8.4 rotations/an
  averageDaysCoverage: number; // Ex: 43 jours
  fastMoversCount: number; // < 20 jours
  optimalMoversCount: number; // 20 - 45 jours
  slowMoversCount: number; // 45 - 90 jours
  dormantStockCount: number; // > 90 jours
  dormantStockValueHt: number; // Valeur HT immobilisée en dormant
  serviceRatePct: number; // Taux de service / Disponibilité (ex: 97.4%)
  stockoutRiskCount: number; // Produits en rupture ou sous-seuil
}

export interface StockExpiryRiskStats {
  under30DaysCount: number;
  under30DaysValueHt: number;
  under60DaysCount: number;
  under60DaysValueHt: number;
  under90DaysCount: number;
  under90DaysValueHt: number;
  safeCount: number;
  safeValueHt: number;
  totalAtRiskValueHt: number;
}

export interface LaboratoryStockStats {
  laboratory: string;
  itemsCount: number;
  totalUnits: number;
  totalValueHt: number;
  sharePct: number;
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
  type: 'retard_paiement' | 'alerte_budget' | 'peremption' | 'rupture_stock' | 'reconciliation_bancaire' | 'concurrent_prix' | 'marge_chute';
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

export interface PharmacyProfile {
  name: string; // Ex: Pharmacie de l'Épau ou Pharmacie Centrale
  legalStructure: string; // Ex: SELARL, SARL, SAS, Exploitation Agricole & Pharmacie
  managerName: string; // Ex: Dr N'Fafode Camara
  address: string; // Ex: 74 Rue de l'Estérel
  city: string; // Ex: Le Mans
  postalCode: string; // Ex: 72100
  phone?: string;
  email?: string;
  finessOrSiret?: string;
  primaryBankName: string; // Ex: Crédit Agricole Pro
  primaryIban?: string;
  initialBankBalance: number;
  businessSector: 'officine_pure' | 'agri_pharma' | 'polyvalent';
}

