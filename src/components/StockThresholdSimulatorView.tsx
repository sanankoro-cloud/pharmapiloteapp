import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Filter, 
  Download, 
  RotateCcw, 
  Package, 
  DollarSign, 
  Check, 
  RefreshCw, 
  Thermometer, 
  Star, 
  Zap, 
  Layers, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  SlidersHorizontal,
  Info,
  Building2,
  Lock,
  ArrowUpRight,
  BarChart2
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
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ProductStock, 
  SimulationScenarioId, 
  StockOptimizationParameters, 
  ProductThresholdSimulationResult,
  BulkThresholdAdjustmentItem
} from '../types/pharmacy';
import { 
  simulateStockThresholds, 
  SCENARIO_PRESETS 
} from '../utils/stockOptimizationSimulatorEngine';
import { formatCurrency, formatNumber, exportToCsv } from '../utils/formatters';

interface StockThresholdSimulatorViewProps {
  products: ProductStock[];
  onAdjustStockThresholds?: (productId: string, newMin: number, newMax: number) => void;
  onBulkAdjustStockThresholds?: (adjustments: BulkThresholdAdjustmentItem[]) => void;
  onNavigateToStockSearch?: (searchTerm: string) => void;
}

export const StockThresholdSimulatorView: React.FC<StockThresholdSimulatorViewProps> = ({
  products,
  onAdjustStockThresholds,
  onBulkAdjustStockThresholds,
  onNavigateToStockSearch
}) => {
  // Scenario State
  const [activeScenarioId, setActiveScenarioId] = useState<SimulationScenarioId>('equilibre');
  const [customParams, setCustomParams] = useState<StockOptimizationParameters>(
    SCENARIO_PRESETS.equilibre.params
  );
  const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false);

  // Filters State
  const [selectedFilterTab, setSelectedFilterTab] = useState<'all' | 'under_protected' | 'over_stocked' | 'rebalance' | 'optimal' | 'essential' | 'high_value'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [abcFilter, setAbcFilter] = useState<'all' | 'A' | 'B' | 'C'>('all');

  // Manual Overrides in Simulation Table
  const [manualThresholdOverrides, setManualThresholdOverrides] = useState<Record<string, { min: number; max: number }>>({});
  
  // Selection for Batch Actions
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Action Success State
  const [successToast, setSuccessToast] = useState<{ title: string; desc: string } | null>(null);

  // Active Parameters based on Scenario
  const activeParams: StockOptimizationParameters = useMemo(() => {
    if (activeScenarioId === 'personnalise') {
      return customParams;
    }
    return SCENARIO_PRESETS[activeScenarioId].params;
  }, [activeScenarioId, customParams]);

  // Run Simulation Engine
  const { 
    results: rawResults, 
    summary, 
    underProtectedResults, 
    overStockedResults, 
    rebalanceResults, 
    optimalResults 
  } = useMemo(() => {
    return simulateStockThresholds(products, activeParams);
  }, [products, activeParams]);

  // Merge with manual in-table overrides if any
  const simulationResults = useMemo(() => {
    return rawResults.map(r => {
      const override = manualThresholdOverrides[r.productId];
      if (override) {
        const deltaMin = override.min - r.currentMin;
        const deltaMax = override.max - r.currentMax;
        return {
          ...r,
          simulatedMin: override.min,
          simulatedMax: override.max,
          deltaMin,
          deltaMax,
          estimatedBfrImpactHt: Number(((deltaMin * 0.4 + deltaMax * 0.6) * r.pumpHt).toFixed(2))
        };
      }
      return r;
    });
  }, [rawResults, manualThresholdOverrides]);

  // Filtered Products for Display
  const filteredResults = useMemo(() => {
    return simulationResults.filter(res => {
      // Tab filter
      if (selectedFilterTab === 'under_protected' && res.diagnosticStatus !== 'under_protected') return false;
      if (selectedFilterTab === 'over_stocked' && res.diagnosticStatus !== 'over_stocked') return false;
      if (selectedFilterTab === 'rebalance' && res.diagnosticStatus !== 'rebalance') return false;
      if (selectedFilterTab === 'optimal' && res.diagnosticStatus !== 'optimal') return false;
      if (selectedFilterTab === 'essential' && !res.isEssential) return false;
      if (selectedFilterTab === 'high_value' && !res.isHighValue) return false;

      // Category filter
      if (categoryFilter !== 'all' && res.product.category !== categoryFilter) return false;

      // ABC filter
      if (abcFilter !== 'all' && res.abcClass !== abcFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = res.product.name.toLowerCase().includes(q);
        const matchCip = res.product.cip.includes(q);
        const matchLab = res.product.laboratory.toLowerCase().includes(q);
        const matchDci = res.product.dci && res.product.dci.toLowerCase().includes(q);
        if (!matchName && !matchCip && !matchLab && !matchDci) return false;
      }

      return true;
    });
  }, [simulationResults, selectedFilterTab, categoryFilter, abcFilter, searchQuery]);

  // Handle Scenario Change
  const handleSelectScenario = (scenarioId: SimulationScenarioId) => {
    setActiveScenarioId(scenarioId);
    if (scenarioId !== 'personnalise') {
      setCustomParams(SCENARIO_PRESETS[scenarioId].params);
    }
  };

  // Handle Manual Input in row
  const handleUpdateRowThreshold = (productId: string, field: 'min' | 'max', val: number) => {
    const current = simulationResults.find(r => r.productId === productId);
    if (!current) return;

    const existingOverride = manualThresholdOverrides[productId] || {
      min: current.simulatedMin,
      max: current.simulatedMax
    };

    const newMin = field === 'min' ? Math.max(0, val) : existingOverride.min;
    const newMax = field === 'max' ? Math.max(newMin + 1, val) : Math.max(newMin + 1, existingOverride.max);

    setManualThresholdOverrides(prev => ({
      ...prev,
      [productId]: { min: newMin, max: newMax }
    }));
  };

  // Apply Single Product
  const handleApplySingleProduct = (result: ProductThresholdSimulationResult) => {
    if (onAdjustStockThresholds) {
      onAdjustStockThresholds(result.productId, result.simulatedMin, result.simulatedMax);
    }
    setSuccessToast({
      title: 'Seuils mis à jour',
      desc: `« ${result.product.name} » : Min = ${result.simulatedMin} / Max = ${result.simulatedMax}`
    });
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Apply Selected Products
  const handleApplySelectedProducts = () => {
    if (selectedProductIds.size === 0) return;

    const itemsToApply: BulkThresholdAdjustmentItem[] = [];
    simulationResults.forEach(res => {
      if (selectedProductIds.has(res.productId)) {
        itemsToApply.push({
          productId: res.productId,
          newMin: res.simulatedMin,
          newMax: res.simulatedMax
        });
        if (onAdjustStockThresholds) {
          onAdjustStockThresholds(res.productId, res.simulatedMin, res.simulatedMax);
        }
      }
    });

    if (onBulkAdjustStockThresholds) {
      onBulkAdjustStockThresholds(itemsToApply);
    }

    setSelectedProductIds(new Set());
    setSuccessToast({
      title: 'Optimisation appliquée par lot',
      desc: `${itemsToApply.length} références mises à jour avec les seuils simulés.`
    });
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Apply All Recommended Adjustments
  const handleApplyAllRecommended = () => {
    const itemsToApply: BulkThresholdAdjustmentItem[] = [];
    simulationResults.forEach(res => {
      if (res.diagnosticStatus !== 'optimal') {
        itemsToApply.push({
          productId: res.productId,
          newMin: res.simulatedMin,
          newMax: res.simulatedMax
        });
        if (onAdjustStockThresholds) {
          onAdjustStockThresholds(res.productId, res.simulatedMin, res.simulatedMax);
        }
      }
    });

    if (onBulkAdjustStockThresholds) {
      onBulkAdjustStockThresholds(itemsToApply);
    }

    setSuccessToast({
      title: 'Plan d\'optimisation global appliqué',
      desc: `${itemsToApply.length} produits réajustés selon le scénario « ${SCENARIO_PRESETS[activeScenarioId].name} ».`
    });
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Toggle selection
  const handleToggleSelectProduct = (productId: string) => {
    const next = new Set(selectedProductIds);
    if (next.has(productId)) {
      next.delete(productId);
    } else {
      next.add(productId);
    }
    setSelectedProductIds(next);
  };

  const handleSelectAllFiltered = () => {
    if (selectedProductIds.size === filteredResults.length && filteredResults.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredResults.map(r => r.productId)));
    }
  };

  // Export CSV
  const handleExportSimulationCsv = () => {
    const csvRows = simulationResults.map(r => ({
      'Code CIP': r.product.cip,
      'Désignation': r.product.name,
      'DCI': r.product.dci || '-',
      'Laboratoire': r.product.laboratory,
      'Classe ABC': r.abcClass,
      'Fournisseur Type': r.supplierType,
      'Essentiel MITM': r.isEssential ? 'Oui' : 'Non',
      'Stock Actuel': r.currentStock,
      'Ventes Mensuelles': r.monthlySales,
      'Vitesse Jour (btes/j)': r.dailyVelocity,
      'PUMP HT': r.pumpHt,
      'Seuil Min Actuel': r.currentMin,
      'Seuil Min Simulé': r.simulatedMin,
      'Delta Min': r.deltaMin,
      'Seuil Max Actuel': r.currentMax,
      'Seuil Max Simulé': r.simulatedMax,
      'Delta Max': r.deltaMax,
      'Impact BFR (€ HT)': r.estimatedBfrImpactHt,
      'Statut Diagnostic': r.diagnosticStatus,
      'Motif Préconisation': r.diagnosticReason
    }));
    exportToCsv(csvRows, `simulation_optimisation_seuils_${activeScenarioId}`);
  };

  // Prepare Chart Data
  const top10ChartData = useMemo(() => {
    return simulationResults
      .slice(0, 8)
      .map(r => ({
        name: r.product.name.length > 18 ? r.product.name.substring(0, 16) + '...' : r.product.name,
        stock: r.currentStock,
        minActuel: r.currentMin,
        minSimule: r.simulatedMin,
        maxActuel: r.currentMax,
        maxSimule: r.simulatedMax
      }));
  }, [simulationResults]);

  const diagnosticPieData = useMemo(() => {
    return [
      { name: 'Sous-protégés (Risque rupture)', value: summary.underProtectedCount, color: '#f43f5e' },
      { name: 'Surstockés (BFR excessif)', value: summary.overStockedCount, color: '#f59e0b' },
      { name: 'Rééquilibrage mixte', value: summary.rebalanceCount, color: '#8b5cf6' },
      { name: 'Seuils optimaux conformes', value: summary.optimalCount, color: '#10b981' }
    ].filter(d => d.value > 0);
  }, [summary]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-fade-in max-w-md">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{successToast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{successToast.desc}</p>
          </div>
        </div>
      )}

      {/* Hero Header & Scenario Description */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Simulateur d'Optimisation des Seuils Min / Max
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Officine Intelligence
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Recalibrage prédictif fondé sur l'historique des ventes réelles, la vélocité journalière, les délais répartiteurs/labos et la criticité MITM.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCustomDrawerOpen(!isCustomDrawerOpen)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                isCustomDrawerOpen || activeScenarioId === 'personnalise'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Paramètres Avancés</span>
              {isCustomDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleExportSimulationCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exporter la Simulation (CSV)</span>
            </button>

            <button
              onClick={handleApplyAllRecommended}
              disabled={summary.underProtectedCount + summary.overStockedCount + summary.rebalanceCount === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-md transition cursor-pointer ${
                summary.underProtectedCount + summary.overStockedCount + summary.rebalanceCount > 0
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Appliquer Tout le Plan ({summary.underProtectedCount + summary.overStockedCount + summary.rebalanceCount} réf.)</span>
            </button>
          </div>
        </div>

        {/* Preset Scenarios Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Sélectionnez un scénario de gestion d'officine :</span>
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(Object.keys(SCENARIO_PRESETS) as SimulationScenarioId[])
              .filter(k => k !== 'personnalise')
              .map(scenarioKey => {
                const scenario = SCENARIO_PRESETS[scenarioKey];
                const isActive = activeScenarioId === scenarioKey;
                return (
                  <button
                    key={scenarioKey}
                    onClick={() => handleSelectScenario(scenarioKey)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-lg">{scenario.icon}</span>
                        {isActive && (
                          <span className="p-1 rounded-full bg-indigo-600 text-white">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                        {scenario.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {scenario.shortDesc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      <span>Demande : <strong>x{scenario.params.demandMultiplier}</strong></span>
                      <span>Couv : <strong>{scenario.params.grossisteTargetCoverageDays}j / {scenario.params.directLabTargetCoverageDays}j</strong></span>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Active Scenario Detail Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Scénario actif : {SCENARIO_PRESETS[activeScenarioId].name}</strong> — {SCENARIO_PRESETS[activeScenarioId].fullDesc}
            </div>
          </div>
        </div>

        {/* Custom Parameters Collapsible Drawer */}
        {isCustomDrawerOpen && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Curseurs de Calibration du Moteur de Simulation
                </h3>
              </div>
              <button
                onClick={() => {
                  setCustomParams(SCENARIO_PRESETS.equilibre.params);
                  setActiveScenarioId('equilibre');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser par défaut</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Slider 1: Demand Multiplier */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Coefficient Ventes :</span>
                  <span className="text-indigo-600 font-mono font-black">x{customParams.demandMultiplier.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="1.80"
                  step="0.05"
                  value={customParams.demandMultiplier}
                  onChange={e => {
                    setCustomParams(p => ({ ...p, demandMultiplier: parseFloat(e.target.value) }));
                    setActiveScenarioId('personnalise');
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">Ajuste la cadence de vente selon la saisonnalité.</p>
              </div>

              {/* Slider 2: Grossiste Target Coverage */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Couverture Grossiste :</span>
                  <span className="text-indigo-600 font-mono font-black">{customParams.grossisteTargetCoverageDays} jours</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="25"
                  step="1"
                  value={customParams.grossisteTargetCoverageDays}
                  onChange={e => {
                    setCustomParams(p => ({ ...p, grossisteTargetCoverageDays: parseInt(e.target.value) }));
                    setActiveScenarioId('personnalise');
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">Couverture max cible pour commandes quotidiennes.</p>
              </div>

              {/* Slider 3: Direct Lab Target Coverage */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Couverture Direct Labo :</span>
                  <span className="text-indigo-600 font-mono font-black">{customParams.directLabTargetCoverageDays} jours</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={customParams.directLabTargetCoverageDays}
                  onChange={e => {
                    setCustomParams(p => ({ ...p, directLabTargetCoverageDays: parseInt(e.target.value) }));
                    setActiveScenarioId('personnalise');
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">Pour atteindre les seuils de franco de port.</p>
              </div>

              {/* Slider 4: MITM Extra Safety */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>Sécurité Extra MITM :</span>
                  <span className="text-purple-600 font-mono font-black">+{customParams.extraSafetyDaysEssential} jours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={customParams.extraSafetyDaysEssential}
                  onChange={e => {
                    setCustomParams(p => ({ ...p, extraSafetyDaysEssential: parseInt(e.target.value) }));
                    setActiveScenarioId('personnalise');
                  }}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">Jours de sécurité additionnels sur les molécules vitales.</p>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* KPI Impact Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Freed Cash */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Trésorerie Libérable (BFR)</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(summary.totalFreedCashHt)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Surstocks résorbés sur les plafonds Max
            </p>
          </div>
        </div>

        {/* Card 2: Service Level Protection */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Taux de Service Client</span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {summary.serviceLevelSimulatedPct}%
              </span>
              <span className="text-xs font-bold text-slate-400 line-through">
                {summary.serviceLevelCurrentPct}%
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              +{(summary.serviceLevelSimulatedPct - summary.serviceLevelCurrentPct).toFixed(1)}% anti-rupture
            </p>
          </div>
        </div>

        {/* Card 3: Under-protected (Rupture Risk) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">À Réhausser (Min trop bas)</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {summary.underProtectedCount} réf.
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Sécurisation requise : {formatCurrency(summary.totalSecuringCashHt)}
            </p>
          </div>
        </div>

        {/* Card 4: Over-stocked (Surstock) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">À Abaisser (Surstock)</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {summary.overStockedCount} réf.
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Plafonds Max disproportionnés
            </p>
          </div>
        </div>

        {/* Card 5: Annual DIO Turnover Gain */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Gain Rotation Stock</span>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              +{summary.estimatedTurnoverImprovement} rot/an
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Rotation moyenne accélérée
            </p>
          </div>
        </div>

      </div>

      {/* Visual Analytics Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Distribution of Thresholds for Top References */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Comparatif Seuils Actuels vs Simulés (Échantillon Clé)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Unités en stock</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10ChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    fontSize: '11px', 
                    backgroundColor: '#0f172a', 
                    color: '#fff',
                    border: 'none' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="stock" name="Stock Actuel" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="minActuel" name="Min Actuel" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="minSimule" name="Min Simulé (Préconisé)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxActuel" name="Max Actuel" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maxSimule" name="Max Simulé (Cible)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Rebalancing Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Répartition des Diagnostics
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">{products.length} références</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diagnosticPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {diagnosticPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    fontSize: '11px', 
                    backgroundColor: '#0f172a', 
                    color: '#fff',
                    border: 'none' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {diagnosticPieData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value} réf.</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Interactive Product Simulation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
        
        {/* Table Controls Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher produit, CIP, DCI, laboratoire..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Quick Filter Category / ABC */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={abcFilter}
              onChange={e => setAbcFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
            >
              <option value="all">Toutes classes ABC</option>
              <option value="A">Classe A (80% du CA)</option>
              <option value="B">Classe B (15% du CA)</option>
              <option value="C">Classe C (5% du CA)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
            >
              <option value="all">Toutes catégories</option>
              <option value="medicament_remboursable">Médicaments Remboursables</option>
              <option value="medicament_otc">Conseil & OTC</option>
              <option value="parapharmacie">Parapharmacie</option>
              <option value="dispositif_medical">Dispositifs Médicaux</option>
              <option value="nutrition_bebe">Nutrition Bébé</option>
            </select>
          </div>

        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedFilterTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Toutes les références ({simulationResults.length})
          </button>

          <button
            onClick={() => setSelectedFilterTab('under_protected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedFilterTab === 'under_protected'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Risque Rupture ({summary.underProtectedCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilterTab('over_stocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedFilterTab === 'over_stocked'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Surstock BFR ({summary.overStockedCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilterTab('rebalance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedFilterTab === 'rebalance'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rééquilibrage Mixte ({summary.rebalanceCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilterTab('essential')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedFilterTab === 'essential'
                ? 'bg-purple-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />
            <span>MITM / Vital</span>
          </button>

          <button
            onClick={() => setSelectedFilterTab('optimal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedFilterTab === 'optimal'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Conformes ({summary.optimalCount})</span>
          </button>
        </div>

        {/* Table Selection Action Bar */}
        {selectedProductIds.size > 0 && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold">
              <Check className="w-4 h-4 text-indigo-600" />
              <span>{selectedProductIds.size} référence(s) sélectionnée(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedProductIds(new Set())}
                className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200/50 font-semibold cursor-pointer"
              >
                Désélectionner
              </button>
              <button
                onClick={handleApplySelectedProducts}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Appliquer à la sélection ({selectedProductIds.size})</span>
              </button>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.size === filteredResults.length && filteredResults.length > 0}
                    onChange={handleSelectAllFiltered}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">Produit / DCI / Laboratoire</th>
                <th className="p-3 text-center">Vitesse de Sortie</th>
                <th className="p-3 text-center">Stock & PUMP</th>
                <th className="p-3 text-center bg-slate-100/50 dark:bg-slate-800/50">Seuils Actuels</th>
                <th className="p-3 text-center bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200">
                  Seuils Simulés (Proposés)
                </th>
                <th className="p-3 text-center">Écarts (Δ)</th>
                <th className="p-3 text-center">Impact BFR</th>
                <th className="p-3">Diagnostic & Préconisation</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">Aucun produit ne correspond aux filtres de simulation.</p>
                  </td>
                </tr>
              ) : (
                filteredResults.map(res => {
                  const isSelected = selectedProductIds.has(res.productId);
                  const isUnderProtected = res.diagnosticStatus === 'under_protected';
                  const isOverStocked = res.diagnosticStatus === 'over_stocked';
                  const isRebalance = res.diagnosticStatus === 'rebalance';

                  return (
                    <tr 
                      key={res.productId}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectProduct(res.productId)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Product Name & Badges */}
                      <td className="p-3 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{res.product.name}</span>
                          {res.isEssential && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 shrink-0">
                              MITM
                            </span>
                          )}
                          {res.product.isRefrigerated && (
                            <span title="Frigo 2-8°C" className="inline-flex">
                              <Thermometer className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>CIP: {res.product.cip}</span>
                          <span>•</span>
                          <span>{res.product.laboratory}</span>
                          <span>•</span>
                          <span className="font-bold text-indigo-600">Cl. {res.abcClass}</span>
                        </div>
                      </td>

                      {/* Velocity */}
                      <td className="p-3 text-center">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {res.monthlySales} btes/mois
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {res.dailyVelocity} / jour
                        </div>
                      </td>

                      {/* Stock & Cost */}
                      <td className="p-3 text-center">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {res.currentStock} btes
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {formatCurrency(res.pumpHt)} HT
                        </div>
                      </td>

                      {/* Current Thresholds */}
                      <td className="p-3 text-center bg-slate-100/30 dark:bg-slate-800/30">
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          Min: <span className="text-slate-900 dark:text-white">{res.currentMin}</span> / Max: <span className="text-slate-900 dark:text-white">{res.currentMax}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Couv : {res.currentDaysCoverage}j
                        </div>
                      </td>

                      {/* Simulated Thresholds (Editable in row) */}
                      <td className="p-3 text-center bg-indigo-50/30 dark:bg-indigo-950/20">
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex items-center">
                            <span className="text-[10px] text-slate-500 mr-1 font-semibold">Min:</span>
                            <input
                              type="number"
                              min={0}
                              value={res.simulatedMin}
                              onChange={e => handleUpdateRowThreshold(res.productId, 'min', parseInt(e.target.value) || 0)}
                              className={`w-12 text-center py-1 px-1 rounded-lg border text-xs font-mono font-bold ${
                                isUnderProtected 
                                  ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200' 
                                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                              }`}
                            />
                          </div>

                          <span className="text-slate-400">/</span>

                          <div className="flex items-center">
                            <span className="text-[10px] text-slate-500 mr-1 font-semibold">Max:</span>
                            <input
                              type="number"
                              min={res.simulatedMin + 1}
                              value={res.simulatedMax}
                              onChange={e => handleUpdateRowThreshold(res.productId, 'max', parseInt(e.target.value) || 0)}
                              className={`w-12 text-center py-1 px-1 rounded-lg border text-xs font-mono font-bold ${
                                isOverStocked 
                                  ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200' 
                                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                          Couv cible : {res.simulatedDaysCoverage}j
                        </div>
                      </td>

                      {/* Deltas */}
                      <td className="p-3 text-center font-mono text-[11px] font-bold">
                        <div className="flex flex-col gap-0.5 items-center">
                          <span className={`px-1.5 py-0.2 rounded ${
                            res.deltaMin > 0 ? 'bg-rose-100 text-rose-800' : res.deltaMin < 0 ? 'bg-blue-100 text-blue-800' : 'text-slate-400'
                          }`}>
                            Δ Min: {res.deltaMin > 0 ? `+${res.deltaMin}` : res.deltaMin}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded ${
                            res.deltaMax < 0 ? 'bg-emerald-100 text-emerald-800' : res.deltaMax > 0 ? 'bg-amber-100 text-amber-800' : 'text-slate-400'
                          }`}>
                            Δ Max: {res.deltaMax > 0 ? `+${res.deltaMax}` : res.deltaMax}
                          </span>
                        </div>
                      </td>

                      {/* Estimated BFR Impact */}
                      <td className="p-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded-lg text-xs ${
                          res.estimatedBfrImpactHt < 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : res.estimatedBfrImpactHt > 0
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'text-slate-500'
                        }`}>
                          {res.estimatedBfrImpactHt > 0 ? `+${formatCurrency(res.estimatedBfrImpactHt)}` : formatCurrency(res.estimatedBfrImpactHt)}
                        </span>
                      </td>

                      {/* Diagnostic Reason */}
                      <td className="p-3 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          {isUnderProtected && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />}
                          {isOverStocked && <Package className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />}
                          {isRebalance && <Layers className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />}
                          {!isUnderProtected && !isOverStocked && !isRebalance && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          )}
                          <span className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                            {res.diagnosticReason}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleApplySingleProduct(res)}
                          title="Appliquer ces seuils au produit"
                          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
