import React, { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Percent,
  Euro,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Layers,
  Building2,
  Tag,
  ArrowUpRight,
  RotateCcw,
  RefreshCw,
  ShoppingBag,
  Info,
  Check,
  ChevronRight,
  Filter
} from 'lucide-react';
import { PurchasePriceVariation } from '../types/purchasingAndDiscounts';
import { formatCurrency, formatPercent, exportToCsv } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface PricePassThroughSimulatorViewProps {
  variations: PurchasePriceVariation[];
  onApplySimulatedPrices?: (updatedVariations: { id: string; newPublicPriceTtc: number }[]) => void;
  onBackToAlerts?: () => void;
}

export type PassThroughStrategy = 'none' | 'value_100' | 'margin_rate_preserve' | 'custom_pct' | 'smart_rounded';

// Taux de TVA applicables selon la catégorie officinale
const getVatRateForCategory = (category: string): number => {
  switch (category) {
    case 'medicament_remboursable':
      return 0.021; // 2.1%
    case 'nutrition_bebe':
      return 0.055; // 5.5%
    case 'medicament_otc':
      return 0.10; // 10.0%
    case 'parapharmacie':
    case 'dispositif_medical':
    case 'veterinaire':
    default:
      return 0.20; // 20.0%
  }
};

// Fonction d'arrondi commercial / psychologique
const applyPsychologicalRounding = (price: number, roundingMode: 'none' | '90' | '95' | '50' | '00'): number => {
  if (roundingMode === 'none' || price <= 0) return Math.round(price * 100) / 100;
  
  const whole = Math.floor(price);
  const decimals = price - whole;

  if (roundingMode === '90') {
    if (decimals < 0.45) return Math.max(0.90, whole - 0.10);
    return whole + 0.90;
  }
  if (roundingMode === '95') {
    if (decimals < 0.45) return Math.max(0.95, whole - 0.05);
    return whole + 0.95;
  }
  if (roundingMode === '50') {
    if (decimals < 0.25) return whole;
    if (decimals < 0.75) return whole + 0.50;
    return whole + 1.00;
  }
  if (roundingMode === '00') {
    return Math.round(price);
  }
  return Math.round(price * 100) / 100;
};

export const PricePassThroughSimulatorView: React.FC<PricePassThroughSimulatorViewProps> = ({
  variations,
  onApplySimulatedPrices,
  onBackToAlerts
}) => {
  // Paramètres de simulation globale
  const [strategy, setStrategy] = useState<PassThroughStrategy>('value_100');
  const [customPassThroughPct, setCustomPassThroughPct] = useState<number>(75);
  const [roundingMode, setRoundingMode] = useState<'none' | '90' | '95' | '50' | '00'>('90');
  const [includeRegulated, setIncludeRegulated] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLabo, setSelectedLabo] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPriceHikePct, setMinPriceHikePct] = useState<number>(0);

  // Ajustements manuels individuels par ligne de produit
  const [manualCustomPrices, setManualCustomPrices] = useState<Record<string, number>>({});
  const [appliedSuccessToast, setAppliedSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAppliedSuccessToast(msg);
    setTimeout(() => setAppliedSuccessToast(null), 3800);
  };

  // Liste des laboratoires distincts
  const laboratories = useMemo(() => {
    return Array.from(new Set(variations.map(v => v.laboratory))).sort();
  }, [variations]);

  // Calcul du prix et de la marge simulée pour un produit donné
  const calculateSimulatedMetrics = (item: PurchasePriceVariation) => {
    const isRegulated = item.category === 'medicament_remboursable';
    const vatRate = getVatRateForCategory(item.category);
    
    // Ancien Prix Vente HT & Nouveau Prix Achat HT
    const currentPvHt = item.currentPublicPriceTtc / (1 + vatRate);
    const prevPvHt = currentPvHt; // base historique
    const prevMarginEurHt = prevPvHt - item.previousPriceHt;
    const prevMarginPct = item.previousMarginPct > 0 ? item.previousMarginPct : (prevMarginEurHt / prevPvHt) * 100;

    // Si le produit est réglementé et qu'on ne force pas la répercussion
    if (isRegulated && !includeRegulated) {
      const marginWithoutPassEur = currentPvHt - item.newPriceHt;
      const marginWithoutPassPct = (marginWithoutPassEur / currentPvHt) * 100;
      return {
        isRegulated: true,
        canAdjust: false,
        simulatedPvTtc: item.currentPublicPriceTtc,
        simulatedPvHt: currentPvHt,
        simulatedMarginEurHt: marginWithoutPassEur,
        simulatedMarginPct: marginWithoutPassPct,
        annualMarginGainVsNoPass: 0,
        annualLossVsHistoric: (prevMarginEurHt - marginWithoutPassEur) * item.estimatedAnnualVolumeUnits,
        deltaPriceTtc: 0,
        vatRate,
        isCustomized: false
      };
    }

    // Si l'utilisateur a saisi un prix manuel spécifique
    if (manualCustomPrices[item.id] !== undefined) {
      const manualPvTtc = manualCustomPrices[item.id];
      const manualPvHt = manualPvTtc / (1 + vatRate);
      const simulatedMarginEur = manualPvHt - item.newPriceHt;
      const simulatedMarginPct = manualPvHt > 0 ? (simulatedMarginEur / manualPvHt) * 100 : 0;
      const marginWithoutPassEur = currentPvHt - item.newPriceHt;

      return {
        isRegulated,
        canAdjust: true,
        simulatedPvTtc: manualPvTtc,
        simulatedPvHt: manualPvHt,
        simulatedMarginEurHt: simulatedMarginEur,
        simulatedMarginPct,
        annualMarginGainVsNoPass: (simulatedMarginEur - marginWithoutPassEur) * item.estimatedAnnualVolumeUnits,
        annualLossVsHistoric: (prevMarginEurHt - simulatedMarginEur) * item.estimatedAnnualVolumeUnits,
        deltaPriceTtc: manualPvTtc - item.currentPublicPriceTtc,
        vatRate,
        isCustomized: true
      };
    }

    let targetPvHt = currentPvHt;

    if (strategy === 'none') {
      // 0% de répercussion (statut quo)
      targetPvHt = currentPvHt;
    } else if (strategy === 'value_100') {
      // 100% de la hausse d'achat HT répercutée en valeur
      const hikeHt = Math.max(0, item.deltaAmountHt);
      targetPvHt = currentPvHt + hikeHt;
    } else if (strategy === 'margin_rate_preserve') {
      // Maintien strict du taux de marge historique (%)
      const targetRate = Math.min(85, Math.max(5, prevMarginPct)) / 100;
      targetPvHt = item.newPriceHt / (1 - targetRate);
    } else if (strategy === 'custom_pct') {
      // Répercussion personnalisée (ex: 50%, 75%, 120%)
      const hikeHt = Math.max(0, item.deltaAmountHt);
      targetPvHt = currentPvHt + (hikeHt * (customPassThroughPct / 100));
    } else if (strategy === 'smart_rounded') {
      // 100% valeur avec arrondi optimisé
      const hikeHt = Math.max(0, item.deltaAmountHt);
      targetPvHt = currentPvHt + hikeHt;
    }

    let targetPvTtc = targetPvHt * (1 + vatRate);

    // Application de l'arrondi psychologique si activé
    if (roundingMode !== 'none' && strategy !== 'none') {
      targetPvTtc = applyPsychologicalRounding(targetPvTtc, roundingMode);
      targetPvHt = targetPvTtc / (1 + vatRate);
    } else {
      targetPvTtc = Math.round(targetPvTtc * 100) / 100;
      targetPvHt = targetPvTtc / (1 + vatRate);
    }

    const simulatedMarginEur = targetPvHt - item.newPriceHt;
    const simulatedMarginPct = targetPvHt > 0 ? (simulatedMarginEur / targetPvHt) * 100 : 0;
    const marginWithoutPassEur = currentPvHt - item.newPriceHt;

    return {
      isRegulated,
      canAdjust: !isRegulated || includeRegulated,
      simulatedPvTtc: targetPvTtc,
      simulatedPvHt: targetPvHt,
      simulatedMarginEurHt: simulatedMarginEur,
      simulatedMarginPct,
      annualMarginGainVsNoPass: (simulatedMarginEur - marginWithoutPassEur) * item.estimatedAnnualVolumeUnits,
      annualLossVsHistoric: (prevMarginEurHt - simulatedMarginEur) * item.estimatedAnnualVolumeUnits,
      deltaPriceTtc: targetPvTtc - item.currentPublicPriceTtc,
      vatRate,
      isCustomized: false
    };
  };

  // Liste filtrée avec calculs simulés
  const simulatedList = useMemo(() => {
    return variations
      .filter(item => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.cip.includes(searchQuery) ||
          item.laboratory.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesLab = selectedLabo === 'all' || item.laboratory === selectedLabo;
        const matchesHike = item.deltaPercentage >= minPriceHikePct;
        return matchesSearch && matchesCat && matchesLab && matchesHike;
      })
      .map(item => ({
        ...item,
        simulation: calculateSimulatedMetrics(item)
      }));
  }, [
    variations,
    searchQuery,
    selectedCategory,
    selectedLabo,
    minPriceHikePct,
    strategy,
    customPassThroughPct,
    roundingMode,
    includeRegulated,
    manualCustomPrices
  ]);

  // Agrégats Macroéconomiques Globaux de la Simulation
  const macroKPIs = useMemo(() => {
    const totalItems = simulatedList.length;
    const eligibleItems = simulatedList.filter(i => i.simulation.canAdjust);

    // Scénario A : Sans répercussion (Statut Quo)
    let totalAnnualLossWithoutPass = 0;
    let totalInitialMarginEur = 0;
    let totalCurrentMarginWithoutPassEur = 0;
    let totalInitialTurnoverHt = 0;

    // Scénario B : Avec Répercussion Simulée
    let totalSimulatedMarginEur = 0;
    let totalSimulatedTurnoverHt = 0;
    let totalAnnualMarginPreserved = 0;
    let totalAdditionalTurnoverTtc = 0;
    let totalAnnualVolume = 0;

    simulatedList.forEach(item => {
      const vol = item.estimatedAnnualVolumeUnits;
      const vatRate = item.simulation.vatRate;
      const currentPvHt = item.currentPublicPriceTtc / (1 + vatRate);
      
      const prevPvHt = currentPvHt;
      const prevMarginEur = prevPvHt - item.previousPriceHt;
      const marginNoPassEur = currentPvHt - item.newPriceHt;

      totalInitialTurnoverHt += prevPvHt * vol;
      totalInitialMarginEur += prevMarginEur * vol;
      totalCurrentMarginWithoutPassEur += marginNoPassEur * vol;
      totalAnnualLossWithoutPass += Math.max(0, (prevMarginEur - marginNoPassEur) * vol);

      const simPvHt = item.simulation.simulatedPvHt;
      const simPvTtc = item.simulation.simulatedPvTtc;
      const simMarginEur = item.simulation.simulatedMarginEurHt;

      totalSimulatedTurnoverHt += simPvHt * vol;
      totalSimulatedMarginEur += simMarginEur * vol;
      totalAdditionalTurnoverTtc += (simPvTtc - item.currentPublicPriceTtc) * vol;
      totalAnnualVolume += vol;
    });

    totalAnnualMarginPreserved = totalSimulatedMarginEur - totalCurrentMarginWithoutPassEur;

    // Taux moyens de marge (%)
    const avgInitialMarginRate = totalInitialTurnoverHt > 0 ? (totalInitialMarginEur / totalInitialTurnoverHt) * 100 : 0;
    const avgDegradedMarginRate = totalInitialTurnoverHt > 0 ? (totalCurrentMarginWithoutPassEur / totalInitialTurnoverHt) * 100 : 0;
    const avgSimulatedMarginRate = totalSimulatedTurnoverHt > 0 ? (totalSimulatedMarginEur / totalSimulatedTurnoverHt) * 100 : 0;

    // Impact moyen par acte d'achat (panier patient)
    const avgPriceIncreasePerUnit = totalAnnualVolume > 0 ? totalAdditionalTurnoverTtc / totalAnnualVolume : 0;

    return {
      totalItems,
      eligibleItemsCount: eligibleItems.length,
      totalAnnualLossWithoutPass,
      totalAnnualMarginPreserved,
      netResidualAnnualLoss: Math.max(0, totalAnnualLossWithoutPass - totalAnnualMarginPreserved),
      totalAdditionalTurnoverTtc,
      avgInitialMarginRate,
      avgDegradedMarginRate,
      avgSimulatedMarginRate,
      marginRateDelta: avgSimulatedMarginRate - avgDegradedMarginRate,
      avgPriceIncreasePerUnit
    };
  }, [simulatedList]);

  // Gestion de la modification manuelle d'un prix
  const handleManualPriceChange = (id: string, newTtc: number) => {
    setManualCustomPrices(prev => ({
      ...prev,
      [id]: Math.max(0, newTtc)
    }));
  };

  // Réinitialiser les personnalisations individuelles
  const handleResetManualPrices = () => {
    setManualCustomPrices({});
    showToast('Toutes les personnalisations manuelles ont été réinitialisées.');
  };

  // Application en masse des prix simulés vers le LGO
  const handleApplySimulatedBatch = () => {
    const payload = simulatedList
      .filter(i => i.simulation.canAdjust && i.simulation.deltaPriceTtc !== 0)
      .map(i => ({
        id: i.id,
        newPublicPriceTtc: i.simulation.simulatedPvTtc
      }));

    if (payload.length === 0) {
      showToast('Aucun changement de prix à appliquer.');
      return;
    }

    if (onApplySimulatedPrices) {
      onApplySimulatedPrices(payload);
    }

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    showToast(`${payload.length} prix de vente public TTC appliqués et synchronisés avec le LGO !`);
  };

  // Export CSV de la grille tarifaire simulée
  const handleExportSimulatedGridCsv = () => {
    const data = simulatedList.map(item => ({
      'Code CIP': item.cip,
      'Nom Produit': item.name,
      'Laboratoire': item.laboratory,
      'Catégorie': item.category,
      'TVA (%)': `${(item.simulation.vatRate * 100).toFixed(1)}%`,
      'Ancien Prix Achat HT (€)': item.previousPriceHt.toFixed(2),
      'Nouveau Prix Achat HT (€)': item.newPriceHt.toFixed(2),
      'Hausse Achat HT (€)': item.deltaAmountHt.toFixed(2),
      'Hausse Achat (%)': `${item.deltaPercentage.toFixed(2)}%`,
      'Prix Vente Actuel TTC (€)': item.currentPublicPriceTtc.toFixed(2),
      'Prix Vente Simulé TTC (€)': item.simulation.simulatedPvTtc.toFixed(2),
      'Écart Prix Public (€)': `${item.simulation.deltaPriceTtc >= 0 ? '+' : ''}${item.simulation.deltaPriceTtc.toFixed(2)}`,
      'Marge Brute Actuelle (€ HT)': (item.currentPublicPriceTtc / (1 + item.simulation.vatRate) - item.newPriceHt).toFixed(2),
      'Marge Brute Simulée (€ HT)': item.simulation.simulatedMarginEurHt.toFixed(2),
      'Taux Marge Sans Répercussion (%)': `${((item.currentPublicPriceTtc / (1 + item.simulation.vatRate) - item.newPriceHt) / (item.currentPublicPriceTtc / (1 + item.simulation.vatRate)) * 100).toFixed(1)}%`,
      'Taux Marge Simulé (%)': `${item.simulation.simulatedMarginPct.toFixed(1)}%`,
      'Volume Annuel Estimé': item.estimatedAnnualVolumeUnits,
      'Marge Annuelle Sauvée (€)': item.simulation.annualMarginGainVsNoPass.toFixed(2),
      'Statut Réglementation': item.simulation.isRegulated ? 'Prix Réglementé CEPS' : 'Prix Libre Officine'
    }));

    exportToCsv(data, 'grille_simulation_repercussion_prix_pharmacie');
    showToast('Grille tarifaire simulée exportée avec succès (CSV/Excel).');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {appliedSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in max-w-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{appliedSuccessToast}</span>
        </div>
      )}

      {/* Header & Context Banner */}
      <div className="bg-linear-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white border border-indigo-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulateur Décisionnel de Gestion Officinale</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Simulation d'Impact sur la Marge Brute & Répercussion Prix Public
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-3xl leading-relaxed">
              Testez et modélisez en temps réel l'impact financier de différentes stratégies de répercussion tarifaire face aux hausses de prix d'achat fournisseurs (PUMP/tarifs labos). Préservez la rentabilité de votre officine tout en maîtrisant la compétitivité prix au comptoir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onBackToAlerts && (
              <button
                onClick={onBackToAlerts}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
              >
                Retour aux Alertes
              </button>
            )}
            <button
              onClick={handleExportSimulatedGridCsv}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-300" />
              <span>Exporter Grille (CSV)</span>
            </button>
            <button
              onClick={handleApplySimulatedBatch}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition cursor-pointer transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Appliquer {macroKPIs.eligibleItemsCount} Prix au LGO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Macro Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Marge Sauvée / Préservée */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Marge Brute Annuelle Préservée</span>
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(macroKPIs.totalAnnualMarginPreserved)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            sur {formatCurrency(macroKPIs.totalAnnualLossWithoutPass)} de risque d'érosion
          </p>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${macroKPIs.totalAnnualLossWithoutPass > 0 ? Math.min(100, (macroKPIs.totalAnnualMarginPreserved / macroKPIs.totalAnnualLossWithoutPass) * 100) : 0}%`
              }}
            />
          </div>
        </div>

        {/* Évolution du Taux de Marque Moyen */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Taux de Marque Moyen Simulé</span>
            <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {macroKPIs.avgSimulatedMarginRate.toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-emerald-600">
              +{macroKPIs.marginRateDelta.toFixed(1)} pts
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="line-through">{macroKPIs.avgDegradedMarginRate.toFixed(1)}%</span>
            <span>(sans répercussion)</span>
            <span>→</span>
            <span className="font-semibold text-indigo-600">{macroKPIs.avgSimulatedMarginRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* CA Additionnel TTC Projeté */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">CA Annuel Additionnel TTC</span>
            <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Euro className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              +{formatCurrency(macroKPIs.totalAdditionalTurnoverTtc)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Généré au comptoir sur les volumes prévisionnels
          </p>
        </div>

        {/* Impact Panier Moyen Patient */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Impact Moyen par Boîte (Patient)</span>
            <span className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              +{macroKPIs.avgPriceIncreasePerUnit.toFixed(2)} €
            </span>
            <span className="text-xs font-bold text-slate-500">TTC / unité</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Acceptabilité patientèle optimale (inférieure à +0.80 €)
          </p>
        </div>
      </div>

      {/* Simulation Control Studio Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Studio de Stratégie Tarifaire & Scénarios de Répercussion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sélectionnez un modèle de calcul pour recalculer instantanément l'ensemble des prix de vente conseillés.
              </p>
            </div>
          </div>

          {Object.keys(manualCustomPrices).length > 0 && (
            <button
              onClick={handleResetManualPrices}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Réinitialiser {Object.keys(manualCustomPrices).length} ajustement(s) manuel(s)</span>
            </button>
          )}
        </div>

        {/* Strategy Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Stratégie 1: 100% Répercussion en Valeur */}
          <button
            onClick={() => setStrategy('value_100')}
            className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${
              strategy === 'value_100'
                ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40'
            }`}
          >
            {strategy === 'value_100' && (
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-600" />
            )}
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>100% Répercussion en Valeur (€)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Reporte exactement le montant de la hausse d'achat HT (+delta €) sur le prix public HT. Préserve 100% de la marge unitaire en euros.
            </p>
            <div className="mt-2.5 inline-flex items-center text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-md">
              Recommandé Parapharmacie & OTC
            </div>
          </button>

          {/* Stratégie 2: Maintien du Taux de Marge % */}
          <button
            onClick={() => setStrategy('margin_rate_preserve')}
            className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${
              strategy === 'margin_rate_preserve'
                ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40'
            }`}
          >
            {strategy === 'margin_rate_preserve' && (
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-600" />
            )}
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Maintien du % de Marge Historique</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Recalcule le prix public pour maintenir le coefficient multiplicateur d'origine. Absorbe l'inflation des coûts.
            </p>
            <div className="mt-2.5 inline-flex items-center text-[10px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2 py-0.5 rounded-md">
              Maximisation Rentabilité
            </div>
          </button>

          {/* Stratégie 3: Répercussion Modulée / Curseur */}
          <button
            onClick={() => setStrategy('custom_pct')}
            className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${
              strategy === 'custom_pct'
                ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40'
            }`}
          >
            {strategy === 'custom_pct' && (
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-600" />
            )}
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
              <span>Répercussion Modulée ({customPassThroughPct}%)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Partage de l'effort d'augmentation entre l'officine et la patientèle (50%, 75%, 120%).
            </p>
            <div className="mt-2.5 inline-flex items-center text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-md">
              Compromis Patientèle
            </div>
          </button>

          {/* Stratégie 0: Aucune Répercussion (Statut Quo) */}
          <button
            onClick={() => setStrategy('none')}
            className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${
              strategy === 'none'
                ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/40 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40'
            }`}
          >
            {strategy === 'none' && (
              <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-600" />
            )}
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>0% Répercussion (Officine Absorbe)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Maintien strict des prix publics actuels en caisse. Permet de visualiser l'érosion nette de marge subie.
            </p>
            <div className="mt-2.5 inline-flex items-center text-[10px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-md">
              Scénario Risque Perte
            </div>
          </button>
        </div>

        {/* Sub-parameters: Slider & Rounding Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Custom Slider */}
          {strategy === 'custom_pct' && (
            <div className="space-y-2 md:col-span-2 bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-950 dark:text-indigo-200">
                  Taux de Répercussion de la Hausse :
                </span>
                <span className="font-black font-mono text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  {customPassThroughPct}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="5"
                value={customPassThroughPct}
                onChange={(e) => setCustomPassThroughPct(parseInt(e.target.value))}
                className="w-full h-2 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>0% (Absorption totale)</span>
                <span>50% (Partage équilibré)</span>
                <span>100% (Préservation valeur)</span>
                <span>150% (Sur-indexation)</span>
              </div>
            </div>
          )}

          {/* Arrondi Psychologique */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Arrondi Psychologique Caisse :</span>
              <span className="text-[10px] text-slate-400 font-normal">(Terminaison prix)</span>
            </label>
            <select
              value={roundingMode}
              onChange={(e) => setRoundingMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="90">Arrondi en .90 € (Ex: 14.90 €, 4.90 € - Standard)</option>
              <option value="95">Arrondi en .95 € (Ex: 14.95 €, 9.95 €)</option>
              <option value="50">Arrondi au .50 € le plus proche (Ex: 14.50 €)</option>
              <option value="00">Arrondi à l'euro entier (Ex: 15.00 €)</option>
              <option value="none">Aucun arrondi (Centimes exacts)</option>
            </select>
          </div>

          {/* Option Médicaments Remboursables */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <span>Tarifs Réglementés (CEPS)</span>
                <span className="text-[10px] text-amber-600 bg-amber-100 dark:bg-amber-950 px-1 py-0.2 rounded font-bold">2.1%</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Autoriser la simulation théorique sur médicaments remboursables
              </p>
            </div>
            <input
              type="checkbox"
              checked={includeRegulated}
              onChange={(e) => setIncludeRegulated(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher produit, CIP, laboratoire..."
              className="w-full pl-3 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Catégorie */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Toutes catégories</option>
              <option value="parapharmacie">Parapharmacie / Dermo (20% TVA)</option>
              <option value="medicament_otc">Médication Conseil / OTC (10% TVA)</option>
              <option value="dispositif_medical">Dispositifs Médicaux (20% TVA)</option>
              <option value="nutrition_bebe">Nutrition Infantile (5.5% TVA)</option>
              <option value="medicament_remboursable">Médicament Remboursable (2.1% TVA)</option>
            </select>
          </div>

          {/* Laboratoire */}
          <div>
            <select
              value={selectedLabo}
              onChange={(e) => setSelectedLabo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Tous laboratoires ({laboratories.length})</option>
              {laboratories.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>

          {/* Seuil minimum de hausse */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Hausse ≥</span>
            {[0, 5, 10].map(threshold => (
              <button
                key={threshold}
                onClick={() => setMinPriceHikePct(threshold)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  minPriceHikePct === threshold
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                +{threshold}%
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400 font-mono">
              {simulatedList.length} réf.
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Grille Comparatrice des Prix Publics & Marges Brutes Simulées
            </h4>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Marge Préservée</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Personnalisé</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Réglementé CEPS</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-4">Produit & Catégorie</th>
                <th className="py-3 px-3 text-right">Prix Achat HT</th>
                <th className="py-3 px-3 text-center">Hausse Fournisseur</th>
                <th className="py-3 px-3 text-right">Prix Vente Actuel</th>
                <th className="py-3 px-4 text-right bg-indigo-50/50 dark:bg-indigo-950/30">Nouveau Prix TTC Simulé</th>
                <th className="py-3 px-3 text-right">Marge Brute HT</th>
                <th className="py-3 px-3 text-right">Taux de Marque (%)</th>
                <th className="py-3 px-3 text-right">Marge Annuelle Sauvée</th>
                <th className="py-3 px-4 text-center">Ajustement Direct</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {simulatedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                    <p className="font-semibold text-sm">Aucun produit ne correspond aux filtres de simulation.</p>
                  </td>
                </tr>
              ) : (
                simulatedList.map(item => {
                  const sim = item.simulation;
                  const vatPct = (sim.vatRate * 100).toFixed(1);
                  const isHike = item.deltaAmountHt > 0;
                  const currentPvHt = item.currentPublicPriceTtc / (1 + sim.vatRate);
                  const currentMarginWithoutPassPct = ((currentPvHt - item.newPriceHt) / currentPvHt) * 100;
                  const isCustom = sim.isCustomized;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isCustom ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Produit & Laboratoire */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight truncate" title={item.name}>
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {item.cip}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                            {item.laboratory}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                            TVA {vatPct}%
                          </span>
                          {sim.isRegulated && (
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800">
                              Prix CEPS Fixe
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Prix Achat HT Ancien -> Nouveau */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <div className="text-[11px] text-slate-400 line-through">
                          {item.previousPriceHt.toFixed(2)} €
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {item.newPriceHt.toFixed(2)} €
                        </div>
                      </td>

                      {/* Hausse Fournisseur */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black ${
                          item.deltaPercentage >= 10
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : item.deltaPercentage >= 5
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.deltaPercentage > 0 ? `+${item.deltaPercentage.toFixed(1)}%` : `${item.deltaPercentage.toFixed(1)}%`}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          +{item.deltaAmountHt.toFixed(2)} € / u.
                        </div>
                      </td>

                      {/* Prix Vente Actuel TTC */}
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.currentPublicPriceTtc.toFixed(2)} €
                      </td>

                      {/* Nouveau Prix Vente Simulé TTC */}
                      <td className="py-3.5 px-4 text-right bg-indigo-50/40 dark:bg-indigo-950/20 font-mono">
                        <div className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                          {sim.simulatedPvTtc.toFixed(2)} €
                        </div>
                        {sim.deltaPriceTtc !== 0 && (
                          <div className={`text-[10px] font-bold ${sim.deltaPriceTtc > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {sim.deltaPriceTtc > 0 ? `+${sim.deltaPriceTtc.toFixed(2)} € TTC` : `${sim.deltaPriceTtc.toFixed(2)} € TTC`}
                          </div>
                        )}
                      </td>

                      {/* Marge Brute Unitaire HT */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {sim.simulatedMarginEurHt.toFixed(2)} €
                        </div>
                        <div className="text-[10px] text-slate-400">
                          vs {(currentPvHt - item.newPriceHt).toFixed(2)} € (sans rép.)
                        </div>
                      </td>

                      {/* Taux de Marque (%) */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {sim.simulatedMarginPct.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          dégradé à {currentMarginWithoutPassPct.toFixed(1)}%
                        </div>
                      </td>

                      {/* Marge Annuelle Sauvée */}
                      <td className="py-3.5 px-3 text-right">
                        <div className={`font-mono font-black text-xs ${
                          sim.annualMarginGainVsNoPass > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`}>
                          {sim.annualMarginGainVsNoPass > 0 ? `+${formatCurrency(sim.annualMarginGainVsNoPass)}` : '0,00 €'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          sur {item.estimatedAnnualVolumeUnits} boîtes/an
                        </div>
                      </td>

                      {/* Ajustement Direct / Input */}
                      <td className="py-3.5 px-4 text-center">
                        {sim.canAdjust ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.05"
                                value={sim.simulatedPvTtc}
                                onChange={(e) => handleManualPriceChange(item.id, parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 text-xs font-mono font-bold text-right rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">€</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 italic">
                            Non modifiable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Stratégique Officinal & Bonnes Pratiques */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>Repères Métier : Réglementation des Prix & Répercussion en Pharmacie d'Officine</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-slate-500 dark:text-slate-400">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200">1. Prix Libres (OTC & Parapharmacie) :</span>
            <p>
              Sur la médication familiale non remboursable, les compléments alimentaires et la dermo-cosmétique, le pharmacien est libre de fixer son prix public. La répercussion intégrale en valeur ou le maintien du taux de marge permet de préserver l'excédent brut d'exploitation (EBE).
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200">2. Médicaments Remboursables (CEPS) :</span>
            <p>
              Les prix publics et marges réglementées sont fixés par arrêté ministériel. En cas de hausse du prix fabricant ou de baisse de remise grossiste, la pharmacie ne peut pas augmenter le prix en caisse : il convient alors d'activer la substitution générique ou de contester la remise.
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200">3. Synchronisation LGO & Étiquettes :</span>
            <p>
              L'application en masse met à jour automatiquement la base article de votre LGO (WinPharma, LGPI, Pharmagest, Smart Rx) et déclenche la réimpression des étiquettes électroniques de gondole (EEG).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
