import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  INITIAL_SUMMARY, 
  MOCK_PRODUCTS, 
  MOCK_SUPPLIERS_ORDERS, 
  MOCK_EXPENSES, 
  MOCK_BANK_TRANSACTIONS, 
  MOCK_COMPETITORS, 
  MOCK_COMPETITOR_PRICES, 
  MOCK_DAILY_STATS, 
  MOCK_MONTHLY_REPORTS, 
  MOCK_NOTIFICATIONS 
} from './data/mockPharmacyData';
import { 
  INITIAL_VAULT_CONNECTORS, 
  MOCK_ELECTRONIC_INVOICES, 
  MOCK_VAULT_SYNC_LOGS 
} from './data/mockElectronicInvoices';
import { MOCK_LCR_STATEMENTS } from './data/mockLcrData';
import { 
  INITIAL_RESOPHARMA_CONFIG, 
  MOCK_RESOPHARMA_BORDEREAUX, 
  MOCK_RESOPHARMA_SYNC_LOGS 
} from './data/mockResopharmaData';
import { 
  MOCK_AUDIT_LOGS, 
  DEFAULT_OPERATORS 
} from './data/mockAuditLogs';
import { 
  INITIAL_CONNECTORS_HEALTH, 
  INITIAL_HEALTH_LOGS 
} from './data/mockConnectorHealth';
import { 
  ProductStock, 
  SupplierOrder, 
  ExpenseItem, 
  BankTransaction, 
  CompetitorPriceComparison, 
  PushNotificationAlert, 
  PharmacyFinancialSummary 
} from './types/pharmacy';
import { 
  ElectronicInvoice, 
  VaultConnectorConfig, 
  VaultSyncLog, 
  VaultConnectorId 
} from './types/electronicInvoicing';
import { LcrStatement } from './types/lcr';
import { 
  ResopharmaBordereau, 
  ResopharmaConnectorConfig, 
  ResopharmaSyncLog 
} from './types/resopharma';
import { 
  AuditLogEntry, 
  OperatorProfile,
  AuditOperatorRole
} from './types/auditLog';
import { 
  ConnectorHealthItem, 
  ConnectorHealthLog 
} from './types/connectorStatus';

import { Navbar } from './components/Navbar';
import { NavigationTabs } from './components/NavigationTabs';
import { MobileNav } from './components/MobileNav';
import { DashboardOverview } from './components/DashboardOverview';
import { SuppliersOrdersView } from './components/SuppliersOrdersView';
import { LcrControlView } from './components/LcrControlView';
import { StockExpiryView } from './components/StockExpiryView';
import { TreasuryBankReconciliationView } from './components/TreasuryBankReconciliationView';
import { ConnectorsStatusView } from './components/ConnectorsStatusView';
import { AuditTrailView } from './components/AuditTrailView';
import { RecurringExpensesView } from './components/RecurringExpensesView';
import { AnnualTrendsSalesView } from './components/AnnualTrendsSalesView';
import { CompetitorPriceRadarView } from './components/CompetitorPriceRadarView';
import { AccountingReportsView } from './components/AccountingReportsView';
import { PushNotificationModal } from './components/PushNotificationModal';
import { MobileMoreMenuModal } from './components/MobileMoreMenuModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ElectronicInvoicingVaultModal } from './components/ElectronicInvoicingVaultModal';
import { ResopharmaConnectorModal } from './components/ResopharmaConnectorModal';

export default function App() {
  // App state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [summary, setSummary] = useState<PharmacyFinancialSummary>(INITIAL_SUMMARY);
  const [products, setProducts] = useState<ProductStock[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<SupplierOrder[]>(MOCK_SUPPLIERS_ORDERS);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(MOCK_EXPENSES);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(MOCK_BANK_TRANSACTIONS);
  const [competitorPrices, setCompetitorPrices] = useState<CompetitorPriceComparison[]>(MOCK_COMPETITOR_PRICES);
  const [notifications, setNotifications] = useState<PushNotificationAlert[]>(MOCK_NOTIFICATIONS);
  
  // Connectors Health & API Status State (Resopharma, CA, SY PDP, Chorus Pro...)
  const [connectorsHealth, setConnectorsHealth] = useState<ConnectorHealthItem[]>(INITIAL_CONNECTORS_HEALTH);
  const [connectorHealthLogs, setConnectorHealthLogs] = useState<ConnectorHealthLog[]>(INITIAL_HEALTH_LOGS);
  const [isPingingAllConnectors, setIsPingingAllConnectors] = useState(false);

  // Audit Logs (Journal d'audit & contrôle interne des actions)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [availableOperators, setAvailableOperators] = useState<OperatorProfile[]>(DEFAULT_OPERATORS);
  const [currentOperator, setCurrentOperator] = useState<OperatorProfile>(DEFAULT_OPERATORS[0]);

  // LCR (Lettres de Change Relevé) & Traites state
  const [lcrStatements, setLcrStatements] = useState<LcrStatement[]>(MOCK_LCR_STATEMENTS);

  // Electronic Invoicing Vault state (SY by Cegedim & Factur-X)
  const [electronicInvoices, setElectronicInvoices] = useState<ElectronicInvoice[]>(MOCK_ELECTRONIC_INVOICES);
  const [vaultConnectors, setVaultConnectors] = useState<VaultConnectorConfig[]>(INITIAL_VAULT_CONNECTORS);
  const [vaultSyncLogs, setVaultSyncLogs] = useState<VaultSyncLog[]>(MOCK_VAULT_SYNC_LOGS);
  const [isElectronicInvoicingModalOpen, setIsElectronicInvoicingModalOpen] = useState(false);
  const [isSyncingVault, setIsSyncingVault] = useState(false);

  // RESOPHARMA Connector State (Télétransmission SESAM-Vitale, Retours NOEMIE & Mutuelles DRE)
  const [resopharmaConfig, setResopharmaConfig] = useState<ResopharmaConnectorConfig>(INITIAL_RESOPHARMA_CONFIG);
  const [resopharmaBordereaux, setResopharmaBordereaux] = useState<ResopharmaBordereau[]>(MOCK_RESOPHARMA_BORDEREAUX);
  const [resopharmaSyncLogs, setResopharmaSyncLogs] = useState<ResopharmaSyncLog[]>(MOCK_RESOPHARMA_SYNC_LOGS);
  const [isResopharmaModalOpen, setIsResopharmaModalOpen] = useState(false);
  const [isSyncingResopharma, setIsSyncingResopharma] = useState(false);

  // UI modals & indicators
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isSyncingBank, setIsSyncingBank] = useState(false);
  const [lastBankSyncTime, setLastBankSyncTime] = useState('22/08/2026 à 15:30');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark Mode State (Persisted in localStorage, optimized for inventory & late-night management)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pharmacy_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pharmacy_dark_mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pharmacy_dark_mode', 'false');
      }
    } catch {
      // Ignore localStorage errors if sandboxed
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      showToast(next ? "Mode Nuit activé (Confort visuel pour inventaires & garde)" : "Mode Jour activé");
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to log user action in real-time
  const logUserAction = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'operatorName' | 'operatorRole'> & { operatorName?: string; operatorRole?: AuditOperatorRole }) => {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      operatorName: entry.operatorName || currentOperator.name,
      operatorRole: entry.operatorRole || currentOperator.role,
      workstation: entry.workstation || currentOperator.workstation,
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Barcode scan stock update
  const handleUpdateProductStock = (productId: string, newQty: number, lotNumber?: string, expiryDate?: string) => {
    const targetProduct = products.find(p => p.id === productId);
    const oldQty = targetProduct ? targetProduct.stockQty : 0;
    const diffQty = newQty - oldQty;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockQty: newQty,
          lotNumber: lotNumber || p.lotNumber,
          expiryDate: expiryDate || p.expiryDate,
          status: newQty <= p.minThreshold ? 'low_stock' : p.daysUntilExpiry <= 30 ? 'near_expiry' : 'optimal'
        };
      }
      return p;
    }));

    if (targetProduct) {
      logUserAction({
        domain: 'stocks',
        actionType: 'ajustement_quantite',
        severity: diffQty < 0 ? 'warning' : 'info',
        details: `Mise à jour stock via scanner Datamatrix pour "${targetProduct.name}" (CIP: ${targetProduct.cip})`,
        targetEntity: targetProduct.name,
        previousValue: `${oldQty} boîte(s) (Lot: ${targetProduct.lotNumber})`,
        newValue: `${newQty} boîte(s) (Lot: ${lotNumber || targetProduct.lotNumber})`,
        financialImpact: diffQty * targetProduct.pump,
        reason: 'Inventaire / Réception Datamatrix au comptoir'
      });
    }
  };

  // Barcode scan add new product
  const handleAddNewProduct = (newProdData: Omit<ProductStock, 'id'>) => {
    const newProd: ProductStock = {
      id: `prod-${Date.now()}`,
      ...newProdData
    };
    setProducts(prev => [newProd, ...prev]);

    logUserAction({
      domain: 'stocks',
      actionType: 'ajout_produit',
      severity: 'info',
      details: `Création de référence au stock : "${newProd.name}" (CIP: ${newProd.cip})`,
      targetEntity: newProd.name,
      previousValue: 'Inexistant',
      newValue: `${newProd.stockQty} boîtes en stock @ ${newProd.pump.toFixed(2)} € HT (PUMP)`,
      financialImpact: newProd.stockQty * newProd.pump,
      reason: 'Création fiche produit / Réception nouvelle référence'
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Produit ${newProd.name} (CIP: ${newProd.cip}) ajouté au stock avec succès.`);
  };

  // Electronic Invoicing Vault Live Sync (SY by Cegedim, Factur-X PDP, Chorus Pro)
  const handleSyncVault = (connectorId: VaultConnectorId = 'cegedim_sy') => {
    setIsSyncingVault(true);
    setTimeout(() => {
      setIsSyncingVault(false);
      const syncTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      // Update connector last sync
      setVaultConnectors(prev => prev.map(c => {
        if (c.id === connectorId || connectorId === 'cegedim_sy') {
          return {
            ...c,
            lastSyncDate: `22/08/2026 à ${syncTime}`,
            invoicesCount: c.invoicesCount + 1,
            totalAmountTtc: c.totalAmountTtc + 2450.00
          };
        }
        return c;
      }));

      // Add a fresh fetched electronic invoice if not already added
      const newInvoiceNumber = `FAC-SY-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const newFetchedInvoice: ElectronicInvoice = {
        id: `inv-sy-${Date.now()}`,
        invoiceNumber: newInvoiceNumber,
        originalFilename: `FAC_PIERRE_FABRE_DERMO_${newInvoiceNumber}.pdf`,
        vaultSource: 'cegedim_sy',
        vaultSourceName: 'SY by Cegedim',
        supplierName: 'Pierre Fabre Dermo-Cosmétique (Direct)',
        supplierSiren: '326 123 789',
        supplierTvaIntra: 'FR90326123789',
        supplierType: 'laboratoire_direct',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '2026-09-30',
        status: 'nouvelle_recuperee',
        totalHt: 2041.67,
        totalTtc: 2450.00,
        totalTva: 408.33,
        tvaBreakdown: [
          { rate: 20.0, baseHt: 2041.67, tvaAmount: 408.33 }
        ],
        discountAmount: 306.25,
        rfaBonus: 204.17,
        facturXProfile: 'COMFORT',
        electronicSignatureValid: true,
        signatureTimestamp: new Date().toISOString(),
        pdpCertificationId: `PDP-CEGEDIM-2026-FR-${Math.floor(10000 + Math.random() * 90000)}`,
        linesCount: 35,
        paymentStatus: 'escompte_dispo',
        items: [
          {
            id: `line-${Date.now()}-1`,
            cip13: '3401345678901',
            description: 'Avène Eau Thermale Spray 300ml',
            quantity: 48,
            unitPriceHt: 5.80,
            totalHt: 278.40,
            tvaRate: 20.0,
            lotNumber: `LOT-AVN-${Math.floor(100 + Math.random() * 900)}`,
            expiryDate: '2028-06-30',
            discountPct: 15.0
          }
        ]
      };

      setElectronicInvoices(prev => [newFetchedInvoice, ...prev]);

      // Add log
      const newLog: VaultSyncLog = {
        id: `log-${Date.now()}`,
        timestamp: `22/08/2026 ${syncTime}:00`,
        connectorId,
        invoicesFetched: 1,
        newInvoices: 1,
        matchedOrders: 0,
        totalAmountFetchedTtc: 2450.00,
        status: 'success',
        message: `Interrogation du coffre-fort SY by Cegedim : 1 nouvelle facture Factur-X récupérée (${newFetchedInvoice.supplierName} - 2 450,00 € TTC).`
      };
      setVaultSyncLogs(prev => [newLog, ...prev]);

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      showToast(`Synchronisation SY by Cegedim réussie : Facture ${newFetchedInvoice.invoiceNumber} importée.`);
    }, 1200);
  };

  // Import / Reconcile Electronic Invoice into Supplier Orders
  const handleImportInvoiceToOrders = (invoice: ElectronicInvoice) => {
    // 1. Create or match supplier order
    const existingOrder = orders.find(o => o.invoiceNumber === invoice.invoiceNumber);
    if (!existingOrder) {
      const newOrder: SupplierOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `CMD-SY-${invoice.invoiceNumber.replace(/[^0-9]/g, '').slice(-4) || '901'}`,
        supplierName: invoice.supplierName,
        supplierType: invoice.supplierType,
        orderDate: invoice.issueDate,
        deliveryDate: `Réceptionné via Factur-X`,
        status: 'receptionnee',
        itemsCount: invoice.linesCount,
        totalHt: invoice.totalHt,
        totalTtc: invoice.totalTtc,
        discountPercentage: invoice.discountAmount ? (invoice.discountAmount / invoice.totalHt) * 100 : 2.5,
        commercialBonus: invoice.rfaBonus,
        invoiceNumber: invoice.invoiceNumber,
        paymentDueDate: invoice.dueDate,
        paymentStatus: invoice.paymentStatus
      };
      setOrders(prev => [newOrder, ...prev]);
      setSummary(prev => ({
        ...prev,
        pendingSupplierPayables: prev.pendingSupplierPayables + invoice.totalTtc
      }));
    }

    // 2. Mark invoice as matched
    setElectronicInvoices(prev => prev.map(inv => {
      if (inv.id === invoice.id) {
        return {
          ...inv,
          status: 'rapprochee_commande',
          linkedSupplierOrderId: existingOrder ? existingOrder.id : `ord-${Date.now()}`
        };
      }
      return inv;
    }));

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    showToast(`Facture ${invoice.invoiceNumber} intégrée au carnet de commandes et au stock.`);
  };

  // Pay Electronic Invoice via Bank (SEPA Crédit Agricole)
  const handlePayInvoiceViaBank = (invoice: ElectronicInvoice) => {
    // Update invoice status
    setElectronicInvoices(prev => prev.map(inv => {
      if (inv.id === invoice.id) {
        return { ...inv, status: 'payee', paymentStatus: 'payee' };
      }
      return inv;
    }));

    // Update order if matched
    if (invoice.linkedSupplierOrderId || invoice.invoiceNumber) {
      setOrders(prev => prev.map(o => {
        if (o.invoiceNumber === invoice.invoiceNumber || o.id === invoice.linkedSupplierOrderId) {
          return { ...o, paymentStatus: 'payee' };
        }
        return o;
      }));
    }

    // Update summary bank balance
    setSummary(prev => ({
      ...prev,
      currentBankBalance: prev.currentBankBalance - invoice.totalTtc,
      pendingSupplierPayables: Math.max(0, prev.pendingSupplierPayables - invoice.totalTtc)
    }));

    // Add bank transaction
    const newTx: BankTransaction = {
      id: `tx-pay-sy-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      label: `VIR SEPA ${invoice.supplierName.toUpperCase()} FACTURE ${invoice.invoiceNumber} (VIA SY BY CEGEDIM)`,
      type: 'debit',
      amount: invoice.totalTtc,
      category: 'fournisseur',
      status: 'rapproche',
      matchedInvoice: invoice.invoiceNumber,
      bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01'
    };
    setBankTransactions(prev => [newTx, ...prev]);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Paiement de ${invoice.totalTtc.toFixed(2)} € exécuté pour ${invoice.supplierName} via Crédit Agricole.`);
  };

  // Add manual Factur-X / PDF upload
  const handleAddManualFacturX = (file: File | { name: string; size: number }) => {
    const filename = file.name;
    const isGilbert = filename.toLowerCase().includes('gilbert');
    const isSanofi = filename.toLowerCase().includes('sanofi');
    
    const supplier = isGilbert ? 'Laboratoires Gilbert (Direct)' :
                     isSanofi ? 'Opella Healthcare France (Sanofi)' :
                     'Grossiste / Laboratoire Pharma';
    const amountHt = isGilbert ? 1890.00 : isSanofi ? 3180.00 : 1540.00;
    const amountTtc = isGilbert ? 2268.00 : isSanofi ? 3342.18 : 1620.00;
    const invNumber = `FAC-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: ElectronicInvoice = {
      id: `inv-manual-${Date.now()}`,
      invoiceNumber: invNumber,
      originalFilename: filename,
      vaultSource: 'manual_upload',
      vaultSourceName: 'Dépôt Manuel Factur-X',
      supplierName: supplier,
      supplierSiren: '389 456 123',
      supplierTvaIntra: 'FR12389456123',
      supplierType: 'laboratoire_direct',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-09-30',
      status: 'nouvelle_recuperee',
      totalHt: amountHt,
      totalTtc: amountTtc,
      totalTva: amountTtc - amountHt,
      tvaBreakdown: [
        { rate: 2.1, baseHt: amountHt * 0.7, tvaAmount: amountHt * 0.7 * 0.021 },
        { rate: 20.0, baseHt: amountHt * 0.3, tvaAmount: amountHt * 0.3 * 0.20 }
      ],
      discountAmount: amountHt * 0.05,
      rfaBonus: amountHt * 0.03,
      facturXProfile: 'COMFORT',
      electronicSignatureValid: true,
      signatureTimestamp: new Date().toISOString(),
      pdpCertificationId: `PAF-MANUAL-UPLOAD-${Math.floor(1000 + Math.random() * 9000)}`,
      linesCount: 18,
      paymentStatus: 'a_payer',
      items: []
    };

    setElectronicInvoices(prev => [newInvoice, ...prev]);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Factur-X "${filename}" analysé avec succès : ${amountTtc.toFixed(2)} € TTC.`);
  };

  // Update connector settings
  const handleUpdateConnectorConfig = (connectorId: VaultConnectorId, updates: Partial<VaultConnectorConfig>) => {
    setVaultConnectors(prev => prev.map(c => c.id === connectorId ? { ...c, ...updates } : c));
    showToast('Configuration du coffre-fort mise à jour.');
  };

  // --- LCR (Lettres de Change Relevé) Handlers ---
  const handleValidateBap = (statementId: string, signedBy: string, notes?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetStmt = lcrStatements.find(s => s.id === statementId);

    setLcrStatements(prev => prev.map(s => {
      if (s.id === statementId) {
        return {
          ...s,
          status: 'bon_a_payer',
          bapSignedBy: signedBy,
          bapDate: todayStr,
          bapNotes: notes || 'BAP accordé après contrôle des factures et récapitulatifs grossiste.'
        };
      }
      return s;
    }));

    if (targetStmt) {
      logUserAction({
        domain: 'lcr_traites',
        actionType: 'validation_bap_lcr',
        severity: 'info',
        details: `Validation Bon à Payer (BAP) sur relevé LCR ${targetStmt.lcrNumber} (${targetStmt.supplierName})`,
        targetEntity: `LCR ${targetStmt.lcrNumber} - ${targetStmt.supplierName}`,
        previousValue: 'Statut : À contrôler',
        newValue: `Statut : Bon à payer (${targetStmt.totalAmountDrawn.toFixed(2)} € TTC)`,
        financialImpact: -targetStmt.totalAmountDrawn,
        reason: notes || 'Contrôle concordances factures et avoirs grossiste validé'
      });
    }

    showToast(`Bon à Payer (BAP) validé pour le relevé LCR ${targetStmt?.lcrNumber || statementId} (${targetStmt?.supplierName || ''}).`);
  };

  const handleDeclareDispute = (statementId: string, reason: string) => {
    const targetStmt = lcrStatements.find(s => s.id === statementId);

    setLcrStatements(prev => prev.map(s => {
      if (s.id === statementId) {
        const existingReasons = s.discrepancyReasons || [];
        return {
          ...s,
          status: 'litige_partiel',
          discrepancyReasons: [...existingReasons, reason]
        };
      }
      return s;
    }));

    if (targetStmt) {
      logUserAction({
        domain: 'lcr_traites',
        actionType: 'mise_en_litige_lcr',
        severity: 'critique',
        details: `Déclaration de litige sur relevé LCR ${targetStmt.lcrNumber} (${targetStmt.supplierName}) : ${reason}`,
        targetEntity: `LCR ${targetStmt.lcrNumber} - ${targetStmt.supplierName}`,
        previousValue: 'Statut : À contrôler',
        newValue: 'Statut : Litige partiel (opposition bancaire demandée)',
        financialImpact: targetStmt.discrepancyAmount || 0,
        reason: reason
      });
    }

    showToast(`Litige déclaré sur la traite LCR ${targetStmt?.supplierName || ''}. Avis d'opposition partielle transmis.`);
  };

  const handleSimulateLcrDebit = (statementId: string) => {
    const target = lcrStatements.find(s => s.id === statementId);
    if (!target) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const txId = `tx-lcr-debit-${Date.now()}`;

    // Update statement state
    setLcrStatements(prev => prev.map(s => {
      if (s.id === statementId) {
        return {
          ...s,
          status: 'regle_debit',
          paidAtDate: todayStr,
          debitTransactionId: txId
        };
      }
      return s;
    }));

    // Deduct from bank balance and supplier payables
    setSummary(prev => ({
      ...prev,
      currentBankBalance: prev.currentBankBalance - target.totalAmountDrawn,
      pendingSupplierPayables: Math.max(0, prev.pendingSupplierPayables - target.totalAmountDrawn)
    }));

    // Add bank transaction for Crédit Agricole
    const newTx: BankTransaction = {
      id: txId,
      date: todayStr,
      label: `PRLV SEPA LCR ${target.supplierName.toUpperCase()} RELEVE ${target.lcrNumber}`,
      type: 'debit',
      amount: target.totalAmountDrawn,
      category: 'fournisseur',
      status: 'rapproche',
      matchedInvoice: target.lcrNumber,
      bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01',
      reconciliationNotes: `Débit LCR automatique vérifié (${target.invoices.length} factures, ${target.creditNotes.length} avoirs)`
    };
    setBankTransactions(prev => [newTx, ...prev]);

    logUserAction({
      domain: 'banque_reconciliation',
      actionType: 'rapprochement_bancaire',
      severity: 'info',
      details: `Débit bancaire LCR exécuté pour ${target.supplierName} (Relevé ${target.lcrNumber})`,
      targetEntity: newTx.label,
      previousValue: 'Relevé LCR en attente de débit',
      newValue: `Débité et lettré : -${target.totalAmountDrawn.toFixed(2)} €`,
      financialImpact: -target.totalAmountDrawn,
      reason: 'Échéance LCR échue & débit SEPA Crédit Agricole rapproché'
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    showToast(`Prélèvement LCR de ${target.totalAmountDrawn.toFixed(2)} € débité avec succès sur le compte Crédit Agricole.`);
  };

  const handleToggleInvoiceVerification = (statementId: string, invoiceId: string) => {
    setLcrStatements(prev => prev.map(s => {
      if (s.id === statementId) {
        const updatedInvoices = s.invoices.map(inv => {
          if (inv.id === invoiceId) {
            return { ...inv, verified: !inv.verified };
          }
          return inv;
        });
        const verifiedCount = updatedInvoices.filter(i => i.verified).length;
        const totalCount = updatedInvoices.length;
        const newScore = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 100;
        return {
          ...s,
          invoices: updatedInvoices,
          reconciliationScore: newScore
        };
      }
      return s;
    }));
  };

  const handleImportStatement = (newStatement: LcrStatement) => {
    setLcrStatements(prev => [newStatement, ...prev]);
    logUserAction({
      domain: 'lcr_traites',
      actionType: 'validation_bap_lcr',
      severity: 'info',
      details: `Import relevé LCR ${newStatement.lcrNumber} pour ${newStatement.supplierName} (${newStatement.totalAmountDrawn.toFixed(2)} €)`,
      targetEntity: `LCR ${newStatement.lcrNumber}`,
      previousValue: 'Non importé',
      newValue: `${newStatement.invoices.length} factures / ${newStatement.creditNotes.length} avoirs`,
      financialImpact: newStatement.totalAmountDrawn,
      reason: 'Réception télétransmission fichier EDI LCR Banque'
    });
    showToast(`Relevé LCR ${newStatement.lcrNumber} (${newStatement.supplierName}) importé.`);
  };

  // 1. Bank sync action (Crédit Agricole Open Banking DSP2)
  const handleSyncBank = () => {
    setIsSyncingBank(true);
    setTimeout(() => {
      setIsSyncingBank(false);
      const newSyncTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setLastBankSyncTime(newSyncTime);
      
      logUserAction({
        domain: 'banque_reconciliation',
        actionType: 'synchronisation_flux',
        severity: 'info',
        details: 'Synchronisation Open Banking DSP2 - Flux Crédit Agricole Pro',
        targetEntity: 'Compte Pro Crédit Agricole',
        previousValue: 'Dernière synchro antérieure',
        newValue: `Flux à jour au ${newSyncTime} (${summary.currentBankBalance.toFixed(2)} €)`,
        financialImpact: 0,
        reason: 'Actualisation automatique API Bancaire DSP2'
      });

      showToast('Synchronisation Crédit Agricole Pro réussie : flux et soldes à jour.');
    }, 1200);
  };

  // 2. Pay supplier order
  const handlePayOrder = (orderId: string) => {
    const orderToPay = orders.find(o => o.id === orderId);
    if (!orderToPay) return;

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'payee' } : o));
    setSummary(prev => ({
      ...prev,
      currentBankBalance: prev.currentBankBalance - orderToPay.totalTtc,
      pendingSupplierPayables: Math.max(0, prev.pendingSupplierPayables - orderToPay.totalTtc)
    }));

    // Add corresponding bank debit transaction
    const newTx: BankTransaction = {
      id: `tx-pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      label: `VIR SEPA ${orderToPay.supplierName.toUpperCase()} FACTURE ${orderToPay.invoiceNumber || 'COMPTANT'}`,
      type: 'debit',
      amount: orderToPay.totalTtc,
      category: 'fournisseur',
      status: 'rapproche',
      matchedInvoice: orderToPay.invoiceNumber || orderToPay.orderNumber,
      bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01'
    };
    setBankTransactions(prev => [newTx, ...prev]);

    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'info',
      details: `Règlement facture fournisseur ${orderToPay.supplierName} (${orderToPay.totalTtc.toFixed(2)} € TTC)`,
      targetEntity: `${orderToPay.supplierName} - ${orderToPay.orderNumber}`,
      previousValue: 'Statut : À payer',
      newValue: 'Statut : Payée (Virement SEPA)',
      financialImpact: -orderToPay.totalTtc,
      reason: 'Règlement à échéance validé'
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Règlement de ${orderToPay.supplierName} (${orderToPay.totalTtc.toFixed(2)} €) validé via Crédit Agricole.`);
  };

  // 3. Create new supplier order
  const handleCreateOrder = (newOrderData: Omit<SupplierOrder, 'id'>) => {
    const newOrder: SupplierOrder = {
      id: `ord-${Date.now()}`,
      ...newOrderData
    };
    setOrders(prev => [newOrder, ...prev]);
    setSummary(prev => ({
      ...prev,
      pendingSupplierPayables: prev.pendingSupplierPayables + newOrder.totalTtc
    }));

    logUserAction({
      domain: 'commandes_achats',
      actionType: 'pointage_facture',
      severity: 'info',
      details: `Création commande d'achat ${newOrder.orderNumber} (${newOrder.supplierName} - ${newOrder.totalTtc.toFixed(2)} €)`,
      targetEntity: `${newOrder.supplierName} - ${newOrder.orderNumber}`,
      previousValue: 'Nouvelle commande',
      newValue: `Montant : ${newOrder.totalTtc.toFixed(2)} € TTC (${newOrder.itemsCount} lignes)`,
      financialImpact: newOrder.totalTtc,
      reason: 'Réapprovisionnement stock officine'
    });

    showToast(`Commande ${newOrder.orderNumber} enregistrée pour ${newOrder.supplierName}.`);
  };

  // 4. Reconcile bank transaction
  const handleReconcileTransaction = (transactionId: string) => {
    const targetTx = bankTransactions.find(tx => tx.id === transactionId);

    setBankTransactions(prev => prev.map(tx => tx.id === transactionId ? { ...tx, status: 'rapproche' } : tx));

    if (targetTx) {
      logUserAction({
        domain: 'banque_reconciliation',
        actionType: 'rapprochement_bancaire',
        severity: 'info',
        details: `Lettrage et rapprochement comptable de l'écriture : "${targetTx.label}"`,
        targetEntity: targetTx.label,
        previousValue: 'Statut : En attente de pointage',
        newValue: 'Statut : Rapproché / Lettré',
        financialImpact: targetTx.type === 'credit' ? targetTx.amount : -targetTx.amount,
        reason: 'Rapprochement bancaire manuel ou semi-automatique'
      });
    }

    showToast('Écriture bancaire lettrée et rapprochée de la comptabilité.');
  };

  // RESOPHARMA Télétransmission & Rapprochement Handlers
  const handleSyncResopharma = () => {
    setIsSyncingResopharma(true);
    setTimeout(() => {
      setIsSyncingResopharma(false);
      const newLog: ResopharmaSyncLog = {
        id: `sync-reso-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        borderauxFetched: 3,
        totalAmountFetched: 1845.20,
        matchedCount: 2,
        rejectedCount: 0,
        status: 'success',
        message: 'Collecte automatique réussie : 2 retours NOEMIE et 1 bordereau DRE mutuelles traités.'
      };
      setResopharmaSyncLogs(prev => [newLog, ...prev]);
      setResopharmaConfig(prev => ({
        ...prev,
        lastSyncDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        totalBorderauxCount: prev.totalBorderauxCount + 3
      }));

      logUserAction({
        domain: 'resopharma',
        actionType: 'synchronisation_flux',
        severity: 'info',
        details: 'Synchronisation concentrateur Resopharma : 3 nouveaux bordereaux (1 845,20 €)',
        targetEntity: 'Télétransmission NOEMIE / DRE',
        previousValue: 'Bordereaux antérieurs',
        newValue: '3 bordereaux collectés et intégrés au pointage',
        financialImpact: 1845.20,
        reason: 'Télécollecte flux SESAM-Vitale'
      });

      showToast('Télétransmission Resopharma synchronisée : bordereaux NOEMIE et DRE à jour.');
    }, 1200);
  };

  const handleReconcileResopharmaBordereau = (bordereauId: string, matchedTransactionId?: string) => {
    const bordereau = resopharmaBordereaux.find(b => b.id === bordereauId);
    if (!bordereau) return;

    // 1. Update bordereau state
    setResopharmaBordereaux(prev => prev.map(b => {
      if (b.id === bordereauId) {
        return {
          ...b,
          status: 'rapproche_total',
          amountPaid: b.amountTeletrans,
          bankReceivedDate: new Date().toISOString().split('T')[0],
          linkedBankTransactionId: matchedTransactionId || `tx-auto-${Date.now()}`,
          bankTransferRef: matchedTransactionId ? `VIR-${matchedTransactionId}` : `VIR-RESO-${b.bordereauNumber}`,
          reconciliationNotes: `Lettré avec virement bancaire (${b.organismeName})`
        };
      }
      return b;
    }));

    // 2. Update existing bank transaction if specified
    let matchedExisting = false;
    if (matchedTransactionId) {
      setBankTransactions(prev => prev.map(tx => {
        if (tx.id === matchedTransactionId) {
          matchedExisting = true;
          return {
            ...tx,
            status: 'rapproche',
            matchedInvoice: `RESO-${bordereau.bordereauNumber}`,
            reconciliationNotes: `Lettrage validé avec bordereau Resopharma (${bordereau.organismeName} - ${bordereau.fseDetails.length} FSE)`
          };
        }
        return tx;
      }));
    }

    // 3. If no existing bank transaction was linked, add a credited bank transaction and adjust summary
    if (!matchedExisting) {
      const newTx: BankTransaction = {
        id: matchedTransactionId || `tx-reso-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        label: `VIR SEPA ${bordereau.organismeName.toUpperCase()} BORD ${bordereau.bordereauNumber}`,
        type: 'credit',
        amount: bordereau.amountTeletrans,
        category: bordereau.fluxType === 'RO_NOEMIE' ? 'cpam_ro' : 'mutuelles_rc',
        status: 'rapproche',
        matchedInvoice: `RESO-${bordereau.bordereauNumber}`,
        bankAccount: 'Crédit Agricole Pro FR76 1820 6001 2345 6789 01',
        reconciliationNotes: `Règlement télétransmission Resopharma (${bordereau.fseDetails.length} FSE pointées)`
      };
      setBankTransactions(prev => [newTx, ...prev]);
      setSummary(prev => ({
        ...prev,
        currentBankBalance: prev.currentBankBalance + bordereau.amountTeletrans,
        pendingCustomerReceivables: Math.max(0, prev.pendingCustomerReceivables - bordereau.amountTeletrans)
      }));
    }

    logUserAction({
      domain: 'resopharma',
      actionType: 'rapprochement_noemie',
      severity: 'info',
      details: `Rapprochement virement bancaire et bordereau Resopharma ${bordereau.bordereauNumber} (${bordereau.organismeName} - ${bordereau.amountTeletrans.toFixed(2)} €)`,
      targetEntity: `Bordereau ${bordereau.bordereauNumber} (${bordereau.organismeName})`,
      previousValue: 'Statut : En attente virement',
      newValue: `Statut : Rapproché Total (${bordereau.fseDetails.length} FSE)`,
      financialImpact: bordereau.amountTeletrans,
      reason: 'Validation du crédit bancaire correspondant au retour NOEMIE / DRE'
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    showToast(`Bordereau Resopharma ${bordereau.bordereauNumber} (${bordereau.organismeName}) rapproché avec succès.`);
  };

  const handleImportResopharmaBordereaux = (imported: ResopharmaBordereau[]) => {
    setResopharmaBordereaux(prev => [...imported, ...prev]);
    logUserAction({
      domain: 'resopharma',
      actionType: 'rapprochement_noemie',
      severity: 'info',
      details: `Import manuel de ${imported.length} bordereaux Resopharma`,
      targetEntity: `${imported.length} bordereaux importés`,
      previousValue: 'Non importés',
      newValue: 'Intégrés au contrôle',
      financialImpact: imported.reduce((acc, b) => acc + b.amountTeletrans, 0),
      reason: 'Téléchargement manuel fichier NOEMIE/DRE Resopharma'
    });
    showToast(`${imported.length} bordereau(x) Resopharma importé(s) avec succès.`);
  };

  // 5. Destock product (anti-gaspillage & péremptions)
  const handleDestockProduct = (productId: string, actionType: 'retour_labo' | 'promo' | 'destruction') => {
    const targetProduct = products.find(p => p.id === productId);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        if (actionType === 'promo') {
          return { ...p, publicPriceTtc: parseFloat((p.publicPriceTtc * 0.7).toFixed(2)) };
        } else if (actionType === 'retour_labo') {
          return { ...p, stockQty: 0, status: 'optimal' };
        } else {
          return { ...p, stockQty: 0, status: 'optimal' };
        }
      }
      return p;
    }));

    if (targetProduct) {
      const actionLabel = actionType === 'retour_labo' ? 'Demande d\'avoir laboratoire' : actionType === 'promo' ? 'Remise -30% anti-gaspillage' : 'Sortie destruction périmé';
      logUserAction({
        domain: 'stocks',
        actionType: 'destockage_peremption',
        severity: actionType === 'destruction' ? 'critique' : 'warning',
        details: `Action déstockage sur "${targetProduct.name}" (Lot: ${targetProduct.lotNumber}, Pér: ${targetProduct.expiryDate}) : ${actionLabel}`,
        targetEntity: targetProduct.name,
        previousValue: `${targetProduct.stockQty} boîtes en stock`,
        newValue: actionType === 'promo' ? `Prix réduit à ${(targetProduct.publicPriceTtc * 0.7).toFixed(2)} € TTC` : '0 boîte en stock',
        financialImpact: actionType === 'promo' ? -(targetProduct.publicPriceTtc * 0.3 * targetProduct.stockQty) : -(targetProduct.pump * targetProduct.stockQty),
        reason: `Péremption imminente (${targetProduct.daysUntilExpiry} jours restants)`
      });
    }

    showToast(
      actionType === 'retour_labo' ? 'Demande d\'avoir transmise au laboratoire.' :
      actionType === 'promo' ? 'Déstockage -30% appliqué.' : 'Sortie de stock pour destruction enregistrée.'
    );
  };

  // Stock management handlers
  const handleDeleteProduct = (productId: string) => {
    const targetProduct = products.find(p => p.id === productId);

    setProducts(prev => prev.filter(p => p.id !== productId));

    if (targetProduct) {
      logUserAction({
        domain: 'stocks',
        actionType: 'suppression_produit',
        severity: 'warning',
        details: `Suppression de référence de l'inventaire : "${targetProduct.name}" (CIP: ${targetProduct.cip})`,
        targetEntity: targetProduct.name,
        previousValue: `${targetProduct.stockQty} boîtes en stock (PUMP: ${targetProduct.pump.toFixed(2)} €)`,
        newValue: 'Fiche produit supprimée de l\'officine',
        financialImpact: -(targetProduct.stockQty * targetProduct.pump),
        reason: 'Retrait d\'inventaire / Obsolescence'
      });
    }

    showToast('Produit supprimé du stock de l\'officine.');
  };

  const handleAdjustStockQty = (productId: string, newQty: number) => {
    const targetProduct = products.find(p => p.id === productId);
    const oldQty = targetProduct ? targetProduct.stockQty : 0;
    const diffQty = newQty - oldQty;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stockQty: newQty,
          status: newQty <= p.minThreshold ? 'low_stock' : p.daysUntilExpiry <= 30 ? 'near_expiry' : 'optimal'
        };
      }
      return p;
    }));

    if (targetProduct) {
      logUserAction({
        domain: 'stocks',
        actionType: 'ajustement_quantite',
        severity: diffQty < 0 ? 'warning' : 'info',
        details: `Ajustement d'inventaire sur "${targetProduct.name}" (${diffQty > 0 ? '+' : ''}${diffQty} boîtes)`,
        targetEntity: targetProduct.name,
        previousValue: `${oldQty} boîtes`,
        newValue: `${newQty} boîtes`,
        financialImpact: diffQty * targetProduct.pump,
        reason: 'Régularisation inventaire physique périodique'
      });
    }
  };

  const handleImportBulkProducts = (imported: ProductStock[]) => {
    setProducts(prev => [...imported, ...prev]);

    logUserAction({
      domain: 'stocks',
      actionType: 'import_inventaire',
      severity: 'info',
      details: `Importation en masse de ${imported.length} références produits`,
      targetEntity: `${imported.length} produits importés`,
      previousValue: 'Inventaire antérieur',
      newValue: `${imported.length} nouvelles références intégrées`,
      financialImpact: imported.reduce((acc, p) => acc + (p.stockQty * p.pump), 0),
      reason: 'Fichier d\'import LGO / Grossiste répartiteurs'
    });

    showToast(`${imported.length} références importées avec succès.`);
  };

  // Transaction handlers
  const handleAddNewTransaction = (newTxData: Omit<BankTransaction, 'id'>) => {
    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      ...newTxData
    };
    setBankTransactions(prev => [newTx, ...prev]);
    setSummary(prev => ({
      ...prev,
      currentBankBalance: newTx.type === 'credit' 
        ? prev.currentBankBalance + newTx.amount 
        : prev.currentBankBalance - newTx.amount
    }));

    logUserAction({
      domain: 'banque_reconciliation',
      actionType: 'creation_ecriture_bancaire',
      severity: 'info',
      details: `Ajout manuel d'une écriture bancaire : "${newTx.label}" (${newTx.type === 'credit' ? '+' : '-'}${newTx.amount.toFixed(2)} €)`,
      targetEntity: newTx.label,
      previousValue: 'Non existante',
      newValue: `Écriture créée (${newTx.amount.toFixed(2)} € - Catégorie: ${newTx.category})`,
      financialImpact: newTx.type === 'credit' ? newTx.amount : -newTx.amount,
      reason: 'Saisie manuelle d\'écriture bancaire'
    });

    showToast(`Écriture « ${newTx.label} » ajoutée.`);
  };

  const handleDeleteTransaction = (txId: string) => {
    const targetTx = bankTransactions.find(t => t.id === txId);

    setBankTransactions(prev => prev.filter(t => t.id !== txId));

    if (targetTx) {
      logUserAction({
        domain: 'banque_reconciliation',
        actionType: 'suppression_ecriture',
        severity: 'warning',
        details: `Suppression d'écriture bancaire : "${targetTx.label}" (${targetTx.amount.toFixed(2)} €)`,
        targetEntity: targetTx.label,
        previousValue: `${targetTx.amount.toFixed(2)} € (${targetTx.status})`,
        newValue: 'Écriture annulée / supprimée',
        financialImpact: targetTx.type === 'credit' ? -targetTx.amount : targetTx.amount,
        reason: 'Correction d\'écriture erronée ou doublon'
      });
    }

    showToast('Écriture bancaire supprimée.');
  };

  const handleImportBulkTransactions = (imported: BankTransaction[]) => {
    setBankTransactions(prev => [...imported, ...prev]);

    logUserAction({
      domain: 'banque_reconciliation',
      actionType: 'import_releve_bancaire',
      severity: 'info',
      details: `Importation d'un relevé bancaire avec ${imported.length} écritures`,
      targetEntity: `${imported.length} écritures bancaires`,
      previousValue: 'Relevé bancaire antérieur',
      newValue: `${imported.length} écritures importées`,
      financialImpact: imported.reduce((acc, t) => acc + (t.type === 'credit' ? t.amount : -t.amount), 0),
      reason: 'Fichier relevé bancaire OFX/CSV Crédit Agricole'
    });

    showToast(`${imported.length} écritures bancaires importées.`);
  };

  // Internal Audit Sign-off & Manual Observation Handlers
  const handleValidateLogEntry = (logId: string, note?: string) => {
    setAuditLogs(prev => prev.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          isAudited: true,
          auditNote: note || `Contrôlé et visé par ${currentOperator.name} (${currentOperator.role}) le ${new Date().toLocaleDateString('fr-FR')}`
        };
      }
      return log;
    }));
    showToast('Point de contrôle interne validé et signé par le titulaire.');
  };

  const handleAddManualAuditEntry = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    logUserAction(entry);
    showToast('Observation de contrôle interne consignée avec succès.');
  };

  // 6. Update product price from competitor radar
  const handleApplySuggestedPrice = (productId: string, newPriceTtc: number) => {
    setCompetitorPrices(prev => prev.map(cp => {
      if (cp.productId === productId) {
        const simulated = (newPriceTtc / 1.20) - cp.myCostHt;
        const newMargin = (simulated / (newPriceTtc / 1.20)) * 100;
        return {
          ...cp,
          myPriceTtc: newPriceTtc,
          myMarginPercentage: newMargin,
          recommendation: 'prix_optimal'
        };
      }
      return cp;
    }));

    // Update in main product list if present
    setProducts(prev => prev.map(p => {
      if (p.name.toLowerCase().includes('bioderma') && productId === 'comp-prod-2') {
        return { ...p, publicPriceTtc: newPriceTtc };
      }
      if (p.name.toLowerCase().includes('gallia') && productId === 'comp-prod-3') {
        return { ...p, publicPriceTtc: newPriceTtc };
      }
      if (p.name.toLowerCase().includes('nurofen') && productId === 'comp-prod-5') {
        return { ...p, publicPriceTtc: newPriceTtc };
      }
      return p;
    }));

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    showToast(`Nouveau prix de ${newPriceTtc.toFixed(2)} € synchronisé avec le LGO et les étiquettes électroniques.`);
  };

  // 7. Add recurring expense
  const handleCreateExpense = (expenseData: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      ...expenseData
    };
    setExpenses(prev => [...prev, newExp]);
    showToast(`Dépense récurrente "${newExp.label}" ajoutée au contrôle budgétaire.`);
  };

  const handleUpdateExpense = (id: string, newActual: number) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, actualAmount: newActual } : e));
    showToast('Montant réel de la dépense mis à jour.');
  };

  // 8. Notifications management
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('Toutes les alertes ont été marquées comme lues.');
  };

  const handleSendTestPushNotification = () => {
    const newAlert: PushNotificationAlert = {
      id: `notif-${Date.now()}`,
      title: '🚨 Test Notification Push Mobile / Web',
      message: 'Alerte immédiate : Votre solde bancaire et vos échéances fournisseurs sont surveillés en temps réel.',
      type: 'alerte_budget',
      severity: 'critique',
      timestamp: 'À l\'instant',
      isRead: false,
      actionLink: 'tresorerie'
    };
    setNotifications(prev => [newAlert, ...prev]);

    // Native browser push notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newAlert.title, { body: newAlert.message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    showToast('Notification push envoyée et archivée dans le centre d\'alertes.');
  };

  // 9. API & Connector Health Handlers (Resopharma, CA, SY Cegedim, Chorus Pro...)
  const handleTestConnector = (connectorId: string) => {
    const conn = connectorsHealth.find(c => c.id === connectorId);
    if (!conn) return;

    const randomizedLatency = Math.floor(Math.random() * 45) + 25; // 25ms - 70ms
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    setConnectorsHealth(prev => prev.map(c => {
      if (c.id === connectorId) {
        return {
          ...c,
          status: 'operational',
          latencyMs: randomizedLatency,
          lastCheckedAt: `À ${timestamp}`,
          endpoints: c.endpoints.map(ep => ({ ...ep, status: 'operational', latencyMs: Math.floor(randomizedLatency * 0.9), lastHttpCode: 200 }))
        };
      }
      return c;
    }));

    const newLog: ConnectorHealthLog = {
      id: `health-log-${Date.now()}`,
      connectorId: conn.id,
      connectorName: conn.name,
      timestamp: `Aujourd'hui à ${timestamp}`,
      level: 'success',
      status: 'operational',
      httpCode: 200,
      latencyMs: randomizedLatency,
      message: `Test de communication réussi. Handshake TLS 1.3 valide, temps de réponse ${randomizedLatency}ms.`
    };

    setConnectorHealthLogs(prev => [newLog, ...prev]);

    // Also record in internal audit log
    logUserAction({
      domain: 'securite_systeme',
      actionType: 'synchronisation_flux',
      severity: 'info',
      details: `Test de ping manuel sur l'API ${conn.name} (${conn.endpointUrl}) : Succès HTTP 200 (${randomizedLatency}ms)`,
      targetEntity: conn.name,
      previousValue: conn.status,
      newValue: `Opérationnel (${randomizedLatency}ms)`,
      reason: 'Contrôle périodique de connectivité API'
    });

    showToast(`Test de connexion réussi pour ${conn.name} (latence : ${randomizedLatency}ms)`);
  };

  const handleTestAllConnectors = () => {
    setIsPingingAllConnectors(true);
    showToast('Vérification globale de tous les flux API en cours...');

    setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      setConnectorsHealth(prev => prev.map(c => {
        const randLatency = Math.floor(Math.random() * 50) + 20;
        return {
          ...c,
          status: 'operational',
          latencyMs: randLatency,
          lastCheckedAt: `À ${timestamp}`,
          endpoints: c.endpoints.map(ep => ({ ...ep, status: 'operational', latencyMs: Math.floor(randLatency * 0.9), lastHttpCode: 200 }))
        };
      }));

      const batchLog: ConnectorHealthLog = {
        id: `health-batch-${Date.now()}`,
        connectorId: 'all',
        connectorName: 'Contrôle Global Officine',
        timestamp: `Aujourd'hui à ${timestamp}`,
        level: 'success',
        status: 'operational',
        httpCode: 200,
        latencyMs: 38,
        message: 'Contrôle automatique de l\'ensemble des 8 passerelles API : 100% opérationnelles.'
      };

      setConnectorHealthLogs(prev => [batchLog, ...prev]);
      setIsPingingAllConnectors(false);

      logUserAction({
        domain: 'securite_systeme',
        actionType: 'synchronisation_flux',
        severity: 'info',
        details: 'Audit de santé global des 8 connecteurs API de l\'officine : 100% Opérationnels.',
        targetEntity: '8 Passerelles API Officine',
        previousValue: 'Contrôle continu',
        newValue: '100% Opérationnel',
        reason: 'Diagnostic global santé API'
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {}

      showToast('Toutes les API et passerelles officielles sont opérationnelles !');
    }, 1200);
  };

  const handleSimulateOutage = (connectorId: string) => {
    const conn = connectorsHealth.find(c => c.id === connectorId);
    if (!conn) return;

    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    setConnectorsHealth(prev => prev.map(c => {
      if (c.id === connectorId) {
        return {
          ...c,
          status: 'down',
          latencyMs: 0,
          lastCheckedAt: `À ${timestamp} (Échec)`,
          endpoints: c.endpoints.map(ep => ({ ...ep, status: 'down', latencyMs: 0, lastHttpCode: 503 }))
        };
      }
      return c;
    }));

    const outageLog: ConnectorHealthLog = {
      id: `health-err-${Date.now()}`,
      connectorId: conn.id,
      connectorName: conn.name,
      timestamp: `Aujourd'hui à ${timestamp}`,
      level: 'error',
      status: 'down',
      httpCode: 503,
      latencyMs: 0,
      message: `ALERTE : Perte de liaison avec ${conn.name}. Erreur HTTP 503 Service Unavailable / Timeout. Déclenchement du protocole de secours.`
    };

    setConnectorHealthLogs(prev => [outageLog, ...prev]);

    // Push critical notification
    const alertNotif: PushNotificationAlert = {
      id: `notif-api-down-${Date.now()}`,
      title: `🚨 Panne API Détectée : ${conn.name}`,
      message: `Rupture de communication sur la passerelle ${conn.categoryLabel}. Risque d'interruption des télétransmissions/flux. Consultez le plan de contingence.`,
      type: 'reconciliation_bancaire',
      severity: 'critique',
      timestamp: 'À l\'instant',
      isRead: false,
      actionLink: 'connecteurs'
    };
    setNotifications(prev => [alertNotif, ...prev]);

    logUserAction({
      domain: 'securite_systeme',
      actionType: 'synchronisation_flux',
      severity: 'critique',
      details: `Simulation d'interruption de service sur l'API ${conn.name} (${conn.endpointUrl}) - Déclenchement alerte secours`,
      targetEntity: conn.name,
      previousValue: 'Opérationnel',
      newValue: 'Panne (HTTP 503)',
      reason: 'Exercice de résilience informatique et plan de continuité'
    });

    showToast(`⚠️ Alerte panne déclenchée sur ${conn.name}. Consultez l'état des connecteurs.`);
  };

  const handleRestoreConnector = (connectorId: string) => {
    handleTestConnector(connectorId);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const criticalExpiries = products.filter(p => p.daysUntilExpiry <= 30);
  const overdueOrders = orders.filter(o => o.paymentStatus === 'en_retard');
  const budgetAlerts = expenses.filter(e => e.actualAmount > e.monthlyBudget);
  const lcrDisputesCount = lcrStatements.filter(s => s.status === 'litige_partiel' || s.discrepancyAmount !== 0).length;
  const lcrToControlCount = lcrStatements.filter(s => s.status === 'a_controler').length;
  const pendingLcrAmount = lcrStatements.filter(s => s.status !== 'regle_debit').reduce((acc, s) => acc + s.totalAmountDrawn, 0);
  const connectorsDownCount = connectorsHealth.filter(c => c.status === 'down').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in max-w-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bankBalance={summary.currentBankBalance}
        unreadNotifications={unreadNotifications}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenAccountingModal={() => setActiveTab('rapports')}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenElectronicInvoicingModal={() => setIsElectronicInvoicingModalOpen(true)}
        onOpenResopharmaModal={() => setIsResopharmaModalOpen(true)}
        onSyncBank={handleSyncBank}
        isSyncingBank={isSyncingBank}
        lastBankSyncTime={lastBankSyncTime}
        auditLogsCount={auditLogs.length}
        connectorsDownCount={connectorsDownCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Desktop Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalExpiriesCount={criticalExpiries.length}
        unpaidSupplierAlertCount={overdueOrders.length}
        budgetAlertsCount={budgetAlerts.length}
        lcrDisputesCount={lcrDisputesCount}
        lcrToControlCount={lcrToControlCount}
        auditLogsCount={auditLogs.length}
        connectorsDownCount={connectorsDownCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            summary={summary}
            todayStats={MOCK_DAILY_STATS[0]}
            notifications={notifications}
            nearExpiryProducts={criticalExpiries}
            overdueOrders={overdueOrders}
            lcrStatements={lcrStatements}
            resopharmaBordereaux={resopharmaBordereaux}
            expenses={expenses}
            orders={orders}
            onNavigateTab={setActiveTab}
            onSyncBank={handleSyncBank}
            isSyncingBank={isSyncingBank}
            onOpenAccountingModal={() => setActiveTab('rapports')}
          />
        )}

        {activeTab === 'connecteurs' && (
          <ConnectorsStatusView
            connectors={connectorsHealth}
            healthLogs={connectorHealthLogs}
            onTestConnector={handleTestConnector}
            onTestAllConnectors={handleTestAllConnectors}
            onSimulateOutage={handleSimulateOutage}
            onRestoreConnector={handleRestoreConnector}
            isPingingAll={isPingingAllConnectors}
            onOpenResopharmaModal={() => setIsResopharmaModalOpen(true)}
            onOpenElectronicInvoicingModal={() => setIsElectronicInvoicingModalOpen(true)}
            onNavigateToBank={() => setActiveTab('tresorerie')}
          />
        )}

        {activeTab === 'fournisseurs' && (
          <SuppliersOrdersView
            orders={orders}
            onPayOrder={handlePayOrder}
            onCreateOrder={handleCreateOrder}
            onOpenElectronicInvoicingModal={() => setIsElectronicInvoicingModalOpen(true)}
            onSyncVault={() => handleSyncVault('cegedim_sy')}
            onNavigateToLcr={() => setActiveTab('lcr')}
            electronicInvoicesCount={electronicInvoices.length}
            isSyncingVault={isSyncingVault}
            lcrDisputesCount={lcrDisputesCount}
          />
        )}

        {activeTab === 'lcr' && (
          <LcrControlView
            statements={lcrStatements}
            onValidateBap={handleValidateBap}
            onDeclareDispute={handleDeclareDispute}
            onSimulateLcrDebit={handleSimulateLcrDebit}
            onToggleInvoiceVerification={handleToggleInvoiceVerification}
            onImportNewStatement={handleImportStatement}
            currentBankBalance={summary.currentBankBalance}
            onOpenElectronicInvoicingVault={() => setIsElectronicInvoicingModalOpen(true)}
          />
        )}

        {activeTab === 'stocks' && (
          <StockExpiryView
            products={products}
            onDestockProduct={handleDestockProduct}
            onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            onAddNewProduct={handleAddNewProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStockQty={handleAdjustStockQty}
            onImportBulkProducts={handleImportBulkProducts}
          />
        )}

        {activeTab === 'tresorerie' && (
          <TreasuryBankReconciliationView
            summary={summary}
            transactions={bankTransactions}
            onReconcileTransaction={handleReconcileTransaction}
            onSyncBank={handleSyncBank}
            isSyncingBank={isSyncingBank}
            lastBankSyncTime={lastBankSyncTime}
            onNavigateToLcr={() => setActiveTab('lcr')}
            pendingLcrAmount={pendingLcrAmount}
            lcrDisputesCount={lcrDisputesCount}
            onAddNewTransaction={handleAddNewTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onImportBulkTransactions={handleImportBulkTransactions}
            onOpenResopharmaModal={() => setIsResopharmaModalOpen(true)}
            resopharmaBordereauxCount={resopharmaBordereaux.length}
            resopharmaPendingAmount={resopharmaBordereaux.filter(b => b.status === 'en_attente_virement').reduce((acc, b) => acc + b.amountTeletrans, 0)}
            resopharmaRejectionsCount={resopharmaBordereaux.filter(b => b.status === 'ecart_detecte' || b.status === 'rejet_a_traiter').length}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView
            logs={auditLogs}
            currentOperator={currentOperator}
            availableOperators={availableOperators}
            onChangeCurrentOperator={setCurrentOperator}
            onValidateLogEntry={handleValidateLogEntry}
            onAddManualAuditEntry={handleAddManualAuditEntry}
          />
        )}

        {activeTab === 'depenses' && (
          <RecurringExpensesView
            expenses={expenses}
            onUpdateExpense={handleUpdateExpense}
            onCreateExpense={handleCreateExpense}
          />
        )}

        {activeTab === 'ventes' && (
          <AnnualTrendsSalesView />
        )}

        {activeTab === 'prix' && (
          <CompetitorPriceRadarView
            competitors={MOCK_COMPETITORS}
            priceComparisons={competitorPrices}
            onApplySuggestedPrice={handleApplySuggestedPrice}
          />
        )}

        {activeTab === 'rapports' && (
          <AccountingReportsView
            reports={MOCK_MONTHLY_REPORTS}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMoreMenu={() => setIsMobileMoreOpen(true)}
        criticalAlertsTotal={unreadNotifications.length}
      />

      {/* Notifications Modal */}
      <PushNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsNotificationModalOpen(false);
        }}
        onSendTestPushNotification={handleSendTestPushNotification}
      />

      {/* Mobile More Drawer */}
      <MobileMoreMenuModal
        isOpen={isMobileMoreOpen}
        onClose={() => setIsMobileMoreOpen(false)}
        onSelectTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenAccountingModal={() => setActiveTab('rapports')}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenElectronicInvoicingModal={() => setIsElectronicInvoicingModalOpen(true)}
        onOpenResopharmaModal={() => setIsResopharmaModalOpen(true)}
        unreadCount={unreadNotifications.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Barcode & Datamatrix Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        products={products}
        onUpdateProductStock={handleUpdateProductStock}
        onAddNewProduct={handleAddNewProduct}
      />

      {/* Electronic Invoicing Vault Modal (SY by Cegedim & Factur-X PDP) */}
      <ElectronicInvoicingVaultModal
        isOpen={isElectronicInvoicingModalOpen}
        onClose={() => setIsElectronicInvoicingModalOpen(false)}
        invoices={electronicInvoices}
        vaultConnectors={vaultConnectors}
        syncLogs={vaultSyncLogs}
        onSyncVault={handleSyncVault}
        onImportInvoiceToOrders={handleImportInvoiceToOrders}
        onPayInvoiceViaBank={handlePayInvoiceViaBank}
        onAddManualFacturX={handleAddManualFacturX}
        onUpdateConnectorConfig={handleUpdateConnectorConfig}
        isSyncing={isSyncingVault}
      />

      {/* RESOPHARMA Teletransmission & NOEMIE Reconciliation Modal */}
      <ResopharmaConnectorModal
        isOpen={isResopharmaModalOpen}
        onClose={() => setIsResopharmaModalOpen(false)}
        config={resopharmaConfig}
        bordereaux={resopharmaBordereaux}
        syncLogs={resopharmaSyncLogs}
        bankTransactions={bankTransactions}
        onSync={handleSyncResopharma}
        isSyncing={isSyncingResopharma}
        onReconcileBordereau={handleReconcileResopharmaBordereau}
        onImportBordereaux={handleImportResopharmaBordereaux}
      />

    </div>
  );
}
