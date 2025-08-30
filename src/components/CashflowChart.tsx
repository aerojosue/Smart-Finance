import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

type CashflowData = {
  date: string;
  day: number;
  income: number;
  expenses: number;
  balance: number;
  cumulative: number;
};

type Props = {
  data: CashflowData[];
  currency: string;
};

export const CashflowChart: React.FC<Props> = ({ data, currency }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltipValue = (value: number, name: string) => {
    const labels: Record<string, string> = {
      cumulative: 'Saldo acumulado',
      income: 'Ingresos',
      expenses: 'Gastos'
    };
    return [formatCurrency(value), labels[name] || name];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">Día {label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">Ingresos: {formatCurrency(data.income)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingDown className="w-3 h-3 text-red-600" />
              <span className="text-red-600">Gastos: {formatCurrency(data.expenses)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium pt-1 border-t">
              <span className="text-gray-900 dark:text-gray-100">Saldo: {formatCurrency(data.cumulative)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const minBalance = Math.min(...data.map(d => d.cumulative));
  const maxBalance = Math.max(...data.map(d => d.cumulative));
  const padding = (maxBalance - minBalance) * 0.1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Flujo de caja - Septiembre 2025</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Evolución diaria del saldo en {currency}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Saldo acumulado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Gastos</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
              domain={[minBalance - padding, maxBalance + padding]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Área principal del saldo acumulado */}
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#balanceGradient)"
              name="cumulative"
            />
            
            {/* Líneas de ingresos y gastos */}
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={1}
              fill="url(#incomeGradient)"
              name="income"
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={1}
              fill="url(#expenseGradient)"
              name="expenses"
              stackId="2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.reduce((sum, d) => sum + d.income, 0))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total ingresos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.reduce((sum, d) => sum + d.expenses, 0))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total gastos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(data[data.length - 1]?.cumulative || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Saldo final</div>
        </div>
      </div>
    </div>
  );
};