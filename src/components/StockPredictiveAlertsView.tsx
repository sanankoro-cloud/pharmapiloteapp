import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  ShoppingCart, 
  CheckCircle, 
  Search, 
  Filter, 
  Sliders, 
  ArrowRight, 
  Zap, 
  Package, 
  Thermometer, 
  Star, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  RefreshCw,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  Pill,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  CartesianGrid 
} from 'recharts';
import { ProductStock, StockoutPrediction, StockoutSeverity } from '../types/pharmacy';
import { 
  computeStockoutPredictions, 
  generateStockProjectionTimeSeries, 
  PredictiveEngineOptions 
} from '../utils/stockPredictiveEngine';
import { formatCurrency, formatNumber, exportToCsv } from '../utils/formatters';

interface StockPredictiveAlertsViewProps {
  products: ProductStock[];
  onCreateSupplierOrder?: (orderItems: Array<{ product: ProductStock; quantity: number }>, supplierName: string) => void;
  onAdjustStockThresholds?: (productId: string, newMin: number, newMax: number) => void;
  onNavigateToStockSearch?: (searchTerm: string) => void;
}

export const StockPredictiveAlertsView: React.FC<StockPredictiveAlertsViewProps> = ({
  products,
  onCreateSupplierOrder,
  onAdjustStockThresholds,
  onNavigateToStockSearch
}) => {
  // Paramètres du moteur prédictif
  const [demandFactor, setDemandFactor] = useState<number>(1.0); // 1.0 = normal, 1.25 = épidémie, 1.5 = ruée
  const [safetyDays, setSafetyDays] = useState<number>(4);
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<'all' | 'critical' | 'warning' | 'watch' | 'essential'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [onlyEssentials, setOnlyEssentials] = useState<boolean>(false);
  const [onlyRefrigerated, setOnlyRefrigerated] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Sélections pour commande groupée
  const [selectedProductIdsForOrder, setSelectedProductIdsForOrder] = useState<Set<string>>(new Set());
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);
  const [activeModalGenericProduct, setActiveModalGenericProduct] = useState<ProductStock | null>(null);

  // Édition de seuil en direct
  const [editingThresholdProduct, setEditingThresholdProduct] = useState<{ id: string; min: number; max: number; name: string } | null>(null);

  // Calcul du moteur prédictif
  const { predictions, summary, criticalAlerts, warningAlerts, watchAlerts } = useMemo(() => {
    const options: PredictiveEngineOptions = {
      globalDemandFactor: demandFactor,
      safetyStockDays: safetyDays,
      grossisteLeadTimeDays: 0.5,
      directLabLeadTimeDays: 4,
      targetDaysCoverage: 25
    };
    return computeStockoutPredictions(products, options);
  }, [products, demandFactor, safetyDays]);

  // Filtrage des prédictions
  const filteredPredictions = useMemo(() => {
    return predictions.filter(pred => {
      // Filtre urgence
      if (selectedUrgencyFilter === 'critical' && pred.urgencyLevel !== 'critical_imminent') return false;
      if (selectedUrgencyFilter === 'warning' && pred.urgencyLevel !== 'warning_reorder') return false;
      if (selectedUrgencyFilter === 'watch' && pred.urgencyLevel !== 'watch_trend') return false;
      if (selectedUrgencyFilter === 'essential' && !pred.isEssential) return false;

      // Filtre case à cocher Essentiels
      if (onlyEssentials && !pred.isEssential) return false;
      // Filtre frigo
      if (onlyRefrigerated && !pred.isRefrigerated) return false;

      // Filtre Catégorie
      if (selectedCategoryFilter !== 'all' && pred.product.category !== selectedCategoryFilter) return false;

      // Filtre recherche textuelle
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = pred.product.name.toLowerCase().includes(q);
        const matchesCip = pred.product.cip.includes(q);
        const matchesDci = pred.product.dci && pred.product.dci.toLowerCase().includes(q);
        const matchesLab = pred.product.laboratory.toLowerCase().includes(q);
        if (!matchesName && !matchesCip && !matchesDci && !matchesLab) return false;
      }

      return true;
    });
  }, [predictions, selectedUrgencyFilter, onlyEssentials, onlyRefrigerated, selectedCategoryFilter, searchQuery]);

  // Gestion de la sélection multiple pour commande groupée
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIdsForOrder(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllAtRisk = () => {
    const atRiskIds = predictions
      .filter(p => p.urgencyLevel === 'critical_imminent' || p.urgencyLevel === 'warning_reorder')
      .map(p => p.productId);
    setSelectedProductIdsForOrder(new Set(atRiskIds));
  };

  const handleClearSelection = () => {
    setSelectedProductIdsForOrder(new Set());
  };

  // Déclencher la commande de réassort
  const handleLaunchOrder = (prediction?: StockoutPrediction) => {
    const itemsToOrder: Array<{ product: ProductStock; quantity: number }> = [];

    if (prediction) {
      itemsToOrder.push({
        product: prediction.product,
        quantity: prediction.recommendedReorderQty
      });
    } else {
      predictions.forEach(p => {
        if (selectedProductIdsForOrder.has(p.productId)) {
          itemsToOrder.push({
            product: p.product,
            quantity: p.recommendedReorderQty
          });
        }
      });
    }

    if (itemsToOrder.length === 0) return;

    if (onCreateSupplierOrder) {
      onCreateSupplierOrder(itemsToOrder, 'Grossiste Répartiteur Principal');
    }

    const totalQty = itemsToOrder.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = itemsToOrder.reduce((sum, item) => sum + (item.quantity * item.product.pump), 0);

    setOrderSuccessMsg(`Bon de réassort prédictif généré pour ${itemsToOrder.length} référence(s) (${totalQty} boîtes, ${formatCurrency(totalCost)} HT).`);
    setSelectedProductIdsForOrder(new Set());
    setTimeout(() => setOrderSuccessMsg(null), 5000);
  };

  // Enregistrer ajustement seuil
  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingThresholdProduct) return;
    if (onAdjustStockThresholds) {
      onAdjustStockThresholds(
        editingThresholdProduct.id,
        editingThresholdProduct.min,
        editingThresholdProduct.max
      );
    }
    setEditingThresholdProduct(null);
    setOrderSuccessMsg(`Seuils mini/max mis à jour pour ${editingThresholdProduct.name}.`);
    setTimeout(() => setOrderSuccessMsg(null), 4000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const data = filteredPredictions.map(p => ({
      'Code CIP': p.product.cip,
      'Médicament / Produit': p.product.name,
      'DCI / Molécule': p.product.dci || '-',
      'Laboratoire': p.product.laboratory,
      'Essentiel / MITM': p.isEssential ? 'Oui (Vital)' : 'Standard',
      'Stock Actuel': p.currentStock,
      'Seuil Mini': p.minThreshold,
      'Vitesse Vente/Jour': p.dailyVelocity,
      'Jours Avant Seuil': p.daysUntilCriticalThreshold,
      'Jours Avant Rupture 0': p.daysUntilStockout,
      'Date Est. Passage Seuil': p.predictedThresholdDate,
      'Date Est. Rupture Sèche': p.predictedStockoutDate,
      'Niveau Urgence': p.urgencyLevel,
      'Qté Réassort Conseillée': p.recommendedReorderQty,
      'Budget Réassort HT': p.reorderCostPumpHt,
      'CA Risque Perte 7j HT': p.potentialLostRevenueHt,
      'Fournisseur': p.supplierName,
      'Délai Fournisseur (j)': p.leadTimeDays
    }));
    exportToCsv(data, 'alertes_predictives_ruptures_officine');
  };

  // Calcul du panier de commande sélectionné
  const selectedOrderStats = useMemo(() => {
    const selectedList = predictions.filter(p => selectedProductIdsForOrder.has(p.productId));
    const totalLines = selectedList.length;
    const totalBoxes = selectedList.reduce((s, p) => s + p.recommendedReorderQty, 0);
    const totalCostHt = selectedList.reduce((s, p) => s + p.reorderCostPumpHt, 0);
    return { totalLines, totalBoxes, totalCostHt };
  }, [predictions, selectedProductIdsForOrder]);

  return (
    <div className="space-y-6">
      
      {/* Toast Confirmation */}
      {orderSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 px-4 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setOrderSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:underline text-[11px] cursor-pointer"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Top Banner & Strategic Intelligence Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-black tracking-wide">
                <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                <span>SYSTÈME PRÉDICTIF D'ANTICIPATION DES RUPTURES</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Surveillance Proactive des Médicaments Essentiels (MITM)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Modélisation continue de la vitesse de dispensation journalière (<span className="text-emerald-400 font-mono">Run-rate</span>) pour déclencher le réassort 
                <strong> avant le franchissement du seuil critique</strong> et sécuriser l'approvisionnement des patients.
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleSelectAllAtRisk}
                className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/40 transition flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Sélectionner {summary.criticalImminentCount + summary.warningReorderCount} Réf. à Risque</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

          {/* Strategic KPIs Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            
            {/* KPI 1 : Ruptures imminentes */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/15 transition">
              <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
                <span>Rupture &lt; 72h</span>
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
                  <span>{summary.criticalImminentCount}</span>
                  <span className="text-[11px] font-normal text-rose-300">produit(s)</span>
                </div>
                <div className="text-[10px] text-rose-300 font-medium mt-0.5">
                  Action réassort immédiate
                </div>
              </div>
            </div>

            {/* KPI 2 : Seuil critique sous 7j */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/15 transition">
              <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
                <span>Seuil sous 3 à 7j</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
                  <span>{summary.warningReorderCount}</span>
                  <span className="text-[11px] font-normal text-amber-300">produit(s)</span>
                </div>
                <div className="text-[10px] text-amber-300 font-medium mt-0.5">
                  Point de commande (ROP)
                </div>
              </div>
            </div>

            {/* KPI 3 : MITM essentiels menacés */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/15 transition">
              <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
                <span>MITM Vitaux</span>
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-yellow-300 font-mono flex items-baseline gap-1">
                  <span>{summary.essentialAtRiskCount}</span>
                  <span className="text-[11px] font-normal text-slate-300">prioritaires</span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium mt-0.5">
                  Traitements chroniques
                </div>
              </div>
            </div>

            {/* KPI 4 : CA Hebdo menacé */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/15 transition">
              <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
                <span>CA Hebdo Menacé</span>
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-black text-white font-mono">
                  {formatCurrency(summary.totalPotentialLostRevenueHt)}
                </div>
                <div className="text-[10px] text-rose-300 font-medium mt-0.5">
                  Perte en cas de rupture
                </div>
              </div>
            </div>

            {/* KPI 5 : Budget Réassort Recommandé */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/15 transition">
              <div className="flex items-center justify-between text-slate-300 text-xs font-semibold">
                <span>Budget Réassort</span>
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-black text-emerald-300 font-mono">
                  {formatCurrency(summary.totalReorderBudgetHt)}
                </div>
                <div className="text-[10px] text-emerald-200 font-medium mt-0.5">
                  PUMP HT pour stock cible
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Dynamic Simulation Controls & Sensitivity Sliders */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Paramètres Prédictifs & Sensibilité du Réapprovisionnement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajustez les hypothèses de tension et de marge de sécurité pour simuler vos besoins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Couverture moyenne MITM : <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{summary.averageCoverageDaysEssential} jours</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          
          {/* Slider 1 : Facteur de demande / Saisonnalité */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Accélération Ventes / Épidémie</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-black ${
                demandFactor === 1.0 
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
                  : demandFactor === 1.25 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {demandFactor === 1.0 ? 'Normal (1.0x)' : demandFactor === 1.25 ? 'Pic Épidémique (+25%)' : 'Forte Ruée (+50%)'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDemandFactor(1.0)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  demandFactor === 1.0
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                1.0x Normal
              </button>
              <button
                onClick={() => setDemandFactor(1.25)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  demandFactor === 1.25
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                +25% Tension
              </button>
              <button
                onClick={() => setDemandFactor(1.5)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  demandFactor === 1.5
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                +50% Ruée
              </button>
            </div>
          </div>

          {/* Slider 2 : Marge de sécurité en jours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Marge de Sécurité Souhaitée
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {safetyDays} jours de tampon
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={safetyDays}
              onChange={(e) => setSafetyDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Flux tendu (2j)</span>
              <span>Recommandé (4j)</span>
              <span>Confort (10j)</span>
            </div>
          </div>

          {/* Délai Réassort standard */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cadencement Fournisseurs</span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Grossiste Répartiteur :</span>
                <strong className="font-mono text-emerald-600 dark:text-emerald-400">0.5 jour (Bi-quotidien)</strong>
              </div>
              <div className="flex justify-between">
                <span>Laboratoires Directs :</span>
                <strong className="font-mono text-indigo-600 dark:text-indigo-400">4 à 5 jours ouvrés</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Order Action Bar (when products selected) */}
      {selectedProductIdsForOrder.size > 0 && (
        <div className="sticky top-20 z-20 bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center w-8 h-8">
              {selectedOrderStats.totalLines}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{selectedOrderStats.totalLines} référence(s) sélectionnée(s)</span>
                <span className="text-slate-400">•</span>
                <span>{selectedOrderStats.totalBoxes} boîtes</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Budget estimé : <strong className="text-emerald-400 font-mono">{formatCurrency(selectedOrderStats.totalCostHt)} HT</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearSelection}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Désélectionner tout
            </button>

            <button
              onClick={() => handleLaunchOrder()}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Générer Bon de Réassort ({formatCurrency(selectedOrderStats.totalCostHt)} HT)</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Quick Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Urgency Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedUrgencyFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              selectedUrgencyFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Tous ({predictions.length})
          </button>

          <button
            onClick={() => setSelectedUrgencyFilter('critical')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedUrgencyFilter === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Rupture &lt; 72h ({summary.criticalImminentCount})</span>
          </button>

          <button
            onClick={() => setSelectedUrgencyFilter('warning')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedUrgencyFilter === 'warning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Seuil sous 3 à 7j ({summary.warningReorderCount})</span>
          </button>

          <button
            onClick={() => setSelectedUrgencyFilter('watch')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
              selectedUrgencyFilter === 'watch'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <span>Vigilance Rotation ({summary.watchTrendCount})</span>
          </button>
        </div>

        {/* Search Bar & Checkbox Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setOnlyEssentials(!onlyEssentials)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              onlyEssentials 
                ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-xs' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyEssentials ? 'fill-slate-950' : 'text-yellow-500'}`} />
            <span>MITM Essentiels</span>
          </button>

          <button
            onClick={() => setOnlyRefrigerated(!onlyRefrigerated)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
              onlyRefrigerated 
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-xs' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-cyan-500" />
            <span>Frigo 2-8°C</span>
          </button>

          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher médicament, DCI, CIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

      </div>

      {/* Predictions Alerts List */}
      <div className="space-y-4">
        {filteredPredictions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Aucun risque de rupture détecté avec ces filtres
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Tous vos stocks prévisionnels sont au-dessus des seuils de sécurité pour les horizons de réapprovisionnement configurés.
            </p>
          </div>
        ) : (
          filteredPredictions.map((pred) => {
            const isExpanded = expandedProductId === pred.productId;
            const isSelected = selectedProductIdsForOrder.has(pred.productId);
            const projectionData = isExpanded ? generateStockProjectionTimeSeries(pred, 25) : [];

            return (
              <div 
                key={pred.productId}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                  pred.urgencyLevel === 'critical_imminent'
                    ? 'border-rose-300 dark:border-rose-800/80 hover:border-rose-400'
                    : pred.urgencyLevel === 'warning_reorder'
                      ? 'border-amber-300 dark:border-amber-800/80 hover:border-amber-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                
                {/* Main Card Header / Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Checkbox + Product Details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectProduct(pred.productId)}
                      className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                    />

                    <div className="space-y-1.5 flex-1 min-w-0">
                      
                      {/* Badges & Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        
                        {/* Urgency Badge */}
                        {pred.urgencyLevel === 'critical_imminent' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                            RUPTURE IMMINENTE (&lt; 72H)
                          </span>
                        )}
                        {pred.urgencyLevel === 'warning_reorder' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            RÉASSORT CONSEILLÉ (3-7J)
                          </span>
                        )}
                        {pred.urgencyLevel === 'watch_trend' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            VIGILANCE ROTATION
                          </span>
                        )}
                        {pred.urgencyLevel === 'healthy' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            STOCK SÉCURISÉ
                          </span>
                        )}

                        {/* MITM Essential Badge */}
                        {pred.isEssential && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 dark:bg-yellow-950/80 text-yellow-900 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700">
                            <Star className="w-2.5 h-2.5 fill-yellow-600 text-yellow-600" />
                            MITM / VITAL
                          </span>
                        )}

                        {/* Refrigerated */}
                        {pred.isRefrigerated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                            <Thermometer className="w-3 h-3 text-cyan-600" />
                            Frigo 2-8°C
                          </span>
                        )}

                        {/* ABC Class */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Classe {pred.abcClass}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          CIP: {pred.product.cip}
                        </span>
                      </div>

                      {/* Product Title & Molecule */}
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate hover:text-emerald-600 cursor-pointer"
                            onClick={() => onNavigateToStockSearch && onNavigateToStockSearch(pred.product.name)}>
                          {pred.product.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {pred.product.dci && (
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              DCI : {pred.product.dci}
                            </span>
                          )}
                          <span>•</span>
                          <span>{pred.product.laboratory}</span>
                          <span>•</span>
                          <span>Fournisseur : {pred.supplierName} ({pred.leadTimeDays}j délai)</span>
                        </div>
                      </div>

                      {/* Risk Reason Explanation */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        💡 {pred.riskReason}
                      </p>

                    </div>
                  </div>

                  {/* Middle: Stock Levels & Predictive Countdowns */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shrink-0">
                    
                    {/* Col 1: Stock Actuel vs Seuil */}
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Stock / Seuil Mini</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        <span className={pred.currentStock <= pred.minThreshold ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-900 dark:text-white'}>
                          {pred.currentStock} bte(s)
                        </span>
                        <span className="text-slate-400"> / min {pred.minThreshold}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Max : {pred.maxThreshold}
                      </div>
                    </div>

                    {/* Col 2: Vitesse de vente */}
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Sorties / Jour</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                        <span>{pred.dailyVelocity} bte/j</span>
                        {pred.salesTrendPct > 0 && (
                          <span className="text-[10px] text-rose-500 font-extrabold flex items-center">
                            +{pred.salesTrendPct}% <ArrowUpRight className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        ~{Math.round(pred.dailyVelocity * 30)} btes/mois
                      </div>
                    </div>

                    {/* Col 3: Compte à rebours passage sous seuil */}
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Passage Seuil</div>
                      <div className={`text-xs font-black font-mono mt-0.5 ${
                        pred.daysUntilCriticalThreshold <= 2 
                          ? 'text-rose-600 dark:text-rose-400' 
                          : pred.daysUntilCriticalThreshold <= 7 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {pred.daysUntilCriticalThreshold <= 0 
                          ? '⚠️ Déjà sous seuil !' 
                          : `Dans ${pred.daysUntilCriticalThreshold} jours`}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Est. {pred.predictedThresholdDate}
                      </div>
                    </div>

                    {/* Col 4: Rupture totale 0 */}
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Rupture Sèche (0)</div>
                      <div className={`text-xs font-black font-mono mt-0.5 ${
                        pred.daysUntilStockout <= 3 
                          ? 'text-rose-600 dark:text-rose-400' 
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {pred.daysUntilStockout <= 0 ? '0 EN RAYON' : `Dans ${pred.daysUntilStockout} jours`}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Est. {pred.predictedStockoutDate}
                      </div>
                    </div>

                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex flex-wrap lg:flex-col items-stretch justify-end gap-2 shrink-0">
                    
                    <button
                      onClick={() => handleLaunchOrder(pred)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Commander +{pred.recommendedReorderQty}</span>
                      <span className="text-[10px] opacity-80">({formatCurrency(pred.reorderCostPumpHt)})</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      
                      {/* Generic Alternative Modal Trigger */}
                      {pred.hasAvailableGenericAlternative && (
                        <button
                          onClick={() => setActiveModalGenericProduct(pred.product)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer border border-indigo-200 dark:border-indigo-800"
                          title="Voir les génériques disponibles en stock"
                        >
                          <Pill className="w-3 h-3 text-indigo-500" />
                          <span>{pred.genericAlternativesCount} alternative(s)</span>
                        </button>
                      )}

                      {/* Threshold Edit Modal Trigger */}
                      <button
                        onClick={() => setEditingThresholdProduct({ 
                          id: pred.productId, 
                          min: pred.minThreshold, 
                          max: pred.maxThreshold,
                          name: pred.product.name 
                        })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition cursor-pointer"
                        title="Ajuster seuils mini/max"
                      >
                        Seuils
                      </button>

                      {/* Expand / Collapse Projection Chart */}
                      <button
                        onClick={() => setExpandedProductId(isExpanded ? null : pred.productId)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title={isExpanded ? 'Masquer la trajectoire' : 'Afficher la trajectoire 30 jours'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                    </div>

                  </div>

                </div>

                {/* Expanded Burn-down Run-out Projection Chart */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-emerald-500" />
                          <span>Trajectoire Prédictive d'Épuisement du Stock (Burn-down 25 jours)</span>
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Évolution projetée au rythme de <strong>{pred.dailyVelocity} boîte(s)/jour</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-emerald-500" />
                          <span>Stock Projeté</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed" />
                          <span>Seuil Sécurité ({pred.minThreshold} btes)</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`grad-${pred.productId}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload || !payload.length) return null;
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg">
                                  <div className="font-bold text-slate-300">{d.label} ({d.dateStr})</div>
                                  <div className="text-emerald-400 font-mono font-bold">
                                    Stock projeté : {d.simulatedStock} boîte(s)
                                  </div>
                                  <div className="text-slate-400 text-[10px]">
                                    Seuil critique : {d.minThreshold} boîte(s)
                                  </div>
                                  {d.isCritical && (
                                    <div className="text-rose-400 font-bold text-[10px]">
                                      ⚠️ En dessous du seuil de sécurité
                                    </div>
                                  )}
                                </div>
                              );
                            }}
                          />
                          <ReferenceLine 
                            y={pred.minThreshold} 
                            stroke="#f43f5e" 
                            strokeDasharray="4 4" 
                            label={{ value: `Seuil Mini (${pred.minThreshold})`, fill: '#f43f5e', fontSize: 10, position: 'right' }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="simulatedStock" 
                            stroke="#10b981" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill={`url(#grad-${pred.productId})`} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <span>
                        Délai réassort fournisseur : <strong>{pred.leadTimeDays} jour(s)</strong> • 
                        Stock tampon de sécurité : <strong>{pred.safetyStockDays} jours</strong>
                      </span>
                      <button
                        onClick={() => handleLaunchOrder(pred)}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Valider la commande préconisée de {pred.recommendedReorderQty} boîtes</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Modal : Alternatives & Substitutions Génériques en Stock */}
      {activeModalGenericProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Pill className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Alternatives Génériques & DCI en Stock
                  </h3>
                  <p className="text-xs text-slate-500">
                    Molécule : <strong className="text-indigo-600 dark:text-indigo-400">{activeModalGenericProduct.dci}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalGenericProduct(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              En cas de tension sur <strong>{activeModalGenericProduct.name}</strong>, voici les autres marques et génériques équivalents actuellement disponibles en stock :
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {products
                .filter(p => p.dci && p.dci.toLowerCase().trim() === activeModalGenericProduct.dci?.toLowerCase().trim())
                .map(alt => (
                  <div 
                    key={alt.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      alt.id === activeModalGenericProduct.id
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{alt.name}</span>
                        {alt.id === activeModalGenericProduct.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">Actuel</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {alt.laboratory} • Emplacement : {alt.location} • Pér : {alt.expiryDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-mono font-bold ${alt.stockQty <= alt.minThreshold ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {alt.stockQty} en stock
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatCurrency(alt.publicPriceTtc)} TTC
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModalGenericProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal : Ajustement Seuils Mini / Max */}
      {editingThresholdProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form 
            onSubmit={handleSaveThreshold}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ajuster les Seuils de Sécurité
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">
                  {editingThresholdProduct.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingThresholdProduct(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seuil Minimum de Sécurité (Boîtes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={editingThresholdProduct.min}
                  onChange={(e) => setEditingThresholdProduct({ ...editingThresholdProduct, min: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Le système déclenchera une alerte dès que le stock projeté s'approchera de ce seuil.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Stock Maximum Cible (Boîtes)
                </label>
                <input
                  type="number"
                  min={editingThresholdProduct.min}
                  max="1000"
                  value={editingThresholdProduct.max}
                  onChange={(e) => setEditingThresholdProduct({ ...editingThresholdProduct, max: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Niveau cible utilisé pour calculer la quantité de réassort optimale ($Q = Max - Stock$).
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingThresholdProduct(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Enregistrer les seuils
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
