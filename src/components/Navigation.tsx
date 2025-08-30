import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  Wallet, 
  ArrowLeftRight 
} from 'lucide-react';

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type Props = {
  activeSection: string;
  onSectionChange: (section: string) => void;
};

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'expenses', label: 'Gastos', icon: <ShoppingCart className="w-5 h-5" /> },
  { id: 'income', label: 'Ingresos', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'savings', label: 'Ahorros', icon: <PiggyBank className="w-5 h-5" /> },
  { id: 'cards', label: 'Tarjetas', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'accounts', label: 'Cuentas', icon: <Wallet className="w-5 h-5" /> },
  { id: 'conversions', label: 'Conversiones', icon: <ArrowLeftRight className="w-5 h-5" /> },
];

export const Navigation: React.FC<Props> = ({ activeSection, onSectionChange }) => {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 transition-colors duration-200">
      <div className="flex items-center gap-1 overflow-x-auto">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
              activeSection === item.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};