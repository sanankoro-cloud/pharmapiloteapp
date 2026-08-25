import { 
  ProductStock, 
  StockCategoryStats, 
  StockAbcStats, 
  StockTurnoverStats, 
  StockExpiryRiskStats, 
  LaboratoryStockStats,
  ProductCategory
} from '../types/pharmacy';

export const CATEGORY_LABELS: Record<ProductCategory, { label: string; tva: 2.1 | 5.5 | 10.0 | 20.0; color: string }> = {
  medicament_remboursable: { label: 'Médicaments Remboursables', tva: 2.1, color: '#059669' }, // emerald-600
  medicament_otc: { label: 'Conseil & OTC (Automédication)', tva: 10.0, color: '#3b82f6' }, // blue-500
  parapharmacie: { label: 'Parapharmacie & Dermo-Cosmétique', tva: 20.0, color: '#8b5cf6' }, // purple-500
  dispositif_medical: { label: 'Dispositifs Médicaux & Pansements', tva: 20.0, color: '#f59e0b' }, // amber-500
  nutrition_bebe: { label: 'Nutrition & Laits Infantiles', tva: 5.5, color: '#06b6d4' }, // cyan-500
  veterinaire: { label: 'Médicaments Vétérinaires', tva: 20.0, color: '#ec4899' }, // pink-500
  acte_pharmaceutique: { label: 'Actes & Entretiens Pharmaceutiques', tva: 2.1, color: '#10b981' }
};

export interface StockEnrichedProduct extends ProductStock {
  totalValueHt: number;
  totalRetailValueTtc: number;
  grossMarginHt: number;
  marginRatePct: number;
  calculatedAbcClass: 'A' | 'B' | 'C';
  calculatedDaysCoverage: number;
  annualTurnoverRate: number;
  isDormantStock: boolean;
  cumulatedValuePct: number;
}

export interface StockComprehensiveAnalytics {
  totalSkus: number;
  totalUnits: number;
  totalValuePumpHt: number;
  totalRetailValueTtc: number;
  totalPotentialMarginHt: number;
  averageMarginRatePct: number;
  categoryStats: StockCategoryStats[];
  abcStats: StockAbcStats;
  turnoverStats: StockTurnoverStats;
  expiryRiskStats: StockExpiryRiskStats;
  topLaboratories: LaboratoryStockStats[];
  refrigeratedStats: {
    count: number;
    units: number;
    valueHt: number;
  };
  highValueStats: {
    count: number;
    units: number;
    valueHt: number;
  };
  dormantItems: StockEnrichedProduct[];
  criticalExpiryItems: StockEnrichedProduct[];
  lowStockItems: StockEnrichedProduct[];
  topValuedItems: StockEnrichedProduct[];
  enrichedProducts: StockEnrichedProduct[];
  strategicInsights: {
    id: string;
    type: 'opportunity' | 'warning' | 'alert' | 'success';
    title: string;
    description: string;
    financialImpact: number;
    actionLabel: string;
    filterTarget?: string;
  }[];
}

/**
 * Calcule l'ensemble des indicateurs statistiques et financiers du stock d'officine
 */
export function computeStockAnalytics(products: ProductStock[]): StockComprehensiveAnalytics {
  if (!products || products.length === 0) {
    return getEmptyStockAnalytics();
  }

  // 1. Calcul des valeurs unitaires et totales
  const rawEnriched = products.map(p => {
    const totalValueHt = p.stockQty * p.pump;
    const totalRetailValueTtc = p.stockQty * p.publicPriceTtc;
    const retailHt = p.publicPriceTtc / (1 + p.tva / 100);
    const grossMarginHt = (retailHt - p.pump) * p.stockQty;
    const marginRatePct = retailHt > 0 ? ((retailHt - p.pump) / retailHt) * 100 : 0;

    // Estimation des ventes mensuelles si non fournies
    const monthlySales = p.monthlySalesQty || Math.max(1, Math.round(p.stockQty * 0.75 + (p.minThreshold * 1.5)));
    
    // Couverture en jours de stock : (Stock / Ventes mensuelles) * 30
    const calculatedDaysCoverage = monthlySales > 0 ? Math.round((p.stockQty / monthlySales) * 30) : 180;
    
    // Taux de rotation annuel : 365 / jours de couverture
    const annualTurnoverRate = calculatedDaysCoverage > 0 ? Number((365 / calculatedDaysCoverage).toFixed(1)) : 0;

    // Définition de stock dormant : > 75 jours de couverture et stockQty > 2 ou non vendu depuis > 60j
    const isDormantStock = calculatedDaysCoverage > 75 && p.stockQty > 2 && !p.isHighValue;

    return {
      ...p,
      totalValueHt,
      totalRetailValueTtc,
      grossMarginHt,
      marginRatePct,
      calculatedAbcClass: 'C' as 'A' | 'B' | 'C',
      calculatedDaysCoverage,
      annualTurnoverRate,
      isDormantStock,
      cumulatedValuePct: 0
    };
  });

  // 2. Classification ABC / Pareto basée sur la valeur de stock HT
  const sortedByValue = [...rawEnriched].sort((a, b) => b.totalValueHt - a.totalValueHt);
  const totalStockPumpHt = sortedByValue.reduce((sum, p) => sum + p.totalValueHt, 0);
  const totalStockRetailTtc = sortedByValue.reduce((sum, p) => sum + p.totalRetailValueTtc, 0);
  const totalPotentialMarginHt = sortedByValue.reduce((sum, p) => sum + p.grossMarginHt, 0);
  const totalUnits = sortedByValue.reduce((sum, p) => sum + p.stockQty, 0);

  let runningValueSum = 0;
  const enrichedProducts: StockEnrichedProduct[] = sortedByValue.map(p => {
    runningValueSum += p.totalValueHt;
    const cumulatedValuePct = totalStockPumpHt > 0 ? (runningValueSum / totalStockPumpHt) * 100 : 0;
    
    let abcClass: 'A' | 'B' | 'C' = 'C';
    if (cumulatedValuePct <= 80 || sortedByValue.indexOf(p) < Math.max(1, Math.ceil(sortedByValue.length * 0.2))) {
      abcClass = 'A';
    } else if (cumulatedValuePct <= 95 || sortedByValue.indexOf(p) < Math.max(2, Math.ceil(sortedByValue.length * 0.5))) {
      abcClass = 'B';
    } else {
      abcClass = 'C';
    }

    return {
      ...p,
      cumulatedValuePct: Number(cumulatedValuePct.toFixed(1)),
      calculatedAbcClass: abcClass
    };
  });

  // Stats ABC
  const classAItems = enrichedProducts.filter(p => p.calculatedAbcClass === 'A');
  const classBItems = enrichedProducts.filter(p => p.calculatedAbcClass === 'B');
  const classCItems = enrichedProducts.filter(p => p.calculatedAbcClass === 'C');

  const classAValue = classAItems.reduce((s, p) => s + p.totalValueHt, 0);
  const classBValue = classBItems.reduce((s, p) => s + p.totalValueHt, 0);
  const classCValue = classCItems.reduce((s, p) => s + p.totalValueHt, 0);

  const abcStats: StockAbcStats = {
    classA: {
      count: classAItems.length,
      valueHt: classAValue,
      pctValue: totalStockPumpHt > 0 ? Number(((classAValue / totalStockPumpHt) * 100).toFixed(1)) : 0,
      pctItems: Number(((classAItems.length / enrichedProducts.length) * 100).toFixed(1)),
      description: 'Top références stratégiques concentrant 80% du capital immobilisé'
    },
    classB: {
      count: classBItems.length,
      valueHt: classBValue,
      pctValue: totalStockPumpHt > 0 ? Number(((classBValue / totalStockPumpHt) * 100).toFixed(1)) : 0,
      pctItems: Number(((classBItems.length / enrichedProducts.length) * 100).toFixed(1)),
      description: 'Références intermédiaires à rotation régulière'
    },
    classC: {
      count: classCItems.length,
      valueHt: classCValue,
      pctValue: totalStockPumpHt > 0 ? Number(((classCValue / totalStockPumpHt) * 100).toFixed(1)) : 0,
      pctItems: Number(((classCItems.length / enrichedProducts.length) * 100).toFixed(1)),
      description: 'Références de fond de rayon / faible valeur'
    }
  };

  // 3. Stats par Catégorie
  const categoryMap = new Map<ProductCategory, StockCategoryStats>();
  
  (Object.keys(CATEGORY_LABELS) as ProductCategory[]).forEach(cat => {
    categoryMap.set(cat, {
      category: cat,
      categoryLabel: CATEGORY_LABELS[cat].label,
      tvaRate: CATEGORY_LABELS[cat].tva,
      productCount: 0,
      totalUnits: 0,
      totalValuePumpHt: 0,
      totalRetailValueTtc: 0,
      potentialMarginHt: 0,
      marginRatePct: 0,
      shareOfStockPct: 0,
      color: CATEGORY_LABELS[cat].color
    });
  });

  enrichedProducts.forEach(p => {
    const stat = categoryMap.get(p.category) || {
      category: p.category,
      categoryLabel: p.category,
      tvaRate: p.tva,
      productCount: 0,
      totalUnits: 0,
      totalValuePumpHt: 0,
      totalRetailValueTtc: 0,
      potentialMarginHt: 0,
      marginRatePct: 0,
      shareOfStockPct: 0,
      color: '#64748b'
    };

    stat.productCount += 1;
    stat.totalUnits += p.stockQty;
    stat.totalValuePumpHt += p.totalValueHt;
    stat.totalRetailValueTtc += p.totalRetailValueTtc;
    stat.potentialMarginHt += p.grossMarginHt;
    categoryMap.set(p.category, stat);
  });

  const categoryStats: StockCategoryStats[] = Array.from(categoryMap.values())
    .filter(c => c.productCount > 0)
    .map(c => {
      const shareOfStockPct = totalStockPumpHt > 0 ? Number(((c.totalValuePumpHt / totalStockPumpHt) * 100).toFixed(1)) : 0;
      const retailHt = c.totalRetailValueTtc / (1 + c.tvaRate / 100);
      const marginRatePct = retailHt > 0 ? Number(((c.potentialMarginHt / retailHt) * 100).toFixed(1)) : 0;
      return {
        ...c,
        shareOfStockPct,
        marginRatePct
      };
    })
    .sort((a, b) => b.totalValuePumpHt - a.totalValuePumpHt);

  // 4. Stats Rotation & Couverture (Turnover / DIO)
  const totalMonthlySalesValue = enrichedProducts.reduce((sum, p) => {
    const monthlySales = p.monthlySalesQty || Math.max(1, Math.round(p.stockQty * 0.75));
    return sum + (monthlySales * p.pump);
  }, 0);

  const averageDaysCoverage = totalMonthlySalesValue > 0 
    ? Math.round((totalStockPumpHt / totalMonthlySalesValue) * 30) 
    : 38;
  const averageTurnoverRate = averageDaysCoverage > 0 
    ? Number((365 / averageDaysCoverage).toFixed(1)) 
    : 9.6;

  const fastMovers = enrichedProducts.filter(p => p.calculatedDaysCoverage < 20);
  const optimalMovers = enrichedProducts.filter(p => p.calculatedDaysCoverage >= 20 && p.calculatedDaysCoverage <= 45);
  const slowMovers = enrichedProducts.filter(p => p.calculatedDaysCoverage > 45 && p.calculatedDaysCoverage <= 75);
  const dormantItems = enrichedProducts.filter(p => p.isDormantStock);
  const dormantStockValueHt = dormantItems.reduce((sum, p) => sum + p.totalValueHt, 0);

  const lowStockItems = enrichedProducts.filter(p => p.stockQty <= p.minThreshold);
  const serviceRatePct = Number((((enrichedProducts.length - lowStockItems.length) / enrichedProducts.length) * 100).toFixed(1));

  const turnoverStats: StockTurnoverStats = {
    averageTurnoverRate,
    averageDaysCoverage,
    fastMoversCount: fastMovers.length,
    optimalMoversCount: optimalMovers.length,
    slowMoversCount: slowMovers.length,
    dormantStockCount: dormantItems.length,
    dormantStockValueHt,
    serviceRatePct: isNaN(serviceRatePct) ? 100 : serviceRatePct,
    stockoutRiskCount: lowStockItems.length
  };

  // 5. Stats Péremptions & Risque Financier
  const under30 = enrichedProducts.filter(p => p.daysUntilExpiry <= 30);
  const under60 = enrichedProducts.filter(p => p.daysUntilExpiry > 30 && p.daysUntilExpiry <= 60);
  const under90 = enrichedProducts.filter(p => p.daysUntilExpiry > 60 && p.daysUntilExpiry <= 90);
  const safeItems = enrichedProducts.filter(p => p.daysUntilExpiry > 90);

  const under30Value = under30.reduce((s, p) => s + p.totalValueHt, 0);
  const under60Value = under60.reduce((s, p) => s + p.totalValueHt, 0);
  const under90Value = under90.reduce((s, p) => s + p.totalValueHt, 0);
  const safeValue = safeItems.reduce((s, p) => s + p.totalValueHt, 0);

  const expiryRiskStats: StockExpiryRiskStats = {
    under30DaysCount: under30.length,
    under30DaysValueHt: under30Value,
    under60DaysCount: under60.length,
    under60DaysValueHt: under60Value,
    under90DaysCount: under90.length,
    under90DaysValueHt: under90Value,
    safeCount: safeItems.length,
    safeValueHt: safeValue,
    totalAtRiskValueHt: under30Value + under60Value
  };

  // 6. Top Laboratoires en Valeur
  const labMap = new Map<string, { count: number; units: number; valueHt: number }>();
  enrichedProducts.forEach(p => {
    const lab = p.laboratory || 'Autre Laboratoire';
    const curr = labMap.get(lab) || { count: 0, units: 0, valueHt: 0 };
    curr.count += 1;
    curr.units += p.stockQty;
    curr.valueHt += p.totalValueHt;
    labMap.set(lab, curr);
  });

  const topLaboratories: LaboratoryStockStats[] = Array.from(labMap.entries())
    .map(([laboratory, data]) => ({
      laboratory,
      itemsCount: data.count,
      totalUnits: data.units,
      totalValueHt: data.valueHt,
      sharePct: totalStockPumpHt > 0 ? Number(((data.valueHt / totalStockPumpHt) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.totalValueHt - a.totalValueHt)
    .slice(0, 8);

  // 7. Frigo & Haute Valeur
  const refrigerated = enrichedProducts.filter(p => p.isRefrigerated);
  const refrigeratedStats = {
    count: refrigerated.length,
    units: refrigerated.reduce((s, p) => s + p.stockQty, 0),
    valueHt: refrigerated.reduce((s, p) => s + p.totalValueHt, 0)
  };

  const highValue = enrichedProducts.filter(p => p.isHighValue || p.pump >= 100 || p.totalValueHt >= 2000);
  const highValueStats = {
    count: highValue.length,
    units: highValue.reduce((s, p) => s + p.stockQty, 0),
    valueHt: highValue.reduce((s, p) => s + p.totalValueHt, 0)
  };

  // 8. Recommandations Stratégiques pour le Titulaire d'Officine
  const strategicInsights: StockComprehensiveAnalytics['strategicInsights'] = [];

  if (under30.length > 0) {
    strategicInsights.push({
      id: 'ins-peremptions-30j',
      type: 'alert',
      title: `${under30.length} lot(s) à péremption imminente (< 30 jours)`,
      description: `Risque de perte sèche immédiate de ${under30Value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}. Générer les demandes d'avoirs de reprise laboratoire ou retirer des tiroirs.`,
      financialImpact: under30Value,
      actionLabel: 'Traiter les Retours Labo',
      filterTarget: 'near_expiry'
    });
  }

  if (dormantItems.length > 0) {
    strategicInsights.push({
      id: 'ins-surstock-dormants',
      type: 'warning',
      title: `${dormantItems.length} référence(s) en surstock / stock dormant (> 75j)`,
      description: `${dormantStockValueHt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} de trésorerie immobilisée inutilement. Réduire les cadences de commande et envisager des déstockages.`,
      financialImpact: dormantStockValueHt,
      actionLabel: 'Voir les Stocks Dormants',
      filterTarget: 'dormant'
    });
  }

  if (lowStockItems.length > 0) {
    strategicInsights.push({
      id: 'ins-ruptures-seuil',
      type: 'opportunity',
      title: `${lowStockItems.length} référence(s) sous seuil mini de sécurité`,
      description: `Risque de manqués au comptoir et de dégradation du taux de service (${serviceRatePct}% actuel). Intégrer au cadencier grossiste du jour.`,
      financialImpact: 0,
      actionLabel: 'Générer Commande Réassort',
      filterTarget: 'low_stock'
    });
  }

  if (classAItems.length > 0) {
    strategicInsights.push({
      id: 'ins-classe-a-pareto',
      type: 'success',
      title: `Optimisation Pareto : ${classAItems.length} références représentent ${abcStats.classA.pctValue}% du stock`,
      description: `Surveiller ces références en flux tendu J+1 avec le grossiste pour préserver jusqu'à 15 k€ de trésorerie sans impacter les délivrances.`,
      financialImpact: classAValue * 0.15,
      actionLabel: 'Auditer Classe A',
      filterTarget: 'class_a'
    });
  }

  const averageMarginRatePct = totalStockRetailTtc > 0 
    ? Number(((totalPotentialMarginHt / (totalStockRetailTtc / 1.1)) * 100).toFixed(1)) 
    : 32.4;

  return {
    totalSkus: enrichedProducts.length,
    totalUnits,
    totalValuePumpHt: Number(totalStockPumpHt.toFixed(2)),
    totalRetailValueTtc: Number(totalStockRetailTtc.toFixed(2)),
    totalPotentialMarginHt: Number(totalPotentialMarginHt.toFixed(2)),
    averageMarginRatePct,
    categoryStats,
    abcStats,
    turnoverStats,
    expiryRiskStats,
    topLaboratories,
    refrigeratedStats,
    highValueStats,
    dormantItems,
    criticalExpiryItems: under30,
    lowStockItems,
    topValuedItems: enrichedProducts.slice(0, 10),
    enrichedProducts,
    strategicInsights
  };
}

function getEmptyStockAnalytics(): StockComprehensiveAnalytics {
  return {
    totalSkus: 0,
    totalUnits: 0,
    totalValuePumpHt: 0,
    totalRetailValueTtc: 0,
    totalPotentialMarginHt: 0,
    averageMarginRatePct: 0,
    categoryStats: [],
    abcStats: {
      classA: { count: 0, valueHt: 0, pctValue: 0, pctItems: 0, description: '' },
      classB: { count: 0, valueHt: 0, pctValue: 0, pctItems: 0, description: '' },
      classC: { count: 0, valueHt: 0, pctValue: 0, pctItems: 0, description: '' }
    },
    turnoverStats: {
      averageTurnoverRate: 0,
      averageDaysCoverage: 0,
      fastMoversCount: 0,
      optimalMoversCount: 0,
      slowMoversCount: 0,
      dormantStockCount: 0,
      dormantStockValueHt: 0,
      serviceRatePct: 100,
      stockoutRiskCount: 0
    },
    expiryRiskStats: {
      under30DaysCount: 0,
      under30DaysValueHt: 0,
      under60DaysCount: 0,
      under60DaysValueHt: 0,
      under90DaysCount: 0,
      under90DaysValueHt: 0,
      safeCount: 0,
      safeValueHt: 0,
      totalAtRiskValueHt: 0
    },
    topLaboratories: [],
    refrigeratedStats: { count: 0, units: 0, valueHt: 0 },
    highValueStats: { count: 0, units: 0, valueHt: 0 },
    dormantItems: [],
    criticalExpiryItems: [],
    lowStockItems: [],
    topValuedItems: [],
    enrichedProducts: [],
    strategicInsights: []
  };
}
