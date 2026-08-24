import React, { useState } from 'react';
import { 
  Landmark, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Percent, 
  Sparkles, 
  Building2, 
  Scale, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  FileSpreadsheet, 
  BarChart3, 
  Layers,
  ChevronRight,
  Calculator,
  Briefcase
} from 'lucide-react';
import { AnnualCpaReport } from '../types/accountingBalance';
import { formatCurrency, formatDate, exportToCsv, generateFecExport } from '../utils/formatters';
import { FecAndLettrageExportView } from './FecAndLettrageExportView';
import { MOCK_FEC_ENTRIES_2026, MOCK_FEC_LETTRAGE_GROUPS } from '../data/mockFecData';
import confetti from 'canvas-confetti';

interface AnnualCpaBalanceViewProps {
  reports: AnnualCpaReport[];
}

export const AnnualCpaBalanceView: React.FC<AnnualCpaBalanceViewProps> = ({
  reports
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeReportTab, setActiveReportTab] = useState<'bilan' | 'sig' | 'interfimo' | 'liasse'>('bilan');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const report = reports.find(r => r.year === selectedYear) || reports[0];

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleExportAnnualFec = () => {
    generateFecExport(`${selectedYear}-12`);
    showToast(`Fichier des Écritures Comptables (FEC) ${selectedYear} conforme DGFiP généré !`);
  };

  const handleExportAnnualCsv = () => {
    const data = [
      {
        'Poste': 'Chiffre d\'Affaires HT',
        'Montant (€)': report.sig.chiffreAffaires.totalCaHt,
        'Notes': `TTC: ${report.sig.chiffreAffaires.totalCaTtc.toFixed(2)} € (+${report.sig.chiffreAffaires.growthRateN1Pct}%)`
      },
      {
        'Poste': 'Achats Consommés HT',
        'Montant (€)': report.sig.achatsEtMarge.achatsConsommesHt,
        'Notes': `Remises déduites: ${report.sig.achatsEtMarge.remisesFacturesEtRfaDeduites.toFixed(2)} €`
      },
      {
        'Poste': 'Marge Brute Globale HT',
        'Montant (€)': report.sig.achatsEtMarge.margeBruteGlobaleHt,
        'Notes': `Taux de Marge: ${report.sig.achatsEtMarge.margeBruteTauxPct}%`
      },
      {
        'Poste': 'Valeur Ajoutée (VA)',
        'Montant (€)': report.sig.chargesExploitation.valeurAjouteeHt,
        'Notes': `${report.sig.chargesExploitation.valeurAjouteePct}% du CA`
      },
      {
        'Poste': 'Masse Salariale Totale',
        'Montant (€)': report.sig.chargesExploitation.chargesPersonnel.total,
        'Notes': `Ratio Salaires/CA: ${report.sig.chargesExploitation.ratioMasseSalarialeSurCaPct}%`
      },
      {
        'Poste': 'EBE Officine (Excédent Brut d\'Exploitation)',
        'Montant (€)': report.sig.resultats.ebeOfficine,
        'Notes': `Rentabilité EBE: ${report.sig.resultats.ebeTauxPct}%`
      },
      {
        'Poste': 'Résultat d\'Exploitation (REX)',
        'Montant (€)': report.sig.resultats.resultatExploitationRex,
        'Notes': 'Après dotations aux amortissements'
      },
      {
        'Poste': 'Résultat Net Comptable de l\'Exercice',
        'Montant (€)': report.sig.resultats.resultatNetComptable,
        'Notes': `IS déduit: ${report.sig.resultats.impotSurLesSocietes.toFixed(2)} €`
      },
      {
        'Poste': 'Capacité d\'Autofinancement (CAF)',
        'Montant (€)': report.sig.resultats.capaciteAutofinancementCaf,
        'Notes': 'Cash-flow annuel généré'
      },
      {
        'Poste': 'Total Actif Net',
        'Montant (€)': report.actif.totalActifNet,
        'Notes': 'Bilan équilibré'
      },
      {
        'Poste': 'Capitaux Propres',
        'Montant (€)': report.passif.capitauxPropres.totalCapitauxPropres,
        'Notes': `Solvabilité: ${report.ratiosAndValuation.pharmacyRatios.solvencyRatioPct}%`
      },
      {
        'Poste': 'Valorisation Indicative Fonds Interfimo',
        'Montant (€)': report.ratiosAndValuation.valuationInterfimo.weightedFinalValuationEuros,
        'Notes': report.ratiosAndValuation.valuationInterfimo.trendComment
      }
    ];

    exportToCsv(data, `bilan_annuel_expert_comptable_${report.year}`);
    showToast(`Plaquette Bilan Annuel ${report.year} exportée au format CSV / Excel.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in max-w-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Bilan Comptable Annuel & Plaquette Expert-Comptable
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{report.pharmacyName}</span>
                <span>•</span>
                <span>SIREN : {report.siren}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {report.cpaCabinet}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAnnualFec}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export FEC DGI</span>
          </button>
          <button
            onClick={handleExportAnnualCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimer Plaquette</span>
          </button>
        </div>
      </div>

      {/* Year Selector & CPA Signature Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Exercice Comptable :</span>
          <div className="flex items-center gap-1.5">
            {reports.map((r) => (
              <button
                key={r.year}
                onClick={() => setSelectedYear(r.year)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                  selectedYear === r.year
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Exercice {r.year} {r.status === 'provisoire' ? '(En cours)' : '(Clôturé)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Visa de conformité : <strong>{report.cpaSignatory}</strong></span>
        </div>
      </div>

      {/* CPA Executive Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Chiffre d'Affaires HT</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(report.sig.chiffreAffaires.totalCaHt)}
          </div>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{report.sig.chiffreAffaires.growthRateN1Pct}% vs N-1
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Marge Brute Officine</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {report.sig.achatsEtMarge.margeBruteTauxPct.toFixed(2)} %
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {formatCurrency(report.sig.achatsEtMarge.margeBruteGlobaleHt)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">EBE / Rentabilité</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {report.sig.resultats.ebeTauxPct.toFixed(2)} %
          </div>
          <div className="text-[11px] font-bold text-indigo-500 mt-1">
            EBE : {formatCurrency(report.sig.resultats.ebeOfficine)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Résultat Net Comptable</div>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {formatCurrency(report.sig.resultats.resultatNetComptable)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            CAF : {formatCurrency(report.sig.resultats.capaciteAutofinancementCaf)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Valorisation Fonds (Interfimo)</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(report.ratiosAndValuation.valuationInterfimo.weightedFinalValuationEuros)}
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-1">
            {report.ratiosAndValuation.valuationInterfimo.pctCaMethod.recommendedPct}% du CA HT
          </div>
        </div>
      </div>

      {/* Plaquette Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex space-x-1">
        {[
          { id: 'bilan', label: '1. Bilan Actif / Passif (PCG)', icon: Scale },
          { id: 'sig', label: '2. Compte de Résultat & SIG', icon: BarChart3 },
          { id: 'interfimo', label: '3. Diagnostic & Valorisation Interfimo', icon: Award },
          { id: 'liasse', label: '4. Liasse Fiscale Cerfa 2050 / FEC', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition ${
                isActive
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: BILAN ACTIF / PASSIF */}
      {activeReportTab === 'bilan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ACTIF */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Bilan Actif (Emplois) au 31/12/{report.year}</span>
              </h3>
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                Net : {formatCurrency(report.actif.totalActifNet)}
              </span>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Actif Immobilisé */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>I. Actif Immobilisé Net</span>
                  <span className="font-mono font-black">{formatCurrency(report.actif.immobilise.totalNet)}</span>
                </div>
                
                <div className="pl-2 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Fonds commercial de pharmacie :</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(report.actif.immobilise.incorporel.fondsDeCommerce)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logiciels LGO, licences & brevet :</span>
                    <span className="font-mono">{formatCurrency(report.actif.immobilise.incorporel.logicielsLicencesLgo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agencements officine & Mobilier :</span>
                    <span className="font-mono">{formatCurrency(report.actif.immobilise.corporel.agencementsMobilier)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Robot / Automate de dispensation :</span>
                    <span className="font-mono">{formatCurrency(report.actif.immobilise.corporel.robotAutomate)}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Amortissements cumulés :</span>
                    <span className="font-mono">{formatCurrency(report.actif.immobilise.corporel.amortissements + report.actif.immobilise.incorporel.amortissements)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dépôts, cautionnements & titres coopérative :</span>
                    <span className="font-mono">{formatCurrency(report.actif.immobilise.financier.net)}</span>
                  </div>
                </div>
              </div>

              {/* Actif Circulant */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>II. Actif Circulant Net</span>
                  <span className="font-mono font-black">{formatCurrency(report.actif.circulant.totalNet)}</span>
                </div>

                <div className="pl-2 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>Stocks de marchandises (PUMP HT) :</span>
                    <span className="font-mono">{formatCurrency(report.actif.circulant.stocks.marchandisesPumpHt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Créances Tiers-Payant Sécu CPAM (RO) :</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(report.actif.circulant.creances.tiersPayantCpamRo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Créances Tiers-Payant Mutuelles (RC) :</span>
                    <span className="font-mono text-emerald-600">{formatCurrency(report.actif.circulant.creances.tiersPayantMutuellesRc)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avoirs RFA & remises fournisseurs à recevoir :</span>
                    <span className="font-mono text-amber-600">{formatCurrency(report.actif.circulant.creances.fournisseursAvoirsRfaARecevoir)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1">
                    <span>Trésorerie & Disponibilités (Crédit Agricole) :</span>
                    <span className="font-mono text-indigo-600">{formatCurrency(report.actif.circulant.disponibilites.net)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between font-black text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                <span>TOTAL ACTIF GÉNÉRAL :</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(report.actif.totalActifNet)}</span>
              </div>
            </div>
          </div>

          {/* PASSIF */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-indigo-600" />
                <span>Bilan Passif (Ressources) au 31/12/{report.year}</span>
              </h3>
              <span className="font-mono font-black text-indigo-700 dark:text-indigo-300 text-sm">
                Total : {formatCurrency(report.passif.totalPassif)}
              </span>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Capitaux Propres */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>I. Capitaux Propres</span>
                  <span className="font-mono font-black text-teal-600">{formatCurrency(report.passif.capitauxPropres.totalCapitauxPropres)}</span>
                </div>

                <div className="pl-2 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Capital social :</span>
                    <span className="font-mono">{formatCurrency(report.passif.capitauxPropres.capitalSocial)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Réserves légales & statutaires :</span>
                    <span className="font-mono">{formatCurrency(report.passif.capitauxPropres.reserveLegale + report.passif.capitauxPropres.reservesStatutaires)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Report à nouveau :</span>
                    <span className="font-mono">{formatCurrency(report.passif.capitauxPropres.reportANouveau)}</span>
                  </div>
                  <div className="flex justify-between font-black text-emerald-600 text-xs pt-0.5">
                    <span>Résultat Net de l'exercice :</span>
                    <span className="font-mono font-black">+{formatCurrency(report.passif.capitauxPropres.resultatNetExercice)}</span>
                  </div>
                </div>
              </div>

              {/* Dettes */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white uppercase text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                  <span>II. Dettes & Engagements</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">{formatCurrency(report.passif.dettes.totalDettes)}</span>
                </div>

                <div className="pl-2 space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>Emprunts bancaires acquisition fonds (LMT) :</span>
                    <span className="font-mono">{formatCurrency(report.passif.dettes.empruntsLongMoyenTerme.empruntAcquisitionFonds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emprunts robot / agencement :</span>
                    <span className="font-mono">{formatCurrency(report.passif.dettes.empruntsLongMoyenTerme.empruntRobotAgencement)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>Dettes Fournisseurs & Traites LCR à échoir :</span>
                    <span className="font-mono text-rose-600">{formatCurrency(report.passif.dettes.dettesFournisseursEtTraites.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dettes fiscales & sociales (URSSAF, TVA, IS) :</span>
                    <span className="font-mono">{formatCurrency(report.passif.dettes.dettesFiscalesEtSociales.total)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between font-black text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                <span>TOTAL PASSIF GÉNÉRAL :</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{formatCurrency(report.passif.totalPassif)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPTE DE RÉSULTAT & SIG */}
      {activeReportTab === 'sig' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Soldes Intermédiaires de Gestion (SIG) - Exercice {report.year}</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">Montants exprimés en € HT</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* CA Total */}
            <div className="p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="space-y-0.5">
                <div className="font-black text-slate-900 dark:text-white text-sm">1. Chiffre d'Affaires Net HT</div>
                <div className="text-[11px] text-slate-400">
                  Remboursable 2.1% ({formatCurrency(report.sig.chiffreAffaires.medicamentsRemboursables21Ht)}) • OTC 10% ({formatCurrency(report.sig.chiffreAffaires.medicamentsNonRemboursables10Ht)}) • Para 20% ({formatCurrency(report.sig.chiffreAffaires.parapharmacieDispositifs20Ht)}) • Honoraires & ROSP ({formatCurrency(report.sig.chiffreAffaires.honorairesDispensationRospActesHt)})
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-base text-slate-900 dark:text-white">
                  {formatCurrency(report.sig.chiffreAffaires.totalCaHt)}
                </div>
                <div className="text-[11px] font-bold text-emerald-600">100.00 % du CA</div>
              </div>
            </div>

            {/* Achats consommés & Marge Brute */}
            <div className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">Achats Consommés de Marchandises HT</div>
                <div className="text-[11px] text-slate-400">
                  Achats bruts ({formatCurrency(report.sig.achatsEtMarge.achatsMarchandisesBrutHt)}) - Remises & RFA ({formatCurrency(report.sig.achatsEtMarge.remisesFacturesEtRfaDeduites)}) ± Var. stocks
                </div>
              </div>
              <div className="text-right font-mono font-semibold text-rose-600">
                -{formatCurrency(report.sig.achatsEtMarge.achatsConsommesHt)}
              </div>
            </div>

            {/* Marge Brute Globale (KPI clé) */}
            <div className="p-4 flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/40 border-y border-emerald-200 dark:border-emerald-800">
              <div className="space-y-0.5">
                <div className="font-black text-emerald-900 dark:text-emerald-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>2. MARGE BRUTE GLOBALE OFFICINE</span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Marge commerciale officinale intégrant les remises de groupement et honoraires de dispensation
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-lg text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(report.sig.achatsEtMarge.margeBruteGlobaleHt)}
                </div>
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  Taux de Marge : {report.sig.achatsEtMarge.margeBruteTauxPct.toFixed(2)} %
                </div>
              </div>
            </div>

            {/* Charges externes & VA */}
            <div className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">Autres Achats & Charges Externes</div>
                <div className="text-[11px] text-slate-400">
                  Loyer ({formatCurrency(report.sig.chargesExploitation.autresAchatsEtChargesExternes.loyerImmobilierEtCharges)}) • Informatique LGO/Robot • Expert-Comptable • Assurances & TPE
                </div>
              </div>
              <div className="text-right font-mono font-semibold text-slate-600 dark:text-slate-400">
                -{formatCurrency(report.sig.chargesExploitation.autresAchatsEtChargesExternes.total)}
              </div>
            </div>

            {/* Valeur Ajoutée */}
            <div className="p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="font-bold text-slate-900 dark:text-white">3. Valeur Ajoutée (VA)</div>
              <div className="text-right">
                <div className="font-mono font-black text-slate-900 dark:text-white">
                  {formatCurrency(report.sig.chargesExploitation.valeurAjouteeHt)}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">{report.sig.chargesExploitation.valeurAjouteePct.toFixed(1)}% du CA</div>
              </div>
            </div>

            {/* Masse salariale */}
            <div className="p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">Charges de Personnel & Salaires</div>
                <div className="text-[11px] text-slate-400">
                  Salaires équipe ({formatCurrency(report.sig.chargesExploitation.chargesPersonnel.salairesBrutsEquipe)}) + Charges sociales patronales + Rémunération titulaire
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-semibold text-rose-600">
                  -{formatCurrency(report.sig.chargesExploitation.chargesPersonnel.total)}
                </div>
                <div className="text-[11px] font-bold text-indigo-600">
                  Ratio Masse Salariale : {report.sig.chargesExploitation.ratioMasseSalarialeSurCaPct.toFixed(2)} % du CA
                </div>
              </div>
            </div>

            {/* EBE Officine (KPI clé) */}
            <div className="p-4 flex items-center justify-between bg-indigo-50/60 dark:bg-indigo-950/40 border-y border-indigo-200 dark:border-indigo-800">
              <div className="space-y-0.5">
                <div className="font-black text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>4. EXCÉDENT BRUT D'EXPLOITATION (EBE / EBITDA)</span>
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-400">
                  Capacité bénéficiaire opérationnelle de l'officine avant dotations, frais financiers et impôts
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-lg text-indigo-700 dark:text-indigo-300">
                  {formatCurrency(report.sig.resultats.ebeOfficine)}
                </div>
                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  Taux EBE : {report.sig.resultats.ebeTauxPct.toFixed(2)} %
                </div>
              </div>
            </div>

            {/* Résultat d'Exploitation & Net */}
            <div className="p-4 flex items-center justify-between">
              <div className="font-bold text-slate-800 dark:text-slate-200">Résultat d'Exploitation (REX)</div>
              <div className="text-right font-mono font-bold text-slate-900 dark:text-white">
                {formatCurrency(report.sig.resultats.resultatExploitationRex)}
              </div>
            </div>

            <div className="p-4 flex items-center justify-between bg-teal-50 dark:bg-teal-950/40 border-t border-teal-200 dark:border-teal-800">
              <div className="space-y-0.5">
                <div className="font-black text-teal-900 dark:text-teal-300 text-sm">
                  5. RÉSULTAT NET COMPTABLE DE L'EXERCICE
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-400">
                  Après charges financières (-{formatCurrency(Math.abs(report.sig.resultats.resultatFinancier))}) et IS (-{formatCurrency(report.sig.resultats.impotSurLesSocietes)})
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-black text-xl text-teal-700 dark:text-teal-300">
                  +{formatCurrency(report.sig.resultats.resultatNetComptable)}
                </div>
                <div className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  CAF : {formatCurrency(report.sig.resultats.capaciteAutofinancementCaf)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DIAGNOSTIC RATIOS & VALORISATION INTERFIMO */}
      {activeReportTab === 'interfimo' && (
        <div className="space-y-6">
          {/* Interfimo Valuation Card */}
          <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  <Building2 className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-base font-black">Valorisation Indicative du Fonds de Commerce</h3>
                  <p className="text-xs text-slate-300">Barème officiel d'évaluation ordinale Interfimo / Fiducial</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-indigo-300 font-semibold">Valorisation Retenue :</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {formatCurrency(report.ratiosAndValuation.valuationInterfimo.weightedFinalValuationEuros)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Method 1: % of Turnover */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-indigo-200">1. Méthode par le Chiffre d'Affaires HT</div>
                <div className="text-lg font-black text-white font-mono">
                  {formatCurrency(report.ratiosAndValuation.valuationInterfimo.pctCaMethod.valuationRecommendedEuros)}
                </div>
                <div className="text-xs text-slate-300">
                  Fourchette retenue : {report.ratiosAndValuation.valuationInterfimo.pctCaMethod.lowPct}% à {report.ratiosAndValuation.valuationInterfimo.pctCaMethod.highPct}% du CA (médiane : {report.ratiosAndValuation.valuationInterfimo.pctCaMethod.recommendedPct}%)
                </div>
              </div>

              {/* Method 2: Multiple of EBITDA */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                <div className="text-xs font-bold text-indigo-200">2. Méthode par le Multiple de l'EBE</div>
                <div className="text-lg font-black text-white font-mono">
                  {formatCurrency(report.ratiosAndValuation.valuationInterfimo.multipleEbeMethod.valuationEuros)}
                </div>
                <div className="text-xs text-slate-300">
                  Multiple appliqué : {report.ratiosAndValuation.valuationInterfimo.multipleEbeMethod.multiple}x l'EBE retraité
                </div>
              </div>
            </div>

            <p className="text-xs text-indigo-200/90 italic bg-white/5 p-3 rounded-xl border border-white/10">
              💡 {report.ratiosAndValuation.valuationInterfimo.trendComment}
            </p>
          </div>

          {/* Key Pharmacy Ratios Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Ratios Financiers Clés Spécialisés Officine</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-slate-500 font-semibold">Rotation des Stocks :</div>
                <div className="text-base font-black text-emerald-600">
                  {report.ratiosAndValuation.pharmacyRatios.stockRotationDays} jours
                </div>
                <div className="text-[10px] text-slate-400">Benchmark officiel : 25-35 jours</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-slate-500 font-semibold">Besoin en Fonds de Roulement (BFR) :</div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {report.ratiosAndValuation.pharmacyRatios.bfrDaysOfTurnover} jours de CA
                </div>
                <div className="text-[10px] text-slate-400">{formatCurrency(report.ratiosAndValuation.pharmacyRatios.bfrEuros)}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-slate-500 font-semibold">Délai Règlement Fournisseurs :</div>
                <div className="text-base font-black text-indigo-600">
                  {report.ratiosAndValuation.pharmacyRatios.supplierPaymentDays} jours
                </div>
                <div className="text-[10px] text-slate-400">LCR à 30-45 jours fin de mois</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-slate-500 font-semibold">Encaissement Tiers-Payant :</div>
                <div className="text-base font-black text-emerald-600">
                  {report.ratiosAndValuation.pharmacyRatios.customerCollectionDays} jours
                </div>
                <div className="text-[10px] text-slate-400">Via concentrateur Resopharma</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-slate-500 font-semibold">Ratio Endettement Net / EBE :</div>
                <div className="text-base font-black text-teal-600">
                  {report.ratiosAndValuation.pharmacyRatios.debtToEbeRatio} x
                </div>
                <div className="text-[10px] text-slate-400">Seuil de vigilance bancaire : &lt; 4.5x</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-slate-500 font-semibold">Scoring Financier Global :</div>
                <div className="text-base font-black text-emerald-600">
                  {report.ratiosAndValuation.pharmacyRatios.financialScoring}
                </div>
                <div className="text-[10px] text-slate-400">Solvabilité : {report.ratiosAndValuation.pharmacyRatios.solvencyRatioPct}%</div>
              </div>
            </div>

            {/* CPA Recommendations */}
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Recommandations de Gestion de l'Expert-Comptable</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-800 dark:text-emerald-300">
                {report.ratiosAndValuation.cpaAuditRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: LIASSE FISCALE CERFA & CONFORMITÉ FEC */}
      {activeReportTab === 'liasse' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Liasse Fiscale Cerfa DGFiP & Fichier des Écritures Comptables (FEC)</span>
              </h3>
              <p className="text-xs text-slate-500">Télétransmission conforme EDI-TDFC et article A.47 A-1 du Livre des Procédures Fiscales</p>
            </div>
            <button
              onClick={handleExportAnnualFec}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Télécharger FEC {report.year} Validé</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Cerfa 2050</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">Validé</span>
              </div>
              <p className="text-[11px] text-slate-500">Bilan - Actif Immobilisé & Circulant</p>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCurrency(report.actif.totalActifNet)}</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Cerfa 2051</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">Validé</span>
              </div>
              <p className="text-[11px] text-slate-500">Bilan - Passif & Capitaux Propres</p>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCurrency(report.passif.totalPassif)}</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Cerfa 2052</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">Validé</span>
              </div>
              <p className="text-[11px] text-slate-500">Compte de Résultat de l'Exercice</p>
              <div className="font-mono font-bold text-teal-600">{formatCurrency(report.sig.resultats.resultatNetComptable)}</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Cerfa 2058-A</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">Conforme</span>
              </div>
              <p className="text-[11px] text-slate-500">Détermination du Résultat Fiscal IS</p>
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCurrency(report.sig.resultats.resultatCourantAvantImpotRcai)}</div>
            </div>
          </div>

          {/* Interactive FEC and Lettrage Export Center embedded */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <FecAndLettrageExportView
              entries={MOCK_FEC_ENTRIES_2026}
              lettrageGroups={MOCK_FEC_LETTRAGE_GROUPS}
              siren="750019284"
              pharmacyName="Pharmacie du Grand Siècle"
              defaultYear={report.year}
            />
          </div>
        </div>
      )}
    </div>
  );
};
