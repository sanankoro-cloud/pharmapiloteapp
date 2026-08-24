import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sliders, 
  ChevronRight, 
  ShieldAlert, 
  X, 
  ExternalLink,
  ArrowRight,
  HelpCircle,
  FileWarning,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { LcrMatchAnomaly, LcrAutoMatchRulesConfig } from '../types/lcr';
import { formatCurrency, formatDate } from '../utils/formatters';

interface LcrAnomalyAlertBannerProps {
  anomalies: LcrMatchAnomaly[];
  config: LcrAutoMatchRulesConfig;
  onOpenToleranceConfig: () => void;
  onDeclareDispute?: (statementId: string, invoiceId?: string) => void;
}

export const LcrAnomalyAlertBanner: React.FC<LcrAnomalyAlertBannerProps> = ({
  anomalies,
  config,
  onOpenToleranceConfig,
  onDeclareDispute
}) => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isAlertActive = anomalies.length >= config.anomalyAlertThreshold;

  if (!isAlertActive || dismissed) return null;

  return (
    <>
      {/* Visual Alert Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-400 dark:border-amber-600/80 p-4 sm:p-5 shadow-md">
        
        {/* Decorative corner glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          
          {/* Icon & Message */}
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                  Alerte Contrôle Interne
                </span>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Seuil d'erreurs de lettrage dépassé ({anomalies.length} anomalies / seuil: {config.anomalyAlertThreshold})
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {anomalies.length} factures / traites présentent un montant ou une date hors tolérance
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
                Les écarts constatés excèdent votre règle de tolérance actuelle (± {config.amountToleranceEuros.toFixed(2)} € / ± {config.dueDateToleranceDays} j). Nous vous suggérons de <strong className="text-amber-950 dark:text-amber-200 underline cursor-pointer" onClick={onOpenToleranceConfig}>réviser vos règles de tolérance</strong> ou d'enquêter sur d'éventuels litiges de facturation fournisseurs.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsDetailsModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-black border border-amber-300 dark:border-amber-700 shadow-2xs transition"
            >
              <FileWarning className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Voir les {anomalies.length} écarts</span>
            </button>

            <button
              onClick={onOpenToleranceConfig}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm transition"
            >
              <Sliders className="w-4 h-4" />
              <span>Réviser les règles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Anomalies Inspection Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Journal des Anomalies de Lettrage LCR</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      {anomalies.length} écarts hors tolérance
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rapprochements en échec par rapport aux seuils officine (± {config.amountToleranceEuros.toFixed(2)} € / ± {config.dueDateToleranceDays} jours)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Anomalies */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {anomalies.map((anom, idx) => (
                <div
                  key={anom.id || idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        {anom.invoiceNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {anom.statementSupplierName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({anom.statementLcrNumber})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-500">Montant Relevé :</span>
                      <strong className="text-slate-900 dark:text-slate-100">
                        {formatCurrency(anom.expectedAmountTtc)}
                      </strong>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Source correspondante :</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {anom.candidateSource} {anom.candidateReference ? `(#${anom.candidateReference})` : ''}
                      </div>
                      {anom.candidateAmountTtc !== undefined && (
                        <div className="text-slate-500 mt-0.5">
                          Montant constaté : <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(anom.candidateAmountTtc)}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Écart Détecté :</div>
                      <div className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                        {anom.amountDifference !== undefined ? `${anom.amountDifference > 0 ? '+' : ''}${anom.amountDifference.toFixed(2)} €` : 'N/A'}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          (Tolérance max : ± {config.amountToleranceEuros.toFixed(2)} €)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation / Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      💡 <strong>Recommandation :</strong> {anom.suggestedAction}
                    </p>

                    <div className="flex items-center gap-2 shrink-0">
                      {onDeclareDispute && (
                        <button
                          onClick={() => {
                            setIsDetailsModalOpen(false);
                            onDeclareDispute(anom.statementId, anom.invoiceId);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition"
                        >
                          Déclarer Litige
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  onOpenToleranceConfig();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
              >
                <Sliders className="w-4 h-4" />
                <span>Ajuster les règles de tolérance</span>
              </button>

              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
