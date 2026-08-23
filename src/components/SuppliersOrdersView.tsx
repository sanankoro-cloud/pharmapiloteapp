import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  FileText, 
  Percent, 
  ArrowUpDown,
  Download,
  Building,
  Check,
  Building2,
  Receipt,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { SupplierOrder } from '../types/pharmacy';
import { formatCurrency, formatDate, exportToCsv } from '../utils/formatters';

interface SuppliersOrdersViewProps {
  orders: SupplierOrder[];
  onPayOrder: (orderId: string) => void;
  onCreateOrder: (newOrder: Omit<SupplierOrder, 'id'>) => void;
  onOpenElectronicInvoicingModal?: () => void;
  onSyncVault?: () => void;
  onNavigateToLcr?: () => void;
  electronicInvoicesCount?: number;
  isSyncingVault?: boolean;
  lcrDisputesCount?: number;
}

export const SuppliersOrdersView: React.FC<SuppliersOrdersViewProps> = ({
  orders,
  onPayOrder,
  onCreateOrder,
  onOpenElectronicInvoicingModal,
  onSyncVault,
  onNavigateToLcr,
  electronicInvoicesCount = 6,
  isSyncingVault = false,
  lcrDisputesCount = 1
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'grossiste' | 'laboratoire_direct'>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New order form state
  const [supplierName, setSupplierName] = useState('OCP Répartition (Agence Régionale)');
  const [supplierType, setSupplierType] = useState<'grossiste' | 'laboratoire_direct'>('grossiste');
  const [totalHt, setTotalHt] = useState<number>(2500);
  const [discountPercentage, setDiscountPercentage] = useState<number>(2.5);
  const [itemsCount, setItemsCount] = useState<number>(60);
  const [paymentDueDate, setPaymentDueDate] = useState('2026-09-20');

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.invoiceNumber && order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || order.supplierType === filterType;
    const matchesPayment = filterPaymentStatus === 'all' || order.paymentStatus === filterPaymentStatus;
    return matchesSearch && matchesType && matchesPayment;
  });

  // Aggregates
  const totalPurchasesHt = orders.reduce((sum, o) => sum + o.totalHt, 0);
  const totalRfaEarned = orders.reduce((sum, o) => sum + o.commercialBonus, 0);
  const totalDuePending = orders
    .filter(o => o.paymentStatus === 'a_payer' || o.paymentStatus === 'en_retard' || o.paymentStatus === 'escompte_dispo')
    .reduce((sum, o) => sum + o.totalTtc, 0);
  const overdueOrders = orders.filter(o => o.paymentStatus === 'en_retard');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tvaAmount = totalHt * 0.021; // Standard pharmacie
    const calculatedTtc = totalHt + tvaAmount;
    const bonus = (totalHt * discountPercentage) / 100;

    onCreateOrder({
      orderNumber: `CMD-2026-0${Math.floor(840 + Math.random() * 100)}`,
      supplierName,
      supplierType,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: 'Livraison prévue à J+1 (11h00)',
      status: 'en_attente',
      itemsCount: Number(itemsCount),
      totalHt: Number(totalHt),
      totalTtc: Number(calculatedTtc),
      discountPercentage: Number(discountPercentage),
      commercialBonus: Number(bonus),
      invoiceNumber: `FAC-${supplierType === 'grossiste' ? 'GRO' : 'LAB'}-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentDueDate,
      paymentStatus: 'a_payer'
    });

    setIsModalOpen(false);
  };

  const handleExportCsv = () => {
    const data = filteredOrders.map(o => ({
      'Numéro Commande': o.orderNumber,
      'Fournisseur': o.supplierName,
      'Type': o.supplierType === 'grossiste' ? 'Grossiste-Répartiteur' : 'Laboratoire Direct',
      'Date Commande': o.orderDate,
      'Statut Livraison': o.status,
      'Nb Lignes': o.itemsCount,
      'Montant HT': o.totalHt,
      'Montant TTC': o.totalTtc,
      'Remise %': o.discountPercentage,
      'RFA / Bonus €': o.commercialBonus,
      'N° Facture': o.invoiceNumber || '-',
      'Échéance': o.paymentDueDate,
      'Statut Règlement': o.paymentStatus
    }));
    exportToCsv(data, 'achats_fournisseurs_pharmacie');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Achats & Fournisseurs Officinaux
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestion des commandes grossistes-répartiteurs (OCP, Alliance, Phoenix), laboratoires directs, remises arrières (RFA) et échéancier de paiement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToLcr && (
            <button
              onClick={onNavigateToLcr}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
              title="Contrôle des relevés LCR, traites bancaires et validation Bon à Payer (BAP)"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Contrôle LCR & Traites</span>
              {lcrDisputesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {lcrDisputesCount} litige
                </span>
              )}
            </button>
          )}

          {onOpenElectronicInvoicingModal && (
            <button
              onClick={onOpenElectronicInvoicingModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-2xs transition"
              title="Accéder au coffre-fort de factures électroniques Factur-X"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Coffre-Fort SY (Factur-X)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-200 text-indigo-800 text-[10px]">
                {electronicInvoicesCount}
              </span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Commande</span>
          </button>
        </div>
      </div>

      {/* SY by Cegedim Electronic Invoicing Live Sync Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shrink-0">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">
                Connecteur Coffres-Forts Électroniques : SY by Cegedim & Factur-X
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" />
                PDP DGFIP #0023 Actif
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Les factures certifiées de vos grossistes (OCP, Alliance, Phoenix) et laboratoires (Biogaran, Sanofi, Gilbert, Bioderma) sont automatiquement récupérées, scellées eIDAS et réconciliées avec vos commandes et stocks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {onSyncVault && (
            <button
              onClick={onSyncVault}
              disabled={isSyncingVault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingVault ? 'animate-spin' : ''}`} />
              <span>{isSyncingVault ? 'Récupération...' : 'Synchro SY'}</span>
            </button>
          )}

          {onOpenElectronicInvoicingModal && (
            <button
              onClick={onOpenElectronicInvoicingModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Gérer les Factures</span>
            </button>
          )}
        </div>
      </div>

      {/* Overdue Warning Alert */}
      {overdueOrders.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl shadow-xs">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mr-3 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-bold text-rose-900">
                Alerte Retard de Paiement Fournisseur ({overdueOrders.length} facture(s))
              </h2>
              <p className="text-xs text-rose-700 mt-1">
                La facture de {overdueOrders[0].supplierName} ({formatCurrency(overdueOrders[0].totalTtc)}) a dépassé son échéance du {formatDate(overdueOrders[0].paymentDueDate)}. Réglez-la rapidement pour éviter le blocage du compte grossiste et conserver vos remises commerciales.
              </p>
            </div>
            <button
              onClick={() => onPayOrder(overdueOrders[0].id)}
              className="ml-3 shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Régler Maintenant
            </button>
          </div>
        </div>
      )}

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Achats Période HT
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(totalPurchasesHt)}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Sur {orders.length} commandes enregistrées
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Remises & RFA Négociées
          </div>
          <div className="text-xl font-bold text-emerald-700">
            {formatCurrency(totalRfaEarned)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Marge arrière officinale optimisée
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Factures à Régler (Échéancier)
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(totalDuePending)}
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            Dont {overdueOrders.length} en retard critique
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par fournisseur, n° commande, facture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Supplier Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
          >
            <option value="all">Tous les types de fournisseurs</option>
            <option value="grossiste">Grossistes Répartiteurs (OCP, Alliance...)</option>
            <option value="laboratoire_direct">Laboratoires Directs (Biogaran, Sanofi...)</option>
          </select>

          {/* Payment Status filter */}
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
          >
            <option value="all">Tous les statuts de paiement</option>
            <option value="en_retard">⚠️ En retard</option>
            <option value="a_payer">⏳ À payer</option>
            <option value="escompte_dispo">✨ Escompte dispo</option>
            <option value="payee">✅ Payée</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Commande & Fournisseur</th>
                <th className="py-3 px-3">Date & Livraison</th>
                <th className="py-3 px-3 text-right">Lignes</th>
                <th className="py-3 px-3 text-right">Montant HT</th>
                <th className="py-3 px-3 text-right">Montant TTC</th>
                <th className="py-3 px-3 text-center">Remise / RFA</th>
                <th className="py-3 px-3">Échéance</th>
                <th className="py-3 px-3 text-center">Statut Règlement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const isOverdue = order.paymentStatus === 'en_retard';
                const isDiscountAvailable = order.paymentStatus === 'escompte_dispo';
                const isPaid = order.paymentStatus === 'payee';

                return (
                  <tr key={order.id} className={`hover:bg-slate-50/80 transition ${isOverdue ? 'bg-rose-50/30' : ''}`}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{order.supplierName}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">{order.orderNumber}</span>
                        <span>•</span>
                        <span className="text-slate-600">{order.invoiceNumber || 'Facture en attente'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-slate-800">{formatDate(order.orderDate)}</div>
                      <div className="text-[11px] text-slate-500">{order.deliveryDate || 'Non spécifiée'}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium">
                      {order.itemsCount} réf
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(order.totalHt)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(order.totalTtc)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.discountPercentage}% ({formatCurrency(order.commercialBonus)})
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {formatDate(order.paymentDueDate)}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          En retard
                        </span>
                      )}
                      {isDiscountAvailable && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Escompte -1%
                        </span>
                      )}
                      {order.paymentStatus === 'a_payer' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                          <Clock className="w-3 h-3" />
                          À échoir
                        </span>
                      )}
                      {isPaid && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Payée
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isPaid ? (
                        <button
                          onClick={() => onPayOrder(order.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition"
                          title="Valider le règlement de la facture via Crédit Agricole"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Régler</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" /> Lettré
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Supplier Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Créer une Commande Fournisseur Officinale
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Type de Fournisseur
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSupplierType('grossiste');
                      setSupplierName('OCP Répartition (Agence Régionale)');
                      setDiscountPercentage(2.5);
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition ${
                      supplierType === 'grossiste' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Grossiste Répartiteur
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSupplierType('laboratoire_direct');
                      setSupplierName('Biogaran Laboratoires (Direct)');
                      setDiscountPercentage(38.0);
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition ${
                      supplierType === 'laboratoire_direct' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Laboratoire Direct
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du Fournisseur / Laboratoire</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant Total HT (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalHt}
                    onChange={(e) => setTotalHt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remise / RFA Négociée (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre de Références (Lignes)</label>
                  <input
                    type="number"
                    required
                    value={itemsCount}
                    onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Échéance de Paiement</label>
                  <input
                    type="date"
                    required
                    value={paymentDueDate}
                    onChange={(e) => setPaymentDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <div className="flex justify-between font-semibold">
                  <span>Montant Total Estimé TTC :</span>
                  <span>{formatCurrency(totalHt * 1.021)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 mt-1">
                  <span>Gain Marge Arrière RFA :</span>
                  <span>{formatCurrency((totalHt * discountPercentage) / 100)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-sm"
                >
                  Enregistrer la Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
