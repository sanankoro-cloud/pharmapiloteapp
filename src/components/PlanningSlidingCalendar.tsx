import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ShieldCheck, 
  ShieldAlert,
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Trash2, 
  Edit3, 
  Printer, 
  Check, 
  Sparkles, 
  Users, 
  Info, 
  CheckCircle2, 
  CalendarDays,
  HelpCircle,
  MoveHorizontal,
  Zap,
  Scale,
  Filter
} from 'lucide-react';
import { Employee, WorkShift, ShiftType } from '../types/hr';
import { formatNumber, formatDate } from '../utils/formatters';
import { auditScheduleCompliance, ComplianceAlert } from '../utils/legalComplianceAudit';
import { PlanningComplianceBanner } from './PlanningComplianceBanner';
import { ShiftEditModal } from './ShiftEditModal';

interface PlanningSlidingCalendarProps {
  employees: Employee[];
  shifts: WorkShift[];
  onUpdateShifts: (newShifts: WorkShift[]) => void;
  onOpenAddShiftModal: (prefillDate?: string, prefillEmpId?: string) => void;
  onEmployeeClick?: (emp: Employee) => void;
}

export const PlanningSlidingCalendar: React.FC<PlanningSlidingCalendarProps> = ({
  employees,
  shifts,
  onUpdateShifts,
  onOpenAddShiftModal,
  onEmployeeClick
}) => {
  // Navigation semaine glissante (offset en semaines par rapport à la semaine de référence)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [activeDayDetail, setActiveDayDetail] = useState<string>('2026-08-27');
  const [draggedShiftId, setDraggedShiftId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ empId: string; date: string } | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'timeline'>('matrix');
  const [isFilteringAnomaliesOnly, setIsFilteringAnomaliesOnly] = useState<boolean>(false);
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null);
  const [highlightedShiftId, setHighlightedShiftId] = useState<string | null>(null);

  // Calcul des 7 jours de la semaine courante glissante (sur base du 24 Août 2026)
  const currentWeekDays = useMemo(() => {
    const baseDate = new Date(2026, 7, 24); // 24 Août 2026 (Lundi)
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);

    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche (Garde)'];
    const shortNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const isToday = dateStr === '2026-08-27';
      const isGuard = i === 6; // Dimanche

      return {
        date: dateStr,
        dayName: dayNames[i],
        shortName: `${shortNames[i]} ${day}/${month}`,
        isToday,
        isGuard,
        dayNumber: d.getDate()
      };
    });
  }, [weekOffset]);

  const currentWeekDates = useMemo(() => currentWeekDays.map(d => d.date), [currentWeekDays]);

  // Numéro et libellé de la semaine
  const weekLabel = useMemo(() => {
    const startDay = currentWeekDays[0];
    const endDay = currentWeekDays[6];
    const weekNum = 35 + weekOffset;
    return `Semaine ${weekNum} • Du ${startDay.dayName} ${startDay.date.split('-')[2]} au ${endDay.dayName} ${endDay.date.split('-')[2]} Août/Sept. 2026`;
  }, [currentWeekDays, weekOffset]);

  // MOTEUR D'AUDIT DE CONFORMITÉ LÉGALE DU PLANNING (Code du travail & Convention collective IDCC 1996)
  const complianceAudit = useMemo(() => {
    return auditScheduleCompliance(shifts, employees, currentWeekDates);
  }, [shifts, employees, currentWeekDates]);

  // Filtrage des salariés (par rôle et optionnellement par anomalie)
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Filtre anomalie active
      if (isFilteringAnomaliesOnly) {
        const empAlerts = complianceAudit.employeeAlertMap[emp.id];
        if (!empAlerts || empAlerts.length === 0) return false;
      }

      if (selectedRoleFilter === 'docteurs') return emp.isPharmacistDoctor;
      if (selectedRoleFilter === 'preparateurs') return emp.role === 'preparateur';
      if (selectedRoleFilter === 'apprentis') return emp.role === 'apprenti' || emp.role === 'etudiant_6e_annee';
      return true;
    });
  }, [employees, selectedRoleFilter, isFilteringAnomaliesOnly, complianceAudit.employeeAlertMap]);

  // Diagnostic CSP Pharmacien par jour (Obligation continue 08h30 - 19h30)
  const cspStatusByDay = useMemo(() => {
    const map: Record<string, { hasDoctor: boolean; doctors: string[]; totalDoctorHours: number }> = {};
    
    currentWeekDays.forEach(d => {
      const dayShifts = shifts.filter(s => s.date === d.date);
      const doctorShifts = dayShifts.filter(s => s.isDoctorOnDuty);
      const hasDoctor = doctorShifts.length > 0;
      const doctors = doctorShifts.map(s => {
        const emp = employees.find(e => e.id === s.employeeId);
        return emp ? `Dr. ${emp.firstName} ${emp.lastName}` : '';
      }).filter(Boolean);
      const totalDoctorHours = doctorShifts.reduce((acc, s) => acc + s.totalHours, 0);

      map[d.date] = { hasDoctor, doctors, totalDoctorHours };
    });

    return map;
  }, [shifts, currentWeekDays, employees]);

  // Afficher une notification temporaire
  const triggerNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 4000);
  };

  // Déplacement glissé-déposé d'un shift vers un autre jour ou salarié
  const handleDropShift = (targetDate: string, targetEmpId: string) => {
    if (!draggedShiftId) return;

    const shiftToMove = shifts.find(s => s.id === draggedShiftId);
    if (!shiftToMove) return;

    const sourceEmp = employees.find(e => e.id === shiftToMove.employeeId);
    const targetEmp = employees.find(e => e.id === targetEmpId);

    const updatedShifts = shifts.map(s => {
      if (s.id === draggedShiftId) {
        return {
          ...s,
          date: targetDate,
          employeeId: targetEmpId,
          isDoctorOnDuty: targetEmp ? targetEmp.isPharmacistDoctor : s.isDoctorOnDuty
        };
      }
      return s;
    });

    onUpdateShifts(updatedShifts);
    setDraggedShiftId(null);
    setDragOverTarget(null);

    const targetDayObj = currentWeekDays.find(d => d.date === targetDate);
    const targetDayName = targetDayObj ? targetDayObj.dayName : targetDate;

    if (sourceEmp && targetEmp && sourceEmp.id !== targetEmp.id) {
      triggerNotice(`Shift réaffecté à ${targetEmp.firstName} ${targetEmp.lastName} pour le ${targetDayName} (${shiftToMove.startTime}-${shiftToMove.endTime}).`);
    } else {
      triggerNotice(`Shift de ${sourceEmp?.firstName} déplacé au ${targetDayName} (${shiftToMove.startTime}-${shiftToMove.endTime}).`);
    }
  };

  // Déplacement rapide par bouton (Précédent / Suivant)
  const handleQuickMoveDay = (shiftId: string, direction: 'prev' | 'next') => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const currentIndex = currentWeekDays.findIndex(d => d.date === shift.date);
    if (currentIndex === -1) return;

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= currentWeekDays.length) {
      triggerNotice(`Le créneau ne peut pas être déplacé en dehors de la semaine affichée.`);
      return;
    }

    const targetDate = currentWeekDays[newIndex].date;
    const emp = employees.find(e => e.id === shift.employeeId);

    const updatedShifts = shifts.map(s => {
      if (s.id === shiftId) {
        return { ...s, date: targetDate };
      }
      return s;
    });

    onUpdateShifts(updatedShifts);
    triggerNotice(`Shift de ${emp?.firstName} déplacé au ${currentWeekDays[newIndex].dayName}.`);
  };

  // Duplication d'un shift
  const handleDuplicateShift = (shiftId: string, targetDate?: string) => {
    const original = shifts.find(s => s.id === shiftId);
    if (!original) return;

    const nextDate = targetDate || original.date;
    const newShift: WorkShift = {
      ...original,
      id: `sh-dup-${Date.now()}`,
      date: nextDate,
      notes: `${original.notes || ''} (Dupliqué)`
    };

    onUpdateShifts([...shifts, newShift]);
    triggerNotice(`Créneau dupliqué avec succès.`);
  };

  // Suppression d'un shift
  const handleDeleteShift = (shiftId: string) => {
    onUpdateShifts(shifts.filter(s => s.id !== shiftId));
    triggerNotice(`Créneau supprimé du planning.`);
  };

  // Sauvegarde après modification dans le modal d'ajustement
  const handleSaveEditedShift = (updatedShift: WorkShift) => {
    const updated = shifts.map(s => s.id === updatedShift.id ? updatedShift : s);
    onUpdateShifts(updated);
    triggerNotice(`Créneau mis à jour avec vérification légale.`);
  };

  // Dupliquer toute la semaine courante sur la semaine suivante
  const handleDuplicateEntireWeek = () => {
    const nextWeekOffset = weekOffset + 1;
    const newShiftsToAdd: WorkShift[] = [];

    currentWeekDays.forEach((day, index) => {
      const targetDate = new Date(2026, 7, 24);
      targetDate.setDate(targetDate.getDate() + (nextWeekOffset * 7) + index);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const dayShifts = shifts.filter(s => s.date === day.date);
      dayShifts.forEach(s => {
        newShiftsToAdd.push({
          ...s,
          id: `sh-wk-${nextWeekOffset}-${s.employeeId}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          date: targetDateStr
        });
      });
    });

    onUpdateShifts([...shifts, ...newShiftsToAdd]);
    setWeekOffset(nextWeekOffset);
    triggerNotice(`Planning complet de la semaine ${35 + weekOffset} dupliqué sur la semaine ${35 + nextWeekOffset} !`);
  };

  // Sélection d'une alerte depuis la bannière pour surligner le shift
  const handleSelectAlert = (alert: ComplianceAlert) => {
    if (alert.shiftId) {
      setHighlightedShiftId(alert.shiftId);
      const targetShift = shifts.find(s => s.id === alert.shiftId);
      if (targetShift) {
        setEditingShift(targetShift);
      }
      setTimeout(() => setHighlightedShiftId(null), 3000);
    } else if (alert.date) {
      setActiveDayDetail(alert.date);
      setViewMode('timeline');
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Toast Notice de feedback */}
      {feedbackNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-between animate-fadeIn border border-emerald-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{feedbackNotice}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-white/80 hover:text-white font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* BANNIÈRE D'AUDIT ET ALERTES DE CONFORMITÉ LÉGALE (Code du travail & Convention collective) */}
      <PlanningComplianceBanner
        alerts={complianceAudit.alerts}
        complianceScore={complianceAudit.complianceScore}
        criticalCount={complianceAudit.criticalCount}
        warningCount={complianceAudit.warningCount}
        onSelectAlert={handleSelectAlert}
        onFilterAnomaliesOnly={(val) => setIsFilteringAnomaliesOnly(val)}
        isFilteringAnomaliesOnly={isFilteringAnomaliesOnly}
      />

      {/* Barre de contrôle du calendrier & Navigation glissante */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Navigation semaine glissante */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              title="Semaine précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3.5 text-center">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                {weekLabel}
              </span>
            </div>
            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
              title="Semaine suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline px-2 py-1 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg border border-indigo-200 dark:border-indigo-800 cursor-pointer"
            >
              Revenir à aujourd'hui (S35)
            </button>
          )}

          {/* Badge filtre anomalies actif */}
          {isFilteringAnomaliesOnly && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtre Anomalies actif ({filteredEmployees.length} salarié{filteredEmployees.length > 1 ? 's' : ''})</span>
              <button 
                onClick={() => setIsFilteringAnomaliesOnly(false)} 
                className="ml-1 hover:text-rose-900 font-black cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Actions & Vues */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Filtres par rôle */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'docteurs', label: 'Docteurs' },
              { id: 'preparateurs', label: 'Préparateurs' },
              { id: 'apprentis', label: 'Apprentis' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedRoleFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedRoleFilter === f.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Switch de vue */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Grille Glissante
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Timeline 08h-20h
            </button>
          </div>

          {/* Dupliquer la semaine */}
          <button
            onClick={handleDuplicateEntireWeek}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Copier toute la semaine sur la semaine suivante"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Dupliquer vers S+1</span>
          </button>

          {/* Bouton Ajouter Shift */}
          <button
            onClick={() => onOpenAddShiftModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Créneau</span>
          </button>

        </div>

      </div>

      {/* Guide interactif du Glisser-Déposer et Alertes */}
      <div className="bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl p-3 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <MoveHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <strong>Planning Officinal Interactif & Audit Continu :</strong> Glissez-déposez les créneaux pour équilibrer la charge. Cliquez sur un créneau ou un badge d'alerte pour corriger les heures en direct.
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded border border-rose-300 dark:border-rose-800">
            <ShieldAlert className="w-3 h-3" /> Conflit légal
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" /> Vigilance
          </span>
        </div>
      </div>

      {/* Vue 1: GRILLE MATRIX AVEC GLISSER-DÉPOSER ET ALERTES VISUELLES */}
      {viewMode === 'matrix' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Header de la grille */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  
                  {/* Colonne Collaborateur */}
                  <th className="p-3.5 w-60 sticky left-0 bg-slate-50 dark:bg-slate-800 z-20 border-r border-slate-200 dark:border-slate-700">
                    Collaborateur & Contrat
                  </th>

                  {/* 7 Jours de la semaine */}
                  {currentWeekDays.map(day => {
                    const cspInfo = cspStatusByDay[day.date];
                    const dayAlerts = complianceAudit.dayAlertMap[day.date] || [];
                    const hasCriticalDayAlert = dayAlerts.some(a => a.severity === 'danger');

                    return (
                      <th 
                        key={day.date} 
                        className={`p-3 text-center border-r border-slate-200/60 dark:border-slate-800 transition ${
                          day.isToday ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200' : ''
                        } ${hasCriticalDayAlert ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs font-black">{day.dayName}</span>
                          {day.isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                          {day.isGuard && <span className="text-[10px] text-amber-500 font-black">★ GARDE</span>}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 font-normal mt-0.5">
                          {day.shortName}
                        </div>

                        {/* Badge de Conformité CSP Pharmacien pour ce jour */}
                        <div className="mt-1.5 flex items-center justify-center gap-1 flex-wrap">
                          {cspInfo?.hasDoctor ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800" title={`Présence thésée assurée (${cspInfo.doctors.join(', ')})`}>
                              <ShieldCheck className="w-3 h-3" /> Dr Présent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md bg-rose-600 text-white animate-pulse" title="Alerte CSP : Aucun pharmacien thésé planifié sur cette journée d'ouverture !">
                              <ShieldAlert className="w-3 h-3" /> Manque Dr CSP !
                            </span>
                          )}

                          {/* Indicateur d'alerte spécifique au jour */}
                          {dayAlerts.length > 0 && !dayAlerts.some(a => a.type === 'CSP_PHARMACIST_MISSING') && (
                            <span 
                              className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                              title={`${dayAlerts.length} alerte(s) sur ce jour`}
                            >
                              {dayAlerts.length} alerte{dayAlerts.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}

                  {/* Total Heures */}
                  <th className="p-3 text-center w-32 bg-slate-50 dark:bg-slate-800">
                    Total S{35 + weekOffset}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredEmployees.map(emp => {
                  const empShifts = shifts.filter(s => s.employeeId === emp.id);
                  const weekShifts = empShifts.filter(s => currentWeekDates.includes(s.date));
                  const totalWorkedHours = weekShifts.reduce((sum, s) => sum + s.totalHours, 0);
                  const hoursDelta = totalWorkedHours - emp.weeklyHours;
                  const empAlerts = complianceAudit.employeeAlertMap[emp.id] || [];
                  const hasEmpCritical = empAlerts.some(a => a.severity === 'danger');
                  const isOver48h = totalWorkedHours > 48;
                  const isOver44h = totalWorkedHours > 44 && totalWorkedHours <= 48;

                  return (
                    <tr 
                      key={emp.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition ${
                        hasEmpCritical ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      
                      {/* Salarié (Sticky) */}
                      <td className="p-3 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800">
                        <div 
                          onClick={() => onEmployeeClick?.(emp)}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0 ${emp.avatarBg}`}>
                            {emp.avatarInitials}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition truncate flex items-center gap-1">
                              <span>{emp.firstName} {emp.lastName}</span>
                              {emp.isPharmacistDoctor && (
                                <span className="px-1 py-0.2 rounded text-[8px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                  Dr
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {emp.roleLabel} • {emp.weeklyHours}h/sem
                            </div>
                          </div>
                        </div>

                        {/* Badges d'alertes résumés au niveau collaborateur */}
                        {empAlerts.length > 0 && (
                          <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                            {hasEmpCritical ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white animate-pulse">
                                <ShieldAlert className="w-2.5 h-2.5" /> {empAlerts.filter(a => a.severity === 'danger').length} Conflit légal
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <AlertTriangle className="w-2.5 h-2.5" /> {empAlerts.length} Vigilance
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 7 Cellules de Jours (Drop zones) */}
                      {currentWeekDays.map(day => {
                        const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.date === day.date);
                        const isDropTarget = dragOverTarget?.empId === emp.id && dragOverTarget?.date === day.date;
                        
                        // Alertes spécifiques à cette cellule
                        const cellAlerts: ComplianceAlert[] = [];
                        dayShifts.forEach(s => {
                          const sAlerts = complianceAudit.shiftAlertMap[s.id] || [];
                          sAlerts.forEach(a => {
                            if (!cellAlerts.some(existing => existing.id === a.id)) {
                              cellAlerts.push(a);
                            }
                          });
                        });

                        const hasCellCritical = cellAlerts.some(a => a.severity === 'danger');
                        const hasOverlap = cellAlerts.some(a => a.type === 'OVERLAP');
                        const hasDailyMax = cellAlerts.some(a => a.type === 'MAX_DAILY_HOURS');
                        const hasRest11h = cellAlerts.some(a => a.type === 'DAILY_REST_DEFICIT');

                        return (
                          <td 
                            key={day.date}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (!isDropTarget) {
                                setDragOverTarget({ empId: emp.id, date: day.date });
                              }
                            }}
                            onDragLeave={() => {
                              if (isDropTarget) {
                                setDragOverTarget(null);
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropShift(day.date, emp.id);
                            }}
                            className={`p-2 align-top border-r border-slate-100 dark:border-slate-800/60 min-w-[130px] transition ${
                              isDropTarget 
                                ? 'bg-indigo-100/70 dark:bg-indigo-950/80 ring-2 ring-indigo-500 ring-inset rounded-lg' 
                                : hasCellCritical
                                  ? 'bg-rose-50/50 dark:bg-rose-950/30 ring-1 ring-rose-300 dark:ring-rose-800'
                                  : day.isToday 
                                    ? 'bg-indigo-50/20 dark:bg-indigo-950/10' 
                                    : ''
                            }`}
                          >
                            
                            {/* Alertes visuelles au niveau de la cellule du jour */}
                            {hasOverlap && (
                              <div className="mb-1.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-black flex items-center justify-between shadow-xs animate-bounce">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 fill-current" />
                                  <span>CHEVACUHEMENT ⚡</span>
                                </span>
                              </div>
                            )}

                            {hasDailyMax && !hasOverlap && (
                              <div className="mb-1.5 px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-[9px] font-black flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                                <span>Max &gt;10h Dépassé</span>
                              </div>
                            )}

                            {hasRest11h && !hasDailyMax && !hasOverlap && (
                              <div className="mb-1.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[9px] font-black flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Repos &lt;11h</span>
                              </div>
                            )}

                            <div className="space-y-1.5 min-h-[68px] flex flex-col justify-start">
                              {dayShifts.map(shift => {
                                const isDragging = draggedShiftId === shift.id;
                                const isHighlighted = highlightedShiftId === shift.id;
                                const shiftAlerts = complianceAudit.shiftAlertMap[shift.id] || [];
                                const hasCritical = shiftAlerts.some(a => a.severity === 'danger');
                                const hasWarning = shiftAlerts.some(a => a.severity === 'warning');

                                return (
                                  <div
                                    key={shift.id}
                                    draggable={true}
                                    onDragStart={() => setDraggedShiftId(shift.id)}
                                    onDragEnd={() => {
                                      setDraggedShiftId(null);
                                      setDragOverTarget(null);
                                    }}
                                    onClick={() => setEditingShift(shift)}
                                    className={`group/card relative p-2 rounded-xl text-[11px] font-bold border transition cursor-grab active:cursor-grabbing shadow-xs ${
                                      isDragging ? 'opacity-40 scale-95 border-dashed border-indigo-500' : ''
                                    } ${
                                      isHighlighted ? 'ring-4 ring-rose-500 scale-105 z-20' : ''
                                    } ${
                                      hasCritical 
                                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-100 ring-1 ring-rose-400'
                                        : hasWarning
                                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100'
                                          : shift.shiftType === 'garde_dimanche' || shift.shiftType === 'garde_nuit'
                                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                                            : shift.isDoctorOnDuty
                                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                              : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                                    }`}
                                  >
                                    
                                    {/* Plage horaire & Badges d'alertes */}
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-mono font-black flex items-center gap-1">
                                        <Clock className="w-3 h-3 opacity-70" />
                                        {shift.startTime} - {shift.endTime}
                                      </span>

                                      <div className="flex items-center gap-1">
                                        {/* Badge d'alerte légale sur le shift */}
                                        {hasCritical ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingShift(shift);
                                            }}
                                            className="p-0.5 rounded bg-rose-600 text-white animate-pulse"
                                            title={shiftAlerts.map(a => `${a.title} (${a.legalReference})`).join('\n')}
                                          >
                                            <ShieldAlert className="w-3 h-3" />
                                          </button>
                                        ) : hasWarning ? (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingShift(shift);
                                            }}
                                            className="p-0.5 rounded bg-amber-500 text-white"
                                            title={shiftAlerts.map(a => `${a.title} (${a.legalReference})`).join('\n')}
                                          >
                                            <AlertTriangle className="w-3 h-3" />
                                          </button>
                                        ) : null}

                                        <span className="text-[10px] opacity-80 font-mono">
                                          {shift.totalHours}h
                                        </span>
                                      </div>
                                    </div>

                                    {/* Note / Mission */}
                                    {shift.notes && (
                                      <div className="text-[10px] font-normal opacity-85 truncate mt-0.5">
                                        {shift.notes}
                                      </div>
                                    )}

                                    {/* Motif de pause ou garde */}
                                    <div className="flex items-center gap-1 mt-1 text-[9px] opacity-75 font-mono">
                                      <span>Pause: {shift.breakMinutes || 0}m</span>
                                      {shift.isDoctorOnDuty && <span className="font-bold text-emerald-600 dark:text-emerald-400">• Dr CSP</span>}
                                    </div>

                                    {/* Barre d'actions rapides au survol (Précédent, Suivant, Éditer, Supprimer) */}
                                    <div className="mt-1 pt-1 border-t border-current/10 flex items-center justify-between opacity-80 group-hover/card:opacity-100 transition">
                                      <div className="flex items-center gap-0.5">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickMoveDay(shift.id, 'prev');
                                          }}
                                          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                                          title="Glisser vers le jour précédent"
                                        >
                                          <ArrowLeft className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickMoveDay(shift.id, 'next');
                                          }}
                                          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10"
                                          title="Glisser vers le jour suivant"
                                        >
                                          <ArrowRight className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingShift(shift);
                                          }}
                                          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-300"
                                          title="Modifier / Corriger le créneau"
                                        >
                                          <Edit3 className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDuplicateShift(shift.id);
                                          }}
                                          className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400"
                                          title="Dupliquer ce shift"
                                        >
                                          <Copy className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteShift(shift.id);
                                          }}
                                          className="p-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600"
                                          title="Supprimer"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </div>

                                  </div>
                                );
                              })}

                              {/* Bouton d'ajout rapide si cellule vide */}
                              {dayShifts.length === 0 && (
                                <button
                                  onClick={() => onOpenAddShiftModal(day.date, emp.id)}
                                  className="w-full h-full min-h-[58px] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-slate-300 hover:text-indigo-600 flex flex-col items-center justify-center gap-1 transition cursor-pointer group"
                                  title="Ajouter un créneau"
                                >
                                  <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                                  <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition">Ajouter</span>
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Heures & Contrôle Plafond Hebdomadaire (48h / 44h) */}
                      <td className="p-3 text-center align-middle bg-slate-50/50 dark:bg-slate-800/30 border-l border-slate-200 dark:border-slate-800">
                        <div className={`font-mono font-black text-sm ${
                          isOver48h ? 'text-rose-600 dark:text-rose-400' : isOver44h ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {totalWorkedHours}h
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          / {emp.weeklyHours}h
                        </div>

                        {/* Alerte Dépassement Plafond 48h */}
                        {isOver48h && (
                          <div className="mt-1 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black animate-pulse" title="Infraction légale : dépassement du plafond absolu de 48h (Art. L. 3121-20)">
                            &gt; 48h Légal !
                          </div>
                        )}

                        {isOver44h && (
                          <div className="mt-1 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold" title="Vigilance moyenne 44h (Art. L. 3121-22)">
                            &gt; 44h Hebdo
                          </div>
                        )}

                        {hoursDelta !== 0 && !isOver48h && !isOver44h && (
                          <div className={`mt-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full inline-block ${
                            hoursDelta > 0 
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' 
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {hoursDelta > 0 ? `+${hoursDelta}h sup` : `${hoursDelta}h`}
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
      )}

      {/* Vue 2: TIMELINE HORAIRE QUOTIDIENNE AVEC ALERTES VISUELLES (08h00 - 20h00) */}
      {viewMode === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Ruban Chronologique des Postes (08h00 - 20h00)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualisation continue des amplitudes horaires, détection des superpositions et de la couverture pharmaceutique.
              </p>
            </div>

            {/* Sélecteur de jour */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {currentWeekDays.map(d => {
                const dayAlertCount = (complianceAudit.dayAlertMap[d.date] || []).length;
                return (
                  <button
                    key={d.date}
                    onClick={() => setActiveDayDetail(d.date)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activeDayDetail === d.date
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{d.shortName}</span>
                    {dayAlertCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="space-y-3 pt-2">
            
            {/* Échelle horaire */}
            <div className="grid grid-cols-12 text-[10px] font-mono font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-1.5 px-48">
              <span>08h</span>
              <span>09h</span>
              <span>10h</span>
              <span>11h</span>
              <span>12h</span>
              <span>13h</span>
              <span>14h</span>
              <span>15h</span>
              <span>16h</span>
              <span>17h</span>
              <span>18h</span>
              <span>19h30</span>
            </div>

            {/* Rangées des salariés */}
            {filteredEmployees.map(emp => {
              const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.date === activeDayDetail);
              const hasShift = dayShifts.length > 0;
              const hasOverlap = dayShifts.length > 1;

              return (
                <div key={emp.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  
                  {/* Info Salarié (w-48) */}
                  <div className="w-48 shrink-0 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black shrink-0 ${emp.avatarBg}`}>
                      {emp.avatarInitials}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {emp.isPharmacistDoctor ? 'Docteur' : emp.roleLabel}
                      </div>
                    </div>
                  </div>

                  {/* Barre visuelle sur 12 colonnes */}
                  <div className="flex-1 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl relative overflow-hidden flex items-center px-1">
                    {hasShift ? (
                      dayShifts.map(s => {
                        const shiftAlerts = complianceAudit.shiftAlertMap[s.id] || [];
                        const hasCritical = shiftAlerts.some(a => a.severity === 'danger');

                        // Estimation position en %
                        const startHour = parseFloat(s.startTime.split(':')[0]) + parseFloat(s.startTime.split(':')[1]) / 60;
                        const endHour = parseFloat(s.endTime.split(':')[0]) + parseFloat(s.endTime.split(':')[1]) / 60;
                        const leftPct = Math.max(0, Math.min(100, ((startHour - 8) / 12) * 100));
                        const widthPct = Math.max(10, Math.min(100, ((endHour - startHour) / 12) * 100));

                        return (
                          <div
                            key={s.id}
                            onClick={() => setEditingShift(s)}
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            className={`absolute top-1 bottom-1 rounded-lg px-2 flex items-center justify-between text-[10px] font-bold text-white shadow-xs cursor-pointer hover:opacity-90 transition ${
                              hasCritical 
                                ? 'bg-rose-600 ring-2 ring-rose-400' 
                                : s.isDoctorOnDuty 
                                  ? 'bg-emerald-600' 
                                  : 'bg-indigo-600'
                            }`}
                            title={`Cliquer pour ajuster (${s.startTime} - ${s.endTime})`}
                          >
                            <span className="truncate flex items-center gap-1">
                              {hasCritical && <ShieldAlert className="w-3 h-3" />}
                              <span>{s.startTime} - {s.endTime}</span>
                            </span>
                            <span className="text-[9px] font-mono shrink-0">{s.totalHours}h</span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-slate-400 italic px-2">Repos / Non planifié</span>
                    )}
                  </div>

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* MODAL D'AJUSTEMENT & CORRECTION RAPIDE DE SHIFT */}
      {editingShift && (
        <ShiftEditModal
          shift={editingShift}
          employees={employees}
          allShifts={shifts}
          onClose={() => setEditingShift(null)}
          onSave={handleSaveEditedShift}
          onDelete={handleDeleteShift}
          onDuplicate={(id) => handleDuplicateShift(id)}
        />
      )}

    </div>
  );
};
