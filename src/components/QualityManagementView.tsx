import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Award,
  ThermometerSnowflake,
  UserCheck,
  Check
} from 'lucide-react';
import { QualityNonConformity, QualityProcedure } from '../types/pharmacyPilotPrecision';
import { MOCK_QUALITY_NON_CONFORMITIES, MOCK_QUALITY_PROCEDURES } from '../data/mockPrecisionModules';

export const QualityManagementView: React.FC = () => {
  const [nonConformities, setNonConformities] = useState<QualityNonConformity[]>(MOCK_QUALITY_NON_CONFORMITIES);
  const [procedures, setProcedures] = useState<QualityProcedure[]>(MOCK_QUALITY_PROCEDURES);
  const [activeSubTab, setActiveSubTab] = useState<'non_conformites' | 'procedures' | 'audits'>('non_conformites');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form for new non-conformity
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<QualityNonConformity['type']>('erreur_delivrance_evitee');
  const [newSeverity, setNewSeverity] = useState<QualityNonConformity['severity']>('moyenne');
  const [newAction, setNewAction] = useState('');

  const handleAddNonConformity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newRecord: QualityNonConformity = {
      id: `nc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: newType,
      title: newTitle,
      description: newDesc,
      reportedBy: 'Dr Pharmacien',
      severity: newSeverity,
      status: 'action_corrective_validee',
      correctiveAction: newAction || 'Analyse en réunion d\'équipe et mise à jour de la POS correspondante.',
      preventiveAction: 'Sensibilisation de l\'équipe et contrôle croisé systématique.',
      validatedByPharmacist: true
    };

    setNonConformities(prev => [newRecord, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewAction('');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Management Qualité Officinale • BPDO & ISO 9001</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Démarche Qualité & Registre des Non-Conformités
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Suivi des Bonnes Pratiques de Dispensation à l'Officine (BPDO), traçabilité de la chaîne du froid, gestion des vigilances sanitaires et formation de l'équipe.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Déclarer un Événement / Non-Conformité</span>
          </button>
        </div>

        {/* 4 Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Taux de Conformité BPDO</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">98.5%</div>
            <span className="text-[11px] text-slate-400">Audit interne trimestriel validé</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Procédures Signées (POS)</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {procedures.length} actives
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold">100% équipe informée</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Événements Traités</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono mt-1">
              {nonConformities.filter(n => n.status === 'resolue' || n.status === 'action_corrective_validee').length} / {nonConformities.length}
            </div>
            <span className="text-[11px] text-slate-400">Zéro impact patient avéré</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Sondes Chaîne du Froid</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">3.8°C</div>
            <span className="text-[11px] text-slate-400">2 frigos conformes (2°C - 8°C)</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('non_conformites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'non_conformites'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Non-Conformités & Événements ({nonConformities.length})
        </button>
        <button
          onClick={() => setActiveSubTab('procedures')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'procedures'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Procédures Opératoires Standard - POS ({procedures.length})
        </button>
      </div>

      {/* Non Conformities List */}
      {activeSubTab === 'non_conformites' && (
        <div className="space-y-4">
          {nonConformities.map(nc => (
            <div key={nc.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    nc.severity === 'critique' ? 'bg-rose-500/20 text-rose-600 border border-rose-500/30' :
                    nc.severity === 'haute' ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    Gravité : {nc.severity}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{nc.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Action Validée Titulaire
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{nc.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{nc.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">🛠 Action Corrective Immédiate :</span>
                  <p className="text-slate-600 dark:text-slate-400">{nc.correctiveAction}</p>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">🛡 Mesure Préventive Durable :</span>
                  <p className="text-emerald-700 dark:text-emerald-400">{nc.preventiveAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Procedures List */}
      {activeSubTab === 'procedures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {procedures.map(proc => (
            <div key={proc.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {proc.code} • {proc.version}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {proc.status === 'validee' ? 'Validée' : 'En révision'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{proc.title}</h4>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Rédigé par : <strong>{proc.author}</strong></span>
                <span>Signatures : <strong className="text-emerald-600 dark:text-emerald-400">{proc.signedTeamMembersCount}/{proc.totalTeamMembersCount}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Non Conformity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Déclarer un Événement Qualité</h3>
            
            <form onSubmit={handleAddNonConformity} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Titre de l'événement</label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Erreur de délivrance arrêtée au contrôle scan..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <option value="erreur_delivrance_evitee">Erreur délivrance évitée</option>
                    <option value="chaine_froid">Chaîne du froid</option>
                    <option value="ordonnance_douteuse">Ordonnance douteuse</option>
                    <option value="retrait_ansm">Retrait de lot ANSM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Gravité</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <option value="faible">Faible</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="haute">Haute</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description circonstanciée</label>
                <textarea
                  rows={3}
                  placeholder="Circonstances de détection et contexte..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Action corrective mise en place</label>
                <input
                  type="text"
                  placeholder="Ex : Réétiquetage du casier et rappel des règles de délivrance..."
                  value={newAction}
                  onChange={e => setNewAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  Enregistrer dans le Registre BPDO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
