import React from 'react';
import { 
  TrendingUp, 
  Euro, 
  Package, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Landmark, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  Users,
  Percent,
  Calendar,
  Layers,
  Scale
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  PharmacyFinancialSummary, 
  DailySaleStat, 
  PushNotificationAlert, 
  ProductStock, 
  SupplierOrder,
  ExpenseItem
} from '../types/pharmacy';
import { LcrStatement } from '../types/lcr';
import { ResopharmaBordereau } from '../types/resopharma';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { CashFlowForecast30Days } from './CashFlowForecast30Days';
import { MarginGaugeCard } from './MarginGaugeCard';

interface DashboardOverviewProps {
  summary: PharmacyFinancialSummary;
  todayStats: DailySaleStat;
  notifications: PushNotificationAlert[];
  nearExpiryProducts: ProductStock[];
  overdueOrders: SupplierOrder[];
  lcrStatements?: LcrStatement[];
  resopharmaBordereaux?: ResopharmaBordereau[];
  expenses?: ExpenseItem[];
  orders?: SupplierOrder[];
  onNavigateTab: (tab: string) => void;
  onSyncBank: () => void;
  isSyncingBank: boolean;
  onOpenAccountingModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  summary,
  todayStats,
  notifications,
  nearExpiryProducts,
  overdueOrders,
  lcrStatements = [],
  resopharmaBordereaux = [],
  expenses = [],
  orders = [],
  onNavigateTab,
  onSyncBank,
  isSyncingBank,
  onOpenAccountingModal
}) => {
  // TVA colors
  const TVA_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
  const tvaPieData = todayStats.tvaBreakdown.map(item => ({
    name: `TVA ${item.tvaRate}%`,
    value: item.baseHt,
    tvaAmount: item.tvaAmount
  }));

  const paymentData = [
    { name: 'Carte Bancaire', value: todayStats.paymentBreakdown.cb, color: '#3b82f6' },
    { name: 'Tiers-Payant Sécu CPAM', value: todayStats.paymentBreakdown.tiersPayantRo, color: '#10b981' },
    { name: 'Tiers-Payant Mutuelles', value: todayStats.paymentBreakdown.tiersPayantRc, color: '#6366f1' },
    { name: 'Espèces', value: todayStats.paymentBreakdown.especes, color: '#f59e0b' },
    { name: 'Chèques', value: todayStats.paymentBreakdown.cheques, color: '#94a3b8' }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Quick Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Synthèse Officinale en Direct
              </span>
              <span className="text-xs text-slate-400">
                Mise à jour : {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Tableau de Bord Exécutif & Contrôle de Gestion
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Supervision consolidée des achats, de la trésorerie Crédit Agricole, des marges et des alertes de péremption de l'officine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onSyncBank}
              disabled={isSyncingBank}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-600 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingBank ? 'animate-spin' : ''}`} />
              <span>{isSyncingBank ? 'Synchro CA...' : 'Synchro Crédit Agricole'}</span>
            </button>

            <button
              onClick={onOpenAccountingModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/40 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Bilan & FEC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar if overdue orders or near-expiries exist */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Urgent Margin Watchdog Alert Card */}
        <div 
          onClick={() => onNavigateTab('surveillance_marges')}
          className="cursor-pointer bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 rounded-xl p-3.5 flex items-start gap-3 hover:bg-rose-100/80 dark:hover:bg-rose-900/50 transition shadow-md group"
        >
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black text-rose-900 dark:text-rose-200">
                Alerte Marge Parapharmacie (-5,70 pts)
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-rose-600 text-white animate-ping" />
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              Marge à 36,80% vs 42,50% MM3M (chute &gt; 5%). Perte estimée : -1 986 €/mois. Cliquez pour corriger.
            </p>
          </div>
        </div>

        {overdueOrders.length > 0 && (
          <div 
            onClick={() => onNavigateTab('fournisseurs')}
            className="cursor-pointer bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl p-3.5 flex items-start gap-3 hover:bg-rose-100/70 dark:hover:bg-rose-900/40 transition shadow-xs"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {overdueOrders.length} Facture(s) Fournisseur en Retard
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Dont {overdueOrders[0].supplierName} ({formatCurrency(overdueOrders[0].totalTtc)}). Risque de suspension des livraisons.
              </p>
            </div>
          </div>
        )}

        {nearExpiryProducts.length > 0 && (
          <div 
            onClick={() => onNavigateTab('stocks')}
            className="cursor-pointer bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex items-start gap-3 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 transition shadow-xs"
          >
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {nearExpiryProducts.length} Lots à Péremption Imminente (&lt;30j)
              </h2>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Ex: {nearExpiryProducts[0].name} (DLUO {nearExpiryProducts[0].expiryDate}). Action de retour ou déstockage requise.
              </p>
            </div>
          </div>
        )}

        {summary.activeBudgetAlertsCount > 0 && (
          <div 
            onClick={() => onNavigateTab('depenses')}
            className="cursor-pointer bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-xl p-3.5 flex items-start gap-3 hover:bg-orange-100/70 dark:hover:bg-orange-900/40 transition shadow-xs"
          >
            <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-orange-900 dark:text-orange-200">
                {summary.activeBudgetAlertsCount} Alertes Budgétaires
              </h2>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                Dépassement sur l'électricité climatisation et charges salariales ce mois-ci.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Card 1: CA Journalier */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">CA Jour TTC</span>
            <Euro className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.todayCaTtc)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+4.5% vs obj ({formatCurrency(summary.todayCaTarget)})</span>
          </div>
        </div>

        {/* Card 2: Marge Brute */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Taux de Marque</span>
            <Percent className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {summary.todayMarginPct}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Marge HT : {formatCurrency(todayStats.marginHt)}
          </div>
        </div>

        {/* Card 3: Trésorerie Crédit Agricole */}
        <div 
          onClick={() => onNavigateTab('tresorerie')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-600 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Banque (CA Pro)</span>
            <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatCurrency(summary.currentBankBalance)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Connecté DSP2</span>
          </div>
        </div>

        {/* Card 4: Valeur Stock PUMP */}
        <div 
          onClick={() => onNavigateTab('stocks')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Valeur Stock HT</span>
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.totalStockValuePump)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Vente TTC : {formatCurrency(summary.totalStockValuePublic)}
          </div>
        </div>

        {/* Card 5: Encaissements TP en attente */}
        <div 
          onClick={() => onNavigateTab('tresorerie')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Créances TP</span>
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.pendingCustomerReceivables)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            CPAM & Mutuelles à virer
          </div>
        </div>

        {/* Card 6: Factures Fournisseurs 30j */}
        <div 
          onClick={() => onNavigateTab('fournisseurs')}
          className="cursor-pointer bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dettes Fournisseurs</span>
            <CreditCard className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(summary.pendingSupplierPayables)}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
            À régler sous 30 jours
          </div>
        </div>
      </div>

      {/* Margin Gauge Card & Health Scale vs MM3M */}
      <MarginGaugeCard onNavigateTab={onNavigateTab} />

      {/* 30-Day Cash Flow Forecast (NOEMIE/DRE vs LCR/Charges) */}
      <CashFlowForecast30Days
        currentBankBalance={summary.currentBankBalance}
        lcrStatements={lcrStatements}
        resopharmaBordereaux={resopharmaBordereaux}
        expenses={expenses}
        orders={orders}
        onNavigateTab={onNavigateTab}
      />

      {/* Main Charts Row: Hourly Sales Flow + Daily Performance & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hourly Sales Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Activité des Ventes du Jour par Tranche Horaire
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {todayStats.totalTransactions} passages en caisse • {todayStats.prescriptionsCount} ordonnances • Panier moyen : {formatCurrency(todayStats.averageBasketTtc)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Pic d'affluence : 10h-12h
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={todayStats.hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}€`} />
                <Tooltip 
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Chiffre d\'Affaires TTC']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amountTtc" 
                  stroke="#059669" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sub Summary Indicators */}
          <div className="grid grid-cols-3 gap-3 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ordonnances Sécu</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{todayStats.prescriptionsCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Conseil OTC / Parapharmacie</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{todayStats.otcCustomersCount}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Panier Moyen TTC</div>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(todayStats.averageBasketTtc)}</div>
            </div>
          </div>
        </div>

        {/* Breakdown of Payments & TVA (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Encaissements & TVA du Jour
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Ventilation par mode de règlement
            </p>

            {/* Payment bars */}
            <div className="space-y-3">
              {paymentData.map((item, idx) => {
                const percentage = (item.value / todayStats.totalCaTtc) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(item.value)} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%`, backgroundColor: item.color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick TVA Box */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
              <span>Répartition Base HT par TVA</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Officine France</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">TVA 2.1% (Méd.)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(4200)}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-amber-700 dark:text-amber-400 font-semibold">TVA 10% (OTC)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(650)}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-purple-700 dark:text-purple-400 font-semibold">TVA 20% (Para)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(750.20)}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                <span className="text-blue-700 dark:text-blue-400 font-semibold">TVA 5.5% (Bébé)</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(380)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid for Analytical & Audit Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* Module 0: Surveillance des Marges en Temps Réel */}
        <div 
          onClick={() => onNavigateTab('surveillance_marges')}
          className="cursor-pointer group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition border-2 border-rose-400 dark:border-rose-700 bg-rose-50/30 dark:bg-rose-950/30 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                Surveillance Marges Live
              </span>
              <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Watchdog Chute de Marge (&gt;5%)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Détection temps réel par catégorie vs Moyenne Mobile 3M. Alerte critique Parapharmacie (-5,7 pts).
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-black text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg border border-rose-500 shadow-xs self-start">
            Audit Marges Live →
          </div>
        </div>

        {/* Module 1: Variations Prix d'Achat */}
        <div 
          onClick={() => onNavigateTab('variations_prix')}
          className="cursor-pointer group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-600 animate-pulse" />
                Variations Prix d'Achat
              </span>
              <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Alertes Hausses Tarifs & PUMP
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              3 hausses détectées sur Pfizer & OCP (+13% Doliprane). Impact marge estimé à -2 878 €/an. Ajustez vos prix de vente.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-bold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-200/50 self-start">
            Traiter les Alertes →
          </div>
        </div>

        {/* Module 2: Contrôle Remises & RFA */}
        <div 
          onClick={() => onNavigateTab('remises_rfa')}
          className="cursor-pointer group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition border border-teal-200 dark:border-teal-900/60 bg-teal-50/20 dark:bg-teal-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-teal-600" />
                Audit Fournisseurs & RFA
              </span>
              <ArrowUpRight className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Contrôle Remises Commerciales
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              18 949 € de RFA acquises. 2 sous-remises OCP/Urgo à réclamer (+515 €) et 6 881 € d'avoirs en attente.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 hover:bg-teal-200 dark:hover:bg-teal-900/60 px-3 py-1.5 rounded-lg border border-teal-200/50 self-start">
            Auditer les Remises →
          </div>
        </div>

        {/* Module 3: Saisonnalité & Tendances 3 Ans */}
        <div 
          onClick={() => onNavigateTab('ventes')}
          className="cursor-pointer group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Saisonnalité 3 Ans (2024-2026)
              </span>
              <ArrowUpRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Tendances CA & Marge Officine
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Diagnostic comparé sur 3 ans : pics grippaux hivernaux, allergies printanières et creux estivaux pour anticiper les commandes.
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-indigo-200/50 self-start">
            Analyser les Cycles 3 Ans →
          </div>
        </div>

        {/* Module 4: Bilan Annuel Expert-Comptable */}
        <div 
          onClick={() => onNavigateTab('bilan_annuel')}
          className="cursor-pointer group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600" />
                Plaquette Expert-Comptable
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white mb-1">
              Bilan Annuel & Valorisation Interfimo
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Bilan Actif/Passif, SIG, EBE (208 k€), résultat net et valorisation du fonds d'officine à 1,485 M€ (80% du CA HT).
            </p>
          </div>
          <div className="inline-flex items-center text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200/50 self-start">
            Consulter le Bilan Annuel →
          </div>
        </div>
      </div>

      {/* Lower Section: Fast Action shortcuts for Pharmacien Titulaire */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Shortcut 1: Veille Prix 50km */}
        <div 
          onClick={() => onNavigateTab('prix')}
          className="cursor-pointer group bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md hover:shadow-lg transition border border-indigo-700/50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Veille Concurrentielle
            </span>
            <ArrowUpRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">
            Ajustement Prix 50 km
          </h2>
          <p className="text-xs text-indigo-200/80 mb-3">
            5 officines concurrentes scannées. 3 opportunités d'optimisation de marge et de compétitivité détectées.
          </p>
          <div className="inline-flex items-center text-xs font-semibold text-white bg-indigo-600/80 hover:bg-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-400/30">
            Lancer le Radar Concurrentiel →
          </div>
        </div>

        {/* Shortcut 2: Suivi Dépenses Récurrentes */}
        <div 
          onClick={() => onNavigateTab('depenses')}
          className="cursor-pointer group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contrôle Budgétaire
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Dépenses Récurrentes
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Suivi temps réel du loyer, des salaires, du leasing robot Rowa et de la maintenance LGO WinPharma.
          </p>
          <div className="inline-flex items-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg">
            Consulter le Budget →
          </div>
        </div>

        {/* Shortcut 3: Rapprochement Crédit Agricole */}
        <div 
          onClick={() => onNavigateTab('tresorerie')}
          className="cursor-pointer group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-xs hover:shadow-md transition border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5" />
              Open Banking CA
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Rapprochement Bancaire
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Lettrage automatique des flux de télétransmission CPAM et prélèvements grossistes OCP / Alliance.
          </p>
          <div className="inline-flex items-center text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
            Pointer 3 Écritures →
          </div>
        </div>

      </div>

    </div>
  );
};
