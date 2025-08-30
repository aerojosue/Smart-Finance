import React, { useState } from 'react';
import { Calendar, Edit, Trash2, AlertCircle, Info, ToggleLeft, ToggleRight, X } from 'lucide-react';
import type { ExpandedPlannedIncome } from '../../types/incomes';

type Props = {
  plannedIncomes: ExpandedPlannedIncome[];
  displayCurrency: string;
  onEdit: (plannedId: string) => void;
  onDelete: (plannedId: string) => void;
  onToggleActive: (plannedId: string, isActive: boolean) => void;
  onEditFromDate: (plannedId: string, fromDate: string, newAmount: string) => void;
  onEditSpecificDate: (plannedId: string, specificDate: string, newAmount: string) => void;
};

// Mock exchange rates from ARS
const MOCK_RATES_FROM_ARS = {
  ARS: 1,
  USD: 1/1000, // 1000 ARS = 1 USD
  BRL: 1/200,  // 200 ARS = 1 BRL
  USDT: 1/1000, // 1000 ARS = 1 USDT
  EUR: 1/1100, // 1100 ARS = 1 EUR
};

const confidenceColors = {
  high: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
};

const confidenceLabels = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const categoryLabels = {
  salary: 'Salario',
  freelance: 'Freelance',
  rental: 'Alquiler',
  investment: 'Inversión',
  bonus: 'Bonus',
  other: 'Otro',
};

export const PlannedIncomesTable: React.FC<Props> = ({ 
  plannedIncomes, 
  displayCurrency, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onEditFromDate,
  onEditSpecificDate
}) => {
  const [editingAmount, setEditingAmount] = useState<{
    plannedId: string;
    date: string;
    currentAmount: string;
    currency: string;
    newAmount: string;
  } | null>(null);

  const convertFromARS = (amountARS: number, toCurrency: string): number => {
    const rate = MOCK_RATES_FROM_ARS[toCurrency as keyof typeof MOCK_RATES_FROM_ARS] || 1;
    return amountARS * rate;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${new Intl.NumberFormat('es-AR').format(amount)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Group by planned_id to avoid duplicates
  const uniquePlanned = plannedIncomes.reduce((acc, income) => {
    if (!acc.find(i => i.planned_id === income.planned_id && i.date === income.date)) {
      acc.push(income);
    }
    return acc;
  }, [] as ExpandedPlannedIncome[]);

  // Sort by date
  const sortedPlanned = uniquePlanned.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate totals
  const totals = {
    planned: sortedPlanned.reduce((sum, income) => sum + income.amount_ars, 0),
    observed: 0, // This component only shows planned incomes
    variance: 0  // Will be calculated when we have observed data
  };

  const handleAmountEdit = (plannedId: string, currentAmount: string, currency: string, date: string) => {
    setEditingAmount({
      plannedId,
      date,
      currentAmount,
      currency,
      newAmount: currentAmount
    });
  };

  const handleSaveAmount = (type: 'specific' | 'fromDate') => {
    if (!editingAmount || !editingAmount.newAmount || parseFloat(editingAmount.newAmount) <= 0) return;

    if (type === 'fromDate') {
      onEditFromDate(editingAmount.plannedId, editingAmount.date, editingAmount.newAmount);
    } else {
      onEditSpecificDate(editingAmount.plannedId, editingAmount.date, editingAmount.newAmount);
    }

    setEditingAmount(null);
  };

  const handleCancelEdit = () => {
    setEditingAmount(null);
  };

  if (sortedPlanned.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ingresos planificados
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay ingresos planificados activos
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Ingresos planificados
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Fuente
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Monto
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Confianza
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlanned.map((income, index) => (
              <tr key={`${income.planned_id}_${income.date}`} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(income.date)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {income.source}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {categoryLabels[income.category as keyof typeof categoryLabels]}
                    </div>
                  </div>
                </td>
                <td className="text-right py-3 px-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" 
                    onClick={() => handleAmountEdit(income.planned_id, income.amount_original.toString(), income.currency, income.date)}
                    title="Click para editar monto">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(income.amount_original, income.currency)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ≈ ARS {new Intl.NumberFormat('es-AR').format(Math.round(income.amount_ars))}
                  </div>
                </td>
                <td className="text-center py-3 px-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${confidenceColors[income.confidence]}`}>
                    {confidenceLabels[income.confidence]}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  {income.is_pending ? (
                    <div className="flex items-center justify-center gap-1" title="Regístralo en Movimientos">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded-full">
                        Pendiente
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                      Programado
                    </span>
                  )}
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(income.planned_id)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Editar planificación"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDelete(income.planned_id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Eliminar planificación"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {displayCurrency} {new Intl.NumberFormat('es-AR').format(Math.round(convertFromARS(totals.planned, displayCurrency)))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total planificado</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {displayCurrency} {new Intl.NumberFormat('es-AR').format(Math.round(convertFromARS(totals.observed, displayCurrency)))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total observado</div>
          </div>
          <div>
            <div className={`text-lg font-bold ${
              totals.variance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {displayCurrency} {new Intl.NumberFormat('es-AR').format(Math.round(convertFromARS(totals.variance, displayCurrency)))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Diferencia</div>
          </div>
        </div>
      </div>

      {/* Modal de edición de monto */}
      {editingAmount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Editar monto
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fecha:</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{formatDate(editingAmount.date)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nuevo monto ({editingAmount.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editingAmount.newAmount}
                  onChange={(e) => setEditingAmount(prev => prev ? {...prev, newAmount: e.target.value} : null)}
                  className="input-field w-full"
                  placeholder="0.00"
                  autoFocus
                />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <div className="font-medium mb-2">¿Cómo aplicar este cambio?</div>
                  <div className="space-y-1 text-xs">
                    <div>• <strong>Solo esta fecha:</strong> Cambio temporal (ej: horas extras)</div>
                    <div>• <strong>Esta fecha y siguientes:</strong> Cambio permanente (ej: aumento de salario)</div>
                  </div>
                </div>
              </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAmount('fromDate')}
                  className="btn-primary flex-1"
                  disabled={!editingAmount.newAmount || parseFloat(editingAmount.newAmount) <= 0}
                >
                  Actualizar ingreso
                </button>
                <button
                  onClick={() => handleSaveAmount('specific')}
                  className="btn-secondary flex-1"
                  disabled={!editingAmount.newAmount || parseFloat(editingAmount.newAmount) <= 0}
                >
                  Esta y siguientes
                </button>
              </div>
                  type="button"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};