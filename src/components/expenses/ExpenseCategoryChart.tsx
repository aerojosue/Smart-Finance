import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingDown } from 'lucide-react';

type CategoryData = {
  category: string;
  amount_ars: number;
  percentage: number;
  color: string;
};

type Props = {
  data: CategoryData[];
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

const categoryColors = {
  food: '#10b981',
  transport: '#3b82f6',
  entertainment: '#8b5cf6',
  health: '#ef4444',
  shopping: '#f59e0b',
  bills: '#06b6d4',
  other: '#6b7280',
};

export const ExpenseCategoryChart: React.FC<Props> = ({ data, displayCurrency }) => {
  const convertFromARS = (amountARS: number, toCurrency: string): number => {
    const rate = MOCK_RATES_FROM_ARS[toCurrency as keyof typeof MOCK_RATES_FROM_ARS] || 1;
    return amountARS * rate;
  };

  const formatCurrency = (amount: number) => {
    const convertedAmount = convertFromARS(amount, displayCurrency);
    return `${displayCurrency} ${new Intl.NumberFormat('es-AR').format(Math.round(convertedAmount))}`;
  };

  // Prepare chart data
  const chartData = data.map(item => ({
    name: categoryLabels[item.category as keyof typeof categoryLabels] || item.category,
    value: item.amount_ars,
    percentage: item.percentage,
    color: categoryColors[item.category as keyof typeof categoryColors] || '#6b7280'
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{data.name}</p>
          <div className="space-y-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Monto: <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(data.value)}</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Porcentaje: <span className="font-medium text-gray-900 dark:text-gray-100">{data.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const total = data.reduce((sum, item) => sum + item.amount_ars, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Gastos por categoría
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {formatCurrency(total)}
        </div>
      </div>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de torta */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista detallada */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Detalle por categoría</h4>
            {chartData
              .sort((a, b) => b.value - a.value)
              .map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{index + 1} {item.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.value)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay datos de gastos para mostrar
        </div>
      )}
    </div>
  );
};