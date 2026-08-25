import { ProductCategory } from './pharmacy';

export type TherapeuticProfitabilityTier = 
  | 'ultra_rentable'      // > 45% de marge
  | 'forte_rentabilite'   // 35% - 45%
  | 'rentabilite_standard'// 25% - 35%
  | 'marge_regulee_faible'// 15% - 25%
  | 'marge_critique';     // < 15%

export type BcgSegmentQuadrant = 
  | 'star_pepite'        // Forte marge + Fort volume (Moteur de profitabilité)
  | 'vache_a_lait'       // Marge modérée/régulée + Très fort volume (Socle de trésorerie)
  | 'levier_potentiel'   // Très forte marge + Volume modéré (Opportunité de conseil au comptoir)
  | 'surveillance_prix'; // Faible marge + Faible/Moyen volume (Optimisation achat urgente)

export type PricingRegimeType = 
  | 'tous'
  | 'regule_remboursable' 
  | 'prix_libre_otc' 
  | 'prix_libre_para' 
  | 'conseil_phyto_micro' 
  | 'dispositif_medical' 
  | 'veterinaire';

export interface TherapeuticClassSummary {
  id: string;
  name: string;
  shortName: string;
  atcCodePrefix: string;
  description: string;
  productCount: number;
  totalCaHt: number;
  totalMargeHt: number;
  averageMarginRatePct: number;
  averageMarkupMultiplier: number;
  monthlyVolumeUnits: number;
  marginContributionPct: number; // Part de la marge totale de l'officine (%)
  profitabilityTier: TherapeuticProfitabilityTier;
  bcgQuadrant: BcgSegmentQuadrant;
  color: string;
  badgeBg: string;
  topRecommendation: string;
  bestSellerName: string;
  mostProfitableProductName: string;
  maxProductMarginPct: number;
  minProductMarginPct: number;
}

export interface ProductMarginDetail {
  id: string;
  cip: string; // Code CIP 13 chiffres
  name: string;
  dci?: string;
  therapeuticClassId: string;
  therapeuticClassName: string;
  laboratory: string;
  category: ProductCategory;
  pricingRegime: PricingRegimeType;
  isGeneric: boolean;
  
  // Pricing & Margin Math
  pumpHt: number;                 // PUMP HT (€)
  sellingPriceHt: number;         // Prix de Vente HT (€)
  publicPriceTtc: number;         // Prix Public TTC (€)
  tvaPct: number;                 // Taux TVA (2.1%, 5.5%, 10%, 20%)
  unitMarginEur: number;          // Marge unitaire HT (€)
  marginRatePct: number;          // Taux de Marge Brute % = (Vente HT - PUMP HT) / Vente HT * 100
  markupMultiplier: number;       // Coeff Multiplicateur = Prix TTC / PUMP HT
  
  // Volumes & Performance
  monthlyUnitsSold: number;       // Volume mensuel (boîtes/mois)
  monthlyCaHt: number;            // CA HT mensuel (€)
  monthlyMarginHt: number;        // Marge HT mensuelle (€)
  marginContributionOfficePct: number; // Contribution à la marge totale officine (%)
  
  // Discounts & Floor Rules
  counterDiscountAveragePct: number; // Remise moyenne constatée en caisse (%)
  maxAdmissibleDiscountPct: number;  // Remise maximale avant marge < 15%
  
  // Categorization & Advice
  profitabilityLevel: TherapeuticProfitabilityTier;
  bcgQuadrant: BcgSegmentQuadrant;
  recommendationAction: string;
  priceElasticity: 'faible' | 'moyenne' | 'forte';
  rankInClass: number;
}

export interface TherapeuticFilterState {
  searchQuery: string;
  selectedClasses: string[]; // List of class IDs
  selectedPricingRegime: PricingRegimeType | 'tous';
  selectedProfitabilityTier: TherapeuticProfitabilityTier | 'tous';
  selectedBcgQuadrant: BcgSegmentQuadrant | 'tous';
  minMarginRatePct: number;
  maxMarginRatePct: number;
  onlyGenerics: boolean | null; // null = all, true = only generics, false = only princeps/brands
  sortBy: 'marginRatePct' | 'monthlyMarginHt' | 'monthlyCaHt' | 'monthlyUnitsSold' | 'markupMultiplier' | 'name';
  sortDirection: 'asc' | 'desc';
}

export interface TherapeuticGlobalStats {
  totalAnalyzedReferences: number;
  totalCaHtMonthly: number;
  totalMarginHtMonthly: number;
  globalAverageMarginPct: number;
  topSegmentByMarginPct: { name: string; marginPct: number };
  topSegmentByVolume: { name: string; units: number };
  topSegmentByMarginEur: { name: string; marginEur: number };
  ultraProfitableReferencesCount: number; // > 45%
  lowMarginReferencesCount: number; // < 20%
}
