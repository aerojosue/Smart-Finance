import React from 'react';

type Day = { date: string; installments?: any[]; incomes?: any[] };
type Props = { days: Day[]; onSelectDay?: (date: string)=>void };

export const Calendar90d: React.FC<Props> = ({ days, onSelectDay }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[0,1,2].map(m => (
        <div key={m} className="border rounded-lg p-3">
          <div className="font-semibold mb-2">Mes {m+1}</div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({length: 30}).map((_,i)=>{
              const d = days[i + m*30];
              return (
                <button key={i} onClick={()=>d && onSelectDay?.(d.date)}
                  className="h-16 border rounded flex flex-col items-start p-1">
                  <span className="opacity-60">{i+1}</span>
                  {d?.installments?.length ? <span className="mt-auto text-[10px] bg-amber-100 text-amber-800 px-1 rounded">{d.installments.length} cuota(s)</span> : null}
                  {d?.incomes?.length ? <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">{d.incomes.length} ingreso(s)</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
