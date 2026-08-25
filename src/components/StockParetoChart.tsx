import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  Boxes, 
  Euro, 
  Info, 
  Layers, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sliders,
  Maximize2,
  ChevronRight,
  Zap,
  RotateCcw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Cell, 
  Legend 
} from 'recharts';
import { ProductStock } from '../types/pharmacy';
import { formatCurrency, formatNumber, formatPercent, exportToCsv } from '../utils/formatters';

export type ParetoMetric = 'revenue' | 'units' | 'stock_value' | 'margin';

interface StockParetoChartProps {
  products: ProductStock[];
  onSelectProduct?: (productId: string) => void;
  onFilterPreset?: (preset: string) => void;
  onOpenAdvancedSearch?: () => void;
}

interface ParetoDataPoint {
  id: string;
  rank: number;
  cip: string;
  name: string;
  shortName: string;
  dci?: string;
  laboratory: string;
  category: string;
  stockQty: number;
  pump: number;
  publicPriceTtc: number;
  annualRevenueHt: number;
  annualUnitsSold: number;
  stockValueHt: number;
  annualMarginHt: number;
  metricValue: number;
  individualSharePct: number;
  cumulatedMetricValue: number;
  cumulatedSharePct: number;
  itemPercentile: number; // % du catalogue (ex: 5%, 10%, 20%)
  abcClass: 'A' | 'B' | 'C';
  daysCoverage: number;
  isRefrigerated?: boolean;
}

export const StockParetoChart: React.FC<StockParetoChartProps> = ({
  products,
  onSelectProduct,
  onFilterPreset,
  onOpenAdvancedSearch
}) => {
  const [selectedMetric, setSelectedMetric] = useState<ParetoMetric>('revenue');
  const [displayMode, setDisplayMode] = useState<'individual' | 'quantiles'>('individual');
  const [targetDaysCoverage, setTargetDaysCoverage] = useState<number>(10);
  const [showSimulator, setShowSimulator] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<ParetoDataPoint | null>(null);

  // 1. Calcul des données enrichies et tri par la métrique sélectionnée
  const paretoAnalysis = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        data: [],
        top20Items: [],
        totalMetricSum: 0,
        totalRevenue: 0,
        totalStockValue: 0,
        classACount: 0,
        classAValue: 0,
        classAPct: 0,
        classBCount: 0,
        classBValue: 0,
        classBPct: 0,
        classCCount: 0,
        classCValue: 0,
        classCPct: 0,
        exact20PercentileShare: 0,
        currentClassADaysAvg: 30,
        potentialCashReleased: 0
      };
    }

    // Calcul unitaire par produit
    const processed = products.map(p => {
      const retailHt = p.publicPriceTtc / (1 + p.tva / 100);
      const monthlySales = p.monthlySalesQty || Math.max(1, Math.round(p.stockQty * 0.75 + (p.minThreshold * 1.2)));
      const annualUnitsSold = monthlySales * 12;
      const annualRevenueHt = annualUnitsSold * retailHt;
      const stockValueHt = p.stockQty * p.pump;
      const annualMarginHt = (retailHt - p.pump) * annualUnitsSold;
      const daysCoverage = monthlySales > 0 ? Math.round((p.stockQty / monthlySales) * 30) : 60;

      let metricValue = 0;
      switch (selectedMetric) {
        case 'revenue':
          metricValue = annualRevenueHt;
          break;
        case 'units':
          metricValue = annualUnitsSold;
          break;
        case 'stock_value':
          metricValue = stockValueHt;
          break;
        case 'margin':
          metricValue = annualMarginHt;
          break;
      }

      // Nom court pour l'axe X
      const shortName = p.name.length > 16 ? p.name.substring(0, 14) + '...' : p.name;

      return {
        id: p.id,
        cip: p.cip,
        name: p.name,
        shortName,
        dci: p.dci,
        laboratory: p.laboratory,
        category: p.category,
        stockQty: p.stockQty,
        pump: p.pump,
        publicPriceTtc: p.publicPriceTtc,
        annualRevenueHt,
        annualUnitsSold,
        stockValueHt,
        annualMarginHt,
        metricValue,
        individualSharePct: 0,
        cumulatedMetricValue: 0,
        cumulatedSharePct: 0,
        itemPercentile: 0,
        abcClass: 'C' as 'A' | 'B' | 'C',
        daysCoverage,
        isRefrigerated: p.isRefrigerated
      };
    });

    // Tri décroissant selon la métrique sélectionnée (Loi de Pareto : les plus forts en premier)
    const sorted = [...processed].sort((a, b) => b.metricValue - a.metricValue);
    const totalMetricSum = sorted.reduce((sum, item) => sum + item.metricValue, 0);
    const totalRevenue = sorted.reduce((sum, item) => sum + item.annualRevenueHt, 0);
    const totalStockValue = sorted.reduce((sum, item) => sum + item.stockValueHt, 0);
    const totalCount = sorted.length;

    let runningCumul = 0;
    const enriched: ParetoDataPoint[] = sorted.map((item, index) => {
      runningCumul += item.metricValue;
      const cumulatedSharePct = totalMetricSum > 0 ? (runningCumul / totalMetricSum) * 100 : 0;
      const individualSharePct = totalMetricSum > 0 ? (item.metricValue / totalMetricSum) * 100 : 0;
      const itemPercentile = ((index + 1) / totalCount) * 100;
      const rank = index + 1;

      // Détermination rigoureuse de la classe ABC selon la Loi de Pareto 20/80
      // Classe A : Top ~20% des références cumulant ~80% de la métrique
      // Classe B : ~30% suivants cumulant les 15% suivants (80% à 95%)
      // Classe C : ~50% restants cumulant les 5% restants (95% à 100%)
      let abcClass: 'A' | 'B' | 'C' = 'C';
      if (cumulatedSharePct <= 80 || index < Math.max(1, Math.ceil(totalCount * 0.20))) {
        abcClass = 'A';
      } else if (cumulatedSharePct <= 95 || index < Math.max(2, Math.ceil(totalCount * 0.50))) {
        abcClass = 'B';
      } else {
        abcClass = 'C';
      }

      return {
        ...item,
        rank,
        individualSharePct: Number(individualSharePct.toFixed(2)),
        cumulatedMetricValue: runningCumul,
        cumulatedSharePct: Number(cumulatedSharePct.toFixed(1)),
        itemPercentile: Number(itemPercentile.toFixed(1)),
        abcClass
      };
    });

    const classAItems = enriched.filter(i => i.abcClass === 'A');
    const classBItems = enriched.filter(i => i.abcClass === 'B');
    const classCItems = enriched.filter(i => i.abcClass === 'C');

    const classAValue = classAItems.reduce((s, i) => s + i.metricValue, 0);
    const classBValue = classBItems.reduce((s, i) => s + i.metricValue, 0);
    const classCValue = classCItems.reduce((s, i) => s + i.metricValue, 0);

    const classAPct = totalMetricSum > 0 ? Number(((classAValue / totalMetricSum) * 100).toFixed(1)) : 0;
    const classBPct = totalMetricSum > 0 ? Number(((classBValue / totalMetricSum) * 100).toFixed(1)) : 0;
    const classCPct = totalMetricSum > 0 ? Number(((classCValue / totalMetricSum) * 100).toFixed(1)) : 0;

    // Part exacte du Top 20% en nombre de références
    const cutoff20Index = Math.max(1, Math.floor(totalCount * 0.2));
    const top20Slice = enriched.slice(0, cutoff20Index);
    const exact20PercentileShare = top20Slice.length > 0 
      ? Number(top20Slice[top20Slice.length - 1].cumulatedSharePct.toFixed(1)) 
      : 0;

    // Moyenne de couverture en jours pour la classe A
    const currentClassADaysAvg = classAItems.length > 0
      ? Math.round(classAItems.reduce((s, i) => s + i.daysCoverage, 0) / classAItems.length)
      : 25;

    // Simulation Trésorerie : Si on passe la couverture de classe A à `targetDaysCoverage` jours
    const classAStockValue = classAItems.reduce((s, i) => s + i.stockValueHt, 0);
    const currentAvgDays = Math.max(1, currentClassADaysAvg);
    const dailyCostOfSalesClassA = classAStockValue / currentAvgDays;
    const targetStockValue = dailyCostOfSalesClassA * targetDaysCoverage;
    const potentialCashReleased = Math.max(0, classAStockValue - targetStockValue);

    return {
      data: enriched,
      top20Items: classAItems,
      totalMetricSum,
      totalRevenue,
      totalStockValue,
      classACount: classAItems.length,
      classAValue,
      classAPct,
      classBCount: classBItems.length,
      classBValue,
      classBPct,
      classCCount: classCItems.length,
      classCValue,
      classCPct,
      exact20PercentileShare,
      currentClassADaysAvg,
      potentialCashReleased
    };
  }, [products, selectedMetric, targetDaysCoverage]);

  // Données de quantiles pour la courbe continue de Lorenz si le catalogue est très large
  const quantilesData = useMemo(() => {
    if (paretoAnalysis.data.length === 0) return [];
    
    // Génère 10 déciles (10%, 20%, 30% ... 100% des références)
    const deciles = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const totalCount = paretoAnalysis.data.length;

    return deciles.map(d => {
      const idx = Math.min(totalCount - 1, Math.floor((d / 100) * totalCount) - 1);
      const targetItem = paretoAnalysis.data[Math.max(0, idx)];
      return {
        percentile: `${d}% des Réf.`,
        percentileNum: d,
        cumulatedSharePct: targetItem ? targetItem.cumulatedSharePct : 0,
        theoreticalEquality: d, // Courbe d'égalité parfaite à 45°
        metricValue: targetItem ? targetItem.metricValue : 0,
        sampleProduct: targetItem?.name || ''
      };
    });
  }, [paretoAnalysis]);

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'revenue': return 'Chiffre d\'Affaires Annuel HT';
      case 'units': return 'Ventes Annuelles (Unités / Boîtes)';
      case 'stock_value': return 'Valeur du Stock HT (PUMP)';
      case 'margin': return 'Marge Brute Annuelle HT';
    }
  };

  const getMetricUnit = () => {
    switch (selectedMetric) {
      case 'units': return 'boîtes';
      default: return '€ HT';
    }
  };

  const formatMetricValue = (val: number) => {
    switch (selectedMetric) {
      case 'units': return `${formatNumber(Math.round(val))} btes`;
      default: return formatCurrency(val);
    }
  };

  // Trouver l'indice de séparation pour la ligne de repère des 20%
  const index20Percent = Math.max(1, Math.ceil(paretoAnalysis.data.length * 0.2));
  const productAt20Percent = paretoAnalysis.data[index20Percent - 1]?.shortName || '';

  const handleExportPareto = () => {
    const exportData = paretoAnalysis.data.map(p => ({
      'Rang Pareto': p.rank,
      'Classe ABC': p.abcClass,
      'Code CIP': p.cip,
      'Désignation': p.name,
      'DCI': p.dci || '',
      'Laboratoire': p.laboratory,
      'Catégorie': p.category,
      'Quantité en Stock': p.stockQty,
      'PUMP HT (€)': p.pump,
      'Prix Vente TTC (€)': p.publicPriceTtc,
      'Chiffre Affaires Annuel HT (€)': Math.round(p.annualRevenueHt),
      'Ventes Annuelles (Unités)': p.annualUnitsSold,
      'Valeur Stock HT (€)': Math.round(p.stockValueHt),
      'Marge Annuelle HT (€)': Math.round(p.annualMarginHt),
      'Part Individuelle (%)': p.individualSharePct,
      'Cumul Pareto (%)': p.cumulatedSharePct,
      'Percentile Catalogue (%)': p.itemPercentile,
      'Couverture Stock (Jours)': p.daysCoverage,
      'Frigo 2-8°C': p.isRefrigerated ? 'Oui' : 'Non'
    }));
    exportToCsv(exportData, `analyse_pareto_abc_${selectedMetric}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Loi de Pareto (ABC) & Courbe de Lorenz
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-500/20">
                Règle 20/80
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Visualisation des <strong>20% de références clés</strong> qui génèrent <strong>80% de la valeur, du chiffre d'affaires et des rotations</strong> de l'officine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode switch */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setDisplayMode('individual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  displayMode === 'individual'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Par Référence
              </button>
              <button
                onClick={() => setDisplayMode('quantiles')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  displayMode === 'quantiles'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Courbe Lorenz (Déciles)
              </button>
            </div>

            <button
              onClick={handleExportPareto}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>

        </div>

        {/* Metric Selector Tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Analyser selon :</span>
          </span>

          <button
            onClick={() => setSelectedMetric('revenue')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedMetric === 'revenue'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Euro className="w-3.5 h-3.5" />
            <span>Chiffre d'Affaires Annuel (€)</span>
          </button>

          <button
            onClick={() => setSelectedMetric('units')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedMetric === 'units'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Rotation & Sorties (Boîtes)</span>
          </button>

          <button
            onClick={() => setSelectedMetric('stock_value')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedMetric === 'stock_value'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Capital Stock Immobilisé (€ PUMP)</span>
          </button>

          <button
            onClick={() => setSelectedMetric('margin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedMetric === 'margin'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Marge Brute Annuelle (€)</span>
          </button>
        </div>
      </div>

      {/* Highlights & 3 Pillars Cards (Classe A / B / C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Classe A (Top 20%) */}
        <div 
          onClick={() => onFilterPreset && onFilterPreset('class_a')}
          className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 rounded-3xl p-5 border-2 border-emerald-500/40 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
              <Zap className="w-3.5 h-3.5" />
              Classe A • Règle d'Or (Top 20%)
            </span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
              {paretoAnalysis.classAPct}% de la valeur
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatMetricValue(paretoAnalysis.classAValue)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Concentré sur <strong>{paretoAnalysis.classACount} références</strong> seulement ({Number(((paretoAnalysis.classACount / Math.max(1, paretoAnalysis.data.length)) * 100).toFixed(1))}% du catalogue).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              🎯 Stratégie : Flux tendu J+1 / Zéro rupture
            </span>
            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Classe B (Intermédiaire 30%) */}
        <div 
          onClick={() => onFilterPreset && onFilterPreset('class_b')}
          className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 dark:from-blue-950/40 dark:via-slate-900 dark:to-blue-950/20 rounded-3xl p-5 border border-blue-200 dark:border-blue-800/60 shadow-xs relative overflow-hidden group cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-black">
              Classe B • Réguliers (30%)
            </span>
            <span className="text-xl font-black text-blue-700 dark:text-blue-400">
              {paretoAnalysis.classBPct}%
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatMetricValue(paretoAnalysis.classBValue)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Réparti sur <strong>{paretoAnalysis.classBCount} références</strong> intermédiaires ({Number(((paretoAnalysis.classBCount / Math.max(1, paretoAnalysis.data.length)) * 100).toFixed(1))}%).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-800 dark:text-blue-300">
              📦 Stratégie : Réassort hebdo automatique
            </span>
            <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Classe C (Fond de rayon 50%) */}
        <div 
          onClick={() => onFilterPreset && onFilterPreset('class_c')}
          className="bg-gradient-to-br from-slate-50 via-white to-slate-50/30 dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-800/20 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden group cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-600 text-white text-xs font-black">
              Classe C • Longue Traîne (50%)
            </span>
            <span className="text-xl font-black text-slate-600 dark:text-slate-400">
              {paretoAnalysis.classCPct}%
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatMetricValue(paretoAnalysis.classCValue)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Dispersé sur <strong>{paretoAnalysis.classCCount} références</strong> de fond ({Number(((paretoAnalysis.classCCount / Math.max(1, paretoAnalysis.data.length)) * 100).toFixed(1))}%).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ⚠️ Stratégie : Stock mini 1 ou à la commande
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </div>
        </div>

      </div>

      {/* The Visual Recharts Pareto / Lorenz Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Diagramme de Pareto & Courbe Cumulative de Lorenz</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                {getMetricLabel()}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Barres = Contribution individuelle par référence • Courbe orange = % Cumulé (0% à 100%)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-600" />
              <span className="text-slate-700 dark:text-slate-300">Classe A (Top 20%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-slate-700 dark:text-slate-300">Classe B</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">Classe C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-amber-500 rounded" />
              <span className="text-amber-600 dark:text-amber-400 font-bold">Courbe Lorenz (%)</span>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {displayMode === 'individual' ? (
              <ComposedChart
                data={paretoAnalysis.data}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                
                {/* X Axis (Product Names / Ranks) */}
                <XAxis 
                  dataKey="shortName" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={50}
                />
                
                {/* Left Y Axis (Individual Metric Value) */}
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => selectedMetric === 'units' ? `${formatNumber(val)}` : `${Math.round(val / 1000)}k€`}
                />

                {/* Right Y Axis (Cumulative Percentage 0 - 100%) */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 95, 100]}
                  tick={{ fontSize: 11, fill: '#f59e0b', fontWeight: 'bold' }}
                  tickFormatter={(val) => `${val}%`}
                />

                {/* Seuil 80% Pareto (Ligne Repère d'or) */}
                <ReferenceLine 
                  yAxisId="right" 
                  y={80} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ 
                    value: '★ Seuil 80% Pareto', 
                    fill: '#f59e0b', 
                    position: 'insideTopRight',
                    fontSize: 11,
                    fontWeight: 'bold'
                  }} 
                />

                {/* Seuil 95% Pareto (Frontière Classe B/C) */}
                <ReferenceLine 
                  yAxisId="right" 
                  y={95} 
                  stroke="#94a3b8" 
                  strokeDasharray="2 2" 
                  strokeWidth={1}
                  label={{ 
                    value: 'Seuil 95% (Classe B/C)', 
                    fill: '#94a3b8', 
                    position: 'insideTopLeft',
                    fontSize: 10
                  }} 
                />

                {/* Tooltip interactif */}
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload as ParetoDataPoint;
                      return (
                        <div className="bg-slate-900/95 text-white p-4 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md max-w-sm text-xs space-y-2">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-700 gap-3">
                            <span className="font-mono font-bold text-slate-400">
                              Rang #{d.rank} / {paretoAnalysis.data.length}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                              d.abcClass === 'A' ? 'bg-emerald-500 text-white' :
                              d.abcClass === 'B' ? 'bg-blue-500 text-white' :
                              'bg-slate-600 text-slate-200'
                            }`}>
                              Classe {d.abcClass}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-sm text-emerald-400 leading-tight">
                              {d.name}
                            </div>
                            {d.dci && <div className="text-[11px] text-slate-300 italic font-serif">DCI: {d.dci}</div>}
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              CIP: {d.cip} • {d.laboratory}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                            <div className="bg-slate-800/80 p-2 rounded-xl">
                              <span className="text-slate-400 block text-[10px]">Valeur ({getMetricUnit()})</span>
                              <span className="font-bold text-white font-mono text-xs">
                                {formatMetricValue(d.metricValue)}
                              </span>
                              <span className="text-[10px] text-emerald-400 block">
                                ({d.individualSharePct}% du total)
                              </span>
                            </div>

                            <div className="bg-slate-800/80 p-2 rounded-xl">
                              <span className="text-slate-400 block text-[10px]">Cumul Pareto</span>
                              <span className="font-black text-amber-400 font-mono text-sm">
                                {d.cumulatedSharePct}%
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                à {d.itemPercentile}% des réf.
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                            <strong>Stock actuel :</strong> {d.stockQty} boîtes ({d.daysCoverage} jours de couverture)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Histogram Bars (Individual Metric) */}
                <Bar 
                  yAxisId="left" 
                  dataKey="metricValue" 
                  name={getMetricLabel()}
                  radius={[6, 6, 0, 0]}
                >
                  {paretoAnalysis.data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.abcClass === 'A' ? '#059669' : 
                        entry.abcClass === 'B' ? '#3b82f6' : '#94a3b8'
                      } 
                    />
                  ))}
                </Bar>

                {/* Lorenz Line (Cumulative Share %) */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="cumulatedSharePct" 
                  name="Cumul Lorenz (%)" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
                />

              </ComposedChart>
            ) : (
              /* Quantiles / Deciles Continuous Lorenz Curve */
              <ComposedChart
                data={quantilesData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                
                <XAxis 
                  dataKey="percentile" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                
                <YAxis 
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tick={{ fontSize: 11, fill: '#f59e0b', fontWeight: 'bold' }}
                  tickFormatter={(val) => `${val}%`}
                />

                <Tooltip 
                  formatter={(val: any, name: string) => [
                    `${val}%`,
                    name === 'cumulatedSharePct' ? 'Courbe Réelle de Lorenz (Officine)' : 'Diagonale d\'Égalité Parfaite'
                  ]}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem', fontSize: '12px' }}
                />

                {/* Ligne 80% */}
                <ReferenceLine 
                  y={80} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ value: 'Seuil 80%', fill: '#f59e0b', position: 'insideTopRight', fontSize: 11 }} 
                />

                {/* Diagonale d'égalité parfaite */}
                <Line 
                  type="linear" 
                  dataKey="theoreticalEquality" 
                  name="Égalité Théorique (Non-Pareto)" 
                  stroke="#94a3b8" 
                  strokeDasharray="3 3" 
                  strokeWidth={1.5}
                  dot={false}
                />

                {/* Courbe réelle de Lorenz */}
                <Line 
                  type="monotone" 
                  dataKey="cumulatedSharePct" 
                  name="Courbe de Lorenz Observée (%)" 
                  stroke="#059669" 
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Explanatory footer note */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Interprétation Officinale :</strong> Les 20% premières références représentent <strong>{paretoAnalysis.classAPct}%</strong> du {getMetricLabel().toLowerCase()}. Une gestion quotidienne en flux tendu sur ces {paretoAnalysis.classACount} produits garantit 0 rupture client.
            </span>
          </div>

          {onOpenAdvancedSearch && (
            <button
              onClick={onOpenAdvancedSearch}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Filtrer les classes dans la Recherche</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Simulator: Cash Liberation on Class A Stock Optimization */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-indigo-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Simulateur d'Optimisation du BFR sur les 20% de Classe A
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              En optimisant le cadencement de commande des {paretoAnalysis.classACount} références phares (commandes quotidiennes automatisées via le grossiste), vous réduisez les stocks tampons sans risque de rupture.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="text-xs text-slate-300">
                Couverture actuelle Classe A : <strong className="text-white font-mono">{paretoAnalysis.currentClassADaysAvg} jours</strong>
              </div>
              <div className="text-xs text-slate-300">
                Valeur stock Classe A : <strong className="text-emerald-400 font-mono">{formatCurrency(paretoAnalysis.top20Items.reduce((s, i) => s + i.stockValueHt, 0))}</strong>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-indigo-500/30 shadow-inner flex flex-col justify-between gap-4 min-w-[280px]">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Objectif de couverture cible :</span>
                <span className="font-mono font-black text-indigo-300 text-sm">{targetDaysCoverage} jours</span>
              </div>
              
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={targetDaysCoverage}
                onChange={(e) => setTargetDaysCoverage(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5j (Flux très tendu)</span>
                <span>10j (Idéal grossiste)</span>
                <span>25j (Sécuritaire)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                  Trésorerie Nette Libérée
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                  +{formatCurrency(paretoAnalysis.potentialCashReleased)}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Top 20% Strategic Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Détail du Top 20% • Les {paretoAnalysis.classACount} Références Stratégiques (Classe A)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ces références concentrent {paretoAnalysis.classAPct}% de la métrique sélectionnée
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold">
            Cumul : {paretoAnalysis.classAPct}% de l'activité
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">Rang</th>
                <th className="py-3 px-4">Produit & DCI</th>
                <th className="py-3 px-3">Laboratoire</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-right">CA Annuel HT</th>
                <th className="py-3 px-3 text-right">Valeur Stock HT</th>
                <th className="py-3 px-3 text-right">Part (%)</th>
                <th className="py-3 px-3 text-right">Cumul (%)</th>
                <th className="py-3 px-3 text-center">Couverture</th>
                <th className="py-3 px-3 text-center">Cadencement Recommandé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paretoAnalysis.top20Items.map((prod) => (
                <tr 
                  key={prod.id} 
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  onClick={() => onSelectProduct && onSelectProduct(prod.id)}
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">
                    #{prod.rank}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {prod.name}
                      {prod.isRefrigerated && (
                        <span title="Chaîne du froid 2-8°C" className="text-sky-500 font-bold text-[10px]">
                          ❄️
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      CIP: {prod.cip} {prod.dci && `• ${prod.dci}`}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {prod.laboratory}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {prod.stockQty} btes
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(prod.annualRevenueHt)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(prod.stockValueHt)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-600 dark:text-slate-400">
                    {prod.individualSharePct}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                    {prod.cumulatedSharePct}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.daysCoverage > 45 
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {prod.daysCoverage} jours
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      Flux tendu J+1
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
