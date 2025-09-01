import React, { useState } from 'react';
import { Search, Filter, ShoppingCart, CreditCard, Wallet, Edit, Trash2, Calendar } from 'lucide-react';
import type { PlannedExpense } from '../../types/expenses';

type Props = {
  expenses: PlannedExpense[];
  onEdit: (expense: PlannedExpense) => void;
  onDelete: (id: string) => void;
  onViewInstallments: (expense: PlannedExpense) => void;
};

const kindLabels = {
  debit: 'Débito',
  credit: 'Crédito',
};

const categoryLabels = {
  food: 'Comida',
  transport: 'Transporte',
  entertainment: 'Entretenimiento',
  health: 'Salud',
  shopping: 'Compras',
  bills: 'Servicios',
  other: 'Otros',
};

const categoryIcons = {
  food: '🍽️',
  transport: '🚗',
  entertainment: '🎬',
  health: '🏥',
  shopping: '🛍️',
  bills: '📄',
  other: '💰',
};

export const ExpensePlannedList: React.FC<Props> = ({ expenses, onEdit, onDelete, onViewInstallments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = (expense.concept || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = kindFilter === 'all' || expense.kind === kindFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesCurrency = currencyFilter === 'all' || expense.currency === currencyFilter;
    
    return matchesSearch && matchesKind && matchesCategory && matchesCurrency;
  });

  const allCurrencies = [...new Set(expenses.map(e => e.currency))].sort();
  const allCategories = [...new Set(expenses.map(e => e.category))].sort();

  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} ${new Intl.NumberFormat('es-AR').format(parseFloat(amount))}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por concepto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="select-field"
          >
            <option value="all">Todos los tipos</option>
            <option value="debit">Débito</option>
            <option value="credit">Crédito</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field"
          >
            <option value="all">Todas las categorías</option>
            {allCategories.map(category => (
              <option key={category} value={category}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </option>
            ))}
          </select>

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
          {filteredExpenses.length} de {expenses.length} gastos planificados
          {searchTerm && ` · Filtrado por "${searchTerm}"`}
        </span>
        <span>
          {expenses.filter(e => e.kind === 'credit').length} crédito · {expenses.filter(e => e.kind === 'debit').length} débito
        </span>
      </div>

      {/* Lista de gastos */}
      {filteredExpenses.length > 0 ? (
        <div className="space-y-3">
          {filteredExpenses.map(expense => (
            <div key={expense.id} className="card p-4 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">
                    {categoryIcons[expense.category]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {expense.concept || categoryLabels[expense.category as keyof typeof categoryLabels]}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        expense.kind === 'credit' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {kindLabels[expense.kind]}
                      </span>
                      {expense.n_installments && (
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                          {expense.n_installments} cuotas
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(expense.date)}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(expense.amount, expense.currency)}
                      </div>
                      {expense.amount_equiv_est_ars && expense.currency !== 'ARS' && (
                        <div className="text-gray-500 dark:text-gray-400">
                          ≈ ARS {new Intl.NumberFormat('es-AR').format(parseFloat(expense.amount_equiv_est_ars))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {expense.kind === 'credit' && expense.n_installments && (
                    <button
                      onClick={() => onViewInstallments(expense)}
                      className="btn-secondary text-sm flex items-center gap-1"
                    >
                      <CreditCard className="w-3 h-3" />
                      Ver cuotas
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'No se encontraron gastos' : 'No hay gastos planificados'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando tu primer gasto planificado'
            }
          </p>
        </div>
      )}
    </div>
  );
};