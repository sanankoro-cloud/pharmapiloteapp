import React, { useState, useRef } from 'react';
import { 
  Database, 
  Upload, 
  Download, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  HardDrive, 
  Layers, 
  Sparkles, 
  X,
  FileText,
  ShieldCheck,
  Building,
  Plus
} from 'lucide-react';
import { 
  ProductStock, 
  SupplierOrder, 
  ExpenseItem, 
  BankTransaction, 
  CompetitorPriceComparison,
  PharmacyFinancialSummary 
} from '../types/pharmacy';
import { LcrStatement } from '../types/lcr';
import { ElectronicInvoice } from '../types/electronicInvoicing';
import { formatCurrency } from '../utils/formatters';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductStock[];
  orders: SupplierOrder[];
  expenses: ExpenseItem[];
  bankTransactions: BankTransaction[];
  lcrStatements: LcrStatement[];
  competitorPrices: CompetitorPriceComparison[];
  summary: PharmacyFinancialSummary;
  onResetToDemoData: () => void;
  onClearAllDataToBlank: () => void;
  onRestoreFromJsonBackup: (backupData: any) => void;
  onImportBulkProducts: (newProducts: ProductStock[]) => void;
  onImportBulkTransactions: (newTransactions: BankTransaction[]) => void;
  onImportBulkOrders: (newOrders: SupplierOrder[]) => void;
  onImportBulkExpenses: (newExpenses: ExpenseItem[]) => void;
  isRealModeActive: boolean;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  expenses,
  bankTransactions,
  lcrStatements,
  competitorPrices,
  summary,
  onResetToDemoData,
  onClearAllDataToBlank,
  onRestoreFromJsonBackup,
  onImportBulkProducts,
  onImportBulkTransactions,
  onImportBulkOrders,
  onImportBulkExpenses,
  isRealModeActive
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'csv_import' | 'backup_restore' | 'blank_mode'>('overview');
  const [importType, setImportType] = useState<'stocks' | 'transactions' | 'orders' | 'expenses'>('stocks');
  const [csvText, setCsvText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmClearModal, setConfirmClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonBackupInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export full pharmacy backup JSON
  const handleExportFullBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      officineName: 'SELARL Pharmacie de l\'Épau (Le Mans)',
      summary,
      products,
      orders,
      expenses,
      bankTransactions,
      lcrStatements,
      competitorPrices
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pharmapilot_sauvegarde_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setImportFeedback({
      type: 'success',
      message: 'Sauvegarde complète JSON téléchargée avec succès.'
    });
  };

  // Restore backup from JSON file
  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.products && !parsed.orders && !parsed.expenses) {
          throw new Error("Format de fichier JSON invalide");
        }
        onRestoreFromJsonBackup(parsed);
        setImportFeedback({
          type: 'success',
          message: `Sauvegarde du ${parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleDateString('fr-FR') : 'fichier'} restaurée avec succès !`
        });
      } catch (err: any) {
        setImportFeedback({
          type: 'error',
          message: `Erreur lors de la lecture du fichier JSON : ${err.message}`
        });
      }
    };
    reader.readAsText(file);
  };

  // Parse CSV text according to import type
  const handleProcessCsvImport = () => {
    if (!csvText.trim()) {
      setImportFeedback({ type: 'error', message: 'Veuillez coller le contenu CSV ou charger un fichier.' });
      return;
    }

    try {
      const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        throw new Error("Le fichier ne contient pas assez de données (au moins 1 ligne d'en-tête et 1 ligne de données)");
      }

      const header = lines[0].split(/[;,\t]/).map(h => h.trim().toLowerCase());
      const dataRows = lines.slice(1);

      if (importType === 'stocks') {
        const importedProds: ProductStock[] = dataRows.map((row, idx) => {
          const cols = row.split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
          const cip = cols[0] || `34009${Math.floor(10000000 + Math.random() * 90000000)}`;
          const name = cols[1] || `Produit importé ${idx + 1}`;
          const lab = cols[2] || 'Laboratoire Non Défini';
          const stockQty = Number(cols[3]) || 10;
          const pump = Number(cols[4]?.replace(',', '.')) || 5.0;
          const publicPriceTtc = Number(cols[5]?.replace(',', '.')) || 9.90;
          const lot = cols[6] || `LOT-IMP-${idx + 1}`;
          const expiryDate = cols[7] || '2027-12-31';

          return {
            id: `prod-imp-${Date.now()}-${idx}`,
            cip,
            name,
            laboratory: lab,
            category: 'medicament_remboursable',
            stockQty,
            minThreshold: 5,
            maxThreshold: stockQty * 3,
            pump,
            publicPriceTtc,
            tva: 2.1,
            lotNumber: lot,
            expiryDate,
            daysUntilExpiry: 365,
            location: 'Rayonnage Principal',
            status: stockQty <= 5 ? 'low_stock' : 'optimal'
          };
        });

        onImportBulkProducts(importedProds);
        setImportFeedback({
          type: 'success',
          message: `${importedProds.length} produits ajoutés avec succès dans votre stock !`
        });
        setCsvText('');
      } else if (importType === 'transactions') {
        const importedTxs: BankTransaction[] = dataRows.map((row, idx) => {
          const cols = row.split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
          const date = cols[0] || new Date().toISOString().split('T')[0];
          const label = cols[1] || `Opération importée ${idx + 1}`;
          const rawAmount = Number(cols[2]?.replace(',', '.')) || 100;
          const type: 'credit' | 'debit' = rawAmount >= 0 ? 'credit' : 'debit';
          const amount = Math.abs(rawAmount);

          return {
            id: `tx-imp-${Date.now()}-${idx}`,
            date,
            label,
            type,
            amount,
            category: 'autre',
            status: 'a_rapprocher',
            bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01',
            reconciliationNotes: 'Import CSV manuel'
          };
        });

        onImportBulkTransactions(importedTxs);
        setImportFeedback({
          type: 'success',
          message: `${importedTxs.length} écritures bancaires importées dans la trésorerie.`
        });
        setCsvText('');
      } else if (importType === 'orders') {
        const importedOrders: SupplierOrder[] = dataRows.map((row, idx) => {
          const cols = row.split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
          const supplierName = cols[0] || 'Fournisseur Importé';
          const totalHt = Number(cols[1]?.replace(',', '.')) || 1000;
          const invoiceNum = cols[2] || `FAC-IMP-${idx + 1}`;

          return {
            id: `ord-imp-${Date.now()}-${idx}`,
            orderNumber: `CMD-IMP-${Date.now()}-${idx}`,
            supplierName,
            supplierType: supplierName.toLowerCase().includes('ocp') || supplierName.toLowerCase().includes('alliance') ? 'grossiste' : 'laboratoire_direct',
            orderDate: new Date().toISOString().split('T')[0],
            deliveryDate: 'Livré',
            status: 'receptionnee',
            itemsCount: 15,
            totalHt,
            totalTtc: totalHt * 1.021,
            discountPercentage: 2.5,
            commercialBonus: totalHt * 0.025,
            invoiceNumber: invoiceNum,
            paymentDueDate: '2026-09-30',
            paymentStatus: 'a_payer'
          };
        });

        onImportBulkOrders(importedOrders);
        setImportFeedback({
          type: 'success',
          message: `${importedOrders.length} factures / commandes fournisseurs importées.`
        });
        setCsvText('');
      } else if (importType === 'expenses') {
        const importedExpenses: ExpenseItem[] = dataRows.map((row, idx) => {
          const cols = row.split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
          const label = cols[0] || `Charge ${idx + 1}`;
          const budget = Number(cols[1]?.replace(',', '.')) || 500;
          const actual = Number(cols[2]?.replace(',', '.')) || budget;
          const supplier = cols[3] || 'Fournisseur Divers';

          return {
            id: `exp-imp-${Date.now()}-${idx}`,
            label,
            category: 'autres',
            monthlyBudget: budget,
            actualAmount: actual,
            supplier,
            frequency: 'mensuel',
            paymentMethod: 'prelevement_sepa',
            lastPaymentDate: new Date().toISOString().split('T')[0],
            nextDueDate: '2026-09-05',
            status: actual > budget ? 'alerte_depassement' : 'a_jour'
          };
        });

        onImportBulkExpenses(importedExpenses);
        setImportFeedback({
          type: 'success',
          message: `${importedExpenses.length} charges récurrentes ajoutées au budget.`
        });
        setCsvText('');
      }
    } catch (err: any) {
      setImportFeedback({
        type: 'error',
        message: `Erreur lors de l'analyse CSV : ${err.message}`
      });
    }
  };

  // Sample CSV generators for guidance
  const loadExampleCsv = () => {
    if (importType === 'stocks') {
      setCsvText(
`CIP;Désignation;Laboratoire;Quantité;PUMP_HT;PrixPublic_TTC;NumLot;DatePeremption
3400936000018;Doliprane 1000mg;Sanofi Opella;150;1.12;2.18;LOT-DP-99;2027-06-30
3400937890124;Amoxicilline Biogaran 1g;Biogaran;25;1.64;2.89;LOT-AMX-55;2026-11-15
3400938210943;Spasfon Lyoc;Teva Sante;80;1.45;2.56;LOT-SP-12;2028-01-31
3400930018274;Daflon 500mg (Boite de 60);Servier;40;8.90;14.50;LOT-DAF-33;2027-09-30`
      );
    } else if (importType === 'transactions') {
      setCsvText(
`Date;Libelle;Montant
2026-08-22;VIREMENT CPAM TIERS PAYANT FLUX NOEMIE;8450.20
2026-08-22;DEPOT ESPECES CAISSE QUOTIDIENNE;1240.00
2026-08-21;PRLV SEPA OCP REPARTITION TRAITE LCR;-14820.50
2026-08-20;VIREMENT VIAMEDIS TIERS PAYANT MUTUELLE;3120.00
2026-08-19;PRELEVEMENT LOYER COMMERCIAL SCI;-3500.00`
      );
    } else if (importType === 'orders') {
      setCsvText(
`Fournisseur;Montant_HT;Numero_Facture
OCP Repartition;12450.00;FAC-OCP-2026-88192
Biogaran Direct;3890.50;FAC-BG-2026-4412
Alliance Healthcare;6200.00;FAC-ALL-2026-1029`
      );
    } else if (importType === 'expenses') {
      setCsvText(
`Intitule;Budget_Mensuel;Montant_Reel;Fournisseur
Loyer Officine;3500;3500;Bailleur SCI
Abonnement WinPharma LGO;420;420;WinPharma
Maintenance Robot Gollmann;680;680;Gollmann France
Assurance RCP Pharmacie;310;310;La Medicale`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Gestion des Données & Import Officine
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isRealModeActive 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40'
                }`}>
                  {isRealModeActive ? 'Mode Officine Réelle' : 'Données Démonstration'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Saisissez vos propres chiffres, importez vos inventaires LGO et gérez la sauvegarde locale.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => { setActiveSubTab('overview'); setImportFeedback(null); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>État des Données ({products.length} réf.)</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('csv_import'); setImportFeedback(null); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'csv_import'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Fichiers CSV / Excel</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('backup_restore'); setImportFeedback(null); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'backup_restore'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Sauvegarde & Restauration JSON</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('blank_mode'); setImportFeedback(null); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'blank_mode'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Mode Vierge / Réinitialisation</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Feedback banner */}
          {importFeedback && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
              importFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              {importFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{importFeedback.message}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-emerald-400">
                      Persistance Locale Active
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Toutes vos saisies sont enregistrées dans votre navigateur
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Chaque ajout de produit, commande, facture, écriture bancaire ou relevé LCR est conservé automatiquement.
                  </p>
                </div>

                <button
                  onClick={handleExportFullBackup}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Sauvegarder (.JSON)</span>
                </button>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Stock Produits</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{products.length}</div>
                  <div className="text-[10px] text-slate-500">références</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Commandes</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{orders.length}</div>
                  <div className="text-[10px] text-slate-500">factures grossistes</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Trésorerie</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{bankTransactions.length}</div>
                  <div className="text-[10px] text-slate-500">lignes bancaires</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Relevés LCR</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{lcrStatements.length}</div>
                  <div className="text-[10px] text-slate-500">traites à pointer</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Charges</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{expenses.length}</div>
                  <div className="text-[10px] text-slate-500">postes budgétaires</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Veille Prix</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{competitorPrices.length}</div>
                  <div className="text-[10px] text-slate-500">comparatifs 50km</div>
                </div>
              </div>

              {/* Quick Actions Guide */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-3">
                <div className="font-bold text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Comment intégrer vos données réelles d'officine ?</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <strong className="text-emerald-900 block font-semibold">1. Saisie Manuelle Directe :</strong>
                    <span>Utilisez les boutons verts <strong>« Nouveau Produit »</strong>, <strong>« Nouvelle Écriture »</strong> ou <strong>« Nouvelle Commande »</strong> présents dans chaque onglet.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                    <strong className="text-emerald-900 block font-semibold">2. Import CSV (WinPharma, LGPI, Smart Rx) :</strong>
                    <span>Rendez-vous dans l'onglet <strong>« Import Fichiers CSV »</strong> pour importer d'un coup vos catalogues, inventaires et relevés de banque.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CSV IMPORT */}
          {activeSubTab === 'csv_import' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Type de données à importer :</span>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="stocks">Inventaire & Stocks (CIP, Quantité, PUMP, Prix TTC...)</option>
                    <option value="transactions">Relevé Bancaire (Date, Libellé, Montant...)</option>
                    <option value="orders">Factures & Commandes Fournisseurs (Fournisseur, HT...)</option>
                    <option value="expenses">Charges & Dépenses Récurrentes (Intitulé, Budget...)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={loadExampleCsv}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline"
                >
                  Charger un exemple de format CSV
                </button>
              </div>

              {/* Drag & drop or paste CSV */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Collez vos données CSV ou texte délimité par des points-virgules (;) ou virgules (,) :
                  </label>
                  <label className="cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir un fichier .csv / .txt</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setCsvText(ev.target?.result as string || '');
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={8}
                  placeholder="CIP;Désignation;Laboratoire;Quantité;PUMP_HT;PrixPublic_TTC;NumLot;DatePeremption&#10;3400936000018;Doliprane 1000mg;Sanofi;100;1.12;2.18;LOT-1;2027-06-30"
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCsvText('')}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={handleProcessCsvImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importer dans PharmaPilot</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeSubTab === 'backup_restore' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Export Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Exporter une sauvegarde complète
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Téléchargez un fichier JSON contenant tous vos stocks, factures, relevés LCR, écritures bancaires et dépenses enregistrés.
                    </p>
                  </div>
                  <button
                    onClick={handleExportFullBackup}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger la Sauvegarde (.JSON)</span>
                  </button>
                </div>

                {/* Restore Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Restaurer une sauvegarde antérieure
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Sélectionnez un fichier JSON précédemment exporté pour recharger instantanément toutes vos données d'officine.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={jsonBackupInputRef}
                      accept=".json"
                      onChange={handleJsonFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => jsonBackupInputRef.current?.click()}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Sélectionner un fichier JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BLANK MODE & RESET */}
          {activeSubTab === 'blank_mode' && (
            <div className="space-y-6">
              
              {/* Option 1: Start with blank database */}
              <div className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/40 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-950">
                      Mode Officine Vierge (Effacer les données de démonstration)
                    </h4>
                    <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                      Cette action vide tous les produits fictifs, écritures bancaires de test et factures de démonstration pour vous permettre de configurer votre pharmacie de A à Z avec vos chiffres réels.
                    </p>
                  </div>
                </div>

                {!confirmClearModal ? (
                  <button
                    onClick={() => setConfirmClearModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    Vider les données de simulation et démarrer à zéro
                  </button>
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-rose-300 space-y-3 animate-fade-in">
                    <div className="text-xs font-bold text-rose-900">
                      Êtes-vous sûr de vouloir vider toutes les données de test ?
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClearAllDataToBlank();
                          setConfirmClearModal(false);
                          setImportFeedback({
                            type: 'success',
                            message: 'L\'application est désormais en mode vierge. Vous pouvez commencer à saisir vos données réelles !'
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        Oui, effacer et démarrer vierge
                      </button>
                      <button
                        onClick={() => setConfirmClearModal(false)}
                        className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Restore demo dataset */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Recharger le jeu de démonstration complet
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Restaure l'ensemble des données d'exemple (Doliprane, commandes OCP, traites LCR Alliance Healthcare, flux Crédit Agricole).
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onResetToDemoData();
                    setImportFeedback({
                      type: 'success',
                      message: 'Les données de démonstration de l\'officine ont été rechargées avec succès.'
                    });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Restaurer les données de démonstration
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            PharmaPilot Officine v2.4 • Stockage sécurisé HTML5 LocalStorage
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
