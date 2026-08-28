import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Bot, 
  Send, 
  RotateCcw, 
  FileSpreadsheet, 
  Percent, 
  ArrowUpRight,
  Search,
  Filter,
  Check,
  Building2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SmartOrderingItem } from '../types/pharmacyPilotPrecision';
import { MOCK_SMART_ORDERING_ITEMS } from '../data/mockPrecisionModules';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

interface SmartOrderingAiViewProps {
  onNavigateTab?: (tab: string) => void;
  onSendToLgo?: (itemCount: number, totalHt: number) => void;
}

export const SmartOrderingAiView: React.FC<SmartOrderingAiViewProps> = ({
  onNavigateTab,
  onSendToLgo
}) => {
  const [items, setItems] = useState<SmartOrderingItem[]>(MOCK_SMART_ORDERING_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmittedSuccess, setTransmittedSuccess] = useState(false);

  const toggleSelect = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const selectAll = () => {
    const allSelected = items.every(i => i.selected);
    setItems(prev => prev.map(i => ({ ...i, selected: !allSelected })));
  };

  const updateQuantity = (id: string, qty: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, recommendedOrderQty: Math.max(1, qty) } : item));
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.cip.includes(searchQuery) ||
                          item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchUrg = selectedUrgency === 'all' || item.urgency === selectedUrgency;
      return matchSearch && matchCat && matchUrg;
    });
  }, [items, searchQuery, selectedCategory, selectedUrgency]);

  const categories = useMemo(() => {
    return Array.from(new Set(items.map(i => i.category)));
  }, [items]);

  const selectedItems = items.filter(i => i.selected);
  const totalOrderAmountHt = selectedItems.reduce((acc, curr) => acc + (curr.recommendedOrderQty * curr.estimatedCostHt), 0);
  const totalBoxesCount = selectedItems.reduce((acc, curr) => acc + curr.recommendedOrderQty, 0);
  const averageAiConfidence = Math.round(items.reduce((acc, curr) => acc + curr.aiConfidenceScore, 0) / (items.length || 1));

  const handleTransmitToLgo = () => {
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);
      setTransmittedSuccess(true);
      if (onSendToLgo) {
        onSendToLgo(selectedItems.length, totalOrderAmountHt);
      }
      setTimeout(() => setTransmittedSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner PharmaPilot Precision */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Ordering IA • Prédiction de Réapprovisionnement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Commandes Prédictives & Cadencier IA
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Moteur d'apprentissage calibré sur l'historique de dispensation, la météo locale, les seuils de sécurité et les risques de ruptures grossistes / MITM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={selectAll}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{items.every(i => i.selected) ? 'Tout désélectionner' : 'Tout sélectionner'}</span>
            </button>
            <button
              onClick={handleTransmitToLgo}
              disabled={selectedItems.length === 0 || isTransmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer ${
                selectedItems.length > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {isTransmitting ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Transmission LGO en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmettre au LGO ({selectedItems.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Total Sélectionné</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {formatCurrency(totalOrderAmountHt)}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">{totalBoxesCount} boîtes à commander</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Indice de Confiance IA</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              {averageAiConfidence}%
            </div>
            <span className="text-[11px] text-slate-400">Base météo, délivrance & saisonnalité</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Alertes Ruptures Évitées</span>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-1">
              {items.filter(i => i.urgency === 'critique').length} critiques
            </div>
            <span className="text-[11px] text-slate-400">Dont Amoxicilline et Ventoline</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Économie Remises Directes</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono mt-1">
              +4.2%
            </div>
            <span className="text-[11px] text-slate-400">Optimisation des paliers franco labos</span>
          </div>
        </div>
      </div>

      {transmittedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-emerald-900 dark:text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">Panier IA transmis avec succès au logiciel de gestion (LGO WinPharma / Pharmagest) !</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400">Les lignes de commandes ont été créées dans votre cadencier d'achats.</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par molécule, CIP ou laboratoire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">Toutes les classes ({items.length})</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="all">Toutes urgences</option>
            <option value="critique">Critique (Rupture imminente)</option>
            <option value="haute">Haute (Renouvellements ALD)</option>
            <option value="optimisation">Optimisation Franco</option>
          </select>
        </div>
      </div>

      {/* Suggested Smart Orders List */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const totalLineCost = item.recommendedOrderQty * item.estimatedCostHt;
          return (
            <div 
              key={item.id}
              className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                item.selected 
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20' 
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-85'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Product details & checkbox */}
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className={`mt-1 w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 cursor-pointer ${
                      item.selected 
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                        : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                    }`}
                  >
                    {item.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        CIP {item.cip}
                      </span>
                      {item.urgency === 'critique' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Rupture & Tension Labo
                        </span>
                      )}
                      {item.urgency === 'haute' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Renouvellements ALD
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 flex-wrap">
                      <span>Labo : <strong className="text-slate-700 dark:text-slate-300">{item.supplier}</strong></span>
                      <span>•</span>
                      <span>Stock actuel : <strong className="text-slate-700 dark:text-slate-300">{item.currentStock} btes</strong> (Seuil mini: {item.minSafetyStock})</span>
                      <span>•</span>
                      <span>Moyenne mensuelle : <strong className="text-slate-700 dark:text-slate-300">{item.averageMonthlySales} u/mois</strong></span>
                    </div>

                    {/* AI Smart Reason */}
                    <div className="mt-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Quantity selector & Cost */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Qté suggérée :</span>
                    <input
                      type="number"
                      min="1"
                      value={item.recommendedOrderQty}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1.5 rounded-lg text-sm font-bold text-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="text-right min-w-[110px]">
                    <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                      {formatCurrency(totalLineCost)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      PUMP HT : {formatCurrency(item.estimatedCostHt)}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
