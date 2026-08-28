import React from 'react';
import { 
  Compass, 
  Building2, 
  Pill, 
  FileSpreadsheet, 
  Layers, 
  Landmark, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  X,
  Play
} from 'lucide-react';
import { PharmacyProfile } from '../types/pharmacy';

interface OnboardingDashboardBannerProps {
  onOpenTour: () => void;
  onOpenDataManagement: () => void;
  onOpenElectronicInvoicing: () => void;
  onOpenResopharma: () => void;
  onNavigateTab: (tab: string) => void;
  onResetToDemo?: () => void;
  pharmacyProfile?: PharmacyProfile;
  isRealModeActive?: boolean;
}

export const OnboardingDashboardBanner: React.FC<OnboardingDashboardBannerProps> = ({
  onOpenTour,
  onOpenDataManagement,
  onOpenElectronicInvoicing,
  onOpenResopharma,
  onNavigateTab,
  onResetToDemo,
  isRealModeActive = false
}) => {
  const [completedSteps, setCompletedSteps] = React.useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_onboarding_completed_steps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDismissed, setIsDismissed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('pharmacy_onboarding_banner_hidden') === 'true';
    } catch {
      return false;
    }
  });

  if (isDismissed) return null;

  const totalSteps = 6;
  const progressPct = Math.round((completedSteps.length / totalSteps) * 100);

  const quickSteps = [
    { id: 1, label: "1. Profil & Objectifs", icon: Building2, action: onOpenDataManagement },
    { id: 2, label: "2. Import Stocks LGO", icon: Pill, action: () => onNavigateTab('stocks') },
    { id: 3, label: "3. Factures Fournisseurs", icon: FileSpreadsheet, action: onOpenElectronicInvoicing },
    { id: 4, label: "4. Resopharma NOEMIE", icon: Layers, action: onOpenResopharma },
    { id: 5, label: "5. Rapprochement LCR", icon: Landmark, action: () => onNavigateTab('lcr') },
    { id: 6, label: "6. Watchdog Marges", icon: Activity, action: () => onNavigateTab('surveillance_marges') },
  ];

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('pharmacy_onboarding_banner_hidden', 'true');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        
        {/* Left Headline */}
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Guide d'Initialisation des Données</span>
            </span>
            {isRealModeActive ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                Base Vierge / Données Réelles
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                Mode Démonstration
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-300/80">
              {completedSteps.length} / {totalSteps} étapes validées ({progressPct}%)
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-white">
            Configurez facilement vos premières données après réinitialisation
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Suivez le pas-à-pas pour injecter vos coordonnées, importer vos stocks LGO (WinPharma, LGPI, Smart Rx...), connecter vos factures fournisseurs et activer le watchdog de marge.
          </p>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={onOpenTour}
            className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Lancer le Tour Guidé Interactif</span>
          </button>

          <button
            onClick={onOpenDataManagement}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Ouvrir le panneau d'import de fichiers et de profil"
          >
            <span>Gestion des Données</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Masquer ce bandeau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Step Quick Navigation Strip */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 relative z-10">
        {quickSteps.map(st => {
          const isDone = completedSteps.includes(st.id);
          const StepIcon = st.icon;

          return (
            <button
              key={st.id}
              onClick={st.action}
              className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs group cursor-pointer ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <StepIcon className={`w-3.5 h-3.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-300'}`} />
                <span className="font-bold truncate text-[11px]">{st.label}</span>
              </div>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>

    </div>
  );
};
