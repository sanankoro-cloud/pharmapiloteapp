import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Download, 
  Upload, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Search, 
  Filter, 
  X, 
  ExternalLink, 
  Layers, 
  Calendar, 
  Euro, 
  Lock, 
  Check, 
  Clock, 
  Sparkles, 
  FileSpreadsheet, 
  Hash, 
  Eye, 
  TrendingDown, 
  Database,
  ArrowRight
} from 'lucide-react';
import { 
  ElectronicInvoice, 
  VaultConnectorConfig, 
  VaultSyncLog, 
  VaultConnectorId 
} from '../types/electronicInvoicing';
import { SupplierOrder, ProductStock } from '../types/pharmacy';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';

interface ElectronicInvoicingVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: ElectronicInvoice[];
  vaultConnectors: VaultConnectorConfig[];
  syncLogs: VaultSyncLog[];
  onSyncVault: (connectorId?: VaultConnectorId) => void;
  isSyncing: boolean;
  onImportInvoiceToOrders: (invoice: ElectronicInvoice) => void;
  onPayInvoiceViaBank: (invoice: ElectronicInvoice) => void;
  onAddManualFacturX: (file: File | { name: string; size: number }) => void;
  onUpdateConnectorConfig: (connectorId: VaultConnectorId, updates: Partial<VaultConnectorConfig>) => void;
}

export const ElectronicInvoicingVaultModal: React.FC<ElectronicInvoicingVaultModalProps> = ({
  isOpen,
  onClose,
  invoices = [],
  vaultConnectors = [],
  syncLogs = [],
  onSyncVault,
  isSyncing = false,
  onImportInvoiceToOrders,
  onPayInvoiceViaBank,
  onAddManualFacturX,
  onUpdateConnectorConfig
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'connectors' | 'upload' | 'audit'>('invoices');
  const [selectedVaultFilter, setSelectedVaultFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<ElectronicInvoice | null>(null);

  // Manual drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeConnectors = Array.isArray(vaultConnectors) ? vaultConnectors : [];
  const safeLogs = Array.isArray(syncLogs) ? syncLogs : [];

  // Filtered invoices
  const filteredInvoices = safeInvoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierSiren.includes(searchTerm);
    const matchesVault = selectedVaultFilter === 'all' || inv.vaultSource === selectedVaultFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesVault && matchesStatus;
  });

  // Totals & KPI metrics
  const totalAmountTtc = safeInvoices.reduce((sum, inv) => sum + (inv.totalTtc || 0), 0);
  const totalRfaBonus = safeInvoices.reduce((sum, inv) => sum + (inv.rfaBonus || 0), 0);
  const discrepancyInvoices = safeInvoices.filter(inv => inv.hasDiscrepancy || inv.status === 'ecart_prix');
  const syCegedimConnector = safeConnectors.find(c => c.id === 'cegedim_sy');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onAddManualFacturX(file);
      setUploadSuccessMessage(`Fichier Factur-X "${file.name}" importé et validé avec succès.`);
      setTimeout(() => setUploadSuccessMessage(null), 4000);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onAddManualFacturX(file);
      setUploadSuccessMessage(`Fichier Factur-X "${file.name}" importé et validé avec succès.`);
      setTimeout(() => setUploadSuccessMessage(null), 4000);
    }
  };

  const handleExportInvoicesCsv = () => {
    const data = filteredInvoices.map(inv => ({
      'N° Facture': inv.invoiceNumber,
      'Source Coffre-Fort': inv.vaultSourceName,
      'Fournisseur': inv.supplierName,
      'SIREN': inv.supplierSiren,
      'Date Émission': inv.issueDate,
      'Date Échéance': inv.dueDate,
      'Montant HT': inv.totalHt,
      'Montant TVA': inv.totalTva,
      'Montant TTC': inv.totalTtc,
      'RFA / Escompte': inv.rfaBonus,
      'Profil Factur-X': inv.facturXProfile,
      'Statut Rapprochement': inv.status,
      'Signature Électronique': inv.electronicSignatureValid ? 'Certifiée eIDAS' : 'Non vérifiée'
    }));
    exportToCsv(data, 'factures_electroniques_sy_cegedim');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white font-bold shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Coffres-Forts Factures Électroniques & Factur-X
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  SY by Cegedim PDP #0023
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Collecte automatisée B2B / EDI PharmaML, rapprochement automatique commandes & contrôle TVA DGFIP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onSyncVault('cegedim_sy')}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisation en cours...' : 'Synchroniser SY by Cegedim'}</span>
            </button>

            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Summary Banner with KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Factures Récupérées</span>
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {invoices.length} factures
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {formatCurrency(totalAmountTtc)} TTC
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>RFA & Escomptes Détectés</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-600 mt-1">
              {formatCurrency(totalRfaBonus)}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              Gains sur remises laboratoires
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Écarts & Litiges Prix</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-base sm:text-lg font-black text-amber-600 mt-1">
              {discrepancyInvoices.length} dossier{discrepancyInvoices.length > 1 ? 's' : ''}
            </div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">
              Contrôle tarifaire automatique
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>État Connecteur SY Cegedim</span>
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connecté & Sécurisé</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">
              Dernière synchro : {syCegedimConnector?.lastSyncDate || 'Aujourd\'hui'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 bg-white border-b border-slate-200 flex space-x-2 sm:space-x-4 overflow-x-auto text-xs font-bold no-scrollbar">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'invoices' 
                ? 'border-emerald-600 text-emerald-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Factures Récupérées ({safeInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('connectors')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'connectors' 
                ? 'border-emerald-600 text-emerald-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Connecteurs & Paramètres PDP ({safeConnectors.filter(c => c.isConnected).length}/{safeConnectors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'upload' 
                ? 'border-emerald-600 text-emerald-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Dépôt Factur-X & Import Manuel</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'audit' 
                ? 'border-emerald-600 text-emerald-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Journal de Synchronisation & Conformité</span>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">

          {/* TAB 1: INVOICES LIST */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Rechercher par N°, labo, SIREN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={selectedVaultFilter}
                    onChange={(e) => setSelectedVaultFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
                  >
                    <option value="all">Tous les coffres-forts</option>
                    <option value="cegedim_sy">SY by Cegedim</option>
                    <option value="chorus_pro">Chorus Pro / PPF</option>
                    <option value="tx2_pharma">TX2 Concept</option>
                    <option value="manual_upload">Imports Manuels</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="nouvelle_recuperee">Nouvelle / À traiter</option>
                    <option value="rapprochee_commande">Rapprochée commande</option>
                    <option value="ecart_prix">Écart de prix / Litige</option>
                    <option value="rapprochee_banque">Rapprochée banque</option>
                    <option value="payee">Payée</option>
                  </select>
                </div>

                <button
                  onClick={handleExportInvoicesCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs self-end sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter Factur-X CSV</span>
                </button>
              </div>

              {/* Table of Invoices */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Fournisseur & Source</th>
                      <th className="py-2.5 px-3">N° Facture</th>
                      <th className="py-2.5 px-3">Profil Factur-X</th>
                      <th className="py-2.5 px-3">Émission / Échéance</th>
                      <th className="py-2.5 px-3 text-right">Montant HT</th>
                      <th className="py-2.5 px-3 text-right">Montant TTC</th>
                      <th className="py-2.5 px-3 text-center">Statut Rapprochement</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          Aucune facture électronique trouvée avec ces filtres.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition group">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{inv.supplierName}</span>
                              {inv.electronicSignatureValid && (
                                <span title="Signature eIDAS Certifiée" className="inline-flex">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium">
                                {inv.vaultSourceName}
                              </span>
                              <span>• SIREN: {inv.supplierSiren}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                              {inv.invoiceNumber}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {inv.linesCount} ligne{inv.linesCount > 1 ? 's' : ''}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              inv.facturXProfile === 'EXTENDED' ? 'bg-purple-100 text-purple-800' :
                              inv.facturXProfile === 'COMFORT' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              Factur-X {inv.facturXProfile}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800">{formatDate(inv.issueDate)}</div>
                            <div className="text-[10px] text-slate-500">Échéance: {formatDate(inv.dueDate)}</div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                            {formatCurrency(inv.totalHt)}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="font-mono font-bold text-slate-900">
                              {formatCurrency(inv.totalTtc)}
                            </div>
                            {inv.rfaBonus > 0 && (
                              <div className="text-[10px] text-emerald-600 font-medium">
                                RFA: +{formatCurrency(inv.rfaBonus)}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {inv.status === 'ecart_prix' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertTriangle className="w-3 h-3" />
                                Écart de Prix
                              </span>
                            ) : inv.status === 'rapprochee_commande' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                Rapprochée Commande
                              </span>
                            ) : inv.status === 'nouvelle_recuperee' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                                <Sparkles className="w-3 h-3" />
                                Nouvelle Récupérée
                              </span>
                            ) : inv.status === 'rapprochee_banque' || inv.status === 'payee' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                                <Check className="w-3 h-3" />
                                Rapprochée Banque
                              </span>
                            ) : null}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedInvoice(inv)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                title="Voir le détail Factur-X et les lignes de produit"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {inv.status === 'nouvelle_recuperee' && (
                                <button
                                  onClick={() => onImportInvoiceToOrders(inv)}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                                  title="Créer ou rapprocher la commande fournisseur"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                  <span>Intégrer</span>
                                </button>
                              )}

                              {inv.paymentStatus !== 'payee' && (
                                <button
                                  onClick={() => onPayInvoiceViaBank(inv)}
                                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition"
                                  title="Payer via Crédit Agricole"
                                >
                                  Payer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: CONNECTORS CONFIGURATION */}
          {activeTab === 'connectors' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">Passerelles Plateformes de Dématérialisation Partenaires (PDP) & EDI</div>
                  <p className="mt-1 text-slate-600 leading-relaxed">
                    PharmaPilot se connecte directement aux coffres-forts électroniques officinaux agréés DGFIP pour récupérer vos factures fournisseurs au standard Factur-X (profils Minimum, Basic, Comfort et Extended avec détail des CIP et lots).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeConnectors.map((connector) => (
                  <div 
                    key={connector.id}
                    className={`p-4 rounded-2xl border transition ${
                      connector.isConnected 
                        ? 'bg-white border-slate-200 shadow-2xs' 
                        : 'bg-slate-50 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${connector.isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <h3 className="font-bold text-sm text-slate-900">{connector.name}</h3>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">{connector.provider}</div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 mt-1">
                          {connector.tag}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={connector.isConnected}
                            onChange={(e) => onUpdateConnectorConfig(connector.id, { isConnected: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {connector.description}
                    </p>

                    {connector.isConnected && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400 block">SIRET Officine configuré :</span>
                            <span className="font-mono font-bold text-slate-800">{connector.sirenOfficine} 00018</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Identifiant PharmaML :</span>
                            <span className="font-mono font-bold text-slate-800">{connector.pharmamlCode || 'Auto-Provisionné'}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                          <div className="text-[10px] text-slate-500">
                            Fréquence d'interrogation : <strong className="text-slate-700">Toutes les {connector.autoSyncInterval}</strong>
                          </div>

                          <button
                            onClick={() => onSyncVault(connector.id)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Tester API & Synchro</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL FACTUR-X DRAG & DROP INGESTION */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-8 rounded-3xl border-2 border-dashed text-center transition flex flex-col items-center justify-center min-h-[220px] ${
                  isDragging 
                    ? 'border-emerald-500 bg-emerald-50/80 scale-[0.99]' 
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <div className="p-3 rounded-2xl bg-white shadow-2xs border border-slate-200 mb-3 text-emerald-600">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">
                  Glissez-déposez vos factures électroniques (Factur-X PDF / XML)
                </h3>
                <p className="text-xs text-slate-500 max-w-md mb-4">
                  Déposez un fichier Factur-X (format hybride PDF contenant le XML structuré DGFIP). L'analyseur extrait automatiquement les totaux HT, la ventilation TVA officine (2.1%, 5.5%, 10%, 20%), les CIP-13 et les numéros de lots.
                </p>

                <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Sélectionner un fichier sur l'ordinateur</span>
                  <input
                    type="file"
                    accept=".pdf,.xml"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadSuccessMessage && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccessMessage}</span>
                </div>
              )}

              {/* Quick simulation buttons */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Simulations de dépôt Factur-X instantané :
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      onAddManualFacturX({ name: 'FAC_SANOFI_OPELLA_20260822_FX.pdf', size: 142000 });
                      setUploadSuccessMessage('Facture Factur-X Sanofi Opella simulée et importée avec succès !');
                      setTimeout(() => setUploadSuccessMessage(null), 4000);
                    }}
                    className="p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 text-left transition group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-emerald-800">
                      📄 Factur-X Sanofi Opella (Doliprane / Magne B6)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      3 342,18 € TTC • Profil Comfort • Remise RFA 3.5%
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onAddManualFacturX({ name: 'FAC_LABO_GILBERT_FX_20260818.pdf', size: 98000 });
                      setUploadSuccessMessage('Facture Factur-X Laboratoires Gilbert simulée et importée avec succès !');
                      setTimeout(() => setUploadSuccessMessage(null), 4000);
                    }}
                    className="p-2.5 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 text-left transition group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-emerald-800">
                      📄 Factur-X Gilbert (Sérum Physiologique & DM)
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      2 268,00 € TTC • Profil Comfort • TVA 20%
                    </div>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AUDIT & SYNC LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Journal des flux de dématérialisation & Piste d'audit fiable (PAF)</span>
                <span className="text-slate-500 font-mono">Conformité DGFIP 2026</span>
              </div>

              <div className="space-y-2">
                {safeLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-white rounded-2xl border border-slate-200 text-xs shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-emerald-500' :
                          log.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <span className="font-bold text-slate-900">
                          {log.connectorId === 'cegedim_sy' ? 'SY by Cegedim (EDI Pharma)' :
                           log.connectorId === 'chorus_pro' ? 'Chorus Pro / PPF' : 'TX2 Concept'}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {log.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Factures traitées : <strong className="text-slate-800">{log.invoicesFetched}</strong></span>
                      <span>Nouvelles : <strong className="text-emerald-700">+{log.newInvoices}</strong></span>
                      <span>Commandes rapprochées : <strong className="text-slate-800">{log.matchedOrders}</strong></span>
                      <span>Montant global : <strong className="font-mono text-slate-800">{formatCurrency(log.totalAmountFetchedTtc)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Invoice Detail Drawer Modal (When clicking on an invoice) */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
              
              {/* Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Détail Factur-X • {selectedInvoice.invoiceNumber}
                    </h3>
                    <div className="text-[11px] text-slate-300">
                      {selectedInvoice.supplierName} • {selectedInvoice.vaultSourceName}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                
                {/* Factur-X Certification Stamp */}
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-emerald-950">
                        Signature Électronique Certifiée eIDAS & PDP
                      </div>
                      <div className="text-[10px] text-emerald-700 font-mono">
                        {selectedInvoice.pdpCertificationId} • {selectedInvoice.signatureTimestamp}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-mono font-bold text-[10px] rounded-md">
                    {selectedInvoice.facturXProfile}
                  </span>
                </div>

                {/* Discrepancy Note if any */}
                {selectedInvoice.hasDiscrepancy && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 text-xs">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Alerte Écart de Facturation Détectée :</span>
                    </div>
                    <p className="mt-1 text-[11px]">{selectedInvoice.discrepancyNote}</p>
                  </div>
                )}

                {/* Main Invoice Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Date d'Émission</span>
                    <span className="font-bold text-slate-900">{formatDate(selectedInvoice.issueDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Date d'Échéance</span>
                    <span className="font-bold text-slate-900">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total HT</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedInvoice.totalHt)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total TTC</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">{formatCurrency(selectedInvoice.totalTtc)}</span>
                  </div>
                </div>

                {/* TVA Breakdown Officine */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                    <Euro className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ventilation TVA Officinale :</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedInvoice.tvaBreakdown.map((tva, i) => (
                      <div key={i} className="p-2 bg-white rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-indigo-700 block">Taux {tva.rate}%</span>
                        <div className="font-mono text-slate-700 text-[11px]">Base: {formatCurrency(tva.baseHt)}</div>
                        <div className="font-mono font-bold text-slate-900 text-[11px]">TVA: {formatCurrency(tva.tvaAmount)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itemized Lines */}
                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lignes de Produits Extraites (Factur-X) :</span>
                    </h4>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {selectedInvoice.items.map((item) => (
                        <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-900">{item.description}</div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                              <span>CIP: {item.cip13}</span>
                              {item.lotNumber && <span>• Lot: {item.lotNumber}</span>}
                              {item.expiryDate && <span>• DLUO: {formatDate(item.expiryDate)}</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-slate-900">
                              {item.quantity} x {formatCurrency(item.unitPriceHt)} HT
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Total: {formatCurrency(item.totalHt)} HT (TVA {item.tvaRate}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Actions Footer */}
              <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(`Téléchargement de l'archive légale Factur-X certifiée : ${selectedInvoice.originalFilename}`);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Factur-X XML/PDF</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedInvoice.status === 'nouvelle_recuperee' && (
                    <button
                      onClick={() => {
                        onImportInvoiceToOrders(selectedInvoice);
                        setSelectedInvoice(null);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Rapprocher & Intégrer au Stock</span>
                    </button>
                  )}

                  {selectedInvoice.paymentStatus !== 'payee' && (
                    <button
                      onClick={() => {
                        onPayInvoiceViaBank(selectedInvoice);
                        setSelectedInvoice(null);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      Régler via Crédit Agricole
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Connecteur certifié SY by Cegedim & EDI PharmaML v2.4 • Conforme Décret Facturation Électronique DGFIP</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            Fermer le Coffre-Fort
          </button>
        </div>

      </div>
    </div>
  );
};
