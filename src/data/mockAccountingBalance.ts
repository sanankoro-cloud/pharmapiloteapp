// Données de simulation pour le Bilan Comptable Annuel (Expert-Comptable Spécialisé Pharmacie)

import { AnnualCpaReport } from '../types/accountingBalance';

export const MOCK_ANNUAL_CPA_REPORTS: AnnualCpaReport[] = [
  {
    year: 2026,
    periodLabel: 'Exercice 2026 (En cours - Projection au 31/12/2026)',
    pharmacyName: 'Grande Pharmacie de l\'Hôtel de Ville',
    siren: '482 910 348 R.C.S. Paris',
    cpaCabinet: 'KPMG Santé & Pharmacie - Cabinet d\'Expertise Comptable et de Commissariat aux Comptes',
    cpaSignatory: 'Jean-Luc Vernier (Expert-Comptable Associé & Réviseur Spécialiste Officines)',
    dateAudited: '2026-08-20',
    status: 'provisoire',
    actif: {
      immobilise: {
        incorporel: {
          fondsDeCommerce: 1450000.00,
          logicielsLicencesLgo: 28000.00,
          amortissements: -18000.00,
          net: 1460000.00
        },
        corporel: {
          agencementsMobilier: 120000.00,
          robotAutomate: 95000.00,
          materielInformatique: 25000.00,
          amortissements: -115000.00,
          net: 125000.00
        },
        financier: {
          depotsCautionnementsBail: 18000.00,
          titresGroupementCoop: 12500.00,
          net: 30500.00
        },
        totalNet: 1615500.00
      },
      circulant: {
        stocks: {
          marchandisesPumpHt: 84320.00,
          provisionPeremptionDevaluation: -1200.00,
          net: 83120.00
        },
        creances: {
          tiersPayantCpamRo: 10450.00,
          tiersPayantMutuellesRc: 3800.00,
          fournisseursAvoirsRfaARecevoir: 6881.90,
          tvaCreditADeduire: 1450.00,
          autresCreancesDebiteurs: 2100.00,
          net: 24681.90
        },
        disponibilites: {
          compteCreditAgricole: 16708.87,
          compteBancaireSecondaire: 4200.00,
          caisseOfficineEspeces: 1850.00,
          net: 22758.87
        },
        chargesConstateesAvance: 3400.00,
        totalNet: 133960.77
      },
      totalActifNet: 1749460.77
    },
    passif: {
      capitauxPropres: {
        capitalSocial: 100000.00,
        reserveLegale: 10000.00,
        reservesStatutaires: 385000.00,
        reportANouveau: 42300.00,
        resultatNetExercice: 128450.00,
        totalCapitauxPropres: 665750.00
      },
      provisionsRisquesEtCharges: 8500.00,
      dettes: {
        empruntsLongMoyenTerme: {
          empruntAcquisitionFonds: 910000.00,
          empruntRobotAgencement: 42000.00,
          total: 952000.00
        },
        dettesFournisseursEtTraites: {
          lcrTraitesAEchoir: 45780.00,
          facturesNonParvenues: 8200.00,
          fournisseursDirects: 14200.00,
          total: 68180.00
        },
        dettesFiscalesEtSociales: {
          urssafPrevoyanceMadelin: 28400.00,
          tvaNetteAPayer: 4890.00,
          impotSocietesIs: 14200.00,
          provisionsCongesPayes: 7540.77,
          total: 55030.77
        },
        autresDettesEtDecouverts: 0.00,
        totalDettes: 1075210.77
      },
      totalPassif: 1749460.77
    },
    sig: {
      chiffreAffaires: {
        medicamentsRemboursables21Ht: 1320000.00,
        medicamentsNonRemboursables10Ht: 215000.00,
        parapharmacieDispositifs20Ht: 298000.00,
        honorairesDispensationRospActesHt: 92000.00,
        totalCaHt: 1925000.00,
        totalCaTtc: 2018450.00,
        growthRateN1Pct: 4.8
      },
      achatsEtMarge: {
        achatsMarchandisesBrutHt: 1380000.00,
        remisesFacturesEtRfaDeduites: 82500.00,
        variationStocksMarchandises: -4200.00,
        achatsConsommesHt: 1293300.00,
        margeBruteGlobaleHt: 631700.00,
        margeBruteTauxPct: 32.82,
        margeHorsRospPct: 29.44
      },
      chargesExploitation: {
        autresAchatsEtChargesExternes: {
          loyerImmobilierEtCharges: 42000.00,
          fraisLgoRobotMaintenance: 14800.00,
          honorairesComptableAvocat: 11200.00,
          assurancesRcpEtDivers: 7400.00,
          fraisBancairesEtTpe: 5800.00,
          total: 81200.00
        },
        valeurAjouteeHt: 550500.00,
        valeurAjouteePct: 28.60,
        impotsTaxesCfeEtFormation: 11800.00,
        chargesPersonnel: {
          salairesBrutsEquipe: 182000.00,
          chargesSocialesPatronales: 76440.00,
          remunerationTitulaireAssocie: 72000.00,
          total: 330440.00
        },
        ratioMasseSalarialeSurCaPct: 10.95
      },
      resultats: {
        ebeOfficine: 208260.00,
        ebeTauxPct: 10.82,
        dotationsAmortissementsEtProvisions: 28500.00,
        resultatExploitationRex: 179760.00,
        resultatFinancier: -16800.00,
        resultatCourantAvantImpotRcai: 162960.00,
        resultatExceptionnel: 1200.00,
        impotSurLesSocietes: 35710.00,
        resultatNetComptable: 128450.00,
        capaciteAutofinancementCaf: 156950.00
      }
    },
    ratiosAndValuation: {
      valuationInterfimo: {
        pctCaMethod: {
          lowPct: 75.0,
          highPct: 85.0,
          recommendedPct: 80.0,
          valuationLowEuros: 1443750.00,
          valuationHighEuros: 1636250.00,
          valuationRecommendedEuros: 1540000.00
        },
        multipleEbeMethod: {
          multiple: 6.8,
          valuationEuros: 1416168.00
        },
        weightedFinalValuationEuros: 1485000.00,
        trendComment: 'Fonds valorisé à 77.1% du CA HT (moyenne nationale Interfimo IDF : 74-82%). Emplacement premium et bonne part de parapharmacie.'
      },
      pharmacyRatios: {
        bfrEuros: 39621.13,
        bfrDaysOfTurnover: 7.5,
        stockRotationDays: 23.4, // Excellent (< 30 jours)
        supplierPaymentDays: 44.2,
        customerCollectionDays: 4.8, // Rapide grâce à Resopharma
        debtToEbeRatio: 3.48, // Conforme (< 4.0x)
        treasuryNetPositionEuros: 22758.87,
        solvencyRatioPct: 38.05,
        financialScoring: 'A+ (Excellent)'
      },
      cpaAuditRecommendations: [
        'Excellente tenue de la marge brute (32.82%) soutenue par les remises génériques et les honoraires ROSP.',
        'Masse salariale maîtrisée à 10.95% du CA HT (seuil d\'alerte ordinal à 12.0%).',
        'Contrôler mensuellement les sous-remises OCP et Urgo pour récupérer les 3 690 € d\'avoirs RFA en attente.',
        'Anticiper le renouvellement de la convention Tiers-Payant et maintenir le flux de télétransmission Resopharma.'
      ]
    },
    nMinus1Comparison: {
      totalCaHt: 1836800.00,
      margeBruteGlobaleHt: 598800.00,
      margeBrutePct: 32.60,
      ebeOfficine: 194700.00,
      ebePct: 10.60,
      resultatNet: 119200.00,
      totalActifNet: 1712400.00,
      fondsValuationEuros: 1420000.00
    }
  },
  {
    year: 2025,
    periodLabel: 'Exercice Clôturé au 31/12/2025 (Certifié sans réserve)',
    pharmacyName: 'Grande Pharmacie de l\'Hôtel de Ville',
    siren: '482 910 348 R.C.S. Paris',
    cpaCabinet: 'KPMG Santé & Pharmacie',
    cpaSignatory: 'Jean-Luc Vernier (Expert-Comptable Associé)',
    dateAudited: '2026-03-15',
    status: 'certifie',
    actif: {
      immobilise: {
        incorporel: {
          fondsDeCommerce: 1450000.00,
          logicielsLicencesLgo: 28000.00,
          amortissements: -12000.00,
          net: 1466000.00
        },
        corporel: {
          agencementsMobilier: 120000.00,
          robotAutomate: 95000.00,
          materielInformatique: 22000.00,
          amortissements: -90000.00,
          net: 147000.00
        },
        financier: {
          depotsCautionnementsBail: 18000.00,
          titresGroupementCoop: 12500.00,
          net: 30500.00
        },
        totalNet: 1643500.00
      },
      circulant: {
        stocks: {
          marchandisesPumpHt: 80120.00,
          provisionPeremptionDevaluation: -950.00,
          net: 79170.00
        },
        creances: {
          tiersPayantCpamRo: 9800.00,
          tiersPayantMutuellesRc: 3400.00,
          fournisseursAvoirsRfaARecevoir: 5200.00,
          tvaCreditADeduire: 1200.00,
          autresCreancesDebiteurs: 1900.00,
          net: 21500.00
        },
        disponibilites: {
          compteCreditAgricole: 18450.00,
          compteBancaireSecondaire: 3800.00,
          caisseOfficineEspeces: 1650.00,
          net: 23900.00
        },
        chargesConstateesAvance: 3200.00,
        totalNet: 127770.00
      },
      totalActifNet: 1771270.00
    },
    passif: {
      capitauxPropres: {
        capitalSocial: 100000.00,
        reserveLegale: 10000.00,
        reservesStatutaires: 320000.00,
        reportANouveau: 38100.00,
        resultatNetExercice: 119200.00,
        totalCapitauxPropres: 587300.00
      },
      provisionsRisquesEtCharges: 7500.00,
      dettes: {
        empruntsLongMoyenTerme: {
          empruntAcquisitionFonds: 1020000.00,
          empruntRobotAgencement: 56000.00,
          total: 1076000.00
        },
        dettesFournisseursEtTraites: {
          lcrTraitesAEchoir: 42100.00,
          facturesNonParvenues: 7500.00,
          fournisseursDirects: 12800.00,
          total: 62400.00
        },
        dettesFiscalesEtSociales: {
          urssafPrevoyanceMadelin: 26800.00,
          tvaNetteAPayer: 4600.00,
          impotSocietesIs: 13200.00,
          provisionsCongesPayes: 6970.00,
          total: 51570.00
        },
        autresDettesEtDecouverts: 0.00,
        totalDettes: 1189970.00
      },
      totalPassif: 1771270.00
    },
    sig: {
      chiffreAffaires: {
        medicamentsRemboursables21Ht: 1280000.00,
        medicamentsNonRemboursables10Ht: 202000.00,
        parapharmacieDispositifs20Ht: 271000.00,
        honorairesDispensationRospActesHt: 83800.00,
        totalCaHt: 1836800.00,
        totalCaTtc: 1928000.00,
        growthRateN1Pct: 3.9
      },
      achatsEtMarge: {
        achatsMarchandisesBrutHt: 1315000.00,
        remisesFacturesEtRfaDeduites: 75000.00,
        variationStocksMarchandises: -2000.00,
        achatsConsommesHt: 1238000.00,
        margeBruteGlobaleHt: 598800.00,
        margeBruteTauxPct: 32.60,
        margeHorsRospPct: 29.38
      },
      chargesExploitation: {
        autresAchatsEtChargesExternes: {
          loyerImmobilierEtCharges: 40500.00,
          fraisLgoRobotMaintenance: 14200.00,
          honorairesComptableAvocat: 10800.00,
          assurancesRcpEtDivers: 7100.00,
          fraisBancairesEtTpe: 5500.00,
          total: 78100.00
        },
        valeurAjouteeHt: 520700.00,
        valeurAjouteePct: 28.35,
        impotsTaxesCfeEtFormation: 11200.00,
        chargesPersonnel: {
          salairesBrutsEquipe: 174000.00,
          chargesSocialesPatronales: 73080.00,
          remunerationTitulaireAssocie: 67720.00,
          total: 314800.00
        },
        ratioMasseSalarialeSurCaPct: 10.74
      },
      resultats: {
        ebeOfficine: 194700.00,
        ebeTauxPct: 10.60,
        dotationsAmortissementsEtProvisions: 27800.00,
        resultatExploitationRex: 166900.00,
        resultatFinancier: -18200.00,
        resultatCourantAvantImpotRcai: 148700.00,
        resultatExceptionnel: 800.00,
        impotSurLesSocietes: 30300.00,
        resultatNetComptable: 119200.00,
        capaciteAutofinancementCaf: 147000.00
      }
    },
    ratiosAndValuation: {
      valuationInterfimo: {
        pctCaMethod: {
          lowPct: 75.0,
          highPct: 85.0,
          recommendedPct: 78.0,
          valuationLowEuros: 1377600.00,
          valuationHighEuros: 1561280.00,
          valuationRecommendedEuros: 1432704.00
        },
        multipleEbeMethod: {
          multiple: 6.6,
          valuationEuros: 1285020.00
        },
        weightedFinalValuationEuros: 1420000.00,
        trendComment: 'Fonds valorisé à 77.3% du CA HT.'
      },
      pharmacyRatios: {
        bfrEuros: 38270.00,
        bfrDaysOfTurnover: 7.6,
        stockRotationDays: 23.3,
        supplierPaymentDays: 43.8,
        customerCollectionDays: 4.6,
        debtToEbeRatio: 3.86,
        treasuryNetPositionEuros: 23900.00,
        solvencyRatioPct: 33.16,
        financialScoring: 'A (Très Solide)'
      },
      cpaAuditRecommendations: [
        'Comptabilité conforme, déclaration Cerfa 2050 et FEC télétransmis à la DGFIP.',
        'Marge commerciale stable, renforcement de la trésorerie nette.'
      ]
    }
  }
];
