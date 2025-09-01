import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown } from 'lucide-react';

type ExpenseMonthlyData = {
  month: string;
  planned_ars: number;
  observed_ars: number;
  variance_ars: number;
};

type Props = {
  historical: ExpenseMonthlyData[];
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

export const ExpenseTrendChart: React.FC<Props> = ({ historical, displayCurrency }) => {
  const convertFromARS = (amountARS: number, toCurrency: string): number => {
    const rate = MOCK_RATES_FROM_ARS[toCurrency as keyof typeof MOCK_RATES_FROM_ARS] || 1;
    return amountARS * rate;
  };

  const formatCurrency = (value: number) => {
    const convertedAmount = convertFromARS(value, displayCurrency);
    return `${displayCurrency} ${new Intl.NumberFormat('es-AR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(convertedAmount)}`;
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[parseInt(monthNum) - 1]} ${year.slice(2)}`;
  };

  const chartData = historical.map(h => ({
    month: formatMonth(h.month),
    planned: convertFromARS(h.planned_ars, displayCurrency),
    observed: convertFromARS(h.observed_ars, displayCurrency),
    variance: convertFromARS(h.variance_ars, displayCurrency)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Tendencia de gastos (últimos 6 meses)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Planificado vs observado en {displayCurrency}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Observado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Planificado</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Line
              type="monotone"
              dataKey="observed"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              name="Observado"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
              name="Planificado"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};