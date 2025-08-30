import React from 'react';
import { CreditCard, AlertCircle, Calendar, DollarSign } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Cuota {data.n}
          </h2>
          <div className="mt-2 space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {data.currency} {new Intl.NumberFormat('es-AR').format(parseFloat(data.amount_base))}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Vence: {data.due_date}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClass(data.status)}`}>
                {data.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {data.deficit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-medium text-red-900">Déficit detectado</span>
          </div>
          <div className="text-red-800">
            Faltan {data.deficit.currency} {new Intl.NumberFormat('es-AR').format(parseFloat(data.deficit.amount))}
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4">
        <div className="font-medium mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Sugerencias de cobertura
        </div>
        {data.deficit ? (
          <>
        <div className="space-y-2">
          {data.suggestions?.map((s, idx)=> (
            <div key={idx} className="flex items-center justify-between text-sm border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-medium">{s.from_currency} → {data.currency}</div>
                <div className="text-gray-600">{s.est_rate} {s.est_spread_pct ? `· spread ${s.est_spread_pct}%` : ''}</div>
                {s.platform_suggested && <div className="text-gray-500">Plataforma: {s.platform_suggested}</div>}
              </div>
              <button className="btn-primary text-sm" onClick={onGenerateFx}>
                Generar
              </button>
            </div>
          ))}
        </div>
          </>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">Sin déficit previsto</div>
        )}
      </div>

      <div className="flex gap-2">
        <button className="btn-primary" onClick={onGenerateFx}>
          Generar conversión
        </button>
        <button className="btn-secondary" onClick={onMarkPaid}>
          Marcar como pagada
        </button>
      </div>
    </div>
  );
}
