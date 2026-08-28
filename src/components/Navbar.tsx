import React from 'react';
import { 
  Building2, 
  Bell, 
  RefreshCw, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  Scan,
  Network,
  Sun,
  Moon,
  Activity,
  Database,
  SlidersHorizontal,
  Sparkles,
  Compass
} from 'lucide-react';
import { PushNotificationAlert, PharmacyProfile } from '../types/pharmacy';
import { formatCurrency } from '../utils/formatters';


interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bankBalance: number;
  unreadNotifications: PushNotificationAlert[];
  onOpenNotifications: () => void;
  onOpenAccountingModal: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenElectronicInvoicingModal: () => void;
  onOpenResopharmaModal?: () => void;
  onOpenDataManagementModal?: () => void;
  onOpenOnboardingTour?: () => void;
  pharmacyProfile?: PharmacyProfile;
  isRealModeActive?: boolean;
  onSyncBank: () => void;
  isSyncingBank: boolean;
  lastBankSyncTime: string;
  auditLogsCount?: number;
  connectorsDownCount?: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bankBalance,
  unreadNotifications,
  onOpenNotifications,
  onOpenAccountingModal,
  onOpenBarcodeScanner,
  onOpenElectronicInvoicingModal,
  onOpenResopharmaModal,
  onOpenDataManagementModal,
  onOpenOnboardingTour,
  pharmacyProfile,
  isRealModeActive = false,
  onSyncBank,
  isSyncingBank,
  lastBankSyncTime,
  auditLogsCount = 12,
  connectorsDownCount = 0,
  isDarkMode,
  onToggleDarkMode
}) => {
  const profileName = pharmacyProfile?.name || "Pharmacie de l'Épau";
  const managerText = pharmacyProfile?.managerName ? `${pharmacyProfile.legalStructure || 'SELARL'} ${pharmacyProfile.managerName}` : "SELARL Dr N'Fafode Camara";
  const addressText = pharmacyProfile?.address ? `${pharmacyProfile.address}, ${pharmacyProfile.postalCode || ''} ${pharmacyProfile.city || ''}` : "74 Rue de l'Estérel, 72100 Le Mans";
  const bankName = pharmacyProfile?.primaryBankName || "Crédit Agricole Pro";

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Officine Branding (Clickable to edit Profile) */}
          <div 
            onClick={onOpenDataManagementModal}
            className="flex items-center gap-3 cursor-pointer group"
            title="Cliquer pour configurer le nom de votre entreprise, vos coordonnées ou vos données"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 transition flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <span className="text-xl font-black text-white">✚</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-300 transition">
                  {profileName}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {managerText}
                </span>
                {isRealModeActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs">
                    🟢 Mode Réel
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                    🔵 Démo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {addressText} • {bankName}
              </p>
            </div>
          </div>

          {/* Quick Bank & Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Onboarding Guide / Tour Button */}
            {onOpenOnboardingTour && (
              <button
                onClick={onOpenOnboardingTour}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-xs cursor-pointer ${
                  isRealModeActive
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-400/50'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border-emerald-500/40'
                }`}
                title="Guide de démarrage pas-à-pas & configuration des premières données"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden md:inline">Guide Démarrage</span>
                <span className="md:hidden">Guide</span>
              </button>
            )}

            {/* Quick Data Management Button (Settings & Import) */}
            {onOpenDataManagementModal && (
              <button
                onClick={onOpenDataManagementModal}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-xs cursor-pointer ${
                  isRealModeActive
                    ? 'bg-emerald-700/80 hover:bg-emerald-600 text-white border-emerald-500/80'
                    : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700 hover:border-emerald-500/50'
                }`}
                title="Gérer les données de mon entreprise, importer des fichiers CSV ou passer en mode vierge"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Mes Données</span>
                <span className="md:hidden">Données</span>
              </button>
            )}

            {/* Quick Connecteurs Health Status Button */}
            <button
              onClick={() => setActiveTab('connecteurs')}
              className={`hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition shadow-xs cursor-pointer ${
                activeTab === 'connecteurs'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : connectorsDownCount > 0
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700/80 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
              title="État des Connecteurs & Santé API (Resopharma, CA, SY, Chorus)"
            >
              <span className={`w-2 h-2 rounded-full ${connectorsDownCount > 0 ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
              <span>Connecteurs {connectorsDownCount > 0 ? `(${connectorsDownCount} panne)` : 'API Live'}</span>
            </button>

            {/* Bank Widget */}
            <div 
              onClick={() => setActiveTab('tresorerie')} 
              className="cursor-pointer hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors"
              title={`Connecteur Open Banking ${bankName}`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                  <span>{bankName}</span>
                  <span className="text-emerald-400">• En ligne</span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {formatCurrency(bankBalance)}
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onSyncBank(); }}
                disabled={isSyncingBank}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                title="Synchroniser les flux bancaires"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBank ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            </div>

            {/* Quick Resopharma Teletransmission Connector Button */}
            {onOpenResopharmaModal && (
              <button
                onClick={onOpenResopharmaModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold shadow-xs transition cursor-pointer"
                title="Connecteur Resopharma : Télétransmission, Bordereaux NOEMIE & DRE"
              >
                <Network className="w-3.5 h-3.5 text-purple-400" />
                <span>Resopharma</span>
              </button>
            )}

            {/* Quick Electronic Invoicing Vault Button */}
            <button
              onClick={onOpenElectronicInvoicingModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold shadow-xs transition cursor-pointer"
              title="Coffre-Fort Factures Électroniques (SY by Cegedim, Factur-X)"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Coffre-Fort SY</span>
            </button>

            {/* Quick Barcode Scanner Button */}
            <button
              onClick={onOpenBarcodeScanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              title="Scanner un code-barres / Datamatrix avec la caméra"
            >
              <Scan className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scanner</span>
            </button>

            {/* Quick Audit Trail Button */}
            <button
              onClick={() => setActiveTab('audit')}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shadow-xs transition cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Journal d'Audit & Contrôle Interne (Traçabilité PAF)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit ({auditLogsCount})</span>
            </button>

            {/* Quick Export Report Button */}
            <button
              onClick={onOpenAccountingModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rapports Comptables</span>
            </button>

            {/* Push Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              aria-label="Notifications"
              title="Centre de notifications et alertes"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Global Dark Mode / Light Mode Switcher */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleDarkMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 text-amber-300 border-amber-400/40 hover:bg-slate-750 hover:border-amber-400' 
                  : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
              title={isDarkMode ? 'Désactiver le mode sombre (Passer en mode jour)' : 'Activer le mode sombre (Recommandé inventaires & gestion tardive)'}
              aria-label="Basculer le mode sombre pour inventaires et gestion tardive"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-amber-300 font-semibold">Mode Nuit</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-300" />
                  <span className="hidden sm:inline text-slate-300">Mode Nuit</span>
                </>
              )}
            </button>

            {/* Mobile View Badge */}
            <div className="sm:hidden flex items-center text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded">
              <Smartphone className="w-3.5 h-3.5 mr-1" />
              Mobile Pro
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

