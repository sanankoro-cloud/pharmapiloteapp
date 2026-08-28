export type EmployeeRole = 
  | 'titulaire'
  | 'adjoint_docteur'
  | 'preparateur'
  | 'rayonniste_conditionneur'
  | 'etudiant_6e_annee'
  | 'apprenti'
  | 'secretaire_comptable';

export type ContractType = 'CDI' | 'CDD' | 'Apprentissage' | 'Professionnalisation' | 'Stage';

export type LeaveType = 
  | 'conges_payes'
  | 'rtt'
  | 'maladie'
  | 'formation_dpc'
  | 'maternite_paternite'
  | 'evenement_familial'
  | 'recuperation';

export type LeaveStatus = 'en_attente' | 'valide' | 'refuse';

export type ShiftType = 
  | 'journee'
  | 'matin'
  | 'apres_midi'
  | 'garde_nuit'
  | 'garde_dimanche'
  | 'formation'
  | 'inventaire'
  | 'repos';

export interface CertificationSkill {
  id: string;
  name: string;
  category: 'vaccination' | 'trod' | 'bilan_medication' | 'dpc' | 'sst' | 'orthopedie';
  obtainedDate: string;
  expiryDate?: string;
  isValid: boolean;
  certificateRef?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  roleLabel: string;
  isPharmacistDoctor: boolean;
  rppsNumber?: string;
  contractType: ContractType;
  weeklyHours: number; // ex: 35
  coefficient: number; // Convention collective pharmacie (ex: 800, 500, 330, 240)
  grossMonthlySalary: number; // Salaire brut mensuel
  entryDate: string; // YYYY-MM-DD
  email: string;
  phone: string;
  avatarBg: string;
  avatarInitials: string;
  
  // Soldes de congés & RTT (en jours ou heures)
  paidLeavesBalance: number; // CP restants (ex: 18.5 jours)
  paidLeavesAcquired: number; // CP acquis total (25 jours/an)
  rttBalance: number; // RTT restants
  overtimeHoursBalance: number; // Heures récupérables (CET/Modulation)
  
  // Médecine du travail & Conformité
  lastMedicalCheckupDate?: string;
  nextMedicalCheckupDueDate?: string;
  medicalCheckupStatus: 'valide' | 'a_planifier' | 'en_retard';
  
  // Entretiens & DPC
  lastAnnualReviewDate?: string;
  nextAnnualReviewDueDate?: string;
  dpcTriennalStatus: 'conforme' | 'en_cours' | 'a_renouveler';
  
  // Compétences & Habilitations
  certifications: CertificationSkill[];
  activeStatus: 'actif' | 'en_conge' | 'arret_maladie' | 'formation';
}

export interface WorkShift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "08:30"
  endTime: string; // "19:30"
  breakMinutes: number; // 60
  totalHours: number; // 8.5
  shiftType: ShiftType;
  isDoctorOnDuty: boolean; // Comptabilisé pour l'obligation de présence pharmaceutique
  notes?: string;
  assignedRole?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  status: LeaveStatus;
  requestedAt: string;
  reason?: string;
  decisionDate?: string;
  decisionComment?: string;
  replacementEmployeeId?: string;
}

export interface OvertimeLog {
  id: string;
  employeeId: string;
  employeeName: string;
  weekLabel: string;
  contractHours: number;
  actualWorkedHours: number;
  deltaHours: number;
  status: 'en_attente' | 'valide_recup' | 'valide_paiement';
  justification: string;
}

export interface TrainingDpcPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  provider: string; // ex: "ANDPC / UTIP / Le Moniteur des Pharmacies"
  category: 'Vaccination' | 'TROD' | 'Dépistage' | 'Entretien pharmaceutique' | 'Management' | 'SST';
  plannedDate: string;
  durationHours: number;
  costHt: number;
  isOpcoFunded: boolean;
  status: 'prevu' | 'valide' | 'certifie';
}

export interface HrPayrollSummary {
  totalEmployeesCount: number;
  totalEtp: number; // Équivalent Temps Plein
  pharmacistsEtp: number;
  preparatorsEtp: number;
  otherStaffEtp: number;
  totalGrossPayrollMonthly: number;
  totalPatronalChargesMonthly: number;
  totalCostMonthly: number;
  annualizedTotalCost: number;
  payrollOverRevenuePct: number; // Ratio Masse Salariale / CA HT (cible: 9% - 12%)
  revenuePerEtpHt: number; // CA HT généré par ETP
  averageHourlyCost: number;
}
