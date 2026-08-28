import React, { useState } from 'react';
import { 
  Bot, 
  Cpu, 
  Layers, 
  ThermometerSnowflake, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Activity, 
  Clock, 
  Gauge,
  PackageCheck
} from 'lucide-react';
import { RoboticUnitStatus } from '../types/pharmacyPilotPrecision';
import { MOCK_ROBOTIC_UNITS } from '../data/mockPrecisionModules';
import { formatNumber } from '../utils/formatters';

export const RoboticInventoryView: React.FC = () => {
  const [robots, setRobots] = useState<RoboticUnitStatus[]>(MOCK_ROBOTIC_UNITS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const primaryBot = robots[0] || MOCK_ROBOTIC_UNITS[0];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Robotique & Automates d'Officine • BD Rowa & Consis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Supervision de l'Inventaire Robotisé
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Télémétrie en temps réel des étagères robotisées, cadencement des entrées automatiques de boîtes, temps de sortie moyen au comptoir et maintenance prédictive.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser Télémétrie</span>
          </button>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Boîtes en Stock Robot</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              {formatNumber(primaryBot.currentBoxesStored)} btes
            </div>
            <span className="text-[11px] text-slate-400">Capacité max : {formatNumber(primaryBot.storageCapacityBoxes)}</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Taux de Remplissage</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {primaryBot.fillRatePct}%
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">Rangement optimisé IA</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Temps de Délivrance Comptoir</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono mt-1">
              {primaryBot.averageRetrievalTimeSec} s
            </div>
            <span className="text-[11px] text-slate-400">Sortie vers goulotte comptoir</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Température Interne</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              {primaryBot.temperatureCelsius}°C
            </div>
            <span className="text-[11px] text-slate-400">Ventilation nominale (&lt; 25°C)</span>
          </div>
        </div>
      </div>

      {/* Robots details cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {robots.map(bot => (
          <div key={bot.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{bot.robotModel}</h3>
                  <span className="text-xs text-slate-400 font-mono">N° Série : {bot.serialNumber}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Opérationnel
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Niveau de remplissage</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{bot.fillRatePct}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${bot.fillRatePct}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Dernière Maintenance</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{bot.lastMaintenanceDate}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Prochaine Révision</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{bot.nextMaintenanceDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Autotest des bras de préhension : Conforme
              </span>
              <span>Délivrances du jour : <strong className="text-slate-900 dark:text-white">{bot.dailyDeliveriesCount}</strong></span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
