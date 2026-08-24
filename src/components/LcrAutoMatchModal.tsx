import React, { useState, useMemo } from 'react';
import { 
  Wand2, 
  CheckCheck, 
  Sliders, 
  ShieldCheck, 
  X, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Filter, 
  FileText, 
  Building2, 
  Sparkles, 
  Layers,
  Search,
  CheckSquare,
  Square,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  LcrAutoMatchProposal, 
  LcrAutoMatchResult, 
  LcrAutoMatchRulesConfig 
} from '../types/lcr';
import { formatCurrency, formatDate } from '../utils/formatters';

interface LcrAutoMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResult: LcrAutoMatchResult;
  config: LcrAutoMatchRulesConfig;
  onApplyMatches: (selectedProposalIds: string[]) => void;
  onOpenToleranceConfig: () => void;
}

export const LcrAutoMatchModal: React.FC<LcrAutoMatchModalProps> = ({
  isOpen,
  onClose,
  matchResult,
  config,
  onApplyMatches,
  onOpenToleranceConfig
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    // Initialise avec les propositions non encore vérifiées et cochées par défaut
    const initialSelected = new Set<string>();
    matchResult.proposals.forEach(p => {
      if (!p.alreadyVerified && p.selectedForApplication) {
        initialSelected.add(p.id);
      }
    });
    return initialSelected;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'exact' | 'tolerance' | 'already_verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredProposals = matchResult.proposals.filter(p => {
    // Filtre par catégorie
    if (activeFilter === 'exact' && (p.matchScore < 100 || p.alreadyVerified)) return false;
    if (activeFilter === 'tolerance' && (p.matchScore === 100 || p.alreadyVerified)) return false;
    if (activeFilter === 'already_verified' && !p.alreadyVerified) return false;
    
    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${p.statementSupplierName} ${p.invoiceNumber} ${p.matchedReference} ${p.statementLcrNumber} ${p.matchedSourceName}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    return true;
  });

  const handleToggleProposal = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const next = new Set<string>();
    matchResult.proposals.forEach(p => {
      if (!p.alreadyVerified) next.add(p.id);
    });
    setSelectedIds(next);
  };

  const handleSelectExactOnly = () => {
    const next = new Set<string>();
    matchResult.proposals.forEach(p => {
      if (!p.alreadyVerified && p.matchScore === 100) next.add(p.id);
    });
    setSelectedIds(next);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  // Calcul du montant sélectionné
  const totalSelectedAmount = matchResult.proposals
    .filter(p => selectedIds.has(p.id))
    .reduce((sum, p) => sum + p.invoiceAmountTtc, 0);

  const selectedCount = selectedIds.size;

  const handleConfirmApplication = () => {
    onApplyMatches(Array.from(selectedIds));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 my-8">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-linear-to-br from-indigo-500 to-teal-500 text-white shadow-md shadow-indigo-500/20">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Auto-Lettrage Intelligent des Traites LCR
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {matchResult.unverifiedProposalsCount} propositions prêtes
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rapprochement automatique basé sur les factures Factur-X PDP, commandes LGO et BL réceptions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenToleranceConfig}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
              title="Configurer les règles de tolérance"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Règles de tolérance (± {config.amountToleranceEuros.toFixed(2)} €)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
            <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 block">
              100% Correspondance Parfaite
            </span>
            <div className="text-xl font-black text-indigo-950 dark:text-indigo-100 mt-0.5">
              {matchResult.exactMatchesCount} factures
            </div>
            <span className="text-[10px] text-slate-500">Montant et N° réf identiques</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60">
            <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400 block">
              Sous Tolérance (Centimes/Date)
            </span>
            <div className="text-xl font-black text-teal-950 dark:text-teal-100 mt-0.5">
              {matchResult.toleranceMatchesCount} factures
            </div>
            <span className="text-[10px] text-slate-500">Écart ≤ {config.amountToleranceEuros.toFixed(2)} €</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">
              Montant Total Rapproché
            </span>
            <div className="text-xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
              {formatCurrency(matchResult.totalAmountMatchedTtc)}
            </div>
            <span className="text-[10px] text-slate-500">Sécurisé & certifié</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              Relevés LCR Concernés
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {matchResult.statementsImpactedCount} bordereaux
            </div>
            <span className="text-[10px] text-slate-500">Prêts pour validation BAP</span>
          </div>
        </div>

        {/* Filters & Selection Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          
          {/* Quick Selection Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition"
            >
              Tout sélectionner ({matchResult.unverifiedProposalsCount})
            </button>
            <button
              onClick={handleSelectExactOnly}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition"
            >
              100% Exacts ({matchResult.exactMatchesCount})
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
            >
              Désélectionner
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrer par fournisseur ou facture..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Proposals List / Table */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {filteredProposals.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold">Aucune proposition ne correspond au filtre actif.</p>
              <p className="text-xs text-slate-400 mt-1">Toutes les factures ont été lettrées ou aucun écart détecté.</p>
            </div>
          ) : (
            filteredProposals.map(proposal => {
              const isSelected = selectedIds.has(proposal.id);
              const isExact = proposal.matchScore === 100;

              return (
                <div
                  key={proposal.id}
                  onClick={() => !proposal.alreadyVerified && handleToggleProposal(proposal.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    proposal.alreadyVerified
                      ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                      : isSelected
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700/80 shadow-2xs'
                      : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    
                    {/* Checkbox */}
                    <div className="pt-0.5 shrink-0">
                      {proposal.alreadyVerified ? (
                        <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : isSelected ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                              #{proposal.invoiceNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {proposal.statementSupplierName}
                            </span>
                            {proposal.deliverySlipNumber && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                (BL: {proposal.deliverySlipNumber})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Relevé LCR : {proposal.statementLcrNumber} • Émis le {formatDate(proposal.invoiceDate)}
                          </div>
                        </div>

                        {/* Amount & Score */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-mono text-sm font-black text-slate-900 dark:text-slate-100">
                              {formatCurrency(proposal.invoiceAmountTtc)}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              HT: {formatCurrency(proposal.invoiceAmountHt)}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isExact ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>100% Conforme</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                                <span>{proposal.matchScore}%</span>
                                <span className="text-[10px]">({proposal.amountDifference > 0 ? `+${proposal.amountDifference.toFixed(2)} €` : 'Toléré'})</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Source & Reason Box */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400">Source :</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {proposal.matchedSourceName}
                          </span>
                        </div>

                        <div className="text-right text-[11px] text-slate-600 dark:text-slate-400">
                          {proposal.matchReason}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <strong>{selectedCount}</strong> facture(s) sélectionnée(s) pour un total de <strong className="text-slate-900 dark:text-slate-100">{formatCurrency(totalSelectedAmount)}</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Annuler
            </button>

            <button
              onClick={handleConfirmApplication}
              disabled={selectedCount === 0}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black shadow-sm transition ${
                selectedCount > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>Valider & Lettrer {selectedCount} Facture(s) ({formatCurrency(totalSelectedAmount)})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
