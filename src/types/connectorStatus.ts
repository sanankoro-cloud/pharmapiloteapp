export type ApiHealthStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

export type ApiProtocolType = 'REST_JSON' | 'SOAP_XML' | 'EDIFACT_AS2' | 'OPEN_BANKING_DSP2' | 'WEBSOCKET_LAN' | 'TLS_FTPS';

export type ConnectorCategory = 'teletransmission' | 'banking' | 'dematerialization' | 'grossiste_edi' | 'lgo_officine' | 'assurance_maladie';

export interface ApiEndpointHealth {
  name: string;
  url: string;
  status: ApiHealthStatus;
  latencyMs: number;
  lastHttpCode: number;
}

export interface ConnectorHealthItem {
  id: string;
  name: string;
  shortCode: string;
  provider: string;
  category: ConnectorCategory;
  categoryLabel: string;
  description: string;
  iconName: string;
  status: ApiHealthStatus;
  uptime30d: number; // e.g. 99.98
  latencyMs: number;
  lastCheckedAt: string;
  endpointUrl: string;
  protocol: ApiProtocolType;
  authType: string;
  certificateExpiry?: string;
  certificateStatus?: 'valid' | 'expiring_soon' | 'expired';
  dailyVolume: {
    label: string;
    value: string;
    successRate: number; // e.g. 100%
  };
  supportedFlows: string[];
  endpoints: ApiEndpointHealth[];
  incidentHistory: {
    date: string;
    title: string;
    impact: string;
    resolvedInMinutes: number;
  }[];
  contingencyPlan: string;
}

export interface ConnectorHealthLog {
  id: string;
  timestamp: string;
  connectorId: string;
  connectorName: string;
  level: 'info' | 'warning' | 'error' | 'success';
  status: ApiHealthStatus;
  httpCode: number;
  latencyMs: number;
  message: string;
}

export interface ConnectorGlobalStats {
  totalConnectors: number;
  operationalCount: number;
  degradedCount: number;
  downCount: number;
  avgLatencyMs: number;
  globalUptime: number;
  lastGlobalCheck: string;
}
