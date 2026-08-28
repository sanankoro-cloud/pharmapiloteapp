import React, { useState } from 'react';
import { 
  Building2, 
  Database, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  FileSpreadsheet, 
  Layers, 
  Landmark, 
  Activity, 
  X, 
  ChevronRight, 
  RotateCcw, 
  FileText, 
  Pill, 
  TrendingUp, 
  Scan, 
  Lightbulb, 
  FolderDown, 
  ExternalLink,
  Percent,
  Compass,
  Check,
  Play
} from 'lucide-react';
import { PharmacyProfile } from '../types/pharmacy';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacyProfile?: PharmacyProfile;
  onOpenDataManagement: () => void;
  onOpenElectronicInvoicing: () => void;
  onOpenResopharma: () => void;
  onNavigateTab: (tab: string) => void;
  onResetToDemo?: () => void;
  isRealModeActive?: boolean;
}

export interface OnboardingStep {
  id: number;
  key: string;
  title: string;
  shortLabel: string;
  badge: string;
  icon: React.ElementType;
  iconBg: string;
  headline: string;
  description: string;
  keyPoints: { label: string; detail: string }[];
  actionLabel: string;
  actionSecondaryLabel?: string;
  targetTab?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  proTip: string;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  pharmacyProfile,
  onOpenDataManagement,
  onOpenElectronicInvoicing,
  onOpenResopharma,
  onNavigateTab,
  onResetToDemo,
  isRealModeActive = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_onboarding_completed_steps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pharmacy_onboarding_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  if (!isOpen) return null;

  const toggleStepCompleted = (stepId: number) => {
    setCompletedSteps(prev => {
      const exists = prev.includes(stepId);
      const next = exists ? prev.filter(id => id !== stepId) : [...prev, stepId];
      try {
        localStorage.setItem('pharmacy_onboarding_completed_steps', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const handleClose = () => {
    try {
      if (dontShowAgain) {
        localStorage.setItem('pharmacy_onboarding_dismissed', 'true');
      }
    } catch (e) {
      console.warn(e);
    }
    onClose();
  };

  const steps: OnboardingStep[] = [
    {
      id: 1,
      key: 'identity',
      title: "1. Identité de l'Officine & Objectifs Financiers",
      shortLabel: "1. Profil Officine",
      badge: "Fondations",
      icon: Building2,
      iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      headline: "Personnalisez les coordonnées et paramétrez vos seuils de rentabilité",
      description: "Pour que vos tableaux de bord, alertes et bilans comptables soient conformes à votre structure, définissez le profil juridique de votre officine.",
      keyPoints: [
        { 
          label: "Raison Sociale & Numéro FINESS / RPPS", 
          detail: "Renseignez le nom officiel de votre officine, adresse et numéro d'enregistrement professionnel pour l'entête des bilans et exports." 
        },
        { 
          label: "Seuil d'Alerte Trésorerie Bancaire", 
          detail: "Fixez votre matelas de sécurité de trésorerie (ex: 25 000 €). Une alerte proactive se déclenchera si le solde prévisionnel à 30 jours franchit ce seuil." 
        },
        { 
          label: "Objectifs de Marge & CA Mensuel", 
          detail: "Définissez votre taux de marge brute cible (ex: 31.5%) et votre objectif d'activité pour mesurer les écarts en temps réel." 
        }
      ],
      actionLabel: "Configurer mon Profil & Objectifs",
      actionSecondaryLabel: "Voir l'état actuel",
      onAction: () => {
        onOpenDataManagement();
        toggleStepCompleted(1);
      },
      onSecondaryAction: () => {
        onNavigateTab('rapports');
      },
      proTip: "Le seuil de sécurité trésorerie est directement utilisé par le module de prévision de cash-flow à 30 jours."
    },
    {
      id: 2,
      key: 'stocks_lgo',
      title: "2. Import du Catalogue & Stocks LGO",
      shortLabel: "2. Stocks & Produits",
      badge: "Inventaire",
      icon: Pill,
      iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
      headline: "Importez vos références depuis votre Logiciel de Gestion d'Officine (LGO)",
      description: "Compatible avec tous les logiciels d'officine (WinPharma, LGPI, Smart Rx, Isipharm, Pharmagest...). Vous pouvez charger votre catalogue par fichier CSV / Excel.",
      keyPoints: [
        { 
          label: "Données requises", 
          detail: "Code CIP/ACL (13 chiffres), désignation produit, prix d'achat HT (PAHT), prix de vente TTC (PVTTC), quantité en stock et date de péremption." 
        },
        { 
          label: "Suivi des Périmés & Loi AGEC", 
          detail: "L'application catégorise automatiquement les produits à péremption critique (< 30 jours, 60 jours, 90 jours) pour lancer des retours labos ou des destockages." 
        },
        { 
          label: "Modèle CSV téléchargeable", 
          detail: "Un fichier d'exemple est téléchargeable dans le menu « Mes Données » pour formater facilement votre export LGO." 
        }
      ],
      actionLabel: "Importer mes Stocks (CSV)",
      actionSecondaryLabel: "Voir la gestion des stocks",
      targetTab: 'stocks',
      onAction: () => {
        onOpenDataManagement();
        toggleStepCompleted(2);
      },
      onSecondaryAction: () => {
        onNavigateTab('stocks');
        toggleStepCompleted(2);
        handleClose();
      },
      proTip: "Vous pouvez également utiliser le lecteur de code-barres Datamatrix intégré via la caméra de votre smartphone ou tablette."
    },
    {
      id: 3,
      key: 'suppliers_invoices',
      title: "3. Factures Fournisseurs & Facturation Électronique (SY / Factur-X)",
      shortLabel: "3. Achats & Factures",
      badge: "Achats & Contrôle",
      icon: FileSpreadsheet,
      iconBg: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
      headline: "Contrôlez les lignes de factures répartiteurs et décelez les hausses tarifaires",
      description: "Centralisez vos factures grossistes-répartiteurs (Cerp, OCP, Phoenix, direct labo) pour vérifier les remises accordées et anticiper la réforme de facturation électronique.",
      keyPoints: [
        { 
          label: "Détecteur de hausses tarifaires cachées", 
          detail: "Chaque variation de PAHT non convenue est identifiée automatiquement pour réclamation immédiate auprès du délégué ou du grossiste." 
        },
        { 
          label: "Coffre-fort Factur-X / SY by Cegedim", 
          detail: "Visualisez les statuts de validation de vos factures électroniques (Déposée, Reçue, Approuvée, Bon à Payer, Rejetée)." 
        },
        { 
          label: "Suivi des échéances de règlement", 
          detail: "Suivez les factures à payer à 30/60 jours pour éviter tout blocage de compte chez vos fournisseurs." 
        }
      ],
      actionLabel: "Ouvrir le Coffre-Fort Factures",
      actionSecondaryLabel: "Voir les Commandes & Achats",
      onAction: () => {
        onOpenElectronicInvoicing();
        toggleStepCompleted(3);
      },
      onSecondaryAction: () => {
        onNavigateTab('fournisseurs');
        toggleStepCompleted(3);
        handleClose();
      },
      proTip: "L'import de factures permet de calculer automatiquement le prix de revient pondéré de chaque référence."
    },
    {
      id: 4,
      key: 'resopharma_tiers_payant',
      title: "4. Télétransmissions & Tiers-Payant (Resopharma / NOEMIE)",
      shortLabel: "4. Tiers-Payant",
      badge: "Trésorerie CPAM / AMC",
      icon: Layers,
      iconBg: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      headline: "Surveillez les bordereaux de télétransmission et évitez les rejets de paiement",
      description: "Le tiers-payant représente plus de 70% du chiffre d'affaires d'une officine. Surveillez les flux FSE (Feuilles de Soins Électroniques) et DRE (Mutuelles).",
      keyPoints: [
        { 
          label: "Suivi des virements NOEMIE (Régime Obligatoire)", 
          detail: "Rapprochement automatique entre les montants télétransmis et les virements effectifs de la CPAM." 
        },
        { 
          label: "Détection des rejets mutuelles (Régime Complémentaire)", 
          detail: "Isolement immédiat des rejets de droits, cartes non à jour ou conventions échues pour relance rapide." 
        },
        { 
          label: "Bilan des flux télétransmis", 
          detail: "Consultez les taux de succès de télétransmission et les délais moyens de règlement (généralement 2 à 4 jours)." 
        }
      ],
      actionLabel: "Ouvrir le Connecteur Resopharma",
      actionSecondaryLabel: "Voir les flux télétransmis",
      onAction: () => {
        onOpenResopharma();
        toggleStepCompleted(4);
      },
      onSecondaryAction: () => {
        onOpenResopharma();
        toggleStepCompleted(4);
      },
      proTip: "Les bordereaux Resopharma sont directement intégrés dans les ventilations de règlements du tableau de bord."
    },
    {
      id: 5,
      key: 'banking_lcr',
      title: "5. Synchronisation Bancaire & Contrôle des Traites LCR",
      shortLabel: "5. Banque & LCR",
      badge: "Trésorerie",
      icon: Landmark,
      iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
      headline: "Connectez votre compte pro et contrôlez les prélèvements LCR avant débit",
      description: "Les Lettres de Change Relevé (LCR) représentent les débits majeurs des répartiteurs. Contrôlez les avis bancaires pour bloquer les doublons.",
      keyPoints: [
        { 
          label: "Synchronisation bancaire Open Banking (DSP2)", 
          detail: "Récupération quotidienne de votre solde et des écritures bancaires (Crédit Agricole, BNP, SG, LCL, etc.)." 
        },
        { 
          label: "Module de pointage & Rapprochement LCR", 
          detail: "Validation ligne à ligne des traites fournisseurs reçues contre les bons de livraison réels." 
        },
        { 
          label: "Gestion des contestations & Rejets", 
          detail: "Générez un dossier de litige immédiat en cas d'écart de montant ou d'échéance non conforme." 
        }
      ],
      actionLabel: "Accéder au Contrôle LCR",
      actionSecondaryLabel: "Voir le Rapprochement Bancaire",
      onAction: () => {
        onNavigateTab('lcr');
        toggleStepCompleted(5);
        handleClose();
      },
      onSecondaryAction: () => {
        onNavigateTab('tresorerie');
        toggleStepCompleted(5);
        handleClose();
      },
      proTip: "Le rapprochement bancaire permet de vérifier le lettrage comptable et prépare votre export de grand livre FEC."
    },
    {
      id: 6,
      key: 'margin_watchdog',
      title: "6. Surveillance de Marges en Temps Réel (Watchdog MM3M)",
      shortLabel: "6. Surveillance Marges",
      badge: "Pilotage Rentabilité",
      icon: Activity,
      iconBg: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
      headline: "Protégez votre marge contre les dérives, remises excessives et erreurs de coefficient",
      description: "Le Watchdog compare en continu la marge du mois en cours avec la Moyenne Mobile des 3 derniers mois (MM3M) par rayon et par produit.",
      keyPoints: [
        { 
          label: "Alerte de décrochage (> 5.0 pts d'écart)", 
          detail: "Détection immédiate si un rayon (Parapharmacie, OTC, Dispositifs Médicaux) subit une érosion de marge anormale." 
        },
        { 
          label: "Audit des tickets et remises en caisse", 
          detail: "Surveillance des remises exceptionnelles accordées aux comptoirs pour éviter les dérives non autorisées." 
        },
        { 
          label: "Analyse par classe thérapeutique", 
          detail: "Identification précise des produits moteurs de marge (Micronutrition, Dermatologie, Oncologie d'accompagnement)." 
        }
      ],
      actionLabel: "Explorer le Watchdog de Marges",
      actionSecondaryLabel: "Terminer la Configuration",
      onAction: () => {
        onNavigateTab('surveillance_marges');
        toggleStepCompleted(6);
        handleClose();
      },
      onSecondaryAction: () => {
        toggleStepCompleted(6);
        handleClose();
      },
      proTip: "Vous pouvez personnaliser vos règles de marge minimale et les seuils d'alerte par famille de produits."
    }
  ];

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const completedCount = completedSteps.length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border-b border-slate-800 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/90 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Guide de Démarrage & Configuration Initiale
                </span>
                {isRealModeActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    Base Vierge Active
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                Comment configurer vos premières données d'officine
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition relative z-10 cursor-pointer"
            title="Fermer le guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Step Chips */}
        <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Progression :</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{completedCount} / {steps.length} étapes validées</span>
              <span className="text-slate-400 font-normal">({progressPct}%)</span>
            </span>

            <div className="flex items-center gap-2">
              {onResetToDemo && (
                <button
                  onClick={onResetToDemo}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  title="Recharger le jeu de démonstration prérempli"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Charger données démo</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, (completedCount / steps.length) * 100)}%` }}
            />
          </div>

          {/* Horizontal Step Nav */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {steps.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isDone = completedSteps.includes(step.id);
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition cursor-pointer border ${
                    isCurrent
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  )}
                  <span>{step.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body (Step Details) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Step Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${currentStep.iconBg}`}>
                <currentStep.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {currentStep.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Étape {currentStep.id} sur {steps.length}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  {currentStep.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {currentStep.headline}
                </p>
              </div>
            </div>

            {/* Checkbox "Marquer comme fait" */}
            <button
              onClick={() => toggleStepCompleted(currentStep.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 border ${
                completedSteps.includes(currentStep.id)
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                completedSteps.includes(currentStep.id)
                  ? 'bg-white text-emerald-600 border-white'
                  : 'border-slate-400 bg-white dark:bg-slate-900'
              }`}>
                {completedSteps.includes(currentStep.id) && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>{completedSteps.includes(currentStep.id) ? 'Étape validée ✓' : 'Marquer comme fait'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Key Checklist & Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {currentStep.keyPoints.map((point, pIdx) => (
              <div 
                key={pIdx}
                className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                      {pIdx + 1}
                    </span>
                    <span>{point.label}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                    {point.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip Box */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                Conseil pratique du titulaire :
              </span>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                {currentStep.proTip}
              </p>
            </div>
          </div>

          {/* Action Hub for this step */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Prêt à passer à l'action pour cette étape ?
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Vous pouvez exécuter la configuration immédiatement ou naviguer dans le module concerné.
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
              {currentStep.actionSecondaryLabel && currentStep.onSecondaryAction && (
                <button
                  onClick={currentStep.onSecondaryAction}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  {currentStep.actionSecondaryLabel}
                </button>
              )}

              {currentStep.onAction && (
                <button
                  onClick={currentStep.onAction}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentStep.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Ne plus afficher ce guide automatiquement</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              disabled={isFirstStep}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isFirstStep 
                  ? 'opacity-40 cursor-not-allowed text-slate-400' 
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>

            {isLastStep ? (
              <button
                onClick={() => {
                  toggleStepCompleted(currentStep.id);
                  handleClose();
                }}
                className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terminer et Accéder à mon Tableau de Bord</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Étape Suivante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
