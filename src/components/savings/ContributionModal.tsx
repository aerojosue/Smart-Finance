import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Wallet } from 'lucide-react';
import { getAccounts } from '../../lib/accountsApi';
import type { SavingGoal } from '../../types/savings';
import type { Account } from '../../types/accounts';

type Props = {
  open: boolean;
  goal: SavingGoal | null;
  onSubmit: (data: {
    fromAccountId: string;
    amount: string;
    currency: string;
    description: string;
  }) => void;
  onClose: () => void;
};

export const ContributionModal: React.FC<Props> = ({ open, goal, onSubmit, onClose }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadAccounts();
      if (goal) {
        setCurrency(goal.base_currency);
        setDescription(`Aporte a ${goal.name}`);
      }
    }
  }, [open, goal]);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedAccount) {
      newErrors.account = 'Selecciona una cuenta origen';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!currency) {
      newErrors.currency = 'Selecciona una moneda';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        fromAccountId: selectedAccount,
        amount,
        currency,
        description
      });
    }
  };

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);
  const availableCurrencies = selectedAccountData?.supported_currencies || [];

  if (!open || !goal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Aportar a meta
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Meta info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: goal.color }}
              >
                🎯
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{goal.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {goal.base_currency} {new Intl.NumberFormat('es-AR').format(parseFloat(goal.current_amount))} / {new Intl.NumberFormat('es-AR').format(parseFloat(goal.target_amount))}
                </div>
              </div>
            </div>
          </div>

          {/* Cuenta origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuenta origen *
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                const account = accounts.find(acc => acc.id === e.target.value);
                if (account && account.supported_currencies.length > 0) {
                  setCurrency(account.supported_currencies[0]);
                }
              }}
              className={`select-field w-full ${errors.account ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar cuenta...</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.supported_currencies.join(', ')})
                </option>
              ))}
            </select>
            {errors.account && <p className="text-red-500 text-xs mt-1">{errors.account}</p>}
          </div>

          {/* Monto y moneda */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`input-field w-full ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Moneda *
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`select-field w-full ${errors.currency ? 'border-red-500' : ''}`}
                disabled={!selectedAccount}
              >
                <option value="">Seleccionar...</option>
                {availableCurrencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
              {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency}</p>}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field w-full"
              placeholder="Descripción del aporte..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Realizar aporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};