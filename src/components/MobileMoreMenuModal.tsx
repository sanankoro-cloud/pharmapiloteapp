import React from 'react';
import { 
  Receipt, 
  TrendingUp, 
  FileText, 
  Bell, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  HelpCircle, 
  X,
  Building,
  Building2,
  Scan,
  Camera,
  Network,
  Sun,
  Moon,
  Activity,
  Percent,
  Scale,
  ShieldAlert,
  Database,
  Compass,
  Users,
  Bot,
  Award,
  Stethoscope,
  FolderArchive,
  Cpu,
  Settings,
  MessageSquare,
  HeartHandshake,
  Package,
  Truck
} from 'lucide-react';

interface MobileMoreMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenAccountingModal: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenElectronicInvoicingModal?: () => void;
  onOpenResopharmaModal?: () => void;
  onOpenDataManagementModal?: () => void;
  onOpenOnboardingTour?: () => void;
  unreadCount: number;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const MobileMoreMenuModal: React.FC<MobileMoreMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenNotifications,
  onOpenAccountingModal,
  onOpenBarcodeScanner,
  onOpenElectronicInvoicingModal,
  onOpenResopharmaModal,
  onOpenDataManagementModal,
  onOpenOnboardingTour,
  unreadCount,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  if (!isOpen) return null;

  const precisionScreens = [
    {
      id: 'smart_ordering',
      label: '2. Smart Ordering IA',
      sub: 'Commandes prédictives & ruptures MITM',
      icon: Bot,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'quality_management',
      label: '3. Management Qualité',
      sub: 'Démarche qualité BPDO & non-conformités',
      icon: Award,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'surveillance_marges',
      label: '5. Pilotage Intelligent',
      sub: 'Surveillance des marges & seuils de vigilance',
      icon: ShieldAlert,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
    },
    {
      id: 'ventes',
      label: '6. Ventes & TVA',
      sub: 'Ventilation des taux TVA & comparatif 3 ans',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'rh',
      label: '7. Ressources Humaines',
      sub: 'Planning officine, congés & masse salariale',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      id: 'digital_services',
      label: '8. Services Digitaux',
      sub: 'Bilans de médication BPM, entretiens & vaccins',
      icon: Stethoscope,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      id: 'document_ged',
      label: '9. Échange de Documents (GED)',
      sub: 'Coffre-fort factures Factur-X & PAF 10 ans',
      icon: FolderArchive,
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'robotic_inventory',
      label: '10. Inventaire Robotisé',
      sub: 'Supervision BD Rowa / automates & cadencier',
      icon: Cpu,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60'
    },
    {
      id: 'lgo_settings',
      label: '11. Paramètres & LGO',
      sub: 'Liaison WinPharma, LGPI & seuils d\'alertes',
      icon: Settings,
      color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
    },
    {
      id: 'internal_messaging',
      label: '12. Messagerie Interne',
      sub: 'Consignes de comptoir & passation de relève',
      icon: MessageSquare,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'patient_care',
      label: '13. Suivi Patient',
      sub: 'Dossier pharmaceutique, ALD & interactions',
      icon: HeartHandshake,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'fournisseurs',
      label: '14. Gestion des Achats',
      sub: 'Commandes labos, grossistes & délais de paiement',
      icon: Truck,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      id: 'health_analytics',
      label: '15. Analyse de Santé & ROSP',
      sub: 'Indicateurs conventionnels & génériques',
      icon: Activity,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'stocks',
      label: '16. Optimisation des Stocks',
      sub: 'Rotation, DLUO & alertes surstocks',
      icon: Package,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/70 backdrop-blur-xs p-0 sm:hidden">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl w-full p-5 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-slide-up max-h-[85vh] overflow-y-auto text-slate-900 dark:text-slate-100">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              ✚
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">PharmaPilot Precision • 16 Modules</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Navigation complète de l'officine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dark Mode Switcher in Drawer */}
        {onToggleDarkMode && (
          <div className="my-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-700'}`}>
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Mode Sombre & Nuit</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Confort visuel pour inventaires tardifs</div>
              </div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isDarkMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
              role="switch"
              aria-checked={isDarkMode}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* Quick Tools */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <button
            onClick={() => {
              onClose();
              onOpenBarcodeScanner();
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-left transition text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer"
          >
            <Scan className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Scanner Datamatrix</span>
          </button>

          {onOpenDataManagementModal && (
            <button
              onClick={() => {
                onClose();
                onOpenDataManagementModal();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30 text-left transition text-xs font-bold text-indigo-900 dark:text-indigo-200 cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Gérer Données</span>
            </button>
          )}
        </div>

        {/* 16 Precision Screens List */}
        <div className="space-y-2">
          {precisionScreens.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition cursor-pointer"
              >
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
