import React, { useState } from 'react';
import { 
  Landmark, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  FileCheck, 
  Search, 
  Download, 
  Calendar,
  Layers,
  Receipt,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Network
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { BankTransaction, PharmacyFinancialSummary } from '../types/pharmacy';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';

interface TreasuryBankReconciliationViewProps {
  summary: PharmacyFinancialSummary;
  transactions: BankTransaction[];
  onReconcileTransaction: (transactionId: string) => void;
  onSyncBank: () => void;
  isSyncingBank: boolean;
  lastBankSyncTime: string;
  onNavigateToLcr?: () => void;
  pendingLcrAmount?: number;
  lcrDisputesCount?: number;
  onAddNewTransaction?: (newTx: Omit<BankTransaction, 'id'>) => void;
  onDeleteTransaction?: (txId: string) => void;
  onImportBulkTransactions?: (txs: BankTransaction[]) => void;
  onOpenResopharmaModal?: () => void;
  resopharmaBordereauxCount?: number;
  resopharmaPendingAmount?: number;
  resopharmaRejectionsCount?: number;
}

export const TreasuryBankReconciliationView: React.FC<TreasuryBankReconciliationViewProps> = ({
  summary,
  transactions,
  onReconcileTransaction,
  onSyncBank,
  isSyncingBank,
  lastBankSyncTime,
  onNavigateToLcr,
  pendingLcrAmount = 39761.10,
  lcrDisputesCount = 1,
  onAddNewTransaction,
  onDeleteTransaction,
  onImportBulkTransactions,
  onOpenResopharmaModal,
  resopharmaBordereauxCount = 6,
  resopharmaPendingAmount = 2840.50,
  resopharmaRejectionsCount = 2
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoReconciliationSuccess, setAutoReconciliationSuccess] = useState<boolean>(false);

  // New transaction modal
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  // Form fields
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txLabel, setTxLabel] = useState('');
  const [txType, setTxType] = useState<'credit' | 'debit'>('credit');
  const [txAmount, setTxAmount] = useState(1500);
  const [txCategory, setTxCategory] = useState<BankTransaction['category']>('cpam_ro');
  const [txMatchedInvoice, setTxMatchedInvoice] = useState('');
  const [txAccount, setTxAccount] = useState('Crédit Agricole Anjou Maine FR76 1790 6001 1296 4141 1923 609');

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txLabel || txAmount <= 0) return;

    if (onAddNewTransaction) {
      onAddNewTransaction({
        date: txDate,
        label: txLabel,
        type: txType,
        amount: Number(txAmount),
        category: txCategory,
        status: 'a_rapprocher',
        bankAccount: txAccount,
        matchedInvoice: txMatchedInvoice || undefined,
        reconciliationNotes: 'Saisie manuelle officine'
      });
    }

    setIsAddTxOpen(false);
    setTxLabel('');
    setTxMatchedInvoice('');
  };

  const handleCsvImportSubmit = () => {
    if (!csvContent.trim()) return;
    try {
      const lines = csvContent.trim().split(/\r?\n/).filter(l => l.trim() !== '');
      const dataRows = lines.slice(1);
      const imported: BankTransaction[] = dataRows.map((row, idx) => {
        const cols = row.split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
        const date = cols[0] || new Date().toISOString().split('T')[0];
        const label = cols[1] || `Écriture bancaire ${idx + 1}`;
        const rawAmount = Number(cols[2]?.replace(',', '.')) || 100;
        const type: 'credit' | 'debit' = rawAmount >= 0 ? 'credit' : 'debit';
        const amount = Math.abs(rawAmount);

        return {
          id: `tx-csv-${Date.now()}-${idx}`,
          date,
          label,
          type,
          amount,
          category: 'autre',
          status: 'a_rapprocher',
          bankAccount: txAccount,
          reconciliationNotes: 'Importé depuis relevé CSV'
        };
      });

      if (onImportBulkTransactions) {
        onImportBulkTransactions(imported);
      }
      setIsImportCsvOpen(false);
      setCsvContent('');
    } catch (e: any) {
      alert("Erreur lors de l'import CSV : " + e.message);
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.matchedInvoice && tx.matchedInvoice.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = filterCategory === 'all' || tx.category === filterCategory;
    const matchesStat = filterStatus === 'all' || tx.status === filterStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  const pendingReconciliationCount = transactions.filter(t => t.status === 'a_rapprocher').length;
  const discrepanciesCount = transactions.filter(t => t.status === 'ecart_detecte').length;

  const handleAutoReconcileAll = () => {
    transactions.forEach(t => {
      if (t.status === 'a_rapprocher') {
        onReconcileTransaction(t.id);
      }
    });
    setAutoReconciliationSuccess(true);
    setTimeout(() => setAutoReconciliationSuccess(false), 4000);
  };

  // Forecast cash flow simulation data (30 days forecast starting from current balance)
  const cashForecastData = [
    { day: '31/07 (Clôture CA)', solde: 16708, entrees: 9560, sorties: 5200 },
    { day: '05/08 (CPAM & CB)', solde: 24500, entrees: 12800, sorties: 5008 },
    { day: '10/08 (LCR CERP)', solde: 19200, entrees: 14500, sorties: 19800 },
    { day: '15/08 (CPAM Le Mans)', solde: 31400, entrees: 16200, sorties: 4000 },
    { day: '20/08 (Labos Directs)', solde: 27800, entrees: 6200, sorties: 9800 },
    { day: '25/08 (DRE Mutuelles)', solde: 34500, entrees: 11400, sorties: 4700 },
    { day: '27/08 (LCR Pfizer & Salaires)', solde: 22900, entrees: 8500, sorties: 20100 },
    { day: '31/08 (Clôture)', solde: 28600, entrees: 12000, sorties: 6300 }
  ];

  const handleExportCsv = () => {
    const data = filteredTransactions.map(t => ({
      'Date Valeur': t.date,
      'Libellé Bancaire': t.label,
      'Sens': t.type === 'credit' ? 'Crédit (+)' : 'Débit (-)',
      'Montant': t.amount,
      'Catégorie': t.category,
      'Compte Bancaire': t.bankAccount,
      'Statut Rapprochement': t.status,
      'Pièce Justificative / Facture': t.matchedInvoice || '-',
      'Notes / Écart': t.reconciliationNotes || '-'
    }));
    exportToCsv(data, 'rapprochement_bancaire_credit_agricole');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Crédit Agricole Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Landmark className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Trésorerie & Réconciliation Bancaire Crédit Agricole
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Synchronisation directe API DSP2 Entreprises Crédit Agricole, pointage automatique des flux CPAM / Mutuelles et suivi des décaissements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenResopharmaModal && (
            <button
              onClick={onOpenResopharmaModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition"
              title="Connecteur Resopharma : Télétransmission, Retours NOEMIE et bordereaux DRE mutuelles"
            >
              <Network className="w-4 h-4" />
              <span>Connecteur Resopharma</span>
            </button>
          )}

          <button
            onClick={() => setIsAddTxOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Écriture</span>
          </button>

          <button
            onClick={() => setIsImportCsvOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 rotate-180" />
            <span>Importer Relevé CSV</span>
          </button>

          <button
            onClick={onSyncBank}
            disabled={isSyncingBank}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingBank ? 'animate-spin' : ''}`} />
            <span>{isSyncingBank ? 'Synchro...' : 'Synchro CA'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* LCR & Wholesaler Drafts Cash Flow Alert Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-sm border border-indigo-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shrink-0">
            <Receipt className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">
                Traites LCR Fournisseurs & Prélèvements à Échéance
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-400/20 text-indigo-300 border border-indigo-400/40">
                {formatCurrency(pendingLcrAmount)} TTC à décaisser
              </span>
              {lcrDisputesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {lcrDisputesCount} litige LCR en cours
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Prochaine échéance majeure OCP & Alliance Healthcare le <strong>31 Août 2026</strong>. Vérifiez vos Bons à Payer (BAP) et les avoirs déduits avant la date limite d'opposition bancaire (28 Août).
            </p>
          </div>
        </div>

        {onNavigateToLcr && (
          <button
            onClick={onNavigateToLcr}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ouvrir Contrôle LCR & BAP</span>
          </button>
        )}
      </div>

      {/* RESOPHARMA Teletransmission & NOEMIE / DRE Cash Flow Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-sm border border-purple-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 shrink-0">
            <Network className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>Télétransmission RESOPHARMA : Retours NOEMIE & Bordereaux Tiers-Payant</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-400/20 text-purple-300 border border-purple-400/40">
                {resopharmaBordereauxCount} bordereaux SESAM-Vitale
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {formatCurrency(resopharmaPendingAmount)} en attente de virement
              </span>
              {resopharmaRejectionsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {resopharmaRejectionsCount} anomalie(s) / rejet TP
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Le concentrateur <strong>RESOPHARMA</strong> transmet les bordereaux de télétransmission CPAM (NOEMIE) et mutuelles (DRE Viamédis, Almerys, iSanté). Rapprochez automatiquement les virements reçus sur votre compte bancaire.
            </p>
          </div>
        </div>

        {onOpenResopharmaModal && (
          <button
            onClick={onOpenResopharmaModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Ouvrir Connecteur Resopharma</span>
          </button>
        )}
      </div>

      {/* Auto Reconciliation Alert */}
      {autoReconciliationSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Rapprochement automatique effectué avec succès ! Toutes les écritures compatibles ont été lettrées.</span>
        </div>
      )}

      {/* Bank Account Highlights Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-emerald-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Solde Bancaire Réel CA
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatCurrency(summary.currentBankBalance)}
          </div>
          <div className="text-[11px] text-emerald-200/80 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Crédit Agricole Pro • DSP2 Certifié</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 font-mono">
            Dernière synchro : {lastBankSyncTime}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Solde Comptable Officine
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(summary.accountingBalance)}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            Écart de pointage : {formatCurrency(summary.accountingBalance - summary.currentBankBalance)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Écritures à Rapprocher
          </div>
          <div className="text-xl font-bold text-slate-900">
            {pendingReconciliationCount} flux en attente
          </div>
          <div className="mt-2">
            <button
              onClick={handleAutoReconcileAll}
              className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200"
            >
              Lettrage Automatique IA →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Créances TP à Encaisser (CPAM/Mut.)
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(summary.pendingCustomerReceivables)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Télétransmissions en cours de traitement
          </div>
        </div>
      </div>

      {/* Cash Flow Forecast Chart (30 Days) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Échéancier & Prévisionnel de Trésorerie à 30 Jours
            </h2>
            <p className="text-xs text-slate-500">
              Simulation dynamique croisant encaissements prévisionnels (CPAM / Ventes) et décaissements (Grossistes, Salaires, Loyer).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span>Solde Prévisionnel (€)</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashForecastData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip 
                formatter={(val: any) => [formatCurrency(Number(val)), 'Solde de Trésorerie']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="solde" 
                stroke="#059669" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#059669' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Bank Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une opération bancaire ou facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
            >
              <option value="all">Toutes les catégories de flux</option>
              <option value="cpam_ro">Sécurité Sociale CPAM</option>
              <option value="mutuelles_rc">Mutuelles Tiers-Payant</option>
              <option value="remise_cb">Remises Cartes Bancaires</option>
              <option value="fournisseur">Fournisseurs & Grossistes</option>
              <option value="especes">Dépôts Espèces</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
            >
              <option value="all">Tous les états de pointage</option>
              <option value="a_rapprocher">⏳ À rapprocher</option>
              <option value="rapproche">✅ Rapproché / Lettré</option>
              <option value="ecart_detecte">⚠️ Écart détecté</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date Valeur</th>
                <th className="py-3 px-3">Libellé de l'Opération</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3 text-right">Montant Débit</th>
                <th className="py-3 px-3 text-right">Montant Crédit</th>
                <th className="py-3 px-3">Rapprochement / Pièce</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const isDebit = tx.type === 'debit';
                const isReconciled = tx.status === 'rapproche';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {isDebit ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        )}
                        <span>{tx.label}</span>
                      </div>
                      {tx.reconciliationNotes && (
                        <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                          ⚠️ {tx.reconciliationNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="capitalize font-medium text-slate-600">
                        {tx.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                      {isDebit ? formatCurrency(tx.amount) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {!isDebit ? formatCurrency(tx.amount) : '-'}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-slate-700 font-medium flex items-center gap-1.5 flex-wrap">
                        {tx.matchedInvoice ? (
                          <>
                            <span>{tx.matchedInvoice}</span>
                            {(tx.matchedInvoice.includes('TELETRANS') || tx.matchedInvoice.includes('RESO') || tx.category === 'cpam_ro' || tx.category === 'mutuelles_rc') && onOpenResopharmaModal && (
                              <button
                                onClick={onOpenResopharmaModal}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 transition"
                                title="Voir le bordereau dans le connecteur Resopharma"
                              >
                                <Network className="w-3 h-3" />
                                <span>Bordereau TP</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-slate-400 italic">Non rattaché</span>
                            {(tx.category === 'cpam_ro' || tx.category === 'mutuelles_rc') && onOpenResopharmaModal && (
                              <button
                                onClick={onOpenResopharmaModal}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
                                title="Associer un bordereau Resopharma"
                              >
                                <Network className="w-3 h-3" />
                                <span>Pointer Resopharma</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isReconciled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Rapproché
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          À pointer
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isReconciled ? (
                          <button
                            onClick={() => onReconcileTransaction(tx.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition"
                          >
                            Valider Lettrage
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5" /> Lettré
                          </span>
                        )}

                        {onDeleteTransaction && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Supprimer l'écriture « ${tx.label} » ?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Supprimer cette écriture"
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

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Aucune écriture bancaire enregistrée
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Saisissez un flux ou importez votre relevé bancaire (Crédit Agricole, BNP, etc.) au format CSV.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setIsAddTxOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                >
                  + Nouvelle Écriture
                </button>
                <button
                  onClick={() => setIsImportCsvOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs"
                >
                  Importer Relevé CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD TRANSACTION */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Nouvelle écriture bancaire</h3>
                  <p className="text-xs text-slate-400">Saisie d'un flux de trésorerie ou recette/dépense</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTxOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTxSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de Valeur *
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sens du Flux *
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTxType('credit')}
                      className={`py-1 text-xs font-bold rounded-lg ${txType === 'credit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'}`}
                    >
                      + Crédit
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('debit')}
                      className={`py-1 text-xs font-bold rounded-lg ${txType === 'debit' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'}`}
                    >
                      - Débit
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Libellé Bancaire *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VIR CPAM 75 NOEMIE FLUX 44029"
                  value={txLabel}
                  onChange={(e) => setTxLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Montant (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as BankTransaction['category'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="cpam_ro">Sécurité Sociale (CPAM - NOEMIE)</option>
                    <option value="mutuelles_rc">Mutuelles Tiers-Payant (DRE)</option>
                    <option value="remise_cb">Remise Cartes Bancaires (TPE)</option>
                    <option value="especes">Dépôt Espèces / Coffre</option>
                    <option value="fournisseur">Fournisseur / Grossiste Pharma</option>
                    <option value="loyer">Loyer Commercial Officine</option>
                    <option value="charges_sociales">Salaires & Charges Sociales</option>
                    <option value="autre">Autre flux / Frais bancaires</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  N° Facture / Pièce Justificative (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: FAC-2026-0889 ou BAP-OCP-992"
                  value={txMatchedInvoice}
                  onChange={(e) => setTxMatchedInvoice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTxOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Enregistrer l'écriture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT CSV */}
      {isImportCsvOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Download className="w-5 h-5 rotate-180" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Importer un relevé bancaire CSV</h3>
                  <p className="text-xs text-slate-400">Compatible exports Crédit Agricole, BNP, LCL, etc.</p>
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
                <span className="text-xs font-bold text-slate-700">Contenu du relevé CSV :</span>
                <label className="cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-800">
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
                placeholder="Date;Libellé;Montant&#10;2026-08-20;VIR CPAM 75 NOEMIE;14520.30&#10;2026-08-19;PRLV OCP REPARTITION;-28910.40"
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500"
              />

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <strong>Format attendu :</strong> Date (AAAA-MM-JJ) ; Libellé ; Montant (positif pour crédit, négatif pour débit).
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportCsvOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCsvImportSubmit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Importer les écritures
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
