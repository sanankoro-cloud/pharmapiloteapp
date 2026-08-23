import { 
  ResopharmaBordereau, 
  ResopharmaConnectorConfig, 
  ResopharmaSyncLog 
} from '../types/resopharma';

export const INITIAL_RESOPHARMA_CONFIG: ResopharmaConnectorConfig = {
  id: 'resopharma_gateway',
  name: 'Passerelle RESOPHARMA Télétransmission & Tiers-Payant',
  finessOfficine: '750148921',
  rppsTitulaire: '10003492817',
  concentratorCode: '000',
  concentratorName: 'RESOPHARMA Concentrateur National SESAM-Vitale',
  apiEndpoint: 'https://gateway.resopharma.fr/api/v3/teletrans-noemie',
  isConnected: true,
  status: 'active',
  lastSyncDate: '22/08/2026 à 16:15',
  totalBorderauxCount: 6,
  totalAmountReconciled: 9284.60,
  totalAmountPending: 2840.50,
  totalRejectionsAmount: 12.50,
  autoReconcileBank: true,
  toleranceDays: 4,
  autoCreateRejectionAlerts: true,
  certificateValidityDate: '31/12/2027'
};

export const MOCK_RESOPHARMA_BORDEREAUX: ResopharmaBordereau[] = [
  {
    id: 'bord-reso-01',
    bordereauNumber: 'BORD-NOEMIE-20260822-75',
    lotTeletransNumber: 'LOT-FSE-2026-0821-41',
    fluxType: 'RO_NOEMIE',
    organismeName: 'CPAM Paris 75 (Régime Général Assurance Maladie)',
    organismeCode: '01751',
    teletransDate: '2026-08-21',
    bankExpectedDate: '2026-08-22',
    bankReceivedDate: '2026-08-22',
    amountTeletrans: 3410.80,
    amountPaid: 3410.80,
    rejectionAmount: 0,
    fseCount: 28,
    status: 'rapproche_total',
    linkedBankTransactionId: 'tx-1',
    bankTransferRef: 'VIR CPAM CAISSE PRIMAIRE ASSURANCE MALADIE NOEMIE',
    reconciliationNotes: 'Lettrage automatique parfait : Virement CPAM du 22/08/2026 correspondant au centime près.',
    fseDetails: [
      {
        id: 'fse-01',
        fseNumber: 'FSE-75-00491',
        prescriptionDate: '2026-08-21',
        patientName: 'MARTIN Claire',
        patientNir: '2 89 05 75 112 045',
        prescribingDoctor: 'Dr LEFEBVRE Pierre (Généraliste)',
        partRo: 84.50,
        partRc: 0.00,
        totalTtc: 84.50,
        status: 'regle'
      },
      {
        id: 'fse-02',
        fseNumber: 'FSE-75-00492',
        prescriptionDate: '2026-08-21',
        patientName: 'DUBOIS Jean-Luc',
        patientNir: '1 72 08 75 049 881',
        prescribingDoctor: 'Dr MOREAU Sophie (Cardiologue)',
        partRo: 215.30,
        partRc: 0.00,
        totalTtc: 215.30,
        status: 'regle'
      },
      {
        id: 'fse-03',
        fseNumber: 'FSE-75-00493',
        prescriptionDate: '2026-08-21',
        patientName: 'BERNARD Élodie',
        patientNir: '2 94 03 75 993 124',
        prescribingDoctor: 'Dr ROUX Thomas (Pédiatre)',
        partRo: 62.10,
        partRc: 0.00,
        totalTtc: 62.10,
        status: 'regle'
      }
    ]
  },
  {
    id: 'bord-reso-02',
    bordereauNumber: 'BORD-DRE-VIAMEDIS-20260821',
    lotTeletransNumber: 'LOT-DRE-2026-0820-18',
    fluxType: 'RC_DRE',
    organismeName: 'VIAMEDIS Santé Tiers-Payant Mutuelles',
    organismeCode: 'AMC-7501',
    teletransDate: '2026-08-20',
    bankExpectedDate: '2026-08-21',
    bankReceivedDate: '2026-08-21',
    amountTeletrans: 1432.65,
    amountPaid: 1420.15,
    rejectionAmount: 12.50,
    fseCount: 19,
    status: 'ecart_detecte',
    linkedBankTransactionId: 'tx-4',
    bankTransferRef: 'VIR CONCENTRATEUR RESOPHARMA TIERS PAYANT MUTUELLES',
    reconciliationNotes: 'Écart de 12.50 € : 1 rejet DRE constaté sur le dossier DUPONT (droit fermé au 01/08/2026).',
    fseDetails: [
      {
        id: 'fse-04',
        fseNumber: 'FSE-VIA-00812',
        prescriptionDate: '2026-08-20',
        patientName: 'DUPONT Jean',
        patientNir: '1 65 11 75 889 021',
        prescribingDoctor: 'Dr BLANCHARD Alain',
        partRo: 34.20,
        partRc: 12.50,
        totalTtc: 46.70,
        status: 'rejet',
        rejetCode: 'DRE-032',
        rejetMotif: 'Rejet DRE code 32 : Droits complémentaires fermés au 01/08/2026. Carte Mutuelle périmée.'
      },
      {
        id: 'fse-05',
        fseNumber: 'FSE-VIA-00813',
        prescriptionDate: '2026-08-20',
        patientName: 'GARCIA Isabelle',
        patientNir: '2 81 07 75 441 332',
        prescribingDoctor: 'Dr LEFEBVRE Pierre',
        partRo: 98.40,
        partRc: 42.10,
        totalTtc: 140.50,
        status: 'regle'
      },
      {
        id: 'fse-06',
        fseNumber: 'FSE-VIA-00814',
        prescriptionDate: '2026-08-20',
        patientName: 'FONTAINE Lucas',
        patientNir: '1 98 02 75 311 409',
        prescribingDoctor: 'Dr MOREAU Sophie',
        partRo: 145.00,
        partRc: 68.20,
        totalTtc: 213.20,
        status: 'regle'
      }
    ]
  },
  {
    id: 'bord-reso-03',
    bordereauNumber: 'BORD-DRE-ALMERYS-20260822',
    lotTeletransNumber: 'LOT-DRE-2026-0821-22',
    fluxType: 'RC_DRE',
    organismeName: 'ALMERYS Tiers Payant Complémentaire',
    organismeCode: 'AMC-9004',
    teletransDate: '2026-08-21',
    bankExpectedDate: '2026-08-24',
    amountTeletrans: 980.40,
    amountPaid: 0,
    rejectionAmount: 0,
    fseCount: 14,
    status: 'en_attente_virement',
    reconciliationNotes: 'Télétransmis le 21/08/2026. Virement bancaire attendu sous 48h ouvrées.',
    fseDetails: [
      {
        id: 'fse-07',
        fseNumber: 'FSE-ALM-00109',
        prescriptionDate: '2026-08-21',
        patientName: 'FOURNIER Marc',
        patientNir: '1 79 06 75 220 184',
        prescribingDoctor: 'Dr BLANCHARD Alain',
        partRo: 110.00,
        partRc: 48.00,
        totalTtc: 158.00,
        status: 'en_attente'
      },
      {
        id: 'fse-08',
        fseNumber: 'FSE-ALM-00110',
        prescriptionDate: '2026-08-21',
        patientName: 'PETIT Sandrine',
        patientNir: '2 85 09 75 883 911',
        prescribingDoctor: 'Dr ROUX Thomas',
        partRo: 45.60,
        partRc: 19.80,
        totalTtc: 65.40,
        status: 'en_attente'
      }
    ]
  },
  {
    id: 'bord-reso-04',
    bordereauNumber: 'BORD-NOEMIE-20260822-92',
    lotTeletransNumber: 'LOT-FSE-2026-0822-09',
    fluxType: 'RO_NOEMIE',
    organismeName: 'CPAM Hauts-de-Seine 92 (Assurés Hors Département)',
    organismeCode: '01921',
    teletransDate: '2026-08-22',
    bankExpectedDate: '2026-08-24',
    amountTeletrans: 1860.10,
    amountPaid: 0,
    rejectionAmount: 0,
    fseCount: 15,
    status: 'en_attente_virement',
    reconciliationNotes: 'Télétransmission du samedi 22/08. Virement NOEMIE attendu lundi 24/08 matin.',
    fseDetails: [
      {
        id: 'fse-09',
        fseNumber: 'FSE-92-00501',
        prescriptionDate: '2026-08-22',
        patientName: 'LAMBERT Valérie',
        patientNir: '2 88 12 92 401 229',
        prescribingDoctor: 'Dr CARON Michel (Pneumologue)',
        partRo: 340.50,
        partRc: 0.00,
        totalTtc: 340.50,
        status: 'en_attente'
      },
      {
        id: 'fse-10',
        fseNumber: 'FSE-92-00502',
        prescriptionDate: '2026-08-22',
        patientName: 'ROUSSEL David',
        patientNir: '1 82 04 92 118 732',
        prescribingDoctor: 'Dr MOREAU Sophie',
        partRo: 185.20,
        partRc: 0.00,
        totalTtc: 185.20,
        status: 'en_attente'
      }
    ]
  },
  {
    id: 'bord-reso-05',
    bordereauNumber: 'BORD-DRE-ISANTE-20260820',
    lotTeletransNumber: 'LOT-DRE-2026-0819-33',
    fluxType: 'RC_DRE',
    organismeName: 'iSANTÉ / SP SANTÉ Tiers-Payant',
    organismeCode: 'AMC-8810',
    teletransDate: '2026-08-19',
    bankExpectedDate: '2026-08-20',
    bankReceivedDate: '2026-08-20',
    amountTeletrans: 2465.20,
    amountPaid: 2465.20,
    rejectionAmount: 0,
    fseCount: 22,
    status: 'rapproche_total',
    bankTransferRef: 'VIR SP SANTE ISANTE TIERS PAYANT PHARMACIE',
    reconciliationNotes: 'Bordereau lettré et vérifié.',
    fseDetails: [
      {
        id: 'fse-11',
        fseNumber: 'FSE-ISA-00341',
        prescriptionDate: '2026-08-19',
        patientName: 'LEMOINE Arthur',
        patientNir: '1 95 01 75 701 843',
        prescribingDoctor: 'Dr BLANCHARD Alain',
        partRo: 120.00,
        partRc: 55.40,
        totalTtc: 175.40,
        status: 'regle'
      }
    ]
  },
  {
    id: 'bord-reso-06',
    bordereauNumber: 'BORD-REJET-MGEN-20260818',
    lotTeletransNumber: 'LOT-DRE-2026-0817-04',
    fluxType: 'REJET_TIERS_PAYANT',
    organismeName: 'MGEN Régime Complémentaire Enseignement',
    organismeCode: 'AMC-0004',
    teletransDate: '2026-08-17',
    bankExpectedDate: '2026-08-18',
    amountTeletrans: 45.80,
    amountPaid: 0,
    rejectionAmount: 45.80,
    fseCount: 1,
    status: 'rejet_a_traiter',
    reconciliationNotes: 'Rejet total : Prescription hors délai de validité (ordonnance > 1 an). Facture à régulariser auprès de l\'assuré.',
    fseDetails: [
      {
        id: 'fse-12',
        fseNumber: 'FSE-MGN-00088',
        prescriptionDate: '2026-08-17',
        patientName: 'CHEVALIER Brigitte',
        patientNir: '2 60 10 75 339 214',
        prescribingDoctor: 'Dr ROUX Thomas',
        partRo: 0.00,
        partRc: 45.80,
        totalTtc: 45.80,
        status: 'rejet',
        rejetCode: 'REJ-104',
        rejetMotif: 'Ordonnance périmée au moment de la dispensation. Rejet télétransmission MGEN.'
      }
    ]
  }
];

export const MOCK_RESOPHARMA_SYNC_LOGS: ResopharmaSyncLog[] = [
  {
    id: 'log-reso-01',
    timestamp: '22/08/2026 à 16:15',
    borderauxFetched: 3,
    totalAmountFetched: 6251.30,
    matchedCount: 2,
    rejectedCount: 0,
    status: 'success',
    message: 'Flux NOEMIE CPAM 75 & CPAM 92 récupérés avec succès depuis le concentrateur Resopharma.'
  },
  {
    id: 'log-reso-02',
    timestamp: '21/08/2026 à 11:20',
    borderauxFetched: 2,
    totalAmountFetched: 2413.05,
    matchedCount: 1,
    rejectedCount: 1,
    status: 'warning',
    message: 'Écart de 12.50 € détecté sur le bordereau Viamédis (Rejet DRE code 32 sur FSE DUPONT Jean).'
  },
  {
    id: 'log-reso-03',
    timestamp: '20/08/2026 à 18:00',
    borderauxFetched: 1,
    totalAmountFetched: 2465.20,
    matchedCount: 1,
    rejectedCount: 0,
    status: 'success',
    message: 'Bordereau iSanté lettré automatiquement avec le virement bancaire du Crédit Agricole.'
  }
];
