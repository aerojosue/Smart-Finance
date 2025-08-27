import React from 'react';
import type { DeficitItem } from '../types';

type Props = { items: DeficitItem[]; onOpenSuggestion?: (id?: string) => void };

const badgeClass = (s: string) =>
  s === 'warning'
    ? 'bg-amber-100 text-amber-800'
    : s === 'urgent'
      ? 'bg-red-100 text-red-800'
      : 'bg-rose-100 text-rose-800';

export const DeficitsList: React.FC<Props> = ({ items, onOpenSuggestion }) => {
  if (!items?.length) return <div className="text-sm text-gray-500">No hay déficits previstos ✅</div>;
  return (
    <div className="space-y-3">
      {items.map((d, i) => (
        <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{d.date} – {d.currency} – Falta {d.amount}</div>
            <div className="text-sm text-gray-600">{d.label}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${badgeClass(d.status)}`}>{d.status}</span>
            <button className="text-sm px-3 py-1 border rounded" onClick={()=>onOpenSuggestion?.('inst1')}>
              Generar conversión
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
