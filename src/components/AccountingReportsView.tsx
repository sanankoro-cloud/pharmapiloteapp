import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Mail, 
  CheckCircle, 
  Calendar, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Check, 
  Printer,
  Sparkles,
  Table,
  SlidersHorizontal,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { MonthlyAccountingReport, PharmacyProfile } from '../types/pharmacy';
import { formatCurrency, formatDate, exportToCsv, generateFecExport } from '../utils/formatters';
import { FecAndLettrageExportView } from './FecAndLettrageExportView';
import { MOCK_FEC_ENTRIES_2026, MOCK_FEC_LETTRAGE_GROUPS } from '../data/mockFecData';
import { FecEntry, FecLettrageGroup } from '../types/fecExport';

interface AccountingReportsViewProps {
  reports: MonthlyAccountingReport[];
  pharmacyProfile?: PharmacyProfile;
  isRealModeActive?: boolean;
  onNavigateTab?: (tab: string) => void;
  fecEntries?: FecEntry[];
  fecLettrageGroups?: FecLettrageGroup[];
}

export const AccountingReportsView: React.FC<AccountingReportsViewProps> = ({
  reports,
  pharmacyProfile,
  isRealModeActive = false,
  onNavigateTab,
  fecEntries,
  fecLettrageGroups
}) => {
  const [mainTab, setMainTab] = useState<'fec_lettrage' | 'mensuel'>('fec_lettrage');
  const [selectedReport, setSelectedReport] = useState<MonthlyAccountingReport | null>(reports[0] || null);
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(true);
  const [accountantEmail, setAccountantEmail] = useState('expert-comptable.sante@kpmg.fr');
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (reports.length > 0) {
      if (!selectedReport || !reports.some(r => r.month === selectedReport.month)) {
        setSelectedReport(reports[0]);
      }
    } else {
      setSelectedReport(null);
    }
  }, [reports]);

  const activeEntries = isRealModeActive ? (fecEntries || []) : MOCK_FEC_ENTRIES_2026;
  const activeLettrage = isRealModeActive ? (fecLettrageGroups || []) : MOCK_FEC_LETTRAGE_GROUPS;
  const currentPharmacyName = pharmacyProfile?.name || 'Pharmacie du Grand Siècle';
  const currentSiren = pharmacyProfile?.finessOrSiret ? pharmacyProfile.finessOrSiret.replace(/\s+/g, '').slice(0, 9) : '750019284';

  const handleExportFec = (month: string) => {
    generateFecExport(month);
    setExportSuccessMsg(`Fichier FEC ${month} généré avec succès au format DGI !`);
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  const handleExportCsv = (rep: MonthlyAccountingReport) => {
    const data = [
      {
        'Période': rep.monthName,
        'Chiffre d\'Affaires HT (€)': rep.caHt,
        'Chiffre d\'Affaires TTC (€)': rep.caTtc,
        'Achats Consommés HT (€)': rep.achatsConsommesHt,
        'Marge Brute HT (€)': rep.margeBruteHt,
        'Taux de Marge (%)': rep.margeBrutePct,
        'Charges Externes (€)': rep.chargesExternes,
        'Charges de Personnel (€)': rep.chargesPersonnel,
        'EBE / EBITDA Officine (€)': rep.ebe,
        'Taux EBE (%)': rep.ebitdaPct,
        'TVA Collectée (€)': rep.tvaCollectee,
        'TVA Déductible (€)': rep.tvaDeductible,
        'TVA Nette à Payer (€)': rep.tvaAPayer,
        'Trésorerie Finale (€)': rep.tresorerieFinale
      }
    ];
    exportToCsv(data, `bilan_mensuel_pharmacie_${rep.month}`);
    setExportSuccessMsg(`Bilan mensuel CSV ${rep.monthName} exporté !`);
    setTimeout(() => setExportSuccessMsg(null), 4000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation Switcher between FEC Export Center & Monthly Reports */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-1">
          <button
            onClick={() => setMainTab('fec_lettrage')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
              mainTab === 'fec_lettrage'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Fichier FEC & Journaux de Lettrage DGFiP</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold ml-1">
              Art. A.47 A-1
            </span>
          </button>

          <button
            onClick={() => setMainTab('mensuel')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
              mainTab === 'mensuel'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Bilans Mensuels & Déclarations TVA</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 pr-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Certifié Pré-Comptabilité Pharmacie</span>
        </div>
      </div>

      {/* Main Tab 1: Complete FEC Export Center & Lettrage Journal */}
      {mainTab === 'fec_lettrage' && (
        <FecAndLettrageExportView 
          entries={activeEntries}
          lettrageGroups={activeLettrage}
          siren={currentSiren}
          pharmacyName={currentPharmacyName}
          defaultYear={2026}
        />
      )}

      {/* Main Tab 2: Monthly Income Statement & TVA reports */}
      {mainTab === 'mensuel' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Rapports Comptables Mensuels & Déclarations de TVA
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Génération automatique des bilans mensuels d'officine, états de TVA, compte de résultat simplifié et ventilation des marges.
              </p>
            </div>

            {selectedReport && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportFec(selectedReport.month)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export FEC du Mois</span>
                </button>
                <button
                  onClick={handlePrintPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Imprimer / PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Success alert */}
          {exportSuccessMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportSuccessMsg}</span>
            </div>
          )}

          {reports.length === 0 || !selectedReport ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Aucun rapport comptable mensuel pour le moment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  L'application est initialisée à blanc en mode réel. Dès que vous enregistrez ou importez vos premières écritures bancaires, factures fournisseurs et ventes, vos bilans mensuels d'officine et déclarations de TVA se génèreront automatiquement ici.
                </p>
              </div>
              {onNavigateTab && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigateTab('tresorerie')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Aller aux Écritures & Trésorerie</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Month Selector Tabs */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between overflow-x-auto">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Choisir le mois de clôture :</span>
                  {reports.map((rep) => (
                    <button
                      key={rep.month}
                      onClick={() => setSelectedReport(rep)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedReport.month === rep.month
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {rep.monthName}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 hidden sm:inline">
                  Statut : <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedReport.status === 'cloture' ? 'Clôturé & Conforme' : 'En cours de saisie'}</span>
                </span>
              </div>

              {/* Main Income Statement Document Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
                
                {/* Document Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {currentPharmacyName} • SIREN {currentSiren}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      Compte de Résultat Officinal & Synthèse Mensuelle
                    </h2>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Période : {selectedReport.monthName} • Conforme Plan Comptable Professionnel Officine
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Certifié Pré-Comptabilité
                    </span>
                  </div>
                </div>

                {/* Financial Line Items */}
                <div className="space-y-3 text-xs">
                  
                  {/* Chiffre d'affaires */}
                  <div className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white">
                    <span>CHIFFRE D'AFFAIRES HORS TAXES (CA HT)</span>
                    <span className="font-mono text-sm">{formatCurrency(selectedReport.caHt)}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                    <span>Chiffre d'Affaires TTC</span>
                    <span className="font-mono">{formatCurrency(selectedReport.caTtc)}</span>
                  </div>

                  {/* Achats consommés */}
                  <div className="flex justify-between items-center py-2 px-3 text-rose-600 dark:text-rose-400">
                    <span>- Achats Consommés de Marchandises HT (Grossistes & Labos)</span>
                    <span className="font-mono font-semibold">-{formatCurrency(selectedReport.achatsConsommesHt)}</span>
                  </div>

                  {/* Marge Brute */}
                  <div className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-800">
                    <span>= MARGE BRUTE GLOBALE (Taux de marque : {selectedReport.margeBrutePct}%)</span>
                    <span className="font-mono text-sm">{formatCurrency(selectedReport.margeBruteHt)}</span>
                  </div>

                  {/* Charges externes */}
                  <div className="flex justify-between items-center py-2 px-3 text-slate-700 dark:text-slate-300">
                    <span>- Charges Externes (Loyer, Logiciel LGO, Énergie, Robot, Assurances)</span>
                    <span className="font-mono font-semibold">-{formatCurrency(selectedReport.chargesExternes)}</span>
                  </div>

                  {/* Masse salariale */}
                  <div className="flex justify-between items-center py-2 px-3 text-slate-700 dark:text-slate-300">
                    <span>- Charges de Personnel & URSSAF (Équipe officine)</span>
                    <span className="font-mono font-semibold">-{formatCurrency(selectedReport.chargesPersonnel)}</span>
                  </div>

                  {/* EBE */}
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xs">
                    <span>= EXCÉDENT BRUT D'EXPLOITATION (EBE / EBITDA : {selectedReport.ebitdaPct}%)</span>
                    <span className="font-mono text-base text-emerald-400">{formatCurrency(selectedReport.ebe)}</span>
                  </div>
                </div>

                {/* TVA Declaration Breakdown */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Déclaration de TVA CA3 du Mois (Estimée)</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500 dark:text-slate-400">TVA Collectée (Ventes)</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
                        {formatCurrency(selectedReport.tvaCollectee)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Taux 2.1%, 5.5%, 10%, 20%</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500 dark:text-slate-400">TVA Déductible (Achats & Frais)</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
                        {formatCurrency(selectedReport.tvaDeductible)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Sur factures grossistes & frais</div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-emerald-800 dark:text-emerald-300 font-semibold">TVA Nette à Décaisser</div>
                      <div className="text-base font-black text-emerald-900 dark:text-emerald-100 mt-1 font-mono">
                        {formatCurrency(selectedReport.tvaAPayer)}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">À télérégler avant le 24</div>
                    </div>
                  </div>
                </div>

                {/* Direct Action Footer */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto-send"
                      checked={autoEmailEnabled}
                      onChange={(e) => setAutoEmailEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="auto-send" className="text-slate-600 dark:text-slate-400">
                      Envoi automatique du FEC à l'expert-comptable le 5 du mois suivant ({accountantEmail})
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportCsv(selectedReport)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV Bilan</span>
                    </button>
                    <button
                      onClick={() => handleExportFec(selectedReport.month)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Générer FEC DGI</span>
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};

