import React from 'react';
import { 
  Wallet, 
  Building2, 
  Smartphone, 
  Bitcoin, 
  Edit, 
  Trash2, 
  Shield,
  AlertTriangle
} from 'lucide-react';
import type { Account } from '../../types/accounts';

type Props = {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
};

const typeIcons = {
  cash: <Wallet className="w-4 h-4" />,
  bank: <Building2 className="w-4 h-4" />,
  ewallet: <Smartphone className="w-4 h-4" />,
  crypto: <Bitcoin className="w-4 h-4" />,
};

const typeLabels = {
  cash: 'Efectivo',
  bank: 'Banco',
  ewallet: 'E-wallet',
  crypto: 'Crypto',
};

const tierColors = {
  operational: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  buffer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  savings: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  untouchable: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const tierLabels = {
  operational: 'Operacional',
  buffer: 'Buffer',
  savings: 'Ahorros',
  untouchable: 'Intocable',
};

export const AccountCard: React.FC<Props> = ({ account, onEdit, onDelete }) => {
  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} ${new Intl.NumberFormat('es-AR').format(parseFloat(amount))}`;
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: account.color }}
          >
            {typeIcons[account.type]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{account.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                {typeLabels[account.type]}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{account.country}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(account)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monedas soportadas */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Monedas soportadas</div>
        <div className="flex flex-wrap gap-1">
          {account.supported_currencies.map(currency => (
            <span 
              key={currency}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
            >
              {currency}
            </span>
          ))}
        </div>
      </div>

      {/* Saldos */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Saldos iniciales</div>
        <div className="space-y-1">
          {Object.entries(account.initial_balances).map(([currency, amount]) => (
            <div key={currency} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{currency}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuración */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Nivel de liquidez</span>
          <span className={`text-xs px-2 py-1 rounded-full ${tierColors[account.liquidity_tier]}`}>
            {tierLabels[account.liquidity_tier]}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Auto-sugerencia</span>
          <div className="flex items-center gap-1">
            {!account.allow_auto_suggest && (
              <Shield className="w-3 h-3 text-gray-400" />
            )}
            <span className={`text-xs px-2 py-1 rounded-full ${
              account.allow_auto_suggest 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {account.allow_auto_suggest ? 'Habilitada' : 'Deshabilitada'}
            </span>
          </div>
        </div>

        {account.liquidity_tier === 'untouchable' && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            <AlertTriangle className="w-3 h-3" />
            No se sugiere para cobertura
          </div>
        )}
      </div>

      {account.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notas</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">{account.notes}</div>
        </div>
      )}
    </div>
  );
};