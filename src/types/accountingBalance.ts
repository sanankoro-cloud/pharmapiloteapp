// Types pour le Bilan Comptable Annuel, Compte de Résultat (SIG) et Diagnostic Spécialisé Pharmacie (Expert-Comptable / Interfimo)

export interface AccountingBalanceSheetAsset {
  immobilise: {
    incorporel: {
      fondsDeCommerce: number;
      logicielsLicencesLgo: number;
      amortissements: number;
      net: number;
    };
    corporel: {
      agencementsMobilier: number;
      robotAutomate: number;
      materielInformatique: number;
      amortissements: number;
      net: number;
    };
    financier: {
      depotsCautionnementsBail: number;
      titresGroupementCoop: number;
      net: number;
    };
    totalNet: number;
  };
  circulant: {
    stocks: {
      marchandisesPumpHt: number;
      provisionPeremptionDevaluation: number;
      net: number;
    };
    creances: {
      tiersPayantCpamRo: number;
      tiersPayantMutuellesRc: number;
      fournisseursAvoirsRfaARecevoir: number;
      tvaCreditADeduire: number;
      autresCreancesDebiteurs: number;
      net: number;
    };
    disponibilites: {
      compteCreditAgricole: number;
      compteBancaireSecondaire: number;
      caisseOfficineEspeces: number;
      net: number;
    };
    chargesConstateesAvance: number;
    totalNet: number;
  };
  totalActifNet: number;
}

export interface AccountingBalanceSheetLiability {
  capitauxPropres: {
    capitalSocial: number;
    reserveLegale: number;
    reservesStatutaires: number;
    reportANouveau: number;
    resultatNetExercice: number;
    totalCapitauxPropres: number;
  };
  provisionsRisquesEtCharges: number;
  dettes: {
    empruntsLongMoyenTerme: {
      empruntAcquisitionFonds: number;
      empruntRobotAgencement: number;
      total: number;
    };
    dettesFournisseursEtTraites: {
      lcrTraitesAEchoir: number;
      facturesNonParvenues: number;
      fournisseursDirects: number;
      total: number;
    };
    dettesFiscalesEtSociales: {
      urssafPrevoyanceMadelin: number;
      tvaNetteAPayer: number;
      impotSocietesIs: number;
      provisionsCongesPayes: number;
      total: number;
    };
    autresDettesEtDecouverts: number;
    totalDettes: number;
  };
  totalPassif: number;
}

export interface IncomeStatementSig {
  chiffreAffaires: {
    medicamentsRemboursables21Ht: number;
    medicamentsNonRemboursables10Ht: number;
    parapharmacieDispositifs20Ht: number;
    honorairesDispensationRospActesHt: number;
    totalCaHt: number;
    totalCaTtc: number;
    growthRateN1Pct: number;
  };
  achatsEtMarge: {
    achatsMarchandisesBrutHt: number;
    remisesFacturesEtRfaDeduites: number;
    variationStocksMarchandises: number;
    achatsConsommesHt: number;
    margeBruteGlobaleHt: number;
    margeBruteTauxPct: number;
    margeHorsRospPct: number;
  };
  chargesExploitation: {
    autresAchatsEtChargesExternes: {
      loyerImmobilierEtCharges: number;
      fraisLgoRobotMaintenance: number;
      honorairesComptableAvocat: number;
      assurancesRcpEtDivers: number;
      fraisBancairesEtTpe: number;
      total: number;
    };
    valeurAjouteeHt: number;
    valeurAjouteePct: number;
    impotsTaxesCfeEtFormation: number;
    chargesPersonnel: {
      salairesBrutsEquipe: number;
      chargesSocialesPatronales: number;
      remunerationTitulaireAssocie: number;
      total: number;
    };
    ratioMasseSalarialeSurCaPct: number; // Benchmark: 10.5% - 11.5%
  };
  resultats: {
    ebeOfficine: number; // Excédent Brut d'Exploitation
    ebeTauxPct: number;
    dotationsAmortissementsEtProvisions: number;
    resultatExploitationRex: number;
    resultatFinancier: number;
    resultatCourantAvantImpotRcai: number;
    resultatExceptionnel: number;
    impotSurLesSocietes: number;
    resultatNetComptable: number;
    capaciteAutofinancementCaf: number;
  };
}

export interface PharmacyFinancialRatiosAndValuation {
  valuationInterfimo: {
    pctCaMethod: {
      lowPct: number;
      highPct: number;
      recommendedPct: number;
      valuationLowEuros: number;
      valuationHighEuros: number;
      valuationRecommendedEuros: number;
    };
    multipleEbeMethod: {
      multiple: number;
      valuationEuros: number;
    };
    weightedFinalValuationEuros: number;
    trendComment: string;
  };
  pharmacyRatios: {
    bfrEuros: number;
    bfrDaysOfTurnover: number; // Benchmark: 20-35 jours
    stockRotationDays: number; // Benchmark: 25-35 jours
    supplierPaymentDays: number; // Benchmark: 40-50 jours
    customerCollectionDays: number; // Tiers-Payant: 4-7 jours
    debtToEbeRatio: number; // Dette nette / EBE (doit être < 4.0x)
    treasuryNetPositionEuros: number;
    solvencyRatioPct: number; // Capitaux propres / Total bilan
    financialScoring: 'A+ (Excellent)' | 'A (Très Solide)' | 'B (Équilibré)' | 'C (Vigilance)';
  };
  cpaAuditRecommendations: string[];
}

export interface AnnualCpaReport {
  year: number;
  periodLabel: string;
  pharmacyName: string;
  siren: string;
  cpaCabinet: string;
  cpaSignatory: string;
  dateAudited: string;
  status: 'certifie' | 'provisoire' | 'en_cloture';
  actif: AccountingBalanceSheetAsset;
  passif: AccountingBalanceSheetLiability;
  sig: IncomeStatementSig;
  ratiosAndValuation: PharmacyFinancialRatiosAndValuation;
  nMinus1Comparison?: {
    totalCaHt: number;
    margeBruteGlobaleHt: number;
    margeBrutePct: number;
    ebeOfficine: number;
    ebePct: number;
    resultatNet: number;
    totalActifNet: number;
    fondsValuationEuros: number;
  };
}
