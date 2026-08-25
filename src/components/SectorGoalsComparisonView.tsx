import React, { useState, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Pill, 
  Sparkles, 
  HeartPulse, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  DollarSign, 
  Percent, 
  BarChart3, 
  PieChart as PieIcon, 
  Calendar, 
  SlidersHorizontal, 
  Download, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle,
  Award,
  Users,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  ComposedChart, 
  Line, 
  Cell, 
  PieChart, 
  Pie, 
  ReferenceLine 
} from 'recharts';
import { 
  PharmacySectorKey, 
  SectorAnnualGoal, 
  SectorMonthlyBreakdown 
} from '../types/sectorGoals';
import { 
  INITIAL_SECTOR_GOALS, 
  MOCK_SECTOR_MONTHLY_DATA, 
  getSectorGoalsGlobalSummary 
} from '../data/mockSectorGoalsData';
import { formatCurrency, formatPercent, exportToCsv } from '../utils/formatters';

interface SectorGoalsComparisonViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const SectorGoalsComparisonView: React.FC<SectorGoalsComparisonViewProps> = ({
  onNavigateToTab
}) => {
  // Sector goals state (customizable via modal or inline simulator)
  const [sectorGoals, setSectorGoals] = useState<Record<PharmacySectorKey, SectorAnnualGoal>>(INITIAL_SECTOR_GOALS);
  const [selectedPeriod, setSelectedPeriod] = useState<'ytd' | 't1' | 't2' | 't3' | 't4' | 'year'>('ytd');
  const [activeChartTab, setActiveChartTab] = useState<'bar_comparison' | 'monthly_evolution' | 'mix_share' | 'subcategories'>('bar_comparison');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<PharmacySectorKey | 'all'>('all');
  const [isEditGoalsModalOpen, setIsEditGoalsModalOpen] = useState(false);
  const [tempGoals, setTempGoals] = useState({
    medicaments: sectorGoals.medicaments.annualGoalBudgetHt,
    parapharmacie: sectorGoals.parapharmacie.annualGoalBudgetHt,
    conseils: sectorGoals.conseils.annualGoalBudgetHt
  });

  // Calculate dynamic summary based on current goals
  const globalSummary = useMemo(() => {
    return getSectorGoalsGlobalSummary(sectorGoals, MOCK_SECTOR_MONTHLY_DATA);
  }, [sectorGoals]);

  // Filtered monthly data according to period selector
  const filteredMonthlyData = useMemo(() => {
    switch (selectedPeriod) {
      case 't1':
        return MOCK_SECTOR_MONTHLY_DATA.filter(m => m.quarter === 'T1');
      case 't2':
        return MOCK_SECTOR_MONTHLY_DATA.filter(m => m.quarter === 'T2');
      case 't3':
        return MOCK_SECTOR_MONTHLY_DATA.filter(m => m.quarter === 'T3');
      case 't4':
        return MOCK_SECTOR_MONTHLY_DATA.filter(m => m.quarter === 'T4');
      case 'ytd':
        return MOCK_SECTOR_MONTHLY_DATA.filter(m => !m.isProjected);
      case 'year':
      default:
        return MOCK_SECTOR_MONTHLY_DATA;
    }
  }, [selectedPeriod]);

  // Aggregate monthly data for the selected period
  const periodAggregates = useMemo(() => {
    const medRealise = filteredMonthlyData.reduce((sum, m) => sum + m.medicamentsRealiseHt, 0);
    const medObj = filteredMonthlyData.reduce((sum, m) => sum + m.medicamentsObjectifHt, 0);
    const paraRealise = filteredMonthlyData.reduce((sum, m) => sum + m.parapharmacieRealiseHt, 0);
    const paraObj = filteredMonthlyData.reduce((sum, m) => sum + m.parapharmacieObjectifHt, 0);
    const consRealise = filteredMonthlyData.reduce((sum, m) => sum + m.conseilsRealiseHt, 0);
    const consObj = filteredMonthlyData.reduce((sum, m) => sum + m.conseilsObjectifHt, 0);

    const totalRealise = medRealise + paraRealise + consRealise;
    const totalObj = medObj + paraObj + consObj;

    return {
      medicaments: { realise: medRealise, objectif: medObj, variance: medRealise - medObj, rate: (medRealise / medObj) * 100 },
      parapharmacie: { realise: paraRealise, objectif: paraObj, variance: paraRealise - paraObj, rate: (paraRealise / paraObj) * 100 },
      conseils: { realise: consRealise, objectif: consObj, variance: consRealise - consObj, rate: (consRealise / consObj) * 100 },
      total: { realise: totalRealise, objectif: totalObj, variance: totalRealise - totalObj, rate: (totalRealise / totalObj) * 100 }
    };
  }, [filteredMonthlyData]);

  // Data formatted for the Main Bar Comparison Chart
  const barComparisonChartData = useMemo(() => {
    return [
      {
        sectorKey: 'medicaments',
        name: 'Médicaments',
        fullName: 'Médicaments (Ordonnances)',
        realise: periodAggregates.medicaments.realise,
        objectif: periodAggregates.medicaments.objectif,
        variance: periodAggregates.medicaments.variance,
        rate: periodAggregates.medicaments.rate,
        annualBudget: sectorGoals.medicaments.annualGoalBudgetHt,
        fillColor: '#059669',
        targetColor: '#94a3b8'
      },
      {
        sectorKey: 'parapharmacie',
        name: 'Parapharmacie',
        fullName: 'Parapharmacie & Dermo-Cosmétique',
        realise: periodAggregates.parapharmacie.realise,
        objectif: periodAggregates.parapharmacie.objectif,
        variance: periodAggregates.parapharmacie.variance,
        rate: periodAggregates.parapharmacie.rate,
        annualBudget: sectorGoals.parapharmacie.annualGoalBudgetHt,
        fillColor: '#3b82f6',
        targetColor: '#94a3b8'
      },
      {
        sectorKey: 'conseils',
        name: 'Conseils & OTC',
        fullName: 'Conseils, Automédication & Actes',
        realise: periodAggregates.conseils.realise,
        objectif: periodAggregates.conseils.objectif,
        variance: periodAggregates.conseils.variance,
        rate: periodAggregates.conseils.rate,
        annualBudget: sectorGoals.conseils.annualGoalBudgetHt,
        fillColor: '#8b5cf6',
        targetColor: '#94a3b8'
      }
    ];
  }, [periodAggregates, sectorGoals]);

  // Donut chart data for Mix comparison (Actual vs Budgeted)
  const actualMixData = useMemo(() => {
    const total = periodAggregates.total.realise;
    return [
      { name: 'Médicaments', value: periodAggregates.medicaments.realise, pct: (periodAggregates.medicaments.realise / total) * 100, color: '#059669' },
      { name: 'Parapharmacie', value: periodAggregates.parapharmacie.realise, pct: (periodAggregates.parapharmacie.realise / total) * 100, color: '#3b82f6' },
      { name: 'Conseils & OTC', value: periodAggregates.conseils.realise, pct: (periodAggregates.conseils.realise / total) * 100, color: '#8b5cf6' }
    ];
  }, [periodAggregates]);

  const targetMixData = useMemo(() => {
    const total = periodAggregates.total.objectif;
    return [
      { name: 'Médicaments', value: periodAggregates.medicaments.objectif, pct: (periodAggregates.medicaments.objectif / total) * 100, color: '#059669' },
      { name: 'Parapharmacie', value: periodAggregates.parapharmacie.objectif, pct: (periodAggregates.parapharmacie.objectif / total) * 100, color: '#3b82f6' },
      { name: 'Conseils & OTC', value: periodAggregates.conseils.objectif, pct: (periodAggregates.conseils.objectif / total) * 100, color: '#8b5cf6' }
    ];
  }, [periodAggregates]);

  // Handler to update sector goals
  const handleSaveUpdatedGoals = () => {
    const ytdRatio = 8 / 12; // 8 months elapsed
    
    setSectorGoals({
      medicaments: {
        ...sectorGoals.medicaments,
        annualGoalBudgetHt: tempGoals.medicaments,
        ytdGoalBudgetHt: Math.round(tempGoals.medicaments * ytdRatio),
        achievementRatePct: Number(((sectorGoals.medicaments.ytdRealisedHt / (tempGoals.medicaments * ytdRatio)) * 100).toFixed(2)),
        varianceAmountHt: sectorGoals.medicaments.ytdRealisedHt - Math.round(tempGoals.medicaments * ytdRatio),
        variancePct: Number((((sectorGoals.medicaments.ytdRealisedHt - (tempGoals.medicaments * ytdRatio)) / (tempGoals.medicaments * ytdRatio)) * 100).toFixed(2))
      },
      parapharmacie: {
        ...sectorGoals.parapharmacie,
        annualGoalBudgetHt: tempGoals.parapharmacie,
        ytdGoalBudgetHt: Math.round(tempGoals.parapharmacie * ytdRatio),
        achievementRatePct: Number(((sectorGoals.parapharmacie.ytdRealisedHt / (tempGoals.parapharmacie * ytdRatio)) * 100).toFixed(2)),
        varianceAmountHt: sectorGoals.parapharmacie.ytdRealisedHt - Math.round(tempGoals.parapharmacie * ytdRatio),
        variancePct: Number((((sectorGoals.parapharmacie.ytdRealisedHt - (tempGoals.parapharmacie * ytdRatio)) / (tempGoals.parapharmacie * ytdRatio)) * 100).toFixed(2))
      },
      conseils: {
        ...sectorGoals.conseils,
        annualGoalBudgetHt: tempGoals.conseils,
        ytdGoalBudgetHt: Math.round(tempGoals.conseils * ytdRatio),
        achievementRatePct: Number(((sectorGoals.conseils.ytdRealisedHt / (tempGoals.conseils * ytdRatio)) * 100).toFixed(2)),
        varianceAmountHt: sectorGoals.conseils.ytdRealisedHt - Math.round(tempGoals.conseils * ytdRatio),
        variancePct: Number((((sectorGoals.conseils.ytdRealisedHt - (tempGoals.conseils * ytdRatio)) / (tempGoals.conseils * ytdRatio)) * 100).toFixed(2))
      }
    });

    setIsEditGoalsModalOpen(false);
  };

  const handleResetGoals = () => {
    setSectorGoals(INITIAL_SECTOR_GOALS);
    setTempGoals({
      medicaments: INITIAL_SECTOR_GOALS.medicaments.annualGoalBudgetHt,
      parapharmacie: INITIAL_SECTOR_GOALS.parapharmacie.annualGoalBudgetHt,
      conseils: INITIAL_SECTOR_GOALS.conseils.annualGoalBudgetHt
    });
  };

  // Export to CSV
  const handleExportCsv = () => {
    const exportRows: any[] = [];

    // Summary row
    exportRows.push({
      'Secteur': 'GLOBAL OFFICINE',
      'Objectif Annuel 2026 (€ HT)': globalSummary.totalAnnualBudgetGoalHt,
      'Objectif Cumulé YTD (€ HT)': globalSummary.totalYtdBudgetGoalHt,
      'Réalisé YTD (€ HT)': globalSummary.totalYtdRealisedHt,
      'Taux d\'Atteinte (%)': globalSummary.globalAchievementRatePct.toFixed(2),
      'Écart (€ HT)': globalSummary.globalVarianceAmountHt,
      'Écart (%)': globalSummary.globalVariancePct.toFixed(2),
      'Marge Brute Réalisée (€ HT)': globalSummary.totalYtdMarginHt,
      'Taux Marge (%)': globalSummary.globalAverageMarginPct.toFixed(2),
      'Atterrissage Prévisionnel 31/12 (€ HT)': globalSummary.projectedAnnualLandingHt
    });

    // Sectors
    Object.values(sectorGoals).forEach(s => {
      exportRows.push({
        'Secteur': s.label,
        'Objectif Annuel 2026 (€ HT)': s.annualGoalBudgetHt,
        'Objectif Cumulé YTD (€ HT)': s.ytdGoalBudgetHt,
        'Réalisé YTD (€ HT)': s.ytdRealisedHt,
        'Taux d\'Atteinte (%)': s.achievementRatePct.toFixed(2),
        'Écart (€ HT)': s.varianceAmountHt,
        'Écart (%)': s.variancePct.toFixed(2),
        'Marge Brute Réalisée (€ HT)': s.ytdMarginRealisedHt,
        'Taux Marge (%)': s.averageMarginRatePct.toFixed(2),
        'Atterrissage Prévisionnel 31/12 (€ HT)': s.yearEndProjectedLandingHt
      });

      // Sub-categories
      s.subCategories.forEach(sub => {
        exportRows.push({
          'Secteur': `  └─ ${sub.name}`,
          'Objectif Annuel 2026 (€ HT)': '-',
          'Objectif Cumulé YTD (€ HT)': sub.objectifYtdHt,
          'Réalisé YTD (€ HT)': sub.realiseYtdHt,
          'Taux d\'Atteinte (%)': sub.achievementRatePct.toFixed(2),
          'Écart (€ HT)': sub.realiseYtdHt - sub.objectifYtdHt,
          'Écart (%)': (((sub.realiseYtdHt - sub.objectifYtdHt) / sub.objectifYtdHt) * 100).toFixed(2),
          'Marge Brute Réalisée (€ HT)': (sub.realiseYtdHt * (sub.marginRatePct / 100)).toFixed(0),
          'Taux Marge (%)': sub.marginRatePct.toFixed(2),
          'Atterrissage Prévisionnel 31/12 (€ HT)': '-'
        });
      });
    });

    exportToCsv(exportRows, 'comparatif_secteurs_vs_objectifs_officine_2026');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                <Target className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Visualisation par Secteurs : Réalisé vs Objectifs Annuels
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Suivi comparatif des 3 piliers officinaux : <strong>Médicaments</strong> (Prescription & Éthique), <strong>Parapharmacie</strong> & <strong>Conseils / OTC</strong> par rapport aux objectifs budgétés en début d'année.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setTempGoals({
                  medicaments: sectorGoals.medicaments.annualGoalBudgetHt,
                  parapharmacie: sectorGoals.parapharmacie.annualGoalBudgetHt,
                  conseils: sectorGoals.conseils.annualGoalBudgetHt
                });
                setIsEditGoalsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Ajuster les Objectifs Fixés</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Global Key Figures Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              CA Réalisé Cumulé YTD
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {formatCurrency(globalSummary.totalYtdRealisedHt)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Taux d'atteinte : {globalSummary.globalAchievementRatePct.toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Objectif YTD Budgété (8 mois)
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-700 dark:text-slate-300 font-mono mt-0.5">
              {formatCurrency(globalSummary.totalYtdBudgetGoalHt)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Sur {formatCurrency(globalSummary.totalAnnualBudgetGoalHt)} / an
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Écart Global vs Objectif
            </div>
            <div className={`text-lg sm:text-xl font-black font-mono mt-0.5 ${
              globalSummary.globalVarianceAmountHt >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {globalSummary.globalVarianceAmountHt >= 0 ? '+' : ''}{formatCurrency(globalSummary.globalVarianceAmountHt)}
            </div>
            <div className={`text-[11px] font-bold mt-1 ${
              globalSummary.globalVarianceAmountHt >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {globalSummary.globalVariancePct >= 0 ? '+' : ''}{globalSummary.globalVariancePct.toFixed(1)}% d'avance nette
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Atterrissage Estimé 31/12
            </div>
            <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
              {formatCurrency(globalSummary.projectedAnnualLandingHt)}
            </div>
            <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mt-1">
              +{(globalSummary.projectedAnnualLandingHt - globalSummary.totalAnnualBudgetGoalHt) > 0 ? '+' : ''}
              {formatCurrency(globalSummary.projectedAnnualLandingHt - globalSummary.totalAnnualBudgetGoalHt)} vs Budget
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Sector Cards (Médicaments, Parapharmacie, Conseils) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Médicaments */}
        <div className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition ${
          selectedSectorFilter === 'medicaments' 
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                <Pill className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  Secteur Éthique & Prescription
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Médicaments
                </h3>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {sectorGoals.medicaments.achievementRatePct.toFixed(1)}% atteint
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">CA Réalisé (YTD) :</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(sectorGoals.medicaments.ytdRealisedHt)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Objectif YTD Budgété :</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
                {formatCurrency(sectorGoals.medicaments.ytdGoalBudgetHt)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Écart vs Objectif :</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +{formatCurrency(sectorGoals.medicaments.varianceAmountHt)} (+{sectorGoals.medicaments.variancePct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, sectorGoals.medicaments.achievementRatePct)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>0 €</span>
              <span>Objectif Annuel : {formatCurrency(sectorGoals.medicaments.annualGoalBudgetHt)}</span>
            </div>
          </div>

          {/* Key metrics footer */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-400">Poids dans le Mix</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {sectorGoals.medicaments.actualMixSharePct.toFixed(1)}% <span className="text-[9px] text-slate-400 font-normal">(Cible {sectorGoals.medicaments.targetMixSharePct.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-400">Taux de Marge Moy.</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {sectorGoals.medicaments.averageMarginRatePct}% HT
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Parapharmacie */}
        <div className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition ${
          selectedSectorFilter === 'parapharmacie' 
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                  Secteur Libre & Dermo
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Parapharmacie
                </h3>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
              {sectorGoals.parapharmacie.achievementRatePct.toFixed(1)}% atteint
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">CA Réalisé (YTD) :</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(sectorGoals.parapharmacie.ytdRealisedHt)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Objectif YTD Budgété :</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
                {formatCurrency(sectorGoals.parapharmacie.ytdGoalBudgetHt)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Écart vs Objectif :</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(sectorGoals.parapharmacie.varianceAmountHt)} ({sectorGoals.parapharmacie.variancePct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, sectorGoals.parapharmacie.achievementRatePct)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>0 €</span>
              <span>Objectif Annuel : {formatCurrency(sectorGoals.parapharmacie.annualGoalBudgetHt)}</span>
            </div>
          </div>

          {/* Key metrics footer */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-400">Poids dans le Mix</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {sectorGoals.parapharmacie.actualMixSharePct.toFixed(1)}% <span className="text-[9px] text-slate-400 font-normal">(Cible {sectorGoals.parapharmacie.targetMixSharePct.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-400">Taux de Marge Moy.</div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                {sectorGoals.parapharmacie.averageMarginRatePct}% HT
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Conseils & OTC */}
        <div className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border transition ${
          selectedSectorFilter === 'conseils' 
            ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md' 
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                <HeartPulse className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  Secteur Conseil & Rentabilité
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Conseils & OTC
                </h3>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
              {sectorGoals.conseils.achievementRatePct.toFixed(1)}% atteint
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">CA Réalisé (YTD) :</span>
              <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                {formatCurrency(sectorGoals.conseils.ytdRealisedHt)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Objectif YTD Budgété :</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
                {formatCurrency(sectorGoals.conseils.ytdGoalBudgetHt)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">Écart vs Objectif :</span>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                +{formatCurrency(sectorGoals.conseils.varianceAmountHt)} (+{sectorGoals.conseils.variancePct.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, sectorGoals.conseils.achievementRatePct)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>0 €</span>
              <span>Objectif Annuel : {formatCurrency(sectorGoals.conseils.annualGoalBudgetHt)}</span>
            </div>
          </div>

          {/* Key metrics footer */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-400">Poids dans le Mix</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {sectorGoals.conseils.actualMixSharePct.toFixed(1)}% <span className="text-[9px] text-slate-400 font-normal">(Cible {sectorGoals.conseils.targetMixSharePct.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div className="text-[10px] text-slate-400">Taux de Marge Moy.</div>
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                {sectorGoals.conseils.averageMarginRatePct}% HT
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Interactive Graphical Workspace */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Controls Ribbon: Chart Views & Time Period Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          
          {/* Chart View Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveChartTab('bar_comparison')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === 'bar_comparison'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Comparatif Réalisé vs Objectif</span>
            </button>

            <button
              onClick={() => setActiveChartTab('monthly_evolution')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === 'monthly_evolution'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Évolution Mensuelle (12 Mois)</span>
            </button>

            <button
              onClick={() => setActiveChartTab('mix_share')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === 'mix_share'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Mix Produit (Réalisé vs Cible)</span>
            </button>

            <button
              onClick={() => setActiveChartTab('subcategories')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChartTab === 'subcategories'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Détail Sous-Familles</span>
            </button>
          </div>

          {/* Period Filter Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Période :</span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setSelectedPeriod('ytd')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPeriod === 'ytd' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cumul YTD (8m)
              </button>
              <button
                onClick={() => setSelectedPeriod('t1')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPeriod === 't1' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                T1
              </button>
              <button
                onClick={() => setSelectedPeriod('t2')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPeriod === 't2' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                T2
              </button>
              <button
                onClick={() => setSelectedPeriod('t3')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPeriod === 't3' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                T3
              </button>
              <button
                onClick={() => setSelectedPeriod('t4')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPeriod === 't4' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                T4
              </button>
              <button
                onClick={() => setSelectedPeriod('year')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedPeriod === 'year' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                12 Mois
              </button>
            </div>
          </div>

        </div>

        {/* VIEW 1: BAR COMPARISON (Réalisé vs Objectif Budgété) */}
        {activeChartTab === 'bar_comparison' && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chiffre d'Affaires HT Réalisé vs Objectif Fixé en Début d'Année ({selectedPeriod === 'ytd' ? 'Cumul 8 mois' : selectedPeriod.toUpperCase()})
                </h3>
                <p className="text-xs text-slate-500">
                  Comparaison directe des montants générés et des taux de réalisation par rapport aux prévisions budgétaires.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-400" />
                  <span className="text-slate-500">Objectif Fixé</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">CA Réalisé</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barComparisonChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontVariant="bold" />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${(val / 1000).toFixed(0)} k€`} />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatCurrency(Number(value)),
                      name === 'objectif' ? 'Objectif Fixé (€ HT)' : 'CA Réalisé (€ HT)'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend 
                    formatter={(value) => value === 'objectif' ? 'Objectif Budgété en début d\'année' : 'Chiffre d\'Affaires Réalisé'}
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                  />
                  <Bar dataKey="objectif" name="objectif" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="realise" name="realise" radius={[6, 6, 0, 0]} barSize={40}>
                    {barComparisonChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fillColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Variance Summary Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Secteur Officinal</th>
                    <th className="py-2.5 px-3 text-right">Objectif Début d'Année</th>
                    <th className="py-2.5 px-3 text-right">Objectif Période</th>
                    <th className="py-2.5 px-3 text-right">CA Réalisé</th>
                    <th className="py-2.5 px-3 text-center">Taux d'Atteinte</th>
                    <th className="py-2.5 px-3 text-right">Écart (€ HT)</th>
                    <th className="py-2.5 px-3 text-right">Écart (%)</th>
                    <th className="py-2.5 px-3 text-center">Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {barComparisonChartData.map((item) => {
                    const isPositive = item.variance >= 0;
                    return (
                      <tr key={item.sectorKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fillColor }} />
                          <span>{item.fullName}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          {formatCurrency(item.annualBudget)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatCurrency(item.objectif)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.realise)}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                            item.rate >= 100 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                              : item.rate >= 95 
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}>
                            {item.rate.toFixed(1)}%
                          </span>
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isPositive ? '+' : ''}{formatCurrency(item.variance)}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isPositive ? '+' : ''}{(((item.realise - item.objectif) / item.objectif) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.rate >= 100 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3" /> En Avance
                            </span>
                          ) : item.rate >= 95 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3" /> À Surveiller
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3" /> Sous-performance
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* Total row */}
                  <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                    <td className="py-3 px-3 text-slate-900 dark:text-white uppercase text-[11px] tracking-wider">
                      TOTAL PHARMACIE
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(globalSummary.totalAnnualBudgetGoalHt)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(periodAggregates.total.objectif)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-700 dark:text-indigo-400 text-sm">
                      {formatCurrency(periodAggregates.total.realise)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                        {periodAggregates.total.rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-mono ${
                      periodAggregates.total.variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {periodAggregates.total.variance >= 0 ? '+' : ''}{formatCurrency(periodAggregates.total.variance)}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono ${
                      periodAggregates.total.variance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {periodAggregates.total.variance >= 0 ? '+' : ''}{(((periodAggregates.total.realise - periodAggregates.total.objectif) / periodAggregates.total.objectif) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Objectif Global Atteint
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: MONTHLY EVOLUTION (12 Months Stacked + Curves) */}
        {activeChartTab === 'monthly_evolution' && (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Évolution Mensuelle Détaillée du Chiffre d'Affaires par Secteur vs Ligne d'Objectif
                </h3>
                <p className="text-xs text-slate-500">
                  Vue cumulée par mois de janvier à décembre 2026. Les barres représentent le CA réalisé par secteur, la courbe indique l'objectif mensuel total.
                </p>
              </div>

              {/* Sector focus selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setSelectedSectorFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    selectedSectorFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Tous Secteurs
                </button>
                <button
                  onClick={() => setSelectedSectorFilter('medicaments')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    selectedSectorFilter === 'medicaments' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Médicaments
                </button>
                <button
                  onClick={() => setSelectedSectorFilter('parapharmacie')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    selectedSectorFilter === 'parapharmacie' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Parapharmacie
                </button>
                <button
                  onClick={() => setSelectedSectorFilter('conseils')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    selectedSectorFilter === 'conseils' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Conseils / OTC
                </button>
              </div>
            </div>

            {/* Recharts Composed Monthly Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={MOCK_SECTOR_MONTHLY_DATA} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis dataKey="fullMonth" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)} k€`} />
                  <Tooltip
                    formatter={(value: any, name: any) => [formatCurrency(Number(value)), name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {/* Render based on filter */}
                  {selectedSectorFilter === 'all' && (
                    <>
                      <Bar dataKey="medicamentsRealiseHt" name="Médicaments (€ HT)" stackId="a" fill="#059669" />
                      <Bar dataKey="parapharmacieRealiseHt" name="Parapharmacie (€ HT)" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="conseilsRealiseHt" name="Conseils & OTC (€ HT)" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="totalObjectifHt" name="Objectif Total Budgété (€ HT)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                    </>
                  )}

                  {selectedSectorFilter === 'medicaments' && (
                    <>
                      <Bar dataKey="medicamentsRealiseHt" name="Médicaments Réalisé (€ HT)" fill="#059669" radius={[4, 4, 0, 0]} barSize={35} />
                      <Line type="monotone" dataKey="medicamentsObjectifHt" name="Objectif Médicaments (€ HT)" stroke="#047857" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 4 }} />
                    </>
                  )}

                  {selectedSectorFilter === 'parapharmacie' && (
                    <>
                      <Bar dataKey="parapharmacieRealiseHt" name="Parapharmacie Réalisé (€ HT)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                      <Line type="monotone" dataKey="parapharmacieObjectifHt" name="Objectif Parapharmacie (€ HT)" stroke="#1d4ed8" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 4 }} />
                    </>
                  )}

                  {selectedSectorFilter === 'conseils' && (
                    <>
                      <Bar dataKey="conseilsRealiseHt" name="Conseils / OTC Réalisé (€ HT)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={35} />
                      <Line type="monotone" dataKey="conseilsObjectifHt" name="Objectif Conseils (€ HT)" stroke="#6d28d9" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 4 }} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Lecture de la saisonnalité :</strong> Les mois de Septembre à Décembre intègrent l'atterrissage prévisionnel (run-rate basé sur N-1 + tendance 2026). Le pic de fin d'année (Novembre-Décembre) est historiquement boosté par les coffrets dermo-cosmétiques de Noël et la campagne hivernale OTC.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: MIX SHARE COMPARISON (Donuts Réalisé vs Cible) */}
        {activeChartTab === 'mix_share' && (
          <div className="space-y-6 pt-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Structure du Chiffre d'Affaires : Mix Réalisé vs Mix Budgété
              </h3>
              <p className="text-xs text-slate-500">
                Poids relatif de chaque secteur dans l'activité globale de l'officine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Left Donut: Actual Mix */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Mix Réalisé YTD ({formatCurrency(periodAggregates.total.realise)})
                </h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={actualMixData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {actualMixData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [formatCurrency(Number(val)), 'CA']}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs mt-2">
                  {actualMixData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name} : {item.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Donut: Target Mix */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Mix Objectif Budgété ({formatCurrency(periodAggregates.total.objectif)})
                </h4>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={targetMixData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {targetMixData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val: any) => [formatCurrency(Number(val)), 'Objectif']}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 text-xs mt-2">
                  {targetMixData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name} : {item.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Mix Analysis Note */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">Médicaments (+0,1 pt vs Cible)</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Représente 66,1% du CA total (cible 66,0%). Base stable et récurrente sécurisant le fonds de commerce.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
                <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">Parapharmacie (-1,1 pt vs Cible)</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Représente 17,4% du CA (cible 18,5%). Levier de marge à redynamiser par des actions de cross-selling.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs">
                <span className="font-bold text-purple-800 dark:text-purple-300 block mb-1">Conseils & OTC (+1,0 pt vs Cible)</span>
                <p className="text-slate-600 dark:text-slate-300">
                  Représente 16,5% du CA (cible 15,5%). Moteur de rentabilité avec un taux de marge brute record à 47,6%.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: DETAILED SUBCATEGORIES */}
        {activeChartTab === 'subcategories' && (
          <div className="space-y-6 pt-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Analyse Fine par Sous-Catégories et Familles de Produits
              </h3>
              <p className="text-xs text-slate-500">
                Performance détaillée des rayons au sein de chaque grand secteur d'activité.
              </p>
            </div>

            <div className="space-y-6">
              {Object.values(sectorGoals).map(sector => (
                <div key={sector.sectorKey} className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700/70">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {sector.label}
                      </h4>
                      <span className="text-xs text-slate-400">({sector.tvaRates})</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      Total Réalisé : {formatCurrency(sector.ytdRealisedHt)} / Obj {formatCurrency(sector.ytdGoalBudgetHt)} ({sector.achievementRatePct.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sector.subCategories.map(sub => (
                      <div key={sub.id} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Part dans le secteur : {sub.shareInSectorPct}% | Marge : {sub.marginRatePct}%
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                            sub.achievementRatePct >= 100 
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}>
                            {sub.achievementRatePct.toFixed(1)}%
                          </span>
                        </div>

                        <div className="mt-2.5">
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(100, sub.achievementRatePct)}%`,
                                backgroundColor: sector.color 
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span>Réalisé : <strong className="text-slate-800 dark:text-slate-200">{formatCurrency(sub.realiseYtdHt)}</strong></span>
                          <span>Objectif : {formatCurrency(sub.objectifYtdHt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Strategic Management Plan & Insights for the Pharmacist Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            <Zap className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Plan d'Action Stratégique & Recommandations Managériales par Secteur
            </h3>
            <p className="text-xs text-slate-500">
              Leviers d'optimisation opérationnels pour atteindre et dépasser les objectifs annuels 2026.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(sectorGoals).map(sector => (
            <div key={sector.sectorKey} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sector.color }} />
                    {sector.shortLabel}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    sector.managerialInsights.status === 'en_avance'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}>
                    {sector.managerialInsights.statusLabel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-3">
                  "{sector.managerialInsights.keyObservation}"
                </p>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Actions Prioritaires Équipe :
                  </span>
                  {sector.managerialInsights.recommendedActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <span className="text-slate-400">Atterrissage estimé :</span>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(sector.yearEndProjectedLandingHt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: EDIT ANNUAL GOALS (Simulateur / Recalculateur d'Objectifs) */}
      {isEditGoalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ajuster les Objectifs Fixés en Début d'Année
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modifiez le budget annuel par secteur pour recalculer les écarts et projections d'atterrissage.
                  </p>
                </div>
              </div>
            </div>

            {/* Inputs for each sector */}
            <div className="space-y-4 pt-2">
              
              {/* Médicaments */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <label className="flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
                  <span>Médicaments (Prescription & ALD)</span>
                  <span className="font-mono">{formatCurrency(tempGoals.medicaments)}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1000000"
                    max="1500000"
                    step="10000"
                    value={tempGoals.medicaments}
                    onChange={(e) => setTempGoals({ ...tempGoals, medicaments: Number(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>1 000 000 €</span>
                  <span>1 500 000 €</span>
                </div>
              </div>

              {/* Parapharmacie */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
                <label className="flex justify-between items-center text-xs font-bold text-blue-900 dark:text-blue-300 mb-1.5">
                  <span>Parapharmacie & Dermo-Cosmétique</span>
                  <span className="font-mono">{formatCurrency(tempGoals.parapharmacie)}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="200000"
                    max="500000"
                    step="5000"
                    value={tempGoals.parapharmacie}
                    onChange={(e) => setTempGoals({ ...tempGoals, parapharmacie: Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>200 000 €</span>
                  <span>500 000 €</span>
                </div>
              </div>

              {/* Conseils / OTC */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
                <label className="flex justify-between items-center text-xs font-bold text-purple-900 dark:text-purple-300 mb-1.5">
                  <span>Conseils, OTC & Micronutrition</span>
                  <span className="font-mono">{formatCurrency(tempGoals.conseils)}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="150000"
                    max="450000"
                    step="5000"
                    value={tempGoals.conseils}
                    onChange={(e) => setTempGoals({ ...tempGoals, conseils: Number(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>150 000 €</span>
                  <span>450 000 €</span>
                </div>
              </div>

              {/* Total simulation */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Objectif Annuel Total Simulé :</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                  {formatCurrency(tempGoals.medicaments + tempGoals.parapharmacie + tempGoals.conseils)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleResetGoals}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Réinitialiser aux valeurs initiales
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditGoalsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveUpdatedGoals}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-900/20 cursor-pointer"
                >
                  Appliquer les Nouveaux Objectifs
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
