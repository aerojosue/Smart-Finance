import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Filter, BarChart3, ToggleRight, Edit, Trash2 } from 'lucide-react';
import { IncomeKpiCards } from './IncomeKpiCards';
import { IncomeTrendChart } from './IncomeTrendChart';
import { IncomeComparisonTable } from './IncomeComparisonTable';
import { PlannedIncomesTable } from './PlannedIncomesTable';
import { PlannedIncomeFormModal } from './PlannedIncomeFormModal';
import { getPlannedIncomes, getObservedIncomes, createPlannedIncome, updatePlannedIncome, deletePlannedIncome } from '../../lib/incomesApi';
import { expandPlanned, monthlyAggregate, computeKpis, forecastSimple, generateComparison } from '../../lib/incomeCalculations';
import type { PlannedIncome, ObservedIncome, PlannedIncomeFormData, IncomeKpis, IncomeMonthlyAgg, IncomeForecast, IncomeComparison } from '../../types/incomes';

const categoryLabels = {
  salary: 'Salario',
  freelance: 'Freelance',
  business: 'Negocio',
  investment: 'Inversión',
  rental: 'Alquiler',
  other: 'Otro'
};

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'ARS' ? 'ARS' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const IncomesModule: React.FC = () => {
  const [plannedIncomes, setPlannedIncomes] = useState<PlannedIncome[]>([]);
  const [observedIncomes, setObservedIncomes] = useState<ObservedIncome[]>([]);
  const [kpis, setKpis] = useState<IncomeKpis | null>(null);
  const [aggregates, setAggregates] = useState<IncomeMonthlyAgg[]>([]);
  const [forecast, setForecast] = useState<IncomeForecast | null>(null);
  const [comparison, setComparison] = useState<IncomeComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<PlannedIncome | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'base' | 'optimistic'>('base');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [displayCurrency, setDisplayCurrency] = useState<string>('ARS');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (plannedIncomes.length > 0 || observedIncomes.length > 0) {
      calculateMetrics();
    }
  }, [plannedIncomes, observedIncomes]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [planned, observed] = await Promise.all([
        getPlannedIncomes(),
        getObservedIncomes()
      ]);
      setPlannedIncomes(planned);
      setObservedIncomes(observed);
    } catch (error) {
      showToast('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    // Expand planned incomes for last 12 months + next 3 months
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 12);
    const toDate = new Date();
    toDate.setMonth(toDate.getMonth() + 3);

    const expanded = expandPlanned(
      plannedIncomes, 
      fromDate.toISOString().split('T')[0], 
      toDate.toISOString().split('T')[0]
    );

    const monthlyAgg = monthlyAggregate(observedIncomes, expanded);
    const kpisData = computeKpis(monthlyAgg);
    const forecastData = forecastSimple(monthlyAgg, 3);

    // Generate comparison for current month
    const currentMonth = new Date().toISOString().substring(0, 7);
    const comparisonData = generateComparison(observedIncomes, expanded, currentMonth);

    setAggregates(monthlyAgg);
    setKpis(kpisData);
    setForecast(forecastData);
    setComparison(comparisonData);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateIncome = async (data: PlannedIncomeFormData) => {
    try {
      const incomeData: Omit<PlannedIncome, 'id' | 'created_at' | 'updated_at'> = {
        source: data.source,
        category: data.category,
        currency: data.currency,
        amount: data.use_variable_band ? null : data.amount,
        confidence: data.confidence,
        is_active: data.is_active,
        recurrence: data.recurrence_type === 'one_time' ? null : {
          type: data.recurrence_type,
          day_rule: data.day_rule,
          anchor_day: (data.day_rule === 'fixed_day' || data.day_rule === 'next_business_day') 
            ? data.anchor_day 
            : undefined,
        },
        variable_band: data.use_variable_band ? {
          min: data.variable_min,
          max: data.variable_max,
        } : null,
        notes: data.notes,
      };

      const newIncome = await createPlannedIncome(incomeData);
      setPlannedIncomes(prev => [...prev, newIncome]);
      setModalOpen(false);
      showToast('Ingreso planificado creado exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear el ingreso planificado', 'error');
    }
  };

  const handleUpdateIncome = async (data: PlannedIncomeFormData) => {
    if (!editingIncome) return;
    
    try {
      const updates: Partial<PlannedIncome> = {
        source: data.source,
        category: data.category,
        currency: data.currency,
        amount: data.use_variable_band ? null : data.amount,
        confidence: data.confidence,
        is_active: data.is_active,
        recurrence: data.recurrence_type === 'one_time' ? null : {
          type: data.recurrence_type,
          day_rule: data.day_rule,
          anchor_day: (data.day_rule === 'fixed_day' || data.day_rule === 'next_business_day') 
            ? data.anchor_day 
            : undefined,
        },
        variable_band: data.use_variable_band ? {
          min: data.variable_min,
          max: data.variable_max,
        } : null,
        notes: data.notes,
      };

      const updatedIncome = await updatePlannedIncome(editingIncome.id, updates);
      setPlannedIncomes(prev => prev.map(income => 
        income.id === editingIncome.id ? updatedIncome : income
      ));
      setModalOpen(false);
      setEditingIncome(null);
      showToast('Ingreso planificado actualizado exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar el ingreso planificado', 'error');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    const income = plannedIncomes.find(i => i.id === id);
    if (!income) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar "${income.source}"? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deletePlannedIncome(id);
        setPlannedIncomes(prev => prev.filter(i => i.id !== id));
        showToast('Ingreso planificado eliminado exitosamente', 'success');
      } catch (error) {
        showToast('Error al eliminar el ingreso planificado', 'error');
      }
    }
  };

  const handleEditIncome = (plannedId: string) => {
    const income = plannedIncomes.find(i => i.id === plannedId);
    if (income) {
      setEditingIncome(income);
      setModalOpen(true);
    }
  };

  const handleToggleActive = async (plannedId: string, isActive: boolean) => {
    try {
      const updatedIncome = await updatePlannedIncome(plannedId, { is_active: isActive });
      setPlannedIncomes(prev => prev.map(income => 
        income.id === plannedId ? updatedIncome : income
      ));
      showToast(`Ingreso ${isActive ? 'activado' : 'desactivado'} exitosamente`, 'success');
    } catch (error) {
      showToast('Error al cambiar el estado', 'error');
    }
  };

  const handleEditFromDate = async (plannedId: string, fromDate: string, newAmount: string) => {
    try {
      const updatedIncome = await updatePlannedIncome(plannedId, { 
        amount: newAmount,
        updated_at: new Date().toISOString()
      });
      setPlannedIncomes(prev => prev.map(income => 
        income.id === plannedId ? updatedIncome : income
      ));
      showToast('Monto actualizado desde la fecha especificada', 'success');
    } catch (error) {
      showToast('Error al actualizar el monto', 'error');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingIncome(null);
  };

  // Get expanded planned for next 90 days
  const next3Months = new Date();
  next3Months.setMonth(next3Months.getMonth() + 3);
  const expandedNext90 = expandPlanned(
    plannedIncomes,
    new Date().toISOString().split('T')[0],
    next3Months.toISOString().split('T')[0]
  );

  // Apply filters
  const filteredExpanded = expandedNext90.filter(income => {
    const matchesCurrency = currencyFilter === 'all' || income.currency === currencyFilter;
    const matchesCategory = categoryFilter === 'all' || income.category === categoryFilter;
    return matchesCurrency && matchesCategory;
  });

  const allCurrencies = [...new Set(plannedIncomes.map(i => i.currency))].sort();
  const allCategories = [...new Set(plannedIncomes.map(i => i.category))].sort();

  // Separate active and inactive incomes
  const activeIncomes = plannedIncomes.filter(i => i.is_active);
  const inactiveIncomes = plannedIncomes.filter(i => !i.is_active);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Cargando datos de ingresos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Ingresos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Planificación y seguimiento de ingresos multimoneda
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo ingreso planificado
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
          <IncomeKpiCards kpis={kpis} displayCurrency={displayCurrency} />
        </section>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
        </div>
        <select
          value={currencyFilter}
          onChange={(e) => setCurrencyFilter(e.target.value)}
          className="select-field"
        >
          <option value="all">Todas las monedas</option>
          {allCurrencies.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="select-field"
        >
          <option value="all">Todas las categorías</option>
          {allCategories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Tendencia y forecast */}
      {forecast && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendencia y proyección
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Escenario:</span>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as any)}
                className="select-field"
              >
                <option value="conservative">Conservador (-15%)</option>
                <option value="base">Base (promedio)</option>
                <option value="optimistic">Optimista (+15%)</option>
              </select>
            </div>
          </div>
          <div className="card p-6">
            <IncomeTrendChart 
              historical={aggregates} 
              forecast={forecast} 
              selectedScenario={selectedScenario}
              displayCurrency={displayCurrency}
              displayCurrency={displayCurrency}
            />
          </div>
        </section>
      )}

      {/* Comparación Plan vs Real */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Plan vs Real (mes actual)
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Valores en {displayCurrency}
          </div>
        </div>
        <IncomeComparisonTable 
          comparisons={comparison} 
          month={new Date().toISOString().substring(0, 7)}
          displayCurrency={displayCurrency}
        />
      </section>

      {/* Tabla de planificados próximos 90 días */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ingresos planificados (próximos 3 meses)
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Equivalencias en {displayCurrency}
          </div>
        </div>
        <PlannedIncomesTable
          plannedIncomes={filteredExpanded}
          displayCurrency={displayCurrency}
          onEdit={handleEditIncome}
          onDelete={handleDeleteIncome}
          onToggleActive={handleToggleActive}
          onEditFromDate={handleEditFromDate}
        />
      </section>

      {/* Ingresos inactivos */}
      {inactiveIncomes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Ingresos inactivos
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {inactiveIncomes.length} ingresos desactivados
            </div>
          </div>
          <div className="card p-6">
            <div className="space-y-3">
              {inactiveIncomes.map(income => (
                <div key={income.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{income.source}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {categoryLabels[income.category as keyof typeof categoryLabels]} · {income.currency}
                        {income.amount && ` · ${formatCurrency(parseFloat(income.amount), income.currency)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(income.id, true)}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      <ToggleRight className="w-3 h-3" />
                      Reactivar
                    </button>
                    <button
                      onClick={() => handleEditIncome(income.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteIncome(income.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal */}
      <PlannedIncomeFormModal
        open={modalOpen}
        initial={editingIncome}
        onSubmit={editingIncome ? handleUpdateIncome : handleCreateIncome}
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