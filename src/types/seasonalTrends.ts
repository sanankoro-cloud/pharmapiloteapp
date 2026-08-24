export type SeasonType = 'hiver' | 'printemps' | 'ete' | 'automne';
export type QuarterType = 'T1' | 'T2' | 'T3' | 'T4';

export interface MonthlyMultiYearData {
  month: string;
  fullMonth: string;
  monthIndex: number;
  season: SeasonType;
  seasonLabel: string;
  quarter: QuarterType;
  // Chiffre d'Affaires HT (€)
  ca2024: number;
  ca2025: number;
  ca2026: number; // Réel jusqu'à Juillet, projeté après
  isProjected2026?: boolean;
  // Marge Brute HT (€)
  marge2024: number;
  marge2025: number;
  marge2026: number;
  // Taux de Marge (%)
  tauxMarge2024: number;
  tauxMarge2025: number;
  tauxMarge2026: number;
  // Évolution CA N vs N-1 & N-1 vs N-2 (%)
  growthCa25vs24: number;
  growthCa26vs25: number;
  // Indice de Saisonnalité (Base 100 = Moyenne annuelle)
  seasonalityIndex: number;
  seasonalityStatus: 'pic_majeur' | 'au_dessus_moyenne' | 'conforme' | 'creux_saisonnier';
  // Contexte clinique & saisonnier
  topPathologies: string[];
  keySeasonDrivers: string;
  actionConseilOfficine: string;
  // Statistiques clients
  prescriptionsCount2026: number;
  averageBasketTtc2026: number;
}

export interface YearSummary {
  year: number;
  label: string;
  totalCaHt: number;
  totalMargeHt: number;
  averageMarginRate: number;
  averageMonthlyCa: number;
  growthRateVsPrev: number | null;
  marginGrowthVsPrev: number | null;
  peakMonth: string;
  lowMonth: string;
}

export interface QuarterlySeasonalSummary {
  quarter: QuarterType;
  title: string;
  months: string;
  season: SeasonType;
  ca2024: number;
  ca2025: number;
  ca2026: number;
  marge2024: number;
  marge2025: number;
  marge2026: number;
  shareOfAnnualCa: number;
  marginRate: number;
  keyDrivers: string;
  recommendation: string;
}
