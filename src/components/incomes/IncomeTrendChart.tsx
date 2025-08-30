import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { IncomeMonthlyAgg, IncomeForecast } from '../../types/incomes';

type Props = {
  historical: IncomeMonthlyAgg[];
  forecast: IncomeForecast;
  selectedScenario: 'conservative' | 'base' | 'optimistic';
};

export const IncomeTrendChart: React.FC<Props> = ({ historical, forecast, selectedScenario }) => {
  const formatCurrency = (value: number) => {
    return `ARS ${new Intl.NumberFormat('es-AR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value)}`;
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[parseInt(monthNum) - 1]} ${year.slice(2)}`;
  };

  // Combine historical and forecast data
  const chartData = [
    ...historical.slice(-12).map(h => ({
      month: formatMonth(h.month),
      observed: h.observed_ars,
      planned: h.planned_ars,
      type: 'historical'
    })),
    ...forecast.months.map(f => ({
      month: formatMonth(f.month),
      forecast: selectedScenario === 'conservative' ? f.conservative_ars :
                selectedScenario === 'optimistic' ? f.optimistic_ars :
                f.base_ars,
      type: 'forecast'
    }))
  ];

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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tendencia de ingresos (12m + 3m forecast)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Histórico vs planificado y proyección {selectedScenario} en {displayCurrency}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Observado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Planificado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Proyección</span>
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
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Observado"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Planificado"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="10 5"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              name={`Proyección (${selectedScenario})`}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};