import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { IncomeComparison } from '../../types/incomes';

type Props = {
  comparisons: IncomeComparison[];
  month: string;
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
  salary: 'Salario',
  freelance: 'Freelance',
  rental: 'Alquiler',
  investment: 'Inversión',
  bonus: 'Bonus',
  other: 'Otro',
};

export const IncomeComparisonTable: React.FC<Props> = ({ comparisons, month }) => {
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Plan vs Real - {formatMonth(month)}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Varianza total: <span className={`font-medium ${
            totalVariancePct >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(totalVariancePct)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Fuente
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Planificado
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Real
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Varianza
              </th>
              <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((comp, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="py-3 px-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {comp.source}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {categoryLabels[comp.category as keyof typeof categoryLabels]}
                    </div>
                  </div>
                </td>
                <td className="text-right py-3 px-2 text-sm text-gray-700 dark:text-gray-300">
                  {formatCurrency(comp.planned_ars)}
                </td>
                <td className="text-right py-3 px-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(comp.observed_ars)}
                </td>
                <td className="text-right py-3 px-2">
                  <div className={`text-sm font-medium ${
                    comp.variance_ars >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(comp.variance_ars)}
                  </div>
                  <div className={`text-xs ${
                    comp.variance_pct >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(comp.variance_pct)}
                  </div>
                </td>
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-2">
                    {statusIcons[comp.status]}
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[comp.status]}`}>
                      {comp.status === 'good' ? 'Bien' : comp.status === 'warning' ? 'Atención' : 'Malo'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-gray-600 font-medium">
              <td className="py-3 px-2 text-gray-900 dark:text-gray-100">Total</td>
              <td className="text-right py-3 px-2 text-gray-900 dark:text-gray-100">
                {formatCurrency(totals.planned)}
              </td>
              <td className="text-right py-3 px-2 text-gray-900 dark:text-gray-100">
                {formatCurrency(totals.observed)}
              </td>
              <td className="text-right py-3 px-2">
                <div className={`${totals.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.variance)}
                </div>
                <div className={`text-xs ${totalVariancePct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(totalVariancePct)}
                </div>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};