// Utilitaire de parsing des codes-barres officinaux (EAN-13, CIP-13, Datamatrix GS1 2D)

export interface ParsedBarcodeData {
  raw: string;
  format: 'DATAMATRIX_GS1' | 'EAN13_CIP13' | 'CODE128' | 'OTHER';
  cip: string;
  gtin?: string;
  lotNumber?: string;
  expiryDate?: string; // YYYY-MM-DD
  serialNumber?: string;
}

/**
 * Parse un code-barres ou un Datamatrix 2D GS1 de médicament français
 * Format GS1 typique :
 * 01034009300000001727103110AB1234521XYZ987654321
 * ou avec délimiteurs (01)03400930000000(17)271031(10)AB12345(21)XYZ
 */
export function parsePharmacyBarcode(rawValue: string): ParsedBarcodeData {
  const raw = rawValue.trim();

  // 1. Détection format Datamatrix GS1 avec Application Identifiers (AI)
  // AI 01: GTIN (14 chiffres) -> CIP13 est généralement les 13 derniers chiffres (commençant par 34009 ou 34015)
  // AI 17: Date d'expiration (6 chiffres AAMMJJ)
  // AI 10: Numéro de lot (variable jusqu'à 20 car.)
  // AI 21: Numéro de série (variable jusqu'à 20 car.)
  
  if (raw.includes('(01)') || (raw.length > 20 && (raw.startsWith('01') || raw.startsWith(']d2')))) {
    let clean = raw.replace(/^\]d2/, ''); // supprime préfixe scanner GS1 si présent
    
    let gtin = '';
    let cip = '';
    let expiryDate = '';
    let lotNumber = '';
    let serialNumber = '';

    // Si format avec parenthèses: (01)...(17)...(10)...(21)...
    if (clean.includes('(01)')) {
      const gtinMatch = clean.match(/\(01\)(\d{14})/);
      if (gtinMatch) {
        gtin = gtinMatch[1];
        cip = gtin.startsWith('0') ? gtin.substring(1) : gtin;
      }

      const expMatch = clean.match(/\(17\)(\d{6})/);
      if (expMatch) {
        expiryDate = formatGs1Date(expMatch[1]);
      }

      const lotMatch = clean.match(/\(10\)([^\(\)]+)/);
      if (lotMatch) {
        lotNumber = lotMatch[1].trim();
      }

      const snMatch = clean.match(/\(21\)([^\(\)]+)/);
      if (snMatch) {
        serialNumber = snMatch[1].trim();
      }
    } else {
      // Format continu sans parenthèses: 01034009367746181727093010LOT998...
      // 01 (2 car) + 14 chiffres GTIN
      if (clean.startsWith('01') && clean.length >= 16) {
        gtin = clean.substring(2, 16);
        cip = gtin.startsWith('0') ? gtin.substring(1) : gtin;
        let rest = clean.substring(16);

        // Recherche AI 17 pour la date
        if (rest.startsWith('17') && rest.length >= 8) {
          const expRaw = rest.substring(2, 8);
          expiryDate = formatGs1Date(expRaw);
          rest = rest.substring(8);
        }

        // Recherche AI 10 pour le lot
        if (rest.startsWith('10')) {
          rest = rest.substring(2);
          // Le lot va jusqu'au prochain AI 21 ou la fin
          const pos21 = rest.indexOf('21');
          if (pos21 !== -1 && pos21 > 0) {
            lotNumber = rest.substring(0, pos21);
            serialNumber = rest.substring(pos21 + 2);
          } else {
            lotNumber = rest;
          }
        }
      }
    }

    return {
      raw,
      format: 'DATAMATRIX_GS1',
      cip: cip || raw,
      gtin,
      lotNumber: lotNumber || undefined,
      expiryDate: expiryDate || undefined,
      serialNumber: serialNumber || undefined
    };
  }

  // 2. Format standard EAN-13 / CIP-13 (13 chiffres commençant par 34009 ou 34015 ou standard EAN)
  const numericOnly = raw.replace(/\D/g, '');
  if (numericOnly.length === 13) {
    return {
      raw,
      format: 'EAN13_CIP13',
      cip: numericOnly
    };
  }

  // 3. Code CIP-7 classique (7 chiffres) convertible en CIP13
  if (numericOnly.length === 7) {
    return {
      raw,
      format: 'EAN13_CIP13',
      cip: `34009${numericOnly}` // standard conversion
    };
  }

  // 4. Autre code-barres (Code 128, etc.)
  return {
    raw,
    format: 'OTHER',
    cip: raw
  };
}

/**
 * Convertit une date GS1 AAMMJJ en YYYY-MM-DD
 * Ex: 271031 -> 2027-10-31
 * Si jour = 00, on prend le dernier jour du mois
 */
function formatGs1Date(yymmdd: string): string {
  if (yymmdd.length !== 6) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  let dd = yymmdd.substring(4, 6);

  const fullYear = yy < 50 ? 2000 + yy : 1900 + yy;
  if (dd === '00') {
    // Calcul du dernier jour du mois
    const monthNum = parseInt(mm, 10);
    const lastDay = new Date(fullYear, monthNum, 0).getDate();
    dd = String(lastDay).padStart(2, '0');
  }

  return `${fullYear}-${mm}-${dd}`;
}
