@@ .. @@
 import React, { useEffect, useState } from "react";
+import { TrendingUp, CreditCard, Wallet, Calendar, Bell, ArrowUpRight, ArrowDownRight } from "lucide-react";
 import { getDashboard, getCalendar, getInstallment } from "../lib/mockApi";
@@ .. @@
   return (
-    <div className="p-6 space-y-6">
-      <h1 className="text-2xl font-bold">Demo Finanzas (MVP)</h1>
+    <div className="min-h-screen bg-gray-50">
+      {/* Header */}
+      <header className="bg-white border-b border-gray-200 px-6 py-4">
+        <div className="flex items-center justify-between">
+          <div className="flex items-center gap-3">
+            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
+              <TrendingUp className="w-5 h-5 text-white" />
+            </div>
+            <h1 className="text-xl font-bold text-gray-900">Smart Finance</h1>
+          </div>
+          <div className="flex items-center gap-4">
+            <button className="relative p-2 text-gray-500 hover:text-gray-700">
+              <Bell className="w-5 h-5" />
+              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
+            </button>
+            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
+          </div>
+        </div>
+      </header>
+
+      <div className="p-6 space-y-8">
+        {/* KPIs */}
+        {dash && (
+          <section>
+            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
+              <Wallet className="w-5 h-5" />
+              Resumen financiero
+            </h2>
+            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
+              <KPICard 
+                title="Ingresos (mes)" 
+                value={dash.kpis.income_month}
+                currency="ARS"
+                trend="up"
+                icon={<ArrowUpRight className="w-4 h-4" />}
+              />
+              <KPICard 
+                title="Gastos (mes)" 
+                value={dash.kpis.expense_month}
+                currency="ARS"
+                trend="down"
+                icon={<ArrowDownRight className="w-4 h-4" />}
+              />
+              <KPICard 
+                title="Saldo ARS" 
+                value={dash.kpis.balances_by_currency.find((x:any)=>x.currency==='ARS')?.amount}
+                currency="ARS"
+                icon={<Wallet className="w-4 h-4" />}
+              />
+              <KPICard 
+                title="Crédito BRL Itaú" 
+                value={dash.kpis.credit_available[0].available}
+                currency="BRL"
+                icon={<CreditCard className="w-4 h-4" />}
+              />
+            </div>
+          </section>
+        )}
 
-      {/* KPIs */}
-      {dash&&(
-        <div className="grid grid-cols-4 gap-4">
-          <Card t="Ingresos (mes)" v={dash.kpis.income_month}/>
-          <Card t="Gastos (mes)" v={dash.kpis.expense_month}/>
-          <Card t="Saldo ARS" v={dash.kpis.balances_by_currency.find((x:any)=>x.currency==='ARS')?.amount}/>
-          <Card t="Crédito BRL Itaú" v={dash.kpis.credit_available[0].available}/>
-        </div>
-      )}
-
-      {/* Déficits */}
-      {dash&&(
-        <section>
-          <h2 className="text-xl font-semibold mb-2">Déficits previstos</h2>
-          <DeficitsList items={dash.deficits} onOpenSuggestion={openInst}/>
-        </section>
-      )}
-
-      {/* Calendario */}
-      {cal&&(
-        <section>
-          <h2 className="text-xl font-semibold mb-2">Calendario 90 días</h2>
-          <Calendar90d days={cal.days} onSelectDay={(date)=>console.log('day',date)} />
-        </section>
-      )}
-
-      {/* Detalle cuota + FX */}
-      {inst&&(
-        <section className="grid grid-cols-2 gap-6">
-          <InstallmentDetail data={inst} onGenerateFx={()=>setShowFx(true)} onMarkPaid={()=>alert('Abrir modal de pago (stub)')} />
-          {showFx && <FxForm defaultFromCurrency="USDT" defaultToCurrency="BRL" defaultToAmount={inst?.deficit?.amount || '0.00'} onSave={()=>alert('FX guardada (mock)')} />}
-        </section>
-      )}
+        {/* Déficits */}
+        {dash && (
+          <section>
+            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
+              <Calendar className="w-5 h-5" />
+              Déficits previstos
+            </h2>
+            <div className="card p-6">
+              <DeficitsList items={dash.deficits} onOpenSuggestion={openInst}/>
+            </div>
+          </section>
+        )}
+
+        {/* Calendario */}
+        {cal && (
+          <section>
+            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
+              <Calendar className="w-5 h-5" />
+              Calendario 90 días
+            </h2>
+            <div className="card p-6">
+              <Calendar90d days={cal.days} onSelectDay={(date)=>console.log('day',date)} />
+            </div>
+          </section>
+        )}
+
+        {/* Detalle cuota + FX */}
+        {inst && (
+          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
+            <div className="card p-6">
+              <InstallmentDetail 
+                data={inst} 
+                onGenerateFx={()=>setShowFx(true)} 
+                onMarkPaid={()=>alert('Abrir modal de pago (stub)')} 
+              />
+            </div>
+            {showFx && (
+              <div className="card p-6">
+                <h3 className="text-lg font-semibold mb-4">Generar conversión</h3>
+                <FxForm 
+                  defaultFromCurrency="USDT" 
+                  defaultToCurrency="BRL" 
+                  defaultToAmount={inst?.deficit?.amount || '0.00'} 
+                  onSave={()=>alert('FX guardada (mock)')} 
+                />
+              </div>
+            )}
+          </section>
+        )}
+      </div>
     </div>
   );
 }
 
-function Card({t,v}:{t:string;v:any}){
+function KPICard({title, value, currency, trend, icon}: {
+  title: string; 
+  value: any; 
+  currency?: string; 
+  trend?: 'up'|'down'; 
+  icon?: React.ReactNode;
+}) {
+  const formatValue = (val: string) => {
+    if (!val) return '0';
+    return new Intl.NumberFormat('es-AR').format(parseFloat(val));
+  };
+
   return (
-    <div className="border rounded-xl p-3">
-      <div className="text-xs text-gray-500">{t}</div>
-      <div className="text-lg font-semibold">{v}</div>
+    <div className="card p-4 hover:shadow-md transition-shadow">
+      <div className="flex items-center justify-between mb-2">
+        <div className="text-sm text-gray-600">{title}</div>
+        <div className={`p-1 rounded ${trend === 'up' ? 'text-green-600 bg-green-50' : trend === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'}`}>
+          {icon}
+        </div>
+      </div>
+      <div className="text-xl font-bold text-gray-900">
+        {currency && <span className="text-sm font-normal text-gray-500 mr-1">{currency}</span>}
+        {formatValue(value)}
+      </div>
     </div>
   );
 }