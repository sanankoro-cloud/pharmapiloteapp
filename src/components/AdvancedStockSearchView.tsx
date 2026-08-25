import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  Download, 
  Trash2, 
  Tag, 
  Camera, 
  Scan, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  Euro, 
  TrendingUp, 
  Layers, 
  X, 
  ArrowUpDown, 
  Check, 
  Plus, 
  Eye,
  FileSpreadsheet,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock
} from 'lucide-react';
import { ProductStock, ProductCategory, ProductTva } from '../types/pharmacy';
import { computeStockAnalytics, StockEnrichedProduct, CATEGORY_LABELS } from '../utils/stockAnalyticsEngine';
import { formatCurrency, formatDate, exportToCsv, formatNumber } from '../utils/formatters';

interface AdvancedStockSearchViewProps {
  products: ProductStock[];
  initialPreset?: string | null;
  onDestockProduct: (productId: string, actionType: 'retour_labo' | 'promo' | 'destruction') => void;
  onOpenBarcodeScanner: () => void;
  onAddNewProduct?: (newProd: Omit<ProductStock, 'id'>) => void;
  onDeleteProduct?: (productId: string) => void;
  onAdjustStockQty?: (productId: string, newQty: number) => void;
  onImportBulkProducts?: (products: ProductStock[]) => void;
}

type SortField = 'valueHt' | 'stockQty' | 'expiryDate' | 'name' | 'marginRate' | 'coverageDays' | 'pump';
type SortOrder = 'asc' | 'desc';

export const AdvancedStockSearchView: React.FC<AdvancedStockSearchViewProps> = ({
  products,
  initialPreset = null,
  onDestockProduct,
  onOpenBarcodeScanner,
  onAddNewProduct,
  onDeleteProduct,
  onAdjustStockQty,
  onImportBulkProducts
}) => {
  // Search & Basic filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(initialPreset);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Advanced criteria
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [selectedLaboratories, setSelectedLaboratories] = useState<string[]>([]);
  const [selectedAbcClasses, setSelectedAbcClasses] = useState<('A' | 'B' | 'C')[]>([]);
  const [selectedStockStatuses, setSelectedStockStatuses] = useState<string[]>([]);
  const [selectedTvaRates, setSelectedTvaRates] = useState<number[]>([]);
  const [minPump, setMinPump] = useState<string>('');
  const [maxPump, setMaxPump] = useState<string>('');
  const [expiryHorizon, setExpiryHorizon] = useState<string>('all'); // all, 30, 60, 90, safe
  const [onlyRefrigerated, setOnlyRefrigerated] = useState<boolean>(false);
  const [onlyHighValue, setOnlyHighValue] = useState<boolean>(false);
  const [onlyMitm, setOnlyMitm] = useState<boolean>(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('valueHt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Selected SKUs for batch operations
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  
  // Product Detail Modal
  const [detailedProduct, setDetailedProduct] = useState<StockEnrichedProduct | null>(null);

  // Action notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Compute analytics and enriched products
  const analytics = useMemo(() => computeStockAnalytics(products), [products]);

  // List of unique laboratories
  const availableLaboratories = useMemo(() => {
    const labs = new Set<string>();
    products.forEach(p => {
      if (p.laboratory) labs.add(p.laboratory);
    });
    return Array.from(labs).sort();
  }, [products]);

  // Count MITM products with < 15 days coverage
  const mitmCriticalAlertsCount = useMemo(() => {
    return analytics.enrichedProducts.filter(p => (p.isEssential || (p as any).isMitm) && p.calculatedDaysCoverage < 15).length;
  }, [analytics.enrichedProducts]);

  const totalMitmCount = useMemo(() => {
    return analytics.enrichedProducts.filter(p => (p.isEssential || (p as any).isMitm)).length;
  }, [analytics.enrichedProducts]);

  // Handle Presets
  const applyPreset = (presetKey: string | null) => {
    setActivePreset(presetKey);
    // Reset other specific filters when applying a preset
    if (presetKey === 'mitm') {
      setOnlyMitm(true);
      setExpiryHorizon('all');
      setSelectedStockStatuses([]);
      setSelectedAbcClasses([]);
      setOnlyRefrigerated(false);
      setSelectedCategories([]);
    } else if (presetKey === 'near_expiry') {
      setExpiryHorizon('60');
      setSelectedStockStatuses([]);
      setSelectedAbcClasses([]);
      setOnlyRefrigerated(false);
      setOnlyMitm(false);
      setSelectedCategories([]);
    } else if (presetKey === 'low_stock') {
      setSelectedStockStatuses(['low_stock']);
      setExpiryHorizon('all');
      setSelectedAbcClasses([]);
      setOnlyRefrigerated(false);
      setOnlyMitm(false);
      setSelectedCategories([]);
    } else if (presetKey === 'refrigerated') {
      setOnlyRefrigerated(true);
      setExpiryHorizon('all');
      setSelectedStockStatuses([]);
      setSelectedAbcClasses([]);
      setOnlyMitm(false);
      setSelectedCategories([]);
    } else if (presetKey === 'class_a') {
      setSelectedAbcClasses(['A']);
      setExpiryHorizon('all');
      setSelectedStockStatuses([]);
      setOnlyRefrigerated(false);
      setOnlyMitm(false);
      setSelectedCategories([]);
    } else if (presetKey === 'dormant') {
      setSelectedStockStatuses(['dormant']);
      setExpiryHorizon('all');
      setSelectedAbcClasses([]);
      setOnlyRefrigerated(false);
      setOnlyMitm(false);
      setSelectedCategories([]);
    } else if (presetKey === 'parapharmacie') {
      setSelectedCategories(['parapharmacie']);
      setExpiryHorizon('all');
      setSelectedStockStatuses([]);
      setSelectedAbcClasses([]);
      setOnlyRefrigerated(false);
      setOnlyMitm(false);
    } else if (presetKey === 'medicament_remboursable') {
      setSelectedCategories(['medicament_remboursable']);
      setExpiryHorizon('all');
      setSelectedStockStatuses([]);
      setSelectedAbcClasses([]);
      setOnlyRefrigerated(false);
      setOnlyMitm(false);
    } else if (presetKey === null) {
      // Reset all
      setSelectedCategories([]);
      setSelectedLaboratories([]);
      setSelectedAbcClasses([]);
      setSelectedStockStatuses([]);
      setSelectedTvaRates([]);
      setMinPump('');
      setMaxPump('');
      setExpiryHorizon('all');
      setOnlyRefrigerated(false);
      setOnlyHighValue(false);
      setOnlyMitm(false);
      setSearchTerm('');
    }
  };

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return analytics.enrichedProducts.filter(p => {
      // 1. Text search
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const matchesQuery = 
          p.name.toLowerCase().includes(query) ||
          p.cip.includes(query) ||
          p.laboratory.toLowerCase().includes(query) ||
          (p.dci && p.dci.toLowerCase().includes(query)) ||
          p.lotNumber.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          (p.supplier && p.supplier.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // 2. Categories
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) {
        return false;
      }

      // 3. Laboratories
      if (selectedLaboratories.length > 0 && !selectedLaboratories.includes(p.laboratory)) {
        return false;
      }

      // 4. ABC Classes
      if (selectedAbcClasses.length > 0 && !selectedAbcClasses.includes(p.calculatedAbcClass)) {
        return false;
      }

      // 5. Stock Statuses
      if (selectedStockStatuses.length > 0) {
        let matchesStatus = false;
        if (selectedStockStatuses.includes('low_stock') && p.stockQty <= p.minThreshold) matchesStatus = true;
        if (selectedStockStatuses.includes('optimal') && p.stockQty > p.minThreshold && !p.isDormantStock) matchesStatus = true;
        if (selectedStockStatuses.includes('dormant') && p.isDormantStock) matchesStatus = true;
        if (!matchesStatus) return false;
      }

      // 6. TVA Rates
      if (selectedTvaRates.length > 0 && !selectedTvaRates.includes(p.tva)) {
        return false;
      }

      // 7. Price min/max PUMP
      if (minPump !== '' && p.pump < Number(minPump)) return false;
      if (maxPump !== '' && p.pump > Number(maxPump)) return false;

      // 8. Expiry horizon
      if (expiryHorizon === '30' && p.daysUntilExpiry > 30) return false;
      if (expiryHorizon === '60' && p.daysUntilExpiry > 60) return false;
      if (expiryHorizon === '90' && p.daysUntilExpiry > 90) return false;
      if (expiryHorizon === 'safe' && p.daysUntilExpiry <= 90) return false;

      // 9. Refrigerated
      if (onlyRefrigerated && !p.isRefrigerated) return false;

      // 10. High value
      if (onlyHighValue && !(p.isHighValue || p.pump >= 100 || p.totalValueHt >= 1500)) return false;

      // 11. MITM (Médicament d'Intérêt Thérapeutique Majeur / isEssential)
      if (onlyMitm && !(p.isEssential || (p as any).isMitm)) return false;

      return true;
    });
  }, [
    analytics.enrichedProducts,
    searchTerm,
    selectedCategories,
    selectedLaboratories,
    selectedAbcClasses,
    selectedStockStatuses,
    selectedTvaRates,
    minPump,
    maxPump,
    expiryHorizon,
    onlyRefrigerated,
    onlyHighValue,
    onlyMitm
  ]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'valueHt') {
        comparison = a.totalValueHt - b.totalValueHt;
      } else if (sortField === 'stockQty') {
        comparison = a.stockQty - b.stockQty;
      } else if (sortField === 'expiryDate') {
        comparison = a.daysUntilExpiry - b.daysUntilExpiry;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'marginRate') {
        comparison = a.marginRatePct - b.marginRatePct;
      } else if (sortField === 'coverageDays') {
        comparison = a.calculatedDaysCoverage - b.calculatedDaysCoverage;
      } else if (sortField === 'pump') {
        comparison = a.pump - b.pump;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredProducts, sortField, sortOrder]);

  // Total summary of filtered view
  const filteredSummary = useMemo(() => {
    const totalSkus = sortedProducts.length;
    const totalUnits = sortedProducts.reduce((s, p) => s + p.stockQty, 0);
    const totalValueHt = sortedProducts.reduce((s, p) => s + p.totalValueHt, 0);
    const totalRetailTtc = sortedProducts.reduce((s, p) => s + p.totalRetailValueTtc, 0);
    const totalMarginHt = sortedProducts.reduce((s, p) => s + p.grossMarginHt, 0);
    return { totalSkus, totalUnits, totalValueHt, totalRetailTtc, totalMarginHt };
  }, [sortedProducts]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Batch Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedProductIds.size === sortedProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(sortedProducts.map(p => p.id)));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Export filtered list to CSV
  const handleExportFilteredCsv = () => {
    const data = sortedProducts.map(p => ({
      'Code CIP': p.cip,
      'Désignation': p.name,
      'DCI / Molécule': p.dci || '-',
      'Laboratoire': p.laboratory,
      'Catégorie': p.category,
      'Classe ABC': p.calculatedAbcClass,
      'Stock (Boîtes)': p.stockQty,
      'Seuil Mini': p.minThreshold,
      'PUMP HT (€)': p.pump,
      'Valeur Stock HT (€)': p.totalValueHt,
      'Prix Public TTC (€)': p.publicPriceTtc,
      'Marge Brute HT (€)': p.grossMarginHt,
      'Taux Marge (%)': p.marginRatePct,
      'Couverture (Jours)': p.calculatedDaysCoverage,
      'Rotation Annuelle': p.annualTurnoverRate,
      'N° de Lot': p.lotNumber,
      'Date Péremption': p.expiryDate,
      'Jours Restants': p.daysUntilExpiry,
      'Emplacement': p.location,
      'Frigo (2-8°C)': p.isRefrigerated ? 'Oui' : 'Non',
      'Fournisseur': p.supplier || '-'
    }));
    exportToCsv(data, 'recherche_avancee_stock_pharmacie');
    showToast(`Export CSV généré avec succès pour ${sortedProducts.length} référence(s).`);
  };

  // Active filters count
  const activeFiltersCount = [
    selectedCategories.length > 0,
    selectedLaboratories.length > 0,
    selectedAbcClasses.length > 0,
    selectedStockStatuses.length > 0,
    selectedTvaRates.length > 0,
    minPump !== '' || maxPump !== '',
    expiryHorizon !== 'all',
    onlyRefrigerated,
    onlyHighValue,
    searchTerm.trim() !== ''
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Search and Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Row 1: Universal Search Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Recherche instantanée : Désignation, CIP (13 chiffres), DCI, Laboratoire, N° Lot, Emplacement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                isFilterDrawerOpen || activeFiltersCount > 0
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtres Avancés</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black">
                  {activeFiltersCount}
                </span>
              )}
              {isFilterDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onOpenBarcodeScanner}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              title="Scanner Datamatrix"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Scanner</span>
            </button>

            <button
              onClick={handleExportFilteredCsv}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Exporter les résultats filtrés en CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: 1-Click Quick Preset Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0 mr-1 uppercase tracking-wider">
            Filtres 1-Clic :
          </span>

          <button
            onClick={() => applyPreset(activePreset === 'near_expiry' ? null : 'near_expiry')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activePreset === 'near_expiry' || expiryHorizon === '60'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Péremptions &lt; 60j</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">
              {analytics.expiryRiskStats.under30DaysCount + analytics.expiryRiskStats.under60DaysCount}
            </span>
          </button>

          <button
            onClick={() => applyPreset(activePreset === 'low_stock' ? null : 'low_stock')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activePreset === 'low_stock' || selectedStockStatuses.includes('low_stock')
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sous-Seuil / Ruptures</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">
              {analytics.lowStockItems.length}
            </span>
          </button>

          <button
            onClick={() => applyPreset(activePreset === 'dormant' ? null : 'dormant')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activePreset === 'dormant' || selectedStockStatuses.includes('dormant')
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Stocks Dormants (&gt;75j)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">
              {analytics.turnoverStats.dormantStockCount}
            </span>
          </button>

          <button
            onClick={() => applyPreset(activePreset === 'class_a' ? null : 'class_a')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activePreset === 'class_a' || selectedAbcClasses.includes('A')
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Classe A (Top 80% Valeur)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">
              {analytics.abcStats.classA.count}
            </span>
          </button>

          <button
            onClick={() => applyPreset(activePreset === 'refrigerated' ? null : 'refrigerated')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activePreset === 'refrigerated' || onlyRefrigerated
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800/60'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Frigo (2-8°C)</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-black">
              {analytics.refrigeratedStats.count}
            </span>
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={() => applyPreset(null)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {isFilterDrawerOpen && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Filter: Categories */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Familles Officinales
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedCategories(prev => 
                              isChecked ? prev.filter(c => c !== cat) : [...prev, cat]
                            );
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="truncate">{CATEGORY_LABELS[cat].label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filter: Laboratory */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Laboratoires Fabricants
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  {availableLaboratories.map((lab) => {
                    const isChecked = selectedLaboratories.includes(lab);
                    return (
                      <label key={lab} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedLaboratories(prev => 
                              isChecked ? prev.filter(l => l !== lab) : [...prev, lab]
                            );
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="truncate">{lab}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filter: ABC Class & Stock Status */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Classe ABC (Pareto)
                  </label>
                  <div className="flex items-center gap-2">
                    {(['A', 'B', 'C'] as const).map((cls) => {
                      const isChecked = selectedAbcClasses.includes(cls);
                      return (
                        <button
                          key={cls}
                          onClick={() => {
                            setSelectedAbcClasses(prev => 
                              isChecked ? prev.filter(c => c !== cls) : [...prev, cls]
                            );
                          }}
                          className={`flex-1 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                            isChecked
                              ? cls === 'A' ? 'bg-emerald-600 text-white' : cls === 'B' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Classe {cls}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horizon Péremption
                  </label>
                  <select
                    value={expiryHorizon}
                    onChange={(e) => setExpiryHorizon(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  >
                    <option value="all">Tous les horizons</option>
                    <option value="30">🚨 Critique (&lt; 30 jours)</option>
                    <option value="60">⚠️ Urgent (&lt; 60 jours)</option>
                    <option value="90">🔍 Surveillance (&lt; 90 jours)</option>
                    <option value="safe">✅ Conforme (&gt; 90 jours)</option>
                  </select>
                </div>
              </div>

              {/* Filter: Price Range & Flags */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plage PUMP HT (€)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPump}
                      onChange={(e) => setMinPump(e.target.value)}
                      className="w-1/2 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPump}
                      onChange={(e) => setMaxPump(e.target.value)}
                      className="w-1/2 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={onlyRefrigerated}
                      onChange={(e) => setOnlyRefrigerated(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
                    />
                    <span>❄️ Frigo (2-8°C) uniquement</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={onlyHighValue}
                      onChange={(e) => setOnlyHighValue(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                    <span>🔒 Haute Valeur / Coffre sécurisé</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">
                <strong>{filteredProducts.length}</strong> référence(s) correspondant aux critères
              </span>
              <button
                onClick={() => applyPreset(null)}
                className="text-slate-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Effacer tous les filtres</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Filtered Result Metrics Summary Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-5 flex flex-wrap items-center justify-between gap-4 shadow-sm text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-slate-400 text-[11px]">Références trouvées :</span>
            <strong className="ml-1.5 text-emerald-400 text-sm font-black">{filteredSummary.totalSkus}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Total Boîtes :</span>
            <strong className="ml-1.5 text-white font-mono">{formatNumber(filteredSummary.totalUnits)}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Valeur Stock HT (PUMP) :</span>
            <strong className="ml-1.5 text-white font-mono font-bold">{formatCurrency(filteredSummary.totalValueHt)}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Potentiel Vente TTC :</span>
            <strong className="ml-1.5 text-emerald-400 font-mono font-bold">{formatCurrency(filteredSummary.totalRetailTtc)}</strong>
          </div>
        </div>

        {selectedProductIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
              {selectedProductIds.size} sélectionné(s)
            </span>
            <button
              onClick={() => {
                const selectedList = sortedProducts.filter(p => selectedProductIds.has(p.id));
                const data = selectedList.map(p => ({
                  'CIP': p.cip,
                  'Nom': p.name,
                  'Laboratoire': p.laboratory,
                  'Stock': p.stockQty,
                  'PUMP_HT': p.pump,
                  'Prix_TTC': p.publicPriceTtc,
                  'Lot': p.lotNumber,
                  'Peremption': p.expiryDate
                }));
                exportToCsv(data, 'selection_stock_officine');
                showToast(`Export de ${selectedList.length} références effectué.`);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Exporter Sélection</span>
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={sortedProducts.length > 0 && selectedProductIds.size === sortedProducts.length}
                    onChange={handleToggleSelectAll}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Produit / DCI / CIP</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Emplacement / Lot</th>
                <th 
                  onClick={() => handleSort('stockQty')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Stock / Seuil</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('pump')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PUMP HT</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('valueHt')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Valeur Stock HT</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('coverageDays')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Couverture</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('expiryDate')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Péremption</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">ABC</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedProducts.map((prod) => {
                const isSelected = selectedProductIds.has(prod.id);
                const isCriticalExpiry = prod.daysUntilExpiry <= 30;
                const isWarningExpiry = prod.daysUntilExpiry > 30 && prod.daysUntilExpiry <= 60;
                const isLowStock = prod.stockQty <= prod.minThreshold;

                return (
                  <tr 
                    key={prod.id} 
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                      isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : 
                      isCriticalExpiry ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectProduct(prod.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span 
                          onClick={() => setDetailedProduct(prod)}
                          className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer underline decoration-dotted"
                        >
                          {prod.name}
                        </span>
                        {prod.isRefrigerated && (
                          <span title="Frigo 2-8°C" className="text-sky-500">
                            <Thermometer className="w-3.5 h-3.5 inline" />
                          </span>
                        )}
                        {prod.isHighValue && (
                          <span title="Haute Valeur / Coffre" className="text-amber-500">
                            <Lock className="w-3 h-3 inline" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-mono">{prod.cip}</span>
                        <span>•</span>
                        <span>{prod.laboratory}</span>
                        {prod.dci && <span className="italic font-serif text-slate-400">({prod.dci})</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{prod.location}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Lot : {prod.lotNumber}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onAdjustStockQty && (
                          <button
                            type="button"
                            onClick={() => onAdjustStockQty(prod.id, Math.max(0, prod.stockQty - 1))}
                            className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs cursor-pointer"
                            title="Retirer 1 boîte"
                          >
                            -
                          </button>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          isLowStock ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}>
                          {prod.stockQty} / {prod.minThreshold}
                        </span>
                        {onAdjustStockQty && (
                          <button
                            type="button"
                            onClick={() => onAdjustStockQty(prod.id, prod.stockQty + 1)}
                            className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs cursor-pointer"
                            title="Ajouter 1 boîte"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-medium font-mono">
                      {formatCurrency(prod.pump)}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                      {formatCurrency(prod.totalValueHt)}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.isDormantStock 
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' 
                          : prod.calculatedDaysCoverage > 45 
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {prod.calculatedDaysCoverage} j
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className={`font-semibold ${
                        isCriticalExpiry ? 'text-rose-600 dark:text-rose-400 font-bold' :
                        isWarningExpiry ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {formatDate(prod.expiryDate)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {prod.daysUntilExpiry > 0 ? `dans ${prod.daysUntilExpiry} j` : 'Périmé'}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                        prod.calculatedAbcClass === 'A' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                        prod.calculatedAbcClass === 'B' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {prod.calculatedAbcClass}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailedProduct(prod)}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Fiche produit détaillée"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </button>

                        <button
                          onClick={onOpenBarcodeScanner}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer"
                          title="Scanner Datamatrix"
                        >
                          <Scan className="w-3.5 h-3.5 text-emerald-600" />
                        </button>

                        <button
                          onClick={() => {
                            onDestockProduct(prod.id, 'retour_labo');
                            showToast(`Demande de retour pour avoir créée pour "${prod.name}"`);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          title="Demande d'avoir retour laboratoire"
                        >
                          <RotateCcw className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Retour</span>
                        </button>

                        {prod.category === 'parapharmacie' && (
                          <button
                            onClick={() => {
                              onDestockProduct(prod.id, 'promo');
                              showToast(`Mise en avant promo -30% activée pour "${prod.name}"`);
                            }}
                            className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Déstockage promotionnel -30%"
                          >
                            <Tag className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                            <span>Promo</span>
                          </button>
                        )}

                        {onDeleteProduct && (
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer « ${prod.name} » de l'inventaire ?`)) {
                                onDeleteProduct(prod.id);
                                showToast(`Produit supprimé.`);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                            title="Supprimer du stock"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {sortedProducts.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Aucun produit ne correspond à vos filtres de recherche
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Essayez d'élargir vos critères ou réinitialisez les filtres pour afficher l'ensemble de l'inventaire.
              </p>
              <button
                onClick={() => applyPreset(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Product Card Modal */}
      {detailedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
            
            <div className="p-5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{detailedProduct.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono font-bold">CIP : {detailedProduct.cip}</span>
                    <span>•</span>
                    <span>{detailedProduct.laboratory}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailedProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              
              {/* Key Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Stock Actuel</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {detailedProduct.stockQty} btes
                  </div>
                  <div className="text-[10px] text-slate-500">Seuil alerte : {detailedProduct.minThreshold}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">PUMP Achat HT</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(detailedProduct.pump)}
                  </div>
                  <div className="text-[10px] text-slate-500">TVA : {detailedProduct.tva}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Prix Public TTC</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(detailedProduct.publicPriceTtc)}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold">Marge : {detailedProduct.marginRatePct}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Valeur Stock HT</div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {formatCurrency(detailedProduct.totalValueHt)}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-bold">Classe {detailedProduct.calculatedAbcClass}</div>
                </div>
              </div>

              {/* Logistic & Expiry Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Données Logistiques & Traçabilité</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500">N° de Lot Fabricant :</span>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{detailedProduct.lotNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Date de Péremption (DLUO) :</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{formatDate(detailedProduct.expiryDate)} ({detailedProduct.daysUntilExpiry} jours restants)</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Emplacement Officine :</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{detailedProduct.location}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Chaîne du Froid :</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{detailedProduct.isRefrigerated ? '❄️ Frigo 2-8°C' : 'Ambiant 15-25°C'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Couverture Estimée :</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{detailedProduct.calculatedDaysCoverage} jours ({detailedProduct.annualTurnoverRate} rot./an)</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Fournisseur :</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{detailedProduct.supplier || 'Grossiste Répartiteur'}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    onDestockProduct(detailedProduct.id, 'retour_labo');
                    setDetailedProduct(null);
                    showToast(`Demande de retour labo pour avoir transmise.`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Demande Retour Labo</span>
                </button>

                {detailedProduct.category === 'parapharmacie' && (
                  <button
                    onClick={() => {
                      onDestockProduct(detailedProduct.id, 'promo');
                      setDetailedProduct(null);
                      showToast(`Déstockage promotionnel activé.`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Déstockage Promo -30%</span>
                  </button>
                )}

                <button
                  onClick={() => setDetailedProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Fermer
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
