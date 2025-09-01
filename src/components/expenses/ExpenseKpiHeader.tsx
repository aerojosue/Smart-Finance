import React from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, CreditCard, Wallet } from 'lucide-react';
import type { ExpenseKpis } from '../../types/expenses';

type Props = {
  kpis: ExpenseKpis;
  displayCurrency: string;
};

// Mock exchange rates from ARS
const MOCK_RATES_FROM_ARS = {
  ARS: 1,
  USD: 1/1000,
  BRL: 1/200,
  USDT: 1/1000,
  EUR: 1/1100,
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

export const ExpenseKpiHeader: React.FC<Props> = ({ kpis, displayCurrency }) => {
  const convertFromARS = (amountARS: number, toCurrency: string): number => {
    const rate = MOCK_RATES_FROM_ARS[toCurrency as keyof typeof MOCK_RATES_FROM_ARS] || 1;
    return amountARS * rate;
  };

  const formatCurrency = (amount: number) => {
    const convertedAmount = convertFromARS(amount, displayCurrency);
    return `${displayCurrency} ${new Intl.NumberFormat('es-AR').format(Math.round(convertedAmount))}`;
  };

  const formatPercentage = (pct: number) => {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gasto del mes */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Gastos (mes)</div>
          <ShoppingCart className="w-4 h-4 text-red-600" />
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(kpis.current_month_ars)}
        </div>
      </div>

      {/* MoM % */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">MoM %</div>
          {kpis.mom_pct >= 0 ? (
            <TrendingUp className="w-4 h-4 text-red-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-green-600" />
          )}
        </div>
        <div className={`text-xl font-bold ${
          kpis.mom_pct >= 0 ? 'text-red-600' : 'text-green-600'
        }`}>
          {formatPercentage(kpis.mom_pct)}
        </div>
      </div>

      {/* Crédito vs Débito */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Crédito/Débito</div>
          <CreditCard className="w-4 h-4 text-blue-600" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Crédito:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{kpis.credit_vs_debit.credit_pct}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Débito:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{kpis.credit_vs_debit.debit_pct}%</span>
          </div>
        </div>
      </div>

      {/* Top categorías */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Top categorías</div>
          <Wallet className="w-4 h-4 text-purple-600" />
        </div>
        <div className="space-y-1">
          {kpis.top_categories.map((cat, index) => (
            <div key={cat.category} className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {index + 1}. {categoryLabels[cat.category as keyof typeof categoryLabels]}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {cat.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};