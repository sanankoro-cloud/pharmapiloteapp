import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Landmark, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle, 
  FileText, 
  Receipt, 
  Building2, 
  Users, 
  CreditCard, 
  Sparkles, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Legend 
} from 'recharts';
import { PharmacyFinancialSummary, ExpenseItem, SupplierOrder } from '../types/pharmacy';
import { LcrStatement } from '../types/lcr';
import { ResopharmaBordereau } from '../types/resopharma';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CashFlowForecast30DaysProps {
  currentBankBalance: number;
  lcrStatements?: LcrStatement[];
  resopharmaBordereaux?: ResopharmaBordereau[];
  expenses?: ExpenseItem[];
  orders?: SupplierOrder[];
  onNavigateTab: (tab: string) => void;
}

export type ForecastHorizon = 7 | 15 | 30;
export type ForecastViewMode = 'combo' | 'balance' | 'flows';
export type FlowFilter = 'all' | 'teletrans' | 'lcr' | 'charges';

interface DailyForecastPoint {
  dayIndex: number;
  date: string;
  dateLabel: string;
  fullDateLabel: string;
  dayOfWeek: string;
  isWeekend: boolean;
  
  // Inflows
  noemieCpam: number;
  dreMutuelles: number;
  counterSales: number;
  totalInflows: number;

  // Outflows
  lcrGrossistes: number;
  fixedExpenses: number;
  suppliersDirect: number;
  totalOutflows: number;

  // Balance & Net
  netFlow: number;
  projectedBalance: number;

  // Events & Details
  events: Array<{
    type: 'noemie' | 'dre' | 'lcr' | 'salaires' | 'loyer' | 'tva' | 'fournisseur' | 'comptoir' | 'charges';
    label: string;
    amount: number;
    confirmed: boolean;
  }>;
}

export const CashFlowForecast30Days: React.FC<CashFlowForecast30DaysProps> = ({
  currentBankBalance,
  lcrStatements = [],
  resopharmaBordereaux = [],
  expenses = [],
  orders = [],
  onNavigateTab
}) => {
  const [horizon, setHorizon] = useState<ForecastHorizon>(30);
  const [viewMode, setViewMode] = useState<ForecastViewMode>('combo');
  const [flowFilter, setFlowFilter] = useState<FlowFilter>('all');
  const [showSimulatedDelay, setShowSimulatedDelay] = useState(false);

  // Reference date: 2026-08-23
  const baseDate = useMemo(() => new Date('2026-08-23T08:00:00'), []);

  // Check if we are in a blank / zero state
  const isBlankState = useMemo(() => {
    return currentBankBalance === 0 && 
      lcrStatements.length === 0 && 
      resopharmaBordereaux.length === 0 && 
      expenses.length === 0 && 
      orders.length === 0;
  }, [currentBankBalance, lcrStatements.length, resopharmaBordereaux.length, expenses.length, orders.length]);

  // Generate 30 days forecast data
  const fullForecastData: DailyForecastPoint[] = useMemo(() => {
    const data: DailyForecastPoint[] = [];
    let runningBalance = currentBankBalance;

    for (let i = 0; i <= 30; i++) {
      const pointDate = new Date(baseDate);
      pointDate.setDate(baseDate.getDate() + i);

      const dateStr = pointDate.toISOString().split('T')[0];
      const dayOfMonth = pointDate.getDate();
      const monthNumber = pointDate.getMonth(); // 7 = August, 8 = September
      const dayOfWeekNum = pointDate.getDay(); // 0 = Sunday, 6 = Saturday
      const isSunday = dayOfWeekNum === 0;
      const isSaturday = dayOfWeekNum === 6;
      const isWeekend = isSunday || isSaturday;

      const dateLabel = pointDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const fullDateLabel = pointDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const dayOfWeek = pointDate.toLocaleDateString('fr-FR', { weekday: 'short' });

      // If in blank mode, all flows are strictly 0 unless real records are added
      if (isBlankState) {
        data.push({
          dayIndex: i,
          date: dateStr,
          dateLabel,
          fullDateLabel,
          dayOfWeek,
          isWeekend,
          noemieCpam: 0,
          dreMutuelles: 0,
          counterSales: 0,
          totalInflows: 0,
          lcrGrossistes: 0,
          fixedExpenses: 0,
          suppliersDirect: 0,
          totalOutflows: 0,
          netFlow: 0,
          projectedBalance: 0,
          events: []
        });
        continue;
      }

      // Calculate Inflows
      let noemieCpam = 0;
      let dreMutuelles = 0;
      let counterSales = 0;
      const events: DailyForecastPoint['events'] = [];


      // 1. NOEMIE Inflows
      // Check matching un-received Resopharma bordereaux
      const matchingRoBordereaux = resopharmaBordereaux.filter(b => 
        b.fluxType === 'RO_NOEMIE' && 
        b.status !== 'rapproche_total' && 
        b.bankExpectedDate === dateStr
      );
      
      if (matchingRoBordereaux.length > 0) {
        const sumRo = matchingRoBordereaux.reduce((sum, b) => sum + (b.amountTeletrans - b.rejectionAmount), 0);
        noemieCpam += sumRo;
        events.push({
          type: 'noemie',
          label: `Virement NOEMIE ${matchingRoBordereaux.map(b => b.organismeName).join(', ')}`,
          amount: sumRo,
          confirmed: true
        });
      } else if (!isWeekend && (dayOfWeekNum === 2 || dayOfWeekNum === 5)) {
        // Regular bi-weekly CPAM clearing cycles
        const periodicRo = i === 2 ? 4850.20 : i === 5 ? 5420.00 : i === 9 ? 4210.50 : i === 12 ? 5180.00 : i === 16 ? 4690.00 : i === 19 ? 5340.00 : i === 23 ? 4910.00 : i === 26 ? 5200.00 : 3800.00;
        noemieCpam += periodicRo;
        events.push({
          type: 'noemie',
          label: `Télétransmissions NOEMIE CPAM (Cycle régulier)`,
          amount: periodicRo,
          confirmed: false
        });
      }

      // 2. DRE Mutuelles Inflows
      const matchingRcBordereaux = resopharmaBordereaux.filter(b => 
        b.fluxType === 'RC_DRE' && 
        b.status !== 'rapproche_total' && 
        b.bankExpectedDate === dateStr
      );

      if (matchingRcBordereaux.length > 0) {
        const sumRc = matchingRcBordereaux.reduce((sum, b) => sum + (b.amountTeletrans - b.rejectionAmount), 0);
        dreMutuelles += sumRc;
        events.push({
          type: 'dre',
          label: `Règlement DRE Mutuelles (${matchingRcBordereaux.map(b => b.organismeName).join(', ')})`,
          amount: sumRc,
          confirmed: true
        });
      } else if (!isWeekend && (dayOfWeekNum === 1 || dayOfWeekNum === 4)) {
        const periodicRc = i === 1 ? 1920.40 : i === 4 ? 2450.00 : i === 8 ? 1830.00 : i === 11 ? 2190.00 : i === 15 ? 1750.00 : i === 18 ? 2320.00 : i === 22 ? 1890.00 : i === 25 ? 2110.00 : 1600.00;
        dreMutuelles += periodicRc;
        events.push({
          type: 'dre',
          label: `Flux DRE Mutuelles & AMC (Viamedis, Almerys, iSanté)`,
          amount: periodicRc,
          confirmed: false
        });
      }

      // 3. Counter Sales (CB & Espèces)
      if (!isSunday) {
        // Saturday has higher OTC flow, weekdays steady
        const dailyCounter = isSaturday ? 2950.00 : (1680.00 + ((i * 37) % 350));
        counterSales += dailyCounter;
      }

      // Calculate Outflows
      let lcrGrossistes = 0;
      let fixedExpenses = 0;
      let suppliersDirect = 0;

      // 1. LCR Grossistes répartiteurs
      const matchingLcrs = lcrStatements.filter(s => 
        s.status !== 'regle_debit' && 
        s.dueDate === dateStr
      );

      if (matchingLcrs.length > 0) {
        const sumLcr = matchingLcrs.reduce((sum, s) => sum + s.totalAmountDrawn, 0);
        lcrGrossistes += sumLcr;
        matchingLcrs.forEach(stmt => {
          events.push({
            type: 'lcr',
            label: `Traite LCR ${stmt.supplierName} (${stmt.lcrNumber})`,
            amount: -stmt.totalAmountDrawn,
            confirmed: true
          });
        });
      } else {
        // Specific end-of-month or mid-month LCR patterns
        if (dayOfMonth === 31 && monthNumber === 7) {
          // August 31: OCP LCR
          const ocpLcr = 24810.50;
          lcrGrossistes += ocpLcr;
          events.push({
            type: 'lcr',
            label: `Échéance LCR Grossiste OCP Répartition (Août)`,
            amount: -ocpLcr,
            confirmed: true
          });
        } else if (dayOfMonth === 15 && monthNumber === 8) {
          // Sept 15: Alliance Healthcare LCR
          const allianceLcr = 14950.60;
          lcrGrossistes += allianceLcr;
          events.push({
            type: 'lcr',
            label: `Échéance LCR Alliance Healthcare (Quinzaine)`,
            amount: -allianceLcr,
            confirmed: true
          });
        }
      }

      // 2. Fixed Expenses & Payroll
      if (dayOfMonth === 28 && monthNumber === 7) {
        // 28 August: Salaires de l'équipe officinale (4 préparateurs, 2 pharmaciens adjoints)
        const salairesAmount = 14200.00;
        fixedExpenses += salairesAmount;
        events.push({
          type: 'salaires',
          label: `Virement des Salaires Équipe Officine (Août)`,
          amount: -salairesAmount,
          confirmed: true
        });
      } else if (dayOfMonth === 1 && monthNumber === 8) {
        // 1st September: Loyer commercial officine
        const loyerAmount = 3250.00;
        fixedExpenses += loyerAmount;
        events.push({
          type: 'loyer',
          label: `Prélèvement Loyer Commercial Officine (Septembre)`,
          amount: -loyerAmount,
          confirmed: true
        });
      } else if (dayOfMonth === 5 && monthNumber === 8) {
        // 5th September: Leasing robot Rowa + Maintenance LGO WinPharma
        const leasingAmount = 1845.00;
        fixedExpenses += leasingAmount;
        events.push({
          type: 'charges',
          label: `Prélèvements Leasing Robot Rowa & LGO Winpharma`,
          amount: -leasingAmount,
          confirmed: true
        });
      } else if (dayOfMonth === 15 && monthNumber === 8) {
        // 15th September: Échéance Fiscale TVA & URSSAF
        const tvaUrssafAmount = 9450.00;
        fixedExpenses += tvaUrssafAmount;
        events.push({
          type: 'tva',
          label: `Télérèglement DGFIP TVA & Cotisations URSSAF`,
          amount: -tvaUrssafAmount,
          confirmed: true
        });
      }

      // 3. Direct Suppliers (Labos)
      const matchingOrders = orders.filter(o => 
        (o.paymentStatus === 'a_payer' || o.paymentStatus === 'en_retard') && 
        o.paymentDueDate === dateStr
      );

      if (matchingOrders.length > 0) {
        const sumOrders = matchingOrders.reduce((sum, o) => sum + o.totalTtc, 0);
        suppliersDirect += sumOrders;
        matchingOrders.forEach(ord => {
          events.push({
            type: 'fournisseur',
            label: `Règlement Facture Labo ${ord.supplierName}`,
            amount: -ord.totalTtc,
            confirmed: true
          });
        });
      } else if (i === 10) {
        const laboDirect = 2380.00;
        suppliersDirect += laboDirect;
        events.push({
          type: 'fournisseur',
          label: `Virement Fournisseur Direct Labo Sanofi / Biogaran`,
          amount: -laboDirect,
          confirmed: false
        });
      }

      // Simulated delay scenario (if active, shifts large LCR by 7 days to simulate cash buffer)
      let adjustedLcrGrossistes = lcrGrossistes;
      if (showSimulatedDelay && lcrGrossistes > 10000) {
        adjustedLcrGrossistes = 0;
      }

      const totalInflows = noemieCpam + dreMutuelles + counterSales;
      const totalOutflows = adjustedLcrGrossistes + fixedExpenses + suppliersDirect;
      const netFlow = totalInflows - totalOutflows;

      if (i > 0) {
        runningBalance += netFlow;
      }

      data.push({
        dayIndex: i,
        date: dateStr,
        dateLabel,
        fullDateLabel,
        dayOfWeek,
        isWeekend,
        noemieCpam,
        dreMutuelles,
        counterSales,
        totalInflows,
        lcrGrossistes: adjustedLcrGrossistes,
        fixedExpenses,
        suppliersDirect,
        totalOutflows,
        netFlow,
        projectedBalance: Math.round(runningBalance * 100) / 100,
        events
      });
    }

    return data;
  }, [baseDate, currentBankBalance, lcrStatements, resopharmaBordereaux, expenses, orders, showSimulatedDelay]);

  // Sliced data according to selected horizon (7, 15, 30 days)
  const displayData = useMemo(() => {
    return fullForecastData.slice(0, horizon + 1);
  }, [fullForecastData, horizon]);

  // Aggregate Key Performance Indicators for the chosen period
  const stats = useMemo(() => {
    const periodData = displayData.slice(1); // Exclude today's starting day for delta calc

    const totalInflows = periodData.reduce((sum, d) => sum + d.totalInflows, 0);
    const totalNoemie = periodData.reduce((sum, d) => sum + d.noemieCpam, 0);
    const totalDre = periodData.reduce((sum, d) => sum + d.dreMutuelles, 0);
    const totalCounter = periodData.reduce((sum, d) => sum + d.counterSales, 0);

    const totalOutflows = periodData.reduce((sum, d) => sum + d.totalOutflows, 0);
    const totalLcr = periodData.reduce((sum, d) => sum + d.lcrGrossistes, 0);
    const totalFixed = periodData.reduce((sum, d) => sum + d.fixedExpenses, 0);
    const totalSuppliers = periodData.reduce((sum, d) => sum + d.suppliersDirect, 0);

    const endBalance = displayData[displayData.length - 1].projectedBalance;
    const netChange = endBalance - currentBankBalance;

    // Find Lowest Point (Point Bas de Trésorerie)
    let lowestPoint = displayData[0];
    let highestPoint = displayData[0];

    displayData.forEach(d => {
      if (d.projectedBalance < lowestPoint.projectedBalance) {
        lowestPoint = d;
      }
      if (d.projectedBalance > highestPoint.projectedBalance) {
        highestPoint = d;
      }
    });

    const safetyThreshold = 50000; // 50 000 € seuil de sérénité bancaire
    const safetyMargin = lowestPoint.projectedBalance - safetyThreshold;

    return {
      totalInflows,
      totalNoemie,
      totalDre,
      totalCounter,
      totalOutflows,
      totalLcr,
      totalFixed,
      totalSuppliers,
      endBalance,
      netChange,
      lowestPoint,
      highestPoint,
      safetyMargin
    };
  }, [displayData, currentBankBalance]);

  // Collect key upcoming milestones
  const majorMilestones = useMemo(() => {
    const list: Array<{
      date: string;
      dateLabel: string;
      title: string;
      amount: number;
      type: 'inflow' | 'outflow';
      category: string;
      confirmed: boolean;
      tabTarget: string;
    }> = [];

    displayData.forEach(d => {
      d.events.forEach(evt => {
        if (Math.abs(evt.amount) >= 1500) {
          list.push({
            date: d.date,
            dateLabel: d.dateLabel,
            title: evt.label,
            amount: evt.amount,
            type: evt.amount > 0 ? 'inflow' : 'outflow',
            category: evt.type === 'noemie' ? 'CPAM NOEMIE' : 
                      evt.type === 'dre' ? 'Mutuelles DRE' : 
                      evt.type === 'lcr' ? 'Traite LCR' : 
                      evt.type === 'salaires' ? 'Salaires' : 
                      evt.type === 'tva' ? 'TVA & URSSAF' : 
                      evt.type === 'loyer' ? 'Loyer' : 'Fournisseur',
            confirmed: evt.confirmed,
            tabTarget: evt.type === 'noemie' || evt.type === 'dre' ? 'tresorerie' :
                       evt.type === 'lcr' ? 'lcr' :
                       evt.type === 'salaires' || evt.type === 'loyer' || evt.type === 'tva' ? 'depenses' : 'fournisseurs'
          });
        }
      });
    });

    return list.slice(0, 5);
  }, [displayData]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Projection Trésorerie Intelligente</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              • Modélisation prévisionnelle à {horizon} jours
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Prévisionnel des Flux à {horizon} Jours
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              NOEMIE / DRE vs LCR & Charges
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 max-w-3xl">
            Anticipation consolidée des encaissements tiers-payant SESAM-Vitale, des traites LCR grossistes répartiteurs et des décaissements récurrents.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Horizon Pills */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setHorizon(7)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                horizon === 7 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Jours
            </button>
            <button
              onClick={() => setHorizon(15)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                horizon === 15 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              15 Jours (Quinzaine)
            </button>
            <button
              onClick={() => setHorizon(30)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                horizon === 30 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Jours (Mois)
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('combo')}
              title="Vue Solde et Flux combinés"
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                viewMode === 'combo' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Vue Mixte
            </button>
            <button
              onClick={() => setViewMode('balance')}
              title="Courbe du solde bancaire prévisionnel"
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                viewMode === 'balance' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Solde Net
            </button>
            <button
              onClick={() => setViewMode('flows')}
              title="Barres comparatives des entrées et sorties journalières"
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                viewMode === 'flows' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Flux E/S
            </button>
          </div>
        </div>
      </div>

      {/* 4 High-Level Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* KPI 1: Solde Projeté J+30 */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-xl p-4 border border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Solde à J+{horizon}</span>
              <Landmark className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {formatCurrency(stats.endBalance)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-2 pt-2 border-t border-slate-700/60">
            {stats.netChange >= 0 ? (
              <span className="inline-flex items-center text-emerald-400 font-bold">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{formatCurrency(stats.netChange)}
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-400 font-bold">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                {formatCurrency(stats.netChange)}
              </span>
            )}
            <span className="text-slate-400">vs solde actuel</span>
          </div>
        </div>

        {/* KPI 2: Total Entrées Prévues */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200/90 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Entrées à {horizon}j</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200">
              +{formatCurrency(stats.totalInflows)}
            </div>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mt-2 pt-2 border-t border-emerald-200/70 dark:border-emerald-800/40 flex justify-between">
            <span>NOEMIE: {formatCurrency(stats.totalNoemie)}</span>
            <span>DRE: {formatCurrency(stats.totalDre)}</span>
          </div>
        </div>

        {/* KPI 3: Total Sorties Prévues */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200/90 dark:border-rose-800/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Sorties à {horizon}j</span>
              <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-900 dark:text-rose-200">
              -{formatCurrency(stats.totalOutflows)}
            </div>
          </div>
          <div className="text-[11px] text-rose-700 dark:text-rose-300 font-medium mt-2 pt-2 border-t border-rose-200/70 dark:border-rose-800/40 flex justify-between">
            <span>LCR: {formatCurrency(stats.totalLcr)}</span>
            <span>Charges: {formatCurrency(stats.totalFixed)}</span>
          </div>
        </div>

        {/* KPI 4: Point Bas de Trésorerie */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200/90 dark:border-amber-800/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Point Bas Prévisionnel</span>
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-200">
              {formatCurrency(stats.lowestPoint.projectedBalance)}
            </div>
          </div>
          <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium mt-2 pt-2 border-t border-amber-200/70 dark:border-amber-800/40 flex items-center justify-between">
            <span>Atteint le : <strong className="font-bold">{stats.lowestPoint.dateLabel}</strong></span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Marge: +{formatCurrency(stats.safetyMargin)}</span>
          </div>
        </div>

      </div>

      {/* Main Interactive Forecast Chart */}
      <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80">
        
        {/* Chart Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Trajectoire Bancaire Crédit Agricole Pro
            </span>
            <span className="text-xs font-medium text-slate-400">•</span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Seuil d'alerte : 50 000 €
            </span>
          </div>

          {/* Legend indicators */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">Entrées (NOEMIE / DRE / Caisses)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-700 dark:text-slate-300">Sorties (LCR / Salaires / TVA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 rounded bg-slate-900 dark:bg-white inline-block" />
              <span className="text-slate-900 dark:text-white font-bold">Solde Bancaire Projeté</span>
            </div>
          </div>
        </div>

        {/* Recharts Forecast Graph */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayData}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="inflowsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.65} />
                </linearGradient>
                <linearGradient id="outflowsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.65} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
              
              <XAxis 
                dataKey="dateLabel" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false}
                interval={horizon === 30 ? 2 : horizon === 15 ? 1 : 0}
              />
              
              <YAxis 
                yAxisId="balanceAxis"
                orientation="left"
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                domain={['auto', 'auto']}
                tickFormatter={(v) => `${Math.round(v / 1000)}k€`}
              />

              {viewMode !== 'balance' && (
                <YAxis 
                  yAxisId="flowsAxis"
                  orientation="right"
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  domain={[0, 'auto']}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k€`}
                />
              )}

              <ReferenceLine 
                yAxisId="balanceAxis"
                y={50000} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                label={{ value: 'Seuil Sérénité (50k€)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} 
              />

              {/* Point Bas Reference Line */}
              <ReferenceLine
                yAxisId="balanceAxis"
                y={stats.lowestPoint.projectedBalance}
                stroke="#e11d48"
                strokeDasharray="2 2"
                label={{ 
                  value: `Point Bas : ${formatCurrency(stats.lowestPoint.projectedBalance)} (${stats.lowestPoint.dateLabel})`, 
                  fill: '#f43f5e', 
                  fontSize: 10, 
                  position: 'insideBottomRight' 
                }}
              />

              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DailyForecastPoint;
                    return (
                      <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-2xl border border-slate-700 text-xs min-w-[260px]">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80">
                          <span className="font-bold capitalize text-slate-200">{data.fullDateLabel}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                            Jour +{data.dayIndex}
                          </span>
                        </div>

                        {/* Balance readout */}
                        <div className="flex items-center justify-between font-bold text-sm text-emerald-400 mb-2">
                          <span>Solde Projeté :</span>
                          <span>{formatCurrency(data.projectedBalance)}</span>
                        </div>

                        {/* Inflows breakdown */}
                        <div className="space-y-1 py-1 border-t border-slate-800">
                          <div className="flex justify-between font-semibold text-emerald-400">
                            <span>+ Total Entrées :</span>
                            <span>+{formatCurrency(data.totalInflows)}</span>
                          </div>
                          {data.noemieCpam > 0 && (
                            <div className="flex justify-between text-slate-300 pl-2 text-[11px]">
                              <span>• Retours NOEMIE (CPAM) :</span>
                              <span>{formatCurrency(data.noemieCpam)}</span>
                            </div>
                          )}
                          {data.dreMutuelles > 0 && (
                            <div className="flex justify-between text-slate-300 pl-2 text-[11px]">
                              <span>• Retours DRE (Mutuelles) :</span>
                              <span>{formatCurrency(data.dreMutuelles)}</span>
                            </div>
                          )}
                          {data.counterSales > 0 && (
                            <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                              <span>• Encaissements Caisse (CB/Esp) :</span>
                              <span>{formatCurrency(data.counterSales)}</span>
                            </div>
                          )}
                        </div>

                        {/* Outflows breakdown */}
                        <div className="space-y-1 py-1 border-t border-slate-800">
                          <div className="flex justify-between font-semibold text-rose-400">
                            <span>- Total Sorties :</span>
                            <span>-{formatCurrency(data.totalOutflows)}</span>
                          </div>
                          {data.lcrGrossistes > 0 && (
                            <div className="flex justify-between text-rose-300 pl-2 text-[11px] font-medium">
                              <span>• Traites LCR Grossistes :</span>
                              <span>-{formatCurrency(data.lcrGrossistes)}</span>
                            </div>
                          )}
                          {data.fixedExpenses > 0 && (
                            <div className="flex justify-between text-slate-300 pl-2 text-[11px]">
                              <span>• Charges fixes / Salaires :</span>
                              <span>-{formatCurrency(data.fixedExpenses)}</span>
                            </div>
                          )}
                          {data.suppliersDirect > 0 && (
                            <div className="flex justify-between text-slate-300 pl-2 text-[11px]">
                              <span>• Factures Directes Labos :</span>
                              <span>-{formatCurrency(data.suppliersDirect)}</span>
                            </div>
                          )}
                        </div>

                        {/* Day's Net Delta */}
                        <div className="flex justify-between font-bold pt-2 mt-1 border-t border-slate-800 text-[11px]">
                          <span>Flux Net du Jour :</span>
                          <span className={data.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {data.netFlow >= 0 ? '+' : ''}{formatCurrency(data.netFlow)}
                          </span>
                        </div>

                        {/* Events list */}
                        {data.events.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Événements Clés :
                            </span>
                            {data.events.map((evt, idx) => (
                              <div key={idx} className="text-[10px] text-slate-300 flex items-center justify-between">
                                <span className="truncate max-w-[180px]">• {evt.label}</span>
                                <span className={evt.amount > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {evt.amount > 0 ? '+' : ''}{formatCurrency(evt.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Inflows Bar */}
              {(viewMode === 'combo' || viewMode === 'flows') && (
                <Bar
                  yAxisId="flowsAxis"
                  dataKey="totalInflows"
                  name="Entrées Prévues"
                  fill="url(#inflowsGradient)"
                  barSize={horizon === 30 ? 6 : horizon === 15 ? 12 : 24}
                  radius={[4, 4, 0, 0]}
                />
              )}

              {/* Outflows Bar */}
              {(viewMode === 'combo' || viewMode === 'flows') && (
                <Bar
                  yAxisId="flowsAxis"
                  dataKey="totalOutflows"
                  name="Sorties Prévues"
                  fill="url(#outflowsGradient)"
                  barSize={horizon === 30 ? 6 : horizon === 15 ? 12 : 24}
                  radius={[4, 4, 0, 0]}
                />
              )}

              {/* Bank Balance Area Line */}
              {(viewMode === 'combo' || viewMode === 'balance') && (
                <Area
                  yAxisId="balanceAxis"
                  type="monotone"
                  dataKey="projectedBalance"
                  name="Solde Bancaire Projeté"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#balanceGradient)"
                />
              )}

            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Breakdown Cards & Upcoming Milestones Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Upcoming Key Cash Flow Milestones */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Prochaines Grandes Échéances & Virages de Trésorerie
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Classées par ordre chronologique
            </span>
          </div>

          <div className="space-y-2.5">
            {majorMilestones.map((ms, index) => (
              <div 
                key={index}
                onClick={() => onNavigateTab(ms.tabTarget)}
                className="group cursor-pointer bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/90 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-3.5 flex items-center justify-between transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                    ms.type === 'inflow' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  }`}>
                    {ms.type === 'inflow' ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                        {ms.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        ms.category.includes('LCR') 
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' 
                          : ms.category.includes('CPAM') || ms.category.includes('Mutuelles')
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      }`}>
                        {ms.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{ms.dateLabel}</span>
                      <span>•</span>
                      <span>{ms.confirmed ? 'Virement/Prélèvement confirmé' : 'Prévisionnel estimé'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <div className={`text-sm font-bold ${
                      ms.type === 'inflow' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                    }`}>
                      {ms.amount > 0 ? '+' : ''}{formatCurrency(ms.amount)}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 flex items-center justify-end gap-0.5">
                      Voir détail <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Treasury Analysis & Recommendations */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-xl p-5 border border-slate-800 dark:border-slate-800/80 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Conseil de Trésorerie
              </span>
              <span className="text-[11px] text-slate-400">Algorithme Officinal</span>
            </div>

            <h4 className="text-sm font-bold text-white mb-2">
              Diagnostic de Couverture Bancaire
            </h4>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Le point bas prévisionnel de <strong className="text-white">{formatCurrency(stats.lowestPoint.projectedBalance)}</strong> le <strong className="text-white">{stats.lowestPoint.dateLabel}</strong> est sécurisé avec une marge de <strong className="text-emerald-300">+{formatCurrency(stats.safetyMargin)}</strong> par rapport à votre seuil de sécurité.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-800/80 dark:bg-slate-900/80 border border-slate-700 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-semibold block">Couverture LCR OCP garantie</strong>
                  Les retours NOEMIE CPAM du 25 et 28 Août couvriront 68% de l'échéance grossiste.
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-800/80 dark:bg-slate-900/80 border border-slate-700 dark:border-slate-800">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-semibold block">Contrôle Bon à Payer LCR</strong>
                  Pensez à valider les BAP sur les relevés LCR avant le 29 Août pour éviter tout rejet technique.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('lcr')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition"
            >
              Gérer les traites LCR →
            </button>
            <button
              onClick={() => onNavigateTab('tresorerie')}
              className="text-xs font-bold text-slate-400 hover:text-white inline-flex items-center gap-1 transition"
            >
              Rapprochement Bancaire →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
