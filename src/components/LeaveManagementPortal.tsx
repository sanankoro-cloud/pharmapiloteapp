import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Check, 
  X, 
  Filter, 
  Search, 
  Download, 
  User, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  Info, 
  HelpCircle,
  FileText,
  Briefcase
} from 'lucide-react';
import { Employee, LeaveRequest, LeaveType, LeaveStatus } from '../types/hr';
import { formatDate, exportToCsv } from '../utils/formatters';

interface LeaveManagementPortalProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onUpdateLeaveRequests: (newRequests: LeaveRequest[]) => void;
  onUpdateEmployees: (newEmployees: Employee[]) => void;
}

export const LeaveManagementPortal: React.FC<LeaveManagementPortalProps> = ({
  employees,
  leaveRequests,
  onUpdateLeaveRequests,
  onUpdateEmployees
}) => {
  // Navigation entre l'Espace Arbitrage Titulaire et l'Espace Soumission Salarié
  const [activeViewMode, setActiveViewMode] = useState<'titulaire_arbitrage' | 'salarie_demande'>('titulaire_arbitrage');
  
  // Filtres Espace Titulaire
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_attente' | 'valide' | 'refuse'>('en_attente');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Formulaire Espace Salarié (Soumettre une demande)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[1]?.id || employees[0]?.id || '');
  const [formLeaveType, setFormLeaveType] = useState<LeaveType>('conges_payes');
  const [formStartDate, setFormStartDate] = useState<string>('2026-09-14');
  const [formEndDate, setFormEndDate] = useState<string>('2026-09-19');
  const [formReason, setFormReason] = useState<string>('');
  const [formReplacementId, setFormReplacementId] = useState<string>('');
  const [submissionSuccessNotice, setSubmissionSuccessNotice] = useState<string | null>(null);

  // Modal d'arbitrage rapide / motif de décision
  const [selectedRequestForDecision, setSelectedRequestForDecision] = useState<{
    request: LeaveRequest;
    decisionType: 'valide' | 'refuse';
  } | null>(null);
  const [decisionComment, setDecisionComment] = useState<string>('');

  // Salarié sélectionné dans le formulaire
  const activeEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  // Calcul automatique des jours ouvrés/ouvrables entre deux dates
  const calculatedDaysCount = useMemo(() => {
    if (!formStartDate || !formEndDate) return 0;
    const start = new Date(formStartDate);
    const end = new Date(formEndDate);
    if (end < start) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay(); // 0 = Dimanche
      if (dayOfWeek !== 0) { // Ne compte pas les dimanches pour les CP officinaux
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [formStartDate, formEndDate]);

  // Diagnostic solde disponible pour le salarié
  const balanceWarning = useMemo(() => {
    if (!activeEmployee) return null;
    if (formLeaveType === 'conges_payes' && calculatedDaysCount > activeEmployee.paidLeavesBalance) {
      return `Attention : Solde de CP insuffisant (${activeEmployee.paidLeavesBalance} jours restants vs ${calculatedDaysCount} jours demandés).`;
    }
    if (formLeaveType === 'rtt' && calculatedDaysCount > activeEmployee.rttBalance) {
      return `Attention : Solde RTT insuffisant (${activeEmployee.rttBalance} jours restants vs ${calculatedDaysCount} jours demandés).`;
    }
    return null;
  }, [activeEmployee, formLeaveType, calculatedDaysCount]);

  // Détection de collision d'équipe (si un autre salarié de même rôle a posé sur la même période)
  const overlappingLeaves = useMemo(() => {
    if (!formStartDate || !formEndDate || !activeEmployee) return [];
    return leaveRequests.filter(lr => {
      if (lr.employeeId === activeEmployee.id || lr.status === 'refuse') return false;
      const otherEmp = employees.find(e => e.id === lr.employeeId);
      const isSameRoleCategory = otherEmp && (
        (activeEmployee.isPharmacistDoctor && otherEmp.isPharmacistDoctor) ||
        (activeEmployee.role === 'preparateur' && otherEmp.role === 'preparateur')
      );
      if (!isSameRoleCategory) return false;

      // Vérification chevauchement de dates
      return (formStartDate <= lr.endDate && formEndDate >= lr.startDate);
    });
  }, [formStartDate, formEndDate, activeEmployee, leaveRequests, employees]);

  // Filtre des demandes pour le tableau Titulaire
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(req => {
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesEmp = employeeFilter === 'all' || req.employeeId === employeeFilter;
      const matchesSearch = 
        req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.reason && req.reason.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesEmp && matchesSearch;
    });
  }, [leaveRequests, statusFilter, employeeFilter, searchQuery]);

  // Compteurs statistiques
  const stats = useMemo(() => {
    const pending = leaveRequests.filter(r => r.status === 'en_attente').length;
    const approved = leaveRequests.filter(r => r.status === 'valide').length;
    const rejected = leaveRequests.filter(r => r.status === 'refuse').length;
    return { pending, approved, rejected, total: leaveRequests.length };
  }, [leaveRequests]);

  // Gestion soumission d'une nouvelle demande par un salarié
  const handleSubmitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEmployee || calculatedDaysCount <= 0) return;

    const newRequest: LeaveRequest = {
      id: `lr-${Date.now()}`,
      employeeId: activeEmployee.id,
      employeeName: `${activeEmployee.firstName} ${activeEmployee.lastName}`,
      employeeRole: activeEmployee.roleLabel,
      leaveType: formLeaveType,
      startDate: formStartDate,
      endDate: formEndDate,
      daysCount: calculatedDaysCount,
      status: 'en_attente',
      requestedAt: '2026-08-28',
      reason: formReason || 'Demande de congés',
      replacementEmployeeId: formReplacementId || undefined
    };

    onUpdateLeaveRequests([newRequest, ...leaveRequests]);
    setSubmissionSuccessNotice(`Votre demande de ${calculatedDaysCount} jour(s) pour ${activeEmployee.firstName} a bien été soumise au Titulaire. Statut : En attente d'arbitrage.`);
    setFormReason('');
    
    setTimeout(() => {
      setSubmissionSuccessNotice(null);
    }, 6000);
  };

  // Traitement de l'arbitrage Titulaire (Validation / Refus)
  const handleConfirmDecision = () => {
    if (!selectedRequestForDecision) return;
    const { request, decisionType } = selectedRequestForDecision;

    // Mise à jour de la demande
    const updatedRequests = leaveRequests.map(r => {
      if (r.id === request.id) {
        return {
          ...r,
          status: decisionType as LeaveStatus,
          decisionDate: '2026-08-28',
          decisionComment: decisionComment || (decisionType === 'valide' ? 'Validé par le pharmacien titulaire' : 'Refusé pour contrainte de service')
        };
      }
      return r;
    });

    // Si validé : déduction automatique des soldes du salarié
    if (decisionType === 'valide') {
      const updatedEmployees = employees.map(emp => {
        if (emp.id === request.employeeId) {
          if (request.leaveType === 'conges_payes') {
            return {
              ...emp,
              paidLeavesBalance: Math.max(0, emp.paidLeavesBalance - request.daysCount)
            };
          } else if (request.leaveType === 'rtt') {
            return {
              ...emp,
              rttBalance: Math.max(0, emp.rttBalance - request.daysCount)
            };
          }
        }
        return emp;
      });
      onUpdateEmployees(updatedEmployees);
    }

    onUpdateLeaveRequests(updatedRequests);
    setSelectedRequestForDecision(null);
    setDecisionComment('');
  };

  // Export récapitulatif pour la paie / comptable
  const handleExportLeavesCsv = () => {
    const exportData = leaveRequests.map(r => ({
      'ID Demande': r.id,
      'Salarié': r.employeeName,
      'Poste': r.employeeRole,
      'Type Absence': r.leaveType,
      'Date Début': r.startDate,
      'Date Fin': r.endDate,
      'Nombre Jours': r.daysCount,
      'Statut': r.status,
      'Date Demande': r.requestedAt,
      'Motif': r.reason || '',
      'Décision Date': r.decisionDate || '',
      'Commentaire Titulaire': r.decisionComment || ''
    }));

    exportToCsv(exportData, 'Suivi_Conges_Officine_2026');
  };

  return (
    <div className="space-y-6">
      
      {/* Sélecteur de mode : Vue Titulaire vs Espace Collaborateur */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CalendarDays className="w-3 h-3 text-emerald-600" />
              Portail Congés & Absences
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Arbitrage des Congés Payés, RTT & Continuité Officinale
          </h2>
        </div>

        {/* Boutons de bascule de rôle */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveViewMode('titulaire_arbitrage')}
            className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'titulaire_arbitrage'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Espace Titulaire (Arbitrage)</span>
            {stats.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
                {stats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveViewMode('salarie_demande')}
            className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'salarie_demande'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Espace Salarié (Poser une demande)</span>
          </button>
        </div>

      </div>

      {/* VUE 1 : ESPACE SALARIÉ (SOUMETTRE UNE DEMANDE) */}
      {activeViewMode === 'salarie_demande' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 animate-fadeIn">
          
          {submissionSuccessNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs font-bold animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{submissionSuccessNotice}</span>
              </div>
              <button onClick={() => setActiveViewMode('titulaire_arbitrage')} className="underline cursor-pointer">
                Voir dans la liste →
              </button>
            </div>
          )}

          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Formulaire de Dépôt de Congés / RTT / Absence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sélectionnez votre profil pour vérifier vos compteurs de droits en temps réel avant d'envoyer votre demande au titulaire.
            </p>
          </div>

          {/* Sélecteur de collaborateur */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Collaborateur Demandeur :
            </label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {employees.map(emp => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedEmployeeId === emp.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black shrink-0 ${emp.avatarBg}`}>
                      {emp.avatarInitials}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {emp.firstName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {emp.paidLeavesBalance}j CP restants
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compteurs dynamiques du salarié sélectionné */}
          {activeEmployee && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Solde Congés Payés (CP)</span>
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                  {activeEmployee.paidLeavesBalance} jours
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Acquis total : {activeEmployee.paidLeavesAcquired}j/an</div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80">
                <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase">Solde RTT</span>
                <div className="text-xl font-black text-indigo-700 dark:text-indigo-300 font-mono mt-0.5">
                  {activeEmployee.rttBalance} jours
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Contrat {activeEmployee.weeklyHours}h</div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Solde CET / Récupération</span>
                <div className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono mt-0.5">
                  {activeEmployee.overtimeHoursBalance} heures
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Heures majorées disponibles</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Qualification CSP</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                  {activeEmployee.roleLabel}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{activeEmployee.contractType} • Coeff {activeEmployee.coefficient}</div>
              </div>
            </div>
          )}

          {/* Formulaire de saisie */}
          <form onSubmit={handleSubmitLeaveRequest} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Type d'absence */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Type d'Absence Souhaitée
                </label>
                <select
                  value={formLeaveType}
                  onChange={(e) => setFormLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="conges_payes">Congés Payés (CP)</option>
                  <option value="rtt">RTT (Réduction Temps Travail)</option>
                  <option value="formation_dpc">Formation DPC / OPCO</option>
                  <option value="evenement_familial">Événement Familial (Mariage, Naissance...)</option>
                  <option value="recuperation">Récupération d'Heures (CET)</option>
                  <option value="maladie">Arrêt Maladie (Justificatif)</option>
                </select>
              </div>

              {/* Date Début */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date de Début (Premier jour d'absence)
                </label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Date Fin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date de Fin (Dernier jour inclus)
                </label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

            </div>

            {/* Décompte automatique et Alertes */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>
                  Durée décomptée : <strong className="text-slate-900 dark:text-white font-mono">{calculatedDaysCount} jour(s) ouvré(s)</strong> (dimanches exclus).
                </span>
              </div>

              {balanceWarning && (
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{balanceWarning}</span>
                </div>
              )}
            </div>

            {/* Alerte collision équipe */}
            {overlappingLeaves.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Collision potentielle de planning détectée :</span>
                </div>
                <p>
                  Un ou plusieurs collègues de même qualification ({activeEmployee?.roleLabel}) ont déjà des congés posés sur ces dates :
                </p>
                <ul className="list-disc list-inside mt-1 font-semibold">
                  {overlappingLeaves.map(ol => (
                    <li key={ol.id}>
                      {ol.employeeName} ({ol.startDate} au {ol.endDate} - {ol.daysCount}j)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Motif & Remplacement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motif / Commentaire pour le Titulaire (Optionnel)
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Ex : Congés d'été, Vacances scolaires, Formation..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Collègue pressenti pour la passation / relais
                </label>
                <select
                  value={formReplacementId}
                  onChange={(e) => setFormReplacementId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Aucun ou Non déterminé</option>
                  {employees.filter(e => e.id !== selectedEmployeeId).map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.roleLabel})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bouton de validation */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Soumettre ma Demande de Congé</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* VUE 2 : ESPACE TITULAIRE (ARBITRAGE & VALIDATION) */}
      {activeViewMode === 'titulaire_arbitrage' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* 4 Compteurs statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div 
              onClick={() => setStatusFilter('en_attente')}
              className={`cursor-pointer p-4 rounded-2xl border transition flex items-center justify-between ${
                statusFilter === 'en_attente'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">En Attente d'Arbitrage</span>
                <div className="text-2xl font-black text-amber-600 mt-0.5 flex items-center gap-2">
                  <span>{stats.pending}</span>
                  {stats.pending > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse">Action requise</span>}
                </div>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-80" />
            </div>

            <div 
              onClick={() => setStatusFilter('valide')}
              className={`cursor-pointer p-4 rounded-2xl border transition flex items-center justify-between ${
                statusFilter === 'valide'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Demandes Validées</span>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">
                  {stats.approved}
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
            </div>

            <div 
              onClick={() => setStatusFilter('refuse')}
              className={`cursor-pointer p-4 rounded-2xl border transition flex items-center justify-between ${
                statusFilter === 'refuse'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Demandes Refusées</span>
                <div className="text-2xl font-black text-rose-600 mt-0.5">
                  {stats.rejected}
                </div>
              </div>
              <XCircle className="w-8 h-8 text-rose-500 opacity-80" />
            </div>

            <div 
              onClick={() => setStatusFilter('all')}
              className={`cursor-pointer p-4 rounded-2xl border transition flex items-center justify-between ${
                statusFilter === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-400/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Total Historique</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {stats.total}
                </div>
              </div>
              <CalendarDays className="w-8 h-8 text-indigo-500 opacity-80" />
            </div>

          </div>

          {/* Filtres & Recherche */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtre Salarié */}
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              >
                <option value="all">Tous les collaborateurs</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>

              {/* Barre de recherche */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, motif..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            {/* Actions Export */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportLeavesCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Paie (CSV)</span>
              </button>
            </div>

          </div>

          {/* Tableau des Demandes de Congés */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="p-3.5">Collaborateur</th>
                    <th className="p-3.5">Type & Motif</th>
                    <th className="p-3.5 text-center">Période Demandée</th>
                    <th className="p-3.5 text-center">Durée</th>
                    <th className="p-3.5 text-center">Statut</th>
                    <th className="p-3.5 text-right">Arbitrage Pharmacien Titulaire</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredRequests.map(req => {
                    const emp = employees.find(e => e.id === req.employeeId);

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        
                        {/* Salarié */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 ${emp?.avatarBg || 'bg-slate-600'}`}>
                              {emp?.avatarInitials || 'EMP'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{req.employeeName}</span>
                                {emp?.isPharmacistDoctor && (
                                  <span className="px-1 py-0.2 rounded text-[8px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    Dr
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {req.employeeRole} • Solde restant : <strong className="text-slate-600 dark:text-slate-300">{emp?.paidLeavesBalance || 0}j CP</strong>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Motif */}
                        <td className="p-3.5">
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {req.leaveType === 'conges_payes' ? 'Congés Payés (CP)' :
                               req.leaveType === 'rtt' ? 'RTT' :
                               req.leaveType === 'formation_dpc' ? 'Formation DPC' : req.leaveType}
                            </span>
                            <div className="text-slate-600 dark:text-slate-400 mt-1 max-w-xs truncate" title={req.reason}>
                              {req.reason || 'Demande sans motif spécifique'}
                            </div>
                          </div>
                        </td>

                        {/* Période */}
                        <td className="p-3.5 text-center font-mono">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {formatDate(req.startDate)} → {formatDate(req.endDate)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Demandé le {formatDate(req.requestedAt)}
                          </div>
                        </td>

                        {/* Durée */}
                        <td className="p-3.5 text-center">
                          <span className="font-bold font-mono text-sm px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            {req.daysCount} jour{req.daysCount > 1 ? 's' : ''}
                          </span>
                        </td>

                        {/* Statut Badge */}
                        <td className="p-3.5 text-center">
                          {req.status === 'en_attente' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3.5 h-3.5" /> En Attente
                            </span>
                          )}
                          {req.status === 'valide' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Validé
                            </span>
                          )}
                          {req.status === 'refuse' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                              <XCircle className="w-3.5 h-3.5" /> Refusé
                            </span>
                          )}
                        </td>

                        {/* Actions Titulaire */}
                        <td className="p-3.5 text-right">
                          {req.status === 'en_attente' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedRequestForDecision({ request: req, decisionType: 'valide' })}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Valider</span>
                              </button>
                              <button
                                onClick={() => setSelectedRequestForDecision({ request: req, decisionType: 'refuse' })}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 transition cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Refuser</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="text-[11px] text-slate-500 block">
                                Décision le {formatDate(req.decisionDate || '')}
                              </span>
                              {req.decisionComment && (
                                <span className="text-[10px] text-slate-400 italic block max-w-xs truncate ml-auto">
                                  « {req.decisionComment} »
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  // Possibilité de ré-ouvrir la décision
                                  const resetRequests = leaveRequests.map(r => r.id === req.id ? { ...r, status: 'en_attente' as const } : r);
                                  onUpdateLeaveRequests(resetRequests);
                                }}
                                className="text-[10px] text-indigo-600 hover:underline mt-0.5"
                              >
                                Modifier la décision
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Tableau Récapitulatif des Soldes de Congés de l'Équipe */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Registre Synthétique des Droits & Soldes de l'Équipe (2026)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-2">Collaborateur</th>
                    <th className="py-2 text-center">Type Contrat</th>
                    <th className="py-2 text-center">CP Acquis (An)</th>
                    <th className="py-2 text-center">CP Restants</th>
                    <th className="py-2 text-center">Solde RTT</th>
                    <th className="py-2 text-center">CET / Heures Sup</th>
                    <th className="py-2 text-center">Statut Actuel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.map(e => (
                    <tr key={e.id}>
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                        {e.firstName} {e.lastName}
                      </td>
                      <td className="py-2.5 text-center text-slate-500 font-mono">{e.contractType}</td>
                      <td className="py-2.5 text-center font-mono">{e.paidLeavesAcquired} j</td>
                      <td className="py-2.5 text-center font-mono font-bold text-emerald-600">{e.paidLeavesBalance} j</td>
                      <td className="py-2.5 text-center font-mono">{e.rttBalance} j</td>
                      <td className="py-2.5 text-center font-mono">{e.overtimeHoursBalance} h</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {e.activeStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL DE CONFIRMATION DE DÉCISION / MOTIF */}
      {selectedRequestForDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {selectedRequestForDecision.decisionType === 'valide' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <span>
                  {selectedRequestForDecision.decisionType === 'valide' ? 'Valider la demande de congés' : 'Refuser la demande de congés'}
                </span>
              </h3>
              <button onClick={() => setSelectedRequestForDecision(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div>Demandeur : <strong className="text-slate-900 dark:text-white">{selectedRequestForDecision.request.employeeName}</strong></div>
              <div>Période : <strong className="text-slate-900 dark:text-white">{formatDate(selectedRequestForDecision.request.startDate)} au {formatDate(selectedRequestForDecision.request.endDate)}</strong> ({selectedRequestForDecision.request.daysCount} jours)</div>
              <div>Motif : <span className="italic">{selectedRequestForDecision.request.reason || 'Non spécifié'}</span></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {selectedRequestForDecision.decisionType === 'valide' 
                  ? 'Commentaire pour le salarié (Optionnel)' 
                  : 'Motif explicatif du refus (Recommandé pour dialogue social)'}
              </label>
              <textarea
                rows={3}
                value={decisionComment}
                onChange={(e) => setDecisionComment(e.target.value)}
                placeholder={selectedRequestForDecision.decisionType === 'valide' ? 'Ex: Validé, bonnes vacances !' : 'Ex: Contrainte d\'effectif, 2 préparateurs déjà absents cette semaine...'}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedRequestForDecision(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDecision}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition cursor-pointer ${
                  selectedRequestForDecision.decisionType === 'valide'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {selectedRequestForDecision.decisionType === 'valide' ? 'Confirmer la Validation' : 'Confirmer le Refus'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
