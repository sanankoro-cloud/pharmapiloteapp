import React, { useState } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  User, 
  Plus, 
  FileText, 
  CreditCard, 
  Activity, 
  Video, 
  Syringe, 
  HeartHandshake,
  Check
} from 'lucide-react';
import { DigitalServicePatient } from '../types/pharmacyPilotPrecision';
import { MOCK_DIGITAL_SERVICES } from '../data/mockPrecisionModules';
import { formatCurrency } from '../utils/formatters';

export const DigitalServicesView: React.FC = () => {
  const [services, setServices] = useState<DigitalServicePatient[]>(MOCK_DIGITAL_SERVICES);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredServices = services.filter(s => {
    if (selectedFilter === 'all') return true;
    return s.serviceType === selectedFilter;
  });

  const totalHonoraireSecured = services.reduce((acc, curr) => acc + curr.remunerationEuro, 0);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nouvelles Missions d'Officine • Avenant 20 & 21</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Services Digitaux & Entretiens Pharmaceutiques
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Suivi et facturation Sécurité Sociale (Ameli) des Bilans Partagés de Médication (BPM), entretiens AVK / AOD / Asthme / Anticancéreux oraux, vaccinations et téléconsultations.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 text-right">
            <span className="text-xs text-slate-400 font-medium">Honoraires d'Accompagnement</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {formatCurrency(totalHonoraireSecured)}
            </div>
            <span className="text-[11px] text-slate-300">{services.length} actes enregistrés ce mois</span>
          </div>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Bilans Médication</span>
              <div className="text-lg font-black text-white font-mono">14 BPM</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Syringe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Vaccinations</span>
              <div className="text-lg font-black text-white font-mono">142 actes</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Téléconsultations</span>
              <div className="text-lg font-black text-white font-mono">28 créneaux</div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400">Dépistages TROD</span>
              <div className="text-lg font-black text-white font-mono">31 tests</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map(service => (
          <div key={service.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                {service.serviceType === 'vaccination' ? <Syringe className="w-5 h-5" /> : 
                 service.serviceType === 'teleconsultation' ? <Video className="w-5 h-5" /> : 
                 <Stethoscope className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-base text-slate-900 dark:text-white">{service.patientName}</span>
                  <span className="text-xs text-slate-400 font-mono">({service.age} ans • {service.nirMasked})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    Code Ameli : {service.ameliCode}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{service.notes}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span>Pharmacien : <strong>{service.pharmacistAssigned}</strong></span>
                  <span>•</span>
                  <span>Date : <strong>{service.dateScheduled}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
              <div className="text-right">
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  +{formatCurrency(service.remunerationEuro)}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  service.status === 'facture_ameli' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  service.status === 'realise' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {service.status === 'facture_ameli' ? 'Facturé Ameli' : service.status === 'realise' ? 'Réalisé à télétransmettre' : 'Planifié'}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
