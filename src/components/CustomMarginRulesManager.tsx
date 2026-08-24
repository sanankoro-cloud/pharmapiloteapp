import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Mail, 
  Info, 
  Sparkles, 
  Check, 
  X, 
  Sliders, 
  Percent, 
  TrendingDown,
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';
import { CustomMarginRule, MarginRuleOperator } from '../types/marginWatchdog';
import { ProductCategory } from '../types/pharmacy';

interface CustomMarginRulesManagerProps {
  rules: CustomMarginRule[];
  onSaveRule: (rule: CustomMarginRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string) => void;
  onTestRulePush: (rule: CustomMarginRule) => void;
}

const CATEGORY_OPTIONS: { id: ProductCategory; label: string; shortLabel: string; color: string; icon: string }[] = [
  { id: 'parapharmacie', label: 'Parapharmacie & Dermo-Cosmétique', shortLabel: 'Parapharmacie', color: 'rose', icon: '🌸' },
  { id: 'medicament_otc', label: 'Médication Familiale & OTC', shortLabel: 'OTC / Conseil', color: 'blue', icon: '💊' },
  { id: 'veterinaire', label: 'Vétérinaire & Antiparasitaires', shortLabel: 'Vétérinaire', color: 'amber', icon: '🐾' },
  { id: 'nutrition_bebe', label: 'Nutrition Infantile & Laits Bébé', shortLabel: 'Bébé / Laits', color: 'teal', icon: '🍼' },
  { id: 'dispositif_medical', label: 'Dispositifs Médicaux & MAD', shortLabel: 'DM & MAD', color: 'purple', icon: '🩹' },
  { id: 'medicament_remboursable', label: 'Médicaments Remboursables (Rx)', shortLabel: 'Rx Ordonnance', color: 'emerald', icon: '📄' },
  { id: 'acte_pharmaceutique', label: 'Actes & Services Pharmaceutiques', shortLabel: 'Actes & Vaccins', color: 'indigo', icon: '💉' }
];

export const CustomMarginRulesManager: React.FC<CustomMarginRulesManagerProps> = ({
  rules,
  onSaveRule,
  onDeleteRule,
  onToggleRule,
  onTestRulePush
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomMarginRule | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [thresholdPct, setThresholdPct] = useState<number>(15.0);
  const [operator, setOperator] = useState<MarginRuleOperator>('less_than');
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([
    'parapharmacie',
    'veterinaire',
    'medicament_otc',
    'nutrition_bebe'
  ]);
  const [pushNotification, setPushNotification] = useState(true);
  const [audioAlert, setAudioAlert] = useState(true);
  const [flashBanner, setFlashBanner] = useState(true);
  const [emailAlert, setEmailAlert] = useState(false);
  const [severity, setSeverity] = useState<'critique' | 'attention' | 'info'>('critique');

  const openCreateModal = () => {
    setEditingRule(null);
    setName('Alerte Marge Plancher Critique (< 15%)');
    setDescription('Envoi immédiat d\'une notification push si la marge brute passe sous 15% sur les catégories hors-ordonnance.');
    setThresholdPct(15.0);
    setOperator('less_than');
    setSelectedCategories(['parapharmacie', 'veterinaire', 'medicament_otc', 'nutrition_bebe']);
    setPushNotification(true);
    setAudioAlert(true);
    setFlashBanner(true);
    setEmailAlert(false);
    setSeverity('critique');
    setIsModalOpen(true);
  };

  const openEditModal = (rule: CustomMarginRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description);
    setThresholdPct(rule.thresholdPct);
    setOperator(rule.operator);
    setSelectedCategories(rule.targetCategories);
    setPushNotification(rule.actionChannels.pushNotification);
    setAudioAlert(rule.actionChannels.audioAlert);
    setFlashBanner(rule.actionChannels.flashBanner);
    setEmailAlert(rule.actionChannels.emailAlert);
    setSeverity(rule.severity);
    setIsModalOpen(true);
  };

  const toggleCategorySelection = (catId: ProductCategory) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return; // Garder au moins une catégorie
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const selectAllCategories = () => {
    setSelectedCategories(CATEGORY_OPTIONS.map(c => c.id));
  };

  const selectNonRxCategories = () => {
    setSelectedCategories(['parapharmacie', 'medicament_otc', 'veterinaire', 'nutrition_bebe', 'dispositif_medical']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedCategories.length === 0) return;

    const ruleToSave: CustomMarginRule = {
      id: editingRule ? editingRule.id : `rule-custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      isEnabled: editingRule ? editingRule.isEnabled : true,
      targetCategories: selectedCategories,
      thresholdPct: Number(thresholdPct.toFixed(1)),
      operator,
      actionChannels: {
        pushNotification,
        audioAlert,
        flashBanner,
        emailAlert
      },
      severity,
      lastTriggeredAt: editingRule?.lastTriggeredAt,
      triggerCount: editingRule?.triggerCount || 0,
      createdAt: editingRule ? editingRule.createdAt : new Date().toISOString().split('T')[0]
    };

    onSaveRule(ruleToSave);
    setIsModalOpen(false);
  };

  const activeRulesCount = rules.filter(r => r.isEnabled).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Règles d'Alertes Push Personnalisables</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  {activeRulesCount} active{activeRulesCount > 1 ? 's' : ''}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configurez vos seuils planchers (ex: <strong>marge brute &lt; 15%</strong>) et la sélection de catégories pour recevoir des alertes push instantanées.
              </p>
            </div>
          </div>
        </div>

        {/* Add New Rule Button */}
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une Règle Personnalisée</span>
        </button>
      </div>

      {/* Rules List Grid */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const isCrit = rule.severity === 'critique';
          const isWarn = rule.severity === 'attention';

          return (
            <div
              key={rule.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                rule.isEnabled
                  ? 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                
                {/* Left Side: Rule Info & Logic */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => onToggleRule(rule.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.isEnabled ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={rule.isEnabled ? 'Désactiver la règle' : 'Activer la règle'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          rule.isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Rule Name */}
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {rule.name}
                    </h3>

                    {/* Threshold Pill */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-mono">
                      <Percent className="w-3 h-3" />
                      Marge &lt; {rule.thresholdPct.toFixed(1)}%
                    </span>

                    {/* Severity Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      isCrit 
                        ? 'bg-rose-600 text-white' 
                        : isWarn 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {rule.severity}
                    </span>

                    {rule.triggerCount > 0 && (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                        ({rule.triggerCount} déclenchement{rule.triggerCount > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {rule.description}
                  </p>

                  {/* Targeted Categories Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">
                      Catégories ciblées ({rule.targetCategories.length}) :
                    </span>
                    {rule.targetCategories.map((catId) => {
                      const opt = CATEGORY_OPTIONS.find(o => o.id === catId);
                      return (
                        <span
                          key={catId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs"
                        >
                          <span>{opt?.icon || '🏷️'}</span>
                          <span>{opt?.shortLabel || catId}</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Notification Channels Active */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span className="font-bold">Canaux actifs :</span>
                    {rule.actionChannels.pushNotification && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Smartphone className="w-3.5 h-3.5" /> Push Mobile
                      </span>
                    )}
                    {rule.actionChannels.audioAlert && (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                        <Volume2 className="w-3.5 h-3.5" /> Sonnerie Caisse
                      </span>
                    )}
                    {rule.actionChannels.flashBanner && (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Bandeau Flash
                      </span>
                    )}
                    {rule.actionChannels.emailAlert && (
                      <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </span>
                    )}
                    {rule.lastTriggeredAt && (
                      <span className="text-slate-400 font-mono">
                        • Dernier déclenchement : {rule.lastTriggeredAt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-2 lg:pt-0">
                  {/* Test Push Button */}
                  <button
                    onClick={() => onTestRulePush(rule)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-bold shadow-xs transition"
                    title="Simuler et tester l'envoi de l'alerte push sur mobile"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
                    <span>Tester Alerte Push</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition shadow-2xs"
                    title="Modifier la règle"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition shadow-2xs"
                    title="Supprimer la règle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create / Edit Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingRule ? 'Modifier la Règle d\'Alerte' : 'Nouvelle Règle d\'Alerte Marge Plancher'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Définissez le seuil de marge brute et les catégories cibles pour l'envoi d'alertes push.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Preset Shortcuts */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Modèles Préconfigurés Rapides
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setName('Alerte Marge Plancher Critique (< 15%)');
                      setThresholdPct(15.0);
                      setSelectedCategories(['parapharmacie', 'veterinaire', 'medicament_otc', 'nutrition_bebe']);
                      setSeverity('critique');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition"
                  >
                    🚨 Plancher Critique 15% (Para/Veto/OTC)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setName('Alerte Marge OTC & Conseil (< 25%)');
                      setThresholdPct(25.0);
                      setSelectedCategories(['medicament_otc']);
                      setSeverity('attention');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition"
                  >
                    💊 Seuil OTC 25%
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setName('Garde-Fou Dermo-Cosmétique (< 35%)');
                      setThresholdPct(35.0);
                      setSelectedCategories(['parapharmacie']);
                      setSeverity('critique');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition"
                  >
                    🌸 Dermo-Cosmétique 35%
                  </button>
                </div>
              </div>

              {/* Rule Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nom de la Règle *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alerte Plancher Marge < 15% sur Parapharmacie & Vétérinaire"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Threshold & Operator Section */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-rose-600" />
                    Seuil Plancher de Marge Brute Déclenchant l'Alerte (%)
                  </label>
                  <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-rose-300 dark:border-rose-800 shadow-2xs">
                    &lt; {thresholdPct.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5.0"
                    max="50.0"
                    step="0.5"
                    value={thresholdPct}
                    onChange={(e) => setThresholdPct(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      step="0.1"
                      value={thresholdPct}
                      onChange={(e) => setThresholdPct(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs font-mono font-bold text-center text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300">%</span>
                  </div>
                </div>

                {/* Quick 15% Target Button */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Raccourcis :</span>
                  <button
                    type="button"
                    onClick={() => setThresholdPct(15.0)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition ${
                      thresholdPct === 15.0 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    15.0% (Seuil Plancher Critique)
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdPct(20.0)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition ${
                      thresholdPct === 20.0 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    20.0%
                  </button>
                  <button
                    type="button"
                    onClick={() => setThresholdPct(25.0)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition ${
                      thresholdPct === 25.0 
                        ? 'bg-rose-600 text-white border-rose-600' 
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    25.0%
                  </button>
                </div>
              </div>

              {/* Category Multi-Select Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sélection des Catégories de Produits à Surveiller * ({selectedCategories.length}/7)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectNonRxCategories}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-800"
                    >
                      Hors Ordonnance
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={selectAllCategories}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                    >
                      Tout cocher
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-700 text-slate-900 dark:text-white font-bold shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-xs">{cat.label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isSelected
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Channels */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Canaux de Déclenchement & Notification
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  
                  {/* Push Mobile */}
                  <button
                    type="button"
                    onClick={() => setPushNotification(!pushNotification)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      pushNotification
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-xs">Push Mobile</span>
                    <span className="text-[10px] font-bold opacity-80">{pushNotification ? 'Activé' : 'Désactivé'}</span>
                  </button>

                  {/* Sonnerie Caisse */}
                  <button
                    type="button"
                    onClick={() => setAudioAlert(!audioAlert)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      audioAlert
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-xs">Sonnerie Caisse</span>
                    <span className="text-[10px] font-bold opacity-80">{audioAlert ? 'Activé' : 'Désactivé'}</span>
                  </button>

                  {/* Bandeau Flash */}
                  <button
                    type="button"
                    onClick={() => setFlashBanner(!flashBanner)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      flashBanner
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs">Bandeau Flash</span>
                    <span className="text-[10px] font-bold opacity-80">{flashBanner ? 'Activé' : 'Désactivé'}</span>
                  </button>

                  {/* Email */}
                  <button
                    type="button"
                    onClick={() => setEmailAlert(!emailAlert)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                      emailAlert
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">Email Titulaire</span>
                    <span className="text-[10px] font-bold opacity-80">{emailAlert ? 'Activé' : 'Désactivé'}</span>
                  </button>

                </div>
              </div>

              {/* Severity & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Niveau de Gravité
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
                  >
                    <option value="critique">🔴 Critique (Action Urgente)</option>
                    <option value="attention">🟡 Attention (Vigilance)</option>
                    <option value="info">🔵 Information</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description ou Note Interne
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Surveillance suite aux hausses des grossistes..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRule ? 'Enregistrer les Modifications' : 'Créer et Activer la Règle'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
