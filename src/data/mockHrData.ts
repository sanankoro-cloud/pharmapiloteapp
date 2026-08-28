import { 
  Employee, 
  WorkShift, 
  LeaveRequest, 
  OvertimeLog, 
  TrainingDpcPlan, 
  HrPayrollSummary 
} from '../types/hr';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    firstName: 'Alexandre',
    lastName: 'Vidal',
    role: 'titulaire',
    roleLabel: 'Pharmacien Titulaire (Gérant)',
    isPharmacistDoctor: true,
    rppsNumber: '10104892341',
    contractType: 'CDI',
    weeklyHours: 42,
    coefficient: 800,
    grossMonthlySalary: 6200,
    entryDate: '2016-04-01',
    email: 'a.vidal@pharmacie-centrale.fr',
    phone: '06 12 34 56 78',
    avatarBg: 'bg-emerald-600',
    avatarInitials: 'AV',
    paidLeavesBalance: 12.0,
    paidLeavesAcquired: 25.0,
    rttBalance: 4.0,
    overtimeHoursBalance: 0,
    lastMedicalCheckupDate: '2025-06-15',
    nextMedicalCheckupDueDate: '2027-06-15',
    medicalCheckupStatus: 'valide',
    lastAnnualReviewDate: '2026-01-10',
    nextAnnualReviewDueDate: '2027-01-10',
    dpcTriennalStatus: 'conforme',
    activeStatus: 'actif',
    certifications: [
      { id: 'c-1', name: 'Vaccination Grippe & Covid', category: 'vaccination', obtainedDate: '2020-10-01', isValid: true },
      { id: 'c-2', name: 'Prescription & TROD Angine / Cystite', category: 'trod', obtainedDate: '2024-03-12', isValid: true },
      { id: 'c-3', name: 'Bilan Partagé de Médication (BPM)', category: 'bilan_medication', obtainedDate: '2022-05-18', isValid: true },
      { id: 'c-4', name: 'DPC Triennal 2023-2025', category: 'dpc', obtainedDate: '2024-11-20', isValid: true }
    ]
  },
  {
    id: 'emp-2',
    firstName: 'Sophie',
    lastName: 'Mercier',
    role: 'adjoint_docteur',
    roleLabel: 'Pharmacienne Adjointe (Docteur)',
    isPharmacistDoctor: true,
    rppsNumber: '10109283452',
    contractType: 'CDI',
    weeklyHours: 35,
    coefficient: 500,
    grossMonthlySalary: 3950,
    entryDate: '2020-09-01',
    email: 's.mercier@pharmacie-centrale.fr',
    phone: '06 87 65 43 21',
    avatarBg: 'bg-teal-600',
    avatarInitials: 'SM',
    paidLeavesBalance: 16.5,
    paidLeavesAcquired: 25.0,
    rttBalance: 6.0,
    overtimeHoursBalance: 4.5,
    lastMedicalCheckupDate: '2024-11-10',
    nextMedicalCheckupDueDate: '2026-11-10',
    medicalCheckupStatus: 'valide',
    lastAnnualReviewDate: '2025-12-05',
    nextAnnualReviewDueDate: '2026-12-05',
    dpcTriennalStatus: 'conforme',
    activeStatus: 'actif',
    certifications: [
      { id: 'c-5', name: 'Vaccination Grippe, Covid, HPV & Rappels', category: 'vaccination', obtainedDate: '2021-09-15', isValid: true },
      { id: 'c-6', name: 'TROD Angine / Cystite & Dispensation Guidée', category: 'trod', obtainedDate: '2024-04-20', isValid: true },
      { id: 'c-7', name: 'Entretiens Oncologie & AOD', category: 'bilan_medication', obtainedDate: '2023-06-10', isValid: true }
    ]
  },
  {
    id: 'emp-3',
    firstName: 'Thomas',
    lastName: 'Leroy',
    role: 'preparateur',
    roleLabel: 'Préparateur Breveté (Coordonnateur)',
    isPharmacistDoctor: false,
    contractType: 'CDI',
    weeklyHours: 35,
    coefficient: 330,
    grossMonthlySalary: 2650,
    entryDate: '2018-02-15',
    email: 't.leroy@pharmacie-centrale.fr',
    phone: '06 33 22 11 00',
    avatarBg: 'bg-indigo-600',
    avatarInitials: 'TL',
    paidLeavesBalance: 8.0,
    paidLeavesAcquired: 25.0,
    rttBalance: 2.0,
    overtimeHoursBalance: 7.0,
    lastMedicalCheckupDate: '2024-03-12',
    nextMedicalCheckupDueDate: '2026-03-12',
    medicalCheckupStatus: 'valide',
    lastAnnualReviewDate: '2026-02-14',
    nextAnnualReviewDueDate: '2027-02-14',
    dpcTriennalStatus: 'conforme',
    activeStatus: 'actif',
    certifications: [
      { id: 'c-8', name: 'Sauveteur Secouriste du Travail (SST)', category: 'sst', obtainedDate: '2024-05-10', expiryDate: '2026-05-10', isValid: true },
      { id: 'c-9', name: 'Orthopédie & Contention Veineuse', category: 'orthopedie', obtainedDate: '2022-10-05', isValid: true },
      { id: 'c-10', name: 'Gestion des Stupéfiants & Traçabilité LGO', category: 'dpc', obtainedDate: '2023-11-12', isValid: true }
    ]
  },
  {
    id: 'emp-4',
    firstName: 'Camille',
    lastName: 'Dubois',
    role: 'preparateur',
    roleLabel: 'Préparatrice en Pharmacie',
    isPharmacistDoctor: false,
    contractType: 'CDI',
    weeklyHours: 28, // Temps partiel 80%
    coefficient: 280,
    grossMonthlySalary: 1980,
    entryDate: '2022-01-10',
    email: 'c.dubois@pharmacie-centrale.fr',
    phone: '06 44 55 66 77',
    avatarBg: 'bg-purple-600',
    avatarInitials: 'CD',
    paidLeavesBalance: 14.0,
    paidLeavesAcquired: 20.0,
    rttBalance: 0,
    overtimeHoursBalance: 2.0,
    lastMedicalCheckupDate: '2023-09-18',
    nextMedicalCheckupDueDate: '2025-09-18',
    medicalCheckupStatus: 'a_planifier',
    lastAnnualReviewDate: '2025-11-20',
    nextAnnualReviewDueDate: '2026-11-20',
    dpcTriennalStatus: 'en_cours',
    activeStatus: 'actif',
    certifications: [
      { id: 'c-11', name: 'Dermo-cosmétique & Conseil Phytothérapie', category: 'dpc', obtainedDate: '2023-04-18', isValid: true },
      { id: 'c-12', name: 'Contention Médicale & Compression', category: 'orthopedie', obtainedDate: '2024-02-10', isValid: true }
    ]
  },
  {
    id: 'emp-5',
    firstName: 'Hugo',
    lastName: 'Bertrand',
    role: 'etudiant_6e_annee',
    roleLabel: 'Étudiant 6e Année (Remplacement)',
    isPharmacistDoctor: false, // Thèse en cours
    contractType: 'CDD',
    weeklyHours: 35,
    coefficient: 300,
    grossMonthlySalary: 2250,
    entryDate: '2026-06-01',
    email: 'h.bertrand@pharmacie-centrale.fr',
    phone: '06 99 88 77 66',
    avatarBg: 'bg-cyan-600',
    avatarInitials: 'HB',
    paidLeavesBalance: 5.0,
    paidLeavesAcquired: 5.0,
    rttBalance: 0,
    overtimeHoursBalance: 0,
    lastMedicalCheckupDate: '2026-06-05',
    nextMedicalCheckupDueDate: '2028-06-05',
    medicalCheckupStatus: 'valide',
    lastAnnualReviewDate: undefined,
    nextAnnualReviewDueDate: '2026-12-01',
    dpcTriennalStatus: 'conforme',
    activeStatus: 'actif',
    certifications: [
      { id: 'c-13', name: 'Certificat de Remplacement Ordre', category: 'dpc', obtainedDate: '2026-05-25', isValid: true },
      { id: 'c-14', name: 'Habilitation Vaccination & TROD', category: 'vaccination', obtainedDate: '2025-11-10', isValid: true }
    ]
  },
  {
    id: 'emp-6',
    firstName: 'Sarah',
    lastName: 'Khelifi',
    role: 'apprenti',
    roleLabel: 'Apprentie DEUST / BP 2e Année',
    isPharmacistDoctor: false,
    contractType: 'Apprentissage',
    weeklyHours: 35, // Alternance CFA
    coefficient: 240,
    grossMonthlySalary: 1420,
    entryDate: '2024-09-01',
    email: 's.khelifi@pharmacie-centrale.fr',
    phone: '06 55 44 33 22',
    avatarBg: 'bg-amber-600',
    avatarInitials: 'SK',
    paidLeavesBalance: 10.0,
    paidLeavesAcquired: 25.0,
    rttBalance: 0,
    overtimeHoursBalance: 0,
    lastMedicalCheckupDate: '2024-10-02',
    nextMedicalCheckupDueDate: '2026-10-02',
    medicalCheckupStatus: 'valide',
    lastAnnualReviewDate: '2026-01-20',
    nextAnnualReviewDueDate: '2026-09-01',
    dpcTriennalStatus: 'en_cours',
    activeStatus: 'formation',
    certifications: [
      { id: 'c-15', name: 'Formation Hygiène & Bonnes Pratiques de Préparation', category: 'dpc', obtainedDate: '2025-01-15', isValid: true }
    ]
  },
  {
    id: 'emp-7',
    firstName: 'Lucas',
    lastName: 'Tissier',
    role: 'rayonniste_conditionneur',
    roleLabel: 'Rayonniste & Réceptionnaire Stock',
    isPharmacistDoctor: false,
    contractType: 'CDI',
    weeklyHours: 35,
    coefficient: 160,
    grossMonthlySalary: 1820,
    entryDate: '2023-03-01',
    email: 'l.tissier@pharmacie-centrale.fr',
    phone: '06 11 22 33 44',
    avatarBg: 'bg-slate-600',
    avatarInitials: 'LT',
    paidLeavesBalance: 15.0,
    paidLeavesAcquired: 25.0,
    rttBalance: 1.0,
    overtimeHoursBalance: 1.5,
    lastMedicalCheckupDate: '2023-04-10',
    nextMedicalCheckupDueDate: '2025-04-10',
    medicalCheckupStatus: 'a_planifier',
    lastAnnualReviewDate: '2026-03-05',
    nextAnnualReviewDueDate: '2027-03-05',
    dpcTriennalStatus: 'conforme',
    activeStatus: 'actif',
    certifications: [
      { id: 'c-16', name: 'Sécurité Réception Grossiste & Gestion Chaîne du Froid', category: 'sst', obtainedDate: '2023-05-12', isValid: true }
    ]
  }
];

// Semaine courante (24 au 30 Août 2026)
export const MOCK_WORK_SHIFTS: WorkShift[] = [
  // Lundi 24 Août 2026
  { id: 'sh-1', employeeId: 'emp-1', date: '2026-08-24', startTime: '08:30', endTime: '19:30', breakMinutes: 60, totalHours: 10, shiftType: 'journee', isDoctorOnDuty: true, notes: 'Ouverture & Titulaire référent' },
  { id: 'sh-2', employeeId: 'emp-2', date: '2026-08-24', startTime: '09:00', endTime: '18:00', breakMinutes: 60, totalHours: 8, shiftType: 'journee', isDoctorOnDuty: true, notes: 'Vaccinations & Comptoir' },
  { id: 'sh-3', employeeId: 'emp-3', date: '2026-08-24', startTime: '08:30', endTime: '17:00', breakMinutes: 60, totalHours: 7.5, shiftType: 'matin', isDoctorOnDuty: false, notes: 'Commandes directes & Délivrance' },
  { id: 'sh-4', employeeId: 'emp-4', date: '2026-08-24', startTime: '13:30', endTime: '19:30', breakMinutes: 0, totalHours: 6, shiftType: 'apres_midi', isDoctorOnDuty: false, notes: 'Comptoir & Ordonnancier' },
  { id: 'sh-5', employeeId: 'emp-7', date: '2026-08-24', startTime: '08:30', endTime: '16:30', breakMinutes: 60, totalHours: 7, shiftType: 'journee', isDoctorOnDuty: false, notes: 'Réception bacs OCP 08h45 + Rangement' },

  // Mardi 25 Août 2026
  { id: 'sh-6', employeeId: 'emp-1', date: '2026-08-25', startTime: '08:30', endTime: '19:30', breakMinutes: 60, totalHours: 10, shiftType: 'journee', isDoctorOnDuty: true, notes: 'Gestion administrative & Comptoir' },
  { id: 'sh-7', employeeId: 'emp-2', date: '2026-08-25', startTime: '08:30', endTime: '14:30', breakMinutes: 30, totalHours: 5.5, shiftType: 'matin', isDoctorOnDuty: true },
  { id: 'sh-8', employeeId: 'emp-3', date: '2026-08-25', startTime: '10:00', endTime: '19:30', breakMinutes: 60, totalHours: 8.5, shiftType: 'apres_midi', isDoctorOnDuty: false },
  { id: 'sh-9', employeeId: 'emp-5', date: '2026-08-25', startTime: '09:00', endTime: '18:00', breakMinutes: 60, totalHours: 8, shiftType: 'journee', isDoctorOnDuty: false, notes: 'Comptoir encadré' },
  { id: 'sh-10', employeeId: 'emp-7', date: '2026-08-25', startTime: '08:30', endTime: '16:30', breakMinutes: 60, totalHours: 7, shiftType: 'journee', isDoctorOnDuty: false },

  // Mercredi 26 Août 2026
  { id: 'sh-11', employeeId: 'emp-2', date: '2026-08-26', startTime: '08:30', endTime: '19:30', breakMinutes: 60, totalHours: 10, shiftType: 'journee', isDoctorOnDuty: true, notes: 'Pharmacien de référence (Titulaire en gestion externe)' },
  { id: 'sh-12', employeeId: 'emp-3', date: '2026-08-26', startTime: '08:30', endTime: '17:00', breakMinutes: 60, totalHours: 7.5, shiftType: 'journee', isDoctorOnDuty: false },
  { id: 'sh-13', employeeId: 'emp-4', date: '2026-08-26', startTime: '09:00', endTime: '19:00', breakMinutes: 60, totalHours: 9, shiftType: 'journee', isDoctorOnDuty: false },
  { id: 'sh-14', employeeId: 'emp-5', date: '2026-08-26', startTime: '13:30', endTime: '19:30', breakMinutes: 0, totalHours: 6, shiftType: 'apres_midi', isDoctorOnDuty: false },
  { id: 'sh-15', employeeId: 'emp-7', date: '2026-08-26', startTime: '08:30', endTime: '16:30', breakMinutes: 60, totalHours: 7, shiftType: 'journee', isDoctorOnDuty: false },

  // Jeudi 27 Août 2026 (Aujourd'hui)
  { id: 'sh-16', employeeId: 'emp-1', date: '2026-08-27', startTime: '08:30', endTime: '19:30', breakMinutes: 60, totalHours: 10, shiftType: 'journee', isDoctorOnDuty: true, notes: 'Présent • Bilan de médication 14h' },
  { id: 'sh-17', employeeId: 'emp-2', date: '2026-08-27', startTime: '08:30', endTime: '19:30', breakMinutes: 60, totalHours: 10, shiftType: 'journee', isDoctorOnDuty: true, notes: 'Présente • Dépistages TROD' },
  { id: 'sh-18', employeeId: 'emp-3', date: '2026-08-27', startTime: '08:30', endTime: '16:30', breakMinutes: 60, totalHours: 7, shiftType: 'journee', isDoctorOnDuty: false, notes: 'Contrôle réceptions directes' },
  { id: 'sh-19', employeeId: 'emp-4', date: '2026-08-27', startTime: '12:00', endTime: '19:30', breakMinutes: 30, totalHours: 7, shiftType: 'apres_midi', isDoctorOnDuty: false },
  { id: 'sh-20', employeeId: 'emp-5', date: '2026-08-27', startTime: '09:00', endTime: '18:00', breakMinutes: 60, totalHours: 8, shiftType: 'journee', isDoctorOnDuty: false },
  { id: 'sh-21', employeeId: 'emp-7', date: '2026-08-27', startTime: '08:30', endTime: '16:30', breakMinutes: 60, totalHours: 7, shiftType: 'journee', isDoctorOnDuty: false },

  // Vendredi 28 Août 2026
  { id: 'sh-22', employeeId: 'emp-1', date: '2026-08-28', startTime: '08:30', endTime: '19:30', breakMinutes: 60, totalHours: 10, shiftType: 'journee', isDoctorOnDuty: true },
  { id: 'sh-23', employeeId: 'emp-2', date: '2026-08-28', startTime: '09:00', endTime: '18:00', breakMinutes: 60, totalHours: 8, shiftType: 'journee', isDoctorOnDuty: true },
  { id: 'sh-24', employeeId: 'emp-3', date: '2026-08-28', startTime: '08:30', endTime: '17:00', breakMinutes: 60, totalHours: 7.5, shiftType: 'matin', isDoctorOnDuty: false },
  { id: 'sh-25', employeeId: 'emp-4', date: '2026-08-28', startTime: '13:30', endTime: '19:30', breakMinutes: 0, totalHours: 6, shiftType: 'apres_midi', isDoctorOnDuty: false },
  { id: 'sh-26', employeeId: 'emp-7', date: '2026-08-28', startTime: '08:30', endTime: '16:30', breakMinutes: 60, totalHours: 7, shiftType: 'journee', isDoctorOnDuty: false },

  // Samedi 29 Août 2026 (Ouverture 08h30 - 19h00)
  { id: 'sh-27', employeeId: 'emp-2', date: '2026-08-29', startTime: '08:30', endTime: '19:00', breakMinutes: 60, totalHours: 9.5, shiftType: 'journee', isDoctorOnDuty: true, notes: 'Pharmacien responsable du samedi' },
  { id: 'sh-28', employeeId: 'emp-3', date: '2026-08-29', startTime: '08:30', endTime: '19:00', breakMinutes: 60, totalHours: 9.5, shiftType: 'journee', isDoctorOnDuty: false },
  { id: 'sh-29', employeeId: 'emp-5', date: '2026-08-29', startTime: '09:00', endTime: '17:30', breakMinutes: 30, totalHours: 8, shiftType: 'journee', isDoctorOnDuty: false },

  // Dimanche 30 Août 2026 (Garde d'Urgence de Secteur)
  { id: 'sh-30', employeeId: 'emp-1', date: '2026-08-30', startTime: '09:00', endTime: '20:00', breakMinutes: 60, totalHours: 10, shiftType: 'garde_dimanche', isDoctorOnDuty: true, notes: 'GARDE DE SECTEUR OFFICIELLE • Ouverture guichet de garde' },
  { id: 'sh-31', employeeId: 'emp-3', date: '2026-08-30', startTime: '09:00', endTime: '19:00', breakMinutes: 60, totalHours: 9, shiftType: 'garde_dimanche', isDoctorOnDuty: false, notes: 'Soutien garde dimanche (Heures majorées +25% conventionnelles)' }
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr-1',
    employeeId: 'emp-3',
    employeeName: 'Thomas Leroy',
    employeeRole: 'Préparateur Breveté',
    leaveType: 'conges_payes',
    startDate: '2026-09-07',
    endDate: '2026-09-19',
    daysCount: 11,
    status: 'en_attente',
    requestedAt: '2026-08-20',
    reason: 'Congés annuels d\'arrière-saison (solde CP été)',
    replacementEmployeeId: 'emp-5'
  },
  {
    id: 'lr-2',
    employeeId: 'emp-4',
    employeeName: 'Camille Dubois',
    employeeRole: 'Préparatrice en Pharmacie',
    leaveType: 'rtt',
    startDate: '2026-09-02',
    endDate: '2026-09-02',
    daysCount: 1,
    status: 'en_attente',
    requestedAt: '2026-08-25',
    reason: 'Rentrée scolaire enfants'
  },
  {
    id: 'lr-3',
    employeeId: 'emp-2',
    employeeName: 'Sophie Mercier',
    employeeRole: 'Pharmacienne Adjointe',
    leaveType: 'formation_dpc',
    startDate: '2026-09-24',
    endDate: '2026-09-25',
    daysCount: 2,
    status: 'valide',
    requestedAt: '2026-07-15',
    decisionDate: '2026-07-16',
    decisionComment: 'Formation DPC ANDPC validée (Prise en charge OPCO)',
    reason: 'Formation DPC : Nouvelle convention pharmaceutique & Prescriptions d\'antibiotiques'
  },
  {
    id: 'lr-4',
    employeeId: 'emp-7',
    employeeName: 'Lucas Tissier',
    employeeRole: 'Rayonniste',
    leaveType: 'conges_payes',
    startDate: '2026-08-10',
    endDate: '2026-08-22',
    daysCount: 10,
    status: 'valide',
    requestedAt: '2026-06-01',
    decisionDate: '2026-06-03',
    decisionComment: 'Validé en accord de planning estival'
  }
];

export const MOCK_OVERTIME_LOGS: OvertimeLog[] = [
  {
    id: 'ot-1',
    employeeId: 'emp-3',
    employeeName: 'Thomas Leroy',
    weekLabel: 'Semaine 34 (17-23 Août)',
    contractHours: 35,
    actualWorkedHours: 39.5,
    deltaHours: +4.5,
    status: 'valide_recup',
    justification: 'Remplacement pic d\'affluence estival + inventaire partiel'
  },
  {
    id: 'ot-2',
    employeeId: 'emp-2',
    employeeName: 'Sophie Mercier',
    weekLabel: 'Semaine 33 (10-16 Août)',
    contractHours: 35,
    actualWorkedHours: 38.0,
    deltaHours: +3.0,
    status: 'valide_recup',
    justification: 'Campagne de dépistage TROD angines non programmée'
  },
  {
    id: 'ot-3',
    employeeId: 'emp-4',
    employeeName: 'Camille Dubois',
    weekLabel: 'Semaine 34 (17-23 Août)',
    contractHours: 28,
    actualWorkedHours: 30.0,
    deltaHours: +2.0,
    status: 'en_attente',
    justification: 'Clôture télétransmissions et rejet Noémie en fin de journée'
  }
];

export const MOCK_TRAINING_PLANS: TrainingDpcPlan[] = [
  {
    id: 'tp-1',
    employeeId: 'emp-2',
    employeeName: 'Sophie Mercier',
    title: 'Prescription & Délivrance sous Protocole (Angine / Cystite)',
    provider: 'ANDPC / UTIP',
    category: 'TROD',
    plannedDate: '2026-09-24',
    durationHours: 14,
    costHt: 580,
    isOpcoFunded: true,
    status: 'prevu'
  },
  {
    id: 'tp-2',
    employeeId: 'emp-3',
    employeeName: 'Thomas Leroy',
    title: 'Recyclage Maintien des Acquis SST (Secourisme)',
    provider: 'Croix-Rouge Compétence',
    category: 'SST',
    plannedDate: '2026-10-15',
    durationHours: 7,
    costHt: 220,
    isOpcoFunded: true,
    status: 'prevu'
  },
  {
    id: 'tp-3',
    employeeId: 'emp-4',
    employeeName: 'Camille Dubois',
    title: 'Accompagnement du Patient Diabétique & Nouvelles Insulines',
    provider: 'Le Moniteur Formation',
    category: 'Entretien pharmaceutique',
    plannedDate: '2026-11-05',
    durationHours: 8,
    costHt: 350,
    isOpcoFunded: true,
    status: 'prevu'
  },
  {
    id: 'tp-4',
    employeeId: 'emp-1',
    employeeName: 'Alexandre Vidal',
    title: 'Management Bienveillant & Optimisation du Climat Social en Officine',
    provider: 'Pharmagest Academy',
    category: 'Management',
    plannedDate: '2026-12-02',
    durationHours: 14,
    costHt: 890,
    isOpcoFunded: false,
    status: 'prevu'
  }
];

export const MOCK_HR_SUMMARY: HrPayrollSummary = {
  totalEmployeesCount: 7,
  totalEtp: 6.2, // Alexandre (1.0) + Sophie (1.0) + Thomas (1.0) + Camille (0.8) + Hugo (1.0) + Sarah (0.6) + Lucas (1.0)
  pharmacistsEtp: 2.0,
  preparatorsEtp: 1.8,
  otherStaffEtp: 2.4,
  totalGrossPayrollMonthly: 20270,
  totalPatronalChargesMonthly: 8918, // ~44% de charges sociales patronales
  totalCostMonthly: 29188,
  annualizedTotalCost: 350256,
  payrollOverRevenuePct: 10.8, // 10.8% du CA HT (Cible d'officine saine entre 10% et 12%)
  revenuePerEtpHt: 301450, // CA HT annuel / ETP (~300k€ par ETP en officine)
  averageHourlyCost: 29.40
};

// Blank / Zero datasets for reset or clean slate mode
export const BLANK_EMPLOYEES: Employee[] = [];
export const BLANK_WORK_SHIFTS: WorkShift[] = [];
export const BLANK_LEAVE_REQUESTS: LeaveRequest[] = [];
export const BLANK_OVERTIME_LOGS: OvertimeLog[] = [];
export const BLANK_TRAINING_PLANS: TrainingDpcPlan[] = [];
export const BLANK_HR_SUMMARY: HrPayrollSummary = {
  totalEmployeesCount: 0,
  totalEtp: 0,
  pharmacistsEtp: 0,
  preparatorsEtp: 0,
  otherStaffEtp: 0,
  totalGrossPayrollMonthly: 0,
  totalPatronalChargesMonthly: 0,
  totalCostMonthly: 0,
  annualizedTotalCost: 0,
  payrollOverRevenuePct: 0,
  revenuePerEtpHt: 0,
  averageHourlyCost: 0
};

