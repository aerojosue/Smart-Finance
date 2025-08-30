import React, { useState } from 'react';
import { Search, Filter, Target } from 'lucide-react';
import { SavingGoalCard } from './SavingGoalCard';
import type { SavingGoal } from '../../types/savings';

type Props = {
  goals: SavingGoal[];
  onEdit: (goal: SavingGoal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: SavingGoal) => void;
};

export const SavingGoalList: React.FC<Props> = ({ goals, onEdit, onDelete, onContribute }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || goal.priority === priorityFilter;
    const matchesCurrency = currencyFilter === 'all' || goal.base_currency === currencyFilter;
    
    const current = parseFloat(goal.current_amount);
    const target = parseFloat(goal.target_amount);
    const isCompleted = current >= target;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'completed' && isCompleted) ||
                         (statusFilter === 'active' && !isCompleted);
    
    return matchesSearch && matchesPriority && matchesCurrency && matchesStatus;
  });

  const allCurrencies = [...new Set(goals.map(goal => goal.base_currency))].sort();

  // Calculate stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => parseFloat(g.current_amount) >= parseFloat(g.target_amount)).length;
  const totalTargetByCurrency = goals.reduce((acc, goal) => {
    const currency = goal.base_currency;
    const target = parseFloat(goal.target_amount);
    acc[currency] = (acc[currency] || 0) + target;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar metas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="select-field"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
          
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="completed">Completadas</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalGoals}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total metas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completadas</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalGoals - completedGoals}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">En progreso</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {Object.keys(totalTargetByCurrency).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Monedas</div>
        </div>
      </div>

      {/* Resumen */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          {filteredGoals.length} de {goals.length} metas
          {searchTerm && ` · Filtrado por "${searchTerm}"`}
        </span>
        <span>
          {((completedGoals / totalGoals) * 100).toFixed(1)}% completadas
        </span>
      </div>

      {/* Grid de metas */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map(goal => (
            <SavingGoalCard
              key={goal.id}
              goal={goal}
              onEdit={onEdit}
              onDelete={onDelete}
              onContribute={onContribute}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'No se encontraron metas' : 'No hay metas registradas'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primera meta de ahorro'
            }
          </p>
        </div>
      )}
    </div>
  );
};