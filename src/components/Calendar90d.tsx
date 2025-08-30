import React from 'react';
import { Calendar, DollarSign, CreditCard } from 'lucide-react';

type Day = { date: string; installments?: any[]; incomes?: any[] };
type Props = { days: Day[]; onSelectDay?: (date: string)=>void };

export const Calendar90d: React.FC<Props> = ({ days, onSelectDay }) => {
  const monthNames = ['Septiembre', 'Octubre', 'Noviembre'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[0,1,2].map(m => (
        <div key={m} className="border border-gray-200 rounded-lg p-4">
          <div className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {monthNames[m]} 2025
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
              <div key={day} className="h-6 flex items-center justify-center font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({length: 30}).map((_,i)=>{
              const d = days[i + m*30];
              const hasEvents = d?.installments?.length || d?.incomes?.length;
              return (
                <button key={i} onClick={()=>d && onSelectDay?.(d.date)}
                  className={`h-16 border rounded-lg flex flex-col items-start p-1 transition-colors ${
                    hasEvents 
                      ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                  <span className="text-gray-700 font-medium">{i+1}</span>
                  <div className="mt-auto space-y-1 w-full">
                    {d?.installments?.length ? (
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-2 h-2" />
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">{d.installments.length}</span>
                      </div>
                    ) : null}
                    {d?.incomes?.length ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-2 h-2" />
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded">{d.incomes.length}</span>
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
