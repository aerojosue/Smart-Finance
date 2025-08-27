import React, { useEffect, useState } from "react";
import { getDashboard, getCalendar, getInstallment } from "../lib/mockApi";
import { DeficitsList } from "../components/DeficitsList";
import { Calendar90d } from "../components/Calendar90d";
import { InstallmentDetail } from "../components/InstallmentDetail";
import { FxForm } from "../components/FxForm";

export default function Demo(){
  const [dash,setDash]=useState<any>(); const [cal,setCal]=useState<any>();
  const [inst,setInst]=useState<any>(); const [showFx,setShowFx]=useState(false);

  useEffect(()=>{ (async ()=>{
    setDash(await getDashboard());
    setCal(await getCalendar());
  })(); },[]);

  const openInst = async () => {
    const d = await getInstallment('inst1'); // mapea a installment_inst1.json
    setInst(d); setShowFx(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Demo Finanzas (MVP)</h1>

      {/* KPIs */}
      {dash&&(
        <div className="grid grid-cols-4 gap-4">
          <Card t="Ingresos (mes)" v={dash.kpis.income_month}/>
          <Card t="Gastos (mes)" v={dash.kpis.expense_month}/>
          <Card t="Saldo ARS" v={dash.kpis.balances_by_currency.find((x:any)=>x.currency==='ARS')?.amount}/>
          <Card t="Crédito BRL Itaú" v={dash.kpis.credit_available[0].available}/>
        </div>
      )}

      {/* Déficits */}
      {dash&&(
        <section>
          <h2 className="text-xl font-semibold mb-2">Déficits previstos</h2>
          <DeficitsList items={dash.deficits} onOpenSuggestion={openInst}/>
        </section>
      )}

      {/* Calendario */}
      {cal&&(
        <section>
          <h2 className="text-xl font-semibold mb-2">Calendario 90 días</h2>
          <Calendar90d days={cal.days} onSelectDay={(date)=>console.log('day',date)} />
        </section>
      )}

      {/* Detalle cuota + FX */}
      {inst&&(
        <section className="grid grid-cols-2 gap-6">
          <InstallmentDetail data={inst} onGenerateFx={()=>setShowFx(true)} onMarkPaid={()=>alert('Abrir modal de pago (stub)')} />
          {showFx && <FxForm defaultFromCurrency="USDT" defaultToCurrency="BRL" defaultToAmount={inst?.deficit?.amount || '0.00'} onSave={()=>alert('FX guardada (mock)')} />}
        </section>
      )}
    </div>
  );
}

function Card({t,v}:{t:string;v:any}){
  return (
    <div className="border rounded-xl p-3">
      <div className="text-xs text-gray-500">{t}</div>
      <div className="text-lg font-semibold">{v}</div>
    </div>
  );
}
