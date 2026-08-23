import React, { useState } from 'react';
import { 
  Receipt, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Search, 
  Euro, 
  TrendingUp, 
  ShieldAlert, 
  Calendar,
  Building,
  Users,
  Computer,
  Zap,
  ShieldCheck,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { ExpenseItem } from '../types/pharmacy';
import { formatCurrency, formatDate, getCategoryLabel, exportToCsv } from '../utils/formatters';

interface RecurringExpensesViewProps {
  expenses: ExpenseItem[];
  onUpdateExpense: (id: string, newActualAmount: number) => void;
  onCreateExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
}

export const RecurringExpensesView: React.FC<RecurringExpensesViewProps> = ({
  expenses,
  onUpdateExpense,
  onCreateExpense
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New expense form state
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('loyer');
  const [monthlyBudget, setMonthlyBudget] = useState(1000);
  const [actualAmount, setActualAmount] = useState(1000);
  const [supplier, setSupplier] = useState('');
  const [frequency, setFrequency] = useState<'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  const [paymentMethod, setPaymentMethod] = useState<'prelevement_sepa' | 'virement' | 'cb'>('prelevement_sepa');
  const [nextDueDate, setNextDueDate] = useState('2026-09-01');

  const filteredExpenses = expenses.filter(exp => 
    exp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBudget = expenses.reduce((sum, e) => sum + e.monthlyBudget, 0);
  const totalActual = expenses.reduce((sum, e) => sum + e.actualAmount, 0);
  const totalVariance = totalActual - totalBudget;
  const budgetAlerts = expenses.filter(e => e.actualAmount > e.monthlyBudget);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateExpense({
      label,
      category,
      monthlyBudget: Number(monthlyBudget),
      actualAmount: Number(actualAmount),
      supplier,
      frequency,
      paymentMethod,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      nextDueDate,
      status: Number(actualAmount) > Number(monthlyBudget) ? 'alerte_depassement' : 'a_jour'
    });
    setIsModalOpen(false);
    setLabel('');
    setSupplier('');
  };

  const getCategoryIcon = (cat: ExpenseItem['category']) => {
    switch (cat) {
      case 'salaires': return Users;
      case 'loyer': return Building;
      case 'logiciel_lgo': return Computer;
      case 'robot_leasing': return Computer;
      case 'energie_fluides': return Zap;
      case 'assurance_rcp': return ShieldCheck;
      case 'honoraires_comptables': return Briefcase;
      default: return Receipt;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Dépenses Récurrentes & Contrôle Budgétaire
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Suivi des charges d'exploitation en temps réel : masse salariale, loyer officinal, leasing automate Rowa, LGO WinPharma et énergie.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Dépense</span>
          </button>
        </div>
      </div>

      {/* Budget Overspend Alert Box */}
      {budgetAlerts.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl shadow-xs">
          <div className="flex items-start">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mr-3 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-sm font-bold text-rose-900">
                Alerte Dépassement Budgétaire Critique ({budgetAlerts.length} poste(s))
              </h2>
              <p className="text-xs text-rose-700 mt-1">
                Le total des charges engagées dépasse le budget prévisionnel de +{formatCurrency(totalVariance)} (+{((totalVariance / totalBudget) * 100).toFixed(1)}%).
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {budgetAlerts.map(b => (
                  <span key={b.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-200/60 text-rose-900 text-[11px] font-bold">
                    {b.label} : {formatCurrency(b.actualAmount)} (Budget: {formatCurrency(b.monthlyBudget)})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Budget Mensuel Alloué
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(totalBudget)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Charges fixes et d'exploitation prévues
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Dépenses Réelles Consommées
          </div>
          <div className={`text-xl font-bold ${totalVariance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {formatCurrency(totalActual)}
          </div>
          <div className={`text-xs font-semibold mt-1 ${totalVariance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {totalVariance > 0 ? `+${formatCurrency(totalVariance)} de dépassement` : 'Sous le budget prévu'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Ratio Charges / CA Mensuel
          </div>
          <div className="text-xl font-bold text-slate-900">
            19.4%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Norme sectorielle officine : 18% à 22%
          </div>
        </div>
      </div>

      {/* Expenses Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExpenses.map((expense) => {
          const Icon = getCategoryIcon(expense.category);
          const isOverbudget = expense.actualAmount > expense.monthlyBudget;
          const consumptionPct = Math.min(150, (expense.actualAmount / expense.monthlyBudget) * 100);

          return (
            <div 
              key={expense.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                isOverbudget ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isOverbudget ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{expense.label}</h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {expense.supplier} • {expense.frequency}
                    </div>
                  </div>
                </div>

                {isOverbudget ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <AlertTriangle className="w-3 h-3" />
                    Dépassement
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    Conforme
                  </span>
                )}
              </div>

              {/* Progress Gauge */}
              <div className="space-y-1.5 my-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Consommation du budget :</span>
                  <span className={isOverbudget ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                    {formatCurrency(expense.actualAmount)} / {formatCurrency(expense.monthlyBudget)} ({consumptionPct.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverbudget ? 'bg-rose-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(100, consumptionPct)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Prochaine échéance : {formatDate(expense.nextDueDate)}</span>
                </div>
                <div className="font-medium text-slate-700 capitalize">
                  {expense.paymentMethod.replace('_', ' ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Creating New Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Ajouter une Dépense Récurrente
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
                <label className="block font-semibold text-slate-700 mb-1">Catégorie de Charge</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="salaires">Masse Salariale & Charges Sociales</option>
                  <option value="loyer">Loyer & Charges Locatives</option>
                  <option value="logiciel_lgo">Logiciel LGO & Maintenance</option>
                  <option value="robot_leasing">Leasing Robotique & Automates</option>
                  <option value="energie_fluides">Énergie & Électricité (Frigos/Clim)</option>
                  <option value="assurance_rcp">Assurance RCP & Multirisque</option>
                  <option value="honoraires_comptables">Honoraires Comptables & Conseil</option>
                  <option value="frais_bancaires_tpe">Commissions TPE & Frais Crédit Agricole</option>
                  <option value="autres">Autres Charges Externes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Libellé de la Dépense</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abonnement Télétransmissions Resopharma"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fournisseur / Prestataire</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Resopharma SAS"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Budget Mensuel (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Montant Réel Actuel (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={actualAmount}
                    onChange={(e) => setActualAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fréquence</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="mensuel">Mensuel</option>
                    <option value="trimestriel">Trimestriel</option>
                    <option value="annuel">Annuel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mode de Paiement</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="prelevement_sepa">Prélèvement SEPA</option>
                    <option value="virement">Virement Bancaire</option>
                    <option value="cb">Carte Bancaire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prochaine Échéance</label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
