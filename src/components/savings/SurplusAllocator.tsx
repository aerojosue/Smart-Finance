import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Target, ArrowRight } from 'lucide-react';
import { calculateSurplusAllocation } from '../../lib/savingsAllocator';
import type { SavingGoal, AllocationSuggestion } from '../../types/savings';

type Props = {
  goals: SavingGoal[];
  onApplyAllocations: (allocations: AllocationSuggestion) => void;
};

export const SurplusAllocator: React.FC<Props> = ({ goals, onApplyAllocations }) => {
  const [surplusAmount, setSurplusAmount] = useState('500000');
  const [suggestion, setSuggestion] = useState<AllocationSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestion = async () => {
    const surplus = parseFloat(surplusAmount);
    if (surplus <= 0) return;

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = calculateSurplusAllocation(surplus, goals);
    setSuggestion(result);
    setLoading(false);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${new Intl.NumberFormat('es-AR').format(amount)}`;
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Sugeridor de asignación
        </h2>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <div className="font-medium mb-1">¿Tienes un superávit este mes?</div>
            <p className="text-xs">
              Ingresa el monto disponible y te sugeriremos cómo distribuirlo entre tus metas 
              según prioridad, urgencia y progreso actual.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Superávit disponible (ARS)
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              step="1000"
              min="0"
              value={surplusAmount}
              onChange={(e) => setSurplusAmount(e.target.value)}
              className="input-field flex-1"
              placeholder="500000"
            />
            <button
              onClick={generateSuggestion}
              disabled={loading || !surplusAmount || parseFloat(surplusAmount) <= 0}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculando...' : 'Sugerir'}
            </button>
          </div>
        </div>

        {suggestion && (
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Distribución sugerida
              </h3>
              
              {suggestion.allocations.length > 0 ? (
                <div className="space-y-3">
                  {suggestion.allocations.map((allocation, index) => (
                    <div key={allocation.goal_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {allocation.goal_name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Score: {allocation.score} · {allocation.base_currency}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(allocation.amount_ars, 'ARS')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ≈ {formatCurrency(allocation.amount_in_base, allocation.base_currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Asignado:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(suggestion.total_surplus_ars - suggestion.remaining_ars, 'ARS')}
                    </span>
                  </div>
                  
                  {suggestion.remaining_ars > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Restante:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(suggestion.remaining_ars, 'ARS')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No hay metas activas para asignar
                </div>
              )}
            </div>

            {suggestion.allocations.length > 0 && (
              <button
                onClick={() => onApplyAllocations(suggestion)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Aplicar sugerencias en Movimientos
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};