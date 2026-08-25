import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  ChevronDown, 
  ChevronRight, 
  ArrowUpRight, 
  Percent, 
  Coins, 
  ShieldAlert, 
  Scale, 
  Sparkles, 
  FileText, 
  Copy, 
  RefreshCw, 
  Layers, 
  X, 
  SlidersHorizontal,
  Info,
  Check
} from 'lucide-react';
import { 
  SupplierPriceHistorySummary, 
  ProductPriceHistory, 
  NegotiationStatus 
} from '../types/purchasingAndDiscounts';
import { MOCK_SUPPLIER_PRICE_HISTORIES } from '../data/mockPurchasingAndDiscounts';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface SupplierPriceHistoryViewProps {
  initialSuppliers?: SupplierPriceHistorySummary[];
  onBackToAlerts?: () => void;
}

export const SupplierPriceHistoryView: React.FC<SupplierPriceHistoryViewProps> = ({
  initialSuppliers = MOCK_SUPPLIER_PRICE_HISTORIES,
  onBackToAlerts
}) => {
  const [suppliers, setSuppliers] = useState<SupplierPriceHistorySummary[]>(initialSuppliers);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.supplierId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [minHikePct, setMinHikePct] = useState<number>(0);
  const [expandedProductCips, setExpandedProductCips] = useState<Set<string>>(new Set());

  // Modal negotiation proposal
  const [activeNegotiationSupplier, setActiveNegotiationSupplier] = useState<SupplierPriceHistorySummary | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Currently active supplier
  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.supplierId === selectedSupplierId) || suppliers[0];
  }, [suppliers, selectedSupplierId]);

  // Overall KPIs across all suppliers
  const globalStats = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const totalPurchasesHt = suppliers.reduce((acc, s) => acc + s.annualPurchasesVolumeHt, 0);
    const totalOvercostEuros = suppliers.reduce((acc, s) => acc + s.totalAnnualOvercostEuros, 0);
    const allProducts = suppliers.flatMap(s => s.products);
    const totalImpactedProducts = allProducts.length;
    const avgHikePct = allProducts.length > 0 
      ? allProducts.reduce((acc, p) => acc + p.totalVariationPct, 0) / allProducts.length 
      : 0;
    const urgentNegotiationsCount = suppliers.filter(s => s.negotiationPriority === 'urgente').length;

    return {
      totalSuppliers,
      totalPurchasesHt,
      totalOvercostEuros,
      totalImpactedProducts,
      avgHikePct,
      urgentNegotiationsCount
    };
  }, [suppliers]);

  // Filtered products for active supplier
  const filteredProducts = useMemo(() => {
    if (!selectedSupplier) return [];
    return selectedSupplier.products.filter(p => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cip.includes(searchQuery) ||
        (p.dci && p.dci.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.laboratory.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || p.negotiationStatus === statusFilter;
      const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
      const matchMinHike = p.totalVariationPct >= minHikePct;

      return matchSearch && matchStatus && matchCategory && matchMinHike;
    });
  }, [selectedSupplier, searchQuery, statusFilter, categoryFilter, minHikePct]);

  // Toggle expanded timeline for a product
  const toggleExpandProduct = (cip: string) => {
    setExpandedProductCips(prev => {
      const next = new Set(prev);
      if (next.has(cip)) {
        next.delete(cip);
      } else {
        next.add(cip);
      }
      return next;
    });
  };

  // Update negotiation status
  const handleUpdateProductStatus = (cip: string, newStatus: NegotiationStatus) => {
    setSuppliers(prev => prev.map(s => {
      if (s.supplierId === selectedSupplier.supplierId) {
        return {
          ...s,
          products: s.products.map(p => {
            if (p.cip === cip) {
              return { ...p, negotiationStatus: newStatus };
            }
            return p;
          })
        };
      }
      return s;
    }));

    const statusLabels: Record<NegotiationStatus, string> = {
      a_negocier: 'À négocier',
      en_cours: 'En cours de négociation',
      remise_obtenue: 'Remise / Avoir obtenu',
      refuse_par_labo: 'Refusé par le laboratoire',
      substitue: 'Substitué vers alternative'
    };

    showToast(`Statut mis à jour : "${statusLabels[newStatus]}" pour ${cip}`);
    if (newStatus === 'remise_obtenue') {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Export CSV for the selected supplier (Dossier de renégociation tarifaire labo)
  const handleExportSupplierRenegotiationCsv = (supplier: SupplierPriceHistorySummary) => {
    const csvData = supplier.products.map(p => {
      const lastPoint = p.historyPoints[p.historyPoints.length - 1];
      const prevPoint = p.historyPoints[0];
      return {
        'Fournisseur / Laboratoire': supplier.supplierName,
        'Contact Délégué': supplier.contactCommercial ? `${supplier.contactCommercial.name} (${supplier.contactCommercial.email})` : 'N/A',
        'Code CIP (13 chiffres)': p.cip,
        'Désignation Spécialité': p.name,
        'DCI / Matière active': p.dci || 'N/A',
        'Catégorie': p.category,
        'Prix Achat HT Initial N-1 (€)': p.basePriceHtNMinus1.toFixed(2),
        'Prix Achat HT Actuel N (€)': p.currentPriceHt.toFixed(2),
        'Surcoût Unitaire (€)': (p.currentPriceHt - p.basePriceHtNMinus1).toFixed(2),
        'Hausse Tarifaire (%)': `${p.totalVariationPct > 0 ? '+' : ''}${p.totalVariationPct.toFixed(2)}%`,
        'Marge Brute Initiale (%)': `${p.targetMarginPct.toFixed(1)}%`,
        'Marge Brute Actuelle (%)': `${p.currentMarginPct.toFixed(1)}%`,
        'Érosion Marge (Points)': `-${p.marginErosionPts.toFixed(1)} pts`,
        'Volume Annuel Officine (Unités)': p.annualVolumeUnits,
        'Surcoût Annuel Officine (€ HT)': p.totalAnnualExtraCostEuros.toFixed(2),
        'Remise Compensatoire Demandée (%)': `+${p.requestedCompensationRatePct.toFixed(1)}%`,
        'Avoir Compensatoire Requis (€)': p.requestedCreditNoteEuros.toFixed(2),
        'Statut Négociation': p.negotiationStatus,
        'Justification Labo': p.laboJustification || 'Hausse unilatérale catalogue',
        'Dernière Facture Source': lastPoint ? `${lastPoint.invoiceRef} (${lastPoint.date})` : 'N/A',
        'Produit de Substitution / Levier': p.substituteAlternative ? `${p.substituteAlternative.name} (${p.substituteAlternative.laboratory})` : 'Aucun'
      };
    });

    const filename = `dossier_renegociation_${supplier.supplierName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    exportToCsv(csvData, filename);
    showToast(`Dossier de renégociation CSV exporté pour ${supplier.supplierName}`);
    confetti({ particleCount: 30, spread: 50 });
  };

  // Export CSV for ALL suppliers consolidated
  const handleExportAllSuppliersCsv = () => {
    const csvData: any[] = [];
    suppliers.forEach(s => {
      s.products.forEach(p => {
        const lastPoint = p.historyPoints[p.historyPoints.length - 1];
        csvData.push({
          'Fournisseur': s.supplierName,
          'Type': s.supplierType,
          'Priorité Négociation': s.negotiationPriority,
          'Code CIP': p.cip,
          'Produit': p.name,
          'DCI': p.dci || '',
          'Catégorie': p.category,
          'Prix Achat HT N-1 (€)': p.basePriceHtNMinus1.toFixed(2),
          'Prix Achat HT Actuel (€)': p.currentPriceHt.toFixed(2),
          'Hausse (%)': `${p.totalVariationPct > 0 ? '+' : ''}${p.totalVariationPct.toFixed(2)}%`,
          'Marge Initiale (%)': `${p.targetMarginPct.toFixed(1)}%`,
          'Marge Actuelle (%)': `${p.currentMarginPct.toFixed(1)}%`,
          'Érosion Marge (pts)': `-${p.marginErosionPts.toFixed(1)} pts`,
          'Volume Annuel (Unités)': p.annualVolumeUnits,
          'Surcoût Annuel (€ HT)': p.totalAnnualExtraCostEuros.toFixed(2),
          'Remise Compensatoire Demandée (%)': `+${p.requestedCompensationRatePct.toFixed(1)}%`,
          'Statut Négociation': p.negotiationStatus,
          'Dernier Document': lastPoint ? `${lastPoint.invoiceRef} (${lastPoint.date})` : '',
          'Justification Notée': p.laboJustification || ''
        });
      });
    });

    const filename = `historique_variations_prix_achats_tous_fournisseurs_${new Date().toISOString().split('T')[0]}`;
    exportToCsv(csvData, filename);
    showToast('Historique consolidé de toutes les variations fournisseurs exporté en CSV.');
  };

  // Generate negotiation formal letter text
  const generateNegotiationLetter = (supplier: SupplierPriceHistorySummary) => {
    const totalExtraCost = supplier.totalAnnualOvercostEuros;
    const avgHike = supplier.averagePriceHikePct;
    const impactedCount = supplier.products.length;

    const productLines = supplier.products.map((p, idx) => 
      `${idx + 1}. ${p.name} (CIP: ${p.cip})
   - Tarif N-1 : ${p.basePriceHtNMinus1.toFixed(2)} € HT  →  Tarif N : ${p.currentPriceHt.toFixed(2)} € HT (+${p.totalVariationPct.toFixed(1)}%)
   - Volume annuel officine : ${p.annualVolumeUnits} unités  |  Surcoût annuel subi : ${p.totalAnnualExtraCostEuros.toFixed(2)} € HT
   - Érosion de marge brute : -${p.marginErosionPts.toFixed(1)} points (de ${p.targetMarginPct.toFixed(1)}% à ${p.currentMarginPct.toFixed(1)}%)
   - Demande officine : Remise compensatoire de +${p.requestedCompensationRatePct.toFixed(1)}% ou avoir compensatoire de ${p.requestedCreditNoteEuros.toFixed(2)} €`
    ).join('\n\n');

    return `Grande Pharmacie de l'Hôtel de Ville
Docteur en Pharmacie - Pharmacien Titulaire
75001 Paris - Tél : 01 42 68 00 12

À l'attention de : ${supplier.contactCommercial?.name || 'Direction Commerciale'}
Laboratoire / Fournisseur : ${supplier.supplierName}
Email : ${supplier.contactCommercial?.email || 'service.commercial@laboratoire.com'}

Paris, le ${new Date().toLocaleDateString('fr-FR')}

OBJET : Dossier d'audit des hausses tarifaires et demande de réévaluation des conditions commerciales (Exercice 2026)

Madame, Monsieur,

Dans le cadre du contrôle de gestion annuel et du suivi de nos achats officinaux (volume annuel réalisé de ${formatCurrency(supplier.annualPurchasesVolumeHt)} HT avec votre établissement), notre audit contradictoire met en évidence une série de hausses tarifaires unilatérales significatives sur ${impactedCount} références stratégiques de votre gamme.

Sur l'ensemble de ces références, la hausse moyenne constatée s'élève à +${avgHike.toFixed(2)}%, générant pour notre officine un surcoût financier direct de ${formatCurrency(totalExtraCost)} HT par an et une érosion de notre marge brute de ${supplier.totalMarginErosionPts.toFixed(1)} points.

Dans un contexte de forte régulation économique et de plafonnement des prix publics réglementés, notre officine ne peut absorber cette charge unilatérale sans compensation.

--- ÉTAT DÉTAILLÉ DES RÉFÉRENCES IMPACTÉES ---

${productLines}

--- PROPOSITIONS D'ACCORD COMMERCIAL POUR RENÉGOCIATION ---

Afin de préserver nos volumes de commande préférentiels et notre partenariat historique, nous vous demandons formellement :
1. Une revalorisation de nos remises directes sur facture de +${supplier.suggestedRemiseCompensationPct.toFixed(1)}% sur l'ensemble de la gamme concernée.
2. L'émission d'un avoir compensatoire global de ${formatCurrency(totalExtraCost * 0.8)} à imputer sur la prochaine commande d'approvisionnement.
3. À défaut d'accord lors de notre prochain rendez-vous commercial prévu le ${supplier.contactCommercial?.nextMeetingDate ? formatDate(supplier.contactCommercial.nextMeetingDate) : 'très prochainement'}, nous serions contraints de basculer nos volumes de délivrance vers les laboratoires concurrents et génériques alternatifs d'ores et déjà qualifiés.

Restant à votre disposition pour convenir d'un échange constructif, nous vous prions d'agréer, Madame, Monsieur, nos salutations confraternelles.

Le Pharmacien Titulaire`;
  };

  const handleCopyLetter = () => {
    if (!activeNegotiationSupplier) return;
    const text = generateNegotiationLetter(activeNegotiationSupplier);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    showToast('Argumentaire copié dans le presse-papier !');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const getPriorityBadge = (priority: 'urgente' | 'haute' | 'moderee' | 'faible') => {
    switch (priority) {
      case 'urgente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>Négociation Urgente</span>
          </span>
        );
      case 'haute':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Priorité Haute</span>
          </span>
        );
      case 'moderee':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <span>Suivi Standard</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: NegotiationStatus) => {
    switch (status) {
      case 'a_negocier':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>À contester / négocier</span>
          </span>
        );
      case 'en_cours':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>En négociation</span>
          </span>
        );
      case 'remise_obtenue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Remise / Avoir obtenu</span>
          </span>
        );
      case 'substitue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <RefreshCw className="w-3 h-3 text-purple-500" />
            <span>Substitué (Levier actif)</span>
          </span>
        );
      case 'refuse_par_labo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>Refusé / Clôturé</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in text-sm font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Context */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Module Négociations & Achats Officinaux
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Exercice 2026 • Données contradictoires
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>Historique des Variations de Prix par Fournisseur</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Suivi chronologique des hausses tarifaires subies par laboratoire et grossiste. Générez des dossiers d'argumentaire chiffrés et exportez des bordereaux CSV probants pour justifier vos renégociations commerciales et préserver vos marges.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToAlerts && (
            <button
              onClick={onBackToAlerts}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>← Alertes Unitaires</span>
            </button>
          )}

          <button
            onClick={handleExportAllSuppliersCsv}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Export CSV Consolidé (Tous Fournisseurs)</span>
          </button>
        </div>
      </div>

      {/* Global KPIs Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Surcoût Annuel Global Subi</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl md:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            +{formatCurrency(globalStats.totalOvercostEuros)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Perte directe de marge officine à renégocier
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Références Impactées</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {globalStats.totalImpactedProducts} <span className="text-xs font-normal text-slate-500">lignes</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Sur {globalStats.totalSuppliers} laboratoires & grossistes audités
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Hausse Moyenne Subie</span>
            <Percent className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            +{globalStats.avgHikePct.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Taux moyen catalogue vs tarifs N-1
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-1">
            <span>Dossiers Urgents RDV</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-xl md:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {globalStats.urgentNegotiationsCount} <span className="text-xs font-normal text-slate-500">fournisseurs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Surcoûts &gt; 1 000 € ou perte &gt; 3 pts de marge
          </div>
        </div>
      </div>

      {/* Main Grid: Suppliers Selector (Left) + Detail Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Suppliers List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Laboratoires & Grossistes ({suppliers.length})</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {suppliers.map(supplier => {
              const isSelected = supplier.supplierId === selectedSupplier?.supplierId;
              return (
                <div
                  key={supplier.supplierId}
                  onClick={() => setSelectedSupplierId(supplier.supplierId)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border text-left ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">
                      {supplier.supplierName}
                    </span>
                    {getPriorityBadge(supplier.negotiationPriority)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-100 dark:bg-slate-800/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Achats Annuels HT</span>
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        {formatCurrency(supplier.annualPurchasesVolumeHt)}
                      </span>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 block">Surcoût Annuel</span>
                      <span className="font-black font-mono text-rose-700 dark:text-rose-300">
                        +{formatCurrency(supplier.totalAnnualOvercostEuros)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{supplier.products.length} réf. avec hausses (+{supplier.averagePriceHikePct.toFixed(1)}% moy.)</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                      Voir dossier <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Supplier View & Product Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedSupplier ? (
            <>
              {/* Supplier Header Banner with Commercial Contact & Action */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {selectedSupplier.supplierType === 'laboratoire_direct' ? 'Laboratoire Direct Officine' : 'Grossiste Répartiteur'}
                      </span>
                      {getPriorityBadge(selectedSupplier.negotiationPriority)}
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                      {selectedSupplier.supplierName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveNegotiationSupplier(selectedSupplier)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                    >
                      <FileText className="w-4 h-4 text-indigo-200" />
                      <span>Dossier de Négociation RDV</span>
                    </button>

                    <button
                      onClick={() => handleExportSupplierRenegotiationCsv(selectedSupplier)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-4 h-4 text-emerald-200" />
                      <span>Export CSV Labo</span>
                    </button>
                  </div>
                </div>

                {/* Commercial Contact Bar & Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                  {selectedSupplier.contactCommercial ? (
                    <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{selectedSupplier.contactCommercial.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({selectedSupplier.contactCommercial.role})</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {selectedSupplier.contactCommercial.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {selectedSupplier.contactCommercial.email}
                        </span>
                      </div>
                      {selectedSupplier.contactCommercial.nextMeetingDate && (
                        <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 pt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          <span>Prochain RDV : {formatDate(selectedSupplier.contactCommercial.nextMeetingDate)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-slate-500">
                      Contact commercial central
                    </div>
                  )}

                  <div className="md:col-span-7 bg-indigo-50/70 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-200/80 dark:border-indigo-800/50 space-y-1">
                    <div className="font-black text-indigo-900 dark:text-indigo-200 text-[11px] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Objectif & Remise Compensatoire Cible</span>
                      </span>
                      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                        +{selectedSupplier.suggestedRemiseCompensationPct.toFixed(1)}% demandé
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-950 dark:text-indigo-300/90 line-clamp-2">
                      {selectedSupplier.negotiationNotes || 'Exiger le maintien du barème N-1 ou une remise directe majorée.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Table & Filters */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                
                {/* Search and Filters Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrer produit, CIP, DCI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="a_negocier">À contester / négocier</option>
                      <option value="en_cours">En négociation</option>
                      <option value="remise_obtenue">Remise obtenue</option>
                      <option value="substitue">Substitué</option>
                    </select>

                    <select
                      value={minHikePct}
                      onChange={(e) => setMinHikePct(Number(e.target.value))}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <option value={0}>Toutes variations</option>
                      <option value={5}>Hausses &ge; 5%</option>
                      <option value={10}>Hausses &ge; 10%</option>
                    </select>

                    <span className="text-xs text-slate-500 font-mono whitespace-nowrap pl-1">
                      {filteredProducts.length} réf.
                    </span>
                  </div>
                </div>

                {/* Products List with Expandable Price Timelines */}
                <div className="space-y-3">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Aucune référence ne correspond aux filtres sélectionnés.
                      </p>
                    </div>
                  ) : (
                    filteredProducts.map(product => {
                      const isExpanded = expandedProductCips.has(product.cip);
                      return (
                        <div
                          key={product.cip}
                          className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/90 transition shadow-xs"
                        >
                          {/* Product Main Row */}
                          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            
                            {/* Product Info */}
                            <div className="space-y-1 md:max-w-[42%]">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  CIP {product.cip}
                                </span>
                                {getStatusBadge(product.negotiationStatus)}
                                <span className="text-[10px] text-slate-400 capitalize">
                                  {product.category.replace('_', ' ')}
                                </span>
                              </div>

                              <div className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                                {product.name}
                              </div>

                              {product.dci && (
                                <div className="text-[11px] text-slate-500 font-mono">
                                  DCI : {product.dci}
                                </div>
                              )}
                            </div>

                            {/* Price Comparison & Impact */}
                            <div className="grid grid-cols-3 gap-3 text-xs text-left md:text-right">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Tarif N-1 → Actuel</span>
                                <div className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                                  <span className="line-through text-slate-400 text-[11px] mr-1">
                                    {product.basePriceHtNMinus1.toFixed(2)}€
                                  </span>
                                  <span>{product.currentPriceHt.toFixed(2)}€</span>
                                </div>
                                <span className="text-[11px] font-black text-rose-600 font-mono">
                                  +{product.totalVariationPct.toFixed(1)}%
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 block">Marge Brute</span>
                                <div className="font-mono text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                                  {product.targetMarginPct.toFixed(1)}% → {product.currentMarginPct.toFixed(1)}%
                                </div>
                                <span className="text-[11px] font-bold text-rose-600 font-mono">
                                  -{product.marginErosionPts.toFixed(1)} pts
                                </span>
                              </div>

                              <div className="bg-rose-50 dark:bg-rose-950/30 p-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30 text-right">
                                <span className="text-[10px] text-rose-600 dark:text-rose-400 block">Surcoût Annuel</span>
                                <div className="font-mono font-black text-rose-700 dark:text-rose-300 text-sm">
                                  +{formatCurrency(product.totalAnnualExtraCostEuros)}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ({product.annualVolumeUnits} u./an)
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons & Expand */}
                            <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 justify-between md:justify-end">
                              <select
                                value={product.negotiationStatus}
                                onChange={(e) => handleUpdateProductStatus(product.cip, e.target.value as NegotiationStatus)}
                                className="text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 font-bold"
                              >
                                <option value="a_negocier">À négocier</option>
                                <option value="en_cours">En cours</option>
                                <option value="remise_obtenue">Remise obtenue</option>
                                <option value="substitue">Substitué</option>
                                <option value="refuse_par_labo">Refusé</option>
                              </select>

                              <button
                                onClick={() => toggleExpandProduct(product.cip)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1 transition"
                              >
                                <span>{isExpanded ? 'Masquer' : 'Historique'}</span>
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Section: Price History Timeline & Substitute Lever */}
                          {isExpanded && (
                            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
                              
                              {/* Price History Points Timeline */}
                              <div>
                                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Chronologie des Factures & Tarifs Achat (Historique N-1 / N)</span>
                                </h5>

                                <div className="space-y-2">
                                  {product.historyPoints.map((point, pIdx) => (
                                    <div 
                                      key={pIdx}
                                      className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                          {formatDate(point.date)}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                                          {point.invoiceRef}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                          ({point.invoiceType.replace('_', ' ')})
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-4 text-xs font-mono">
                                        <div>
                                          <span className="text-[10px] text-slate-400 mr-1">Prix Achat HT:</span>
                                          <span className="font-bold text-slate-900 dark:text-white">{point.priceHt.toFixed(2)} €</span>
                                        </div>
                                        <div>
                                          <span className="text-[10px] text-slate-400 mr-1">Remise:</span>
                                          <span className="font-medium text-emerald-600">{point.discountRatePct.toFixed(1)}%</span>
                                        </div>
                                        <div>
                                          <span className="text-[10px] text-slate-400 mr-1">Marge:</span>
                                          <span className="font-bold text-indigo-600">{point.marginRatePct.toFixed(1)}%</span>
                                        </div>
                                      </div>

                                      {point.comment && (
                                        <div className="text-[11px] text-slate-500 italic sm:max-w-xs truncate">
                                          "{point.comment}"
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Justification & Commercial Negotiation Lever */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                                    Motif / Justification du laboratoire :
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                                    {product.laboJustification || 'Hausse unilatérale catalogue sans justification circonstanciée.'}
                                  </p>
                                </div>

                                {product.substituteAlternative ? (
                                  <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-lg border border-purple-200 dark:border-purple-800 text-xs">
                                    <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1 mb-1">
                                      <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                                      <span>Levier de substitution concurrent :</span>
                                    </span>
                                    <p className="text-[11px] text-purple-950 dark:text-purple-300">
                                      {product.substituteAlternative.name} ({product.substituteAlternative.laboratory}) à {product.substituteAlternative.priceHt.toFixed(2)} € HT.
                                      <span className="font-bold block text-purple-700 dark:text-purple-300 mt-0.5">
                                        Gain potentiel : +{formatCurrency(product.substituteAlternative.estimatedSavings)} / an
                                      </span>
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs">
                                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block mb-1">
                                      Demande compensatoire chiffrée :
                                    </span>
                                    <p className="text-[11px] text-indigo-950 dark:text-indigo-300">
                                      Remise de ligne à réévaluer de <strong>+{product.requestedCompensationRatePct.toFixed(1)}%</strong> ou avoir compensatoire de <strong>{formatCurrency(product.requestedCreditNoteEuros)}</strong>.
                                    </p>
                                  </div>
                                )}
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Sélectionnez un laboratoire pour consulter son historique de prix
              </h3>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Negotiation Proposal & Formal Letter Generator */}
      {activeNegotiationSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-scale-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Dossier d'Argumentaire Commercial & Lettre de Négociation
                </h3>
              </div>
              <button
                onClick={() => setActiveNegotiationSupplier(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
              <div className="font-bold text-indigo-900 dark:text-indigo-200">
                Synthèse pour {activeNegotiationSupplier.supplierName} :
              </div>
              <p className="text-indigo-800 dark:text-indigo-300">
                {activeNegotiationSupplier.products.length} références impactées • Hausse moyenne de +{activeNegotiationSupplier.averagePriceHikePct.toFixed(1)}% • Surcoût annuel direct de <strong>{formatCurrency(activeNegotiationSupplier.totalAnnualOvercostEuros)} HT</strong> • Érosion de marge brute : <strong>-{activeNegotiationSupplier.totalMarginErosionPts.toFixed(1)} pts</strong>.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
              {generateNegotiationLetter(activeNegotiationSupplier)}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap">
              <button
                onClick={() => handleExportSupplierRenegotiationCsv(activeNegotiationSupplier)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Fichier CSV de Renégociation</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLetter}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText ? 'Copié !' : 'Copier l\'Argumentaire'}</span>
                </button>

                <button
                  onClick={() => setActiveNegotiationSupplier(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                >
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
