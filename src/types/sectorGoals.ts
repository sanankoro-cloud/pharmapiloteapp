export type PharmacySectorKey = 'medicaments' | 'parapharmacie' | 'conseils';

export interface SectorMonthlyBreakdown {
  month: string; // 'Jan', 'Fév', etc.
  fullMonth: string;
  monthIndex: number; // 1 to 12
  quarter: 'T1' | 'T2' | 'T3' | 'T4';
  
  // Médicaments (Prescription, ALD, MITM, TVA 2.1% & 5.5%)
  medicamentsRealiseHt: number;
  medicamentsObjectifHt: number;
  medicamentsMargeHt: number;
  
  // Parapharmacie (Dermocosmétique, Hygiène, Bébé, TVA 20%)
  parapharmacieRealiseHt: number;
  parapharmacieObjectifHt: number;
  parapharmacieMargeHt: number;
  
  // Conseils / OTC (Automédication, Phyto-Aroma, Compléments, Actes, TVA 10% & 20%)
  conseilsRealiseHt: number;
  conseilsObjectifHt: number;
  conseilsMargeHt: number;
  
  // Totaux mensuels
  totalRealiseHt: number;
  totalObjectifHt: number;
  isProjected?: boolean; // Mois futurs (Sep, Oct, Nov, Déc)
}

export interface SectorSubCategoryDetail {
  id: string;
  name: string;
  shareInSectorPct: number;
  realiseYtdHt: number;
  objectifYtdHt: number;
  achievementRatePct: number;
  marginRatePct: number;
  growthN1Pct: number;
}

export interface SectorAnnualGoal {
  sectorKey: PharmacySectorKey;
  label: string;
  shortLabel: string;
  description: string;
  color: string; // Hex or Tailwind color
  badgeBg: string;
  badgeText: string;
  iconName: string;
  tvaRates: string; // "2.1% & 5.5%", "20.0%", "10.0% & 20.0%"
  
  // Objectifs et Réalisations Annuels (€ HT)
  annualGoalBudgetHt: number; // Objectif fixé en début d'année (ex: 1 200 000 €)
  ytdGoalBudgetHt: number; // Objectif cumulé à date (au 31 Août)
  ytdRealisedHt: number; // CA Réalisé cumulé à date
  
  // Indicateurs calculés
  achievementRatePct: number; // (ytdRealisedHt / ytdGoalBudgetHt) * 100
  varianceAmountHt: number; // ytdRealisedHt - ytdGoalBudgetHt
  variancePct: number; // ((ytdRealisedHt - ytdGoalBudgetHt) / ytdGoalBudgetHt) * 100
  
  // Marge & Rentabilité
  averageMarginRatePct: number; // Ex: 26.8%, 38.5%, 46.2%
  ytdMarginRealisedHt: number;
  
  // Part dans le mix total
  actualMixSharePct: number; // Part réelle dans le CA
  targetMixSharePct: number; // Part cible budgétée
  
  // Projection d'atterrissage au 31/12
  yearEndProjectedLandingHt: number;
  projectedLandingVarianceHt: number;
  
  // Sous-catégories
  subCategories: SectorSubCategoryDetail[];
  
  // Leviers de management et recommandations
  managerialInsights: {
    status: 'en_avance' | 'conforme' | 'sous_performance';
    statusLabel: string;
    keyObservation: string;
    recommendedActions: string[];
  };
}

export interface SectorGoalsGlobalSummary {
  year: string; // '2026'
  asOfDate: string; // '31 Août 2026'
  monthsElapsed: number; // 8 mois (Jan -> Août)
  
  // Totaux globaux
  totalAnnualBudgetGoalHt: number;
  totalYtdBudgetGoalHt: number;
  totalYtdRealisedHt: number;
  globalAchievementRatePct: number;
  globalVarianceAmountHt: number;
  globalVariancePct: number;
  
  totalYtdMarginHt: number;
  globalAverageMarginPct: number;
  
  projectedAnnualLandingHt: number;
  projectedAnnualLandingMarginHt: number;
  
  sectors: Record<PharmacySectorKey, SectorAnnualGoal>;
  monthlyData: SectorMonthlyBreakdown[];
}
