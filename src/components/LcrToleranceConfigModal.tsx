import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  HelpCircle, 
  RotateCcw, 
  Check, 
  X, 
  AlertTriangle, 
  Info,
  Calendar,
  DollarSign,
  Building2,
  FileCheck,
  BellRing
} from 'lucide-react';
import { LcrAutoMatchRulesConfig, DEFAULT_LCR_RULES_CONFIG } from '../types/lcr';
import { formatCurrency } from '../utils/formatters';

interface LcrToleranceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LcrAutoMatchRulesConfig;
  onSaveConfig: (newConfig: LcrAutoMatchRulesConfig) => void;
  currentAnomaliesCount?: number;
}

export const LcrToleranceConfigModal: React.FC<LcrToleranceConfigModalProps> = ({
  isOpen,
  onClose,
  config: initialConfig,
  onSaveConfig,
  currentAnomaliesCount = 0
}) => {
  const [config, setConfig] = useState<LcrAutoMatchRulesConfig>({ ...initialConfig });
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleResetToDefaults = () => {
    setConfig({ ...DEFAULT_LCR_RULES_CONFIG });
  };

  const handleSave = () => {
    onSaveConfig(config);
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Règles de Tolérance & Paramètres d'Auto-Lettrage LCR</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configuration des seuils d'écart acceptés et des alertes d'anomalies de pointage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Info Box */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="font-bold text-indigo-950 dark:text-indigo-200">
              Principe comptable et juridique en officine :
            </p>
            <p className="mt-0.5 text-slate-600 dark:text-slate-400">
              L'auto-lettrage croise automatiquement les traites LCR avec les factures Factur-X PDP certifiées et commandes LGO. Les règles ci-dessous déterminent quand une facture est validée sans intervention humaine ou quand elle génère une alerte d'écart.
            </p>
          </div>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-5">
          
          {/* 1. Tolérance de Montant */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <label className="text-xs font-black text-slate-900 dark:text-slate-100">
                  Tolérance sur Écart de Montant TTC
                </label>
              </div>
              <div className="font-mono text-sm font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-700">
                ± {config.amountToleranceEuros.toFixed(2)} €
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Autorise un écart minime entre la traite LCR et la commande LGO pour absorber les arrondis de centimes de TVA ou d'escompte fournisseur.
            </p>

            {/* Slider & Presets */}
            <div className="space-y-2 pt-1">
              <input
                type="range"
                min="0"
                max="1.00"
                step="0.01"
                value={config.amountToleranceEuros}
                onChange={e => setConfig(prev => ({ ...prev, amountToleranceEuros: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>0.00 € (Strict)</span>
                <span>0.05 € (Recommandé)</span>
                <span>0.50 €</span>
                <span>1.00 € (Max)</span>
              </div>

              {/* Quick Presets Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: '0.00 € (Strict)', val: 0.00 },
                  { label: '0.02 € (Arrondi 2c)', val: 0.02 },
                  { label: '0.05 € (Standard TVA)', val: 0.05 },
                  { label: '0.10 €', val: 0.10 },
                  { label: '0.50 €', val: 0.50 }
                ].map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, amountToleranceEuros: preset.val }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                      config.amountToleranceEuros === preset.val
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Tolérance sur la Date d'Échéance / Émission */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <label className="text-xs font-black text-slate-900 dark:text-slate-100">
                  Tolérance sur les Dates (Émission & Réception)
                </label>
              </div>
              <div className="font-mono text-sm font-black text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-700">
                ± {config.dueDateToleranceDays} jours
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Décalage admissible entre la date de livraison effective, la date de facture et l'émission du relevé LCR grossiste.
            </p>

            <div className="space-y-2 pt-1">
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={config.dueDateToleranceDays}
                onChange={e => setConfig(prev => ({ ...prev, dueDateToleranceDays: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>0 j (Même jour)</span>
                <span>3 jours</span>
                <span>5 jours (Conseillé)</span>
                <span>10 jours</span>
                <span>15 jours</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: '0 jour (Exact)', val: 0 },
                  { label: '± 3 jours', val: 3 },
                  { label: '± 5 jours (Conseillé)', val: 5 },
                  { label: '± 7 jours (1 semaine)', val: 7 },
                  { label: '± 10 jours', val: 10 }
                ].map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, dueDateToleranceDays: preset.val }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                      config.dueDateToleranceDays === preset.val
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Seuil d'Alerte Visuelle d'Erreurs / Anomalies */}
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <label className="text-xs font-black text-slate-900 dark:text-slate-100">
                  Seuil de Déclenchement de l'Alerte Visuelle d'Erreurs
                </label>
              </div>
              <div className="font-mono text-sm font-black text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-700">
                {config.anomalyAlertThreshold} anomalies
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Affiche un bandeau d'alerte prioritaire dès que le nombre de factures hors tolérance dépasse ce seuil sur la période d'évaluation ({config.evaluationPeriodDays} jours).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seuil d'anomalies max toléré :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.anomalyAlertThreshold}
                    onChange={e => setConfig(prev => ({ ...prev, anomalyAlertThreshold: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-24 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                  />
                  <span className="text-xs text-slate-500">écarts non résolus</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Période d'évaluation :
                </label>
                <select
                  value={config.evaluationPeriodDays}
                  onChange={e => setConfig(prev => ({ ...prev, evaluationPeriodDays: parseInt(e.target.value) }))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value="15">15 derniers jours (Quinzaine)</option>
                  <option value="30">30 derniers jours (Mois)</option>
                  <option value="60">60 derniers jours (Bimestre)</option>
                </select>
              </div>
            </div>

            {currentAnomaliesCount >= config.anomalyAlertThreshold && (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 pt-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Actuellement {currentAnomaliesCount} écart(s) détecté(s) : l'alerte visuelle est active.</span>
              </div>
            )}
          </div>

          {/* 4. Options Complémentaires de Correspondance */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
              Options d'Appariement Avancé
            </span>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Correspondance souple sur les noms fournisseurs
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Ignore les mentions légales ("SAS", "Laboratoire", accents, tirets)
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.supplierNameFuzzyMatch}
                  onChange={e => setConfig(prev => ({ ...prev, supplierNameFuzzyMatch: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Rapprochement par N° de Bon de Livraison (BL)
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Autorise le lettrage via le BL scanné si le N° de facture est absent du relevé
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.allowDeliverySlipMatch}
                  onChange={e => setConfig(prev => ({ ...prev, allowDeliverySlipMatch: e.target.checked }))}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Pré-sélectionner automatiquement les correspondances 100% exactes
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Coche par défaut les rapprochements parfaits sans écart
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoSelectExactMatches}
                  onChange={e => setConfig(prev => ({ ...prev, autoSelectExactMatches: e.target.checked }))}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rétablir valeurs par défaut</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer & Appliquer les Règles</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
