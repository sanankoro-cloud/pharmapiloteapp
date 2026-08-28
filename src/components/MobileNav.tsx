import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Package, 
  Landmark, 
  Activity, 
  MoreHorizontal 
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMoreMenu: () => void;
  criticalAlertsTotal: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMoreMenu,
  criticalAlertsTotal
}) => {
  const mainMobileTabs = [
    { id: 'dashboard', label: 'Bord', icon: LayoutDashboard },
    { id: 'smart_ordering', label: 'Smart IA', icon: Bot },
    { id: 'stocks', label: 'Stocks', icon: Package },
    { id: 'tresorerie', label: 'Banque', icon: Landmark },
    { id: 'health_analytics', label: 'Santé ROSP', icon: Activity }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {mainMobileTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || 
                           (tab.id === 'tresorerie' && activeTab === 'treasury_reconciliation') ||
                           (tab.id === 'stocks' && activeTab === 'stock_stats');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all cursor-pointer ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400 scale-110' : ''}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More menu button for mobile */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative cursor-pointer ${
            !['dashboard', 'smart_ordering', 'stocks', 'stock_stats', 'tresorerie', 'treasury_reconciliation', 'health_analytics'].includes(activeTab) 
              ? 'text-emerald-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Modules (16)</span>
          {criticalAlertsTotal > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900" />
          )}
        </button>
      </div>
    </nav>
  );
};
