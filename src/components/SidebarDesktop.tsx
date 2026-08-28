import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Award, 
  Wallet, 
  Zap, 
  TrendingUp, 
  Users, 
  Stethoscope, 
  FolderArchive, 
  Cpu, 
  Settings, 
  MessageSquare, 
  HeartHandshake, 
  Truck, 
  Activity, 
  Package, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export interface NavItemConfig {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: 'emerald' | 'rose' | 'indigo' | 'amber';
  section: 'pilotage' | 'officine' | 'sante' | 'systeme';
}

export const PRECISION_NAV_ITEMS: NavItemConfig[] = [
  // 1. Pilotage & IA
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, section: 'pilotage' },
  { id: 'smart_ordering', label: 'Smart Ordering IA', icon: Bot, badge: 'IA Pro', badgeColor: 'emerald', section: 'pilotage' },
  { id: 'watchdog', label: 'Pilotage Intelligent', icon: Zap, section: 'pilotage' },
  { id: 'treasury_reconciliation', label: 'Prévisions Trésorerie', icon: Wallet, section: 'pilotage' },
  { id: 'annual_sales', label: 'Ventes & Déclarations TVA', icon: TrendingUp, section: 'pilotage' },

  // 2. Gestion Officinale & Achats
  { id: 'stock_stats', label: 'Optimisation des Stocks', icon: Package, section: 'officine' },
  { id: 'suppliers_orders', label: 'Gestion des Achats & Labos', icon: Truck, section: 'officine' },
  { id: 'robotic_inventory', label: 'Inventaire Robotisé', icon: Cpu, badge: 'Rowa', badgeColor: 'indigo', section: 'officine' },
  { id: 'hr_management', label: 'Ressources Humaines & RH', icon: Users, section: 'officine' },
  { id: 'document_ged', label: 'Échange de Documents & GED', icon: FolderArchive, section: 'officine' },

  // 3. Qualité, Patients & Nouvelles Missions
  { id: 'quality_management', label: 'Management Qualité & BPDO', icon: Award, badge: 'ISO', badgeColor: 'emerald', section: 'sante' },
  { id: 'patient_care', label: 'Suivi Patient & Observance', icon: HeartHandshake, section: 'sante' },
  { id: 'digital_services', label: 'Services Digitaux & Bilans', icon: Stethoscope, badge: 'BPM', badgeColor: 'indigo', section: 'sante' },
  { id: 'health_analytics', label: 'Analyse de Santé & ROSP', icon: Activity, section: 'sante' },

  // 4. Communication & Système
  { id: 'internal_messaging', label: 'Messagerie Interne', icon: MessageSquare, badge: '7 en ligne', badgeColor: 'emerald', section: 'systeme' },
  { id: 'lgo_settings', label: 'Paramètres & LGO', icon: Settings, section: 'systeme' },
];

interface SidebarDesktopProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pharmacyName?: string;
}

export const SidebarDesktop: React.FC<SidebarDesktopProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  pharmacyName = 'Pharmacie Centrale'
}) => {
  const sections = [
    { key: 'pilotage', label: 'Pilotage & IA' },
    { key: 'officine', label: 'Gestion Officinale' },
    { key: 'sante', label: 'Santé & Qualité' },
    { key: 'systeme', label: 'Communication & LGO' },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 text-slate-100 transition-all duration-300 select-none z-30 sticky top-0 h-screen ${
        isCollapsed ? 'w-20' : 'w-64 lg:w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="font-black text-sm text-white tracking-tight flex items-center gap-1.5 truncate">
                <span>PharmaPilot</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PRECISION
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">{pharmacyName}</div>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
        {sections.map(sec => {
          const items = PRECISION_NAV_ITEMS.filter(item => item.section === sec.key);
          if (items.length === 0) return null;

          return (
            <div key={sec.key} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  {sec.label}
                </div>
              )}

              <div className="space-y-1">
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-slate-950 scale-110' : 'text-slate-400 group-hover:text-emerald-400'
                      }`} />

                      {!isCollapsed && (
                        <div className="flex-1 flex items-center justify-between truncate text-left">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                              isActive
                                ? 'bg-slate-900/80 text-emerald-300'
                                : item.badgeColor === 'emerald'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : item.badgeColor === 'rose'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Security Badge */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800 text-slate-400 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>PharmaPilot Precision 2026</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Système conforme BPDO, PGSSI-S et hébergement de données de santé (HDS).
          </p>
        </div>
      )}
    </aside>
  );
};
