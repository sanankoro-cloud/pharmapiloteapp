import React, { useState } from 'react';
import { 
  Percent, 
  Building2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Receipt, 
  Layers, 
  DollarSign,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { SupplierRfaContract, DiscountDiscrepancyItem, DiscountAuditStatus } from '../types/purchasingAndDiscounts';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface CommercialDiscountsControlViewProps {
  contracts: SupplierRfaContract[];
  onClaimDiscrepancy?: (discrepancyId: string, contractId: string) => void;
  onReceiveCreditNote?: (contractId: string, amount: number) => void;
}

export const CommercialDiscountsControlView: React.FC<CommercialDiscountsControlViewProps> = ({
  contracts,
  onClaimDiscrepancy,
  onReceiveCreditNote
}) => {
  const [contractList, setContractList] = useState<SupplierRfaContract[]>(contracts);
  const [expandedContractId, setExpandedContractId] = useState<string | null>('rfa-ocp-2026');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Claim Modal State
  const [claimModalData, setClaimModalData] = useState<{ contract: SupplierRfaContract; item?: DiscountDiscrepancyItem } | null>(null);
  const [claimLetterText, setClaimLetterText] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // KPIs
  const totalAccruedRfa = contractList.reduce((acc, c) => acc + c.accruedRfaAmountEuros, 0);
  const totalReceivedCreditNotes = contractList.reduce((acc, c) => acc + c.receivedCreditNotesEuros, 0);
  const totalPendingCreditNotes = contractList.reduce((acc, c) => acc + c.pendingCreditNotesEuros, 0);
  const totalDiscrepancyLosses = contractList.reduce((acc, c) => acc + c.totalDiscrepancyLossEuros, 0);
  const totalAnomaliesCount = contractList.reduce((acc, c) => acc + c.discrepanciesCount, 0);

  const filteredContracts = contractList.filter(c => {
    const matchesType = filterType === 'all' || c.supplierType === filterType;
    const matchesStatus = filterStatus === 'all' || c.auditStatus === filterStatus;
    return matchesType && matchesStatus;
  });

  const handleOpenClaimModal = (contract: SupplierRfaContract, item?: DiscountDiscrepancyItem) => {
    setClaimModalData({ contract, item });

    if (item) {
      setClaimLetterText(
`À l'attention du Service Comptabilité Fournisseurs / Litiges - ${contract.supplierName}
Contrat Cadre : ${contract.contractReference} (${contract.contractYear})

Objet : Réclamation d'avoir pour anomalie de sous-remise sur facture ${item.invoiceNumber}

Madame, Monsieur,

Lors de l'audit automatisé de conformité des remises commerciales de notre officine, une anomalie de facturation a été identifiée sur la pièce suivante :

• Facture n° : ${item.invoiceNumber} du ${formatDate(item.invoiceDate)}
• Ligne concernée : ${item.productOrCategory}
• Montant Brut HT : ${item.grossAmountHt.toFixed(2)} €
• Taux de remise contractuel convenu : ${item.contractualRatePct.toFixed(2)}% (soit ${item.expectedDiscountEuros.toFixed(2)} € de remise attendue)
• Taux de remise appliqué sur facture : ${item.appliedRatePct.toFixed(2)}% (soit ${item.appliedDiscountEuros.toFixed(2)} € déduits)
• Manque à gagner constaté : ${item.discrepancyLossEuros.toFixed(2)} € HT

Nous vous remercions de bien vouloir émettre un avoir d'un montant de ${item.discrepancyLossEuros.toFixed(2)} € HT ou de le déduire de notre prochain relevé LCR.

Restant à votre disposition pour toute pièce justificative, veuillez agréer nos salutations distinguées.

Le Pharmacien Titulaire - Grande Pharmacie de l'Hôtel de Ville`
      );
    } else {
      setClaimLetterText(
`À l'attention de la Direction Commerciale - ${contract.supplierName}
Contrat RFA Annuel : ${contract.contractReference} (${contract.contractYear})

Objet : Appel de versement de Remise de Fin d'Année (RFA) intermédiaire au 24/08/2026

Madame, Monsieur,

Au vu de l'activité réalisée depuis le 1er janvier 2026, nos achats cumulés s'élèvent à ${contract.actualYtdPurchasesHt.toFixed(2)} € HT pour un objectif annuel de ${contract.rfaAnnualTargetTurnoverHt.toFixed(2)} € HT (palier atteint à ${((contract.actualYtdPurchasesHt / contract.rfaAnnualTargetTurnoverHt) * 100).toFixed(1)}%).

Le montant de RFA acquis au prorata temporis ressort à ${contract.accruedRfaAmountEuros.toFixed(2)} € HT.
Ayant reçu à ce jour ${contract.receivedCreditNotesEuros.toFixed(2)} € d'avoirs, le solde restant à déduire s'élève à ${contract.pendingCreditNotesEuros.toFixed(2)} € HT.

Nous sollicitons l'émission de la note d'avoir correspondante sous quinzaine.

Cordialement,

Le Pharmacien Titulaire - Grande Pharmacie de l'Hôtel de Ville`
      );
    }
  };

  const handleConfirmClaim = () => {
    if (!claimModalData) return;

    if (claimModalData.item) {
      const itemId = claimModalData.item.id;
      setContractList(prev => prev.map(c => {
        if (c.id === claimModalData.contract.id) {
          return {
            ...c,
            discrepancies: c.discrepancies.map(d => d.id === itemId ? { ...d, status: 'a_reclamer' as const } : d)
          };
        }
        return c;
      }));
      if (onClaimDiscrepancy) {
        onClaimDiscrepancy(itemId, claimModalData.contract.id);
      }
    }

    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    showToast('Courrier de réclamation d\'avoir généré et journalisé avec succès !');
    setClaimModalData(null);
  };

  const handleExportAuditCsv = () => {
    const rows: Record<string, string | number>[] = [];
    contractList.forEach(c => {
      rows.push({
        'Fournisseur': c.supplierName,
        'Type': c.supplierType,
        'Groupement': c.groupementName || 'Direct',
        'Contrat': c.contractReference,
        'Remise Facture (%)': c.directInvoiceDiscountRatePct,
        'Escompte Règlement (%)': c.paymentCashDiscountRatePct,
        'Objectif CA RFA (€)': c.rfaAnnualTargetTurnoverHt,
        'Taux RFA (%)': c.rfaRatePct,
        'Achats YTD HT (€)': c.actualYtdPurchasesHt,
        'RFA Acquise (€)': c.accruedRfaAmountEuros,
        'Avoirs Reçus (€)': c.receivedCreditNotesEuros,
        'Avoirs Restants (€)': c.pendingCreditNotesEuros,
        'Anomalies Sous-Remise': c.discrepanciesCount,
        'Pertes Détectées (€)': c.totalDiscrepancyLossEuros,
        'Statut Audit': c.auditStatus
      });
    });
    exportToCsv(rows, 'audit_remises_commerciales_rfa_pharmacie');
    showToast('Export CSV de l\'audit des remises et RFA téléchargé.');
  };

  const getStatusBadge = (status: DiscountAuditStatus) => {
    switch (status) {
      case 'conforme':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>100% Conforme</span>
          </span>
        );
      case 'sous_remise_detectee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Sous-Remise Détectée</span>
          </span>
        );
      case 'avoir_en_attente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Avoir en Attente</span>
          </span>
        );
      case 'objectif_proche':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Palier RFA Proche</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in max-w-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-linear-to-br from-indigo-600 to-teal-600 text-white shadow-md shadow-indigo-500/20">
              <Percent className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Contrôle des Remises Commerciales, RFA & Escomptes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit exhaustif des conditions contractuelles négociées (remises directes, coopératives de groupement, RFA de fin d'année et détection des sous-remises non appliquées).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAuditCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total RFA Acquises (YTD)</span>
            <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(totalAccruedRfa)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gains cumulés sur volume 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avoirs RFA à Réclamer</span>
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(totalPendingCreditNotes)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Non encore déduits sur traites LCR</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sous-Remises Détectées</span>
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalDiscrepancyLosses)}
            </span>
            <span className="text-xs font-bold text-rose-600">({totalAnomaliesCount} factures)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Écarts de taux non appliqués</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avoirs RFA Encaissés</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalReceivedCreditNotes)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Déduits avec succès de la trésorerie</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Type de Fournisseur :</span>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'grossiste', label: 'Grossistes' },
            { id: 'laboratoire_direct', label: 'Laboratoires Directs' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === t.id
                  ? 'bg-slate-900 dark:bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Statut d'Audit :</span>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'sous_remise_detectee', label: 'Sous-Remises' },
            { id: 'avoir_en_attente', label: 'Avoirs en Attente' },
            { id: 'conforme', label: 'Conformes' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === s.id
                  ? 'bg-slate-900 dark:bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts & Audit List */}
      <div className="space-y-4">
        {filteredContracts.map((contract) => {
          const isExpanded = expandedContractId === contract.id;
          const targetProgressPct = Math.min(100, Math.round((contract.actualYtdPurchasesHt / contract.rfaAnnualTargetTurnoverHt) * 100));

          return (
            <div
              key={contract.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition"
            >
              {/* Main Card Header */}
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {contract.supplierName}
                    </span>
                    {getStatusBadge(contract.auditStatus)}
                    {contract.groupementName && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {contract.groupementName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span>Réf Contrat : <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{contract.contractReference}</span></span>
                    <span>•</span>
                    <span>Remise Facture : <strong className="text-emerald-600">{contract.directInvoiceDiscountRatePct.toFixed(1)}%</strong></span>
                    <span>•</span>
                    <span>Escompte : <strong className="text-indigo-600">{contract.paymentCashDiscountRatePct.toFixed(1)}%</strong></span>
                    <span>•</span>
                    <span>Taux RFA : <strong className="text-teal-600">{contract.rfaRatePct.toFixed(1)}%</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    Palier : {contract.rfaTierDescription}
                  </div>
                </div>

                {/* Progress bar & Amounts */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* Turnover Progress */}
                  <div className="w-48 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Achats YTD :</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(contract.actualYtdPurchasesHt)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${targetProgressPct >= 100 ? 'bg-emerald-500' : 'bg-linear-to-r from-teal-500 to-indigo-500'}`}
                        style={{ width: `${targetProgressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{targetProgressPct}% de l'objectif</span>
                      <span>Seuil : {formatCurrency(contract.rfaAnnualTargetTurnoverHt)}</span>
                    </div>
                  </div>

                  {/* RFA Figures */}
                  <div className="text-right space-y-0.5">
                    <div className="text-[11px] text-slate-400">RFA Totale Acquise</div>
                    <div className="text-base font-black text-teal-600 dark:text-teal-400">
                      {formatCurrency(contract.accruedRfaAmountEuros)}
                    </div>
                    {contract.pendingCreditNotesEuros > 0 && (
                      <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        {formatCurrency(contract.pendingCreditNotesEuros)} en attente
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {contract.pendingCreditNotesEuros > 0 && (
                      <button
                        onClick={() => handleOpenClaimModal(contract)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                        title="Générer un courrier d'appel d'avoir RFA"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Réclamer Avoir RFA</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                      title={isExpanded ? 'Réduire' : 'Voir détail des factures et anomalies'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Section: Discrepancy & Invoices Audit Table */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-indigo-600" />
                      <span>Anomalies de Sous-Remises Détectées sur Factures Récentes ({contract.discrepancies.length})</span>
                    </h4>
                    <span className="text-xs text-slate-400">Dernier audit le {formatDate(contract.lastAuditDate)}</span>
                  </div>

                  {contract.discrepancies.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                      <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Toutes les remises appliquées sur les factures sont conformes au barème contractuel.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Aucun manque à gagner détecté sur les dernières échéances.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                            <th className="py-2.5 px-3">Facture & Date</th>
                            <th className="py-2.5 px-3">Ligne Facturée</th>
                            <th className="py-2.5 px-3 text-right">Montant Brut HT</th>
                            <th className="py-2.5 px-3 text-center">Taux Convenu</th>
                            <th className="py-2.5 px-3 text-center">Taux Appliqué</th>
                            <th className="py-2.5 px-3 text-right">Remise Attendue</th>
                            <th className="py-2.5 px-3 text-right">Remise Réelle</th>
                            <th className="py-2.5 px-3 text-right font-bold text-rose-600">Perte / Avoir Dû</th>
                            <th className="py-2.5 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {contract.discrepancies.map((disc) => (
                            <tr key={disc.id} className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                                {disc.invoiceNumber}
                                <div className="text-[10px] text-slate-400 font-sans">{formatDate(disc.invoiceDate)}</div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                                {disc.productOrCategory}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                {disc.grossAmountHt.toFixed(2)} €
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                                {disc.contractualRatePct.toFixed(2)}%
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-rose-600">
                                {disc.appliedRatePct.toFixed(2)}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                                {disc.expectedDiscountEuros.toFixed(2)} €
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                                {disc.appliedDiscountEuros.toFixed(2)} €
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-black text-rose-600 dark:text-rose-400">
                                +{disc.discrepancyLossEuros.toFixed(2)} €
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  onClick={() => handleOpenClaimModal(contract, disc)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-2xs transition flex items-center gap-1 mx-auto cursor-pointer"
                                  title="Générer un courrier de réclamation pour cette facture"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Réclamer</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Modal */}
      {claimModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  <Mail className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {claimModalData.item ? 'Courrier de Réclamation d\'Avoir pour Sous-Remise' : 'Appel de Versement RFA Annuelle'}
                </h3>
              </div>
              <button 
                onClick={() => setClaimModalData(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                <span>Destinataire : {claimModalData.contract.supplierName}</span>
                <span className="text-rose-600 font-bold">
                  Montant Réclamé : {claimModalData.item ? `${claimModalData.item.discrepancyLossEuros.toFixed(2)} € HT` : `${claimModalData.contract.pendingCreditNotesEuros.toFixed(2)} € HT`}
                </span>
              </div>
              <textarea
                rows={12}
                value={claimLetterText}
                onChange={(e) => setClaimLetterText(e.target.value)}
                className="w-full p-3 font-mono text-[11px] rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setClaimModalData(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleConfirmClaim}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enregistrer & Transmettre au Fournisseur</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
