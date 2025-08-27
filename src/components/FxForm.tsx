import React, { useMemo, useState } from 'react';

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
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded p-3">
          <div className="font-medium mb-2">From</div>
          <div className="flex gap-2">
            <select className="border rounded px-2 py-1" value={fromCurrency} onChange={e=>setFromCurrency(e.target.value)}>
              {['ARS','BRL','USD','USDT'].map(c=> <option key={c}>{c}</option>)}
            </select>
            <input className="border rounded px-2 py-1 w-full" placeholder="Monto" />
          </div>
        </div>
        <div className="border rounded p-3">
          <div className="font-medium mb-2">To</div>
          <div className="flex gap-2">
            <select className="border rounded px-2 py-1" value={toCurrency} onChange={e=>setToCurrency(e.target.value)}>
              {['ARS','BRL','USD','USDT'].map(c=> <option key={c}>{c}</option>)}
            </select>
            <input className="border rounded px-2 py-1 w-full" value={toAmount} onChange={e=>setToAmount(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm">Proveedor sugerido</label>
            <select className="border rounded px-2 py-1">
              <option>Binance</option>
              <option>GoogleFinance</option>
              <option>Manual</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Quoted rate</label>
            <input className="border rounded px-2 py-1" value={quotedRate} onChange={e=>setQuotedRate(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Fees</label>
            <input className="border rounded px-2 py-1" value={fees} onChange={e=>setFees(e.target.value)} />
          </div>
        </div>
        <div className="border rounded p-3">
          <div className="font-medium mb-2">Vista previa</div>
          <div className="text-sm">Effective rate: {effectiveRate}</div>
          <div className="text-sm">Spread: calcular al guardar</div>
          <div className="flex items-center justify-between mt-2">
            <label className="text-sm">Plataforma</label>
            <input className="border rounded px-2 py-1" value={platform} onChange={e=>setPlatform(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-2 border rounded" onClick={()=>onSave?.({fromCurrency,toCurrency,toAmount,quotedRate,fees,platform})}>Guardar</button>
        <button className="px-3 py-2 border rounded">Usar en cuota</button>
      </div>
    </div>
  );
}
