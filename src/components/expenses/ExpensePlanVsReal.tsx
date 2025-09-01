import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, BarChart3 } from 'lucide-react';
import type { ExpenseComparison } from '../../types/expenses';

type Props = {
  comparisons: ExpenseComparison[];
  month: string;
  displayCurrency: string;
};

const statusIcons = {
  good: <CheckCircle className="w-4 h-4 text-green-600" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
  bad: <XCircle className="w-4 h-4 text-red-600" />,
};

const statusColors = {
  good: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  bad: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const categoryLabels = {
  food: 'Comida',
  transport: 'Transporte',
  entertainment: 'Entretenimiento',
  health: 'Salud',
  shopping: 'Compras',
  bills: 'Servicios',
  other: 'Otros',
};

export const ExpensePlanVsReal: React.FC<Props> = ({ comparisons, month, displayCurrency }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR').format(Math.round(amount));
  };

  const formatPercentage = (pct: number) => {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  if (comparisons.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Plan vs Real - {formatMonth(month)}
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay datos para comparar en este mes
        </div>
      </div>
    );
  }

  const totals = comparisons.reduce((acc, comp) => ({
    planned: acc.planned + comp.planned_ars,
    observed: acc.observed + comp.observed_ars,
    variance: acc.variance + comp.variance_ars,
  }), { planned: 0, observed: 0, variance: 0 });

  const totalVariancePct = totals.planned > 0 
    ? (totals.variance / totals.planned) * 100 
    : 0;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Plan vs Real - {formatMonth(month)}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Varianza total: <span className={`font-medium ${
            totalVariancePct <= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(totalVariancePct)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {comparisons.map((comp, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {statusIcons[comp.status]}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {categoryLabels[comp.category as keyof typeof categoryLabels]}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[comp.status]}`}>
                  {comp.status === 'good' ? 'Bien' : comp.status === 'warning' ? 'Atención' : 'Excedido'}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  comp.variance_ars <= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(comp.variance_pct)}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Planificado: {formatCurrency(comp.planned_ars)}</span>
                <span>Real: {formatCurrency(comp.observed_ars)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    comp.variance_pct <= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(10, (comp.observed_ars / Math.max(comp.planned_ars, comp.observed_ars)) * 100))}%` 
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totals.planned)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total planificado</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totals.observed)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total real</div>
          </div>
          <div>
            <div className={`text-lg font-bold ${
              totals.variance <= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totals.variance)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Diferencia</div>
          </div>
        </div>
      </div>
    </div>
  );
};