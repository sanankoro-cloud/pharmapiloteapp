import { ProductStock, StockoutPrediction, StockoutSeverity, PredictiveAlertsSummary } from '../types/pharmacy';

// Liste de référence des molécules / DCI d'Intérêt Thérapeutique Majeur (MITM) & vitales en officine
export const ESSENTIAL_DCI_KEYWORDS = [
  'insuline', 'tafamidis', 'étanercept', 'etanercept', 'amoxicilline', 
  'paracétamol', 'paracetamol', 'lévothyroxine', 'levothyroxine', 'salbutamol', 
  'phloroglucinol', 'metformine', 'bisoprolol', 'ramipril', 'atorvastatine',
  'apixaban', 'rivaroxaban', 'tacrolimus', 'ciclosporine', 'morphine',
  'fentanyl', 'sertraline', 'escitalopram', 'valproate', 'lévodopa', 'levodopa'
];

export interface PredictiveEngineOptions {
  globalDemandFactor?: number; // 1.0 par défaut, 1.25 si pic épidémique, 1.5 si ruée
  safetyStockDays?: number; // 4 jours par défaut
  grossisteLeadTimeDays?: number; // 0.5 jour (J+0 soir / J+1 matin)
  directLabLeadTimeDays?: number; // 5 jours
  targetDaysCoverage?: number; // 25 jours
}

/**
 * Détermine si un produit est considéré comme essentiel / MITM pour l'officine
 */
export function isProductEssential(product: ProductStock): boolean {
  if (product.isEssential !== undefined) return product.isEssential;
  
  // Par défaut, les médicaments remboursables de classe A ou B avec DCI vitale
  if (product.category === 'medicament_remboursable') {
    if (product.abcClass === 'A' || product.isHighValue || product.isRefrigerated) return true;
    
    if (product.dci) {
      const dciLower = product.dci.toLowerCase();
      if (ESSENTIAL_DCI_KEYWORDS.some(keyword => dciLower.includes(keyword))) {
        return true;
      }
    }
  }

  // Produits d'urgence pédiatrique ou respiratoires
  const nameLower = product.name.toLowerCase();
  if (nameLower.includes('ventoline') || nameLower.includes('insuline') || nameLower.includes('amoxicilline') || nameLower.includes('levothyrox') || nameLower.includes('kardegic')) {
    return true;
  }

  return false;
}

/**
 * Calcule la vitesse de vente journalière (Daily Velocity)
 */
export function calculateDailyVelocity(product: ProductStock, demandFactor = 1.0): number {
  if (product.dailySalesRate && product.dailySalesRate > 0) {
    return product.dailySalesRate * demandFactor;
  }
  
  const monthly = product.monthlySalesQty || (product.minThreshold * 1.5) || 10;
  const baseDaily = monthly / 30;
  return Math.max(0.1, Number((baseDaily * demandFactor).toFixed(2)));
}

/**
 * Analyse l'ensemble du stock et génère les alertes prédictives d'anticipation de rupture
 */
export function computeStockoutPredictions(
  products: ProductStock[], 
  options: PredictiveEngineOptions = {}
): {
  predictions: StockoutPrediction[];
  summary: PredictiveAlertsSummary;
  criticalAlerts: StockoutPrediction[];
  warningAlerts: StockoutPrediction[];
  watchAlerts: StockoutPrediction[];
} {
  const {
    globalDemandFactor = 1.0,
    safetyStockDays = 4,
    grossisteLeadTimeDays = 0.5,
    directLabLeadTimeDays = 5,
    targetDaysCoverage = 25
  } = options;

  const today = new Date();

  // Indexer les alternatives génériques par DCI
  const dciProductMap = new Map<string, ProductStock[]>();
  products.forEach(p => {
    if (p.dci && p.dci.trim().length > 2) {
      const key = p.dci.toLowerCase().trim();
      const existing = dciProductMap.get(key) || [];
      existing.push(p);
      dciProductMap.set(key, existing);
    }
  });

  const predictions: StockoutPrediction[] = products.map(product => {
    const isEssential = isProductEssential(product);
    const dailyVelocity = calculateDailyVelocity(product, globalDemandFactor);
    const trendPct = product.salesTrendPct || (product.monthlySalesQty && product.monthlySalesQty > product.minThreshold * 3 ? 18 : 0);
    
    const isDirectSupplier = (product.supplier || '').toLowerCase().includes('direct') || (product.supplier || '').toLowerCase().includes('labo');
    const leadTimeDays = product.leadTimeDays || (isDirectSupplier ? directLabLeadTimeDays : grossisteLeadTimeDays);
    
    // Calcul de la couverture actuelle
    const daysUntilStockout = Math.max(0, Number((product.stockQty / dailyVelocity).toFixed(1)));
    
    // Calcul du temps avant d'atteindre le seuil critique (seuil mini de sécurité)
    const stockAboveMin = Math.max(0, product.stockQty - product.minThreshold);
    const daysUntilCriticalThreshold = Math.max(0, Number((stockAboveMin / dailyVelocity).toFixed(1)));

    // Date prévisionnelle d'atteinte du seuil critique
    const thresholdDateObj = new Date(today);
    thresholdDateObj.setDate(thresholdDateObj.getDate() + Math.ceil(daysUntilCriticalThreshold));
    const predictedThresholdDate = thresholdDateObj.toISOString().split('T')[0];

    // Date prévisionnelle de rupture sèche (stock = 0)
    const stockoutDateObj = new Date(today);
    stockoutDateObj.setDate(stockoutDateObj.getDate() + Math.ceil(daysUntilStockout));
    const predictedStockoutDate = stockoutDateObj.toISOString().split('T')[0];

    // Point de commande prédictif (ROP)
    const leadTimeDemand = dailyVelocity * leadTimeDays;
    const safetyStockUnits = dailyVelocity * safetyStockDays;
    const reorderPoint = Math.ceil(leadTimeDemand + safetyStockUnits + (product.minThreshold * 0.5));

    // Quantité recommandée
    const targetStock = Math.max(product.maxThreshold, Math.ceil(dailyVelocity * targetDaysCoverage));
    const recommendedReorderQty = Math.max(1, targetStock - product.stockQty);
    const reorderCostPumpHt = Number((recommendedReorderQty * product.pump).toFixed(2));
    const potentialLostRevenueHt = Number((dailyVelocity * 7 * (product.publicPriceTtc / (1 + product.tva / 100))).toFixed(2));

    // Détermination de la sévérité
    let urgencyLevel: StockoutSeverity = 'healthy';
    let urgencyScore = 0;
    let riskReason = 'Stock suffisant pour couvrir la demande prévisionnelle.';

    if (product.stockQty <= 0) {
      urgencyLevel = 'critical_imminent';
      urgencyScore = 100;
      riskReason = 'RUPTURE SÈCHE IMMÉDIATE : Stock à zéro en rayon !';
    } else if (daysUntilStockout <= leadTimeDays + 1 || daysUntilCriticalThreshold <= 2) {
      urgencyLevel = 'critical_imminent';
      urgencyScore = isEssential ? 95 : 85;
      riskReason = `Rupture imminente d'ici ${daysUntilStockout}j (seuil atteint dans ${daysUntilCriticalThreshold}j). Délai fournisseur : ${leadTimeDays}j.`;
    } else if (daysUntilCriticalThreshold <= (leadTimeDays + safetyStockDays) || daysUntilStockout <= 7) {
      urgencyLevel = 'warning_reorder';
      urgencyScore = isEssential ? 75 : 60;
      riskReason = `Anticipation requise : Seuil critique atteint dans ${daysUntilCriticalThreshold} jours (avant le ${formatSimpleDate(predictedThresholdDate)}).`;
    } else if (trendPct >= 20 || daysUntilStockout <= 14) {
      urgencyLevel = 'watch_trend';
      urgencyScore = 40;
      riskReason = `Vigilance rotation : Forte accélération des dispensations (+${trendPct}%) ou couverture modérée (${daysUntilStockout}j).`;
    } else {
      urgencyLevel = 'healthy';
      urgencyScore = 10;
      riskReason = `Stock sécurisé (${daysUntilStockout} jours de couverture disponible).`;
    }

    // Recherche d'alternatives disponibles
    let hasAvailableGenericAlternative = false;
    let genericAlternativesCount = 0;
    if (product.dci) {
      const key = product.dci.toLowerCase().trim();
      const sameMolProducts = dciProductMap.get(key) || [];
      const othersInStock = sameMolProducts.filter(o => o.id !== product.id && o.stockQty > o.minThreshold);
      if (othersInStock.length > 0) {
        hasAvailableGenericAlternative = true;
        genericAlternativesCount = othersInStock.length;
      }
    }

    return {
      productId: product.id,
      product,
      currentStock: product.stockQty,
      minThreshold: product.minThreshold,
      maxThreshold: product.maxThreshold,
      dailyVelocity,
      salesTrendPct: trendPct,
      leadTimeDays,
      safetyStockDays,
      daysUntilCriticalThreshold,
      daysUntilStockout,
      predictedThresholdDate,
      predictedStockoutDate,
      urgencyLevel,
      urgencyScore,
      recommendedReorderQty,
      reorderCostPumpHt,
      potentialLostRevenueHt,
      isEssential,
      isRefrigerated: !!product.isRefrigerated,
      abcClass: product.abcClass || 'B',
      supplierName: product.supplier || (isDirectSupplier ? 'Direct Laboratoire' : 'Grossiste Répartiteur'),
      supplierType: isDirectSupplier ? 'laboratoire_direct' : 'grossiste',
      hasAvailableGenericAlternative,
      genericAlternativesCount,
      riskReason
    };
  });

  // Trier par criticité décroissante (urgence score puis jours de couverture)
  predictions.sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    return a.daysUntilStockout - b.daysUntilStockout;
  });

  const criticalAlerts = predictions.filter(p => p.urgencyLevel === 'critical_imminent');
  const warningAlerts = predictions.filter(p => p.urgencyLevel === 'warning_reorder');
  const watchAlerts = predictions.filter(p => p.urgencyLevel === 'watch_trend');
  const healthyAlerts = predictions.filter(p => p.urgencyLevel === 'healthy');

  const essentialPredictions = predictions.filter(p => p.isEssential);
  const essentialAtRiskCount = predictions.filter(p => p.isEssential && (p.urgencyLevel === 'critical_imminent' || p.urgencyLevel === 'warning_reorder')).length;

  const totalPotentialLostRevenueHt = predictions
    .filter(p => p.urgencyLevel === 'critical_imminent' || p.urgencyLevel === 'warning_reorder')
    .reduce((sum, p) => sum + p.potentialLostRevenueHt, 0);

  const totalReorderBudgetHt = predictions
    .filter(p => p.urgencyLevel === 'critical_imminent' || p.urgencyLevel === 'warning_reorder')
    .reduce((sum, p) => sum + p.reorderCostPumpHt, 0);

  const averageCoverageDaysEssential = essentialPredictions.length > 0
    ? Number((essentialPredictions.reduce((sum, p) => sum + p.daysUntilStockout, 0) / essentialPredictions.length).toFixed(1))
    : 0;

  const summary: PredictiveAlertsSummary = {
    totalAnalyzed: products.length,
    totalAlerts: criticalAlerts.length + warningAlerts.length + watchAlerts.length,
    criticalImminentCount: criticalAlerts.length,
    warningReorderCount: warningAlerts.length,
    watchTrendCount: watchAlerts.length,
    healthyCount: healthyAlerts.length,
    essentialAtRiskCount,
    totalPotentialLostRevenueHt: Number(totalPotentialLostRevenueHt.toFixed(2)),
    totalReorderBudgetHt: Number(totalReorderBudgetHt.toFixed(2)),
    averageCoverageDaysEssential,
    reorderSuggestionLinesCount: criticalAlerts.length + warningAlerts.length
  };

  return {
    predictions,
    summary,
    criticalAlerts,
    warningAlerts,
    watchAlerts
  };
}

/**
 * Génère la série chronologique de projection de stock (30 jours) pour un produit
 */
export function generateStockProjectionTimeSeries(
  prediction: StockoutPrediction, 
  days = 30
): Array<{ dayIndex: number; dateStr: string; label: string; simulatedStock: number; minThreshold: number; isCritical: boolean }> {
  const points = [];
  const today = new Date();
  let remainingStock = prediction.currentStock;

  for (let i = 0; i <= days; i++) {
    const currentD = new Date(today);
    currentD.setDate(currentD.getDate() + i);
    const dateStr = currentD.toISOString().split('T')[0];
    const dayName = currentD.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });

    points.push({
      dayIndex: i,
      dateStr,
      label: i === 0 ? "Aujourd'hui" : dayName,
      simulatedStock: Math.max(0, Number(remainingStock.toFixed(1))),
      minThreshold: prediction.minThreshold,
      isCritical: remainingStock <= prediction.minThreshold
    });

    remainingStock = Math.max(0, remainingStock - prediction.dailyVelocity);
  }

  return points;
}

function formatSimpleDate(isoStr: string): string {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}/${parts[1]}`;
}
