import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ShieldCheck, 
  Landmark, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  RefreshCw, 
  Check, 
  FileCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Send,
  X
} from 'lucide-react';
import { 
  LcrStatement, 
  LcrStatus, 
  LcrInvoiceItem, 
  LcrCreditNoteItem 
} from '../types/lcr';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface LcrControlViewProps {
  statements: LcrStatement[];
  onValidateBap: (statementId: string, signedBy: string, notes?: string) => void;
  onDeclareDispute: (statementId: string, reason: string) => void;
  onSimulateLcrDebit: (statementId: string) => void;
  onToggleInvoiceVerification: (statementId: string, invoiceId: string) => void;
  onImportNewStatement: (newStatement: LcrStatement) => void;
  currentBankBalance: number;
  onOpenElectronicInvoicingVault?: () => void;
}

export const LcrControlView: React.FC<LcrControlViewProps> = ({
  statements,
  onValidateBap,
  onDeclareDispute,
  onSimulateLcrDebit,
  onToggleInvoiceVerification,
  onImportNewStatement,
  currentBankBalance,
  onOpenElectronicInvoicingVault
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSupplierType, setFilterSupplierType] = useState<string>('all');
  const [expandedStatementId, setExpandedStatementId] = useState<string | null>('lcr-ocp-2026-08');
  
  // Modals
  const [isBapModalOpen, setIsBapModalOpen] = useState(false);
  const [selectedStatementForBap, setSelectedStatementForBap] = useState<LcrStatement | null>(null);
  const [pharmacistName, setPharmacistName] = useState('Dr. Sophie Laurent (Titulaire)');
  const [bapNote, setBapNote] = useState('');

  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [selectedStatementForDispute, setSelectedStatementForDispute] = useState<LcrStatement | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState('');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Calculations
  const activeStatements = statements.filter(s => s.status !== 'regle_debit');
  const totalPendingAmount = activeStatements.reduce((sum, s) => sum + s.totalAmountDrawn, 0);
  const totalBapApprovedAmount = statements.filter(s => s.status === 'bon_a_payer').reduce((sum, s) => sum + s.totalAmountDrawn, 0);
  const totalDiscrepancyAmount = statements.filter(s => s.status === 'litige_partiel').reduce((sum, s) => sum + s.discrepancyAmount, 0);
  const disputesCount = statements.filter(s => s.status === 'litige_partiel').length;
  const toControlCount = statements.filter(s => s.status === 'a_controler').length;

  // Filtered statements
  const filteredStatements = statements.filter(s => {
    const matchesSearch = 
      s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lcrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.invoices.some(inv => inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.creditNotes.some(cr => cr.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchesSupplierType = filterSupplierType === 'all' || s.supplierType === filterSupplierType;

    return matchesSearch && matchesStatus && matchesSupplierType;
  });

  const getStatusBadge = (status: LcrStatus) => {
    switch (status) {
      case 'bon_a_payer':
        return {
          label: 'Bon à Payer (BAP) Validé',
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: CheckCircle2
        };
      case 'litige_partiel':
        return {
          label: 'Litige / Écart Détecté',
          bgColor: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: AlertTriangle
        };
      case 'a_controler':
        return {
          label: 'À Contrôler / En Pointage',
          bgColor: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: Clock
        };
      case 'rejete_banque':
        return {
          label: 'Rejet Bancaire Transmis',
          bgColor: 'bg-purple-50 text-purple-800 border-purple-300',
          icon: XCircle
        };
      case 'regle_debit':
        return {
          label: 'Débité & Lettré en Banque',
          bgColor: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Landmark
        };
      default:
        return {
          label: status,
          bgColor: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: FileText
        };
    }
  };

  const handleOpenBapModal = (statement: LcrStatement) => {
    setSelectedStatementForBap(statement);
    setBapNote(`BAP certifié après contrôle des ${statement.invoices.length} factures et réceptions réelles.`);
    setIsBapModalOpen(true);
  };

  const handleConfirmBap = () => {
    if (selectedStatementForBap) {
      onValidateBap(selectedStatementForBap.id, pharmacistName, bapNote);
      setIsBapModalOpen(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleOpenDisputeModal = (statement: LcrStatement) => {
    setSelectedStatementForDispute(statement);
    setDisputeReasonText(
      statement.discrepancyReasons && statement.discrepancyReasons.length > 0
        ? statement.discrepancyReasons.join('\n')
        : `Écart de ${formatCurrency(statement.discrepancyAmount)} détecté sur le relevé ${statement.lcrNumber}. Avoir manquant ou erreur de tarification.`
    );
    setIsDisputeModalOpen(true);
  };

  const handleConfirmDispute = () => {
    if (selectedStatementForDispute) {
      onDeclareDispute(selectedStatementForDispute.id, disputeReasonText);
      setIsDisputeModalOpen(false);
    }
  };

  const handleExportLcrReport = () => {
    const exportData = statements.map(s => ({
      Numero_LCR: s.lcrNumber,
      Fournisseur: s.supplierName,
      Type: s.supplierType,
      Periode: s.periodLabel,
      Date_Emission: s.issueDate,
      Date_Echeance_Banque: s.dueDate,
      Date_Limite_Rejet: s.rejectionDeadlineDate,
      Montant_Tire_TTC: s.totalAmountDrawn,
      Montant_Factures_TTC: s.calculatedAmountInvoices,
      Montant_Avoirs_TTC: s.totalCreditNotes,
      Ecart_Discrepancy: s.discrepancyAmount,
      Statut: s.status,
      Score_Concordance: `${s.reconciliationScore}%`,
      Compte_Bancaire: s.bankAccount,
      Signataire_BAP: s.bapSignedBy || '',
      Date_BAP: s.bapDate || ''
    }));

    exportToCsv(exportData, `PharmaPilot_Controle_LCR_Traites_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleSimulateNewLcrImport = (preset: 'cerp' | 'bioderma' | 'alliance_quinzaine') => {
    let newStmt: LcrStatement;
    if (preset === 'cerp') {
      newStmt = {
        id: `lcr-cerp-${Date.now()}`,
        lcrNumber: `LCR-CERP-2026-09-${Math.floor(10 + Math.random() * 80)}`,
        supplierName: 'CERP Rouen (Grossiste Répartiteur)',
        supplierSiren: '055 801 234',
        supplierType: 'grossiste',
        periodLabel: 'Relevé Décadaire (15 au 25 Août 2026)',
        issueDate: '2026-08-22',
        dueDate: '2026-09-15',
        rejectionDeadlineDate: '2026-09-12',
        totalAmountDrawn: 11450.00,
        calculatedAmountInvoices: 11450.00,
        totalCreditNotes: 0.00,
        discrepancyAmount: 0.00,
        status: 'a_controler',
        reconciliationScore: 90,
        bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01',
        bankPreNotificationReceived: true,
        invoices: [
          {
            id: `inv-cerp-1-${Date.now()}`,
            invoiceNumber: `FAC-CERP-${Math.floor(10000 + Math.random() * 90000)}`,
            issueDate: '2026-08-16',
            amountHt: 5200.00,
            amountTtc: 5720.00,
            itemsCount: 160,
            verified: true,
            matchedStockReception: true
          },
          {
            id: `inv-cerp-2-${Date.now()}`,
            invoiceNumber: `FAC-CERP-${Math.floor(10000 + Math.random() * 90000)}`,
            issueDate: '2026-08-20',
            amountHt: 5209.09,
            amountTtc: 5730.00,
            itemsCount: 145,
            verified: false,
            matchedStockReception: true,
            notes: 'En attente de pointage pharmacien'
          }
        ],
        creditNotes: []
      };
    } else {
      newStmt = {
        id: `lcr-bioderma-${Date.now()}`,
        lcrNumber: `LCR-NAOS-2026-09-${Math.floor(10 + Math.random() * 80)}`,
        supplierName: 'Laboratoires NAOS (Bioderma / Institut Esthederm)',
        supplierSiren: '344 329 876',
        supplierType: 'laboratoire_direct',
        periodLabel: 'Commande Dermo-Cosmétique Directe Août',
        issueDate: '2026-08-22',
        dueDate: '2026-09-30',
        rejectionDeadlineDate: '2026-09-28',
        totalAmountDrawn: 4890.00,
        calculatedAmountInvoices: 5200.00,
        totalCreditNotes: 310.00,
        discrepancyAmount: 0.00,
        status: 'a_controler',
        reconciliationScore: 95,
        bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01',
        bankPreNotificationReceived: true,
        invoices: [
          {
            id: `inv-naos-1-${Date.now()}`,
            invoiceNumber: `FAC-NAOS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            issueDate: '2026-08-18',
            amountHt: 4333.33,
            amountTtc: 5200.00,
            discountAmount: 260.00,
            commercialBonusRfa: 310.00,
            itemsCount: 220,
            verified: true,
            matchedStockReception: true
          }
        ],
        creditNotes: [
          {
            id: `av-naos-1-${Date.now()}`,
            creditNoteNumber: `RFA-NAOS-T2-${Math.floor(100 + Math.random() * 900)}`,
            date: '2026-08-18',
            reason: 'rfa_trimestrielle',
            amountTtc: 310.00,
            appliedOnLcr: true,
            notes: 'Remise trimestrielle partenariat dermo'
          }
        ]
      };
    }

    onImportNewStatement(newStmt);
    setIsImportModalOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Receipt className="w-6 h-6 text-indigo-600" />
              <span>Contrôle des Factures & Règlements LCR</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Traites & Prélèvements
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rapprochement 3 points : Factures reçues / Factur-X ↔ Relevés LCR grossistes/labos ↔ Avis de débit Crédit Agricole
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Importer Bordereau LCR</span>
          </button>

          <button
            onClick={handleExportLcrReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export BAP / Traites (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Traites LCR à Échéance</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(totalPendingAmount)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span>{activeStatements.length} relevés LCR en cours</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Bon à Payer (BAP) Validé</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-2">
            {formatCurrency(totalBapApprovedAmount)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Prêt pour prélèvement bancaire</span>
          </div>
        </div>

        <div className={`bg-white rounded-2xl p-4 border shadow-xs ${
          totalDiscrepancyAmount > 0 ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${totalDiscrepancyAmount > 0 ? 'text-rose-900' : 'text-slate-500'}`}>
              Litiges & Écarts Détectés
            </span>
            <div className={`p-2 rounded-xl ${totalDiscrepancyAmount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-2 ${totalDiscrepancyAmount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
            {formatCurrency(totalDiscrepancyAmount)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            {disputesCount > 0 ? (
              <span className="text-rose-600 font-bold">{disputesCount} LCR en litige (Avoir non déduit)</span>
            ) : (
              <span className="text-slate-500">Aucun écart de facturation</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Prochaine Échéance Crédit Agricole</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            31 Août 2026
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-indigo-700">31 340,70 € (OCP + Alliance)</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">J-9</span>
          </div>
        </div>
      </div>

      {/* Rejection Deadline & Legal Protection Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">
                Règle Métier Officine : Délai légal d'opposition & rejet LCR (J-2 Ouvré)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Date Limite Rejet : 28/08/2026 à 12h00
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Toute contestation ou rejet partiel d'une traite LCR (facture contestée, avoir manquant non déduit par le grossiste) doit être transmis à votre chargé de compte Crédit Agricole au plus tard 2 jours ouvrés avant l'échéance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <span className="text-xs text-slate-300 font-medium hidden lg:inline">Solde Banque Actuel :</span>
          <span className="px-2.5 py-1 rounded-xl bg-white/10 font-mono font-bold text-xs text-emerald-300 border border-white/10">
            {formatCurrency(currentBankBalance)}
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par N° LCR, grossiste, N° facture, N° avoir..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 py-2 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">Tous les statuts</option>
              <option value="a_controler">À Contrôler / Pointage ({toControlCount})</option>
              <option value="bon_a_payer">Bon à Payer Validé</option>
              <option value="litige_partiel">Litiges & Écarts ({disputesCount})</option>
              <option value="regle_debit">Débitées en banque</option>
            </select>

            <select
              value={filterSupplierType}
              onChange={e => setFilterSupplierType(e.target.value)}
              className="text-xs rounded-xl border border-slate-300 py-2 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="all">Tous les fournisseurs</option>
              <option value="grossiste">Grossistes Répartiteurs</option>
              <option value="laboratoire_direct">Laboratoires Directs</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium shrink-0 self-end sm:self-auto">
          {filteredStatements.length} bordereau(x) LCR
        </div>
      </div>

      {/* LCR Statements Accordion / Cards List */}
      <div className="space-y-4">
        {filteredStatements.map(statement => {
          const isExpanded = expandedStatementId === statement.id;
          const statusBadge = getStatusBadge(statement.status);
          const StatusIcon = statusBadge.icon;
          const verifiedInvoicesCount = statement.invoices.filter(i => i.verified).length;
          const allInvoicesVerified = verifiedInvoicesCount === statement.invoices.length;

          return (
            <div 
              key={statement.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                statement.status === 'litige_partiel' 
                  ? 'border-rose-300 ring-1 ring-rose-200' 
                  : statement.status === 'bon_a_payer'
                  ? 'border-emerald-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header Summary */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    statement.supplierType === 'grossiste' 
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                      : 'bg-teal-50 text-teal-600 border border-teal-100'
                  }`}>
                    <Building2 className="w-6 h-6" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900">
                        {statement.supplierName}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {statement.lcrNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.bgColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusBadge.label}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                      <span className="font-medium text-slate-700">{statement.periodLabel}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Échéance Banque : <strong className="text-slate-900">{formatDate(statement.dueDate)}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[11px] font-semibold">
                        Rejet limite : {formatDate(statement.rejectionDeadlineDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Quick Actions */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <div className="text-[11px] text-slate-500 font-semibold">Montant Tiré par Fournisseur</div>
                    <div className="text-lg sm:text-xl font-black text-slate-900">
                      {formatCurrency(statement.totalAmountDrawn)}
                    </div>
                    {statement.discrepancyAmount > 0 && (
                      <div className="text-[11px] font-bold text-rose-600 flex items-center lg:justify-end gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Écart : +{formatCurrency(statement.discrepancyAmount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {statement.status === 'a_controler' && (
                      <button
                        onClick={() => handleOpenBapModal(statement)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Valider BAP</span>
                      </button>
                    )}

                    {statement.status === 'litige_partiel' && (
                      <button
                        onClick={() => handleOpenDisputeModal(statement)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Gérer Litige</span>
                      </button>
                    )}

                    {statement.status === 'bon_a_payer' && (
                      <button
                        onClick={() => onSimulateLcrDebit(statement.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
                        title="Simuler le prélèvement bancaire à l'échéance et le lettrage"
                      >
                        <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Simuler Débit Banque</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedStatementId(isExpanded ? null : statement.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                      title={isExpanded ? "Masquer le détail du pointage" : "Voir le pointage ligne à ligne"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel : 3-Way Reconciliation */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/50 p-4 sm:p-5 space-y-5">
                  {/* Status Banner / BAP Signature Proof */}
                  {statement.bapSignedBy && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Bon à Payer (BAP) signé par {statement.bapSignedBy} le {formatDate(statement.bapDate || '')}</span>
                      </div>
                      {statement.bapNotes && (
                        <span className="text-emerald-700 italic">« {statement.bapNotes} »</span>
                      )}
                    </div>
                  )}

                  {/* Discrepancy Alert Box */}
                  {statement.discrepancyReasons && statement.discrepancyReasons.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-rose-900">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Analyse de l'écart détecté par PharmaPilot :</span>
                      </div>
                      <ul className="space-y-1 pl-6 list-disc text-xs text-rose-800">
                        {statement.discrepancyReasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleOpenDisputeModal(statement)}
                          className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                        >
                          Rédiger Contestation Fournisseur & Notification Banque
                        </button>
                        <button
                          onClick={() => handleOpenBapModal(statement)}
                          className="px-3 py-1 rounded-lg bg-white border border-rose-300 text-rose-800 text-xs font-semibold hover:bg-rose-50 transition"
                        >
                          Forcer BAP sous réserve
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 3-Way Reconciliation Score & Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500">1. Montant Relevé Fournisseur (LCR)</div>
                      <div className="text-base font-black text-slate-900 mt-1">
                        {formatCurrency(statement.totalAmountDrawn)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tiré sur le compte Crédit Agricole</div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500">2. Somme Factures Pointées ({statement.invoices.length})</div>
                      <div className="text-base font-black text-slate-900 mt-1">
                        {formatCurrency(statement.calculatedAmountInvoices)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        {verifiedInvoicesCount}/{statement.invoices.length} factures vérifiées avec BL
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500">3. Avoirs & RFA Déduits ({statement.creditNotes.length})</div>
                      <div className="text-base font-black text-slate-900 mt-1">
                        -{formatCurrency(statement.totalCreditNotes)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {statement.creditNotes.filter(c => c.appliedOnLcr).length} avoir(s) bien imputé(s)
                      </div>
                    </div>
                  </div>

                  {/* Detailed Invoices List for This LCR */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                      <div className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Détail des Factures rattachées au Relevé ({statement.invoices.length})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cochez pour pointer avec vos réceptions réelles
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">Pointé</th>
                            <th className="py-2.5 px-3">N° Facture</th>
                            <th className="py-2.5 px-3">N° Bon Livraison (BL)</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3 text-right">Montant HT</th>
                            <th className="py-2.5 px-3 text-right">Montant TTC</th>
                            <th className="py-2.5 px-3 text-center">Lignes/Qté</th>
                            <th className="py-2.5 px-3">Remarques / Conformité</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {statement.invoices.map(inv => (
                            <tr 
                              key={inv.id}
                              className={`hover:bg-slate-50/80 transition ${inv.verified ? 'bg-emerald-50/20' : ''}`}
                            >
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  onClick={() => onToggleInvoiceVerification(statement.id, inv.id)}
                                  className={`p-1 rounded-lg border transition ${
                                    inv.verified 
                                      ? 'bg-emerald-600 text-white border-emerald-600' 
                                      : 'bg-white text-slate-300 border-slate-300 hover:border-slate-400'
                                  }`}
                                  title={inv.verified ? "Facture pointée (cliquez pour annuler)" : "Cliquer pour pointer"}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                {inv.invoiceNumber}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">
                                {inv.deliverySlipNumber || '—'}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {formatDate(inv.issueDate)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                                {formatCurrency(inv.amountHt)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                {formatCurrency(inv.amountTtc)}
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-600 font-semibold">
                                {inv.itemsCount} art.
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">
                                {inv.notes || (
                                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Réception conforme</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Credit Notes Table if applicable */}
                  {statement.creditNotes.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                        <div className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-emerald-600" />
                          <span>Avoirs & RFA liés à la période ({statement.creditNotes.length})</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                            <tr>
                              <th className="py-2.5 px-3">N° Avoir / RFA</th>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Motif de l'avoir</th>
                              <th className="py-2.5 px-3 text-right">Montant TTC Déduit</th>
                              <th className="py-2.5 px-3 text-center">État sur LCR</th>
                              <th className="py-2.5 px-3">Commentaire</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {statement.creditNotes.map(cr => (
                              <tr key={cr.id} className={cr.appliedOnLcr ? 'bg-emerald-50/20' : 'bg-rose-50/40'}>
                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                  {cr.creditNoteNumber}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">
                                  {formatDate(cr.date)}
                                </td>
                                <td className="py-2.5 px-3 capitalize text-slate-700 font-medium">
                                  {cr.reason.replace(/_/g, ' ')}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                  -{formatCurrency(cr.amountTtc)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {cr.appliedOnLcr ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Bien Déduit
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                      NON DÉDUIT (Litige)
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">
                                  {cr.notes || 'Avoir validé'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action Bar inside expanded view */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500 font-mono">
                      Compte de débit : <strong>{statement.bankAccount}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenBapModal(statement)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Signer Bon à Payer (BAP)</span>
                      </button>

                      <button
                        onClick={() => handleOpenDisputeModal(statement)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold shadow-xs transition"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Déclarer Litige / Opposition</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Validate Bon à Payer (BAP) */}
      {isBapModalOpen && selectedStatementForBap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Validation du Bon à Payer (BAP)
                  </h3>
                  <p className="text-xs text-slate-500">{selectedStatementForBap.supplierName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBapModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Relevé LCR :</span>
                <span className="font-mono font-bold text-slate-900">{selectedStatementForBap.lcrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date d'échéance :</span>
                <span className="font-bold text-slate-900">{formatDate(selectedStatementForBap.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Montant net certifié BAP :</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  {formatCurrency(selectedStatementForBap.totalAmountDrawn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nombre de factures vérifiées :</span>
                <span className="font-semibold text-slate-800">{selectedStatementForBap.invoices.length} factures</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmacien Titulaire Signataire :
                </label>
                <input
                  type="text"
                  value={pharmacistName}
                  onChange={e => setPharmacistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Note d'audit / Commentaire de validation :
                </label>
                <textarea
                  rows={2}
                  value={bapNote}
                  onChange={e => setBapNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Factures pointées avec les réceptions effectives..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBapModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmBap}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apposer Bon à Payer Électronique</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Declare Dispute / Contestation LCR */}
      {isDisputeModalOpen && selectedStatementForDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Déclaration de Litige LCR / Opposition Partielle
                  </h3>
                  <p className="text-xs text-slate-500">{selectedStatementForDispute.supplierName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50 rounded-2xl p-4 space-y-2 border border-rose-200 text-xs">
              <div className="flex justify-between">
                <span className="text-rose-800">Montant tiré par le fournisseur :</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedStatementForDispute.totalAmountDrawn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-800">Montant dû réel recalculé :</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedStatementForDispute.totalAmountDrawn - selectedStatementForDispute.discrepancyAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-rose-200 pt-1.5">
                <span className="font-bold text-rose-900">Montant de l'écart à contester :</span>
                <span className="font-mono font-black text-rose-700 text-sm">
                  {formatCurrency(selectedStatementForDispute.discrepancyAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-xs font-bold text-slate-700">
                Motif détaillé du litige (transmis au fournisseur & Crédit Agricole) :
              </label>
              <textarea
                rows={4}
                value={disputeReasonText}
                onChange={e => setDisputeReasonText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500/30"
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Date limite légale pour transmettre l'opposition à la banque :</span>
              </div>
              <p>Au plus tard le <strong>{formatDate(selectedStatementForDispute.rejectionDeadlineDate)}</strong> à 12h00 auprès de votre agence Crédit Agricole.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDisputeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDispute}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Enregistrer Litige & Générer Opposition</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import New LCR Statement */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Importer un Nouveau Bordereau LCR
                  </h3>
                  <p className="text-xs text-slate-500">EDI télétransmis, Factur-X ou fichier bancaire</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Sélectionnez un flux pré-rempli pour tester l'ingestion automatique d'une traite LCR :
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSimulateNewLcrImport('cerp')}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span>CERP Rouen (Grossiste)</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">11 450,00 €</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Relevé Décadaire (2 factures, échéance 15/09/2026)</div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                onClick={() => handleSimulateNewLcrImport('bioderma')}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Laboratoires NAOS (Bioderma)</span>
                    <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">4 890,00 €</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Commande Dermo Directe avec RFA 310 € déduite (échéance 30/09/2026)</div>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-600" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
