import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  Zap, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Filter,
  Check,
  Sparkles,
  ExternalLink,
  Users
} from 'lucide-react';
import { ComplianceAlert, ComplianceSeverity } from '../utils/legalComplianceAudit';
import { formatDate } from '../utils/formatters';

interface PlanningComplianceBannerProps {
  alerts: ComplianceAlert[];
  complianceScore: number;
  criticalCount: number;
  warningCount: number;
  onSelectAlert?: (alert: ComplianceAlert) => void;
  onFilterAnomaliesOnly?: (enabled: boolean) => void;
  isFilteringAnomaliesOnly?: boolean;
}

export const PlanningComplianceBanner: React.FC<PlanningComplianceBannerProps> = ({
  alerts,
  complianceScore,
  criticalCount,
  warningCount,
  onSelectAlert,
  onFilterAnomaliesOnly,
  isFilteringAnomaliesOnly = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(criticalCount > 0);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'danger' | 'warning'>('all');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'danger') return a.severity === 'danger';
    if (severityFilter === 'warning') return a.severity === 'warning';
    return true;
  });

  const getSeverityBadge = (severity: ComplianceSeverity) => {
    switch (severity) {
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <ShieldAlert className="w-3 h-3" /> Bloquant / Infraction Légale
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" /> Vigilance Conventionnelle
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            <Info className="w-3 h-3" /> Information
          </span>
        );
    }
  };

  return (
    <div className={`rounded-2xl border transition-all shadow-sm overflow-hidden ${
      criticalCount > 0 
        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80' 
        : warningCount > 0
          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80'
          : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80'
    }`}>
      
      {/* Barre principale de synthèse */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Statut & Score */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${
            criticalCount > 0 
              ? 'bg-rose-600 ring-4 ring-rose-500/20' 
              : warningCount > 0 
                ? 'bg-amber-500 ring-4 ring-amber-500/20' 
                : 'bg-emerald-600 ring-4 ring-emerald-500/20'
          }`}>
            {criticalCount > 0 ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : warningCount > 0 ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                Audit Réglementaire • Code du Travail & Convention Pharmacie (IDCC 1996)
              </span>

              {criticalCount > 0 ? (
                <span className="px-2 py-0.2 rounded-md text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  {criticalCount} Conflit{criticalCount > 1 ? 's' : ''} Critique{criticalCount > 1 ? 's' : ''}
                </span>
              ) : warningCount > 0 ? (
                <span className="px-2 py-0.2 rounded-md text-[10px] font-black bg-amber-500 text-white">
                  {warningCount} Avertissement{warningCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="px-2 py-0.2 rounded-md text-[10px] font-black bg-emerald-600 text-white">
                  100% Conforme
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {criticalCount > 0 
                ? 'Conflits d\'horaires ou dépassements légaux détectés dans le planning' 
                : warningCount > 0 
                  ? 'Planning opérationnel avec points de vigilance conventionnels' 
                  : 'Planning conforme à toutes les règles légales et conventionnelles'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
              {criticalCount > 0 
                ? 'Attention : Des chevauchements d\'horaires, dépassements du plafond hebdomadaire (48h), de la journée max (10h) ou du repos quotidien (11h) nécessitent un ajustement immédiat.'
                : warningCount > 0
                  ? 'Contrôlez les amplitudes journalières, pauses obligatoires de 20 min et seuils moyens de 44h pour préserver la santé de l\'équipe.'
                  : 'Toutes les amplitudes, temps de repos 11h, plafonds d\'heures et continuités de présence des pharmaciens thésés (CSP) sont respectés.'}
            </p>
          </div>
        </div>

        {/* Jauge Score + Boutons d'action */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
          
          {/* Jauge Score de conformité */}
          <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Indice Légal</span>
              <span className={`text-base font-black font-mono ${
                complianceScore >= 90 ? 'text-emerald-600' : complianceScore >= 70 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {complianceScore}%
              </span>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-current font-black text-xs">
              <Scale className="w-4 h-4" />
            </div>
          </div>

          {/* Bouton Filtre Anomalies Seules */}
          {onFilterAnomaliesOnly && (
            <button
              onClick={() => onFilterAnomaliesOnly(!isFilteringAnomaliesOnly)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isFilteringAnomaliesOnly 
                  ? 'bg-rose-600 text-white ring-2 ring-rose-500/30' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title="Filtrer la grille pour afficher uniquement les salariés ou jours ayant une anomalie"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isFilteringAnomaliesOnly ? 'Toutes les lignes' : 'Isoler les anomalies'}</span>
            </button>
          )}

          {/* Bouton Déplier/Replier le panneau d'audit */}
          {alerts.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>{isExpanded ? 'Masquer le détail' : `Voir les ${alerts.length} alertes`}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

        </div>

      </div>

      {/* Panneau dépliable avec la liste détaillée des infractions / alertes */}
      {isExpanded && alerts.length > 0 && (
        <div className="border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 space-y-4 animate-fadeIn">
          
          {/* Filtres par sévérité */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 mr-1">Filtrer par gravité :</span>
              <button
                onClick={() => setSeverityFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  severityFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Toutes ({alerts.length})
              </button>
              <button
                onClick={() => setSeverityFilter('danger')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  severityFilter === 'danger'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <span>Critiques ({criticalCount})</span>
              </button>
              <button
                onClick={() => setSeverityFilter('warning')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  severityFilter === 'warning'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <span>Vigilance ({warningCount})</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              Cliquez sur une alerte pour cibler le créneau dans la grille
            </div>
          </div>

          {/* Liste des cartes d'alertes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => onSelectAlert?.(alert)}
                className={`p-3.5 rounded-xl border transition cursor-pointer group flex flex-col justify-between ${
                  alert.severity === 'danger'
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 hover:border-rose-500'
                    : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 hover:border-amber-500'
                }`}
              >
                <div>
                  
                  {/* Entête alerte */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getSeverityBadge(alert.severity)}
                      {alert.employeeName && (
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {alert.employeeName}
                        </span>
                      )}
                    </div>

                    {alert.date && (
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {formatDate(alert.date)}
                      </span>
                    )}
                  </div>

                  {/* Titre & Description */}
                  <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1.5 group-hover:text-indigo-600 transition flex items-center gap-1">
                    <span>{alert.title}</span>
                  </h4>
                  
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {alert.description}
                  </p>

                </div>

                {/* Pied de carte : Réf légale & Action recommandée */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1 text-[10px]">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold">Règle : {alert.legalReference}</span>
                    {alert.metricValue !== undefined && alert.metricLimit !== undefined && (
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        {alert.metricValue} / {alert.metricLimit} {alert.metricUnit || ''}
                      </span>
                    )}
                  </div>

                  <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span className="truncate">Action : {alert.actionRecommendation}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
