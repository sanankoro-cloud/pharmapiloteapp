// Types pour le journal des actions utilisateur et le contrôle interne en officine

export type AuditDomain = 
  | 'stocks' 
  | 'banque_reconciliation' 
  | 'lcr_traites' 
  | 'resopharma' 
  | 'commandes_achats' 
  | 'depenses' 
  | 'factures_electroniques'
  | 'securite_systeme';

export type AuditActionType = 
  | 'ajustement_quantite'
  | 'ajout_produit'
  | 'suppression_produit'
  | 'destockage_peremption'
  | 'import_inventaire'
  | 'rapprochement_bancaire'
  | 'annulation_rapprochement'
  | 'lettrage_manuel'
  | 'creation_ecriture_bancaire'
  | 'suppression_ecriture'
  | 'import_releve_bancaire'
  | 'validation_bap_lcr'
  | 'mise_en_litige_lcr'
  | 'rapprochement_noemie'
  | 'synchronisation_flux'
  | 'export_fec'
  | 'modification_seuil'
  | 'pointage_facture'
  | 'auto_lettrage_lcr';

export type AuditOperatorRole = 'titulaire' | 'adjoint' | 'preparateur' | 'comptable' | 'systeme';

export type AuditSeverity = 'info' | 'warning' | 'critique';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  operatorName: string; // Ex: "Dr. Sanankoro (Titulaire)", "Sophie M. (Adjointe)"
  operatorRole: AuditOperatorRole;
  domain: AuditDomain;
  actionType: AuditActionType;
  targetEntity: string; // Ex: "Doliprane 1000mg (CIP: 3400936014490)", "Virement CPAM 750 #VIR-8831"
  details: string;
  previousValue?: string | number;
  newValue?: string | number;
  financialImpact?: number; // Montant en € le cas échéant
  reason?: string;
  workstation?: string; // Ex: "Poste Comptoir C1", "Poste Bureau Titulaire", "Scanner Mobile"
  severity: AuditSeverity;
  isAudited?: boolean; // Validé lors du contrôle interne
  auditNote?: string; // Commentaire du contrôleur / pharmacien titulaire
}

export interface AuditLogFilter {
  domain: string;
  actionType: string;
  operator: string;
  severity: string;
  timeRange: 'today' | '7days' | '30days' | 'all';
  searchQuery: string;
}

export interface OperatorProfile {
  id: string;
  name: string;
  role: AuditOperatorRole;
  rpps?: string;
  workstation: string;
}
