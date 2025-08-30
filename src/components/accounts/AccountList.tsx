import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { AccountCard } from './AccountCard';
import type { Account } from '../../types/accounts';

type Props = {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
};

export const AccountList: React.FC<Props> = ({ accounts, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    const matchesCurrency = currencyFilter === 'all' || account.supported_currencies.includes(currencyFilter);
    
    return matchesSearch && matchesType && matchesCurrency;
  });

  const allCurrencies = [...new Set(accounts.flatMap(acc => acc.supported_currencies))].sort();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cuentas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="select-field pl-10 pr-8"
            >
              <option value="all">Todos los tipos</option>
              <option value="cash">Efectivo</option>
              <option value="bank">Banco</option>
              <option value="ewallet">E-wallet</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="select-field"
          >
            <option value="all">Todas las monedas</option>
            {allCurrencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          {filteredAccounts.length} de {accounts.length} cuentas
          {searchTerm && ` · Filtrado por "${searchTerm}"`}
        </span>
        <span>
          {allCurrencies.length} monedas disponibles
        </span>
      </div>

      {/* Grid de cuentas */}
      {filteredAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'No se encontraron cuentas' : 'No hay cuentas registradas'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando tu primera cuenta'
            }
          </p>
        </div>
      )}
    </div>
  );
};