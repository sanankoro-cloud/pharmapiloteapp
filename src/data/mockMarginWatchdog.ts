import { 
  CategoryMarginStatus, 
  CategoryMarginAnomaly, 
  LiveSalesTicket, 
  MarginWatchdogConfig,
  CustomMarginRule
} from '../types/marginWatchdog';

export const DEFAULT_CUSTOM_MARGIN_RULES: CustomMarginRule[] = [
  {
    id: 'rule-floor-15',
    name: 'Alerte Seuil Plancher Critique (< 15%)',
    description: 'Envoi d\'une alerte push prioritaire dès que la marge brute passe sous la barre critique de 15,0% sur les catégories de produits sélectionnées.',
    isEnabled: true,
    targetCategories: ['parapharmacie', 'veterinaire', 'medicament_otc', 'nutrition_bebe'],
    thresholdPct: 15.0,
    operator: 'less_than',
    actionChannels: {
      pushNotification: true,
      audioAlert: true,
      flashBanner: true,
      emailAlert: false
    },
    severity: 'critique',
    lastTriggeredAt: '24/08/2026 14:32:18',
    triggerCount: 3,
    createdAt: '2026-08-01'
  },
  {
    id: 'rule-floor-25-otc',
    name: 'Seuil Plancher Sécurité Conseil & OTC (< 25%)',
    description: 'Surveillance rapprochée de la médication familiale en libre accès pour éviter l\'érosion tarifaire face aux discounters.',
    isEnabled: true,
    targetCategories: ['medicament_otc'],
    thresholdPct: 25.0,
    operator: 'less_than',
    actionChannels: {
      pushNotification: true,
      audioAlert: false,
      flashBanner: true,
      emailAlert: false
    },
    severity: 'attention',
    lastTriggeredAt: '22/08/2026 11:15:00',
    triggerCount: 1,
    createdAt: '2026-08-10'
  },
  {
    id: 'rule-floor-35-para',
    name: 'Garde-Fou Dermo-Cosmétique & Hygiène (< 35%)',
    description: 'Alerte en cas de vente sous marge minimum de 35% sur les soins premium et gammes dermatologiques.',
    isEnabled: true,
    targetCategories: ['parapharmacie'],
    thresholdPct: 35.0,
    operator: 'less_than',
    actionChannels: {
      pushNotification: true,
      audioAlert: true,
      flashBanner: true,
      emailAlert: true
    },
    severity: 'critique',
    lastTriggeredAt: '24/08/2026 14:52:10',
    triggerCount: 5,
    createdAt: '2026-08-15'
  }
];

export const DEFAULT_WATCHDOG_CONFIG: MarginWatchdogConfig = {
  dropThresholdPoints: 5.0, // Alerte si chute > 5%
  alertCalculationMode: 'absolute_points',
  realtimeScanIntervalSec: 15,
  enableAudioAlerts: true,
  enableBrowserPush: true,
  autoRepriceSuggestions: true,
  notifyOnCounterOverDiscount: true,
  maxCounterDiscountAllowedPct: 5.0,
  designatedOfficerEmail: 'dr.camara@pharmacie-epau.fr'
};

export const BLANK_CATEGORY_MARGINS: CategoryMarginStatus[] = [
  {
    categoryId: 'medicament_remboursable',
    categoryName: 'Médicaments Remboursables (LGO / SESAM-Vitale)',
    categoryCode: 'RX-01',
    color: '#3b82f6',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300',
    iconName: 'Pill',
    description: 'Médicaments inscrits au tarif de responsabilité sécurité sociale.',
    caHtCurrentMonth: 0,
    margeHtCurrentMonth: 0,
    currentMarginRatePct: 0,
    m3MonthName: 'M-3',
    m3MarginRatePct: 0,
    m2MonthName: 'M-2',
    m2MarginRatePct: 0,
    m1MonthName: 'M-1',
    m1MarginRatePct: 0,
    movingAverage3mPct: 0,
    deltaPoints: 0,
    deltaRelativePct: 0,
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    anomalies: [],
    trendPoints: []
  },
  {
    categoryId: 'medicament_otc',
    categoryName: 'Médication Familiale & Conseil OTC',
    categoryCode: 'OTC-01',
    color: '#10b981',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300',
    iconName: 'HeartPulse',
    description: 'Automédication libre accès, antalgiques, ORL et compléments.',
    caHtCurrentMonth: 0,
    margeHtCurrentMonth: 0,
    currentMarginRatePct: 0,
    m3MonthName: 'M-3',
    m3MarginRatePct: 0,
    m2MonthName: 'M-2',
    m2MarginRatePct: 0,
    m1MonthName: 'M-1',
    m1MarginRatePct: 0,
    movingAverage3mPct: 0,
    deltaPoints: 0,
    deltaRelativePct: 0,
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    anomalies: [],
    trendPoints: []
  },
  {
    categoryId: 'parapharmacie',
    categoryName: 'Parapharmacie & Dermo-Cosmétique',
    categoryCode: 'PARA-01',
    color: '#ec4899',
    badgeBg: 'bg-pink-100 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300 border-pink-300',
    iconName: 'Sparkles',
    description: 'Soins visage, corps, hygiène bucco-dentaire, solaire et cosmétique active.',
    caHtCurrentMonth: 0,
    margeHtCurrentMonth: 0,
    currentMarginRatePct: 0,
    m3MonthName: 'M-3',
    m3MarginRatePct: 0,
    m2MonthName: 'M-2',
    m2MarginRatePct: 0,
    m1MonthName: 'M-1',
    m1MarginRatePct: 0,
    movingAverage3mPct: 0,
    deltaPoints: 0,
    deltaRelativePct: 0,
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    anomalies: [],
    trendPoints: []
  },
  {
    categoryId: 'dispositif_medical',
    categoryName: 'Dispositifs Médicaux & MAD',
    categoryCode: 'DM-01',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300',
    iconName: 'Stethoscope',
    description: 'Orthopédie, maintien à domicile, pansements, bas de contention.',
    caHtCurrentMonth: 0,
    margeHtCurrentMonth: 0,
    currentMarginRatePct: 0,
    m3MonthName: 'M-3',
    m3MarginRatePct: 0,
    m2MonthName: 'M-2',
    m2MarginRatePct: 0,
    m1MonthName: 'M-1',
    m1MarginRatePct: 0,
    movingAverage3mPct: 0,
    deltaPoints: 0,
    deltaRelativePct: 0,
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    anomalies: [],
    trendPoints: []
  },
  {
    categoryId: 'veterinaire',
    categoryName: 'Médecine Vétérinaire & Animaux',
    categoryCode: 'VET-01',
    color: '#f59e0b',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300',
    iconName: 'PawPrint',
    description: 'Antiparasitaires, soins félins/canins et compléments vétérinaires.',
    caHtCurrentMonth: 0,
    margeHtCurrentMonth: 0,
    currentMarginRatePct: 0,
    m3MonthName: 'M-3',
    m3MarginRatePct: 0,
    m2MonthName: 'M-2',
    m2MarginRatePct: 0,
    m1MonthName: 'M-1',
    m1MarginRatePct: 0,
    movingAverage3mPct: 0,
    deltaPoints: 0,
    deltaRelativePct: 0,
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    anomalies: [],
    trendPoints: []
  },
  {
    categoryId: 'nutrition_bebe',
    categoryName: 'Nutrition Infantile & Pédiatrie',
    categoryCode: 'BABY-01',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300',
    iconName: 'Baby',
    description: 'Laits infantiles 1er/2e âge, biberonnerie, hygiène bébé.',
    caHtCurrentMonth: 0,
    margeHtCurrentMonth: 0,
    currentMarginRatePct: 0,
    m3MonthName: 'M-3',
    m3MarginRatePct: 0,
    m2MonthName: 'M-2',
    m2MarginRatePct: 0,
    m1MonthName: 'M-1',
    m1MarginRatePct: 0,
    movingAverage3mPct: 0,
    deltaPoints: 0,
    deltaRelativePct: 0,
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    anomalies: [],
    trendPoints: []
  },
  {
    categoryId: 'acte_pharmaceutique',
    categoryName: 'Nouvelles Missions & Actes Cliniques',
    categoryCode: 'ACT-01',
    color: '#14b8a6',
    badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300',
    iconName: 'Syringe',
    description: 'Vaccinations, TROD Angine/Cystite, entretiens pharmaceutiques.',
    caHtCurrentMonth: 0,
    margeHtCurrentMonth: 0,
    currentMarginRatePct: 0,
    m3MonthName: 'M-3',
    m3MarginRatePct: 0,
    m2MonthName: 'M-2',
    m2MarginRatePct: 0,
    m1MonthName: 'M-1',
    m1MarginRatePct: 0,
    movingAverage3mPct: 0,
    deltaPoints: 0,
    deltaRelativePct: 0,
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    anomalies: [],
    trendPoints: []
  }
];

export const MOCK_CATEGORY_MARGINS: CategoryMarginStatus[] = [
  {
    categoryId: 'parapharmacie',
    categoryName: 'Parapharmacie & Dermo-Cosmétique',
    categoryCode: 'PARA-01',
    color: '#f43f5e', // Rose / Rouge Alerte
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300',
    iconName: 'Sparkles',
    description: 'Soins visage, corps, hygiène bucco-dentaire, solaire et cosmétique active.',
    
    // Valeurs Actuelles MTD (Août 2026)
    caHtCurrentMonth: 34850.00,
    margeHtCurrentMonth: 12824.80,
    currentMarginRatePct: 36.80,
    
    // Historique 3 derniers mois
    m3MonthName: 'Mai 2026',
    m3MarginRatePct: 42.60,
    m2MonthName: 'Juin 2026',
    m2MarginRatePct: 42.80,
    m1MonthName: 'Juillet 2026',
    m1MarginRatePct: 42.10,
    
    // Moyenne mobile 3 mois : (42.6 + 42.8 + 42.1) / 3 = 42.50%
    movingAverage3mPct: 42.50,
    
    // Écart : 36.80 - 42.50 = -5.70 points (Chute > 5.0% -> ALERTE CRITIQUE)
    deltaPoints: -5.70,
    deltaRelativePct: -13.41,
    
    alertThresholdPoints: 5.0,
    severity: 'critique',
    isAlertTriggered: true,
    alertTriggeredAt: '24/08/2026 14:32:18',
    alertMessage: 'Alerte Rupture de Rentabilité : La marge Parapharmacie a chuté de 5,70 pts (36,80% vs 42,50% MM3M). Perte estimée : -1 986,45 €/mois.',
    estimatedLossEur: 1986.45,
    
    anomalies: [
      {
        id: 'anom-para-1',
        productCip: '8710447492130',
        productName: 'REGENERATE Dentifrice Expert 75ml',
        category: 'parapharmacie',
        issueType: 'hausse_pump_non_repercutee',
        issueLabel: 'Hausse Tarif Fournisseur non répercutée (+14,2%)',
        impactMargeEur: 624.50,
        currentPumpHt: 5.70,
        previousPumpHt: 4.99,
        currentPublicPriceTtc: 9.90,
        suggestedPublicPriceTtc: 11.50,
        currentMarginRatePct: 30.91,
        targetMarginRatePct: 42.50,
        salesVolumeMonth: 142,
        suggestedAction: 'Augmenter le prix public TTC de 9,90 € à 11,50 € pour restaurer le coefficient de 2,02.',
        isApplied: false
      },
      {
        id: 'anom-para-2',
        productCip: '3282770141252',
        productName: 'AVÈNE Crème Solaire SPF50+ Sans Parfum 50ml',
        category: 'parapharmacie',
        issueType: 'remise_caisse_excessive',
        issueLabel: 'Remises manuelles en caisse excessives (-15% systématique)',
        impactMargeEur: 812.30,
        currentPumpHt: 8.20,
        previousPumpHt: 8.20,
        currentPublicPriceTtc: 14.90,
        suggestedPublicPriceTtc: 14.90,
        currentMarginRatePct: 34.09,
        targetMarginRatePct: 44.97,
        salesVolumeMonth: 95,
        suggestedAction: 'Brider les remises comptoir non autorisées à 5% max sur le logiciel LGO.',
        isApplied: false
      },
      {
        id: 'anom-para-3',
        productCip: '3264680005273',
        productName: 'NUXE Huile Prodigieuse Florale Flacon 100ml',
        category: 'parapharmacie',
        issueType: 'rupture_remise_laboratoire',
        issueLabel: 'Non-application de la remise de fin de palier commercial (-8%)',
        impactMargeEur: 549.65,
        currentPumpHt: 17.50,
        previousPumpHt: 15.40,
        currentPublicPriceTtc: 26.90,
        suggestedPublicPriceTtc: 26.90,
        currentMarginRatePct: 21.93,
        targetMarginRatePct: 42.75,
        salesVolumeMonth: 48,
        suggestedAction: 'Générer un avoir fournisseur Nuxe pour régulariser la remise de palier volume.',
        isApplied: false
      }
    ],
    
    trendHistory: [
      { period: 'Mai 2026', marginRatePct: 42.60, movingAverage3mPct: 42.30, alertThresholdPct: 37.30, caHt: 32400, margeHt: 13802, volumeUnits: 1850 },
      { period: 'Juin 2026', marginRatePct: 42.80, movingAverage3mPct: 42.50, alertThresholdPct: 37.50, caHt: 35100, margeHt: 15022, volumeUnits: 1980 },
      { period: 'Juil 2026', marginRatePct: 42.10, movingAverage3mPct: 42.50, alertThresholdPct: 37.50, caHt: 38200, margeHt: 16082, volumeUnits: 2210 },
      { period: 'Août S31', marginRatePct: 39.80, movingAverage3mPct: 42.50, alertThresholdPct: 37.50, caHt: 7800, margeHt: 3104, volumeUnits: 460 },
      { period: 'Août S32', marginRatePct: 38.20, movingAverage3mPct: 42.50, alertThresholdPct: 37.50, caHt: 8200, margeHt: 3132, volumeUnits: 490 },
      { period: 'Août S33', marginRatePct: 37.10, movingAverage3mPct: 42.50, alertThresholdPct: 37.50, caHt: 9100, margeHt: 3376, volumeUnits: 530 },
      { period: 'Août S34 (Actuel)', marginRatePct: 36.80, movingAverage3mPct: 42.50, alertThresholdPct: 37.50, caHt: 9750, margeHt: 3588, volumeUnits: 560 }
    ]
  },
  {
    categoryId: 'medicament_otc',
    categoryName: 'Médication Familiale & OTC',
    categoryCode: 'MED-OTC',
    color: '#3b82f6', // Bleu
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300',
    iconName: 'Pill',
    description: 'Médicaments conseil sans ordonnance (Doliprane, Spasfon, Humex, Strepsils).',
    
    caHtCurrentMonth: 28400.00,
    margeHtCurrentMonth: 10337.60,
    currentMarginRatePct: 36.40,
    
    m3MonthName: 'Mai 2026',
    m3MarginRatePct: 37.50,
    m2MonthName: 'Juin 2026',
    m2MarginRatePct: 37.10,
    m1MonthName: 'Juillet 2026',
    m1MarginRatePct: 37.00,
    
    movingAverage3mPct: 37.20,
    deltaPoints: -0.80,
    deltaRelativePct: -2.15,
    
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 227.20,
    
    anomalies: [
      {
        id: 'anom-otc-1',
        productCip: '3400935008497',
        productName: 'FLUO BI-250 Dentifrice 75ml',
        category: 'medicament_otc',
        issueType: 'hausse_pump_non_repercutee',
        issueLabel: 'Légère érosion marge sur PUMP (+3%)',
        impactMargeEur: 112.40,
        currentPumpHt: 3.99,
        previousPumpHt: 3.88,
        currentPublicPriceTtc: 6.50,
        suggestedPublicPriceTtc: 6.70,
        currentMarginRatePct: 32.48,
        targetMarginRatePct: 35.00,
        salesVolumeMonth: 82,
        suggestedAction: 'Ajuster prix de 6,50 € à 6,70 € TTC.',
        isApplied: false
      }
    ],
    
    trendHistory: [
      { period: 'Mai 2026', marginRatePct: 37.50, movingAverage3mPct: 37.20, alertThresholdPct: 32.20, caHt: 27900, margeHt: 10462, volumeUnits: 3400 },
      { period: 'Juin 2026', marginRatePct: 37.10, movingAverage3mPct: 37.20, alertThresholdPct: 32.20, caHt: 28200, margeHt: 10462, volumeUnits: 3450 },
      { period: 'Juil 2026', marginRatePct: 37.00, movingAverage3mPct: 37.20, alertThresholdPct: 32.20, caHt: 29100, margeHt: 10767, volumeUnits: 3590 },
      { period: 'Août S31', marginRatePct: 36.80, movingAverage3mPct: 37.20, alertThresholdPct: 32.20, caHt: 6800, margeHt: 2502, volumeUnits: 840 },
      { period: 'Août S32', marginRatePct: 36.60, movingAverage3mPct: 37.20, alertThresholdPct: 32.20, caHt: 7100, margeHt: 2598, volumeUnits: 880 },
      { period: 'Août S33', marginRatePct: 36.50, movingAverage3mPct: 37.20, alertThresholdPct: 32.20, caHt: 7200, margeHt: 2628, volumeUnits: 890 },
      { period: 'Août S34 (Actuel)', marginRatePct: 36.40, movingAverage3mPct: 37.20, alertThresholdPct: 32.20, caHt: 7300, margeHt: 2657, volumeUnits: 900 }
    ]
  },
  {
    categoryId: 'medicament_remboursable',
    categoryName: 'Médicaments Remboursables (Rx)',
    categoryCode: 'MED-RX',
    color: '#10b981', // Vert
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300',
    iconName: 'Receipt',
    description: 'Médicaments sur prescription soumis aux honoraires de dispensation et arrêté de marge dégressive.',
    
    caHtCurrentMonth: 78900.00,
    margeHtCurrentMonth: 18068.10,
    currentMarginRatePct: 22.90,
    
    m3MonthName: 'Mai 2026',
    m3MarginRatePct: 22.70,
    m2MonthName: 'Juin 2026',
    m2MarginRatePct: 22.80,
    m1MonthName: 'Juillet 2026',
    m1MarginRatePct: 22.90,
    
    movingAverage3mPct: 22.80,
    deltaPoints: +0.10,
    deltaRelativePct: +0.44,
    
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    
    anomalies: [],
    
    trendHistory: [
      { period: 'Mai 2026', marginRatePct: 22.70, movingAverage3mPct: 22.80, alertThresholdPct: 17.80, caHt: 76000, margeHt: 17252, volumeUnits: 6800 },
      { period: 'Juin 2026', marginRatePct: 22.80, movingAverage3mPct: 22.80, alertThresholdPct: 17.80, caHt: 77500, margeHt: 17670, volumeUnits: 6950 },
      { period: 'Juil 2026', marginRatePct: 22.90, movingAverage3mPct: 22.80, alertThresholdPct: 17.80, caHt: 79200, margeHt: 18136, volumeUnits: 7100 },
      { period: 'Août S31', marginRatePct: 22.85, movingAverage3mPct: 22.80, alertThresholdPct: 17.80, caHt: 19500, margeHt: 4455, volumeUnits: 1750 },
      { period: 'Août S32', marginRatePct: 22.90, movingAverage3mPct: 22.80, alertThresholdPct: 17.80, caHt: 19800, margeHt: 4534, volumeUnits: 1780 },
      { period: 'Août S33', marginRatePct: 22.92, movingAverage3mPct: 22.80, alertThresholdPct: 17.80, caHt: 19700, margeHt: 4515, volumeUnits: 1770 },
      { period: 'Août S34 (Actuel)', marginRatePct: 22.90, movingAverage3mPct: 22.80, alertThresholdPct: 17.80, caHt: 19900, margeHt: 4557, volumeUnits: 1790 }
    ]
  },
  {
    categoryId: 'dispositif_medical',
    categoryName: 'Dispositifs Médicaux & MAD',
    categoryCode: 'DM-MAD',
    color: '#8b5cf6', // Violet
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300',
    iconName: 'Activity',
    description: 'Orthopédie, contention veineuse, pansements techniques, maintien à domicile et aérosols.',
    
    caHtCurrentMonth: 12400.00,
    margeHtCurrentMonth: 5480.80,
    currentMarginRatePct: 44.20,
    
    m3MonthName: 'Mai 2026',
    m3MarginRatePct: 45.40,
    m2MonthName: 'Juin 2026',
    m2MarginRatePct: 45.10,
    m1MonthName: 'Juillet 2026',
    m1MarginRatePct: 44.80,
    
    movingAverage3mPct: 45.10,
    deltaPoints: -0.90,
    deltaRelativePct: -2.00,
    
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 111.60,
    
    anomalies: [],
    
    trendHistory: [
      { period: 'Mai 2026', marginRatePct: 45.40, movingAverage3mPct: 45.10, alertThresholdPct: 40.10, caHt: 11800, margeHt: 5357, volumeUnits: 420 },
      { period: 'Juin 2026', marginRatePct: 45.10, movingAverage3mPct: 45.10, alertThresholdPct: 40.10, caHt: 12100, margeHt: 5457, volumeUnits: 430 },
      { period: 'Juil 2026', marginRatePct: 44.80, movingAverage3mPct: 45.10, alertThresholdPct: 40.10, caHt: 12500, margeHt: 5600, volumeUnits: 445 },
      { period: 'Août S31', marginRatePct: 44.50, movingAverage3mPct: 45.10, alertThresholdPct: 40.10, caHt: 3000, margeHt: 1335, volumeUnits: 105 },
      { period: 'Août S32', marginRatePct: 44.30, movingAverage3mPct: 45.10, alertThresholdPct: 40.10, caHt: 3100, margeHt: 1373, volumeUnits: 110 },
      { period: 'Août S33', marginRatePct: 44.20, movingAverage3mPct: 45.10, alertThresholdPct: 40.10, caHt: 3150, margeHt: 1392, volumeUnits: 112 },
      { period: 'Août S34 (Actuel)', marginRatePct: 44.20, movingAverage3mPct: 45.10, alertThresholdPct: 40.10, caHt: 3150, margeHt: 1392, volumeUnits: 113 }
    ]
  },
  {
    categoryId: 'veterinaire',
    categoryName: 'Vétérinaire & Antiparasitaires',
    categoryCode: 'VET-01',
    color: '#f59e0b', // Ambre / Attention
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300',
    iconName: 'PawPrint',
    description: 'Antiparasitaires chiens et chats (Frontline, Bravecto, Milbemax, Seresto).',
    
    caHtCurrentMonth: 6200.00,
    margeHtCurrentMonth: 2300.20,
    currentMarginRatePct: 37.10,
    
    m3MonthName: 'Mai 2026',
    m3MarginRatePct: 40.20,
    m2MonthName: 'Juin 2026',
    m2MarginRatePct: 39.80,
    m1MonthName: 'Juillet 2026',
    m1MarginRatePct: 39.40,
    
    movingAverage3mPct: 39.80,
    deltaPoints: -2.70,
    deltaRelativePct: -6.78,
    
    alertThresholdPoints: 5.0,
    severity: 'warning',
    isAlertTriggered: false, // Delta -2.70 pts, sous le seuil 5.0 mais en zone warning
    estimatedLossEur: 167.40,
    
    anomalies: [
      {
        id: 'anom-vet-1',
        productCip: '3400936543210',
        productName: 'SERESTO Collier Grand Chien 70cm',
        category: 'veterinaire',
        issueType: 'hausse_pump_non_repercutee',
        issueLabel: 'Hausse tarif Elanco +4,5% non répercutée',
        impactMargeEur: 145.20,
        currentPumpHt: 23.40,
        previousPumpHt: 22.40,
        currentPublicPriceTtc: 37.90,
        suggestedPublicPriceTtc: 39.90,
        currentMarginRatePct: 32.06,
        targetMarginRatePct: 38.50,
        salesVolumeMonth: 28,
        suggestedAction: 'Augmenter le prix de vente à 39,90 € pour compenser la hausse.',
        isApplied: false
      }
    ],
    
    trendHistory: [
      { period: 'Mai 2026', marginRatePct: 40.20, movingAverage3mPct: 39.80, alertThresholdPct: 34.80, caHt: 5900, margeHt: 2371, volumeUnits: 190 },
      { period: 'Juin 2026', marginRatePct: 39.80, movingAverage3mPct: 39.80, alertThresholdPct: 34.80, caHt: 6400, margeHt: 2547, volumeUnits: 210 },
      { period: 'Juil 2026', marginRatePct: 39.40, movingAverage3mPct: 39.80, alertThresholdPct: 34.80, caHt: 6800, margeHt: 2679, volumeUnits: 225 },
      { period: 'Août S31', marginRatePct: 38.50, movingAverage3mPct: 39.80, alertThresholdPct: 34.80, caHt: 1500, margeHt: 577, volumeUnits: 50 },
      { period: 'Août S32', marginRatePct: 37.90, movingAverage3mPct: 39.80, alertThresholdPct: 34.80, caHt: 1550, margeHt: 587, volumeUnits: 52 },
      { period: 'Août S33', marginRatePct: 37.40, movingAverage3mPct: 39.80, alertThresholdPct: 34.80, caHt: 1570, margeHt: 587, volumeUnits: 53 },
      { period: 'Août S34 (Actuel)', marginRatePct: 37.10, movingAverage3mPct: 39.80, alertThresholdPct: 34.80, caHt: 1580, margeHt: 586, volumeUnits: 54 }
    ]
  },
  {
    categoryId: 'nutrition_bebe',
    categoryName: 'Nutrition Infantile & Laits Bébé',
    categoryCode: 'NUT-BEBE',
    color: '#06b6d4', // Cyan
    badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300',
    iconName: 'Baby',
    description: 'Laits infantiles 1er/2e/3e âge (Gallia, Guigoz, Novalac, Modilac) et accessoires de puériculture.',
    
    caHtCurrentMonth: 8900.00,
    margeHtCurrentMonth: 2127.10,
    currentMarginRatePct: 23.90,
    
    m3MonthName: 'Mai 2026',
    m3MarginRatePct: 24.60,
    m2MonthName: 'Juin 2026',
    m2MarginRatePct: 24.50,
    m1MonthName: 'Juillet 2026',
    m1MarginRatePct: 24.40,
    
    movingAverage3mPct: 24.50,
    deltaPoints: -0.60,
    deltaRelativePct: -2.45,
    
    alertThresholdPoints: 5.0,
    severity: 'normal',
    isAlertTriggered: false,
    estimatedLossEur: 53.40,
    
    anomalies: [],
    
    trendHistory: [
      { period: 'Mai 2026', marginRatePct: 24.60, movingAverage3mPct: 24.50, alertThresholdPct: 19.50, caHt: 8600, margeHt: 2115, volumeUnits: 490 },
      { period: 'Juin 2026', marginRatePct: 24.50, movingAverage3mPct: 24.50, alertThresholdPct: 19.50, caHt: 8800, margeHt: 2156, volumeUnits: 505 },
      { period: 'Juil 2026', marginRatePct: 24.40, movingAverage3mPct: 24.50, alertThresholdPct: 19.50, caHt: 9100, margeHt: 2220, volumeUnits: 520 },
      { period: 'Août S31', marginRatePct: 24.10, movingAverage3mPct: 24.50, alertThresholdPct: 19.50, caHt: 2200, margeHt: 530, volumeUnits: 125 },
      { period: 'Août S32', marginRatePct: 24.00, movingAverage3mPct: 24.50, alertThresholdPct: 19.50, caHt: 2220, margeHt: 532, volumeUnits: 126 },
      { period: 'Août S33', marginRatePct: 23.95, movingAverage3mPct: 24.50, alertThresholdPct: 19.50, caHt: 2240, margeHt: 536, volumeUnits: 127 },
      { period: 'Août S34 (Actuel)', marginRatePct: 23.90, movingAverage3mPct: 24.50, alertThresholdPct: 19.50, caHt: 2240, margeHt: 535, volumeUnits: 128 }
    ]
  },
  {
    categoryId: 'acte_pharmaceutique',
    categoryName: 'Actes & Services Pharmaceutiques',
    categoryCode: 'ACT-PRO',
    color: '#10b981', // Vert émeraude
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300',
    iconName: 'Syringe',
    description: 'Vaccination grippe/COVID/rappels, TROD angine/cystite, téléconsultations, bilans de médication.',
    
    caHtCurrentMonth: 4100.00,
    margeHtCurrentMonth: 3464.50,
    currentMarginRatePct: 84.50,
    
    m3MonthName: 'Mai 2026',
    m3MarginRatePct: 81.50,
    m2MonthName: 'Juin 2026',
    m2MarginRatePct: 82.00,
    m1MonthName: 'Juillet 2026',
    m1MarginRatePct: 82.50,
    
    movingAverage3mPct: 82.00,
    deltaPoints: +2.50,
    deltaRelativePct: +3.05,
    
    alertThresholdPoints: 5.0,
    severity: 'performance',
    isAlertTriggered: false,
    estimatedLossEur: 0,
    
    anomalies: [],
    
    trendHistory: [
      { period: 'Mai 2026', marginRatePct: 81.50, movingAverage3mPct: 82.00, alertThresholdPct: 77.00, caHt: 3800, margeHt: 3097, volumeUnits: 380 },
      { period: 'Juin 2026', marginRatePct: 82.00, movingAverage3mPct: 82.00, alertThresholdPct: 77.00, caHt: 3950, margeHt: 3239, volumeUnits: 395 },
      { period: 'Juil 2026', marginRatePct: 82.50, movingAverage3mPct: 82.00, alertThresholdPct: 77.00, caHt: 4200, margeHt: 3465, volumeUnits: 420 },
      { period: 'Août S31', marginRatePct: 83.50, movingAverage3mPct: 82.00, alertThresholdPct: 77.00, caHt: 1000, margeHt: 835, volumeUnits: 100 },
      { period: 'Août S32', marginRatePct: 84.00, movingAverage3mPct: 82.00, alertThresholdPct: 77.00, caHt: 1020, margeHt: 856, volumeUnits: 102 },
      { period: 'Août S33', marginRatePct: 84.20, movingAverage3mPct: 82.00, alertThresholdPct: 77.00, caHt: 1030, margeHt: 867, volumeUnits: 103 },
      { period: 'Août S34 (Actuel)', marginRatePct: 84.50, movingAverage3mPct: 82.00, alertThresholdPct: 77.00, caHt: 1050, margeHt: 887, volumeUnits: 105 }
    ]
  }
];

export const MOCK_LIVE_TICKETS: LiveSalesTicket[] = [
  {
    id: 'tick-001',
    timestamp: '14:58:12',
    ticketNumber: 'TK-2026-8842',
    cashierName: 'Élodie (Préparatrice)',
    category: 'parapharmacie',
    productName: 'AVÈNE Crème Solaire SPF50+ 50ml',
    qty: 2,
    pumpHt: 8.20,
    publicPriceTtc: 14.90,
    discountAppliedPct: 20.0, // Remise excessive !
    marginRatePct: 22.35,
    isDiscountAnomalous: true,
    impactDeltaPts: -20.15
  },
  {
    id: 'tick-002',
    timestamp: '14:55:40',
    ticketNumber: 'TK-2026-8841',
    cashierName: 'Dr N\'Fafode Camara',
    category: 'medicament_remboursable',
    productName: 'ELIQUIS 5mg B56 Comprimés',
    qty: 1,
    pumpHt: 64.12,
    publicPriceTtc: 71.85,
    discountAppliedPct: 0.0,
    marginRatePct: 22.80,
    isDiscountAnomalous: false,
    impactDeltaPts: +0.00
  },
  {
    id: 'tick-003',
    timestamp: '14:52:05',
    ticketNumber: 'TK-2026-8840',
    cashierName: 'Mathieu (Pharmacien Adjoint)',
    category: 'parapharmacie',
    productName: 'REGENERATE Dentifrice Expert 75ml',
    qty: 1,
    pumpHt: 5.70,
    publicPriceTtc: 9.90,
    discountAppliedPct: 0.0,
    marginRatePct: 30.91,
    isDiscountAnomalous: false,
    impactDeltaPts: -11.59 // Marge écrasée par la hausse de PUMP non répercutée
  },
  {
    id: 'tick-004',
    timestamp: '14:48:19',
    ticketNumber: 'TK-2026-8839',
    cashierName: 'Élodie (Préparatrice)',
    category: 'medicament_otc',
    productName: 'DOLIPRANE 1000mg Gélules B8',
    qty: 3,
    pumpHt: 1.15,
    publicPriceTtc: 2.18,
    discountAppliedPct: 0.0,
    marginRatePct: 36.80,
    isDiscountAnomalous: false,
    impactDeltaPts: -0.40
  },
  {
    id: 'tick-005',
    timestamp: '14:42:01',
    ticketNumber: 'TK-2026-8838',
    cashierName: 'Mathieu (Pharmacien Adjoint)',
    category: 'acte_pharmaceutique',
    productName: 'Vaccination Rappel Diphtérie Tétanos Polio',
    qty: 1,
    pumpHt: 1.50,
    publicPriceTtc: 9.60,
    discountAppliedPct: 0.0,
    marginRatePct: 84.38,
    isDiscountAnomalous: false,
    impactDeltaPts: +2.38
  }
];
