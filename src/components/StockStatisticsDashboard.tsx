import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  AlertTriangle, 
  Boxes, 
  Euro, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Thermometer, 
  Lock, 
  ChevronRight,
  Filter,
  Download,
  Flame,
  Moon,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { ProductStock } from '../types/pharmacy';
import { computeStockAnalytics, CATEGORY_LABELS } from '../utils/stockAnalyticsEngine';
import { formatCurrency, formatNumber, exportToCsv } from '../utils/formatters';
import { StockParetoChart } from './StockParetoChart';

interface StockStatisticsDashboardProps {
  products: ProductStock[];
  onSelectFilterPreset?: (filterKey: string) => void;
  onOpenAdvancedSearch?: () => void;
}

export const StockStatisticsDashboard: React.FC<StockStatisticsDashboardProps> = ({
  products,
  onSelectFilterPreset,
  onOpenAdvancedSearch
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'pareto' | 'overview' | 'categories' | 'expiries'>('pareto');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'value' | 'units' | 'margin'>('value');
  const [showInsightDetail, setShowInsightDetail] = useState<string | null>(null);

  const analytics = useMemo(() => computeStockAnalytics(products), [products]);

  // Données pour le graphique Pareto ABC
  const abcChartData = [
    { 
      name: 'Classe A (Top 20%)', 
      value: analytics.abcStats.classA.valueHt, 
      pct: analytics.abcStats.classA.pctValue,
      items: analytics.abcStats.classA.count,
      color: '#059669', // Emerald
      fill: '#059669'
    },
    { 
      name: 'Classe B (15%)', 
      value: analytics.abcStats.classB.valueHt, 
      pct: analytics.abcStats.classB.pctValue,
      items: analytics.abcStats.classB.count,
      color: '#3b82f6', // Blue
      fill: '#3b82f6'
    },
    { 
      name: 'Classe C (5%)', 
      value: analytics.abcStats.classC.valueHt, 
      pct: analytics.abcStats.classC.pctValue,
      items: analytics.abcStats.classC.count,
      color: '#94a3b8', // Slate
      fill: '#94a3b8'
    }
  ];

  // Données pour le graphique de rotation et couverture
  const turnoverChartData = [
    { name: '< 20 jours (Rapide)', count: analytics.turnoverStats.fastMoversCount, fill: '#10b981' },
    { name: '20 - 45 j (Optimal)', count: analytics.turnoverStats.optimalMoversCount, fill: '#059669' },
    { name: '45 - 75 j (Modéré)', count: analytics.turnoverStats.slowMoversCount, fill: '#f59e0b' },
    { name: '> 75 j (Surstock/Dormant)', count: analytics.turnoverStats.dormantStockCount, fill: '#ef4444' }
  ];

  // Données pour les catégories
  const categoryChartData = analytics.categoryStats.map(c => ({
    name: c.categoryLabel.split(' ')[0],
    fullName: c.categoryLabel,
    valeurHt: Math.round(c.totalValuePumpHt),
    margeHt: Math.round(c.potentialMarginHt),
    units: c.totalUnits,
    margePct: c.marginRatePct,
    tva: c.tvaRate,
    color: c.color
  }));

  // Données pour les horizons de péremption
  const expiryPyramidData = [
    { range: '< 30 jours (Critique)', count: analytics.expiryRiskStats.under30DaysCount, valueHt: analytics.expiryRiskStats.under30DaysValueHt, fill: '#e11d48' },
    { range: '31 - 60 jours (Urgent)', count: analytics.expiryRiskStats.under60DaysCount, valueHt: analytics.expiryRiskStats.under60DaysValueHt, fill: '#f59e0b' },
    { range: '61 - 90 jours (Surveillance)', count: analytics.expiryRiskStats.under90DaysCount, valueHt: analytics.expiryRiskStats.under90DaysValueHt, fill: '#3b82f6' },
    { range: '> 90 jours (Conforme)', count: analytics.expiryRiskStats.safeCount, valueHt: analytics.expiryRiskStats.safeValueHt, fill: '#10b981' }
  ];

  const handleExportStats = () => {
    const data = analytics.enrichedProducts.map(p => ({
      'Code CIP': p.cip,
      'Désignation': p.name,
      'Laboratoire': p.laboratory,
      'Catégorie': p.category,
      'Classe ABC': p.calculatedAbcClass,
      'Quantité Stock': p.stockQty,
      'PUMP HT (€)': p.pump,
      'Valeur Stock HT (€)': p.totalValueHt,
      'Prix Public TTC (€)': p.publicPriceTtc,
      'Marge Brute HT (€)': p.grossMarginHt,
      'Taux Marge (%)': p.marginRatePct,
      'Ventes Mensuelles (est.)': p.monthlySalesQty || Math.round(p.stockQty * 0.75),
      'Couverture (Jours)': p.calculatedDaysCoverage,
      'Rotation Annuelle': p.annualTurnoverRate,
      'Stock Dormant': p.isDormantStock ? 'Oui' : 'Non',
      'Péremption': p.expiryDate,
      'Jours Restants': p.daysUntilExpiry,
      'Frigo 2-8°C': p.isRefrigerated ? 'Oui' : 'Non',
      'Emplacement': p.location
    }));
    exportToCsv(data, 'statistiques_stock_officine_abc');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Tableau de Bord Statistique & Analyse ABC du Stock
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold border border-emerald-400/30">
              {analytics.totalSkus} Références actives
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Analyse de Pareto (20/80), rotation des stocks (DIO), capitaux immobilisés en surstock et valorisation PUMP par famille officinale.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenAdvancedSearch && (
            <button
              onClick={onOpenAdvancedSearch}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>Recherche Avancée Multi-Critères</span>
            </button>
          )}

          <button
            onClick={handleExportStats}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Rapport Stock</span>
          </button>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveMainTab('pareto')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'pareto'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Graphique de Pareto (ABC) 20/80</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            activeMainTab === 'pareto' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
          }`}>
            Recharts 20/80
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Vue d'Ensemble & KPIs</span>
        </button>

        <button
          onClick={() => setActiveMainTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'categories'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Familles & Laboratoires</span>
        </button>

        <button
          onClick={() => setActiveMainTab('expiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeMainTab === 'expiries'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Péremptions & DLUO</span>
          {analytics.expiryRiskStats.totalAtRiskValueHt > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black">
              {formatCurrency(analytics.expiryRiskStats.totalAtRiskValueHt)}
            </span>
          )}
        </button>
      </div>

      {/* Conditionally Render Pareto View */}
      {activeMainTab === 'pareto' && (
        <StockParetoChart
          products={products}
          onFilterPreset={onSelectFilterPreset}
          onOpenAdvancedSearch={onOpenAdvancedSearch}
        />
      )}

      {/* Conditionally Render Expiries View */}
      {activeMainTab === 'expiries' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Horizons de Péremption & DLUO Officinales</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Surveillance du risque financier des lots à date courte
                </p>
              </div>
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </span>
            </div>

            <div className="space-y-4 my-4">
              {expiryPyramidData.map((item, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      {item.range}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {item.count} lot(s)
                      </span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {formatCurrency(item.valueHt)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: item.fill,
                        width: `${analytics.totalValuePumpHt > 0 ? (item.valueHt / analytics.totalValuePumpHt) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {onSelectFilterPreset && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => onSelectFilterPreset('near_expiry')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  Afficher les lots à risque dans le moteur de recherche →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditionally Render Categories View */}
      {activeMainTab === 'categories' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Category Breakdown (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Valorisation & Marge par Famille Officinale
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Poids des médicaments remboursables, OTC, parapharmacie et dispositifs médicaux
                  </p>
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setSelectedCategoryTab('value')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedCategoryTab === 'value' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Valeur HT (€)
                  </button>
                  <button
                    onClick={() => setSelectedCategoryTab('margin')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedCategoryTab === 'margin' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Marge Potentielle
                  </button>
                  <button
                    onClick={() => setSelectedCategoryTab('units')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedCategoryTab === 'units' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Volume (Boîtes)
                  </button>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip 
                      formatter={(val: any, name: any) => [
                        selectedCategoryTab === 'units' ? `${formatNumber(Number(val))} boîtes` : formatCurrency(Number(val)),
                        selectedCategoryTab === 'value' ? 'Valeur Stock HT' : selectedCategoryTab === 'margin' ? 'Marge Brute HT' : 'Nombre de boîtes'
                      ]}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload;
                        return item ? `${item.fullName} (TVA ${item.tva}%)` : label;
                      }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                    <Bar 
                      dataKey={selectedCategoryTab === 'value' ? 'valeurHt' : selectedCategoryTab === 'margin' ? 'margeHt' : 'units'} 
                      radius={[6, 6, 0, 0]}
                      fill="#059669"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                {analytics.categoryStats.slice(0, 6).map((c, i) => (
                  <div 
                    key={i} 
                    onClick={() => onSelectFilterPreset && onSelectFilterPreset(c.category)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span>{c.categoryLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(c.totalValuePumpHt)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{c.marginRatePct}% mge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Laboratories by Value (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Top Laboratoires & Fournisseurs
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Laboratoires concentrant le plus de valeur en stock
                    </p>
                  </div>
                  <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-3">
                  {analytics.topLaboratories.map((lab, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                          {idx + 1}. {lab.laboratory}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {lab.itemsCount} réf.
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(lab.totalValueHt)}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 w-9 text-right">
                            {lab.sharePct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${lab.sharePct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Concentration Top 3 : <strong>{analytics.topLaboratories.slice(0, 3).reduce((s, l) => s + l.sharePct, 0).toFixed(1)}%</strong> du stock total</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Render Overview View */}
      {activeMainTab === 'overview' && (
        <div className="space-y-6">

      {/* Strategic Insights Cards / Alerts for Pharmacist */}
      {analytics.strategicInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {analytics.strategicInsights.map((insight) => {
            const isAlert = insight.type === 'alert';
            const isWarning = insight.type === 'warning';
            const isSuccess = insight.type === 'success';

            return (
              <div 
                key={insight.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isAlert 
                    ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-100' 
                    : isWarning 
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100' 
                    : isSuccess 
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100'
                    : 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {isAlert && <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
                    {isWarning && <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
                    {isSuccess && <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                    <span>{insight.title}</span>
                  </div>
                </div>

                <p className="text-[11px] mt-1.5 opacity-90 leading-relaxed">
                  {insight.description}
                </p>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-current/10">
                  {insight.financialImpact > 0 ? (
                    <span className="text-[11px] font-bold">
                      Impact : {formatCurrency(insight.financialImpact)}
                    </span>
                  ) : <span />}

                  {onSelectFilterPreset && insight.filterTarget && (
                    <button
                      onClick={() => onSelectFilterPreset(insight.filterTarget!)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold hover:underline cursor-pointer"
                    >
                      <span>{insight.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Total Stock PUMP HT */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Valeur Stock HT (PUMP)</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(analytics.totalValuePumpHt)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formatNumber(analytics.totalUnits)} boîtes
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {analytics.totalSkus} références
            </span>
          </div>
        </div>

        {/* KPI 2: Potential Retail Value & Gross Margin */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Potentiel Vente TTC</span>
            <Euro className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
            {formatCurrency(analytics.totalRetailValueTtc)}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Marge brute : <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(analytics.totalPotentialMarginHt)}</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
              {analytics.averageMarginRatePct}%
            </span>
          </div>
        </div>

        {/* KPI 3: Turnover & DIO Coverage Days */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Rotation & Couverture</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {analytics.turnoverStats.averageDaysCoverage} jours
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              ({analytics.turnoverStats.averageTurnoverRate} rot./an)
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Taux de service : <strong className="text-emerald-600 dark:text-emerald-400">{analytics.turnoverStats.serviceRatePct}%</strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              (Objectif: &lt; 40j)
            </span>
          </div>
        </div>

        {/* KPI 4: Dormant Stock / Surstock */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Capitaux en Surstock (&gt;75j)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {formatCurrency(analytics.turnoverStats.dormantStockValueHt)}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {analytics.turnoverStats.dormantStockCount} références dormantes
            </span>
            {onSelectFilterPreset && (
              <button
                onClick={() => onSelectFilterPreset('dormant')}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Déstocker →
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Row 2: Pareto ABC Analysis + Expiry Timeline Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pareto ABC Analysis (5 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Analyse ABC / Pareto du Stock (Loi 20/80)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Répartition de la valeur financière immobilisée par segment d'importance
                </p>
              </div>
              <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <PieIcon className="w-4 h-4" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-2">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={abcChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {abcChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => formatCurrency(Number(val))}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5">
                <div 
                  onClick={() => onSelectFilterPreset && onSelectFilterPreset('class_a')}
                  className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer hover:scale-[1.02] transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      Classe A (Stratégique)
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {analytics.abcStats.classA.pctValue}% de la valeur
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    <span>{analytics.abcStats.classA.count} réf. ({analytics.abcStats.classA.pctItems}% du catalogue)</span>
                    <span className="font-mono font-bold">{formatCurrency(analytics.abcStats.classA.valueHt)}</span>
                  </div>
                </div>

                <div 
                  onClick={() => onSelectFilterPreset && onSelectFilterPreset('class_b')}
                  className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 cursor-pointer hover:scale-[1.02] transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Classe B (Intermédiaire)
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      {analytics.abcStats.classB.pctValue}% de la valeur
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    <span>{analytics.abcStats.classB.count} réf. ({analytics.abcStats.classB.pctItems}%)</span>
                    <span className="font-mono font-bold">{formatCurrency(analytics.abcStats.classB.valueHt)}</span>
                  </div>
                </div>

                <div 
                  onClick={() => onSelectFilterPreset && onSelectFilterPreset('class_c')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-[1.02] transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      Classe C (Fond de rayon)
                    </span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">
                      {analytics.abcStats.classC.pctValue}% de la valeur
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                    <span>{analytics.abcStats.classC.count} réf. ({analytics.abcStats.classC.pctItems}%)</span>
                    <span className="font-mono font-bold">{formatCurrency(analytics.abcStats.classC.valueHt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>💡 <strong>Conseil Titulaire :</strong> Suivre les {analytics.abcStats.classA.count} réf. de Classe A en cadencement J+1 pour économiser du BFR.</span>
            <button
              onClick={() => setActiveMainTab('pareto')}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Graphique Détaillé 20/80</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expiry Risk & Cold Chain (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Pyramide des Horizons de Péremption & Risque Financier</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Montants en € HT menacés par les dates limites d'utilisation (DLUO)
                </p>
              </div>
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3 my-2">
              {expiryPyramidData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      {item.range}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {item.count} lot(s)
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.valueHt)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: item.fill,
                        width: `${analytics.totalValuePumpHt > 0 ? (item.valueHt / analytics.totalValuePumpHt) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-sky-500" />
                <span>Frigo (2-8°C) : <strong>{analytics.refrigeratedStats.count} réf. ({formatCurrency(analytics.refrigeratedStats.valueHt)})</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Coffre Sécurisé : <strong>{analytics.highValueStats.count} réf.</strong></span>
              </span>
            </div>

            {analytics.expiryRiskStats.totalAtRiskValueHt > 0 && onSelectFilterPreset && (
              <button
                onClick={() => onSelectFilterPreset('near_expiry')}
                className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-200 transition cursor-pointer"
              >
                Gérer les {formatCurrency(analytics.expiryRiskStats.totalAtRiskValueHt)} à risque →
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Row 3: Category Breakdown & Top Laboratories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Valorisation & Marge par Famille Officinale
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Poids des médicaments remboursables, OTC, parapharmacie et dispositifs médicaux
              </p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setSelectedCategoryTab('value')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategoryTab === 'value' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Valeur HT (€)
              </button>
              <button
                onClick={() => setSelectedCategoryTab('margin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategoryTab === 'margin' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Marge Potentielle
              </button>
              <button
                onClick={() => setSelectedCategoryTab('units')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategoryTab === 'units' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Volume (Boîtes)
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  formatter={(val: any, name: any) => [
                    selectedCategoryTab === 'units' ? `${formatNumber(Number(val))} boîtes` : formatCurrency(Number(val)),
                    selectedCategoryTab === 'value' ? 'Valeur Stock HT' : selectedCategoryTab === 'margin' ? 'Marge Brute HT' : 'Nombre de boîtes'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.fullName} (TVA ${item.tva}%)` : label;
                  }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar 
                  dataKey={selectedCategoryTab === 'value' ? 'valeurHt' : selectedCategoryTab === 'margin' ? 'margeHt' : 'units'} 
                  radius={[6, 6, 0, 0]}
                  fill="#059669"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
            {analytics.categoryStats.slice(0, 6).map((c, i) => (
              <div 
                key={i} 
                onClick={() => onSelectFilterPreset && onSelectFilterPreset(c.category)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span>{c.categoryLabel}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(c.totalValuePumpHt)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{c.marginRatePct}% mge</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Laboratories by Value (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Top Laboratoires & Fournisseurs
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Laboratoires concentrant le plus de valeur en stock
                </p>
              </div>
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-3">
              {analytics.topLaboratories.map((lab, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {idx + 1}. {lab.laboratory}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lab.itemsCount} réf.
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(lab.totalValueHt)}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 w-9 text-right">
                        {lab.sharePct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${lab.sharePct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Concentration Top 3 : <strong>{analytics.topLaboratories.slice(0, 3).reduce((s, l) => s + l.sharePct, 0).toFixed(1)}%</strong> du stock total</span>
          </div>
        </div>

      </div>

      {/* Row 4: Top 10 High Value / Strategic Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Top 10 des Références à plus Fort Capital Immobilisé</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                Classe A
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ces références concentrent la majeure partie de votre besoin en fonds de roulement (BFR)
            </p>
          </div>

          {onOpenAdvancedSearch && (
            <button
              onClick={onOpenAdvancedSearch}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Voir tout le stock dans la Recherche Avancée</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">Rang</th>
                <th className="py-3 px-3">Produit & DCI</th>
                <th className="py-3 px-3">Laboratoire</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-right">PUMP HT</th>
                <th className="py-3 px-3 text-right">Valeur Stock HT</th>
                <th className="py-3 px-3 text-center">Couverture</th>
                <th className="py-3 px-3 text-center">Péremption</th>
                <th className="py-3 px-3 text-center">Classe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {analytics.topValuedItems.map((prod, idx) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {prod.name}
                      {prod.isRefrigerated && (
                        <span title="Frigo 2-8°C" className="text-sky-500">
                          <Thermometer className="w-3.5 h-3.5 inline" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      CIP : {prod.cip}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {prod.laboratory}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {prod.stockQty} btes
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium font-mono">
                    {formatCurrency(prod.pump)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                    {formatCurrency(prod.totalValueHt)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.calculatedDaysCoverage > 60 
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {prod.calculatedDaysCoverage} jours
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[11px] font-medium ${
                      prod.daysUntilExpiry <= 30 ? 'text-rose-600 font-bold' : prod.daysUntilExpiry <= 60 ? 'text-amber-600' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {prod.expiryDate}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                      prod.calculatedAbcClass === 'A' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                      prod.calculatedAbcClass === 'B' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {prod.calculatedAbcClass}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}

    </div>
  );
};
