import React, { useState } from 'react';
import { 
  FolderArchive, 
  FileText, 
  Download, 
  Upload, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileCode, 
  Lock,
  Calendar,
  Building2
} from 'lucide-react';
import { DocumentGedItem } from '../types/pharmacyPilotPrecision';
import { MOCK_GED_DOCUMENTS } from '../data/mockPrecisionModules';
import { formatCurrency } from '../utils/formatters';

export const DocumentExchangeGedView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentGedItem[]>(MOCK_GED_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.supplierOrIssuer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Coffre-Fort Numérique Officinal • GED & Piste d'Audit Fiable (PAF)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Échange de Documents & Archivage Légal (10 Ans)
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Centralisation sécurisée des factures laboratoires (Factur-X / SY), bordereaux CPAM Noemie, attestations tiers-payant, contrats de remises RFA et certificats Cyclamed DASRI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Déposer un Document</span>
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer">
              <Download className="w-4 h-4" />
              <span>Télécharger l'Archive PAF</span>
            </button>
          </div>
        </div>

        {/* 4 Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Documents Scellés</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">1 428 fichiers</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Empreinte SHA-256 certifiée</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Archivage Légal</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">100% Conforme</div>
            <span className="text-[11px] text-slate-400">Art. L.102 B du LPF</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Factures Électroniques Factur-X</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono mt-1">384 factures</div>
            <span className="text-[11px] text-slate-400">Liaison PDP Cegedim SY active</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Espace Utilisé</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">4.8 Go / 50 Go</div>
            <span className="text-[11px] text-slate-400">Sauvegarde miroir HDS</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom de document ou émetteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        >
          <option value="all">Toutes catégories</option>
          <option value="facture_fournisseur">Factures Fournisseurs (Factur-X)</option>
          <option value="attestation_tp">Bordereaux CPAM Noemie</option>
          <option value="contrat_rfa">Contrats & RFA</option>
          <option value="certificat_dasri">Certificats Cyclamed DASRI</option>
          <option value="fec_comptable">Fichiers d'Écritures Comptables (FEC)</option>
        </select>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {doc.fileFormat === 'XML_FACTURX' ? <FileCode className="w-6 h-6 text-indigo-500" /> :
                 doc.fileFormat === 'CSV' ? <FileSpreadsheet className="w-6 h-6 text-emerald-500" /> :
                 <FileText className="w-6 h-6 text-rose-500" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{doc.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {doc.fileFormat} • {doc.fileSize}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                  <span>Émetteur : <strong className="text-slate-600 dark:text-slate-300">{doc.supplierOrIssuer}</strong></span>
                  <span>•</span>
                  <span>Date : <strong>{doc.dateAdded}</strong></span>
                  {doc.amountHt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{formatCurrency(doc.amountHt)} HT</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Scellé 10 Ans
              </span>
              <button 
                onClick={() => alert(`Téléchargement de ${doc.title}`)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Télécharger le document"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
