import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, Target } from 'lucide-react';
import type { IncomeKpis } from '../../types/incomes';

type Props = {
  kpis: IncomeKpis;
};

export const IncomeKpiCards: React.FC<Props> = ({ kpis }) => {
  const formatCurrency = (amount: number) => {
    return `ARS ${new Intl.NumberFormat('es-AR').format(Math.round(amount))}`;
  };

  const formatPercentage = (pct: number) => {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Mes actual</div>
          <DollarSign className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(kpis.current_month_ars)}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Mes anterior</div>
          <Calendar className="w-4 h-4 text-gray-600" />
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(kpis.previous_month_ars)}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">MoM %</div>
          {kpis.mom_pct >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
        </div>
        <div className={`text-xl font-bold ${
          kpis.mom_pct >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatPercentage(kpis.mom_pct)}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">YTD</div>
          <Target className="w-4 h-4 text-purple-600" />
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(kpis.ytd_ars)}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg 6m</div>
          <BarChart3 className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(kpis.avg_6m_ars)}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg 12m</div>
          <BarChart3 className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(kpis.avg_12m_ars)}
        </div>
      </div>
    </div>
  );
};