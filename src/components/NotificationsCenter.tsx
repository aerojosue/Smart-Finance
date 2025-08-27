import React from 'react';

type Item = { id: string; type: 'installment_warning'|'urgent'|'due'|'income_estimate'; title: string; body: string; date: string };
type Props = { items: Item[]; onAction?: (id: string, action: string)=>void };

export const NotificationsCenter: React.FC<Props> = ({ items, onAction }) => {
  if (!items?.length) return <div className="text-sm text-gray-500">Sin notificaciones</div>;
  return (
    <div className="space-y-3">
      {items.map(i=> (
        <div key={i.id} className="border rounded p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{i.title}</div>
            <div className="text-xs text-gray-500">{i.date}</div>
          </div>
          <div className="text-sm text-gray-700">{i.body}</div>
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-1 border rounded" onClick={()=>onAction?.(i.id,'convert')}>Generar conversión</button>
            <button className="px-3 py-1 border rounded" onClick={()=>onAction?.(i.id,'paid')}>Marcar pagada</button>
            <button className="px-3 py-1 border rounded" onClick={()=>onAction?.(i.id,'snooze')}>Posponer 1 día</button>
          </div>
        </div>
      ))}
    </div>
  );
}
