// Types pour le moteur de suggestion et correction automatique des factures officine

export type InvoiceAnomalyType =
  | 'SIREN_FORMAT_SPACES_OR_DOTS'
  | 'SIREN_LENGTH_INVALID'
  | 'SIREN_SIRET_CONFUSION'
  | 'SIREN_LUHN_CHECKSUM_FAILED'
  | 'SIREN_SUPPLIER_MISMATCH'
  | 'TVA_INTRA_INVALID'
  | 'DUE_DATE_INVERTED_MM_DD'
  | 'DUE_DATE_BEFORE_ISSUE_DATE'
  | 'DUE_DATE_PAST_OR_OUTDATED'
  | 'DUE_DATE_NON_BUSINESS_DAY'
  | 'DUE_DATE_NON_COMPLIANT_LME'
  | 'DUE_DATE_INVALID_CALENDAR'
  | 'TOTAL_TAX_MATH_INCOHERENCE'
  | 'DECIMAL_COMMA_DOT_ANOMALY'
  | 'SUPPLIER_TYPO_FUZZY_MATCH'
  | 'INVOICE_NUMBER_PREFIX_FORMAT'
  | 'MISSING_MANDATORY_FIELD';

export type CorrectionSeverity = 'error' | 'warning' | 'suggestion';

export interface InvoiceCorrectionSuggestion {
  id: string;
  field: string;
  fieldLabel: string;
  anomalyType: InvoiceAnomalyType;
  severity: CorrectionSeverity;
  currentValue: any;
  suggestedValue: any;
  title: string;
  explanation: string;
  autoFixable: boolean;
  confidenceScore: number; // 0.0 to 1.0
  regulationRef?: string; // Ex: 'Art. L441-10 C. com', 'Norme ISO 7064', 'Art. 242 nonies A CGI'
}

export interface KnownSupplierProfile {
  name: string;
  aliases: string[];
  siren: string;
  tvaIntra: string;
  supplierType: 'grossiste' | 'laboratoire_direct' | 'prestataire';
  defaultPaymentTermsDays: number;
  paymentTermType: 'net' | 'end_of_month' | 'end_of_month_15';
  standardTvaRate: 2.1 | 5.5 | 10.0 | 20.0;
  category: string;
}

export interface InvoiceValidationReport {
  isValid: boolean;
  scoreConformite: number; // 0 - 100
  totalAnomaliesCount: number;
  errorsCount: number;
  warningsCount: number;
  suggestionsCount: number;
  suggestions: InvoiceCorrectionSuggestion[];
  appliedSuggestions: string[]; // ids of applied suggestions
  originalData: Record<string, any>;
  correctedData: Record<string, any>;
  diffs: {
    field: string;
    fieldLabel: string;
    before: any;
    after: any;
    explanation: string;
  }[];
}

export interface InvoiceImportRawSample {
  id: string;
  title: string;
  description: string;
  rawInvoice: {
    supplierName: string;
    supplierSiren: string;
    supplierTvaIntra?: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    totalHt: number | string;
    totalTva: number | string;
    totalTtc: number | string;
    supplierType?: 'grossiste' | 'laboratoire_direct' | 'prestataire';
  };
  expectedErrors: string[];
}
