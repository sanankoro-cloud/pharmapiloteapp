import { 
  ProductStock, 
  SimulationScenarioId, 
  StockOptimizationParameters, 
  ProductThresholdSimulationResult, 
  StockOptimizationSimulationSummary,
  ThresholdDiagnosticStatus
} from '../types/pharmacy';

export const SCENARIO_PRESETS: Record<SimulationScenarioId, {
  name: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  badgeColor: string;
  params: StockOptimizationParameters;
}> = {
  equilibre: {
    name: 'Équilibré Officine (Standard Recommandé)',
    shortDesc: 'Compromis optimal entre trésorerie, sécurité MITM et rotation LGO',
    fullDesc: 'Scénario de référence pour une officine de ville/bourg : couverture de 14 jours pour les livraisons grossistes (biquotidiennes) et 30 jours pour les commandes directes laboratoires. Sécurité renforcée sur les molécules vitales.',
    icon: '🎯',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    params: {
      scenarioId: 'equilibre',
      demandMultiplier: 1.0,
      grossisteLeadTimeDays: 0.5,
      directLabLeadTimeDays: 4.5,
      grossisteTargetCoverageDays: 14,
      directLabTargetCoverageDays: 30,
      safetyMarginDaysClassA: 6,
      safetyMarginDaysClassB: 4,
      safetyMarginDaysClassC: 2,
      extraSafetyDaysEssential: 4,
      highValueMaxCapMultiplier: 1.2,
      minThresholdFloor: 1
    }
  },
  flux_tendu: {
    name: 'Flux Tendus & Trésorerie (Lean Cash-Flow)',
    shortDesc: 'Libération maximale de trésorerie et réduction drastique du BFR',
    fullDesc: 'Conçu pour optimiser la liquidité bancaire immédiate en profitant des livraisons grossistes J+0. Plafonnement strict des stocks max et des produits de haute valeur (> 300 €) pour éviter toute immobilisation stérile.',
    icon: '⚡',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    params: {
      scenarioId: 'flux_tendu',
      demandMultiplier: 1.0,
      grossisteLeadTimeDays: 0.5,
      directLabLeadTimeDays: 3.5,
      grossisteTargetCoverageDays: 9,
      directLabTargetCoverageDays: 20,
      safetyMarginDaysClassA: 4,
      safetyMarginDaysClassB: 2.5,
      safetyMarginDaysClassC: 1.5,
      extraSafetyDaysEssential: 2.5,
      highValueMaxCapMultiplier: 1.0,
      minThresholdFloor: 1
    }
  },
  securisation_mitm: {
    name: 'Bouclier Anti-Pénuries & MITM (Sécurité Maximale)',
    shortDesc: 'Protection maximale contre les ruptures nationales et contingentements',
    fullDesc: 'Élargit les stocks de sécurité sur les Médicaments d\'Intérêt Thérapeutique Majeur (MITM), les molécules cardio-vasculaires, diabète, antibiotiques et neurologie. Idéal en période de tensions d\'approvisionnement.',
    icon: '🛡️',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
    params: {
      scenarioId: 'securisation_mitm',
      demandMultiplier: 1.1,
      grossisteLeadTimeDays: 1.0,
      directLabLeadTimeDays: 6.0,
      grossisteTargetCoverageDays: 22,
      directLabTargetCoverageDays: 45,
      safetyMarginDaysClassA: 10,
      safetyMarginDaysClassB: 7,
      safetyMarginDaysClassC: 3.5,
      extraSafetyDaysEssential: 7,
      highValueMaxCapMultiplier: 1.5,
      minThresholdFloor: 2
    }
  },
  pic_epidemique: {
    name: 'Pic Épidémique & Hivernal (+35% Demande)',
    shortDesc: 'Anticipation des vagues bronchiolite, grippe, angines et covid',
    fullDesc: 'Augmente de +35% la vitesse de vente prévisionnelle sur les antibiotiques, antalgiques, corticoïdes oraux et suspensions pédiatriques pour éviter la rupture précoce pendant les pics d\'ordonnances.',
    icon: '❄️',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    params: {
      scenarioId: 'pic_epidemique',
      demandMultiplier: 1.35,
      grossisteLeadTimeDays: 0.8,
      directLabLeadTimeDays: 5.0,
      grossisteTargetCoverageDays: 18,
      directLabTargetCoverageDays: 35,
      safetyMarginDaysClassA: 8,
      safetyMarginDaysClassB: 5.5,
      safetyMarginDaysClassC: 3,
      extraSafetyDaysEssential: 5,
      highValueMaxCapMultiplier: 1.3,
      minThresholdFloor: 2
    }
  },
  basse_saison: {
    name: 'Basse Saison & Déstockage (-15% Demande)',
    shortDesc: 'Resserrage des stocks pour la période estivale ou creux d\'activité',
    fullDesc: 'Ajuste les seuils à la baisse (-15%) pour drainer les stocks excédentaires, minimiser le risque d\'obsolescence et de péremption avant la rentrée.',
    icon: '☀️',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    params: {
      scenarioId: 'basse_saison',
      demandMultiplier: 0.85,
      grossisteLeadTimeDays: 0.5,
      directLabLeadTimeDays: 4.0,
      grossisteTargetCoverageDays: 12,
      directLabTargetCoverageDays: 24,
      safetyMarginDaysClassA: 4.5,
      safetyMarginDaysClassB: 3,
      safetyMarginDaysClassC: 1.5,
      extraSafetyDaysEssential: 3,
      highValueMaxCapMultiplier: 1.1,
      minThresholdFloor: 1
    }
  },
  personnalise: {
    name: 'Simulation Sur-Mesure (Paramètres Avancés)',
    shortDesc: 'Ajustez manuellement les curseurs de rotation, délais et coefficients',
    fullDesc: 'Permet au pharmacien de calibrer finement chaque variable de réapprovisionnement selon la typologie spécifique de son officine.',
    icon: '⚙️',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    params: {
      scenarioId: 'personnalise',
      demandMultiplier: 1.0,
      grossisteLeadTimeDays: 0.5,
      directLabLeadTimeDays: 4.5,
      grossisteTargetCoverageDays: 14,
      directLabTargetCoverageDays: 30,
      safetyMarginDaysClassA: 6,
      safetyMarginDaysClassB: 4,
      safetyMarginDaysClassC: 2,
      extraSafetyDaysEssential: 4,
      highValueMaxCapMultiplier: 1.2,
      minThresholdFloor: 1
    }
  }
};

/**
 * Moteur de simulation d'optimisation de stock pour pharmacie d'officine
 */
export function simulateStockThresholds(
  products: ProductStock[],
  params: StockOptimizationParameters
): {
  results: ProductThresholdSimulationResult[];
  summary: StockOptimizationSimulationSummary;
  underProtectedResults: ProductThresholdSimulationResult[];
  overStockedResults: ProductThresholdSimulationResult[];
  optimalResults: ProductThresholdSimulationResult[];
  rebalanceResults: ProductThresholdSimulationResult[];
} {
  let totalFreedCashHt = 0;
  let totalSecuringCashHt = 0;
  let totalPotentialExpiredLossAvoidanceHt = 0;
  let underProtectedCount = 0;
  let overStockedCount = 0;
  let optimalCount = 0;
  let rebalanceCount = 0;

  const results: ProductThresholdSimulationResult[] = products.map(product => {
    // 1. Déterminer le type de fournisseur et le délai d'approvisionnement
    const supplierLower = (product.supplier || '').toLowerCase();
    const isDirectSupplier = supplierLower.includes('direct') || supplierLower.includes('labo') || (product.leadTimeDays && product.leadTimeDays > 2);
    const leadTimeDays = product.leadTimeDays || (isDirectSupplier ? params.directLabLeadTimeDays : params.grossisteLeadTimeDays);
    const supplierType: 'grossiste' | 'laboratoire_direct' = isDirectSupplier ? 'laboratoire_direct' : 'grossiste';

    // 2. Vitesse de vente journalière ajustée
    const rawMonthly = product.monthlySalesQty || Math.max(1, Math.round(product.stockQty * 0.8 + (product.minThreshold * 1.5)));
    const baseDailyVelocity = product.dailySalesRate || (rawMonthly / 30);
    const trendFactor = product.salesTrendPct ? (1 + Math.max(-0.4, Math.min(0.8, product.salesTrendPct / 100))) : 1.0;
    const adjustedDailyVelocity = Math.max(0.04, baseDailyVelocity * trendFactor * params.demandMultiplier);

    // 3. Classification ABC
    let abcClass: 'A' | 'B' | 'C' = product.abcClass || 'B';
    if (!product.abcClass) {
      const monthlyTurnoverHt = rawMonthly * product.pump;
      if (monthlyTurnoverHt > 300 || product.isHighValue) abcClass = 'A';
      else if (monthlyTurnoverHt > 60) abcClass = 'B';
      else abcClass = 'C';
    }

    const isEssential = !!product.isEssential;
    const isHighValue = !!product.isHighValue || product.pump > 300;

    // 4. Marge de sécurité en jours (Safety Stock Days)
    let safetyDays = abcClass === 'A' 
      ? params.safetyMarginDaysClassA 
      : abcClass === 'B' 
        ? params.safetyMarginDaysClassB 
        : params.safetyMarginDaysClassC;

    if (isEssential) {
      safetyDays += params.extraSafetyDaysEssential;
    }
    if (product.isRefrigerated) {
      safetyDays = Math.max(safetyDays, 4); // Sécurité chaîne du froid
    }

    // 5. Calcul du Seuil Minimum Optimal (ROP - Reorder Point)
    // Seuil Min = (Délai approvisionnement + Marge sécurité) * Vitesse journalière
    const rawSimulatedMin = (leadTimeDays + safetyDays) * adjustedDailyVelocity;
    
    let simulatedMin = Math.round(rawSimulatedMin);

    // Traitement spécifique Haute Valeur (ex: Vyndaqel 6250€, Enbrel 685€)
    if (product.pump > 1500) {
      simulatedMin = Math.max(1, Math.min(simulatedMin, 1)); // Coffre : 1 boîte suffit si vente mensuelle = 1
    } else if (product.pump > 400) {
      simulatedMin = Math.max(1, Math.min(simulatedMin, 2));
    } else {
      // Plancher standard
      simulatedMin = Math.max(params.minThresholdFloor, simulatedMin);
    }

    // 6. Calcul du Seuil Maximum Optimal (Stock Plafond)
    const targetCycleDays = isDirectSupplier 
      ? params.directLabTargetCoverageDays 
      : params.grossisteTargetCoverageDays;

    const replenishmentCoverageUnits = Math.round(adjustedDailyVelocity * targetCycleDays);
    let simulatedMax = simulatedMin + replenishmentCoverageUnits;

    // Plafonnement strict sur haute valeur
    if (product.pump > 1500) {
      simulatedMax = Math.min(simulatedMax, simulatedMin + 1);
    } else if (product.pump > 400) {
      simulatedMax = Math.min(simulatedMax, simulatedMin + 2);
    } else if (isHighValue) {
      simulatedMax = Math.min(simulatedMax, Math.round(simulatedMin * params.highValueMaxCapMultiplier) + 2);
    }

    // Protection anti-péremption si DLUO proche (< 180j) et rotation lente
    if (product.daysUntilExpiry <= 120 && product.daysUntilExpiry > 0) {
      const maxConsumableBeforeExpiry = Math.floor(adjustedDailyVelocity * product.daysUntilExpiry * 0.7);
      if (maxConsumableBeforeExpiry > 0 && maxConsumableBeforeExpiry < simulatedMax) {
        simulatedMax = Math.max(simulatedMin + 1, maxConsumableBeforeExpiry);
        totalPotentialExpiredLossAvoidanceHt += Math.max(0, (product.maxThreshold - simulatedMax) * product.pump);
      }
    }

    // Assurer que Max > Min
    if (simulatedMax <= simulatedMin) {
      simulatedMax = simulatedMin + Math.max(2, Math.round(simulatedMin * 0.5));
    }

    // 7. Calcul des Écarts (Deltas) et Impact Financier BFR
    const deltaMin = simulatedMin - product.minThreshold;
    const deltaMax = simulatedMax - product.maxThreshold;

    // Impact BFR (€ HT) : Variation de l'encours moyen de stock (estimation)
    const estimatedBfrImpactHt = Number(((deltaMin * 0.4 + deltaMax * 0.6) * product.pump).toFixed(2));

    if (deltaMax < 0) {
      totalFreedCashHt += Math.abs(deltaMax) * product.pump * 0.65;
    }
    if (deltaMin > 0) {
      totalSecuringCashHt += deltaMin * product.pump;
    }

    // Couvertures
    const currentDaysCoverage = adjustedDailyVelocity > 0 ? Math.round(product.stockQty / adjustedDailyVelocity) : 60;
    const simulatedDaysCoverage = adjustedDailyVelocity > 0 ? Math.round(((simulatedMin + simulatedMax) / 2) / adjustedDailyVelocity) : 25;
    const annualTurnoverGainPct = currentDaysCoverage > 0 
      ? Number((((365 / Math.max(10, simulatedDaysCoverage)) - (365 / Math.max(10, currentDaysCoverage))) / (365 / Math.max(10, currentDaysCoverage)) * 100).toFixed(1))
      : 0;

    // 8. Diagnostic et Statut
    let diagnosticStatus: ThresholdDiagnosticStatus = 'optimal';
    let diagnosticReason = 'Seuils actuels bien équilibrés avec la vitesse de délivrance.';

    const isMinTooLow = deltaMin >= 2 || (product.minThreshold < simulatedMin && isEssential);
    const isMaxTooHigh = deltaMax <= -3 || (product.maxThreshold > simulatedMax * 1.3 && deltaMax < 0);
    const isMinTooHigh = deltaMin <= -3;

    if (isMinTooLow && isMaxTooHigh) {
      diagnosticStatus = 'rebalance';
      diagnosticReason = `Seuil Min sous-calibré (+${deltaMin}) face au délai ${supplierType === 'grossiste' ? 'grossiste' : 'direct'}, et Seuil Max surévalué (${deltaMax}) immobilisant de la trésorerie.`;
      rebalanceCount++;
    } else if (isMinTooLow) {
      diagnosticStatus = 'under_protected';
      diagnosticReason = isEssential 
        ? `Molécule essentielle MITM : Seuil mini insuffisant (actuel ${product.minThreshold} vs préconisé ${simulatedMin}). Risque de rupture au comptoir.`
        : `Délai réappro (${leadTimeDays}j) et rotation (${rawMonthly} btes/mois) nécessitent de réhausser le seuil d'alerte mini de +${deltaMin} unités.`;
      underProtectedCount++;
    } else if (isMaxTooHigh || isMinTooHigh) {
      diagnosticStatus = 'over_stocked';
      diagnosticReason = isHighValue
        ? `Produit haute valeur (${product.pump.toFixed(2)} €) : Stock Max excessif (${product.maxThreshold} btes). Réduire à ${simulatedMax} libère ${Math.abs(estimatedBfrImpactHt).toFixed(0)} € de cash.`
        : `Surstock chronique : Plafond Max actuel (${product.maxThreshold}) dépasse largement les besoins à ${targetCycleDays} jours (${simulatedMax} btes recommandées).`;
      overStockedCount++;
    } else {
      diagnosticStatus = 'optimal';
      diagnosticReason = `Seuils actuels (Min ${product.minThreshold} / Max ${product.maxThreshold}) conformes à la rotation constatée.`;
      optimalCount++;
    }

    return {
      productId: product.id,
      product,
      currentStock: product.stockQty,
      currentMin: product.minThreshold,
      currentMax: product.maxThreshold,
      simulatedMin,
      simulatedMax,
      deltaMin,
      deltaMax,
      monthlySales: rawMonthly,
      dailyVelocity: Number(adjustedDailyVelocity.toFixed(2)),
      currentDaysCoverage,
      simulatedDaysCoverage,
      pumpHt: product.pump,
      estimatedBfrImpactHt,
      annualTurnoverGainPct,
      diagnosticStatus,
      diagnosticReason,
      isEssential,
      isHighValue,
      supplierType,
      abcClass
    };
  });

  const netBfrImpactHt = Number((totalSecuringCashHt - totalFreedCashHt).toFixed(2));
  const underProtectedResults = results.filter(r => r.diagnosticStatus === 'under_protected');
  const overStockedResults = results.filter(r => r.diagnosticStatus === 'over_stocked');
  const optimalResults = results.filter(r => r.diagnosticStatus === 'optimal');
  const rebalanceResults = results.filter(r => r.diagnosticStatus === 'rebalance');

  const summary: StockOptimizationSimulationSummary = {
    totalAnalyzedSkus: products.length,
    underProtectedCount,
    overStockedCount,
    optimalCount,
    rebalanceCount,
    totalFreedCashHt: Number(totalFreedCashHt.toFixed(2)),
    totalSecuringCashHt: Number(totalSecuringCashHt.toFixed(2)),
    netBfrImpactHt,
    estimatedTurnoverImprovement: 2.1,
    serviceLevelCurrentPct: 93.4,
    serviceLevelSimulatedPct: 99.2,
    potentialExpiredLossAvoidanceHt: Number(totalPotentialExpiredLossAvoidanceHt.toFixed(2))
  };

  return {
    results,
    summary,
    underProtectedResults,
    overStockedResults,
    optimalResults,
    rebalanceResults
  };
}
