import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
  Pill, 
  ShieldAlert, 
  Plus, 
  Activity, 
  FileText,
  Clock
} from 'lucide-react';
import { PatientCareFile } from '../types/pharmacyPilotPrecision';
import { MOCK_PATIENT_CARE_FILES } from '../data/mockPrecisionModules';

export const PatientCareTrackingView: React.FC = () => {
  const [patients, setPatients] = useState<PatientCareFile[]>(MOCK_PATIENT_CARE_FILES);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nir.includes(searchQuery) ||
    p.chronicDiseases.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dossier Pharmaceutique (DP) & Observance Thérapeutique</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Suivi Patient & Analyse des Interactions
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Surveillance des traitements chroniques ALD, détection automatique des redondances et interactions médicamenteuses, renouvellements d'ordonnances à anticiper.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-right">
            <span className="text-xs text-slate-400 font-medium">Patients Suivis en Officine</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              1 280 dossiers
            </div>
            <span className="text-[11px] text-slate-300">92% avec DP actif</span>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Taux d'Observance Moyen</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">87.2%</div>
            <span className="text-[11px] text-slate-400">Calcul basé sur les retraits</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Alertes Interactions Actives</span>
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-1">
              {patients.filter(p => p.interactionAlert).length} dossiers
            </div>
            <span className="text-[11px] text-slate-400">Surveillance AINS & AOD</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Renouvellements &lt; 7 Jours</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">18 prévus</div>
            <span className="text-[11px] text-slate-400">Préparation ordonnancier</span>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Dossiers ALD 100%</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">640 patients</div>
            <span className="text-[11px] text-emerald-400 font-semibold">Exonération ticket modérateur</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom de patient, NIR Sécurité Sociale ou pathologie (ex: Diabète, Asthme)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{patient.patientName}</h3>
                  <span className="text-xs text-slate-400 font-mono">Né(e) en {patient.birthYear} • NIR {patient.nir}</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                DP Actif
              </span>
            </div>

            {/* Pathologies Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {patient.chronicDiseases.map(disease => (
                <span key={disease} className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {disease}
                </span>
              ))}
            </div>

            {/* Alert banner if exists */}
            {patient.interactionAlert && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{patient.interactionAlert}</span>
              </div>
            )}

            {/* Details Footer */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Médecin Traitant</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{patient.doctorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Prochain Renouvellement</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 font-mono">{patient.nextPrescriptionRenewalDate}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
