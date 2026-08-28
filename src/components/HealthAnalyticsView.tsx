import React, { useState } from 'react';
import { 
  Activity, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Percent, 
  Sparkles, 
  Target,
  ArrowUpRight,
  Pill,
  Syringe
} from 'lucide-react';
import { RospHealthIndicator } from '../types/pharmacyPilotPrecision';
import { MOCK_ROSP_INDICATORS } from '../data/mockPrecisionModules';
import { formatCurrency, formatPercent } from '../utils/formatters';

export const HealthAnalyticsView: React.FC = () => {
  const [indicators, setIndicators] = useState<RospHealthIndicator[]>(MOCK_ROSP_INDICATORS);

  const totalPotentialEuro = indicators.reduce((acc, curr) => acc + curr.potentialRemunerationEuro, 0);
  const totalSecuredEuro = indicators.reduce((acc, curr) => acc + curr.securedRemunerationEuro, 0);
  const overallCompletionRate = Math.round((totalSecuredEuro / (totalPotentialEuro || 1)) * 100);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Santé Publique & Rémunération sur Objectifs (ROSP 2026)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Indicateurs de Santé & Performance Conventionnelle
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Suivi en temps réel des objectifs ROSP Sécurité Sociale : taux de délivrance des génériques et biosimilaires, e-Prescription, bilans de médication et dépistages TROD.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-right">
            <span className="text-xs text-slate-400 font-medium">Rémunération ROSP Sécurisée</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {formatCurrency(totalSecuredEuro)}
            </div>
            <span className="text-[11px] text-slate-300">sur un potentiel de {formatCurrency(totalPotentialEuro)}</span>
          </div>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Score ROSP Global</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">{overallCompletionRate}%</div>
            <span className="text-[11px] text-slate-400">En avance sur les objectifs</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Taux Génériques Répertoire</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">93.4%</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Cible &gt; 90% Dépassée</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Pénétration Biosimilaires</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono mt-1">74.2%</div>
            <span className="text-[11px] text-slate-400">Énoxaparine & Insulines</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">e-Prescription & Numérique</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">82.5%</div>
            <span className="text-[11px] text-slate-400">DMP alimenté systématiquement</span>
          </div>
        </div>
      </div>

      {/* Indicators List */}
      <div className="space-y-4">
        {indicators.map(ind => (
          <div key={ind.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {ind.code}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{ind.category}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Prime sécurisée :</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(ind.securedRemunerationEuro)} / {formatCurrency(ind.potentialRemunerationEuro)}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{ind.label}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{ind.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Réalisé actuel : <strong className="text-slate-900 dark:text-white">{ind.currentActualPct}%</strong>
                </span>
                <span className="font-semibold text-slate-500">Objectif cible CPAM : {ind.targetObjectivePct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    ind.currentActualPct >= ind.targetObjectivePct 
                      ? 'bg-emerald-500' 
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, (ind.currentActualPct / ind.targetObjectivePct) * 100)}%` }}
                />
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
