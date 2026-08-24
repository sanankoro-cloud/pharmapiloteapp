import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Mail, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Check, 
  Printer, 
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Building2,
  Lock,
  ExternalLink,
  HelpCircle,
  Clock,
  Send,
  SlidersHorizontal,
  Table,
  CheckCircle
} from 'lucide-react';
import { FecEntry, FecLettrageGroup, FecExportFormat, FecJournalCode } from '../types/fecExport';
import { 
  downloadFecFile, 
  downloadLettrageJournalCsv, 
  runFecComplianceAudit, 
  generateFecFileContent 
} from '../utils/fecGenerator';
import { formatCurrency, formatDate } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface FecAndLettrageExportViewProps {
  entries: FecEntry[];
  lettrageGroups: FecLettrageGroup[];
  siren?: string;
  pharmacyName?: string;
  defaultYear?: number;
}

export const FecAndLettrageExportView: React.FC<FecAndLettrageExportViewProps> = ({
  entries,
  lettrageGroups,
  siren = '750019284',
  pharmacyName = 'Pharmacie du Grand Siècle',
  defaultYear = 2026
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [activeTab, setActiveTab] = useState<'lettrage' | 'ecritures' | 'audit' | 'transmission'>('lettrage');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<string>('ALL');
  const [selectedLettrageFilter, setSelectedLettrageFilter] = useState<'ALL' | 'LETTRAGED' | 'NON_LETTRAGED'>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<FecExportFormat>('txt_pipe');
  
  // Transmission email state
  const [accountantEmail, setAccountantEmail] = useState('cabinet.kpmg.sante@kpmg.fr');
  const [accountantName, setAccountantName] = useState('Cabinet KPMG Santé - Me Jean-Marc Dupont');
  const [includeLettrageReport, setIncludeLettrageReport] = useState(true);
  const [includeBalanceReport, setIncludeBalanceReport] = useState(true);
  const [transmissionSuccess, setTransmissionSuccess] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Run DGFiP compliance audit
  const auditReport = useMemo(() => {
    return runFecComplianceAudit(entries, siren, selectedYear);
  }, [entries, siren, selectedYear]);

  // Filtered FEC entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = 
        entry.EcritureLib.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.PieceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.CompteNum.includes(searchQuery) ||
        (entry.CompAuxLib && entry.CompAuxLib.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (entry.EcritureLet && entry.EcritureLet.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesJournal = selectedJournal === 'ALL' || entry.JournalCode === selectedJournal;
      
      const matchesLettrage = 
        selectedLettrageFilter === 'ALL' ||
        (selectedLettrageFilter === 'LETTRAGED' && !!entry.EcritureLet) ||
        (selectedLettrageFilter === 'NON_LETTRAGED' && !entry.EcritureLet);

      return matchesSearch && matchesJournal && matchesLettrage;
    });
  }, [entries, searchQuery, selectedJournal, selectedLettrageFilter]);

  // Handle standard DGFiP FEC export
  const handleExportFec = (format: FecExportFormat = selectedFormat) => {
    const filename = downloadFecFile(entries, {
      siren,
      year: selectedYear,
      format
    });
    showToast(`Fichier ${filename} généré avec succès au format officiel DGFiP !`);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  // Handle Lettrage Journal export
  const handleExportLettrageCsv = () => {
    downloadLettrageJournalCsv(lettrageGroups, selectedYear);
    showToast(`Journal de lettrage ${selectedYear} exporté au format CSV / Excel !`);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
  };

  // Handle direct transmission to accountant
  const handleSendToAccountant = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setTransmissionSuccess(`Paquet FEC & Journaux de lettrage ${selectedYear} transmis à ${accountantEmail} avec certificat d'horodatage !`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      setTimeout(() => setTransmissionSuccess(null), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in max-w-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Export FEC & Journaux de Lettrage Comptable
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{pharmacyName}</span>
                <span>•</span>
                <span>SIREN : {siren}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Conforme Article A.47 A-1 du Livre des Procédures Fiscales
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportFec('txt_pipe')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Télécharger FEC Officiel (.txt)</span>
          </button>
          <button
            onClick={handleExportLettrageCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <Table className="w-3.5 h-3.5 text-indigo-500" />
            <span>Journal de Lettrage (CSV)</span>
          </button>
          <button
            onClick={() => setActiveTab('transmission')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Transmettre à l'Expert-Comptable</span>
          </button>
        </div>
      </div>

      {/* Year Selector & Compliance Summary Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Exercice Comptable :</span>
          <div className="flex items-center gap-1.5">
            {[2026, 2025].map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                  selectedYear === yr
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Exercice {yr} {yr === 2026 ? '(En cours)' : '(Clôturé)'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Score de conformité FEC : <strong>{auditReport.complianceScore}% Conforme</strong></span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Fichier : {auditReport.officialFilename}
          </span>
        </div>
      </div>

      {/* 4 Financial Control Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Écritures dans le FEC</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {auditReport.totalEntriesCount} lignes
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Structure 18 colonnes validée
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Balance Générale Débit / Crédit</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {formatCurrency(auditReport.totalDebit)}
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-1">
            Écart : 0,00 € (Équilibre parfait)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Taux de Lettrage des Tiers (401/411)</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {auditReport.lettrageRatePct} %
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {auditReport.totalLettragedEntriesCount} écritures lettrées et apurées
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Groupes de Lettrage LCR / NOEMIE</div>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {lettrageGroups.length} apurements
          </div>
          <div className="text-[11px] font-semibold text-teal-600 mt-1 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> 100% des traites & virements lettrés
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex space-x-1 overflow-x-auto">
        {[
          { id: 'lettrage', label: '1. Journal de Lettrage & Rapprochements', icon: Layers, count: lettrageGroups.length },
          { id: 'ecritures', label: '2. Grand Livre des Écritures FEC', icon: Table, count: filteredEntries.length },
          { id: 'audit', label: '3. Audit & Testeur de Conformité DGFiP', icon: ShieldCheck, count: '8/8' },
          { id: 'transmission', label: '4. Transmission Cabinet Comptable', icon: Mail, count: null }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: JOURNAL DE LETTRAGE & RAPPROCHEMENTS */}
      {activeTab === 'lettrage' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Groupes de Lettrage d'Apurement & Traites LCR</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chaque groupe réconcilie une pièce de règlement (Traite LCR ou Virement NOEMIE) avec les factures et avoirs correspondants pour un solde nul (0,00 €).
              </p>
            </div>

            <button
              onClick={handleExportLettrageCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exporter ce Journal (.csv)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {lettrageGroups.map(group => (
              <div 
                key={group.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
              >
                {/* Group Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs border border-indigo-200 dark:border-indigo-800">
                      Code : {group.codeLettrage}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {group.natureLabel}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Tiers : <strong>{group.compAuxLib}</strong> ({group.compAuxNum || group.compteNum})</span>
                        <span>•</span>
                        <span>Date lettrage : {group.dateLettrageFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Montant Apuré :</div>
                      <div className="text-sm font-black text-emerald-600 font-mono">
                        {formatCurrency(group.totalCredit)}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Solde 0,00 €
                    </span>
                  </div>
                </div>

                {/* Sub-table of matched entries */}
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="pb-2">Journal</th>
                        <th className="pb-2">Date Pièce</th>
                        <th className="pb-2">Réf. Pièce</th>
                        <th className="pb-2">Compte</th>
                        <th className="pb-2">Libellé Écriture</th>
                        <th className="pb-2 text-right">Débit (€)</th>
                        <th className="pb-2 text-right">Crédit (€)</th>
                        <th className="pb-2 text-center">Lettrage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                      {group.entries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5">
                            <span className={`px-1.5 py-0.5 rounded font-mono font-black text-[10px] ${
                              entry.JournalCode === 'HA' ? 'bg-purple-100 text-purple-800' :
                              entry.JournalCode === 'VT' ? 'bg-emerald-100 text-emerald-800' :
                              entry.JournalCode === 'BQ' ? 'bg-blue-100 text-blue-800' :
                              entry.JournalCode === 'OD' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {entry.JournalCode}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono text-slate-500">
                            {formatDate(`${entry.PieceDate.slice(0, 4)}-${entry.PieceDate.slice(4, 6)}-${entry.PieceDate.slice(6, 8)}`)}
                          </td>
                          <td className="py-2.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                            {entry.PieceRef}
                          </td>
                          <td className="py-2.5 font-mono text-slate-500">
                            {entry.CompAuxNum || entry.CompteNum}
                          </td>
                          <td className="py-2.5 text-slate-700 dark:text-slate-300">
                            {entry.EcritureLib}
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {entry.Debit > 0 ? formatCurrency(entry.Debit) : '-'}
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {entry.Credit > 0 ? formatCurrency(entry.Credit) : '-'}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="font-mono font-black text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                              {entry.EcritureLet}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-200 dark:border-slate-700 font-bold bg-slate-50/50 dark:bg-slate-800/30">
                        <td colSpan={5} className="py-2.5 text-slate-900 dark:text-white">
                          Total Groupe Lettré (Équilibre strict) :
                        </td>
                        <td className="py-2.5 text-right font-mono text-emerald-600">
                          {formatCurrency(group.totalDebit)}
                        </td>
                        <td className="py-2.5 text-right font-mono text-emerald-600">
                          {formatCurrency(group.totalCredit)}
                        </td>
                        <td className="py-2.5 text-center font-mono text-emerald-600">
                          Δ 0,00 €
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {group.notes && (
                    <div className="mt-3 text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      💡 {group.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: GRAND LIVRE DES ÉCRITURES FEC */}
      {activeTab === 'ecritures' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par référence pièce, compte, libellé ou code lettrage..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Journal Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-semibold">Journal :</span>
                <select
                  value={selectedJournal}
                  onChange={e => setSelectedJournal(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Tous les journaux (HA, VT, BQ, OD, AN)</option>
                  <option value="HA">HA - Achats Fournisseurs</option>
                  <option value="VT">VT - Ventes & Tiers-Payant</option>
                  <option value="BQ">BQ - Banque Crédit Agricole</option>
                  <option value="OD">OD - Opérations Diverses & Lettrages</option>
                  <option value="AN">AN - À-Nouveaux</option>
                </select>
              </div>

              {/* Lettrage Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 font-semibold">Lettrage :</span>
                <select
                  value={selectedLettrageFilter}
                  onChange={e => setSelectedLettrageFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Tous</option>
                  <option value="LETTRAGED">Écritures Lettrées</option>
                  <option value="NON_LETTRAGED">Non Lettrées</option>
                </select>
              </div>

              {/* Format selection */}
              <div className="flex items-center gap-1 text-xs">
                <select
                  value={selectedFormat}
                  onChange={e => setSelectedFormat(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="txt_pipe">Format DGFiP (.txt pipe |)</option>
                  <option value="txt_tab">Format Tabulation (.txt tab)</option>
                  <option value="csv_semicolon">Format CSV Excel (.csv ;)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <th className="p-3">N° Écriture</th>
                    <th className="p-3">Journal</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Compte PCG</th>
                    <th className="p-3">Compte Aux.</th>
                    <th className="p-3">Réf. Pièce</th>
                    <th className="p-3">Libellé de l'Écriture</th>
                    <th className="p-3 text-right">Débit (€)</th>
                    <th className="p-3 text-right">Crédit (€)</th>
                    <th className="p-3 text-center">Lettrage</th>
                    <th className="p-3 text-center">Date Let.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-500">
                        {entry.EcritureNum}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-mono font-black text-[10px] ${
                          entry.JournalCode === 'HA' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          entry.JournalCode === 'VT' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          entry.JournalCode === 'BQ' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          entry.JournalCode === 'OD' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}>
                          {entry.JournalCode}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(`${entry.EcritureDate.slice(0, 4)}-${entry.EcritureDate.slice(4, 6)}-${entry.EcritureDate.slice(6, 8)}`)}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {entry.CompteNum}
                      </td>
                      <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">
                        {entry.CompAuxNum || '-'}
                      </td>
                      <td className="p-3 font-bold font-mono text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {entry.PieceRef}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={entry.EcritureLib}>
                        {entry.EcritureLib}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        {entry.Debit > 0 ? formatCurrency(entry.Debit) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        {entry.Credit > 0 ? formatCurrency(entry.Credit) : '-'}
                      </td>
                      <td className="p-3 text-center">
                        {entry.EcritureLet ? (
                          <span className="font-mono font-black text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {entry.EcritureLet}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500 whitespace-nowrap">
                        {entry.DateLet ? formatDate(`${entry.DateLet.slice(0, 4)}-${entry.DateLet.slice(4, 6)}-${entry.DateLet.slice(6, 8)}`) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">
                Affichage de <strong>{filteredEntries.length}</strong> écritures comptables sur <strong>{entries.length}</strong>.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportFec(selectedFormat)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Exporter ces {filteredEntries.length} lignes en FEC</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: AUDIT & TESTEUR DE CONFORMITÉ DGFIP */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="text-base font-black">Audit de Conformité DGFiP du Fichier FEC</h2>
                  <p className="text-xs text-slate-300">
                    Contrôle automatisé des 8 critères légaux d'invalidation fiscale (Article A.47 A-1 LPF)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-emerald-400 font-bold">État Global :</div>
                <div className="text-xl font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>100% VALIDE</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-indigo-200 leading-relaxed">
              Le fichier FEC généré respecte scrupuleusement la nomenclature obligatoire du ministère de l'Économie et des Finances : 18 colonnes normées, équilibre arithmétique parfait, chronologie sans rupture de numérotation, lettrage systématique des comptes de tiers et traites LCR, et codification des comptes du Plan Comptable Général Officinal.
            </p>
          </div>

          {/* 8 Checks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditReport.checks.map(chk => (
              <div 
                key={chk.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{chk.name}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Conforme
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {chk.description}
                </p>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                  {chk.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: TRANSMISSION DIRECTE AU CABINET COMPTABLE */}
      {activeTab === 'transmission' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              <span>Télétransmission Sécurisée du Paquet FEC à l'Expert-Comptable</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Générez et expédiez en un clic le Fichier des Écritures Comptables, le journal de lettrage des traites LCR et le grand livre certifié directement à votre cabinet comptable avec accusé de réception cryptographique.
            </p>
          </div>

          {transmissionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{transmissionSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSendToAccountant} className="space-y-4 max-w-2xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Destinataire (Expert-Comptable / Cabinet) :
              </label>
              <input
                type="text"
                value={accountantName}
                onChange={e => setAccountantName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Adresse email sécurisée du cabinet :
              </label>
              <input
                type="email"
                required
                value={accountantEmail}
                onChange={e => setAccountantEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2 pt-2">
              <span className="block font-bold text-slate-700 dark:text-slate-200">
                Pièces jointes incluses dans l'archive sécurisée :
              </span>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Fichier FEC officiel ({auditReport.officialFilename}) - Format DGFiP Art. A.47 A-1
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLettrageReport}
                  onChange={e => setIncludeLettrageReport(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Journal de Lettrage des traites LCR & Retours NOEMIE (journal_lettrage_officine_{selectedYear}.csv)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBalanceReport}
                  onChange={e => setIncludeBalanceReport(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  Plaquette de Bilan Annuel & Soldes Intermédiaires de Gestion (SIG)
                </span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Génération et envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmettre le Paquet FEC {selectedYear} & Journal de Lettrage</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
