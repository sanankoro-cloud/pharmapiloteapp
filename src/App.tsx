import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_SUMMARY, 
  BLANK_SUMMARY,
  DEFAULT_PHARMACY_PROFILE,
  MOCK_PRODUCTS, 
  MOCK_SUPPLIERS_ORDERS, 
  MOCK_EXPENSES, 
  MOCK_BANK_TRANSACTIONS, 
  MOCK_COMPETITORS, 
  MOCK_COMPETITOR_PRICES, 
  MOCK_DAILY_STATS, 
  BLANK_DAILY_STAT,
  MOCK_MONTHLY_REPORTS, 
  MOCK_NOTIFICATIONS 
} from './data/mockPharmacyData';
import { 
  INITIAL_VAULT_CONNECTORS, 
  MOCK_ELECTRONIC_INVOICES, 
  MOCK_VAULT_SYNC_LOGS 
} from './data/mockElectronicInvoices';
import { MOCK_LCR_STATEMENTS } from './data/mockLcrData';
import { 
  INITIAL_RESOPHARMA_CONFIG, 
  MOCK_RESOPHARMA_BORDEREAUX, 
  MOCK_RESOPHARMA_SYNC_LOGS 
} from './data/mockResopharmaData';
import { 
  MOCK_AUDIT_LOGS, 
  DEFAULT_OPERATORS 
} from './data/mockAuditLogs';
import { 
  INITIAL_CONNECTORS_HEALTH, 
  INITIAL_HEALTH_LOGS 
} from './data/mockConnectorHealth';
import {
  MOCK_PURCHASE_PRICE_VARIATIONS,
  MOCK_SUPPLIER_RFA_CONTRACTS
} from './data/mockPurchasingAndDiscounts';
import {
  MOCK_ANNUAL_CPA_REPORTS
} from './data/mockAccountingBalance';
import {
  MOCK_CATEGORY_MARGINS,
  BLANK_CATEGORY_MARGINS
} from './data/mockMarginWatchdog';
import {
  MOCK_THERAPEUTIC_CLASSES,
  BLANK_THERAPEUTIC_CLASSES,
  MOCK_PRODUCT_MARGIN_DETAILS,
  BLANK_PRODUCT_MARGIN_DETAILS
} from './data/mockProductTherapeuticMargin';
import { 
  ProductStock, 
  SupplierOrder, 
  ExpenseItem, 
  BankTransaction, 
  CompetitorPriceComparison, 
  PushNotificationAlert, 
  PharmacyFinancialSummary,
  PharmacyProfile,
  MonthlyAccountingReport,
  DailySaleStat,
  BulkThresholdAdjustmentItem
} from './types/pharmacy';
import { 
  CategoryMarginStatus 
} from './types/marginWatchdog';
import { 
  TherapeuticClassSummary, 
  ProductMarginDetail 
} from './types/productTherapeuticMargin';
import { 
  ElectronicInvoice, 
  VaultConnectorConfig, 
  VaultSyncLog, 
  VaultConnectorId 
} from './types/electronicInvoicing';
import { LcrStatement } from './types/lcr';
import { 
  ResopharmaBordereau, 
  ResopharmaConnectorConfig, 
  ResopharmaSyncLog 
} from './types/resopharma';
import { 
  AuditLogEntry, 
  OperatorProfile,
  AuditOperatorRole
} from './types/auditLog';
import { 
  ConnectorHealthItem, 
  ConnectorHealthLog 
} from './types/connectorStatus';
import {
  PurchasePriceVariation,
  SupplierRfaContract,
  PriceVariationStatus
} from './types/purchasingAndDiscounts';
import {
  AnnualCpaReport
} from './types/accountingBalance';
import {
  MOCK_EMPLOYEES,
  BLANK_EMPLOYEES,
  MOCK_WORK_SHIFTS,
  BLANK_WORK_SHIFTS,
  MOCK_LEAVE_REQUESTS,
  BLANK_LEAVE_REQUESTS,
  MOCK_OVERTIME_LOGS,
  BLANK_OVERTIME_LOGS,
  MOCK_TRAINING_PLANS,
  BLANK_TRAINING_PLANS
} from './data/mockHrData';
import {
  Employee,
  WorkShift,
  LeaveRequest,
  OvertimeLog,
  TrainingDpcPlan
} from './types/hr';

import { Navbar } from './components/Navbar';

import { NavigationTabs } from './components/NavigationTabs';
import { MobileNav } from './components/MobileNav';
import { DashboardOverview } from './components/DashboardOverview';
import { SuppliersOrdersView } from './components/SuppliersOrdersView';
import { PurchasePriceVariationView } from './components/PurchasePriceVariationView';
import { CommercialDiscountsControlView } from './components/CommercialDiscountsControlView';
import { AnnualCpaBalanceView } from './components/AnnualCpaBalanceView';
import { LcrControlView } from './components/LcrControlView';
import { StockExpiryView } from './components/StockExpiryView';
import { TreasuryBankReconciliationView } from './components/TreasuryBankReconciliationView';
import { ConnectorsStatusView } from './components/ConnectorsStatusView';
import { AuditTrailView } from './components/AuditTrailView';
import { RecurringExpensesView } from './components/RecurringExpensesView';
import { AnnualTrendsSalesView } from './components/AnnualTrendsSalesView';
import { RealtimeMarginWatchdogView } from './components/RealtimeMarginWatchdogView';
import { CompetitorPriceRadarView } from './components/CompetitorPriceRadarView';
import { AccountingReportsView } from './components/AccountingReportsView';
import { HumanResourcesManagementView } from './components/HumanResourcesManagementView';
import { PushNotificationModal } from './components/PushNotificationModal';
import { MobileMoreMenuModal } from './components/MobileMoreMenuModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ElectronicInvoicingVaultModal } from './components/ElectronicInvoicingVaultModal';
import { ResopharmaConnectorModal } from './components/ResopharmaConnectorModal';
import { DataManagementModal } from './components/DataManagementModal';
import { OnboardingTourModal } from './components/OnboardingTourModal';

export default function App() {
  // App state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Real Mode / Demo Mode State & Pharmacy Profile State
  const [isRealModeActive, setIsRealModeActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_is_real_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyProfile>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_profile_custom');
      return saved ? JSON.parse(saved) : DEFAULT_PHARMACY_PROFILE;
    } catch {
      return DEFAULT_PHARMACY_PROFILE;
    }
  });

  const [isDataManagementModalOpen, setIsDataManagementModalOpen] = useState(false);

  // Financial & Operational Collections (Persisted in localStorage)
  const [summary, setSummary] = useState<PharmacyFinancialSummary>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_summary');
      return saved ? JSON.parse(saved) : INITIAL_SUMMARY;
    } catch {
      return INITIAL_SUMMARY;
    }
  });

  const [products, setProducts] = useState<ProductStock[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_products');
      return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<SupplierOrder[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_orders');
      return saved ? JSON.parse(saved) : MOCK_SUPPLIERS_ORDERS;
    } catch {
      return MOCK_SUPPLIERS_ORDERS;
    }
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_expenses');
      return saved ? JSON.parse(saved) : MOCK_EXPENSES;
    } catch {
      return MOCK_EXPENSES;
    }
  });

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_bank_transactions');
      return saved ? JSON.parse(saved) : MOCK_BANK_TRANSACTIONS;
    } catch {
      return MOCK_BANK_TRANSACTIONS;
    }
  });

  const [competitorPrices, setCompetitorPrices] = useState<CompetitorPriceComparison[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_competitor_prices');
      return saved ? JSON.parse(saved) : MOCK_COMPETITOR_PRICES;
    } catch {
      return MOCK_COMPETITOR_PRICES;
    }
  });

  const [notifications, setNotifications] = useState<PushNotificationAlert[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_notifications');
      return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  });

  const [monthlyReports, setMonthlyReports] = useState<MonthlyAccountingReport[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_monthly_reports');
      return saved ? JSON.parse(saved) : MOCK_MONTHLY_REPORTS;
    } catch {
      return MOCK_MONTHLY_REPORTS;
    }
  });
  
  // Connectors Health & API Status State (Resopharma, CA, SY PDP, Chorus Pro...)
  const [connectorsHealth, setConnectorsHealth] = useState<ConnectorHealthItem[]>(INITIAL_CONNECTORS_HEALTH);
  const [connectorHealthLogs, setConnectorHealthLogs] = useState<ConnectorHealthLog[]>(INITIAL_HEALTH_LOGS);
  const [isPingingAllConnectors, setIsPingingAllConnectors] = useState(false);

  // Audit Logs (Journal d'audit & contrôle interne des actions)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_audit_logs');
      return saved ? JSON.parse(saved) : MOCK_AUDIT_LOGS;
    } catch {
      return MOCK_AUDIT_LOGS;
    }
  });
  const [availableOperators, setAvailableOperators] = useState<OperatorProfile[]>(DEFAULT_OPERATORS);
  const [currentOperator, setCurrentOperator] = useState<OperatorProfile>(DEFAULT_OPERATORS[0]);

  // LCR (Lettres de Change Relevé) & Traites state
  const [lcrStatements, setLcrStatements] = useState<LcrStatement[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_lcr_statements');
      return saved ? JSON.parse(saved) : MOCK_LCR_STATEMENTS;
    } catch {
      return MOCK_LCR_STATEMENTS;
    }
  });

  // Electronic Invoicing Vault state (SY by Cegedim & Factur-X)
  const [electronicInvoices, setElectronicInvoices] = useState<ElectronicInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_electronic_invoices');
      return saved ? JSON.parse(saved) : MOCK_ELECTRONIC_INVOICES;
    } catch {
      return MOCK_ELECTRONIC_INVOICES;
    }
  });
  const [vaultConnectors, setVaultConnectors] = useState<VaultConnectorConfig[]>(INITIAL_VAULT_CONNECTORS);
  const [vaultSyncLogs, setVaultSyncLogs] = useState<VaultSyncLog[]>(MOCK_VAULT_SYNC_LOGS);
  const [isElectronicInvoicingModalOpen, setIsElectronicInvoicingModalOpen] = useState(false);
  const [isSyncingVault, setIsSyncingVault] = useState(false);

  // RESOPHARMA Connector State (Télétransmission SESAM-Vitale, Retours NOEMIE & Mutuelles DRE)
  const [resopharmaConfig, setResopharmaConfig] = useState<ResopharmaConnectorConfig>(INITIAL_RESOPHARMA_CONFIG);
  const [resopharmaBordereaux, setResopharmaBordereaux] = useState<ResopharmaBordereau[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_resopharma_bordereaux');
      return saved ? JSON.parse(saved) : MOCK_RESOPHARMA_BORDEREAUX;
    } catch {
      return MOCK_RESOPHARMA_BORDEREAUX;
    }
  });
  const [resopharmaSyncLogs, setResopharmaSyncLogs] = useState<ResopharmaSyncLog[]>(MOCK_RESOPHARMA_SYNC_LOGS);
  const [isResopharmaModalOpen, setIsResopharmaModalOpen] = useState(false);
  const [isSyncingResopharma, setIsSyncingResopharma] = useState(false);

  // Purchasing Price Variations & Laboratory Tariff Alert State
  const [priceVariations, setPriceVariations] = useState<PurchasePriceVariation[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_price_variations');
      return saved ? JSON.parse(saved) : MOCK_PURCHASE_PRICE_VARIATIONS;
    } catch {
      return MOCK_PURCHASE_PRICE_VARIATIONS;
    }
  });

  // Commercial Discounts & RFA (Remises de Fin d'Année) Audit State
  const [discountContracts, setDiscountContracts] = useState<SupplierRfaContract[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_discount_contracts');
      return saved ? JSON.parse(saved) : MOCK_SUPPLIER_RFA_CONTRACTS;
    } catch {
      return MOCK_SUPPLIER_RFA_CONTRACTS;
    }
  });

  // Annual CPA Balance Sheet & Interfimo Valuation State
  const [annualCpaReports, setAnnualCpaReports] = useState<AnnualCpaReport[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_annual_cpa_reports');
      return saved ? JSON.parse(saved) : MOCK_ANNUAL_CPA_REPORTS;
    } catch {
      return MOCK_ANNUAL_CPA_REPORTS;
    }
  });

  // Category Margins Surveillance State
  const [categoryMargins, setCategoryMargins] = useState<CategoryMarginStatus[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_category_margins');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_CATEGORY_MARGINS : MOCK_CATEGORY_MARGINS;
    } catch {
      return MOCK_CATEGORY_MARGINS;
    }
  });

  // Therapeutic Classes & Product Margins State
  const [therapeuticClasses, setTherapeuticClasses] = useState<TherapeuticClassSummary[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_therapeutic_classes');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_THERAPEUTIC_CLASSES : MOCK_THERAPEUTIC_CLASSES;
    } catch {
      return MOCK_THERAPEUTIC_CLASSES;
    }
  });

  const [productMargins, setProductMargins] = useState<ProductMarginDetail[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_product_margins');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_PRODUCT_MARGIN_DETAILS : MOCK_PRODUCT_MARGIN_DETAILS;
    } catch {
      return MOCK_PRODUCT_MARGIN_DETAILS;
    }
  });

  // Today Sales Stats (Horaire & Ventes du jour)
  const [todayStats, setTodayStats] = useState<DailySaleStat>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_today_stats');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_DAILY_STAT : MOCK_DAILY_STATS[0];
    } catch {
      return MOCK_DAILY_STATS[0];
    }
  });

  // Human Resources (RH) Management State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_hr_employees');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_EMPLOYEES : MOCK_EMPLOYEES;
    } catch {
      return MOCK_EMPLOYEES;
    }
  });

  const [shifts, setShifts] = useState<WorkShift[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_hr_shifts');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_WORK_SHIFTS : MOCK_WORK_SHIFTS;
    } catch {
      return MOCK_WORK_SHIFTS;
    }
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_hr_leave_requests');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_LEAVE_REQUESTS : MOCK_LEAVE_REQUESTS;
    } catch {
      return MOCK_LEAVE_REQUESTS;
    }
  });

  const [overtimeLogs, setOvertimeLogs] = useState<OvertimeLog[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_hr_overtime_logs');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_OVERTIME_LOGS : MOCK_OVERTIME_LOGS;
    } catch {
      return MOCK_OVERTIME_LOGS;
    }
  });

  const [trainingPlans, setTrainingPlans] = useState<TrainingDpcPlan[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_hr_training_plans');
      if (saved) return JSON.parse(saved);
      const isReal = localStorage.getItem('pharmacy_is_real_mode') === 'true';
      return isReal ? BLANK_TRAINING_PLANS : MOCK_TRAINING_PLANS;
    } catch {
      return MOCK_TRAINING_PLANS;
    }
  });


  // UI modals & indicators
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isOnboardingTourOpen, setIsOnboardingTourOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isSyncingBank, setIsSyncingBank] = useState(false);
  const [lastBankSyncTime, setLastBankSyncTime] = useState('22/08/2026 à 15:30');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark Mode State (Persisted in localStorage, optimized for inventory & late-night management)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pharmacy_dark_mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pharmacy_dark_mode', 'false');
      }
    } catch {
      // Ignore localStorage errors if sandboxed
    }
  }, [isDarkMode]);

  // Sync state changes with localStorage for persistent real/custom data
  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_is_real_mode', String(isRealModeActive));
    } catch (e) {
      console.warn(e);
    }
  }, [isRealModeActive]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_profile_custom', JSON.stringify(pharmacyProfile));
    } catch (e) {
      console.warn(e);
    }
  }, [pharmacyProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_summary', JSON.stringify(summary));
    } catch (e) {
      console.warn(e);
    }
  }, [summary]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_products', JSON.stringify(products));
    } catch (e) {
      console.warn(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_expenses', JSON.stringify(expenses));
    } catch (e) {
      console.warn(e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_bank_transactions', JSON.stringify(bankTransactions));
    } catch (e) {
      console.warn(e);
    }
  }, [bankTransactions]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_lcr_statements', JSON.stringify(lcrStatements));
    } catch (e) {
      console.warn(e);
    }
  }, [lcrStatements]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn(e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_monthly_reports', JSON.stringify(monthlyReports));
    } catch (e) {
      console.warn(e);
    }
  }, [monthlyReports]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_annual_cpa_reports', JSON.stringify(annualCpaReports));
    } catch (e) {
      console.warn(e);
    }
  }, [annualCpaReports]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_price_variations', JSON.stringify(priceVariations));
    } catch (e) {
      console.warn(e);
    }
  }, [priceVariations]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_discount_contracts', JSON.stringify(discountContracts));
    } catch (e) {
      console.warn(e);
    }
  }, [discountContracts]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_competitor_prices', JSON.stringify(competitorPrices));
    } catch (e) {
      console.warn(e);
    }
  }, [competitorPrices]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_electronic_invoices', JSON.stringify(electronicInvoices));
    } catch (e) {
      console.warn(e);
    }
  }, [electronicInvoices]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_resopharma_bordereaux', JSON.stringify(resopharmaBordereaux));
    } catch (e) {
      console.warn(e);
    }
  }, [resopharmaBordereaux]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn(e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_category_margins', JSON.stringify(categoryMargins));
    } catch (e) {
      console.warn(e);
    }
  }, [categoryMargins]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_therapeutic_classes', JSON.stringify(therapeuticClasses));
    } catch (e) {
      console.warn(e);
    }
  }, [therapeuticClasses]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_product_margins', JSON.stringify(productMargins));
    } catch (e) {
      console.warn(e);
    }
  }, [productMargins]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_today_stats', JSON.stringify(todayStats));
    } catch (e) {
      console.warn(e);
    }
  }, [todayStats]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_hr_employees', JSON.stringify(employees));
    } catch (e) {
      console.warn(e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_hr_shifts', JSON.stringify(shifts));
    } catch (e) {
      console.warn(e);
    }
  }, [shifts]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_hr_leave_requests', JSON.stringify(leaveRequests));
    } catch (e) {
      console.warn(e);
    }
  }, [leaveRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_hr_overtime_logs', JSON.stringify(overtimeLogs));
    } catch (e) {
      console.warn(e);
    }
  }, [overtimeLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacy_hr_training_plans', JSON.stringify(trainingPlans));
    } catch (e) {
      console.warn(e);
    }
  }, [trainingPlans]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      showToast(next ? "Mode Nuit activé (Confort visuel pour inventaires & garde)" : "Mode Jour activé");
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers for Data Management (Real Mode / Blank / Restore / Reset)
  const handleResetToDemoData = () => {
    setProducts(MOCK_PRODUCTS);
    setOrders(MOCK_SUPPLIERS_ORDERS);
    setExpenses(MOCK_EXPENSES);
    setBankTransactions(MOCK_BANK_TRANSACTIONS);
    setLcrStatements(MOCK_LCR_STATEMENTS);
    setNotifications(MOCK_NOTIFICATIONS);
    setMonthlyReports(MOCK_MONTHLY_REPORTS);
    setAnnualCpaReports(MOCK_ANNUAL_CPA_REPORTS);
    setPriceVariations(MOCK_PURCHASE_PRICE_VARIATIONS);
    setDiscountContracts(MOCK_SUPPLIER_RFA_CONTRACTS);
    setCompetitorPrices(MOCK_COMPETITOR_PRICES);
    setElectronicInvoices(MOCK_ELECTRONIC_INVOICES);
    setResopharmaBordereaux(MOCK_RESOPHARMA_BORDEREAUX);
    setAuditLogs(MOCK_AUDIT_LOGS);
    setCategoryMargins(MOCK_CATEGORY_MARGINS);
    setTherapeuticClasses(MOCK_THERAPEUTIC_CLASSES);
    setProductMargins(MOCK_PRODUCT_MARGIN_DETAILS);
    setTodayStats(MOCK_DAILY_STATS[0]);
    setEmployees(MOCK_EMPLOYEES);
    setShifts(MOCK_WORK_SHIFTS);
    setLeaveRequests(MOCK_LEAVE_REQUESTS);
    setOvertimeLogs(MOCK_OVERTIME_LOGS);
    setTrainingPlans(MOCK_TRAINING_PLANS);
    setSummary(INITIAL_SUMMARY);
    setPharmacyProfile(DEFAULT_PHARMACY_PROFILE);
    setIsRealModeActive(false);

    // Persist immediately in localStorage
    localStorage.setItem('pharmacy_products', JSON.stringify(MOCK_PRODUCTS));
    localStorage.setItem('pharmacy_orders', JSON.stringify(MOCK_SUPPLIERS_ORDERS));
    localStorage.setItem('pharmacy_expenses', JSON.stringify(MOCK_EXPENSES));
    localStorage.setItem('pharmacy_bank_transactions', JSON.stringify(MOCK_BANK_TRANSACTIONS));
    localStorage.setItem('pharmacy_lcr_statements', JSON.stringify(MOCK_LCR_STATEMENTS));
    localStorage.setItem('pharmacy_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
    localStorage.setItem('pharmacy_monthly_reports', JSON.stringify(MOCK_MONTHLY_REPORTS));
    localStorage.setItem('pharmacy_annual_cpa_reports', JSON.stringify(MOCK_ANNUAL_CPA_REPORTS));
    localStorage.setItem('pharmacy_price_variations', JSON.stringify(MOCK_PURCHASE_PRICE_VARIATIONS));
    localStorage.setItem('pharmacy_discount_contracts', JSON.stringify(MOCK_SUPPLIER_RFA_CONTRACTS));
    localStorage.setItem('pharmacy_competitor_prices', JSON.stringify(MOCK_COMPETITOR_PRICES));
    localStorage.setItem('pharmacy_electronic_invoices', JSON.stringify(MOCK_ELECTRONIC_INVOICES));
    localStorage.setItem('pharmacy_resopharma_bordereaux', JSON.stringify(MOCK_RESOPHARMA_BORDEREAUX));
    localStorage.setItem('pharmacy_audit_logs', JSON.stringify(MOCK_AUDIT_LOGS));
    localStorage.setItem('pharmacy_category_margins', JSON.stringify(MOCK_CATEGORY_MARGINS));
    localStorage.setItem('pharmacy_therapeutic_classes', JSON.stringify(MOCK_THERAPEUTIC_CLASSES));
    localStorage.setItem('pharmacy_product_margins', JSON.stringify(MOCK_PRODUCT_MARGIN_DETAILS));
    localStorage.setItem('pharmacy_today_stats', JSON.stringify(MOCK_DAILY_STATS[0]));
    localStorage.setItem('pharmacy_hr_employees', JSON.stringify(MOCK_EMPLOYEES));
    localStorage.setItem('pharmacy_hr_shifts', JSON.stringify(MOCK_WORK_SHIFTS));
    localStorage.setItem('pharmacy_hr_leave_requests', JSON.stringify(MOCK_LEAVE_REQUESTS));
    localStorage.setItem('pharmacy_hr_overtime_logs', JSON.stringify(MOCK_OVERTIME_LOGS));
    localStorage.setItem('pharmacy_hr_training_plans', JSON.stringify(MOCK_TRAINING_PLANS));
    localStorage.setItem('pharmacy_summary', JSON.stringify(INITIAL_SUMMARY));
    localStorage.setItem('pharmacy_profile_custom', JSON.stringify(DEFAULT_PHARMACY_PROFILE));
    localStorage.setItem('pharmacy_is_real_mode', 'false');

    showToast("Jeu de données de démonstration réinitialisé avec succès (RH, finances, stocks, marges).");
  };

  const handleClearAllDataToBlank = () => {
    setProducts([]);
    setOrders([]);
    setExpenses([]);
    setBankTransactions([]);
    setLcrStatements([]);
    setNotifications([]);
    setMonthlyReports([]);
    setAnnualCpaReports([]);
    setPriceVariations([]);
    setDiscountContracts([]);
    setCompetitorPrices([]);
    setElectronicInvoices([]);
    setResopharmaBordereaux([]);
    setAuditLogs([]);
    setCategoryMargins(BLANK_CATEGORY_MARGINS);
    setTherapeuticClasses([]);
    setProductMargins([]);
    setTodayStats(BLANK_DAILY_STAT);
    setEmployees(BLANK_EMPLOYEES);
    setShifts(BLANK_WORK_SHIFTS);
    setLeaveRequests(BLANK_LEAVE_REQUESTS);
    setOvertimeLogs(BLANK_OVERTIME_LOGS);
    setTrainingPlans(BLANK_TRAINING_PLANS);
    setSummary(BLANK_SUMMARY);
    setIsRealModeActive(true);

    // Clear all from localStorage
    localStorage.setItem('pharmacy_products', JSON.stringify([]));
    localStorage.setItem('pharmacy_orders', JSON.stringify([]));
    localStorage.setItem('pharmacy_expenses', JSON.stringify([]));
    localStorage.setItem('pharmacy_bank_transactions', JSON.stringify([]));
    localStorage.setItem('pharmacy_lcr_statements', JSON.stringify([]));
    localStorage.setItem('pharmacy_notifications', JSON.stringify([]));
    localStorage.setItem('pharmacy_monthly_reports', JSON.stringify([]));
    localStorage.setItem('pharmacy_annual_cpa_reports', JSON.stringify([]));
    localStorage.setItem('pharmacy_price_variations', JSON.stringify([]));
    localStorage.setItem('pharmacy_discount_contracts', JSON.stringify([]));
    localStorage.setItem('pharmacy_competitor_prices', JSON.stringify([]));
    localStorage.setItem('pharmacy_electronic_invoices', JSON.stringify([]));
    localStorage.setItem('pharmacy_resopharma_bordereaux', JSON.stringify([]));
    localStorage.setItem('pharmacy_audit_logs', JSON.stringify([]));
    localStorage.setItem('pharmacy_category_margins', JSON.stringify(BLANK_CATEGORY_MARGINS));
    localStorage.setItem('pharmacy_therapeutic_classes', JSON.stringify([]));
    localStorage.setItem('pharmacy_product_margins', JSON.stringify([]));
    localStorage.setItem('pharmacy_today_stats', JSON.stringify(BLANK_DAILY_STAT));
    localStorage.setItem('pharmacy_hr_employees', JSON.stringify(BLANK_EMPLOYEES));
    localStorage.setItem('pharmacy_hr_shifts', JSON.stringify(BLANK_WORK_SHIFTS));
    localStorage.setItem('pharmacy_hr_leave_requests', JSON.stringify(BLANK_LEAVE_REQUESTS));
    localStorage.setItem('pharmacy_hr_overtime_logs', JSON.stringify(BLANK_OVERTIME_LOGS));
    localStorage.setItem('pharmacy_hr_training_plans', JSON.stringify(BLANK_TRAINING_PLANS));
    localStorage.setItem('pharmacy_summary', JSON.stringify(BLANK_SUMMARY));
    localStorage.setItem('pharmacy_is_real_mode', 'true');
    localStorage.removeItem('pharmacy_onboarding_completed_steps');
    localStorage.removeItem('pharmacy_onboarding_dismissed');
    localStorage.removeItem('pharmacy_onboarding_banner_hidden');

    showToast("Application réinitialisée à 100% à blanc (RH & plannings, trésorerie, prévisionnel de flux, projections, marges, écritures et stocks effacés).");
  };

  const handleRestoreFromJsonBackup = (data: {
    pharmacyProfile?: PharmacyProfile;
    officineProfile?: PharmacyProfile;
    summary?: PharmacyFinancialSummary;
    products?: ProductStock[];
    orders?: SupplierOrder[];
    expenses?: ExpenseItem[];
    bankTransactions?: BankTransaction[];
    lcrStatements?: LcrStatement[];
    notifications?: PushNotificationAlert[];
    monthlyReports?: MonthlyAccountingReport[];
    annualCpaReports?: AnnualCpaReport[];
    priceVariations?: PurchasePriceVariation[];
    discountContracts?: SupplierRfaContract[];
    competitorPrices?: CompetitorPriceComparison[];
    electronicInvoices?: ElectronicInvoice[];
    resopharmaBordereaux?: ResopharmaBordereau[];
    categoryMargins?: CategoryMarginStatus[];
    therapeuticClasses?: TherapeuticClassSummary[];
    productMargins?: ProductMarginDetail[];
    todayStats?: DailySaleStat;
    employees?: Employee[];
    shifts?: WorkShift[];
    leaveRequests?: LeaveRequest[];
    overtimeLogs?: OvertimeLog[];
    trainingPlans?: TrainingDpcPlan[];
    isRealMode?: boolean;
    isRealModeActive?: boolean;
  }) => {
    const prof = data.pharmacyProfile || data.officineProfile;
    if (prof) setPharmacyProfile(prof);
    if (data.summary) setSummary(data.summary);
    if (data.products) setProducts(data.products);
    if (data.orders) setOrders(data.orders);
    if (data.expenses) setExpenses(data.expenses);
    if (data.bankTransactions) setBankTransactions(data.bankTransactions);
    if (data.categoryMargins) setCategoryMargins(data.categoryMargins);
    if (data.therapeuticClasses) setTherapeuticClasses(data.therapeuticClasses);
    if (data.productMargins) setProductMargins(data.productMargins);
    if (data.todayStats) setTodayStats(data.todayStats);
    if (data.lcrStatements) setLcrStatements(data.lcrStatements);
    if (data.notifications) setNotifications(data.notifications);
    if (data.monthlyReports) setMonthlyReports(data.monthlyReports);
    if (data.annualCpaReports) setAnnualCpaReports(data.annualCpaReports);
    if (data.priceVariations) setPriceVariations(data.priceVariations);
    if (data.discountContracts) setDiscountContracts(data.discountContracts);
    if (data.competitorPrices) setCompetitorPrices(data.competitorPrices);
    if (data.electronicInvoices) setElectronicInvoices(data.electronicInvoices);
    if (data.resopharmaBordereaux) setResopharmaBordereaux(data.resopharmaBordereaux);
    if (data.employees) setEmployees(data.employees);
    if (data.shifts) setShifts(data.shifts);
    if (data.leaveRequests) setLeaveRequests(data.leaveRequests);
    if (data.overtimeLogs) setOvertimeLogs(data.overtimeLogs);
    if (data.trainingPlans) setTrainingPlans(data.trainingPlans);
    const realMode = data.isRealMode ?? data.isRealModeActive;
    if (realMode !== undefined) setIsRealModeActive(realMode);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast("Sauvegarde intégrale restaurée avec succès (y compris RH et plannings) !");
  };


  const handleUpdatePharmacyProfile = (updatedProfile: PharmacyProfile) => {
    setPharmacyProfile(updatedProfile);
    showToast(`Profil de « ${updatedProfile.name} » mis à jour.`);
  };

  const handleToggleRealMode = (enableReal: boolean) => {
    setIsRealModeActive(enableReal);
    if (enableReal) {
      showToast("Mode Données Réelles activé (Vos données d'officine sont prioritaires).");
    } else {
      showToast("Mode Démonstration activé.");
    }
  };

  const handleImportBulkOrders = (imported: SupplierOrder[]) => {
    setOrders(prev => [...imported, ...prev]);
    showToast(`${imported.length} commandes et factures importées avec succès.`);
  };

  const handleImportBulkExpenses = (imported: ExpenseItem[]) => {
    setExpenses(prev => [...imported, ...prev]);
    showToast(`${imported.length} dépenses récurrentes importées avec succès.`);
  };


  // Helper to log user action in real-time
  const logUserAction = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'operatorName' | 'operatorRole'> & { operatorName?: string; operatorRole?: AuditOperatorRole }) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      operatorName: entry.operatorName || currentOperator.name,
      operatorRole: entry.operatorRole || currentOperator.role,
      workstation: entry.workstation || currentOperator.workstation,
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Barcode scan stock update
  const handleUpdateProductStock = (productId: string, newQty: number, lotNumber?: string, expiryDate?: string) => {
    const targetProduct = products.find(p => p.id === productId);
    const oldQty = targetProduct ? targetProduct.stockQty : 0;
    const diffQty = newQty - oldQty;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockQty: newQty,
          lotNumber: lotNumber || p.lotNumber,
          expiryDate: expiryDate || p.expiryDate,
          status: newQty <= p.minThreshold ? 'low_stock' : p.daysUntilExpiry <= 30 ? 'near_expiry' : 'optimal'
        };
      }
      return p;
    }));

    if (targetProduct) {
      logUserAction({
        domain: 'stocks',
        actionType: 'ajustement_quantite',
        severity: diffQty < 0 ? 'warning' : 'info',
        details: `Mise à jour stock via scanner Datamatrix pour "${targetProduct.name}" (CIP: ${targetProduct.cip})`,
        targetEntity: targetProduct.name,
        previousValue: `${oldQty} boîte(s) (Lot: ${targetProduct.lotNumber})`,
        newValue: `${newQty} boîte(s) (Lot: ${lotNumber || targetProduct.lotNumber})`,
        financialImpact: diffQty * targetProduct.pump,
        reason: 'Inventaire / Réception Datamatrix au comptoir'
      });
    }
  };

  // Barcode scan add new product
  const handleAddNewProduct = (newProdData: Omit<ProductStock, 'id'>) => {
    const newProd: ProductStock = {
      id: `prod-${Date.now()}`,
      ...newProdData
    };
    setProducts(prev => [newProd, ...prev]);

    logUserAction({
      domain: 'stocks',
      actionType: 'ajout_produit',
      severity: 'info',
      details: `Création de référence au stock : "${newProd.name}" (CIP: ${newProd.cip})`,
      targetEntity: newProd.name,
      previousValue: 'Inexistant',
      newValue: `${newProd.stockQty} boîtes en stock @ ${newProd.pump.toFixed(2)} € HT (PUMP)`,
      financialImpact: newProd.stockQty * newProd.pump,
      reason: 'Création fiche produit / Réception nouvelle référence'
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Produit ${newProd.name} (CIP: ${newProd.cip}) ajouté au stock avec succès.`);
  };

  // Electronic Invoicing Vault Live Sync (SY by Cegedim, Factur-X PDP, Chorus Pro)
  const handleSyncVault = (connectorId: VaultConnectorId = 'cegedim_sy') => {
    setIsSyncingVault(true);
    setTimeout(() => {
      setIsSyncingVault(false);
      const syncTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      // Update connector last sync
      setVaultConnectors(prev => prev.map(c => {
        if (c.id === connectorId || connectorId === 'cegedim_sy') {
          return {
            ...c,
            lastSyncDate: `22/08/2026 à ${syncTime}`,
            invoicesCount: c.invoicesCount + 1,
            totalAmountTtc: c.totalAmountTtc + 2450.00
          };
        }
        return c;
      }));

      // Add a fresh fetched electronic invoice if not already added
      const newInvoiceNumber = `FAC-SY-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const newFetchedInvoice: ElectronicInvoice = {
        id: `inv-sy-${Date.now()}`,
        invoiceNumber: newInvoiceNumber,
        originalFilename: `FAC_PIERRE_FABRE_DERMO_${newInvoiceNumber}.pdf`,
        vaultSource: 'cegedim_sy',
        vaultSourceName: 'SY by Cegedim',
        supplierName: 'Pierre Fabre Dermo-Cosmétique (Direct)',
        supplierSiren: '326 123 789',
        supplierTvaIntra: 'FR90326123789',
        supplierType: 'laboratoire_direct',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '2026-09-30',
        status: 'nouvelle_recuperee',
        totalHt: 2041.67,
        totalTtc: 2450.00,
        totalTva: 408.33,
        tvaBreakdown: [
          { rate: 20.0, baseHt: 2041.67, tvaAmount: 408.33 }
        ],
        discountAmount: 306.25,
        rfaBonus: 204.17,
        facturXProfile: 'COMFORT',
        electronicSignatureValid: true,
        signatureTimestamp: new Date().toISOString(),
        pdpCertificationId: `PDP-CEGEDIM-2026-FR-${Math.floor(10000 + Math.random() * 90000)}`,
        linesCount: 35,
        paymentStatus: 'escompte_dispo',
        items: [
          {
            id: `line-${Date.now()}-1`,
            cip13: '3401345678901',
            description: 'Avène Eau Thermale Spray 300ml',
            quantity: 48,
            unitPriceHt: 5.80,
            totalHt: 278.40,
            tvaRate: 20.0,
            lotNumber: `LOT-AVN-${Math.floor(100 + Math.random() * 900)}`,
            expiryDate: '2028-06-30',
            discountPct: 15.0
          }
        ]
      };

      setElectronicInvoices(prev => [newFetchedInvoice, ...prev]);

      // Add log
      const newLog: VaultSyncLog = {
        id: `log-${Date.now()}`,
        timestamp: `22/08/2026 ${syncTime}:00`,
        connectorId,
        invoicesFetched: 1,
        newInvoices: 1,
        matchedOrders: 0,
        totalAmountFetchedTtc: 2450.00,
        status: 'success',
        message: `Interrogation du coffre-fort SY by Cegedim : 1 nouvelle facture Factur-X récupérée (${newFetchedInvoice.supplierName} - 2 450,00 € TTC).`
      };
      setVaultSyncLogs(prev => [newLog, ...prev]);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      showToast(`Synchronisation SY by Cegedim réussie : Facture ${newFetchedInvoice.invoiceNumber} importée.`);
    }, 1200);
  };

  // Import / Reconcile Electronic Invoice into Supplier Orders
  const handleImportInvoiceToOrders = (invoice: ElectronicInvoice) => {
    // 1. Create or match supplier order
    const existingOrder = orders.find(o => o.invoiceNumber === invoice.invoiceNumber);
    if (!existingOrder) {
      const newOrder: SupplierOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `CMD-SY-${invoice.invoiceNumber.replace(/[^0-9]/g, '').slice(-4) || '901'}`,
        supplierName: invoice.supplierName,
        supplierType: invoice.supplierType,
        orderDate: invoice.issueDate,
        deliveryDate: `Réceptionné via Factur-X`,
        status: 'receptionnee',
        itemsCount: invoice.linesCount,
        totalHt: invoice.totalHt,
        totalTtc: invoice.totalTtc,
        discountPercentage: invoice.discountAmount ? (invoice.discountAmount / invoice.totalHt) * 100 : 2.5,
        commercialBonus: invoice.rfaBonus,
        invoiceNumber: invoice.invoiceNumber,
        paymentDueDate: invoice.dueDate,
        paymentStatus: invoice.paymentStatus
      };
      setOrders(prev => [newOrder, ...prev]);
      setSummary(prev => ({
        ...prev,
        pendingSupplierPayables: prev.pendingSupplierPayables + invoice.totalTtc
      }));
    }

    // 2. Mark invoice as matched
    setElectronicInvoices(prev => prev.map(inv => {
      if (inv.id === invoice.id) {
        return {
          ...inv,
          status: 'rapprochee_commande',
          linkedSupplierOrderId: existingOrder ? existingOrder.id : `ord-${Date.now()}`
        };
      }
      return inv;
    }));

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    showToast(`Facture ${invoice.invoiceNumber} intégrée au carnet de commandes et au stock.`);
  };

  // Pay Electronic Invoice via Bank (SEPA Crédit Agricole)
  const handlePayInvoiceViaBank = (invoice: ElectronicInvoice) => {
    // Update invoice status
    setElectronicInvoices(prev => prev.map(inv => {
      if (inv.id === invoice.id) {
        return { ...inv, status: 'payee', paymentStatus: 'payee' };
      }
      return inv;
    }));

    // Update order if matched
    if (invoice.linkedSupplierOrderId || invoice.invoiceNumber) {
      setOrders(prev => prev.map(o => {
        if (o.invoiceNumber === invoice.invoiceNumber || o.id === invoice.linkedSupplierOrderId) {
          return { ...o, paymentStatus: 'payee' };
        }
        return o;
      }));
    }

    // Update summary bank balance
    setSummary(prev => ({
      ...prev,
      currentBankBalance: prev.currentBankBalance - invoice.totalTtc,
      pendingSupplierPayables: Math.max(0, prev.pendingSupplierPayables - invoice.totalTtc)
    }));

    // Add bank transaction
    const newTx: BankTransaction = {
      id: `tx-pay-sy-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      label: `VIR SEPA ${invoice.supplierName.toUpperCase()} FACTURE ${invoice.invoiceNumber} (VIA SY BY CEGEDIM)`,
      type: 'debit',
      amount: invoice.totalTtc,
      category: 'fournisseur',
      status: 'rapproche',
      matchedInvoice: invoice.invoiceNumber,
      bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01'
    };
    setBankTransactions(prev => [newTx, ...prev]);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Paiement de ${invoice.totalTtc.toFixed(2)} € exécuté pour ${invoice.supplierName} via Crédit Agricole.`);
  };

  // Add manual Factur-X / PDF upload
  const handleAddManualFacturX = (file: File | { name: string; size: number }) => {
    const filename = file.name;
    const isGilbert = filename.toLowerCase().includes('gilbert');
    const isSanofi = filename.toLowerCase().includes('sanofi');
    
    const supplier = isGilbert ? 'Laboratoires Gilbert (Direct)' :
                     isSanofi ? 'Opella Healthcare France (Sanofi)' :
                     'Grossiste / Laboratoire Pharma';
    const amountHt = isGilbert ? 1890.00 : isSanofi ? 3180.00 : 1540.00;
    const amountTtc = isGilbert ? 2268.00 : isSanofi ? 3342.18 : 1620.00;
    const invNumber = `FAC-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: ElectronicInvoice = {
      id: `inv-manual-${Date.now()}`,
      invoiceNumber: invNumber,
      originalFilename: filename,
      vaultSource: 'manual_upload',
      vaultSourceName: 'Dépôt Manuel Factur-X',
      supplierName: supplier,
      supplierSiren: '389 456 123',
      supplierTvaIntra: 'FR12389456123',
      supplierType: 'laboratoire_direct',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-09-30',
      status: 'nouvelle_recuperee',
      totalHt: amountHt,
      totalTtc: amountTtc,
      totalTva: amountTtc - amountHt,
      tvaBreakdown: [
        { rate: 2.1, baseHt: amountHt * 0.7, tvaAmount: amountHt * 0.7 * 0.021 },
        { rate: 20.0, baseHt: amountHt * 0.3, tvaAmount: amountHt * 0.3 * 0.20 }
      ],
      discountAmount: amountHt * 0.05,
      rfaBonus: amountHt * 0.03,
      facturXProfile: 'COMFORT',
      electronicSignatureValid: true,
      signatureTimestamp: new Date().toISOString(),
      pdpCertificationId: `PAF-MANUAL-UPLOAD-${Math.floor(1000 + Math.random() * 9000)}`,
      linesCount: 18,
      paymentStatus: 'a_payer',
      items: []
    };

    setElectronicInvoices(prev => [newInvoice, ...prev]);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Factur-X "${filename}" analysé avec succès : ${amountTtc.toFixed(2)} € TTC.`);
  };

  // Update connector settings
  const handleUpdateConnectorConfig = (connectorId: VaultConnectorId, updates: Partial<VaultConnectorConfig>) => {
    setVaultConnectors(prev => prev.map(c => c.id === connectorId ? { ...c, ...updates } : c));
    showToast('Configuration du coffre-fort mise à jour.');
  };

  // --- LCR (Lettres de Change Relevé) Handlers ---
  const handleValidateBap = (statementId: string, signedBy: string, notes?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetStmt = lcrStatements.find(s => s.id === statementId);

    setLcrStatements(prev => prev.map(s => {
      if (s.id === statementId) {
        return {
          ...s,
          status: 'bon_a_payer',
          bapSignedBy: signedBy,
          bapDate: todayStr,
          bapNotes: notes || 'BAP accordé après contrôle des factures et récapitulatifs grossiste.'
        };
      }
      return s;
    }));

    if (targetStmt) {
      logUserAction({
        domain: 'lcr_traites',
        actionType: 'validation_bap_lcr',
        severity: 'info',
        details: `Validation Bon à Payer (BAP) sur relevé LCR ${targetStmt.lcrNumber} (${targetStmt.supplierName})`,
        targetEntity: `LCR ${targetStmt.lcrNumber} - ${targetStmt.supplierName}`,
        previousValue: 'Statut : À contrôler',
        newValue: `Statut : Bon à payer (${targetStmt.totalAmountDrawn.toFixed(2)} € TTC)`,
        financialImpact: -targetStmt.totalAmountDrawn,
        reason: notes || 'Contrôle concordances factures et avoirs grossiste validé'
      });
    }

    showToast(`Bon à Payer (BAP) validé pour le relevé LCR ${targetStmt?.lcrNumber || statementId} (${targetStmt?.supplierName || ''}).`);
  };

  const handleDeclareDispute = (statementId: string, reason: string) => {
    const targetStmt = lcrStatements.find(s => s.id === statementId);

    setLcrStatements(prev => prev.map(s => {
      if (s.id === statementId) {
        const existingReasons = s.discrepancyReasons || [];
        return {
          ...s,
          status: 'litige_partiel',
          discrepancyReasons: [...existingReasons, reason]
        };
      }
      return s;
    }));

    if (targetStmt) {
      logUserAction({
        domain: 'lcr_traites',
        actionType: 'mise_en_litige_lcr',
        severity: 'critique',
        details: `Déclaration de litige sur relevé LCR ${targetStmt.lcrNumber} (${targetStmt.supplierName}) : ${reason}`,
        targetEntity: `LCR ${targetStmt.lcrNumber} - ${targetStmt.supplierName}`,
        previousValue: 'Statut : À contrôler',
        newValue: 'Statut : Litige partiel (opposition bancaire demandée)',
        financialImpact: targetStmt.discrepancyAmount || 0,
        reason: reason
      });
    }

    showToast(`Litige déclaré sur la traite LCR ${targetStmt?.supplierName || ''}. Avis d'opposition partielle transmis.`);
  };

  const handleSimulateLcrDebit = (statementId: string) => {
    const target = lcrStatements.find(s => s.id === statementId);
    if (!target) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const txId = `tx-lcr-debit-${Date.now()}`;

    // Update statement state
    setLcrStatements(prev => prev.map(s => {
      if (s.id === statementId) {
        return {
          ...s,
          status: 'regle_debit',
          paidAtDate: todayStr,
          debitTransactionId: txId
        };
      }
      return s;
    }));

    // Deduct from bank balance and supplier payables
    setSummary(prev => ({
      ...prev,
      currentBankBalance: prev.currentBankBalance - target.totalAmountDrawn,
      pendingSupplierPayables: Math.max(0, prev.pendingSupplierPayables - target.totalAmountDrawn)
    }));

    // Add bank transaction for Crédit Agricole
    const newTx: BankTransaction = {
      id: txId,
      date: todayStr,
      label: `PRLV SEPA LCR ${target.supplierName.toUpperCase()} RELEVE ${target.lcrNumber}`,
      type: 'debit',
      amount: target.totalAmountDrawn,
      category: 'fournisseur',
      status: 'rapproche',
      matchedInvoice: target.lcrNumber,
      bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01',
      reconciliationNotes: `Débit LCR automatique vérifié (${target.invoices.length} factures, ${target.creditNotes.length} avoirs)`
    };
    setBankTransactions(prev => [newTx, ...prev]);

    logUserAction({
      domain: 'banque_reconciliation',
      actionType: 'rapprochement_bancaire',
      severity: 'info',
      details: `Débit bancaire LCR exécuté pour ${target.supplierName} (Relevé ${target.lcrNumber})`,
      targetEntity: newTx.label,
      previousValue: 'Relevé LCR en attente de débit',
      newValue: `Débité et lettré : -${target.totalAmountDrawn.toFixed(2)} €`,
      financialImpact: -target.totalAmountDrawn,
      reason: 'Échéance LCR échue & débit SEPA Crédit Agricole rapproché'
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    showToast(`Prélèvement LCR de ${target.totalAmountDrawn.toFixed(2)} € débité avec succès sur le compte Crédit Agricole.`);
  };

  const handleToggleInvoiceVerification = (statementId: string, invoiceId: string) => {
    setLcrStatements(prev => prev.map(s => {
      if (s.id === statementId) {
        const updatedInvoices = s.invoices.map(inv => {
          if (inv.id === invoiceId) {
            return { ...inv, verified: !inv.verified };
          }
          return inv;
        });
        const verifiedCount = updatedInvoices.filter(i => i.verified).length;
        const totalCount = updatedInvoices.length;
        const newScore = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 100;
        return {
          ...s,
          invoices: updatedInvoices,
          reconciliationScore: newScore
        };
      }
      return s;
    }));
  };

  const handleImportStatement = (newStatement: LcrStatement) => {
    setLcrStatements(prev => [newStatement, ...prev]);
    logUserAction({
      domain: 'lcr_traites',
      actionType: 'validation_bap_lcr',
      severity: 'info',
      details: `Import relevé LCR ${newStatement.lcrNumber} pour ${newStatement.supplierName} (${newStatement.totalAmountDrawn.toFixed(2)} €)`,
      targetEntity: `LCR ${newStatement.lcrNumber}`,
      previousValue: 'Non importé',
      newValue: `${newStatement.invoices.length} factures / ${newStatement.creditNotes.length} avoirs`,
      financialImpact: newStatement.totalAmountDrawn,
      reason: 'Réception télétransmission fichier EDI LCR Banque'
    });
    showToast(`Relevé LCR ${newStatement.lcrNumber} (${newStatement.supplierName}) importé.`);
  };

  // Batch Auto-Lettrage verification handler
  const handleBatchVerifyInvoices = (matchesToApply: { statementId: string; invoiceId: string }[]) => {
    if (matchesToApply.length === 0) return;

    const affectedMap = new Map<string, Set<string>>();
    matchesToApply.forEach(m => {
      if (!affectedMap.has(m.statementId)) {
        affectedMap.set(m.statementId, new Set());
      }
      affectedMap.get(m.statementId)!.add(m.invoiceId);
    });

    let totalAmountApplied = 0;
    const totalInvoicesCount = matchesToApply.length;

    setLcrStatements(prev => prev.map(s => {
      if (affectedMap.has(s.id)) {
        const invoiceIdsToVerify = affectedMap.get(s.id)!;
        const updatedInvoices = s.invoices.map(inv => {
          if (invoiceIdsToVerify.has(inv.id)) {
            totalAmountApplied += inv.amountTtc;
            return { ...inv, verified: true };
          }
          return inv;
        });

        const verifiedCount = updatedInvoices.filter(i => i.verified).length;
        const totalCount = updatedInvoices.length;
        const newScore = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 100;
        
        return {
          ...s,
          invoices: updatedInvoices,
          reconciliationScore: newScore,
          status: (newScore === 100 && s.status === 'a_controler') ? 'bon_a_payer' : s.status
        };
      }
      return s;
    }));

    logUserAction({
      domain: 'lcr_traites',
      actionType: 'auto_lettrage_lcr',
      severity: 'info',
      details: `Auto-lettrage intelligent appliqué : ${totalInvoicesCount} factures pointées avec succès (${affectedMap.size} relevés LCR mis à jour)`,
      targetEntity: `Auto-Lettrage (${totalInvoicesCount} factures)`,
      previousValue: 'Factures en attente de pointage',
      newValue: `Pointage certifié à 100% (Montant total: ${totalAmountApplied.toFixed(2)} €)`,
      financialImpact: totalAmountApplied,
      reason: 'Application des règles de tolérance et rapprochement Factur-X / LGO'
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`Auto-lettrage réussi : ${totalInvoicesCount} facture(s) rapprochée(s) avec succès.`);
  };

  // 1. Bank sync action (Crédit Agricole Open Banking DSP2)
  const handleSyncBank = () => {
    setIsSyncingBank(true);
    setTimeout(() => {
      setIsSyncingBank(false);
      const newSyncTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setLastBankSyncTime(newSyncTime);
      
      logUserAction({
        domain: 'banque_reconciliation',
        actionType: 'synchronisation_flux',
        severity: 'info',
        details: 'Synchronisation Open Banking DSP2 - Flux Crédit Agricole Pro',
        targetEntity: 'Compte Pro Crédit Agricole',
        previousValue: 'Dernière synchro antérieure',
        newValue: `Flux à jour au ${newSyncTime} (${summary.currentBankBalance.toFixed(2)} €)`,
        financialImpact: 0,
        reason: 'Actualisation automatique API Bancaire DSP2'
      });

      showToast('Synchronisation Crédit Agricole Pro réussie : flux et soldes à jour.');
    }, 1200);
  };

  // 2. Pay supplier order
  const handlePayOrder = (orderId: string) => {
    const orderToPay = orders.find(o => o.id === orderId);
    if (!orderToPay) return;

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'payee' } : o));
    setSummary(prev => ({
      ...prev,
      currentBankBalance: prev.currentBankBalance - orderToPay.totalTtc,
      pendingSupplierPayables: Math.max(0, prev.pendingSupplierPayables - orderToPay.totalTtc)
    }));

    // Add corresponding bank debit transaction
    const newTx: BankTransaction = {
      id: `tx-pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      label: `VIR SEPA ${orderToPay.supplierName.toUpperCase()} FACTURE ${orderToPay.invoiceNumber || 'COMPTANT'}`,
      type: 'debit',
      amount: orderToPay.totalTtc,
      category: 'fournisseur',
      status: 'rapproche',
      matchedInvoice: orderToPay.invoiceNumber || orderToPay.orderNumber,
      bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01'
    };
    setBankTransactions(prev => [newTx, ...prev]);

    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'info',
      details: `Règlement facture fournisseur ${orderToPay.supplierName} (${orderToPay.totalTtc.toFixed(2)} € TTC)`,
      targetEntity: `${orderToPay.supplierName} - ${orderToPay.orderNumber}`,
      previousValue: 'Statut : À payer',
      newValue: 'Statut : Payée (Virement SEPA)',
      financialImpact: -orderToPay.totalTtc,
      reason: 'Règlement à échéance validé'
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Règlement de ${orderToPay.supplierName} (${orderToPay.totalTtc.toFixed(2)} €) validé via Crédit Agricole.`);
  };

  // 3. Create new supplier order
  const handleCreateOrder = (newOrderData: Omit<SupplierOrder, 'id'>) => {
    const newOrder: SupplierOrder = {
      id: `ord-${Date.now()}`,
      ...newOrderData
    };
    setOrders(prev => [newOrder, ...prev]);
    setSummary(prev => ({
      ...prev,
      pendingSupplierPayables: prev.pendingSupplierPayables + newOrder.totalTtc
    }));

    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'info',
      details: `Création commande d'achat ${newOrder.orderNumber} (${newOrder.supplierName} - ${newOrder.totalTtc.toFixed(2)} €)`,
      targetEntity: `${newOrder.supplierName} - ${newOrder.orderNumber}`,
      previousValue: 'Nouvelle commande',
      newValue: `Montant : ${newOrder.totalTtc.toFixed(2)} € TTC (${newOrder.itemsCount} lignes)`,
      financialImpact: newOrder.totalTtc,
      reason: 'Réapprovisionnement stock officine'
    });

    showToast(`Commande ${newOrder.orderNumber} enregistrée pour ${newOrder.supplierName}.`);
  };

  // 4. Reconcile bank transaction
  const handleReconcileTransaction = (transactionId: string) => {
    const targetTx = bankTransactions.find(tx => tx.id === transactionId);

    setBankTransactions(prev => prev.map(tx => tx.id === transactionId ? { ...tx, status: 'rapproche' } : tx));

    if (targetTx) {
      logUserAction({
        domain: 'banque_reconciliation',
        actionType: 'rapprochement_bancaire',
        severity: 'info',
        details: `Lettrage et rapprochement comptable de l'écriture : "${targetTx.label}"`,
        targetEntity: targetTx.label,
        previousValue: 'Statut : En attente de pointage',
        newValue: 'Statut : Rapproché / Lettré',
        financialImpact: targetTx.type === 'credit' ? targetTx.amount : -targetTx.amount,
        reason: 'Rapprochement bancaire manuel ou semi-automatique'
      });
    }

    showToast('Écriture bancaire lettrée et rapprochée de la comptabilité.');
  };

  // RESOPHARMA Télétransmission & Rapprochement Handlers
  const handleSyncResopharma = () => {
    setIsSyncingResopharma(true);
    setTimeout(() => {
      setIsSyncingResopharma(false);
      const newLog: ResopharmaSyncLog = {
        id: `sync-reso-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        borderauxFetched: 3,
        totalAmountFetched: 1845.20,
        matchedCount: 2,
        rejectedCount: 0,
        status: 'success',
        message: 'Collecte automatique réussie : 2 retours NOEMIE et 1 bordereau DRE mutuelles traités.'
      };
      setResopharmaSyncLogs(prev => [newLog, ...prev]);
      setResopharmaConfig(prev => ({
        ...prev,
        lastSyncDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        totalBorderauxCount: prev.totalBorderauxCount + 3
      }));

      logUserAction({
        domain: 'resopharma',
        actionType: 'synchronisation_flux',
        severity: 'info',
        details: 'Synchronisation concentrateur Resopharma : 3 nouveaux bordereaux (1 845,20 €)',
        targetEntity: 'Télétransmission NOEMIE / DRE',
        previousValue: 'Bordereaux antérieurs',
        newValue: '3 bordereaux collectés et intégrés au pointage',
        financialImpact: 1845.20,
        reason: 'Télécollecte flux SESAM-Vitale'
      });

      showToast('Télétransmission Resopharma synchronisée : bordereaux NOEMIE et DRE à jour.');
    }, 1200);
  };

  const handleReconcileResopharmaBordereau = (bordereauId: string, matchedTransactionId?: string) => {
    const bordereau = resopharmaBordereaux.find(b => b.id === bordereauId);
    if (!bordereau) return;

    // 1. Update bordereau state
    setResopharmaBordereaux(prev => prev.map(b => {
      if (b.id === bordereauId) {
        return {
          ...b,
          status: 'rapproche_total',
          amountPaid: b.amountTeletrans,
          bankReceivedDate: new Date().toISOString().split('T')[0],
          linkedBankTransactionId: matchedTransactionId || `tx-auto-${Date.now()}`,
          bankTransferRef: matchedTransactionId ? `VIR-${matchedTransactionId}` : `VIR-RESO-${b.bordereauNumber}`,
          reconciliationNotes: `Lettré avec virement bancaire (${b.organismeName})`
        };
      }
      return b;
    }));

    // 2. Update existing bank transaction if specified
    let matchedExisting = false;
    if (matchedTransactionId) {
      setBankTransactions(prev => prev.map(tx => {
        if (tx.id === matchedTransactionId) {
          matchedExisting = true;
          return {
            ...tx,
            status: 'rapproche',
            matchedInvoice: `RESO-${bordereau.bordereauNumber}`,
            reconciliationNotes: `Lettrage validé avec bordereau Resopharma (${bordereau.organismeName} - ${bordereau.fseDetails.length} FSE)`
          };
        }
        return tx;
      }));
    }

    // 3. If no existing bank transaction was linked, add a credited bank transaction and adjust summary
    if (!matchedExisting) {
      const newTx: BankTransaction = {
        id: matchedTransactionId || `tx-reso-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        label: `VIR SEPA ${bordereau.organismeName.toUpperCase()} BORD ${bordereau.bordereauNumber}`,
        type: 'credit',
        amount: bordereau.amountTeletrans,
        category: bordereau.fluxType === 'RO_NOEMIE' ? 'cpam_ro' : 'mutuelles_rc',
        status: 'rapproche',
        matchedInvoice: `RESO-${bordereau.bordereauNumber}`,
        bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01',
        reconciliationNotes: `Règlement télétransmission Resopharma (${bordereau.fseDetails.length} FSE pointées)`
      };
      setBankTransactions(prev => [newTx, ...prev]);
      setSummary(prev => ({
        ...prev,
        currentBankBalance: prev.currentBankBalance + bordereau.amountTeletrans,
        pendingCustomerReceivables: Math.max(0, prev.pendingCustomerReceivables - bordereau.amountTeletrans)
      }));
    }

    logUserAction({
      domain: 'resopharma',
      actionType: 'rapprochement_noemie',
      severity: 'info',
      details: `Rapprochement virement bancaire et bordereau Resopharma ${bordereau.bordereauNumber} (${bordereau.organismeName} - ${bordereau.amountTeletrans.toFixed(2)} €)`,
      targetEntity: `Bordereau ${bordereau.bordereauNumber} (${bordereau.organismeName})`,
      previousValue: 'Statut : En attente virement',
      newValue: `Statut : Rapproché Total (${bordereau.fseDetails.length} FSE)`,
      financialImpact: bordereau.amountTeletrans,
      reason: 'Validation du crédit bancaire correspondant au retour NOEMIE / DRE'
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Bordereau Resopharma ${bordereau.bordereauNumber} (${bordereau.organismeName}) rapproché avec succès.`);
  };

  const handleImportResopharmaBordereaux = (imported: ResopharmaBordereau[]) => {
    setResopharmaBordereaux(prev => [...imported, ...prev]);
    logUserAction({
      domain: 'resopharma',
      actionType: 'rapprochement_noemie',
      severity: 'info',
      details: `Import manuel de ${imported.length} bordereaux Resopharma`,
      targetEntity: `${imported.length} bordereaux importés`,
      previousValue: 'Non importés',
      newValue: 'Intégrés au contrôle',
      financialImpact: imported.reduce((acc, b) => acc + b.amountTeletrans, 0),
      reason: 'Téléchargement manuel fichier NOEMIE/DRE Resopharma'
    });
    showToast(`${imported.length} bordereau(x) Resopharma importé(s) avec succès.`);
  };

  // 5. Destock product (anti-gaspillage & péremptions)
  const handleDestockProduct = (productId: string, actionType: 'retour_labo' | 'promo' | 'destruction') => {
    const targetProduct = products.find(p => p.id === productId);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        if (actionType === 'promo') {
          return { ...p, publicPriceTtc: parseFloat((p.publicPriceTtc * 0.7).toFixed(2)) };
        } else if (actionType === 'retour_labo') {
          return { ...p, stockQty: 0, status: 'optimal' };
        } else {
          return { ...p, stockQty: 0, status: 'optimal' };
        }
      }
      return p;
    }));

    if (targetProduct) {
      const actionLabel = actionType === 'retour_labo' ? 'Demande d\'avoir laboratoire' : actionType === 'promo' ? 'Remise -30% anti-gaspillage' : 'Sortie destruction périmé';
      logUserAction({
        domain: 'stocks',
        actionType: 'destockage_peremption',
        severity: actionType === 'destruction' ? 'critique' : 'warning',
        details: `Action déstockage sur "${targetProduct.name}" (Lot: ${targetProduct.lotNumber}, Pér: ${targetProduct.expiryDate}) : ${actionLabel}`,
        targetEntity: targetProduct.name,
        previousValue: `${targetProduct.stockQty} boîtes en stock`,
        newValue: actionType === 'promo' ? `Prix réduit à ${(targetProduct.publicPriceTtc * 0.7).toFixed(2)} € TTC` : '0 boîte en stock',
        financialImpact: actionType === 'promo' ? -(targetProduct.publicPriceTtc * 0.3 * targetProduct.stockQty) : -(targetProduct.pump * targetProduct.stockQty),
        reason: `Péremption imminente (${targetProduct.daysUntilExpiry} jours restants)`
      });
    }

    showToast(
      actionType === 'retour_labo' ? 'Demande d\'avoir transmise au laboratoire.' :
      actionType === 'promo' ? 'Déstockage -30% appliqué.' : 'Sortie de stock pour destruction enregistrée.'
    );
  };

  // Stock management handlers
  const handleDeleteProduct = (productId: string) => {
    const targetProduct = products.find(p => p.id === productId);

    setProducts(prev => prev.filter(p => p.id !== productId));

    if (targetProduct) {
      logUserAction({
        domain: 'stocks',
        actionType: 'suppression_produit',
        severity: 'warning',
        details: `Suppression de référence de l'inventaire : "${targetProduct.name}" (CIP: ${targetProduct.cip})`,
        targetEntity: targetProduct.name,
        previousValue: `${targetProduct.stockQty} boîtes en stock (PUMP: ${targetProduct.pump.toFixed(2)} €)`,
        newValue: 'Fiche produit supprimée de l\'officine',
        financialImpact: -(targetProduct.stockQty * targetProduct.pump),
        reason: 'Retrait d\'inventaire / Obsolescence'
      });
    }

    showToast('Produit supprimé du stock de l\'officine.');
  };

  const handleAdjustStockQty = (productId: string, newQty: number) => {
    const targetProduct = products.find(p => p.id === productId);
    const oldQty = targetProduct ? targetProduct.stockQty : 0;
    const diffQty = newQty - oldQty;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockQty: newQty,
          status: newQty <= p.minThreshold ? 'low_stock' : p.daysUntilExpiry <= 30 ? 'near_expiry' : 'optimal'
        };
      }
      return p;
    }));

    if (targetProduct) {
      logUserAction({
        domain: 'stocks',
        actionType: 'ajustement_quantite',
        severity: diffQty < 0 ? 'warning' : 'info',
        details: `Ajustement d'inventaire sur "${targetProduct.name}" (${diffQty > 0 ? '+' : ''}${diffQty} boîtes)`,
        targetEntity: targetProduct.name,
        previousValue: `${oldQty} boîtes`,
        newValue: `${newQty} boîtes`,
        financialImpact: diffQty * targetProduct.pump,
        reason: 'Régularisation inventaire physique périodique'
      });
    }
  };

  const handleImportBulkProducts = (imported: ProductStock[]) => {
    setProducts(prev => [...imported, ...prev]);

    logUserAction({
      domain: 'stocks',
      actionType: 'import_inventaire',
      severity: 'info',
      details: `Importation en masse de ${imported.length} références produits`,
      targetEntity: `${imported.length} produits importés`,
      previousValue: 'Inventaire antérieur',
      newValue: `${imported.length} nouvelles références intégrées`,
      financialImpact: imported.reduce((acc, p) => acc + (p.stockQty * p.pump), 0),
      reason: 'Fichier d\'import LGO / Grossiste répartiteurs'
    });

    showToast(`${imported.length} références importées avec succès.`);
  };

  // Predictive stockout reorder handler
  const handleCreatePredictiveSupplierOrder = (orderItems: Array<{ product: ProductStock; quantity: number }>, supplierName: string) => {
    if (orderItems.length === 0) return;

    const totalHt = orderItems.reduce((sum, item) => sum + (item.quantity * item.product.pump), 0);
    const totalTtc = orderItems.reduce((sum, item) => {
      const vatMultiplier = 1 + (item.product.tva / 100);
      return sum + (item.quantity * item.product.pump * vatMultiplier);
    }, 0);

    const orderNumber = `CMD-PREDICT-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const newOrder: SupplierOrder = {
      id: `ord-pred-${Date.now()}`,
      orderNumber,
      supplierName: supplierName || 'OCP Répartition',
      supplierType: supplierName.toLowerCase().includes('direct') ? 'laboratoire_direct' : 'grossiste',
      orderDate: todayStr,
      deliveryDate: todayStr,
      status: 'validee',
      itemsCount: orderItems.length,
      totalHt: Number(totalHt.toFixed(2)),
      totalTtc: Number(totalTtc.toFixed(2)),
      discountPercentage: 2.5,
      commercialBonus: 0,
      paymentDueDate: dueDate.toISOString().split('T')[0],
      paymentStatus: 'a_payer'
    };

    setOrders(prev => [newOrder, ...prev]);
    setSummary(prev => ({
      ...prev,
      pendingSupplierPayables: prev.pendingSupplierPayables + newOrder.totalTtc
    }));

    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'info',
      details: `Génération automatique commande réassort prédictif ${orderNumber} (${orderItems.length} lignes - ${newOrder.totalTtc.toFixed(2)} € TTC)`,
      targetEntity: `Commande Prédictive ${orderNumber} (${newOrder.supplierName})`,
      previousValue: 'Alerte rupture imminente',
      newValue: `Bon de réassort généré (${newOrder.totalTtc.toFixed(2)} € TTC)`,
      financialImpact: newOrder.totalTtc,
      reason: 'Anticipation prédictive des ruptures sur produits essentiels / MITM'
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`Bon de commande réassort ${orderNumber} généré (${orderItems.length} références - ${newOrder.totalTtc.toFixed(2)} € TTC).`);
  };

  // Adjust stock thresholds handler
  const handleAdjustStockThresholds = (productId: string, newMin: number, newMax: number) => {
    const targetProduct = products.find(p => p.id === productId);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          minThreshold: newMin,
          maxThreshold: newMax,
          status: p.stockQty <= newMin ? 'low_stock' : 'optimal'
        };
      }
      return p;
    }));

    if (targetProduct) {
      logUserAction({
        domain: 'stocks',
        actionType: 'ajustement_quantite',
        severity: 'info',
        details: `Mise à jour des seuils d'alerte pour "${targetProduct.name}" : Min ${targetProduct.minThreshold} -> ${newMin}, Max ${targetProduct.maxThreshold} -> ${newMax}`,
        targetEntity: targetProduct.name,
        previousValue: `Min: ${targetProduct.minThreshold} / Max: ${targetProduct.maxThreshold}`,
        newValue: `Min: ${newMin} / Max: ${newMax}`,
        financialImpact: 0,
        reason: 'Recalibrage du seuil de sécurité prédictif'
      });
    }

    showToast(`Seuils de sécurité mis à jour pour ${targetProduct?.name || 'le produit'}.`);
  };

  // Bulk adjust stock thresholds handler (from Simulation Engine)
  const handleBulkAdjustStockThresholds = (adjustments: BulkThresholdAdjustmentItem[]) => {
    if (adjustments.length === 0) return;

    const adjustmentMap = new Map(adjustments.map(a => [a.productId, a]));

    setProducts(prev => prev.map(p => {
      if (adjustmentMap.has(p.id)) {
        const adj = adjustmentMap.get(p.id)!;
        return {
          ...p,
          minThreshold: adj.newMin,
          maxThreshold: adj.newMax,
          status: p.stockQty <= adj.newMin ? 'low_stock' : 'optimal'
        };
      }
      return p;
    }));

    logUserAction({
      domain: 'stocks',
      actionType: 'ajustement_quantite',
      severity: 'info',
      details: `Application du plan d'optimisation prédictif des seuils Min/Max sur ${adjustments.length} références d'officine.`,
      targetEntity: `${adjustments.length} produits`,
      previousValue: 'Seuils historiques non calibrés',
      newValue: 'Seuils prédictifs optimisés selon la vélocité des ventes',
      financialImpact: 0,
      reason: 'Simulation et recalibrage automatique Min/Max'
    });

    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    showToast(`Plan d'optimisation appliqué : ${adjustments.length} références mises à jour.`);
  };

  // Transaction handlers
  const handleAddNewTransaction = (newTxData: Omit<BankTransaction, 'id'>) => {
    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      ...newTxData
    };
    setBankTransactions(prev => [newTx, ...prev]);
    setSummary(prev => ({
      ...prev,
      currentBankBalance: newTx.type === 'credit' 
        ? prev.currentBankBalance + newTx.amount 
        : prev.currentBankBalance - newTx.amount
    }));

    logUserAction({
      domain: 'banque_reconciliation',
      actionType: 'creation_ecriture_bancaire',
      severity: 'info',
      details: `Ajout manuel d'une écriture bancaire : "${newTx.label}" (${newTx.type === 'credit' ? '+' : '-'}${newTx.amount.toFixed(2)} €)`,
      targetEntity: newTx.label,
      previousValue: 'Non existante',
      newValue: `Écriture créée (${newTx.amount.toFixed(2)} € - Catégorie: ${newTx.category})`,
      financialImpact: newTx.type === 'credit' ? newTx.amount : -newTx.amount,
      reason: 'Saisie manuelle d\'écriture bancaire'
    });

    showToast(`Écriture « ${newTx.label} » ajoutée.`);
  };

  const handleDeleteTransaction = (txId: string) => {
    const targetTx = bankTransactions.find(t => t.id === txId);

    setBankTransactions(prev => prev.filter(t => t.id !== txId));

    if (targetTx) {
      logUserAction({
        domain: 'banque_reconciliation',
        actionType: 'suppression_ecriture',
        severity: 'warning',
        details: `Suppression d'écriture bancaire : "${targetTx.label}" (${targetTx.amount.toFixed(2)} €)`,
        targetEntity: targetTx.label,
        previousValue: `${targetTx.amount.toFixed(2)} € (${targetTx.status})`,
        newValue: 'Écriture annulée / supprimée',
        financialImpact: targetTx.type === 'credit' ? -targetTx.amount : targetTx.amount,
        reason: 'Correction d\'écriture erronée ou doublon'
      });
    }

    showToast('Écriture bancaire supprimée.');
  };

  const handleImportBulkTransactions = (imported: BankTransaction[]) => {
    setBankTransactions(prev => [...imported, ...prev]);

    logUserAction({
      domain: 'banque_reconciliation',
      actionType: 'import_releve_bancaire',
      severity: 'info',
      details: `Importation d'un relevé bancaire avec ${imported.length} écritures`,
      targetEntity: `${imported.length} écritures bancaires`,
      previousValue: 'Relevé bancaire antérieur',
      newValue: `${imported.length} écritures importées`,
      financialImpact: imported.reduce((acc, t) => acc + (t.type === 'credit' ? t.amount : -t.amount), 0),
      reason: 'Fichier relevé bancaire OFX/CSV Crédit Agricole'
    });

    showToast(`${imported.length} écritures bancaires importées.`);
  };

  // Internal Audit Sign-off & Manual Observation Handlers
  const handleValidateLogEntry = (logId: string, note?: string) => {
    setAuditLogs(prev => prev.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          isAudited: true,
          auditNote: note || `Contrôlé et visé par ${currentOperator.name} (${currentOperator.role}) le ${new Date().toLocaleDateString('fr-FR')}`
        };
      }
      return log;
    }));
    showToast('Point de contrôle interne validé et signé par le titulaire.');
  };

  const handleAddManualAuditEntry = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    logUserAction(entry);
    showToast('Observation de contrôle interne consignée avec succès.');
  };

  // 6. Update product price from competitor radar
  const handleApplySuggestedPrice = (productId: string, newPriceTtc: number) => {
    setCompetitorPrices(prev => prev.map(cp => {
      if (cp.productId === productId) {
        const simulated = (newPriceTtc / 1.20) - cp.myCostHt;
        const newMargin = (simulated / (newPriceTtc / 1.20)) * 100;
        return {
          ...cp,
          myPriceTtc: newPriceTtc,
          myMarginPercentage: newMargin,
          recommendation: 'prix_optimal'
        };
      }
      return cp;
    }));

    // Update in main product list if present
    setProducts(prev => prev.map(p => {
      if (p.name.toLowerCase().includes('bioderma') && productId === 'comp-prod-2') {
        return { ...p, publicPriceTtc: newPriceTtc };
      }
      if (p.name.toLowerCase().includes('gallia') && productId === 'comp-prod-3') {
        return { ...p, publicPriceTtc: newPriceTtc };
      }
      if (p.name.toLowerCase().includes('nurofen') && productId === 'comp-prod-5') {
        return { ...p, publicPriceTtc: newPriceTtc };
      }
      return p;
    }));

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`Nouveau prix de ${newPriceTtc.toFixed(2)} € synchronisé avec le LGO et les étiquettes électroniques.`);
  };

  // 7. Add recurring expense
  const handleCreateExpense = (expenseData: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      ...expenseData
    };
    setExpenses(prev => [...prev, newExp]);
    showToast(`Dépense récurrente "${newExp.label}" ajoutée au contrôle budgétaire.`);
  };

  const handleUpdateExpense = (id: string, newActual: number) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, actualAmount: newActual } : e));
    showToast('Montant réel de la dépense mis à jour.');
  };

  // 8. Notifications management
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('Toutes les alertes ont été marquées comme lues.');
  };

  const handleSendTestPushNotification = () => {
    const newAlert: PushNotificationAlert = {
      id: `notif-${Date.now()}`,
      title: '🚨 Test Notification Push Mobile / Web',
      message: 'Alerte immédiate : Votre solde bancaire et vos échéances fournisseurs sont surveillés en temps réel.',
      type: 'alerte_budget',
      severity: 'critique',
      timestamp: 'À l\'instant',
      isRead: false,
      actionLink: 'tresorerie'
    };
    setNotifications(prev => [newAlert, ...prev]);

    // Native browser push notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newAlert.title, { body: newAlert.message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    showToast('Notification push envoyée et archivée dans le centre d\'alertes.');
  };

  // 9. API & Connector Health Handlers (Resopharma, CA, SY Cegedim, Chorus Pro...)
  const handleTestConnector = (connectorId: string) => {
    const conn = connectorsHealth.find(c => c.id === connectorId);
    if (!conn) return;

    const randomizedLatency = Math.floor(Math.random() * 45) + 25; // 25ms - 70ms
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    setConnectorsHealth(prev => prev.map(c => {
      if (c.id === connectorId) {
        return {
          ...c,
          status: 'operational',
          latencyMs: randomizedLatency,
          lastCheckedAt: `À ${timestamp}`,
          endpoints: c.endpoints.map(ep => ({ ...ep, status: 'operational', latencyMs: Math.floor(randomizedLatency * 0.9), lastHttpCode: 200 }))
        };
      }
      return c;
    }));

    const newLog: ConnectorHealthLog = {
      id: `health-log-${Date.now()}`,
      connectorId: conn.id,
      connectorName: conn.name,
      timestamp: `Aujourd'hui à ${timestamp}`,
      level: 'success',
      status: 'operational',
      httpCode: 200,
      latencyMs: randomizedLatency,
      message: `Test de communication réussi. Handshake TLS 1.3 valide, temps de réponse ${randomizedLatency}ms.`
    };

    setConnectorHealthLogs(prev => [newLog, ...prev]);

    // Also record in internal audit log
    logUserAction({
      domain: 'securite_systeme',
      actionType: 'synchronisation_flux',
      severity: 'info',
      details: `Test de ping manuel sur l'API ${conn.name} (${conn.endpointUrl}) : Succès HTTP 200 (${randomizedLatency}ms)`,
      targetEntity: conn.name,
      previousValue: conn.status,
      newValue: `Opérationnel (${randomizedLatency}ms)`,
      reason: 'Contrôle périodique de connectivité API'
    });

    showToast(`Test de connexion réussi pour ${conn.name} (latence : ${randomizedLatency}ms)`);
  };

  const handleTestAllConnectors = () => {
    setIsPingingAllConnectors(true);
    showToast('Vérification globale de tous les flux API en cours...');

    setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      setConnectorsHealth(prev => prev.map(c => {
        const randLatency = Math.floor(Math.random() * 50) + 20;
        return {
          ...c,
          status: 'operational',
          latencyMs: randLatency,
          lastCheckedAt: `À ${timestamp}`,
          endpoints: c.endpoints.map(ep => ({ ...ep, status: 'operational', latencyMs: Math.floor(randLatency * 0.9), lastHttpCode: 200 }))
        };
      }));

      const batchLog: ConnectorHealthLog = {
        id: `health-batch-${Date.now()}`,
        connectorId: 'all',
        connectorName: 'Contrôle Global Officine',
        timestamp: `Aujourd'hui à ${timestamp}`,
        level: 'success',
        status: 'operational',
        httpCode: 200,
        latencyMs: 38,
        message: 'Contrôle automatique de l\'ensemble des 8 passerelles API : 100% opérationnelles.'
      };

      setConnectorHealthLogs(prev => [batchLog, ...prev]);
      setIsPingingAllConnectors(false);

      logUserAction({
        domain: 'securite_systeme',
        actionType: 'synchronisation_flux',
        severity: 'info',
        details: 'Audit de santé global des 8 connecteurs API de l\'officine : 100% Opérationnels.',
        targetEntity: '8 Passerelles API Officine',
        previousValue: 'Contrôle continu',
        newValue: '100% Opérationnel',
        reason: 'Diagnostic global santé API'
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {}

      showToast('Toutes les API et passerelles officielles sont opérationnelles !');
    }, 1200);
  };

  const handleSimulateOutage = (connectorId: string) => {
    const conn = connectorsHealth.find(c => c.id === connectorId);
    if (!conn) return;

    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    setConnectorsHealth(prev => prev.map(c => {
      if (c.id === connectorId) {
        return {
          ...c,
          status: 'down',
          latencyMs: 0,
          lastCheckedAt: `À ${timestamp} (Échec)`,
          endpoints: c.endpoints.map(ep => ({ ...ep, status: 'down', latencyMs: 0, lastHttpCode: 503 }))
        };
      }
      return c;
    }));

    const outageLog: ConnectorHealthLog = {
      id: `health-err-${Date.now()}`,
      connectorId: conn.id,
      connectorName: conn.name,
      timestamp: `Aujourd'hui à ${timestamp}`,
      level: 'error',
      status: 'down',
      httpCode: 503,
      latencyMs: 0,
      message: `ALERTE : Perte de liaison avec ${conn.name}. Erreur HTTP 503 Service Unavailable / Timeout. Déclenchement du protocole de secours.`
    };

    setConnectorHealthLogs(prev => [outageLog, ...prev]);

    // Push critical notification
    const alertNotif: PushNotificationAlert = {
      id: `notif-api-down-${Date.now()}`,
      title: `🚨 Panne API Détectée : ${conn.name}`,
      message: `Rupture de communication sur la passerelle ${conn.categoryLabel}. Risque d'interruption des télétransmissions/flux. Consultez le plan de contingence.`,
      type: 'reconciliation_bancaire',
      severity: 'critique',
      timestamp: 'À l\'instant',
      isRead: false,
      actionLink: 'connecteurs'
    };
    setNotifications(prev => [alertNotif, ...prev]);

    logUserAction({
      domain: 'securite_systeme',
      actionType: 'synchronisation_flux',
      severity: 'critique',
      details: `Simulation d'interruption de service sur l'API ${conn.name} (${conn.endpointUrl}) - Déclenchement alerte secours`,
      targetEntity: conn.name,
      previousValue: 'Opérationnel',
      newValue: 'Panne (HTTP 503)',
      reason: 'Exercice de résilience informatique et plan de continuité'
    });

    showToast(`⚠️ Alerte panne déclenchée sur ${conn.name}. Consultez l'état des connecteurs.`);
  };

  const handleRestoreConnector = (connectorId: string) => {
    handleTestConnector(connectorId);
  };

  // Handlers for Price Variations & Laboratory Tariff Increases
  const handleUpdateVariationStatus = (id: string, status: PriceVariationStatus, newPublicPrice?: number) => {
    setPriceVariations(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        status,
        currentPublicPriceTtc: newPublicPrice !== undefined ? newPublicPrice : item.currentPublicPriceTtc
      };
    }));

    if (newPublicPrice !== undefined) {
      const item = priceVariations.find(v => v.id === id);
      if (item) {
        setProducts(prev => prev.map(p => p.cip === item.cip ? { ...p, publicPriceTtc: newPublicPrice } : p));
      }
    }
    
    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'info',
      details: `Mise à jour du statut pour l'alerte variation prix #${id} -> ${status}`,
      targetEntity: id,
      previousValue: '',
      newValue: status,
      reason: 'Traitement alerte tarifaire pharmacien'
    });

    showToast("Statut de la variation tarifaire mis à jour.");
  };

  const handleApplyBatchSimulatedPrices = (updatedVariations: { id: string; newPublicPriceTtc: number }[]) => {
    const updatedMap = new Map(updatedVariations.map(u => [u.id, u.newPublicPriceTtc]));

    setPriceVariations(prev => prev.map(item => {
      if (updatedMap.has(item.id)) {
        const newPrice = updatedMap.get(item.id)!;
        return {
          ...item,
          status: 'prix_vente_ajuste' as PriceVariationStatus,
          currentPublicPriceTtc: newPrice,
          notes: `Prix répercuté à ${newPrice.toFixed(2)} € TTC (simulation marge appliquée le ${new Date().toLocaleDateString('fr-FR')})`
        };
      }
      return item;
    }));

    // Synchronize products stock list with new public prices
    setProducts(prev => prev.map(p => {
      const matching = priceVariations.find(v => v.cip === p.cip && updatedMap.has(v.id));
      if (matching) {
        const newPrice = updatedMap.get(matching.id)!;
        return { ...p, publicPriceTtc: newPrice };
      }
      return p;
    }));

    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'info',
      details: `Application en masse de ${updatedVariations.length} prix de vente simulés pour restaurer la marge officinale`,
      targetEntity: `${updatedVariations.length} produits`,
      previousValue: 'Anciens prix publics',
      newValue: 'Nouveaux prix publics TTC synchronisés en caisse LGO',
      reason: 'Répercussion des hausses tarifs d\'achat'
    });

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    showToast(`${updatedVariations.length} prix de vente public mis à jour et synchronisés en caisse.`);
  };

  const handleContestVariation = (variation: PurchasePriceVariation, letterContent: string) => {
    setPriceVariations(prev => prev.map(v => v.id === variation.id ? { ...v, status: 'en_contestation' } : v));

    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'warning',
      details: `Émission d'un courrier de contestation tarifaire pour ${variation.name} auprès de ${variation.laboratory}`,
      targetEntity: variation.name,
      previousValue: 'non_traite',
      newValue: 'en_contestation',
      reason: 'Hausse excessive du prix d\'achat laboratoire sans préavis'
    });

    showToast(`Courrier de contestation transmis à ${variation.laboratory}.`);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
  };

  // Handlers for Commercial Discounts & RFA Audit
  const handleClaimDiscountDiscrepancy = (discrepancyId: string, contractId: string) => {
    setDiscountContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      return {
        ...c,
        discrepancies: c.discrepancies.map(d => d.id === discrepancyId ? { ...d, status: 'avoir_recu' } : d)
      };
    }));

    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'warning',
      details: `Émission d'une lettre de réclamation d'avoir pour sous-remise commerciale #${discrepancyId}`,
      targetEntity: contractId,
      previousValue: 'a_reclamer',
      newValue: 'avoir_recu',
      reason: 'Contrôle des remises commerciales et régularisation RFA'
    });

    showToast("Réclamation d'avoir envoyée au laboratoire / grossiste.");
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
  };

  const handleReceiveCreditNote = (contractId: string, amount: number) => {
    setDiscountContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      return {
        ...c,
        receivedCreditNotesEuros: c.receivedCreditNotesEuros + amount,
        pendingCreditNotesEuros: Math.max(0, c.pendingCreditNotesEuros - amount)
      };
    }));
    showToast(`Avoir de ${amount.toFixed(2)} € enregistré et déduit avec succès.`);
  };

  const handleTriggerPushNotification = (title: string, message: string, severity: 'critique' | 'attention' | 'info') => {
    const newNotif: PushNotificationAlert = {
      id: `notif-margin-${Date.now()}`,
      title,
      message,
      type: 'marge_chute',
      severity,
      timestamp: 'À l\'instant',
      isRead: false,
      actionLink: 'surveillance_marges'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const criticalExpiries = products.filter(p => p.daysUntilExpiry <= 30);
  const overdueOrders = orders.filter(o => o.paymentStatus === 'en_retard');
  const budgetAlerts = expenses.filter(e => e.actualAmount > e.monthlyBudget);
  const lcrDisputesCount = lcrStatements.filter(s => s.status === 'litige_partiel' || s.discrepancyAmount !== 0).length;
  const lcrToControlCount = lcrStatements.filter(s => s.status === 'a_controler').length;
  const pendingLcrAmount = lcrStatements.filter(s => s.status !== 'regle_debit').reduce((acc, s) => acc + s.totalAmountDrawn, 0);
  const connectorsDownCount = connectorsHealth.filter(c => c.status === 'down').length;
  const priceHikesCount = priceVariations.filter(v => v.deltaAmountHt > 0 && v.status === 'non_traite').length;
  const discountsAnomaliesCount = discountContracts.reduce((acc, c) => acc + c.discrepancies.filter(d => d.status === 'a_reclamer').length, 0);
  const marginAlertsCount = categoryMargins.filter(c => c.isAlertTriggered).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in max-w-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bankBalance={summary.currentBankBalance}
        unreadNotifications={unreadNotifications}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenAccountingModal={() => setActiveTab('rapports')}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenElectronicInvoicingModal={() => setIsElectronicInvoicingModalOpen(true)}
        onOpenResopharmaModal={() => setIsResopharmaModalOpen(true)}
        onOpenDataManagementModal={() => setIsDataManagementModalOpen(true)}
        onOpenOnboardingTour={() => setIsOnboardingTourOpen(true)}
        pharmacyProfile={pharmacyProfile}
        isRealModeActive={isRealModeActive}
        onSyncBank={handleSyncBank}
        isSyncingBank={isSyncingBank}
        lastBankSyncTime={lastBankSyncTime}
        auditLogsCount={auditLogs.length}
        connectorsDownCount={connectorsDownCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />


      {/* Desktop Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalExpiriesCount={criticalExpiries.length}
        unpaidSupplierAlertCount={overdueOrders.length}
        budgetAlertsCount={budgetAlerts.length}
        lcrDisputesCount={lcrDisputesCount}
        lcrToControlCount={lcrToControlCount}
        auditLogsCount={auditLogs.length}
        connectorsDownCount={connectorsDownCount}
        priceHikesCount={priceHikesCount}
        discountsAnomaliesCount={discountsAnomaliesCount}
        marginAlertsCount={marginAlertsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            summary={summary}
            todayStats={todayStats}
            notifications={notifications}
            nearExpiryProducts={criticalExpiries}
            overdueOrders={overdueOrders}
            products={products}
            lcrStatements={lcrStatements}
            resopharmaBordereaux={resopharmaBordereaux}
            expenses={expenses}
            orders={orders}
            categoryMargins={categoryMargins}
            priceVariations={priceVariations}
            discountContracts={discountContracts}
            monthlyReports={monthlyReports}
            isRealModeActive={isRealModeActive}
            onNavigateTab={setActiveTab}
            onSyncBank={handleSyncBank}
            isSyncingBank={isSyncingBank}
            onOpenAccountingModal={() => setActiveTab('rapports')}
            onOpenOnboardingTour={() => setIsOnboardingTourOpen(true)}
            onOpenDataManagement={() => setIsDataManagementModalOpen(true)}
            onOpenElectronicInvoicing={() => setIsElectronicInvoicingModalOpen(true)}
            onOpenResopharma={() => setIsResopharmaModalOpen(true)}
            onResetToDemo={handleResetToDemoData}
          />
        )}

        {activeTab === 'surveillance_marges' && (
          <RealtimeMarginWatchdogView
            categories={categoryMargins}
            onUpdateCategories={setCategoryMargins}
            therapeuticClasses={therapeuticClasses}
            productMargins={productMargins}
            isRealModeActive={isRealModeActive}
            onNavigateTab={setActiveTab}
            onTriggerPushNotification={handleTriggerPushNotification}
            onResetToDemo={handleResetToDemoData}
            onOpenDataManagement={() => setIsDataManagementModalOpen(true)}
          />
        )}

        {activeTab === 'connecteurs' && (
          <ConnectorsStatusView
            connectors={connectorsHealth}
            healthLogs={connectorHealthLogs}
            onTestConnector={handleTestConnector}
            onTestAllConnectors={handleTestAllConnectors}
            onSimulateOutage={handleSimulateOutage}
            onRestoreConnector={handleRestoreConnector}
            isPingingAll={isPingingAllConnectors}
            onOpenResopharmaModal={() => setIsResopharmaModalOpen(true)}
            onOpenElectronicInvoicingModal={() => setIsElectronicInvoicingModalOpen(true)}
            onNavigateToBank={() => setActiveTab('tresorerie')}
          />
        )}

        {activeTab === 'fournisseurs' && (
          <SuppliersOrdersView
            orders={orders}
            onPayOrder={handlePayOrder}
            onCreateOrder={handleCreateOrder}
            onOpenElectronicInvoicingModal={() => setIsElectronicInvoicingModalOpen(true)}
            onSyncVault={() => handleSyncVault('cegedim_sy')}
            onNavigateToLcr={() => setActiveTab('lcr')}
            electronicInvoicesCount={electronicInvoices.length}
            isSyncingVault={isSyncingVault}
            lcrDisputesCount={lcrDisputesCount}
          />
        )}

        {activeTab === 'variations_prix' && (
          <PurchasePriceVariationView
            variations={priceVariations}
            onUpdateVariationStatus={handleUpdateVariationStatus}
            onContestVariation={handleContestVariation}
            onApplyBatchSimulatedPrices={handleApplyBatchSimulatedPrices}
          />
        )}

        {activeTab === 'remises_rfa' && (
          <CommercialDiscountsControlView
            contracts={discountContracts}
            onClaimDiscrepancy={handleClaimDiscountDiscrepancy}
            onReceiveCreditNote={handleReceiveCreditNote}
          />
        )}

        {activeTab === 'lcr' && (
          <LcrControlView
            statements={lcrStatements}
            electronicInvoices={electronicInvoices}
            orders={orders}
            onValidateBap={handleValidateBap}
            onDeclareDispute={handleDeclareDispute}
            onSimulateLcrDebit={handleSimulateLcrDebit}
            onToggleInvoiceVerification={handleToggleInvoiceVerification}
            onImportNewStatement={handleImportStatement}
            onBatchVerifyInvoices={handleBatchVerifyInvoices}
            currentBankBalance={summary.currentBankBalance}
            onOpenElectronicInvoicingVault={() => setIsElectronicInvoicingModalOpen(true)}
          />
        )}

        {activeTab === 'bilan_annuel' && (
          <AnnualCpaBalanceView
            reports={annualCpaReports}
            pharmacyProfile={pharmacyProfile}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'stocks' && (
          <StockExpiryView
            products={products}
            onDestockProduct={handleDestockProduct}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            onAddNewProduct={handleAddNewProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStockQty={handleAdjustStockQty}
            onImportBulkProducts={handleImportBulkProducts}
            onCreateSupplierOrder={handleCreatePredictiveSupplierOrder}
            onAdjustStockThresholds={handleAdjustStockThresholds}
            onBulkAdjustStockThresholds={handleBulkAdjustStockThresholds}
          />
        )}

        {activeTab === 'rh' && (
          <HumanResourcesManagementView
            employees={employees}
            shifts={shifts}
            leaveRequests={leaveRequests}
            overtimeLogs={overtimeLogs}
            trainingPlans={trainingPlans}
            onUpdateEmployees={setEmployees}
            onUpdateShifts={setShifts}
            onUpdateLeaveRequests={setLeaveRequests}
            onUpdateOvertimeLogs={setOvertimeLogs}
            onUpdateTrainingPlans={setTrainingPlans}
            onNavigateTab={setActiveTab}
            onResetToDemo={handleResetToDemoData}
          />
        )}


        {activeTab === 'tresorerie' && (
          <TreasuryBankReconciliationView
            summary={summary}
            transactions={bankTransactions}
            onReconcileTransaction={handleReconcileTransaction}
            onSyncBank={handleSyncBank}
            isSyncingBank={isSyncingBank}
            lastBankSyncTime={lastBankSyncTime}
            onNavigateToLcr={() => setActiveTab('lcr')}
            pendingLcrAmount={pendingLcrAmount}
            lcrDisputesCount={lcrDisputesCount}
            onAddNewTransaction={handleAddNewTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onImportBulkTransactions={handleImportBulkTransactions}
            onOpenResopharmaModal={() => setIsResopharmaModalOpen(true)}
            resopharmaBordereauxCount={resopharmaBordereaux.length}
            resopharmaPendingAmount={resopharmaBordereaux.filter(b => b.status === 'en_attente_virement').reduce((acc, b) => acc + b.amountTeletrans, 0)}
            resopharmaRejectionsCount={resopharmaBordereaux.filter(b => b.status === 'ecart_detecte' || b.status === 'rejet_a_traiter').length}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView
            logs={auditLogs}
            currentOperator={currentOperator}
            availableOperators={availableOperators}
            onChangeCurrentOperator={setCurrentOperator}
            onValidateLogEntry={handleValidateLogEntry}
            onAddManualAuditEntry={handleAddManualAuditEntry}
          />
        )}

        {activeTab === 'depenses' && (
          <RecurringExpensesView
            expenses={expenses}
            onUpdateExpense={handleUpdateExpense}
            onCreateExpense={handleCreateExpense}
          />
        )}

        {activeTab === 'ventes' && (
          <AnnualTrendsSalesView />
        )}

        {activeTab === 'prix' && (
          <CompetitorPriceRadarView
            competitors={MOCK_COMPETITORS}
            priceComparisons={competitorPrices}
            onApplySuggestedPrice={handleApplySuggestedPrice}
          />
        )}

        {activeTab === 'rapports' && (
          <AccountingReportsView
            reports={monthlyReports}
            pharmacyProfile={pharmacyProfile}
            isRealModeActive={isRealModeActive}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
        criticalAlertsTotal={unreadNotifications.length}
      />

      {/* Notifications Modal */}
      <PushNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsNotificationModalOpen(false);
        }}
        onSendTestPushNotification={handleSendTestPushNotification}
      />

      {/* Mobile More Drawer */}
      <MobileMoreMenuModal
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        onSelectTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenAccountingModal={() => setActiveTab('rapports')}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenElectronicInvoicingModal={() => setIsElectronicInvoicingModalOpen(true)}
        onOpenResopharmaModal={() => setIsResopharmaModalOpen(true)}
        onOpenDataManagementModal={() => setIsDataManagementModalOpen(true)}
        onOpenOnboardingTour={() => setIsOnboardingTourOpen(true)}
        unreadCount={unreadNotifications.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Barcode & Datamatrix Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        products={products}
        onUpdateProductStock={handleUpdateProductStock}
        onAddNewProduct={handleAddNewProduct}
      />

      {/* Electronic Invoicing Vault Modal (SY by Cegedim & Factur-X PDP) */}
      <ElectronicInvoicingVaultModal
        isOpen={isElectronicInvoicingModalOpen}
        onClose={() => setIsElectronicInvoicingModalOpen(false)}
        invoices={electronicInvoices}
        vaultConnectors={vaultConnectors}
        syncLogs={vaultSyncLogs}
        onSyncVault={handleSyncVault}
        onImportInvoiceToOrders={handleImportInvoiceToOrders}
        onPayInvoiceViaBank={handlePayInvoiceViaBank}
        onAddManualFacturX={handleAddManualFacturX}
        onUpdateConnectorConfig={handleUpdateConnectorConfig}
        isSyncing={isSyncingVault}
      />

      {/* RESOPHARMA Teletransmission & NOEMIE Reconciliation Modal */}
      <ResopharmaConnectorModal
        isOpen={isResopharmaModalOpen}
        onClose={() => setIsResopharmaModalOpen(false)}
        config={resopharmaConfig}
        bordereaux={resopharmaBordereaux}
        syncLogs={resopharmaSyncLogs}
        bankTransactions={bankTransactions}
        onSync={handleSyncResopharma}
        isSyncing={isSyncingResopharma}
        onReconcileBordereau={handleReconcileResopharmaBordereau}
        onImportBordereaux={handleImportResopharmaBordereaux}
      />

      {/* Data Management & Pharmacy Profile Modal */}
      <DataManagementModal
        isOpen={isDataManagementModalOpen}
        onClose={() => setIsDataManagementModalOpen(false)}
        pharmacyProfile={pharmacyProfile}
        onUpdatePharmacyProfile={handleUpdatePharmacyProfile}
        isRealModeActive={isRealModeActive}
        onToggleRealMode={handleToggleRealMode}
        onResetToDemoData={handleResetToDemoData}
        onClearAllDataToBlank={handleClearAllDataToBlank}
        onRestoreFromJsonBackup={handleRestoreFromJsonBackup}
        onImportBulkProducts={handleImportBulkProducts}
        onImportBulkTransactions={handleImportBulkTransactions}
        onImportBulkOrders={handleImportBulkOrders}
        onImportBulkExpenses={handleImportBulkExpenses}
        onOpenOnboardingTour={() => setIsOnboardingTourOpen(true)}
        summary={summary}
        products={products}
        orders={orders}
        expenses={expenses}
        bankTransactions={bankTransactions}
        lcrStatements={lcrStatements}
        competitorPrices={competitorPrices}
      />

      {/* Onboarding & First Setup Tour Modal */}
      <OnboardingTourModal
        isOpen={isOnboardingTourOpen}
        onClose={() => setIsOnboardingTourOpen(false)}
        pharmacyProfile={pharmacyProfile}
        onOpenDataManagement={() => setIsDataManagementModalOpen(true)}
        onOpenElectronicInvoicing={() => setIsElectronicInvoicingModalOpen(true)}
        onOpenResopharma={() => setIsResopharmaModalOpen(true)}
        onNavigateTab={setActiveTab}
        onResetToDemo={handleResetToDemoData}
        isRealModeActive={isRealModeActive}
      />



    </div>
  );
}
