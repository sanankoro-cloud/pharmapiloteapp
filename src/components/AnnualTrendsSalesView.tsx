import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Percent, 
  Users, 
  ShoppingBag, 
  Download, 
  ArrowUpRight, 
  Layers,
  Sparkles,
  PieChart as PieIcon,
  Flame,
  Activity,
  Calculator
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { MOCK_ANNUAL_TRENDS, MOCK_DAILY_STATS } from '../data/mockPharmacyData';
import { MOCK_SUPPLIER_RFA_CONTRACTS } from '../data/mockPurchasingAndDiscounts';
import { formatCurrency, formatPercent, exportToCsv } from '../utils/formatters';
import { MultiYearSeasonalityComparison } from './MultiYearSeasonalityComparison';
import { YearEndMarginPredictorView } from './YearEndMarginPredictorView';
import { SectorGoalsComparisonView } from './SectorGoalsComparisonView';

export const AnnualTrendsSalesView: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'sector_goals' | 'seasonality_3y' | 'monthly_trends' | 'predictif_marge'>('sector_goals');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activeMetric, setActiveMetric] = useState<'ca' | 'marge' | 'ebe'>('ca');

  const totalCa2025 = MOCK_ANNUAL_TRENDS.reduce((sum, item) => sum + item.ca2025, 0);
  const totalCa2026 = MOCK_ANNUAL_TRENDS.reduce((sum, item) => sum + item.ca2026, 0);
  const growthRate = ((totalCa2026 - totalCa2025) / totalCa2025) * 100;
  const totalMarge2026 = MOCK_ANNUAL_TRENDS.reduce((sum, item) => sum + item.marge2026, 0);
  const totalEbe2026 = MOCK_ANNUAL_TRENDS.reduce((sum, item) => sum + item.ebe, 0);

  const handleExportCsv = () => {
    const data = MOCK_ANNUAL_TRENDS.map(t => ({
      'Mois': t.month,
      'CA 2025 HT (€)': t.ca2025,
      'CA 2026 HT (€)': t.ca2026,
      'Croissance (%)': (((t.ca2026 - t.ca2025) / t.ca2025) * 100).toFixed(1),
      'Marge Brute 2026 (€)': t.marge2026,
      'Charges 2026 (€)': t.charges,
      'EBE / EBITDA Officine (€)': t.ebe
    }));
    exportToCsv(data, 'tendances_ventes_annuelles_pharmacie');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Statistiques de Ventes & Saisonnalité Multi-Annuelle
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualisation comparative du Chiffre d'Affaires et de la Marge Brute sur 3 ans (2024, 2025, 2026), diagnostic des cycles saisonniers et prévisions EBE.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveMainTab('sector_goals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'sector_goals'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeMainTab === 'sector_goals' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
            <span>Secteurs vs Objectifs Fixés</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              activeMainTab === 'sector_goals' ? 'bg-white text-indigo-700' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
            }`}>
              102,4%
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('seasonality_3y')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'seasonality_3y'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Comparatif 3 Ans & Saisonnalité</span>
          </button>

          <button
            onClick={() => setActiveMainTab('monthly_trends')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'monthly_trends'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Évolution & EBE (N vs N-1)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('predictif_marge')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeMainTab === 'predictif_marge'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Calcul Prédictif Marge & RFA</span>
            <span className="px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-black">
              87%
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab 0: Sector Goals Comparison (Médicaments, Parapharmacie, Conseils) */}
      {activeMainTab === 'sector_goals' && (
        <SectorGoalsComparisonView />
      )}

      {/* Main Tab 1: Multi-Year Seasonal Analysis (2024, 2025, 2026) */}
      {activeMainTab === 'seasonality_3y' && (
        <MultiYearSeasonalityComparison />
      )}

      {/* Main Tab 3: Predictive Margin & RFA Year-End Calculation */}
      {activeMainTab === 'predictif_marge' && (
        <YearEndMarginPredictorView 
          contracts={MOCK_SUPPLIER_RFA_CONTRACTS}
          onBackToContracts={() => setActiveMainTab('seasonality_3y')}
        />
      )}

      {/* Main Tab 2: Monthly Trends & EBITDA N vs N-1 */}
      {activeMainTab === 'monthly_trends' && (
        <div className="space-y-6">
          {/* Aggregate KPI Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                CA Global 2026 HT (Cumul)
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                {formatCurrency(totalCa2026)}
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{growthRate.toFixed(1)}% vs 2025 ({formatCurrency(totalCa2025)})</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Marge Brute Cumulée HT
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(totalMarge2026)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Taux de marge moyen : {((totalMarge2026 / totalCa2026) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                EBE Officinal (EBITDA)
              </div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {formatCurrency(totalEbe2026)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Rentabilité d'exploitation : {((totalEbe2026 / totalCa2026) * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Indice de Fréquentation
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                272 clients / jour
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Panier moyen : 24,92 € TTC
              </div>
            </div>
          </div>

          {/* Main Annual Trend Chart (N vs N-1) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Évolution Mensuelle Comparée : Année 2026 vs 2025
                </h2>
                <p className="text-xs text-slate-500">
                  Progression mensuelle du Chiffre d'Affaires HT, de la Marge Brute et de l'EBE.
                </p>
              </div>

              {/* Metric Selector Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveMetric('ca')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMetric === 'ca' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Chiffre d'Affaires HT
                </button>
                <button
                  onClick={() => setActiveMetric('marge')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMetric === 'marge' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Marge Brute HT
                </button>
                <button
                  onClick={() => setActiveMetric('ebe')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMetric === 'ebe' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  EBE / EBITDA
                </button>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MOCK_ANNUAL_TRENDS} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
                  <Tooltip 
                    formatter={(val: any, name: any) => [formatCurrency(Number(val)), name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {activeMetric === 'ca' && (
                    <>
                      <Bar dataKey="ca2025" name="CA 2025 N-1 (€)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ca2026" name="CA 2026 N (€)" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="marge2026" name="Marge Brute 2026 (€)" stroke="#3b82f6" strokeWidth={3} />
                    </>
                  )}

                  {activeMetric === 'marge' && (
                    <>
                      <Bar dataKey="marge2026" name="Marge Brute 2026 (€)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="charges" name="Charges Externes & Salaires (€)" stroke="#ef4444" strokeWidth={2} />
                    </>
                  )}

                  {activeMetric === 'ebe' && (
                    <>
                      <Bar dataKey="ebe" name="EBE / Excédent Brut d'Exploitation (€)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="marge2026" name="Marge Brute 2026 (€)" stroke="#10b981" strokeWidth={2} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Seasonality & Pathology Insights Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Saisonnalité Hivernale (Nov - Fév)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Pic de dispensation d'antibiotiques, antitussifs, tests antigéniques et vaccins grippe. Prévoir réassort anticipé en octobre.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Saisonnalité Printanière (Mar - Mai)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Forte hausse des antihistaminiques (allergies pollens), collyres et compléments détox. Marge brute moyenne : 36.2%.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Saisonnalité Estivale (Juin - Août)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Explosion des ventes de crèmes solaires, anti-moustiques et trousses de secours vacances. Panier moyen le plus élevé de l'année.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

