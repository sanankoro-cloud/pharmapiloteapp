import React, { useState } from 'react';
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
  SlidersHorizontal
} from 'lucide-react';
import { MonthlyAccountingReport } from '../types/pharmacy';
import { formatCurrency, formatDate, exportToCsv, generateFecExport } from '../utils/formatters';
import { FecAndLettrageExportView } from './FecAndLettrageExportView';
import { MOCK_FEC_ENTRIES_2026, MOCK_FEC_LETTRAGE_GROUPS } from '../data/mockFecData';

interface AccountingReportsViewProps {
  reports: MonthlyAccountingReport[];
}

export const AccountingReportsView: React.FC<AccountingReportsViewProps> = ({
  reports
}) => {
  const [mainTab, setMainTab] = useState<'fec_lettrage' | 'mensuel'>('fec_lettrage');
  const [selectedReport, setSelectedReport] = useState<MonthlyAccountingReport>(reports[0]); // Juillet 2026
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(true);
  const [accountantEmail, setAccountantEmail] = useState('expert-comptable.sante@kpmg.fr');
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

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
          entries={MOCK_FEC_ENTRIES_2026}
          lettrageGroups={MOCK_FEC_LETTRAGE_GROUPS}
          siren="750019284"
          pharmacyName="Pharmacie du Grand Siècle"
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
          </div>

          {/* Success alert */}
          {exportSuccessMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportSuccessMsg}</span>
            </div>
          )}

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
                  Pharmacie du Grand Siècle • N° RPPS / FINESS 750019284
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
              <div className="flex justify-between items-center py-3 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-bold text-sm border border-indigo-200 dark:border-indigo-800">
                <span>= EXCÉDENT BRUT D'EXPLOITATION (EBE / EBITDA : {selectedReport.ebitdaPct}%)</span>
                <span className="font-mono text-base text-indigo-700 dark:text-indigo-400">{formatCurrency(selectedReport.ebe)}</span>
              </div>
            </div>

            {/* TVA Summary Table for Pharmacie */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Déclaration de TVA Officine (TVA Collectée vs Déductible)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">TVA Collectée sur Ventes</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {formatCurrency(selectedReport.tvaCollectee)}
                  </div>
                  <div className="text-[10px] text-slate-400">Taux 2.1%, 5.5%, 10%, 20%</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">TVA Déductible sur Achats</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1 font-mono">
                    {formatCurrency(selectedReport.tvaDeductible)}
                  </div>
                  <div className="text-[10px] text-slate-400">Grossistes & frais généraux</div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-emerald-800 dark:text-emerald-300 font-bold">TVA Nette à Décaisser (CA3)</div>
                  <div className="text-base font-black text-emerald-900 dark:text-emerald-200 mt-1 font-mono">
                    {formatCurrency(selectedReport.tvaAPayer)}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">À télérégler au 24 du mois</div>
                </div>
              </div>
            </div>

            {/* Export Actions Bar */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Fichiers exportables : <strong>PDF Officiel • Grand Livre Excel • FEC Art. A.47 A-1</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCsv(selectedReport)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Bilan CSV</span>
                </button>
                <button
                  onClick={() => handleExportFec(selectedReport.month)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Générer FEC DGI</span>
                </button>
              </div>
            </div>

          </div>

          {/* Automated Email Schedule Settings to Accountant */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Transmission Automatique Mensuelle à l'Expert-Comptable
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Chaque 1er du mois à 06h00, le bilan consolidé, le relevé de TVA et le FEC sont automatiquement envoyés au cabinet d'expertise comptable.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={accountantEmail}
                  onChange={(e) => setAccountantEmail(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => {
                    setExportSuccessMsg(`Email de test envoyé avec succès à ${accountantEmail} !`);
                    setTimeout(() => setExportSuccessMsg(null), 4000);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg whitespace-nowrap shadow-xs"
                >
                  Tester l'envoi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
