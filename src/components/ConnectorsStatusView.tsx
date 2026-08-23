import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Landmark, 
  Building2, 
  FileCheck, 
  Truck, 
  Cpu, 
  ShieldAlert, 
  Archive, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight, 
  Download, 
  Info, 
  ChevronRight, 
  ExternalLink,
  Lock,
  Server,
  Radio,
  SlidersHorizontal,
  Flame,
  Check,
  RotateCcw
} from 'lucide-react';
import { 
  ConnectorHealthItem, 
  ConnectorHealthLog, 
  ApiHealthStatus, 
  ConnectorCategory 
} from '../types/connectorStatus';

interface ConnectorsStatusViewProps {
  connectors: ConnectorHealthItem[];
  healthLogs: ConnectorHealthLog[];
  onTestConnector: (connectorId: string) => void;
  onTestAllConnectors: () => void;
  onSimulateOutage: (connectorId: string) => void;
  onRestoreConnector: (connectorId: string) => void;
  onOpenResopharmaModal?: () => void;
  onOpenElectronicInvoicingModal?: () => void;
  onNavigateToBank?: () => void;
  isPingingAll?: boolean;
}

export const ConnectorsStatusView: React.FC<ConnectorsStatusViewProps> = ({
  connectors,
  healthLogs,
  onTestConnector,
  onTestAllConnectors,
  onSimulateOutage,
  onRestoreConnector,
  onOpenResopharmaModal,
  onOpenElectronicInvoicingModal,
  onNavigateToBank,
  isPingingAll = false
}) => {
  const [selectedConnector, setSelectedConnector] = useState<ConnectorHealthItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ApiHealthStatus>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | ConnectorCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePingingId, setActivePingingId] = useState<string | null>(null);
  const [autoPingEnabled, setAutoPingEnabled] = useState(true);
  const [lastAutoCheckTime, setLastAutoCheckTime] = useState<string>('À l\'instant');
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Auto-refresh pulse timer (simulated continuous monitoring)
  useEffect(() => {
    if (!autoPingEnabled) return;
    const interval = setInterval(() => {
      const now = new Date();
      setLastAutoCheckTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 30000);
    return () => clearInterval(interval);
  }, [autoPingEnabled]);

  // Handle single test ping with visual feedback
  const handleSinglePing = (id: string) => {
    setActivePingingId(id);
    setTimeout(() => {
      onTestConnector(id);
      setActivePingingId(null);
    }, 600);
  };

  // Helper to render correct icon
  const renderConnectorIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Network':
        return <Network className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'FileCheck':
        return <FileCheck className={className} />;
      case 'Truck':
        return <Truck className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'Archive':
        return <Archive className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  // Status visual attributes
  const getStatusBadge = (status: ApiHealthStatus) => {
    switch (status) {
      case 'operational':
        return {
          label: 'Opérationnel',
          bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          badgeText: 'text-emerald-700 dark:text-emerald-400',
          icon: CheckCircle2
        };
      case 'degraded':
        return {
          label: 'Latence Dégradée',
          bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          badgeText: 'text-amber-700 dark:text-amber-400',
          icon: AlertTriangle
        };
      case 'down':
        return {
          label: 'Panne de Liaison',
          bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
          badgeText: 'text-rose-700 dark:text-rose-400',
          icon: XCircle
        };
      case 'maintenance':
        return {
          label: 'Maintenance',
          bg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-500',
          badgeText: 'text-indigo-700 dark:text-indigo-400',
          icon: Clock
        };
    }
  };

  // Filter connectors
  const filteredConnectors = connectors.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.provider.toLowerCase().includes(q) ||
        c.shortCode.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.endpointUrl.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate statistics
  const totalCount = connectors.length;
  const operationalCount = connectors.filter(c => c.status === 'operational').length;
  const degradedCount = connectors.filter(c => c.status === 'degraded').length;
  const downCount = connectors.filter(c => c.status === 'down').length;
  const avgLatency = Math.round(connectors.reduce((acc, c) => acc + c.latencyMs, 0) / (totalCount || 1));
  const avgUptime = (connectors.reduce((acc, c) => acc + c.uptime30d, 0) / (totalCount || 1)).toFixed(2);

  const isAllHealthy = downCount === 0 && degradedCount === 0;

  // Export SLA Availability Certificate
  const handleExportSlaReport = () => {
    const reportDate = new Date().toLocaleDateString('fr-FR');
    const content = `RAPPORT DE DISPONIBILITÉ SLA & SANTÉ DES CONNECTEURS API
SELARL Pharmacie de l'Épau (Le Mans) - SIREN : 912 213 980
Date d'édition : ${reportDate}

RÉSUMÉ GLOBAL DU SYSTÈME D'INFORMATION :
- Nombre total de connecteurs interfacés : ${totalCount}
- Connecteurs opérationnels : ${operationalCount} / ${totalCount} (Taux de disponibilité 30j : ${avgUptime}%)
- Connecteurs dégradés : ${degradedCount}
- Connecteurs en panne : ${downCount}
- Latence moyenne réseau : ${avgLatency} ms

DÉTAIL PAR CONNECTEUR OFFINE :
${connectors.map(c => `
[${c.status.toUpperCase()}] ${c.name} (${c.provider})
- Code : ${c.shortCode} | Catégorie : ${c.categoryLabel}
- Endpoint : ${c.endpointUrl} | Protocole : ${c.protocol}
- Uptime 30 jours : ${c.uptime30d}% | Latence actuelle : ${c.latencyMs} ms
- Authentification : ${c.authType}
- Volume : ${c.dailyVolume.label} (${c.dailyVolume.value})
- Plan de secours : ${c.contingencyPlan}
`).join('\n')}

Certifié conforme pour transmission CPAM Sarthe 721, ARS Pays de la Loire et Commissaire aux Comptes.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SLA_Sante_Connecteurs_Pharmacie_Epau_${reportDate.replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero & System Health Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-sm ${
        downCount > 0 
          ? 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-100'
          : degradedCount > 0
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-100'
          : 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-900/5 border-emerald-500/30 text-slate-900 dark:text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  downCount > 0 ? 'bg-rose-500' : degradedCount > 0 ? 'bg-amber-500' : 'bg-emerald-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  downCount > 0 ? 'bg-rose-600' : degradedCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {downCount > 0 
                  ? `Incident Détecté (${downCount} API en panne)`
                  : degradedCount > 0 
                  ? `Attention : ${degradedCount} API avec latence dégradée`
                  : 'Tous les Connecteurs & API sont 100% Opérationnels'}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isAllHealthy 
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' 
                  : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
              }`}>
                {isAllHealthy ? 'SLA 99.9% Conforme' : 'Plan de secours actif'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Supervision en temps réel des liaisons critiques de l'officine : 
              <strong className="text-slate-900 dark:text-white"> Resopharma (Télétransmission & NOEMIE)</strong>, 
              <strong className="text-slate-900 dark:text-white"> Crédit Agricole (Open Banking DSP2 & LCR)</strong>, 
              <strong className="text-slate-900 dark:text-white"> Cegedim SY & Factur-X PDP</strong>, 
              <strong className="text-slate-900 dark:text-white"> Chorus Pro / PPF</strong>, 
              <strong className="text-slate-900 dark:text-white"> TX2 Concept</strong> et 
              <strong className="text-slate-900 dark:text-white"> WinPharma LAN</strong>.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onTestAllConnectors}
              disabled={isPingingAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPingingAll ? 'animate-spin text-emerald-400 dark:text-white' : ''}`} />
              <span>{isPingingAll ? 'Ping global en cours...' : 'Tester Tout (Ping Global)'}</span>
            </button>

            <button
              onClick={handleExportSlaReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition"
              title="Exporter le rapport officiel de disponibilité SLA"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Certificat SLA</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Statut Global</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {operationalCount} / {totalCount} <span className="text-xs font-normal text-slate-500">actifs</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Latence Moyenne</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {avgLatency} <span className="text-xs font-normal text-slate-500">ms</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Disponibilité 30j</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {avgUptime}%
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xs">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>Cycle Sonde</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">30s</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1 truncate">
              {lastAutoCheckTime}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une API (Resopharma, Crédit Agricole, SY, Chorus...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtrer :
          </span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'all'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tous ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('operational')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterStatus === 'operational'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Opérationnel ({operationalCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('degraded')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterStatus === 'degraded'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Dégradé ({degradedCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('down')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filterStatus === 'down'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>En panne ({downCount})</span>
          </button>
        </div>
      </div>

      {/* Grid of Connectors Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {filteredConnectors.map(connector => {
          const statusConfig = getStatusBadge(connector.status);
          const StatusIcon = statusConfig.icon;
          const isPinging = activePingingId === connector.id || isPingingAll;

          return (
            <div
              key={connector.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
                connector.status === 'down'
                  ? 'border-rose-500 ring-2 ring-rose-500/20'
                  : connector.status === 'degraded'
                  ? 'border-amber-500 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      connector.status === 'down'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : connector.status === 'degraded'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {renderConnectorIcon(connector.iconName, "w-6 h-6")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {connector.name}
                        </h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {connector.shortCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {connector.provider}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shrink-0 ${statusConfig.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${statusConfig.dot} ${connector.status === 'operational' ? 'animate-pulse' : ''}`} />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {connector.description}
                </p>

                {/* Technical Indicators Strip */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Latence</span>
                    <span className={`font-bold ${
                      connector.latencyMs > 500 ? 'text-rose-500' : connector.latencyMs > 250 ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {connector.latencyMs} ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Disponibilité 30j</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {connector.uptime30d}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Protocole</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block" title={connector.protocol}>
                      {connector.protocol.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Endpoints micro-list */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Points de terminaison surveillés :</span>
                    <span className="text-[10px] text-slate-400">{connector.endpoints.length} endpoints</span>
                  </span>
                  <div className="space-y-1">
                    {connector.endpoints.map((ep, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ep.status === 'down' ? 'bg-rose-500' : ep.status === 'degraded' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{ep.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400">{ep.latencyMs}ms</span>
                          <span className="text-[10px] font-bold px-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            HTTP {ep.lastHttpCode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Certificate / Auth info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{connector.authType}</span>
                  </div>
                  {connector.certificateExpiry && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                      Certificat OK
                    </span>
                  )}
                </div>

                {/* Contingency / Emergency Plan if DOWN */}
                {connector.status === 'down' && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs space-y-1 animate-fade-in">
                    <div className="font-bold flex items-center gap-1 text-rose-700 dark:text-rose-300">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Procédure de Secours Immédiate :</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {connector.contingencyPlan}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSinglePing(connector.id)}
                    disabled={isPinging}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95 disabled:opacity-50"
                    title="Envoyer un paquet ICMP/HTTP de test de santé"
                  >
                    <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin text-emerald-500' : ''}`} />
                    <span>{isPinging ? 'Test...' : 'Ping Santé'}</span>
                  </button>

                  {/* Outage Simulation / Restore button */}
                  {connector.status === 'down' ? (
                    <button
                      onClick={() => onRestoreConnector(connector.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xs transition"
                      title="Rétablir la connexion normale"
                    >
                      <Check className="w-3 h-3" />
                      <span>Rétablir</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSimulateOutage(connector.id)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-medium transition"
                      title="Simuler une panne réseau pour tester les alertes et plans de secours"
                    >
                      <Flame className="w-3 h-3" />
                      <span>Simuler Panne</span>
                    </button>
                  )}
                </div>

                {/* Specific direct module launcher */}
                <div className="flex items-center gap-1">
                  {connector.id === 'resopharma' && onOpenResopharmaModal && (
                    <button
                      onClick={onOpenResopharmaModal}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 text-xs font-bold transition"
                    >
                      <span>Ouvrir NOEMIE</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}

                  {connector.id === 'cegedim_sy' && onOpenElectronicInvoicingModal && (
                    <button
                      onClick={onOpenElectronicInvoicingModal}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition"
                    >
                      <span>Coffre SY</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}

                  {connector.id === 'credit_agricole' && onNavigateToBank && (
                    <button
                      onClick={onNavigateToBank}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition"
                    >
                      <span>Banque CA</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedConnector(connector)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    title="Voir les détails complets, historique d'incidents et flux"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Health Event Log & Incident Feed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Journal d'Audit des Événements Réseau & Sondes de Santé API
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {healthLogs.length} événements enregistrés
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Horodatage</th>
                <th className="py-2.5 px-3">Connecteur API</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3">Latence</th>
                <th className="py-2.5 px-3">Code HTTP</th>
                <th className="py-2.5 px-3">Détail du message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {healthLogs.slice(0, 8).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                    {log.connectorName}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'operational'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : log.status === 'degraded'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.status === 'operational' ? 'bg-emerald-500' : log.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                    {log.latencyMs} ms
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                    HTTP {log.httpCode}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-md truncate">
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Connector Detail Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-slate-900 dark:text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {renderConnectorIcon(selectedConnector.iconName, "w-7 h-7")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedConnector.name}
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {selectedConnector.shortCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedConnector.provider} • {selectedConnector.categoryLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-slate-400">
                Spécifications Techniques & Sécurité
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">URL Point d'Entrée API</span>
                  <span className="font-mono text-slate-900 dark:text-white break-all">{selectedConnector.endpointUrl}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Protocole & Format</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedConnector.protocol}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Authentification & Signature</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedConnector.authType}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Débit Journalier</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedConnector.dailyVolume.value}</span>
                </div>
              </div>
            </div>

            {/* Supported Flows */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-slate-400">
                Flux Métiers Supportés
              </h3>
              <ul className="space-y-1.5">
                {selectedConnector.supportedFlows.map((flow, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{flow}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contingency Plan */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Plan de Continuité d'Activité (PCA) Officine :</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                {selectedConnector.contingencyPlan}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  handleSinglePing(selectedConnector.id);
                  setSelectedConnector(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Tester la liaison maintenant (Ping)
              </button>
              <button
                onClick={() => setSelectedConnector(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
