import React from 'react';
import { 
  Target, 
  Calendar, 
  Edit, 
  Trash2, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { SavingGoal } from '../../types/savings';

type Props = {
  goal: SavingGoal;
  onEdit: (goal: SavingGoal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: SavingGoal) => void;
};

const priorityColors = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const priorityLabels = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const categoryIcons = {
  travel: '✈️',
  health: '🏃',
  emergency: '🚨',
  work: '💼',
  education: '📚',
  home: '🏠',
  other: '🎯',
};

export const SavingGoalCard: React.FC<Props> = ({ goal, onEdit, onDelete, onContribute }) => {
  const current = parseFloat(goal.current_amount);
  const target = parseFloat(goal.target_amount);
  const progress = Math.min(100, (current / target) * 100);
  const remaining = target - current;
  const isCompleted = current >= target;

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${new Intl.NumberFormat('es-AR').format(amount)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha límite';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = () => {
    if (!goal.due_date) return null;
    const today = new Date();
    const dueDate = new Date(goal.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: goal.color }}
          >
            {categoryIcons[goal.category]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{goal.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {formatCurrency(current, goal.base_currency)}
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(target, goal.base_currency)}
          </span>
        </div>
      </div>

      {/* Status and remaining */}
      <div className="mb-4 space-y-2">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">¡Meta completada!</span>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Faltan: <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(remaining, goal.base_currency)}
            </span>
          </div>
        )}

        {/* Due date info */}
        {goal.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {formatDate(goal.due_date)}
            </span>
            {daysUntilDue !== null && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                daysUntilDue <= 30 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : daysUntilDue <= 90
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {daysUntilDue > 0 ? `${daysUntilDue} días` : 'Vencida'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[goal.priority]}`}>
          Prioridad {priorityLabels[goal.priority]}
        </span>
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
          {goal.base_currency}
        </span>
      </div>

      {/* Action button */}
      {!isCompleted && (
        <button
          onClick={() => onContribute(goal)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Aportar
        </button>
      )}
    </div>
  );
};