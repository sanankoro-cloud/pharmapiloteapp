export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    medicament_remboursable: 'Médicament Remboursable (2.1%)',
    medicament_otc: 'Médicament Conseil / OTC (10%)',
    parapharmacie: 'Parapharmacie / Cosmétique (20%)',
    dispositif_medical: 'Dispositif Médical / Pansements (20%)',
    nutrition_bebe: 'Nutrition Infantile / Laits (5.5%)',
    veterinaire: 'Vétérinaire (20%)',
    acte_pharmaceutique: 'Actes & Vaccinations (Exonéré)',
    // Expenses
    loyer: 'Loyer & Charges Locatives',
    salaires: 'Masse Salariale & Charges',
    logiciel_lgo: 'Logiciel Métier LGO & HDS',
    robot_leasing: 'Robotique & Automate Rowa',
    energie_fluides: 'Électricité & Énergie',
    assurance_rcp: 'Assurance Multirisque & RCP',
    honoraires_comptables: 'Expertise Comptable & Conseil',
    frais_bancaires_tpe: 'Commissions TPE & Frais CA',
    autres: 'Autres Charges Externes'
  };
  return map[category] || category;
}

export function exportToCsv(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(';'),
    ...data.map(row => 
      headers.map(header => {
        const val = row[header];
        if (typeof val === 'string') {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val !== undefined && val !== null ? val : '';
      }).join(';')
    )
  ].join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateFecExport(month: string): void {
  // Conforme structure Fichier des Écritures Comptables DGI France (Art. A.47 A-1 LPF)
  const fecHeaders = "JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise";
  
  const rows = [
    fecHeaders,
    `VT|JOURNAL DES VENTES PHARMACIE|20260801|20260822|707100|VENTES MEDICAMENTS 2.1%|||Z-CAISSE-22|20260822|Ventes comptoir journalières||4200.00|||20260822||EUR`,
    `VT|JOURNAL DES VENTES PHARMACIE|20260801|20260822|445711|TVA COLLECTEE 2.1%|||Z-CAISSE-22|20260822|TVA Ventes 2.1%||88.20|||20260822||EUR`,
    `VT|JOURNAL DES VENTES PHARMACIE|20260801|20260822|707200|VENTES OTC 10%|||Z-CAISSE-22|20260822|Ventes conseil OTC||650.00|||20260822||EUR`,
    `VT|JOURNAL DES VENTES PHARMACIE|20260801|20260822|707300|VENTES PARAPHARMACIE 20%|||Z-CAISSE-22|20260822|Ventes dermo-cosmetique||750.20|||20260822||EUR`,
    `VT|JOURNAL DES VENTES PHARMACIE|20260801|20260822|411100|CLIENTS ET TIERS PAYANT CPAM|||Z-CAISSE-22|20260822|Encaissements CPAM et Caisse|6480.50||||20260822||EUR`,
    `HA|JOURNAL DES ACHATS GROSSISTE|20260802|20260822|607100|ACHATS PHARMACEUTIQUES|401OCP|OCP REPARTITION|FAC-89211|20260822|Facture Achats Grossiste OCP|4210.80||||20260822||EUR`,
    `BQ|CREDIT AGRICOLE PRO|20260803|20260822|512100|BANQUE CREDIT AGRICOLE|||VIR-NOEMIE|20260822|Virement NOEMIE CPAM|3410.80||||20260822||EUR`
  ];

  const blob = new Blob([rows.join('\r\n')], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `FEC_PHARMACIE_${month.replace('-', '')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
