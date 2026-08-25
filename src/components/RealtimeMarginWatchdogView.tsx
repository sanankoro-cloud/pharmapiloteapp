import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  Sliders, 
  Bell, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  RefreshCw, 
  ArrowDownRight, 
  ArrowUpRight, 
  Download, 
  FileSpreadsheet, 
  DollarSign, 
  Percent, 
  Play, 
  Pause, 
  PlusCircle, 
  Zap, 
  RotateCcw,
  Check,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Pill
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Area
} from 'recharts';
import { 
  CategoryMarginStatus, 
  CategoryMarginAnomaly, 
  LiveSalesTicket, 
  MarginWatchdogConfig,
  MarginAlertSeverity,
  CustomMarginRule
} from '../types/marginWatchdog';
import { ProductCategory } from '../types/pharmacy';
import { 
  MOCK_CATEGORY_MARGINS, 
  MOCK_LIVE_TICKETS, 
  DEFAULT_WATCHDOG_CONFIG,
  DEFAULT_CUSTOM_MARGIN_RULES
} from '../data/mockMarginWatchdog';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { CustomMarginRulesManager } from './CustomMarginRulesManager';
import { ProductMarginTherapeuticDashboard } from './ProductMarginTherapeuticDashboard';

interface RealtimeMarginWatchdogViewProps {
  onNavigateTab?: (tab: string) => void;
  onTriggerPushNotification?: (title: string, message: string, severity: 'critique' | 'attention' | 'info') => void;
}

export const RealtimeMarginWatchdogView: React.FC<RealtimeMarginWatchdogViewProps> = ({
  onNavigateTab,
  onTriggerPushNotification
}) => {
  // Main view switcher: Watchdog Live vs Dashboard Marges par Produit & Classes Thérapeutiques
  const [activeViewMode, setActiveViewMode] = useState<'product_margins' | 'watchdog_live'>('product_margins');

  // State for margin status list
  const [categories, setCategories] = useState<CategoryMarginStatus[]>(MOCK_CATEGORY_MARGINS);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('parapharmacie');
  const [liveTickets, setLiveTickets] = useState<LiveSalesTicket[]>(MOCK_LIVE_TICKETS);
  
  // Watchdog Settings
  const [config, setConfig] = useState<MarginWatchdogConfig>(DEFAULT_WATCHDOG_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(true);
  const [lastScanTimestamp, setLastScanTimestamp] = useState<string>(new Date().toLocaleTimeString('fr-FR'));
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Custom Rules State (Règles d'alertes personnalisables < 15% etc.)
  const [customRules, setCustomRules] = useState<CustomMarginRule[]>(DEFAULT_CUSTOM_MARGIN_RULES);

  // Active category object
  const activeCat = useMemo(() => {
    return categories.find(c => c.categoryId === selectedCategory) || categories[0];
  }, [categories, selectedCategory]);

  // Overall counts
  const criticalAlertCount = useMemo(() => {
    return categories.filter(c => c.isAlertTriggered).length;
  }, [categories]);

  const totalMonthlyLossEur = useMemo(() => {
    return categories.reduce((acc, cat) => acc + (cat.isAlertTriggered ? cat.estimatedLossEur : 0), 0);
  }, [categories]);

  // Sound effect simulation
  const playAlertSound = () => {
    if (!config.enableAudioAlerts) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  // Periodic live scan simulator
  useEffect(() => {
    if (!isLiveStreamActive) return;

    const interval = setInterval(() => {
      setLastScanTimestamp(new Date().toLocaleTimeString('fr-FR'));
    }, config.realtimeScanIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [isLiveStreamActive, config.realtimeScanIntervalSec]);

  // Custom Rule Management Handlers
  const handleSaveRule = (rule: CustomMarginRule) => {
    setCustomRules(prev => {
      const exists = prev.some(r => r.id === rule.id);
      if (exists) {
        return prev.map(r => r.id === rule.id ? rule : r);
      }
      return [rule, ...prev];
    });
    showFeedback(`Règle d'alerte "${rule.name}" enregistrée avec succès (Seuil < ${rule.thresholdPct}%).`);
  };

  const handleDeleteRule = (ruleId: string) => {
    const deleted = customRules.find(r => r.id === ruleId);
    setCustomRules(prev => prev.filter(r => r.id !== ruleId));
    showFeedback(`Règle "${deleted?.name || ruleId}" supprimée.`);
  };

  const handleToggleRule = (ruleId: string) => {
    setCustomRules(prev => prev.map(r => {
      if (r.id === ruleId) {
        const nextState = !r.isEnabled;
        showFeedback(`Règle "${r.name}" ${nextState ? 'activée' : 'désactivée'}.`);
        return { ...r, isEnabled: nextState };
      }
      return r;
    }));
  };

  const handleTestRulePush = (rule: CustomMarginRule) => {
    const catLabels = rule.targetCategories.map(catKey => {
      const match = categories.find(c => c.categoryId === catKey);
      return match ? match.categoryName : catKey;
    }).join(', ');

    if (rule.actionChannels.audioAlert) {
      playAlertSound();
    }

    if (rule.actionChannels.pushNotification && onTriggerPushNotification) {
      onTriggerPushNotification(
        `🚨 ${rule.name}`,
        `Test Alerte Push : Marge brute < ${rule.thresholdPct}% détectée sur les catégories [${catLabels}]. Surveillance active.`,
        rule.severity
      );
    }

    // Update rule trigger stats
    setCustomRules(prev => prev.map(r => {
      if (r.id === rule.id) {
        return {
          ...r,
          triggerCount: r.triggerCount + 1,
          lastTriggeredAt: new Date().toLocaleTimeString('fr-FR')
        };
      }
      return r;
    }));

    showFeedback(`Alerte Push déclenchée et envoyée avec succès pour "${rule.name}" (< ${rule.thresholdPct}%).`);
  };

  // Simulate injecting a real-time ticket with custom low margin (< 15%)
  const handleInjectLowMarginCriticalTicket = () => {
    const ticketId = `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toLocaleTimeString('fr-FR');
    
    // Low margin ticket (< 15%)
    const newTicket: LiveSalesTicket = {
      id: `tick-${Date.now()}`,
      timestamp: timeStr,
      ticketNumber: ticketId,
      cashierName: 'Élodie (Préparatrice)',
      category: 'veterinaire',
      productName: 'FRONTLINE TRI-ACT Chien 20-40kg 6 Pipettes',
      qty: 2,
      pumpHt: 38.50,
      publicPriceTtc: 43.90, // Marge très faible ~ 11.2%
      discountAppliedPct: 15.0,
      marginRatePct: 11.20, // < 15% (Chute sous seuil plancher)
      isDiscountAnomalous: true,
      impactDeltaPts: -26.30
    };

    setLiveTickets(prev => [newTicket, ...prev.slice(0, 14)]);
    playAlertSound();

    // Check if any custom rule matches margin < 15%
    const matchingRules = customRules.filter(r => 
      r.isEnabled && 
      r.targetCategories.includes(newTicket.category) && 
      newTicket.marginRatePct < r.thresholdPct
    );

    if (matchingRules.length > 0 && onTriggerPushNotification) {
      const activeRule = matchingRules[0];
      onTriggerPushNotification(
        `🚨 ${activeRule.name} : Marge ${newTicket.marginRatePct.toFixed(1)}% (< ${activeRule.thresholdPct}%)`,
        `Alerte Push Immédiate : Le ticket ${ticketId} (${newTicket.productName}) a été vendu avec une marge de seulement ${newTicket.marginRatePct.toFixed(1)}% sur la catégorie Vétérinaire (Seuil plancher ${activeRule.thresholdPct}% violé).`,
        activeRule.severity
      );

      // Update trigger count
      setCustomRules(prev => prev.map(r => {
        if (r.id === activeRule.id) {
          return {
            ...r,
            triggerCount: r.triggerCount + 1,
            lastTriggeredAt: timeStr
          };
        }
        return r;
      }));
    } else if (onTriggerPushNotification) {
      onTriggerPushNotification(
        '🚨 Alerte Marge Plancher Critique (< 15%)',
        `Vente sous le seuil plancher critique : Marge de ${newTicket.marginRatePct.toFixed(1)}% enregistrée sur le ticket ${ticketId}.`,
        'critique'
      );
    }

    showFeedback(`🚨 Alerte Seuil Plancher < 15% : Ticket ${ticketId} détecté à ${newTicket.marginRatePct.toFixed(1)}% de marge. Alerte push envoyée !`);
  };

  // Simulate injecting a standard or discounted ticket
  const handleInjectSimulatedTicket = (withAggressiveDiscount: boolean) => {
    const ticketId = `TK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toLocaleTimeString('fr-FR');
    
    let newTicket: LiveSalesTicket;
    
    if (withAggressiveDiscount) {
      newTicket = {
        id: `tick-${Date.now()}`,
        timestamp: timeStr,
        ticketNumber: ticketId,
        cashierName: 'Élodie (Préparatrice)',
        category: 'parapharmacie',
        productName: 'LA ROCHE-POSAY Anthelios Fluide UVMune 400 50ml',
        qty: 3,
        pumpHt: 9.80,
        publicPriceTtc: 16.50,
        discountAppliedPct: 25.0, // Grosse remise
        marginRatePct: 18.20,
        isDiscountAnomalous: true,
        impactDeltaPts: -24.30
      };
      
      // Update parapharmacie margin down
      setCategories(prev => prev.map(c => {
        if (c.categoryId === 'parapharmacie') {
          const newCurrentMargin = Math.max(30.0, Number((c.currentMarginRatePct - 0.25).toFixed(2)));
          const newDelta = Number((newCurrentMargin - c.movingAverage3mPct).toFixed(2));
          return {
            ...c,
            currentMarginRatePct: newCurrentMargin,
            deltaPoints: newDelta,
            deltaRelativePct: Number(((newDelta / c.movingAverage3mPct) * 100).toFixed(2)),
            isAlertTriggered: Math.abs(newDelta) >= config.dropThresholdPoints,
            estimatedLossEur: c.estimatedLossEur + 185.00
          };
        }
        return c;
      }));

      playAlertSound();
      if (onTriggerPushNotification) {
        onTriggerPushNotification(
          '🚨 Alerte Marge Parapharmacie !',
          'Vente avec -25% de remise détectée (Ticket ' + ticketId + '). La marge de la catégorie s\'est encore dégradée.',
          'critique'
        );
      }
      showFeedback(`Ticket ${ticketId} injecté avec remise anormale (-25%). Marge recalculée en direct !`);
    } else {
      newTicket = {
        id: `tick-${Date.now()}`,
        timestamp: timeStr,
        ticketNumber: ticketId,
        cashierName: 'Dr N\'Fafode Camara',
        category: 'parapharmacie',
        productName: 'BIODERMA Créaline H2O 500ml',
        qty: 1,
        pumpHt: 6.20,
        publicPriceTtc: 12.90,
        discountAppliedPct: 0.0,
        marginRatePct: 42.30,
        isDiscountAnomalous: false,
        impactDeltaPts: -0.20
      };
      showFeedback(`Ticket standard ${ticketId} synchronisé en temps réel.`);
    }

    setLiveTickets(prev => [newTicket, ...prev.slice(0, 14)]);
  };

  // Action: Apply suggested price for an anomaly
  const handleApplyPriceCorrection = (anomalyId: string) => {
    setCategories(prev => prev.map(c => {
      const updatedAnomalies = c.anomalies.map(a => {
        if (a.id === anomalyId) {
          return { ...a, isApplied: true };
        }
        return a;
      });

      // Recalculate slightly improved margin
      const solvedCount = updatedAnomalies.filter(a => a.isApplied).length;
      const boost = solvedCount * 0.9;
      const newMargin = Math.min(c.movingAverage3mPct, Number((c.currentMarginRatePct + boost).toFixed(2)));
      const newDelta = Number((newMargin - c.movingAverage3mPct).toFixed(2));
      const isStillTriggered = Math.abs(newDelta) >= config.dropThresholdPoints;

      return {
        ...c,
        anomalies: updatedAnomalies,
        currentMarginRatePct: newMargin,
        deltaPoints: newDelta,
        deltaRelativePct: Number(((newDelta / c.movingAverage3mPct) * 100).toFixed(2)),
        isAlertTriggered: isStillTriggered,
        severity: isStillTriggered ? 'critique' : 'normal'
      };
    }));

    showFeedback('Tarif public revalorisé sur le catalogue LGO. La marge cible est restaurée pour cette référence.');
  };

  // Action: Lock cashier discounts
  const handleLockDiscounts = () => {
    setConfig(prev => ({
      ...prev,
      maxCounterDiscountAllowedPct: 5.0,
      notifyOnCounterOverDiscount: true
    }));
    showFeedback('Verrouillage appliqué : Remises comptoir bloquées à 5% max sur tous les postes de caisse.');
  };

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  // CSV Export for Margin Audit
  const handleExportCsv = () => {
    const headers = [
      'Categorie',
      'Code',
      'CA_HT_Août',
      'Marge_HT_Août',
      'Marge_Actuelle_Pct',
      'Marge_M-3_Mai',
      'Marge_M-2_Juin',
      'Marge_M-1_Juil',
      'Moyenne_Mobile_3M_Pct',
      'Delta_Points',
      'Delta_Relatif_Pct',
      'Statut_Alerte',
      'Perte_Estimee_Euros'
    ];

    const rows = categories.map(c => [
      `"${c.categoryName}"`,
      c.categoryCode,
      c.caHtCurrentMonth.toFixed(2),
      c.margeHtCurrentMonth.toFixed(2),
      c.currentMarginRatePct.toFixed(2),
      c.m3MarginRatePct.toFixed(2),
      c.m2MarginRatePct.toFixed(2),
      c.m1MarginRatePct.toFixed(2),
      c.movingAverage3mPct.toFixed(2),
      c.deltaPoints.toFixed(2),
      c.deltaRelativePct.toFixed(2),
      c.isAlertTriggered ? 'ALERTE_CHUTE_SUP_5PCT' : 'CONFORME',
      c.estimatedLossEur.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Surveillance_Marges_3M_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showFeedback('Export CSV de la surveillance des marges généré avec succès.');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Primary View Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveViewMode('product_margins')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'product_margins'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeViewMode === 'product_margins' ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
            <span>Marges par Produit & Classes Thérapeutiques</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
              activeViewMode === 'product_margins' ? 'bg-white text-indigo-700' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
            }`}>
              10 Classes • Analyse DCI
            </span>
          </button>

          <button
            onClick={() => setActiveViewMode('watchdog_live')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeViewMode === 'watchdog_live'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${activeViewMode === 'watchdog_live' ? 'text-white' : 'text-rose-600'}`} />
            <span>Surveillance Live & Alertes MM3M</span>
            {criticalAlertCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {criticalAlertCount} Alerte
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 px-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Mise à jour LGO : {lastScanTimestamp}</span>
        </div>
      </div>

      {/* VIEW 1: DEDICATED PRODUCT MARGIN & THERAPEUTIC CLASS DASHBOARD */}
      {activeViewMode === 'product_margins' && (
        <ProductMarginTherapeuticDashboard onNavigateTab={onNavigateTab} />
      )}

      {/* VIEW 2: REAL-TIME WATCHDOG & LIVE MM3M ANOMALY FEED */}
      {activeViewMode === 'watchdog_live' && (
        <div className="space-y-6">
          {/* Top Banner: Real-time Live Engine & Quick Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shadow-xs">
                  <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
                </span>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Surveillance des Marges en Temps Réel
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live Feed Actif ({lastScanTimestamp})
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Détection automatique et alertes immédiates en cas de chute de marge brute supérieure à <strong>{config.dropThresholdPoints}%</strong> par rapport à la moyenne mobile des 3 derniers mois (MM3M).
              </p>
            </div>

            {/* Action controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  const el = document.getElementById('custom-rules-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold shadow-xs transition"
              >
                <Bell className="w-4 h-4 text-rose-600" />
                <span>Règles d'Alerte Push ({customRules.filter(r => r.isEnabled).length})</span>
              </button>

              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition"
              >
                <Sliders className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Seuils & Paramètres ({config.dropThresholdPoints}%)</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition"
              >
                <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 text-xs font-bold ml-3"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Configuration Drawer / Settings Bar (Collapsible) */}
      {isConfigOpen && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Paramétrage des Déclencheurs de Surveillance des Marges</h2>
            </div>
            <button 
              onClick={() => setIsConfigOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
            >
              Masquer
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Seuil de déclenchement */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Seuil d'Alerte Chute Marge (%)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="2.0" 
                  max="10.0" 
                  step="0.5"
                  value={config.dropThresholdPoints}
                  onChange={(e) => setConfig({ ...config, dropThresholdPoints: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-sm font-mono font-black text-rose-400 shrink-0 w-12 text-right">
                  -{config.dropThresholdPoints.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Alerte dès que Marge &lt; MM3M - {config.dropThresholdPoints}%</p>
            </div>

            {/* Intervalle de Scan Live */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fréquence d'Interrogation LGO
              </label>
              <select
                value={config.realtimeScanIntervalSec}
                onChange={(e) => setConfig({ ...config, realtimeScanIntervalSec: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value={5}>Temps Réel Ultra (Toutes les 5 sec)</option>
                <option value={15}>Standard Officine (Toutes les 15 sec)</option>
                <option value={60}>Cadencé (Toutes les 1 min)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Flux caisse WinPharma / SmartRx / LGPI</p>
            </div>

            {/* Alertes Sonores & Push */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Canaux d'Alerte
              </label>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => setConfig({ ...config, enableAudioAlerts: !config.enableAudioAlerts })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    config.enableAudioAlerts ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {config.enableAudioAlerts ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Sonnerie Caisse</span>
                </button>
                <button
                  onClick={() => setConfig({ ...config, enableBrowserPush: !config.enableBrowserPush })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    config.enableBrowserPush ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Push Mobile</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Notifier le titulaire sur rupture de marge</p>
            </div>

            {/* Plafond de remise caisse */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plafond Remise Comptoir Max
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Max :</span>
                <input 
                  type="number"
                  min="0"
                  max="15"
                  value={config.maxCounterDiscountAllowedPct}
                  onChange={(e) => setConfig({ ...config, maxCounterDiscountAllowedPct: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-white text-center font-mono font-bold"
                />
                <span className="text-xs text-slate-300 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Au-delà : code pharmacien titulaire requis</p>
            </div>
          </div>
        </div>
      )}

      {/* FLASH CRITICAL ALERT BANNER : If any category breached the 5% drop */}
      {criticalAlertCount > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-900 via-rose-950 to-slate-900 text-white border-2 border-rose-500 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white uppercase tracking-wider shadow-sm animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span>Rupture de Rentabilité Détectée (&gt; {config.dropThresholdPoints}% de chute)</span>
              </div>
              
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Alerte Critique sur la Parapharmacie & Dermo-Cosmétique : Marge à 36,80% (vs 42,50% MM3M)
              </h2>
              
              <p className="text-xs sm:text-sm text-rose-200">
                La marge brute a chuté de <strong>-5,70 points (-13,41% relatif)</strong> sous la moyenne mobile des 3 derniers mois (Mai: 42,6%, Juin: 42,8%, Juillet: 42,1%). Perte d'exploitation estimée à <strong>-1 986,45 €/mois</strong> si aucune mesure n'est prise.
              </p>

              <div className="flex items-center gap-4 text-xs text-rose-300 pt-1 font-mono">
                <span>• Cause 1: Hausse PUMP U.Labs/Movianto (+14,2%) non répercutée</span>
                <span>• Cause 2: Remises caisse d'été abusives (15% au comptoir)</span>
              </div>
            </div>

            {/* Quick corrective action buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                onClick={() => {
                  setSelectedCategory('parapharmacie');
                  handleApplyPriceCorrection('anom-para-1');
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-900 text-xs font-black shadow-md transition"
              >
                <Zap className="w-4 h-4 text-rose-600" />
                <span>Revaloriser les Prix Publics Conseillés</span>
              </button>

              <button
                onClick={handleLockDiscounts}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-800/80 hover:bg-rose-700/80 border border-rose-600 text-white text-xs font-bold shadow-sm transition"
              >
                <ShieldAlert className="w-4 h-4 text-rose-300" />
                <span>Brider Remises Caisse à 5% Max</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aggregate KPI Grid (7 Categories Overview Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Matrice de Surveillance des 7 Catégories (Temps Réel vs MM3M)</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Seuil d'alerte configuré à -{config.dropThresholdPoints.toFixed(1)} pts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.categoryId;
            const isCritical = cat.isAlertTriggered;
            const isWarning = cat.severity === 'warning';
            const isPerf = cat.severity === 'performance';

            return (
              <div
                key={cat.categoryId}
                onClick={() => setSelectedCategory(cat.categoryId)}
                className={`cursor-pointer rounded-2xl p-3.5 border transition relative flex flex-col justify-between ${
                  isSelected 
                    ? 'ring-2 ring-emerald-500 bg-white dark:bg-slate-800 shadow-md border-emerald-400' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                } ${isCritical ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                      {cat.categoryCode}
                    </span>
                    {isCritical ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white animate-pulse">
                        ALERTE
                      </span>
                    ) : isWarning ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Vigilance
                      </span>
                    ) : isPerf ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        +Perf
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Stable
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-2" title={cat.categoryName}>
                    {cat.categoryName}
                  </h3>

                  {/* Big Margin Rate */}
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-xl font-black font-mono ${
                      isCritical ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {cat.currentMarginRatePct.toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      MM: {cat.movingAverage3mPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Delta Badge & Active Rule Pill */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Écart MM3M</span>
                    <span className={`text-xs font-black font-mono flex items-center ${
                      cat.deltaPoints < 0 
                        ? isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {cat.deltaPoints > 0 ? '+' : ''}{cat.deltaPoints.toFixed(2)} pts
                    </span>
                  </div>

                  {/* Custom Floor Rule Indicator if targeted */}
                  {(() => {
                    const activeRule = customRules.find(r => r.isEnabled && r.targetCategories.includes(cat.categoryId));
                    if (!activeRule) return null;
                    const isBelowFloor = cat.currentMarginRatePct < activeRule.thresholdPct;
                    return (
                      <div className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold flex items-center justify-between ${
                        isBelowFloor 
                          ? 'bg-rose-600 text-white animate-pulse' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <span>Règle :</span>
                        <span>&lt; {activeRule.thresholdPct.toFixed(1)}%</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Focus Panel for Selected Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Recharts Graph & Moving Average Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${activeCat.badgeBg}`}>
                    {activeCat.categoryCode}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {activeCat.categoryName} : Courbe Marge vs Moyenne Mobile 3 Mois
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeCat.description}
                </p>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Moyenne Mobile 3M</div>
                  <div className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {activeCat.movingAverage3mPct.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500">Marge Actuelle</div>
                  <div className={`text-sm font-black font-mono ${
                    activeCat.isAlertTriggered ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {activeCat.currentMarginRatePct.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Month Moving Average Math Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">{activeCat.m3MonthName} (M-3)</div>
                <div className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                  {activeCat.m3MarginRatePct.toFixed(2)}%
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-0.5">{activeCat.m2MonthName} (M-2)</div>
                <div className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                  {activeCat.m2MarginRatePct.toFixed(2)}%
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-0.5">{activeCat.m1MonthName} (M-1)</div>
                <div className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                  {activeCat.m1MarginRatePct.toFixed(2)}%
                </div>
              </div>

              <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                <div className="text-indigo-600 dark:text-indigo-400 font-bold mb-0.5">Moyenne MM3M</div>
                <div className="text-sm font-mono font-black text-indigo-700 dark:text-indigo-300">
                  {activeCat.movingAverage3mPct.toFixed(2)}%
                </div>
                <div className="text-[10px] text-rose-500 font-semibold">
                  Seuil Alerte : {(activeCat.movingAverage3mPct - config.dropThresholdPoints).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeCat.trendHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    domain={[(dataMin: number) => Math.max(0, Math.floor(dataMin - 5)), (dataMax: number) => Math.ceil(dataMax + 5)]} 
                    tickFormatter={(v) => `${v}%`} 
                  />
                  <Tooltip 
                    formatter={(val: any, name: any) => [`${Number(val).toFixed(2)}%`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {/* Seuil d'Alerte MM3M - 5% */}
                  <ReferenceLine 
                    y={activeCat.movingAverage3mPct - config.dropThresholdPoints} 
                    stroke="#ef4444" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                    label={{ 
                      value: `Seuil Alerte (-${config.dropThresholdPoints}%) : ${(activeCat.movingAverage3mPct - config.dropThresholdPoints).toFixed(1)}%`, 
                      fill: '#ef4444', 
                      fontSize: 10, 
                      position: 'insideBottomRight' 
                    }} 
                  />

                  {/* Ligne Moyenne Mobile 3M */}
                  <Line 
                    type="monotone" 
                    dataKey="movingAverage3mPct" 
                    name="Moyenne Mobile 3 Mois (%)" 
                    stroke="#6366f1" 
                    strokeWidth={2} 
                    dot={false}
                  />

                  {/* Taux de Marge Réalisé */}
                  <Line 
                    type="monotone" 
                    dataKey="marginRatePct" 
                    name="Taux de Marge Réalisé (%)" 
                    stroke={activeCat.isAlertTriggered ? '#f43f5e' : '#10b981'} 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: activeCat.isAlertTriggered ? '#f43f5e' : '#10b981' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Root-Cause Anomalies & Remediation Actions for Selected Category */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Analyse des Causes Racines & Actions Correctives</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Références et pratiques commerciales expliquant la perte de marge sur {activeCat.categoryName}.
                </p>
              </div>
            </div>

            {activeCat.anomalies.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Aucune anomalie détectée sur cette catégorie
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  La marge brute est en ligne avec la moyenne mobile des 3 derniers mois.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCat.anomalies.map((anomaly) => (
                  <div 
                    key={anomaly.id} 
                    className={`p-4 rounded-2xl border transition ${
                      anomaly.isApplied 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            CIP {anomaly.productCip}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            {anomaly.issueLabel}
                          </span>
                          {anomaly.isApplied && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Corrigé
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {anomaly.productName}
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {anomaly.suggestedAction}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-mono">
                          <span>PUMP Actuel: <strong>{formatCurrency(anomaly.currentPumpHt)} HT</strong></span>
                          <span>Prix Public Actuel: <strong>{formatCurrency(anomaly.currentPublicPriceTtc)} TTC</strong></span>
                          <span>Prix Public Conseillé: <strong className="text-emerald-600">{formatCurrency(anomaly.suggestedPublicPriceTtc)} TTC</strong></span>
                          <span>Impact Marge: <strong className="text-rose-600">-{formatCurrency(anomaly.impactMargeEur)}</strong></span>
                        </div>
                      </div>

                      {/* Correct action button */}
                      {!anomaly.isApplied && (
                        <button
                          onClick={() => handleApplyPriceCorrection(anomaly.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 self-start transition"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Appliquer Correction</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Live Cash Register Simulator (Flux Caisse Temps Réel) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Flux Caisse Live (Simulateur)
                </h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chaque ticket scanné recalcule instantanément la marge de la catégorie et déclenche une alerte si la remise ou le prix écrasent la rentabilité.
            </p>

            {/* Test Simulation Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleInjectLowMarginCriticalTicket}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-between transition shadow-md group"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-white animate-bounce" />
                  <span>Tester Alerte Règle &lt; 15% (Push)</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">
                  11.2% Marge
                </span>
              </button>

              <button
                onClick={() => handleInjectSimulatedTicket(true)}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-between transition shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>Tester Vente Remise Abusive (-25%)</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-rose-200 dark:bg-rose-900 px-1.5 py-0.5 rounded">
                  -25%
                </span>
              </button>

              <button
                onClick={() => handleInjectSimulatedTicket(false)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-between transition shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span>Injecter Vente Standard (0% Remise)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  Flux Normal
                </span>
              </button>
            </div>

            {/* Live Feed Ticket List */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Derniers Passages en Caisse :
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                {liveTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      ticket.isDiscountAnomalous
                        ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-200'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-[11px] text-slate-500">
                        {ticket.ticketNumber} • {ticket.timestamp}
                      </span>
                      {ticket.isDiscountAnomalous ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500 text-white">
                          Remise -{ticket.discountAppliedPct}%
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-emerald-600">
                          Marge {ticket.marginRatePct.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {ticket.productName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Opérateur: {ticket.cashierName}</span>
                      <span className="font-mono">{formatCurrency(ticket.publicPriceTtc)} TTC</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customizable Push Alert Rules Manager Section */}
      <div id="custom-rules-section" className="pt-2">
        <CustomMarginRulesManager
          rules={customRules}
          onSaveRule={handleSaveRule}
          onDeleteRule={handleDeleteRule}
          onToggleRule={handleToggleRule}
          onTestRulePush={handleTestRulePush}
        />
      </div>

        </div>
      )}

    </div>
  );
};
