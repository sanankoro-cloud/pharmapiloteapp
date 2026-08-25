import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Thermometer, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  RotateCcw, 
  Tag, 
  Trash2, 
  Boxes, 
  Euro, 
  Layers, 
  Scan, 
  Camera, 
  Plus,
  BarChart3,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { ProductStock } from '../types/pharmacy';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';
import { StockStatisticsDashboard } from './StockStatisticsDashboard';
import { AdvancedStockSearchView } from './AdvancedStockSearchView';
import { StockPredictiveAlertsView } from './StockPredictiveAlertsView';
import { computeStockoutPredictions } from '../utils/stockPredictiveEngine';

interface StockExpiryViewProps {
  products: ProductStock[];
  onDestockProduct: (productId: string, actionType: 'retour_labo' | 'promo' | 'destruction') => void;
  onOpenBarcodeScanner: () => void;
  onAddNewProduct?: (newProd: Omit<ProductStock, 'id'>) => void;
  onDeleteProduct?: (productId: string) => void;
  onAdjustStockQty?: (productId: string, newQty: number) => void;
  onImportBulkProducts?: (products: ProductStock[]) => void;
  onCreateSupplierOrder?: (orderItems: Array<{ product: ProductStock; quantity: number }>, supplierName: string) => void;
  onAdjustStockThresholds?: (productId: string, newMin: number, newMax: number) => void;
}

type StockSubTab = 'predictive' | 'analytics' | 'search' | 'inventory';

export const StockExpiryView: React.FC<StockExpiryViewProps> = ({
  products,
  onDestockProduct,
  onOpenBarcodeScanner,
  onAddNewProduct,
  onDeleteProduct,
  onAdjustStockQty,
  onImportBulkProducts,
  onCreateSupplierOrder,
  onAdjustStockThresholds
}) => {
  const [activeSubTab, setActiveSubTab] = useState<StockSubTab>('predictive');
  const [searchPreset, setSearchPreset] = useState<string | null>(null);

  // Pre-calculate count of predictive alerts for badge
  const { summary: predictiveSummary } = React.useMemo(() => {
    return computeStockoutPredictions(products);
  }, [products]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New product modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // Form fields for new product
  const [newCip, setNewCip] = useState('');
  const [newName, setNewName] = useState('');
  const [newLab, setNewLab] = useState('');
  const [newDci, setNewDci] = useState('');
  const [newCategory, setNewCategory] = useState<ProductStock['category']>('medicament_remboursable');
  const [newStockQty, setNewStockQty] = useState(20);
  const [newMinThreshold, setNewMinThreshold] = useState(5);
  const [newPump, setNewPump] = useState(2.50);
  const [newPublicPriceTtc, setNewPublicPriceTtc] = useState(4.90);
  const [newTva, setNewTva] = useState(2.1);
  const [newLocation, setNewLocation] = useState('Tiroir A1');
  const [newLotNumber, setNewLotNumber] = useState('LOT-2026-01');
  const [newExpiryDate, setNewExpiryDate] = useState('2027-12-31');
  const [newIsRefrigerated, setNewIsRefrigerated] = useState(false);

  // Filter products for classic table
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cip.includes(searchTerm) ||
      p.laboratory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.dci && p.dci.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.lotNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'near_expiry') {
      matchesStatus = p.daysUntilExpiry <= 60;
    } else if (filterStatus === 'low_stock') {
      matchesStatus = p.stockQty <= p.minThreshold;
    } else if (filterStatus === 'refrigerated') {
      matchesStatus = !!p.isRefrigerated;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate totals
  const totalItemsCount = products.reduce((sum, p) => sum + p.stockQty, 0);
  const totalStockPump = products.reduce((sum, p) => sum + (p.stockQty * p.pump), 0);
  const totalStockPublicTtc = products.reduce((sum, p) => sum + (p.stockQty * p.publicPriceTtc), 0);
  const urgentExpiries = products.filter(p => p.daysUntilExpiry <= 30);
  const lowStockCount = products.filter(p => p.stockQty <= p.minThreshold);

  const handleAction = (productId: string, actionType: 'retour_labo' | 'promo' | 'destruction') => {
    onDestockProduct(productId, actionType);
    const label = actionType === 'retour_labo' ? 'Demande de retour / avoir laboratoire transmise' :
                  actionType === 'promo' ? 'Mise en avant déstockage -30% activée sur étiquette LGO' :
                  'Sortie de stock pour destruction avec PV';
    setActionSuccessMsg(label);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCip || !newName) return;

    const expiryDateObj = new Date(newExpiryDate);
    const today = new Date();
    const diffTime = expiryDateObj.getTime() - today.getTime();
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (onAddNewProduct) {
      onAddNewProduct({
        cip: newCip,
        name: newName,
        laboratory: newLab || 'Laboratoire Non Spécifié',
        dci: newDci || undefined,
        category: newCategory,
        stockQty: Number(newStockQty),
        minThreshold: Number(newMinThreshold),
        maxThreshold: Number(newStockQty) * 3,
        pump: Number(newPump),
        publicPriceTtc: Number(newPublicPriceTtc),
        tva: Number(newTva) as ProductStock['tva'],
        location: newLocation,
        lotNumber: newLotNumber,
        expiryDate: newExpiryDate,
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
        isRefrigerated: newIsRefrigerated,
        status: Number(newStockQty) <= Number(newMinThreshold) ? 'low_stock' : daysUntilExpiry <= 30 ? 'near_expiry' : 'optimal'
      });
    }

    setIsAddModalOpen(false);
    setActionSuccessMsg(`Produit « ${newName} » ajouté avec succès aux stocks de l'officine.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);

    // Reset form
    setNewCip('');
    setNewName('');
    setNewLab('');
    setNewDci('');
  };

  const handleSelectFilterPreset = (presetKey: string) => {
    setSearchPreset(presetKey);
    setActiveSubTab('search');
  };

  const handleOpenAdvancedSearch = () => {
    setActiveSubTab('search');
  };

  const handleCsvImportSubmit = () => {
    if (!csvContent.trim()) return;
    try {
      const lines = csvContent.trim().split(/\r?\n/).filter(l => l.trim() !== '');
      const dataRows = lines.slice(1);
      const imported: ProductStock[] = dataRows.map((row, idx) => {
        const cols = row.split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
        const cip = cols[0] || `34009${Math.floor(10000000 + Math.random() * 90000000)}`;
        const name = cols[1] || `Produit ${idx + 1}`;
        const lab = cols[2] || 'Laboratoire';
        const qty = Number(cols[3]) || 10;
        const pump = Number(cols[4]?.replace(',', '.')) || 5.0;
        const priceTtc = Number(cols[5]?.replace(',', '.')) || 9.90;
        const lot = cols[6] || `LOT-${idx + 1}`;
        const expDate = cols[7] || '2027-12-31';

        return {
          id: `prod-csv-${Date.now()}-${idx}`,
          cip,
          name,
          laboratory: lab,
          category: 'medicament_remboursable',
          stockQty: qty,
          minThreshold: 5,
          maxThreshold: qty * 3,
          pump,
          publicPriceTtc: priceTtc,
          tva: 2.1,
          location: 'Rayonnage Principal',
          lotNumber: lot,
          expiryDate: expDate,
          daysUntilExpiry: 365,
          status: qty <= 5 ? 'low_stock' : 'optimal'
        };
      });

      if (onImportBulkProducts) {
        onImportBulkProducts(imported);
      }
      setIsImportCsvOpen(false);
      setCsvContent('');
      setActionSuccessMsg(`${imported.length} produits importés dans le stock de la pharmacie.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (e: any) {
      alert("Erreur lors de l'import : " + e.message);
    }
  };

  const handleExportCsv = () => {
    const data = filteredProducts.map(p => ({
      'Code CIP': p.cip,
      'Désignation': p.name,
      'DCI / Molécule': p.dci || '-',
      'Laboratoire': p.laboratory,
      'Catégorie': p.category,
      'Quantité en Stock': p.stockQty,
      'Seuil Mini': p.minThreshold,
      'PUMP HT': p.pump,
      'Prix Public TTC': p.publicPriceTtc,
      'TVA %': p.tva,
      'N° Lot': p.lotNumber,
      'Date Péremption': p.expiryDate,
      'Jours Restants': p.daysUntilExpiry,
      'Emplacement': p.location,
      'Frigo 2-8°C': p.isRefrigerated ? 'Oui' : 'Non'
    }));
    exportToCsv(data, 'stocks_et_peremptions_pharmacie');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Gestion des Stocks, Statistiques & Péremptions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyse de Pareto ABC, rotation DIO, traçabilité des DLUO, valorisation PUMP et recherche avancée multi-critères.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Produit / Lot</span>
          </button>

          <button
            onClick={() => setIsImportCsvOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 rotate-180" />
            <span>Importer CSV</span>
          </button>

          <button
            onClick={onOpenBarcodeScanner}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold shadow-xs transition group cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            <span>Scanner</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('predictive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'predictive'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <ShieldAlert className={`w-4 h-4 ${activeSubTab === 'predictive' ? 'text-white animate-pulse' : 'text-rose-500'}`} />
          <span>Alertes Prédictives & Ruptures (MITM)</span>
          {(predictiveSummary.criticalImminentCount + predictiveSummary.warningReorderCount) > 0 && (
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              activeSubTab === 'predictive'
                ? 'bg-white text-rose-700'
                : 'bg-rose-500 text-white'
            }`}>
              {predictiveSummary.criticalImminentCount + predictiveSummary.warningReorderCount} alertes
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'analytics'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-500" />
          <span>Tableau de Bord & Statistiques de Stock (ABC)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
            Pareto
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('search')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'search'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span>Recherche Avancée & Multi-Filtres</span>
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black">
            {products.length} Réf.
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'inventory'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Package className="w-4 h-4 text-amber-500" />
          <span>Inventaire & Actions Anti-Gaspillage</span>
          {urgentExpiries.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-black">
              {urgentExpiries.length} urgents
            </span>
          )}
        </button>
      </div>

      {/* VIEW 0: PREDICTIVE STOCKOUT ALERTS */}
      {activeSubTab === 'predictive' && (
        <StockPredictiveAlertsView
          products={products}
          onCreateSupplierOrder={onCreateSupplierOrder}
          onAdjustStockThresholds={onAdjustStockThresholds}
          onNavigateToStockSearch={(term) => {
            setSearchTerm(term);
            setActiveSubTab('search');
          }}
        />
      )}

      {/* VIEW 1: STATISTICAL DASHBOARD (ABC & PARETO) */}
      {activeSubTab === 'analytics' && (
        <StockStatisticsDashboard
          products={products}
          onSelectFilterPreset={handleSelectFilterPreset}
          onOpenAdvancedSearch={handleOpenAdvancedSearch}
        />
      )}

      {/* VIEW 2: ADVANCED SEARCH MULTI-CRITERIA */}
      {activeSubTab === 'search' && (
        <AdvancedStockSearchView
          products={products}
          initialPreset={searchPreset}
          onDestockProduct={onDestockProduct}
          onOpenBarcodeScanner={onOpenBarcodeScanner}
          onAddNewProduct={onAddNewProduct}
          onDeleteProduct={onDeleteProduct}
          onAdjustStockQty={onAdjustStockQty}
          onImportBulkProducts={onImportBulkProducts}
        />
      )}

      {/* VIEW 3: CLASSIC INVENTORY & PEREMPTIONS */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Expiry Alert Highlight Banner */}
          {urgentExpiries.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r-2xl shadow-xs">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {urgentExpiries.length} Produit(s) à Péremption Imminente (&lt; 30 Jours)
                  </h2>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Ces lots doivent être immédiatement retirés de la dispensation, retournés aux laboratoires pour avoir, ou déstockés selon les règles de bonne pratique officinale.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {urgentExpiries.map(p => (
                      <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] font-bold">
                        {p.name} ({p.stockQty} boîtes - Exp. {formatDate(p.expiryDate)})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aggregate KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Valorisation Stock HT (PUMP)
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalStockPump)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Prix de revient moyen d'achat
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Potentiel Vente TTC
              </div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(totalStockPublicTtc)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Marge brute : {formatCurrency(totalStockPublicTtc - totalStockPump)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Péremptions &lt; 30 / 60j
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {urgentExpiries.length} lots critiques
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                À traiter en priorité
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Seuils de Réassort
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {lowStockCount.length} sous seuil
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                Intégrés au réassort automatique
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, CIP, DCI, labo, lot..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={onOpenBarcodeScanner}
                className="sm:hidden p-2 rounded-xl bg-emerald-600 text-white shrink-0 shadow-xs"
                title="Ouvrir le scanner code-barres"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="all">Toutes les catégories</option>
                <option value="medicament_remboursable">Médicaments Remboursables (2.1%)</option>
                <option value="medicament_otc">Conseil & OTC (10%)</option>
                <option value="parapharmacie">Parapharmacie & Dermo (20%)</option>
                <option value="nutrition_bebe">Nutrition Infantile (5.5%)</option>
                <option value="dispositif_medical">Dispositifs Médicaux (20%)</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="all">Tous les états</option>
                <option value="near_expiry">⚠️ Péremption &lt; 60 jours</option>
                <option value="low_stock">📉 Stock Faible / Rupture</option>
                <option value="refrigerated">❄️ Chaîne du froid (Frigo 2-8°C)</option>
              </select>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Produit & DCI</th>
                    <th className="py-3 px-3">Emplacement / Lot</th>
                    <th className="py-3 px-3 text-center">Stock / Seuil</th>
                    <th className="py-3 px-3 text-right">PUMP HT</th>
                    <th className="py-3 px-3 text-right">Prix TTC</th>
                    <th className="py-3 px-3">Péremption</th>
                    <th className="py-3 px-3 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Actions Anti-Gaspillage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map((prod) => {
                    const isCriticalExpiry = prod.daysUntilExpiry <= 30;
                    const isWarningExpiry = prod.daysUntilExpiry > 30 && prod.daysUntilExpiry <= 60;
                    const isLowStock = prod.stockQty <= prod.minThreshold;

                    return (
                      <tr key={prod.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${isCriticalExpiry ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {prod.name}
                            {prod.isRefrigerated && (
                              <span title="Frigo 2-8°C" className="text-sky-500 dark:text-sky-400">
                                <Thermometer className="w-3.5 h-3.5 inline" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-mono">{prod.cip}</span>
                            <span>•</span>
                            <span>{prod.laboratory}</span>
                            {prod.dci && <span className="text-slate-400 dark:text-slate-500 italic font-serif">({prod.dci})</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{prod.location}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Lot : {prod.lotNumber}</div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {onAdjustStockQty && (
                              <button
                                type="button"
                                onClick={() => onAdjustStockQty(prod.id, Math.max(0, prod.stockQty - 1))}
                                className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs cursor-pointer"
                                title="Retirer 1 boîte du stock"
                              >
                                -
                              </button>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              isLowStock ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                            }`}>
                              {prod.stockQty} / {prod.minThreshold}
                            </span>
                            {onAdjustStockQty && (
                              <button
                                type="button"
                                onClick={() => onAdjustStockQty(prod.id, prod.stockQty + 1)}
                                className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs cursor-pointer"
                                title="Ajouter 1 boîte au stock"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-slate-900 dark:text-slate-200">
                          {formatCurrency(prod.pump)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(prod.publicPriceTtc)}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className={`font-semibold ${
                            isCriticalExpiry ? 'text-rose-600 dark:text-rose-400 font-bold' :
                            isWarningExpiry ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {formatDate(prod.expiryDate)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {prod.daysUntilExpiry > 0 ? `dans ${prod.daysUntilExpiry} jours` : 'Périmé'}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          {isCriticalExpiry ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <AlertTriangle className="w-3 h-3" />
                              &lt; 30 jours
                            </span>
                          ) : isWarningExpiry ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3 h-3" />
                              &lt; 60 jours
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle className="w-3 h-3" />
                              Conforme
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={onOpenBarcodeScanner}
                              className="p-1 rounded text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer"
                              title="Scanner une boîte ou vérifier le Datamatrix"
                            >
                              <Scan className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            </button>
                            <button
                              onClick={() => handleAction(prod.id, 'retour_labo')}
                              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              title="Faire une demande de retour pour avoir au laboratoire"
                            >
                              <RotateCcw className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              <span>Retour</span>
                            </button>
                            {prod.category === 'parapharmacie' && (
                              <button
                                onClick={() => handleAction(prod.id, 'promo')}
                                className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Mettre en déstockage promotionnel -30%"
                              >
                                <Tag className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                <span>Promo</span>
                              </button>
                            )}
                            {onDeleteProduct ? (
                              <button
                                onClick={() => {
                                  if (confirm(`Supprimer « ${prod.name} » de l'inventaire ?`)) {
                                    onDeleteProduct(prod.id);
                                  }
                                }}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                                title="Supprimer définitivement ce produit du stock"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(prod.id, 'destruction')}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                                title="PV de destruction officiel"
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

              {filteredProducts.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Aucun produit dans le stock pour ces critères
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Ajoutez manuellement vos références ou importez un inventaire CSV exporté depuis votre LGO (WinPharma, LGPI, Isipharm).
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      + Ajouter un Produit
                    </button>
                    <button
                      onClick={() => setIsImportCsvOpen(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs cursor-pointer"
                    >
                      Importer Inventaire CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
            <div className="p-5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Ajouter une référence au stock</h3>
                  <p className="text-xs text-slate-400">Saisie manuelle d'un médicament, OTC ou parapharmacie</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Code CIP (13 chiffres) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="3400936000018"
                    value={newCip}
                    onChange={(e) => setNewCip(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Désignation Commerciale *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Doliprane 1000mg Gélules (Boîte de 8)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Laboratoire Fabricant
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sanofi Opella, Biogaran, Pierre Fabre..."
                    value={newLab}
                    onChange={(e) => setNewLab(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    DCI / Molécule active
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Paracétamol"
                    value={newDci}
                    onChange={(e) => setNewDci(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Catégorie Officinale
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="medicament_remboursable">Médicament Remboursable (TVA 2.1%)</option>
                    <option value="medicament_otc">Conseil & OTC (TVA 10%)</option>
                    <option value="parapharmacie">Parapharmacie & Dermo (TVA 20%)</option>
                    <option value="nutrition_bebe">Nutrition Infantile (TVA 5.5%)</option>
                    <option value="dispositif_medical">Dispositif Médical (TVA 20%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emplacement dans l'officine
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tiroir A1, Rayon Dermato..."
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Quantité en Stock (Boîtes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Seuil Mini d'Alerte Réassort
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PUMP Achat HT (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPump}
                    onChange={(e) => setNewPump(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Prix Public TTC (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPublicPriceTtc}
                    onChange={(e) => setNewPublicPriceTtc(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    N° de Lot Fabricant
                  </label>
                  <input
                    type="text"
                    value={newLotNumber}
                    onChange={(e) => setNewLotNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date de Péremption (DLUO)
                  </label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={newIsRefrigerated}
                    onChange={(e) => setNewIsRefrigerated(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Produit thermosensible à conserver au frigo (2°C - 8°C)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Ajouter au Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT CSV */}
      {isImportCsvOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
            <div className="p-5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Download className="w-5 h-5 rotate-180" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Importer un inventaire CSV</h3>
                  <p className="text-xs text-slate-400">Compatible exports WinPharma, LGPI, Smart Rx, Isipharm</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportCsvOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Contenu du fichier CSV :</span>
                <label className="cursor-pointer text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                  Choisir un fichier .csv
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setCsvContent(ev.target?.result as string || '');
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>

              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={7}
                placeholder="CIP;Désignation;Laboratoire;Quantité;PUMP_HT;PrixPublic_TTC;NumLot;DatePeremption&#10;3400936000018;Doliprane 1000mg;Sanofi;150;1.12;2.18;LOT-DP-99;2027-06-30"
                className="w-full p-3 font-mono text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />

              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong>Format attendu :</strong> CIP ; Nom ; Laboratoire ; Quantité ; PUMP HT ; Prix Public TTC ; N° Lot ; Date Péremption
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportCsvOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCsvImportSubmit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Importer dans le Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
