import React, { useEffect, useState } from "react";
import { TrendingUp, CreditCard, Wallet, Bell, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getDashboard, getCashflow, getInstallment } from "../lib/mockApi";
import { DeficitsList } from "../components/DeficitsList";
import { CashflowChart } from "../components/CashflowChart";
import { InstallmentDetail } from "../components/InstallmentDetail";
import { FxForm } from "../components/FxForm";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { Navigation } from "../components/Navigation";
import { AccountsModule } from "../components/accounts/AccountsModule";
import { CardsModule } from "../components/cards/CardsModule";
import { SavingsModule } from "../components/savings/SavingsModule";

export default function Dashboard() {
  const [dash, setDash] = useState<any>(null);
  const [cashflow, setCashflow] = useState<any>(null);
  const [inst, setInst] = useState<any>(null);
  const [showFx, setShowFx] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    getDashboard().then(setDash);
    getCashflow().then(setCashflow);
  }, []);

  const openInst = (id: string) => {
    getInstallment(id).then(setInst);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'movements':
        return <div className="p-6"><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Módulo de Movimientos</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Registro unificado de ingresos, gastos, transferencias, pagos y ahorros. Próximamente...</p></div>;
      case 'expenses':
        return <div className="p-6"><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Módulo de Gastos</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Próximamente...</p></div>;
      case 'income':
        return <div className="p-6"><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Módulo de Ingresos</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Próximamente...</p></div>;
      case 'savings':
        return <SavingsModule />;
      case 'cards':
        return <CardsModule />;
      case 'accounts':
        return <AccountsModule />;
      case 'conversions':
        return <div className="p-6"><h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Módulo de Conversiones</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Próximamente...</p></div>;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-8">
      {/* KPIs */}
      {dash && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Resumen financiero
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              title="Ingresos (mes)" 
              value={dash.kpis.income_month}
              currency="ARS"
              trend="up"
              icon={<ArrowUpRight className="w-4 h-4" />}
            />
            <KPICard 
              title="Gastos (mes)" 
              value={dash.kpis.expense_month}
              currency="ARS"
              trend="down"
              icon={<ArrowDownRight className="w-4 h-4" />}
            />
            <KPICard 
              title="Saldo ARS" 
              value={dash.kpis.balances_by_currency.find((x:any)=>x.currency==='ARS')?.amount}
              currency="ARS"
              icon={<Wallet className="w-4 h-4" />}
            />
            <KPICard 
              title="Crédito BRL Itaú" 
              value={dash.kpis.credit_available[0].available}
              currency="BRL"
              icon={<CreditCard className="w-4 h-4" />}
            />
          </div>
        </section>
      )}

      {/* Déficits */}
      {dash && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Déficits previstos
          </h2>
          <div className="card p-6">
            <DeficitsList items={dash.deficits} onOpenSuggestion={openInst}/>
          </div>
        </section>
      )}

      {/* Gráfico de flujo de caja */}
      {cashflow && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Flujo de caja mensual
          </h2>
          <div className="card p-6">
            <CashflowChart data={cashflow.daily_flow} currency={cashflow.currency} />
          </div>
        </section>
      )}

      {/* Detalle cuota + FX */}
      {inst && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <InstallmentDetail 
              data={inst} 
              onGenerateFx={()=>setShowFx(true)} 
              onMarkPaid={()=>alert('Abrir modal de pago (stub)')} 
            />
          </div>
          {showFx && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Generar conversión</h3>
              <FxForm 
                defaultFromCurrency="USDT" 
                defaultToCurrency="BRL" 
                defaultToAmount={inst?.deficit?.amount || '0.00'} 
                onSave={()=>alert('FX guardada (mock)')} 
              />
            </div>
          )}
        </section>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Smart Finance</h1>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}

function KPICard({title, value, currency, trend, icon}: {
  title: string; 
  value: any; 
  currency?: string; 
  trend?: 'up'|'down'; 
  icon?: React.ReactNode;
}) {
  const formatValue = (val: string) => {
    if (!val) return '0';
    return new Intl.NumberFormat('es-AR').format(parseFloat(val));
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
        <div className={`p-1 rounded ${trend === 'up' ? 'text-green-600 bg-green-50' : trend === 'down' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'}`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {currency && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-1">{currency}</span>}
        {formatValue(value)}
      </div>
    </div>
  );
}