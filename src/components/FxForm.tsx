import React, { useMemo, useState } from 'react';
import { ArrowRight, Calculator, Zap } from 'lucide-react';

type Props = {
  defaultFromCurrency?: string;
  defaultToCurrency?: string;
  defaultToAmount?: string;
  onSave?: (payload: any)=>void;
}

export const FxForm: React.FC<Props> = ({ defaultFromCurrency='USDT', defaultToCurrency='BRL', defaultToAmount='300.00', onSave }) => {
  const [fromCurrency, setFromCurrency] = useState(defaultFromCurrency);
  const [toCurrency, setToCurrency] = useState(defaultToCurrency);
  const [toAmount, setToAmount] = useState(defaultToAmount);
  const [quotedRate, setQuotedRate] = useState('5.200000');
  const [fees, setFees] = useState('0.00');
  const [platform, setPlatform] = useState('Binance P2P');

  const effectiveRate = useMemo(()=> quotedRate, [quotedRate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Desde
          </div>
          <div className="space-y-2">
            <select className="select-field w-full" value={fromCurrency} onChange={e=>setFromCurrency(e.target.value)}>
              {['ARS','BRL','USD','USDT'].map(c=> <option key={c}>{c}</option>)}
            </select>
            <input className="input-field w-full" placeholder="Monto a convertir" />
          </div>
        </div>
        
        <div className="flex items-center justify-center md:hidden">
          <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Hacia
          </div>
          <div className="space-y-2">
            <select className="select-field w-full" value={toCurrency} onChange={e=>setToCurrency(e.target.value)}>
              {['ARS','BRL','USD','USDT'].map(c=> <option key={c}>{c}</option>)}
            </select>
            <input className="input-field w-full" value={toAmount} onChange={e=>setToAmount(e.target.value)} placeholder="Monto necesario" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800">
          <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Configuración
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Proveedor sugerido</label>
              <select className="select-field w-full">
              <option>Binance</option>
              <option>GoogleFinance</option>
              <option>Manual</option>
            </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Tasa cotizada</label>
              <input className="input-field w-full" value={quotedRate} onChange={e=>setQuotedRate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Comisiones</label>
              <input className="input-field w-full" value={fees} onChange={e=>setFees(e.target.value)} />
            </div>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Vista previa
          </div>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Tasa efectiva</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{effectiveRate}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">Spread</div>
              <div className="text-sm text-gray-500 dark:text-gray-500">Se calculará al guardar</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Plataforma</label>
              <input className="input-field w-full" value={platform} onChange={e=>setPlatform(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          className="btn-primary flex-1" 
          onClick={()=>onSave?.({fromCurrency,toCurrency,toAmount,quotedRate,fees,platform})}
        >
          Guardar conversión
        </button>
        <button className="btn-secondary">
          Usar en cuota
        </button>
      </div>
    </div>
  );
}
