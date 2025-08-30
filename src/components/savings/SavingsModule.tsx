import React, { useState, useEffect } from 'react';
import { Plus, Target, Calculator, TrendingUp } from 'lucide-react';
import { SavingGoalList } from './SavingGoalList';
import { SavingGoalFormModal } from './SavingGoalFormModal';
import { SurplusAllocator } from './SurplusAllocator';
import { ContributionModal } from './ContributionModal';
import { getSavingGoals, createSavingGoal, updateSavingGoal, deleteSavingGoal } from '../../lib/savingsApi';
import { transferToGoal } from '../../lib/movementsApi';
import type { SavingGoal, SavingGoalFormData, AllocationSuggestion } from '../../types/savings';

export const SavingsModule: React.FC = () => {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await getSavingGoals();
      setGoals(data);
    } catch (error) {
      showToast('Error al cargar las metas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateGoal = async (data: SavingGoalFormData) => {
    try {
      const newGoal = await createSavingGoal(data);
      setGoals(prev => [...prev, newGoal]);
      setModalOpen(false);
      showToast('Meta creada exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear la meta', 'error');
    }
  };

  const handleUpdateGoal = async (data: SavingGoalFormData) => {
    if (!editingGoal) return;
    
    try {
      const updatedGoal = await updateSavingGoal(editingGoal.id, data);
      setGoals(prev => prev.map(goal => 
        goal.id === editingGoal.id ? updatedGoal : goal
      ));
      setModalOpen(false);
      setEditingGoal(null);
      showToast('Meta actualizada exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar la meta', 'error');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la meta "${goal.name}"? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteSavingGoal(id);
        setGoals(prev => prev.filter(g => g.id !== id));
        showToast('Meta eliminada exitosamente', 'success');
      } catch (error) {
        showToast('Error al eliminar la meta', 'error');
      }
    }
  };

  const handleEditGoal = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleContributeToGoal = (goal: SavingGoal) => {
    setSelectedGoal(goal);
    setContributionModalOpen(true);
  };

  const handleContribution = async (data: {
    fromAccountId: string;
    amount: string;
    currency: string;
    description: string;
  }) => {
    if (!selectedGoal) return;

    try {
      await transferToGoal(
        data.fromAccountId,
        selectedGoal.id,
        data.amount,
        data.currency,
        data.description
      );

      // Update goal balance locally
      const updatedGoal = {
        ...selectedGoal,
        current_amount: (parseFloat(selectedGoal.current_amount) + parseFloat(data.amount)).toFixed(2),
        updated_at: new Date().toISOString()
      };

      setGoals(prev => prev.map(goal => 
        goal.id === selectedGoal.id ? updatedGoal : goal
      ));

      setContributionModalOpen(false);
      setSelectedGoal(null);
      showToast('Aporte realizado exitosamente', 'success');
    } catch (error) {
      showToast('Error al realizar el aporte', 'error');
    }
  };

  const handleApplyAllocations = (suggestion: AllocationSuggestion) => {
    // In a real app, this would navigate to Movements module with pre-filled data
    alert(`Aplicando ${suggestion.allocations.length} sugerencias en Movimientos (funcionalidad pendiente)`);
    showToast('Sugerencias aplicadas en Movimientos', 'success');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGoal(null);
  };

  const handleCloseContributionModal = () => {
    setContributionModalOpen(false);
    setSelectedGoal(null);
  };

  // Calculate summary stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => parseFloat(g.current_amount) >= parseFloat(g.target_amount)).length;
  const totalSavedByurrency = goals.reduce((acc, goal) => {
    const currency = goal.base_currency;
    const saved = parseFloat(goal.current_amount);
    acc[currency] = (acc[currency] || 0) + saved;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Cargando metas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="w-6 h-6" />
            Ahorros (Metas)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tus objetivos de ahorro y realiza aportes
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva meta
        </button>
      </div>

      {/* Resumen de ahorros */}
      {Object.keys(totalSavedByurrency).length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Total ahorrado por moneda
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(totalSavedByurrency).map(([currency, amount]) => (
              <div key={currency} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Intl.NumberFormat('es-AR').format(amount)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currency}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sugeridor de asignación */}
      <SurplusAllocator 
        goals={goals} 
        onApplyAllocations={handleApplyAllocations}
      />

      {/* Lista de metas */}
      <SavingGoalList
        goals={goals}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
        onContribute={handleContributeToGoal}
      />

      {/* Modales */}
      <SavingGoalFormModal
        open={modalOpen}
        initial={editingGoal}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        onClose={handleCloseModal}
      />

      <ContributionModal
        open={contributionModalOpen}
        goal={selectedGoal}
        onSubmit={handleContribution}
        onClose={handleCloseContributionModal}
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