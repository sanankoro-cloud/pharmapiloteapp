import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Percent, 
  Target, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Calculator, 
  Calendar, 
  Download, 
  ArrowRight, 
  Layers, 
  Building2, 
  Zap, 
  ChevronRight, 
  Info, 
  RefreshCw, 
  HelpCircle,
  BarChart3,
  Flame,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  Briefcase
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
  Area 
} from 'recharts';
import { SupplierRfaContract } from '../types/purchasingAndDiscounts';
import { 
  computeYearEndMarginPrediction, 
  SimulationParams 
} from '../utils/marginPredictorEngine';
import { formatCurrency, formatPercent, exportToCsv } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface YearEndMarginPredictorViewProps {
  contracts: SupplierRfaContract[];
  onBackToContracts?: () => void;
  onNavigateToDiscountsAudit?: () => void;
}

export const YearEndMarginPredictorView: React.FC<YearEndMarginPredictorViewProps> = ({
  contracts,
  onBackToContracts,
  onNavigateToDiscountsAudit
}) => {
  // Configurable Target
  const [annualTargetMargin, setAnnualTargetMargin] = useState<number>(680000);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>('680000');

  // Simulation Parameters State
  const [simParams, setSimParams] = useState<SimulationParams>({
    growthRateQ4Pct: 0,
    priceHikesPassThroughPct: 50,
    forceOptimalRfaTiers: false,
    recoverAllDiscrepancies: true
  });

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'trajectoire' | 'fournisseurs_rfa' | 'scenarios'>('trajectoire');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'pessimistic' | 'realistic' | 'optimistic'>('realistic');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Compute prediction results dynamically
  const prediction = useMemo(() => {
    return computeYearEndMarginPrediction(contracts, simParams, annualTargetMargin);
  }, [contracts, simParams, annualTargetMargin]);

  // Handle Target Update
  const handleSaveTarget = () => {
    const parsed = parseFloat(customTargetInput.replace(/\s/g, ''));
    if (!isNaN(parsed) && parsed > 100000) {
      setAnnualTargetMargin(parsed);
      setIsEditingTarget(false);
      showToast(`Objectif de marge annuelle mis à jour : ${formatCurrency(parsed)}`);
    }
  };

  // Handle Export CSV
  const handleExportPredictionCsv = () => {
    const rows: Record<string, string | number>[] = [];
    
    // Monthly trajectory rows
    prediction.monthlyTrajectory.forEach(m => {
      rows.push({
        'Section': 'Trajectoire Mensuelle',
        'Mois': m.monthFullName,
        'Type': m.isActual ? 'Réalisé YTD' : 'Projection Forecast',
        'CA HT (€)': m.caHt,
        'Achats HT (€)': m.achatsHt,
        'Marge Directe HT (€)': m.margeDirecteHt,
        'Taux Marge Directe (%)': m.margeDirectePct,
        'RFA Estimée (€)': m.rfaMensuelleHt,
        'Marge Totale avec RFA (€)': m.margeTotaleHt,
        'Taux Marge Totale (%)': m.margeTotalePct,
        'Objectif Marge (€)': m.targetMargeHt
      });
    });

    // Supplier tiers rows
    prediction.supplierTiers.forEach(s => {
      rows.push({
        'Section': 'Paliers RFA Fournisseurs',
        'Mois': s.supplierName,
        'Type': s.supplierType,
        'CA HT (€)': s.currentYtdPurchasesHt,
        'Achats HT (€)': s.projectedYearEndPurchasesHt,
        'Marge Directe HT (€)': s.currentTierRfaEuros,
        'Taux Marge Directe (%)': s.currentTierRatePct,
        'RFA Estimée (€)': s.nextTierRfaEuros,
        'Marge Totale avec RFA (€)': s.marginalGainNextTierEuros,
        'Taux Marge Totale (%)': s.tierReachProbabilityPct,
        'Objectif Marge (€)': s.nextTierThresholdHt
      });
    });

    exportToCsv(rows, 'prevision_marge_brute_rfa_fin_annee_2026');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    showToast('Export CSV de la prévision de marge et des RFA téléchargé.');
  };

  // Color helper for probability
  const getProbabilityBadge = (prob: number) => {
    if (prob >= 80) {
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        label: 'Très Forte / Atteinte Sécurisée',
        color: '#10b981'
      };
    } else if (prob >= 65) {
      return {
        bg: 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800',
        label: 'Forte / Atteinte Probable',
        color: '#0d9488'
      };
    } else if (prob >= 50) {
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        label: 'Vigilance / À portée avec actions',
        color: '#f59e0b'
      };
    } else {
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        label: 'Sous Risque d\'Érosion',
        color: '#f43f5e'
      };
    }
  };

  const probInfo = getProbabilityBadge(prediction.goalAchievementProbabilityPct);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in max-w-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-linear-to-br from-indigo-600 via-teal-600 to-emerald-600 text-white shadow-md shadow-indigo-500/20">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Calcul Prédictif de Marge Brute & RFA Fin d'Année
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800">
                  Exercice 2026
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Atterrissage annuel prévisionnel basé sur le réalisé YTD, la saisonnalité Q4, les seuils de RFA fournisseurs et estimation de probabilité d'atteinte de l'objectif.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBackToContracts && (
            <button
              onClick={onBackToContracts}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Percent className="w-3.5 h-3.5 text-indigo-600" />
              <span>Contrats RFA</span>
            </button>
          )}

          <button
            onClick={handleExportPredictionCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Rapport CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Hero: Probability Gauge & Executive Landing Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Probability Gauge & Core Metric Cards */}
        <div className="lg:col-span-2 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/60 relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Banner inside Hero */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-indigo-800/40 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Indicateur Prédictif Global Officine
                </span>
                <h2 className="text-base font-bold text-white">
                  Probabilité d'Atteinte de l'Objectif de Marge Brute 2026
                </h2>
              </div>
            </div>

            {/* Target Editor */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-2xl border border-indigo-700/50">
              <span className="text-[11px] text-slate-300">Objectif Cible :</span>
              {isEditingTarget ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={customTargetInput}
                    onChange={(e) => setCustomTargetInput(e.target.value)}
                    className="w-24 px-2 py-0.5 rounded-lg bg-slate-900 border border-indigo-500 text-white text-xs font-mono font-bold"
                  />
                  <button
                    onClick={handleSaveTarget}
                    className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-amber-300 text-sm">
                    {formatCurrency(annualTargetMargin)}
                  </span>
                  <button
                    onClick={() => {
                      setCustomTargetInput(annualTargetMargin.toString());
                      setIsEditingTarget(true);
                    }}
                    className="text-[10px] text-indigo-300 hover:text-white underline cursor-pointer"
                  >
                    Modifier
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Core Visual: Big Circular / Bar Gauge & Forecast Numbers */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            
            {/* Big Probability Number & Circular Style Ring */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-800/50 rounded-2xl border border-indigo-800/40">
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    className="text-slate-700/50"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={probInfo.color}
                    strokeWidth="10"
                    strokeDasharray={314}
                    strokeDashoffset={314 - (314 * prediction.goalAchievementProbabilityPct) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-mono text-white tracking-tight">
                    {prediction.goalAchievementProbabilityPct}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">
                    Probabilité
                  </span>
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${probInfo.bg}`}>
                  {probInfo.label}
                </span>
              </div>
            </div>

            {/* Right: Key Figures & Landing Breakdown */}
            <div className="sm:col-span-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Atterrissage Marge Totale</span>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
                    {formatCurrency(prediction.projectedAnnualTotalMarginHt)}
                  </div>
                  <span className="text-[11px] text-slate-300 font-bold">
                    {prediction.projectedAnnualMarginPct.toFixed(2)} % du CA
                  </span>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Écart vs Objectif Cible</span>
                  <div className={`text-xl font-black font-mono mt-0.5 ${
                    prediction.deltaMarginVsTargetEuros >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {prediction.deltaMarginVsTargetEuros >= 0 ? '+' : ''}{formatCurrency(prediction.deltaMarginVsTargetEuros)}
                  </div>
                  <span className={`text-[11px] font-bold ${
                    prediction.deltaMarginVsTargetPts >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {prediction.deltaMarginVsTargetPts >= 0 ? '+' : ''}{prediction.deltaMarginVsTargetPts.toFixed(2)} pts
                  </span>
                </div>
              </div>

              {/* Progress Bar of Year Realized vs Remaining */}
              <div className="space-y-1.5 bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                  <span>Marge Réalisée YTD (Jan-Août) : <strong className="text-white font-mono">{formatCurrency(prediction.realizedYtdTotalMarginHt)}</strong></span>
                  <span>Forecast Q4 : <strong className="text-indigo-300 font-mono">{formatCurrency(prediction.forecastRemainingTotalMarginHt)}</strong></span>
                </div>
                <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(prediction.realizedYtdTotalMarginHt / prediction.projectedAnnualTotalMarginHt) * 100}%` }}
                    title="Réalisé YTD"
                  />
                  <div 
                    className="bg-indigo-500 h-full opacity-80"
                    style={{ width: `${(prediction.forecastRemainingTotalMarginHt / prediction.projectedAnnualTotalMarginHt) * 100}%` }}
                    title="Projection Q4"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>66.7% de l'exercice écoulé</span>
                  <span>Atterrissage consolidé au 31/12/2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 4 Confidence Pillars */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-indigo-800/40 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <div className="text-[10px] text-slate-400">Run-Rate Ventes</div>
                <div className="font-mono font-bold text-slate-200">{prediction.confidenceFactors.runRateScorePct}% sécurisé</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <div>
                <div className="text-[10px] text-slate-400">Sécurisation RFA</div>
                <div className="font-mono font-bold text-slate-200">{prediction.confidenceFactors.rfaSecurityScorePct}% des contrats</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <div>
                <div className="text-[10px] text-slate-400">Stabilité Mix Marge</div>
                <div className="font-mono font-bold text-slate-200">{prediction.confidenceFactors.mixMarginStabilityScorePct}% conforme</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">Répercussion Prix</div>
                <div className="font-mono font-bold text-slate-200">{prediction.confidenceFactors.inflationResilienceScorePct}% absorbé</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Simulation Studio ("What-If") */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Studio de Simulation "What-If"
                </h3>
              </div>
              <button
                onClick={() => setSimParams({
                  growthRateQ4Pct: 0,
                  priceHikesPassThroughPct: 50,
                  forceOptimalRfaTiers: false,
                  recoverAllDiscrepancies: true
                })}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                title="Réinitialiser les paramètres"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-4 pt-3 text-xs">
              {/* Slider 1: Activity Growth Q4 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Dynamique Activité Q4 (Saisonnalité) :</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {simParams.growthRateQ4Pct > 0 ? `+${simParams.growthRateQ4Pct}%` : `${simParams.growthRateQ4Pct}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="15"
                  step="1"
                  value={simParams.growthRateQ4Pct}
                  onChange={(e) => setSimParams(prev => ({ ...prev, growthRateQ4Pct: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>-10% (Hiver doux)</span>
                  <span>0% (Base)</span>
                  <span>+15% (Forte épidémie)</span>
                </div>
              </div>

              {/* Slider 2: Pass-Through on Price Hikes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Taux Répercussion Hausses Achat :</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    {simParams.priceHikesPassThroughPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={simParams.priceHikesPassThroughPct}
                  onChange={(e) => setSimParams(prev => ({ ...prev, priceHikesPassThroughPct: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0% (Érosion subie)</span>
                  <span>50% (Partagé)</span>
                  <span>100% (Marge blindée)</span>
                </div>
              </div>

              {/* Toggle 1: Force Optimal RFA Tiers via Purchases Arbitrage */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Arbitrage RFA Paliers Supérieurs</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Bascule commandes vers OCP & Biogaran
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={simParams.forceOptimalRfaTiers}
                  onChange={(e) => setSimParams(prev => ({ ...prev, forceOptimalRfaTiers: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              {/* Toggle 2: Recover All Discrepancies */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Rattrapage 100% Sous-Remises</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Encaissement des 515,50 € d'avoirs
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={simParams.recoverAllDiscrepancies}
                  onChange={(e) => setSimParams(prev => ({ ...prev, recoverAllDiscrepancies: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-300">
            <div className="flex items-center justify-between font-bold">
              <span>Gain de simulation actif :</span>
              <span className="font-mono text-xs text-indigo-700 dark:text-indigo-300">
                +{formatCurrency(prediction.projectedAnnualTotalMarginHt - 672000)} HT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl w-full sm:w-fit border border-slate-300/60 dark:border-slate-700/60">
        <button
          onClick={() => setActiveTab('trajectoire')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'trajectoire'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Trajectoire Mensuelle & Atterrissage</span>
        </button>

        <button
          onClick={() => setActiveTab('fournisseurs_rfa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'fournisseurs_rfa'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Matrice Paliers RFA & Seuils de Bascule</span>
          <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-extrabold border border-teal-200 dark:border-teal-800">
            {prediction.supplierTiers.length} Contrats
          </span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'scenarios'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>Comparatif 3 Scénarios & Stress-Test</span>
        </button>
      </div>

      {/* TAB 1: Trajectoire Mensuelle & Chart */}
      {activeTab === 'trajectoire' && (
        <div className="space-y-6">
          {/* Main Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Trajectoire Mensuelle de la Marge Brute Totale (Réalisé YTD vs Forecast Q4)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Consolidation de la marge directe sur ventes + remises de fin d'année (RFA) et escomptes financiers.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300">Marge Directe (€)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-600" />
                  <span className="text-slate-600 dark:text-slate-300">RFA & Escomptes (€)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300">Cible Budget (€)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={prediction.monthlyTrajectory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)} k€`}
                  />
                  <Tooltip 
                    formatter={(value: any, name: any) => {
                      if (name === 'Marge Directe HT') return [`${Number(value).toLocaleString('fr-FR')} €`, 'Marge Directe'];
                      if (name === 'RFA & Escomptes') return [`${Number(value).toLocaleString('fr-FR')} €`, 'RFA & Escomptes'];
                      if (name === 'Cible Budget') return [`${Number(value).toLocaleString('fr-FR')} €`, 'Objectif Cible'];
                      return [value, name];
                    }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="margeDirecteHt" name="Marge Directe HT" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="rfaMensuelleHt" name="RFA & Escomptes" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="targetMargeHt" name="Cible Budget" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trajectory Detailed Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Détail Chiffré par Mois (12 Mois 2026)
              </h4>
              <span className="text-xs text-slate-500">
                Périodes 01 à 08 : Réalisées | 09 à 12 : Estimées
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Période</th>
                    <th className="py-3 px-3 text-center">Statut</th>
                    <th className="py-3 px-3 text-right">CA HT</th>
                    <th className="py-3 px-3 text-right">Achats HT</th>
                    <th className="py-3 px-3 text-right">Marge Directe</th>
                    <th className="py-3 px-3 text-right">Taux Direct</th>
                    <th className="py-3 px-3 text-right">RFA Mensuelle</th>
                    <th className="py-3 px-3 text-right font-black text-indigo-600 dark:text-indigo-400">Marge Totale</th>
                    <th className="py-3 px-3 text-right">Taux Total</th>
                    <th className="py-3 px-4 text-center">Indice Saison</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {prediction.monthlyTrajectory.map((m, idx) => (
                    <tr key={idx} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                      m.isActual ? '' : 'bg-indigo-50/20 dark:bg-indigo-950/10'
                    }`}>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-sans">
                        {m.monthFullName}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {m.isActual ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Réalisé YTD
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Forecast Q4
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">{formatCurrency(m.caHt)}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{formatCurrency(m.achatsHt)}</td>
                      <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatCurrency(m.margeDirecteHt)}
                      </td>
                      <td className="py-3 px-3 text-right">{m.margeDirectePct.toFixed(1)} %</td>
                      <td className="py-3 px-3 text-right text-indigo-600 dark:text-indigo-300">
                        +{formatCurrency(m.rfaMensuelleHt)}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/30">
                        {formatCurrency(m.margeTotaleHt)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        {m.margeTotalePct.toFixed(1)} %
                      </td>
                      <td className="py-3 px-4 text-center font-sans text-[11px] text-slate-400">
                        x{m.seasonalIndex.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-mono font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                  <tr>
                    <td className="py-3 px-4 font-sans uppercase">Total Annuel 2026</td>
                    <td className="py-3 px-3 text-center font-sans">12 Mois</td>
                    <td className="py-3 px-3 text-right">{formatCurrency(prediction.projectedAnnualCaHt)}</td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {formatCurrency(prediction.projectedAnnualCaHt - prediction.projectedAnnualMarginDirecteHt)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(prediction.projectedAnnualMarginDirecteHt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {((prediction.projectedAnnualMarginDirecteHt / prediction.projectedAnnualCaHt) * 100).toFixed(1)} %
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-600 dark:text-indigo-300">
                      +{formatCurrency(prediction.projectedAnnualRfaHt)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-base text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
                      {formatCurrency(prediction.projectedAnnualTotalMarginHt)}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-indigo-600 dark:text-indigo-400">
                      {prediction.projectedAnnualMarginPct.toFixed(2)} %
                    </td>
                    <td className="py-3 px-4 text-center font-sans">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Matrice Paliers RFA & Seuils de Bascule */}
      {activeTab === 'fournisseurs_rfa' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  <span>Matrice d'Atterrissage des Remises de Fin d'Année (RFA) par Fournisseur</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Détection des opportunités d'arbitrage de commandes pour déclencher les tranches de rémunération arrière supérieures.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Total RFA Projetées :</span>
                <span className="px-3 py-1 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono font-black text-sm">
                  {formatCurrency(prediction.projectedAnnualRfaHt)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {prediction.supplierTiers.map((tier) => {
                const isOptimalReached = tier.projectedYearEndPurchasesHt >= tier.nextTierThresholdHt;
                const isCurrentReached = tier.projectedYearEndPurchasesHt >= tier.currentTierThresholdHt;

                return (
                  <div 
                    key={tier.supplierId}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                          {tier.supplierType === 'grossiste' ? 'Grossiste Répartiteur' : 'Laboratoire Direct'}
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          {tier.supplierName}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          tier.tierReachProbabilityPct >= 80
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {tier.tierReachProbabilityPct}% de probabilité
                        </span>
                      </div>
                    </div>

                    {/* Purchases vs Tiers Bar */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Achats YTD : <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(tier.currentYtdPurchasesHt)}</strong></span>
                        <span className="text-slate-500">Projection fin d'année : <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{formatCurrency(tier.projectedYearEndPurchasesHt)}</strong></span>
                      </div>
                      
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex relative">
                        <div 
                          className="bg-teal-500 h-full"
                          style={{ width: `${Math.min(100, (tier.projectedYearEndPurchasesHt / tier.nextTierThresholdHt) * 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Palier 1 ({tier.currentTierRatePct}%) : {formatCurrency(tier.currentTierThresholdHt)}</span>
                        <span>Palier 2 ({tier.nextTierRatePct}%) : {formatCurrency(tier.nextTierThresholdHt)}</span>
                      </div>
                    </div>

                    {/* Comparison Tiers */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Palier Actuel ({tier.currentTierRatePct}%)</div>
                        <div className="text-base font-black font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                          {formatCurrency(tier.currentTierRfaEuros)}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold">Acquis au prorata</span>
                      </div>

                      <div className={`p-2.5 rounded-xl border ${
                        isOptimalReached 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
                          : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                      }`}>
                        <div className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300">
                          Palier Supérieur ({tier.nextTierRatePct}%)
                        </div>
                        <div className="text-base font-black font-mono text-indigo-600 dark:text-indigo-300 mt-0.5">
                          {formatCurrency(tier.nextTierRfaEuros)}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Gain marginal : +{formatCurrency(tier.marginalGainNextTierEuros)}
                        </span>
                      </div>
                    </div>

                    {/* Action Suggestion */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{tier.actionPlanSuggestion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Comparatif 3 Scénarios & Stress-Test */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Pessimistic */}
            <div className={`rounded-3xl p-6 border transition-all ${
              selectedScenarioKey === 'pessimistic'
                ? 'bg-white dark:bg-slate-900 border-rose-400 dark:border-rose-700 shadow-lg ring-2 ring-rose-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm opacity-85'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  Scénario Prudent / Stress-Test
                </span>
                <span className="text-xs font-bold text-slate-400">98% certitude</span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Marge Brute Prévue</div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {formatCurrency(prediction.scenarios.pessimistic.totalMarginHt)}
                  </div>
                  <div className="text-xs font-bold text-rose-600 mt-0.5">
                    {prediction.scenarios.pessimistic.marginPct}% du CA
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>RFA Fournisseurs :</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {formatCurrency(prediction.scenarios.pessimistic.rfaTotalHt)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Écart vs Objectif :</span>
                    <strong className="text-rose-600 font-mono">
                      {formatCurrency(prediction.scenarios.pessimistic.totalMarginHt - prediction.targetAnnualMarginHt)}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {prediction.scenarios.pessimistic.description}
                </p>
              </div>
            </div>

            {/* Realistic / Central */}
            <div className={`rounded-3xl p-6 border transition-all ${
              selectedScenarioKey === 'realistic'
                ? 'bg-linear-to-b from-indigo-50/50 to-white dark:from-indigo-950/30 dark:to-slate-900 border-indigo-400 dark:border-indigo-600 shadow-xl ring-2 ring-indigo-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/60">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white shadow-xs">
                  Scénario Central / Tendance Actuelle
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
                  {prediction.goalAchievementProbabilityPct}% probabilité
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                    Marge Brute Prévue
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                    {formatCurrency(prediction.scenarios.realistic.totalMarginHt)}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    {prediction.scenarios.realistic.marginPct}% du CA
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/60 rounded-xl text-xs space-y-1 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>RFA Fournisseurs :</span>
                    <strong className="text-indigo-700 dark:text-indigo-300 font-mono">
                      {formatCurrency(prediction.scenarios.realistic.rfaTotalHt)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Écart vs Objectif :</span>
                    <strong className="text-emerald-600 font-mono">
                      +{formatCurrency(prediction.scenarios.realistic.totalMarginHt - prediction.targetAnnualMarginHt)}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {prediction.scenarios.realistic.description}
                </p>
              </div>
            </div>

            {/* Optimistic */}
            <div className={`rounded-3xl p-6 border transition-all ${
              selectedScenarioKey === 'optimistic'
                ? 'bg-white dark:bg-slate-900 border-emerald-400 dark:border-emerald-700 shadow-lg ring-2 ring-emerald-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm opacity-85'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Scénario Offensif / Optimisé
                </span>
                <span className="text-xs font-bold text-slate-400">62% probabilité</span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Marge Brute Prévue</div>
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(prediction.scenarios.optimistic.totalMarginHt)}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    {prediction.scenarios.optimistic.marginPct}% du CA
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>RFA Fournisseurs :</span>
                    <strong className="text-emerald-600 font-mono">
                      {formatCurrency(prediction.scenarios.optimistic.rfaTotalHt)}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Écart vs Objectif :</span>
                    <strong className="text-emerald-600 font-mono">
                      +{formatCurrency(prediction.scenarios.optimistic.totalMarginHt - prediction.targetAnnualMarginHt)}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {prediction.scenarios.optimistic.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Action Plan for Titulaire */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Recommandations Stratégiques & Plan d'Action Fin d'Année
              </h3>
              <p className="text-xs text-slate-500">
                Actions concrètes identifiées par le moteur prédictif pour maximiser l'atterrissage de marge brute.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Gain potentiel cumulé : +8 285,50 € HT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {prediction.recommendations.map((rec) => (
            <div 
              key={rec.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    rec.priority === 'haute'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : rec.priority === 'moyenne'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    Priorité {rec.priority}
                  </span>

                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                    +{formatCurrency(rec.expectedMarginGainEuros)}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-end">
                {rec.actionType === 'reclamation_avoir' && onNavigateToDiscountsAudit ? (
                  <button
                    onClick={onNavigateToDiscountsAudit}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ouvrir l'audit des sous-remises</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">
                    Recommandé pour Q4
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
