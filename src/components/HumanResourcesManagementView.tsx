import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CalendarDays, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  HeartPulse, 
  Stethoscope, 
  FileText, 
  TrendingUp, 
  Euro, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Briefcase, 
  Hourglass, 
  BadgePercent, 
  HelpCircle,
  Coffee,
  Sparkles,
  Info,
  Edit3,
  Trash2,
  PieChart as PieIcon,
  ChevronDown
} from 'lucide-react';
import { 
  Employee, 
  WorkShift, 
  LeaveRequest, 
  OvertimeLog, 
  TrainingDpcPlan, 
  HrPayrollSummary,
  EmployeeRole,
  ContractType,
  LeaveType,
  ShiftType
} from '../types/hr';
import { 
  MOCK_EMPLOYEES, 
  MOCK_WORK_SHIFTS, 
  MOCK_LEAVE_REQUESTS, 
  MOCK_OVERTIME_LOGS, 
  MOCK_TRAINING_PLANS, 
  MOCK_HR_SUMMARY,
  BLANK_HR_SUMMARY
} from '../data/mockHrData';

import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { PlanningSlidingCalendar } from './PlanningSlidingCalendar';
import { LeaveManagementPortal } from './LeaveManagementPortal';

interface HumanResourcesManagementViewProps {
  employees?: Employee[];
  shifts?: WorkShift[];
  leaveRequests?: LeaveRequest[];
  overtimeLogs?: OvertimeLog[];
  trainingPlans?: TrainingDpcPlan[];
  onUpdateEmployees?: (employees: Employee[]) => void;
  onUpdateShifts?: (shifts: WorkShift[]) => void;
  onUpdateLeaveRequests?: (leaves: LeaveRequest[]) => void;
  onUpdateOvertimeLogs?: (logs: OvertimeLog[]) => void;
  onUpdateTrainingPlans?: (plans: TrainingDpcPlan[]) => void;
  onNavigateTab?: (tab: string) => void;
  onResetToDemo?: () => void;
}

type HrTab = 'planning' | 'conges' | 'personnel' | 'dpc_formations' | 'heures_modulation' | 'masse_salariale';

export const HumanResourcesManagementView: React.FC<HumanResourcesManagementViewProps> = ({
  employees: propEmployees,
  shifts: propShifts,
  leaveRequests: propLeaveRequests,
  overtimeLogs: propOvertimeLogs,
  trainingPlans: propTrainingPlans,
  onUpdateEmployees,
  onUpdateShifts,
  onUpdateLeaveRequests,
  onUpdateOvertimeLogs,
  onUpdateTrainingPlans,
  onNavigateTab,
  onResetToDemo
}) => {
  const [activeTab, setActiveTab] = useState<HrTab>('planning');
  
  // Local states as fallbacks if props not passed
  const [localEmployees, setLocalEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [localShifts, setLocalShifts] = useState<WorkShift[]>(MOCK_WORK_SHIFTS);
  const [localLeaveRequests, setLocalLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [localOvertimeLogs, setLocalOvertimeLogs] = useState<OvertimeLog[]>(MOCK_OVERTIME_LOGS);
  const [localTrainingPlans, setLocalTrainingPlans] = useState<TrainingDpcPlan[]>(MOCK_TRAINING_PLANS);

  // Controlled values
  const employees = propEmployees ?? localEmployees;
  const shifts = propShifts ?? localShifts;
  const leaveRequests = propLeaveRequests ?? localLeaveRequests;
  const overtimeLogs = propOvertimeLogs ?? localOvertimeLogs;
  const trainingPlans = propTrainingPlans ?? localTrainingPlans;

  const setEmployees = (newEmployeesOrUpdater: Employee[] | ((prev: Employee[]) => Employee[])) => {
    const updated = typeof newEmployeesOrUpdater === 'function' ? newEmployeesOrUpdater(employees) : newEmployeesOrUpdater;
    if (onUpdateEmployees) onUpdateEmployees(updated);
    else setLocalEmployees(updated);
  };

  const setShifts = (newShiftsOrUpdater: WorkShift[] | ((prev: WorkShift[]) => WorkShift[])) => {
    const updated = typeof newShiftsOrUpdater === 'function' ? newShiftsOrUpdater(shifts) : newShiftsOrUpdater;
    if (onUpdateShifts) onUpdateShifts(updated);
    else setLocalShifts(updated);
  };

  const setLeaveRequests = (newLeavesOrUpdater: LeaveRequest[] | ((prev: LeaveRequest[]) => LeaveRequest[])) => {
    const updated = typeof newLeavesOrUpdater === 'function' ? newLeavesOrUpdater(leaveRequests) : newLeavesOrUpdater;
    if (onUpdateLeaveRequests) onUpdateLeaveRequests(updated);
    else setLocalLeaveRequests(updated);
  };

  const setOvertimeLogs = (newLogsOrUpdater: OvertimeLog[] | ((prev: OvertimeLog[]) => OvertimeLog[])) => {
    const updated = typeof newLogsOrUpdater === 'function' ? newLogsOrUpdater(overtimeLogs) : newLogsOrUpdater;
    if (onUpdateOvertimeLogs) onUpdateOvertimeLogs(updated);
    else setLocalOvertimeLogs(updated);
  };

  const setTrainingPlans = (newPlansOrUpdater: TrainingDpcPlan[] | ((prev: TrainingDpcPlan[]) => TrainingDpcPlan[])) => {
    const updated = typeof newPlansOrUpdater === 'function' ? newPlansOrUpdater(trainingPlans) : newPlansOrUpdater;
    if (onUpdateTrainingPlans) onUpdateTrainingPlans(updated);
    else setLocalTrainingPlans(updated);
  };

  // Dynamic HR summary computed from actual employees
  const dynamicHrSummary = useMemo<HrPayrollSummary>(() => {
    if (employees.length === 0) {
      return BLANK_HR_SUMMARY;
    }
    const totalEmployeesCount = employees.length;
    const totalEtp = Number(employees.reduce((sum, e) => sum + (e.weeklyHours / 35), 0).toFixed(1));
    const pharmacistsEtp = Number(employees.filter(e => e.isPharmacistDoctor).reduce((sum, e) => sum + (e.weeklyHours / 35), 0).toFixed(1));
    const preparatorsEtp = Number(employees.filter(e => e.role === 'preparateur').reduce((sum, e) => sum + (e.weeklyHours / 35), 0).toFixed(1));
    const otherStaffEtp = Number(Math.max(0, totalEtp - pharmacistsEtp - preparatorsEtp).toFixed(1));
    const totalGrossPayrollMonthly = employees.reduce((sum, e) => sum + (e.grossMonthlySalary || 0), 0);

    const totalPatronalChargesMonthly = Math.round(totalGrossPayrollMonthly * 0.44);
    const totalCostMonthly = totalGrossPayrollMonthly + totalPatronalChargesMonthly;
    const annualizedTotalCost = totalCostMonthly * 12;
    const payrollOverRevenuePct = totalEmployeesCount > 0 ? Number(((annualizedTotalCost / 2800000) * 100).toFixed(1)) : 0;
    const revenuePerEtpHt = totalEtp > 0 ? Math.round(2800000 / totalEtp) : 0;
    const averageHourlyCost = totalEtp > 0 ? Number((totalCostMonthly / (totalEtp * 151.67)).toFixed(2)) : 0;

    return {
      totalEmployeesCount,
      totalEtp,
      pharmacistsEtp,
      preparatorsEtp,
      otherStaffEtp,
      totalGrossPayrollMonthly,
      totalPatronalChargesMonthly,
      totalCostMonthly,
      annualizedTotalCost,
      payrollOverRevenuePct,
      revenuePerEtpHt,
      averageHourlyCost
    };
  }, [employees]);


  // Filters & Planning views
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState<string>('');
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [selectedDayTab, setSelectedDayTab] = useState<string>('2026-08-27'); // Aujourd'hui (Jeudi)

  // Modals state
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState<boolean>(false);
  const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState<boolean>(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState<boolean>(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);

  // Simulation hire state in payroll tab
  const [simulatedRole, setSimulatedRole] = useState<EmployeeRole>('preparateur');
  const [simulatedWeeklyHours, setSimulatedWeeklyHours] = useState<number>(35);
  const [simulatedGrossSalary, setSimulatedGrossSalary] = useState<number>(2400);

  // Days of current week (24 to 30 August 2026)
  const weekDays = useMemo(() => [
    { date: '2026-08-24', dayName: 'Lundi', shortName: 'Lun 24', isToday: false },
    { date: '2026-08-25', dayName: 'Mardi', shortName: 'Mar 25', isToday: false },
    { date: '2026-08-26', dayName: 'Mercredi', shortName: 'Mer 26', isToday: false },
    { date: '2026-08-27', dayName: 'Jeudi', shortName: 'Jeu 27', isToday: true },
    { date: '2026-08-28', dayName: 'Vendredi', shortName: 'Ven 28', isToday: false },
    { date: '2026-08-29', dayName: 'Samedi', shortName: 'Sam 29', isToday: false },
    { date: '2026-08-30', dayName: 'Dimanche (Garde)', shortName: 'Dim 30', isToday: false, isGuard: true }
  ], []);

  // Summary counts
  const pendingLeavesCount = useMemo(() => {
    return leaveRequests.filter(lr => lr.status === 'en_attente').length;
  }, [leaveRequests]);

  const urgentMedicalChecksCount = useMemo(() => {
    return employees.filter(e => e.medicalCheckupStatus !== 'valide').length;
  }, [employees]);

  const pendingOvertimeCount = useMemo(() => {
    return overtimeLogs.filter(ot => ot.status === 'en_attente').length;
  }, [overtimeLogs]);

  // Handle Leave Approvals
  const handleApproveLeave = (id: string, comment: string = 'Validé par le pharmacien titulaire') => {
    setLeaveRequests(prev => prev.map(lr => {
      if (lr.id === id) {
        return {
          ...lr,
          status: 'valide' as const,
          decisionDate: '2026-08-27',
          decisionComment: comment
        };
      }
      return lr;
    }));
  };

  const handleRejectLeave = (id: string, reason: string = 'Refusé pour contrainte de planning') => {
    setLeaveRequests(prev => prev.map(lr => {
      if (lr.id === id) {
        return {
          ...lr,
          status: 'refuse' as const,
          decisionDate: '2026-08-27',
          decisionComment: reason
        };
      }
      return lr;
    }));
  };

  // Handle Overtime approval
  const handleApproveOvertime = (id: string, mode: 'valide_recup' | 'valide_paiement') => {
    setOvertimeLogs(prev => prev.map(ot => {
      if (ot.id === id) {
        return { ...ot, status: mode };
      }
      return ot;
    }));
  };

  // Filtered employees for list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
        emp.roleLabel.toLowerCase().includes(searchEmployeeQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchEmployeeQuery.toLowerCase());
      
      const matchesRole = 
        selectedRoleFilter === 'all' ||
        (selectedRoleFilter === 'docteurs' && emp.isPharmacistDoctor) ||
        (selectedRoleFilter === 'preparateurs' && emp.role === 'preparateur') ||
        (selectedRoleFilter === 'etudiants_apprentis' && (emp.role === 'etudiant_6e_annee' || emp.role === 'apprenti'));
      
      return matchesSearch && matchesRole;
    });
  }, [employees, searchEmployeeQuery, selectedRoleFilter]);

  // Check CSP Doctor presence on selected day
  const cspDoctorStatus = useMemo(() => {
    const dayShifts = shifts.filter(s => s.date === selectedDayTab);
    const doctorShifts = dayShifts.filter(s => s.isDoctorOnDuty);
    const hasDoctor = doctorShifts.length > 0;
    
    return {
      hasDoctor,
      doctorsOnDuty: doctorShifts.map(s => {
        const emp = employees.find(e => e.id === s.employeeId);
        return emp ? `Dr. ${emp.firstName} ${emp.lastName} (${s.startTime} - ${s.endTime})` : '';
      }).filter(Boolean)
    };
  }, [shifts, selectedDayTab, employees]);

  // Simulation hire calculations
  const simulationHireImpact = useMemo(() => {
    const patronalCharges = simulatedGrossSalary * 0.44;
    const totalCostMonthly = simulatedGrossSalary + patronalCharges;
    const newTotalPayroll = dynamicHrSummary.totalCostMonthly + totalCostMonthly;
    const estimatedAnnualCaHt = 2800000;
    const newPayrollRatio = (newTotalPayroll * 12 / estimatedAnnualCaHt) * 100;
    
    return {
      patronalCharges,
      totalCostMonthly,
      newTotalPayroll,
      newPayrollRatio: Number(newPayrollRatio.toFixed(1)),
      ratioDelta: Number((newPayrollRatio - dynamicHrSummary.payrollOverRevenuePct).toFixed(1))
    };
  }, [simulatedGrossSalary, dynamicHrSummary]);


  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner: Title & Key HR Indicators */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Management & Ressources Humaines
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Convention Collective Pharmacie d'Officine IDCC 1996
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestion du Personnel & Planning Officinal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Pilotage des plannings et gardes, arbitrage des congés, suivi des obligations CSP (présence pharmacien thésé), registre du personnel et maîtrise de la masse salariale.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddShiftModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un Créneau / Garde</span>
            </button>
            <button
              onClick={() => setIsLeaveRequestModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Poser un Congé / Absence</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Imprimer le planning légal d'affichage"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
          
          {/* Card 1: Equipe & ETP */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Effectif & ETP Total
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5 flex items-baseline gap-1.5">
                <span>{dynamicHrSummary.totalEmployeesCount} salariés</span>
                <span className="text-xs font-semibold text-slate-500 font-mono">({dynamicHrSummary.totalEtp} ETP)</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {dynamicHrSummary.pharmacistsEtp} ETP Docteurs • {dynamicHrSummary.preparatorsEtp} ETP Préparateurs
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>


          {/* Card 2: Conformité Réglementaire CSP */}
          <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Conformité CSP Pharmacien
              </span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Couvert</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Pharmacien thésé présent en continu
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Congés en Attente */}
          <div 
            onClick={() => setActiveTab('conges')}
            className={`cursor-pointer transition rounded-xl p-3.5 border flex items-center justify-between ${
              pendingLeavesCount > 0 
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:border-amber-400' 
                : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Congés & RTT à Arbitrer
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <span>{pendingLeavesCount} demande{pendingLeavesCount > 1 ? 's' : ''}</span>
                {pendingLeavesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                    À valider
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Septembre : 12 jours posés
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Ratio Masse Salariale / CA */}
          <div 
            onClick={() => setActiveTab('masse_salariale')}
            className="cursor-pointer transition bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Masse Salariale / CA HT
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5 flex items-baseline gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{MOCK_HR_SUMMARY.payrollOverRevenuePct}%</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Cible 10-12% OK
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Coût chargé : {formatCurrency(MOCK_HR_SUMMARY.totalCostMonthly)}/mois
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>

        </div>

      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'planning', label: 'Planning & Gardes de l\'Équipe', icon: Calendar, badge: null },
          { id: 'conges', label: 'Congés, RTT & Absences', icon: CalendarDays, badge: pendingLeavesCount > 0 ? `${pendingLeavesCount}` : null, badgeColor: 'bg-amber-500 text-white' },
          { id: 'personnel', label: 'Registre du Personnel & Fiches', icon: Users, badge: urgentMedicalChecksCount > 0 ? `${urgentMedicalChecksCount} visite` : null, badgeColor: 'bg-rose-500 text-white' },
          { id: 'dpc_formations', label: 'Formations DPC & Compétences', icon: GraduationCap, badge: 'Missions 2026' },
          { id: 'heures_modulation', label: 'Heures Sup & Modulation', icon: Clock, badge: pendingOvertimeCount > 0 ? `${pendingOvertimeCount}` : null, badgeColor: 'bg-indigo-600 text-white' },
          { id: 'masse_salariale', label: 'Masse Salariale & Ratios RH', icon: Euro, badge: '10.8%' }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as HrTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span>{t.label}</span>
              {t.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${t.badgeColor || 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PLANNING & GARDES */}
      {activeTab === 'planning' && (
        <div className="space-y-6 animate-fadeIn">
          <PlanningSlidingCalendar 
            employees={employees}
            shifts={shifts}
            onUpdateShifts={setShifts}
            onOpenAddShiftModal={() => setIsAddShiftModalOpen(true)}
          />
        </div>
      )}

      {/* TAB 2: CONGES & ABSENCES */}
      {activeTab === 'conges' && (
        <div className="space-y-6 animate-fadeIn">
          <LeaveManagementPortal
            employees={employees}
            leaveRequests={leaveRequests}
            onUpdateLeaveRequests={setLeaveRequests}
            onUpdateEmployees={setEmployees}
          />
        </div>
      )}

      {/* TAB 3: REGISTRE DU PERSONNEL & FICHES SALARIES */}
      {activeTab === 'personnel' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un collaborateur, rôle, email..."
                value={searchEmployeeQuery}
                onChange={(e) => setSearchEmployeeQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setSelectedRoleFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedRoleFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Tous ({employees.length})
                </button>
                <button
                  onClick={() => setSelectedRoleFilter('docteurs')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedRoleFilter === 'docteurs' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Pharmaciens (2)
                </button>
                <button
                  onClick={() => setSelectedRoleFilter('preparateurs')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedRoleFilter === 'preparateurs' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Préparateurs (2)
                </button>
              </div>

              <button
                onClick={() => setIsAddEmployeeModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Salarié</span>
              </button>
            </div>

          </div>

          {/* Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => (
              <div 
                key={emp.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xs ${emp.avatarBg}`}>
                        {emp.avatarInitials}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{emp.firstName} {emp.lastName}</span>
                          {emp.isPharmacistDoctor && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              Dr Pharmacien
                            </span>
                          )}
                        </h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {emp.roleLabel}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {emp.contractType}
                    </span>
                  </div>

                  {/* Convention & Contract Details */}
                  <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-[10px] text-slate-400 font-medium">Coeff Convention</span>
                      <div className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        Coeff. {emp.coefficient}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-[10px] text-slate-400 font-medium">Temps de Travail</span>
                      <div className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {emp.weeklyHours}h / semaine
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-[10px] text-slate-400 font-medium">Date d'Embauche</span>
                      <div className="font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {emp.entryDate}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-[10px] text-slate-400 font-medium">Salaire Brut Mensuel</span>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                        {formatCurrency(emp.grossMonthlySalary)}
                      </div>
                    </div>
                  </div>

                  {/* Health check & DPC status badges */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Médecine du travail :</span>
                      {emp.medicalCheckupStatus === 'valide' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> À jour ({emp.lastMedicalCheckupDate})
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Visite à planifier
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">DPC Triennal :</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {emp.dpcTriennalStatus === 'conforme' ? '✓ Conforme' : '⏳ En cours de validation'}
                      </span>
                    </div>
                  </div>

                  {/* Certifications badges list */}
                  {emp.certifications.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                      {emp.certifications.map(c => (
                        <span key={c.id} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <a href={`tel:${emp.phone}`} className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{emp.phone}</span>
                  </a>
                  <button
                    onClick={() => setSelectedEmployeeForDetail(emp)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Voir dossier RH &rarr;
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 4: FORMATIONS DPC & NOUVELLES MISSIONS */}
      {activeTab === 'dpc_formations' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Plan de Formation & Habilitations Nouvelles Missions (2026)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Suivi des obligations de DPC triennal et habilitations pour les entretiens pharmaceutiques, vaccinations et dépistages TROD.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Prise en charge OPCO-EP & ANDPC
              </span>
            </div>

            {/* Matrix of Skills per Team Member */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Collaborateur</th>
                    <th className="p-3 text-center">Vaccination Complète</th>
                    <th className="p-3 text-center">Prescription & TROD</th>
                    <th className="p-3 text-center">Bilan Médication (BPM)</th>
                    <th className="p-3 text-center">Secourisme SST</th>
                    <th className="p-3 text-center">Statut DPC Triennal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {emp.roleLabel}
                        </div>
                      </td>

                      {/* Vaccination */}
                      <td className="p-3 text-center">
                        {emp.certifications.some(c => c.category === 'vaccination') ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <Check className="w-4 h-4" /> Habilité
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* TROD */}
                      <td className="p-3 text-center">
                        {emp.certifications.some(c => c.category === 'trod') ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <Check className="w-4 h-4" /> Habilité
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* BPM */}
                      <td className="p-3 text-center">
                        {emp.certifications.some(c => c.category === 'bilan_medication') ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <Check className="w-4 h-4" /> Habilité
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* SST */}
                      <td className="p-3 text-center">
                        {emp.certifications.some(c => c.category === 'sst') ? (
                          <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                            <Award className="w-4 h-4" /> Sauveteur SST
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* DPC */}
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {emp.dpcTriennalStatus === 'conforme' ? 'Conforme 2023-2025' : 'En cours'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Upcoming Training Sessions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Formations Programmées au Calendrier (Financement OPCO)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trainingPlans.map(tp => (
                <div key={tp.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {tp.category}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        Prévu le {tp.plannedDate}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                      {tp.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Participant : <strong className="text-slate-700 dark:text-slate-300">{tp.employeeName}</strong> • Organisme : {tp.provider}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/70 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Durée : {tp.durationHours} heures</span>
                    <span className="text-emerald-600 font-bold">
                      {tp.isOpcoFunded ? 'Pris en charge 100% OPCO' : `Coût : ${formatCurrency(tp.costHt)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: HEURES SUP & MODULATION */}
      {activeTab === 'heures_modulation' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Contingent d'Heures Supplémentaires & Récupération
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arbitrage entre majoration salariale (+25%) et repos compensateur de remplacement (RCR).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                Contingent légal annuel : 220h / an / salarié
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Salarié</th>
                    <th className="p-3">Semaine Concernée</th>
                    <th className="p-3 text-center">Heures Contrat</th>
                    <th className="p-3 text-center">Heures Réalisées</th>
                    <th className="p-3 text-center">Delta / Heures Sup</th>
                    <th className="p-3">Justification</th>
                    <th className="p-3 text-right">Option d'Arbitrage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {overtimeLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {log.employeeName}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono">
                        {log.weekLabel}
                      </td>
                      <td className="p-3 text-center font-mono">{log.contractHours}h</td>
                      <td className="p-3 text-center font-mono font-bold">{log.actualWorkedHours}h</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-600">
                        {log.deltaHours > 0 ? `+${log.deltaHours}h` : `${log.deltaHours}h`}
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate">
                        {log.justification}
                      </td>
                      <td className="p-3 text-right">
                        {log.status === 'en_attente' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveOvertime(log.id, 'valide_recup')}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
                            >
                              Ajouter au CET (Récup)
                            </button>
                            <button
                              onClick={() => handleApproveOvertime(log.id, 'valide_paiement')}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                            >
                              Payer +25%
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600">
                            {log.status === 'valide_recup' ? '✓ Affecté en Récupération' : '✓ Transmis en Paie'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* TAB 6: MASSE SALARIALE & RATIOS RH */}
      {activeTab === 'masse_salariale' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Key Ratios Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Masse Salariale Annuelle Chargée
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {formatCurrency(dynamicHrSummary.annualizedTotalCost)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Brut ({formatCurrency(dynamicHrSummary.totalGrossPayrollMonthly * 12)}) + Charges Patronales ({formatCurrency(dynamicHrSummary.totalPatronalChargesMonthly * 12)})
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ratio Masse Salariale / CA HT
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {dynamicHrSummary.payrollOverRevenuePct}%
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Benchmark officine : 9,5% à 12,0% • <strong className="text-emerald-600 font-semibold">{dynamicHrSummary.payrollOverRevenuePct <= 12 ? 'Excellente rentabilité' : 'À surveiller'}</strong>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Productivité & CA HT par ETP
              </span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                {formatCurrency(dynamicHrSummary.revenuePerEtpHt)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Sur base de {dynamicHrSummary.totalEtp} ETP • Coût moyen horaire chargé : {formatCurrency(dynamicHrSummary.averageHourlyCost)}/h
              </div>
            </div>

          </div>


          {/* Hire Simulator Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Simulateur d'Embauche & Impact sur le Ratio de Rentabilité
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculez en temps réel le coût chargé et le déplacement de votre ratio de masse salariale avant toute embauche.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-center">
              
              {/* Simulator Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Poste / Profil Envisagé
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'adjoint_docteur', label: 'Pharmacien Adjoint', defaultSal: 3900 },
                      { role: 'preparateur', label: 'Préparateur (BP)', defaultSal: 2400 },
                      { role: 'apprenti', label: 'Apprenti DEUST', defaultSal: 1400 }
                    ].map(item => (
                      <button
                        key={item.role}
                        onClick={() => {
                          setSimulatedRole(item.role as EmployeeRole);
                          setSimulatedGrossSalary(item.defaultSal);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                          simulatedRole === item.role
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Salaire Brut Mensuel (€)
                    </label>
                    <input
                      type="number"
                      value={simulatedGrossSalary}
                      onChange={(e) => setSimulatedGrossSalary(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Temps de Travail (Heures/semaine)
                    </label>
                    <select
                      value={simulatedWeeklyHours}
                      onChange={(e) => setSimulatedWeeklyHours(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value={35}>35 heures (Temps plein)</option>
                      <option value={28}>28 heures (Temps partiel 80%)</option>
                      <option value={21}>21 heures (Temps partiel 60%)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Simulation Result Card (5 cols) */}
              <div className="lg:col-span-5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Résultat de la Simulation
                </span>
                
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Coût Mensuel Chargé :</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(simulationHireImpact.totalCostMonthly)}/mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Charges Patronales estimées (44%) :</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(simulationHireImpact.patronalCharges)}/mois</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200 dark:border-indigo-800 pt-2 font-bold">
                    <span className="text-slate-900 dark:text-white">Nouveau Ratio Masse Salariale :</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{simulationHireImpact.newPayrollRatio}%</span>
                  </div>
                  <div className="text-[11px] text-slate-500 italic mt-1">
                    Impact sur ratio : +{simulationHireImpact.ratioDelta}% par rapport à la situation actuelle.
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODAL 1: POSER UN CONGÉ / ABSENCE */}
      {isLeaveRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                Poser une Demande de Congé / Absence
              </h3>
              <button onClick={() => setIsLeaveRequestModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Salarié</label>
                <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.roleLabel})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Type d'Absence</label>
                  <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                    <option value="conges_payes">Congés Payés (CP)</option>
                    <option value="rtt">RTT</option>
                    <option value="formation_dpc">Formation DPC</option>
                    <option value="maladie">Arrêt Maladie</option>
                    <option value="evenement_familial">Événement Familial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre de Jours</label>
                  <input type="number" defaultValue={5} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date de Début</label>
                  <input type="date" defaultValue="2026-09-14" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date de Fin</label>
                  <input type="date" defaultValue="2026-09-19" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Motif / Commentaire</label>
                <textarea rows={2} placeholder="Précisez la raison ou l'accord préalable..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsLeaveRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  alert('Demande de congé enregistrée avec succès.');
                  setIsLeaveRequestModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Enregistrer la Demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: AJOUTER UN CRÉNEAU PLANNING */}
      {isAddShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Ajouter / Modifier un Créneau de Planning
              </h3>
              <button onClick={() => setIsAddShiftModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Salarié Concerné</label>
                <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.roleLabel})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input type="date" defaultValue="2026-08-31" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Type de Créneau</label>
                  <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                    <option value="journee">Journée Complète (08h30 - 19h30)</option>
                    <option value="matin">Matin (08h30 - 14h00)</option>
                    <option value="apres_midi">Après-Midi (13h30 - 19h30)</option>
                    <option value="garde_dimanche">Garde Dimanche / Urgences</option>
                    <option value="garde_nuit">Garde de Nuit Volet Ouvert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Heure Début</label>
                  <input type="text" defaultValue="08:30" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-center font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Heure Fin</label>
                  <input type="text" defaultValue="19:30" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-center font-bold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pause (min)</label>
                  <input type="number" defaultValue={60} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-bold" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes & Affectation de Poste</label>
                <input type="text" placeholder="Ex: Vaccinations, Contrôle réceptions, Ordonnancier..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddShiftModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  alert('Créneau de planning ajouté avec succès.');
                  setIsAddShiftModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Valider le Créneau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FICHE COLLABORATEUR DÉTAILLÉE */}
      {selectedEmployeeForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm ${selectedEmployeeForDetail.avatarBg}`}>
                  {selectedEmployeeForDetail.avatarInitials}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedEmployeeForDetail.firstName} {selectedEmployeeForDetail.lastName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {selectedEmployeeForDetail.contractType}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">{selectedEmployeeForDetail.roleLabel}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployeeForDetail(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <span className="text-slate-400 font-medium">Numéro RPPS :</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedEmployeeForDetail.rppsNumber || 'Non applicable (Non thésé)'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Coeff Conventionnel :</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    Coeff. {selectedEmployeeForDetail.coefficient}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email Professionnel :</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {selectedEmployeeForDetail.email}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Téléphone :</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedEmployeeForDetail.phone}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Habilitations & Certifications Actives
                </h4>
                <div className="space-y-1.5">
                  {selectedEmployeeForDetail.certifications.map(c => (
                    <div key={c.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Obtenu le {c.obtainedDate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  Médecine du Travail & Visites Périodiques
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  Dernière visite effectuée le : <strong className="text-slate-900 dark:text-white">{selectedEmployeeForDetail.lastMedicalCheckupDate || 'Non renseignée'}</strong>
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  Prochaine visite obligatoire avant le : <strong className="text-slate-900 dark:text-white">{selectedEmployeeForDetail.nextMedicalCheckupDueDate || '2026-12-31'}</strong>
                </p>
              </div>

            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedEmployeeForDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
              >
                Fermer la Fiche
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
