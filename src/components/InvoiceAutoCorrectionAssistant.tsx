import React, { useState, useEffect } from 'react';
import {
  Wand2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
  FileSpreadsheet,
  Building2,
  Calendar,
  DollarSign,
  Info,
  Layers,
  HelpCircle,
  Zap,
  Download
} from 'lucide-react';
import {
  InvoiceCorrectionSuggestion,
  InvoiceValidationReport,
  InvoiceImportRawSample
} from '../types/invoiceCorrection';
import {
  analyzeAndSuggestInvoiceCorrections,
  MOCK_INVOICE_ERROR_SAMPLES,
  KNOWN_PHARMACY_SUPPLIERS
} from '../utils/invoiceSmartCorrection';
import { formatCurrency, formatDate } from '../utils/formatters';

interface InvoiceAutoCorrectionAssistantProps {
  initialInvoiceData?: Record<string, any>;
  onApplyAndImport?: (correctedInvoice: any) => void;
  onClose?: () => void;
  compactMode?: boolean;
}

export const InvoiceAutoCorrectionAssistant: React.FC<InvoiceAutoCorrectionAssistantProps> = ({
  initialInvoiceData,
  onApplyAndImport,
  onClose,
  compactMode = false
}) => {
  // Form input state
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (initialInvoiceData) {
      return { ...initialInvoiceData };
    }
    return { ...MOCK_INVOICE_ERROR_SAMPLES[0].rawInvoice };
  });

  const [selectedSampleId, setSelectedSampleId] = useState<string>(
    initialInvoiceData ? 'custom' : MOCK_INVOICE_ERROR_SAMPLES[0].id
  );
  const [report, setReport] = useState<InvoiceValidationReport>(() =>
    analyzeAndSuggestInvoiceCorrections(formData)
  );
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [appliedSuggestionIds, setAppliedSuggestionIds] = useState<string[]>([]);
  const [showDiffView, setShowDiffView] = useState(false);

  // Recalculate analysis when formData changes
  useEffect(() => {
    const analysis = analyzeAndSuggestInvoiceCorrections(formData);
    setReport(analysis);
  }, [formData]);

  // Load sample invoice
  const handleLoadSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setAppliedSuggestionIds([]);
    const sample = MOCK_INVOICE_ERROR_SAMPLES.find((s) => s.id === sampleId);
    if (sample) {
      setFormData({ ...sample.rawInvoice });
      setSuccessToast(`Scénario chargé : "${sample.title}"`);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  // Apply single suggestion
  const handleApplySuggestion = (suggestion: InvoiceCorrectionSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      [suggestion.field]: suggestion.suggestedValue
    }));
    setAppliedSuggestionIds((prev) => [...prev, suggestion.id]);
    setSuccessToast(`Correction appliquée pour "${suggestion.fieldLabel}" : ${suggestion.suggestedValue}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Apply all auto-fixable suggestions in 1 click
  const handleApplyAllSuggestions = () => {
    const newFormData = { ...formData, ...report.correctedData };
    setFormData(newFormData);
    setAppliedSuggestionIds(report.suggestions.map((s) => s.id));
    setSuccessToast(`✨ ${report.suggestions.filter((s) => s.autoFixable).length} corrections appliquées automatiquement !`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Reset to raw initial state
  const handleReset = () => {
    const sample = MOCK_INVOICE_ERROR_SAMPLES.find((s) => s.id === selectedSampleId);
    if (sample) {
      setFormData({ ...sample.rawInvoice });
    } else if (initialInvoiceData) {
      setFormData({ ...initialInvoiceData });
    }
    setAppliedSuggestionIds([]);
    setSuccessToast('Données réinitialisées à leur état brut.');
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Get field specific suggestions
  const getFieldSuggestions = (fieldName: string) => {
    return report.suggestions.filter((s) => s.field === fieldName);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Scenario Selector */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-md mt-0.5">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Assistant IA de Correction Automatique des Factures
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Conforme Factur-X & Code de Commerce
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Détection prédictive des anomalies courantes de saisie ou d'import OCR : format SIREN (espaces, SIRET, clé de Luhn), inversion de date d'échéance (MM/DD), calculs de TVA et délais LME.
              </p>
            </div>
          </div>

          {/* Quick Scenario Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="bg-slate-800/90 border border-slate-700 p-1.5 rounded-2xl flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 pl-2 whitespace-nowrap hidden lg:inline">
                Tester un cas d'erreur :
              </span>
              <select
                aria-label="Sélectionner un scénario d'erreur de facture"
                value={selectedSampleId}
                onChange={(e) => handleLoadSample(e.target.value)}
                className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[260px] truncate"
              >
                {MOCK_INVOICE_ERROR_SAMPLES.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    {sample.title}
                  </option>
                ))}
                {initialInvoiceData && <option value="custom">Données courantes d'import</option>}
              </select>
            </div>

            <button
              onClick={handleApplyAllSuggestions}
              disabled={report.suggestions.length === 0}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Corriger tout (1-Clic)</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Diagnostic Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-700/60">
          <div className="bg-slate-800/70 p-2.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium">Score de Conformité</div>
            <div className="flex items-center gap-2 mt-0.5">
              <div
                className={`text-lg font-black font-mono ${
                  report.scoreConformite >= 90
                    ? 'text-emerald-400'
                    : report.scoreConformite >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {report.scoreConformite} / 100
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  report.scoreConformite >= 90
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : report.scoreConformite >= 60
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {report.scoreConformite >= 90 ? 'Conforme' : report.scoreConformite >= 60 ? 'À réviser' : 'Bloquant'}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/70 p-2.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Erreurs Bloquantes</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-lg font-black text-rose-400 mt-0.5 font-mono">
              {report.errorsCount}
            </div>
          </div>

          <div className="bg-slate-800/70 p-2.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Alertes & Délais</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black text-amber-400 mt-0.5 font-mono">
              {report.warningsCount}
            </div>
          </div>

          <div className="bg-slate-800/70 p-2.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Suggestions IA</span>
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-black text-indigo-300 mt-0.5 font-mono">
              {report.suggestionsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {successToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Dual-Column Section: Interactive Form + Live Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Form: Real-Time Saisie / Formulaire avec badges de détection */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Données de la Facture en Cours de Saisie
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDiffView(!showDiffView)}
                className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
              >
                {showDiffView ? 'Masquer le comparatif Diff' : 'Voir le comparatif Avant/Après'}
              </button>
              <button
                onClick={handleReset}
                title="Réinitialiser"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Form Fields with In-Line Smart Suggestion Injectors */}
          <div className="space-y-4 text-xs">
            
            {/* Fournisseur */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nom du Fournisseur / Laboratoire
              </label>
              <input
                type="text"
                value={formData.supplierName || ''}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Ex: OCP Répartition, Biogaran, Sanofi..."
              />
              {/* Field suggestions */}
              {getFieldSuggestions('supplierName').map((sug) => (
                <div
                  key={sug.id}
                  className="mt-1.5 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{sug.explanation}</span>
                  </div>
                  <button
                    onClick={() => handleApplySuggestion(sug)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black shrink-0 transition"
                  >
                    Remplacer par "{sug.suggestedValue}"
                  </button>
                </div>
              ))}
            </div>

            {/* SIREN & TVA Intracommunautaire Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Numéro SIREN (9 chiffres)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Format INSEE</span>
                </label>
                <input
                  type="text"
                  value={formData.supplierSiren || ''}
                  onChange={(e) => setFormData({ ...formData, supplierSiren: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-mono text-xs focus:ring-2 focus:outline-none ${
                    getFieldSuggestions('supplierSiren').some((s) => s.severity === 'error')
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:ring-rose-500'
                      : getFieldSuggestions('supplierSiren').some((s) => s.severity === 'warning')
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 focus:ring-amber-500'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500'
                  }`}
                  placeholder="Ex: 552084795"
                />
                {/* SIREN Suggestions */}
                {getFieldSuggestions('supplierSiren').map((sug) => (
                  <div
                    key={sug.id}
                    className={`mt-1.5 p-2 rounded-xl border flex items-center justify-between gap-2 text-[11px] ${
                      sug.severity === 'error'
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {sug.severity === 'error' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                      <span>{sug.explanation}</span>
                    </div>
                    {sug.autoFixable && (
                      <button
                        onClick={() => handleApplySuggestion(sug)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black shrink-0 transition"
                      >
                        Corriger "{sug.suggestedValue}"
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>N° TVA Intracommunautaire</span>
                  <span className="text-[10px] text-slate-400 font-mono">FR + Clé</span>
                </label>
                <input
                  type="text"
                  value={formData.supplierTvaIntra || ''}
                  onChange={(e) => setFormData({ ...formData, supplierTvaIntra: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Ex: FR05552084795"
                />
                {/* TVA suggestions */}
                {getFieldSuggestions('supplierTvaIntra').map((sug) => (
                  <div
                    key={sug.id}
                    className="mt-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2 text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{sug.explanation}</span>
                    </div>
                    <button
                      onClick={() => handleApplySuggestion(sug)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black shrink-0 transition"
                    >
                      Insérer "{sug.suggestedValue}"
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates Grid: Émission & Échéance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date d'Émission de la Facture
                </label>
                <input
                  type="text"
                  value={formData.issueDate || ''}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="YYYY-MM-DD ou DD/MM/YYYY"
                />
                {getFieldSuggestions('issueDate').map((sug) => (
                  <div
                    key={sug.id}
                    className="mt-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span>{sug.explanation}</span>
                    <button
                      onClick={() => handleApplySuggestion(sug)}
                      className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold"
                    >
                      Formater ISO
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Date d'Échéance (Paiement)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Loi LME max 60j</span>
                </label>
                <input
                  type="text"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-mono text-xs focus:ring-2 focus:outline-none ${
                    getFieldSuggestions('dueDate').some((s) => s.severity === 'error')
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:ring-rose-500'
                      : getFieldSuggestions('dueDate').some((s) => s.severity === 'warning')
                      ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 focus:ring-amber-500'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500'
                  }`}
                  placeholder="YYYY-MM-DD ou DD/MM/YYYY"
                />
                {/* Due Date Suggestions */}
                {getFieldSuggestions('dueDate').map((sug) => (
                  <div
                    key={sug.id}
                    className={`mt-1.5 p-2 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] ${
                      sug.severity === 'error'
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : sug.severity === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {sug.severity === 'error' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : sug.severity === 'warning' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                      <span>{sug.explanation}</span>
                    </div>
                    {sug.autoFixable && (
                      <button
                        onClick={() => handleApplySuggestion(sug)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black shrink-0 transition"
                      >
                        Appliquer "{sug.suggestedValue}"
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Amounts: HT, TVA, TTC */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total HT (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalHt ?? ''}
                  onChange={(e) => setFormData({ ...formData, totalHt: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total TVA (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalTva ?? ''}
                  onChange={(e) => setFormData({ ...formData, totalTva: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total TTC (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalTtc ?? ''}
                  onChange={(e) => setFormData({ ...formData, totalTtc: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 rounded-xl font-mono text-xs focus:ring-2 focus:outline-none ${
                    getFieldSuggestions('totalTtc').length > 0
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 focus:ring-rose-500'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500'
                  }`}
                />
              </div>
            </div>

            {/* Financial coherence suggestions */}
            {getFieldSuggestions('totalTtc').map((sug) => (
              <div
                key={sug.id}
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-center justify-between gap-2 text-[11px]"
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{sug.explanation}</span>
                </div>
                <button
                  onClick={() => handleApplySuggestion(sug)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black shrink-0 transition"
                >
                  Rectifier TTC à {sug.suggestedValue} €
                </button>
              </div>
            ))}

            {/* Numéro de Facture */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Numéro de Pièce / Facture
              </label>
              <input
                type="text"
                value={formData.invoiceNumber || ''}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Ex: FAC-2026-0041"
              />
              {getFieldSuggestions('invoiceNumber').map((sug) => (
                <div
                  key={sug.id}
                  className="mt-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 text-[11px]"
                >
                  <span>{sug.explanation}</span>
                  <button
                    onClick={() => handleApplySuggestion(sug)}
                    className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold"
                  >
                    Corriger
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* Action to Save / Import */}
          {onApplyAndImport && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => onApplyAndImport(formData)}
                className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Valider et Enregistrer la Facture Corrigée</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Inspector & Regulatory Rules */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Summary of Detected Anomalies */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Rapport de Contrôle Qualité ({report.suggestions.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                {report.isValid ? 'Prêt pour l\'import' : 'Modifications requises'}
              </span>
            </div>

            {report.suggestions.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white">
                  Aucune anomalie détectée
                </div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  La facture est 100% conforme aux normes DGFiP, au format SIREN officiel et au calendrier légal des échéances.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {report.suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className={`p-3 rounded-2xl border transition ${
                      sug.severity === 'error'
                        ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80'
                        : sug.severity === 'warning'
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/80'
                        : 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {sug.severity === 'error' ? (
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        ) : sug.severity === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {sug.title}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            {sug.explanation}
                          </div>
                          {sug.regulationRef && (
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                              Réf : {sug.regulationRef} • Indice de confiance : {Math.round(sug.confidenceScore * 100)}%
                            </div>
                          )}
                        </div>
                      </div>

                      {sug.autoFixable && (
                        <button
                          onClick={() => handleApplySuggestion(sug)}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-[10px] font-black shrink-0 shadow-xs"
                        >
                          Corriger
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Regulatory Knowledge Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Règles de Contrôle Intégrées</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>SIREN (INSEE)</strong> : Clé de Luhn ISO 7064 & extraction 9 chiffres du SIRET.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Délais LME</strong> : Plafond 60 jours net ou 45 jours fin de mois (Art. L441-10 C. com).</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>Calendrier Bancaire</strong> : Décalage automatique au lundi des échéances le week-end.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>TVA Officine</strong> : Taux 2.1% (médicaments remboursables), 5.5%, 10%, 20%.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Side-by-Side Diff Modal / Section */}
      {showDiffView && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Comparatif des Modifications Avant / Après Correction
              </h3>
            </div>
            <button
              onClick={() => setShowDiffView(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fermer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2">Champ</th>
                  <th className="pb-2">Valeur Brute (Avant)</th>
                  <th className="pb-2">Valeur Corrigée (Après)</th>
                  <th className="pb-2">Règle de Correction Appliquée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {report.diffs.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-sans font-bold text-slate-300">{d.fieldLabel}</td>
                    <td className="py-2.5 text-rose-300 line-through">{String(d.before || '(vide)')}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">{String(d.after)}</td>
                    <td className="py-2.5 text-slate-400 font-sans text-[11px]">{d.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
