import { SupplierRfaContract } from '../types/purchasingAndDiscounts';
import { 
  MonthlyMarginTrend, 
  SupplierRfaPredictiveTier, 
  YearEndMarginPredictionSummary 
} from '../types/marginPrediction';

// Base monthly realization & seasonal indices for retail pharmacy
// Q4 in pharmacy has high seasonality due to flu campaigns, winter pathologies & pediatric syrups
export const DEFAULT_MONTHLY_DATA: MonthlyMarginTrend[] = [
  {
    month: 'Jan',
    monthFullName: 'Janvier 2026',
    isActual: true,
    caHt: 151000,
    achatsHt: 99660,
    margeDirecteHt: 51340,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2450,
    escomptesHt: 750,
    margeTotaleHt: 54540,
    margeTotalePct: 36.12,
    targetMargeHt: 52000,
    seasonalIndex: 1.05
  },
  {
    month: 'Fév',
    monthFullName: 'Février 2026',
    isActual: true,
    caHt: 146500,
    achatsHt: 96690,
    margeDirecteHt: 49810,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2380,
    escomptesHt: 720,
    margeTotaleHt: 52910,
    margeTotalePct: 36.12,
    targetMargeHt: 51000,
    seasonalIndex: 1.02
  },
  {
    month: 'Mar',
    monthFullName: 'Mars 2026',
    isActual: true,
    caHt: 154000,
    achatsHt: 101640,
    margeDirecteHt: 52360,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2510,
    escomptesHt: 780,
    margeTotaleHt: 55650,
    margeTotalePct: 36.14,
    targetMargeHt: 53000,
    seasonalIndex: 1.04
  },
  {
    month: 'Avr',
    monthFullName: 'Avril 2026',
    isActual: true,
    caHt: 148200,
    achatsHt: 97812,
    margeDirecteHt: 50388,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2420,
    escomptesHt: 740,
    margeTotaleHt: 53548,
    margeTotalePct: 36.13,
    targetMargeHt: 51500,
    seasonalIndex: 0.98
  },
  {
    month: 'Mai',
    monthFullName: 'Mai 2026',
    isActual: true,
    caHt: 153800,
    achatsHt: 101508,
    margeDirecteHt: 52292,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2510,
    escomptesHt: 770,
    margeTotaleHt: 55572,
    margeTotalePct: 36.13,
    targetMargeHt: 53000,
    seasonalIndex: 1.01
  },
  {
    month: 'Juin',
    monthFullName: 'Juin 2026',
    isActual: true,
    caHt: 157200,
    achatsHt: 103752,
    margeDirecteHt: 53448,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2570,
    escomptesHt: 790,
    margeTotaleHt: 56808,
    margeTotalePct: 36.14,
    targetMargeHt: 54000,
    seasonalIndex: 1.03
  },
  {
    month: 'Juil',
    monthFullName: 'Juillet 2026 (Réel Clôturé)',
    isActual: true,
    caHt: 156485,
    achatsHt: 102285,
    margeDirecteHt: 54200,
    margeDirectePct: 34.64,
    rfaMensuelleHt: 2600,
    escomptesHt: 800,
    margeTotaleHt: 57600,
    margeTotalePct: 36.81,
    targetMargeHt: 54000,
    seasonalIndex: 1.02
  },
  {
    month: 'Août',
    monthFullName: 'Août 2026 (En cours / MTD)',
    isActual: true,
    caHt: 148520,
    achatsHt: 98024,
    margeDirecteHt: 50496,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2430,
    escomptesHt: 740,
    margeTotaleHt: 53666,
    margeTotalePct: 36.13,
    targetMargeHt: 51000,
    seasonalIndex: 0.96
  },
  {
    month: 'Sep',
    monthFullName: 'Septembre 2026 (Projeté)',
    isActual: false,
    caHt: 155000,
    achatsHt: 102300,
    margeDirecteHt: 52700,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2550,
    escomptesHt: 775,
    margeTotaleHt: 56025,
    margeTotalePct: 36.15,
    targetMargeHt: 53500,
    seasonalIndex: 1.04
  },
  {
    month: 'Oct',
    monthFullName: 'Octobre 2026 (Projeté - Campagne Vaccins)',
    isActual: false,
    caHt: 163000,
    achatsHt: 107580,
    margeDirecteHt: 55420,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2710,
    escomptesHt: 815,
    margeTotaleHt: 58945,
    margeTotalePct: 36.16,
    targetMargeHt: 56000,
    seasonalIndex: 1.10
  },
  {
    month: 'Nov',
    monthFullName: 'Novembre 2026 (Projeté - Pathologies Hivernales)',
    isActual: false,
    caHt: 168000,
    achatsHt: 110880,
    margeDirecteHt: 57120,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 2820,
    escomptesHt: 840,
    margeTotaleHt: 60780,
    margeTotalePct: 36.18,
    targetMargeHt: 58000,
    seasonalIndex: 1.14
  },
  {
    month: 'Déc',
    monthFullName: 'Décembre 2026 (Projeté - Pic Hiver & Fêtes)',
    isActual: false,
    caHt: 176000,
    achatsHt: 116160,
    margeDirecteHt: 59840,
    margeDirectePct: 34.00,
    rfaMensuelleHt: 3100,
    escomptesHt: 880,
    margeTotaleHt: 63820,
    margeTotalePct: 36.26,
    targetMargeHt: 61000,
    seasonalIndex: 1.20
  }
];

export interface SimulationParams {
  growthRateQ4Pct: number; // e.g. 0% for baseline, +3% for good season, -3% for slowdown
  priceHikesPassThroughPct: number; // 0 to 100% (pass-through of laboratory price hikes on OTC)
  forceOptimalRfaTiers: boolean; // Arbitrage purchases to reach upper tier
  recoverAllDiscrepancies: boolean; // Reclaim 100% of detected discount discrepancies
}

export function computeYearEndMarginPrediction(
  contracts: SupplierRfaContract[],
  params: SimulationParams = {
    growthRateQ4Pct: 0,
    priceHikesPassThroughPct: 50,
    forceOptimalRfaTiers: false,
    recoverAllDiscrepancies: true
  },
  annualMarginTargetEuros: number = 680000
): YearEndMarginPredictionSummary {
  const currentDate = '2026-08-25';
  const targetAnnualCaHt = 1880000;
  const targetAnnualMarginHt = annualMarginTargetEuros;
  const targetAnnualMarginPct = (targetAnnualMarginHt / targetAnnualCaHt) * 100;
  const targetAnnualRfaHt = 32000;

  // Process monthly trajectories with simulation modifiers
  const monthlyTrajectory = DEFAULT_MONTHLY_DATA.map(m => {
    if (m.isActual) {
      return { ...m };
    }

    // Apply Q4 growth rate and pass-through adjustments to future months
    const growthFactor = 1 + (params.growthRateQ4Pct / 100);
    const adjustedCa = m.caHt * growthFactor;
    
    // Pass-through bonus on margin rate (+0.2% to +0.8% margin boost if prices adjusted)
    const passThroughRateBonus = (params.priceHikesPassThroughPct / 100) * 0.65;
    const adjustedMarginRate = m.margeDirectePct + passThroughRateBonus;
    const adjustedMarginDirecte = adjustedCa * (adjustedMarginRate / 100);
    const adjustedAchats = adjustedCa - adjustedMarginDirecte;
    const adjustedRfa = (m.rfaMensuelleHt * growthFactor) * (params.forceOptimalRfaTiers ? 1.08 : 1.0);
    const adjustedEscomptes = m.escomptesHt * growthFactor;
    const adjustedTotalMargin = adjustedMarginDirecte + adjustedRfa + adjustedEscomptes;

    return {
      ...m,
      caHt: Math.round(adjustedCa),
      achatsHt: Math.round(adjustedAchats),
      margeDirecteHt: Math.round(adjustedMarginDirecte),
      margeDirectePct: Number(adjustedMarginRate.toFixed(2)),
      rfaMensuelleHt: Math.round(adjustedRfa),
      escomptesHt: Math.round(adjustedEscomptes),
      margeTotaleHt: Math.round(adjustedTotalMargin),
      margeTotalePct: Number(((adjustedTotalMargin / adjustedCa) * 100).toFixed(2))
    };
  });

  // Calculate Realized YTD (Jan - Aug)
  const actualMonths = monthlyTrajectory.filter(m => m.isActual);
  const realizedYtdCaHt = actualMonths.reduce((sum, m) => sum + m.caHt, 0);
  const realizedYtdMarginDirecteHt = actualMonths.reduce((sum, m) => sum + m.margeDirecteHt, 0);
  const realizedYtdRfaAccruedHt = actualMonths.reduce((sum, m) => sum + m.rfaMensuelleHt, 0);
  const realizedYtdTotalMarginHt = actualMonths.reduce((sum, m) => sum + m.margeTotaleHt, 0);
  const realizedYtdMarginPct = (realizedYtdTotalMarginHt / realizedYtdCaHt) * 100;

  // Calculate Remaining Forecast (Sep - Dec)
  const futureMonths = monthlyTrajectory.filter(m => !m.isActual);
  const forecastRemainingCaHt = futureMonths.reduce((sum, m) => sum + m.caHt, 0);
  const forecastRemainingMarginDirecteHt = futureMonths.reduce((sum, m) => sum + m.margeDirecteHt, 0);
  const forecastRemainingRfaHt = futureMonths.reduce((sum, m) => sum + m.rfaMensuelleHt, 0);
  const forecastRemainingTotalMarginHt = futureMonths.reduce((sum, m) => sum + m.margeTotaleHt, 0);

  // Supplier RFA Tiers analysis & predictive landing
  const supplierTiers: SupplierRfaPredictiveTier[] = contracts.map(c => {
    let currentTierThreshold = c.rfaAnnualTargetTurnoverHt;
    let currentTierRate = c.rfaRatePct;
    let nextTierThreshold = currentTierThreshold * 1.30;
    let nextTierRate = currentTierRate + 1.20;

    if (c.id === 'rfa-ocp-2026' || c.supplierName.includes('OCP')) {
      currentTierThreshold = 450000;
      currentTierRate = 3.20;
      nextTierThreshold = 600000;
      nextTierRate = 4.00;
    } else if (c.supplierName.includes('Biogaran')) {
      currentTierThreshold = 120000;
      currentTierRate = 6.00;
      nextTierThreshold = 150000;
      nextTierRate = 7.50; // Palier grand compte + bonus fidélité
    } else if (c.supplierName.includes('Pierre Fabre')) {
      currentTierThreshold = 35000;
      currentTierRate = 5.00;
      nextTierThreshold = 50000;
      nextTierRate = 7.00;
    } else if (c.supplierName.includes('Urgo')) {
      currentTierThreshold = 18000;
      currentTierRate = 4.00;
      nextTierThreshold = 25000;
      nextTierRate = 5.50;
    }

    const projectedPurchases = params.forceOptimalRfaTiers 
      ? Math.max(c.projectedAnnualPurchasesHt, nextTierThreshold * 1.02)
      : c.projectedAnnualPurchasesHt * (1 + (params.growthRateQ4Pct / 100));

    const isNextTierReached = projectedPurchases >= nextTierThreshold;
    const isCurrentTierReached = projectedPurchases >= currentTierThreshold;

    const effectiveRate = isNextTierReached 
      ? nextTierRate 
      : isCurrentTierReached 
      ? currentTierRate 
      : Math.max(1.5, currentTierRate - 1.5);

    const projectedRfa = (projectedPurchases * effectiveRate) / 100;
    const currentTierRfa = (projectedPurchases * currentTierRate) / 100;
    const nextTierRfa = (projectedPurchases * nextTierRate) / 100;
    const missingPurchases = Math.max(0, nextTierThreshold - projectedPurchases);
    const marginalGain = Math.max(0, nextTierRfa - currentTierRfa);
    const roiBonus = missingPurchases > 0 ? (marginalGain / missingPurchases) * 100 : 100;

    let tierStatus: 'securise' | 'tres_probable' | 'accessible_avec_arbitrage' | 'hors_de_portee' = 'securise';
    let probability = 95;

    if (isNextTierReached) {
      tierStatus = 'securise';
      probability = 96;
    } else if (missingPurchases < projectedPurchases * 0.10) {
      tierStatus = 'accessible_avec_arbitrage';
      probability = 78;
    } else if (missingPurchases < projectedPurchases * 0.25) {
      tierStatus = 'tres_probable';
      probability = 60;
    } else {
      tierStatus = 'hors_de_portee';
      probability = 30;
    }

    let actionSuggestion = `Palier standard de ${currentTierRate}% sécurisé.`;
    if (missingPurchases > 0 && missingPurchases < 15000) {
      actionSuggestion = `Opportunité majeure : commander +${Math.round(missingPurchases)} € HT chez ${c.supplierName} d'ici fin novembre pour débloquer ${nextTierRate}% sur TOUT le volume annuel (+${Math.round(marginalGain)} € net de marge !).`;
    }

    return {
      supplierId: c.id,
      supplierName: c.supplierName,
      supplierType: c.supplierType,
      currentYtdPurchasesHt: c.actualYtdPurchasesHt,
      projectedYearEndPurchasesHt: Math.round(projectedPurchases),
      currentTierThresholdHt: currentTierThreshold,
      currentTierRatePct: currentTierRate,
      currentTierRfaEuros: Math.round(currentTierRfa),
      nextTierThresholdHt: nextTierThreshold,
      nextTierRatePct: nextTierRate,
      nextTierRfaEuros: Math.round(nextTierRfa),
      missingPurchasesForNextTierHt: Math.round(missingPurchases),
      marginalGainNextTierEuros: Math.round(marginalGain),
      roiBonusPct: Number(roiBonus.toFixed(1)),
      tierReachProbabilityPct: probability,
      tierStatus,
      actionPlanSuggestion: actionSuggestion,
      isSimulatedForcedNextTier: params.forceOptimalRfaTiers
    };
  });

  // Calculate Projected Annual Totals
  const projectedAnnualCaHt = realizedYtdCaHt + forecastRemainingCaHt;
  const projectedAnnualMarginDirecteHt = realizedYtdMarginDirecteHt + forecastRemainingMarginDirecteHt;
  
  // Total projected RFA from suppliers
  const totalRfaFromContracts = supplierTiers.reduce((sum, s) => {
    const isNext = s.projectedYearEndPurchasesHt >= s.nextTierThresholdHt;
    return sum + (isNext ? s.nextTierRfaEuros : s.currentTierRfaEuros);
  }, 0);

  // Bonus for recovering discrepancies if toggled
  const recoveredDiscrepanciesBonus = params.recoverAllDiscrepancies
    ? contracts.reduce((sum, c) => sum + c.totalDiscrepancyLossEuros, 0)
    : 0;

  const projectedAnnualRfaHt = Math.round(totalRfaFromContracts + recoveredDiscrepanciesBonus);
  const projectedAnnualEscomptesHt = Math.round(projectedAnnualCaHt * 0.005); // ~0.5% d'escompte moyen
  const projectedAnnualTotalMarginHt = projectedAnnualMarginDirecteHt + projectedAnnualRfaHt + projectedAnnualEscomptesHt;
  const projectedAnnualMarginPct = (projectedAnnualTotalMarginHt / projectedAnnualCaHt) * 100;

  // Delta vs Target
  const deltaMarginVsTargetEuros = projectedAnnualTotalMarginHt - targetAnnualMarginHt;
  const deltaMarginVsTargetPts = projectedAnnualMarginPct - targetAnnualMarginPct;

  // Probability Engine Calculation
  // Factors:
  // 1. Run-rate YTD progress: Realized margin vs expected at M8 (8/12 = 66.7%)
  const expectedYtdTarget = targetAnnualMarginHt * (8 / 12);
  const runRateRatio = realizedYtdTotalMarginHt / expectedYtdTarget;
  const runRateScorePct = Math.min(100, Math.max(20, runRateRatio * 90));

  // 2. RFA Security Score: % of RFA contracts already on track
  const rfaOnTrackCount = supplierTiers.filter(s => s.tierReachProbabilityPct >= 70).length;
  const rfaSecurityScorePct = (rfaOnTrackCount / (supplierTiers.length || 1)) * 100;

  // 3. Margin rate stability
  const mixMarginStabilityScorePct = realizedYtdMarginPct >= targetAnnualMarginPct ? 95 : 75;

  // 4. Inflation resilience (pass-through setup)
  const inflationResilienceScorePct = 60 + (params.priceHikesPassThroughPct * 0.35);

  // Weighted overall achievement probability
  const rawProbability = (
    runRateScorePct * 0.35 +
    rfaSecurityScorePct * 0.30 +
    mixMarginStabilityScorePct * 0.20 +
    inflationResilienceScorePct * 0.15
  );

  // Apply delta penalty or bonus
  const deltaFactor = deltaMarginVsTargetEuros >= 0 
    ? Math.min(10, (deltaMarginVsTargetEuros / targetAnnualMarginHt) * 100)
    : Math.max(-25, (deltaMarginVsTargetEuros / targetAnnualMarginHt) * 100);

  const goalAchievementProbabilityPct = Math.min(99, Math.max(15, Math.round(rawProbability + deltaFactor)));

  let confidenceScore: 'faible' | 'moderee' | 'forte' | 'tres_forte' = 'forte';
  if (goalAchievementProbabilityPct >= 85) confidenceScore = 'tres_forte';
  else if (goalAchievementProbabilityPct >= 70) confidenceScore = 'forte';
  else if (goalAchievementProbabilityPct >= 50) confidenceScore = 'moderee';
  else confidenceScore = 'faible';

  // 3 Scenarios definition
  const scenarios = {
    pessimistic: {
      totalMarginHt: Math.round(projectedAnnualTotalMarginHt * 0.945),
      marginPct: Number((projectedAnnualMarginPct - 1.2).toFixed(2)),
      rfaTotalHt: Math.round(projectedAnnualRfaHt * 0.82),
      probabilityPct: 98,
      description: 'Ralentissement hivernal (-3%), perte du palier supérieur grossiste et hausses d\'achats non répercutées.'
    },
    realistic: {
      totalMarginHt: projectedAnnualTotalMarginHt,
      marginPct: Number(projectedAnnualMarginPct.toFixed(2)),
      rfaTotalHt: projectedAnnualRfaHt,
      probabilityPct: goalAchievementProbabilityPct,
      description: 'Maintien des tendances actuelles, saisonnalité Q4 standard (+5%) et sécurisation des paliers RFA engagés.'
    },
    optimistic: {
      totalMarginHt: Math.round(projectedAnnualTotalMarginHt * 1.045),
      marginPct: Number((projectedAnnualMarginPct + 1.1).toFixed(2)),
      rfaTotalHt: Math.round(projectedAnnualRfaHt * 1.22),
      probabilityPct: Math.max(30, Math.round(goalAchievementProbabilityPct * 0.65)),
      description: 'Forte dynamique hivernale (+8%), arbitrage vers les paliers RFA max (Biogaran 7.5%, OCP 4%) et répercussion tarifaire à 100%.'
    }
  };

  // Recommendations
  const recommendations = [
    {
      id: 'rec-rfa-ocp',
      priority: 'haute' as const,
      title: 'Sécuriser le palier OCP 4.0% via arbitrage de commandes grossiste',
      description: 'Il ne manque que ~14 000 € d\'achats pour passer de 3.2% à 4.0% de RFA sur tout le volume annuel, représentant un gain net de +3 880 € HT.',
      expectedMarginGainEuros: 3880,
      actionType: 'arbitrage_fournisseur' as const
    },
    {
      id: 'rec-rfa-biogaran',
      priority: 'haute' as const,
      title: 'Maximiser le taux de substitution générique Biogaran (palier 7.5%)',
      description: 'Concentrer les commandes génériques sur le laboratoire principal pour déclencher la sur-coopérative de groupement (+1.5% bonus fidélité).',
      expectedMarginGainEuros: 2040,
      actionType: 'substitution_generique' as const
    },
    {
      id: 'rec-discrepancies',
      priority: 'moyenne' as const,
      title: 'Réclamer les 515,50 € d\'avoirs pour sous-remises factures détectées',
      description: 'Émettre les courriers d\'anomalies de remises directes sur les factures OCP, Pierre Fabre et Urgo pour injection directe en marge brute.',
      expectedMarginGainEuros: 515.50,
      actionType: 'reclamation_avoir' as const
    },
    {
      id: 'rec-otc-passthrough',
      priority: 'opportunite' as const,
      title: 'Répercuter les récentes hausses tarifaires sur la parapharmacie et l\'OTC',
      description: 'Un ajustement de 3 à 5% sur les 20 références à forte rotation préserve +1 850 € de marge brute annuelle sans impact sur le volume.',
      expectedMarginGainEuros: 1850,
      actionType: 'hausse_prix_otc' as const
    }
  ];

  return {
    year: 2026,
    currentDate,
    targetAnnualCaHt,
    targetAnnualMarginHt,
    targetAnnualMarginPct: Number(targetAnnualMarginPct.toFixed(2)),
    targetAnnualRfaHt,
    realizedYtdCaHt,
    realizedYtdMarginDirecteHt,
    realizedYtdRfaAccruedHt,
    realizedYtdTotalMarginHt,
    realizedYtdMarginPct: Number(realizedYtdMarginPct.toFixed(2)),
    forecastRemainingCaHt,
    forecastRemainingMarginDirecteHt,
    forecastRemainingRfaHt,
    forecastRemainingTotalMarginHt,
    projectedAnnualCaHt,
    projectedAnnualMarginDirecteHt,
    projectedAnnualRfaHt,
    projectedAnnualEscomptesHt,
    projectedAnnualTotalMarginHt,
    projectedAnnualMarginPct: Number(projectedAnnualMarginPct.toFixed(2)),
    deltaMarginVsTargetEuros,
    deltaMarginVsTargetPts: Number(deltaMarginVsTargetPts.toFixed(2)),
    goalAchievementProbabilityPct,
    confidenceScore,
    confidenceFactors: {
      runRateScorePct: Math.round(runRateScorePct),
      rfaSecurityScorePct: Math.round(rfaSecurityScorePct),
      mixMarginStabilityScorePct: Math.round(mixMarginStabilityScorePct),
      inflationResilienceScorePct: Math.round(inflationResilienceScorePct)
    },
    scenarios,
    supplierTiers,
    monthlyTrajectory,
    recommendations
  };
}
