import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowRight, 
  Tag, 
  Building2, 
  FileText, 
  Mail, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  Percent, 
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Layers,
  ShoppingBag,
  Clock,
  X
} from 'lucide-react';
import { PurchasePriceVariation, PriceVariationSeverity, PriceVariationStatus } from '../types/purchasingAndDiscounts';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface PurchasePriceVariationViewProps {
  variations: PurchasePriceVariation[];
  onUpdateVariationStatus?: (id: string, newStatus: PriceVariationStatus, newPublicPrice?: number) => void;
  onContestVariation?: (variation: PurchasePriceVariation, letterContent: string) => void;
}

export const PurchasePriceVariationView: React.FC<PurchasePriceVariationViewProps> = ({
  variations,
  onUpdateVariationStatus,
  onContestVariation
}) => {
  const [items, setItems] = useState<PurchasePriceVariation[]>(variations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLabo, setSelectedLabo] = useState<string>('all');
  const [minDeltaPct, setMinDeltaPct] = useState<number>(0);

  // Modals state
  const [adjustModalItem, setAdjustModalItem] = useState<PurchasePriceVariation | null>(null);
  const [adjustNewPriceTtc, setAdjustNewPriceTtc] = useState<number>(0);
  const [contestModalItem, setContestModalItem] = useState<PurchasePriceVariation | null>(null);
  const [contestLetterText, setContestLetterText] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Distinct laboratories
  const laboratories = Array.from(new Set(items.map(i => i.laboratory))).sort();

  // Filtered items
  const filteredVariations = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cip.includes(searchQuery) ||
      item.laboratory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesLabo = selectedLabo === 'all' || item.laboratory === selectedLabo;
    const matchesMinDelta = Math.abs(item.deltaPercentage) >= minDeltaPct;

    return matchesSearch && matchesSeverity && matchesStatus && matchesLabo && matchesMinDelta;
  });

  // KPIs
  const totalHikesCount = items.filter(i => i.deltaAmountHt > 0).length;
  const criticalHikesCount = items.filter(i => i.severity === 'critique' || i.severity === 'haute').length;
  const totalAnnualLossPotential = items
    .filter(i => i.deltaAmountHt > 0 && i.status === 'non_traite')
    .reduce((acc, i) => acc + i.estimatedAnnualImpactEuros, 0);
  const priceDecreasesCount = items.filter(i => i.deltaAmountHt < 0).length;

  const handleOpenAdjustModal = (item: PurchasePriceVariation) => {
    setAdjustModalItem(item);
    setAdjustNewPriceTtc(item.suggestedPublicPriceTtc);
  };

  const handleConfirmAdjustPrice = () => {
    if (!adjustModalItem) return;
    
    setItems(prev => prev.map(i => {
      if (i.id === adjustModalItem.id) {
        return {
          ...i,
          currentPublicPriceTtc: adjustNewPriceTtc,
          status: 'prix_vente_ajuste',
          notes: `Prix de vente TTC ajusté à ${adjustNewPriceTtc.toFixed(2)} € le ${new Date().toLocaleDateString('fr-FR')}`
        };
      }
      return i;
    }));

    if (onUpdateVariationStatus) {
      onUpdateVariationStatus(adjustModalItem.id, 'prix_vente_ajuste', adjustNewPriceTtc);
    }

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    showToast(`Prix de vente mis à jour à ${adjustNewPriceTtc.toFixed(2)} € TTC. Marge préservée !`);
    setAdjustModalItem(null);
  };

  const handleOpenContestModal = (item: PurchasePriceVariation) => {
    setContestModalItem(item);
    setContestLetterText(
`À l'attention de la Direction Commerciale - ${item.supplier}
Laboratoire : ${item.laboratory}

Objet : Contestation de hausse tarifaire non justifiée sur ${item.name} (CIP: ${item.cip})

Madame, Monsieur,

Lors du contrôle de nos factures d'achat récentes (${item.sourceDocument}), nous constatons une hausse tarifaire unilatérale de ${item.deltaPercentage.toFixed(1)}% (passage de ${item.previousPriceHt.toFixed(2)} € HT à ${item.newPriceHt.toFixed(2)} € HT, soit un surcoût de +${item.deltaAmountHt.toFixed(2)} €/unité).

Cette hausse n'ayant fait l'objet d'aucun préavis contractuel et dégradant la rentabilité réglementée de notre officine (perte de marge annuelle estimée à ${item.estimatedAnnualImpactEuros.toFixed(2)} €), nous sollicitons par la présente :
1. L'application du tarif convenu contractuellement.
2. L'émission d'un avoir compensatoire sur la prochaine facture/traite LCR.
3. À défaut, la réévaluation de nos remises de groupement ou conditions commerciales.

Dans l'attente de votre retour, veuillez agréer, Madame, Monsieur, nos salutations distinguées.

Le Pharmacien Titulaire - Grande Pharmacie de l'Hôtel de Ville`
    );
  };

  const handleSendContestation = () => {
    if (!contestModalItem) return;

    setItems(prev => prev.map(i => {
      if (i.id === contestModalItem.id) {
        return {
          ...i,
          status: 'en_contestation',
          notes: `Courrier de contestation transmis le ${new Date().toLocaleDateString('fr-FR')}`
        };
      }
      return i;
    }));

    if (onContestVariation) {
      onContestVariation(contestModalItem, contestLetterText);
    }

    showToast(`Courrier de contestation enregistré et transmis au délégué ${contestModalItem.supplier}.`);
    setContestModalItem(null);
  };

  const handleExportVariationsCsv = () => {
    const data = filteredVariations.map(v => ({
      'Code CIP': v.cip,
      'Produit': v.name,
      'Laboratoire': v.laboratory,
      'Fournisseur': v.supplier,
      'Catégorie': v.category,
      'Ancien Prix HT (€)': v.previousPriceHt,
      'Nouveau Prix HT (€)': v.newPriceHt,
      'Écart (€)': v.deltaAmountHt,
      'Variation (%)': `${v.deltaPercentage > 0 ? '+' : ''}${v.deltaPercentage.toFixed(2)}%`,
      'Ancienne Marge (%)': `${v.previousMarginPct.toFixed(1)}%`,
      'Nouvelle Marge (%)': `${v.newMarginPct.toFixed(1)}%`,
      'Prix Vente TTC (€)': v.currentPublicPriceTtc,
      'Prix Vente Suggéré TTC (€)': v.suggestedPublicPriceTtc,
      'Impact Annuel Estimé (€)': v.estimatedAnnualImpactEuros,
      'Statut': v.status,
      'Sévérité': v.severity,
      'Date Détection': v.dateDetected,
      'Document Source': v.sourceDocument
    }));
    exportToCsv(data, 'variations_prix_achat_pharmacie');
    showToast('Export CSV des variations de prix d\'achat téléchargé.');
  };

  const getSeverityBadge = (severity: PriceVariationSeverity, deltaPct: number) => {
    switch (severity) {
      case 'critique':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
            <span>Critique (+{deltaPct.toFixed(1)}%)</span>
          </span>
        );
      case 'haute':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <TrendingUp className="w-3 h-3 text-amber-600" />
            <span>Haute (+{deltaPct.toFixed(1)}%)</span>
          </span>
        );
      case 'moderee':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <ArrowUpRight className="w-3 h-3 text-slate-500" />
            <span>Modérée (+{deltaPct.toFixed(1)}%)</span>
          </span>
        );
      case 'baisse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <TrendingDown className="w-3 h-3 text-emerald-600" />
            <span>Baisse ({deltaPct.toFixed(1)}%)</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: PriceVariationStatus) => {
    switch (status) {
      case 'non_traite':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            À Traiter
          </span>
        );
      case 'prix_vente_ajuste':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Prix Vente Répercuté
          </span>
        );
      case 'en_contestation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Clock className="w-3 h-3" /> En Contestation Labo
          </span>
        );
      case 'hausse_acceptee':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Acceptée
          </span>
        );
      case 'substitut_trouve':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3 h-3" /> Substitut Actif
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in max-w-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-linear-to-br from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Alertes Variations du Prix d'Achat (PUMP & Tarifs Fournisseurs)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Détection automatique des hausses tarifaires brutes, pertes de remises grossistes/laboratoires et calcul d'impact direct sur la marge brute officinale.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportVariationsCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hausses Détectées</span>
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalHikesCount}</span>
            <span className="text-xs font-bold text-rose-600">dont {criticalHikesCount} critiques</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sur les factures et catalogues du mois</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Risque Perte Marge Annuelle</span>
            <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalAnnualLossPotential)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Si non répercuté ou non contesté</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Baisses / Opportunités</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{priceDecreasesCount}</span>
            <span className="text-xs font-bold text-emerald-600">Gains de marge</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Promotions & baisses groupement</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Actions d'Ajustement</span>
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {items.filter(i => i.status === 'prix_vente_ajuste' || i.status === 'en_contestation').length}
            </span>
            <span className="text-xs font-semibold text-slate-500">traitées</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Prix de vente ou contestations</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher produit, CIP, laboratoire, grossiste..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Sévérité */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Toutes les sévérités</option>
              <option value="critique">Critique (Hausse &gt; +10%)</option>
              <option value="haute">Haute (Hausse +5% à +10%)</option>
              <option value="moderee">Modérée (Hausse &lt; +5%)</option>
              <option value="baisse">Baisses de prix (Gains)</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Tous les statuts</option>
              <option value="non_traite">À traiter uniquement</option>
              <option value="prix_vente_ajuste">Prix de vente ajusté</option>
              <option value="en_contestation">En contestation labo</option>
              <option value="substitut_trouve">Substitut actif</option>
              <option value="hausse_acceptee">Acceptée</option>
            </select>
          </div>

          {/* Laboratoire */}
          <div>
            <select
              value={selectedLabo}
              onChange={(e) => setSelectedLabo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="all">Tous laboratoires ({laboratories.length})</option>
              {laboratories.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick threshold tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Seuil de variation minimum :
          </span>
          {[
            { label: 'Tous', val: 0 },
            { label: '≥ +2%', val: 2 },
            { label: '≥ +5%', val: 5 },
            { label: '≥ +10%', val: 10 }
          ].map(t => (
            <button
              key={t.val}
              onClick={() => setMinDeltaPct(t.val)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                minDeltaPct === t.val
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto text-slate-400 font-medium">
            {filteredVariations.length} produit(s) affiché(s)
          </span>
        </div>
      </div>

      {/* Main Variations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-4">Produit & CIP</th>
                <th className="py-3 px-3">Labo / Fournisseur</th>
                <th className="py-3 px-3 text-right">Ancien Prix HT</th>
                <th className="py-3 px-3 text-right">Nouveau Prix HT</th>
                <th className="py-3 px-3 text-center">Écart & Sévérité</th>
                <th className="py-3 px-3 text-right">Impact Marge</th>
                <th className="py-3 px-3 text-right">Prix Vente Actuel</th>
                <th className="py-3 px-3 text-right">Prix Suggéré</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions Décisionnelles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredVariations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="font-semibold text-sm">Aucune variation de prix d'achat ne correspond aux filtres.</p>
                    <p className="text-xs text-slate-400 mt-1">Vos prix d'achats fournisseurs sont stables ou conformes.</p>
                  </td>
                </tr>
              ) : (
                filteredVariations.map((item) => {
                  const isHike = item.deltaAmountHt > 0;
                  const marginDrop = item.previousMarginPct - item.newMarginPct;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      {/* Product Name & CIP */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            CIP: {item.cip}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Détecté le {formatDate(item.dateDetected)}
                          </span>
                        </div>
                        {item.reason && (
                          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5 line-clamp-1">
                            ⚠️ {item.reason}
                          </div>
                        )}
                      </td>

                      {/* Lab & Supplier */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.laboratory}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span>{item.supplier}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]" title={item.sourceDocument}>
                          {item.sourceDocument}
                        </div>
                      </td>

                      {/* Previous Price */}
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {item.previousPriceHt.toFixed(2)} €
                      </td>

                      {/* New Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {item.newPriceHt.toFixed(2)} €
                      </td>

                      {/* Delta & Severity Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <div>
                          {getSeverityBadge(item.severity, item.deltaPercentage)}
                        </div>
                        <div className="font-mono text-[11px] font-bold mt-1 text-slate-700 dark:text-slate-300">
                          {isHike ? `+${item.deltaAmountHt.toFixed(2)} €` : `${item.deltaAmountHt.toFixed(2)} €`} / u.
                        </div>
                      </td>

                      {/* Margin Impact */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1 font-bold">
                          <span className="text-slate-400 line-through text-[11px]">{item.previousMarginPct.toFixed(1)}%</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className={marginDrop > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                            {item.newMarginPct.toFixed(1)}%
                          </span>
                        </div>
                        {marginDrop > 0 && (
                          <div className="text-[10px] font-bold text-rose-500 mt-0.5">
                            -{marginDrop.toFixed(1)} pts de marge
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Impact: ~{formatCurrency(item.estimatedAnnualImpactEuros)}/an
                        </div>
                      </td>

                      {/* Current Public Price TTC */}
                      <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-800 dark:text-slate-300">
                        {item.currentPublicPriceTtc.toFixed(2)} €
                      </td>

                      {/* Suggested Public Price TTC */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {item.suggestedPublicPriceTtc.toFixed(2)} €
                        </div>
                        {item.suggestedPublicPriceTtc !== item.currentPublicPriceTtc && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded">
                            +{(item.suggestedPublicPriceTtc - item.currentPublicPriceTtc).toFixed(2)} €
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.category !== 'medicament_remboursable' && item.status !== 'prix_vente_ajuste' && (
                            <button
                              onClick={() => handleOpenAdjustModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              title="Ajuster le prix de vente public TTC en caisse"
                            >
                              <Tag className="w-3 h-3" />
                              <span>Ajuster Prix</span>
                            </button>
                          )}

                          {item.status !== 'en_contestation' && (
                            <button
                              onClick={() => handleOpenContestModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                              title="Envoyer un courrier de contestation de hausse au laboratoire"
                            >
                              <Mail className="w-3 h-3 text-rose-500" />
                              <span>Contester</span>
                            </button>
                          )}

                          {item.alternativeProduct && (
                            <button
                              onClick={() => {
                                showToast(`Substitut conseillé : ${item.alternativeProduct?.name} (${item.alternativeProduct?.priceHt.toFixed(2)} € HT, économie: +${item.alternativeProduct?.savingsPerUnit.toFixed(2)} €/u)`);
                              }}
                              className="p-1 rounded-lg bg-teal-50 dark:bg-teal-900/50 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                              title={`Substitut : ${item.alternativeProduct.name}`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Ajustement Prix de Vente TTC */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  <Tag className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ajustement du Prix de Vente Public TTC
                </h3>
              </div>
              <button 
                onClick={() => setAdjustModalItem(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white">{adjustModalItem.name}</div>
              <div className="text-slate-500 flex items-center gap-2">
                <span>CIP: {adjustModalItem.cip}</span>
                <span>•</span>
                <span>Laboratoire: {adjustModalItem.laboratory}</span>
              </div>
              <div className="flex items-center gap-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-rose-600 font-bold">Nouveau Prix Achat HT: {adjustModalItem.newPriceHt.toFixed(2)} €</span>
                <span className="text-slate-400 font-mono">(Hausse de +{adjustModalItem.deltaPercentage.toFixed(1)}%)</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-200">
                Nouveau Prix Public TTC Caisse LGO (€) :
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.05"
                  value={adjustNewPriceTtc}
                  onChange={(e) => setAdjustNewPriceTtc(parseFloat(e.target.value) || 0)}
                  className="w-40 px-3 py-2 rounded-xl text-base font-bold font-mono bg-white dark:bg-slate-800 border-2 border-indigo-500 text-slate-900 dark:text-white focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setAdjustNewPriceTtc(adjustModalItem.suggestedPublicPriceTtc)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Suggéré : {adjustModalItem.suggestedPublicPriceTtc.toFixed(2)} €
                </button>
              </div>

              {/* Live Margin Calculation */}
              {adjustNewPriceTtc > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Marge Brute Restaurée :</span>
                    <span className="text-sm">
                      {(((adjustNewPriceTtc / 1.20) - adjustModalItem.newPriceHt) / (adjustNewPriceTtc / 1.20) * 100).toFixed(1)} %
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Gain unitaire : +{((adjustNewPriceTtc / 1.20) - adjustModalItem.newPriceHt).toFixed(2)} € HT par boîte vendue
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAdjustModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjustPrice}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Appliquer et Synchroniser LGO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Contestation Fournisseur */}
      {contestModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                  <Mail className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Contestation de Hausse Tarifaire Fournisseur
                </h3>
              </div>
              <button 
                onClick={() => setContestModalItem(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                <span>Destinataire : Service Commercial {contestModalItem.supplier}</span>
                <span className="text-rose-600 font-bold">Hausse : +{contestModalItem.deltaPercentage.toFixed(1)}% (+{contestModalItem.deltaAmountHt.toFixed(2)} €)</span>
              </div>
              <textarea
                rows={12}
                value={contestLetterText}
                onChange={(e) => setContestLetterText(e.target.value)}
                className="w-full p-3 font-mono text-[11px] rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setContestModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSendContestation}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Transmettre la Réclamation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
