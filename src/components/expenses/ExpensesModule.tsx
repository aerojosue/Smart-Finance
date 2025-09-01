import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, BarChart3 } from 'lucide-react';
import { ExpenseKpiHeader } from './ExpenseKpiHeader';
import { ExpensePlanVsReal } from './ExpensePlanVsReal';
import { ExpensePlannedList } from './ExpensePlannedList';
import { ExpenseInstallmentsPanel } from './ExpenseInstallmentsPanel';
import { ExpenseFormModal } from './ExpenseFormModal';
import { FxForm } from '../FxForm';
import { 
  getPlannedExpenses, 
  getObservedExpenses, 
  getExpenseInstallments,
  createPlannedExpense, 
  updatePlannedExpense, 
  deletePlannedExpense,
  markInstallmentPaid
} from '../../lib/expensesApi';
import { computeExpenseKpis, generateExpenseComparison, generateInstallments } from '../../lib/expenseCalculations';
import { getCards } from '../../lib/cardsApi';
import type { 
  PlannedExpense, 
  ObservedExpense, 
  ExpenseFormData, 
  ExpenseKpis, 
  ExpenseComparison,
  ExpenseInstallment 
} from '../../types/expenses';
import type { Card } from '../../types/cards';

// Mock exchange rates to ARS
const MOCK_RATES_TO_ARS = {
  ARS: 1,
  USD: 1000,
  BRL: 200,
  USDT: 1000,
  EUR: 1100,
};

export const ExpensesModule: React.FC = () => {
  const [plannedExpenses, setPlannedExpenses] = useState<PlannedExpense[]>([]);
  const [observedExpenses, setObservedExpenses] = useState<ObservedExpense[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [kpis, setKpis] = useState<ExpenseKpis | null>(null);
  const [comparison, setComparison] = useState<ExpenseComparison[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<PlannedExpense | null>(null);
  const [installments, setInstallments] = useState<ExpenseInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PlannedExpense | null>(null);
  const [showFx, setShowFx] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<ExpenseInstallment | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<string>('ARS');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (plannedExpenses.length > 0 || observedExpenses.length > 0) {
      calculateMetrics();
    }
  }, [plannedExpenses, observedExpenses]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [planned, observed, cardsData] = await Promise.all([
        getPlannedExpenses(),
        getObservedExpenses(),
        getCards()
      ]);
      setPlannedExpenses(planned);
      setObservedExpenses(observed);
      setCards(cardsData);
    } catch (error) {
      showToast('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const kpisData = computeExpenseKpis(observedExpenses);
    const currentMonth = new Date().toISOString().substring(0, 7);
    const comparisonData = generateExpenseComparison(plannedExpenses, observedExpenses, currentMonth);

    setKpis(kpisData);
    setComparison(comparisonData);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateExpense = async (data: ExpenseFormData) => {
    try {
      const rate = MOCK_RATES_TO_ARS[data.currency as keyof typeof MOCK_RATES_TO_ARS] || 1;
      const amountARS = parseFloat(data.amount) * rate;

      const expenseData: Omit<PlannedExpense, 'id' | 'created_at' | 'updated_at'> = {
        kind: data.kind,
        card_id: data.kind === 'credit' ? data.card_id : undefined,
        category: data.category,
        currency: data.currency,
        amount: data.amount,
        amount_equiv_est_ars: data.currency !== 'ARS' ? amountARS.toFixed(2) : undefined,
        fx_quote_rate_est: data.currency !== 'ARS' ? `${data.currency}→ARS ${rate.toFixed(2)}` : undefined,
        concept: data.concept || undefined,
        date: data.date,
        n_installments: data.kind === 'credit' ? data.n_installments : undefined,
        is_active: data.is_active,
      };

      const newExpense = await createPlannedExpense(expenseData);
      setPlannedExpenses(prev => [...prev, newExpense]);
      setModalOpen(false);
      showToast('Gasto planificado creado exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear el gasto planificado', 'error');
    }
  };

  const handleUpdateExpense = async (data: ExpenseFormData) => {
    if (!editingExpense) return;
    
    try {
      const rate = MOCK_RATES_TO_ARS[data.currency as keyof typeof MOCK_RATES_TO_ARS] || 1;
      const amountARS = parseFloat(data.amount) * rate;

      const updates: Partial<PlannedExpense> = {
        kind: data.kind,
        card_id: data.kind === 'credit' ? data.card_id : undefined,
        category: data.category,
        currency: data.currency,
        amount: data.amount,
        amount_equiv_est_ars: data.currency !== 'ARS' ? amountARS.toFixed(2) : undefined,
        fx_quote_rate_est: data.currency !== 'ARS' ? `${data.currency}→ARS ${rate.toFixed(2)}` : undefined,
        concept: data.concept || undefined,
        date: data.date,
        n_installments: data.kind === 'credit' ? data.n_installments : undefined,
        is_active: data.is_active,
      };

      const updatedExpense = await updatePlannedExpense(editingExpense.id, updates);
      setPlannedExpenses(prev => prev.map(expense => 
        expense.id === editingExpense.id ? updatedExpense : expense
      ));
      setModalOpen(false);
      setEditingExpense(null);
      showToast('Gasto planificado actualizado exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar el gasto planificado', 'error');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const expense = plannedExpenses.find(e => e.id === id);
    if (!expense) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar "${expense.concept || 'este gasto'}"? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deletePlannedExpense(id);
        setPlannedExpenses(prev => prev.filter(e => e.id !== id));
        if (selectedExpense?.id === id) {
          setSelectedExpense(null);
          setInstallments([]);
        }
        showToast('Gasto planificado eliminado exitosamente', 'success');
      } catch (error) {
        showToast('Error al eliminar el gasto planificado', 'error');
      }
    }
  };

  const handleEditExpense = (expense: PlannedExpense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleViewInstallments = async (expense: PlannedExpense) => {
    setSelectedExpense(expense);
    
    // Generate installments using business rules
    const card = cards.find(c => c.id === expense.card_id);
    const generatedInstallments = generateInstallments(expense, card);
    setInstallments(generatedInstallments);
  };

  const handleMarkPaid = async (installmentId: string) => {
    try {
      await markInstallmentPaid(installmentId);
      setInstallments(prev => prev.map(inst => 
        inst.id === installmentId ? { ...inst, status: 'paid' as const } : inst
      ));
      showToast('Cuota marcada como pagada', 'success');
    } catch (error) {
      showToast('Error al marcar la cuota como pagada', 'error');
    }
  };

  const handleGenerateFx = (installment: ExpenseInstallment) => {
    setSelectedInstallment(installment);
    setShowFx(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Cargando datos de gastos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Gastos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Planificación y seguimiento de gastos multimoneda
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo gasto planificado
        </button>
      </div>

      {/* KPIs */}
      {kpis && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              KPIs ({displayCurrency})
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ver en:</span>
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="select-field"
              >
                <option value="ARS">ARS (Pesos)</option>
                <option value="USD">USD (Dólares)</option>
                <option value="BRL">BRL (Reales)</option>
                <option value="USDT">USDT</option>
                <option value="EUR">EUR (Euros)</option>
              </select>
            </div>
          </div>
          <ExpenseKpiHeader kpis={kpis} displayCurrency={displayCurrency} />
        </section>
      )}

      {/* Plan vs Real */}
      <section>
        <ExpensePlanVsReal 
          comparisons={comparison} 
          month={new Date().toISOString().substring(0, 7)}
          displayCurrency={displayCurrency}
        />
      </section>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de gastos planificados */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Gastos planificados (próximos 3 meses)
          </h2>
          <ExpensePlannedList
            expenses={plannedExpenses.filter(e => e.is_active)}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onViewInstallments={handleViewInstallments}
          />
        </section>

        {/* Panel de cuotas */}
        {selectedExpense && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Gestión de cuotas
            </h2>
            <ExpenseInstallmentsPanel
              expense={selectedExpense}
              installments={installments}
              onMarkPaid={handleMarkPaid}
              onGenerateFx={handleGenerateFx}
            />
          </section>
        )}
      </div>

      {/* Formulario FX */}
      {showFx && selectedInstallment && (
        <section className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Generar conversión para cuota {selectedInstallment.installment_number}
          </h3>
          <FxForm 
            defaultFromCurrency="USDT" 
            defaultToCurrency={selectedInstallment.currency} 
            defaultToAmount={selectedInstallment.deficit?.amount || selectedInstallment.amount_base} 
            onSave={() => {
              setShowFx(false);
              showToast('Conversión generada (mock)', 'success');
            }} 
          />
        </section>
      )}

      {/* Modal */}
      <ExpenseFormModal
        open={modalOpen}
        initial={editingExpense}
        onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
        onClose={handleCloseModal}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};