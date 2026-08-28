import React from 'react';
import { 
  LayoutDashboard, 
  Bot,
  Award,
  Truck, 
  Package, 
  Landmark, 
  Receipt, 
  TrendingUp, 
  Radar, 
  FileText, 
  AlertCircle, 
  ShieldCheck, 
  Activity,
  Percent,
  Scale,
  ShieldAlert,
  Users,
  Stethoscope,
  FolderArchive,
  Cpu,
  Settings,
  MessageSquare,
  HeartHandshake
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalExpiriesCount: number;
  unpaidSupplierAlertCount: number;
  budgetAlertsCount: number;
  lcrDisputesCount?: number;
  lcrToControlCount?: number;
  auditLogsCount?: number;
  connectorsDownCount?: number;
  priceHikesCount?: number;
  discountsAnomaliesCount?: number;
  marginAlertsCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  criticalExpiriesCount,
  unpaidSupplierAlertCount,
  budgetAlertsCount,
  lcrDisputesCount = 1,
  lcrToControlCount = 1,
  auditLogsCount = 12,
  connectorsDownCount = 0,
  priceHikesCount = 3,
  discountsAnomaliesCount = 2,
  marginAlertsCount = 1
}) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'smart_ordering',
      label: 'Smart Ordering IA',
      icon: Bot,
      badge: 'IA Pro',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'quality_management',
      label: 'Management Qualité',
      icon: Award,
      badge: 'BPDO',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'tresorerie',
      label: 'Prévisions Trésorerie',
      icon: Landmark,
      badge: 'DSP2 Actif',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/40'
    },
    {
      id: 'surveillance_marges',
      label: 'Pilotage Intelligent',
      icon: ShieldAlert,
      badge: marginAlertsCount > 0 ? 'Alerte -5,7%' : 'MM3M OK',
      badgeColor: marginAlertsCount > 0 ? 'bg-rose-600 text-white animate-pulse shadow-xs font-black' : 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/40'
    },
    {
      id: 'ventes',
      label: 'Ventes & TVA',
      icon: TrendingUp,
      badge: '2024-2026',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'rh',
      label: 'Ressources Humaines',
      icon: Users,
      badge: '7 salariés',
      badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/40 font-bold'
    },
    {
      id: 'digital_services',
      label: 'Services Digitaux',
      icon: Stethoscope,
      badge: 'BPM',
      badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/40'
    },
    {
      id: 'document_ged',
      label: 'Échange de Documents',
      icon: FolderArchive,
      badge: 'PAF 10 ans',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'robotic_inventory',
      label: 'Inventaire Robotisé',
      icon: Cpu,
      badge: 'Rowa',
      badgeColor: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-400/40'
    },
    {
      id: 'lgo_settings',
      label: 'Paramètres & LGO',
      icon: Settings,
      badge: 'Connecté',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'internal_messaging',
      label: 'Messagerie Interne',
      icon: MessageSquare,
      badge: '7 actifs',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'patient_care',
      label: 'Suivi Patient',
      icon: HeartHandshake,
      badge: 'DP Actif',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'fournisseurs',
      label: 'Gestion des Achats',
      icon: Truck,
      badge: unpaidSupplierAlertCount > 0 ? `${unpaidSupplierAlertCount} retard` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'health_analytics',
      label: 'Analyse de Santé',
      icon: Activity,
      badge: 'ROSP 2026',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'stocks',
      label: 'Optimisation des Stocks',
      icon: Package,
      badge: criticalExpiriesCount > 0 ? `${criticalExpiriesCount} urgents` : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'variations_prix',
      label: 'Variations Prix',
      icon: TrendingUp,
      badge: priceHikesCount > 0 ? `${priceHikesCount} hausses` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    {
      id: 'remises_rfa',
      label: 'Contrôle RFA',
      icon: Percent,
      badge: discountsAnomaliesCount > 0 ? `${discountsAnomaliesCount} écarts` : 'Audit OK',
      badgeColor: discountsAnomaliesCount > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/40'
    },
    {
      id: 'lcr',
      label: 'Contrôle LCR',
      icon: Receipt,
      badge: lcrDisputesCount > 0 ? `${lcrDisputesCount} litige` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'bilan_annuel',
      label: 'Bilan Expert-Comptable',
      icon: Scale,
      badge: 'Interfimo',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
    },
    {
      id: 'prix',
      label: 'Veille Prix 50km',
      icon: Radar,
      badge: 'IA Radar',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || 
                             (tab.id === 'surveillance_marges' && activeTab === 'watchdog') ||
                             (tab.id === 'tresorerie' && activeTab === 'treasury_reconciliation') ||
                             (tab.id === 'ventes' && activeTab === 'annual_sales') ||
                             (tab.id === 'rh' && activeTab === 'hr_management') ||
                             (tab.id === 'fournisseurs' && activeTab === 'suppliers_orders') ||
                             (tab.id === 'stocks' && activeTab === 'stock_stats');

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
