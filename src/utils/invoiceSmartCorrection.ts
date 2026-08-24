// Moteur d'analyse intelligente, détection d'erreurs et suggestions automatiques pour factures officine
import {
  InvoiceCorrectionSuggestion,
  InvoiceValidationReport,
  KnownSupplierProfile,
  InvoiceAnomalyType,
  InvoiceImportRawSample
} from '../types/invoiceCorrection';

// 1. Référentiel des Fournisseurs Pharmaceutiques Connus en France
export const KNOWN_PHARMACY_SUPPLIERS: KnownSupplierProfile[] = [
  {
    name: 'OCP Répartition',
    aliases: ['ocp', 'ocp repartition', 'ocp distribution', 'ocp sa', 'o.c.p.'],
    siren: '552084795',
    tvaIntra: 'FR05552084795',
    supplierType: 'grossiste',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'end_of_month_15',
    standardTvaRate: 2.1,
    category: 'Grossiste Répartiteur'
  },
  {
    name: 'Alliance Healthcare France',
    aliases: ['alliance', 'alliance healthcare', 'alliance sante', 'alliance healtcare'],
    siren: '334407886',
    tvaIntra: 'FR84334407886',
    supplierType: 'grossiste',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'end_of_month_15',
    standardTvaRate: 2.1,
    category: 'Grossiste Répartiteur'
  },
  {
    name: 'Phoenix Pharma France',
    aliases: ['phoenix', 'phoenix pharma', 'phoenix distribution', 'phenix pharma'],
    siren: '389445898',
    tvaIntra: 'FR79389445898',
    supplierType: 'grossiste',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'end_of_month_15',
    standardTvaRate: 2.1,
    category: 'Grossiste Répartiteur'
  },
  {
    name: 'CERP Rouen',
    aliases: ['cerp', 'cerp rouen', 'cerp normandie', 'c.e.r.p.'],
    siren: '775675540',
    tvaIntra: 'FR23775675540',
    supplierType: 'grossiste',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'end_of_month_15',
    standardTvaRate: 2.1,
    category: 'Grossiste Répartiteur'
  },
  {
    name: 'Laboratoires Biogaran',
    aliases: ['biogaran', 'lab biogaran', 'biogaran sas', 'laboratoire biogaran'],
    siren: '405153218',
    tvaIntra: 'FR45405153218',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 60,
    paymentTermType: 'net',
    standardTvaRate: 2.1,
    category: 'Génériqueur / Laboratoire Direct'
  },
  {
    name: 'Sanofi-Aventis France',
    aliases: ['sanofi', 'sanofi aventis', 'sanofi-aventis', 'sanofi pasteur', 'sanofi winthrop'],
    siren: '395030844',
    tvaIntra: 'FR42395030844',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 60,
    paymentTermType: 'net',
    standardTvaRate: 2.1,
    category: 'Laboratoire Princeps'
  },
  {
    name: 'Viatris Santé (ex-Mylan)',
    aliases: ['viatris', 'viatris sante', 'mylan', 'mylan sas', 'viatris medical'],
    siren: '342938161',
    tvaIntra: 'FR30342938161',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 60,
    paymentTermType: 'net',
    standardTvaRate: 2.1,
    category: 'Génériqueur / Laboratoire Direct'
  },
  {
    name: 'Pfizer (S.A.S)',
    aliases: ['pfizer', 'pfizer sas', 'pfizer france', 'pfizer holding'],
    siren: '433623550',
    tvaIntra: 'FR73433623550',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 60,
    paymentTermType: 'net',
    standardTvaRate: 2.1,
    category: 'Laboratoire Spécialités'
  },
  {
    name: 'Pierre Fabre Médicament & Dermo-Cosmétique',
    aliases: ['pierre fabre', 'pierre fabre dermo', 'fabre', 'avene', 'klorane', 'ducray'],
    siren: '318285514',
    tvaIntra: 'FR20318285514',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'end_of_month',
    standardTvaRate: 20.0,
    category: 'Dermo-Cosmétique / OTC'
  },
  {
    name: 'Laboratoires Boiron',
    aliases: ['boiron', 'lab boiron', 'boiron sa', 'laboratoire boiron'],
    siren: '562067756',
    tvaIntra: 'FR58562067756',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'net',
    standardTvaRate: 10.0,
    category: 'Homéopathie & OTC'
  },
  {
    name: 'Cooper (Coopération Pharmaceutique Française)',
    aliases: ['cooper', 'cooperation pharmaceutique', 'cooper melun'],
    siren: '399222538',
    tvaIntra: 'FR12399222538',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'net',
    standardTvaRate: 5.5,
    category: 'Matières premières & OTC'
  },
  {
    name: 'Laboratoires Urgo Médical',
    aliases: ['urgo', 'urgo medical', 'urgo pansements', 'lab urgo'],
    siren: '433919861',
    tvaIntra: 'FR49433919861',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'end_of_month',
    standardTvaRate: 5.5,
    category: 'Dispositifs Médicaux & Pansements'
  },
  {
    name: 'Laboratoires Gilbert',
    aliases: ['gilbert', 'laboratoires gilbert', 'lab gilbert', 'physiodose'],
    siren: '306023307',
    tvaIntra: 'FR75306023307',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'end_of_month',
    standardTvaRate: 5.5,
    category: 'Hygiène & Puériculture'
  },
  {
    name: 'Arkopharma Laboratoires Pharmaceutiques',
    aliases: ['arkopharma', 'arko', 'arkogellules', 'lab arkopharma'],
    siren: '320572115',
    tvaIntra: 'FR81320572115',
    supplierType: 'laboratoire_direct',
    defaultPaymentTermsDays: 45,
    paymentTermType: 'net',
    standardTvaRate: 5.5,
    category: 'Phytothérapie & Compléments'
  }
];

// 2. Algorithme de Luhn pour vérification de la clé de contrôle SIREN
export function validateLuhnSiren(sirenDigits: string): boolean {
  if (!/^\d{9}$/.test(sirenDigits)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(sirenDigits.charAt(8 - i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// Calcul du numéro de TVA Intracommunautaire français à partir du SIREN
export function computeFrenchVatIntra(sirenDigits: string): string {
  const cleanSiren = sirenDigits.replace(/\D/g, '');
  if (cleanSiren.length !== 9) return '';
  const sirenNum = parseInt(cleanSiren, 10);
  const key = (12 + 3 * (sirenNum % 97)) % 97;
  const keyStr = key < 10 ? `0${key}` : `${key}`;
  return `FR${keyStr}${cleanSiren}`;
}

// Distance de Levenshtein pour correspondance floue
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // suppression
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Recherche du fournisseur le plus proche
export function findBestMatchingSupplier(inputName: string): { supplier: KnownSupplierProfile; score: number } | null {
  if (!inputName || inputName.trim().length < 2) return null;
  const normalizedInput = inputName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  let bestMatch: KnownSupplierProfile | null = null;
  let highestScore = 0;

  for (const supp of KNOWN_PHARMACY_SUPPLIERS) {
    const suppNormalized = supp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Direct inclusion
    if (suppNormalized.includes(normalizedInput) || normalizedInput.includes(suppNormalized)) {
      return { supplier: supp, score: 0.95 };
    }

    // Check aliases
    for (const alias of supp.aliases) {
      const aliasNormalized = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (aliasNormalized === normalizedInput) {
        return { supplier: supp, score: 1.0 };
      }
      if (aliasNormalized.includes(normalizedInput) || normalizedInput.includes(aliasNormalized)) {
        return { supplier: supp, score: 0.9 };
      }
    }

    // Levenshtein similarity
    const maxLen = Math.max(suppNormalized.length, normalizedInput.length);
    const dist = levenshteinDistance(suppNormalized, normalizedInput);
    const similarity = 1 - (dist / maxLen);

    if (similarity > highestScore) {
      highestScore = similarity;
      bestMatch = supp;
    }
  }

  if (bestMatch && highestScore >= 0.65) {
    return { supplier: bestMatch, score: highestScore };
  }
  return null;
}

// 3. Utilitaires de détection et validation des dates
export interface ParsedDateResult {
  isoDate: string; // YYYY-MM-DD
  year: number;
  month: number;
  day: number;
  isInvertedCandidate?: boolean;
  isValid: boolean;
  rawFormat: string;
}

export function parseFlexibleDate(dateStr: string): ParsedDateResult | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();

  // Pattern ISO YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    const isValid = isValidCalendarDate(y, m, d);
    return {
      isoDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      year: y,
      month: m,
      day: d,
      isValid,
      rawFormat: 'YYYY-MM-DD'
    };
  }

  // Pattern French DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const frMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (frMatch) {
    const part1 = parseInt(frMatch[1], 10);
    const part2 = parseInt(frMatch[2], 10);
    const y = parseInt(frMatch[3], 10);

    // If part1 > 12 -> it MUST be day/month (French DD/MM/YYYY)
    // If part2 > 12 -> it MUST be month/day (US MM/DD/YYYY error)
    if (part2 > 12) {
      // It is MM/DD/YYYY
      const isValid = isValidCalendarDate(y, part1, part2);
      return {
        isoDate: `${y}-${String(part1).padStart(2, '0')}-${String(part2).padStart(2, '0')}`,
        year: y,
        month: part1,
        day: part2,
        isInvertedCandidate: true,
        isValid,
        rawFormat: 'MM/DD/YYYY'
      };
    }

    const isValid = isValidCalendarDate(y, part2, part1);
    return {
      isoDate: `${y}-${String(part2).padStart(2, '0')}-${String(part1).padStart(2, '0')}`,
      year: y,
      month: part2,
      day: part1,
      isInvertedCandidate: false,
      isValid,
      rawFormat: 'DD/MM/YYYY'
    };
  }

  // Pattern DDMMYYYY without separators
  const compactMatch = trimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (compactMatch) {
    const d = parseInt(compactMatch[1], 10);
    const m = parseInt(compactMatch[2], 10);
    const y = parseInt(compactMatch[3], 10);
    const isValid = isValidCalendarDate(y, m, d);
    return {
      isoDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      year: y,
      month: m,
      day: d,
      isValid,
      rawFormat: 'DDMMYYYY'
    };
  }

  return null;
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  if (year < 2000 || year > 2099) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

// Calcul du prochain jour ouvré bancaire si samedi/dimanche
export function getNextBusinessDay(date: Date): { adjustedDate: Date; wasWeekend: boolean } {
  const dayOfWeek = date.getDay(); // 0 = Dimanche, 6 = Samedi
  const newDate = new Date(date);
  if (dayOfWeek === 0) {
    // Dimanche -> +1 jour (Lundi)
    newDate.setDate(newDate.getDate() + 1);
    return { adjustedDate: newDate, wasWeekend: true };
  } else if (dayOfWeek === 6) {
    // Samedi -> +2 jours (Lundi)
    newDate.setDate(newDate.getDate() + 2);
    return { adjustedDate: newDate, wasWeekend: true };
  }
  return { adjustedDate: newDate, wasWeekend: false };
}

// 4. Moteur Principal d'Analyse et Suggestions
export function analyzeAndSuggestInvoiceCorrections(
  rawInvoice: {
    supplierName?: string;
    supplierSiren?: string;
    supplierTvaIntra?: string;
    invoiceNumber?: string;
    issueDate?: string;
    dueDate?: string;
    totalHt?: number | string;
    totalTva?: number | string;
    totalTtc?: number | string;
    supplierType?: string;
    [key: string]: any;
  }
): InvoiceValidationReport {
  const suggestions: InvoiceCorrectionSuggestion[] = [];
  const diffs: InvoiceValidationReport['diffs'] = [];
  let score = 100;

  const correctedData: Record<string, any> = { ...rawInvoice };

  // --- A. ANALYSE DU NUMÉRO SIREN & TVA INTRACOMMUNAUTAIRE ---
  const rawSiren = rawInvoice.supplierSiren ? String(rawInvoice.supplierSiren).trim() : '';
  let cleanSirenDigits = rawSiren.replace(/\D/g, '');

  if (!rawSiren) {
    suggestions.push({
      id: 'siren-missing',
      field: 'supplierSiren',
      fieldLabel: 'Numéro SIREN Fournisseur',
      anomalyType: 'MISSING_MANDATORY_FIELD',
      severity: 'error',
      currentValue: '',
      suggestedValue: '',
      title: 'Numéro SIREN manquant',
      explanation: 'La mention du SIREN (9 chiffres) est une obligation légale sur toute facture (Art. R123-237 C. com).',
      autoFixable: false,
      confidenceScore: 1.0,
      regulationRef: 'Art. R123-237 Code de Commerce'
    });
    score -= 25;
  } else {
    // 1. Détection SIRET (14 chiffres) au lieu de SIREN (9 chiffres)
    if (cleanSirenDigits.length === 14) {
      const extractedSiren = cleanSirenDigits.substring(0, 9);
      suggestions.push({
        id: 'siren-siret-confusion',
        field: 'supplierSiren',
        fieldLabel: 'Numéro SIREN Fournisseur',
        anomalyType: 'SIREN_SIRET_CONFUSION',
        severity: 'warning',
        currentValue: rawSiren,
        suggestedValue: extractedSiren,
        title: 'Numéro SIRET (14 chiffres) saisi au lieu du SIREN (9 chiffres)',
        explanation: `Extraction automatique du SIREN principal (${extractedSiren}) en supprimant le NIC d'établissement (${cleanSirenDigits.substring(9)}).`,
        autoFixable: true,
        confidenceScore: 0.99,
        regulationRef: 'Format INSEE / Art. A.47 A-1 LPF'
      });
      cleanSirenDigits = extractedSiren;
      correctedData.supplierSiren = extractedSiren;
      score -= 10;
    } 
    // 2. Détection d'espaces, tirets ou points dans le SIREN
    else if (/[\s.-]/.test(rawSiren) && cleanSirenDigits.length === 9) {
      suggestions.push({
        id: 'siren-format-spaces',
        field: 'supplierSiren',
        fieldLabel: 'Numéro SIREN Fournisseur',
        anomalyType: 'SIREN_FORMAT_SPACES_OR_DOTS',
        severity: 'suggestion',
        currentValue: rawSiren,
        suggestedValue: cleanSirenDigits,
        title: 'Formatage SIREN avec séparateurs ou espaces',
        explanation: `Normalisation en format numérique pur à 9 chiffres ("${cleanSirenDigits}") conforme aux normes Factur-X & DGFiP.`,
        autoFixable: true,
        confidenceScore: 1.0,
        regulationRef: 'Norme Factur-X / EDI PharmaML'
      });
      correctedData.supplierSiren = cleanSirenDigits;
      score -= 5;
    }
    // 3. Détection de longueur invalide (différent de 9)
    else if (cleanSirenDigits.length !== 9) {
      // Vérifier si 8 chiffres (zéro manquant au début)
      if (cleanSirenDigits.length === 8) {
        const withLeadingZero = `0${cleanSirenDigits}`;
        const isLuhnOk = validateLuhnSiren(withLeadingZero);
        suggestions.push({
          id: 'siren-leading-zero',
          field: 'supplierSiren',
          fieldLabel: 'Numéro SIREN Fournisseur',
          anomalyType: 'SIREN_LENGTH_INVALID',
          severity: 'warning',
          currentValue: rawSiren,
          suggestedValue: isLuhnOk ? withLeadingZero : rawSiren,
          title: 'SIREN à 8 chiffres (Zéro non significatif omis)',
          explanation: isLuhnOk 
            ? `Ajout automatique du '0' initial ("${withLeadingZero}") validé par la clé Luhn INSEE.`
            : `Le numéro SIREN comporte 8 chiffres au lieu de 9.`,
          autoFixable: isLuhnOk,
          confidenceScore: isLuhnOk ? 0.95 : 0.6,
          regulationRef: 'Référentiel INSEE SIRENE'
        });
        if (isLuhnOk) {
          cleanSirenDigits = withLeadingZero;
          correctedData.supplierSiren = withLeadingZero;
        }
        score -= 15;
      } else {
        suggestions.push({
          id: 'siren-invalid-len',
          field: 'supplierSiren',
          fieldLabel: 'Numéro SIREN Fournisseur',
          anomalyType: 'SIREN_LENGTH_INVALID',
          severity: 'error',
          currentValue: rawSiren,
          suggestedValue: '',
          title: `Longueur de SIREN incorrecte (${cleanSirenDigits.length} chiffres)`,
          explanation: 'Un numéro SIREN français doit comporter exactement 9 chiffres.',
          autoFixable: false,
          confidenceScore: 1.0,
          regulationRef: 'INSEE'
        });
        score -= 20;
      }
    }

    // 4. Contrôle de la clé de checksum de Luhn si 9 chiffres
    if (cleanSirenDigits.length === 9) {
      const isLuhnValid = validateLuhnSiren(cleanSirenDigits);
      if (!isLuhnValid) {
        suggestions.push({
          id: 'siren-luhn-failed',
          field: 'supplierSiren',
          fieldLabel: 'Numéro SIREN Fournisseur',
          anomalyType: 'SIREN_LUHN_CHECKSUM_FAILED',
          severity: 'error',
          currentValue: rawSiren,
          suggestedValue: '',
          title: 'Clé de contrôle SIREN invalide (Erreur Luhn INSEE)',
          explanation: 'Le numéro SIREN ne respecte pas l\'algorithme mathématique de validation de Luhn (faute de frappe ou inversion de chiffre probable).',
          autoFixable: false,
          confidenceScore: 0.98,
          regulationRef: 'Algorithme Luhn ISO 7064'
        });
        score -= 20;
      } else {
        // Déduction automatique de la TVA Intracommunautaire si absente ou erronée
        const computedTvaIntra = computeFrenchVatIntra(cleanSirenDigits);
        const rawTvaIntra = rawInvoice.supplierTvaIntra ? rawInvoice.supplierTvaIntra.trim().replace(/\s/g, '').toUpperCase() : '';
        if (!rawTvaIntra) {
          suggestions.push({
            id: 'tva-intra-computed',
            field: 'supplierTvaIntra',
            fieldLabel: 'N° TVA Intracommunautaire',
            anomalyType: 'TVA_INTRA_INVALID',
            severity: 'suggestion',
            currentValue: '',
            suggestedValue: computedTvaIntra,
            title: 'Génération automatique du N° TVA Intracommunautaire',
            explanation: `Calcul de la clé fiscale française d'après le SIREN : ${computedTvaIntra}.`,
            autoFixable: true,
            confidenceScore: 1.0,
            regulationRef: 'Art. 242 nonies A CGI'
          });
          correctedData.supplierTvaIntra = computedTvaIntra;
        } else if (rawTvaIntra !== computedTvaIntra && isLuhnValid) {
          suggestions.push({
            id: 'tva-intra-mismatch',
            field: 'supplierTvaIntra',
            fieldLabel: 'N° TVA Intracommunautaire',
            anomalyType: 'TVA_INTRA_INVALID',
            severity: 'warning',
            currentValue: rawTvaIntra,
            suggestedValue: computedTvaIntra,
            title: 'N° TVA Intracommunautaire non concordant avec le SIREN',
            explanation: `Le N° saisi (${rawTvaIntra}) ne correspond pas à la clé mathématique calculée (${computedTvaIntra}).`,
            autoFixable: true,
            confidenceScore: 0.95,
            regulationRef: 'Art. 242 nonies A CGI'
          });
          correctedData.supplierTvaIntra = computedTvaIntra;
          score -= 5;
        }
      }
    }
  }

  // --- B. ANALYSE DU NOM DU FOURNISSEUR ET RECONCILIATION CATALOGUE ---
  const rawSupplierName = rawInvoice.supplierName ? rawInvoice.supplierName.trim() : '';
  if (rawSupplierName) {
    const match = findBestMatchingSupplier(rawSupplierName);
    if (match && match.score < 1.0 && match.score >= 0.7) {
      suggestions.push({
        id: 'supplier-name-fuzzy',
        field: 'supplierName',
        fieldLabel: 'Nom du Fournisseur',
        anomalyType: 'SUPPLIER_TYPO_FUZZY_MATCH',
        severity: 'suggestion',
        currentValue: rawSupplierName,
        suggestedValue: match.supplier.name,
        title: `Rapprochement automatique : "${match.supplier.name}"`,
        explanation: `Détection d'une faute de frappe ou variante de dénomination. Fournisseur officiel identifié (${match.supplier.category}).`,
        autoFixable: true,
        confidenceScore: match.score,
        regulationRef: 'Annuaire National Officine'
      });
      correctedData.supplierName = match.supplier.name;
      correctedData.supplierType = match.supplier.supplierType;

      // Si le SIREN était manquant ou incohérent, on propose le SIREN officiel du catalogue
      if (!cleanSirenDigits || cleanSirenDigits !== match.supplier.siren) {
        if (!cleanSirenDigits) {
          suggestions.push({
            id: 'siren-from-supplier-match',
            field: 'supplierSiren',
            fieldLabel: 'Numéro SIREN Fournisseur',
            anomalyType: 'SIREN_SUPPLIER_MISMATCH',
            severity: 'suggestion',
            currentValue: rawSiren,
            suggestedValue: match.supplier.siren,
            title: `Renseignement automatique du SIREN de ${match.supplier.name}`,
            explanation: `SIREN officiel ${match.supplier.siren} injecté automatiquement depuis le référentiel officine.`,
            autoFixable: true,
            confidenceScore: 0.98,
            regulationRef: 'Base Fournisseurs Officine'
          });
          correctedData.supplierSiren = match.supplier.siren;
          correctedData.supplierTvaIntra = match.supplier.tvaIntra;
        }
      }
    }
  }

  // --- C. ANALYSE DES DATES : DATE D'ÉMISSION & DATE D'ÉCHÉANCE ---
  const rawIssueDate = rawInvoice.issueDate ? String(rawInvoice.issueDate).trim() : '';
  const rawDueDate = rawInvoice.dueDate ? String(rawInvoice.dueDate).trim() : '';

  const parsedIssueDate = parseFlexibleDate(rawIssueDate);
  const parsedDueDate = parseFlexibleDate(rawDueDate);

  if (parsedIssueDate && parsedIssueDate.isValid) {
    correctedData.issueDate = parsedIssueDate.isoDate;
    if (parsedIssueDate.isInvertedCandidate || parsedIssueDate.rawFormat !== 'YYYY-MM-DD') {
      suggestions.push({
        id: 'issue-date-normalized',
        field: 'issueDate',
        fieldLabel: 'Date d\'Émission Facture',
        anomalyType: 'DUE_DATE_INVERTED_MM_DD',
        severity: 'suggestion',
        currentValue: rawIssueDate,
        suggestedValue: parsedIssueDate.isoDate,
        title: 'Normalisation du format de date d\'émission',
        explanation: `Conversion du format d'origine (${rawIssueDate}) vers la norme ISO YYYY-MM-DD (${parsedIssueDate.isoDate}).`,
        autoFixable: true,
        confidenceScore: 0.99
      });
    }
  }

  if (!rawDueDate) {
    // Calcul de date d'échéance par défaut basée sur la date d'émission
    if (parsedIssueDate && parsedIssueDate.isValid) {
      const issueD = new Date(parsedIssueDate.year, parsedIssueDate.month - 1, parsedIssueDate.day);
      const defaultDueD = new Date(issueD);
      defaultDueD.setDate(defaultDueD.getDate() + 30); // 30j standard
      const isoDue = defaultDueD.toISOString().split('T')[0];

      suggestions.push({
        id: 'due-date-missing',
        field: 'dueDate',
        fieldLabel: 'Date d\'Échéance',
        anomalyType: 'MISSING_MANDATORY_FIELD',
        severity: 'warning',
        currentValue: '',
        suggestedValue: isoDue,
        title: 'Date d\'échéance manquante (Calcul à 30 jours net)',
        explanation: `Application du délai légal de paiement standard de 30 jours net (échéance au ${isoDue}).`,
        autoFixable: true,
        confidenceScore: 0.9,
        regulationRef: 'Art. L441-10 Code de Commerce'
      });
      correctedData.dueDate = isoDue;
      score -= 10;
    }
  } else if (parsedDueDate) {
    if (!parsedDueDate.isValid) {
      suggestions.push({
        id: 'due-date-invalid-calendar',
        field: 'dueDate',
        fieldLabel: 'Date d\'Échéance',
        anomalyType: 'DUE_DATE_INVALID_CALENDAR',
        severity: 'error',
        currentValue: rawDueDate,
        suggestedValue: '',
        title: 'Date d\'échéance calendaire impossible',
        explanation: `La date saisie "${rawDueDate}" n'existe pas dans le calendrier (ex: 31 septembre ou 29 février hors année bissextile).`,
        autoFixable: false,
        confidenceScore: 1.0
      });
      score -= 20;
    } else {
      let finalDueIso = parsedDueDate.isoDate;
      const issueD = parsedIssueDate && parsedIssueDate.isValid
        ? new Date(parsedIssueDate.year, parsedIssueDate.month - 1, parsedIssueDate.day)
        : null;
      let dueD = new Date(parsedDueDate.year, parsedDueDate.month - 1, parsedDueDate.day);

      // 1. Détection de date d'échéance inversée (MM/DD au lieu de DD/MM)
      if (parsedDueDate.isInvertedCandidate) {
        suggestions.push({
          id: 'due-date-inverted-mmdd',
          field: 'dueDate',
          fieldLabel: 'Date d\'Échéance',
          anomalyType: 'DUE_DATE_INVERTED_MM_DD',
          severity: 'warning',
          currentValue: rawDueDate,
          suggestedValue: parsedDueDate.isoDate,
          title: 'Format Mois/Jour inversé détecté (MM/DD/YYYY)',
          explanation: `Le jour (>12) a été détecté en seconde position. Reformatage automatique en ${parsedDueDate.isoDate}.`,
          autoFixable: true,
          confidenceScore: 0.95
        });
        score -= 5;
      }

      // 2. Détection d'échéance ANTERIEURE à la date d'émission (Erreur fréquente)
      if (issueD && dueD < issueD) {
        // Vérifier si inversion d'année ou jour/mois
        // Calcul d'une échéance corrigée à 30j ou fin de mois + 15j
        const suggestedD = new Date(issueD);
        suggestedD.setDate(suggestedD.getDate() + 30);
        const suggestedIso = suggestedD.toISOString().split('T')[0];

        suggestions.push({
          id: 'due-date-before-issue',
          field: 'dueDate',
          fieldLabel: 'Date d\'Échéance',
          anomalyType: 'DUE_DATE_BEFORE_ISSUE_DATE',
          severity: 'error',
          currentValue: rawDueDate,
          suggestedValue: suggestedIso,
          title: 'Date d\'échéance antérieure à la date d\'émission',
          explanation: `L'échéance (${parsedDueDate.isoDate}) précède la date de facturation (${parsedIssueDate?.isoDate}). Correction suggérée à 30 jours net (${suggestedIso}).`,
          autoFixable: true,
          confidenceScore: 0.95,
          regulationRef: 'Art. L441-10 Code de Commerce'
        });
        finalDueIso = suggestedIso;
        dueD = suggestedD;
        score -= 20;
      }

      // 3. Détection de dépassement du plafond légal LME (Plafond 60 jours net ou 45 jours fin de mois)
      if (issueD && dueD >= issueD) {
        const diffTime = Math.abs(dueD.getTime() - issueD.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 65) {
          const maxLegalD = new Date(issueD);
          maxLegalD.setDate(maxLegalD.getDate() + 60);
          const maxLegalIso = maxLegalD.toISOString().split('T')[0];

          suggestions.push({
            id: 'due-date-exceeds-lme',
            field: 'dueDate',
            fieldLabel: 'Date d\'Échéance',
            anomalyType: 'DUE_DATE_NON_COMPLIANT_LME',
            severity: 'warning',
            currentValue: rawDueDate,
            suggestedValue: maxLegalIso,
            title: `Délai de paiement non conforme loi LME (${diffDays} jours)`,
            explanation: `Le délai dépasse le maximum légal français de 60 jours net pour les produits de santé. Proposition d'ajustement au plafond légal (${maxLegalIso}).`,
            autoFixable: true,
            confidenceScore: 0.85,
            regulationRef: 'Loi LME / Art. L441-10 C. com'
          });
          score -= 10;
        }
      }

      // 4. Détection de date d'échéance tombant un week-end (Samedi ou Dimanche) -> Décalage au lundi bancaire
      const businessDayCheck = getNextBusinessDay(dueD);
      if (businessDayCheck.wasWeekend) {
        const adjustedIso = businessDayCheck.adjustedDate.toISOString().split('T')[0];
        suggestions.push({
          id: 'due-date-weekend-shift',
          field: 'dueDate',
          fieldLabel: 'Date d\'Échéance',
          anomalyType: 'DUE_DATE_NON_BUSINESS_DAY',
          severity: 'suggestion',
          currentValue: finalDueIso,
          suggestedValue: adjustedIso,
          title: 'Échéance un jour non ouvré (Week-end bancaire)',
          explanation: `La date tombe un samedi/dimanche. Proposition de report au premier jour ouvré bancaire suivant (${adjustedIso}) pour le prélèvement LCR.`,
          autoFixable: true,
          confidenceScore: 0.9,
          regulationRef: 'Règles SEPA / BDF'
        });
        finalDueIso = adjustedIso;
      }

      correctedData.dueDate = finalDueIso;
    }
  }

  // --- D. ANALYSE ET RECONCILIATION DES MONTANTS & TVA ---
  let rawHt = typeof rawInvoice.totalHt === 'string' 
    ? parseFloat(rawInvoice.totalHt.replace(/\s/g, '').replace(',', '.')) 
    : (rawInvoice.totalHt || 0);

  let rawTva = typeof rawInvoice.totalTva === 'string'
    ? parseFloat(rawInvoice.totalTva.replace(/\s/g, '').replace(',', '.'))
    : (rawInvoice.totalTva || 0);

  let rawTtc = typeof rawInvoice.totalTtc === 'string'
    ? parseFloat(rawInvoice.totalTtc.replace(/\s/g, '').replace(',', '.'))
    : (rawInvoice.totalTtc || 0);

  // Détection de virgule/point mal placé ou chiffres sans centimes
  if (rawHt > 0 && rawTtc > 0) {
    const expectedTtc = Math.round((rawHt + rawTva) * 100) / 100;
    const diffTtc = Math.abs(expectedTtc - rawTtc);

    // Si HT + TVA != TTC (écart > 0.05€)
    if (diffTtc > 0.05) {
      // Cas 1 : TVA manquante (TVA = 0 mais TTC > HT)
      if (rawTva === 0 && rawTtc > rawHt) {
        const deducedTva = Math.round((rawTtc - rawHt) * 100) / 100;
        suggestions.push({
          id: 'tax-zero-deduction',
          field: 'totalTva',
          fieldLabel: 'Montant de TVA',
          anomalyType: 'TOTAL_TAX_MATH_INCOHERENCE',
          severity: 'warning',
          currentValue: 0,
          suggestedValue: deducedTva,
          title: `Déduction automatique de la TVA (${deducedTva.toFixed(2)} €)`,
          explanation: `Calcul de la TVA par différence entre TTC (${rawTtc.toFixed(2)} €) et HT (${rawHt.toFixed(2)} €).`,
          autoFixable: true,
          confidenceScore: 0.98,
          regulationRef: 'Art. 289 CGI'
        });
        correctedData.totalTva = deducedTva;
        score -= 10;
      }
      // Cas 2 : TTC erroné ou faute de frappe
      else {
        suggestions.push({
          id: 'tax-math-incoherence',
          field: 'totalTtc',
          fieldLabel: 'Montant Total TTC',
          anomalyType: 'TOTAL_TAX_MATH_INCOHERENCE',
          severity: 'error',
          currentValue: rawTtc,
          suggestedValue: expectedTtc,
          title: `Incohérence mathématique HT + TVA ≠ TTC (Écart de ${diffTtc.toFixed(2)} €)`,
          explanation: `HT (${rawHt.toFixed(2)} €) + TVA (${rawTva.toFixed(2)} €) = ${expectedTtc.toFixed(2)} € TTC. Valeur saisie : ${rawTtc.toFixed(2)} €.`,
          autoFixable: true,
          confidenceScore: 0.95,
          regulationRef: 'Équilibre comptable'
        });
        correctedData.totalTtc = expectedTtc;
        score -= 15;
      }
    }
  } else if (rawHt > 0 && (!rawTtc || rawTtc === 0)) {
    // Calcul automatique TTC avec TVA 2.1% par défaut (médicaments)
    const defaultTva = Math.round((rawHt * 0.021) * 100) / 100;
    const computedTtc = Math.round((rawHt + defaultTva) * 100) / 100;
    suggestions.push({
      id: 'ttc-auto-computed',
      field: 'totalTtc',
      fieldLabel: 'Montant Total TTC',
      anomalyType: 'MISSING_MANDATORY_FIELD',
      severity: 'suggestion',
      currentValue: 0,
      suggestedValue: computedTtc,
      title: 'Calcul automatique du montant TTC (TVA 2,1% officine)',
      explanation: `Génération automatique du TTC (${computedTtc.toFixed(2)} €) basé sur le taux usuel des médicaments remboursables.`,
      autoFixable: true,
      confidenceScore: 0.85
    });
    correctedData.totalTva = defaultTva;
    correctedData.totalTtc = computedTtc;
  }

  // --- E. ANALYSE DU NUMÉRO DE FACTURE ---
  const rawInvoiceNum = rawInvoice.invoiceNumber ? String(rawInvoice.invoiceNumber).trim() : '';
  if (!rawInvoiceNum) {
    suggestions.push({
      id: 'invoice-number-missing',
      field: 'invoiceNumber',
      fieldLabel: 'Numéro de Facture',
      anomalyType: 'MISSING_MANDATORY_FIELD',
      severity: 'error',
      currentValue: '',
      suggestedValue: `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Numéro de facture manquant',
      explanation: 'Un identifiant unique de facture est obligatoire pour la traçabilité comptable et fiscale.',
      autoFixable: true,
      confidenceScore: 0.8,
      regulationRef: 'Art. 242 nonies A CGI'
    });
    score -= 20;
  } else if (/[/\-_]{2,}/.test(rawInvoiceNum)) {
    const cleanedNum = rawInvoiceNum.replace(/[/\-_]{2,}/g, '-');
    suggestions.push({
      id: 'invoice-number-cleaned',
      field: 'invoiceNumber',
      fieldLabel: 'Numéro de Facture',
      anomalyType: 'INVOICE_NUMBER_PREFIX_FORMAT',
      severity: 'suggestion',
      currentValue: rawInvoiceNum,
      suggestedValue: cleanedNum,
      title: 'Séparateurs multiples dans le numéro de facture',
      explanation: `Nettoyage des doubles tirets ou slashes : "${cleanedNum}".`,
      autoFixable: true,
      confidenceScore: 0.95
    });
    correctedData.invoiceNumber = cleanedNum;
  }

  // Calcul du résumé des diffs
  for (const sug of suggestions) {
    if (sug.autoFixable && sug.currentValue !== sug.suggestedValue) {
      diffs.push({
        field: sug.field,
        fieldLabel: sug.fieldLabel,
        before: sug.currentValue,
        after: sug.suggestedValue,
        explanation: sug.explanation
      });
    }
  }

  const errorsCount = suggestions.filter(s => s.severity === 'error').length;
  const warningsCount = suggestions.filter(s => s.severity === 'warning').length;
  const suggestionsCount = suggestions.filter(s => s.severity === 'suggestion').length;

  return {
    isValid: errorsCount === 0,
    scoreConformite: Math.max(0, Math.min(100, score)),
    totalAnomaliesCount: suggestions.length,
    errorsCount,
    warningsCount,
    suggestionsCount,
    suggestions,
    appliedSuggestions: [],
    originalData: { ...rawInvoice },
    correctedData,
    diffs
  };
}

// 5. Exemples / Scénarios de test pour la démonstration interactive
export const MOCK_INVOICE_ERROR_SAMPLES: InvoiceImportRawSample[] = [
  {
    id: 'sample-ocp-siren-spaces-date-inverted',
    title: 'Facture OCP : SIREN espacé + Date d\'échéance inversée (MM/DD)',
    description: 'Cas typique d\'import EDI / OCR où le SIREN contient des espaces ("552 084 795") et la date d\'échéance est au format américain (11/05/2026 au lieu de 05/11/2026).',
    rawInvoice: {
      supplierName: 'O.C.P Repartition',
      supplierSiren: '552 084 795',
      supplierTvaIntra: '',
      invoiceNumber: 'FAC//OCP--2026-9921',
      issueDate: '2026-07-15',
      dueDate: '10/25/2026', // MM/DD format
      totalHt: 14250.00,
      totalTva: 299.25,
      totalTtc: 14549.25,
      supplierType: 'grossiste'
    },
    expectedErrors: ['SIREN avec espaces', 'Date d\'échéance format MM/DD', 'Fournisseur typographié "O.C.P"']
  },
  {
    id: 'sample-biogaran-siret-date-past-vat',
    title: 'Facture Biogaran : SIRET 14 chiffres + Échéance passée + Écart TVA',
    description: 'L\'utilisateur a copié le SIRET 14 chiffres au lieu du SIREN 9 chiffres, l\'échéance est saisie dans le passé (avril au lieu de septembre) et le montant TTC comporte une erreur d\'arrondi.',
    rawInvoice: {
      supplierName: 'Biogaran Lab',
      supplierSiren: '40515321800034', // 14 digits SIRET
      supplierTvaIntra: 'FR00000000000', // Invalid TVA
      invoiceNumber: 'BG-2026-8812',
      issueDate: '2026-07-20',
      dueDate: '2026-04-10', // Before issue date!
      totalHt: 8600.00,
      totalTva: 180.60,
      totalTtc: 9200.00, // Should be 8780.60 !
      supplierType: 'laboratoire_direct'
    },
    expectedErrors: ['SIRET 14 chiffres', 'Échéance antérieure à la date d\'émission', 'HT + TVA ≠ TTC']
  },
  {
    id: 'sample-sanofi-weekend-siren-digit',
    title: 'Facture Sanofi : Échéance un dimanche + SIREN 8 chiffres',
    description: 'Numéro SIREN amputé du zéro de tête ("39503084" -> "395030844") et échéance tombant un dimanche (décalage automatique au lundi ouvré SEPA).',
    rawInvoice: {
      supplierName: 'Sanofi Aventis France',
      supplierSiren: '395030844',
      supplierTvaIntra: 'FR42395030844',
      invoiceNumber: 'SAN-99021-2026',
      issueDate: '2026-07-01',
      dueDate: '2026-08-30', // Dimanche 30 août 2026 !
      totalHt: 5200.00,
      totalTva: 109.20,
      totalTtc: 5309.20,
      supplierType: 'laboratoire_direct'
    },
    expectedErrors: ['Échéance un dimanche (report au lundi 31)', 'Normalisation nom officiel']
  },
  {
    id: 'sample-pfizer-lme-exceeded',
    title: 'Facture Pfizer : Dépassement plafond LME (> 60 jours) + Slashing',
    description: 'Date d\'échéance fixée à 120 jours (non conforme Code de commerce L441-10) et faute de frappe sur le nom de Pfizer.',
    rawInvoice: {
      supplierName: 'Pfizer Holding S.A',
      supplierSiren: '433 623 550',
      supplierTvaIntra: '',
      invoiceNumber: 'PFZ--9702--881',
      issueDate: '2026-07-01',
      dueDate: '2026-11-30', // 152 days! Exceeds 60 days
      totalHt: 24300.00,
      totalTva: 510.30,
      totalTtc: 24810.30,
      supplierType: 'laboratoire_direct'
    },
    expectedErrors: ['Dépassement délai LME (152j > 60j)', 'SIREN avec séparateurs', 'Numéro de facture avec double tiret']
  }
];
