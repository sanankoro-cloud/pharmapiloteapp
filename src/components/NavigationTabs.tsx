import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  Landmark, 
  Receipt, 
  TrendingUp, 
  Radar, 
  FileText,
  AlertCircle,
  ShieldCheck,
  Activity
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
  connectorsDownCount = 0
}) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'connecteurs',
      label: 'État des Connecteurs',
      icon: Activity,
      badge: connectorsDownCount > 0 ? `${connectorsDownCount} en panne` : 'API Live',
      badgeColor: connectorsDownCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-400/40'
    },
    {
      id: 'fournisseurs',
      label: 'Achats & Fournisseurs',
      icon: Truck,
      badge: unpaidSupplierAlertCount > 0 ? `${unpaidSupplierAlertCount} retard` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'lcr',
      label: 'Contrôle LCR & Traites',
      icon: Receipt,
      badge: lcrDisputesCount > 0 ? `${lcrDisputesCount} litige LCR` : lcrToControlCount > 0 ? `${lcrToControlCount} à pointer` : null,
      badgeColor: lcrDisputesCount > 0 ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'
    },
    {
      id: 'stocks',
      label: 'Stocks & Péremptions',
      icon: Package,
      badge: criticalExpiriesCount > 0 ? `${criticalExpiriesCount} urgents` : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'tresorerie',
      label: 'Trésorerie & Crédit Agricole',
      icon: Landmark,
      badge: 'DSP2 Actif',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/40'
    },
    {
      id: 'audit',
      label: 'Audit & Contrôle Interne',
      icon: ShieldCheck,
      badge: 'PAF Conforme',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 border border-emerald-400/40'
    },
    {
      id: 'depenses',
      label: 'Dépenses & Budget',
      icon: Receipt,
      badge: budgetAlertsCount > 0 ? `${budgetAlertsCount} alertes` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'ventes',
      label: 'Ventes & Tendances N/N-1',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'prix',
      label: 'Veille Prix 50km',
      icon: Radar,
      badge: 'IA Radar',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'rapports',
      label: 'Rapports & FEC',
      icon: FileText,
      badge: null
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
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
