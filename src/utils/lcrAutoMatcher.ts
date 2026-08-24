import { 
  LcrStatement, 
  LcrAutoMatchProposal, 
  LcrAutoMatchResult, 
  LcrMatchAnomaly, 
  LcrAutoMatchRulesConfig 
} from '../types/lcr';
import { ElectronicInvoice } from '../types/electronicInvoicing';
import { SupplierOrder } from '../types/pharmacy';

/**
 * Normalise un nom de fournisseur pour une comparaison tolérante (retrait des formes juridiques, accents, ponctuation)
 */
export function normalizeSupplierName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(sas|sarl|sa|s\.a\.s|s\.a|france|laboratoires|laboratoire|repartition|grossiste|groupe|pharma|dermo|cosmetique|industries|industrie)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcule le décalage en jours entre deux dates YYYY-MM-DD
 */
export function calculateDaysDiff(dateStr1?: string, dateStr2?: string): number {
  if (!dateStr1 || !dateStr2) return 0;
  try {
    const d1 = new Date(dateStr1).getTime();
    const d2 = new Date(dateStr2).getTime();
    if (isNaN(d1) || isNaN(d2)) return 0;
    return Math.abs(Math.round((d1 - d2) / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

/**
 * Nettoie une référence (N° facture ou N° BL) pour matching
 */
export function normalizeReference(ref?: string): string {
  if (!ref) return '';
  return ref
    .toUpperCase()
    .replace(/^(FAC|BL|FAC-|BL-|FACTURE-|BORDEREAU-)/gi, '')
    .replace(/[^A-Z0-9]/g, '')
    .trim();
}

/**
 * Moteur d'auto-lettrage intelligent LCR
 */
export function executeLcrAutoMatching(
  statements: LcrStatement[],
  electronicInvoices: ElectronicInvoice[],
  supplierOrders: SupplierOrder[],
  config: LcrAutoMatchRulesConfig
): LcrAutoMatchResult {
  const proposals: LcrAutoMatchProposal[] = [];
  const anomalies: LcrMatchAnomaly[] = [];

  statements.forEach(stmt => {
    const normStmtSupplier = normalizeSupplierName(stmt.supplierName);

    stmt.invoices.forEach(inv => {
      let bestMatch: {
        source: 'facturx_vault' | 'supplier_order_lgo' | 'stock_reception_bl' | 'releve_grossiste';
        sourceName: string;
        reference: string;
        supplier: string;
        amountTtc: number;
        amountDiff: number;
        dateDiff: number;
        score: number;
        confidence: 'exact_perfect' | 'high_confidence' | 'probable';
        reason: string;
        isWithinTolerance: boolean;
      } | null = null;

      const normInvNum = normalizeReference(inv.invoiceNumber);
      const normBlNum = normalizeReference(inv.deliverySlipNumber);

      // 1. Recherche dans le coffre-fort Factur-X / PDP (Cegedim SY, TX2, Chorus Pro)
      for (const fx of electronicInvoices) {
        const normFxSupplier = normalizeSupplierName(fx.supplierName);
        const normFxNum = normalizeReference(fx.invoiceNumber);
        
        const supplierMatch = config.supplierNameFuzzyMatch
          ? (normStmtSupplier.includes(normFxSupplier) || normFxSupplier.includes(normStmtSupplier) || normStmtSupplier === normFxSupplier)
          : stmt.supplierName.toLowerCase() === fx.supplierName.toLowerCase();

        const refMatch = normInvNum === normFxNum || (Boolean(normBlNum) && Boolean(fx.originalFilename?.toUpperCase().includes(normBlNum!)));
        const amountDiff = Math.abs(inv.amountTtc - fx.totalTtc);
        const isAmountOk = amountDiff <= config.amountToleranceEuros;
        const dateDiff = calculateDaysDiff(inv.issueDate, fx.issueDate);
        const isDateOk = dateDiff <= config.dueDateToleranceDays;

        if (refMatch && isAmountOk && isDateOk) {
          const isExact = amountDiff === 0 && refMatch;
          bestMatch = {
            source: 'facturx_vault',
            sourceName: `Coffre Factur-X (${fx.vaultSourceName || 'PDP SY by Cegedim'})`,
            reference: fx.invoiceNumber,
            supplier: fx.supplierName,
            amountTtc: fx.totalTtc,
            amountDiff: Number(amountDiff.toFixed(2)),
            dateDiff,
            score: isExact ? 100 : 95,
            confidence: isExact ? 'exact_perfect' : 'high_confidence',
            reason: isExact
              ? `Montant exact (${inv.amountTtc.toFixed(2)} €) et Réf. Factur-X PDP certifiée #${fx.invoiceNumber}`
              : `Réf. #${fx.invoiceNumber} certifiée PDP conforme (écart centimes ${amountDiff.toFixed(2)} € sous tolérance de ${config.amountToleranceEuros.toFixed(2)} €)`,
            isWithinTolerance: true
          };
          break; // Trouvé correspondance Factur-X haute valeur
        } else if (refMatch && !isAmountOk && supplierMatch) {
          // Détection d'anomalie : Référence identique mais montant hors tolérance
          anomalies.push({
            id: `anom-${stmt.id}-${inv.id}-${Date.now()}`,
            statementId: stmt.id,
            statementLcrNumber: stmt.lcrNumber,
            statementSupplierName: stmt.supplierName,
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            expectedAmountTtc: inv.amountTtc,
            candidateSource: `Factur-X (${fx.vaultSourceName})`,
            candidateReference: fx.invoiceNumber,
            candidateAmountTtc: fx.totalTtc,
            amountDifference: Number((inv.amountTtc - fx.totalTtc).toFixed(2)),
            dateDifferenceDays: dateDiff,
            anomalyType: 'amount_out_of_tolerance',
            detectedAt: new Date().toISOString(),
            suggestedAction: `Écart de ${Math.abs(inv.amountTtc - fx.totalTtc).toFixed(2)} € > tolérance (${config.amountToleranceEuros.toFixed(2)} €). Vérifier avoir grossiste manquant ou ajuster le seuil de tolérance.`
          });
        }
      }

      // 2. Recherche dans les Commandes LGO & Réceptions Fournisseurs
      if (!bestMatch) {
        for (const ord of supplierOrders) {
          const normOrdSupplier = normalizeSupplierName(ord.supplierName);
          const normOrdNum = normalizeReference(ord.orderNumber);
          const normOrdInvoice = normalizeReference(ord.invoiceNumber);

          const supplierMatch = config.supplierNameFuzzyMatch
            ? (normStmtSupplier.includes(normOrdSupplier) || normOrdSupplier.includes(normStmtSupplier) || normStmtSupplier === normOrdSupplier)
            : stmt.supplierName.toLowerCase() === ord.supplierName.toLowerCase();

          const refMatch = 
            (normOrdInvoice && (normOrdInvoice === normInvNum || normOrdInvoice === normBlNum)) ||
            (normOrdNum && (normOrdNum === normInvNum || normOrdNum === normBlNum));

          const amountDiff = Math.abs(inv.amountTtc - ord.totalTtc);
          const isAmountOk = amountDiff <= config.amountToleranceEuros;
          const dateDiff = calculateDaysDiff(inv.issueDate, ord.orderDate);
          const isDateOk = dateDiff <= (config.dueDateToleranceDays * 2);

          if ((refMatch || (supplierMatch && isAmountOk)) && isAmountOk && isDateOk) {
            const isExact = amountDiff === 0 && refMatch;
            const score = isExact ? 100 : refMatch ? 92 : 85;
            
            if (score >= config.minConfidenceScore) {
              bestMatch = {
                source: 'supplier_order_lgo',
                sourceName: `LGO WinPharma (Commande ${ord.orderNumber})`,
                reference: ord.invoiceNumber || ord.orderNumber,
                supplier: ord.supplierName,
                amountTtc: ord.totalTtc,
                amountDiff: Number(amountDiff.toFixed(2)),
                dateDiff,
                score,
                confidence: isExact ? 'exact_perfect' : score >= 90 ? 'high_confidence' : 'probable',
                reason: isExact
                  ? `Commande LGO #${ord.orderNumber} et montant concordant à 100% (${ord.totalTtc.toFixed(2)} €)`
                  : `Rapprochement LGO (${ord.itemsCount} lignes) avec écart de ${amountDiff.toFixed(2)} € (tolérance autorisée)`,
                isWithinTolerance: true
              };
              break;
            }
          } else if (refMatch && !isAmountOk && supplierMatch) {
            // Anomalie de montant sur commande LGO
            anomalies.push({
              id: `anom-${stmt.id}-${inv.id}-ord-${Date.now()}`,
              statementId: stmt.id,
              statementLcrNumber: stmt.lcrNumber,
              statementSupplierName: stmt.supplierName,
              invoiceId: inv.id,
              invoiceNumber: inv.invoiceNumber,
              expectedAmountTtc: inv.amountTtc,
              candidateSource: `Commande LGO #${ord.orderNumber}`,
              candidateReference: ord.orderNumber,
              candidateAmountTtc: ord.totalTtc,
              amountDifference: Number((inv.amountTtc - ord.totalTtc).toFixed(2)),
              dateDifferenceDays: dateDiff,
              anomalyType: 'amount_out_of_tolerance',
              detectedAt: new Date().toISOString(),
              suggestedAction: `Écart de ${Math.abs(inv.amountTtc - ord.totalTtc).toFixed(2)} € entre traite LCR et commande LGO. Contrôler bon de livraison ou tarification.`
            });
          }
        }
      }

      // 3. Rapprochement par Bon de Livraison (BL) / Réception certifiée
      if (!bestMatch && config.allowDeliverySlipMatch && inv.deliverySlipNumber) {
        // Recherche si le BL correspond à un montant équivalent
        if (inv.matchedStockReception) {
          bestMatch = {
            source: 'stock_reception_bl',
            sourceName: `Réception Stock Dépositaire (BL ${inv.deliverySlipNumber})`,
            reference: inv.deliverySlipNumber,
            supplier: stmt.supplierName,
            amountTtc: inv.amountTtc,
            amountDiff: 0,
            dateDiff: 0,
            score: 95,
            confidence: 'high_confidence',
            reason: `Bon de Livraison ${inv.deliverySlipNumber} scanné et réceptionné conforme au stock (${inv.itemsCount} articles)`,
            isWithinTolerance: true
          };
        }
      }

      // Si aucune correspondance n'a été trouvée pour une facture non vérifiée et montant important
      if (!bestMatch && !inv.verified && inv.amountTtc > 500) {
        anomalies.push({
          id: `anom-missing-${stmt.id}-${inv.id}`,
          statementId: stmt.id,
          statementLcrNumber: stmt.lcrNumber,
          statementSupplierName: stmt.supplierName,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          expectedAmountTtc: inv.amountTtc,
          candidateSource: 'Aucune pièce justificative trouvée',
          amountDifference: inv.amountTtc,
          dateDifferenceDays: 0,
          anomalyType: 'missing_counterpart',
          detectedAt: new Date().toISOString(),
          suggestedAction: `Facture #${inv.invoiceNumber} (${inv.amountTtc.toFixed(2)} €) sans équivalent dans le coffre Factur-X ni commandes LGO. Demander duplicata au grossiste.`
        });
      }

      if (bestMatch) {
        proposals.push({
          id: `prop-${stmt.id}-${inv.id}`,
          statementId: stmt.id,
          statementLcrNumber: stmt.lcrNumber,
          statementSupplierName: stmt.supplierName,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          invoiceAmountTtc: inv.amountTtc,
          invoiceAmountHt: inv.amountHt,
          invoiceDate: inv.issueDate,
          deliverySlipNumber: inv.deliverySlipNumber,
          matchedSource: bestMatch.source,
          matchedSourceName: bestMatch.sourceName,
          matchedReference: bestMatch.reference,
          matchedAmountTtc: bestMatch.amountTtc,
          amountDifference: bestMatch.amountDiff,
          dateDifferenceDays: bestMatch.dateDiff,
          matchedSupplier: bestMatch.supplier,
          matchScore: bestMatch.score,
          matchConfidence: bestMatch.confidence,
          matchReason: bestMatch.reason,
          isWithinTolerance: bestMatch.isWithinTolerance,
          alreadyVerified: inv.verified,
          selectedForApplication: !inv.verified && (config.autoSelectExactMatches ? true : bestMatch.score === 100)
        });
      }
    });
  });

  const unverifiedProposals = proposals.filter(p => !p.alreadyVerified);
  const exactMatches = unverifiedProposals.filter(p => p.matchScore === 100);
  const toleranceMatches = unverifiedProposals.filter(p => p.matchScore < 100 && p.isWithinTolerance);
  const totalAmountMatchedTtc = unverifiedProposals
    .filter(p => p.selectedForApplication)
    .reduce((sum, p) => sum + p.invoiceAmountTtc, 0);

  const uniqueStatements = new Set(unverifiedProposals.map(p => p.statementId));
  const isAlertThresholdExceeded = anomalies.length >= config.anomalyAlertThreshold;

  return {
    totalProposals: proposals.length,
    unverifiedProposalsCount: unverifiedProposals.length,
    exactMatchesCount: exactMatches.length,
    toleranceMatchesCount: toleranceMatches.length,
    totalAmountMatchedTtc,
    statementsImpactedCount: uniqueStatements.size,
    proposals,
    anomalies,
    anomaliesCount: anomalies.length,
    isAlertThresholdExceeded
  };
}
