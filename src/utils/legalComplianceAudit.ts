import { Employee, WorkShift } from '../types/hr';

export type ComplianceSeverity = 'danger' | 'warning' | 'info';

export type ComplianceViolationType = 
  | 'OVERLAP'                      // Conflit de chevauchement d'horaires sur un même salarié
  | 'MAX_DAILY_HOURS'              // Dépassement durée quotidienne légale (> 10h / art. L. 3121-18)
  | 'MAX_WEEKLY_HOURS_ABSOLUTE'    // Dépassement plafond hebdomadaire absolu (> 48h / art. L. 3121-20)
  | 'MAX_WEEKLY_HOURS_AVERAGE'     // Dépassement plafond moyen (> 44h / art. L. 3121-22)
  | 'DAILY_REST_DEFICIT'           // Repos quotidien insuffisant (< 11h consécutives / art. L. 3131-1)
  | 'DAILY_AMPLITUDE_EXCEEDED'     // Amplitude journalière excessive (> 13h)
  | 'MANDATORY_BREAK_MISSING'      // Absence de pause obligatoire (≥ 6h consécutives sans min 20 min / art. L. 3121-16)
  | 'CSP_PHARMACIST_MISSING'       // Absence de pharmacien thésé sur la journée d'ouverture (CSP L. 5125-21)
  | 'OVERTIME_CONTRACT_ALERT';     // Dépassement contractuel important (> 10% d'heures complémentaires)

export interface ComplianceAlert {
  id: string;
  type: ComplianceViolationType;
  severity: ComplianceSeverity;
  title: string;
  description: string;
  legalReference: string; // Référence légale / Convention collective
  employeeId?: string;
  employeeName?: string;
  shiftId?: string;
  conflictShiftId?: string;
  date?: string; // YYYY-MM-DD
  affectedDates?: string[];
  metricValue?: number;
  metricLimit?: number;
  metricUnit?: string;
  actionRecommendation: string;
}

// Convertit une chaîne "HH:mm" en minutes depuis 00:00
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

// Convertit des minutes en format "XhYY" ou "Xh"
export const minutesToFormattedTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
};

/**
 * Moteur d'audit légal du Code du Travail & Convention Collective Pharmacie d'Officine (IDCC 1996)
 * Analyse l'ensemble des créneaux sur une liste de jours donnés.
 */
export const auditScheduleCompliance = (
  shifts: WorkShift[],
  employees: Employee[],
  weekDates: string[]
): {
  alerts: ComplianceAlert[];
  shiftAlertMap: Record<string, ComplianceAlert[]>; // shiftId -> list of alerts
  employeeAlertMap: Record<string, ComplianceAlert[]>; // empId -> list of alerts
  dayAlertMap: Record<string, ComplianceAlert[]>; // date -> list of alerts
  complianceScore: number; // 0 à 100%
  criticalCount: number;
  warningCount: number;
} => {
  const alerts: ComplianceAlert[] = [];
  const shiftAlertMap: Record<string, ComplianceAlert[]> = {};
  const employeeAlertMap: Record<string, ComplianceAlert[]> = {};
  const dayAlertMap: Record<string, ComplianceAlert[]> = {};

  const addAlert = (alert: ComplianceAlert) => {
    alerts.push(alert);

    if (alert.shiftId) {
      if (!shiftAlertMap[alert.shiftId]) shiftAlertMap[alert.shiftId] = [];
      shiftAlertMap[alert.shiftId].push(alert);
    }
    if (alert.conflictShiftId) {
      if (!shiftAlertMap[alert.conflictShiftId]) shiftAlertMap[alert.conflictShiftId] = [];
      shiftAlertMap[alert.conflictShiftId].push(alert);
    }
    if (alert.employeeId) {
      if (!employeeAlertMap[alert.employeeId]) employeeAlertMap[alert.employeeId] = [];
      employeeAlertMap[alert.employeeId].push(alert);
    }
    if (alert.date) {
      if (!dayAlertMap[alert.date]) dayAlertMap[alert.date] = [];
      dayAlertMap[alert.date].push(alert);
    }
    if (alert.affectedDates) {
      alert.affectedDates.forEach(d => {
        if (!dayAlertMap[d]) dayAlertMap[d] = [];
        dayAlertMap[d].push(alert);
      });
    }
  };

  const empMap = new Map<string, Employee>(employees.map(e => [e.id, e]));

  // 1. AUDIT PAR COLLABORATEUR ET PAR JOUR (Chevauchements, Durée Max Jour 10h, Pause 20min, Amplitude 13h)
  employees.forEach(emp => {
    // Calcul hebdomadaire total sur les dates de la semaine
    const empWeekShifts = shifts.filter(s => s.employeeId === emp.id && weekDates.includes(s.date));
    const totalWeeklyHours = empWeekShifts.reduce((acc, s) => acc + s.totalHours, 0);

    // Règle A : Dépassement Durée Hebdomadaire Absolue (> 48h)
    if (totalWeeklyHours > 48) {
      addAlert({
        id: `alt-week-max-48-${emp.id}`,
        type: 'MAX_WEEKLY_HOURS_ABSOLUTE',
        severity: 'danger',
        title: `Dépassement du plafond hebdomadaire absolu (48h)`,
        description: `${emp.firstName} ${emp.lastName} est planifié(e) à ${totalWeeklyHours}h sur la semaine, soit un dépassement de ${(totalWeeklyHours - 48).toFixed(1)}h au-dessus du plafond légal strict de 48 heures.`,
        legalReference: 'Art. L. 3121-20 du Code du Travail & IDCC 1996',
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        metricValue: totalWeeklyHours,
        metricLimit: 48,
        metricUnit: 'heures',
        actionRecommendation: 'Réduire les créneaux ou déléguer un shift pour ramener le total hebdomadaire sous 48h.'
      });
    } else if (totalWeeklyHours > 44) {
      // Règle B : Dépassement Seuil Moyen (> 44h)
      addAlert({
        id: `alt-week-max-44-${emp.id}`,
        type: 'MAX_WEEKLY_HOURS_AVERAGE',
        severity: 'warning',
        title: `Seuil hebdomadaire de vigilance dépassé (44h)`,
        description: `${emp.firstName} ${emp.lastName} est planifié(e) à ${totalWeeklyHours}h. La durée moyenne ne peut dépasser 44h sur 12 semaines consécutives.`,
        legalReference: 'Art. L. 3121-22 du Code du Travail',
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        metricValue: totalWeeklyHours,
        metricLimit: 44,
        metricUnit: 'heures',
        actionRecommendation: 'Contrôler la moyenne trimestrielle et planifier une récupération compensatrice.'
      });
    }

    // Règle C : Dépassement du contrat horaire (> 10% au-delà du contrat initial)
    if (emp.weeklyHours > 0 && totalWeeklyHours > emp.weeklyHours * 1.15 && totalWeeklyHours <= 44) {
      const extraHours = (totalWeeklyHours - emp.weeklyHours).toFixed(1);
      addAlert({
        id: `alt-contract-extra-${emp.id}`,
        type: 'OVERTIME_CONTRACT_ALERT',
        severity: 'info',
        title: `Volume important d'heures supplémentaires / complémentaires (+${extraHours}h)`,
        description: `${emp.firstName} ${emp.lastName} (contrat ${emp.weeklyHours}h) réalise ${totalWeeklyHours}h soit +${extraHours}h soumises à majoration légale de salaire (+25%).`,
        legalReference: 'Convention Collective Pharmacie d\'Officine (IDCC 1996 - Art. 13)',
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        metricValue: totalWeeklyHours,
        metricLimit: emp.weeklyHours,
        metricUnit: 'heures',
        actionRecommendation: 'Prévoir le paiement majoré ou l\'inscription au Compte Épargne Temps (CET).'
      });
    }

    // Audit jour par jour pour ce collaborateur
    weekDates.forEach((date, dayIdx) => {
      const dayShifts = shifts.filter(s => s.employeeId === emp.id && s.date === date);
      if (dayShifts.length === 0) return;

      const totalDayHours = dayShifts.reduce((acc, s) => acc + s.totalHours, 0);

      // Règle D : Durée maximale quotidienne de travail effectif (> 10h)
      const isGuardShift = dayShifts.some(s => s.shiftType === 'garde_dimanche' || s.shiftType === 'garde_nuit');
      const maxDailyAllowed = isGuardShift ? 12 : 10;

      if (totalDayHours > maxDailyAllowed) {
        dayShifts.forEach(shift => {
          addAlert({
            id: `alt-daily-max-${shift.id}`,
            type: 'MAX_DAILY_HOURS',
            severity: 'danger',
            title: `Durée quotidienne maximale dépassée (${totalDayHours}h / max ${maxDailyAllowed}h)`,
            description: `${emp.firstName} ${emp.lastName} cumule ${totalDayHours} heures de travail le ${date}, excédant la limite légale journalière de ${maxDailyAllowed}h.`,
            legalReference: 'Art. L. 3121-18 du Code du Travail & IDCC 1996',
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            shiftId: shift.id,
            date,
            metricValue: totalDayHours,
            metricLimit: maxDailyAllowed,
            metricUnit: 'heures',
            actionRecommendation: `Raccourcir la plage horaire pour ne pas dépasser ${maxDailyAllowed}h de travail effectif par jour.`
          });
        });
      }

      // Règle E : Détection de chevauchement d'horaires (Overlap) entre plusieurs shifts d'un même salarié
      if (dayShifts.length > 1) {
        for (let i = 0; i < dayShifts.length; i++) {
          for (let j = i + 1; j < dayShifts.length; j++) {
            const s1 = dayShifts[i];
            const s2 = dayShifts[j];

            const start1 = timeToMinutes(s1.startTime);
            const end1 = timeToMinutes(s1.endTime);
            const start2 = timeToMinutes(s2.startTime);
            const end2 = timeToMinutes(s2.endTime);

            // Vérifie si [start1, end1] et [start2, end2] se chevauchent
            if (start1 < end2 && start2 < end1) {
              addAlert({
                id: `alt-overlap-${s1.id}-${s2.id}`,
                type: 'OVERLAP',
                severity: 'danger',
                title: `Conflit de chevauchement d'horaires (${s1.startTime}-${s1.endTime} ⚡ ${s2.startTime}-${s2.endTime})`,
                description: `${emp.firstName} ${emp.lastName} a deux créneaux qui se superposent le ${date} entre ${s1.startTime}-${s1.endTime} et ${s2.startTime}-${s2.endTime}.`,
                legalReference: 'Règle physique d\'assignation des plages de travail',
                employeeId: emp.id,
                employeeName: `${emp.firstName} ${emp.lastName}`,
                shiftId: s1.id,
                conflictShiftId: s2.id,
                date,
                actionRecommendation: 'Modifier les heures de début ou de fin de l\'un des deux créneaux pour éliminer la superposition.'
              });
            }
          }
        }
      }

      // Règle F : Amplitude journalière maximale (> 13h)
      if (dayShifts.length > 0) {
        let minStart = 24 * 60;
        let maxEnd = 0;
        dayShifts.forEach(s => {
          minStart = Math.min(minStart, timeToMinutes(s.startTime));
          maxEnd = Math.max(maxEnd, timeToMinutes(s.endTime));
        });

        const amplitudeMinutes = maxEnd - minStart;
        const amplitudeHours = amplitudeMinutes / 60;
        if (amplitudeHours > 13) {
          addAlert({
            id: `alt-amplitude-${emp.id}-${date}`,
            type: 'DAILY_AMPLITUDE_EXCEEDED',
            severity: 'warning',
            title: `Amplitude journalière excessive (${amplitudeHours.toFixed(1)}h / max 13h)`,
            description: `L'amplitude entre la première prise de poste (${minutesToFormattedTime(minStart)}) et la fin de service (${minutesToFormattedTime(maxEnd)}) est de ${amplitudeHours.toFixed(1)}h, excédant les 13h autorisées.`,
            legalReference: 'Convention Collective Pharmacie d\'Officine (Amplitude max 13h)',
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            date,
            metricValue: amplitudeHours,
            metricLimit: 13,
            metricUnit: 'heures',
            actionRecommendation: 'Resserrer les coupures ou réaffecter l\'ouverture/fermeture à deux collaborateurs distincts.'
          });
        }
      }

      // Règle G : Pause obligatoire (si créneau continu ≥ 6h avec breakMinutes < 20)
      dayShifts.forEach(shift => {
        const durationMin = timeToMinutes(shift.endTime) - timeToMinutes(shift.startTime);
        if (durationMin >= 6 * 60 && (shift.breakMinutes || 0) < 20) {
          addAlert({
            id: `alt-break-${shift.id}`,
            type: 'MANDATORY_BREAK_MISSING',
            severity: 'warning',
            title: `Pause obligatoire manquante (Créneau de ${(durationMin / 60).toFixed(1)}h sans pause)`,
            description: `Le Code du travail impose une pause minimale de 20 minutes consécutives dès que le temps de travail quotidien atteint 6 heures.`,
            legalReference: 'Art. L. 3121-16 du Code du Travail',
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            shiftId: shift.id,
            date,
            metricValue: shift.breakMinutes || 0,
            metricLimit: 20,
            metricUnit: 'minutes',
            actionRecommendation: 'Enregistrer une pause d\'au moins 20 minutes (ou 1 heure de coupure repas) sur ce créneau.'
          });
        }
      });

      // Règle H : Repos quotidien de 11 heures consécutives entre Jour J et Jour J+1
      if (dayIdx < weekDates.length - 1) {
        const nextDate = weekDates[dayIdx + 1];
        const nextDayShifts = shifts.filter(s => s.employeeId === emp.id && s.date === nextDate);

        if (dayShifts.length > 0 && nextDayShifts.length > 0) {
          // Dernière heure de fin du jour J
          let latestEndToday = 0;
          let latestShiftToday: WorkShift | null = null;
          dayShifts.forEach(s => {
            const endMin = timeToMinutes(s.endTime);
            if (endMin > latestEndToday) {
              latestEndToday = endMin;
              latestShiftToday = s;
            }
          });

          // Première heure de début du jour J+1
          let earliestStartTomorrow = 24 * 60;
          let earliestShiftTomorrow: WorkShift | null = null;
          nextDayShifts.forEach(s => {
            const startMin = timeToMinutes(s.startTime);
            if (startMin < earliestStartTomorrow) {
              earliestStartTomorrow = startMin;
              earliestShiftTomorrow = s;
            }
          });

          // Temps de repos = (24h - latestEndToday) + earliestStartTomorrow
          const restMinutes = (24 * 60 - latestEndToday) + earliestStartTomorrow;
          const restHours = restMinutes / 60;

          if (restHours < 11) {
            addAlert({
              id: `alt-rest-11h-${emp.id}-${date}-${nextDate}`,
              type: 'DAILY_REST_DEFICIT',
              severity: 'danger',
              title: `Non-respect du repos quotidien légal de 11h (${restHours.toFixed(1)}h de repos)`,
              description: `${emp.firstName} ${emp.lastName} termine le ${date} à ${latestShiftToday?.endTime} et reprend le lendemain ${nextDate} à ${earliestShiftTomorrow?.startTime}, ne bénéficiant que de ${restHours.toFixed(1)}h de repos au lieu des 11h obligatoires.`,
              legalReference: 'Art. L. 3131-1 du Code du Travail & IDCC 1996',
              employeeId: emp.id,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              shiftId: latestShiftToday?.id,
              conflictShiftId: earliestShiftTomorrow?.id,
              date,
              affectedDates: [date, nextDate],
              metricValue: restHours,
              metricLimit: 11,
              metricUnit: 'heures',
              actionRecommendation: `Décaler la prise de poste le lendemain à au moins ${minutesToFormattedTime(latestEndToday + 11 * 60 - 24 * 60)} pour garantir 11h de repos.`
            });
          }
        }
      }
    });
  });

  // 2. AUDIT DE CONTINUITÉ PHARMACEUTIQUE CSP (Code de la Santé Publique L. 5125-21)
  // Vérifie pour chaque jour ouvré (du Lundi au Samedi) la présence d'au moins 1 Docteur en Pharmacie
  weekDates.forEach((date, index) => {
    // Si ce n'est pas le dimanche (jour de repos sauf garde officielle)
    const isSunday = index === 6;
    const dayShifts = shifts.filter(s => s.date === date);

    if (!isSunday || dayShifts.length > 0) {
      const doctorShifts = dayShifts.filter(s => s.isDoctorOnDuty);

      if (doctorShifts.length === 0 && dayShifts.length > 0) {
        addAlert({
          id: `alt-csp-missing-${date}`,
          type: 'CSP_PHARMACIST_MISSING',
          severity: 'danger',
          title: `Obligation CSP non respectée : Aucun pharmacien diplômé planifié`,
          description: `Des préparateurs ou employés sont planifiés le ${date}, mais aucun pharmacien titulaire ou adjoint thésé n'est inscrit au tableau de service. L'officine ne peut légalement ouvrir sans pharmacien.`,
          legalReference: 'Art. L. 5125-21 du Code de la Santé Publique (Présence effective du pharmacien)',
          date,
          actionRecommendation: 'Affecter en urgence le Titulaire ou un Pharmacien Adjoint (Dr.) sur cette journée d\'ouverture.'
        });
      }
    }
  });

  // 3. CALCUL DU SCORE DE CONFORMITÉ GLOBALE
  const criticalCount = alerts.filter(a => a.severity === 'danger').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  let complianceScore = 100;
  complianceScore -= (criticalCount * 15);
  complianceScore -= (warningCount * 5);
  complianceScore = Math.max(0, Math.min(100, complianceScore));

  return {
    alerts,
    shiftAlertMap,
    employeeAlertMap,
    dayAlertMap,
    complianceScore,
    criticalCount,
    warningCount
  };
};
