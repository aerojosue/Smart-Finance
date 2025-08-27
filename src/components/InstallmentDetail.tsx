import React from 'react';
import type { Installment } from '../types';

type Props = { data: Installment; onGenerateFx?: ()=>void; onMarkPaid?: ()=>void };

const badgeClass = (s: string) =>
  s === 'warning' ? 'bg-amber-100 text-amber-800'
  : s === 'urgent' ? 'bg-red-100 text-red-800'
  : s === 'due' ? 'bg-rose-100 text-rose-800'
  : s === 'paid' ? 'bg-emerald-100 text-emerald-800'
  : 'bg-slate-100 text-slate-800';

export const InstallmentDetail: React.FC<Props> = ({ data, onGenerateFx, onMarkPaid }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cuota {data.n} — {data.currency} {data.amount_base}</h2>
          <div className="text-sm text-gray-600">Vence: {data.due_date} · Estado: <span className={`text-xs px-2 py-1 rounded ${badgeClass(data.status)}`}>{data.status}</span></div>
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="font-medium mb-1">Sugerencias de cobertura</div>
        {data.deficit ? (
          <div className="text-sm mb-2">Déficit: {data.deficit.currency} {data.deficit.amount}</div>
        ) : <div className="text-sm text-gray-500">Sin déficit previsto</div>}
        <div className="space-y-2">
          {data.suggestions?.map((s, idx)=> (
            <div key={idx} className="flex items-center justify-between text-sm border rounded p-2">
              <div>
                <div>{s.from_currency} → {data.currency} · {s.est_rate} {s.est_spread_pct ? `· spread ${s.est_spread_pct}%` : ''}</div>
                {s.platform_suggested && <div className="text-gray-500">Plataforma: {s.platform_suggested}</div>}
              </div>
              <button className="px-3 py-1 border rounded" onClick={onGenerateFx}>Generar conversión</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" onClick={onGenerateFx}>Generar conversión</button>
        <button className="px-3 py-2 border rounded" onClick={onMarkPaid}>Marcar pagada</button>
      </div>
    </div>
  );
}
