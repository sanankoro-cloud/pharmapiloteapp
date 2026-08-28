import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  Save, 
  Sliders, 
  Key, 
  Bell, 
  Building2,
  CheckCircle2,
  Check
} from 'lucide-react';
import { PharmacyProfile } from '../types/pharmacy';

interface LgoSettingsViewProps {
  pharmacyProfile?: PharmacyProfile;
  onSaveProfile?: (profile: PharmacyProfile) => void;
  onOpenDataManagementModal?: () => void;
}

export const LgoSettingsView: React.FC<LgoSettingsViewProps> = ({
  pharmacyProfile,
  onSaveProfile,
  onOpenDataManagementModal
}) => {
  const [selectedLgo, setSelectedLgo] = useState('winpharma');
  const [lgoIpAddress, setLgoIpAddress] = useState('192.168.1.150');
  const [lgoPort, setLgoPort] = useState('8080');
  const [syncIntervalMin, setSyncIntervalMin] = useState(5);
  const [marginAlertThresholdPct, setMarginAlertThresholdPct] = useState(5.0);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span>Paramètres & Connecteurs LGO • PharmaPilot Precision</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Configuration Système & Passerelles Logiciels
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Interfaçage bidirectionnel avec votre Logiciel de Gestion d'Officine (WinPharma, LGPI, Smart Rx, Pharmagest, Léo), seuils d'alertes automatiques et gestion des sauvegardes.
            </p>
          </div>

          {onOpenDataManagementModal && (
            <button
              onClick={onOpenDataManagementModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer self-start md:self-auto"
            >
              <Database className="w-4 h-4" />
              <span>Gérer les Données Réelles & Import</span>
            </button>
          )}
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-900 dark:text-emerald-200 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-bold text-sm">Paramètres LGO et passerelles synchronisés avec succès !</span>
        </div>
      )}

      {/* Form and Settings Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LGO Connector Settings (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Connecteur LGO Officine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sélectionnez votre logiciel pour activer la télétransmission des flux</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'winpharma', label: 'WinPharma', icon: '🟢', status: 'Actif' },
              { id: 'lgpi', label: 'LGPI (Pharmagest)', icon: '🔵', status: 'Disponible' },
              { id: 'smartrx', label: 'Smart Rx', icon: '🟣', status: 'Disponible' },
              { id: 'leo', label: 'Léo (Isipharm)', icon: '🟠', status: 'Disponible' },
              { id: 'alliance', label: 'Alliance Apoteka', icon: '🔴', status: 'Disponible' },
              { id: 'caduciel', label: 'Caduciel', icon: '🟡', status: 'Disponible' }
            ].map(lgo => (
              <button
                type="button"
                key={lgo.id}
                onClick={() => setSelectedLgo(lgo.id)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  selectedLgo === lgo.id
                    ? 'bg-slate-900 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20 text-white'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="text-lg mb-1">{lgo.icon}</div>
                <div className="font-bold text-xs">{lgo.label}</div>
                <span className="text-[10px] text-slate-400 font-mono">{lgo.status}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Adresse IP Passerelle Réseau Local
              </label>
              <input
                type="text"
                value={lgoIpAddress}
                onChange={e => setLgoIpAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Port d'écoute API / Socket
              </label>
              <input
                type="text"
                value={lgoPort}
                onChange={e => setLgoPort(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la Configuration</span>
            </button>
          </div>

        </div>

        {/* Right Side: Alert Thresholds */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Seuils d'Alertes IA</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Paramétrage des déclencheurs de vigilance</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Alerte chute de marge vs MM3M : <strong className="text-rose-500">-{marginAlertThresholdPct}%</strong>
              </label>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={marginAlertThresholdPct}
                onChange={e => setMarginAlertThresholdPct(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Fréquence de Synchronisation</span>
              <div className="flex items-center gap-2">
                {[1, 5, 15, 60].map(min => (
                  <button
                    type="button"
                    key={min}
                    onClick={() => setSyncIntervalMin(min)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      syncIntervalMin === min
                        ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Chiffrement TLS 1.3 / HDS</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                Les flux entre PharmaPilot Precision et votre serveur LGO sont scellés et chiffrés conformément aux exigences PGSSI-S.
              </p>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
};
