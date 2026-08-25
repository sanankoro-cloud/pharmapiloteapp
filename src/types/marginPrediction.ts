export interface MonthlyMarginTrend {
  month: string; // e.g. 'Jan', 'Fév', ... 'Déc'
  monthFullName: string; // e.g. 'Janvier 2026'
  isActual: boolean; // true if realized, false if forecast
  caHt: number;
  achatsHt: number;
  margeDirecteHt: number;
  margeDirectePct: number;
  rfaMensuelleHt: number;
  escomptesHt: number;
  margeTotaleHt: number;
  margeTotalePct: number;
  targetMargeHt: number;
  seasonalIndex: number; // 1.0 = standard, 1.15 = hiver/pathologies
}

export interface SupplierRfaPredictiveTier {
  supplierId: string;
  supplierName: string;
  supplierType: 'grossiste' | 'laboratoire_direct' | 'groupement';
  currentYtdPurchasesHt: number;
  projectedYearEndPurchasesHt: number;
  
  // Current tier
  currentTierThresholdHt: number;
  currentTierRatePct: number;
  currentTierRfaEuros: number;
  
  // Next bonus tier
  nextTierThresholdHt: number;
  nextTierRatePct: number;
  nextTierRfaEuros: number;
  missingPurchasesForNextTierHt: number;
  marginalGainNextTierEuros: number;
  roiBonusPct: number; // marginalGain / missingPurchases
  tierReachProbabilityPct: number; // 0 to 100
  tierStatus: 'securise' | 'tres_probable' | 'accessible_avec_arbitrage' | 'hors_de_portee';
  actionPlanSuggestion: string;
  isSimulatedForcedNextTier?: boolean;
}

export interface YearEndMarginPredictionSummary {
  year: number;
  currentDate: string; // e.g. '2026-08-25'
  
  // Target Goals
  targetAnnualCaHt: number;
  targetAnnualMarginHt: number;
  targetAnnualMarginPct: number;
  targetAnnualRfaHt: number;
  
  // Realized YTD (Jan - Aug)
  realizedYtdCaHt: number;
  realizedYtdMarginDirecteHt: number;
  realizedYtdRfaAccruedHt: number;
  realizedYtdTotalMarginHt: number;
  realizedYtdMarginPct: number;
  
  // Remaining Forecast (Sep - Dec)
  forecastRemainingCaHt: number;
  forecastRemainingMarginDirecteHt: number;
  forecastRemainingRfaHt: number;
  forecastRemainingTotalMarginHt: number;
  
  // Projected Year-End Landing (Atterrissage Global)
  projectedAnnualCaHt: number;
  projectedAnnualMarginDirecteHt: number;
  projectedAnnualRfaHt: number;
  projectedAnnualEscomptesHt: number;
  projectedAnnualTotalMarginHt: number;
  projectedAnnualMarginPct: number;
  
  // Delta vs Targets
  deltaMarginVsTargetEuros: number;
  deltaMarginVsTargetPts: number;
  
  // Probability & Confidence Index
  goalAchievementProbabilityPct: number; // e.g. 87%
  confidenceScore: 'faible' | 'moderee' | 'forte' | 'tres_forte';
  confidenceFactors: {
    runRateScorePct: number;
    rfaSecurityScorePct: number;
    mixMarginStabilityScorePct: number;
    inflationResilienceScorePct: number;
  };
  
  // Scenarios
  scenarios: {
    pessimistic: {
      totalMarginHt: number;
      marginPct: number;
      rfaTotalHt: number;
      probabilityPct: number;
      description: string;
    };
    realistic: {
      totalMarginHt: number;
      marginPct: number;
      rfaTotalHt: number;
      probabilityPct: number;
      description: string;
    };
    optimistic: {
      totalMarginHt: number;
      marginPct: number;
      rfaTotalHt: number;
      probabilityPct: number;
      description: string;
    };
  };
  
  // Supplier tiers analysis
  supplierTiers: SupplierRfaPredictiveTier[];
  
  // Monthly trajectory
  monthlyTrajectory: MonthlyMarginTrend[];
  
  // Strategic Recommendations
  recommendations: {
    id: string;
    priority: 'haute' | 'moyenne' | 'opportunite';
    title: string;
    description: string;
    expectedMarginGainEuros: number;
    actionType: 'arbitrage_fournisseur' | 'reclamation_avoir' | 'hausse_prix_otc' | 'substitution_generique';
  }[];
}
