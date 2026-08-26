import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Info,
  Sparkles,
  Sliders,
  Percent,
  Zap,
  Gauge
} from 'lucide-react';
import { ProductCategory } from '../types/pharmacy';
import { CategoryMarginStatus } from '../types/marginWatchdog';
import { MOCK_CATEGORY_MARGINS } from '../data/mockMarginWatchdog';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface MarginGaugeCardProps {
  categories?: CategoryMarginStatus[];
  isRealModeActive?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export const MarginGaugeCard: React.FC<MarginGaugeCardProps> = ({ 
  categories = MOCK_CATEGORY_MARGINS, 
  isRealModeActive = false,
  onNavigateTab 
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('globale');

  // Check if we are in blank/empty state
  const isBlankState = isRealModeActive && (!categories || categories.length === 0 || categories.every(c => c.caHtCurrentMonth === 0));

  // Consolidated Global Officine Metrics
  const globalSummary = useMemo(() => {
    if (categories.length === 0) {
      return {
        categoryId: 'globale' as ProductCategory,
        categoryName: 'Marge Brute Globale Officine (Toutes Catégories)',
        categoryCode: 'GLOBAL',
        caHtCurrentMonth: 0,
        margeHtCurrentMonth: 0,
        currentMarginRatePct: 0,
        movingAverage3mPct: 0,
        deltaPoints: 0,
        deltaRelativePct: 0,
        m3MonthName: 'M-3',
        m3MarginRatePct: 0,
        m2MonthName: 'M-2',
        m2MarginRatePct: 0,
        m1MonthName: 'M-1',
        m1MarginRatePct: 0,
        alertThresholdPoints: 5.0,
        severity: 'normal' as const,
        isAlertTriggered: false,
        estimatedLossEur: 0,
        description: 'Consolidation des flux de marge de l\'officine.'
      };
    }

    const totalCaHt = categories.reduce((sum, c) => sum + c.caHtCurrentMonth, 0);
    const totalMargeHt = categories.reduce((sum, c) => sum + c.margeHtCurrentMonth, 0);
    const currentRate = totalCaHt > 0 ? (totalMargeHt / totalCaHt) * 100 : (isRealModeActive ? 0 : 33.5);
    
    // Global MM3M weighted
    const mm3mWeighted = isRealModeActive && totalCaHt === 0 ? 0 : 35.8;
    const delta = mm3mWeighted > 0 ? currentRate - mm3mWeighted : 0;
    
    return {
      categoryId: 'globale' as ProductCategory,
      categoryName: 'Marge Brute Globale Officine (Toutes Catégories)',
      categoryCode: 'GLOBAL',
      caHtCurrentMonth: totalCaHt,
      margeHtCurrentMonth: totalMargeHt,
      currentMarginRatePct: Number(currentRate.toFixed(2)),
      movingAverage3mPct: mm3mWeighted,
      deltaPoints: Number(delta.toFixed(2)),
      deltaRelativePct: mm3mWeighted > 0 ? Number(((delta / mm3mWeighted) * 100).toFixed(2)) : 0,
      m3MonthName: 'Mai 2026',
      m3MarginRatePct: isRealModeActive ? 0 : 36.1,
      m2MonthName: 'Juin 2026',
      m2MarginRatePct: isRealModeActive ? 0 : 35.9,
      m1MonthName: 'Juillet 2026',
      m1MarginRatePct: isRealModeActive ? 0 : 35.4,
      alertThresholdPoints: 5.0,
      severity: delta <= -5 && !isRealModeActive ? 'critique' : delta <= -2 && !isRealModeActive ? 'warning' : 'normal',
      isAlertTriggered: delta <= -5 && !isRealModeActive,
      estimatedLossEur: isRealModeActive ? 0 : 2545.0,
      description: 'Consolidation pondérée des 7 catégories de l\'officine (Rx, OTC, Para, DM, Veto, Bébé, Actes).'
    };
  }, [categories, isRealModeActive]);

  // Current active data item for the gauge
  const currentData = useMemo(() => {
    if (selectedKey === 'globale') {
      return globalSummary;
    }
    const found = categories.find(c => c.categoryId === selectedKey);
    return found || globalSummary;
  }, [selectedKey, categories, globalSummary]);

  // Health scale calculation:
  // Red: margin < (MM3M - 5.0%)
  // Orange: (MM3M - 5.0%) <= margin < (MM3M - 2.0%)
  // Green: margin >= (MM3M - 2.0%)
  const healthStatus = useMemo(() => {
    if (isBlankState || currentData.movingAverage3mPct === 0) {
      return {
        level: 'vert' as const,
        label: 'Mode Réel Prêt • Conforme',
        subLabel: 'Surveillance en écoute des tickets LGO',
        color: '#10b981',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        icon: CheckCircle2,
        actionRequired: false
      };
    }

    const mm3m = currentData.movingAverage3mPct;
    const current = currentData.currentMarginRatePct;
    const criticalThreshold = mm3m - 5.0;
    const warningThreshold = mm3m - 2.0;

    if (current < criticalThreshold) {
      return {
        level: 'rouge' as const,
        label: 'Zone Critique (Chute > 5%)',
        subLabel: 'Rupture de rentabilité détectée',
        color: '#f43f5e',
        badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        textColor: 'text-rose-600 dark:text-rose-400',
        icon: AlertTriangle,
        actionRequired: true
      };
    } else if (current < warningThreshold) {
      return {
        level: 'orange' as const,
        label: 'Zone de Vigilance (-2% à -5%)',
        subLabel: 'Érosion modérée sous surveillance',
        color: '#f59e0b',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        textColor: 'text-amber-600 dark:text-amber-400',
        icon: TrendingDown,
        actionRequired: false
      };
    } else {
      return {
        level: 'vert' as const,
        label: 'Zone Optimale & Conforme (≥ MM3M - 2%)',
        subLabel: 'Rentabilité saine et pérenne',
        color: '#10b981',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        icon: CheckCircle2,
        actionRequired: false
      };
    }
  }, [currentData, isBlankState]);

  // SVG Gauge Math (Semi-circle arc 180 degrees from 180° to 0°)
  // We'll normalize the scale from minGauge to maxGauge
  const { minGauge, maxGauge, mm3mVal, currentVal, criticalThresh, warningThresh } = useMemo(() => {
    const mm = currentData.movingAverage3mPct || (isBlankState ? 33.0 : 35.8);
    const cur = currentData.currentMarginRatePct;
    const span = Math.max(15, Math.ceil(mm * 0.5));
    const minG = Math.max(0, Math.floor(mm - span));
    const maxG = Math.ceil(mm + span);

    return {
      minGauge: minG,
      maxGauge: maxG,
      mm3mVal: mm,
      currentVal: cur,
      criticalThresh: mm - 5.0,
      warningThresh: mm - 2.0
    };
  }, [currentData, isBlankState]);

  // Convert value to degree on semi-circle (180deg at minGauge to 0deg at maxGauge)
  const valToAngle = (val: number) => {
    const clamped = Math.max(minGauge, Math.min(maxGauge, val));
    const ratio = (clamped - minGauge) / (maxGauge - minGauge);
    // 180° (left) -> 0° (right)
    return 180 - ratio * 180;
  };

  // Helper for polar to cartesian
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy - r * Math.sin(angleInRadians)
    };
  };

  // Describe SVG arc path
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
    // Sweep is 1 for clockwise if from 180 -> 0 (top hemisphere)
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const cx = 140;
  const cy = 135;
  const radius = 95;
  const strokeW = 18;

  // Angles for the 3 health sectors
  const startAngle = 180;
  const critAngle = valToAngle(criticalThresh);
  const warnAngle = valToAngle(warningThresh);
  const endAngle = 0;

  // Needle angle for current margin
  const needleAngle = valToAngle(currentVal);
  const needleCoord = polarToCartesian(cx, cy, radius - 15, needleAngle);
  const mm3mCoord = polarToCartesian(cx, cy, radius + 12, valToAngle(mm3mVal));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
      
      {/* Header & Quick Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Gauge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Gage de Marge & Échelle de Santé (vs MM3M)</span>
                {healthStatus.level === 'rouge' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                    ALERTE &gt; 5%
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Surveillance de la marge brute réalisée par rapport à la moyenne mobile des 3 derniers mois (MM3M).
              </p>
            </div>
          </div>
        </div>

        {/* Action button to open full Realtime Watchdog */}
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('surveillance_marges')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-bold shadow-xs transition self-start md:self-auto"
          >
            <span>Surveillance Temps Réel Complète</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Pills (Tabs for the Gauge) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedKey('globale')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
            selectedKey === 'globale'
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          🌐 Officine Globale
        </button>

        {categories.map((cat) => {
          const isSel = selectedKey === cat.categoryId;
          const isCrit = cat.isAlertTriggered;
          return (
            <button
              key={cat.categoryId}
              onClick={() => setSelectedKey(cat.categoryId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center gap-1.5 ${
                isSel
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                  : isCrit
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{cat.categoryName.split('&')[0].trim()}</span>
              {isCrit && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Gauge Visual + Metrics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Side: Semi-Circular Gauge Visualization (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 relative">
          
          {/* SVG Semi-Circle Dial */}
          <div className="relative w-[280px] h-[175px] flex items-center justify-center">
            <svg viewBox="0 0 280 160" className="w-full h-full overflow-visible">
              
              {/* Background Arc Track */}
              <path
                d={describeArc(cx, cy, radius, 180, 0)}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={strokeW}
                strokeLinecap="round"
                className="dark:stroke-slate-800"
              />

              {/* Red Sector: [180 -> critAngle] (Zone Critique < MM3M - 5%) */}
              {critAngle < 180 && (
                <path
                  d={describeArc(cx, cy, radius, 180, critAngle)}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth={strokeW}
                  strokeLinecap="butt"
                />
              )}

              {/* Orange Sector: [critAngle -> warnAngle] (Zone Vigilance [-5% à -2%]) */}
              {warnAngle < critAngle && (
                <path
                  d={describeArc(cx, cy, radius, critAngle, warnAngle)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={strokeW}
                  strokeLinecap="butt"
                />
              )}

              {/* Green Sector: [warnAngle -> 0] (Zone Optimale [≥ MM3M - 2%]) */}
              {0 < warnAngle && (
                <path
                  d={describeArc(cx, cy, radius, warnAngle, 0)}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={strokeW}
                  strokeLinecap="butt"
                />
              )}

              {/* Reference Marker: MM3M Target Tick (Blue pin) */}
              <circle
                cx={mm3mCoord.x}
                cy={mm3mCoord.y}
                r="4.5"
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              
              {/* Needle Line from Center */}
              <line
                x1={cx}
                y1={cy}
                x2={needleCoord.x}
                y2={needleCoord.y}
                stroke="#0f172a"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="dark:stroke-white transition-all duration-700 ease-out"
              />

              {/* Needle Center Hub */}
              <circle cx={cx} cy={cy} r="7" fill="#0f172a" className="dark:fill-white" />
              <circle cx={cx} cy={cy} r="3" fill="#ffffff" className="dark:fill-slate-900" />

              {/* Min & Max Labels */}
              <text x="28" y="152" fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">
                {minGauge}%
              </text>
              <text x="252" y="152" fontSize="10" fontWeight="bold" fill="#94a3b8" textAnchor="middle">
                {maxGauge}%
              </text>

              {/* MM3M Label Pointer */}
              <text 
                x={mm3mCoord.x} 
                y={mm3mCoord.y - 6} 
                fontSize="9" 
                fontWeight="black" 
                fill="#6366f1" 
                textAnchor="middle"
                className="font-mono"
              >
                MM3M {mm3mVal.toFixed(1)}%
              </text>
            </svg>

            {/* Readout Overlay in Bottom Center */}
            <div className="absolute bottom-0 text-center">
              <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {currentVal.toFixed(1)}%
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Marge Brute Actuelle
              </div>
            </div>
          </div>

          {/* Health Badge Below Gauge */}
          <div className="mt-3 w-full text-center">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${healthStatus.badgeBg}`}>
              <healthStatus.icon className="w-3.5 h-3.5" />
              <span>{healthStatus.label}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Health Scale Breakdown & Root-Cause Insights (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Health Scale Legend (3 Bars) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-600" />
                Échelle de Santé des Marges
              </span>
              <span className="font-mono text-slate-500">
                Référence MM3M : <strong>{mm3mVal.toFixed(2)}%</strong>
              </span>
            </div>

            {/* Visual Health Bands */}
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {/* Rouge */}
              <div className={`p-2.5 rounded-xl border transition ${
                healthStatus.level === 'rouge' 
                  ? 'bg-rose-100/90 dark:bg-rose-950/80 border-rose-400 text-rose-900 dark:text-rose-200 font-bold shadow-xs' 
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-1 mb-0.5 text-rose-600 dark:text-rose-400 font-black">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Critique (&lt; -5%)</span>
                </div>
                <div className="font-mono text-[10px]">
                  &lt; {criticalThresh.toFixed(1)}%
                </div>
              </div>

              {/* Orange */}
              <div className={`p-2.5 rounded-xl border transition ${
                healthStatus.level === 'orange' 
                  ? 'bg-amber-100/90 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200 font-bold shadow-xs' 
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-1 mb-0.5 text-amber-600 dark:text-amber-400 font-black">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Vigilance (-2% à -5%)</span>
                </div>
                <div className="font-mono text-[10px]">
                  {criticalThresh.toFixed(1)}% - {warningThresh.toFixed(1)}%
                </div>
              </div>

              {/* Vert */}
              <div className={`p-2.5 rounded-xl border transition ${
                healthStatus.level === 'vert' 
                  ? 'bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs' 
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center gap-1 mb-0.5 text-emerald-600 dark:text-emerald-400 font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Conforme (≥ -2%)</span>
                </div>
                <div className="font-mono text-[10px]">
                  ≥ {warningThresh.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Comparison Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 mb-1">Marge MTD</div>
              <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                {currentData.currentMarginRatePct.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-400">
                {formatCurrency(currentData.margeHtCurrentMonth)} HT
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 mb-1">Moyenne MM3M</div>
              <div className="text-base font-black font-mono text-indigo-600 dark:text-indigo-400">
                {currentData.movingAverage3mPct.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-400">
                Mai • Juin • Juil
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 mb-1">Écart vs MM3M</div>
              <div className={`text-base font-black font-mono ${
                currentData.deltaPoints < 0 
                  ? currentData.deltaPoints <= -5 ? 'text-rose-600' : 'text-amber-600'
                  : 'text-emerald-600'
              }`}>
                {currentData.deltaPoints > 0 ? '+' : ''}{currentData.deltaPoints.toFixed(2)} pts
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentData.deltaRelativePct > 0 ? '+' : ''}{currentData.deltaRelativePct.toFixed(1)}% relatif
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 mb-1">Impact Financier</div>
              <div className={`text-base font-black font-mono ${
                currentData.estimatedLossEur > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {currentData.estimatedLossEur > 0 ? `-${formatCurrency(currentData.estimatedLossEur)}` : 'Conforme'}
              </div>
              <div className="text-[10px] text-slate-400">
                {currentData.estimatedLossEur > 0 ? 'Perte estimée/mois' : 'Objectif atteint'}
              </div>
            </div>
          </div>

          {/* Contextual Recommendation Banner */}
          {healthStatus.level === 'rouge' ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black text-rose-900 dark:text-rose-200">
                    Action Requise : Chute de Marge Supérieure à 5%
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    Sur {currentData.categoryName}, 3 anomalies ont été identifiées (hausse PUMP non répercutée et remises caisse excessives).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onNavigateTab && (
                  <>
                    <button
                      onClick={() => onNavigateTab('surveillance_marges')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Résoudre</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab('remises_commerciales')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Prévision Fin d'Année</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Rentabilité sous contrôle :</strong> La catégorie respecte les objectifs de marge brute et l'alignement sur la moyenne mobile 3 mois.
                </span>
              </div>

              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('remises_commerciales')}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs shrink-0 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Calcul Prédictif Fin d'Année (87% Atteinte)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
