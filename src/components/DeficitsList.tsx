import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import type { DeficitItem } from '../types';

type Props = { items: DeficitItem[]; onOpenSuggestion?: (id?: string) => void };

const badgeClass = (s: string) =>
  s === 'warning'
    ? 'bg-amber-100 text-amber-800'
    : s === 'urgent'
      ? 'bg-red-100 text-red-800'
      : 'bg-rose-100 text-rose-800';

export const DeficitsList: React.FC<Props> = ({ items, onOpenSuggestion }) => {
  if (!items?.length) return (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
        <TrendingDown className="w-6 h-6 text-green-600" />
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">No hay déficits previstos ✅</div>
    </div>
  );
  
  return (
    <div className="space-y-3">
      {items.map((d, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition-all duration-200 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${d.status === 'urgent' ? 'bg-red-100 dark:bg-red-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
              <AlertTriangle className={`w-4 h-4 ${d.status === 'urgent' ? 'text-red-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{d.date} – {d.currency} {new Intl.NumberFormat('es-AR').format(parseFloat(d.amount))}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{d.label}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${badgeClass(d.status)}`}>{d.status}</span>
            <button className="btn-secondary text-sm" onClick={()=>onOpenSuggestion?.('inst1')}>
              Generar conversión
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
