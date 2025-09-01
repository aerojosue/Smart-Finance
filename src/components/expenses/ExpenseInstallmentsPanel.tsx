import React, { useState } from 'react';
import { CreditCard, AlertCircle, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import type { ExpenseInstallment, PlannedExpense } from '../../types/expenses';

type Props = {
  expense: PlannedExpense;
  installments: ExpenseInstallment[];
  onMarkPaid: (installmentId: string) => void;
  onGenerateFx: (installment: ExpenseInstallment) => void;
};

const statusColors = {
  upcoming: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  due: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
};

const statusLabels = {
  upcoming: 'Próxima',
  warning: 'Atención',
  urgent: 'Urgente',
  due: 'Vencida',
  paid: 'Pagada',
};

export const ExpenseInstallmentsPanel: React.FC<Props> = ({ 
  expense, 
  installments, 
  onMarkPaid, 
  onGenerateFx 
}) => {
  const [selectedInstallment, setSelectedInstallment] = useState<ExpenseInstallment | null>(null);

  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} ${new Intl.NumberFormat('es-AR').format(parseFloat(amount))}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header del gasto */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">🛍️</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {expense.concept || 'Gasto planificado'}
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(expense.amount, expense.currency)} en {expense.n_installments} cuotas
            </div>
          </div>
        </div>
      </div>

      {/* Lista de cuotas */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Cronograma de cuotas
        </h3>
        
        <div className="space-y-3">
          {installments.map(installment => (
            <div 
              key={installment.id} 
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedInstallment?.id === installment.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedInstallment(installment)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Cuota {installment.installment_number}/{installment.total_installments}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[installment.status]}`}>
                    {statusLabels[installment.status]}
                  </span>
                  {installment.deficit && (
                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" />
                      Déficit
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(installment.amount_base, installment.currency)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Vence: {formatDate(installment.due_date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalle de cuota seleccionada */}
      {selectedInstallment && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Detalle de cuota {selectedInstallment.installment_number}
          </h3>

          <div className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Monto base</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(selectedInstallment.amount_base, selectedInstallment.currency)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fecha de vencimiento</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatDate(selectedInstallment.due_date)}
                </div>
              </div>
            </div>

            {/* Déficit */}
            {selectedInstallment.deficit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900 dark:text-red-100">Déficit detectado</span>
                </div>
                <div className="text-red-800 dark:text-red-200">
                  Faltan {formatCurrency(selectedInstallment.deficit.amount, selectedInstallment.deficit.currency)}
                </div>
              </div>
            )}

            {/* Sugerencias de cobertura */}
            {selectedInstallment.suggestions && selectedInstallment.suggestions.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sugerencias de cobertura
                </div>
                <div className="space-y-2">
                  {selectedInstallment.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {suggestion.from_currency} → {selectedInstallment.currency}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion.est_rate}
                          {suggestion.est_spread_pct && ` · spread ${suggestion.est_spread_pct}%`}
                        </div>
                        {suggestion.platform_suggested && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            Plataforma: {suggestion.platform_suggested}
                          </div>
                        )}
                      </div>
                      <button 
                        className="btn-primary text-sm"
                        onClick={() => onGenerateFx(selectedInstallment)}
                      >
                        Generar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onGenerateFx(selectedInstallment)}
                className="btn-primary flex-1"
              >
                Generar conversión
              </button>
              {selectedInstallment.status !== 'paid' && (
                <button
                  onClick={() => onMarkPaid(selectedInstallment.id)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar como pagada
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};