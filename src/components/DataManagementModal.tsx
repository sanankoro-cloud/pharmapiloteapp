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
  Plus,
  Save,
  Building2,
  Sprout,
  Landmark,
  User,
  MapPin,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  Compass,
  Play
} from 'lucide-react';
import { 
  ProductStock, 
  SupplierOrder, 
  ExpenseItem, 
  BankTransaction, 
  CompetitorPriceComparison,
  PharmacyFinancialSummary,
  PharmacyProfile
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
  pharmacyProfile: PharmacyProfile;
  onUpdatePharmacyProfile: (profile: PharmacyProfile) => void;
  onResetToDemoData: () => void;
  onClearAllDataToBlank: () => void;
  onRestoreFromJsonBackup: (backupData: any) => void;
  onImportBulkProducts: (newProducts: ProductStock[]) => void;
  onImportBulkTransactions: (newTransactions: BankTransaction[]) => void;
  onImportBulkOrders: (newOrders: SupplierOrder[]) => void;
  onImportBulkExpenses: (newExpenses: ExpenseItem[]) => void;
  isRealModeActive: boolean;
  onToggleRealMode: (isReal: boolean) => void;
  onOpenOnboardingTour?: () => void;
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
  pharmacyProfile,
  onUpdatePharmacyProfile,
  onResetToDemoData,
  onClearAllDataToBlank,
  onRestoreFromJsonBackup,
  onImportBulkProducts,
  onImportBulkTransactions,
  onImportBulkOrders,
  onImportBulkExpenses,
  isRealModeActive,
  onToggleRealMode,
  onOpenOnboardingTour
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'overview' | 'csv_import' | 'backup_restore' | 'blank_mode'>('overview');
  const [importType, setImportType] = useState<'stocks' | 'transactions' | 'orders' | 'expenses'>('stocks');
  const [csvText, setCsvText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmClearModal, setConfirmClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonBackupInputRef = useRef<HTMLInputElement>(null);

  // Local state for profile editing
  const [tempProfile, setTempProfile] = useState<PharmacyProfile>(pharmacyProfile);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePharmacyProfile(tempProfile);
    setImportFeedback({
      type: 'success',
      message: `Profil de « ${tempProfile.name} » mis à jour et sauvegardé avec succès.`
    });
  };

  // Export full pharmacy backup JSON
  const handleExportFullBackup = () => {
    const backupData = {
      version: '2.4',
      exportedAt: new Date().toISOString(),
      officineProfile: tempProfile,
      isRealModeActive,
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
    downloadAnchor.setAttribute("download", `pharmapilot_sauvegarde_${tempProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
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
          throw new Error("Format de fichier JSON invalide ou corrompu.");
        }
        if (parsed.officineProfile) {
          setTempProfile(parsed.officineProfile);
          onUpdatePharmacyProfile(parsed.officineProfile);
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

      const dataRows = lines.slice(1);

      if (importType === 'stocks') {
        const importedProds: ProductStock[] = dataRows.map((row, idx) => {
          const cols = row.split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
          const cip = cols[0] || `34009${Math.floor(10000000 + Math.random() * 90000000)}`;
          const name = cols[1] || `Produit importé ${idx + 1}`;
          const lab = cols[2] || 'Laboratoire Principal';
          const stockQty = Number(cols[3]) || 10;
          const pump = Number(cols[4]?.replace(',', '.')) || 5.0;
          const publicPriceTtc = Number(cols[5]?.replace(',', '.')) || (pump * 1.5);
          const lot = cols[6] || `LOT-IMP-${idx + 1}`;
          const expiryDate = cols[7] || '2027-12-31';

          return {
            id: `prod-imp-${Date.now()}-${idx}`,
            cip,
            name,
            laboratory: lab,
            category: 'medicament_remboursable',
            stockQty,
            minThreshold: Math.max(2, Math.floor(stockQty * 0.3)),
            maxThreshold: Math.max(10, stockQty * 3),
            pump,
            publicPriceTtc,
            tva: 2.1,
            lotNumber: lot,
            expiryDate,
            daysUntilExpiry: 365,
            location: 'Rayonnage Principal',
            status: stockQty <= 3 ? 'low_stock' : 'optimal'
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
          const label = cols[1] || `Opération ${idx + 1}`;
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
            bankAccount: `${tempProfile.primaryBankName} ${tempProfile.primaryIban || ''}`,
            reconciliationNotes: 'Import CSV relevé bancaire'
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
          const supplierName = cols[0] || 'Fournisseur / Laboratoire';
          const totalHt = Number(cols[1]?.replace(',', '.')) || 1000;
          const invoiceNum = cols[2] || `FAC-${idx + 1}`;

          return {
            id: `ord-imp-${Date.now()}-${idx}`,
            orderNumber: `CMD-${Date.now()}-${idx}`,
            supplierName,
            supplierType: supplierName.toLowerCase().includes('ocp') || supplierName.toLowerCase().includes('alliance') || supplierName.toLowerCase().includes('phoenix') ? 'grossiste' : 'laboratoire_direct',
            orderDate: new Date().toISOString().split('T')[0],
            deliveryDate: 'Livré',
            status: 'receptionnee',
            itemsCount: 10,
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
          const supplier = cols[3] || 'Prestataire / Fournisseur';

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
Abonnement Logiciel LGO;420;420;Editeur LGO
Maintenance & Informatique;280;280;Prestataire IT
Assurance RCP Entreprise;310;310;Assurance Pro`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Paramètres & Données de mon Entreprise
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !isRealModeActive;
                    onToggleRealMode(nextMode);
                    setImportFeedback({
                      type: 'success',
                      message: nextMode 
                        ? 'Mode Données Réelles activé ! Vos informations et saisies sont enregistrées en local.' 
                        : 'Mode Démonstration réactivé.'
                    });
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isRealModeActive 
                      ? 'bg-emerald-500 text-white shadow-xs' 
                      : 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 hover:bg-indigo-500/50'
                  }`}
                  title="Cliquer pour basculer entre Mode Démo et Mode Réel"
                >
                  <span className={`w-2 h-2 rounded-full ${isRealModeActive ? 'bg-white animate-pulse' : 'bg-indigo-300'}`} />
                  <span>{isRealModeActive ? '🟢 Mode Données Réelles' : '🔵 Mode Démonstration'}</span>
                </button>

                {/* Direct quick button to reset */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab('backup_restore');
                    setConfirmClearModal(true);
                  }}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 border border-rose-500/40 transition flex items-center gap-1 cursor-pointer"
                  title="Remettre toutes les données à zéro"
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  <span>Remettre à Zéro</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Personnalisez le nom de votre pharmacie/société, gérez vos vrais chiffres, importez vos fichiers CSV ou démarrez à zéro.
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

        {/* Sub-tabs navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => { setActiveSubTab('overview'); setImportFeedback(null); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>État des Données ({products.length} réf.)</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('profile'); setImportFeedback(null); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'profile'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Mon Entreprise / Officine</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('csv_import'); setImportFeedback(null); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'csv_import'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV / Excel</span>
          </button>

          <button
            onClick={() => { setActiveSubTab('backup_restore'); setImportFeedback(null); }}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'backup_restore' || activeSubTab === 'blank_mode'
                ? 'border-rose-600 text-rose-700 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span className="flex items-center gap-1.5">
              <span>Sauvegarde & Réinitialiser (À Zéro)</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">RESET</span>
            </span>
          </button>

          {onOpenOnboardingTour && (
            <button
              onClick={() => {
                onClose();
                onOpenOnboardingTour();
              }}
              className="pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 whitespace-nowrap flex items-center gap-2 cursor-pointer ml-auto"
              title="Lancer le guide pas-à-pas pour configurer vos données"
            >
              <Compass className="w-4 h-4 animate-pulse" />
              <span>Guide de Démarrage (Tour)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Feedback banner */}
          {importFeedback && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-semibold ${
              importFeedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
            }`}>
              {importFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{importFeedback.message}</span>
            </div>
          )}

          {/* TAB 0: PROFILE / IDENTITY */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 dark:text-emerald-200">
                  <strong>Personnalisation de l'en-tête et des états :</strong> Renseignez ici le nom de votre pharmacie ou entreprise, le titulaire/dirigeant, vos coordonnées et votre banque pro. Toutes ces informations s'afficheront directement dans la barre supérieure et sur les rapports comptables.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nom de l'Officine / Entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    placeholder="Ex: Pharmacie du Centre, Agri-Pharma..."
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Titulaire / Dirigeant d'entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={tempProfile.managerName}
                    onChange={(e) => setTempProfile({ ...tempProfile, managerName: e.target.value })}
                    placeholder="Ex: Dr Jean Dupont"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Forme Juridique
                  </label>
                  <input
                    type="text"
                    value={tempProfile.legalStructure}
                    onChange={(e) => setTempProfile({ ...tempProfile, legalStructure: e.target.value })}
                    placeholder="Ex: SELARL, SARL, SAS, Exploitation Agricole & Pharmacie"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Secteur d'activité
                  </label>
                  <select
                    value={tempProfile.businessSector}
                    onChange={(e) => setTempProfile({ ...tempProfile, businessSector: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="officine_pure">Pharmacie d'officine pure</option>
                    <option value="agri_pharma">Double Activité : Pharmacie d'officine & Agriculture</option>
                    <option value="polyvalent">Gestion Entreprise & Management Polyvalent</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Adresse complète de l'établissement
                  </label>
                  <input
                    type="text"
                    value={tempProfile.address}
                    onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                    placeholder="Ex: 74 Rue de la République"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Code Postal & Ville
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={tempProfile.postalCode}
                      onChange={(e) => setTempProfile({ ...tempProfile, postalCode: e.target.value })}
                      placeholder="75000"
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={tempProfile.city}
                      onChange={(e) => setTempProfile({ ...tempProfile, city: e.target.value })}
                      placeholder="Ville"
                      className="col-span-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    N° FINESS ou SIRET
                  </label>
                  <input
                    type="text"
                    value={tempProfile.finessOrSiret || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, finessOrSiret: e.target.value })}
                    placeholder="Ex: 720012345 / 801 234 567 00012"
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Banque Professionnelle Principale
                  </label>
                  <input
                    type="text"
                    value={tempProfile.primaryBankName}
                    onChange={(e) => setTempProfile({ ...tempProfile, primaryBankName: e.target.value })}
                    placeholder="Ex: Crédit Agricole Pro, BNP Paribas, Caisse d'Epargne..."
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    IBAN du compte pro (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={tempProfile.primaryIban || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, primaryIban: e.target.value })}
                    placeholder="FR76 ...."
                    className="w-full px-3 py-2 text-xs font-semibold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications du profil</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-emerald-400">
                      Persistance Locale Active sur votre Ordinateur
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Établissement : {tempProfile.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Dirigeant : <strong>{tempProfile.managerName}</strong> • {tempProfile.address}, {tempProfile.postalCode} {tempProfile.city}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveSubTab('profile')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Modifier Profil</span>
                  </button>
                  <button
                    onClick={handleExportFullBackup}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Sauvegarder (.JSON)</span>
                  </button>
                </div>
              </div>

              {/* Mode Selection Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Mode d'utilisation actuel :</span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-black ${
                      isRealModeActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>
                      {isRealModeActive ? '🟢 Mode Réel (Vos Données)' : '🔵 Mode Démonstration (Exemples)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isRealModeActive 
                      ? 'Toutes les modifications et ajouts de produits, factures et écritures sont sauvegardés pour votre entreprise.'
                      : 'L\'application affiche un jeu de données complet de simulation pour tester toutes les fonctionnalités.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleRealMode(!isRealModeActive);
                      setImportFeedback({
                        type: 'success',
                        message: !isRealModeActive ? 'Passage en Mode Données Réelles effectué !' : 'Passage en Mode Démo effectué.'
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {isRealModeActive ? 'Basculer en Mode Démo' : 'Basculer en Mode Données Réelles'}
                  </button>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Stock Produits</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{products.length}</div>
                  <div className="text-[10px] text-slate-500">références</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Commandes</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{orders.length}</div>
                  <div className="text-[10px] text-slate-500">factures grossistes</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Dépenses Fixes</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{expenses.length}</div>
                  <div className="text-[10px] text-slate-500">lignes récurrentes</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Écritures Banque</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{bankTransactions.length}</div>
                  <div className="text-[10px] text-slate-500">transactions</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Traites LCR</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{lcrStatements.length}</div>
                  <div className="text-[10px] text-slate-500">relevés échéancier</div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Trésorerie Pro</div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2 truncate">
                    {formatCurrency(summary.currentBankBalance)}
                  </div>
                  <div className="text-[10px] text-slate-500">solde bancaire</div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Actions rapides sur les données :</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <button
                    onClick={() => {
                      setActiveSubTab('backup_restore');
                      setConfirmClearModal(true);
                    }}
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-left transition flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-rose-600 text-white shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-900 dark:text-rose-200">Réinitialiser à Zéro</div>
                      <div className="text-[10px] text-rose-700 dark:text-rose-400">Vider les démos et démarrer vierge</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('csv_import')}
                    className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-left transition flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Importer CSV / Excel</div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Stock LGO, banque, factures</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportFullBackup}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-left transition flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-slate-700 text-white shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Sauvegarder (.JSON)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Télécharger la sauvegarde locale</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onResetToDemoData();
                      setImportFeedback({
                        type: 'success',
                        message: 'Jeu de données d\'exemple rechargé.'
                      });
                    }}
                    className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-left transition flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Recharger Démo</div>
                      <div className="text-[10px] text-indigo-700 dark:text-indigo-400">Restaurer les données test</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Actions Guide */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 text-xs space-y-3">
                <div className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>3 méthodes simples pour entrer vos données sans compétences techniques :</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-slate-700 space-y-1">
                    <strong className="text-emerald-900 dark:text-emerald-300 block font-semibold">1. Saisie en direct :</strong>
                    <span>Utilisez les boutons <strong>« + Nouveau Produit »</strong>, <strong>« Scanner »</strong>, <strong>« + Nouvelle Écriture »</strong> directement dans chaque onglet.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-slate-700 space-y-1">
                    <strong className="text-emerald-900 dark:text-emerald-300 block font-semibold">2. Import CSV / Excel :</strong>
                    <span>Exportez vos fichiers de stock ou relevés bancaires depuis votre logiciel LGO (WinPharma, LGPI, Smart Rx...) et importez-les dans l'onglet <strong>« Import CSV »</strong>.</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-slate-700 space-y-1">
                    <strong className="text-emerald-900 dark:text-emerald-300 block font-semibold">3. Mode Vierge :</strong>
                    <span>Si vous préférez partir d'une base 100% propre sans aucun exemple de test, allez dans l'onglet <strong>« Démarrer Vierge »</strong>.</span>
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
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Type de données à importer :</span>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
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
                  className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-semibold underline cursor-pointer"
                >
                  Charger un exemple de format CSV
                </button>
              </div>

              {/* Drag & drop or paste CSV */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Collez vos données CSV ou texte délimité par des points-virgules (;) ou virgules (,) :
                  </label>
                  <label className="cursor-pointer text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1">
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
                  className="w-full p-3 font-mono text-xs border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCsvText('')}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={handleProcessCsvImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Importer dans PharmaPilot</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP, RESTORE & RESET TO ZERO */}
          {(activeSubTab === 'backup_restore' || activeSubTab === 'blank_mode') && (
            <div className="space-y-6">
              
              {/* Option 1: Start with blank database (RESET TO ZERO) */}
              <div className="p-5 rounded-2xl border-2 border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                        1. Réinitialiser à ZÉRO (Mode Officine Vierge)
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 text-[10px] font-black">
                        BASE VIERGE
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                      Cette action vide tous les produits fictifs de démonstration, écritures de test et fausses factures pour vous permettre de démarrer immédiatement sur une base 100% propre avec vos chiffres réels d'officine.
                    </p>
                  </div>
                </div>

                {!confirmClearModal ? (
                  <button
                    onClick={() => setConfirmClearModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Vider toutes les données et démarrer à ZÉRO</span>
                  </button>
                ) : (
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-rose-400 dark:border-rose-700 space-y-3 animate-fade-in shadow-lg">
                    <div className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Confirmation : Voulez-vous vraiment effacer les données de démonstration et repartir de zéro ?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClearAllDataToBlank();
                          setConfirmClearModal(false);
                          setImportFeedback({
                            type: 'success',
                            message: 'L\'application est désormais en mode vierge (zéro produit, écritures et factures fictives).'
                          });
                          if (onOpenOnboardingTour) {
                            setTimeout(() => {
                              onClose();
                              onOpenOnboardingTour();
                            }, 400);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Oui, effacer tout et lancer le Guide de configuration</span>
                      </button>
                      <button
                        onClick={() => setConfirmClearModal(false)}
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Option 2: Restore demo dataset */}
              <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      2. Recharger le jeu de démonstration complet
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Restaure à tout moment l'ensemble des données d'exemple (Doliprane, commandes OCP, traites LCR Alliance Healthcare, flux Crédit Agricole).
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
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Recharger les données de démonstration</span>
                </button>
              </div>

              {/* Option 3 & 4: Backup & Restore JSON files */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  3. Sauvegardes sur votre ordinateur (.JSON)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Export Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-2">
                        <Download className="w-5 h-5" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        Exporter une sauvegarde complète
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Téléchargez un fichier JSON contenant le profil de votre pharmacie, vos stocks, factures, relevés LCR, écritures bancaires et dépenses.
                      </p>
                    </div>
                    <button
                      onClick={handleExportFullBackup}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger la Sauvegarde (.JSON)</span>
                    </button>
                  </div>

                  {/* Restore Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        Restaurer une sauvegarde antérieure
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Sélectionner un fichier JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>PharmaPilot Officine v2.4</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sauvegarde automatique locale active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
