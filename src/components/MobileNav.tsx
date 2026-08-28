import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  Landmark, 
  Radar, 
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
    { id: 'fournisseurs', label: 'Achats', icon: Truck },
    { id: 'stocks', label: 'Stocks', icon: Package },
    { id: 'tresorerie', label: 'Banque', icon: Landmark },
    { id: 'prix', label: 'Veille 50km', icon: Radar }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {mainMobileTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
                isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400 scale-110' : ''}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More menu button for mobile (Access Ventes, Dépenses, Rapports, Notifs) */}
        <button
          onClick={onOpenMoreMenu}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative ${
            ['depenses', 'ventes', 'rapports', 'rh', 'bilan_annuel', 'remises_rfa', 'variations_prix', 'lcr', 'audit', 'connecteurs'].includes(activeTab) 
              ? 'text-emerald-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Plus</span>
          {criticalAlertsTotal > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900" />
          )}
        </button>
      </div>
    </nav>
  );
};
