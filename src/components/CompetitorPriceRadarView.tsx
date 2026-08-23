import React, { useState } from 'react';
import { 
  Radar, 
  MapPin, 
  Search, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  Building
} from 'lucide-react';
import { 
  CompetitorPharmacy, 
  CompetitorPriceComparison 
} from '../types/pharmacy';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface CompetitorPriceRadarViewProps {
  competitors: CompetitorPharmacy[];
  priceComparisons: CompetitorPriceComparison[];
  onApplySuggestedPrice: (productId: string, newPriceTtc: number) => void;
}

export const CompetitorPriceRadarView: React.FC<CompetitorPriceRadarViewProps> = ({
  competitors,
  priceComparisons,
  onApplySuggestedPrice
}) => {
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CompetitorPriceComparison>(priceComparisons[1]); // Bioderma by default
  const [customPrice, setCustomPrice] = useState<number>(selectedProduct.suggestedPriceTtc);

  const filteredComparisons = priceComparisons.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cip.includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompetitors = competitors.filter(c => c.distanceKm <= selectedRadiusKm);

  const handleSelectProduct = (prod: CompetitorPriceComparison) => {
    setSelectedProduct(prod);
    setCustomPrice(prod.suggestedPriceTtc);
  };

  const handleApplyPrice = (prodId: string, price: number) => {
    onApplySuggestedPrice(prodId, price);
    setAppliedNotification(`Prix mis à jour à ${formatCurrency(price)} sur le LGO et les étiquettes électroniques !`);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  // Elasticity calculations
  const calculateSimulatedMargin = (priceTtc: number, costHt: number) => {
    const priceHt = priceTtc / 1.20; // assumed 20% or proportional
    const marginHt = priceHt - costHt;
    const marginPct = (marginHt / priceHt) * 100;
    return { marginHt, marginPct };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
              <Radar className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Veille Concurrentielle & Ajustement des Prix (Rayon 50 km)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyse comparative des prix pratiqués par les officines concurrentes, détection d'opportunités de marge et simulateur d'élasticité.
          </p>
        </div>

        {/* Radius Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">Rayon d'analyse :</span>
          <select
            value={selectedRadiusKm}
            onChange={(e) => setSelectedRadiusKm(Number(e.target.value))}
            className="text-xs font-bold text-indigo-700 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value={10}>10 km (Agglomération)</option>
            <option value={25}>25 km (Bassin de vie)</option>
            <option value={50}>50 km (Rayon régional)</option>
          </select>
        </div>
      </div>

      {/* Applied Confirmation Banner */}
      {appliedNotification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{appliedNotification}</span>
        </div>
      )}

      {/* Top Grid: Competitors Radar Map & Strategic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Competitor Pharmacies in Range */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-500" />
              Officines Surveillées ({filteredCompetitors.length})
            </h2>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              &lt; {selectedRadiusKm} km
            </span>
          </div>

          <div className="space-y-3">
            {filteredCompetitors.map(comp => (
              <div key={comp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{comp.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {comp.city} • {comp.address}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                    {comp.distanceKm} km
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold">
                  <span className={`px-1.5 py-0.5 rounded ${
                    comp.marketPositioning === 'discount' ? 'bg-rose-100 text-rose-800' :
                    comp.marketPositioning === 'standard' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Position : {comp.marketPositioning.toUpperCase()}
                  </span>
                  <span className="text-slate-400 capitalize">• {comp.type.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Price Adjustment & Elasticity Simulator (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Simulateur Dynamique d'Élasticité Prix
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {selectedProduct.productName}
                </h2>
                <div className="text-xs text-slate-500 font-mono">
                  CIP : {selectedProduct.cip} • Coût d'achat HT : {formatCurrency(selectedProduct.myCostHt)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Mon Prix Actuel</div>
                <div className="text-lg font-black text-slate-900">{formatCurrency(selectedProduct.myPriceTtc)}</div>
                <div className="text-[11px] text-slate-600">Marge : {selectedProduct.myMarginPercentage.toFixed(1)}%</div>
              </div>
            </div>

            {/* Competitor Price Comparison Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Prix Moyen Concurrents</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">
                  {formatCurrency(selectedProduct.averageCompetitorPriceTtc)}
                </div>
                <div className="text-[10px] text-slate-500">Sur {selectedProduct.competitorPrices.length} officines</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Prix le Plus Bas (50km)</div>
                <div className="text-base font-bold text-rose-600 mt-0.5">
                  {formatCurrency(selectedProduct.minCompetitorPriceTtc)}
                </div>
                <div className="text-[10px] text-slate-500">Lafayette / Discounters</div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200">
                <div className="text-xs text-indigo-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Prix Optimal Conseillé
                </div>
                <div className="text-base font-black text-indigo-900 mt-0.5">
                  {formatCurrency(selectedProduct.suggestedPriceTtc)}
                </div>
                <div className="text-[10px] text-indigo-700 font-semibold">
                  Marge projetée : {selectedProduct.suggestedMarginPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* List of competitor prices for this product */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-700 mb-2">Relevé des prix concurrents :</div>
              <div className="space-y-1.5">
                {selectedProduct.competitorPrices.map((cp, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-800">{cp.pharmacyName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">{cp.distanceKm} km</span>
                      <span className="font-bold font-mono text-slate-900">{formatCurrency(cp.priceTtc)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Slider to adjust Price */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Ajuster manuellement le Prix TTC (€) :</span>
                <span className="font-mono text-base font-bold text-emerald-400">{formatCurrency(customPrice)}</span>
              </div>
              <input
                type="range"
                min={selectedProduct.myCostHt * 1.1}
                max={selectedProduct.maxCompetitorPriceTtc * 1.2}
                step={0.10}
                value={customPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Prix plancher : {formatCurrency(selectedProduct.myCostHt * 1.1)}</span>
                <span>Prix max : {formatCurrency(selectedProduct.maxCompetitorPriceTtc * 1.2)}</span>
              </div>
            </div>
          </div>

          {/* Action Button to apply */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
            <div className="text-xs text-slate-500">
              Sensibilité au prix : <strong>{selectedProduct.priceElasticityScore}/5 (Élevée)</strong>
            </div>
            <button
              onClick={() => handleApplyPrice(selectedProduct.productId, customPrice)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Appliquer ce prix ({formatCurrency(customPrice)}) à l'Officine</span>
            </button>
          </div>
        </div>

      </div>

      {/* Strategic Product Catalog Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Panier de Produits Stratégiques & Veille Tarifaire
            </h2>
            <p className="text-xs text-slate-500">
              Sélectionnez un produit pour afficher la simulation détaillée ou appliquer immédiatement la recommandation.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Produit Officinal</th>
                <th className="py-3 px-3 text-right">Mon Prix TTC</th>
                <th className="py-3 px-3 text-right">Ma Marge %</th>
                <th className="py-3 px-3 text-right">Moyenne Concurrents</th>
                <th className="py-3 px-3 text-right">Min (50km)</th>
                <th className="py-3 px-3 text-right">Prix Suggéré</th>
                <th className="py-3 px-3 text-center">Diagnostic IA</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComparisons.map((prod) => {
                const isSelected = selectedProduct.productId === prod.productId;
                return (
                  <tr 
                    key={prod.productId} 
                    onClick={() => handleSelectProduct(prod)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-indigo-50/60 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{prod.productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{prod.cip}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(prod.myPriceTtc)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-700">
                      {prod.myMarginPercentage.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(prod.averageCompetitorPriceTtc)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-rose-600 font-medium">
                      {formatCurrency(prod.minCompetitorPriceTtc)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-700">
                      {formatCurrency(prod.suggestedPriceTtc)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {prod.recommendation === 'baisser_prix' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <TrendingDown className="w-3 h-3" />
                          Trop cher
                        </span>
                      )}
                      {prod.recommendation === 'opportunite_marge' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <TrendingUp className="w-3 h-3" />
                          Marge dispo
                        </span>
                      )}
                      {prod.recommendation === 'prix_optimal' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPrice(prod.productId, prod.suggestedPriceTtc);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs transition"
                      >
                        Appliquer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
