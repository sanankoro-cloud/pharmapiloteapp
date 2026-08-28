import { 
  SectorMonthlyBreakdown, 
  SectorAnnualGoal, 
  SectorGoalsGlobalSummary 
} from '../types/sectorGoals';

export const MOCK_SECTOR_MONTHLY_DATA: SectorMonthlyBreakdown[] = [
  {
    month: 'Jan',
    fullMonth: 'Janvier',
    monthIndex: 1,
    quarter: 'T1',
    medicamentsRealiseHt: 101500,
    medicamentsObjectifHt: 99000,
    medicamentsMargeHt: 26800,
    parapharmacieRealiseHt: 24800,
    parapharmacieObjectifHt: 26000,
    parapharmacieMargeHt: 9600,
    conseilsRealiseHt: 24700,
    conseilsObjectifHt: 23000,
    conseilsMargeHt: 11850,
    totalRealiseHt: 151000,
    totalObjectifHt: 148000,
    isProjected: false
  },
  {
    month: 'Fév',
    fullMonth: 'Février',
    monthIndex: 2,
    quarter: 'T1',
    medicamentsRealiseHt: 98200,
    medicamentsObjectifHt: 96000,
    medicamentsMargeHt: 25920,
    parapharmacieRealiseHt: 23900,
    parapharmacieObjectifHt: 25000,
    parapharmacieMargeHt: 9270,
    conseilsRealiseHt: 24400,
    conseilsObjectifHt: 22500,
    conseilsMargeHt: 11620,
    totalRealiseHt: 146500,
    totalObjectifHt: 143500,
    isProjected: false
  },
  {
    month: 'Mar',
    fullMonth: 'Mars',
    monthIndex: 3,
    quarter: 'T1',
    medicamentsRealiseHt: 102800,
    medicamentsObjectifHt: 101000,
    medicamentsMargeHt: 27140,
    parapharmacieRealiseHt: 25800,
    parapharmacieObjectifHt: 27000,
    parapharmacieMargeHt: 10010,
    conseilsRealiseHt: 25400,
    conseilsObjectifHt: 23500,
    conseilsMargeHt: 12100,
    totalRealiseHt: 154000,
    totalObjectifHt: 151500,
    isProjected: false
  },
  {
    month: 'Avr',
    fullMonth: 'Avril',
    monthIndex: 4,
    quarter: 'T2',
    medicamentsRealiseHt: 99400,
    medicamentsObjectifHt: 98000,
    medicamentsMargeHt: 26240,
    parapharmacieRealiseHt: 24600,
    parapharmacieObjectifHt: 26500,
    parapharmacieMargeHt: 9550,
    conseilsRealiseHt: 24200,
    conseilsObjectifHt: 23000,
    conseilsMargeHt: 11520,
    totalRealiseHt: 148200,
    totalObjectifHt: 147500,
    isProjected: false
  },
  {
    month: 'Mai',
    fullMonth: 'Mai',
    monthIndex: 5,
    quarter: 'T2',
    medicamentsRealiseHt: 102400,
    medicamentsObjectifHt: 100000,
    medicamentsMargeHt: 27030,
    parapharmacieRealiseHt: 26100,
    parapharmacieObjectifHt: 28500,
    parapharmacieMargeHt: 10130,
    conseilsRealiseHt: 25300,
    conseilsObjectifHt: 23500,
    conseilsMargeHt: 12040,
    totalRealiseHt: 153800,
    totalObjectifHt: 152000,
    isProjected: false
  },
  {
    month: 'Juin',
    fullMonth: 'Juin',
    monthIndex: 6,
    quarter: 'T2',
    medicamentsRealiseHt: 103200,
    medicamentsObjectifHt: 101000,
    medicamentsMargeHt: 27240,
    parapharmacieRealiseHt: 28400,
    parapharmacieObjectifHt: 31000,
    parapharmacieMargeHt: 11020,
    conseilsRealiseHt: 25600,
    conseilsObjectifHt: 24000,
    conseilsMargeHt: 12190,
    totalRealiseHt: 157200,
    totalObjectifHt: 156000,
    isProjected: false
  },
  {
    month: 'Juil',
    fullMonth: 'Juillet',
    monthIndex: 7,
    quarter: 'T3',
    medicamentsRealiseHt: 104500,
    medicamentsObjectifHt: 102000,
    medicamentsMargeHt: 27590,
    parapharmacieRealiseHt: 27200,
    parapharmacieObjectifHt: 32000,
    parapharmacieMargeHt: 10550,
    conseilsRealiseHt: 24785,
    conseilsObjectifHt: 23500,
    conseilsMargeHt: 11800,
    totalRealiseHt: 156485,
    totalObjectifHt: 157500,
    isProjected: false
  },
  {
    month: 'Août',
    fullMonth: 'Août (Réel)',
    monthIndex: 8,
    quarter: 'T3',
    medicamentsRealiseHt: 106500,
    medicamentsObjectifHt: 101000,
    medicamentsMargeHt: 28120,
    parapharmacieRealiseHt: 25000,
    parapharmacieObjectifHt: 28000,
    parapharmacieMargeHt: 9700,
    conseilsRealiseHt: 27020,
    conseilsObjectifHt: 25000,
    conseilsMargeHt: 12860,
    totalRealiseHt: 158520,
    totalObjectifHt: 154000,
    isProjected: false
  },
  {
    month: 'Sep',
    fullMonth: 'Septembre',
    monthIndex: 9,
    quarter: 'T3',
    medicamentsRealiseHt: 104000,
    medicamentsObjectifHt: 103000,
    medicamentsMargeHt: 27460,
    parapharmacieRealiseHt: 26500,
    parapharmacieObjectifHt: 27000,
    parapharmacieMargeHt: 10280,
    conseilsRealiseHt: 24500,
    conseilsObjectifHt: 24000,
    conseilsMargeHt: 11660,
    totalRealiseHt: 155000,
    totalObjectifHt: 154000,
    isProjected: true
  },
  {
    month: 'Oct',
    fullMonth: 'Octobre',
    monthIndex: 10,
    quarter: 'T4',
    medicamentsRealiseHt: 109000,
    medicamentsObjectifHt: 107000,
    medicamentsMargeHt: 28780,
    parapharmacieRealiseHt: 28000,
    parapharmacieObjectifHt: 28500,
    parapharmacieMargeHt: 10860,
    conseilsRealiseHt: 26000,
    conseilsObjectifHt: 25500,
    conseilsMargeHt: 12380,
    totalRealiseHt: 163000,
    totalObjectifHt: 161000,
    isProjected: true
  },
  {
    month: 'Nov',
    fullMonth: 'Novembre',
    monthIndex: 11,
    quarter: 'T4',
    medicamentsRealiseHt: 112000,
    medicamentsObjectifHt: 110000,
    medicamentsMargeHt: 29570,
    parapharmacieRealiseHt: 29000,
    parapharmacieObjectifHt: 29500,
    parapharmacieMargeHt: 11250,
    conseilsRealiseHt: 27000,
    conseilsObjectifHt: 26500,
    conseilsMargeHt: 12850,
    totalRealiseHt: 168000,
    totalObjectifHt: 166000,
    isProjected: true
  },
  {
    month: 'Déc',
    fullMonth: 'Décembre',
    monthIndex: 12,
    quarter: 'T4',
    medicamentsRealiseHt: 116000,
    medicamentsObjectifHt: 114000,
    medicamentsMargeHt: 30620,
    parapharmacieRealiseHt: 32500,
    parapharmacieObjectifHt: 33000,
    parapharmacieMargeHt: 12610,
    conseilsRealiseHt: 27500,
    conseilsObjectifHt: 27000,
    conseilsMargeHt: 13090,
    totalRealiseHt: 176000,
    totalObjectifHt: 174000,
    isProjected: true
  }
];

export const INITIAL_SECTOR_GOALS: Record<'medicaments' | 'parapharmacie' | 'conseils', SectorAnnualGoal> = {
  medicaments: {
    sectorKey: 'medicaments',
    label: 'Médicaments (Ordonnances & Éthique)',
    shortLabel: 'Médicaments',
    description: 'Prescription médicale, ALD, traitements chroniques et médicaments d\'intérêt thérapeutique majeur (TVA 2,1% & 5,5%). Marge réglementée avec honoraires de dispensation.',
    color: '#059669', // Emerald
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    iconName: 'Pill',
    tvaRates: '2,1% (Prescription) & 5,5% (DM)',
    annualGoalBudgetHt: 1220000,
    ytdGoalBudgetHt: 798000,
    ytdRealisedHt: 818500,
    achievementRatePct: 102.57,
    varianceAmountHt: 20500,
    variancePct: 2.57,
    averageMarginRatePct: 26.4,
    ytdMarginRealisedHt: 216080,
    actualMixSharePct: 66.06,
    targetMixSharePct: 65.95,
    yearEndProjectedLandingHt: 1259500,
    projectedLandingVarianceHt: 39500,
    subCategories: [
      {
        id: 'sub-med-chronique',
        name: 'Traitements Chroniques ALD & Cardio/Métabolique',
        shareInSectorPct: 48.5,
        realiseYtdHt: 396970,
        objectifYtdHt: 387000,
        achievementRatePct: 102.58,
        marginRatePct: 24.8,
        growthN1Pct: 4.8
      },
      {
        id: 'sub-med-aigus',
        name: 'Pathologies Aiguës & Antibiotiques/Pédiatrie',
        shareInSectorPct: 27.2,
        realiseYtdHt: 222630,
        objectifYtdHt: 217000,
        achievementRatePct: 102.59,
        marginRatePct: 28.2,
        growthN1Pct: 5.6
      },
      {
        id: 'sub-med-mitm',
        name: 'Médicaments d\'Intérêt Thérapeutique Majeur (MITM)',
        shareInSectorPct: 14.8,
        realiseYtdHt: 121140,
        objectifYtdHt: 118000,
        achievementRatePct: 102.66,
        marginRatePct: 21.5,
        growthN1Pct: 7.2
      },
      {
        id: 'sub-med-dm',
        name: 'Dispositifs Médicaux & Pansements Ordonnance',
        shareInSectorPct: 9.5,
        realiseYtdHt: 77760,
        objectifYtdHt: 76000,
        achievementRatePct: 102.32,
        marginRatePct: 35.1,
        growthN1Pct: 3.1
      }
    ],
    managerialInsights: {
      status: 'en_avance',
      statusLabel: 'Objectif Dépassé (+2,6%)',
      keyObservation: 'Activité ordonnances très soutenue, portée par la fidélisation des patients chroniques et l\'augmentation des honoraires de dispensation liés aux bilans partagés.',
      recommendedActions: [
        'Surveiller la disponibilité des MITM (insulines, corticoïdes) pour éviter les pertes de dispensation.',
        'Poursuivre le déploiement des entretiens pharmaceutiques et renouvellements ALD.',
        'Optimiser la gestion des stocks de sécurité sur les molécules à forte rotation.'
      ]
    }
  },
  parapharmacie: {
    sectorKey: 'parapharmacie',
    label: 'Parapharmacie & Dermo-Cosmétique',
    shortLabel: 'Parapharmacie',
    description: 'Soins dermo-cosmétiques, hygiène corporelle, gamme bébé, solaire et bucco-dentaire (TVA 20%). Forte marge commerciale libre et levier de fidélisation hors ordonnance.',
    color: '#3b82f6', // Blue
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-800 dark:text-blue-300',
    iconName: 'Sparkles',
    tvaRates: '20,0% (Standard)',
    annualGoalBudgetHt: 340000,
    ytdGoalBudgetHt: 224000,
    ytdRealisedHt: 215800,
    achievementRatePct: 96.34,
    varianceAmountHt: -8200,
    variancePct: -3.66,
    averageMarginRatePct: 38.8,
    ytdMarginRealisedHt: 83730,
    actualMixSharePct: 17.42,
    targetMixSharePct: 18.51,
    yearEndProjectedLandingHt: 331800,
    projectedLandingVarianceHt: -8200,
    subCategories: [
      {
        id: 'sub-para-dermo',
        name: 'Dermo-Cosmétique & Soins Visage / Anti-Âge',
        shareInSectorPct: 44.0,
        realiseYtdHt: 94950,
        objectifYtdHt: 98500,
        achievementRatePct: 96.40,
        marginRatePct: 41.5,
        growthN1Pct: 1.2
      },
      {
        id: 'sub-para-hygiene',
        name: 'Hygiène Corporelle & Soins Capillaires',
        shareInSectorPct: 24.5,
        realiseYtdHt: 52870,
        objectifYtdHt: 54800,
        achievementRatePct: 96.48,
        marginRatePct: 37.0,
        growthN1Pct: 2.4
      },
      {
        id: 'sub-para-bebe',
        name: 'Puériculture, Laits & Gamme Maternité/Bébé',
        shareInSectorPct: 19.5,
        realiseYtdHt: 42080,
        objectifYtdHt: 43600,
        achievementRatePct: 96.51,
        marginRatePct: 29.5,
        growthN1Pct: -0.8
      },
      {
        id: 'sub-para-solaire',
        name: 'Protection Solaire & Soins Saisonniers Été',
        shareInSectorPct: 12.0,
        realiseYtdHt: 25900,
        objectifYtdHt: 27100,
        achievementRatePct: 95.57,
        marginRatePct: 44.2,
        growthN1Pct: -4.5
      }
    ],
    managerialInsights: {
      status: 'sous_performance',
      statusLabel: 'En Retard (-3,7%)',
      keyObservation: 'Léger décrochage par rapport à l\'objectif budgété de début d\'année, principalement causé par le démarrage tardif de la saison solaire et la concurrence des discounters.',
      recommendedActions: [
        'Mettre en place une animation tête de gondole pour la rentrée (soins hydratants, anti-chute capillaire).',
        'Former l\'équipe de comptoir au cross-selling (conseil systématique d\'un soin hydratant/nettoyant lors de la dispensation d\'acné ou dermatologie).',
        'Vérifier les prix publics via le radar concurrentiel pour rester attractif sans dégrader la marge brute.'
      ]
    }
  },
  conseils: {
    sectorKey: 'conseils',
    label: 'Conseils, OTC & Micronutrition',
    shortLabel: 'Conseils & OTC',
    description: 'Automédication sans ordonnance, phytothérapie, aromathérapie, compléments alimentaires, premiers soins et actes de prévention/dépistage (TVA 10% & 20%). Plus fort taux de marge.',
    color: '#8b5cf6', // Violet
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    iconName: 'HeartPulse',
    tvaRates: '10,0% (OTC) & 20,0% (Phyto/Compléments)',
    annualGoalBudgetHt: 290000,
    ytdGoalBudgetHt: 188000,
    ytdRealisedHt: 204700,
    achievementRatePct: 108.88,
    varianceAmountHt: 16700,
    variancePct: 8.88,
    averageMarginRatePct: 47.6,
    ytdMarginRealisedHt: 97440,
    actualMixSharePct: 16.52,
    targetMixSharePct: 15.54,
    yearEndProjectedLandingHt: 318700,
    projectedLandingVarianceHt: 28700,
    subCategories: [
      {
        id: 'sub-conseil-otc',
        name: 'Médication Familiale & Premiers Secours (OTC)',
        shareInSectorPct: 42.0,
        realiseYtdHt: 85970,
        objectifYtdHt: 78960,
        achievementRatePct: 108.88,
        marginRatePct: 44.5,
        growthN1Pct: 8.5
      },
      {
        id: 'sub-conseil-micro',
        name: 'Compléments Alimentaires & Micronutrition',
        shareInSectorPct: 31.0,
        realiseYtdHt: 63460,
        objectifYtdHt: 58280,
        achievementRatePct: 108.89,
        marginRatePct: 52.0,
        growthN1Pct: 12.4
      },
      {
        id: 'sub-conseil-phyto',
        name: 'Phytothérapie, Aromathérapie & Herboristerie',
        shareInSectorPct: 16.0,
        realiseYtdHt: 32750,
        objectifYtdHt: 30080,
        achievementRatePct: 108.88,
        marginRatePct: 49.0,
        growthN1Pct: 9.1
      },
      {
        id: 'sub-conseil-actes',
        name: 'Vaccinations, Dépistages (TROD) & Entretiens',
        shareInSectorPct: 11.0,
        realiseYtdHt: 22520,
        objectifYtdHt: 20680,
        achievementRatePct: 108.90,
        marginRatePct: 75.0,
        growthN1Pct: 24.5
      }
    ],
    managerialInsights: {
      status: 'en_avance',
      statusLabel: 'Forte Surperformance (+8,9%)',
      keyObservation: 'Excellente dynamique de conseil au comptoir sur la micronutrition et les compléments d\'immunité. Les actes de vaccination et tests TROD génèrent une marge nette exceptionnelle.',
      recommendedActions: [
        'Capitaliser sur la rentrée avec les cures de magnésium, probiotiques et vitamines.',
        'Préparer la campagne vaccinale Grippe / Covid de l\'automne en stockant le matériel adéquat.',
        'Maintenir les formations continues de l\'équipe officinale pour pérenniser l\'expertise de conseil.'
      ]
    }
  }
};

export const getSectorGoalsGlobalSummary = (
  customGoals: Record<'medicaments' | 'parapharmacie' | 'conseils', SectorAnnualGoal> = INITIAL_SECTOR_GOALS,
  monthlyData: SectorMonthlyBreakdown[] = MOCK_SECTOR_MONTHLY_DATA
): SectorGoalsGlobalSummary => {
  const sectors = customGoals;
  
  const totalAnnualBudgetGoalHt = Object.values(sectors).reduce((sum, s) => sum + s.annualGoalBudgetHt, 0);
  const totalYtdBudgetGoalHt = Object.values(sectors).reduce((sum, s) => sum + s.ytdGoalBudgetHt, 0);
  const totalYtdRealisedHt = Object.values(sectors).reduce((sum, s) => sum + s.ytdRealisedHt, 0);
  
  const globalAchievementRatePct = totalYtdBudgetGoalHt > 0 
    ? (totalYtdRealisedHt / totalYtdBudgetGoalHt) * 100 
    : 100;
  
  const globalVarianceAmountHt = totalYtdRealisedHt - totalYtdBudgetGoalHt;
  const globalVariancePct = totalYtdBudgetGoalHt > 0 
    ? (globalVarianceAmountHt / totalYtdBudgetGoalHt) * 100 
    : 0;

  const totalYtdMarginHt = Object.values(sectors).reduce((sum, s) => sum + s.ytdMarginRealisedHt, 0);
  const globalAverageMarginPct = totalYtdRealisedHt > 0 
    ? (totalYtdMarginHt / totalYtdRealisedHt) * 100 
    : 0;

  const projectedAnnualLandingHt = Object.values(sectors).reduce((sum, s) => sum + s.yearEndProjectedLandingHt, 0);
  const projectedAnnualLandingMarginHt = Object.values(sectors).reduce((sum, s) => {
    return sum + (s.yearEndProjectedLandingHt * (s.averageMarginRatePct / 100));
  }, 0);

  return {
    year: '2026',
    asOfDate: '31 Août 2026 (Cumul 8 mois)',
    monthsElapsed: 8,
    totalAnnualBudgetGoalHt,
    totalYtdBudgetGoalHt,
    totalYtdRealisedHt,
    globalAchievementRatePct,
    globalVarianceAmountHt,
    globalVariancePct,
    totalYtdMarginHt,
    globalAverageMarginPct,
    projectedAnnualLandingHt,
    projectedAnnualLandingMarginHt,
    sectors,
    monthlyData
  };
};

export const BLANK_SECTOR_MONTHLY_DATA: SectorMonthlyBreakdown[] = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
].map((m, idx) => ({
  month: m,
  fullMonth: m,
  monthIndex: idx + 1,
  quarter: idx < 3 ? 'T1' : idx < 6 ? 'T2' : idx < 9 ? 'T3' : 'T4',
  medicamentsRealiseHt: 0,
  medicamentsObjectifHt: 0,
  medicamentsMargeHt: 0,
  parapharmacieRealiseHt: 0,
  parapharmacieObjectifHt: 0,
  parapharmacieMargeHt: 0,
  conseilsRealiseHt: 0,
  conseilsObjectifHt: 0,
  conseilsMargeHt: 0,
  totalRealiseHt: 0,
  totalObjectifHt: 0,
  isProjected: idx >= 8
}));

export const BLANK_SECTOR_GOALS: Record<'medicaments' | 'parapharmacie' | 'conseils', SectorAnnualGoal> = {
  medicaments: {
    ...INITIAL_SECTOR_GOALS.medicaments,
    annualGoalBudgetHt: 0,
    ytdGoalBudgetHt: 0,
    ytdRealisedHt: 0,
    achievementRatePct: 0,
    varianceAmountHt: 0,
    variancePct: 0,
    averageMarginRatePct: 0,
    ytdMarginRealisedHt: 0,
    actualMixSharePct: 0,
    targetMixSharePct: 0,
    yearEndProjectedLandingHt: 0,
    projectedLandingVarianceHt: 0,
    subCategories: []
  },
  parapharmacie: {
    ...INITIAL_SECTOR_GOALS.parapharmacie,
    annualGoalBudgetHt: 0,
    ytdGoalBudgetHt: 0,
    ytdRealisedHt: 0,
    achievementRatePct: 0,
    varianceAmountHt: 0,
    variancePct: 0,
    averageMarginRatePct: 0,
    ytdMarginRealisedHt: 0,
    actualMixSharePct: 0,
    targetMixSharePct: 0,
    yearEndProjectedLandingHt: 0,
    projectedLandingVarianceHt: 0,
    subCategories: []
  },
  conseils: {
    ...INITIAL_SECTOR_GOALS.conseils,
    annualGoalBudgetHt: 0,
    ytdGoalBudgetHt: 0,
    ytdRealisedHt: 0,
    achievementRatePct: 0,
    varianceAmountHt: 0,
    variancePct: 0,
    averageMarginRatePct: 0,
    ytdMarginRealisedHt: 0,
    actualMixSharePct: 0,
    targetMixSharePct: 0,
    yearEndProjectedLandingHt: 0,
    projectedLandingVarianceHt: 0,
    subCategories: []
  }
};

