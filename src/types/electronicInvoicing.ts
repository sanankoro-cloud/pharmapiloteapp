// Types pour le connecteur Coffre-Fort de Factures Électroniques (SY by Cegedim, Factur-X, PDP DGFIP)

export type VaultConnectorId = 'cegedim_sy' | 'chorus_pro' | 'docaposte' | 'tx2_pharma' | 'manual_upload';

export type InvoiceFacturXProfile = 'MINIMUM' | 'BASIC' | 'BASIC_WL' | 'COMFORT' | 'EXTENDED';

export interface InvoiceItemLine {
  id: string;
  cip13: string;
  description: string;
  quantity: number;
  unitPriceHt: number;
  totalHt: number;
  tvaRate: 2.1 | 5.5 | 10.0 | 20.0;
  lotNumber?: string;
  expiryDate?: string;
  discountPct?: number;
  contractPriceVariance?: number; // Ecart de prix par rapport au contrat officine
  matchedProductStockId?: string;
}

export interface ElectronicInvoice {
  id: string;
  invoiceNumber: string;
  originalFilename: string;
  vaultSource: VaultConnectorId;
  vaultSourceName: string;
  supplierName: string;
  supplierSiren: string;
  supplierTvaIntra: string;
  supplierType: 'grossiste' | 'laboratoire_direct' | 'prestataire';
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: 'nouvelle_recuperee' | 'rapprochee_commande' | 'rapprochee_banque' | 'ecart_prix' | 'payee';
  totalHt: number;
  totalTtc: number;
  totalTva: number;
  tvaBreakdown: {
    rate: 2.1 | 5.5 | 10.0 | 20.0;
    baseHt: number;
    tvaAmount: number;
  }[];
  discountAmount: number;
  rfaBonus: number; // Remise de fin d'année / escompte
  facturXProfile: InvoiceFacturXProfile;
  electronicSignatureValid: boolean;
  signatureTimestamp: string;
  pdpCertificationId: string; // Ex: PDP-FR-CEGEDIM-2026-00912
  linesCount: number;
  items: InvoiceItemLine[];
  linkedSupplierOrderId?: string;
  linkedBankTransactionId?: string;
  paymentStatus: 'a_payer' | 'payee' | 'escompte_dispo' | 'en_retard';
  hasDiscrepancy?: boolean;
  discrepancyNote?: string;
  archiveStorageUrl?: string;
}

export interface VaultConnectorConfig {
  id: VaultConnectorId;
  name: string;
  provider: string;
  tag: string;
  description: string;
  isConnected: boolean;
  status: 'active' | 'syncing' | 'error' | 'disconnected';
  lastSyncDate: string;
  invoicesCount: number;
  totalAmountTtc: number;
  sirenOfficine: string;
  pharmamlCode?: string;
  apiEndpoint: string;
  autoSyncEnabled: boolean;
  autoSyncInterval: '1h' | '4h' | '12h' | '24h';
  autoReconcileStock: boolean;
  autoReconcileBank: boolean;
  autoCreateSupplierOrders: boolean;
  eidasSignatureCheck: boolean;
}

export interface VaultSyncLog {
  id: string;
  timestamp: string;
  connectorId: VaultConnectorId;
  invoicesFetched: number;
  newInvoices: number;
  matchedOrders: number;
  totalAmountFetchedTtc: number;
  status: 'success' | 'warning' | 'error';
  message: string;
}
