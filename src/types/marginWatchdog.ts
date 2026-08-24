import { ProductCategory } from './pharmacy';

export type MarginAlertSeverity = 'critique' | 'warning' | 'normal' | 'performance';

export interface CategoryMarginAnomaly {
  id: string;
  productCip: string;
  productName: string;
  category: ProductCategory;
  issueType: 
    | 'hausse_pump_non_repercutee' 
    | 'remise_caisse_excessive' 
    | 'rupture_remise_laboratoire' 
    | 'demarque_peremption'
    | 'changement_mix_produit';
  issueLabel: string;
  impactMargeEur: number;
  currentPumpHt: number;
  previousPumpHt: number;
  currentPublicPriceTtc: number;
  suggestedPublicPriceTtc: number;
  currentMarginRatePct: number;
  targetMarginRatePct: number;
  salesVolumeMonth: number;
  suggestedAction: string;
  isApplied?: boolean;
}

export interface CategoryMarginTrendPoint {
  period: string; // e.g. "Mai 2026", "Juin 2026", "Juil 2026", "Semaine 32", "Semaine 33", "Semaine 34 (En cours)"
  marginRatePct: number;
  movingAverage3mPct: number;
  alertThresholdPct: number; // MM3M - 5%
  caHt: number;
  margeHt: number;
  volumeUnits: number;
}

export interface CategoryMarginStatus {
  categoryId: ProductCategory;
  categoryName: string;
  categoryCode: string;
  color: string;
  badgeBg: string;
  iconName: string;
  description: string;
  
  // Current period (MTD / Temps Réel)
  caHtCurrentMonth: number;
  margeHtCurrentMonth: number;
  currentMarginRatePct: number;
  
  // 3-Month Historical data for Moving Average (MM3M)
  m3MonthName: string; // e.g. "Mai 2026"
  m3MarginRatePct: number;
  m2MonthName: string; // e.g. "Juin 2026"
  m2MarginRatePct: number;
  m1MonthName: string; // e.g. "Juillet 2026"
  m1MarginRatePct: number;
  
  // Moving Average calculation: (M-1 + M-2 + M-3) / 3
  movingAverage3mPct: number;
  
  // Variance
  deltaPoints: number; // currentMarginRatePct - movingAverage3mPct (e.g. -5.70)
  deltaRelativePct: number; // ((currentMarginRatePct - movingAverage3mPct) / movingAverage3mPct) * 100 (e.g. -13.41%)
  
  // Alert settings & status
  alertThresholdPoints: number; // default: 5.0
  severity: MarginAlertSeverity;
  isAlertTriggered: boolean;
  alertTriggeredAt?: string;
  alertMessage?: string;
  
  // Estimated monthly margin shortfall in Euros
  estimatedLossEur: number;
  
  // Deep-dive root cause anomalies
  anomalies: CategoryMarginAnomaly[];
  
  // Trend points for Recharts visualization
  trendHistory: CategoryMarginTrendPoint[];
}

export interface LiveSalesTicket {
  id: string;
  timestamp: string;
  ticketNumber: string;
  cashierName: string;
  category: ProductCategory;
  productName: string;
  qty: number;
  pumpHt: number;
  publicPriceTtc: number;
  discountAppliedPct: number;
  marginRatePct: number;
  isDiscountAnomalous: boolean;
  impactDeltaPts: number;
}

export interface MarginWatchdogConfig {
  dropThresholdPoints: number; // default 5.0%
  alertCalculationMode: 'absolute_points' | 'relative_percentage';
  realtimeScanIntervalSec: number;
  enableAudioAlerts: boolean;
  enableBrowserPush: boolean;
  autoRepriceSuggestions: boolean;
  notifyOnCounterOverDiscount: boolean;
  maxCounterDiscountAllowedPct: number; // e.g. 5%
  designatedOfficerEmail: string;
}

export type MarginRuleOperator = 'less_than' | 'less_than_or_equal' | 'drop_vs_mm3m';

export interface CustomMarginRule {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  targetCategories: ProductCategory[]; // Array of selected product categories
  thresholdPct: number; // e.g. 15.0 (%)
  operator: MarginRuleOperator; // e.g. 'less_than' (Marge brute < seuil)
  actionChannels: {
    pushNotification: boolean;
    audioAlert: boolean;
    flashBanner: boolean;
    emailAlert: boolean;
  };
  severity: 'critique' | 'attention' | 'info';
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
}
