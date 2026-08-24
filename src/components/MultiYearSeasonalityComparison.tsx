import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  Percent,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Download,
  Info,
  SlidersHorizontal,
  Sun,
  Snowflake,
  Flower2,
  Leaf,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  AreaChart
} from 'recharts';
import {
  MOCK_MULTI_YEAR_TRENDS,
  MOCK_YEAR_SUMMARIES,
  MOCK_QUARTERLY_SUMMARIES
} from '../data/mockMultiYearSeasonalData';
import {
  MonthlyMultiYearData,
  SeasonType,
  QuarterType
} from '../types/seasonalTrends';
import { formatCurrency, formatPercent, exportToCsv } from '../utils/formatters';

export const MultiYearSeasonalityComparison: React.FC = () => {
  // View mode
  const [chartMode, setChartMode] = useState<'ca' | 'marge' | 'combined' | 'seasonality_index' | 'quarterly'>('ca');
  const [selectedSeason, setSelectedSeason] = useState<SeasonType | 'all'>('all');
  const [visibleYears, setVisibleYears] = useState<{ y2024: boolean; y2025: boolean; y2026: boolean }>({
    y2024: true,
    y2025: true,
    y2026: true
  });
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<MonthlyMultiYearData | null>(null);
  const [showDataTable, setShowDataTable] = useState(false);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (selectedSeason === 'all') {
      return MOCK_MULTI_YEAR_TRENDS;
    }
    return MOCK_MULTI_YEAR_TRENDS.filter(d => d.season === selectedSeason);
  }, [selectedSeason]);

  // Aggregate totals
  const totalCa2024 = MOCK_YEAR_SUMMARIES[0].totalCaHt;
  const totalCa2025 = MOCK_YEAR_SUMMARIES[1].totalCaHt;
  const totalCa2026 = MOCK_YEAR_SUMMARIES[2].totalCaHt;

  const totalMarge2024 = MOCK_YEAR_SUMMARIES[0].totalMargeHt;
  const totalMarge2025 = MOCK_YEAR_SUMMARIES[1].totalMargeHt;
  const totalMarge2026 = MOCK_YEAR_SUMMARIES[2].totalMargeHt;

  const growth25vs24 = ((totalCa2025 - totalCa2024) / totalCa2024) * 100;
  const growth26vs25 = ((totalCa2026 - totalCa2025) / totalCa2025) * 100;

  // Export CSV Handler
  const handleExportCsv = () => {
    const data = MOCK_MULTI_YEAR_TRENDS.map(t => ({
      'Mois': t.fullMonth,
      'Saison': t.seasonLabel,
      'Trimestre': t.quarter,
      'CA 2024 HT (€)': t.ca2024,
      'CA 2025 HT (€)': t.ca2025,
      'CA 2026 HT (€)': t.ca2026,
      'Croissance 26/25 (%)': t.growthCa26vs25.toFixed(1),
      'Marge Brute 2024 (€)': t.marge2024,
      'Marge Brute 2025 (€)': t.marge2025,
      'Marge Brute 2026 (€)': t.marge2026,
      'Taux Marge 2026 (%)': t.tauxMarge2026.toFixed(1),
      'Indice Saisonnalité (Base 100)': t.seasonalityIndex.toFixed(1),
      'Facteurs & Pathologies': t.topPathologies.join('; ')
    }));
    exportToCsv(data, 'comparatif_3_ans_ca_marge_saisonnalite_officine');
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const currentMonthData = MOCK_MULTI_YEAR_TRENDS.find(m => m.month === label || m.fullMonth.startsWith(label));

    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs max-w-xs sm:max-w-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-white">
              {currentMonthData ? currentMonthData.fullMonth : label}
            </span>
          </div>
          {currentMonthData && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              currentMonthData.seasonalityStatus === 'pic_majeur'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : currentMonthData.seasonalityStatus === 'au_dessus_moyenne'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : currentMonthData.seasonalityStatus === 'creux_saisonnier'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-700 text-slate-300'
            }`}>
              Indice : {currentMonthData.seasonalityIndex}
            </span>
          )}
        </div>

        {/* Values list */}
        <div className="space-y-1.5 font-mono">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white">
                {typeof entry.value === 'number' && entry.name.includes('%')
                  ? `${entry.value.toFixed(1)}%`
                  : typeof entry.value === 'number' && entry.name.includes('Indice')
                  ? entry.value.toFixed(1)
                  : formatCurrency(Number(entry.value))}
              </span>
            </div>
          ))}
        </div>

        {/* Pathology drivers */}
        {currentMonthData && (
          <div className="mt-2.5 pt-2 border-t border-slate-700 text-[10px] text-slate-300">
            <div className="font-semibold text-emerald-300 mb-0.5">Pathologies & saisonnalité :</div>
            <div className="text-slate-400">{currentMonthData.topPathologies.join(' • ')}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* Top Banner & Title */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md mt-0.5 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Comparatif Tri-Annuel (2024 / 2025 / 2026) : CA & Marge Brute
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Analyse de Saisonnalité Officinale
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                Suivi multi-annuel du chiffre d'affaires et de la marge brute par mois. Détection des pics d'activité épidémique (hiver/automne), des effets d'allergies printanières, et du creux estival pour optimiser les achats et la trésorerie.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowDataTable(!showDataTable)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition shadow-xs"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>{showDataTable ? 'Masquer la Matrice' : 'Voir la Matrice 3 Ans'}</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV 3 Ans</span>
            </button>
          </div>
        </div>

        {/* 3 Years Comparative Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 pt-5 border-t border-slate-700/60">
          
          {/* Exercice 2024 */}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Exercice 2024 (N-2)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">Clôturé</span>
              </div>
              <div className="text-xl font-bold text-slate-200 font-mono">
                {formatCurrency(totalCa2024)}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
              <span className="text-slate-400">Marge Brute HT :</span>
              <span className="font-bold text-emerald-400 font-mono">{formatCurrency(totalMarge2024)} (33.97%)</span>
            </div>
          </div>

          {/* Exercice 2025 */}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                <span>Exercice 2025 (N-1)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +{growth25vs24.toFixed(1)}% vs 2024
                </span>
              </div>
              <div className="text-xl font-bold text-slate-100 font-mono">
                {formatCurrency(totalCa2025)}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
              <span className="text-slate-400">Marge Brute HT :</span>
              <span className="font-bold text-emerald-400 font-mono">{formatCurrency(totalMarge2025)} (34.12%)</span>
            </div>
          </div>

          {/* Exercice 2026 */}
          <div className="bg-gradient-to-br from-indigo-950/70 to-emerald-950/70 p-3.5 rounded-2xl border border-emerald-500/40 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-1">
                <span>Exercice 2026 (N en cours)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-900 font-mono font-black flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +{growth26vs25.toFixed(1)}% vs 2025
                </span>
              </div>
              <div className="text-xl font-black text-emerald-300 font-mono">
                {formatCurrency(totalCa2026)}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-slate-300">Marge Brute HT :</span>
              <span className="font-black text-white font-mono">{formatCurrency(totalMarge2026)} (34.14%)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        
        {/* Controls Toolbar */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          
          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setChartMode('ca')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                chartMode === 'ca'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Chiffre d'Affaires (3 Ans)</span>
            </button>

            <button
              onClick={() => setChartMode('marge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                chartMode === 'marge'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Percent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Marge Brute (€ & %)</span>
            </button>

            <button
              onClick={() => setChartMode('combined')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                chartMode === 'combined'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Vue Combinée CA + Marge</span>
            </button>

            <button
              onClick={() => setChartMode('seasonality_index')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                chartMode === 'seasonality_index'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Indice de Saisonnalité (Base 100)</span>
            </button>

            <button
              onClick={() => setChartMode('quarterly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                chartMode === 'quarterly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Trimestres T1-T4</span>
            </button>
          </div>

          {/* Season Filter & Year Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Season Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setSelectedSeason('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedSeason === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                12 Mois
              </button>
              <button
                onClick={() => setSelectedSeason('hiver')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  selectedSeason === 'hiver'
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 font-bold'
                    : 'text-slate-500 hover:text-sky-700'
                }`}
                title="Hiver (Jan, Fév, Déc)"
              >
                <Snowflake className="w-3 h-3 text-sky-500" />
                <span>Hiver</span>
              </button>
              <button
                onClick={() => setSelectedSeason('printemps')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  selectedSeason === 'printemps'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
                title="Printemps (Mar, Avr, Mai)"
              >
                <Flower2 className="w-3 h-3 text-emerald-500" />
                <span>Printemps</span>
              </button>
              <button
                onClick={() => setSelectedSeason('ete')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  selectedSeason === 'ete'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold'
                    : 'text-slate-500 hover:text-amber-700'
                }`}
                title="Été (Juin, Juil, Août)"
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Été</span>
              </button>
              <button
                onClick={() => setSelectedSeason('automne')}
                className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                  selectedSeason === 'automne'
                    ? 'bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-300 font-bold'
                    : 'text-slate-500 hover:text-orange-700'
                }`}
                title="Automne (Sep, Oct, Nov)"
              >
                <Leaf className="w-3 h-3 text-orange-500" />
                <span>Automne</span>
              </button>
            </div>

            {/* Year Visibility Checkboxes */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={visibleYears.y2024}
                  onChange={(e) => setVisibleYears({ ...visibleYears, y2024: e.target.checked })}
                  className="rounded text-slate-600 focus:ring-slate-500"
                />
                <span className="text-slate-500">2024 (N-2)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={visibleYears.y2025}
                  onChange={(e) => setVisibleYears({ ...visibleYears, y2025: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-blue-600 dark:text-blue-400">2025 (N-1)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={visibleYears.y2026}
                  onChange={(e) => setVisibleYears({ ...visibleYears, y2026: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">2026 (N)</span>
              </label>
            </div>

          </div>

        </div>

        {/* Dynamic Graphic Rendering Area */}
        <div className="h-88 sm:h-96 w-full pt-2">
          
          {/* MODE 1: CHIFFRE D'AFFAIRES 3 ANS */}
          {chartMode === 'ca' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {visibleYears.y2024 && (
                  <Bar dataKey="ca2024" name="CA 2024 (N-2)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                )}
                {visibleYears.y2025 && (
                  <Bar dataKey="ca2025" name="CA 2025 (N-1)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                )}
                {visibleYears.y2026 && (
                  <Bar dataKey="ca2026" name="CA 2026 (N)" fill="#059669" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* MODE 2: MARGE BRUTE 3 ANS */}
          {chartMode === 'marge' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} domain={[30, 38]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {visibleYears.y2024 && (
                  <Bar yAxisId="left" dataKey="marge2024" name="Marge Brute 2024 (€)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                )}
                {visibleYears.y2025 && (
                  <Bar yAxisId="left" dataKey="marge2025" name="Marge Brute 2025 (€)" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                )}
                {visibleYears.y2026 && (
                  <Bar yAxisId="left" dataKey="marge2026" name="Marge Brute 2026 (€)" fill="#10b981" radius={[4, 4, 0, 0]} />
                )}
                <Line yAxisId="right" type="monotone" dataKey="tauxMarge2026" name="Taux de Marge 2026 (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* MODE 3: VUE COMBINÉE CA & MARGE */}
          {chartMode === 'combined' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="ca2026" name="CA 2026 (N)" fill="#059669" opacity={0.85} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ca2025" name="CA 2025 (N-1)" fill="#93c5fd" opacity={0.65} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="marge2026" name="Marge Brute 2026 (N)" stroke="#047857" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="marge2025" name="Marge Brute 2025 (N-1)" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* MODE 4: INDICE DE SAISONNALITÉ BASE 100 */}
          {chartMode === 'seasonality_index' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MULTI_YEAR_TRENDS} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="seasonalityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis domain={[90, 125]} stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Moyenne annuelle = 100', fill: '#ef4444', fontSize: 11, position: 'insideTopLeft' }} />
                <Area type="monotone" dataKey="seasonalityIndex" name="Indice de Saisonnalité (Base 100)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#seasonalityGrad)" dot={{ r: 4, fill: '#059669' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* MODE 5: QUARTERLY / TRIMESTRES */}
          {chartMode === 'quarterly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_QUARTERLY_SUMMARIES} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="title" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
                <Tooltip 
                  formatter={(val: any, name: any) => [formatCurrency(Number(val)), name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="ca2024" name="CA Trimestre 2024" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ca2025" name="CA Trimestre 2025" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ca2026" name="CA Trimestre 2026" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

        </div>

        {/* Seasonality Quick Diagnostic Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Diagnostic Saisonnalité Officine : </span>
              <span className="text-slate-600 dark:text-slate-300">
                Poids prédominant du <strong>T4 (Oct-Déc : 27.0% du CA annuel)</strong> grâce aux vaccins et épidémies hivernales. Creux d'activité récurrent en <strong>Août (Indice 98.4)</strong> à anticiper en trésorerie.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-lg font-bold">
              Mois Pic : Déc (176k€)
            </span>
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-lg font-bold">
              Mois Creux : Fév (146k€)
            </span>
          </div>
        </div>

      </div>

      {/* Seasonal 4 Quarters Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_QUARTERLY_SUMMARIES.map((q) => (
          <div
            key={q.quarter}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {q.months}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {q.shareOfAnnualCa}% du CA
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                {q.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {q.keyDrivers}
              </p>
            </div>

            {/* 3 Years Evolution bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>2024 :</span>
                <span>{formatCurrency(q.ca2024)}</span>
              </div>
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-[11px]">
                <span>2025 :</span>
                <span>{formatCurrency(q.ca2025)}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                <span>2026 :</span>
                <span>{formatCurrency(q.ca2026)}</span>
              </div>
            </div>

            <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200">Conseil : </strong>
              {q.recommendation}
            </div>
          </div>
        ))}
      </div>

      {/* Comprehensive 3-Year Monthly Matrix Table */}
      {showDataTable && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Matrice Mensuelle Détaillée Tri-Annuelle (2024 / 2025 / 2026)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Décomposition mensuelle du Chiffre d'Affaires HT, de la Marge Brute et des coefficients de saisonnalité.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportCsv}
              className="text-xs text-indigo-600 hover:underline font-bold"
            >
              Télécharger en CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px]">
                  <th className="pb-2">Mois</th>
                  <th className="pb-2">Saison & Pathologies</th>
                  <th className="pb-2 text-right">CA 2024 HT</th>
                  <th className="pb-2 text-right">CA 2025 HT</th>
                  <th className="pb-2 text-right">CA 2026 HT</th>
                  <th className="pb-2 text-right">Croissance 26/25</th>
                  <th className="pb-2 text-right">Marge 2024</th>
                  <th className="pb-2 text-right">Marge 2025</th>
                  <th className="pb-2 text-right">Marge 2026</th>
                  <th className="pb-2 text-right">Taux 2026</th>
                  <th className="pb-2 text-center">Indice Saison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {MOCK_MULTI_YEAR_TRENDS.map((row) => (
                  <tr
                    key={row.month}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                    onClick={() => setSelectedMonthDetail(row)}
                  >
                    <td className="py-2.5 font-sans font-bold text-slate-900 dark:text-white">
                      {row.fullMonth}
                    </td>
                    <td className="py-2.5 font-sans text-slate-600 dark:text-slate-400 text-[11px]">
                      {row.seasonLabel}
                    </td>
                    <td className="py-2.5 text-right text-slate-500">
                      {formatCurrency(row.ca2024)}
                    </td>
                    <td className="py-2.5 text-right text-blue-600 dark:text-blue-400">
                      {formatCurrency(row.ca2025)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.ca2026)}
                    </td>
                    <td className="py-2.5 text-right text-emerald-600 font-bold">
                      +{row.growthCa26vs25.toFixed(1)}%
                    </td>
                    <td className="py-2.5 text-right text-slate-500">
                      {formatCurrency(row.marge2024)}
                    </td>
                    <td className="py-2.5 text-right text-blue-600 dark:text-blue-400">
                      {formatCurrency(row.marge2025)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.marge2026)}
                    </td>
                    <td className="py-2.5 text-right text-slate-700 dark:text-slate-300 font-bold">
                      {row.tauxMarge2026.toFixed(1)}%
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.seasonalityStatus === 'pic_majeur'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : row.seasonalityStatus === 'au_dessus_moyenne'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : row.seasonalityStatus === 'creux_saisonnier'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}>
                        {row.seasonalityIndex}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-300 dark:border-slate-700 font-mono font-bold">
                <tr className="bg-slate-50 dark:bg-slate-800/80">
                  <td className="py-2.5 font-sans">TOTAL EXERCICE</td>
                  <td className="py-2.5 font-sans text-slate-500">12 Mois</td>
                  <td className="py-2.5 text-right">{formatCurrency(totalCa2024)}</td>
                  <td className="py-2.5 text-right text-blue-600">{formatCurrency(totalCa2025)}</td>
                  <td className="py-2.5 text-right text-emerald-600">{formatCurrency(totalCa2026)}</td>
                  <td className="py-2.5 text-right text-emerald-600">+{growth26vs25.toFixed(1)}%</td>
                  <td className="py-2.5 text-right">{formatCurrency(totalMarge2024)}</td>
                  <td className="py-2.5 text-right text-blue-600">{formatCurrency(totalMarge2025)}</td>
                  <td className="py-2.5 text-right text-emerald-600">{formatCurrency(totalMarge2026)}</td>
                  <td className="py-2.5 text-right">34.1%</td>
                  <td className="py-2.5 text-center">100.0</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Month Detail Modal / Focus */}
      {selectedMonthDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Détail du Mois de {selectedMonthDetail.fullMonth}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMonthDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="text-slate-400 text-[10px]">CA 2026 HT</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">
                  {formatCurrency(selectedMonthDetail.ca2026)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  +{selectedMonthDetail.growthCa26vs25.toFixed(1)}% vs 2025 ({formatCurrency(selectedMonthDetail.ca2025)})
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="text-slate-400 text-[10px]">Marge Brute 2026</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">
                  {formatCurrency(selectedMonthDetail.marge2026)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Taux : {selectedMonthDetail.tauxMarge2026.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Pathologies & Facteurs Clés :</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedMonthDetail.topPathologies.map((p, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-[11px]">
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] pt-1">
                {selectedMonthDetail.keySeasonDrivers}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <strong className="block font-bold">Conseil Stratégique Officine :</strong>
              <p className="text-[11px] leading-relaxed">
                {selectedMonthDetail.actionConseilOfficine}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMonthDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
