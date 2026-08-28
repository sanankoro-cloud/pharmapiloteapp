import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Package, 
  Layers, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { ProductStock } from '../types/pharmacy';
import { formatCurrency, formatNumber, formatDate, exportToCsv } from '../utils/formatters';

interface StockInventoryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductStock[];
  filteredProducts?: ProductStock[];
  onExportSuccess?: (exportedCount: number, filename: string) => void;
}

export type ExportScope = 'all' | 'filtered' | 'near_expiry' | 'low_stock' | 'mitm';
export type ExportType = 'full_detailed' | 'accounting_tax' | 'returns_short_expiry' | 'reorder_shortage';

export const StockInventoryExportModal: React.FC<StockInventoryExportModalProps> = ({
  isOpen,
  onClose,
  products,
  filteredProducts = products,
  onExportSuccess
}) => {
  const [scope, setScope] = useState<ExportScope>('all');
  const [exportType, setExportType] = useState<ExportType>('full_detailed');
  const [includeValuation, setIncludeValuation] = useState(true);
  const [includeMargins, setIncludeMargins] = useState(true);
  const [includeLotsAndExpiry, setIncludeLotsAndExpiry] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Determine datasets based on scope
  const targetProducts = React.useMemo(() => {
    switch (scope) {
      case 'filtered':
        return filteredProducts;
      case 'near_expiry':
        return products.filter(p => p.daysUntilExpiry <= 60);
      case 'low_stock':
        return products.filter(p => p.stockQty <= p.minThreshold);
      case 'mitm':
        return products.filter(p => !!(p.isEssential || (p as any).isMitm));
      case 'all':
      default:
        return products;
    }
  }, [scope, products, filteredProducts]);

  // Aggregate Metrics for preview
  const totalSkus = targetProducts.length;
  const totalUnits = targetProducts.reduce((sum, p) => sum + p.stockQty, 0);
  const totalValuationPumpHt = targetProducts.reduce((sum, p) => sum + (p.stockQty * p.pump), 0);
  const totalPublicValueTtc = targetProducts.reduce((sum, p) => sum + (p.stockQty * p.publicPriceTtc), 0);
  const totalGrossMargin = totalPublicValueTtc - totalValuationPumpHt;

  // Breakdown by TVA for accounting preview
  const tvaBreakdown = React.useMemo(() => {
    const map: Record<number, { count: number; units: number; valHt: number; valTtc: number }> = {
      2.1: { count: 0, units: 0, valHt: 0, valTtc: 0 },
      5.5: { count: 0, units: 0, valHt: 0, valTtc: 0 },
      10: { count: 0, units: 0, valHt: 0, valTtc: 0 },
      20: { count: 0, units: 0, valHt: 0, valTtc: 0 }
    };

    targetProducts.forEach(p => {
      const rate = p.tva || 2.1;
      if (!map[rate]) {
        map[rate] = { count: 0, units: 0, valHt: 0, valTtc: 0 };
      }
      map[rate].count += 1;
      map[rate].units += p.stockQty;
      map[rate].valHt += (p.stockQty * p.pump);
      map[rate].valTtc += (p.stockQty * p.publicPriceTtc);
    });

    return map;
  }, [targetProducts]);

  const handleExecuteExport = () => {
    setIsExporting(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      let exportData: Record<string, any>[] = [];
      let filename = `inventaire_stocks_pharmacie_${todayStr}`;

      if (exportType === 'full_detailed') {
        filename = `inventaire_complet_officine_${todayStr}`;
        exportData = targetProducts.map((p, idx) => {
          const valHt = Number((p.stockQty * p.pump).toFixed(2));
          const valTtc = Number((p.stockQty * p.publicPriceTtc).toFixed(2));
          const marginUnit = Number((p.publicPriceTtc / (1 + (p.tva / 100)) - p.pump).toFixed(2));
          const marginTotal = Number((valTtc / (1 + (p.tva / 100)) - valHt).toFixed(2));

          const row: Record<string, any> = {
            'N° Ligne': idx + 1,
            'Code CIP': p.cip,
            'Désignation Produit': p.name,
            'DCI / Molécule': p.dci || '-',
            'Laboratoire': p.laboratory,
            'Catégorie Officinale': p.category,
            'Taux TVA %': p.tva,
            'Quantité en Stock': p.stockQty,
            'Seuil Mini': p.minThreshold,
            'Seuil Maxi': p.maxThreshold || (p.minThreshold * 3)
          };

          if (includeValuation) {
            row['PUMP HT (€)'] = p.pump;
            row['Valeur Stock PUMP HT (€)'] = valHt;
            row['Prix Public TTC (€)'] = p.publicPriceTtc;
            row['Potentiel Vente TTC (€)'] = valTtc;
          }

          if (includeMargins) {
            row['Marge Brute Unitaire HT (€)'] = marginUnit;
            row['Marge Brute Totale HT (€)'] = marginTotal;
            row['Taux de Marque (%)'] = p.pump > 0 && p.publicPriceTtc > 0 
              ? Number(((1 - (p.pump / (p.publicPriceTtc / (1 + (p.tva / 100))))) * 100).toFixed(1))
              : 0;
          }

          if (includeLotsAndExpiry) {
            row['N° Lot Fabricant'] = p.lotNumber;
            row['Date Péremption (DLUO)'] = p.expiryDate;
            row['Jours avant Péremption'] = p.daysUntilExpiry;
            row['Alerte Péremption'] = p.daysUntilExpiry <= 30 ? 'CRITIQUE (<30j)' : p.daysUntilExpiry <= 60 ? 'VIGILANCE (<60j)' : 'CONFORME';
          }

          if (includeLocation) {
            row['Emplacement / Tiroir'] = p.location;
            row['Chaîne Froid (2-8°C)'] = p.isRefrigerated ? 'OUI (Frigo)' : 'NON';
            row['Statut MITM (Vital)'] = (p.isEssential || (p as any).isMitm) ? 'OUI (MITM)' : 'NON';
          }

          return row;
        });
      } else if (exportType === 'accounting_tax') {
        filename = `valorisation_inventaire_fiscale_cpa_${todayStr}`;
        exportData = targetProducts.map((p, idx) => {
          const valHt = Number((p.stockQty * p.pump).toFixed(2));
          const valTtc = Number((p.stockQty * p.publicPriceTtc).toFixed(2));
          const isDormantOrExpired = p.daysUntilExpiry <= 30;
          const provisionDepreciation = isDormantOrExpired ? Number((valHt * 0.5).toFixed(2)) : 0;
          const valNetteHt = Number((valHt - provisionDepreciation).toFixed(2));

          return {
            'N° Compte Stock': p.tva === 2.1 ? '311100 (Médicaments 2.1%)' : p.tva === 5.5 ? '311200 (Alim/Laits 5.5%)' : p.tva === 10 ? '311300 (OTC 10%)' : '311400 (Parapharmacie 20%)',
            'Code CIP': p.cip,
            'Libellé Article': p.name,
            'Laboratoire': p.laboratory,
            'Taux TVA': `${p.tva}%`,
            'Quantité Inventoriée': p.stockQty,
            'PUMP HT Unitaire': p.pump,
            'Valeur Brute Stock HT': valHt,
            'Provision Dépréciation DLUO': provisionDepreciation,
            'Valeur Nette Inventaire HT': valNetteHt,
            'Prix Public TTC': p.publicPriceTtc,
            'Valeur Marchande TTC': valTtc,
            'Date Péremption': p.expiryDate,
            'N° Lot': p.lotNumber
          };
        });
      } else if (exportType === 'returns_short_expiry') {
        filename = `bordereau_retours_labo_peremptions_${todayStr}`;
        exportData = targetProducts
          .filter(p => p.daysUntilExpiry <= 90)
          .map((p, idx) => ({
            'N° Ordre': idx + 1,
            'Laboratoire Fournisseur': p.laboratory,
            'Code CIP': p.cip,
            'Désignation Spécialité': p.name,
            'N° Lot à Retourner': p.lotNumber,
            'Date Péremption (DLUO)': p.expiryDate,
            'Jours Restants': p.daysUntilExpiry,
            'Quantité à Déstocker': p.stockQty,
            'PUMP HT Unitaire': p.pump,
            'Montant Avoir Estimé HT': Number((p.stockQty * p.pump).toFixed(2)),
            'Motif de Retour': p.daysUntilExpiry <= 0 ? 'Périmé (Destruction / Reprise)' : 'Péremption Courte (<90j)',
            'Emplacement Actuel': p.location
          }));
      } else if (exportType === 'reorder_shortage') {
        filename = `etat_reassorts_ruptures_stocks_${todayStr}`;
        exportData = targetProducts
          .filter(p => p.stockQty <= p.minThreshold || p.isEssential || (p as any).isMitm)
          .map((p, idx) => {
            const reorderQty = Math.max(1, (p.maxThreshold || (p.minThreshold * 3)) - p.stockQty);
            return {
              'N° Priorité': (p.isEssential || (p as any).isMitm) ? '1 - MITM URGENT' : p.stockQty === 0 ? '2 - RUPTURE TOTALE' : '3 - SEUIL ALERTE',
              'Code CIP': p.cip,
              'Désignation Spécialité': p.name,
              'DCI / Molécule': p.dci || '-',
              'Laboratoire': p.laboratory,
              'Stock Actuel': p.stockQty,
              'Seuil Mini': p.minThreshold,
              'Seuil Maxi': p.maxThreshold || (p.minThreshold * 3),
              'Quantité Préconisée à Commander': reorderQty,
              'PUMP HT': p.pump,
              'Montant Commande Estimé HT': Number((reorderQty * p.pump).toFixed(2)),
              'Frigo 2-8°C': p.isRefrigerated ? 'OUI' : 'NON'
            };
          });
      }

      // Execute standard CSV export with UTF-8 BOM for instant Excel compatibility
      exportToCsv(exportData, filename);

      if (onExportSuccess) {
        onExportSuccess(exportData.length, `${filename}.csv`);
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);

    } catch (err: any) {
      setIsExporting(false);
      alert("Erreur lors de l'exportation : " + err?.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">Exportation de l'Inventaire des Stocks</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Excel / CSV Pro
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Génération de fichiers tabulaires compatibles Microsoft Excel, Calc, Google Sheets et LGO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Section 1: Scope Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
              1. Périmètre des données à exporter
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  scope === 'all'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Inventaire Complet</span>
                  {scope === 'all' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {products.length} références ({products.reduce((s, p) => s + p.stockQty, 0)} boîtes)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  scope === 'filtered'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Sélection Filtrée Actuelle</span>
                  {scope === 'filtered' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {filteredProducts.length} références affichées
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('near_expiry')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  scope === 'near_expiry'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Péremptions (&lt; 60j)</span>
                  {scope === 'near_expiry' && <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {products.filter(p => p.daysUntilExpiry <= 60).length} lots prioritaires
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Export Type / Model */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">
              2. Modèle de rapport à générer
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              <div 
                onClick={() => setExportType('full_detailed')}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  exportType === 'full_detailed'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${exportType === 'full_detailed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Inventaire Exhaustif & Valorisé</span>
                      {exportType === 'full_detailed' && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">Recommandé</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Toutes les colonnes : CIP, désignation, DCI, labo, quantités, PUMP, PV TTC, TVA, marges, lots et DLUO.
                    </p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setExportType('accounting_tax')}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  exportType === 'accounting_tax'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${exportType === 'accounting_tax' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Bilan Fiscal & Expert-Comptable
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Ventilation par comptes 311xxx selon TVA, valeur nette après dépréciation DLUO pour liasse fiscale.
                    </p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setExportType('returns_short_expiry')}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  exportType === 'returns_short_expiry'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${exportType === 'returns_short_expiry' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Bordereau Déstockage & Avoirs Labos
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Spécialités en péremption courte (&lt;90j), calcul des avoirs négociables et PV de destruction.
                    </p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setExportType('reorder_shortage')}
                className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                  exportType === 'reorder_shortage'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${exportType === 'reorder_shortage' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Réassorts & Ruptures MITM
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Produits sous seuil d'alerte, molécules vitales et quantités préconisées de réapprovisionnement.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Column Options */}
          {exportType === 'full_detailed' && (
            <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2.5">
                3. Options de colonnes détaillées
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeValuation}
                    onChange={(e) => setIncludeValuation(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">PUMP & Valorisation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMargins}
                    onChange={(e) => setIncludeMargins(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Marges & Taux de marque</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLotsAndExpiry}
                    onChange={(e) => setIncludeLotsAndExpiry(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Lots & Péremptions DLUO</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLocation}
                    onChange={(e) => setIncludeLocation(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Emplacement & Frigo</span>
                </label>
              </div>
            </div>
          )}

          {/* Section 4: Live Inventory Synthesis Preview */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Synthèse du fichier prêt à être téléchargé
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                Encodage UTF-8 BOM • Séparateur ';' (Excel Natif)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Références / Boîtes</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {formatNumber(totalSkus)} réf. ({formatNumber(totalUnits)} u.)
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Valeur Stock PUMP HT</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {formatCurrency(totalValuationPumpHt)}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Potentiel Vente TTC</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(totalPublicValueTtc)}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Marge Brute Théorique</div>
                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {formatCurrency(totalGrossMargin)}
                </div>
              </div>
            </div>

            {/* TVA Quick Recap */}
            <div className="mt-3 pt-2.5 border-t border-emerald-100 dark:border-emerald-900/40 flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Ventilation fiscale :</span>
              <div className="flex flex-wrap gap-2.5">
                <span>2.1% : <strong>{formatCurrency(tvaBreakdown[2.1]?.valHt || 0)}</strong> HT</span>
                <span>•</span>
                <span>5.5% : <strong>{formatCurrency(tvaBreakdown[5.5]?.valHt || 0)}</strong> HT</span>
                <span>•</span>
                <span>10% : <strong>{formatCurrency(tvaBreakdown[10]?.valHt || 0)}</strong> HT</span>
                <span>•</span>
                <span>20% : <strong>{formatCurrency(tvaBreakdown[20]?.valHt || 0)}</strong> HT</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleExecuteExport}
            disabled={isExporting || targetProducts.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exportation en cours...' : `Télécharger l'Inventaire (${totalSkus} références)`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
