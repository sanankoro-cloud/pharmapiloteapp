import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  DollarSign, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Calculator, 
  Eye, 
  ExternalLink, 
  Pill, 
  Heart, 
  ShieldCheck, 
  Flame, 
  Lightbulb, 
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie, 
  ScatterChart, 
  Scatter, 
  ZAxis
} from 'recharts';
import { 
  TherapeuticClassSummary, 
  ProductMarginDetail, 
  TherapeuticFilterState, 
  PricingRegimeType, 
  TherapeuticProfitabilityTier, 
  BcgSegmentQuadrant 
} from '../types/productTherapeuticMargin';
import { 
  MOCK_THERAPEUTIC_CLASSES, 
  MOCK_PRODUCT_MARGIN_DETAILS, 
  MOCK_THEAPEUTIC_GLOBAL_STATS 
} from '../data/mockProductTherapeuticMargin';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface ProductMarginTherapeuticDashboardProps {
  onNavigateTab?: (tab: string) => void;
}

export const ProductMarginTherapeuticDashboard: React.FC<ProductMarginTherapeuticDashboardProps> = () => {
  // Main view tabs: 'references_table' | 'classes_ranking' | 'matrix_bcg' | 'simulator'
  const [activeSubTab, setActiveSubTab] = useState<'references_table' | 'classes_ranking' | 'matrix_bcg'>('references_table');
  
  // Selected class for drill-down / focus
  const [selectedClassId, setSelectedClassId] = useState<string | 'all'>('all');

  // Filters State
  const [filters, setFilters] = useState<TherapeuticFilterState>({
    searchQuery: '',
    selectedClasses: [],
    selectedPricingRegime: 'tous',
    selectedProfitabilityTier: 'tous',
    selectedBcgQuadrant: 'tous',
    minMarginRatePct: 0,
    maxMarginRatePct: 100,
    onlyGenerics: null,
    sortBy: 'marginRatePct',
    sortDirection: 'desc'
  });

  // Modal State for Margin Simulator
  const [selectedProductForSimulation, setSelectedProductForSimulation] = useState<ProductMarginDetail | null>(null);
  const [simulatedPriceTtc, setSimulatedPriceTtc] = useState<number>(0);
  const [simulatedDiscountPct, setSimulatedDiscountPct] = useState<number>(0);
  const [simulatedPumpHt, setSimulatedPumpHt] = useState<number>(0);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Selected Class Object
  const currentClassObj = useMemo(() => {
    if (selectedClassId === 'all') return null;
    return MOCK_THERAPEUTIC_CLASSES.find(c => c.id === selectedClassId) || null;
  }, [selectedClassId]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCT_MARGIN_DETAILS.filter(prod => {
      // Class filter
      if (selectedClassId !== 'all' && prod.therapeuticClassId !== selectedClassId) {
        return false;
      }
      if (filters.selectedClasses.length > 0 && !filters.selectedClasses.includes(prod.therapeuticClassId)) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchCip = prod.cip.includes(q);
        const matchDci = prod.dci?.toLowerCase().includes(q) || false;
        const matchLab = prod.laboratory.toLowerCase().includes(q);
        const matchClass = prod.therapeuticClassName.toLowerCase().includes(q);
        if (!matchName && !matchCip && !matchDci && !matchLab && !matchClass) {
          return false;
        }
      }

      // Pricing regime
      if (filters.selectedPricingRegime !== 'tous' && prod.pricingRegime !== filters.selectedPricingRegime) {
        return false;
      }

      // Profitability tier
      if (filters.selectedProfitabilityTier !== 'tous' && prod.profitabilityLevel !== filters.selectedProfitabilityTier) {
        return false;
      }

      // BCG Quadrant
      if (filters.selectedBcgQuadrant !== 'tous' && prod.bcgQuadrant !== filters.selectedBcgQuadrant) {
        return false;
      }

      // Generics
      if (filters.onlyGenerics !== null) {
        if (filters.onlyGenerics && !prod.isGeneric) return false;
        if (!filters.onlyGenerics && prod.isGeneric) return false;
      }

      // Margin range
      if (prod.marginRatePct < filters.minMarginRatePct || prod.marginRatePct > filters.maxMarginRatePct) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[filters.sortBy];
      let valB: any = b[filters.sortBy];

      if (typeof valA === 'string') {
        return filters.sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      return filters.sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [filters, selectedClassId]);

  // Aggregate stats on filtered products
  const filteredStats = useMemo(() => {
    const totalCa = filteredProducts.reduce((acc, p) => acc + p.monthlyCaHt, 0);
    const totalMarge = filteredProducts.reduce((acc, p) => acc + p.monthlyMarginHt, 0);
    const totalUnits = filteredProducts.reduce((acc, p) => acc + p.monthlyUnitsSold, 0);
    const avgMarginPct = totalCa > 0 ? (totalMarge / totalCa) * 100 : 0;
    const avgMarkup = filteredProducts.length > 0 
      ? filteredProducts.reduce((acc, p) => acc + p.markupMultiplier, 0) / filteredProducts.length 
      : 0;

    return {
      count: filteredProducts.length,
      totalCa,
      totalMarge,
      totalUnits,
      avgMarginPct,
      avgMarkup
    };
  }, [filteredProducts]);

  // Open Simulator
  const handleOpenSimulator = (prod: ProductMarginDetail) => {
    setSelectedProductForSimulation(prod);
    setSimulatedPriceTtc(prod.publicPriceTtc);
    setSimulatedDiscountPct(prod.counterDiscountAveragePct || 0);
    setSimulatedPumpHt(prod.pumpHt);
  };

  // Recalculate Simulation Values
  const simulationResults = useMemo(() => {
    if (!selectedProductForSimulation) return null;
    const prod = selectedProductForSimulation;
    
    // Effective selling price TTC after discount
    const effectivePriceTtc = simulatedPriceTtc * (1 - simulatedDiscountPct / 100);
    // Effective selling price HT
    const effectivePriceHt = effectivePriceTtc / (1 + prod.tvaPct / 100);
    // Unit margin HT
    const unitMarginHt = effectivePriceHt - simulatedPumpHt;
    // Margin rate %
    const marginRatePct = effectivePriceHt > 0 ? (unitMarginHt / effectivePriceHt) * 100 : 0;
    // Markup multiplier
    const markupMultiplier = simulatedPumpHt > 0 ? effectivePriceTtc / simulatedPumpHt : 0;
    // Monthly delta vs current
    const monthlyMarginHt = unitMarginHt * prod.monthlyUnitsSold;
    const monthlyMarginDeltaEur = monthlyMarginHt - prod.monthlyMarginHt;
    const annualMarginDeltaEur = monthlyMarginDeltaEur * 12;

    return {
      effectivePriceTtc,
      effectivePriceHt,
      unitMarginHt,
      marginRatePct,
      markupMultiplier,
      monthlyMarginHt,
      monthlyMarginDeltaEur,
      annualMarginDeltaEur,
      isFloorBreached: marginRatePct < 15.0
    };
  }, [selectedProductForSimulation, simulatedPriceTtc, simulatedDiscountPct, simulatedPumpHt]);

  // Export CSV of Product Margins
  const handleExportCsv = () => {
    const headers = [
      'Code_CIP',
      'Designation',
      'DCI',
      'Classe_Therapeutique',
      'Laboratoire',
      'Regime_Prix',
      'Generique',
      'PUMP_HT',
      'Prix_Public_TTC',
      'TVA_Pct',
      'Marge_Unitaire_HT',
      'Taux_Marge_Pct',
      'Coeff_Multiplicateur',
      'Volume_Mensuel_Unites',
      'CA_Mensuel_HT',
      'Marge_Mensuelle_HT',
      'Contribution_Marge_Officine_Pct',
      'Remise_Moyenne_Pct',
      'Niveau_Rentabilite',
      'Cadran_BCG'
    ];

    const rows = filteredProducts.map(p => [
      `"${p.cip}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.dci || ''}"`,
      `"${p.therapeuticClassName}"`,
      `"${p.laboratory}"`,
      `"${p.pricingRegime}"`,
      p.isGeneric ? 'OUI' : 'NON',
      p.pumpHt.toFixed(2),
      p.publicPriceTtc.toFixed(2),
      p.tvaPct.toFixed(1),
      p.unitMarginEur.toFixed(2),
      p.marginRatePct.toFixed(2),
      p.markupMultiplier.toFixed(2),
      p.monthlyUnitsSold,
      p.monthlyCaHt.toFixed(2),
      p.monthlyMarginHt.toFixed(2),
      p.marginContributionOfficePct.toFixed(2),
      p.counterDiscountAveragePct.toFixed(1),
      `"${p.profitabilityLevel}"`,
      `"${p.bcgQuadrant}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Marges_Produits_Classes_Therapeutiques_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setActionSuccessMsg('Export CSV des marges par produit et classes thérapeutiques généré.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Helper badge for tier
  const renderTierBadge = (tier: TherapeuticProfitabilityTier) => {
    switch (tier) {
      case 'ultra_rentable':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">🌟 Ultra Rentable (&gt; 45%)</span>;
      case 'forte_rentabilite':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">💎 Forte Marge (35-45%)</span>;
      case 'rentabilite_standard':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Standard (25-35%)</span>;
      case 'marge_regulee_faible':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Régulée SS (&lt; 25%)</span>;
      case 'marge_critique':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">⚠️ Critique (&lt; 15%)</span>;
    }
  };

  // Helper badge for BCG Quadrant
  const renderBcgBadge = (quadrant: BcgSegmentQuadrant) => {
    switch (quadrant) {
      case 'star_pepite':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">⭐ Pépite Star</span>;
      case 'vache_a_lait':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">🥛 Vache à Lait</span>;
      case 'levier_potentiel':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">💡 Levier Conseil</span>;
      case 'surveillance_prix':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">🔍 Surveillance</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 shadow-xs">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Marges par Produit & Classes Thérapeutiques
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {MOCK_THERAPEUTIC_CLASSES.length} Classes • {MOCK_PRODUCT_MARGIN_DETAILS.length} Réf. Pilotes
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyse chirurgicale de la rentabilité par référence officinale et classe thérapeutique pour identifier immédiatement les <strong>segments pépites à forte marge</strong> et optimiser vos prix libres.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Export Marges CSV</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 text-xs font-bold ml-3"
          >
            Fermer
          </button>
        </div>
      )}

      {/* 4 KPI Summary Cards for Therapeutic Profitability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Global Average Margin */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marge Brute Moyenne</span>
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            {formatPercent(MOCK_THEAPEUTIC_GLOBAL_STATS.globalAverageMarginPct)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
            <span>CA Total: {formatCurrency(MOCK_THEAPEUTIC_GLOBAL_STATS.totalCaHtMonthly)} HT</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(MOCK_THEAPEUTIC_GLOBAL_STATS.totalMarginHtMonthly)} Marge</span>
          </div>
        </div>

        {/* Card 2: Top Profitability Rate Segment */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Segment N°1 en Marge %</span>
            <span className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatPercent(MOCK_THEAPEUTIC_GLOBAL_STATS.topSegmentByMarginPct.marginPct)}
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 truncate" title={MOCK_THEAPEUTIC_GLOBAL_STATS.topSegmentByMarginPct.name}>
            {MOCK_THEAPEUTIC_GLOBAL_STATS.topSegmentByMarginPct.name}
          </div>
        </div>

        {/* Card 3: Top Margin € Generator Segment */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Segment N°1 en Marge (€)</span>
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {formatCurrency(MOCK_THEAPEUTIC_GLOBAL_STATS.topSegmentByMarginEur.marginEur)}
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 truncate" title={MOCK_THEAPEUTIC_GLOBAL_STATS.topSegmentByMarginEur.name}>
            {MOCK_THEAPEUTIC_GLOBAL_STATS.topSegmentByMarginEur.name}
          </div>
        </div>

        {/* Card 4: Ultra Profitable vs Low Margin Counts */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mix de Rentabilité</span>
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xl font-black font-mono text-emerald-600">
                {MOCK_THEAPEUTIC_GLOBAL_STATS.ultraProfitableReferencesCount}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Pépites &gt; 45%</div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <div className="text-xl font-black font-mono text-slate-600 dark:text-slate-300">
                {MOCK_THEAPEUTIC_GLOBAL_STATS.lowMarginReferencesCount}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Régulées &lt; 20%</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 font-mono">
            {MOCK_THEAPEUTIC_GLOBAL_STATS.totalAnalyzedReferences} références sous contrôle
          </div>
        </div>
      </div>

      {/* Quick Interactive Selector Chips: 10 Therapeutic Classes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Filtrer par Classe Thérapeutique ({selectedClassId === 'all' ? 'Toutes les classes' : currentClassObj?.shortName}) :</span>
          </label>
          {selectedClassId !== 'all' && (
            <button
              onClick={() => setSelectedClassId('all')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Afficher toutes les classes
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedClassId('all')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2 cursor-pointer ${
              selectedClassId === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span>Toutes ({MOCK_THERAPEUTIC_CLASSES.length})</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {formatPercent(MOCK_THEAPEUTIC_GLOBAL_STATS.globalAverageMarginPct)}
            </span>
          </button>

          {MOCK_THERAPEUTIC_CLASSES.map(cls => {
            const isSelected = selectedClassId === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cls.color }} />
                <span>{cls.shortName}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isSelected 
                    ? 'bg-white text-indigo-700' 
                    : cls.averageMarginRatePct >= 40 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {formatPercent(cls.averageMarginRatePct)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* If a specific class is selected: Focus Summary Box */}
      {currentClassObj && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/60 shadow-xl space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  Code ATC: {currentClassObj.atcCodePrefix}
                </span>
                {renderTierBadge(currentClassObj.profitabilityTier)}
                {renderBcgBadge(currentClassObj.bcgQuadrant)}
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {currentClassObj.name}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                {currentClassObj.description}
              </p>
            </div>

            {/* Quick Metrics in Class */}
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-indigo-800/80 pt-3 md:pt-0 md:pl-6 shrink-0">
              <div>
                <div className="text-[10px] text-indigo-300 font-bold uppercase">Marge Moyenne</div>
                <div className="text-xl font-black font-mono text-emerald-400">
                  {formatPercent(currentClassObj.averageMarginRatePct)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-indigo-300 font-bold uppercase">Marge Mensuelle</div>
                <div className="text-xl font-black font-mono text-white">
                  {formatCurrency(currentClassObj.totalMargeHt)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-indigo-300 font-bold uppercase">Coeff Moyen</div>
                <div className="text-xl font-black font-mono text-amber-400">
                  x{currentClassObj.averageMarkupMultiplier.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Top Recommendation Bar */}
          <div className="p-3 rounded-2xl bg-indigo-900/40 border border-indigo-700/50 flex items-start gap-2.5 text-xs text-indigo-100">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Recommandation Stratégique : </strong>
              <span>{currentClassObj.topRecommendation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tabs: Navigation between Table, Ranking Charts, and BCG Profitability Matrix */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('references_table')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'references_table'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Tableau Détaillé des Références ({filteredProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('classes_ranking')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'classes_ranking'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Palmarès & Comparatif des Classes</span>
          </button>

          <button
            onClick={() => setActiveSubTab('matrix_bcg')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'matrix_bcg'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Matrice de Rentabilité vs Volume</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          {filteredStats.count} réf. • Marge moy. filtrée : <strong>{formatPercent(filteredStats.avgMarginPct)}</strong>
        </div>
      </div>

      {/* --- TAB 1 : REFERENCES TABLE VIEW --- */}
      {activeSubTab === 'references_table' && (
        <div className="space-y-4">
          
          {/* Advanced Multi-Filters Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Text Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher produit, DCI, CIP, labo..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Pricing Regime Filter */}
              <div>
                <select
                  value={filters.selectedPricingRegime}
                  onChange={(e) => setFilters({ ...filters, selectedPricingRegime: e.target.value as PricingRegimeType | 'tous' })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="tous">Tous Régimes de Prix</option>
                  <option value="prix_libre_otc">Prix Libre - OTC Automédication</option>
                  <option value="conseil_phyto_micro">Conseil Libre - Phyto & Micronutrition</option>
                  <option value="prix_libre_para">Prix Libre - Dermo-Cosmétique</option>
                  <option value="veterinaire">Prix Libre - Vétérinaire</option>
                  <option value="dispositif_medical">Dispositif Médical</option>
                  <option value="regule_remboursable">Prix Régulé - Remboursable SS</option>
                </select>
              </div>

              {/* Profitability Tier Filter */}
              <div>
                <select
                  value={filters.selectedProfitabilityTier}
                  onChange={(e) => setFilters({ ...filters, selectedProfitabilityTier: e.target.value as TherapeuticProfitabilityTier | 'tous' })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="tous">Toutes Tranches de Marge</option>
                  <option value="ultra_rentable">🌟 Ultra Rentable (&gt; 45%)</option>
                  <option value="forte_rentabilite">💎 Forte Rentabilité (35% - 45%)</option>
                  <option value="rentabilite_standard">Standard (25% - 35%)</option>
                  <option value="marge_regulee_faible">Marge Régulée (&lt; 25%)</option>
                  <option value="marge_critique">⚠️ Critique (&lt; 15%)</option>
                </select>
              </div>

              {/* Generics vs Princeps */}
              <div>
                <select
                  value={filters.onlyGenerics === null ? 'all' : filters.onlyGenerics ? 'generics' : 'princeps'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters({
                      ...filters,
                      onlyGenerics: val === 'all' ? null : val === 'generics'
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Tous (Génériques & Princeps/Marques)</option>
                  <option value="generics">Génériques Uniquement</option>
                  <option value="princeps">Princeps & Marques Libres Uniquement</option>
                </select>
              </div>
            </div>

            {/* Sorting & Result info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">Trier par :</span>
                <button
                  onClick={() => {
                    if (filters.sortBy === 'marginRatePct') {
                      setFilters({ ...filters, sortDirection: filters.sortDirection === 'desc' ? 'asc' : 'desc' });
                    } else {
                      setFilters({ ...filters, sortBy: 'marginRatePct', sortDirection: 'desc' });
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                    filters.sortBy === 'marginRatePct' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  <span>Taux de Marge (%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    if (filters.sortBy === 'monthlyMarginHt') {
                      setFilters({ ...filters, sortDirection: filters.sortDirection === 'desc' ? 'asc' : 'desc' });
                    } else {
                      setFilters({ ...filters, sortBy: 'monthlyMarginHt', sortDirection: 'desc' });
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                    filters.sortBy === 'monthlyMarginHt' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  <span>Marge Générée (€)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    if (filters.sortBy === 'monthlyUnitsSold') {
                      setFilters({ ...filters, sortDirection: filters.sortDirection === 'desc' ? 'asc' : 'desc' });
                    } else {
                      setFilters({ ...filters, sortBy: 'monthlyUnitsSold', sortDirection: 'desc' });
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 ${
                    filters.sortBy === 'monthlyUnitsSold' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}
                >
                  <span>Volume Vendu</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </div>

              {(filters.searchQuery || filters.selectedPricingRegime !== 'tous' || filters.selectedProfitabilityTier !== 'tous' || filters.onlyGenerics !== null) && (
                <button
                  onClick={() => setFilters({
                    searchQuery: '',
                    selectedClasses: [],
                    selectedPricingRegime: 'tous',
                    selectedProfitabilityTier: 'tous',
                    selectedBcgQuadrant: 'tous',
                    minMarginRatePct: 0,
                    maxMarginRatePct: 100,
                    onlyGenerics: null,
                    sortBy: 'marginRatePct',
                    sortDirection: 'desc'
                  })}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Réinitialiser les filtres</span>
                </button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Produit & Classe Thérapeutique</th>
                    <th className="py-3.5 px-3">Laboratoire</th>
                    <th className="py-3.5 px-3 text-right">PUMP HT</th>
                    <th className="py-3.5 px-3 text-right">Prix Public TTC</th>
                    <th className="py-3.5 px-3 text-right">Marge Unitaire</th>
                    <th className="py-3.5 px-3 text-center">Taux Marge (%)</th>
                    <th className="py-3.5 px-3 text-right">Coeff. Multi.</th>
                    <th className="py-3.5 px-3 text-right">Vol. Mensuel</th>
                    <th className="py-3.5 px-3 text-right">Marge Totale (€)</th>
                    <th className="py-3.5 px-4 text-center">Actions & Simulateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <div className="font-bold">Aucune référence ne correspond aux critères sélectionnés.</div>
                        <div className="text-[11px] mt-1">Essayez d'élargir votre recherche ou de réinitialiser les filtres.</div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const isHighProfit = prod.marginRatePct >= 45;
                      const isGoodProfit = prod.marginRatePct >= 35 && prod.marginRatePct < 45;
                      const isCritical = prod.marginRatePct < 15;

                      return (
                        <tr 
                          key={prod.id} 
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                        >
                          {/* Product Name & CIP */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition">
                              {prod.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              <span className="font-mono">CIP {prod.cip}</span>
                              <span>•</span>
                              <span className="truncate max-w-[140px]" title={prod.therapeuticClassName}>
                                {prod.therapeuticClassName}
                              </span>
                            </div>
                            {prod.dci && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate">
                                DCI: {prod.dci}
                              </div>
                            )}
                          </td>

                          {/* Laboratory & Regime Tag */}
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {prod.laboratory}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1">
                              {prod.isGeneric && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                                  GÉNÉRIQUE
                                </span>
                              )}
                              {renderBcgBadge(prod.bcgQuadrant)}
                            </div>
                          </td>

                          {/* PUMP HT */}
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(prod.pumpHt)}
                          </td>

                          {/* Public Price TTC */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(prod.publicPriceTtc)}
                            <div className="text-[10px] text-slate-400 font-normal">
                              TVA {prod.tvaPct}%
                            </div>
                          </td>

                          {/* Unit Margin HT */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(prod.unitMarginEur)}
                          </td>

                          {/* Margin Rate % with color bar */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col items-center">
                              <span className={`font-mono font-black text-xs ${
                                isHighProfit 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : isGoodProfit 
                                    ? 'text-violet-600 dark:text-violet-400' 
                                    : isCritical 
                                      ? 'text-rose-600 dark:text-rose-400' 
                                      : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {prod.marginRatePct.toFixed(1)}%
                              </span>
                              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                                <div 
                                  className={`h-full rounded-full ${
                                    isHighProfit 
                                      ? 'bg-emerald-500' 
                                      : isGoodProfit 
                                        ? 'bg-violet-500' 
                                        : isCritical 
                                          ? 'bg-rose-500' 
                                          : 'bg-blue-500'
                                  }`} 
                                  style={{ width: `${Math.min(100, Math.max(5, prod.marginRatePct))}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Markup Multiplier */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                            x{prod.markupMultiplier.toFixed(2)}
                          </td>

                          {/* Monthly Units Sold */}
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {prod.monthlyUnitsSold} <span className="text-[10px] text-slate-400">btes</span>
                          </td>

                          {/* Monthly Margin HT (€) */}
                          <td className="py-3 px-3 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(prod.monthlyMarginHt)}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {prod.marginContributionOfficePct.toFixed(2)}% officine
                            </div>
                          </td>

                          {/* Action Button: Simulator */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenSimulator(prod)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold transition shadow-2xs text-[11px]"
                              title="Simuler un ajustement de prix public ou une remise pour cette référence"
                            >
                              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Simulateur</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="text-slate-500 font-mono">
                Total filtré : <strong>{filteredStats.count}</strong> références • <strong>{filteredStats.totalUnits.toLocaleString('fr-FR')}</strong> boîtes/mois
              </div>
              <div className="flex items-center gap-4 font-mono font-bold">
                <span className="text-slate-700 dark:text-slate-300">CA HT : {formatCurrency(filteredStats.totalCa)}</span>
                <span className="text-emerald-600 dark:text-emerald-400">Marge HT : {formatCurrency(filteredStats.totalMarge)} ({formatPercent(filteredStats.avgMarginPct)})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2 : CLASSES RANKING & COMPARATIVE CHARTS --- */}
      {activeSubTab === 'classes_ranking' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Average Margin Rate % per Class */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    <span>Palmarès des Classes par Taux de Marge (%)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Marge brute moyenne dégagée sur chaque segment thérapeutique.
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[...MOCK_THERAPEUTIC_CLASSES].sort((a, b) => b.averageMarginRatePct - a.averageMarginRatePct)}
                    margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                    <XAxis type="number" unit="%" domain={[0, 60]} fontSize={11} stroke="#64748b" />
                    <YAxis type="category" dataKey="shortName" fontSize={11} stroke="#64748b" width={95} />
                    <Tooltip 
                      formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Taux de Marge Moyen']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="averageMarginRatePct" radius={[0, 8, 8, 0]}>
                      {[...MOCK_THERAPEUTIC_CLASSES].sort((a, b) => b.averageMarginRatePct - a.averageMarginRatePct).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Total Margin in Euros per Class */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span>Contribution en Valeur (€ Marge Mensuelle)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Marge brute mensuelle réelle injectée dans les résultats de l'officine.
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[...MOCK_THERAPEUTIC_CLASSES].sort((a, b) => b.totalMargeHt - a.totalMargeHt)}
                    margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                    <XAxis type="number" fontSize={11} stroke="#64748b" tickFormatter={(v) => `${(v/1000).toFixed(0)}k€`} />
                    <YAxis type="category" dataKey="shortName" fontSize={11} stroke="#64748b" width={95} />
                    <Tooltip 
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Marge Totale HT (€)']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="totalMargeHt" fill="#6366f1" radius={[0, 8, 8, 0]}>
                      {[...MOCK_THERAPEUTIC_CLASSES].sort((a, b) => b.totalMargeHt - a.totalMargeHt).map((entry, index) => (
                        <Cell key={`cell-marge-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cards Grid: Full Details for all 10 Classes */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Synthèse Détaillée des 10 Classes Thérapeutiques
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_THERAPEUTIC_CLASSES.map((cls) => (
                <div 
                  key={cls.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        ATC: {cls.atcCodePrefix}
                      </span>
                      {renderTierBadge(cls.profitabilityTier)}
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {cls.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {cls.description}
                    </p>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-center font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Taux Marge</div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {cls.averageMarginRatePct.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Marge €</div>
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {(cls.totalMargeHt / 1000).toFixed(1)}k€
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Volume</div>
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {cls.monthlyVolumeUnits}
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="text-xs space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Réf. Championne Marge :</span>
                      <strong className="text-emerald-600 truncate max-w-[150px]" title={cls.mostProfitableProductName}>
                        {cls.mostProfitableProductName}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Top Ventes Volume :</span>
                      <strong className="text-slate-800 dark:text-slate-200 truncate max-w-[150px]" title={cls.bestSellerName}>
                        {cls.bestSellerName}
                      </strong>
                    </div>
                  </div>

                  {/* Button to drill down in table */}
                  <button
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setActiveSubTab('references_table');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Voir les références de cette classe</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3 : MATRIX BCG (RENTABILITÉ VS VOLUME) --- */}
      {activeSubTab === 'matrix_bcg' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Matrice BCG Officinale : Taux de Marge (%) vs Volume Ventes (Unités)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cartographie stratégique des 10 classes pour arbitrer les efforts de merchandising et de formation comptoir.
                </p>
              </div>
            </div>

            {/* 4 Quadrants Explanatory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Quadrant 1: Stars */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-800 dark:text-amber-300">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>⭐ STARS & PÉPITES (Forte Marge + Fort Volume)</span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  Micronutrition, Dermo-Cosmétique, ORL. Moteurs du résultat : maintenir les stocks et optimiser l'assortiment.
                </p>
              </div>

              {/* Quadrant 2: Cash Cows */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-xs text-blue-800 dark:text-blue-300">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>🥛 VACHES À LAIT (Marge Régulée + Énorme Volume)</span>
                </div>
                <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                  Antalgiques, Cardiologie, Gastro-métabolisme. Socle du chiffre d'affaires et des honoraires de dispensation.
                </p>
              </div>

              {/* Quadrant 3: Question Marks / Potential */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-xs text-emerald-800 dark:text-emerald-300">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>💡 LEVIERS CONSEIL (Très Forte Marge + Volume Moyen)</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  Vétérinaire, Phytothérapie spécialisée. Potentiel de développement massif par le conseil proactif au comptoir.
                </p>
              </div>

              {/* Quadrant 4: Surveillance */}
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-xs text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>🔍 SURVEILLANCE PRIX & REMISES</span>
                </div>
                <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80">
                  Nutrition infantile, certains princeps non substitués. Veiller à ne pas concéder de remises excessives.
                </p>
              </div>
            </div>

            {/* Matrix Visual Table Representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Box Top Left: Forte Marge + Faible/Moyen Volume */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">
                    💡 Opportunités de Conseil & Décroissance Remises
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Marge &gt; 35% • Vol &lt; 800 btes</span>
                </div>
                <div className="space-y-2">
                  {MOCK_THERAPEUTIC_CLASSES.filter(c => c.averageMarginRatePct >= 35 && c.monthlyVolumeUnits < 800).map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.monthlyVolumeUnits} btes/mois • CA: {formatCurrency(c.totalCaHt)}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-black text-emerald-600">{c.averageMarginRatePct.toFixed(1)}%</div>
                        <div className="text-[10px] text-slate-400">{formatCurrency(c.totalMargeHt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Top Right: Forte Marge + Fort Volume (Pépites Stars) */}
              <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase">
                    ⭐ Segments Pépites Stars (Moteurs de Marge)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Marge &gt; 35% • Vol &gt; 800 btes</span>
                </div>
                <div className="space-y-2">
                  {MOCK_THERAPEUTIC_CLASSES.filter(c => c.averageMarginRatePct >= 35 && c.monthlyVolumeUnits >= 800).map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs shadow-2xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.monthlyVolumeUnits} btes/mois • CA: {formatCurrency(c.totalCaHt)}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-black text-emerald-600">{c.averageMarginRatePct.toFixed(1)}%</div>
                        <div className="text-[10px] text-indigo-600 font-bold">{formatCurrency(c.totalMargeHt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Bottom Left: Faible Marge + Faible Volume */}
              <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase">
                    🔍 Surveillance & Optimisation Négociations
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Marge &lt; 35% • Vol &lt; 1000 btes</span>
                </div>
                <div className="space-y-2">
                  {MOCK_THERAPEUTIC_CLASSES.filter(c => c.averageMarginRatePct < 35 && c.monthlyVolumeUnits < 1000).map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.monthlyVolumeUnits} btes/mois</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{c.averageMarginRatePct.toFixed(1)}%</div>
                        <div className="text-[10px] text-slate-400">{formatCurrency(c.totalMargeHt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Bottom Right: Faible/Moyenne Marge + Très Fort Volume (Vaches à Lait) */}
              <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">
                    🥛 Vaches à Lait (Pilier de Trésorerie & Ordonnances)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Marge &lt; 35% • Vol &gt; 1000 btes</span>
                </div>
                <div className="space-y-2">
                  {MOCK_THERAPEUTIC_CLASSES.filter(c => c.averageMarginRatePct < 35 && c.monthlyVolumeUnits >= 1000).map(c => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono font-bold text-blue-600">{c.monthlyVolumeUnits} btes/mois</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{c.averageMarginRatePct.toFixed(1)}%</div>
                        <div className="text-[10px] text-indigo-600 font-bold">{formatCurrency(c.totalMargeHt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: PRODUCT MARGIN & PRICING SIMULATOR --- */}
      {selectedProductForSimulation && simulationResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    <Calculator className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Simulateur de Prix, Remise & Marge Référence
                  </h3>
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                  {selectedProductForSimulation.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  CIP {selectedProductForSimulation.cip} • {selectedProductForSimulation.therapeuticClassName}
                </div>
              </div>

              <button
                onClick={() => setSelectedProductForSimulation(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulation Sliders / Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Input 1: Prix Public TTC */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Prix Public TTC (€)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0.5"
                  value={simulatedPriceTtc}
                  onChange={(e) => setSimulatedPriceTtc(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="text-[10px] text-slate-400 font-mono">
                  Actuel: {formatCurrency(selectedProductForSimulation.publicPriceTtc)}
                </div>
              </div>

              {/* Input 2: Remise Caisse % */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Remise Comptoir (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={simulatedDiscountPct}
                    onChange={(e) => setSimulatedDiscountPct(parseInt(e.target.value) || 0)}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-600 shrink-0 w-8 text-right">
                    {simulatedDiscountPct}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Max adm.: {selectedProductForSimulation.maxAdmissibleDiscountPct}%
                </div>
              </div>

              {/* Input 3: PUMP HT Négocié */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  PUMP Achat HT (€)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={simulatedPumpHt}
                  onChange={(e) => setSimulatedPumpHt(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="text-[10px] text-slate-400 font-mono">
                  Actuel: {formatCurrency(selectedProductForSimulation.pumpHt)}
                </div>
              </div>

            </div>

            {/* Recalculated Results Card */}
            <div className={`p-4 rounded-2xl border transition ${
              simulationResults.isFloorBreached 
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900'
            }`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Nouveau Taux Marge</div>
                  <div className={`text-xl font-black ${
                    simulationResults.isFloorBreached ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {simulationResults.marginRatePct.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Actuel: {selectedProductForSimulation.marginRatePct.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Marge Unitaire (€)</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    +{formatCurrency(simulationResults.unitMarginHt)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Actuel: +{formatCurrency(selectedProductForSimulation.unitMarginEur)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Coeff. Multiplicateur</div>
                  <div className="text-xl font-black text-amber-600">
                    x{simulationResults.markupMultiplier.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Actuel: x{selectedProductForSimulation.markupMultiplier.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Impact Annuel (€)</div>
                  <div className={`text-xl font-black ${
                    simulationResults.annualMarginDeltaEur >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {simulationResults.annualMarginDeltaEur >= 0 ? '+' : ''}{formatCurrency(simulationResults.annualMarginDeltaEur)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    sur {selectedProductForSimulation.monthlyUnitsSold * 12} boîtes/an
                  </div>
                </div>
              </div>

              {simulationResults.isFloorBreached && (
                <div className="mt-3 p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Attention : Le taux de marge brute chute sous le seuil plancher critique de 15% avec cette configuration !</span>
                </div>
              )}
            </div>

            {/* Strategic Advice */}
            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Recommandation Pratique pour cette Référence :</span>
              </div>
              <p>{selectedProductForSimulation.recommendationAction}</p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedProductForSimulation(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setActionSuccessMsg(`Paramètres de prix simulés pour "${selectedProductForSimulation.name}" enregistrés dans le catalogue d'audit.`);
                  setSelectedProductForSimulation(null);
                  setTimeout(() => setActionSuccessMsg(null), 4500);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Valider Ajustement Recommandé</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
