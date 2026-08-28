import React, { useState, useMemo } from 'react';
import { 
  X, 
  Clock, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Copy, 
  User, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { Employee, WorkShift, ShiftType } from '../types/hr';
import { formatDate } from '../utils/formatters';
import { ComplianceAlert, timeToMinutes } from '../utils/legalComplianceAudit';

interface ShiftEditModalProps {
  shift: WorkShift | null;
  employees: Employee[];
  allShifts: WorkShift[];
  onClose: () => void;
  onSave: (updatedShift: WorkShift) => void;
  onDelete?: (shiftId: string) => void;
  onDuplicate?: (shiftId: string) => void;
}

export const ShiftEditModal: React.FC<ShiftEditModalProps> = ({
  shift,
  employees,
  allShifts,
  onClose,
  onSave,
  onDelete,
  onDuplicate
}) => {
  if (!shift) return null;

  const [selectedEmpId, setSelectedEmpId] = useState<string>(shift.employeeId);
  const [date, setDate] = useState<string>(shift.date);
  const [startTime, setStartTime] = useState<string>(shift.startTime);
  const [endTime, setEndTime] = useState<string>(shift.endTime);
  const [breakMinutes, setBreakMinutes] = useState<number>(shift.breakMinutes || 0);
  const [shiftType, setShiftType] = useState<ShiftType>(shift.shiftType || 'journee');
  const [isDoctorOnDuty, setIsDoctorOnDuty] = useState<boolean>(shift.isDoctorOnDuty);
  const [notes, setNotes] = useState<string>(shift.notes || '');

  // Collaborateur assigné
  const assignedEmployee = useMemo(() => {
    return employees.find(e => e.id === selectedEmpId);
  }, [employees, selectedEmpId]);

  // Si on change de collaborateur, mettre à jour automatiquement le statut Docteur
  const handleEmployeeChange = (newEmpId: string) => {
    setSelectedEmpId(newEmpId);
    const emp = employees.find(e => e.id === newEmpId);
    if (emp) {
      setIsDoctorOnDuty(emp.isPharmacistDoctor);
    }
  };

  // Calcul dynamique des heures travaillées nettes
  const calculatedTotalHours = useMemo(() => {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (endMin <= startMin) return 0;
    const netMin = endMin - startMin - (breakMinutes || 0);
    return Math.max(0, parseFloat((netMin / 60).toFixed(2)));
  }, [startTime, endTime, breakMinutes]);

  // Vérification de conformité en direct pendant la modification
  const liveDiagnostics = useMemo(() => {
    const issues: { severity: 'danger' | 'warning'; message: string; rule: string }[] = [];

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    // 1. Horaires invalides
    if (endMin <= startMin) {
      issues.push({
        severity: 'danger',
        message: 'L\'heure de fin doit être postérieure à l\'heure de début.',
        rule: 'Logique horaire'
      });
    }

    // 2. Dépassement 10h quotidiennes
    const isGuard = shiftType === 'garde_dimanche' || shiftType === 'garde_nuit';
    const limitDaily = isGuard ? 12 : 10;
    if (calculatedTotalHours > limitDaily) {
      issues.push({
        severity: 'danger',
        message: `Durée de ${calculatedTotalHours}h supérieure au plafond quotidien légal de ${limitDaily}h.`,
        rule: 'Art. L. 3121-18 Code du Travail'
      });
    }

    // 3. Pause obligatoire 20min dès 6h continues
    const rawSpanHours = (endMin - startMin) / 60;
    if (rawSpanHours >= 6 && breakMinutes < 20) {
      issues.push({
        severity: 'warning',
        message: 'Une pause d\'au moins 20 min est obligatoire pour tout poste de 6h ou plus.',
        rule: 'Art. L. 3121-16 Code du Travail'
      });
    }

    // 4. Chevauchement avec d'autres shifts du même salarié le même jour
    const otherShiftsToday = allShifts.filter(s => 
      s.id !== shift.id && 
      s.employeeId === selectedEmpId && 
      s.date === date
    );

    otherShiftsToday.forEach(os => {
      const osStart = timeToMinutes(os.startTime);
      const osEnd = timeToMinutes(os.endTime);
      if (startMin < osEnd && osStart < endMin) {
        issues.push({
          severity: 'danger',
          message: `Chevauchement avec un autre créneau existant (${os.startTime}-${os.endTime}).`,
          rule: 'Conflit d\'horaires direct'
        });
      }
    });

    return issues;
  }, [startTime, endTime, breakMinutes, calculatedTotalHours, shiftType, selectedEmpId, date, allShifts, shift.id]);

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: WorkShift = {
      ...shift,
      employeeId: selectedEmpId,
      date,
      startTime,
      endTime,
      breakMinutes,
      totalHours: calculatedTotalHours,
      shiftType,
      isDoctorOnDuty,
      notes: notes || undefined
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Ajustement de Créneau Officinal
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Modifier le Poste de Travail</span>
            </h3>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic de conformité en direct */}
        {liveDiagnostics.length > 0 ? (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Point(s) de vigilance ou conflit détecté :</span>
            </div>
            {liveDiagnostics.map((issue, idx) => (
              <div key={idx} className="text-rose-700 dark:text-rose-300 text-[11px] flex items-start gap-1">
                <span className="font-bold">•</span>
                <span>{issue.message} <em className="text-[10px] opacity-75">({issue.rule})</em></span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Créneau 100% conforme aux règles légales (durée, pause, sans conflit).</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
          
          {/* Collaborateur & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Collaborateur Assigné
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} ({e.isPharmacistDoctor ? 'Dr Pharmacien' : e.roleLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date du Shift
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Horaires & Pause */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Heure Début
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Heure Fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pause (min)
              </label>
              <select
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>0 min (continu)</option>
                <option value={20}>20 min (pause légale)</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min (1h repas)</option>
                <option value={90}>1h30 (coupure midi)</option>
                <option value={120}>2h00 (coupure)</option>
              </select>
            </div>
          </div>

          {/* Type & Statut CSP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type de Créneau
              </label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value as ShiftType)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="journee">Journée Complète</option>
                <option value="matin">Matinée (Ouverture)</option>
                <option value="apres_midi">Après-Midi (Fermeture)</option>
                <option value="garde_dimanche">Garde Dimanche Officielle</option>
                <option value="garde_nuit">Garde de Nuit</option>
                <option value="formation">Formation / DPC</option>
                <option value="inventaire">Inventaire / Réception</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDoctorOnDuty}
                  onChange={(e) => setIsDoctorOnDuty(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Comptabilisé présence Docteur en Pharmacie (CSP)
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Missions spécifiques (Optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex : Réception OCP 08h45, Bilan médication, Dépistages TROD..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Synthèse heures */}
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between font-mono">
            <span className="text-slate-500">Temps de travail effectif net calculé :</span>
            <strong className="text-sm font-black text-slate-900 dark:text-white">
              {calculatedTotalHours} heures
            </strong>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(shift.id);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Supprimer ce créneau"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              )}

              {onDuplicate && (
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(shift.id);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Dupliquer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Dupliquer</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
