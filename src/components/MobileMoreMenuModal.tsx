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
  Scale
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
  unreadCount,
  isDarkMode = false,
  onToggleDarkMode
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'variations_prix',
      label: 'Variations du Prix d\'Achat (PUMP)',
      sub: 'Alertes hausses laboratoires & impact marge',
      icon: TrendingUp,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
    },
    {
      id: 'remises_rfa',
      label: 'Contrôle des Remises & RFA',
      sub: 'Audit sous-remises, avoirs & paliers volume',
      icon: Percent,
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60'
    },
    {
      id: 'bilan_annuel',
      label: 'Bilan Annuel Expert-Comptable',
      icon: Scale,
      sub: 'Actif/Passif, SIG, Ratios & Valorisation Interfimo',
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'connecteurs',
      label: 'État des Connecteurs & Santé API',
      sub: 'Surveillance Resopharma, CA, SY PDP, Chorus Pro',
      icon: Activity,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'lcr',
      label: 'Contrôle LCR & Traites Fournisseurs',
      sub: 'Pointage factures, avoirs déduits & BAP',
      icon: Receipt,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
    },
    {
      id: 'depenses',
      label: 'Dépenses Récurrentes & Budget',
      sub: 'Loyer, salaires, WinPharma, leasing robot',
      icon: Receipt,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
    },
    {
      id: 'ventes',
      label: 'Ventes & Tendances N vs N-1',
      sub: 'Analyse mensuelle, marge et saisonnalité',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'audit',
      label: 'Journal d\'Audit & Contrôle Interne',
      sub: 'Traçabilité des mouvements de stocks et lettrages bancaires',
      icon: ShieldCheck,
      color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      id: 'rapports',
      label: 'Rapports Comptables & FEC',
      sub: 'Export bilan mensuel et déclarations TVA',
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
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
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Menu Général Officine</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Accès rapide aux modules financiers</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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

        {/* Action List */}
        <div className="space-y-2 mt-2">
          <button
            onClick={() => {
              onClose();
              onOpenBarcodeScanner();
            }}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-left transition shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <Scan className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <span>Scanner Code-Barres / Caméra</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 text-[9px] font-bold">LIVE</span>
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Identification Datamatrix & entrées de stock instantanées</div>
            </div>
          </button>

          {onOpenResopharmaModal && (
            <button
              onClick={() => {
                onClose();
                onOpenResopharmaModal();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/80 dark:bg-purple-950/40 text-left transition shadow-xs"
            >
              <div className="p-2.5 rounded-xl bg-purple-600 text-white">
                <Network className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                  <span>Connecteur Resopharma</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-100 text-[9px] font-bold">NOEMIE</span>
                </div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400">Télétransmission TP, retours NOEMIE & bordereaux DRE</div>
              </div>
            </button>
          )}

          {onOpenElectronicInvoicingModal && (
            <button
              onClick={() => {
                onClose();
                onOpenElectronicInvoicingModal();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-left transition shadow-xs"
            >
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <span>Coffre-Fort Factures (SY by Cegedim)</span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100 text-[9px] font-bold">Factur-X</span>
                </div>
                <div className="text-[10px] text-indigo-700 dark:text-indigo-400">Collecte automatique PDP & rapprochement DGFIP</div>
              </div>
            </button>
          )}

          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition"
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

          <button
            onClick={() => {
              onClose();
              onOpenNotifications();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition bg-slate-50/50 dark:bg-slate-800/40"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications & Alertes</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Retards paiements, budget et DLUO</div>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200">
          <div className="font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mode Mobile & Distance Activé</span>
          </div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
            Synchronisation continue avec le LGO de la pharmacie et le compte Crédit Agricole.
          </p>
        </div>

      </div>
    </div>
  );
};

