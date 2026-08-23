import React, { useState } from 'react';
import { 
  Network, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Upload, 
  Search, 
  FileText, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Layers,
  Settings,
  HelpCircle,
  Landmark,
  UserCheck
} from 'lucide-react';
import { 
  ResopharmaBordereau, 
  ResopharmaConnectorConfig, 
  ResopharmaSyncLog,
  ResopharmaFluxType,
  ResopharmaReconciliationStatus
} from '../types/resopharma';
import { BankTransaction } from '../types/pharmacy';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ResopharmaConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ResopharmaConnectorConfig;
  bordereaux: ResopharmaBordereau[];
  syncLogs: ResopharmaSyncLog[];
  bankTransactions: BankTransaction[];
  onSync: () => void;
  isSyncing: boolean;
  onReconcileBordereau: (bordereauId: string, matchedTransactionId?: string) => void;
  onImportBordereaux?: (imported: ResopharmaBordereau[]) => void;
}

export const ResopharmaConnectorModal: React.FC<ResopharmaConnectorModalProps> = ({
  isOpen,
  onClose,
  config,
  bordereaux,
  syncLogs,
  bankTransactions,
  onSync,
  isSyncing,
  onReconcileBordereau,
  onImportBordereaux
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bordereaux' | 'logs' | 'config'>('bordereaux');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBordereauId, setExpandedBordereauId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Filtered bordereaux
  const filteredBordereaux = bordereaux.filter(b => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesType = filterType === 'all' || b.fluxType === filterType;
    const matchesSearch = 
      b.bordereauNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.lotTeletransNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.organismeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.fseDetails.some(f => f.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || f.patientNir.includes(searchTerm));
    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate totals
  const totalTeletrans = bordereaux.reduce((acc, b) => acc + b.amountTeletrans, 0);
  const totalReconciled = bordereaux.filter(b => b.status === 'rapproche_total').reduce((acc, b) => acc + b.amountPaid, 0);
  const totalPending = bordereaux.filter(b => b.status === 'en_attente_virement').reduce((acc, b) => acc + b.amountTeletrans, 0);
  const totalRejections = bordereaux.reduce((acc, b) => acc + b.rejectionAmount, 0);
  const pendingCount = bordereaux.filter(b => b.status === 'en_attente_virement').length;
  const rejectionsCount = bordereaux.filter(b => b.status === 'ecart_detecte' || b.status === 'rejet_a_traiter').length;

  // Batch auto reconcile
  const handleAutoReconcileAll = () => {
    let matchedCount = 0;
    bordereaux.forEach(b => {
      if (b.status === 'en_attente_virement') {
        // Find a matching bank transaction (credit with similar amount within +- 1€)
        const matchingTx = bankTransactions.find(tx => 
          tx.type === 'credit' && 
          tx.status === 'a_rapprocher' &&
          (tx.category === 'cpam_ro' || tx.category === 'mutuelles_rc') &&
          Math.abs(tx.amount - b.amountTeletrans) < 0.05
        );
        if (matchingTx) {
          onReconcileBordereau(b.id, matchingTx.id);
          matchedCount++;
        }
      }
    });
    if (matchedCount > 0) {
      showNotification(`${matchedCount} bordereau(x) télétransmis lettré(s) automatiquement avec vos virements bancaires.`);
    } else {
      showNotification("Tous les bordereaux actuels sont déjà rapprochés ou en attente d'écriture bancaire.");
    }
  };

  const handleManualImport = () => {
    if (!importCsvText.trim()) return;
    try {
      const lines = importCsvText.trim().split(/\r?\n/).filter(l => l.trim() !== '');
      const dataRows = lines.slice(1);
      const newItems: ResopharmaBordereau[] = dataRows.map((row, idx) => {
        const cols = row.split(/[;,\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
        const bordNum = cols[0] || `BORD-IMP-${Date.now()}-${idx + 1}`;
        const org = cols[1] || 'Organisme Tiers-Payant';
        const type: ResopharmaFluxType = (cols[2] as ResopharmaFluxType) || 'RC_DRE';
        const amount = Number(cols[3]?.replace(',', '.')) || 250;
        const date = cols[4] || new Date().toISOString().split('T')[0];

        return {
          id: `bord-imp-${Date.now()}-${idx}`,
          bordereauNumber: bordNum,
          lotTeletransNumber: `LOT-IMP-${idx + 1}`,
          fluxType: type,
          organismeName: org,
          organismeCode: 'AMC-IMP',
          teletransDate: date,
          bankExpectedDate: date,
          amountTeletrans: amount,
          amountPaid: 0,
          rejectionAmount: 0,
          fseCount: 5,
          status: 'en_attente_virement',
          reconciliationNotes: 'Importé manuellement depuis fichier B2/CSV',
          fseDetails: [
            {
              id: `fse-imp-${idx}`,
              fseNumber: `FSE-${idx + 1}`,
              prescriptionDate: date,
              patientName: 'Patient Importé',
              patientNir: '1 80 00 00 000 000',
              partRo: type === 'RO_NOEMIE' ? amount : 0,
              partRc: type === 'RC_DRE' ? amount : 0,
              totalTtc: amount,
              status: 'en_attente'
            }
          ]
        };
      });

      if (onImportBordereaux) {
        onImportBordereaux(newItems);
      }
      setShowImportModal(false);
      setImportCsvText('');
      showNotification(`${newItems.length} bordereaux Resopharma importés avec succès.`);
    } catch (e: any) {
      alert("Erreur lors de l'import : " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* TOP HEADER */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Connecteur RESOPHARMA
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  Passerelle NOEMIE & DRE Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Bordereaux de télétransmission SESAM-Vitale & Rapprochement bancaire Tiers-Payant RO/RC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Récupération des flux...' : 'Synchroniser Flux Resopharma'}</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importer B2</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST SUCCESS */}
        {successToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* SUB-NAVIGATION TABS */}
        <div className="flex items-center justify-between px-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('bordereaux')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeSubTab === 'bordereaux' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bordereaux de Télétransmission ({bordereaux.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('logs')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeSubTab === 'logs' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Journal des Flux & NOEMIE ({syncLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('config')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
                activeSubTab === 'config' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configuration Passerelle & FINESS</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500">
            <span>FINESS : <strong className="font-mono text-slate-700">{config.finessOfficine}</strong></span>
            <span>•</span>
            <span>Dernière synchro : <strong className="text-slate-700">{config.lastSyncDate}</strong></span>
          </div>
        </div>

        {/* TAB 1: BORDEREAUX LIST & RECONCILIATION */}
        {activeSubTab === 'bordereaux' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
                <div className="text-[11px] font-bold text-indigo-800 uppercase tracking-wide">
                  Total Télétransmis
                </div>
                <div className="text-xl font-black text-indigo-950 font-mono mt-1">
                  {formatCurrency(totalTeletrans)}
                </div>
                <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
                  {bordereaux.length} bordereaux SESAM-Vitale
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                  Rapproché en Banque
                </div>
                <div className="text-xl font-black text-emerald-900 font-mono mt-1">
                  {formatCurrency(totalReconciled)}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Lettré avec virements CA
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                  En Attente Virement
                </div>
                <div className="text-xl font-black text-amber-900 font-mono mt-1">
                  {formatCurrency(totalPending)}
                </div>
                <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                  {pendingCount} lot(s) en cours de virement
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
                <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">
                  Rejets & Écarts TP
                </div>
                <div className="text-xl font-black text-rose-900 font-mono mt-1">
                  {formatCurrency(totalRejections)}
                </div>
                <div className="text-[11px] text-rose-600 font-bold mt-0.5">
                  {rejectionsCount} anomalie(s) à régulariser
                </div>
              </div>

            </div>

            {/* ACTION BANNER & SEARCH BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Lettrage Intelligent NOEMIE / Resopharma</h4>
                  <p className="text-[11px] text-slate-300">
                    Rapproche automatiquement les virements CPAM et mutuelles du compte bancaire avec les bordereaux
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoReconcileAll}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pointer Automatiquement ({pendingCount})</span>
                </button>
              </div>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Bordereau, CPAM, Mutuelle, Patient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 w-52 sm:w-64"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
                >
                  <option value="all">Tous statuts de lettrage</option>
                  <option value="en_attente_virement">En attente de virement</option>
                  <option value="rapproche_total">Rapprochés / Lettrés</option>
                  <option value="ecart_detecte">Écart détecté</option>
                  <option value="rejet_a_traiter">Rejet à traiter</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white font-medium text-slate-700"
                >
                  <option value="all">Tous types de flux</option>
                  <option value="RO_NOEMIE">Régime Obligatoire (NOEMIE)</option>
                  <option value="RC_DRE">Complémentaires (DRE Mutuelles)</option>
                  <option value="REJET_TIERS_PAYANT">Rejets & Indus TP</option>
                </select>
              </div>

              <div className="text-xs font-medium text-slate-500">
                {filteredBordereaux.length} bordereau(x) affiché(s)
              </div>
            </div>

            {/* BORDEREAUX TABLE */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3.5 font-bold">Réf. Bordereau & Organisme</th>
                    <th className="py-3 px-3 font-bold">Type Flux</th>
                    <th className="py-3 px-3 font-bold">Télétrans. / Virement</th>
                    <th className="py-3 px-3 font-bold text-center">FSE</th>
                    <th className="py-3 px-3 font-bold text-right">Montant Télétrans.</th>
                    <th className="py-3 px-3 font-bold text-center">Statut Rapprochement</th>
                    <th className="py-3 px-3.5 font-bold text-right">Action Lettrage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredBordereaux.map((bord) => {
                    const isExpanded = expandedBordereauId === bord.id;
                    const isReconciled = bord.status === 'rapproche_total';
                    const hasDiscrepancy = bord.status === 'ecart_detecte';
                    const isRejected = bord.status === 'rejet_a_traiter';
                    const isPending = bord.status === 'en_attente_virement';

                    return (
                      <React.Fragment key={bord.id}>
                        <tr className={`hover:bg-slate-50 transition cursor-pointer ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                            onClick={() => setExpandedBordereauId(isExpanded ? null : bord.id)}>
                          
                          <td className="py-3.5 px-3.5">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setExpandedBordereauId(isExpanded ? null : bord.id); }}
                                className="p-0.5 text-slate-400 hover:text-slate-700"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{bord.organismeName}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  {bord.bordereauNumber} • Lot {bord.lotTeletransNumber}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            {bord.fluxType === 'RO_NOEMIE' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                                RO NOEMIE
                              </span>
                            )}
                            {bord.fluxType === 'RC_DRE' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                                RC DRE Mutuelle
                              </span>
                            )}
                            {bord.fluxType === 'REJET_TIERS_PAYANT' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                                Rejet / Indus
                              </span>
                            )}
                            {bord.fluxType === 'ROSP_FORFAIT' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                                ROSP / Forfait
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="text-slate-800 font-medium">{formatDate(bord.teletransDate)}</div>
                            <div className="text-[11px] text-slate-500">
                              {bord.bankReceivedDate ? `Reçu le ${formatDate(bord.bankReceivedDate)}` : `Attendu le ${formatDate(bord.bankExpectedDate)}`}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                              {bord.fseCount}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(bord.amountTeletrans)}
                            {bord.rejectionAmount > 0 && (
                              <div className="text-[10px] text-rose-600 font-semibold">
                                Rejet: -{formatCurrency(bord.rejectionAmount)}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            {isReconciled && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Lettré
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" /> En attente CA
                              </span>
                            )}
                            {hasDiscrepancy && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">
                                <AlertTriangle className="w-3 h-3" /> Écart (-{formatCurrency(bord.rejectionAmount)})
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                <AlertCircle className="w-3 h-3" /> Rejet bloquant
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            {!isReconciled ? (
                              <button
                                onClick={() => onReconcileBordereau(bord.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition"
                              >
                                Lettrer
                              </button>
                            ) : (
                              <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                                <Check className="w-3.5 h-3.5" /> Lettré en banque
                              </div>
                            )}
                          </td>

                        </tr>

                        {/* ACCORDION ROW: FSE & PATIENT DETAILS */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 border-b border-slate-200">
                            <td colSpan={7} className="p-4 sm:p-5">
                              <div className="space-y-4">
                                
                                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                      <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                                      <span>Écriture Bancaire & Lettrage</span>
                                    </h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {bord.reconciliationNotes || "En attente du crédit sur le compte bancaire de l'officine."}
                                    </p>
                                  </div>
                                  {bord.bankTransferRef && (
                                    <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                                      {bord.bankTransferRef}
                                    </span>
                                  )}
                                </div>

                                {/* FSE TABLE */}
                                <div>
                                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                                    <span>Détail des Feuilles de Soins Électroniques (FSE) du lot :</span>
                                    <span className="text-[11px] text-slate-500 font-normal">
                                      {bord.fseDetails.length} ordonnance(s) télétransmise(s)
                                    </span>
                                  </div>

                                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[11px]">
                                          <th className="py-2 px-3 font-semibold">N° FSE</th>
                                          <th className="py-2 px-3 font-semibold">Assuré / Patient & NIR</th>
                                          <th className="py-2 px-3 font-semibold">Médecin Prescripteur</th>
                                          <th className="py-2 px-3 font-semibold text-right">Part RO</th>
                                          <th className="py-2 px-3 font-semibold text-right">Part RC</th>
                                          <th className="py-2 px-3 font-semibold text-right">Total TTC</th>
                                          <th className="py-2 px-3 font-semibold text-center">Statut FSE</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {bord.fseDetails.map((fse) => (
                                          <tr key={fse.id} className="hover:bg-slate-50/80">
                                            <td className="py-2 px-3 font-mono font-medium text-slate-700">
                                              {fse.fseNumber}
                                            </td>
                                            <td className="py-2 px-3">
                                              <div className="font-semibold text-slate-900">{fse.patientName}</div>
                                              <div className="text-[10px] text-slate-500 font-mono">{fse.patientNir}</div>
                                            </td>
                                            <td className="py-2 px-3 text-slate-600 text-[11px]">
                                              {fse.prescribingDoctor || 'Médecin traitant'}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono text-slate-700">
                                              {formatCurrency(fse.partRo)}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono text-slate-700">
                                              {formatCurrency(fse.partRc)}
                                            </td>
                                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                              {formatCurrency(fse.totalTtc)}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                              {fse.status === 'regle' && (
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                  Réglé
                                                </span>
                                              )}
                                              {fse.status === 'en_attente' && (
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                                  En attente
                                                </span>
                                              )}
                                              {fse.status === 'rejet' && (
                                                <div>
                                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800" title={fse.rejetMotif}>
                                                    Rejet TP ({fse.rejetCode})
                                                  </span>
                                                  {fse.rejetMotif && (
                                                    <div className="text-[10px] text-rose-700 mt-0.5 text-left font-medium">
                                                      {fse.rejetMotif}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}

                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: SYNC LOGS */}
        {activeSubTab === 'logs' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Journal des synchronisations NOEMIE & DRE</h4>
              <span className="text-xs text-slate-500">Passerelle Resopharma SESAM-Vitale</span>
            </div>

            <div className="space-y-3">
              {syncLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3 shadow-2xs">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{log.message}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                      <span>Bordereaux reçus : <strong className="font-mono text-slate-900">{log.borderauxFetched}</strong></span>
                      <span>Montant flux : <strong className="font-mono text-slate-900">{formatCurrency(log.totalAmountFetched)}</strong></span>
                      <span>Lettrages automatiques : <strong className="font-mono text-emerald-700">{log.matchedCount}</strong></span>
                      {log.rejectedCount > 0 && (
                        <span>Rejets détectés : <strong className="font-mono text-rose-700">{log.rejectedCount}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONFIGURATION */}
        {activeSubTab === 'config' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 max-w-3xl">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Paramètres de Télétransmission Officine</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° FINESS Officine</label>
                  <input
                    type="text"
                    disabled
                    value={config.finessOfficine}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° RPPS Pharmacien Titulaire</label>
                  <input
                    type="text"
                    disabled
                    value={config.rppsTitulaire}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code Concentrateur</label>
                  <input
                    type="text"
                    disabled
                    value={`${config.concentratorCode} - ${config.concentratorName}`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validité Certificat SESAM-Vitale / CPS</label>
                  <input
                    type="text"
                    disabled
                    value={`Valide jusqu'au ${config.certificateValidityDate}`}
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoReconcileBank}
                    readOnly
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Rapprochement bancaire automatique avec les virements NOEMIE & DRE</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoCreateRejectionAlerts}
                    readOnly
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Créer une alerte de gestion immédiate en cas de rejet Tiers-Payant {'>'} 10 €</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Passerelle Sécurisée SESAM-Vitale v1.40 / Norme B2 NOEMIE</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Fermer
          </button>
        </div>

      </div>

      {/* IMPORT B2 MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <span>Importer un bordereau Resopharma (B2 / CSV)</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Collez le contenu ou téléchargez le fichier de télétransmission / retour de paiement :
            </p>

            <textarea
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              rows={6}
              placeholder="RefBordereau;Organisme;TypeFlux;Montant;DateTeletrans&#10;BORD-NOEMIE-75-99;CPAM Paris 75;RO_NOEMIE;4150.20;2026-08-22&#10;BORD-DRE-VIAMEDIS;VIAMEDIS;RC_DRE;820.40;2026-08-22"
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleManualImport}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
              >
                Importer Bordereaux
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
