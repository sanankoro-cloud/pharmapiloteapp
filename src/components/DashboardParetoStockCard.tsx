import React, { useState, useMemo } from 'react';
import { 
  PieChart as PieIcon, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  Package, 
  Euro, 
  Boxes, 
  Layers, 
  Info, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { ProductStock } from '../types/pharmacy';
import { MOCK_PRODUCTS } from '../data/mockPharmacyData';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export interface DashboardParetoStockCardProps {
  products?: ProductStock[];
  className?: string;
  onNavigateTab?: (tab: string) => void;
}

type ParetoMetricType = 'stock_value' | 'annual_revenue' | 'units_qty';

interface AbcClassSummary {
  key: 'A' | 'B' | 'C';
  label: string;
  subLabel: string;
  color: string;
  gradientColors: [string, string];
  badgeBg: string;
  badgeText: string;
  itemCount: number;
  pctItems: number;
  metricValue: number;
  pctMetric: number;
  stockValueHt: number;
  pctStockValue: number;
  annualRevenueHt: number;
  unitsQty: number;
  managementRule: string;
  topExamples: string[];
}

export const DashboardParetoStockCard: React.FC<DashboardParetoStockCardProps> = ({
  products = [],
  className = '',
  onNavigateTab
}) => {
  const [selectedMetric, setSelectedMetric] = useState<ParetoMetricType>('stock_value');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isBlankState = !products || products.length === 0;

  // Compute Pareto ABC classification
  const paretoAnalysis = useMemo(() => {
    if (isBlankState) {
      const emptyClassesSummary: AbcClassSummary[] = [
        {
          key: 'A',
          label: 'Classe A (Majeure)',
          subLabel: 'Top ~20% des références',
          color: '#059669',
          gradientColors: ['#10b981', '#059669'],
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80',
          badgeText: 'text-emerald-700 dark:text-emerald-300',
          itemCount: 0,
          pctItems: 0,
          metricValue: 0,
          pctMetric: 0,
          stockValueHt: 0,
          pctStockValue: 0,
          annualRevenueHt: 0,
          unitsQty: 0,
          managementRule: 'Réapprovisionnement biquotidien grossiste • Zéro rupture • Surveillance DLUO stricte',
          topExamples: []
        },
        {
          key: 'B',
          label: 'Classe B (Intermédiaire)',
          subLabel: '~30% des références',
          color: '#f59e0b',
          gradientColors: ['#fbbf24', '#f59e0b'],
          badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80',
          badgeText: 'text-amber-700 dark:text-amber-300',
          itemCount: 0,
          pctItems: 0,
          metricValue: 0,
          pctMetric: 0,
          stockValueHt: 0,
          pctStockValue: 0,
          annualRevenueHt: 0,
          unitsQty: 0,
          managementRule: 'Commandes groupées directes laboratoire • Optimisation du franco & des remises',
          topExamples: []
        },
        {
          key: 'C',
          label: 'Classe C (Longue Traîne)',
          subLabel: '~50% des références',
          color: '#64748b',
          gradientColors: ['#94a3b8', '#64748b'],
          badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          badgeText: 'text-slate-700 dark:text-slate-300',
          itemCount: 0,
          pctItems: 0,
          metricValue: 0,
          pctMetric: 0,
          stockValueHt: 0,
          pctStockValue: 0,
          annualRevenueHt: 0,
          unitsQty: 0,
          managementRule: 'Commande unitaire à la demande • Déstockage des dormants pour libérer du BFR',
          topExamples: []
        }
      ];

      return {
        classesSummary: emptyClassesSummary,
        pieChartData: [],
        totalMetric: 0,
        totalStockValue: 0,
        totalRevenue: 0,
        totalUnits: 0,
        totalCount: 0,
        top20Ratio: '0% des produits (Stock réinitialisé à zéro)'
      };
    }

    const rawList = products;

    // Calculate individual metrics for each product
    const enriched = rawList.map(p => {
      const stockVal = p.stockQty * p.pump;
      const monthlyQty = p.monthlySalesQty || Math.max(1, Math.round(p.stockQty * 0.75 + (p.minThreshold * 1.5)));
      const annualRev = monthlyQty * 12 * (p.publicPriceTtc / (1 + (p.tva || 2.1) / 100));
      const units = p.stockQty;

      let metricVal = stockVal;
      if (selectedMetric === 'annual_revenue') metricVal = annualRev;
      else if (selectedMetric === 'units_qty') metricVal = units;

      return {
        ...p,
        stockVal,
        annualRev,
        units,
        metricVal
      };
    });

    // Sort descending by selected metric
    const sorted = [...enriched].sort((a, b) => b.metricVal - a.metricVal);
    const totalMetric = sorted.reduce((sum, item) => sum + item.metricVal, 0);
    const totalStockValue = sorted.reduce((sum, item) => sum + item.stockVal, 0);
    const totalRevenue = sorted.reduce((sum, item) => sum + item.annualRev, 0);
    const totalUnits = sorted.reduce((sum, item) => sum + item.units, 0);
    const totalCount = sorted.length;

    let cumulated = 0;
    const classified = sorted.map((p, index) => {
      cumulated += p.metricVal;
      const cumulatedPct = totalMetric > 0 ? (cumulated / totalMetric) * 100 : 0;
      const itemIndexPct = totalCount > 0 ? ((index + 1) / totalCount) * 100 : 0;

      let abcClass: 'A' | 'B' | 'C' = 'C';
      // Classic Pareto: A ~ 80% of value (or top 20% items), B ~ next 15% (up to 95%), C ~ last 5%
      if (cumulatedPct <= 80 || itemIndexPct <= 20) {
        abcClass = 'A';
      } else if (cumulatedPct <= 95 || itemIndexPct <= 50) {
        abcClass = 'B';
      } else {
        abcClass = 'C';
      }

      return {
        ...p,
        abcClass,
        cumulatedPct
      };
    });

    // Group by Class A, B, C
    const classA = classified.filter(p => p.abcClass === 'A');
    const classB = classified.filter(p => p.abcClass === 'B');
    const classC = classified.filter(p => p.abcClass === 'C');

    const sumMetricA = classA.reduce((s, p) => s + p.metricVal, 0);
    const sumMetricB = classB.reduce((s, p) => s + p.metricVal, 0);
    const sumMetricC = classC.reduce((s, p) => s + p.metricVal, 0);

    const sumValA = classA.reduce((s, p) => s + p.stockVal, 0);
    const sumValB = classB.reduce((s, p) => s + p.stockVal, 0);
    const sumValC = classC.reduce((s, p) => s + p.stockVal, 0);

    const sumRevA = classA.reduce((s, p) => s + p.annualRev, 0);
    const sumRevB = classB.reduce((s, p) => s + p.annualRev, 0);
    const sumRevC = classC.reduce((s, p) => s + p.annualRev, 0);

    const sumUnitsA = classA.reduce((s, p) => s + p.units, 0);
    const sumUnitsB = classB.reduce((s, p) => s + p.units, 0);
    const sumUnitsC = classC.reduce((s, p) => s + p.units, 0);

    const classesSummary: AbcClassSummary[] = [
      {
        key: 'A',
        label: 'Classe A (Majeure)',
        subLabel: 'Top ~20% des références',
        color: '#059669', // Emerald
        gradientColors: ['#10b981', '#059669'],
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        itemCount: classA.length,
        pctItems: totalCount > 0 ? Number(((classA.length / totalCount) * 100).toFixed(1)) : 0,
        metricValue: sumMetricA,
        pctMetric: totalMetric > 0 ? Number(((sumMetricA / totalMetric) * 100).toFixed(1)) : 0,
        stockValueHt: sumValA,
        pctStockValue: totalStockValue > 0 ? Number(((sumValA / totalStockValue) * 100).toFixed(1)) : 0,
        annualRevenueHt: sumRevA,
        unitsQty: sumUnitsA,
        managementRule: 'Réapprovisionnement biquotidien grossiste • Zéro rupture • Surveillance DLUO stricte',
        topExamples: classA.slice(0, 3).map(p => p.name)
      },
      {
        key: 'B',
        label: 'Classe B (Intermédiaire)',
        subLabel: '~30% des références',
        color: '#f59e0b', // Amber
        gradientColors: ['#fbbf24', '#f59e0b'],
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80',
        badgeText: 'text-amber-700 dark:text-amber-300',
        itemCount: classB.length,
        pctItems: totalCount > 0 ? Number(((classB.length / totalCount) * 100).toFixed(1)) : 0,
        metricValue: sumMetricB,
        pctMetric: totalMetric > 0 ? Number(((sumMetricB / totalMetric) * 100).toFixed(1)) : 0,
        stockValueHt: sumValB,
        pctStockValue: totalStockValue > 0 ? Number(((sumValB / totalStockValue) * 100).toFixed(1)) : 0,
        annualRevenueHt: sumRevB,
        unitsQty: sumUnitsB,
        managementRule: 'Commandes groupées directes laboratoire • Optimisation du franco & des remises',
        topExamples: classB.slice(0, 3).map(p => p.name)
      },
      {
        key: 'C',
        label: 'Classe C (Longue Traîne)',
        subLabel: '~50% des références',
        color: '#64748b', // Slate
        gradientColors: ['#94a3b8', '#64748b'],
        badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        badgeText: 'text-slate-700 dark:text-slate-300',
        itemCount: classC.length,
        pctItems: totalCount > 0 ? Number(((classC.length / totalCount) * 100).toFixed(1)) : 0,
        metricValue: sumMetricC,
        pctMetric: totalMetric > 0 ? Number(((sumMetricC / totalMetric) * 100).toFixed(1)) : 0,
        stockValueHt: sumValC,
        pctStockValue: totalStockValue > 0 ? Number(((sumValC / totalStockValue) * 100).toFixed(1)) : 0,
        annualRevenueHt: sumRevC,
        unitsQty: sumUnitsC,
        managementRule: 'Commande unitaire à la demande • Déstockage des dormants pour libérer du BFR',
        topExamples: classC.slice(0, 3).map(p => p.name)
      }
    ];

    // Data formatted for Recharts PieChart
    const pieChartData = classesSummary.map(cls => ({
      name: `Classe ${cls.key}`,
      key: cls.key,
      value: cls.metricValue,
      pctMetric: cls.pctMetric,
      stockValueHt: cls.stockValueHt,
      pctStockValue: cls.pctStockValue,
      itemCount: cls.itemCount,
      pctItems: cls.pctItems,
      color: cls.color,
      managementRule: cls.managementRule
    }));

    return {
      classesSummary,
      pieChartData,
      totalMetric,
      totalStockValue,
      totalRevenue,
      totalUnits,
      totalCount,
      top20Ratio: classA.length > 0 && totalMetric > 0 
        ? `${classesSummary[0].pctItems}% des produits concentrent ${classesSummary[0].pctStockValue}% de la valeur`
        : 'Loi 20/80 appliquée'
    };
  }, [products, selectedMetric, isBlankState]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden ${className}`}>
      
      {/* Header & Metric Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <PieIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Segmentation Stratégique 20/80
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {paretoAnalysis.totalCount} références cataloguées
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Analyse Pareto du Stock (Classes A, B, C)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
            Répartition du capital immobilisé en officine selon le principe de Pareto pour calibrer les cadences d'achat et sécuriser le BFR.
          </p>
        </div>

        {/* Metric Selector Toggles */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedMetric('stock_value')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedMetric === 'stock_value'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Euro className="w-3.5 h-3.5" />
              <span>Valeur Stock HT</span>
            </button>
            <button
              onClick={() => setSelectedMetric('annual_revenue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedMetric === 'annual_revenue'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>CA Annuel HT</span>
            </button>
            <button
              onClick={() => setSelectedMetric('units_qty')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedMetric === 'units_qty'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Unités en Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Circular Chart on Left + 3 Class Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-4">
        
        {/* Left: Recharts Donut Pie Chart (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
          
          <div className="h-64 sm:h-72 w-full relative flex items-center justify-center">
            {isBlankState ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-24 h-24 rounded-full border-3 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mb-2.5">
                  <Package className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="text-sm font-black text-slate-800 dark:text-slate-200">
                  0,00 € • 0 réf.
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Stock réinitialisé à blanc. Importez vos données de gestion d'officine pour générer la classification ABC.
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paretoAnalysis.pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={104}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      stroke="none"
                    >
                      {paretoAnalysis.pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                          style={{
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            filter: activeIndex === index ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' : 'none'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 max-w-xs animate-fadeIn">
                              <div className="flex items-center justify-between gap-2 font-bold mb-1 border-b border-slate-700 pb-1">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                  {data.name}
                                </span>
                                <span className="text-emerald-400 font-mono">{data.pctMetric}% de la valeur</span>
                              </div>
                              <div className="space-y-1 text-slate-300">
                                <div className="flex justify-between">
                                  <span>Montant :</span>
                                  <span className="font-bold text-white font-mono">{formatCurrency(data.stockValueHt)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Catalogue :</span>
                                  <span className="font-bold text-white font-mono">{data.itemCount} réfs ({data.pctItems}%)</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1 italic border-t border-slate-800 pt-1">
                                  {data.managementRule}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centered Donut Summary Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {selectedMetric === 'stock_value' ? 'Valeur Stock HT' : selectedMetric === 'annual_revenue' ? 'CA Annuel HT' : 'Unités Totales'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight my-0.5">
                    {selectedMetric === 'units_qty' ? formatNumber(paretoAnalysis.totalUnits) : formatCurrency(paretoAnalysis.totalStockValue)}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Loi 20/80
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Concentration Index Banner */}
          <div className="w-full mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-center">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Ratio de Concentration :
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              🎯 <strong className="text-emerald-600 dark:text-emerald-400">{paretoAnalysis.top20Ratio}</strong>
            </div>
          </div>

        </div>

        {/* Right: Detailed 3 Class Panels (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          
          {paretoAnalysis.classesSummary.map((cls) => {
            const isHovered = activeIndex !== null && paretoAnalysis.pieChartData[activeIndex]?.key === cls.key;

            return (
              <div
                key={cls.key}
                onMouseEnter={() => {
                  const idx = paretoAnalysis.pieChartData.findIndex(item => item.key === cls.key);
                  if (idx !== -1) setActiveIndex(idx);
                }}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${
                  isHovered
                    ? 'ring-2 ring-emerald-500/50 shadow-md bg-white dark:bg-slate-800 border-emerald-400 dark:border-emerald-600 scale-[1.01]'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  
                  {/* Class Badge & Label */}
                  <div className="flex items-center gap-2.5">
                    <span 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shadow-xs shrink-0`}
                      style={{ backgroundColor: cls.color }}
                    >
                      {cls.key}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {cls.label}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                          ({cls.itemCount} réfs • {cls.pctItems}% catalogue)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cls.managementRule}
                      </p>
                    </div>
                  </div>

                  {/* Financial Values */}
                  <div className="text-right sm:shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between gap-1 border-t sm:border-t-0 pt-1.5 sm:pt-0 border-slate-100 dark:border-slate-700">
                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(cls.stockValueHt)}
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md text-white font-mono shadow-2xs" style={{ backgroundColor: cls.color }}>
                      {cls.pctStockValue}% du stock
                    </span>
                  </div>

                </div>

                {/* Micro Progress Bar */}
                <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${cls.pctStockValue}%`, backgroundColor: cls.color }} 
                  />
                </div>

                {/* Top Examples list if available */}
                {cls.topExamples.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">Exemples :</span>
                    <span className="truncate italic">
                      {cls.topExamples.join(', ')}
                    </span>
                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>

      {/* Footer Navigation link to full Stock & Pareto Module */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            La classe A requiert une disponibilité absolue (taux de service 99%), tandis que la classe C doit être contingentée pour préserver la trésorerie.
          </span>
        </div>

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('stocks')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 self-start sm:self-auto cursor-pointer shrink-0 transition bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800"
          >
            <span>Ouvrir l'Analyse Pareto & Simulateur de Couverture</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
