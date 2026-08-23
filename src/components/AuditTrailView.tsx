import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  History, 
  Package, 
  Landmark, 
  Receipt, 
  Network, 
  Search, 
  Filter, 
  Download, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileSpreadsheet, 
  Eye, 
  Check, 
  X, 
  ChevronDown,
  Sparkles,
  Info,
  Laptop,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { AuditLogEntry, OperatorProfile, AuditDomain, AuditSeverity } from '../types/auditLog';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';

interface AuditTrailViewProps {
  logs: AuditLogEntry[];
  currentOperator: OperatorProfile;
  availableOperators: OperatorProfile[];
  onChangeCurrentOperator: (operator: OperatorProfile) => void;
  onValidateLogEntry: (logId: string, note?: string) => void;
  onAddManualAuditEntry?: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  logs,
  currentOperator,
  availableOperators,
  onChangeCurrentOperator,
  onValidateLogEntry,
  onAddManualAuditEntry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedAuditStatus, setSelectedAuditStatus] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'all'>('all');

  // Detail / Audit Note Modal
  const [selectedLogForAudit, setSelectedLogForAudit] = useState<AuditLogEntry | null>(null);
  const [auditNoteInput, setAuditNoteInput] = useState('');
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false);

  // Manual observation form state
  const [manualDomain, setManualDomain] = useState<AuditDomain>('stocks');
  const [manualTarget, setManualTarget] = useState('');
  const [manualDetails, setManualDetails] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualSeverity, setManualSeverity] = useState<AuditSeverity>('info');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search term
      const matchesSearch = 
        log.targetEntity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.workstation && log.workstation.toLowerCase().includes(searchTerm.toLowerCase()));

      // Domain
      const matchesDomain = selectedDomain === 'all' || log.domain === selectedDomain;

      // Operator
      const matchesOperator = selectedOperator === 'all' || log.operatorName.toLowerCase().includes(selectedOperator.toLowerCase());

      // Severity
      const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

      // Audit status
      const matchesAudit = 
        selectedAuditStatus === 'all' ? true :
        selectedAuditStatus === 'audited' ? !!log.isAudited :
        !log.isAudited;

      // Time range
      let matchesTime = true;
      if (timeRange !== 'all') {
        const logDate = new Date(log.timestamp.replace(' ', 'T'));
        const now = new Date();
        const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 3600);
        if (timeRange === 'today') {
          matchesTime = diffHours <= 24;
        } else if (timeRange === '7days') {
          matchesTime = diffHours <= 24 * 7;
        } else if (timeRange === '30days') {
          matchesTime = diffHours <= 24 * 30;
        }
      }

      return matchesSearch && matchesDomain && matchesOperator && matchesSeverity && matchesAudit && matchesTime;
    });
  }, [logs, searchTerm, selectedDomain, selectedOperator, selectedSeverity, selectedAuditStatus, timeRange]);

  // Statistics
  const totalLogsCount = logs.length;
  const stockLogsCount = logs.filter(l => l.domain === 'stocks').length;
  const bankLogsCount = logs.filter(l => l.domain === 'banque_reconciliation').length;
  const criticalLogsCount = logs.filter(l => l.severity === 'critique').length;
  const auditedCount = logs.filter(l => l.isAudited).length;
  const auditComplianceRate = totalLogsCount > 0 ? Math.round((auditedCount / totalLogsCount) * 100) : 100;

  // Export to CSV
  const handleExportCsv = () => {
    const exportData = filteredLogs.map(l => ({
      'Date & Heure': l.timestamp,
      'Opérateur': l.operatorName,
      'Rôle': l.operatorRole,
      'Poste de travail': l.workstation || 'N/A',
      'Domaine': l.domain,
      'Type d\'action': l.actionType,
      'Entité cible / Réf': l.targetEntity,
      'Détails de la modification': l.details,
      'Ancienne Valeur': l.previousValue ?? 'N/A',
      'Nouvelle Valeur': l.newValue ?? 'N/A',
      'Impact Financier (€)': l.financialImpact ?? 0,
      'Motif / Justification': l.reason || 'N/A',
      'Gravité': l.severity,
      'Contrôlé & Validé': l.isAudited ? 'Oui' : 'En attente',
      'Note de Contrôle Interne': l.auditNote || ''
    }));
    exportToCsv(exportData, `journal_actions_audit_controle_${new Date().toISOString().split('T')[0]}`);
  };

  const handleOpenAuditModal = (log: AuditLogEntry) => {
    setSelectedLogForAudit(log);
    setAuditNoteInput(log.auditNote || '');
  };

  const handleSaveAuditNote = () => {
    if (selectedLogForAudit) {
      onValidateLogEntry(selectedLogForAudit.id, auditNoteInput);
      setSelectedLogForAudit(null);
    }
  };

  const handleCreateManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTarget || !manualDetails) return;

    if (onAddManualAuditEntry) {
      onAddManualAuditEntry({
        operatorName: currentOperator.name,
        operatorRole: currentOperator.role,
        domain: manualDomain,
        actionType: 'ajustement_quantite',
        targetEntity: manualTarget,
        details: manualDetails,
        reason: manualReason || 'Observation manuelle de contrôle interne',
        severity: manualSeverity,
        workstation: currentOperator.workstation,
        isAudited: true,
        auditNote: 'Enregistré directement par le pharmacien'
      });
    }

    setManualTarget('');
    setManualDetails('');
    setManualReason('');
    setIsManualEntryModalOpen(false);
  };

  // Helper icons and styles
  const getDomainInfo = (domain: AuditDomain) => {
    switch (domain) {
      case 'stocks':
        return { label: 'Stocks & Péremptions', icon: Package, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'banque_reconciliation':
        return { label: 'Banque & Rapprochement', icon: Landmark, color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'lcr_traites':
        return { label: 'Contrôle LCR & Traites', icon: Receipt, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'resopharma':
        return { label: 'Resopharma & NOEMIE', icon: Network, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'commandes_achats':
        return { label: 'Commandes Fournisseurs', icon: Package, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'depenses':
        return { label: 'Dépenses & Frais', icon: Receipt, color: 'bg-slate-50 text-slate-700 border-slate-200' };
      case 'factures_electroniques':
        return { label: 'Factures Électroniques', icon: FileSpreadsheet, color: 'bg-sky-50 text-sky-700 border-sky-200' };
      default:
        return { label: 'Système', icon: ShieldCheck, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'critique':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            Critique
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Info className="w-3 h-3 text-slate-500" />
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span>Journal d'Audit & Contrôle Interne</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Conforme NEP / CAC
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Piste d'audit fiable (PAF) : traçabilité inaltérable de tous les mouvements de stocks, lettrages bancaires et validations.
              </p>
            </div>
          </div>
        </div>

        {/* Current Operator Badge & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Operator Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-500 text-[11px] hidden sm:inline">Opérateur actif :</span>
            <select
              value={currentOperator.id}
              onChange={(e) => {
                const found = availableOperators.find(op => op.id === e.target.value);
                if (found) onChangeCurrentOperator(found);
              }}
              className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              {availableOperators.map(op => (
                <option key={op.id} value={op.id}>
                  {op.name} ({op.role === 'titulaire' ? 'Titulaire' : op.role === 'adjoint' ? 'Adjoint' : op.role === 'preparateur' ? 'Préparateur' : 'Comptable'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsManualEntryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Consigner une Observation</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exporter le Journal (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total actions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Actions Tracées</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalLogsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Horodatage précis à la seconde</span>
          </div>
        </div>

        {/* Stock alterations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Mouvements de Stock</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stockLogsCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Ajustements, déstockages & réceptions
          </div>
        </div>

        {/* Bank reconciliations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Lettrages Bancaires</span>
            <Landmark className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{bankLogsCount}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">
            Rapprochements Crédit Agricole & Resopharma
          </div>
        </div>

        {/* Audit Compliance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Contrôle Titulaire</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-950">{auditComplianceRate}%</div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1">
            {auditedCount} / {totalLogsCount} actions validées
          </div>
        </div>
      </div>

      {/* Internal Control Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">
                Piste d'Audit Fiable (PAF) & Contrôle Interne de l'Officine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                LGO & Relevés Synchronisés
              </span>
              {criticalLogsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
                  {criticalLogsCount} action(s) sensible(s)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Toutes les modifications manuelles de stocks (cassés, périmés, retours labo), lettrages bancaires et validations de traites LCR sont consignées avec l'identité de l'opérateur, son poste de travail et le motif. Ce journal est directement communicable à votre expert-comptable ou commissaire aux comptes.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par produit, CIP, référence bancaire, opérateur, motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
            />
          </div>

          {/* Time range buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-semibold text-slate-600">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-lg transition ${timeRange === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
            >
              Tout
            </button>
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-lg transition ${timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 rounded-lg transition ${timeRange === '7days' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
            >
              7 jours
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1 rounded-lg transition ${timeRange === '30days' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'}`}
            >
              30 jours
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Domain */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Domaine</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white"
            >
              <option value="all">Tous les domaines</option>
              <option value="stocks">📦 Stocks & Péremptions</option>
              <option value="banque_reconciliation">🏦 Banque & Rapprochement</option>
              <option value="lcr_traites">📑 Traites LCR & BAP</option>
              <option value="resopharma">🌐 Resopharma & NOEMIE</option>
              <option value="commandes_achats">🚚 Commandes Achats</option>
              <option value="factures_electroniques">🧾 Factures Électroniques</option>
            </select>
          </div>

          {/* Operator */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Opérateur</label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white"
            >
              <option value="all">Tous les opérateurs</option>
              {availableOperators.map(op => (
                <option key={op.id} value={op.name}>{op.name}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Niveau d'Alerte</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white"
            >
              <option value="all">Toutes les gravités</option>
              <option value="info">🟢 Information standard</option>
              <option value="warning">🟡 Avertissement / Écart</option>
              <option value="critique">🔴 Critique / Litige</option>
            </select>
          </div>

          {/* Audit Verification Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contrôle Titulaire</label>
            <select
              value={selectedAuditStatus}
              onChange={(e) => setSelectedAuditStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="audited">✅ Validé au contrôle</option>
              <option value="pending">⏳ En attente de validation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Historique Chronologique des Actions ({filteredLogs.length} entrées affichées)
            </span>
          </div>
          {filteredLogs.length > 0 && (
            <span className="text-[11px] text-slate-500">
              Dernière action : <strong>{filteredLogs[0].timestamp}</strong>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-3">Opérateur & Poste</th>
                <th className="py-3 px-3">Domaine</th>
                <th className="py-3 px-4">Entité & Réf</th>
                <th className="py-3 px-4">Détails de la Modification</th>
                <th className="py-3 px-3">Motif & Justification</th>
                <th className="py-3 px-3 text-right">Impact</th>
                <th className="py-3 px-3 text-center">Niveau</th>
                <th className="py-3 px-4 text-center">Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                const domainInfo = getDomainInfo(log.domain);
                const DomainIcon = domainInfo.icon;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {log.timestamp.split(' ')[1]}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatDate(log.timestamp.split(' ')[0])}
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{log.operatorName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Laptop className="w-3 h-3 text-slate-400" />
                        <span>{log.workstation || 'Poste LGO'}</span>
                      </div>
                    </td>

                    {/* Domain */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${domainInfo.color}`}>
                        <DomainIcon className="w-3.5 h-3.5" />
                        <span>{domainInfo.label}</span>
                      </span>
                    </td>

                    {/* Target Entity */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate" title={log.targetEntity}>
                        {log.targetEntity}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ID: {log.id}
                      </div>
                    </td>

                    {/* Details and changes */}
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-xs text-slate-800 leading-relaxed">
                        {log.details}
                      </p>
                      {(log.previousValue !== undefined || log.newValue !== undefined) && (
                        <div className="flex items-center gap-2 text-[11px] mt-1 p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 font-mono">
                          {log.previousValue !== undefined && (
                            <span className="text-slate-500 line-through">
                              {String(log.previousValue)}
                            </span>
                          )}
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          {log.newValue !== undefined && (
                            <span className="text-emerald-700 font-bold">
                              {String(log.newValue)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        {log.reason || 'Conforme au protocole standard'}
                      </div>
                    </td>

                    {/* Financial Impact */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono">
                      {log.financialImpact !== undefined && log.financialImpact !== 0 ? (
                        <span className={`font-bold ${log.financialImpact > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                          {formatCurrency(log.financialImpact)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Severity */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>

                    {/* Audit validation */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {log.isAudited ? (
                        <button
                          onClick={() => handleOpenAuditModal(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                          title={log.auditNote ? `Note de contrôle: ${log.auditNote}` : 'Action validée au contrôle interne'}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Validé</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenAuditModal(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Vérifier</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Aucune action trouvée pour ces critères de recherche
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Modifiez vos filtres ou effectuez de nouveaux ajustements de stocks ou rapprochements bancaires pour voir les traces d'audit en temps réel.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Validate Audit Entry & Add Note */}
      {selectedLogForAudit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Validation du Point de Contrôle Interne
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogForAudit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-medium text-slate-500">
                <span>Horodatage : <strong>{selectedLogForAudit.timestamp}</strong></span>
                <span>Opérateur : <strong>{selectedLogForAudit.operatorName}</strong></span>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {selectedLogForAudit.targetEntity}
              </div>
              <p className="text-slate-700">
                {selectedLogForAudit.details}
              </p>
              {selectedLogForAudit.reason && (
                <div className="text-[11px] text-slate-500 italic">
                  Motif consigné : {selectedLogForAudit.reason}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Note de Contrôle Interne / Visa du Pharmacien Titulaire
              </label>
              <textarea
                value={auditNoteInput}
                onChange={(e) => setAuditNoteInput(e.target.value)}
                placeholder="Ex: Écart d'inventaire vérifié et approuvé. Justificatif archivé au dossier comptable..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLogForAudit(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveAuditNote}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Apposer le Visa de Contrôle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Observation Entry */}
      {isManualEntryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Consigner une Observation de Contrôle Interne
                </h3>
              </div>
              <button
                onClick={() => setIsManualEntryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domaine</label>
                  <select
                    value={manualDomain}
                    onChange={(e) => setManualDomain(e.target.value as AuditDomain)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="stocks">📦 Stocks & Péremptions</option>
                    <option value="banque_reconciliation">🏦 Rapprochement Bancaire</option>
                    <option value="lcr_traites">📑 Traites LCR & Grossistes</option>
                    <option value="resopharma">🌐 Resopharma & Tiers-Payant</option>
                    <option value="depenses">🧾 Dépenses & Frais Généraux</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Niveau d'Alerte</label>
                  <select
                    value={manualSeverity}
                    onChange={(e) => setManualSeverity(e.target.value as AuditSeverity)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="info">🟢 Information standard</option>
                    <option value="warning">🟡 Avertissement / Écart</option>
                    <option value="critique">🔴 Critique / Litige</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Entité / Produit / Réf Bancaire</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inventaire tiroir stupéfiants / Virement CPAM en attente"
                  value={manualTarget}
                  onChange={(e) => setManualTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description de l'observation</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ex: Contrôle physique effectué, concordance parfaite constatée entre le stock réel et le LGO."
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motif / Réf Réglementaire</label>
                <input
                  type="text"
                  placeholder="Ex: Audit mensuel de routine / Exigence CAC"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
                >
                  Consigner au Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
